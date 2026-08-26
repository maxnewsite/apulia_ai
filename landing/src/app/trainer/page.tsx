import Link from 'next/link'
import { REQUIRED_MODULES } from '@/lib/trainer'

const STEPS = [
  {
    title: 'Candidatura',
    body: 'Dati di base, CV e una motivazione. Bastano cinque minuti.',
  },
  {
    title: 'Verifica',
    body: 'Un revisore controlla il materiale caricato e conferma che il profilo sia idoneo.',
  },
  {
    title: 'Formazione',
    body: `${REQUIRED_MODULES} moduli con slide, PDF e video. Ogni modulo si chiude con un quiz di 10 domande: 3 tentativi, si passa all’80%.`,
  },
  {
    title: 'Esame di qualifica',
    body: 'Domande finali più un video e i materiali richiesti, valutati da un revisore.',
  },
]

export default function TrainerLandingPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB] mb-4">
        Area riservata
      </p>
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-5">
        Diventa trainer certificato del metodo apulia.ai
      </h1>
      <p className="text-lg text-[#475569] max-w-2xl mb-10">
        Un percorso strutturato per chi porta l&apos;intelligenza artificiale dentro le imprese:
        il nostro metodo, i casi d&apos;uso che funzionano, la normativa e la gestione del
        cambiamento. Al termine, la qualifica di trainer apulia.ai.
      </p>

      <div className="flex flex-wrap gap-3 mb-16">
        <Link
          href="/trainer/registrati"
          className="bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1D4ED8] transition-colors"
        >
          Candidati come trainer
        </Link>
        <Link
          href="/trainer/login"
          className="border border-[#E2E8F0] font-semibold px-6 py-3 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
        >
          Ho già un account
        </Link>
      </div>

      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#475569] mb-6">
        Come funziona
      </h2>
      <ol className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <li key={step.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6">
            <div className="text-xs font-mono font-bold text-[#2563EB] mb-2">
              {String(i + 1).padStart(2, '0')}
            </div>
            <h3 className="font-bold mb-2">{step.title}</h3>
            <p className="text-sm text-[#475569]">{step.body}</p>
          </li>
        ))}
      </ol>

      <p className="text-sm text-[#475569] mt-10">
        L&apos;accesso ai materiali è concesso solo dopo l&apos;approvazione della candidatura.
        I dati e i documenti che carichi sono trattati secondo l&apos;
        <Link href="/privacy" className="text-[#2563EB] hover:underline">
          informativa privacy
        </Link>
        .
      </p>
    </div>
  )
}
