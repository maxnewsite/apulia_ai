import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import QuizRunner from '@/components/trainer/QuizRunner'
import { getCurriculum } from '@/lib/trainer'
import { getSessionProfile } from '@/lib/trainer-session'

export const dynamic = 'force-dynamic'

export default async function ModuleQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const profile = await getSessionProfile()

  if (!profile) redirect('/trainer/login')
  if (profile.status !== 'approved') redirect('/trainer/dashboard')

  const curriculum = await getCurriculum(profile.id)
  const entry = curriculum.entries.find(e => e.module.slug === slug)

  if (!entry) notFound()
  if (!entry.unlocked) redirect('/trainer/dashboard')
  if (!entry.quiz) redirect(`/trainer/moduli/${slug}`)

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <Link href={`/trainer/moduli/${slug}`} className="text-sm text-[#475569] hover:text-[#2563EB]">
        ← {entry.module.title}
      </Link>

      <h1 className="text-3xl font-black tracking-tight mt-6 mb-8">{entry.quiz.title}</h1>

      <QuizRunner quizId={entry.quiz.id} moduleSlug={slug} />
    </div>
  )
}
