'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

const FIELD =
  'w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'

// Messaggi di ritorno dal link email: il token può essere malformato, già
// speso, scaduto, oppure il database può non aver risposto.
const STATUS_MESSAGES: Record<string, string> = {
  'non-valido': 'Il link di accesso non è valido. Richiedine uno nuovo qui sotto.',
  scaduto:
    'Questo link è scaduto o è già stato usato. Richiedine uno nuovo: arriva in pochi secondi.',
  errore: 'Si è verificato un errore durante l’accesso. Riprova tra qualche secondo.',
}

export default function AccediForm() {
  const params = useSearchParams()
  const next = params.get('next')
  const statusMessage = STATUS_MESSAGES[params.get('stato') ?? '']

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSent('')
    setBusy(true)

    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim().toLowerCase()

    try {
      const res = await fetch('/api/reader/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next }),
      })
      const payload = (await res.json().catch(() => ({}))) as {
        message?: string
        error?: string
      }
      if (!res.ok) {
        setError(payload.error || 'Errore durante la richiesta. Riprova.')
      } else {
        setSent(payload.message || 'Controlla la tua email.')
      }
    } catch {
      setError('Errore di rete. Riprova tra qualche secondo.')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 text-center">
        <h2 className="text-xl font-black text-[#0F172A] mb-3">Controlla la posta</h2>
        <p className="text-[#475569] leading-relaxed">{sent}</p>
        <p className="text-sm text-[#94A3B8] mt-4">
          Il link è valido una sola volta e scade dopo 30 minuti.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {statusMessage && (
        <p className="text-sm text-[#92400E] bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-4 py-3">
          {statusMessage}
        </p>
      )}

      <div>
        <label className="block text-sm font-semibold mb-2" htmlFor="email">
          La tua email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="nome@azienda.it"
          className={FIELD}
        />
        <p className="mt-2 text-sm text-[#475569]">
          Usa l’indirizzo con cui ricevi la newsletter. Ti inviamo un link di
          accesso: nessuna password da ricordare.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full px-6 py-3 rounded-full bg-[#2563EB] text-white font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-60"
      >
        {busy ? 'Invio in corso…' : 'Inviami il link di accesso'}
      </button>

      <p className="text-sm text-[#475569] text-center">
        Non sei ancora iscritto?{' '}
        <Link href="/#subscribe" className="text-[#2563EB] font-semibold hover:underline">
          Iscriviti gratis
        </Link>
      </p>
    </form>
  )
}
