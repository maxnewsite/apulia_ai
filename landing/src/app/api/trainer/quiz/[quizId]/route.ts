import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireApprovedTrainer } from '@/lib/trainer-session'
import { gradeAttempt, getCurriculum, type GradableQuestion, type QuestionKind } from '@/lib/trainer'

export const runtime = 'nodejs'

/** Tolleranza sul limite di tempo, per non punire la latenza di rete. */
const GRACE_SECONDS = 60

interface QuizRow {
  id: string
  kind: 'module' | 'exam'
  module_id: string | null
  title: string
  intro: string | null
  pass_score: number
  max_attempts: number
  time_limit_minutes: number | null
  is_published: boolean
}

interface AttemptRow {
  id: string
  attempt_number: number
  status: string
  score: number | null
  passed: boolean | null
  started_at: string
  submitted_at: string | null
}

async function loadQuiz(quizId: string): Promise<QuizRow | null> {
  const { data } = await supabaseAdmin
    .from('trainer_quizzes')
    .select('id,kind,module_id,title,intro,pass_score,max_attempts,time_limit_minutes,is_published')
    .eq('id', quizId)
    .maybeSingle()
  return (data as QuizRow) ?? null
}

/** Domande con le risposte corrette — solo per la correzione server-side. */
async function loadGradable(quizId: string): Promise<GradableQuestion[]> {
  const { data } = await supabaseAdmin
    .from('trainer_questions')
    .select('id,kind,points,position,trainer_question_options(id,is_correct)')
    .eq('quiz_id', quizId)
    .order('position')

  return ((data ?? []) as unknown as Array<{
    id: string
    kind: QuestionKind
    points: number
    trainer_question_options: { id: string; is_correct: boolean }[]
  }>).map(q => ({
    id: q.id,
    kind: q.kind,
    points: Number(q.points),
    correctOptionIds: q.trainer_question_options.filter(o => o.is_correct).map(o => o.id),
  }))
}

/** Domande ripulite per il browser: nessun is_correct, nessuna spiegazione. */
async function loadForClient(quizId: string) {
  const { data } = await supabaseAdmin
    .from('trainer_questions')
    .select('id,kind,prompt,points,position,trainer_question_options(id,label,position)')
    .eq('quiz_id', quizId)
    .order('position')

  return ((data ?? []) as unknown as Array<{
    id: string
    kind: QuestionKind
    prompt: string
    points: number
    trainer_question_options: { id: string; label: string; position: number }[]
  }>).map(q => ({
    id: q.id,
    kind: q.kind,
    prompt: q.prompt,
    points: Number(q.points),
    options: q.trainer_question_options
      .sort((a, b) => a.position - b.position)
      .map(o => ({ id: o.id, label: o.label })),
  }))
}

async function attemptsState(quizId: string, trainerId: string, maxAttempts: number) {
  const [{ data: attempts }, { data: grant }] = await Promise.all([
    supabaseAdmin
      .from('trainer_quiz_attempts')
      .select('id,attempt_number,status,score,passed,started_at,submitted_at')
      .eq('quiz_id', quizId)
      .eq('trainer_id', trainerId)
      .order('attempt_number'),
    supabaseAdmin
      .from('trainer_attempt_grants')
      .select('extra_attempts')
      .eq('quiz_id', quizId)
      .eq('trainer_id', trainerId)
      .maybeSingle(),
  ])

  const rows = (attempts ?? []) as AttemptRow[]
  const consumed = rows.filter(a => a.status !== 'in_progress')

  return {
    rows,
    open: rows.find(a => a.status === 'in_progress') ?? null,
    used: consumed.length,
    allowed: maxAttempts + (grant?.extra_attempts ?? 0),
    passed: consumed.some(a => a.passed === true),
    bestScore: consumed.length ? Math.max(...consumed.map(a => Number(a.score ?? 0))) : null,
  }
}

/** Un quiz di modulo è accessibile solo se i moduli precedenti sono superati. */
async function moduleGate(quiz: QuizRow, trainerId: string): Promise<string | null> {
  if (quiz.kind !== 'module' || !quiz.module_id) return null
  const curriculum = await getCurriculum(trainerId)
  const entry = curriculum.entries.find(e => e.module.id === quiz.module_id)
  if (!entry) return 'Modulo non disponibile.'
  if (!entry.unlocked) return 'Devi prima superare i moduli precedenti.'
  return null
}

function expired(attempt: AttemptRow, quiz: QuizRow): boolean {
  if (!quiz.time_limit_minutes) return false
  const deadline =
    new Date(attempt.started_at).getTime() + (quiz.time_limit_minutes * 60 + GRACE_SECONDS) * 1000
  return Date.now() > deadline
}

// ────────────────────────────────────────────────────────────
// GET — stato del quiz + eventuale tentativo in corso
// ────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest, context: { params: Promise<{ quizId: string }> }) {
  const { profile, denial } = await requireApprovedTrainer()
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  const { quizId } = await context.params
  const quiz = await loadQuiz(quizId)
  if (!quiz || !quiz.is_published)
    return NextResponse.json({ error: 'Quiz non disponibile.' }, { status: 404 })

  const gate = await moduleGate(quiz, profile.id)
  if (gate) return NextResponse.json({ error: gate }, { status: 403 })

  const state = await attemptsState(quiz.id, profile.id, quiz.max_attempts)

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      kind: quiz.kind,
      title: quiz.title,
      intro: quiz.intro,
      pass_score: quiz.pass_score,
      time_limit_minutes: quiz.time_limit_minutes,
    },
    attempts: {
      used: state.used,
      allowed: state.allowed,
      passed: state.passed,
      best_score: state.bestScore,
      history: state.rows
        .filter(a => a.status !== 'in_progress')
        .map(a => ({
          id: a.id,
          attempt_number: a.attempt_number,
          status: a.status,
          score: a.score,
          passed: a.passed,
          submitted_at: a.submitted_at,
        })),
    },
    open_attempt: state.open
      ? { id: state.open.id, started_at: state.open.started_at }
      : null,
    questions: state.open ? await loadForClient(quiz.id) : [],
  })
}

