'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { can, type StaffRole } from '@/lib/staff-roles'
import { COHORT_LABEL, IDLE_DAYS, type Cohort } from '@/lib/trainer-cohort'

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
  exam: { id: string; status: string; created_at: string; has_video: boolean; files: number } | null
  last_activity_at: string | null
  blocked: boolean
  cohort: Cohort
}

/** Filtro attivo: per coorte di avanzamento oppure per stato candidatura. */
type View =
  | { kind: 'cohort'; value: Cohort }
  | { kind: 'status'; value: TrainerRow['status'] }
  | { kind: 'all' }

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
    email_confirmed_at: string | null
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
  audit: AuditEntry[]
}

interface AuditEntry {
  id: string
  actor: string
  action: string
  details: { notes?: string | null; [k: string]: unknown }
  created_at: string
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
  needs_work: 'bg-amber-50 text-amber-700 border-amber-200',
  superato: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const COHORT_STYLE: Record<Cohort, string> = {
  da_valutare: 'bg-amber-50 text-amber-700 border-amber-200',
  non_ammesso: 'bg-red-50 text-red-700 border-red-200',
  sospeso: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
  mai_iniziato: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
  in_corso: 'bg-blue-50 text-blue-700 border-blue-200',
  fermo: 'bg-orange-50 text-orange-700 border-orange-200',
  bloccato: 'bg-red-50 text-red-700 border-red-200',
  esame_da_valutare: 'bg-violet-50 text-violet-700 border-violet-200',
  integrazioni: 'bg-amber-50 text-amber-700 border-amber-200',
  esame_respinto: 'bg-red-50 text-red-700 border-red-200',
  qualificato: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

function CohortBadge({ cohort }: { cohort: Cohort }) {
  return (
    <span
      className={`text-xs font-semibold border rounded-full px-2.5 py-1 whitespace-nowrap ${COHORT_STYLE[cohort]}`}
    >
      {COHORT_LABEL[cohort]}
    </span>
  )
}

/** "3 giorni fa", o "mai" quando non c'è alcuna traccia di attività. */
function sinceLabel(iso: string | null): string {
  if (!iso) return 'mai'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'oggi'
  if (days === 1) return 'ieri'
  if (days < 30) return `${days} giorni fa`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 mese fa' : `${months} mesi fa`
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
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [cohorts, setCohorts] = useState<{ cohort: Cohort; count: number }[]>([])
  const [role, setRole] = useState<StaffRole | null>(null)
  const [view, setView] = useState<View>({ kind: 'cohort', value: 'esame_da_valutare' })
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
    setCohorts(json.cohorts ?? [])
    setModulesTotal(json.modules_total ?? 0)
  }, [])

