import Link from 'next/link'
import { listQuizzesForPreview } from '@/lib/trainer-preview'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Anteprima quiz — apulia.ai',
  robots: { index: false, follow: false },
}

/**
 * Elenco dei quiz con lo stato del pool. È il punto da cui provare un quiz
 * senza essere un trainer: nessun tentativo viene registrato e i quiz non
 * pubblicati sono raggiungibili come gli altri.
 */
export default async function AdminQuizIndexPage() {
  const quizzes = await listQuizzesForPreview()
  const moduli = quizzes.filter(q => q.kind === 'module')
  const esame = quizzes.filter(q => q.kind === 'exam')

  function row(quiz: (typeof quizzes)[number]) {
    const estratte = quiz.questions_per_attempt ?? quiz.pool_size
    const pronto = quiz.pool_size >= Math.max(1, estratte)

    return (
      <li key={quiz.id}>
        <Link
          href={`/admin/trainer/quiz/${quiz.id}`}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#2563EB] transition-colors"
        >
          <span className="font-mono text-sm font-bold text-[#2563EB] w-7 shrink-0">
            {quiz.module ? String(quiz.module.position).padStart(2, '0') : '—'}
          </span>
          <span className="flex-1 min-w-[16rem]">
            <span className="block font-bold leading-snug">{quiz.title}</span>
            <span className="block text-xs text-[#475569] mt-1">
              {quiz.pool_size} domande nel pool · {estratte} estratte per tentativo · soglia{' '}
              {quiz.pass_score}%
              {quiz.time_limit_minutes ? ` · ${quiz.time_limit_minutes} min` : ''}
            </span>
          </span>
          <span
            className={`text-xs font-semibold border rounded-full px-3 py-1 whitespace-nowrap ${
              quiz.is_published
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            {quiz.is_published ? 'Pubblicato' : 'Non pubblicato'}
          </span>
          <span
            className={`text-xs font-semibold border rounded-full px-3 py-1 whitespace-nowrap ${
              pronto
                ? 'text-[#2563EB] bg-blue-50 border-blue-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}
          >
            {pronto ? 'Provalo' : 'Pool incompleto'}
          </span>
        </Link>
      </li>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-black tracking-tight">Anteprima quiz</h1>
        <div className="flex gap-4 text-sm">
          <Link href="/admin/trainer" className="text-[#475569] hover:text-[#2563EB]">
            ← Candidature
          </Link>
          <Link href="/trainer" className="text-[#475569] hover:text-[#2563EB]">
            Area trainer →
          </Link>
        </div>
      </div>

      <p className="text-sm text-[#475569] mb-8 max-w-2xl">
        Ogni prova estrae un campione nuovo dal pool e mescola le opzioni, esattamente come un
        tentativo vero. La correzione usa le stesse regole del quiz reale, ma{' '}
        <strong>non viene registrato alcun tentativo</strong>: nessun trainer viene toccato, e i
        quiz non ancora pubblicati si possono provare comunque.
      </p>

      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#475569] mb-4">
        Quiz di modulo
      </h2>
      {moduli.length === 0 ? (
        <p className="text-sm text-[#475569] border border-[#E2E8F0] rounded-2xl p-6">
          Nessun quiz di modulo a database: esegui i seed in <code>supabase/</code>.
        </p>
      ) : (
        <ul className="space-y-3">{moduli.map(row)}</ul>
      )}

      {esame.length > 0 && (
        <>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#475569] mt-10 mb-4">
            Esame finale
          </h2>
          <ul className="space-y-3">{esame.map(row)}</ul>
        </>
      )}
    </div>
  )
}
