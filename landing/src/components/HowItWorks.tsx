'use client'

import { useLanguage } from '@/context/LanguageContext'

function EnvelopeIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="6"
        width="24"
        height="16"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M2 9l12 8 12-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2"
        y="5"
        width="24"
        height="20"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M2 11h24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 3v4M19 3v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="7" y="15" width="4" height="4" rx="1" fill="currentColor" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 22V14M10 22V10M16 22V6M22 22V2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 22h20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="32"
      height="16"
      viewBox="0 0 32 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="text-[#1E3A5F]"
    >
      <path
        d="M1 8h28M22 2l8 6-8 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const stepIcons = [EnvelopeIcon, CalendarIcon, ChartIcon]

export default function HowItWorks() {
  const { t } = useLanguage()

  return (
    <section
      id="come-funziona"
      className="py-24 bg-[#0F1A2E]"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="how-it-works-heading"
            className="text-3xl md:text-4xl font-black text-[#F0F4FF] mb-4"
          >
            {t.howItWorks.sectionTitle}
            <span
              className="block w-16 h-1 bg-[#2563EB] mx-auto mt-4 rounded-full"
              aria-hidden="true"
            />
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            {t.howItWorks.sectionSubtitle}
          </p>
        </div>

        <ol className="flex flex-col md:flex-row items-stretch gap-6 md:gap-0 list-none">
          {t.howItWorks.steps.map((step, index) => {
            const Icon = stepIcons[index]
            const isLast = index === t.howItWorks.steps.length - 1
            return (
              <li key={step.number} className="flex flex-col md:flex-row items-center md:items-stretch flex-1">
                <div className="flex flex-col items-center flex-1 bg-[#050A14] border border-[#1E3A5F] rounded-2xl p-8 text-center group hover:border-[#2563EB] transition-colors duration-200">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                    style={{
                      background:
                        'linear-gradient(135deg, #1d4ed8 0%, #2563EB 100%)',
                    }}
                  >
                    <Icon />
                  </div>
                  <span
                    className="block text-4xl font-black mb-3 tabular-nums"
                    style={{
                      background: 'linear-gradient(135deg, #2563EB, #F59E0B)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-lg font-bold text-[#F0F4FF] mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#94A3B8] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className="hidden md:flex items-center justify-center px-4 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <ArrowIcon />
                  </div>
                )}
                {!isLast && (
                  <div
                    className="flex md:hidden items-center justify-center py-3"
                    aria-hidden="true"
                  >
                    <svg
                      width="16"
                      height="32"
                      viewBox="0 0 16 32"
                      fill="none"
                      className="text-[#1E3A5F]"
                    >
                      <path
                        d="M8 1v28M2 22l6 8 6-8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
