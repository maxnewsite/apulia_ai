'use client'

import { useState, useEffect } from 'react'
import Logo from './Logo'
import { useLanguage } from '@/context/LanguageContext'
import type { Language } from '@/lib/i18n'

function FlagIT({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className} aria-hidden="true">
      <rect width="3" height="2" fill="#CE2B37"/>
      <rect width="2" height="2" fill="#FFFFFF"/>
      <rect width="1" height="2" fill="#009246"/>
    </svg>
  )
}

function FlagGB({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className} aria-hidden="true">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  )
}

export default function Header() {
  const { t, language, setLanguage } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function toggleLanguage() {
    const next: Language = language === 'it' ? 'en' : 'it'
    setLanguage(next)
  }

  // Anchor links work on the homepage; on subpages (e.g. /chi-siamo, /weekly/*)
  // we send them to the homepage section explicitly via `/#section`.
  const navLinks = [
    { label: language === 'it' ? 'Come funziona' : 'How it works', href: '/#come-funziona' },
    { label: language === 'it' ? 'Ultima edizione' : 'Latest issue',  href: '/#preview' },
    { label: 'Archivio',                                              href: '/weekly' },
    { label: t.nav.analysis,                                          href: '/#products' },
    { label: 'FAQ',                                                   href: '/#faq' },
    { label: t.nav.about,                                             href: '/chi-siamo' },
  ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0]/60 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo size={52} />

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-base font-medium text-[#475569] hover:text-[#0F172A] transition-colors rounded-lg hover:bg-[#E2E8F0]/60"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: Lang toggle + CTA */}
          <div className="flex items-center gap-3">
            {/* Language toggle — shows destination language flag */}
            <button
              onClick={toggleLanguage}
              aria-label={language === 'it' ? 'Switch to English' : 'Passa all\'Italiano'}
              title={language === 'it' ? 'Switch to English' : 'Passa all\'Italiano'}
              className="hover:scale-110 active:scale-95 transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-sm"
            >
              {language === 'it' ? (
                <FlagGB className="w-8 h-5 rounded-[3px] shadow-md ring-1 ring-white/20" />
              ) : (
                <FlagIT className="w-8 h-5 rounded-[3px] shadow-md ring-1 ring-white/20" />
              )}
            </button>

            {/* CTA - desktop only */}
            <a
              href="#subscribe"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors shadow-md shadow-[#2563EB]/20"
            >
              {t.hero.cta}
            </a>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-[#475569] hover:text-[#0F172A] rounded-lg hover:bg-[#E2E8F0]/30 transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            id="mobile-menu"
            className="lg:hidden pb-4 pt-2 border-t border-[#E2E8F0]/40"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0]/30 rounded-lg transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#subscribe"
                onClick={() => setMenuOpen(false)}
                className="mt-2 mx-4 flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors"
              >
                {t.hero.cta}
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