  // Il ruolo decide quali azioni mostrare. È solo presentazione: ogni azione
  // è ri-autorizzata lato server, dove il coach viene respinto comunque.
  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => (r.ok ? r.json() : null))
      .then(json => json && setRole(json.role))
      .catch(() => {})
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

    // Dopo la cancellazione il dossier non esiste più: ricaricarlo darebbe
    // un 404 e un messaggio d'errore fuorviante su un'operazione riuscita.
    if (payload.action === 'delete_data') {
      await loadList()
      return
    }

    await Promise.all([loadList(), loadDetail(selected)])
  }

  const visible =
    view.kind === 'all'
      ? rows
      : view.kind === 'cohort'
        ? rows.filter(r => r.cohort === view.value)
        : rows.filter(r => r.status === view.value)

  const isAdmin = role === 'admin'
  const mayReviewApplications = role !== null && can(role, 'review_applications')
  const mayDelete = role !== null && can(role, 'delete_trainer_data')

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-black tracking-tight">Trainer Academy</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {isAdmin && (
            <>
              <Link href="/admin" className="text-[#475569] hover:text-[#2563EB]">
                ← Iscritti newsletter
              </Link>
              <Link href="/admin/staff" className="text-[#475569] hover:text-[#2563EB]">
                Staff
              </Link>
            </>
          )}
          <Link
            href="/admin/trainer/quiz"
            className="font-semibold text-[#2563EB] border border-[#2563EB]/30 rounded-full px-4 py-1.5 hover:bg-[#2563EB]/10 transition-colors"
          >
            Anteprima quiz →
          </Link>
          <Link href="/trainer" className="text-[#475569] hover:text-[#2563EB]">
            Area trainer →
          </Link>
        </div>
      </div>

      {/* Come va la classe. Il filtro per stato della candidatura risponde a
          "chi devo ancora ammettere"; questo risponde a "chi si è fermato",
          "chi aspetta una mia valutazione", "chi ha finito" — che è il
          lavoro di tutti i giorni. Ogni riquadro è anche un filtro. */}
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
        Come vanno i trainer
      </h2>
      {cohorts.length === 0 ? (
        <p className="text-sm text-[#475569] border border-[#E2E8F0] rounded-xl p-4 mb-8">
          Nessun candidato registrato.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {cohorts.map(({ cohort, count }) => {
            const active = view.kind === 'cohort' && view.value === cohort
            return (
              <button
                key={cohort}
                onClick={() => setView({ kind: 'cohort', value: cohort })}
                className={`text-left border rounded-xl p-4 transition-colors ${
                  active
                    ? 'border-[#2563EB] bg-blue-50'
                    : 'border-[#E2E8F0] hover:border-[#94A3B8]'
                }`}
              >
                <div className="text-2xl font-black font-mono">{count}</div>
                <div className="text-xs font-semibold text-[#475569] leading-snug mt-0.5">
                  {COHORT_LABEL[cohort]}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#475569] mr-1">
          Candidatura
        </span>
        {(['pending', 'approved', 'rejected', 'suspended'] as const).map(key => (
          <button
            key={key}
            onClick={() => setView({ kind: 'status', value: key })}
            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
              view.kind === 'status' && view.value === key
                ? 'border-[#2563EB] text-[#2563EB] bg-blue-50'
                : 'border-[#E2E8F0] text-[#475569] hover:border-[#94A3B8]'
            }`}
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => setView({ kind: 'all' })}
          className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors ${
            view.kind === 'all'
              ? 'border-[#2563EB] text-[#2563EB] bg-blue-50'
              : 'border-[#E2E8F0] text-[#475569] hover:border-[#94A3B8]'
          }`}
        >
          tutti
        </button>
        {stats && (
          <span className="text-xs text-[#475569] ml-auto">
            {visible.length} di {stats.total}
          </span>
        )}
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
              <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">
                Ultima attività
              </th>
              <th className="text-left font-semibold px-4 py-3">Stato</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#475569]">
                  Nessun trainer in questo gruppo.
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
                <td className="px-4 py-3 text-[#475569] hidden md:table-cell">
                  <span
                    className={
                      row.cohort === 'fermo' ? 'text-orange-700 font-semibold' : undefined
                    }
                    title={
                      row.last_activity_at
                        ? new Date(row.last_activity_at).toLocaleString('it-IT')
                        : 'Nessun quiz consegnato e nessun materiale aperto'
                    }
                  >
                    {sinceLabel(row.last_activity_at)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    <CohortBadge cohort={row.cohort} />
                    {row.exam && (
                      <span
                        className="text-xs text-[#475569] whitespace-nowrap"
                        title={`Consegna del ${formatDate(row.exam.created_at)}`}
                      >
                        {row.exam.has_video ? '🎬' : '—'} {row.exam.files} allegati
                      </span>
                    )}
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
            <p className="text-sm mt-1">
              {detail.profile.email_confirmed_at ? (
                <span className="text-emerald-700">
                  ✓ Email verificata il {formatDate(detail.profile.email_confirmed_at)}
                </span>
              ) : (
                <span className="text-amber-700">
                  ⚠ Email non ancora verificata — l’approvazione resta bloccata
                </span>
              )}
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

                  {['submitted', 'under_review', 'needs_work'].includes(submission.status) && (
                    <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
                      <p className="text-xs text-[#475569] mb-2">
                        La nota del revisore qui sotto viene inclusa nell&apos;email al candidato
                        {submission.status !== 'needs_work' &&
                          ' — è obbligatoria per chiedere integrazioni'}
                        .
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            act({ action: 'review_exam', decision: 'qualified', submission_id: submission.id })
                          }
                          disabled={busy}
                          className="text-sm font-semibold bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Certifica trainer
                        </button>
                        {/* Riapre la consegna al candidato: è l'unico esito che
                            gli restituisce la palla, e senza una nota che dica
                            cosa integrare non serve a niente. */}
                        <button
                          onClick={() =>
                            act({ action: 'review_exam', decision: 'needs_work', submission_id: submission.id })
                          }
                          disabled={busy || !notes.trim()}
                          title={
                            notes.trim()
                              ? undefined
                              : 'Scrivi nella nota che cosa deve integrare il candidato'
                          }
                          className="text-sm font-semibold border border-amber-300 text-amber-800 bg-amber-50 px-4 py-2 rounded-full hover:bg-amber-100 disabled:opacity-50"
                        >
                          Chiedi integrazioni
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
                            Prendi in carico
                          </button>
                        )}
                      </div>
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
              {!mayReviewApplications && (
                <p className="text-sm text-[#475569] border border-[#E2E8F0] rounded-xl px-4 py-3">
                  Come coach puoi valutare avanzamento ed esami, ma non ammettere o respingere
                  candidature: quelle restano all&apos;admin.
                </p>
              )}
              {mayReviewApplications && detail.profile.status !== 'approved' && (
                <button
                  onClick={() => act({ action: 'approve' })}
                  disabled={busy}
                  className="text-sm font-semibold bg-[#2563EB] text-white px-5 py-2.5 rounded-full hover:bg-[#1D4ED8] disabled:opacity-50"
                >
                  Approva candidatura
                </button>
              )}
              {mayReviewApplications && detail.profile.status === 'pending' && (
                <button
                  onClick={() => act({ action: 'reject' })}
                  disabled={busy}
                  className="text-sm font-semibold border border-red-200 text-red-700 px-5 py-2.5 rounded-full hover:bg-red-50 disabled:opacity-50"
                >
                  Respingi
                </button>
              )}
              {mayReviewApplications && detail.profile.status === 'approved' && (
                <button
                  onClick={() => act({ action: 'suspend' })}
                  disabled={busy}
                  className="text-sm font-semibold border border-[#E2E8F0] px-5 py-2.5 rounded-full hover:border-[#2563EB] disabled:opacity-50"
                >
                  Sospendi accesso
                </button>
              )}
            </div>

            {/* Cancellazione: irreversibile, quindi in due passaggi e in
                fondo, lontano dai pulsanti che si usano tutti i giorni. */}
            {mayDelete && (
            <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
              {confirmDelete === detail.profile.id ? (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-red-700">
                    Cancellare definitivamente profilo, CV, tentativi e consegne di{' '}
                    <strong>{detail.profile.full_name}</strong>?
                  </span>
                  <button
                    onClick={async () => {
                      await act({ action: 'delete_data' })
                      setConfirmDelete(null)
                      setSelected(null)
                      setDetail(null)
                    }}
                    disabled={busy}
                    className="text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 disabled:opacity-50"
                  >
                    Sì, cancella tutto
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="text-sm font-semibold border border-[#E2E8F0] px-4 py-2 rounded-full"
                  >
                    Annulla
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(detail.profile.id)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Cancella tutti i dati di questo candidato (GDPR)
                </button>
              )}
            </div>
            )}
          </div>

          {detail.audit?.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#475569] mb-3">
                Registro delle azioni
              </h3>
              <ul className="text-sm space-y-1.5">
                {detail.audit.map(a => (
                  <li key={a.id} className="flex flex-wrap gap-2 text-[#475569]">
                    <span className="font-mono text-xs">
                      {new Date(a.created_at).toLocaleString('it-IT')}
                    </span>
                    <span className="font-semibold text-[#0F172A]">{a.action}</span>
                    <span>di {a.actor}</span>
                    {a.details?.notes && <span className="italic">«{a.details.notes}»</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
