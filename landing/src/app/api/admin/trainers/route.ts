import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireCapability } from '@/lib/admin-session'
import { classify, tally, type Cohort } from '@/lib/trainer-cohort'

export const runtime = 'nodejs'

interface ProgressRow {
  trainer_id: string
  quiz_id: string
  attempts_used: number
  passed: boolean
  last_submitted_at: string | null
}

/** Il segno di vita più recente fra due date, ignorando i nulli. */
function latest(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return new Date(a) > new Date(b) ? a : b
}

/**
 * Elenco candidature trainer, avanzamento e coorte di ciascuno.
 * Accessibile anche al coach: leggere l'avanzamento è il suo mestiere.
 */
export async function GET() {
  const { denial } = await requireCapability('review_progress')
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  const [profilesRes, progressRes, examsRes, modulesRes, quizzesRes, grantsRes, activityRes] =
    await Promise.all([
      supabaseAdmin
        .from('trainer_profiles')
        .select('id,email,full_name,city,phone,linkedin_url,status,created_at,reviewed_at,reviewed_by')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('trainer_module_progress')
        .select('trainer_id,quiz_id,attempts_used,passed,last_submitted_at'),
      supabaseAdmin
        .from('trainer_exam_submissions')
        .select('trainer_id,id,status,created_at,video_url,files')
        .order('created_at', { ascending: false }),
      // Denominatore dell'avanzamento: solo i moduli effettivamente pubblicati.
      supabaseAdmin
        .from('trainer_modules')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true),
      // Servono max_attempts per sapere chi ha esaurito i tentativi.
      supabaseAdmin
        .from('trainer_quizzes')
        .select('id,kind,max_attempts')
        .eq('kind', 'module'),
      supabaseAdmin.from('trainer_attempt_grants').select('trainer_id,quiz_id,extra_attempts'),
      // Aperture dei materiali: un trainer può essere attivo senza aver
      // ancora consegnato un quiz, e per la coorte quello conta come vita.
      supabaseAdmin.from('trainer_module_activity').select('trainer_id,ultima_apertura'),
    ])

  if (profilesRes.error) {
    console.error('admin trainers list:', profilesRes.error.message)
    return NextResponse.json({ error: 'Errore nel caricamento.' }, { status: 500 })
  }
  if (activityRes.error)
    console.error('trainer activity non disponibile:', activityRes.error.message)

  const maxAttempts = new Map(
    ((quizzesRes.data ?? []) as { id: string; max_attempts: number }[]).map(q => [
      q.id,
      q.max_attempts,
    ]),
  )
  const extraByKey = new Map(
    ((grantsRes.data ?? []) as { trainer_id: string; quiz_id: string; extra_attempts: number }[]).map(
      g => [`${g.trainer_id}:${g.quiz_id}`, g.extra_attempts],
    ),
  )

  const passedByTrainer = new Map<string, number>()
  const blockedTrainers = new Set<string>()
  const lastActivity = new Map<string, string | null>()

  for (const row of (progressRes.data ?? []) as ProgressRow[]) {
    if (row.passed) {
      passedByTrainer.set(row.trainer_id, (passedByTrainer.get(row.trainer_id) ?? 0) + 1)
    } else {
      const allowed =
        (maxAttempts.get(row.quiz_id) ?? Infinity) +
        (extraByKey.get(`${row.trainer_id}:${row.quiz_id}`) ?? 0)
      if (row.attempts_used >= allowed) blockedTrainers.add(row.trainer_id)
    }
    lastActivity.set(
      row.trainer_id,
      latest(lastActivity.get(row.trainer_id) ?? null, row.last_submitted_at),
    )
  }

  for (const row of (activityRes.data ?? []) as {
    trainer_id: string
    ultima_apertura: string | null
  }[]) {
    lastActivity.set(
      row.trainer_id,
      latest(lastActivity.get(row.trainer_id) ?? null, row.ultima_apertura),
    )
  }

  // La prima occorrenza è la consegna più recente: l'elenco è già ordinato.
  const examByTrainer = new Map<
    string,
    { id: string; status: string; created_at: string; has_video: boolean; files: number }
  >()
  for (const row of (examsRes.data ?? []) as {
    trainer_id: string
    id: string
    status: string
    created_at: string
    video_url: string | null
    files: unknown
  }[]) {
    if (examByTrainer.has(row.trainer_id)) continue
    examByTrainer.set(row.trainer_id, {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      has_video: !!row.video_url,
      files: Array.isArray(row.files) ? row.files.length : 0,
    })
  }

  const now = Date.now()
  const trainers = (profilesRes.data ?? []).map(p => {
    const exam = examByTrainer.get(p.id) ?? null
    const base = {
      ...p,
      modules_passed: passedByTrainer.get(p.id) ?? 0,
      exam_status: exam?.status ?? null,
      exam: exam,
      last_activity_at: lastActivity.get(p.id) ?? null,
      blocked: blockedTrainers.has(p.id),
    }
    return {
      ...base,
      cohort: classify(
        {
          status: p.status as 'pending' | 'approved' | 'rejected' | 'suspended',
          modules_passed: base.modules_passed,
          modules_total: modulesRes.count ?? 0,
          exam_status: base.exam_status,
          last_activity_at: base.last_activity_at,
          blocked: base.blocked,
        },
        now,
      ),
    }
  })

  return NextResponse.json({
    trainers,
    modules_total: modulesRes.count ?? 0,
    cohorts: tally(trainers.map(t => t.cohort as Cohort)),
    stats: {
      total: trainers.length,
      pending: trainers.filter(t => t.status === 'pending').length,
      approved: trainers.filter(t => t.status === 'approved').length,
      rejected: trainers.filter(t => t.status === 'rejected').length,
      suspended: trainers.filter(t => t.status === 'suspended').length,
      exams_to_review: trainers.filter(t => t.cohort === 'esame_da_valutare').length,
      qualified: trainers.filter(t => t.cohort === 'qualificato').length,
    },
  })
}
