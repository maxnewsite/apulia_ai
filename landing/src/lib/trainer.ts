// Area trainer — tipi, accesso dati server-side e regole di avanzamento.
// Tutte le letture "sensibili" (domande, opzioni corrette, tentativi) passano
// da qui con service-role: il client non riceve mai is_correct.

import { supabaseAdmin } from '@/lib/supabase-admin'

/** Moduli che devono essere pubblicati e superati prima di aprire l'esame. */
export const REQUIRED_MODULES = 10

export type TrainerStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type QuestionKind = 'single' | 'multi' | 'boolean' | 'open'
export type ResourceKind = 'pdf' | 'slides' | 'video' | 'link'
export type ExamStatus = 'draft' | 'submitted' | 'under_review' | 'qualified' | 'rejected'

export interface TrainerProfile {
  id: string
  email: string
  full_name: string
  phone: string | null
  city: string | null
  linkedin_url: string | null
  bio: string | null
  motivation: string | null
  cv_path: string | null
  status: TrainerStatus
  review_notes: string | null
  email_confirmed_at: string | null
  created_at: string
}

export interface TrainerModule {
  id: string
  position: number
  slug: string
  title: string
  summary: string | null
}

export interface ModuleResource {
  id: string
  position: number
  kind: ResourceKind
  title: string
  description: string | null
  storage_path: string | null
  external_url: string | null
  duration_minutes: number | null
}

export interface QuizMeta {
  id: string
  kind: 'module' | 'exam'
  title: string
  intro: string | null
  pass_score: number
  max_attempts: number
  time_limit_minutes: number | null
  is_published: boolean
}

export interface ModuleProgress {
  attempts_used: number
  attempts_allowed: number
  passed: boolean
  best_score: number | null
}

export interface CurriculumEntry {
  module: TrainerModule
  quiz: QuizMeta | null
  progress: ModuleProgress
  /** Sbloccato solo se tutti i moduli precedenti sono stati superati. */
  unlocked: boolean
  /** Tentativi esauriti senza superamento: serve uno sblocco dall'admin. */
  blocked: boolean
}

export interface Curriculum {
  entries: CurriculumEntry[]
  completedModules: number
  totalModules: number
  examUnlocked: boolean
  examReason: string | null
}

// ────────────────────────────────────────────────────────────
// Profilo
// ────────────────────────────────────────────────────────────

export async function getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('trainer_profiles')
    .select(
      'id,email,full_name,phone,city,linkedin_url,bio,motivation,cv_path,status,review_notes,email_confirmed_at,created_at',
    )
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('getTrainerProfile:', error.message)
    return null
  }
  return (data as TrainerProfile) ?? null
}

// ────────────────────────────────────────────────────────────
// Curriculum e avanzamento
// ────────────────────────────────────────────────────────────

interface AttemptRow {
  quiz_id: string
  status: string
  score: number | null
  passed: boolean | null
}

/**
 * Stato completo del percorso per un trainer: moduli pubblicati, quiz,
 * tentativi consumati, sblocco sequenziale e accesso all'esame.
 */
export async function getCurriculum(trainerId: string): Promise<Curriculum> {
  const [modulesRes, quizzesRes, attemptsRes, grantsRes] = await Promise.all([
    supabaseAdmin
      .from('trainer_modules')
      .select('id,position,slug,title,summary')
      .eq('is_published', true)
      .order('position'),
    supabaseAdmin
      .from('trainer_quizzes')
      .select('id,kind,module_id,title,intro,pass_score,max_attempts,time_limit_minutes,is_published'),
    supabaseAdmin
      .from('trainer_quiz_attempts')
      .select('quiz_id,status,score,passed')
      .eq('trainer_id', trainerId),
    supabaseAdmin
      .from('trainer_attempt_grants')
      .select('quiz_id,extra_attempts')
      .eq('trainer_id', trainerId),
  ])

  const modules = (modulesRes.data ?? []) as TrainerModule[]
  const quizzes = (quizzesRes.data ?? []) as (QuizMeta & { module_id: string | null })[]
  const attempts = (attemptsRes.data ?? []) as AttemptRow[]
  const grants = (grantsRes.data ?? []) as { quiz_id: string; extra_attempts: number }[]

  const quizByModule = new Map(quizzes.filter(q => q.module_id).map(q => [q.module_id!, q]))
  const extraByQuiz = new Map(grants.map(g => [g.quiz_id, g.extra_attempts]))

  const entries: CurriculumEntry[] = []
  let previousPassed = true

  for (const module of modules) {
    const quiz = quizByModule.get(module.id) ?? null
    const progress = summarise(quiz, attempts, extraByQuiz)

    entries.push({
      module,
      quiz,
      progress,
      unlocked: previousPassed,
      blocked: !progress.passed && progress.attempts_used >= progress.attempts_allowed,
    })

    previousPassed = previousPassed && progress.passed
  }

  const completedModules = entries.filter(e => e.progress.passed).length
  const allPassed = entries.length > 0 && completedModules === entries.length

  let examReason: string | null = null
  if (modules.length < REQUIRED_MODULES) {
    examReason = `L'esame si apre quando tutti i ${REQUIRED_MODULES} moduli sono disponibili (ora ne risultano ${modules.length}).`
  } else if (!allPassed) {
    examReason = `Devi superare tutti i ${REQUIRED_MODULES} moduli: ne hai completati ${completedModules}.`
  }

  return {
    entries,
    completedModules,
    totalModules: modules.length,
    examUnlocked: examReason === null,
    examReason,
  }
}

