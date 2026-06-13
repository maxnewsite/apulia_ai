import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy server-side Supabase client (service-role key — never exposed to client).
// Lazy because the Next.js build's "Collect page data" phase imports this
// module without env vars present; eager construction crashes the build.

let _client: SupabaseClient | null = null

function build(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Supabase admin not configured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.',
    )
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// Proxy so callers can keep using `supabaseAdmin.from(...)` unchanged.
// The real client is built on first property access (i.e. at request time,
// not build time).
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_t, prop) {
    if (!_client) _client = build()
    const v = (_client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(_client) : v
  },
})
