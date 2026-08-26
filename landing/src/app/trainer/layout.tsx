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
          <Link href="/trainer" className="flex items-baseline gap-2 shrink-0">
            <span className="text-lg font-black tracking-tight">apulia.ai</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
              Trainer
            </span>
          </Link>
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
            Torna al sito
          </Link>
        </div>
      </footer>
    </div>
  )
}
