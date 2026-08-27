// Identità di chi sta usando la console, lato server.
//
// Il proxy ha già verificato la firma del cookie prima che una route venga
// eseguita: qui si rilegge il token per sapere *chi* è e *cosa può fare*.
// Il controllo di ruolo va ripetuto dentro le azioni — il proxy protegge i
// percorsi, non le singole operazioni che convivono sulla stessa rotta.

import { cookies } from 'next/headers'
import { COOKIE_NAME, verifyAdminToken } from '@/lib/auth'
import { can, type Capability, type StaffRole } from '@/lib/staff-roles'

export interface StaffSession {
  email: string
  role: StaffRole
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return null
  const claims = await verifyAdminToken(token)
  return claims ? { email: claims.email, role: claims.role } : null
}

export type Denial = { status: number; error: string }

/**
 * Sessione della console con il permesso richiesto. Restituisce un Denial
 * pronto da serializzare invece di lanciare: le route lo trasformano in una
 * risposta senza try/catch.
 */
export async function requireCapability(
  capability: Capability,
): Promise<{ session: StaffSession; denial: null } | { session: null; denial: Denial }> {
  const session = await getStaffSession()
  if (!session) return { session: null, denial: { status: 401, error: 'Non autorizzato.' } }
  if (!can(session.role, capability))
    return {
      session: null,
      denial: { status: 403, error: 'Il tuo ruolo non consente questa operazione.' },
    }
  return { session, denial: null }
}
