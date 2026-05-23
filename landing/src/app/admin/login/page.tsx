'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const { error: msg } = await res.json()
        setError(msg ?? 'Accesso negato.')
      }
    } catch {
      setError('Errore di rete. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050A14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Image src="/apulia_ai.webp" alt="apulia.ai" width={40} height={40} className="rounded-sm" />
          <div>
            <div className="text-lg font-bold text-white tracking-tight">
              apulia<span className="text-[#2563EB]">.ai</span>
            </div>
            <div className="text-[10px] font-bold tracking-widest text-[#F59E0B] uppercase">
              Admin
            </div>
          </div>
        </div>

        <div className="bg-[#0D1828] border border-[#1E3A5F] rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-1">Accesso Admin</h1>
          <p className="text-sm text-[#94A3B8] mb-6">Area riservata</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-[#071020] border border-[#1E3A5F] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#1E3A5F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
                placeholder="admin@apulia.ai"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-[#071020] border border-[#1E3A5F] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#1E3A5F] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div role="alert" className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-lg px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Accesso in corso…
                </>
              ) : (
                'Accedi'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
