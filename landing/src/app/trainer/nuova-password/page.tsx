'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

/**
 * Atterraggio del link di recupero. Il client Supabase scambia da solo il
 * codice presente nell'URL: qui aspettiamo che la sessione di recupero sia
 * pronta prima di accettare la nuova password.
 */
export default function NewPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = supabaseBrowser()

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })

    // Se dopo qualche istante non arriva nessuna sessione, il link è scaduto.
    const timer = setTimeout(() => setReady(prev => (prev === null ? false : prev)), 3000)

    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)

    const password = String(new FormData(event.currentTarget).get('password') ?? '')
    const { error: updateError } = await supabaseBrowser().auth.updateUser({ password })

    setBusy(false)

    if (updateError) {
      setError('Non è stato possibile aggiornare la password. Richiedi un nuovo link.')
      return
    }

    router.push('/trainer/dashboard')
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="text-3xl font-black tracking-tight mb-6">Nuova password</h1>

      {ready === null && <p className="text-sm text-[#475569]">Verifica del link in corso…</p>}

      {ready === false && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          Link scaduto o non valido. Richiedine uno nuovo dalla pagina di recupero.
        </p>
      )}

      {ready === true && (
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="password">
              Nuova password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
            <p className="text-xs text-[#475569] mt-1.5">Almeno 10 caratteri.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
          >
            {busy ? 'Salvataggio…' : 'Imposta password'}
          </button>
        </form>
      )}
    </div>
  )
}
