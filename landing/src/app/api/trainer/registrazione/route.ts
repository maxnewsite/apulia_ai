import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { appUrl, sendEmail } from '@/lib/zepto'
import { adminNewApplicationEmail, applicationReceivedEmail } from '@/lib/trainer-emails'

export const runtime = 'nodejs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 10
const MAX_CV_BYTES = 10 * 1024 * 1024

const ALLOWED_CV_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

// Soglie del rate limit. Generose per una persona, strette per uno script.
const IP_LIMIT = 5
const IP_WINDOW = '1 hour'
const EMAIL_LIMIT = 3
const EMAIL_WINDOW = '1 day'

function bad(message: string, status = 422) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * IP del chiamante. Dietro Cloud Run la catena è in x-forwarded-for e il
 * primo elemento è il client reale; gli altri sono i proxy attraversati.
 */
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')?.trim() || 'sconosciuto'
}

/** true = la richiesta va bloccata. */
async function rateLimited(bucket: string, key: string, limit: number, window: string) {
  const { data, error } = await supabaseAdmin.rpc('trainer_rate_check', {
    p_bucket: bucket,
    p_key: key,
    p_limit: limit,
    p_window: window,
  })
  if (error) {
    // Se il rate limit non è installato o è rotto, non blocchiamo le
    // registrazioni legittime: si registra l'anomalia e si prosegue.
    console.error('rate limit non disponibile:', error.message)
    return false
  }
  return data === true
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

  // Honeypot: campo invisibile all'utente, irresistibile per un bot che
  // compila tutto. Si risponde come a un successo per non insegnare al
  // bot cosa lo ha tradito, ma non si crea nulla.
  if (str('company_ref')) {
    console.warn('registrazione trainer scartata: honeypot compilato')
    return NextResponse.json({ ok: true }, { status: 201 })
  }

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

  // Rate limit dopo la validazione: una richiesta malformata non deve
  // consumare il budget di un utente legittimo dietro lo stesso IP.
  const ip = clientIp(request)
  if (await rateLimited('signup_ip', ip, IP_LIMIT, IP_WINDOW)) {
    return bad('Troppe candidature da questa connessione. Riprova tra un’ora.', 429)
  }
  if (await rateLimited('signup_email', email, EMAIL_LIMIT, EMAIL_WINDOW)) {
    return bad('Troppi tentativi per questo indirizzo. Riprova domani.', 429)
  }

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
  const { data: created_profile, error: profileError } = await supabaseAdmin
    .from('trainer_profiles')
    .insert({
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
    .select('email_confirm_token')
    .single()

  if (profileError) {
    await supabaseAdmin.storage.from('trainer-cv').remove([cvPath])
    await supabaseAdmin.auth.admin.deleteUser(userId)
    console.error('trainer profile insert error:', profileError.message)
    return bad('Non è stato possibile registrare la candidatura. Riprova.', 500)
  }

  // 4. Ricevuta al candidato e avviso al revisore. Nessuno dei due invii
  // invalida la candidatura, che a questo punto è già registrata: gli errori
  // finiscono nei log e basta.
  const confirmUrl = `${appUrl()}/api/trainer/conferma?token=${created_profile.email_confirm_token}`
  const receipt = applicationReceivedEmail(fullName, confirmUrl)
  const reviewer = process.env.ADMIN_EMAIL?.trim()

  const [toCandidate, toReviewer] = await Promise.all([
    sendEmail({ to: email, subject: receipt.subject, html: receipt.html }),
    reviewer
      ? sendEmail({
          to: reviewer,
          ...adminNewApplicationEmail({
            full_name: fullName,
            email,
            city: city || null,
            phone: phone || null,
            motivation,
          }),
        })
      : Promise.resolve({ ok: false, status: 0, error: 'ADMIN_EMAIL non impostata' }),
  ])

  if (!toCandidate.ok)
    console.error('trainer receipt email failed:', toCandidate.status, toCandidate.error)
  if (!toReviewer.ok)
    console.error('admin notification email failed:', toReviewer.status, toReviewer.error)

  return NextResponse.json({ ok: true }, { status: 201 })
}
