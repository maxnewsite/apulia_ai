// Pagine tematiche: raccolgono, edizione dopo edizione, le notizie di una
// sezione fissa della newsletter (es. Radar Normativo → /temi/ai-act).
// Si aggiornano da sole a ogni pubblicazione perché leggono l'HTML delle
// edizioni già archiviato in newsletter_issues.

import type { NewsletterIssue } from './newsletter-issues'
import { parseSlugDate, stripSlugPrefix } from './newsletter-html'

export type Topic = {
  slug: string
  // Titolo della sezione nell'HTML delle edizioni (div.section-title)
  section: string
  name: string
  title: string
  description: string
  intro: string
}

// Sotto questa soglia la pagina non esiste: meglio nessuna pagina che una
// pagina tematica vuota, che Google tratta come contenuto di scarso valore.
export const MIN_TOPIC_ITEMS = 5

export const TOPICS: Topic[] = [
  {
    slug: 'ai-act',
    section: 'Radar Normativo',
    name: 'AI Act e normativa',
    title: 'AI Act e normativa sull’intelligenza artificiale: le novità per le aziende',
    description:
      'Le novità su AI Act, decreti italiani e regole europee sull’intelligenza artificiale, settimana per settimana, con le fonti originali.',
    intro:
      'L’AI Act (Regolamento UE 2024/1689) si applica per fasi e intorno a esso si muovono decreti nazionali, linee guida delle autorità e nuove regole europee. Qui trovi ogni sviluppo normativo che abbiamo selezionato nelle edizioni di AI Europa Weekly, dal più recente, con il link alla fonte originale.',
  },
  {
    slug: 'investimenti-ai',
    section: 'Funding & Mercati',
    name: 'Investimenti e round',
    title: 'Investimenti nell’intelligenza artificiale in Europa e in Italia: round e acquisizioni',
    description:
      'Round di finanziamento, acquisizioni e investimenti nell’AI in Europa e in Italia, raccolti ogni settimana con le fonti originali.',
    intro:
      'Chi investe nell’intelligenza artificiale in Europa, quanto e dove. Questa pagina raccoglie i round di finanziamento, le acquisizioni e i grandi investimenti segnalati in AI Europa Weekly, dal più recente, con il link alla fonte originale.',
  },
  {
    slug: 'ai-italia',
    section: 'Focus Italia',
    name: 'AI in Italia',
    title: 'Intelligenza artificiale in Italia: notizie su aziende, istituzioni e progetti',
    description:
      'Le notizie sull’intelligenza artificiale in Italia: aziende, istituzioni, progetti e investimenti, settimana per settimana.',
    intro:
      'Cosa succede nell’intelligenza artificiale in Italia: aziende, pubblica amministrazione, ricerca e investimenti. Qui trovi gli sviluppi italiani selezionati in ogni edizione di AI Europa Weekly, dal più recente, con il link alla fonte originale.',
  },
  {
    slug: 'data-center-ai',
    section: 'Compute & Infrastrutture',
    name: 'Data center e infrastrutture',
    title: 'Data center e infrastrutture per l’AI in Europa e in Italia',
    description:
      'Data center, supercalcolo, cloud e infrastrutture per l’intelligenza artificiale in Europa e in Italia, aggiornati ogni settimana.',
    intro:
      'La capacità di calcolo è il collo di bottiglia dell’intelligenza artificiale. Questa pagina raccoglie gli annunci su data center, supercalcolo, cloud e gigafactory AI in Europa e in Italia segnalati in AI Europa Weekly, dal più recente, con il link alla fonte originale.',
  },
]

export type TopicSource = { name: string; url: string }

export type TopicItem = { text: string; sources: TopicSource[] }

export type TopicEdition = {
  slug: string // senza prefisso: "2026-10-04"
  issueNumber: number
  date: string | null
  title: string
  items: TopicItem[]
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function cleanText(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ''))
    .replace(/(\s*\[\d+\])+/g, '') // rimandi alle note: "[5][6]"
    .replace(/\s+/g, ' ')
    .trim()
}

// Notizie di una sezione nell'HTML di un'edizione.
export function extractSectionItems(html: string, section: string): TopicItem[] {
  if (!html) return []
  const titleRe = new RegExp(
    `<div class="section-title">\\s*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '&(?:amp;)?')}\\s*<`,
  )
  const start = html.search(titleRe)
  if (start === -1) return []
  const next = html.indexOf('<div class="section"', start)
  const block = html.slice(start, next === -1 ? undefined : next)

  const items: TopicItem[] = []
  for (const li of block.matchAll(/<li class="bullet-item">([\s\S]*?)<\/li>/g)) {
    const inner = li[1]
    const textMatch = inner.match(
      /<span class="bullet-text">([\s\S]*?)(?:<span class="bullet-sources"|<\/span>\s*$)/,
    )
    const text = textMatch ? cleanText(textMatch[1]) : ''
    if (text.length < 20) continue

    const sources: TopicSource[] = []
    for (const a of inner.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
      const name = cleanText(a[2]).replace(/^,\s*/, '')
      if (a[1].startsWith('http') && name) sources.push({ url: decodeEntities(a[1]), name })
    }
    items.push({ text, sources })
  }
  return items
}

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug)
}

// Edizioni (dalla più recente) con le notizie del tema; solo quelle che ne hanno.
export function buildTopicEditions(
  topic: Topic,
  issues: NewsletterIssue[],
): TopicEdition[] {
  return issues
    .map((issue) => ({
      slug: stripSlugPrefix(issue.slug),
      issueNumber: issue.issue_number,
      date: parseSlugDate(issue.slug),
      title: issue.title,
      items: extractSectionItems(issue.html_content, topic.section),
    }))
    .filter((e) => e.items.length > 0)
}

export function countItems(editions: TopicEdition[]): number {
  return editions.reduce((n, e) => n + e.items.length, 0)
}

// Temi presenti in una singola edizione: per i link "Temi di questa edizione".
export function topicsInIssue(html: string): Topic[] {
  return TOPICS.filter((t) => extractSectionItems(html, t.section).length > 0)
}
