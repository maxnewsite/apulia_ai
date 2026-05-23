'use client'

import { useState, useEffect } from 'react'
import Logo from './Logo'
import { useLanguage } from '@/context/LanguageContext'
import type { Language } from '@/lib/i18n'

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

  const navLinks = [
    { label: t.nav.newsletter, href: '#subscribe' },
    { label: 'Archivio', href: '/weekly' },
    { label: t.nav.analysis, href: '#products' },
    { label: t.nav.about, href: '/chi-siamo' },
  ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050A14]/95 backdrop-blur-md border-b border-[#1E3A5F]/60 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size={34} />

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[#94A3B8] hover:text-[#F0F4FF] transition-colors rounded-lg hover:bg-[#1E3A5F]/30"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: Lang toggle + CTA */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              aria-label={`Switch to ${language === 'it' ? 'English' : 'Italiano'}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-[#1E3A5F] text-[#94A3B8] hover:text-[#F0F4FF] hover:border-[#2563EB]/50 transition-all duration-200"
            >
              <span>{language === 'it' ? '🇮🇹' : '🇬🇧'}</span>
              <span>{t.nav.langToggle}</span>
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
              className="md:hidden p-2 text-[#94A3B8] hover:text-[#F0F4FF] rounded-lg hover:bg-[#1E3A5F]/30 transition-colors"
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
            className="md:hidden pb-4 pt-2 border-t border-[#1E3A5F]/40"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-[#94A3B8] hover:text-[#F0F4FF] hover:bg-[#1E3A5F]/30 rounded-lg transition-colors"
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
