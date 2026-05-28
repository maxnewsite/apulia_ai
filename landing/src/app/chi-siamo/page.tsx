import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TeamPortfolioContent from './TeamPortfolioContent'

export const metadata: Metadata = {
  title: 'Chi siamo — Il team | apulia.ai',
  description:
    "Il team di apulia.ai: le persone che guidano la newsletter indipendente sull'intelligenza artificiale europea per chi decide.",
  alternates: {
    canonical: 'https://apulia.ai/chi-siamo',
    languages: {
      'it-IT': 'https://apulia.ai/chi-siamo',
      'en-GB': 'https://apulia.ai/chi-siamo',
    },
  },
  openGraph: {
    title: 'Chi siamo — Il team | apulia.ai',
    description:
      "Il team di apulia.ai: le persone che guidano la newsletter indipendente sull'intelligenza artificiale europea.",
    type: 'website',
    url: 'https://apulia.ai/chi-siamo',
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://apulia.ai/' },
    { '@type': 'ListItem', position: 2, name: 'Chi siamo', item: 'https://apulia.ai/chi-siamo' },
  ],
}

export default function ChiSiamoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <TeamPortfolioContent />
      <Footer />
    </>
  )
}
