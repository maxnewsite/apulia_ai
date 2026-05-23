import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow all crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
      // OpenAI (ChatGPT, SearchGPT)
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
      // Anthropic (Claude)
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
      // Google (Gemini, AI Overviews, Search Labs)
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
      },
      // Perplexity
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      // Meta (Llama, Meta AI)
      {
        userAgent: 'FacebookBot',
        allow: '/',
      },
      // Microsoft (Copilot, Bing AI)
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
      {
        userAgent: 'msnbot',
        allow: '/',
      },
      // Cohere
      {
        userAgent: 'cohere-ai',
        allow: '/',
      },
      // Common Crawl (trains open-source LLMs)
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      // Apple (Applebot-Extended for Apple Intelligence)
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
      },
      // You.com
      {
        userAgent: 'YouBot',
        allow: '/',
      },
    ],
    sitemap: 'https://apulia.ai/sitemap.xml',
    host: 'https://apulia.ai',
  }
}
