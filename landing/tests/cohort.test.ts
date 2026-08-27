import { describe, expect, it } from 'vitest'
import { classify, tally, IDLE_DAYS, type CohortInput } from '../src/lib/trainer-cohort'

/**
 * classify decide chi compare nella colonna "chi si è fermato" e chi in
 * "chi aspetta una mia valutazione". Sbagliare la precedenza fra i criteri
 * significa inseguire un sospeso o perdere di vista un esame consegnato.
 */

const NOW = Date.parse('2026-08-27T12:00:00Z')
const daysAgo = (n: number) => new Date(NOW - n * 86_400_000).toISOString()

const base: CohortInput = {
  status: 'approved',
  modules_passed: 3,
  modules_total: 7,
  exam_status: null,
  last_activity_at: daysAgo(1),
  blocked: false,
}

const on = (patch: Partial<CohortInput>) => classify({ ...base, ...patch }, NOW)

describe('classify — stato della candidatura', () => {
  it('precede ogni altro criterio', () => {
    expect(on({ status: 'pending' })).toBe('da_valutare')
    expect(on({ status: 'rejected' })).toBe('non_ammesso')
    // Un sospeso inattivo da mesi resta "sospeso": è stato fermato apposta,
    // inseguirlo tra gli inattivi sarebbe lavoro sprecato.
    expect(on({ status: 'suspended', last_activity_at: daysAgo(120) })).toBe('sospeso')
    expect(on({ status: 'suspended', blocked: true })).toBe('sospeso')
  })
})

describe('classify — esito dell’esame', () => {
  it('chiude il percorso e vince su blocco e inattività', () => {
    expect(on({ exam_status: 'qualified', last_activity_at: daysAgo(200) })).toBe('qualificato')
    expect(on({ exam_status: 'rejected' })).toBe('esame_respinto')
    expect(on({ exam_status: 'needs_work', blocked: true })).toBe('integrazioni')
    expect(on({ exam_status: 'submitted' })).toBe('esame_da_valutare')
    expect(on({ exam_status: 'under_review' })).toBe('esame_da_valutare')
  })

  it('ignora una consegna ancora in bozza', () => {
    expect(on({ exam_status: 'draft' })).toBe('in_corso')
  })
})

describe('classify — blocco e attività', () => {
  it('segnala i tentativi esauriti prima dell’inattività', () => {
    expect(on({ blocked: true, last_activity_at: daysAgo(90) })).toBe('bloccato')
  })

  it('distingue chi non ha mai iniziato da chi si è fermato', () => {
    expect(on({ last_activity_at: null })).toBe('mai_iniziato')
    expect(on({ last_activity_at: daysAgo(IDLE_DAYS) })).toBe('fermo')
    expect(on({ last_activity_at: daysAgo(IDLE_DAYS + 40) })).toBe('fermo')
  })

  it('considera in corso chi ha dato segni di vita entro la soglia', () => {
    expect(on({ last_activity_at: daysAgo(0) })).toBe('in_corso')
    expect(on({ last_activity_at: daysAgo(IDLE_DAYS - 1) })).toBe('in_corso')
  })

  it('non si fa ingannare da una data illeggibile', () => {
    expect(on({ last_activity_at: 'non-una-data' })).toBe('mai_iniziato')
  })
})

describe('tally', () => {
  it('conta le coorti presenti e le ordina per urgenza', () => {
    const result = tally([
      'in_corso',
      'esame_da_valutare',
      'in_corso',
      'qualificato',
      'bloccato',
    ])

    expect(result).toEqual([
      { cohort: 'esame_da_valutare', count: 1 },
      { cohort: 'bloccato', count: 1 },
      { cohort: 'in_corso', count: 2 },
      { cohort: 'qualificato', count: 1 },
    ])
  })

  it('non elenca coorti vuote', () => {
    expect(tally([])).toEqual([])
    expect(tally(['fermo']).map(r => r.cohort)).toEqual(['fermo'])
  })
})
