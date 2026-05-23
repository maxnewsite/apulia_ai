import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChiSiamoContent from './ChiSiamoContent'

export const metadata: Metadata = {
  title: 'Chi siamo — Massimiliano Masi | apulia.ai',
  description:
    "apulia.ai è fondata da Massimiliano Masi, nato a Bari, ex Partner di Boston Consulting Group con 25 anni di esperienza in strategia, finanza e leadership. Una newsletter indipendente sull'AI europea per chi decide.",
  alternates: {
    canonical: 'https://apulia.ai/chi-siamo',
    languages: {
      'it-IT': 'https://apulia.ai/chi-siamo',
      'en-GB': 'https://apulia.ai/chi-siamo',
    },
  },
  openGraph: {
    title: 'Chi siamo — Massimiliano Masi | apulia.ai',
    description:
      "Ex Partner BCG, nato a Bari, advisor C-Level e coach certificato. apulia.ai nasce dalla passione per la Puglia e dalla necessità di analisi rigorosa sull'intelligenza artificiale europea.",
    type: 'profile',
    url: 'https://apulia.ai/chi-siamo',
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://apulia.ai/#massimiliano-masi',
  name: 'Massimiliano Masi',
  jobTitle: 'Founder, apulia.ai',
  birthPlace: {
    '@type': 'City',
    name: 'Bari',
    containedInPlace: { '@type': 'Country', name: 'Italy' },
  },
  description:
    'Ex Partner di Boston Consulting Group, advisor C-Level e coach certificato con 25 anni di esperienza in strategia, finanza e leadership nel settore energia e utilities.',
  url: 'https://spiridione.com',
  sameAs: [
    'https://spiridione.com',
    'https://www.linkedin.com/in/massimiliano-masi-4265ab',
  ],
  worksFor: { '@id': 'https://apulia.ai/#organization' },
  alumniOf: [
    { '@type': 'Organization', name: 'Boston Consulting Group' },
    { '@type': 'Organization', name: 'National University of Singapore, NUS Business School' },
  ],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Certified Professional Coach',
      credentialCategory: 'Professional Certification',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Institute for Professional Excellence in Coaching (iPEC)',
      },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'ELI Master Practitioner',
      credentialCategory: 'Professional Certification',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Senior Executive Programme in AI Adoption',
      credentialCategory: 'Executive Education',
      recognizedBy: {
        '@type': 'Organization',
        name: 'NUS Business School, National University of Singapore',
      },
    },
  ],
  knowsAbout: [
    'Intelligenza Artificiale',
    'EU AI Act',
    'Strategia AI',
    'Trasformazione Digitale',
    'Transizione Energetica',
    'Corporate Finance',
    'C-Level Advisory',
  ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Header />
      <ChiSiamoContent />
      <Footer />
    </>
  )
}
