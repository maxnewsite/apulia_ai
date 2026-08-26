'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface TrainerRow {
  id: string
  email: string
  full_name: string
  city: string | null
  phone: string | null
  linkedin_url: string | null
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  modules_passed: number
  exam_status: string | null
}

interface Stats {
  total: number
  pending: number
  approved: number
  rejected: number
  suspended: number
  exams_to_review: number
  qualified: number
}

interface SubmissionFile {
  path: string
  name: string
  url: string | null
}

interface Submission {
  id: string
  status: string
  video_url: string | null
  notes: string | null
  auto_score: number | null
  review_notes: string | null
  created_at: string
  files: SubmissionFile[]
}

interface Detail {
  profile: {
    id: string
    full_name: string
    email: string
    phone: string | null
    city: string | null
    linkedin_url: string | null
    bio: string | null
    motivation: string | null
    status: string
    review_notes: string | null
    created_at: string
  }
  cv_url: string | null
  curriculum: {
    completedModules: number
    totalModules: number
    entries: Array<{
      module: { id: string; position: number; title: string }
      quiz: { id: string; max_attempts: number } | null
      progress: { attempts_used: number; attempts_allowed: number; passed: boolean; best_score: number | null }
      blocked: boolean
    }>
  }
  submissions: Submission[]
  attempts: Attempt[]
  activity: ModuleActivity[]
}

interface ModuleActivity {
  module_id: string
  aperture: number
  materiali_distinti: number
  prima_apertura: string | null
  ultima_apertura: string | null
}

