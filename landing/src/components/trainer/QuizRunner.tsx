'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import QuestionList, {
  emptyAnswers,
  type AnswerState,
  type ClientQuestion,
} from '@/components/trainer/QuestionList'

interface QuizState {
  quiz: { id: string; title: string; intro: string | null; pass_score: number }
  attempts: { used: number; allowed: number; passed: boolean; best_score: number | null }
  open_attempt: { id: string } | null
  questions: ClientQuestion[]
}

interface Outcome {
  score: number
  pass_score: number
  passed: boolean
  attempts_left: number
}

/** Svolgimento di un quiz di modulo: avvio, risposte, consegna, esito. */
export default function QuizRunner({ quizId, moduleSlug }: { quizId: string; moduleSlug: string }) {
  const router = useRouter()
  const [state, setState] = useState<QuizState | null>(null)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/trainer/quiz/${quizId}`)
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(json.error ?? 'Quiz non disponibile.')
      return
    }
    setState(json)
    setAttemptId(json.open_attempt?.id ?? null)
    if (json.questions?.length) setAnswers(emptyAnswers(json.questions))
  }, [quizId])

  useEffect(() => {
    load()
  }, [load])

  async function start() {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/trainer/quiz/${quizId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(json.error ?? 'Avvio non riuscito.')
      return
    }
    setAttemptId(json.attempt_id)
    setAnswers(emptyAnswers(json.questions ?? []))
    setState(prev => (prev ? { ...prev, questions: json.questions ?? [] } : prev))
  }

  async function submit() {
    if (!attemptId || !state) return
    setBusy(true)
    setError('')

    const res = await fetch(`/api/trainer/quiz/${quizId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit',
        attempt_id: attemptId,
        answers: state.questions.map(q => ({
          question_id: q.id,
          selected_option_ids: answers[q.id]?.selected ?? [],
          answer_text: answers[q.id]?.text ?? '',
        })),
      }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(json.error ?? 'Consegna non riuscita.')
      return
    }
    setOutcome(json)
    setAttemptId(null)
    router.refresh()
  }

  if (error && !state) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-2xl p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!state) return <p className="text-sm text-[#475569]">Caricamento…</p>

  // ── Esito del tentativo appena consegnato ──────────────
  if (outcome) {
    return (
      <div
        className={`border rounded-2xl p-8 ${
          outcome.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
        }`}
      >
        <p className="text-4xl font-black tracking-tight mb-2">{outcome.score}%</p>
        <h2 className="text-xl font-bold mb-3">
          {outcome.passed ? 'Modulo superato' : 'Non superato'}
        </h2>
        <p className="text-sm text-[#475569] mb-6">
          {outcome.passed
            ? `Soglia di superamento: ${outcome.pass_score}%. Puoi passare al modulo successivo.`
            : outcome.attempts_left > 0
              ? `Serve almeno il ${outcome.pass_score}%. Ti ${
                  outcome.attempts_left === 1
                    ? 'resta 1 tentativo'
                    : `restano ${outcome.attempts_left} tentativi`
                }: rivedi i materiali prima di riprovare.`
              : 'Hai esaurito i tentativi. Contatta un revisore per richiedere uno sblocco.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/trainer/moduli/${moduleSlug}`}
            className="bg-[#2563EB] text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#1D4ED8] transition-colors"
          >
            Torna al modulo
          </Link>
          <Link
            href="/trainer/dashboard"
            className="border border-[#E2E8F0] font-semibold px-5 py-2.5 rounded-full text-sm hover:border-[#2563EB] transition-colors"
          >
            Vedi il percorso
          </Link>
        </div>
      </div>
    )
  }

  // ── Tentativo in corso ─────────────────────────────────
  if (attemptId && state.questions.length > 0) {
    const unanswered = state.questions.filter(
      q => (answers[q.id]?.selected.length ?? 0) === 0 && !(answers[q.id]?.text ?? '').trim(),
    ).length

    return (
      <>
        <QuestionList questions={state.questions} answers={answers} onChange={setAnswers} disabled={busy} />

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
            {busy ? 'Invio…' : 'Consegna il quiz'}
          </button>
          <span className="text-sm text-[#475569]">
            {unanswered === 0
              ? 'Tutte le domande hanno una risposta.'
              : `${unanswered} domande senza risposta.`}
          </span>
        </div>
      </>
    )
  }

  // ── Schermata di avvio ─────────────────────────────────
  const left = Math.max(0, state.attempts.allowed - state.attempts.used)

  return (
    <div className="border border-[#E2E8F0] rounded-2xl p-8">
      {state.quiz.intro && <p className="text-[#475569] mb-6">{state.quiz.intro}</p>}

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-sm">
        <div>
          <dt className="text-[#475569]">Soglia</dt>
          <dd className="font-bold">{state.quiz.pass_score}%</dd>
        </div>
        <div>
          <dt className="text-[#475569]">Tentativi usati</dt>
          <dd className="font-bold">
            {state.attempts.used}/{state.attempts.allowed}
          </dd>
        </div>
        {state.attempts.best_score !== null && (
          <div>
            <dt className="text-[#475569]">Miglior punteggio</dt>
            <dd className="font-bold">{state.attempts.best_score}%</dd>
          </div>
        )}
      </dl>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {state.attempts.passed ? (
        <p className="text-sm text-emerald-700">Hai già superato questo quiz.</p>
      ) : left === 0 ? (
        <p className="text-sm text-red-700">
          Tentativi esauriti. Contatta un revisore per richiedere uno sblocco.
        </p>
      ) : (
        <button
          onClick={start}
          disabled={busy}
          className="bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
        >
          {busy ? 'Apertura…' : 'Inizia il tentativo'}
        </button>
      )}
    </div>
  )
}
