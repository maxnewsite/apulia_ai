import Link from 'next/link'
import { redirect } from 'next/navigation'
import ExamClient from '@/components/trainer/ExamClient'
import { getSessionProfile } from '@/lib/trainer-session'

export const dynamic = 'force-dynamic'

export default async function ExamPage() {
  const profile = await getSessionProfile()

  if (!profile) redirect('/trainer/login')
  if (profile.status !== 'approved') redirect('/trainer/dashboard')

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <Link href="/trainer/dashboard" className="text-sm text-[#475569] hover:text-[#2563EB]">
        ← Percorso
      </Link>

      <h1 className="text-3xl font-black tracking-tight mt-6 mb-8">Esame finale</h1>

      <ExamClient />
    </div>
  )
}
