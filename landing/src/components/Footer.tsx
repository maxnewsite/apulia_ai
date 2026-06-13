'use client'

import Logo from './Logo'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t, language } = useLanguage()
  const f = t.footer

  return (
    <footer
      className="relative border-t border-[#E2E8F0]/50 bg-[#FFFFFF]"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Sister publication banner */}
        <div className="mb-12 p-5 rounded-2xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#2563EB] font-bold mb-1">
              {language === 'en' ? 'Also from the same network' : 'Dalla stessa rete editoriale'}
            </p>
            <p className="text-sm text-[#0F172A] font-semibold">
              kalym.me &mdash;{' '}
              <span className="text-[#475569] font-normal">
                {language === 'en'
                  ? 'Middle East AI Intelligence: strategic analysis on AI across the MENA region'
                  : 'La newsletter sull\'AI nel Medio Oriente e area MENA: analisi strategica settimanale'}
              </span>
            </p>
          </div>
          <a
            href="https://kalym.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border border-[#E2E8F0] text-[#475569] hover:text-[#0F172A] hover:border-[#2563EB]/50 transition-all"
          >
            kalym.me
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Brand column */}
          <div>
            <Logo size={36} />
            <p className="mt-4 text-sm text-[#475569] leading-relaxed max-w-xs">
              {f.tagline}
            </p>
            <p className="mt-3 text-xs text-[#475569]/60">{f.madeIn}</p>
          </div>

          {/* Links column */}
          <nav aria-label="Footer navigation">
            <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">
              apulia.ai
            </h3>
            <ul className="space-y-3">
              {[
                { label: f.links.newsletter, href: '#subscribe' },
                { label: f.links.analysis, href: '#products' },
                { label: f.links.about, href: '/chi-siamo' },
                { label: f.links.privacy, href: '/privacy' },
                { label: f.links.unsubscribe, href: '/unsubscribe' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[#475569] hover:text-[#0F172A] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* GDPR / legal column */}
          <div>
            <h3 className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-4">
              GDPR & Privacy
            </h3>
            <p className="text-xs text-[#475569]/70 leading-relaxed mb-3">
              {f.unsubscribeNote}
            </p>
            <div className="flex items-start gap-2 p-3 rounded-xl border border-[#E2E8F0]/60 bg-[#F8FAFC]/40">
              <svg
                className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-xs text-[#475569]/60 leading-relaxed">
                GDPR compliant · EU hosted · No third-party data sharing
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#E2E8F0]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#475569]/50">{f.copyright}</p>
          <div className="flex items-center gap-2" aria-label="EU compliance badge">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E2E8F0]/60 text-xs text-[#475569]/60"
            >
              <span aria-hidden="true">🇪🇺</span>
              Made in Italy · EU AI Act compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
