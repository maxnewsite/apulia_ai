import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'
import { refreshTrainerSession } from '@/lib/supabase-ssr'

// Pagine dell'area trainer raggiungibili senza sessione.
const TRAINER_PUBLIC_PAGES = new Set([
  '/trainer',
  '/trainer/login',
  '/trainer/registrati',
  '/trainer/recupera-password',
  // La sessione di recupero nasce nel browser dal link email: quando la
  // pagina viene aperta il server non ha ancora alcun cookie.
  '/trainer/nuova-password',
  '/trainer/conferma',
])

// API dell'area trainer invocabili senza sessione (la registrazione crea l'utente).
// La conferma email si apre dalla casella di posta, non da una sessione.
const TRAINER_PUBLIC_APIS = new Set(['/api/trainer/registrazione', '/api/trainer/conferma'])

const SECRET = process.env.ADMIN_JWT_SECRET ?? 'apulia-ai-fallback-secret-change-in-prod'

function fromB64url(str: string): ArrayBuffer {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return buffer
}

async function isValidToken(token: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const [header, payload, sig] = parts
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromB64url(sig),
      new TextEncoder().encode(`${header}.${payload}`)
    )
    if (!valid) return false
    const claims = JSON.parse(new TextDecoder().decode(fromB64url(payload)))
    return !claims.exp || claims.exp >= Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value

    if (!token || !(await isValidToken(token))) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Non autorizzato.' }, { status: 401 })
      }
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete(COOKIE_NAME)
      return response
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/trainer') || pathname.startsWith('/api/trainer')) {
    const isPublic = pathname.startsWith('/api/')
      ? TRAINER_PUBLIC_APIS.has(pathname)
      : TRAINER_PUBLIC_PAGES.has(pathname)

    // Il refresh va eseguito sempre — anche sulle rotte pubbliche — altrimenti
    // il token rinnovato non viene riscritto nei cookie e la sessione scade.
    const { response, userId } = await refreshTrainerSession(request)

    if (!userId && !isPublic) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Sessione non valida. Accedi di nuovo.' }, { status: 401 })
      }
      const redirect = NextResponse.redirect(
        new URL(`/trainer/login?next=${encodeURIComponent(pathname)}`, request.url),
      )
      // Porta con sé i cookie ripuliti dal client Supabase.
      response.cookies.getAll().forEach(c => redirect.cookies.set(c))
      return redirect
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/trainer/:path*',
    '/api/trainer/:path*',
  ],
}
