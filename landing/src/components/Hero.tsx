'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24"
      aria-labelledby="hero-heading"
    >
      {/* Background glow effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#2563EB] opacity-[0.06] blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-[#F59E0B] opacity-[0.04] blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(37,99,235,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC]/80 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" aria-hidden="true" />
          <span className="text-xs font-semibold text-[#475569] uppercase tracking-widest">
            {t.hero.tagline}
          </span>
        </div>

        {/* Main headline */}
        <h1
          id="hero-heading"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-[#0F172A] leading-[1.08] mb-4"
        >
          {t.hero.headline}
          <br />
          <span className="bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#F59E0B] bg-clip-text text-transparent">
            {t.hero.headlineHighlight}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-[#475569] leading-relaxed font-light">
          {t.hero.subtitle}
        </p>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <a
            href="#subscribe"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#2563EB] text-white text-base font-bold hover:bg-[#1D4ED8] active:scale-95 transition-all duration-200 shadow-lg shadow-[#2563EB]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFFFF]"
            aria-label={t.hero.cta}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {t.hero.cta}
          </a>
        </div>

        {/* Trust note */}
        <p className="mt-4 text-sm text-[#475569]/70">{t.hero.ctaSubtext}</p>
      </div>
    </section>
  )
}
