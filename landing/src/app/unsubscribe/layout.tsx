import type { Metadata } from 'next'

// Pagina di servizio: non deve comparire nei risultati di ricerca.
export const metadata: Metadata = {
  title: 'Disiscrizione',
  robots: { index: false, follow: false },
}

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
