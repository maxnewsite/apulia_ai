import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conferma iscrizione — apulia.ai',
  robots: { index: false, follow: false },
}

type Status = 'ok' | 'already' | 'invalid' | 'error' | undefined

type SearchParams = Promise<{ status?: string }>

const COPY: Record<
  Exclude<Status, undefined>,
  { title: string; body: string; cta: string }
> = {
  ok: {
    title: 'Iscrizione confermata',
    body: "Grazie! Riceverai AI Europa Weekly ogni domenica pomeriggio. La prossima edizione arriverà nella tua inbox.",
    cta: 'Vai alla home',
  },
  already: {
    title: 'Sei già iscritto',
    body: 'Il tuo indirizzo email risulta già confermato. Non devi fare altro.',
    cta: 'Vai alla home',
  },
  invalid: {
    title: 'Link non valido',
    body: 'Il link di conferma non è valido o è già stato usato. Prova a iscriverti di nuovo dalla home page.',
    cta: 'Iscriviti',
  },
  error: {
    title: 'Errore',
    body: 'Qualcosa è andato storto durante la conferma. Riprova tra qualche secondo o contattaci.',
    cta: 'Riprova',
  },
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { status } = await searchParams
  const key = (status as Exclude<Status, undefined>) || 'invalid'
  const copy = COPY[key] || COPY.invalid
  const isOk = key === 'ok' || key === 'already'

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A] flex flex-col">
      <header className="border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link
            href="/"
            className="text-xl font-black text-[#0F172A] hover:text-[#2563EB] transition-colors"
          >
            apulia.ai
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div
          role="status"
          aria-live="polite"
          className="w-full max-w-md bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-10 text-center"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E2E8F0] mb-6 mx-auto"
            aria-hidden="true"
          >
            {isOk ? (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M6 16l8 8L26 8"
                  stroke="#2563EB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 8v10M16 22v2"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-black mb-3">{copy.title}</h1>
          <p className="text-[#475569] mb-8">{copy.body}</p>
          <Link
            href={key === 'invalid' || key === 'error' ? '/#subscribe' : '/'}
            className="inline-block px-6 py-3 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1d4ed8] transition-colors text-sm"
          >
            {copy.cta}
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-center">
          <span className="text-[#475569] text-xs">
            &copy; 2026 apulia.ai —{' '}
            <Link
              href="/privacy"
              className="hover:text-[#0F172A] transition-colors underline"
            >
              Privacy Policy
            </Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
