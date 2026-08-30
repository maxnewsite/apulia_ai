import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AccediForm from './AccediForm'
import { getReaderSession } from '@/lib/reader-session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Accedi all’archivio — apulia.ai',
  description:
    'Accesso riservato agli iscritti ad AI Europa Weekly: leggi tutte le edizioni precedenti della newsletter.',
  robots: { index: false, follow: true },
}

export default async function AccediPage() {
  // Chi ha già una sessione non ha nulla da fare qui.
  if (await getReaderSession()) redirect('/weekly')

  return (
    <>
      <Header />

      <main className="mx-auto max-w-md px-4 sm:px-6 pt-28 md:pt-36 pb-20">
        <header className="mb-8 text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-[#2563EB] font-bold mb-3">
            Area iscritti
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0F172A] leading-tight mb-3">
            Accedi all’archivio
          </h1>
          <p className="text-[#475569] leading-relaxed">
            Tutte le edizioni precedenti di AI Europa Weekly, riservate a chi è
            iscritto alla newsletter.
          </p>
        </header>

        <Suspense fallback={null}>
          <AccediForm />
        </Suspense>

        <div className="mt-10 text-center">
          <Link
            href="/weekly"
            className="text-sm text-[#475569] hover:text-[#0F172A] transition-colors"
          >
            Vedi l’elenco delle edizioni
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
