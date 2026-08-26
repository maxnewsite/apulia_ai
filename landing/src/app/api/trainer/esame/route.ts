import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireApprovedTrainer } from '@/lib/trainer-session'
import { getCurriculum } from '@/lib/trainer'
import { sendEmail } from '@/lib/zepto'
import { examSubmittedEmail } from '@/lib/trainer-emails'

export const runtime = 'nodejs'

const VIDEO_URL_REGEX = /^https:\/\/[\w.-]+\/\S*$/i

interface SubmittedFile {
  path: string
  name: string
  size: number
  type: string
}

async function examQuizId(): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('trainer_quizzes')
    .select('id')
    .eq('kind', 'exam')
    .eq('is_published', true)
    .maybeSingle()
  return data?.id ?? null
}

// ────────────────────────────────────────────────────────────
// GET — accesso all'esame e stato della consegna
// ────────────────────────────────────────────────────────────
export async function GET() {
  const { profile, denial } = await requireApprovedTrainer()
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  const curriculum = await getCurriculum(profile.id)
  const quizId = await examQuizId()

  const { data: submission } = await supabaseAdmin
    .from('trainer_exam_submissions')
    .select('id,status,video_url,notes,files,auto_score,review_notes,created_at,reviewed_at')
    .eq('trainer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({
    unlocked: curriculum.examUnlocked && quizId !== null,
    reason: quizId === null ? "L'esame finale non è ancora stato pubblicato." : curriculum.examReason,
    completed_modules: curriculum.completedModules,
    total_modules: curriculum.totalModules,
    quiz_id: curriculum.examUnlocked ? quizId : null,
    submission: submission ?? null,
  })
}

// ────────────────────────────────────────────────────────────
// POST — consegna di video e materiali, dopo il tentativo d'esame
// ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { profile, denial } = await requireApprovedTrainer()
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  const curriculum = await getCurriculum(profile.id)
  if (!curriculum.examUnlocked)
    return NextResponse.json(
      { error: curriculum.examReason ?? 'Esame non accessibile.' },
      { status: 403 },
    )

  let body: { attempt_id?: string; video_url?: string; notes?: string; files?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
  }

  const videoUrl = (body.video_url ?? '').trim()
  if (!VIDEO_URL_REGEX.test(videoUrl))
    return NextResponse.json(
      { error: 'Inserisci il link https del video (YouTube o Vimeo, non in elenco).' },
      { status: 422 },
    )

  const quizId = await examQuizId()
  if (!quizId)
    return NextResponse.json({ error: "L'esame finale non è disponibile." }, { status: 404 })

  // La consegna è valida solo a valle di un tentativo d'esame già chiuso.
  const { data: attempt } = await supabaseAdmin
    .from('trainer_quiz_attempts')
    .select('id,score,status')
    .eq('id', body.attempt_id ?? '')
    .eq('trainer_id', profile.id)
    .eq('quiz_id', quizId)
    .maybeSingle()

  if (!attempt || attempt.status !== 'submitted')
    return NextResponse.json(
      { error: 'Completa e consegna prima le domande d’esame.' },
      { status: 409 },
    )

  const { data: existing } = await supabaseAdmin
    .from('trainer_exam_submissions')
    .select('id,status')
    .eq('trainer_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing && existing.status !== 'draft' && existing.status !== 'rejected')
    return NextResponse.json(
      { error: 'Hai già consegnato l’esame: è in valutazione.' },
      { status: 409 },
    )

  const files: SubmittedFile[] = Array.isArray(body.files)
    ? (body.files as SubmittedFile[])
        // Accetta solo percorsi dentro la cartella del trainer.
        .filter(f => typeof f?.path === 'string' && f.path.startsWith(`${profile.id}/`))
        .slice(0, 10)
        .map(f => ({
          path: f.path,
          name: String(f.name ?? 'allegato').slice(0, 200),
          size: Number(f.size ?? 0),
          type: String(f.type ?? ''),
        }))
    : []

  const { error } = await supabaseAdmin.from('trainer_exam_submissions').insert({
    trainer_id: profile.id,
    attempt_id: attempt.id,
    video_url: videoUrl,
    notes: (body.notes ?? '').trim().slice(0, 4000) || null,
    files,
    auto_score: attempt.score,
    status: 'submitted',
  })

  if (error) {
    console.error('exam submission error:', error.message)
    return NextResponse.json({ error: 'Consegna non riuscita. Riprova.' }, { status: 500 })
  }

  const { subject, html } = examSubmittedEmail(profile.full_name)
  const sent = await sendEmail({ to: profile.email, subject, html })
  if (!sent.ok) console.error('exam receipt email failed:', sent.status, sent.error)

  return NextResponse.json({ ok: true }, { status: 201 })
}
