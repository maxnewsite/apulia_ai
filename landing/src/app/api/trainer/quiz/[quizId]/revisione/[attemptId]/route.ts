import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireApprovedTrainer } from '@/lib/trainer-session'
import type { QuestionKind } from '@/lib/trainer'

export const runtime = 'nodejs'

/**
 * Revisione di un tentativo consegnato: cosa ha risposto il trainer, cosa era
 * corretto e perché.
 *
 * Quanto si rivela dipende dalla situazione, ed è una scelta deliberata:
 * finché restano tentativi e il quiz non è superato, si dice SOLO quali
 * domande sono sbagliate. Mostrare subito risposta esatta e spiegazione
 * trasformerebbe il secondo tentativo in una trascrizione: con tre tentativi
 * sulle stesse domande, il punteggio non misurerebbe più nulla.
 * A quiz superato, o a tentativi esauriti, si apre tutto — lì la spiegazione
 * serve a imparare, non più a superare.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ quizId: string; attemptId: string }> },
) {
  const { profile, denial } = await requireApprovedTrainer()
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  const { quizId, attemptId } = await context.params

  const { data: quiz } = await supabaseAdmin
    .from('trainer_quizzes')
    .select('id,title,pass_score,max_attempts,kind')
    .eq('id', quizId)
    .maybeSingle()

  if (!quiz) return NextResponse.json({ error: 'Quiz non trovato.' }, { status: 404 })

  const { data: attempt } = await supabaseAdmin
    .from('trainer_quiz_attempts')
    .select('id,attempt_number,status,score,passed,started_at,submitted_at')
    .eq('id', attemptId)
    .eq('trainer_id', profile.id)
    .eq('quiz_id', quizId)
    .maybeSingle()

  if (!attempt)
    return NextResponse.json({ error: 'Tentativo non trovato.' }, { status: 404 })
  if (attempt.status === 'in_progress')
    return NextResponse.json({ error: 'Tentativo ancora in corso.' }, { status: 409 })

  // Quanti tentativi restano, per decidere se aprire le risposte.
  const [{ count: usedCount }, { data: grant }, { data: allAttempts }] = await Promise.all([
    supabaseAdmin
      .from('trainer_quiz_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('trainer_id', profile.id)
      .eq('quiz_id', quizId)
      .neq('status', 'in_progress'),
    supabaseAdmin
      .from('trainer_attempt_grants')
      .select('extra_attempts')
      .eq('trainer_id', profile.id)
      .eq('quiz_id', quizId)
      .maybeSingle(),
    supabaseAdmin
      .from('trainer_quiz_attempts')
      .select('passed')
      .eq('trainer_id', profile.id)
      .eq('quiz_id', quizId),
  ])

  const allowed = quiz.max_attempts + (grant?.extra_attempts ?? 0)
  const attemptsLeft = Math.max(0, allowed - (usedCount ?? 0))
  const everPassed = (allAttempts ?? []).some(a => a.passed === true)

  // L'esame finale non si "supera" in automatico: la revisione resta chiusa
  // finché il revisore non ha deciso, altrimenti si consegnerebbero le
  // risposte corrette di una prova ancora in valutazione.
  const fullDisclosure = quiz.kind === 'exam' ? false : everPassed || attemptsLeft === 0

  const [{ data: questions }, { data: answers }] = await Promise.all([
    supabaseAdmin
      .from('trainer_questions')
      .select('id,position,kind,prompt,explanation,points,trainer_question_options(id,position,label,is_correct)')
      .eq('quiz_id', quizId)
      .order('position'),
    supabaseAdmin
      .from('trainer_quiz_answers')
      .select('question_id,selected_option_ids,answer_text,is_correct,points_awarded')
      .eq('attempt_id', attemptId),
  ])

  type OptionRow = { id: string; position: number; label: string; is_correct: boolean }
  type QuestionRow = {
    id: string
    position: number
    kind: QuestionKind
    prompt: string
    explanation: string | null
    points: number
    trainer_question_options: OptionRow[]
  }

  const answerByQuestion = new Map(
    (answers ?? []).map(a => [a.question_id as string, a]),
  )

  const review = ((questions ?? []) as unknown as QuestionRow[]).map(q => {
    const given = answerByQuestion.get(q.id)
    const selected = (given?.selected_option_ids as string[]) ?? []

    return {
      id: q.id,
      position: q.position,
      kind: q.kind,
      prompt: q.prompt,
      is_correct: given?.is_correct ?? null,
      answer_text: given?.answer_text ?? null,
      selected_option_ids: selected,
      // Spiegazione e risposte corrette solo a revisione aperta.
      explanation: fullDisclosure ? q.explanation : null,
      options: q.trainer_question_options
        .sort((a, b) => a.position - b.position)
        .map(o => ({
          id: o.id,
          label: o.label,
          selected: selected.includes(o.id),
          is_correct: fullDisclosure ? o.is_correct : null,
        })),
    }
  })

  return NextResponse.json({
    quiz: { title: quiz.title, pass_score: quiz.pass_score, kind: quiz.kind },
    attempt,
    attempts_left: attemptsLeft,
    full_disclosure: fullDisclosure,
    review,
  })
}
