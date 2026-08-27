// Ruoli e permessi della console. Modulo volutamente senza dipendenze: lo
// importa anche `proxy.ts`, che gira nel runtime Edge e non puo' tirarsi
// dietro il client Supabase.
//
// Due ruoli, con un confine netto:
//
//   admin — tutto: iscritti newsletter, candidature, sospensioni,
//           cancellazioni GDPR, gestione dello staff.
//   coach — solo l'avanzamento dei trainer gia' ammessi e la valutazione
//           degli esami finali. Non ammette e non respinge candidati.
//
// `can()` e' l'unica fonte di verita' sui permessi: il proxy la usa per le
// rotte, le API route per le singole azioni, l'interfaccia per decidere
// quali pulsanti mostrare. Tre punti, una regola sola — nascondere un
// pulsante non e' un controllo di sicurezza, ma neanche riscrivere la
// tabella dei permessi in tre posti diversi lo e'.

export type StaffRole = 'admin' | 'coach'

/** Azioni sensibili della console, nominate una volta sola. */
export type Capability =
  | 'subscribers' // dashboard iscritti newsletter
  | 'review_applications' // approvare, respingere, sospendere, riattivare
  | 'delete_trainer_data' // cancellazione GDPR
  | 'review_progress' // leggere dossier e avanzamento
  | 'review_exams' // valutare l'esame finale
  | 'grant_attempts' // concedere un tentativo extra
  | 'preview_quizzes' // anteprima dei quiz
  | 'manage_staff' // creare e disattivare account di staff

const COACH_CAPABILITIES: Capability[] = [
  'review_progress',
  'review_exams',
  'grant_attempts',
  'preview_quizzes',
]

export function can(role: StaffRole, capability: Capability): boolean {
  return role === 'admin' || COACH_CAPABILITIES.includes(capability)
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  admin: 'Admin',
  coach: 'Coach',
}

/** Home della console per ruolo: il coach non ha accesso agli iscritti. */
export function staffHome(role: StaffRole): string {
  return role === 'admin' ? '/admin' : '/admin/trainer'
}

/**
 * Percorsi della console che un coach non deve nemmeno poter aprire.
 * Il resto di `/admin/*` e `/api/admin/*` gli e' concesso e viene poi
 * filtrato azione per azione da `can()`.
 */
const ADMIN_ONLY_PREFIXES = ['/admin/staff', '/api/admin/staff', '/api/admin/subscribers']

export function pathAllowed(role: StaffRole, pathname: string): boolean {
  if (role === 'admin') return true
  // La dashboard iscritti vive sulla radice esatta /admin: un confronto per
  // prefisso escluderebbe anche /admin/trainer.
  if (pathname === '/admin') return false
  return !ADMIN_ONLY_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
}
