'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function StatsBar() {
  const { t } = useLanguage()

  return (
    <section
      className="relative py-12 border-y border-[#E2E8F0]/50 bg-[#F8FAFC]/60 overflow-hidden"
      aria-label="EU AI key statistics"
    >
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#2563EB]/5 via-transparent to-[#F59E0B]/5 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {t.stats.map((stat, i) => (
            <div
              key={i}
              className="text-center group"
            >
              {/* Value */}
              <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] mb-1.5 transition-colors group-hover:text-white">
                <span className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
                  {stat.value}
                </span>
              </div>
              {/* Label */}
              <p className="text-xs sm:text-sm text-[#475569] leading-snug font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
