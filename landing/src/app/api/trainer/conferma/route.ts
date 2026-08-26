import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { appUrl, sendEmail } from '@/lib/zepto'
import { emailConfirmationEmail } from '@/lib/trainer-emails'
import { getSessionProfile } from '@/lib/trainer-session'

export const runtime = 'nodejs'

/**
 * GET — atterraggio del link di conferma inviato per email.
 * Pubblico per forza di cose: si arriva dalla casella di posta, non da una
 * sessione. Il token è l'unica credenziale e vale per un solo profilo.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const to = (esito: string) =>
    NextResponse.redirect(`${appUrl()}/trainer/conferma?stato=${esito}`)

  if (!token) return to('non-valido')

  const { data: profile } = await supabaseAdmin
    .from('trainer_profiles')
    .select('id,email_confirmed_at')
    .eq('email_confirm_token', token)
    .maybeSingle()

  if (!profile) return to('non-valido')
  if (profile.email_confirmed_at) return to('gia-confermato')

  const { error } = await supabaseAdmin
    .from('trainer_profiles')
    .update({ email_confirmed_at: new Date().toISOString() })
    .eq('id', profile.id)

  if (error) {
    console.error('conferma email fallita:', error.message)
    return to('errore')
  }

  return to('ok')
}

/**
 * POST — reinvio del link, richiesto dal candidato dalla propria area.
 * Richiede la sessione: così il reinvio non diventa un modo per bombardare
 * di email un indirizzo altrui.
 */
export async function POST() {
  const profile = await getSessionProfile()
  if (!profile)
    return NextResponse.json({ error: 'Sessione non valida.' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('trainer_profiles')
    .select('email_confirm_token,email_confirmed_at')
    .eq('id', profile.id)
    .single()

  if (data?.email_confirmed_at)
    return NextResponse.json({ ok: true, already: true })

  const confirmUrl = `${appUrl()}/api/trainer/conferma?token=${data!.email_confirm_token}`
  const { subject, html } = emailConfirmationEmail(profile.full_name, confirmUrl)
  const sent = await sendEmail({ to: profile.email, subject, html })

  if (!sent.ok) {
    console.error('reinvio conferma fallito:', sent.status, sent.error)
    return NextResponse.json({ error: 'Invio non riuscito. Riprova.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
