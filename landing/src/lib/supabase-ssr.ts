// Supabase Auth client per l'App Router (sessione in cookie httpOnly).
// Usato dall'area trainer. L'area admin continua a usare il cookie HMAC
// di src/lib/auth.ts — i due sistemi convivono senza interferire.

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function credentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase Auth non configurato: NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY devono essere impostate.',
    )
  }
  return { url, key }
}

/**
 * Client Supabase legato ai cookie della richiesta corrente.
 * Da usare in Server Component, Server Action e Route Handler.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const { url, key } = credentials()
  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // I Server Component non possono scrivere cookie: il refresh del
          // token avviene nel proxy, quindi qui l'errore è innocuo.
        }
      },
    },
  })
}

/**
 * Rinnova la sessione Supabase dentro il proxy (ex middleware) e restituisce
 * sia l'utente sia la response con i cookie aggiornati. La response va
 * sempre restituita al client, altrimenti il refresh token va perso.
 */
export async function refreshTrainerSession(request: NextRequest): Promise<{
  response: NextResponse
  userId: string | null
  email: string | null
}> {
  let response = NextResponse.next({ request })

  const { url, key } = credentials()
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { data } = await supabase.auth.getUser()
  return { response, userId: data.user?.id ?? null, email: data.user?.email ?? null }
}
