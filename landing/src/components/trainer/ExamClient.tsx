'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import QuestionList, {
  emptyAnswers,
  type AnswerState,
  type ClientQuestion,
} from '@/components/trainer/QuestionList'

interface Submission {
  id: string
  status: 'draft' | 'submitted' | 'under_review' | 'qualified' | 'rejected'
  video_url: string | null
  auto_score: number | null
  review_notes: string | null
  created_at: string
}

interface ExamState {
  unlocked: boolean
  reason: string | null
  completed_modules: number
  total_modules: number
  quiz_id: string | null
  submission: Submission | null
}

interface UploadedFile {
  path: string
  name: string
  size: number
  type: string
}

const STATUS_COPY: Record<Submission['status'], { title: string; body: string; tone: string }> = {
  draft: {
    title: 'Consegna incompleta',
    body: 'La tua consegna è ancora in bozza.',
    tone: 'border-[#E2E8F0] bg-[#F8FAFC]',
  },
  submitted: {
    title: 'Consegna ricevuta',
    body: 'Le risposte sono state corrette; il video e i materiali sono in attesa di valutazione.',
    tone: 'border-blue-200 bg-blue-50',
  },
  under_review: {
    title: 'In valutazione',
    body: 'Un revisore sta esaminando il tuo video e i materiali allegati.',
    tone: 'border-blue-200 bg-blue-50',
  },
  qualified: {
    title: 'Qualifica ottenuta',
    body: 'Hai superato l’esame finale: sei trainer qualificato del metodo apulia.ai.',
    tone: 'border-emerald-200 bg-emerald-50',
  },
  rejected: {
    title: 'Esame non superato',
    body: 'La consegna non ha superato la valutazione.',
    tone: 'border-amber-200 bg-amber-50',
  },
}

