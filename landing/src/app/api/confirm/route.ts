import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { appUrl } from '@/lib/zepto'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim()
  const base = appUrl()

  if (!token || !UUID_REGEX.test(token)) {
    return NextResponse.redirect(`${base}/confirm?status=invalid`, 303)
  }

  const { data: sub, error: lookupErr } = await supabaseAdmin
    .from('subscribers')
    .select('id,status')
    .eq('confirm_token', token)
    .maybeSingle()

  if (lookupErr) {
    console.error('Confirm lookup error:', lookupErr)
    return NextResponse.redirect(`${base}/confirm?status=error`, 303)
  }

  if (!sub) {
    return NextResponse.redirect(`${base}/confirm?status=invalid`, 303)
  }

  if (sub.status === 'active') {
    return NextResponse.redirect(`${base}/confirm?status=already`, 303)
  }

  const { error: updateErr } = await supabaseAdmin
    .from('subscribers')
    .update({
      status: 'active',
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
    })
    .eq('id', sub.id)

  if (updateErr) {
    console.error('Confirm update error:', updateErr)
    return NextResponse.redirect(`${base}/confirm?status=error`, 303)
  }

  return NextResponse.redirect(`${base}/confirm?status=ok`, 303)
}
