import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken, checkCredentials, COOKIE_NAME, SESSION_DURATION } from '@/lib/auth'
import { findActiveStaff, touchLastLogin, verifyPassword } from '@/lib/staff'
import { staffHome, type StaffRole } from '@/lib/staff-roles'

export const runtime = 'nodejs'

/** Ritardo uniforme sui fallimenti: rallenta il brute force. */
const FAIL_DELAY_MS = 400

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email e password richieste.' }, { status: 400 })
  }

  let identity: { email: string; role: StaffRole } | null = null

  // 1. Admin di fabbrica: l'unico che funziona anche a tabella staff vuota.
  if (checkCredentials(email, password)) {
    identity = { email, role: 'admin' }
  } else {
    // 2. Account di staff nominale (coach o admin aggiuntivo).
    const staff = await findActiveStaff(email)
    if (staff && (await verifyPassword(password, staff.password_hash))) {
      identity = { email: staff.email, role: staff.role }
      await touchLastLogin(staff.id)
    }
  }

  if (!identity) {
    await new Promise(r => setTimeout(r, FAIL_DELAY_MS))
    return NextResponse.json({ error: 'Credenziali non valide.' }, { status: 401 })
  }

  const token = await signAdminToken(identity.email, identity.role)

  // La destinazione la decide il server: un coach non ha accesso alla
  // dashboard iscritti, quindi mandarlo su /admin sarebbe un rimbalzo.
  const response = NextResponse.json({
    ok: true,
    role: identity.role,
    redirect: staffHome(identity.role),
  })
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return response
}
