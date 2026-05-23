import { createClient } from '@supabase/supabase-js'

export type NewsletterIssue = {
  id: string
  type: 'weekly' | 'monthly'
  issue_number: number
  title: string
  title_en: string | null
  slug: string
  dek: string | null
  dek_en: string | null
  html_content: string
  pdf_url: string | null
  status: 'published' | 'draft'
  published_at: string
}

// Returns null instead of throwing when env vars are missing — lets
// build-time route generation degrade gracefully when Supabase is unreachable.
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function getAllIssues(
  type?: 'weekly' | 'monthly'
): Promise<NewsletterIssue[]> {
  const supabase = getClient()
  if (!supabase) return []

  let query = supabase
    .from('newsletter_issues')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) {
    console.warn('[newsletter-issues] getAllIssues failed:', error.message)
    return []
  }
  return (data as NewsletterIssue[]) || []
}

export async function getIssueBySlug(
  slug: string
): Promise<NewsletterIssue | null> {
  const supabase = getClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('newsletter_issues')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.warn('[newsletter-issues] getIssueBySlug failed:', error.message)
    return null
  }
  return data as NewsletterIssue | null
}
