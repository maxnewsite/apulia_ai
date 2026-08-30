// Sessione della console di staff: token firmato HS256 (vedi lib/hmac-token).
// Compatibile con Node.js 18+ e con il runtime Edge di Next.js.

import { signToken, verifyToken } from '@/lib/hmac-token'
import type { StaffRole } from '@/lib/staff-roles'

export const COOKIE_NAME = 'apulia_admin_token'
export const SESSION_DURATION = 60 * 60 * 8 // 8 ore, in secondi

const SECRET = process.env.ADMIN_JWT_SECRET ?? 'apulia-ai-fallback-secret-change-in-prod'

/**
 * Firma il token di sessione della console. Il ruolo viaggia nel payload:
 * il proxy deve poter decidere se una rotta è concessa senza interrogare il
 * database a ogni richiesta.
 */
export async function signAdminToken(email: string, role: StaffRole = 'admin'): Promise<string> {
  return signToken({ email, role }, SECRET, SESSION_DURATION)
}

export async function verifyAdminToken(
  token: string,
): Promise<{ email: string; role: StaffRole } | null> {
  const claims = await verifyToken<{ email?: string; role?: string }>(token, SECRET)
  if (!claims?.email) return null
  // I token emessi prima dell'introduzione del ruolo hanno gia' role:'admin';
  // il fallback copre solo eventuali payload manomessi o troncati.
  return { email: claims.email, role: claims.role === 'coach' ? 'coach' : 'admin' }
}

/**
 * Admin "di fabbrica", quello delle variabili d'ambiente. Resta perché è
 * l'unico accesso che funziona anche a database vuoto: senza, creare il
 * primo account di staff sarebbe impossibile.
 */
export function checkCredentials(email: string, password: string): boolean {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  )
}
