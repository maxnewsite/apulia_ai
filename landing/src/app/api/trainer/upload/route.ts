import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireApprovedTrainer } from '@/lib/trainer-session'

export const runtime = 'nodejs'

const MAX_BYTES = 50 * 1024 * 1024

const ALLOWED: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'application/zip': 'zip',
}

/**
 * Carica un allegato dell'esame nel bucket privato trainer-submissions.
 * Restituisce i metadati che il client accumula e invia con la consegna.
 * I video restano fuori: si conferiscono via link non in elenco.
 */
export async function POST(request: NextRequest) {
  const { profile, denial } = await requireApprovedTrainer()
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0)
    return NextResponse.json({ error: 'Nessun file ricevuto.' }, { status: 422 })
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: 'Il file supera i 50 MB.' }, { status: 422 })

  const extension = ALLOWED[file.type]
  if (!extension)
    return NextResponse.json(
      { error: 'Formato non ammesso. Usa PDF, PPTX, DOCX, PNG, JPG o ZIP.' },
      { status: 422 },
    )

  const path = `${profile.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`

  const { error } = await supabaseAdmin.storage
    .from('trainer-submissions')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error('submission upload error:', error.message)
    return NextResponse.json({ error: 'Caricamento non riuscito. Riprova.' }, { status: 500 })
  }

  return NextResponse.json(
    { path, name: file.name, size: file.size, type: file.type },
    { status: 201 },
  )
}
