import { NextResponse } from 'next/server'
import { getReaderSession } from '@/lib/reader-session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Stato della sessione lettore, per l'header (client component). */
export async function GET() {
  const session = await getReaderSession()
  return NextResponse.json(
    { email: session?.email ?? null },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
