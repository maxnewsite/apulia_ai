'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/context/LanguageContext'

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const PlaceholderAvatar = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#0A1220]">
    <div className="w-16 h-16 rounded-full bg-[#E2E8F0] flex items-center justify-center">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    </div>
  </div>
)

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  title: string
  company: string
  photo: string
  linkedIn: string
  isFounder?: boolean
}

const TEAM: TeamMember[] = [
  {
    id: 'massimiliano-masi',
    firstName: 'Massimiliano',
    lastName: 'Masi',
    title: 'Founder',
    company: 'apulia.ai',
    photo: 'https://spiridione.com/images/image1.jpeg',
    linkedIn: 'https://www.linkedin.com/in/massimiliano-masi-4265ab',
    isFounder: true,
  },
  { id: 'antonio-capaldo',      firstName: 'Antonio',     lastName: 'Capaldo',      title: 'Titolo', company: 'Azienda', photo: '/team/antonio_capaldo.png',      linkedIn: '#' },
  { id: 'gabriele-catellani',   firstName: 'Gabriele',    lastName: 'Catellani',    title: 'Titolo', company: 'Azienda', photo: '/team/Gabriele_Catellani.jpg',   linkedIn: '#' },
  { id: 'chiara-de-caro',       firstName: 'Chiara',      lastName: 'De Caro',      title: 'Co-Founder & Managing Partner', company: 'AGCC', photo: '/team/Chiara_de_Caro.png', linkedIn: 'https://ae.linkedin.com/in/chiaradecaro' },
  { id: 'alberto-de-leo',       firstName: 'Alberto',     lastName: 'De Leo',       title: 'Titolo', company: 'Azienda', photo: '/team/alberto_de_leo.jpg',       linkedIn: '#' },
  { id: 'rosa-metra',           firstName: 'Rosa',        lastName: 'Metra',        title: 'Titolo', company: 'Azienda', photo: '/team/rosa_metra.jpg',           linkedIn: '#' },
  { id: 'fabrizio-palmiotti',   firstName: 'Fabrizio',    lastName: 'Palmiotti',    title: 'Titolo', company: 'Azienda', photo: '/team/Fabrizio_Palmiotti.jpg',   linkedIn: '#' },
  { id: 'alessandro-palmisano', firstName: 'Alessandro',  lastName: 'Palmisano',    title: 'Titolo', company: 'Azienda', photo: '/team/alessandro_palmisano.png', linkedIn: '#' },
  { id: 'maximilien-piaton',    firstName: 'Maximilien',  lastName: 'Piaton',       title: 'Titolo', company: 'Azienda', photo: '/team/maximilien_piaton.jpg',    linkedIn: '#' },
  { id: 'mario-pucciarelli',    firstName: 'Mario',       lastName: 'Pucciarelli',  title: 'Titolo', company: 'Azienda', photo: '/team/Mario_Pucciarelli.jpg',    linkedIn: '#' },
  { id: 'giampietro-sanna',     firstName: 'Giampietro',  lastName: 'Sanna',        title: 'Titolo', company: 'Azienda', photo: '/team/giampietro_sanna.jpg',     linkedIn: '#' },
  { id: 'mark-zaleski',         firstName: 'Mark',        lastName: 'Zaleski',      title: 'Titolo', company: 'Azienda', photo: '/team/Mark_Zalski.jpg',          linkedIn: '#' },
  { id: 'federico-zuin',        firstName: 'Federico',    lastName: 'Zuin',         title: 'Titolo', company: 'Azienda', photo: '/team/Federico_Zuin.jpg',        linkedIn: '#' },
  { id: 'p14', firstName: 'Nome', lastName: 'Cognome', title: 'Titolo', company: 'Azienda', photo: '', linkedIn: '#' },
  { id: 'p15', firstName: 'Nome', lastName: 'Cognome', title: 'Titolo', company: 'Azienda', photo: '', linkedIn: '#' },
  { id: 'p16', firstName: 'Nome', lastName: 'Cognome', title: 'Titolo', company: 'Azienda', photo: '', linkedIn: '#' },
]

function MemberCard({ member }: { member: TeamMember }) {
  const isPlaceholder = !member.isFounder && member.firstName === 'Nome'

  return (
    <div
      className={`group flex flex-col bg-[#F8FAFC] border rounded-2xl overflow-hidden transition-all duration-300 ${
        isPlaceholder
          ? 'border-[#E2E8F0]/50 opacity-50'
          : 'border-[#E2E8F0] hover:border-[#2563EB]/50 hover:shadow-lg hover:shadow-[#2563EB]/5'
      }`}
    >
      {/* Photo */}
      <div className="aspect-[3/4] overflow-hidden bg-[#0A1220] relative">
        {member.photo ? (
          <img
            src={member.photo}
            alt={`${member.firstName} ${member.lastName}`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <PlaceholderAvatar />
        )}
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex-1 min-w-0">
          <p className="text-[#0F172A] font-bold text-xs sm:text-sm leading-snug truncate">
            {member.firstName}
          </p>
          <p className="text-[#0F172A] font-bold text-xs sm:text-sm leading-snug truncate">
            {member.lastName}
          </p>
          <p className="text-[#2563EB] text-[10px] sm:text-xs font-semibold mt-1.5 truncate">
            {member.title}
          </p>
          <p className="text-[#475569] text-[10px] sm:text-xs mt-0.5 truncate">
            {member.company}
          </p>
        </div>

        {/* Logos row */}
        <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center gap-2.5">
          <a
            href={member.linkedIn}
            target={member.linkedIn === '#' ? undefined : '_blank'}
            rel={member.linkedIn === '#' ? undefined : 'noopener noreferrer'}
            aria-label={`LinkedIn di ${member.firstName} ${member.lastName}`}
            className="text-[#0A66C2] hover:opacity-75 transition-opacity flex-shrink-0"
            onClick={member.linkedIn === '#' ? (e) => e.preventDefault() : undefined}
          >
            <LinkedInIcon />
          </a>

          {member.isFounder && (
            <Link
              href="/chi-siamo/massimiliano-masi"
              aria-label="Profilo completo di Massimiliano Masi su apulia.ai"
              className="flex-shrink-0 hover:opacity-75 transition-opacity"
            >
              <Image
                src="/apulia_ai.webp"
                alt="apulia.ai"
                width={20}
                height={20}
                className="rounded-sm"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TeamPortfolioContent() {
  const { language } = useLanguage()

  const heading    = language === 'it' ? 'Chi siamo' : 'Our Team'
  const breadLabel = language === 'it' ? 'Chi siamo' : 'About'
  const intro      = language === 'it'
    ? "Il network apulia.ai si fonda su un gruppo di talenti consapevoli dell'importanza di mantenere le capacità umane al centro dell'accelerazione esponenziale dell'AI."
    : 'The apulia.ai network is built on a group of talents who understand the importance of keeping human capabilities at the centre of AI\'s exponential acceleration.'

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#475569]">
        <Link href="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-[#0F172A]">{breadLabel}</span>
      </nav>

      {/* Header */}
      <header className="mb-16 pb-10 border-b border-[#E2E8F0]">
        <div className="text-xs uppercase tracking-[0.18em] text-[#2563EB] font-bold mb-3">
          apulia.ai
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] leading-tight mb-6">
          {heading}
        </h1>
        <p className="text-xl text-[#475569] max-w-2xl leading-relaxed">{intro}</p>
      </header>

      {/* 4×4 Team Grid */}
      <section aria-label={language === 'it' ? 'Il team' : 'The team'}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 lg:gap-5">
          {TEAM.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

    </main>
  )
}
