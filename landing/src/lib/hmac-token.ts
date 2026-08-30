// Token firmati in formato JWT (HS256) con la sola Web Crypto API.
//
// Nessuna dipendenza esterna e nessuna API Node-only: lo stesso modulo gira
// nel runtime Node delle route e nel runtime Edge del proxy.

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

async function hmacKey(secret: string, usage: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage,
  )
}

export type TokenClaims = { iat: number; exp: number }

/** Firma le claim aggiungendo `iat` ed `exp`. */
export async function signToken(
  claims: Record<string, unknown>,
  secret: string,
  ttlSeconds: number,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = b64url(
    new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
  )
  const payload = b64url(
    new TextEncoder().encode(
      JSON.stringify({ ...claims, iat: now, exp: now + ttlSeconds }),
    ),
  )
  const msg = `${header}.${payload}`
  const key = await hmacKey(secret, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return `${msg}.${b64url(sig)}`
}

/** Claim del token, o null se la firma non torna o il token è scaduto. */
export async function verifyToken<T = Record<string, unknown>>(
  token: string,
  secret: string,
): Promise<(T & TokenClaims) | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, payload, sig] = parts
    const key = await hmacKey(secret, ['verify'])
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromB64url(sig),
      new TextEncoder().encode(`${header}.${payload}`),
    )
    if (!valid) return null
    const claims = JSON.parse(new TextDecoder().decode(fromB64url(payload)))
    if (typeof claims.exp === 'number' && claims.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return claims as T & TokenClaims
  } catch {
    return null
  }
}

/** SHA-256 esadecimale — per non tenere in chiaro i token monouso nel DB. */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
