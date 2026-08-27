// Anteprima dei quiz per il revisore.
//
// Serve a provare un quiz — estrazione, mescolamento, correzione, soglia —
// senza essere un trainer approvato e senza consumare tentativi. Per questo
// NON tocca `trainer_quiz_attempts`: nessuna riga viene scritta, nessun
// avanzamento viene alterato, e il quiz può essere provato anche prima di
// essere pubblicato. È esattamente ciò che un editor di contenuti deve poter
// fare mentre il pool di domande è ancora in lavorazione.
//
// La correzione riusa `gradeAttempt` di `lib/trainer.ts`: se le regole di
// punteggio cambiano, l'anteprima cambia con loro. Duplicarle qui vorrebbe
// dire provare un quiz diverso da quello che i trainer sosterranno.

import { supabaseAdmin } from '@/lib/supabase-admin'
import type { GradableQuestion, QuestionKind } from '@/lib/trainer'

export interface PreviewQuizMeta {
  id: string
  kind: 'module' | 'exam'
  title: string
  intro: string | null
  pass_score: number
  time_limit_minutes: number | null
  questions_per_attempt: number | null
  is_published: boolean
  module: { slug: string; position: number; title: string } | null
  pool_size: number
}

export interface PreviewQuestion {
  id: string
  kind: QuestionKind
  prompt: string
  points: number
  options: { id: string; label: string }[]
}

interface QuestionRow {
  id: string
  kind: QuestionKind
  prompt: string
  points: number | string
  explanation: string | null
  trainer_question_options: { id: string; label: string; is_correct: boolean; position: number }[]
}

const QUESTION_SELECT =
  'id,kind,prompt,points,explanation,trainer_question_options(id,label,is_correct,position)'

/** Fisher-Yates: `sort(() => Math.random() - 0.5)` non è una permutazione uniforme. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

async function loadQuestions(quizId: string): Promise<QuestionRow[]> {
  const { data, error } = await supabaseAdmin
    .from('trainer_questions')
    .select(QUESTION_SELECT)
    .eq('quiz_id', quizId)
    .order('position')

  if (error) {
    console.error('anteprima quiz — domande non leggibili:', error.message)
    return []
  }
  return (data ?? []) as unknown as QuestionRow[]
}

/** Elenco dei quiz con la dimensione del pool: la vista d'insieme del revisore. */
export async function listQuizzesForPreview(): Promise<PreviewQuizMeta[]> {
  const [{ data: quizzes }, { data: modules }, { data: questions }] = await Promise.all([
    supabaseAdmin
      .from('trainer_quizzes')
      .select(
        'id,kind,module_id,title,intro,pass_score,time_limit_minutes,questions_per_attempt,is_published',
      ),
    supabaseAdmin.from('trainer_modules').select('id,slug,position,title').order('position'),
    supabaseAdmin.from('trainer_questions').select('quiz_id'),
  ])

  const moduleById = new Map((modules ?? []).map(m => [m.id as string, m]))
  const poolByQuiz = new Map<string, number>()
  for (const q of questions ?? []) {
    const key = (q as { quiz_id: string }).quiz_id
    poolByQuiz.set(key, (poolByQuiz.get(key) ?? 0) + 1)
  }

  const rows = (quizzes ?? []) as (Omit<PreviewQuizMeta, 'module' | 'pool_size'> & {
    module_id: string | null
  })[]

  return rows
    .map(row => {
      const mod = row.module_id ? moduleById.get(row.module_id) : undefined
      return {
        id: row.id,
        kind: row.kind,
        title: row.title,
        intro: row.intro,
        pass_score: row.pass_score,
        time_limit_minutes: row.time_limit_minutes,
        questions_per_attempt: row.questions_per_attempt,
        is_published: row.is_published,
        module: mod
          ? { slug: mod.slug as string, position: mod.position as number, title: mod.title as string }
          : null,
        pool_size: poolByQuiz.get(row.id) ?? 0,
      }
    })
    .sort((a, b) => {
      // I moduli in ordine di percorso, l'esame in fondo.
      if (a.kind !== b.kind) return a.kind === 'module' ? -1 : 1
      return (a.module?.position ?? 0) - (b.module?.position ?? 0)
    })
}

export async function getQuizForPreview(quizId: string): Promise<PreviewQuizMeta | null> {
  const all = await listQuizzesForPreview()
  return all.find(q => q.id === quizId) ?? null
}

/**
 * Estrae un campione come farebbe `trainer_compose_attempt`: N domande a caso
 * dal pool, opzioni in ordine casuale. Ricaricare la pagina ridà un campione
 * diverso — in anteprima è un pregio, non un difetto: è il modo più rapido di
 * vedere che l'estrazione funziona davvero.
 */
export async function composePreview(quiz: PreviewQuizMeta): Promise<PreviewQuestion[]> {
  const rows = await loadQuestions(quiz.id)
  const limit = quiz.questions_per_attempt ?? rows.length
  const picked = shuffle(rows).slice(0, limit)

  return picked.map(row => ({
    id: row.id,
    kind: row.kind,
    prompt: row.prompt,
    points: Number(row.points),
    options: shuffle(row.trainer_question_options).map(o => ({ id: o.id, label: o.label })),
  }))
}

export interface PreviewQuestionReview {
  id: string
  prompt: string
  kind: QuestionKind
  explanation: string | null
  correct_option_ids: string[]
  correct_labels: string[]
  selected_option_ids: string[]
  is_correct: boolean | null
}

/**
 * Domande da correggere, lette dal database per gli id ricevuti. Il filtro su
 * `quiz_id` impedisce di far correggere a un quiz le domande di un altro.
 */
export async function loadGradable(
  quizId: string,
  questionIds: string[],
): Promise<{ gradable: GradableQuestion[]; rows: QuestionRow[] }> {
  if (questionIds.length === 0) return { gradable: [], rows: [] }

  const { data, error } = await supabaseAdmin
    .from('trainer_questions')
    .select(QUESTION_SELECT)
    .eq('quiz_id', quizId)
    .in('id', questionIds)

  if (error) {
    console.error('anteprima quiz — correzione non possibile:', error.message)
    return { gradable: [], rows: [] }
  }

  const rows = (data ?? []) as unknown as QuestionRow[]
  // L'ordine di `in()` non è garantito: si rimette quello inviato dal client,
  // altrimenti la revisione non corrisponde alle domande a schermo.
  const byId = new Map(rows.map(r => [r.id, r]))
  const ordered = questionIds.map(id => byId.get(id)).filter((r): r is QuestionRow => !!r)

  return {
    rows: ordered,
    gradable: ordered.map(r => ({
      id: r.id,
      kind: r.kind,
      points: Number(r.points),
      correctOptionIds: r.trainer_question_options.filter(o => o.is_correct).map(o => o.id),
    })),
  }
}

/** Revisione completa: in anteprima le soluzioni si mostrano sempre. */
export function buildReview(
  rows: QuestionRow[],
  graded: { question_id: string; selected_option_ids: string[]; is_correct: boolean | null }[],
): PreviewQuestionReview[] {
  const byQuestion = new Map(graded.map(g => [g.question_id, g]))

  return rows.map(row => {
    const correct = row.trainer_question_options.filter(o => o.is_correct)
    const given = byQuestion.get(row.id)
    return {
      id: row.id,
      prompt: row.prompt,
      kind: row.kind,
      explanation: row.explanation,
      correct_option_ids: correct.map(o => o.id),
      correct_labels: correct.map(o => o.label),
      selected_option_ids: given?.selected_option_ids ?? [],
      is_correct: given?.is_correct ?? null,
    }
  })
}
