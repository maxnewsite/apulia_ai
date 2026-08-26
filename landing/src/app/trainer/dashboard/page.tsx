import Link from 'next/link'
import { redirect } from 'next/navigation'
import ConfirmEmailBanner from '@/components/trainer/ConfirmEmailBanner'
import { getCurriculum, REQUIRED_MODULES } from '@/lib/trainer'
import { getSessionProfile } from '@/lib/trainer-session'

export const dynamic = 'force-dynamic'

function PendingCard({ name }: { name: string }) {
  return (
    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8">
      <h2 className="text-xl font-bold mb-3">Candidatura in valutazione</h2>
      <p className="text-[#475569] mb-4">
        Ciao {name}, abbiamo ricevuto i tuoi dati e il CV. Un revisore sta verificando il
        materiale: ti scriviamo via email appena la candidatura viene approvata.
      </p>
      <p className="text-sm text-[#475569]">
        Fino ad allora i moduli formativi restano chiusi.
      </p>
    </div>
  )
}

function BlockedCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <p className="text-[#475569]">{body}</p>
    </div>
  )
}

export default async function TrainerDashboardPage() {
  const profile = await getSessionProfile()

  // Sessione valida ma nessun profilo: account creato fuori dal flusso di
  // candidatura. Meglio rimandarlo alla registrazione che mostrare un vuoto.
  if (!profile) redirect('/trainer/registrati')

  if (profile.status === 'pending') {
    return (
      <div className="max-w-3xl mx-auto px-5 py-14">
        {!profile.email_confirmed_at && <ConfirmEmailBanner email={profile.email} />}
        <PendingCard name={profile.full_name.split(' ')[0]} />
      </div>
    )
  }

  if (profile.status === 'rejected') {
    return (
      <div className="max-w-3xl mx-auto px-5 py-14">
        <BlockedCard
          title="Candidatura non accolta"
          body={
            profile.review_notes ??
            'La tua candidatura non è stata accolta. Scrivici se vuoi ricandidarti con un profilo aggiornato.'
          }
        />
      </div>
    )
  }

  if (profile.status === 'suspended') {
    return (
      <div className="max-w-3xl mx-auto px-5 py-14">
        <BlockedCard
          title="Accesso sospeso"
          body={profile.review_notes ?? 'Il tuo accesso è temporaneamente sospeso. Contattaci per riattivarlo.'}
        />
      </div>
    )
  }

  const curriculum = await getCurriculum(profile.id)
  const percent = curriculum.totalModules
    ? Math.round((curriculum.completedModules / curriculum.totalModules) * 100)
    : 0

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-3xl font-black tracking-tight mb-2">
        Ciao {profile.full_name.split(' ')[0]}
      </h1>
      <p className="text-[#475569] mb-8">
        {curriculum.completedModules} di {curriculum.totalModules} moduli completati
        {curriculum.totalModules < REQUIRED_MODULES && ' (altri in pubblicazione)'}.
      </p>

      <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden mb-12">
        <div
          className="h-full bg-[#2563EB] transition-all"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {curriculum.entries.length === 0 && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-8 text-[#475569]">
          I moduli non sono ancora stati pubblicati. Ti avvisiamo appena il percorso è online.
        </div>
      )}

      <ol className="space-y-3">
        {curriculum.entries.map(entry => {
          const { module, progress, unlocked, blocked } = entry
          const state = progress.passed
            ? { label: `Superato · ${progress.best_score}%`, className: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
            : blocked
              ? { label: 'Tentativi esauriti', className: 'text-red-700 bg-red-50 border-red-200' }
              : unlocked
                ? { label: `${progress.attempts_used}/${progress.attempts_allowed} tentativi`, className: 'text-[#2563EB] bg-blue-50 border-blue-200' }
                : { label: 'Bloccato', className: 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]' }

          const card = (
            <div
              className={`flex items-start gap-4 border rounded-2xl p-5 transition-colors ${
                unlocked ? 'border-[#E2E8F0] hover:border-[#2563EB]' : 'border-[#E2E8F0] opacity-60'
              }`}
            >
              <span className="font-mono text-sm font-bold text-[#2563EB] pt-0.5 w-7 shrink-0">
                {String(module.position).padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold leading-snug">{module.title}</h2>
                {module.summary && (
                  <p className="text-sm text-[#475569] mt-1">{module.summary}</p>
                )}
              </div>
              <span
                className={`text-xs font-semibold border rounded-full px-3 py-1 whitespace-nowrap ${state.className}`}
              >
                {state.label}
              </span>
            </div>
          )

          return (
            <li key={module.id}>
              {unlocked ? (
                <Link href={`/trainer/moduli/${module.slug}`} className="block">
                  {card}
                </Link>
              ) : (
                card
              )}
            </li>
          )
        })}
      </ol>

      <div className="mt-10 border border-[#E2E8F0] rounded-2xl p-6">
        <h2 className="font-bold mb-2">Esame finale</h2>
        <p className="text-sm text-[#475569] mb-4">
          {curriculum.examUnlocked
            ? 'Tutti i moduli sono superati: puoi sostenere l’esame di qualifica.'
            : curriculum.examReason}
        </p>
        <Link
          href="/trainer/esame"
          className={`inline-block font-semibold px-5 py-2.5 rounded-full text-sm transition-colors ${
            curriculum.examUnlocked
              ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
              : 'border border-[#E2E8F0] text-[#475569] hover:border-[#2563EB]'
          }`}
        >
          {curriculum.examUnlocked ? 'Vai all’esame' : 'Vedi i requisiti'}
        </Link>
      </div>
    </div>
  )
}
