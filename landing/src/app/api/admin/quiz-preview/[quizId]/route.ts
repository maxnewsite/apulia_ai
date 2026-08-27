import { NextRequest, NextResponse } from 'next/server'
import { gradeAttempt } from '@/lib/trainer'
import {
  buildReview,
  composePreview,
  getQuizForPreview,
  loadGradable,
} from '@/lib/trainer-preview'

export const runtime = 'nodejs'

// L'accesso è già filtrato da `proxy.ts` su /api/admin/*: qui si arriva solo
// con un cookie admin valido.

// ────────────────────────────────────────────────────────────
// GET — un campione fresco del quiz, senza risposte corrette
// ────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest, context: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await context.params
  const quiz = await getQuizForPreview(quizId)
  if (!quiz) return NextResponse.json({ error: 'Quiz inesistente.' }, { status: 404 })

  const questions = await composePreview(quiz)
  if (questions.length === 0)
    return NextResponse.json(
      { error: 'Questo quiz non ha ancora domande nel pool.' },
      { status: 409 },
    )

  return NextResponse.json({ quiz, questions, started_at: new Date().toISOString() })
}

// ────────────────────────────────────────────────────────────
// POST — correzione del campione appena svolto
// ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest, context: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await context.params
  const quiz = await getQuizForPreview(quizId)
  if (!quiz) return NextResponse.json({ error: 'Quiz inesistente.' }, { status: 404 })

  let body: { answers?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
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

  const { gradable, rows } = await loadGradable(
    quiz.id,
    submitted.map(a => a.questionId).filter(Boolean),
  )
  if (gradable.length === 0)
    return NextResponse.json({ error: 'Nessuna domanda da correggere.' }, { status: 409 })

  const result = gradeAttempt(gradable, submitted)

  return NextResponse.json({
    score: result.score,
    pass_score: quiz.pass_score,
    // Come nell'esame vero: la parte chiusa non basta a dichiararlo superato.
    passed: quiz.kind === 'exam' ? false : result.score >= quiz.pass_score,
    needs_manual_review: result.needsManualReview,
    review: buildReview(rows, result.answers),
  })
}
