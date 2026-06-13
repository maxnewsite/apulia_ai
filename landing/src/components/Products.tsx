'use client'

import { useLanguage } from '@/context/LanguageContext'

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function Products() {
  const { t } = useLanguage()
  const { weekly, monthly } = t.products

  return (
    <section
      id="products"
      className="py-24 relative overflow-hidden"
      aria-labelledby="products-heading"
    >
      {/* Background accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#2563EB] opacity-[0.03] blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            id="products-heading"
            className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-4 tracking-tight"
          >
            {t.products.sectionTitle}
          </h2>
          <p className="max-w-xl mx-auto text-[#475569] text-lg">
            {t.products.sectionSubtitle}
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* Weekly — free */}
          <article
            className="relative flex flex-col rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-8 hover:border-[#2563EB]/50 transition-all duration-300 group"
            aria-label={`${weekly.name} — ${weekly.badge}`}
          >
            {/* Badge */}
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#2563EB]/15 text-[#60A5FA] border border-[#2563EB]/25">
                {weekly.badge}
              </span>
              <span className="text-sm text-[#475569] font-medium">{weekly.frequency}</span>
            </div>

            {/* Name & description */}
            <h3 className="text-xl font-black text-[#0F172A] mb-2 group-hover:text-white transition-colors">
              {weekly.name}
            </h3>
            <p className="text-sm text-[#475569] mb-6 leading-relaxed flex-1">
              {weekly.description}
            </p>

            {/* Features */}
            <ul className="space-y-2.5 mb-8" aria-label={`${weekly.name} features`}>
              {weekly.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#475569]">
                  <CheckIcon />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Price + CTA */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-[#0F172A]">{weekly.price}</span>
              </div>
              <a
                href="#subscribe"
                className="block w-full text-center px-6 py-3 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-[#1D4ED8] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#2563EB]/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]"
              >
                {weekly.cta}
              </a>
            </div>
          </article>

          {/* Monthly — premium */}
          <article
            className="relative flex flex-col rounded-2xl bg-[#F8FAFC] border border-[#F59E0B]/30 p-8 hover:border-[#F59E0B]/60 transition-all duration-300 group glow-border"
            aria-label={`${monthly.name} — ${monthly.badge}`}
          >
            {/* Recommended glow top accent */}
            <div
              className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-[#F59E0B]/0 via-[#F59E0B] to-[#F59E0B]/0"
              aria-hidden="true"
            />

            {/* Badge */}
            <div className="mb-5 flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25">
                {monthly.badge}
              </span>
              <span className="text-sm text-[#475569] font-medium">{monthly.frequency}</span>
            </div>

            {/* Name & description */}
            <h3 className="text-xl font-black text-[#0F172A] mb-2 group-hover:text-white transition-colors">
              {monthly.name}
            </h3>
            <p className="text-sm text-[#475569] mb-6 leading-relaxed flex-1">
              {monthly.description}
            </p>

            {/* Features */}
            <ul className="space-y-2.5 mb-8" aria-label={`${monthly.name} features`}>
              {monthly.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#475569]">
                  <svg
                    className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Price + CTA */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-black text-[#0F172A]">{monthly.price}</span>
              </div>
              <p className="text-xs text-[#F59E0B]/70 mb-4 font-medium">{monthly.priceNote}</p>
              <a
                href="#subscribe"
                className="block w-full text-center px-6 py-3 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] font-semibold text-sm border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20 hover:border-[#F59E0B]/60 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]"
              >
                {monthly.cta}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
