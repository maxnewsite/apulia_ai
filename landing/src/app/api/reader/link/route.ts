import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sha256Hex } from '@/lib/hmac-token'
import { LOGIN_LINK_TTL_MINUTES, safeInternalPath } from '@/lib/reader-auth'
import { appUrl, loginLinkEmailHtml, sendEmail } from '@/lib/zepto'

export const runtime = 'nodejs'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Soglie del rate limit: generose per una persona, strette per uno script.
const IP_LIMIT = 10
const IP_WINDOW = '1 hour'
const EMAIL_LIMIT = 5
const EMAIL_WINDOW = '1 hour'

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
    // Rate limit non installato o rotto: si registra l'anomalia e si prosegue,
    // per non bloccare accessi legittimi.
    console.error('rate limit non disponibile:', error.message)
    return false
  }
  return data === true
}

/**
 * Richiesta del link di accesso all'archivio.
 *
 * La risposta è sempre la stessa, indirizzo iscritto o no: dire "questa email
 * non risulta" trasformerebbe l'endpoint in uno strumento per scoprire chi è
 * iscritto alla newsletter.
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
  }

  const raw = (body as { email?: unknown }).email
  if (typeof raw !== 'string' || !EMAIL_REGEX.test(raw.trim())) {
    return NextResponse.json(
      { error: 'Inserisci un indirizzo email valido.' },
      { status: 422 },
    )
  }

  const email = raw.trim().toLowerCase()
  // Dove riportare l'iscritto dopo il click sul link: la pagina che stava
  // cercando di leggere, non un generico elenco.
  const next = safeInternalPath((body as { next?: unknown }).next as string | null, '/weekly')
  const generic = NextResponse.json({
    ok: true,
    message:
      'Se questo indirizzo è iscritto, ti abbiamo inviato un link di accesso. Controlla la posta.',
  })

  if (await rateLimited('reader_login_ip', clientIp(request), IP_LIMIT, IP_WINDOW)) {
    return NextResponse.json(
      { error: 'Troppe richieste. Riprova tra un’ora.' },
      { status: 429 },
    )
  }
  if (await rateLimited('reader_login_email', email, EMAIL_LIMIT, EMAIL_WINDOW)) {
    return generic
  }

  const { data: subscriber, error } = await supabaseAdmin
    .from('subscribers')
    .select('id,email,status,preferred_language')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('[reader/link] lookup fallito:', error.message)
    return NextResponse.json(
      { error: 'Errore temporaneo. Riprova tra qualche secondo.' },
      { status: 500 },
    )
  }

  // Iscrizione mai confermata o disdetta: nessun link, nessuna conferma.
  if (!subscriber || subscriber.status !== 'active') return generic

  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, '')
  const expiresAt = new Date(Date.now() + LOGIN_LINK_TTL_MINUTES * 60_000)

  const { error: insertErr } = await supabaseAdmin
    .from('subscriber_login_tokens')
    .insert({
      subscriber_id: subscriber.id,
      token_hash: await sha256Hex(token),
      expires_at: expiresAt.toISOString(),
    })

  if (insertErr) {
    console.error('[reader/link] insert token fallito:', insertErr.message)
    return NextResponse.json(
      { error: 'Errore temporaneo. Riprova tra qualche secondo.' },
      { status: 500 },
    )
  }

  const lang = subscriber.preferred_language === 'en' ? 'en' : 'it'
  const loginUrl = `${appUrl()}/api/reader/accedi?token=${token}&next=${encodeURIComponent(next)}`
  const { subject, html } = loginLinkEmailHtml(lang, loginUrl, LOGIN_LINK_TTL_MINUTES)

  const send = await sendEmail({
    to: subscriber.email,
    subject,
    html,
    fromEmail: process.env.ZEPTO_FROM_EMAIL_CONFIRM,
  })

  if (!send.ok) {
    console.error('[reader/link] invio fallito:', send.status, send.error)
    return NextResponse.json(
      { error: 'Non siamo riusciti a inviare l’email. Riprova tra poco.' },
      { status: 502 },
    )
  }

  return generic
}
