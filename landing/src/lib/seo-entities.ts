// Entità schema.org condivise. Gli @id sono il punto di aggancio fra pagine:
// ogni NewsArticle, l'organizzazione e la pagina del fondatore puntano alla
// stessa persona, così Google e gli LLM collegano autore, brand e contenuti.

export const SITE_URL = 'https://apulia.ai'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`

export const FOUNDER = {
  id: `${SITE_URL}/#massimiliano-masi`,
  name: 'Massimiliano Masi',
  jobTitle: 'Founder',
  url: `${SITE_URL}/chi-siamo/massimiliano-masi`,
  image: `${SITE_URL}/team/massimiliano_masi.jpeg`,
  linkedin: 'https://www.linkedin.com/in/massimiliano-masi-4265ab',
} as const

// Riferimento compatto alla persona, da usare come `author` o `founder`:
// Google richiede name e url anche quando l'entità completa sta altrove.
export const founderRef = {
  '@type': 'Person',
  '@id': FOUNDER.id,
  name: FOUNDER.name,
  url: FOUNDER.url,
  jobTitle: FOUNDER.jobTitle,
  image: FOUNDER.image,
  sameAs: [FOUNDER.linkedin],
  worksFor: { '@id': ORGANIZATION_ID },
}
