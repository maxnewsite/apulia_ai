'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 10h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function FAQ() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index))
  }

  return (
    <section
      id="faq"
      className="py-24 bg-[#050A14]"
      aria-labelledby="faq-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            id="faq-heading"
            className="text-3xl md:text-4xl font-black text-[#F0F4FF] mb-4"
          >
            {t.faq.sectionTitle}
            <span
              className="block w-16 h-1 bg-[#2563EB] mx-auto mt-4 rounded-full"
              aria-hidden="true"
            />
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            {t.faq.sectionSubtitle}
          </p>
        </div>

        <dl className="space-y-3 max-w-3xl mx-auto">
          {t.faq.items.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={[
                  'bg-[#0F1A2E] rounded-2xl border transition-colors duration-200',
                  isOpen ? 'border-[#2563EB]' : 'border-[#1E3A5F]',
                ].join(' ')}
              >
                <dt>
                  <button
                    type="button"
                    onClick={() => handleToggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                    className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
                  >
                    <span className="text-base font-semibold text-[#F0F4FF] group-hover:text-white transition-colors">
                      {item.q}
                    </span>
                    <span
                      className={[
                        'flex-shrink-0 rounded-full p-1 transition-colors duration-200',
                        isOpen
                          ? 'text-[#2563EB]'
                          : 'text-[#94A3B8] group-hover:text-[#F0F4FF]',
                      ].join(' ')}
                    >
                      {isOpen ? <MinusIcon /> : <PlusIcon />}
                    </span>
                  </button>
                </dt>
                <dd
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  hidden={!isOpen}
                  className={[
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-96' : 'max-h-0',
                  ].join(' ')}
                >
                  <p className="px-6 pb-5 text-[#94A3B8] text-sm leading-relaxed">
                    {item.a}
                  </p>
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
