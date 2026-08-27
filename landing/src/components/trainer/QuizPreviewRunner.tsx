'use client'

import { useCallback, useEffect, useState } from 'react'
import QuizCountdown from '@/components/trainer/QuizCountdown'
import QuestionList, {
  emptyAnswers,
  type AnswerState,
  type ClientQuestion,
} from '@/components/trainer/QuestionList'

interface QuizMeta {
  id: string
  kind: 'module' | 'exam'
  title: string
  intro: string | null
  pass_score: number
  time_limit_minutes: number | null
  questions_per_attempt: number | null
  is_published: boolean
  pool_size: number
}

interface QuestionReview {
  id: string
  prompt: string
  kind: string
  explanation: string | null
  correct_labels: string[]
  is_correct: boolean | null
}

interface Outcome {
  score: number
  pass_score: number
  passed: boolean
  needs_manual_review: boolean
  review: QuestionReview[]
}

/**
 * Svolgimento di un quiz in anteprima. Stessa UI del quiz vero, ma nessun
 * tentativo viene registrato: si puo' ripetere all'infinito e su quiz non
 * ancora pubblicati. Il conto alla rovescia e' solo indicativo — qui non c'e'
 * un server che annulli la consegna fuori tempo.
 */
export default function QuizPreviewRunner({ quizId }: { quizId: string }) {
  const [quiz, setQuiz] = useState<QuizMeta | null>(null)
  const [questions, setQuestions] = useState<ClientQuestion[]>([])
  const [answers, setAnswers] = useState<AnswerState>({})
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const draw = useCallback(async () => {
    setBusy(true)
    setError('')
    setOutcome(null)
    const res = await fetch(`/api/admin/quiz-preview/${quizId}`, { cache: 'no-store' })
    const json = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(json.error ?? 'Anteprima non disponibile.')
      return
    }
    setQuiz(json.quiz)
    setQuestions(json.questions)
    setAnswers(emptyAnswers(json.questions))
    setStartedAt(json.started_at)
  }, [quizId])

  useEffect(() => {
    draw()
  }, [draw])

  async function submit() {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/admin/quiz-preview/${quizId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: questions.map(q => ({
          question_id: q.id,
          selected_option_ids: answers[q.id]?.selected ?? [],
          answer_text: answers[q.id]?.text ?? '',
        })),
      }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(json.error ?? 'Correzione non riuscita.')
      return
    }
    setOutcome(json)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (error && !quiz) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-2xl p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!quiz) return <p className="text-sm text-[#475569]">Caricamento…</p>

  const unanswered = questions.filter(
    q => (answers[q.id]?.selected.length ?? 0) === 0 && !(answers[q.id]?.text ?? '').trim(),
  ).length

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
        <span className="border border-[#E2E8F0] rounded-full px-3 py-1 text-[#475569]">
          Pool: {quiz.pool_size} domande
        </span>
        <span className="border border-[#E2E8F0] rounded-full px-3 py-1 text-[#475569]">
          Estratte: {quiz.questions_per_attempt ?? quiz.pool_size}
        </span>
        <span className="border border-[#E2E8F0] rounded-full px-3 py-1 text-[#475569]">
          Soglia: {quiz.pass_score}%
        </span>
        {quiz.time_limit_minutes && (
          <span className="border border-[#E2E8F0] rounded-full px-3 py-1 text-[#475569]">
            Tempo: {quiz.time_limit_minutes} min
          </span>
        )}
        <span
          className={`rounded-full px-3 py-1 font-semibold border ${
            quiz.is_published
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}
        >
          {quiz.is_published ? 'Pubblicato' : 'Non pubblicato'}
        </span>
      </div>

      {quiz.intro && <p className="text-sm text-[#475569] mb-8">{quiz.intro}</p>}

      {outcome && (
        <div
          className={`border rounded-2xl p-8 mb-10 ${
            outcome.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          <p className="text-4xl font-black tracking-tight mb-2">{outcome.score}%</p>
          <h2 className="text-xl font-bold mb-3">
            {outcome.passed ? 'Sopra soglia' : 'Sotto soglia'}
          </h2>
          <p className="text-sm text-[#475569] mb-6">
            Soglia {outcome.pass_score}% sulla sola parte a risposta chiusa.
            {outcome.needs_manual_review &&
              ' Le domande aperte restano fuori dal punteggio: le valuta il revisore.'}
            {quiz.kind === 'exam' &&
              ' L’esame vero non si dichiara mai superato in automatico: serve la valutazione del video.'}
          </p>

          <ol className="space-y-3">
            {outcome.review.map((item, index) => (
              <li
                key={item.id}
                className={`border rounded-xl p-4 bg-white ${
                  item.is_correct === null
                    ? 'border-[#E2E8F0]'
                    : item.is_correct
                      ? 'border-emerald-200'
                      : 'border-red-200'
                }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs font-bold text-[#475569]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{item.prompt}</span>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      item.is_correct === null
                        ? 'text-[#475569]'
                        : item.is_correct
                          ? 'text-emerald-700'
                          : 'text-red-700'
                    }`}
                  >
                    {item.is_correct === null
                      ? 'Da valutare'
                      : item.is_correct
                        ? 'Corretta'
                        : 'Errata'}
                  </span>
                </div>
                {item.correct_labels.length > 0 && (
                  <p className="text-xs text-[#475569] mt-2 ml-7">
                    <span className="font-semibold">Risposta esatta: </span>
                    {item.correct_labels.join(' · ')}
                  </p>
                )}
                {item.explanation && (
                  <p className="text-xs text-[#475569] mt-1 ml-7 italic">{item.explanation}</p>
                )}
              </li>
            ))}
          </ol>

          <button
            onClick={draw}
            disabled={busy}
            className="mt-6 bg-[#2563EB] text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {busy ? 'Estrazione…' : 'Estrai un nuovo campione'}
          </button>
        </div>
      )}

      {!outcome && (
        <>
          {quiz.time_limit_minutes && startedAt && (
            <QuizCountdown startedAt={startedAt} minutes={quiz.time_limit_minutes} />
          )}

          <QuestionList
            questions={questions}
            answers={answers}
            onChange={setAnswers}
            disabled={busy}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-6">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={submit}
              disabled={busy}
              className="bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
            >
              {busy ? 'Correzione…' : 'Correggi'}
            </button>
            <button
              onClick={draw}
              disabled={busy}
              className="border border-[#E2E8F0] font-semibold px-6 py-3 rounded-full text-sm hover:border-[#2563EB] transition-colors disabled:opacity-50"
            >
              Estrai un altro campione
            </button>
            <span className="text-sm text-[#475569]">
              {unanswered === 0
                ? 'Tutte le domande hanno una risposta.'
                : `${unanswered} domande senza risposta.`}
            </span>
          </div>
        </>
      )}
    </>
  )
}
