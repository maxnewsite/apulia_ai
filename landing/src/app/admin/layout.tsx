import type { Metadata } from 'next'
import Link from 'next/link'
import StaffBadge from '@/components/admin/StaffBadge'

export const metadata: Metadata = {
  title: 'Admin — apulia.ai',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A]">
      {/* Barra d'identità: su ogni pagina della console, perché con due ruoli
          "manca un pulsante" e "sono entrato con l'account sbagliato" sono
          altrimenti indistinguibili. */}
      <div className="border-b border-[#E2E8F0] bg-white">
        <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-2 shrink-0">
            <Link
              href="/"
              className="text-sm font-black tracking-tight hover:text-[#2563EB] transition-colors"
            >
              apulia.ai
            </Link>
            <span className="text-[#CBD5E1]" aria-hidden>
              /
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#475569]">
              Console
            </span>
          </div>
          <StaffBadge />
        </div>
      </div>

      {children}
    </div>
  )
}
