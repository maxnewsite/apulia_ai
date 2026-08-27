// Come sta andando ciascun trainer, in una parola sola.
//
// Il filtro per stato della candidatura risponde a "chi devo ancora
// ammettere". Non risponde a "chi si è fermato", "chi sta per finire", "chi
// aspetta una mia valutazione" — che è il lavoro quotidiano di chi segue una
// classe. Questa funzione traduce avanzamento, attività e stato dell'esame in
// una singola coorte, e la console ci costruisce sopra i contatori.
//
// È pura: nessuna query, nessun `Date.now()` implicito. Il momento di
// riferimento si passa, così i test non dipendono dall'orologio.

export type Cohort =
  | 'da_valutare' // candidatura ancora da esaminare
  | 'non_ammesso'
  | 'sospeso'
  | 'mai_iniziato' // ammesso, ma non ha mai aperto nulla
  | 'in_corso' // sta avanzando
  | 'fermo' // ammesso e avviato, ma inattivo da troppo tempo
  | 'bloccato' // tentativi esauriti su un modulo: serve uno sblocco
  | 'esame_da_valutare' // ha consegnato: la palla è al revisore
  | 'integrazioni' // il revisore ha chiesto di integrare: palla al candidato
  | 'esame_respinto'
  | 'qualificato'

export interface CohortInput {
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  modules_passed: number
  modules_total: number
  exam_status: string | null
  /** Ultimo segno di vita: tentativo o apertura di un materiale. */
  last_activity_at: string | null
  /** Almeno un modulo con i tentativi esauriti e non superato. */
  blocked: boolean
}

/** Giorni senza attività oltre i quali un trainer avviato è considerato fermo. */
export const IDLE_DAYS = 14

export const COHORT_LABEL: Record<Cohort, string> = {
  da_valutare: 'Candidatura da valutare',
  non_ammesso: 'Non ammesso',
  sospeso: 'Sospeso',
  mai_iniziato: 'Mai iniziato',
  in_corso: 'In corso',
  fermo: `Fermo da oltre ${IDLE_DAYS} giorni`,
  bloccato: 'Bloccato — tentativi esauriti',
  esame_da_valutare: 'Esame da valutare',
  integrazioni: 'Integrazioni richieste',
  esame_respinto: 'Esame respinto',
  qualificato: 'Qualificato',
}

/** Ordine in cui presentare le coorti: prima ciò che richiede un'azione. */
export const COHORT_ORDER: Cohort[] = [
  'esame_da_valutare',
  'bloccato',
  'fermo',
  'integrazioni',
  'in_corso',
  'mai_iniziato',
  'qualificato',
  'esame_respinto',
  'da_valutare',
  'sospeso',
  'non_ammesso',
]

export function daysSince(iso: string | null, now: number): number | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return null
  return Math.floor((now - then) / 86_400_000)
}

/**
 * Una coorte sola per trainer, con questa precedenza:
 *
 *  1. stato della candidatura, quando non è "ammesso" — un sospeso non è
 *     "fermo", è sospeso, e mostrarlo tra gli inattivi farebbe inseguire
 *     qualcuno che è stato fermato apposta;
 *  2. esito dell'esame, che chiude il percorso;
 *  3. blocco sui tentativi, che richiede un intervento esplicito;
 *  4. attività recente.
 */
export function classify(input: CohortInput, now: number = Date.now()): Cohort {
  if (input.status === 'pending') return 'da_valutare'
  if (input.status === 'rejected') return 'non_ammesso'
  if (input.status === 'suspended') return 'sospeso'

  switch (input.exam_status) {
    case 'qualified':
      return 'qualificato'
    case 'rejected':
      return 'esame_respinto'
    case 'needs_work':
      return 'integrazioni'
    case 'submitted':
    case 'under_review':
      return 'esame_da_valutare'
  }

  if (input.blocked) return 'bloccato'

  const idle = daysSince(input.last_activity_at, now)
  // Nessuna attività registrata: non ha mai aperto un materiale né aperto un
  // quiz. È diverso da "fermo" — non c'è nulla da riprendere, va avviato.
  if (idle === null) return 'mai_iniziato'

  return idle >= IDLE_DAYS ? 'fermo' : 'in_corso'
}

/** Conteggio per coorte, nell'ordine di presentazione. */
export function tally(cohorts: Cohort[]): { cohort: Cohort; count: number }[] {
  const counts = new Map<Cohort, number>()
  for (const c of cohorts) counts.set(c, (counts.get(c) ?? 0) + 1)
  return COHORT_ORDER.filter(c => counts.has(c)).map(c => ({ cohort: c, count: counts.get(c)! }))
}
