// Accesso degli iscritti alla newsletter.
//
// Nessuna password: l'iscritto si è già identificato via email confermando
// l'iscrizione, quindi l'accesso avviene con un link monouso spedito a quello
// stesso indirizzo. Il link vale pochi minuti; il cookie di sessione dura a
// lungo, perché l'archivio non è un'area a rischio.

import { signToken, verifyToken } from '@/lib/hmac-token'

export const READER_COOKIE = 'apulia_reader_token'
export const READER_SESSION_DURATION = 60 * 60 * 24 * 60 // 60 giorni
export const LOGIN_LINK_TTL_MINUTES = 30

const SECRET =
  process.env.READER_JWT_SECRET ??
  process.env.ADMIN_JWT_SECRET ??
  'apulia-ai-fallback-secret-change-in-prod'

export interface ReaderClaims {
  email: string
  sid: string // id dell'iscritto
}

export async function signReaderToken(claims: ReaderClaims): Promise<string> {
  return signToken({ ...claims }, SECRET, READER_SESSION_DURATION)
}

export async function verifyReaderToken(token: string): Promise<ReaderClaims | null> {
  const claims = await verifyToken<Partial<ReaderClaims>>(token, SECRET)
  if (!claims?.email || !claims.sid) return null
  return { email: claims.email, sid: claims.sid }
}

/** Solo percorsi interni: un valore assoluto sarebbe un open redirect. */
export function safeInternalPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
