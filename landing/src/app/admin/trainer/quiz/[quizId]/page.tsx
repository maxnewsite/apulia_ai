import Link from 'next/link'
import { notFound } from 'next/navigation'
import QuizPreviewRunner from '@/components/trainer/QuizPreviewRunner'
import { getQuizForPreview } from '@/lib/trainer-preview'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Anteprima quiz — apulia.ai',
  robots: { index: false, follow: false },
}

export default async function AdminQuizPreviewPage({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const { quizId } = await params
  const quiz = await getQuizForPreview(quizId)
  if (!quiz) notFound()

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/trainer/quiz" className="text-sm text-[#475569] hover:text-[#2563EB]">
          ← Tutti i quiz
        </Link>
        {quiz.module && (
          <Link
            href={`/trainer/moduli/${quiz.module.slug}`}
            className="text-sm text-[#475569] hover:text-[#2563EB]"
          >
            Modulo nell&apos;area trainer →
          </Link>
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB] mt-6 mb-2">
        Anteprima · nessun tentativo registrato
      </p>
      <h1 className="text-3xl font-black tracking-tight mb-8">{quiz.title}</h1>

      <QuizPreviewRunner quizId={quiz.id} />
    </div>
  )
}
