import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, checkCredentials, COOKIE_NAME, SESSION_DURATION } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e password richieste.' }, { status: 400 })
  }

  if (!checkCredentials(email, password)) {
    // Constant-time-ish delay to slow brute force
    await new Promise(r => setTimeout(r, 400))
    return NextResponse.json({ error: 'Credenziali non valide.' }, { status: 401 })
  }

  const token = await signAdminToken(email)

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return response
}
