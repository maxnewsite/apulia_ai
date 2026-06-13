import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — apulia.ai',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0F172A]">
      {children}
    </div>
  )
}
