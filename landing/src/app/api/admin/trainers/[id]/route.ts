import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { COOKIE_NAME, verifyAdminToken } from '@/lib/auth'
import { getCurriculum, getTrainerProfile } from '@/lib/trainer'
import { sendEmail } from '@/lib/zepto'
import {
  applicationApprovedEmail,
  applicationRejectedEmail,
  examResultEmail,
} from '@/lib/trainer-emails'

export const runtime = 'nodejs'

const SIGNED_URL_SECONDS = 600

async function adminEmail(): Promise<string> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return 'admin'
  return (await verifyAdminToken(token))?.email ?? 'admin'
}

// ────────────────────────────────────────────────────────────
// GET — dossier completo del candidato
// ────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  const profile = await getTrainerProfile(id)
  if (!profile) return NextResponse.json({ error: 'Trainer non trovato.' }, { status: 404 })

  const [curriculum, examRes, grantsRes, attemptsRes, activityRes, auditRes] = await Promise.all([
    getCurriculum(id),
    supabaseAdmin
      .from('trainer_exam_submissions')
      .select('*')
      .eq('trainer_id', id)
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('trainer_attempt_grants').select('quiz_id,extra_attempts,reason').eq('trainer_id', id),
    // Storico completo dei tentativi: il riepilogo per modulo dice solo il
    // miglior punteggio, qui si vede come ci è arrivato.
    supabaseAdmin
      .from('trainer_quiz_attempts')
      .select('id,quiz_id,attempt_number,status,score,passed,started_at,submitted_at')
      .eq('trainer_id', id)
      .order('submitted_at', { ascending: true, nullsFirst: false }),
    // Attività sui materiali. Se schema_trainer_activity.sql non è ancora
    // stato applicato la query fallisce: si degrada a elenco vuoto invece di
    // far fallire l'intero dossier.
    supabaseAdmin
      .from('trainer_module_activity')
      .select('module_id,aperture,materiali_distinti,prima_apertura,ultima_apertura')
      .eq('trainer_id', id),
    supabaseAdmin
      .from('trainer_admin_actions')
      .select('id,actor,action,details,created_at')
      .eq('trainer_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (activityRes.error)
    console.error('trainer activity non disponibile:', activityRes.error.message)

  let cvUrl: string | null = null
  if (profile.cv_path) {
    const { data } = await supabaseAdmin.storage
      .from('trainer-cv')
      .createSignedUrl(profile.cv_path, SIGNED_URL_SECONDS)
    cvUrl = data?.signedUrl ?? null
  }

  // Link firmati per gli allegati dell'esame più recente.
  const submissions = (examRes.data ?? []) as Array<{
    files: { path: string; name: string }[]
    [key: string]: unknown
  }>

  for (const submission of submissions) {
    const files = Array.isArray(submission.files) ? submission.files : []
    submission.files = await Promise.all(
      files.map(async f => {
        const { data } = await supabaseAdmin.storage
          .from('trainer-submissions')
          .createSignedUrl(f.path, SIGNED_URL_SECONDS)
        return { ...f, url: data?.signedUrl ?? null }
      }),
    )
  }

  return NextResponse.json({
    profile,
    cv_url: cvUrl,
    curriculum,
    submissions,
    grants: grantsRes.data ?? [],
    attempts: attemptsRes.data ?? [],
    activity: activityRes.data ?? [],
    audit: auditRes.data ?? [],
  })
}

// ────────────────────────────────────────────────────────────
// POST — azioni del revisore
// ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params

  const profile = await getTrainerProfile(id)
  if (!profile) return NextResponse.json({ error: 'Trainer non trovato.' }, { status: 404 })

  let body: {
    action?: string
    notes?: string
    quiz_id?: string
    extra_attempts?: number
    submission_id?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
  }

  const reviewer = await adminEmail()
  const notes = (body.notes ?? '').trim() || null
  const now = new Date().toISOString()

  /** Registro in append delle azioni: reviewed_by sul profilo viene sovrascritto. */
  const audit = async (action: string, details: Record<string, unknown> = {}) => {
    const { error } = await supabaseAdmin.from('trainer_admin_actions').insert({
      trainer_id: id,
      trainer_email: profile.email,
      actor: reviewer,
      action,
      details: { ...details, notes },
    })
    // Il registro non deve impedire l'azione: se manca la tabella si logga.
    if (error) console.error('audit trail non disponibile:', error.message)
  }

  const setStatus = async (status: string) => {
    const { error } = await supabaseAdmin
      .from('trainer_profiles')
      .update({ status, reviewed_by: reviewer, reviewed_at: now, review_notes: notes })
      .eq('id', id)
    if (error) throw new Error(error.message)
  }

  try {
    switch (body.action) {
      case 'approve': {
        // Nessuna approvazione senza indirizzo verificato: altrimenti si
        // ammette qualcuno che potrebbe essersi candidato con l'email
        // di un'altra persona.
        if (!profile.email_confirmed_at) {
          return NextResponse.json(
            { error: 'Il candidato non ha ancora confermato il proprio indirizzo email.' },
            { status: 409 },
          )
        }
        await setStatus('approved')
        await audit('approve')
        const { subject, html } = applicationApprovedEmail(profile.full_name)
        const sent = await sendEmail({ to: profile.email, subject, html })
        if (!sent.ok) console.error('approval email failed:', sent.status, sent.error)
        return NextResponse.json({ ok: true, status: 'approved' })
      }

      case 'reject': {
        await setStatus('rejected')
        await audit('reject')
        const { subject, html } = applicationRejectedEmail(profile.full_name, notes)
        const sent = await sendEmail({ to: profile.email, subject, html })
        if (!sent.ok) console.error('rejection email failed:', sent.status, sent.error)
        return NextResponse.json({ ok: true, status: 'rejected' })
      }

      case 'suspend':
        await setStatus('suspended')
        await audit('suspend')
        return NextResponse.json({ ok: true, status: 'suspended' })

      case 'reactivate':
        await setStatus('approved')
        await audit('reactivate')
        return NextResponse.json({ ok: true, status: 'approved' })

      // Cancellazione completa: diritto all'oblio. Irreversibile.
      case 'delete_data': {
        const removals: string[] = []

        if (profile.cv_path) {
          const { error } = await supabaseAdmin.storage.from('trainer-cv').remove([profile.cv_path])
          if (error) console.error('rimozione CV fallita:', error.message)
          else removals.push('cv')
        }

        // Allegati d'esame: stanno in un bucket diverso e non cadono con
        // la riga di database, vanno rimossi esplicitamente.
        const { data: subs } = await supabaseAdmin
          .from('trainer_exam_submissions')
          .select('files')
          .eq('trainer_id', id)

        const paths = (subs ?? [])
          .flatMap(s => (Array.isArray(s.files) ? (s.files as { path?: string }[]) : []))
          .map(f => f?.path)
          .filter((p): p is string => typeof p === 'string')

        if (paths.length > 0) {
          const { error } = await supabaseAdmin.storage.from('trainer-submissions').remove(paths)
          if (error) console.error('rimozione allegati fallita:', error.message)
          else removals.push(`${paths.length} allegati`)
        }

        // L'audit va scritto PRIMA della cancellazione: dopo, il profilo
        // non esiste più e la riga perderebbe il riferimento.
        await audit('delete_data', { removed: removals })

        const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(id)
        if (delError) throw new Error(delError.message)

        return NextResponse.json({ ok: true, deleted: true, removed: removals })
      }

      case 'grant_attempts': {
        if (!body.quiz_id)
          return NextResponse.json({ error: 'Quiz non specificato.' }, { status: 422 })

        const extra = Math.min(Math.max(Number(body.extra_attempts ?? 1), 1), 5)

        // Il grant è cumulativo: una seconda concessione somma i tentativi.
        const { data: current } = await supabaseAdmin
          .from('trainer_attempt_grants')
          .select('extra_attempts')
          .eq('trainer_id', id)
          .eq('quiz_id', body.quiz_id)
          .maybeSingle()

        const { error } = await supabaseAdmin.from('trainer_attempt_grants').upsert(
          {
            trainer_id: id,
            quiz_id: body.quiz_id,
            extra_attempts: (current?.extra_attempts ?? 0) + extra,
            granted_by: reviewer,
            reason: notes,
          },
          { onConflict: 'trainer_id,quiz_id' },
        )
        if (error) throw new Error(error.message)
        await audit('grant_attempts', { quiz_id: body.quiz_id, extra })
        return NextResponse.json({ ok: true, extra_attempts: (current?.extra_attempts ?? 0) + extra })
      }

      case 'review_exam': {
        const decision = (body as { decision?: string }).decision
        if (decision !== 'qualified' && decision !== 'rejected' && decision !== 'under_review')
          return NextResponse.json({ error: 'Decisione non valida.' }, { status: 422 })
        if (!body.submission_id)
          return NextResponse.json({ error: 'Consegna non specificata.' }, { status: 422 })

        const { error } = await supabaseAdmin
          .from('trainer_exam_submissions')
          .update({
            status: decision,
            reviewed_by: reviewer,
            reviewed_at: now,
            review_notes: notes,
          })
          .eq('id', body.submission_id)
          .eq('trainer_id', id)
        if (error) throw new Error(error.message)
        await audit('review_exam', { decision, submission_id: body.submission_id })

        if (decision !== 'under_review') {
          const { subject, html } = examResultEmail(
            profile.full_name,
            decision === 'qualified',
            notes,
          )
          const sent = await sendEmail({ to: profile.email, subject, html })
          if (!sent.ok) console.error('exam result email failed:', sent.status, sent.error)
        }

        return NextResponse.json({ ok: true, status: decision })
      }

      default:
        return NextResponse.json({ error: 'Azione non riconosciuta.' }, { status: 400 })
    }
  } catch (e) {
    console.error('admin trainer action failed:', e instanceof Error ? e.message : e)
    return NextResponse.json({ error: 'Operazione non riuscita.' }, { status: 500 })
  }
}
