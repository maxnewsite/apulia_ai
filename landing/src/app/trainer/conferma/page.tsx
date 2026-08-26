import Link from 'next/link'

export const dynamic = 'force-dynamic'

const COPY: Record<string, { title: string; body: string; tone: string }> = {
  ok: {
    title: 'Indirizzo confermato',
    body: 'Grazie. La tua candidatura è ora completa e può essere valutata da un revisore: ti scriviamo appena c’è un esito.',
    tone: 'border-emerald-200 bg-emerald-50',
  },
  'gia-confermato': {
    title: 'Indirizzo già confermato',
    body: 'Questo indirizzo risultava già verificato. Non devi fare altro.',
    tone: 'border-[#E2E8F0] bg-[#F8FAFC]',
  },
  'non-valido': {
    title: 'Link non valido',
    body: 'Il link di conferma non è valido. Accedi alla tua area e richiedine uno nuovo.',
    tone: 'border-amber-200 bg-amber-50',
  },
  errore: {
    title: 'Errore',
    body: 'Qualcosa è andato storto durante la conferma. Riprova tra qualche minuto.',
    tone: 'border-red-200 bg-red-50',
  },
}

export default async function ConfermaPage({
  searchParams,
}: {
  searchParams: Promise<{ stato?: string }>
}) {
  const { stato } = await searchParams
  const copy = COPY[stato ?? ''] ?? COPY['non-valido']

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <div className={`border rounded-2xl p-8 ${copy.tone}`}>
        <h1 className="text-2xl font-black tracking-tight mb-3">{copy.title}</h1>
        <p className="text-[#475569] mb-6">{copy.body}</p>
        <Link
          href="/trainer/dashboard"
          className="inline-block bg-[#2563EB] text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-[#1D4ED8] transition-colors"
        >
          Vai alla tua area
        </Link>
      </div>
    </div>
  )
}