export default function ExamClient() {
  const [state, setState] = useState<ExamState | null>(null)
  const [questions, setQuestions] = useState<ClientQuestion[]>([])
  const [answers, setAnswers] = useState<AnswerState>({})
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [quizDone, setQuizDone] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/trainer/esame')
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(json.error ?? 'Esame non disponibile.')
      return
    }
    setState(json)

    if (!json.quiz_id || json.submission) return

    // Recupera l'eventuale tentativo già aperto o già consegnato: serve per
    // riprendere il flusso se il candidato ricarica la pagina a metà.
    const quizRes = await fetch(`/api/trainer/quiz/${json.quiz_id}`)
    const quiz = await quizRes.json().catch(() => ({}))
    if (!quizRes.ok) return

    if (quiz.open_attempt) {
      setAttemptId(quiz.open_attempt.id)
      setQuestions(quiz.questions ?? [])
      setAnswers(emptyAnswers(quiz.questions ?? []))
      return
    }

    const last = (quiz.attempts?.history ?? []).at(-1) as { id: string } | undefined
    if (last) {
      setAttemptId(last.id)
      setQuizDone(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function startQuiz() {
    if (!state?.quiz_id) return
    setBusy(true)
    setError('')
    const res = await fetch(`/api/trainer/quiz/${state.quiz_id}`, {
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
    setQuestions(json.questions ?? [])
    setAnswers(emptyAnswers(json.questions ?? []))
  }

  async function submitQuiz() {
    if (!state?.quiz_id || !attemptId) return
    setBusy(true)
    setError('')
    const res = await fetch(`/api/trainer/quiz/${state.quiz_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submit',
        attempt_id: attemptId,
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
      setError(json.error ?? 'Consegna non riuscita.')
      return
    }
    setQuizDone(true)
  }

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setBusy(true)
    setError('')
    const data = new FormData()
    data.set('file', file)

    const res = await fetch('/api/trainer/upload', { method: 'POST', body: data })
    const json = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(json.error ?? 'Caricamento non riuscito.')
      return
    }
    setFiles(prev => [...prev, json as UploadedFile])
  }

  async function submitExam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')

    const form = new FormData(event.currentTarget)
    const res = await fetch('/api/trainer/esame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attempt_id: attemptId,
        video_url: String(form.get('video_url') ?? ''),
        notes: String(form.get('notes') ?? ''),
        files,
      }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(json.error ?? 'Consegna non riuscita.')
      return
    }
    await load()
  }

  if (error && !state) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-2xl p-6 text-sm text-red-700">{error}</div>
    )
  }
  if (!state) return <p className="text-sm text-[#475569]">Caricamento…</p>

  // ── Consegna già effettuata ────────────────────────────
  if (state.submission) {
    const copy = STATUS_COPY[state.submission.status]
    return (
      <div className={`border rounded-2xl p-8 ${copy.tone}`}>
        <h2 className="text-xl font-bold mb-3">{copy.title}</h2>
        <p className="text-sm text-[#475569] mb-4">{copy.body}</p>

        <dl className="text-sm space-y-1 mb-4">
          {state.submission.auto_score !== null && (
            <div className="flex gap-2">
              <dt className="text-[#475569]">Punteggio parte chiusa:</dt>
              <dd className="font-semibold">{state.submission.auto_score}%</dd>
            </div>
          )}
          {state.submission.video_url && (
            <div className="flex gap-2">
              <dt className="text-[#475569]">Video:</dt>
              <dd>
                <a
                  href={state.submission.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline break-all"
                >
                  {state.submission.video_url}
                </a>
              </dd>
            </div>
          )}
        </dl>

        {state.submission.review_notes && (
          <p className="text-sm bg-white/70 border border-[#E2E8F0] rounded-xl p-4">
            <strong>Nota del revisore:</strong> {state.submission.review_notes}
          </p>
        )}

        <Link
          href="/trainer/dashboard"
          className="inline-block mt-6 text-sm text-[#2563EB] hover:underline"
        >
          Torna al percorso
        </Link>
      </div>
    )
  }

  // ── Esame ancora bloccato ──────────────────────────────
  if (!state.unlocked) {
    return (
      <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-3">Esame non ancora accessibile</h2>
        <p className="text-sm text-[#475569] mb-6">{state.reason}</p>
        <Link
          href="/trainer/dashboard"
          className="inline-block bg-[#2563EB] text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#1D4ED8] transition-colors"
        >
          Vai ai moduli
        </Link>
      </div>
    )
  }

  // ── Fase 2: video e materiali ──────────────────────────
  if (quizDone) {
    return (
      <form onSubmit={submitExam} className="space-y-6">
        <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-6 text-sm text-[#475569]">
          Domande consegnate. Manca l&apos;ultima parte: il video e i materiali di supporto.
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="video_url">
            Link al video *
          </label>
          <input
            id="video_url"
            name="video_url"
            type="url"
            required
            placeholder="https://youtube.com/watch?v=…"
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
          <p className="text-xs text-[#475569] mt-1.5">
            Carica il video su YouTube o Vimeo come &quot;non in elenco&quot; e incolla qui il link.
            Durata indicativa: 10 minuti di simulazione d&apos;aula sul metodo apulia.ai.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="notes">
            Note per il revisore
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor="attachment">
            Materiali allegati
          </label>
          <input
            id="attachment"
            type="file"
            onChange={upload}
            disabled={busy || files.length >= 10}
            accept=".pdf,.pptx,.docx,.png,.jpg,.jpeg,.zip"
            className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F8FAFC] file:text-[#0F172A] file:border file:border-[#E2E8F0] hover:file:border-[#2563EB]"
          />
          <p className="text-xs text-[#475569] mt-1.5">
            Slide, dispense o esercizi usati nel video. PDF, PPTX, DOCX, PNG, JPG o ZIP, max 50 MB
            per file.
          </p>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map(file => (
                <li
                  key={file.path}
                  className="flex items-center justify-between gap-4 border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles(prev => prev.filter(f => f.path !== file.path))}
                    className="text-[#475569] hover:text-red-600 shrink-0"
                  >
                    Rimuovi
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
        >
          {busy ? 'Invio…' : 'Consegna l’esame'}
        </button>
      </form>
    )
  }

  // ── Fase 1: domande d'esame ────────────────────────────
  if (attemptId && questions.length > 0) {
    return (
      <>
        <QuestionList questions={questions} answers={answers} onChange={setAnswers} disabled={busy} />
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-6">
            {error}
          </p>
        )}
        <button
          onClick={submitQuiz}
          disabled={busy}
          className="mt-8 bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
        >
          {busy ? 'Invio…' : 'Consegna le risposte'}
        </button>
      </>
    )
  }

  // ── Schermata di avvio ─────────────────────────────────
  return (
    <div className="border border-[#E2E8F0] rounded-2xl p-8">
      <h2 className="text-xl font-bold mb-3">Esame di qualifica</h2>
      <p className="text-sm text-[#475569] mb-6">
        L&apos;esame ha due parti: le domande finali sul metodo, corrette automaticamente, e un
        video con i materiali che userai in aula, valutati da un revisore. Hai un solo tentativo:
        una volta aperto non si può ricominciare.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          {error}
        </p>
      )}

      <button
        onClick={startQuiz}
        disabled={busy}
        className="bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
      >
        {busy ? 'Apertura…' : 'Inizia l’esame'}
      </button>
    </div>
  )
}
