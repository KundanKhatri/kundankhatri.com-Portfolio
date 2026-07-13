import type { MetadataRoute } from 'next';

// AI crawlers listed explicitly: being cited by ChatGPT/Claude/Perplexity is a
// lead channel, not a scraping concern, for a personal portfolio.
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: 'https://www.kundankhatri.com/sitemap.xml',
  };
}
