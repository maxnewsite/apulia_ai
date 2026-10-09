import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChiSiamoContent from '../ChiSiamoContent'
import { FOUNDER, founderRef } from '@/lib/seo-entities'

export const metadata: Metadata = {
  title: 'Massimiliano Masi — Founder | apulia.ai',
  description:
    "Massimiliano Masi, fondatore di apulia.ai. Ex Partner di Boston Consulting Group con 25 anni di esperienza in strategia, finanza e leadership. Advisor C-Level e coach certificato iPEC.",
  alternates: {
    canonical: 'https://apulia.ai/chi-siamo/massimiliano-masi',
  },
  openGraph: {
    title: 'Massimiliano Masi — Founder | apulia.ai',
    description:
      "Ex Partner BCG, nato a Bari, advisor C-Level e coach certificato. apulia.ai nasce dalla passione per la Puglia e dalla necessità di analisi rigorosa sull'intelligenza artificiale europea.",
    type: 'profile',
    url: 'https://apulia.ai/chi-siamo/massimiliano-masi',
  },
}

const personSchema = {
  '@context': 'https://schema.org',
  ...founderRef,
  mainEntityOfPage: FOUNDER.url,
  birthPlace: {
    '@type': 'City',
    name: 'Bari',
    containedInPlace: { '@type': 'Country', name: 'Italy' },
  },
  description:
    'Ex Partner di Boston Consulting Group, advisor C-Level e coach certificato con 25 anni di esperienza in strategia, finanza e leadership nel settore energia e utilities.',
  sameAs: [FOUNDER.linkedin, 'https://spiridione.com'],
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
    { '@type': 'ListItem', position: 3, name: 'Massimiliano Masi', item: 'https://apulia.ai/chi-siamo/massimiliano-masi' },
  ],
}

export default function MassimilianoMasiPage() {
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
      <ChiSiamoContent isSubPage />
      <Footer />
    </>
  )
}
