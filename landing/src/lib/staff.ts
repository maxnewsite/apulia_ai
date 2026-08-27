// Account di staff della console: lettura, password, creazione.
// I ruoli e i permessi stanno in `staff-roles.ts`, che non dipende da nulla
// e viene importato anche dal proxy nel runtime Edge.

import { supabaseAdmin } from '@/lib/supabase-admin'
import type { StaffRole } from '@/lib/staff-roles'

export type { StaffRole, Capability } from '@/lib/staff-roles'
export { can, ROLE_LABEL, staffHome } from '@/lib/staff-roles'

export interface StaffIdentity {
  email: string
  role: StaffRole
  full_name?: string | null
}

export interface StaffRow {
  id: string
  email: string
  full_name: string | null
  role: StaffRole
  is_active: boolean
  created_by: string | null
  last_login_at: string | null
  created_at: string
}

// ────────────────────────────────────────────────────────────
// PASSWORD
// PBKDF2-SHA256 via Web Crypto: stessa scelta di lib/auth.ts, che firma i
// token senza dipendenze esterne e deve funzionare anche nel runtime Edge
// del proxy. Formato: pbkdf2$<iterazioni>$<salt>$<hash>, base64url.
// ────────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 210_000
const KEY_BITS = 256

function b64url(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations, hash: 'SHA-256' },
    key,
    KEY_BITS,
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await derive(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64url(salt)}$${b64url(hash)}`
}

/** Confronto a tempo costante: la durata non deve dire quanti byte tornano. */
function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = Number(parts[1])
  if (!Number.isFinite(iterations) || iterations < 1000) return false

  const derived = await derive(password, fromB64url(parts[2]), iterations)
  return equalBytes(derived, fromB64url(parts[3]))
}

/** Requisito minimo sulle password di staff: sono account con poteri reali. */
export function passwordProblem(password: string): string | null {
  if (password.length < 12) return 'La password deve avere almeno 12 caratteri.'
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return 'La password deve contenere almeno una lettera e una cifra.'
  return null
}

// ────────────────────────────────────────────────────────────
// ACCESSO AL DATABASE
// ────────────────────────────────────────────────────────────

/**
 * Credenziali di uno staff attivo. Restituisce null anche quando la tabella
 * non esiste ancora: prima di applicare schema_staff.sql la console deve
 * continuare a funzionare con il solo admin delle variabili d'ambiente.
 */
export async function findActiveStaff(email: string): Promise<
  (StaffRow & { password_hash: string }) | null
> {
  const { data, error } = await supabaseAdmin
    .from('trainer_staff')
    .select('id,email,full_name,role,is_active,password_hash,created_by,last_login_at,created_at')
    .ilike('email', email.trim())
    .maybeSingle()

  if (error) {
    console.error('lettura staff non riuscita:', error.message)
    return null
  }
  if (!data || !data.is_active) return null
  return data as StaffRow & { password_hash: string }
}

export async function listStaff(): Promise<StaffRow[]> {
  const { data, error } = await supabaseAdmin
    .from('trainer_staff')
    .select('id,email,full_name,role,is_active,created_by,last_login_at,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('elenco staff non disponibile:', error.message)
    return []
  }
  return (data ?? []) as StaffRow[]
}

export async function touchLastLogin(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('trainer_staff')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', id)
  // Un timestamp mancante non deve impedire l'accesso.
  if (error) console.error('last_login_at non aggiornato:', error.message)
}
