'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function Audience() {
  const { t } = useLanguage()
  const { sectionTitle, sectionSubtitle, personas } = t.audience

  return (
    <section
      id="audience"
      className="py-24 relative overflow-hidden"
      aria-labelledby="audience-heading"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-[#F8FAFC]/40 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#F59E0B] opacity-[0.03] blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            id="audience-heading"
            className="text-3xl sm:text-4xl font-black text-[#0F172A] mb-4 tracking-tight"
          >
            {sectionTitle}
          </h2>
          <p className="max-w-2xl mx-auto text-[#475569] text-lg">
            {sectionSubtitle}
          </p>
        </div>

        {/* Personas grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {personas.map((persona, i) => (
            <article
              key={i}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB]/40 transition-all duration-300 group"
              aria-label={persona.role}
            >
              {/* Icon */}
              <div
                className="text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              >
                {persona.icon}
              </div>

              {/* Role */}
              <h3 className="text-sm font-bold text-[#0F172A] mb-2 group-hover:text-white transition-colors">
                {persona.role}
              </h3>

              {/* Description */}
              <p className="text-xs text-[#475569] leading-relaxed">
                {persona.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
