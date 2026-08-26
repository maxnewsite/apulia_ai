import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/zepto'
import { applicationReceivedEmail } from '@/lib/trainer-emails'

export const runtime = 'nodejs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 10
const MAX_CV_BYTES = 10 * 1024 * 1024

const ALLOWED_CV_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

function bad(message: string, status = 422) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Registrazione trainer: crea l'utente Supabase Auth, carica il CV nel bucket
 * privato e apre la candidatura in stato 'pending'.
 *
 * L'account viene creato con email già confermata: la verifica reale è la
 * revisione manuale dell'admin, che controlla identità e CV prima di
 * concedere l'accesso ai moduli. Finché lo status è 'pending' l'account non
 * dà accesso ad alcun contenuto.
 */
export async function POST(request: NextRequest) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return bad('Richiesta non valida.', 400)
  }

  const str = (k: string) => (form.get(k) as string | null)?.trim() || ''

  const email = str('email').toLowerCase()
  const password = (form.get('password') as string | null) ?? ''
  const fullName = str('full_name')
  const phone = str('phone')
  const city = str('city')
  const linkedin = str('linkedin_url')
  const bio = str('bio')
  const motivation = str('motivation')
  const consent = form.get('consent_privacy') === 'true'
  const cv = form.get('cv')

  if (!EMAIL_REGEX.test(email)) return bad('Inserisci un indirizzo email valido.')
  if (password.length < MIN_PASSWORD)
    return bad(`La password deve avere almeno ${MIN_PASSWORD} caratteri.`)
  if (fullName.length < 3) return bad('Inserisci nome e cognome.')
  if (motivation.length < 40)
    return bad('Racconta in almeno 40 caratteri perché vuoi diventare trainer apulia.ai.')
  if (!consent) return bad('Devi accettare l’informativa privacy per candidarti.')
  if (!(cv instanceof File) || cv.size === 0) return bad('Carica il tuo CV.')
  if (cv.size > MAX_CV_BYTES) return bad('Il CV supera i 10 MB.')

  const extension = ALLOWED_CV_TYPES[cv.type]
  if (!extension) return bad('Il CV deve essere in formato PDF, DOC o DOCX.')

  // 1. Utente Auth. Il vincolo di unicità sull'email vive qui.
  const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'trainer' },
  })

  if (authError || !created?.user) {
    const message = authError?.message ?? ''
    if (/already|registered|exists/i.test(message)) {
      return bad('Esiste già un account con questa email. Accedi oppure recupera la password.', 409)
    }
    console.error('trainer signup auth error:', message)
    return bad('Non è stato possibile creare l’account. Riprova.', 500)
  }

  const userId = created.user.id
  const cvPath = `${userId}/cv-${Date.now()}.${extension}`

  // 2. CV nel bucket privato.
  const { error: uploadError } = await supabaseAdmin.storage
    .from('trainer-cv')
    .upload(cvPath, cv, { contentType: cv.type, upsert: true })

  if (uploadError) {
    // Rollback dell'utente: senza CV la candidatura non è valutabile e
    // lasciare l'account orfano bloccherebbe un nuovo tentativo sull'email.
    await supabaseAdmin.auth.admin.deleteUser(userId)
    console.error('trainer cv upload error:', uploadError.message)
    return bad('Caricamento del CV non riuscito. Riprova.', 500)
  }

  // 3. Candidatura.
  const { error: profileError } = await supabaseAdmin.from('trainer_profiles').insert({
    id: userId,
    email,
    full_name: fullName,
    phone: phone || null,
    city: city || null,
    linkedin_url: linkedin || null,
    bio: bio || null,
    motivation,
    cv_path: cvPath,
    status: 'pending',
    consent_privacy: true,
    consent_at: new Date().toISOString(),
  })

  if (profileError) {
    await supabaseAdmin.storage.from('trainer-cv').remove([cvPath])
    await supabaseAdmin.auth.admin.deleteUser(userId)
    console.error('trainer profile insert error:', profileError.message)
    return bad('Non è stato possibile registrare la candidatura. Riprova.', 500)
  }

  // 4. Ricevuta via email. Un fallimento qui non invalida la candidatura.
  const { subject, html } = applicationReceivedEmail(fullName)
  const sent = await sendEmail({ to: email, subject, html })
  if (!sent.ok) console.error('trainer receipt email failed:', sent.status, sent.error)

  return NextResponse.json({ ok: true }, { status: 201 })
}
