'use client'

export interface ClientQuestion {
  id: string
  kind: 'single' | 'multi' | 'boolean' | 'open'
  prompt: string
  points: number
  options: { id: string; label: string }[]
}

export interface AnswerState {
  [questionId: string]: { selected: string[]; text: string }
}

export function emptyAnswers(questions: ClientQuestion[]): AnswerState {
  return Object.fromEntries(questions.map(q => [q.id, { selected: [], text: '' }]))
}

/** Elenco domande di un tentativo. Presentazionale: lo stato vive nel padre. */
export default function QuestionList({
  questions,
  answers,
  onChange,
  disabled = false,
}: {
  questions: ClientQuestion[]
  answers: AnswerState
  onChange: (next: AnswerState) => void
  disabled?: boolean
}) {
  function toggle(question: ClientQuestion, optionId: string) {
    const current = answers[question.id]?.selected ?? []
    const selected =
      question.kind === 'multi'
        ? current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId]
        : [optionId]

    onChange({ ...answers, [question.id]: { selected, text: answers[question.id]?.text ?? '' } })
  }

  function setText(questionId: string, text: string) {
    onChange({
      ...answers,
      [questionId]: { selected: answers[questionId]?.selected ?? [], text },
    })
  }

  return (
    <ol className="space-y-8">
      {questions.map((question, index) => (
        <li key={question.id} className="border border-[#E2E8F0] rounded-2xl p-6">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono text-sm font-bold text-[#2563EB]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-semibold leading-snug flex-1">{question.prompt}</h3>
          </div>

          {question.kind === 'multi' && (
            <p className="text-xs text-[#475569] mb-3 ml-9">
              Più risposte corrette: valgono solo se le selezioni tutte.
            </p>
          )}

          {question.kind === 'open' ? (
            <textarea
              rows={5}
              disabled={disabled}
              value={answers[question.id]?.text ?? ''}
              onChange={e => setText(question.id, e.target.value)}
              placeholder="La tua risposta…"
              className="w-full ml-9 max-w-[calc(100%-2.25rem)] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] disabled:bg-[#F8FAFC]"
            />
          ) : (
            <ul className="space-y-2 ml-9">
              {question.options.map(option => {
                const checked = (answers[question.id]?.selected ?? []).includes(option.id)
                return (
                  <li key={option.id}>
                    <label
                      className={`flex items-start gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                        checked ? 'border-[#2563EB] bg-blue-50' : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                      }`}
                    >
                      <input
                        type={question.kind === 'multi' ? 'checkbox' : 'radio'}
                        name={question.id}
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggle(question, option.id)}
                        className="mt-1 accent-[#2563EB]"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}
