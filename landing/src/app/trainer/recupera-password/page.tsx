'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

export default function RecoverPasswordPage() {
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)

    const email = String(new FormData(event.currentTarget).get('email') ?? '')
      .trim()
      .toLowerCase()

    await supabaseBrowser().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/trainer/nuova-password`,
    })

    // Nessuna distinzione tra email esistente e non: non riveliamo
    // quali indirizzi sono registrati.
    setBusy(false)
    setSent(true)
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="text-3xl font-black tracking-tight mb-4">Recupera password</h1>

      {sent ? (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6">
          <p className="text-sm text-[#475569]">
            Se l&apos;indirizzo è registrato, riceverai un link per impostare una nuova password.
            Controlla anche la cartella spam.
          </p>
          <Link href="/trainer/login" className="text-sm text-[#2563EB] hover:underline mt-4 inline-block">
            Torna all&apos;accesso
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <p className="text-[#475569] text-sm">
            Inserisci l&apos;email della candidatura: ti inviamo un link per reimpostare la password.
          </p>
          <input
            name="email"
            type="email"
            required
            placeholder="tu@esempio.it"
            className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {busy ? 'Invio…' : 'Invia il link'}
          </button>
        </form>
      )}
    </div>
  )
}
