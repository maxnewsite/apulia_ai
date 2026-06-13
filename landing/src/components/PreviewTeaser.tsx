'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function PreviewTeaser() {
  const { t } = useLanguage()
  const p = t.preview

  return (
    <section
      id="preview"
      className="py-24 relative overflow-hidden"
      aria-labelledby="preview-heading"
    >
      {/* Background */}
      <div
        className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-[#2563EB] opacity-[0.04] blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            id="preview-heading"
            className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-4 tracking-tight"
          >
            {p.sectionTitle}
          </h2>
        </div>

        {/* Newsletter card */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden shadow-2xl shadow-black/40">
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#FFFFFF]/50">
            <div className="flex items-center gap-2.5">
              {/* Fake browser dots */}
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-3 h-3 rounded-full bg-red-500/40" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <span className="w-3 h-3 rounded-full bg-green-500/40" />
              </div>
            </div>
            <span className="text-xs font-semibold text-[#475569] bg-[#E2E8F0]/50 px-3 py-1 rounded-full">
              {p.badge}
            </span>
          </div>

          {/* Email content simulation */}
          <div className="p-6 sm:p-8">
            {/* From line */}
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-8 h-8 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <svg className="w-4 h-4 text-[#2563EB]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0F172A]">apulia.ai</p>
                <p className="text-xs text-[#475569]">newsletter@apulia.ai</p>
              </div>
            </div>

            {/* Subject / headline */}
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mb-6 leading-snug">
              {p.headline}
            </h3>

            {/* News items */}
            <div className="space-y-5">
              {p.items.map((item, i) => (
                <article
                  key={i}
                  className="group flex gap-4 p-4 rounded-xl bg-[#FFFFFF]/60 border border-[#E2E8F0]/60 hover:border-[#2563EB]/30 transition-colors"
                >
                  <span
                    className="text-2xl font-black text-[#2563EB]/30 leading-none flex-shrink-0 mt-0.5 font-mono"
                    aria-hidden="true"
                  >
                    {item.number}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#0F172A] mb-1.5 group-hover:text-white transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#475569] leading-relaxed">{item.abstract}</p>
                  </div>
                </article>
              ))}
            </div>

            {/* Blur overlay + CTA */}
            <div className="relative mt-6">
              {/* Blurred "more content" preview */}
              <div className="blur-sm select-none space-y-2 mb-2" aria-hidden="true">
                <div className="h-3 bg-[#475569]/10 rounded-full w-3/4" />
                <div className="h-3 bg-[#475569]/10 rounded-full w-1/2" />
                <div className="h-3 bg-[#475569]/10 rounded-full w-2/3" />
              </div>

              {/* Gradient overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8FAFC]"
                aria-hidden="true"
              />

              {/* CTA */}
              <div className="relative flex justify-center pt-4">
                <a
                  href="#subscribe"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] active:scale-95 transition-all duration-200 shadow-md shadow-[#2563EB]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  {p.cta}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
