'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function SisterPublication() {
  const { language } = useLanguage()
  const isEn = language === 'en'

  return (
    <section
      className="py-16 border-t border-[#1E3A5F]/40"
      aria-labelledby="sister-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 p-8 md:p-10 rounded-2xl border border-[#1E3A5F] bg-[#0F1A2E]">

          <div className="flex-1">
            <div className="text-xs uppercase tracking-[0.18em] text-[#F59E0B] font-bold mb-3">
              {isEn ? 'Also from the same editorial network' : 'Dalla stessa rete editoriale'}
            </div>
            <h2 id="sister-heading" className="text-2xl md:text-3xl font-black text-[#F0F4FF] mb-3">
              kalym.me
            </h2>
            <p className="text-[#94A3B8] leading-relaxed max-w-xl">
              {isEn
                ? 'Middle East AI Intelligence: strategic analysis on artificial intelligence across the MENA region. Policy, capital flows, sovereign AI programmes and key players in the Arab world — every week.'
                : 'La newsletter sull\'intelligenza artificiale nel Medio Oriente e area MENA. Policy, flussi di capitale, programmi di AI sovrana e protagonisti del mondo arabo — ogni settimana.'}
            </p>
          </div>

          <div className="flex-shrink-0">
            <a
              href="https://kalym.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#F59E0B]/40 text-[#F59E0B] font-semibold text-sm hover:bg-[#F59E0B]/10 transition-colors"
            >
              {isEn ? 'Discover kalym.me' : 'Scopri kalym.me'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}
