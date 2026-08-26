'use client'

import { useEffect, useState } from 'react'

interface ReviewOption {
  id: string
  label: string
  selected: boolean
  is_correct: boolean | null
}

interface ReviewQuestion {
  id: string
  position: number
  kind: 'single' | 'multi' | 'boolean' | 'open'
  prompt: string
  is_correct: boolean | null
  answer_text: string | null
  explanation: string | null
  options: ReviewOption[]
}

interface ReviewPayload {
  attempts_left: number
  full_disclosure: boolean
  review: ReviewQuestion[]
}

/**
 * Revisione di un tentativo consegnato. Il livello di dettaglio lo decide il
 * server: a tentativi ancora disponibili mostra solo quali domande sono
 * sbagliate, altrimenti apre risposte corrette e spiegazioni.
 */
export default function AttemptReview({
  quizId,
  attemptId,
}: {
  quizId: string
  attemptId: string
}) {
  const [data, setData] = useState<ReviewPayload | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/trainer/quiz/${quizId}/revisione/${attemptId}`)
      .then(async res => {
        const json = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) setError(json.error ?? 'Revisione non disponibile.')
        else setData(json)
      })
      .catch(() => !cancelled && setError('Revisione non disponibile.'))
    return () => {
      cancelled = true
    }
  }, [quizId, attemptId])

  if (error) return <p className="text-sm text-[#475569] mt-8">{error}</p>
  if (!data) return <p className="text-sm text-[#475569] mt-8">Caricamento della revisione…</p>

  const wrong = data.review.filter(q => q.is_correct === false).length

  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#475569] mb-2">
        Revisione delle risposte
      </h2>

      <p className="text-sm text-[#475569] mb-6">
        {data.full_disclosure
          ? 'Per ogni domanda trovi la tua risposta, quella corretta e la spiegazione.'
          : `${wrong === 1 ? 'Una domanda è sbagliata' : `${wrong} domande sono sbagliate`}. Le risposte corrette e le spiegazioni si sbloccano quando superi il quiz o esaurisci i tentativi: rivedi i materiali e riprova.`}
      </p>

      <ol className="space-y-4">
        {data.review.map((q, index) => (
          <li
            key={q.id}
            className={`border rounded-2xl p-5 ${
              q.is_correct === true
                ? 'border-emerald-200 bg-emerald-50/40'
                : q.is_correct === false
                  ? 'border-red-200 bg-red-50/40'
                  : 'border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-mono text-sm font-bold text-[#2563EB]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-semibold leading-snug flex-1">{q.prompt}</h3>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  q.is_correct === true
                    ? 'text-emerald-700'
                    : q.is_correct === false
                      ? 'text-red-700'
                      : 'text-[#475569]'
                }`}
              >
                {q.is_correct === true ? 'corretta' : q.is_correct === false ? 'sbagliata' : 'da valutare'}
              </span>
            </div>

            {q.kind === 'open' ? (
              <div className="ml-9">
                <p className="text-xs text-[#475569] mb-1">La tua risposta</p>
                <p className="text-sm whitespace-pre-wrap bg-white border border-[#E2E8F0] rounded-xl p-3">
                  {q.answer_text || <span className="text-[#475569]">Nessuna risposta.</span>}
                </p>
              </div>
            ) : (
              <ul className="ml-9 space-y-1.5">
                {q.options.map(o => (
                  <li
                    key={o.id}
                    className={`text-sm rounded-lg px-3 py-2 border ${
                      o.is_correct === true
                        ? 'border-emerald-300 bg-emerald-50'
                        : o.selected
                          ? 'border-red-300 bg-red-50'
                          : 'border-[#E2E8F0] bg-white'
                    }`}
                  >
                    <span className="font-mono text-xs text-[#475569] mr-2">
                      {o.selected ? '◉' : '○'}
                    </span>
                    {o.label}
                    {o.is_correct === true && (
                      <span className="ml-2 text-xs font-semibold text-emerald-700">corretta</span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {q.explanation && (
              <p className="ml-9 mt-3 text-sm text-[#475569] border-l-2 border-[#2563EB] pl-3">
                {q.explanation}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
