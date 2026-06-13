import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { appUrl } from '@/lib/zepto'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Token-based unsubscribe (one-click link in newsletter emails)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim()
  const base = appUrl()

  if (!token || !UUID_REGEX.test(token)) {
    return NextResponse.redirect(`${base}/unsubscribe?status=invalid`, 303)
  }

  const { data: sub, error: lookupErr } = await supabaseAdmin
    .from('subscribers')
    .select('id,status')
    .eq('unsubscribe_token', token)
    .maybeSingle()

  if (lookupErr) {
    console.error('Unsubscribe lookup error:', lookupErr)
    return NextResponse.redirect(`${base}/unsubscribe?status=error`, 303)
  }

  if (!sub) {
    return NextResponse.redirect(`${base}/unsubscribe?status=invalid`, 303)
  }

  if (sub.status === 'unsubscribed') {
    return NextResponse.redirect(`${base}/unsubscribe?status=already`, 303)
  }

  const { error: updateErr } = await supabaseAdmin
    .from('subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('id', sub.id)

  if (updateErr) {
    console.error('Unsubscribe update error:', updateErr)
    return NextResponse.redirect(`${base}/unsubscribe?status=error`, 303)
  }

  return NextResponse.redirect(`${base}/unsubscribe?status=ok`, 303)
}

// Email-based unsubscribe (form on /unsubscribe page)
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = (body as { email?: string }).email?.trim().toLowerCase()
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: 'Inserisci un indirizzo email valido.' },
      { status: 422 }
    )
  }

  // Idempotent: we don't reveal whether the address existed.
  const { error } = await supabaseAdmin
    .from('subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('email', email)

  if (error) {
    console.error('Unsubscribe POST error:', error)
    return NextResponse.json(
      { error: 'Errore durante la disiscrizione. Riprova.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
