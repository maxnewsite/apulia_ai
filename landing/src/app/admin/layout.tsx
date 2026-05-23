import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — apulia.ai',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050A14] text-[#F0F4FF]">
      {children}
    </div>
  )
}
