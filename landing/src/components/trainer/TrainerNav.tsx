'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'

/**
 * Navigazione dell'area trainer. Mostra i link del percorso solo a sessione
 * attiva; il gating reale resta lato server (proxy + RLS).
 */
export default function TrainerNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [email, setEmail] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user)
      setEmail(data.user?.email ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user)
      setEmail(session?.user?.email ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabaseBrowser().auth.signOut()
    router.push('/trainer/login')
    router.refresh()
  }

  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`text-sm font-medium transition-colors ${
        pathname === href ? 'text-[#2563EB]' : 'text-[#475569] hover:text-[#0F172A]'
      }`}
    >
      {label}
    </Link>
  )

  if (signedIn === null) return <div className="h-5 w-32" aria-hidden />

  return (
    <nav className="flex items-center gap-5">
      {signedIn ? (
        <>
          {link('/trainer/dashboard', 'Percorso')}
          {link('/trainer/esame', 'Esame')}
          {/* Chi sei e con che ruolo: la stessa riga che la console mostra ad
              admin e coach, così l'identità è leggibile ovunque. */}
          {email && (
            <span
              className="hidden sm:inline text-sm text-[#475569] truncate max-w-[14rem]"
              title={email}
            >
              {email}
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wider border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] rounded-full px-2.5 py-1">
            Trainer
          </span>
          <button
            onClick={signOut}
            className="text-sm font-medium text-[#475569] hover:text-[#0F172A]"
          >
            Esci
          </button>
        </>
      ) : (
        <>
          {pathname !== '/trainer/login' && link('/trainer/login', 'Accedi')}
          {/* Sulla pagina di candidatura questa CTA punterebbe a se stessa:
              un click che non fa nulla, per giunta accanto a un modulo il cui
              pulsante di invio si chiama quasi allo stesso modo. */}
          {pathname !== '/trainer/registrati' && (
            <Link
              href="/trainer/registrati"
              className="text-sm font-semibold bg-[#2563EB] text-white px-4 py-2 rounded-full hover:bg-[#1D4ED8] transition-colors"
            >
              Candidati
            </Link>
          )}
        </>
      )}
    </nav>
  )
}
