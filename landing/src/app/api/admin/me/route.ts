import { NextResponse } from 'next/server'
import { getStaffSession } from '@/lib/admin-session'
import { ROLE_LABEL } from '@/lib/staff-roles'

export const runtime = 'nodejs'

/** Chi sta usando la console. Serve alla barra d'identità in alto a destra. */
export async function GET() {
  const session = await getStaffSession()
  if (!session) return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })

  return NextResponse.json({
    email: session.email,
    role: session.role,
    role_label: ROLE_LABEL[session.role],
  })
}