// ────────────────────────────────────────────────────────────
// POST — { action: 'start' } | { action: 'submit', attempt_id, answers }
// ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest, context: { params: Promise<{ quizId: string }> }) {
  const { profile, denial } = await requireApprovedTrainer()
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  const { quizId } = await context.params
  const quiz = await loadQuiz(quizId)
  if (!quiz || !quiz.is_published)
    return NextResponse.json({ error: 'Quiz non disponibile.' }, { status: 404 })

  const gate = await moduleGate(quiz, profile.id)
  if (gate) return NextResponse.json({ error: gate }, { status: 403 })

  let body: { action?: string; attempt_id?: string; answers?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
  }

  const state = await attemptsState(quiz.id, profile.id, quiz.max_attempts)

  // ── START ──────────────────────────────────────────────
  if (body.action === 'start') {
    if (state.open) {
      return NextResponse.json({
        attempt_id: state.open.id,
        started_at: state.open.started_at,
        questions: await loadForClient(quiz.id),
      })
    }
    if (state.passed)
      return NextResponse.json({ error: 'Hai già superato questo quiz.' }, { status: 409 })
    if (state.used >= state.allowed)
      return NextResponse.json(
        { error: 'Hai esaurito i tentativi disponibili. Contatta un revisore per uno sblocco.' },
        { status: 403 },
      )

    const nextNumber = state.rows.length
      ? Math.max(...state.rows.map(a => a.attempt_number)) + 1
      : 1

    const { data, error } = await supabaseAdmin
      .from('trainer_quiz_attempts')
      .insert({
        quiz_id: quiz.id,
        trainer_id: profile.id,
        attempt_number: nextNumber,
        status: 'in_progress',
      })
      .select('id,started_at')
      .single()

    if (error || !data) {
      console.error('quiz start error:', error?.message)
      return NextResponse.json({ error: 'Avvio del tentativo non riuscito.' }, { status: 500 })
    }

    return NextResponse.json(
      { attempt_id: data.id, started_at: data.started_at, questions: await loadForClient(quiz.id) },
      { status: 201 },
    )
  }

  // ── SUBMIT ─────────────────────────────────────────────
  if (body.action === 'submit') {
    const attempt = state.open
    if (!attempt || attempt.id !== body.attempt_id)
      return NextResponse.json({ error: 'Nessun tentativo aperto da consegnare.' }, { status: 409 })

    if (expired(attempt, quiz)) {
      await supabaseAdmin
        .from('trainer_quiz_attempts')
        .update({ status: 'expired', score: 0, passed: false, submitted_at: new Date().toISOString() })
        .eq('id', attempt.id)
      return NextResponse.json(
        { error: 'Tempo scaduto: il tentativo è stato annullato.', expired: true },
        { status: 409 },
      )
    }

    const submitted = Array.isArray(body.answers)
      ? (body.answers as Array<{
          question_id?: string
          selected_option_ids?: string[]
          answer_text?: string
        }>).map(a => ({
          questionId: String(a.question_id ?? ''),
          selectedOptionIds: Array.isArray(a.selected_option_ids)
            ? a.selected_option_ids.map(String)
            : [],
          answerText: typeof a.answer_text === 'string' ? a.answer_text : undefined,
        }))
      : []

    const questions = await loadGradable(quiz.id)
    if (questions.length === 0)
      return NextResponse.json({ error: 'Questo quiz non ha ancora domande.' }, { status: 409 })

    const result = gradeAttempt(questions, submitted)
    // L'esame finale non è mai "superato" in automatico: serve la revisione
    // del video da parte dell'admin.
    const passed = quiz.kind === 'exam' ? false : result.score >= quiz.pass_score

    const { error: answersError } = await supabaseAdmin.from('trainer_quiz_answers').upsert(
      result.answers.map(a => ({ attempt_id: attempt.id, ...a })),
      { onConflict: 'attempt_id,question_id' },
    )
    if (answersError) {
      console.error('quiz answers error:', answersError.message)
      return NextResponse.json({ error: 'Salvataggio delle risposte non riuscito.' }, { status: 500 })
    }

    const { error: closeError } = await supabaseAdmin
      .from('trainer_quiz_attempts')
      .update({
        status: 'submitted',
        score: result.score,
        passed,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', attempt.id)
      .eq('status', 'in_progress')

    if (closeError) {
      console.error('quiz close error:', closeError.message)
      return NextResponse.json({ error: 'Consegna non riuscita.' }, { status: 500 })
    }

    const attemptsLeft = Math.max(0, state.allowed - (state.used + 1))

    return NextResponse.json({
      score: result.score,
      pass_score: quiz.pass_score,
      passed,
      needs_manual_review: result.needsManualReview,
      attempts_left: passed ? 0 : attemptsLeft,
    })
  }

  return NextResponse.json({ error: 'Azione non riconosciuta.' }, { status: 400 })
}
