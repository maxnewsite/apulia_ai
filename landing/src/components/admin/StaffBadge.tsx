'use client'

import { useEffect, useState } from 'react'

export interface StaffMe {
  email: string
  role: 'admin' | 'coach'
  role_label: string
}

/**
 * Chi sei e con che ruolo, in alto a destra. Con due ruoli sulla stessa
 * console — e un coach che vede meno voci di un admin — "manca un pulsante"
 * e "sono entrato con l'account sbagliato" sono indistinguibili senza questa
 * riga.
 *
 * `onLoad` restituisce l'identità al genitore, che la usa per decidere quali
 * azioni mostrare. Il permesso vero resta lato server.
 */
export default function StaffBadge({ onLoad }: { onLoad?: (me: StaffMe) => void }) {
  const [me, setMe] = useState<StaffMe | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/admin/me')
      .then(r => (r.ok ? r.json() : null))
      .then(json => {
        if (!alive || !json) return
        setMe(json)
        onLoad?.(json)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [onLoad])

  async function signOut() {
    await fetch('/api/admin/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  if (!me) return <div className="h-7 w-40" aria-hidden />

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden sm:inline text-[#475569] truncate max-w-[16rem]" title={me.email}>
        {me.email}
      </span>
      <span
        className={`text-xs font-semibold uppercase tracking-wider border rounded-full px-2.5 py-1 whitespace-nowrap ${
          me.role === 'admin'
            ? 'text-[#2563EB] bg-blue-50 border-blue-200'
            : 'text-violet-700 bg-violet-50 border-violet-200'
        }`}
      >
        {me.role_label}
      </span>
      <button onClick={signOut} className="text-[#475569] hover:text-[#0F172A] font-medium">
        Esci
      </button>
    </div>
  )
}
