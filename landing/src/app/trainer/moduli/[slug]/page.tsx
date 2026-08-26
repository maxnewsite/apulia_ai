import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getCurriculum, type ModuleResource } from '@/lib/trainer'
import { getSessionProfile } from '@/lib/trainer-session'

export const dynamic = 'force-dynamic'

const KIND_LABEL: Record<ModuleResource['kind'], string> = {
  pdf: 'PDF',
  slides: 'Slide',
  video: 'Video',
  link: 'Link',
}

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profile = await getSessionProfile()

  if (!profile) redirect('/trainer/login')
  if (profile.status !== 'approved') redirect('/trainer/dashboard')

  const curriculum = await getCurriculum(profile.id)
  const entry = curriculum.entries.find(e => e.module.slug === slug)

  if (!entry) notFound()
  if (!entry.unlocked) redirect('/trainer/dashboard')

  const { data } = await supabaseAdmin
    .from('trainer_module_resources')
    .select('id,position,kind,title,description,storage_path,external_url,duration_minutes')
    .eq('module_id', entry.module.id)
    .order('position')

  const resources = (data ?? []) as ModuleResource[]
  const { progress, quiz } = entry
  const attemptsLeft = Math.max(0, progress.attempts_allowed - progress.attempts_used)

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <Link href="/trainer/dashboard" className="text-sm text-[#475569] hover:text-[#2563EB]">
        ← Percorso
      </Link>

      <p className="text-xs font-mono font-bold text-[#2563EB] mt-6 mb-2">
        MODULO {String(entry.module.position).padStart(2, '0')}
      </p>
      <h1 className="text-3xl font-black tracking-tight mb-3">{entry.module.title}</h1>
      {entry.module.summary && <p className="text-[#475569] mb-10">{entry.module.summary}</p>}

      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#475569] mb-4">
        Materiali
      </h2>

      {resources.length === 0 ? (
        <p className="text-sm text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6">
          I materiali di questo modulo non sono ancora stati caricati.
        </p>
      ) : (
        <ul className="space-y-3">
          {resources.map(resource => (
            <li key={resource.id}>
              <a
                href={`/api/trainer/risorsa/${resource.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#2563EB] transition-colors"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider border border-[#E2E8F0] rounded-full px-2.5 py-1 text-[#475569] mt-0.5">
                  {KIND_LABEL[resource.kind]}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold">{resource.title}</span>
                  {resource.description && (
                    <span className="block text-sm text-[#475569] mt-1">{resource.description}</span>
                  )}
                </span>
                {resource.duration_minutes && (
                  <span className="text-xs text-[#475569] whitespace-nowrap mt-1">
                    {resource.duration_minutes} min
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12 border border-[#E2E8F0] rounded-2xl p-6">
        <h2 className="font-bold mb-2">Quiz del modulo</h2>

        {!quiz ? (
          <p className="text-sm text-[#475569]">Il quiz di questo modulo non è ancora disponibile.</p>
        ) : progress.passed ? (
          <p className="text-sm text-emerald-700">
            Modulo superato con il {progress.best_score}%. Puoi rivedere i materiali quando vuoi.
          </p>
        ) : entry.blocked ? (
          <p className="text-sm text-red-700">
            Hai esaurito i {progress.attempts_allowed} tentativi disponibili. Contatta un revisore
            per richiedere uno sblocco.
          </p>
        ) : (
          <>
            <p className="text-sm text-[#475569] mb-4">
              Servono almeno il {quiz.pass_score}% di risposte corrette.{' '}
              {attemptsLeft === 1
                ? 'Ti resta un solo tentativo.'
                : `Ti restano ${attemptsLeft} tentativi.`}
            </p>
            <Link
              href={`/trainer/moduli/${slug}/quiz`}
              className="inline-block bg-[#2563EB] text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#1D4ED8] transition-colors"
            >
              {progress.attempts_used > 0 ? 'Riprova il quiz' : 'Inizia il quiz'}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
