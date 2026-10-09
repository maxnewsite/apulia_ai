import Header from '@/components/Header'
import Hero from '@/components/Hero'
import StatsBar from '@/components/StatsBar'
import SourceTicker from '@/components/SourceTicker'
import HowItWorks from '@/components/HowItWorks'
import Products from '@/components/Products'
import Audience from '@/components/Audience'
import LatestIssue from '@/components/LatestIssue'
import FAQ from '@/components/FAQ'
import SubscribeForm from '@/components/SubscribeForm'
import SisterPublication from '@/components/SisterPublication'
import Footer from '@/components/Footer'
import { faqSchema } from '@/components/SchemaOrg'
import type { Metadata } from 'next'

// Il canonical vive in ogni pagina: definito nel layout verrebbe ereditato
// da tutte le pagine che non lo sovrascrivono, puntandole alla home.
export const metadata: Metadata = {
  alternates: { canonical: 'https://apulia.ai' },
}

// LatestIssue legge l'ultima edizione da Supabase: senza revalidate la home
// viene prerenderizzata al build e resta ferma all'edizione di quel momento.
export const revalidate = 300

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#2563EB] focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>
      <Header />
      <main
        id="main-content"
        itemScope
        itemType="https://schema.org/Organization"
      >
        <article>
          <Hero />
          <StatsBar />
          <SourceTicker />
          <HowItWorks />
          <Products />
          <Audience />
          <LatestIssue />
          <FAQ />
          <SisterPublication />
          <SubscribeForm />
        </article>
      </main>
      <Footer />
    </>
  )
}
