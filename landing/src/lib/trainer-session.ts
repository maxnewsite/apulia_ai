// Helper di sessione per le rotte e le pagine dell'area trainer.

import { createSupabaseServerClient } from '@/lib/supabase-ssr'
import { getTrainerProfile, type TrainerProfile } from '@/lib/trainer'

/** Utente Supabase della richiesta corrente, o null. */
export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

/** Profilo trainer della sessione corrente, o null se non autenticato. */
export async function getSessionProfile(): Promise<TrainerProfile | null> {
  const userId = await getSessionUserId()
  if (!userId) return null
  return getTrainerProfile(userId)
}

export type Denial = { status: number; error: string }

/**
 * Profilo della sessione, ma solo se la candidatura è stata approvata.
 * Restituisce un oggetto Denial pronto da serializzare in caso contrario.
 */
export async function requireApprovedTrainer(): Promise<
  { profile: TrainerProfile; denial: null } | { profile: null; denial: Denial }
> {
  const profile = await getSessionProfile()

  if (!profile) {
    return { profile: null, denial: { status: 401, error: 'Sessione non valida. Accedi di nuovo.' } }
  }
  if (profile.status === 'pending') {
    return {
      profile: null,
      denial: { status: 403, error: 'La tua candidatura è ancora in valutazione.' },
    }
  }
  if (profile.status !== 'approved') {
    return {
      profile: null,
      denial: { status: 403, error: 'Il tuo accesso alla piattaforma non è attivo.' },
    }
  }
  return { profile, denial: null }
}
