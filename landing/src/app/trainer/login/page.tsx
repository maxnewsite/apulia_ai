'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

const FIELD =
  'w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get('next') || '/trainer/dashboard'

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)

    const data = new FormData(event.currentTarget)
    const { error: signInError } = await supabaseBrowser().auth.signInWithPassword({
      email: String(data.get('email') ?? '').trim().toLowerCase(),
      password: String(data.get('password') ?? ''),
    })

    setBusy(false)

    if (signInError) {
      setError('Email o password non corretti.')
      return
    }

    router.push(next.startsWith('/trainer') ? next : '/trainer/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-2" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className={FIELD} autoComplete="email" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className={FIELD}
          autoComplete="current-password"
        />
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
        {busy ? 'Accesso…' : 'Accedi'}
      </button>

      <div className="flex justify-between text-sm text-[#475569] pt-1">
        <Link href="/trainer/recupera-password" className="hover:text-[#2563EB]">
          Password dimenticata
        </Link>
        <Link href="/trainer/registrati" className="hover:text-[#2563EB]">
          Candidati
        </Link>
      </div>
    </form>
  )
}

export default function TrainerLoginPage() {
  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <h1 className="text-3xl font-black tracking-tight mb-8">Accedi</h1>
      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
