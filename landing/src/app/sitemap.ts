import type { MetadataRoute } from 'next'
import { getAllIssues } from '@/lib/newsletter-issues'
import { stripSlugPrefix } from '@/lib/newsletter-html'
import {
  MIN_TOPIC_ITEMS,
  TOPICS,
  buildTopicEditions,
  countItems,
} from '@/lib/topics'

// Revalidate the sitemap hourly so new editions appear within an hour of publish
export const revalidate = 3600

// Date fisse per le pagine che cambiano di rado: un lastModified che vale
// sempre "adesso" è un segnale falso, e Google impara a ignorarlo.
const CHI_SIAMO_UPDATED = new Date('2026-07-19')
const PRIVACY_UPDATED = new Date('2026-06-13')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Gracefully degrades if Supabase is unreachable at build/request time.
  const issues = await getAllIssues('weekly')

  // Home e archivio cambiano quando esce un'edizione: la loro data è quella
  // dell'ultima pubblicazione.
  const latestPublished = issues[0]
    ? new Date(issues[0].published_at)
    : CHI_SIAMO_UPDATED

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: 'https://apulia.ai/',
      lastModified: latestPublished,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://apulia.ai/weekly',
      lastModified: latestPublished,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://apulia.ai/chi-siamo',
      lastModified: CHI_SIAMO_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://apulia.ai/chi-siamo/massimiliano-masi',
      lastModified: CHI_SIAMO_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://apulia.ai/privacy',
      lastModified: PRIVACY_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Each published weekly issue becomes a sitemap URL.
  const editionEntries: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `https://apulia.ai/weekly/${stripSlugPrefix(issue.slug)}`,
    lastModified: new Date(issue.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Pagine tematiche: cambiano quando un'edizione aggiunge notizie al tema.
  // Stessa soglia delle pagine stesse, per non elencare URL in 404.
  const topicEntries: MetadataRoute.Sitemap = []
  for (const topic of TOPICS) {
    const editions = buildTopicEditions(topic, issues)
    if (countItems(editions) < MIN_TOPIC_ITEMS) continue
    topicEntries.push({
      url: `https://apulia.ai/temi/${topic.slug}`,
      lastModified: editions[0].date ? new Date(editions[0].date) : latestPublished,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }
  if (topicEntries.length > 0) {
    topicEntries.unshift({
      url: 'https://apulia.ai/temi',
      lastModified: latestPublished,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  return [...staticEntries, ...topicEntries, ...editionEntries]
}
