import { NextRequest, NextResponse } from 'next/server'
import { READER_COOKIE, safeInternalPath } from '@/lib/reader-auth'
import { appUrl } from '@/lib/zepto'

export const runtime = 'nodejs'

function logout(redirectTo: string) {
  const response = NextResponse.redirect(redirectTo, 303)
  response.cookies.set(READER_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}

// POST dal pulsante "Esci"; GET perché il link possa vivere anche in un'email.
export async function POST(request: NextRequest) {
  return logout(`${appUrl()}${safeInternalPath(request.nextUrl.searchParams.get('next'))}`)
}

export async function GET() {
  return logout(`${appUrl()}/`)
}
