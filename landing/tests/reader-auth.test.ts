import { describe, expect, it } from 'vitest'
import { signToken, verifyToken, sha256Hex } from '../src/lib/hmac-token'
import { canReadIssue, isLatestIssue } from '../src/lib/reader-gate'
import { safeInternalPath } from '../src/lib/reader-auth'

const SECRET = 'segreto-di-test'

describe('token firmati', () => {
  it('accetta un token valido e ne restituisce le claim', async () => {
    const token = await signToken({ email: 'a@b.it', sid: '123' }, SECRET, 60)
    const claims = await verifyToken<{ email: string; sid: string }>(token, SECRET)
    expect(claims?.email).toBe('a@b.it')
    expect(claims?.sid).toBe('123')
  })

  it('rifiuta un token firmato con un altro segreto', async () => {
    const token = await signToken({ email: 'a@b.it' }, SECRET, 60)
    expect(await verifyToken(token, 'altro-segreto')).toBeNull()
  })

  it('rifiuta un payload manomesso', async () => {
    const token = await signToken({ email: 'a@b.it' }, SECRET, 60)
    const [header, , sig] = token.split('.')
    const forged = btoa(JSON.stringify({ email: 'admin@apulia.ai', exp: 9e9 }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    expect(await verifyToken(`${header}.${forged}.${sig}`, SECRET)).toBeNull()
  })

  it('rifiuta un token scaduto', async () => {
    const token = await signToken({ email: 'a@b.it' }, SECRET, -1)
    expect(await verifyToken(token, SECRET)).toBeNull()
  })

  it('rifiuta stringhe che non sono token', async () => {
    expect(await verifyToken('non-un-token', SECRET)).toBeNull()
  })

  it('produce impronte stabili e diverse per token diversi', async () => {
    expect(await sha256Hex('abc')).toBe(await sha256Hex('abc'))
    expect(await sha256Hex('abc')).not.toBe(await sha256Hex('abd'))
    expect(await sha256Hex('abc')).toHaveLength(64)
  })
})

describe('accesso alle edizioni', () => {
  const latest = 'weekly-2026-08-30'
  const old = 'weekly-2026-08-23'

  it('apre l’ultima edizione anche senza sessione', () => {
    expect(isLatestIssue(latest, latest)).toBe(true)
    expect(canReadIssue(latest, latest, false)).toBe(true)
  })

  it('chiude le edizioni precedenti senza sessione', () => {
    expect(canReadIssue(old, latest, false)).toBe(false)
  })

  it('apre tutto con una sessione da iscritto', () => {
    expect(canReadIssue(old, latest, true)).toBe(true)
  })

  it('senza edizioni note non sblocca nulla', () => {
    expect(canReadIssue(old, null, false)).toBe(false)
    expect(isLatestIssue(old, null)).toBe(false)
  })
})

describe('percorsi di ritorno', () => {
  it('accetta un percorso interno', () => {
    expect(safeInternalPath('/weekly/2026-08-23')).toBe('/weekly/2026-08-23')
  })

  it('scarta url assoluti e protocol-relative', () => {
    expect(safeInternalPath('https://evil.example/x', '/weekly')).toBe('/weekly')
    expect(safeInternalPath('//evil.example/x', '/weekly')).toBe('/weekly')
  })

  it('usa il fallback su valori vuoti', () => {
    expect(safeInternalPath(null)).toBe('/')
    expect(safeInternalPath(undefined, '/weekly')).toBe('/weekly')
  })
})
