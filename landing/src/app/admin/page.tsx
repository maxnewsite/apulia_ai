'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Subscriber {
  id: string
  email: string
  preferred_language: string
  products: string[]
  status: string
  source: string
  created_at: string
  confirmed_at: string | null
}

interface Stats {
  total: number
  active: number
  pending: number
  unsubscribed: number
  weeklyOnly: number
  monthlyOnly: number
  both: number
}

type FilterStatus = 'all' | 'active' | 'pending' | 'unsubscribed'
type SortKey = 'created_at' | 'email' | 'status'

const STATUS_COLORS: Record<string, string> = {
  active:       'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  pending:      'bg-amber-900/40  text-amber-300  border-amber-700/50',
  unsubscribed: 'bg-red-900/30    text-red-300    border-red-700/40',
  bounced:      'bg-gray-800      text-gray-400   border-gray-600',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function StatCard({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-[#0D1828] border border-[#E2E8F0] rounded-xl p-5">
      <div className={`text-3xl font-black font-mono tracking-tight mb-1 ${accent ? 'text-[#2563EB]' : 'text-white'}`}>
        {value.toLocaleString('it-IT')}
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest text-[#475569]">{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [sort, setSort] = useState<SortKey>('created_at')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/subscribers')
      if (res.status === 401) { router.push('/admin/login'); return }
      if (!res.ok) throw new Error('Errore nel caricamento')
      const json = await res.json()
      setStats(json.stats)
      setSubscribers(json.subscribers)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const filtered = subscribers
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => !search || s.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'email') return a.email.localeCompare(b.email)
      if (sort === 'status') return a.status.localeCompare(b.status)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      {/* Top bar */}
      <header className="bg-[#071020] border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/apulia_ai.webp" alt="apulia.ai" width={32} height={32} className="rounded-sm" />
          <div>
            <span className="text-sm font-bold text-white">apulia<span className="text-[#2563EB]">.ai</span></span>
            <span className="ml-2 text-xs font-semibold text-[#F59E0B] uppercase tracking-widest">Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-white transition disabled:opacity-50"
            title="Aggiorna"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Aggiorna
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-[#475569] hover:text-red-400 transition"
          >
            Esci
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">Subscribers</h1>
          <p className="text-sm text-[#475569] mt-1">Gestione iscritti apulia.ai</p>
        </div>

        {error && (
          <div role="alert" className="mb-6 bg-red-900/30 border border-red-700/40 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <StatCard label="Totale" value={stats.total} accent />
            <StatCard label="Attivi" value={stats.active} />
            <StatCard label="In attesa" value={stats.pending} />
            <StatCard label="Disiscritti" value={stats.unsubscribed} />
            <StatCard label="Solo Weekly" value={stats.weeklyOnly} />
            <StatCard label="Solo Mensile" value={stats.monthlyOnly} />
            <StatCard label="Entrambi" value={stats.both} />
          </div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Status filter */}
          <div className="flex bg-[#0D1828] border border-[#E2E8F0] rounded-lg p-0.5 gap-0.5">
            {(['all', 'active', 'pending', 'unsubscribed'] as FilterStatus[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition capitalize ${
                  filter === f
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#475569] hover:text-white'
                }`}
              >
                {f === 'all' ? 'Tutti' : f === 'active' ? 'Attivi' : f === 'pending' ? 'In attesa' : 'Disiscritti'}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortKey)}
            className="bg-[#0D1828] border border-[#E2E8F0] text-[#475569] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#2563EB] cursor-pointer"
          >
            <option value="created_at">Data iscrizione ↓</option>
            <option value="email">Email A-Z</option>
            <option value="status">Stato</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#E2E8F0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Cerca email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0D1828] border border-[#E2E8F0] text-white text-xs rounded-lg pl-8 pr-4 py-2 placeholder-[#E2E8F0] focus:outline-none focus:border-[#2563EB] transition"
            />
          </div>

          <span className="text-xs text-[#475569] ml-auto">
            {filtered.length} risultati
          </span>
        </div>

        {/* Table */}
        <div className="bg-[#0D1828] border border-[#E2E8F0] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#475569] text-sm gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Caricamento…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#475569]">
              <svg className="w-10 h-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-sm font-medium">Nessun iscritto trovato</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Email</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Stato</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Prodotti</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Lingua</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Fonte</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Iscritto il</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#475569]">Confermato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]/50">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-[#071020]/60 transition">
                      <td className="px-5 py-3.5 font-mono text-xs text-white whitespace-nowrap">{s.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[s.status] ?? STATUS_COLORS.bounced}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {(s.products ?? []).map(p => (
                            <span key={p} className="px-2 py-0.5 bg-[#E2E8F0]/60 text-[#7BAAE8] rounded text-[10px] font-semibold uppercase tracking-wider">
                              {p === 'monthly' ? 'mensile' : p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#475569] uppercase font-semibold">{s.preferred_language}</td>
                      <td className="px-4 py-3.5 text-xs text-[#475569]">{s.source ?? '—'}</td>
                      <td className="px-4 py-3.5 text-xs text-[#475569] whitespace-nowrap">{formatDate(s.created_at)}</td>
                      <td className="px-4 py-3.5 text-xs text-[#475569] whitespace-nowrap">
                        {s.confirmed_at ? formatDate(s.confirmed_at) : <span className="text-[#E2E8F0]">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Export CSV hint */}
        <p className="text-xs text-[#E2E8F0] mt-4 text-right">
          Per esportare CSV: Supabase Dashboard → Table Editor → subscribers → Export
        </p>
      </main>
    </div>
  )
}