interface Attempt {
  id: string
  quiz_id: string
  attempt_number: number
  status: 'in_progress' | 'submitted' | 'expired'
  score: number | null
  passed: boolean | null
  started_at: string
  submitted_at: string | null
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  suspended: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  qualified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  superato: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function Badge({ value }: { value: string }) {
  return (
    <span
      className={`text-xs font-semibold border rounded-full px-2.5 py-1 whitespace-nowrap ${
        STATUS_STYLE[value] ?? 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]'
      }`}
    >
      {value}
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Tempo impiegato in un tentativo, da apertura a consegna. */
function duration(startIso: string, endIso: string | null): string | null {
  if (!endIso) return null
  const seconds = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000)
  if (seconds < 0) return null
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

export default function AdminTrainersPage() {
  const [rows, setRows] = useState<TrainerRow[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [modulesTotal, setModulesTotal] = useState(0)
  const [filter, setFilter] = useState<'all' | TrainerRow['status']>('pending')
  const [selected, setSelected] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadList = useCallback(async () => {
    const res = await fetch('/api/admin/trainers')
    if (!res.ok) {
      setError('Errore nel caricamento.')
      return
    }
    const json = await res.json()
    setRows(json.trainers)
    setStats(json.stats)
    setModulesTotal(json.modules_total ?? 0)
  }, [])

  const loadDetail = useCallback(async (id: string) => {
    setDetail(null)
    setNotes('')
    const res = await fetch(`/api/admin/trainers/${id}`)
    if (!res.ok) {
      setError('Errore nel caricamento del dossier.')
      return
    }
    setDetail(await res.json())
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList])

  useEffect(() => {
    if (selected) loadDetail(selected)
  }, [selected, loadDetail])

  async function act(payload: Record<string, unknown>) {
    if (!selected) return
    setBusy(true)
    setError('')

    const res = await fetch(`/api/admin/trainers/${selected}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, notes }),
    })
    const json = await res.json().catch(() => ({}))
    setBusy(false)

    if (!res.ok) {
      setError(json.error ?? 'Operazione non riuscita.')
      return
    }
    await Promise.all([loadList(), loadDetail(selected)])
  }

  const visible = filter === 'all' ? rows : rows.filter(r => r.status === filter)

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-black tracking-tight">Trainer Academy</h1>
        <Link href="/admin" className="text-sm text-[#475569] hover:text-[#2563EB]">
          ← Iscritti newsletter
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Da valutare', value: stats.pending },
            { label: 'Approvati', value: stats.approved },
            { label: 'Esami da rivedere', value: stats.exams_to_review },
            { label: 'Qualificati', value: stats.qualified },
          ].map(card => (
            <div key={card.label} className="border border-[#E2E8F0] rounded-xl p-4">
              <div className="text-2xl font-black font-mono">{card.value}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#475569]">
                {card.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {(['pending', 'approved', 'rejected', 'suspended', 'all'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
              filter === key
                ? 'border-[#2563EB] text-[#2563EB] bg-blue-50'
                : 'border-[#E2E8F0] text-[#475569] hover:border-[#94A3B8]'
            }`}
          >
            {key === 'all' ? 'tutti' : key}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
          {error}
        </p>
      )}

      <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] text-[#475569]">
            <tr>
              <th className="text-left font-semibold px-4 py-3">Candidato</th>
              <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Candidatura</th>
              <th className="text-left font-semibold px-4 py-3">Moduli</th>
              <th className="text-left font-semibold px-4 py-3">Stato</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#475569]">
                  Nessun candidato in questo stato.
                </td>
              </tr>
            )}
            {visible.map(row => (
              <tr key={row.id} className="border-t border-[#E2E8F0]">
                <td className="px-4 py-3">
                  <div className="font-semibold">{row.full_name}</div>
                  <div className="text-[#475569] text-xs">{row.email}</div>
                </td>
                <td className="px-4 py-3 text-[#475569] hidden sm:table-cell">
                  {formatDate(row.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 bg-[#F1F5F9] rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full bg-[#2563EB]"
                        style={{
                          width: `${modulesTotal ? (row.modules_passed / modulesTotal) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs whitespace-nowrap">
                      {row.modules_passed}/{modulesTotal}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge value={row.status} />
                    {row.exam_status && <Badge value={row.exam_status} />}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelected(row.id === selected ? null : row.id)}
                    className="text-[#2563EB] font-semibold hover:underline"
                  >
                    {row.id === selected ? 'Chiudi' : 'Apri'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && !detail && <p className="text-sm text-[#475569]">Caricamento dossier…</p>}

      {detail && (
        <section className="border border-[#E2E8F0] rounded-2xl p-6 space-y-8">
          <header>
            <h2 className="text-xl font-bold">{detail.profile.full_name}</h2>
            <p className="text-sm text-[#475569]">
              {detail.profile.email}
              {detail.profile.phone && ` · ${detail.profile.phone}`}
              {detail.profile.city && ` · ${detail.profile.city}`}
            </p>
            <div className="flex flex-wrap gap-3 mt-3 text-sm">
              {detail.cv_url && (
                <a
                  href={detail.cv_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] font-semibold hover:underline"
                >
                  Apri CV
                </a>
              )}
              {detail.profile.linkedin_url && (
                <a
                  href={detail.profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] font-semibold hover:underline"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </header>

          {detail.profile.bio && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                Esperienza
              </h3>
              <p className="text-sm whitespace-pre-wrap">{detail.profile.bio}</p>
            </div>
          )}

          {detail.profile.motivation && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                Motivazione
              </h3>
              <p className="text-sm whitespace-pre-wrap">{detail.profile.motivation}</p>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
              Avanzamento — {detail.curriculum.completedModules}/{detail.curriculum.totalModules}
            </h3>
            <ul className="space-y-2">
              {detail.curriculum.entries.map(entry => {
                const tries = detail.attempts
                  .filter(a => a.quiz_id === entry.quiz?.id)
                  .sort((a, b) => a.attempt_number - b.attempt_number)
                const seen = detail.activity?.find(v => v.module_id === entry.module.id)

                return (
                  <li
                    key={entry.module.id}
                    className="border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#2563EB] w-6">
                        {String(entry.module.position).padStart(2, '0')}
                      </span>
                      <span className="flex-1 min-w-0 truncate">{entry.module.title}</span>
                      <span className="text-[#475569] text-xs whitespace-nowrap">
                        {entry.progress.attempts_used}/{entry.progress.attempts_allowed} tent.
                        {entry.progress.best_score !== null && ` · max ${entry.progress.best_score}%`}
                      </span>
                      {entry.progress.passed ? (
                        <Badge value="superato" />
                      ) : entry.blocked && entry.quiz ? (
                        <button
                          onClick={() =>
                            act({ action: 'grant_attempts', quiz_id: entry.quiz!.id, extra_attempts: 1 })
                          }
                          disabled={busy}
                          className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
                        >
                          +1 tentativo
                        </button>
                      ) : null}
                    </div>

                    <div className="ml-9 mt-2 text-xs text-[#475569]">
                      {seen
                        ? `Materiali: ${seen.aperture} aperture su ${seen.materiali_distinti} risorse · ultima ${formatDate(seen.ultima_apertura!)}`
                        : 'Materiali: mai aperti'}
                    </div>

                    {tries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 ml-9">
                        {tries.map(a => (
                          <span
                            key={a.id}
                            title={
                              a.submitted_at
                                ? `Consegnato il ${new Date(a.submitted_at).toLocaleString('it-IT')}` +
                                  (duration(a.started_at, a.submitted_at)
                                    ? ` · tempo impiegato ${duration(a.started_at, a.submitted_at)}`
                                    : '')
                                : 'Tentativo ancora aperto'
                            }
                            className={`text-xs font-mono border rounded-full px-2 py-0.5 ${
                              a.passed
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : a.status === 'in_progress'
                                  ? 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
                                  : 'border-red-200 bg-red-50 text-red-700'
                            }`}
                          >
                            #{a.attempt_number}{' '}
                            {a.status === 'in_progress' ? 'in corso' : `${a.score ?? 0}%`}
                            {duration(a.started_at, a.submitted_at) && (
                              <span className="opacity-70"> · {duration(a.started_at, a.submitted_at)}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {detail.submissions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
                Esame finale
              </h3>
              {detail.submissions.map(submission => (
                <div key={submission.id} className="border border-[#E2E8F0] rounded-xl p-4 mb-3">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge value={submission.status} />
                    <span className="text-sm text-[#475569]">
                      consegnato il {formatDate(submission.created_at)}
                    </span>
                    {submission.auto_score !== null && (
                      <span className="text-sm font-semibold">
                        parte chiusa: {submission.auto_score}%
                      </span>
                    )}
                  </div>

                  {submission.video_url && (
                    <a
                      href={submission.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#2563EB] hover:underline break-all block mb-2"
                    >
                      {submission.video_url}
                    </a>
                  )}

                  {submission.notes && (
                    <p className="text-sm whitespace-pre-wrap mb-2">{submission.notes}</p>
                  )}

                  {submission.files.length > 0 && (
                    <ul className="text-sm space-y-1 mb-3">
                      {submission.files.map(file => (
                        <li key={file.path}>
                          {file.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#2563EB] hover:underline"
                            >
                              {file.name}
                            </a>
                          ) : (
                            <span className="text-[#475569]">{file.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {submission.review_notes && (
                    <p className="text-sm text-[#475569] bg-[#F8FAFC] rounded-lg p-3">
                      <strong>Revisione:</strong> {submission.review_notes}
                    </p>
                  )}

                  {(submission.status === 'submitted' || submission.status === 'under_review') && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() =>
                          act({ action: 'review_exam', decision: 'qualified', submission_id: submission.id })
                        }
                        disabled={busy}
                        className="text-sm font-semibold bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Qualifica
                      </button>
                      <button
                        onClick={() =>
                          act({ action: 'review_exam', decision: 'rejected', submission_id: submission.id })
                        }
                        disabled={busy}
                        className="text-sm font-semibold border border-red-200 text-red-700 px-4 py-2 rounded-full hover:bg-red-50 disabled:opacity-50"
                      >
                        Respingi
                      </button>
                      {submission.status === 'submitted' && (
                        <button
                          onClick={() =>
                            act({ action: 'review_exam', decision: 'under_review', submission_id: submission.id })
                          }
                          disabled={busy}
                          className="text-sm font-semibold border border-[#E2E8F0] px-4 py-2 rounded-full hover:border-[#2563EB] disabled:opacity-50"
                        >
                          Segna in revisione
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-2">
              Nota del revisore (inclusa nell&apos;email al candidato)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />

            <div className="flex flex-wrap gap-2 mt-4">
              {detail.profile.status !== 'approved' && (
                <button
                  onClick={() => act({ action: 'approve' })}
                  disabled={busy}
                  className="text-sm font-semibold bg-[#2563EB] text-white px-5 py-2.5 rounded-full hover:bg-[#1D4ED8] disabled:opacity-50"
                >
                  Approva candidatura
                </button>
              )}
              {detail.profile.status === 'pending' && (
                <button
                  onClick={() => act({ action: 'reject' })}
                  disabled={busy}
                  className="text-sm font-semibold border border-red-200 text-red-700 px-5 py-2.5 rounded-full hover:bg-red-50 disabled:opacity-50"
                >
                  Respingi
                </button>
              )}
              {detail.profile.status === 'approved' && (
                <button
                  onClick={() => act({ action: 'suspend' })}
                  disabled={busy}
                  className="text-sm font-semibold border border-[#E2E8F0] px-5 py-2.5 rounded-full hover:border-[#2563EB] disabled:opacity-50"
                >
                  Sospendi accesso
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
