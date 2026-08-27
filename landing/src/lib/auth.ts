// JWT-compatible token signing/verification using Web Crypto API (no external deps)
// Compatible with both Node.js 18+ and Next.js Edge runtime

import type { StaffRole } from '@/lib/staff-roles'

export const COOKIE_NAME = 'apulia_admin_token'
export const SESSION_DURATION = 60 * 60 * 8 // 8 hours in seconds

const SECRET = process.env.ADMIN_JWT_SECRET ?? 'apulia-ai-fallback-secret-change-in-prod'

function b64url(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return buffer
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * Firma il token di sessione della console. Il ruolo viaggia nel payload:
 * il proxy deve poter decidere se una rotta è concessa senza interrogare il
 * database a ogni richiesta.
 */
export async function signAdminToken(email: string, role: StaffRole = 'admin'): Promise<string> {
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({
        email,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
      })
    )
  )
  const msg = `${header}.${payload}`
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return `${msg}.${b64url(sig)}`
}

export async function verifyAdminToken(
  token: string,
): Promise<{ email: string; role: StaffRole } | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, sig] = parts
    const msg = `${header}.${payload}`
    const key = await getKey()
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromB64url(sig),
      new TextEncoder().encode(msg)
    )
    if (!valid) return null
    const claims = JSON.parse(new TextDecoder().decode(fromB64url(payload)))
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null
    // I token emessi prima dell'introduzione del ruolo hanno gia' role:'admin';
    // il fallback copre solo eventuali payload manomessi o troncati.
    return { email: claims.email, role: claims.role === 'coach' ? 'coach' : 'admin' }
  } catch {
    return null
  }
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
