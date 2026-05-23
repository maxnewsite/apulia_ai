import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import SchemaOrg from '@/components/SchemaOrg'

export const metadata: Metadata = {
  metadataBase: new URL('https://apulia.ai'),
  title: {
    default: 'apulia.ai — Newsletter Intelligenza Artificiale Italia e Europa',
    template: '%s | apulia.ai',
  },
  description:
    "La newsletter italiana di riferimento sull'intelligenza artificiale in Europa. Ogni domenica: EU AI Act, startup AI italiane, investimenti e analisi strategica sull'AI europea. Gratuita.",
  keywords: [
    'intelligenza artificiale Italia',
    'newsletter AI Italia',
    'AI Europa',
    'EU AI Act',
    'EU AI Act Italia',
    'notizie intelligenza artificiale',
    'startup AI italiane',
    'newsletter intelligenza artificiale',
    'AI Act Europa',
    'intelligenza artificiale Europa',
    'notizie AI Europa',
    'briefing AI strategico',
    'AI settimanale Italia',
    'apulia.ai',
    'intelligenza artificiale notizie settimanali',
    'investimenti AI Europa',
  ],
  authors: [{ name: 'apulia.ai', url: 'https://apulia.ai' }],
  creator: 'apulia.ai',
  publisher: 'apulia.ai',
  alternates: {
    canonical: 'https://apulia.ai',
    languages: {
      'it-IT': 'https://apulia.ai',
      'en-GB': 'https://apulia.ai',
    },
  },
  openGraph: {
    title: 'apulia.ai — Newsletter Intelligenza Artificiale Italia e Europa',
    description:
      "Ogni domenica: normativa AI Act, venture europeo e ricerca applicata — analizzati per le loro implicazioni strategiche. La newsletter AI di riferimento in Italia.",
    type: 'website',
    url: 'https://apulia.ai',
    locale: 'it_IT',
    alternateLocale: ['en_GB'],
    siteName: 'apulia.ai',
    images: [
      {
        url: '/apulia_ai.webp',
        width: 1200,
        height: 630,
        alt: 'apulia.ai — Newsletter Intelligenza Artificiale Europa',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'apulia.ai — Newsletter Intelligenza Artificiale Italia e Europa',
    description:
      "Ogni domenica: EU AI Act, venture europeo, ricerca applicata — analisi strategica sull'AI europea. Gratuita.",
    images: ['/apulia_ai.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon_apulia_ai.webp',
    shortcut: '/favicon_apulia_ai.webp',
    apple: '/favicon_apulia_ai.webp',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://apulia.ai" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <SchemaOrg />
      </head>
      <body className="bg-[#050A14] text-[#F0F4FF] antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
