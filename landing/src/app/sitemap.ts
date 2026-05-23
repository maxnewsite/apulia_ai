import type { MetadataRoute } from 'next'
import { getAllIssues } from '@/lib/newsletter-issues'
import { stripSlugPrefix } from '@/lib/newsletter-html'

// Revalidate the sitemap hourly so new editions appear within an hour of publish
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: 'https://apulia.ai/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://apulia.ai/weekly',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://apulia.ai/chi-siamo',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://apulia.ai/privacy',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://apulia.ai/unsubscribe',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.1,
    },
  ]

  // Dynamic edition entries — each published weekly issue becomes a sitemap URL.
  // Gracefully degrades if Supabase is unreachable at build/request time.
  const issues = await getAllIssues('weekly')
  const editionEntries: MetadataRoute.Sitemap = issues.map((issue) => ({
    url: `https://apulia.ai/weekly/${stripSlugPrefix(issue.slug)}`,
    lastModified: new Date(issue.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticEntries, ...editionEntries]
}
