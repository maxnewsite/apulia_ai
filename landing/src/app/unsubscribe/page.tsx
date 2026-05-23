'use client'

import { useState } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')

    if (!isValidEmail(email)) {
      setErrorMessage('Inserisci un indirizzo email valido.')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMessage(
          (data as { error?: string }).error ||
            'Qualcosa è andato storto. Riprova tra qualche secondo.'
        )
        setStatus('error')
      }
    } catch {
      setErrorMessage(
        'Impossibile completare la richiesta. Controlla la connessione e riprova.'
      )
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#050A14] text-[#F0F4FF] flex flex-col">
      <header className="border-b border-[#1E3A5F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link
            href="/"
            className="text-xl font-black text-[#F0F4FF] hover:text-[#2563EB] transition-colors"
          >
            apulia.ai
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="w-full max-w-md">
          {status === 'success' ? (
            <div
              className="bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl p-10 text-center"
              role="status"
              aria-live="polite"
            >
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1E3A5F] mb-6 mx-auto"
                aria-hidden="true"
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 16l8 8L26 8"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-[#F0F4FF] mb-3">
                Disiscrizione completata
              </h1>
              <p className="text-[#94A3B8] mb-8">
                Il tuo indirizzo email è stato rimosso dalla nostra lista. Non
                riceverai più comunicazioni da apulia.ai. Se cambi idea, puoi
                iscriverti nuovamente dalla home page.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1d4ed8] transition-colors text-sm"
              >
                Torna alla home
              </Link>
            </div>
          ) : (
            <div className="bg-[#0F1A2E] border border-[#1E3A5F] rounded-2xl p-10">
              <h1 className="text-2xl font-black text-[#F0F4FF] mb-2">
                Cancella iscrizione
              </h1>
              <p className="text-[#94A3B8] text-sm mb-8">
                Inserisci il tuo indirizzo email per rimuoverti dalla newsletter
                apulia.ai. Ci dispiace vederti andare.
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-5">
                  <label
                    htmlFor="unsubscribe-email"
                    className="block text-sm font-medium text-[#F0F4FF] mb-2"
                  >
                    Indirizzo email
                  </label>
                  <input
                    id="unsubscribe-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value)
                      if (status === 'error') {
                        setStatus('idle')
                        setErrorMessage('')
                      }
                    }}
                    placeholder="la.tua@email.it"
                    className="w-full px-4 py-3 bg-[#050A14] border border-[#1E3A5F] rounded-xl text-[#F0F4FF] placeholder-[#94A3B8] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-colors"
                    aria-describedby={
                      errorMessage ? 'unsubscribe-error' : undefined
                    }
                    aria-invalid={errorMessage ? 'true' : 'false'}
                    disabled={status === 'loading'}
                  />
                  {errorMessage && (
                    <p
                      id="unsubscribe-error"
                      role="alert"
                      className="mt-2 text-xs text-red-400"
                    >
                      {errorMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="w-full py-3 px-6 bg-[#2563EB] text-white font-semibold rounded-xl text-sm hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 focus:ring-offset-[#0F1A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-live="polite"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Elaborazione in corso...
                    </span>
                  ) : (
                    'Cancella iscrizione'
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-[#94A3B8]">
                Preferisci farlo via email?{' '}
                <a
                  href="mailto:privacy@apulia.ai?subject=Disiscrizione%20newsletter"
                  className="text-[#2563EB] hover:text-[#F59E0B] transition-colors underline"
                >
                  Scrivici a privacy@apulia.ai
                </a>
              </p>
            </div>
          )}

          <p className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-[#94A3B8] hover:text-[#F0F4FF] transition-colors"
            >
              &larr; Torna alla home
            </Link>
          </p>
        </div>
      </main>

      <footer className="border-t border-[#1E3A5F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-center">
          <span className="text-[#94A3B8] text-xs">
            &copy; 2026 apulia.ai —{' '}
            <Link
              href="/privacy"
              className="hover:text-[#F0F4FF] transition-colors underline"
            >
              Privacy Policy
            </Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
