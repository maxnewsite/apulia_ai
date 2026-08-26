import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireApprovedTrainer } from '@/lib/trainer-session'
import { getCurriculum } from '@/lib/trainer'

export const runtime = 'nodejs'

/** Durata della signed URL: abbastanza per aprire il file, non per condividerlo. */
const SIGNED_URL_SECONDS = 120

/**
 * Apre una risorsa di modulo. I PDF e le slide vivono in un bucket privato:
 * il link firmato viene generato solo dopo aver verificato che il trainer sia
 * approvato e che il modulo sia effettivamente sbloccato per lui.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ resourceId: string }> },
) {
  const { profile, denial } = await requireApprovedTrainer()
  if (denial) return NextResponse.json({ error: denial.error }, { status: denial.status })

  const { resourceId } = await context.params

  const { data: resource } = await supabaseAdmin
    .from('trainer_module_resources')
    .select('id,module_id,kind,storage_path,external_url')
    .eq('id', resourceId)
    .maybeSingle()

  if (!resource)
    return NextResponse.json({ error: 'Risorsa non trovata.' }, { status: 404 })

  const curriculum = await getCurriculum(profile.id)
  const entry = curriculum.entries.find(e => e.module.id === resource.module_id)

  if (!entry)
    return NextResponse.json({ error: 'Modulo non disponibile.' }, { status: 404 })
  if (!entry.unlocked)
    return NextResponse.json({ error: 'Devi prima superare i moduli precedenti.' }, { status: 403 })

  // Registra l'apertura: è ciò su cui il revisore giudica l'impegno reale.
  // Fire-and-forget: un errore di log non deve impedire l'accesso al materiale.
  const { error: viewError } = await supabaseAdmin.from('trainer_resource_views').insert({
    trainer_id: profile.id,
    resource_id: resource.id,
    module_id: resource.module_id,
  })
  if (viewError) console.error('resource view log failed:', viewError.message)

  if (resource.kind === 'video' || resource.kind === 'link') {
    return NextResponse.redirect(resource.external_url!)
  }

  const { data, error } = await supabaseAdmin.storage
    .from('trainer-materials')
    .createSignedUrl(resource.storage_path!, SIGNED_URL_SECONDS)

  if (error || !data?.signedUrl) {
    console.error('signed url error:', error?.message)
    return NextResponse.json({ error: 'File non disponibile.' }, { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
