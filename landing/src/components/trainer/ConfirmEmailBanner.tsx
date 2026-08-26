'use client'

import { useState } from 'react'

/** Avviso in dashboard finché l'indirizzo email non è stato verificato. */
export default function ConfirmEmailBanner({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function resend() {
    setState('sending')
    const res = await fetch('/api/trainer/conferma', { method: 'POST' })
    setState(res.ok ? 'sent' : 'error')
  }

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-2xl p-6 mb-8">
      <h2 className="font-bold mb-2">Conferma il tuo indirizzo email</h2>
      <p className="text-sm text-[#475569] mb-4">
        Abbiamo inviato un link a <strong>{email}</strong>. Finché non lo apri, la tua
        candidatura non può essere approvata. Controlla anche la cartella spam.
      </p>

      {state === 'sent' ? (
        <p className="text-sm text-emerald-700">Link inviato di nuovo. Controlla la posta.</p>
      ) : (
        <button
          onClick={resend}
          disabled={state === 'sending'}
          className="text-sm font-semibold border border-[#E2E8F0] bg-white px-4 py-2 rounded-full hover:border-[#2563EB] transition-colors disabled:opacity-50"
        >
          {state === 'sending' ? 'Invio…' : 'Inviami di nuovo il link'}
        </button>
      )}

      {state === 'error' && (
        <p className="text-sm text-red-600 mt-2">Invio non riuscito. Riprova tra qualche minuto.</p>
      )}
    </div>
  )
}
