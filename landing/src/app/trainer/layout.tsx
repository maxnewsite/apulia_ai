import type { Metadata } from 'next'
import Link from 'next/link'
import TrainerNav from '@/components/trainer/TrainerNav'

export const metadata: Metadata = {
  title: 'Trainer Academy — apulia.ai',
  description:
    'Area riservata ai trainer apulia.ai: percorso formativo sul metodo, quiz di modulo ed esame di qualifica.',
  robots: { index: false, follow: false },
}

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col">
      <header className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          {/* Il marchio e l'area sono due destinazioni diverse: "apulia.ai"
              riporta al sito pubblico, "Trainer" alla home dell'area. Prima
              erano un solo link e dall'area non si tornava indietro se non
              dal footer, in fondo alla pagina. */}
          <div className="flex items-baseline gap-2 shrink-0">
            <Link
              href="/"
              className="text-lg font-black tracking-tight hover:text-[#2563EB] transition-colors"
            >
              apulia.ai
            </Link>
            <span className="text-[#CBD5E1]" aria-hidden>
              /
            </span>
            <Link
              href="/trainer"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB] hover:underline"
            >
              Trainer
            </Link>
          </div>
          <TrainerNav />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#E2E8F0] mt-16">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#475569]">
          <span>© {new Date().getFullYear()} apulia.ai</span>
          <Link href="/privacy" className="hover:text-[#2563EB]">
            Informativa privacy
          </Link>
          <Link href="/" className="hover:text-[#2563EB]">
            Sito apulia.ai
          </Link>
          <Link href="/weekly" className="hover:text-[#2563EB]">
            Archivio newsletter
          </Link>
        </div>
      </footer>
    </div>
  )
}
