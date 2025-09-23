import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://flowra.app';

  const pages = [
    '',
    '/dashboard',
    '/tasks',
    '/calendar',
    '/settings',
    '/team',
    '/discord',
  ];

  const now = new Date().toISOString();

  return pages.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}


