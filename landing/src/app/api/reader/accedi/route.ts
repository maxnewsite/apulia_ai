import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sha256Hex } from '@/lib/hmac-token'
import {
  READER_COOKIE,
  READER_SESSION_DURATION,
  safeInternalPath,
  signReaderToken,
} from '@/lib/reader-auth'
import { appUrl } from '@/lib/zepto'

export const runtime = 'nodejs'

const TOKEN_REGEX = /^[0-9a-f]{64}$/i

/**
 * Apertura del link ricevuto via email: consuma il token e apre la sessione
 * da iscritto.
 */
export async function GET(request: NextRequest) {
  const base = appUrl()
  const token = request.nextUrl.searchParams.get('token')?.trim()
  const next = safeInternalPath(request.nextUrl.searchParams.get('next'), '/weekly')

  if (!token || !TOKEN_REGEX.test(token)) {
    return NextResponse.redirect(`${base}/accedi?stato=non-valido`, 303)
  }

  const { data, error } = await supabaseAdmin.rpc('consume_subscriber_login_token', {
    p_token_hash: await sha256Hex(token),
  })

  if (error) {
    console.error('[reader/accedi] consumo token fallito:', error.message)
    return NextResponse.redirect(`${base}/accedi?stato=errore`, 303)
  }

  const row = (data as { subscriber_id: string; email: string }[] | null)?.[0]
  if (!row) {
    // Token inesistente, già usato o scaduto: da fuori sono lo stesso caso.
    return NextResponse.redirect(`${base}/accedi?stato=scaduto`, 303)
  }

  const response = NextResponse.redirect(`${base}${next}`, 303)
  response.cookies.set(READER_COOKIE, await signReaderToken({
    email: row.email,
    sid: row.subscriber_id,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: READER_SESSION_DURATION,
  })
  return response
}