function summarise(
  quiz: QuizMeta | null,
  attempts: AttemptRow[],
  extraByQuiz: Map<string, number>,
): ModuleProgress {
  if (!quiz) {
    return { attempts_used: 0, attempts_allowed: 0, passed: false, best_score: null }
  }
  const mine = attempts.filter(a => a.quiz_id === quiz.id)
  const submitted = mine.filter(a => a.status === 'submitted')
  const scores = submitted.map(a => a.score ?? 0)

  return {
    attempts_used: submitted.length,
    attempts_allowed: quiz.max_attempts + (extraByQuiz.get(quiz.id) ?? 0),
    passed: submitted.some(a => a.passed === true),
    best_score: scores.length ? Math.max(...scores) : null,
  }
}

// ────────────────────────────────────────────────────────────
// Correzione automatica
// ────────────────────────────────────────────────────────────

export interface GradableQuestion {
  id: string
  kind: QuestionKind
  points: number
  correctOptionIds: string[]
}

export interface SubmittedAnswer {
  questionId: string
  selectedOptionIds?: string[]
  answerText?: string
}

export interface GradedAnswer {
  question_id: string
  selected_option_ids: string[]
  answer_text: string | null
  is_correct: boolean | null
  points_awarded: number
}

export interface GradingResult {
  answers: GradedAnswer[]
  /** Percentuale sulla sola parte a risposta chiusa. */
  score: number
  /** true se il quiz contiene domande aperte da correggere a mano. */
  needsManualReview: boolean
}

/**
 * Corregge la parte a risposta chiusa. Le domande a scelta multipla sono
 * valutate tutto-o-niente: una risposta parzialmente giusta vale zero.
 * Le domande aperte non entrano nel punteggio automatico (né a numeratore
 * né a denominatore) e restano in attesa di valutazione umana.
 */
export function gradeAttempt(
  questions: GradableQuestion[],
  submitted: SubmittedAnswer[],
): GradingResult {
  const byQuestion = new Map(submitted.map(a => [a.questionId, a]))
  const answers: GradedAnswer[] = []

  let awarded = 0
  let closedTotal = 0
  let needsManualReview = false

  for (const question of questions) {
    const given = byQuestion.get(question.id)
    const selected = [...new Set(given?.selectedOptionIds ?? [])].sort()

    if (question.kind === 'open') {
      needsManualReview = true
      answers.push({
        question_id: question.id,
        selected_option_ids: [],
        answer_text: given?.answerText?.trim() || null,
        is_correct: null,
        points_awarded: 0,
      })
      continue
    }

    closedTotal += question.points
    const correct = [...question.correctOptionIds].sort()
    const isCorrect =
      selected.length > 0 &&
      selected.length === correct.length &&
      selected.every((id, i) => id === correct[i])

    if (isCorrect) awarded += question.points

    answers.push({
      question_id: question.id,
      selected_option_ids: selected,
      answer_text: null,
      is_correct: isCorrect,
      points_awarded: isCorrect ? question.points : 0,
    })
  }

  const score = closedTotal > 0 ? Math.round((awarded / closedTotal) * 10000) / 100 : 0
  return { answers, score, needsManualReview }
}
