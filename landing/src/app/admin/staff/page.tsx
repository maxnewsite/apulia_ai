'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface StaffRow {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'coach'
  is_active: boolean
  created_by: string | null
  last_login_at: string | null
  created_at: string
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Gestione degli account di staff. Solo admin: il proxy tiene i coach fuori
 * da questo percorso e l'API ripete il controllo.
 */
export default function AdminStaffPage() {
  const [rows, setRows] = useState<StaffRow[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resetting, setResetting] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/staff')
    if (!res.ok) {
      setError('Errore nel caricamento.')
      return
    }
    const json = await res.json()
    setRows(json.staff ?? [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function act(payload: Record<string, unknown>): Promise<boolean> {
    setBusy(true)
    setError('')
    setNotice('')
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(json.error ?? 'Operazione non riuscita.')
      return false
    }
    await load()
    return true
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    const ok = await act({
      action: 'create',
      email: String(data.get('email') ?? ''),
      full_name: String(data.get('full_name') ?? ''),
      role: String(data.get('role') ?? 'coach'),
      password: String(data.get('password') ?? ''),
    })

    if (ok) {
      form.reset()
      setNotice(
        'Account creato. Comunica tu la password all’interessato: non viene inviata via email.',
      )
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()
    const form = event.currentTarget
    const password = String(new FormData(form).get('password') ?? '')
    const ok = await act({ action: 'set_password', id, password })
    if (ok) {
      form.reset()
      setResetting(null)
      setNotice('Password aggiornata.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-black tracking-tight">Staff della console</h1>
        <Link href="/admin/trainer" className="text-sm text-[#475569] hover:text-[#2563EB]">
          ← Trainer Academy
        </Link>
      </div>

      <p className="text-sm text-[#475569] mb-8 max-w-2xl">
        Un <strong>coach</strong> vede l&apos;avanzamento dei trainer ammessi, ne valuta gli esami
        finali e può concedere tentativi extra. Non ammette e non respinge candidature, non sospende
        accessi, non cancella dati e non vede gli iscritti alla newsletter. Un{' '}
        <strong>admin</strong> può tutto, questa pagina compresa.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          {error}
        </p>
      )}
      {notice && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
          {notice}
        </p>
      )}

      <form onSubmit={create} className="border border-[#E2E8F0] rounded-2xl p-6 mb-10">
        <h2 className="font-bold mb-4">Nuovo account</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm">
            <span className="block font-semibold mb-1.5">Email *</span>
            <input
              name="email"
              type="email"
              required
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </label>
          <label className="text-sm">
            <span className="block font-semibold mb-1.5">Nome e cognome</span>
            <input
              name="full_name"
              type="text"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
            />
          </label>
          <label className="text-sm">
            <span className="block font-semibold mb-1.5">Ruolo</span>
            <select
              name="role"
              defaultValue="coach"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
            >
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="block font-semibold mb-1.5">Password provvisoria *</span>
            <input
              name="password"
              type="text"
              required
              minLength={12}
              autoComplete="off"
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB]"
            />
            <span className="block text-xs text-[#475569] mt-1">
              Almeno 12 caratteri, con lettere e cifre.
            </span>
          </label>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="mt-5 text-sm font-semibold bg-[#2563EB] text-white px-5 py-2.5 rounded-full hover:bg-[#1D4ED8] disabled:opacity-50"
        >
          {busy ? 'Creazione…' : 'Crea account'}
        </button>
      </form>

      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
        Account esistenti
      </h2>

      {rows.length === 0 ? (
        <p className="text-sm text-[#475569] border border-[#E2E8F0] rounded-xl p-6">
          Nessun account di staff. L&apos;admin delle variabili d&apos;ambiente resta valido e non
          compare qui.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map(row => (
            <li key={row.id} className="border border-[#E2E8F0] rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex-1 min-w-[14rem]">
                  <span className="block font-semibold">{row.full_name ?? row.email}</span>
                  {row.full_name && (
                    <span className="block text-xs text-[#475569]">{row.email}</span>
                  )}
                  <span className="block text-xs text-[#475569] mt-1">
                    creato il {formatDate(row.created_at)}
                    {row.created_by && ` da ${row.created_by}`} · ultimo accesso{' '}
                    {formatDate(row.last_login_at)}
                  </span>
                </span>

                <span
                  className={`text-xs font-semibold uppercase tracking-wider border rounded-full px-2.5 py-1 ${
                    row.role === 'admin'
                      ? 'text-[#2563EB] bg-blue-50 border-blue-200'
                      : 'text-violet-700 bg-violet-50 border-violet-200'
                  }`}
                >
                  {row.role}
                </span>
                <span
                  className={`text-xs font-semibold border rounded-full px-2.5 py-1 ${
                    row.is_active
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  {row.is_active ? 'attivo' : 'disattivato'}
                </span>

                <button
                  onClick={() => act({ action: 'set_active', id: row.id, is_active: !row.is_active })}
                  disabled={busy}
                  className="text-sm font-semibold text-[#475569] hover:text-[#2563EB] disabled:opacity-50"
                >
                  {row.is_active ? 'Disattiva' : 'Riattiva'}
                </button>
                <button
                  onClick={() => setResetting(resetting === row.id ? null : row.id)}
                  className="text-sm font-semibold text-[#475569] hover:text-[#2563EB]"
                >
                  Password
                </button>
              </div>

              {resetting === row.id && (
                <form
                  onSubmit={e => resetPassword(e, row.id)}
                  className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#E2E8F0]"
                >
                  <input
                    name="password"
                    type="text"
                    required
                    minLength={12}
                    autoComplete="off"
                    placeholder="Nuova password provvisoria"
                    className="flex-1 min-w-[16rem] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#2563EB]"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="text-sm font-semibold bg-[#2563EB] text-white px-4 py-2 rounded-full hover:bg-[#1D4ED8] disabled:opacity-50"
                  >
                    Imposta
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
