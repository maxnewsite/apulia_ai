// Identità dell'iscritto che sta leggendo, lato server.

import { cookies } from 'next/headers'
import { READER_COOKIE, verifyReaderToken, type ReaderClaims } from '@/lib/reader-auth'

export async function getReaderSession(): Promise<ReaderClaims | null> {
  const token = (await cookies()).get(READER_COOKIE)?.value
  if (!token) return null
  return verifyReaderToken(token)
}
