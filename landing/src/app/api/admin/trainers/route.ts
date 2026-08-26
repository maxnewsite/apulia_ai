import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

/** Elenco candidature trainer + contatori. Protetto dal proxy admin. */
export async function GET() {
  const [profilesRes, progressRes, examsRes, modulesRes] = await Promise.all([
    supabaseAdmin
      .from('trainer_profiles')
      .select('id,email,full_name,city,phone,linkedin_url,status,created_at,reviewed_at,reviewed_by')
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('trainer_module_progress').select('trainer_id,passed'),
    supabaseAdmin
      .from('trainer_exam_submissions')
      .select('trainer_id,status,created_at')
      .order('created_at', { ascending: false }),
    // Denominatore dell'avanzamento: solo i moduli effettivamente pubblicati.
    supabaseAdmin
      .from('trainer_modules')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true),
  ])

  if (profilesRes.error) {
    console.error('admin trainers list:', profilesRes.error.message)
    return NextResponse.json({ error: 'Errore nel caricamento.' }, { status: 500 })
  }

  const passedByTrainer = new Map<string, number>()
  for (const row of (progressRes.data ?? []) as { trainer_id: string; passed: boolean }[]) {
    if (row.passed) passedByTrainer.set(row.trainer_id, (passedByTrainer.get(row.trainer_id) ?? 0) + 1)
  }

  // La prima occorrenza è la consegna più recente: l'elenco è già ordinato.
  const examByTrainer = new Map<string, string>()
  for (const row of (examsRes.data ?? []) as { trainer_id: string; status: string }[]) {
    if (!examByTrainer.has(row.trainer_id)) examByTrainer.set(row.trainer_id, row.status)
  }

  const trainers = (profilesRes.data ?? []).map(p => ({
    ...p,
    modules_passed: passedByTrainer.get(p.id) ?? 0,
    exam_status: examByTrainer.get(p.id) ?? null,
  }))

  return NextResponse.json({
    trainers,
    modules_total: modulesRes.count ?? 0,
    stats: {
      total: trainers.length,
      pending: trainers.filter(t => t.status === 'pending').length,
      approved: trainers.filter(t => t.status === 'approved').length,
      rejected: trainers.filter(t => t.status === 'rejected').length,
      suspended: trainers.filter(t => t.status === 'suspended').length,
      exams_to_review: trainers.filter(
        t => t.exam_status === 'submitted' || t.exam_status === 'under_review',
      ).length,
      qualified: trainers.filter(t => t.exam_status === 'qualified').length,
    },
  })
}
