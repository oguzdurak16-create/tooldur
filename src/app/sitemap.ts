import { MetadataRoute } from 'next';
import { tools, categories } from '@/data/tools';
import { blogPosts } from '@/data/blogPosts';
import { getIndexableCategories, getIndexableTools } from '@/lib/seoFocus';
import { INDEXABLE_LOCALES, BASE_URL, getLocalizedPath, type Locale } from '@/lib/siteLanguage';

const BASE = BASE_URL;

// Update only after a meaningful content or SEO change.
const SITE_RELEASE_DATE = new Date('2026-07-17T00:00:00+03:00');
const CONTENT_RELEASE_DATE = new Date('2026-07-17T00:00:00+03:00');
const POLICY_RELEASE_DATE = new Date('2026-05-21T00:00:00+03:00');

function priorityForTool(t: typeof tools[number]) {
  return t.featured ? 0.9 : t.popular ? 0.82 : t.category === 'makine' ? 0.74 : 0.62;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const indexableTools = getIndexableTools(tools);
  const indexableCategories = getIndexableCategories(categories);

  const trStatic: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: SITE_RELEASE_DATE, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/araclar`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/kurulum-indir`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/bizi-destekle`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/blog`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.88 },
    { url: `${BASE}/teknik-cagri-kutuphanesi`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'weekly', priority: 0.86 },
    { url: `${BASE}/surum-notlari`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${BASE}/yol-haritasi`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${BASE}/hakkimizda`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.45 },
    { url: `${BASE}/iletisim`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.45 },
    { url: `${BASE}/gizlilik`, lastModified: POLICY_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/kullanim-sartlari`, lastModified: POLICY_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/cerez-politikasi`, lastModified: POLICY_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/kvkk-basvuru-formu`, lastModified: POLICY_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const localizedStaticRoutes: Array<{ route: Parameters<typeof getLocalizedPath>[1]; priority: number; frequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
    { route: 'home', priority: 0.82, frequency: 'weekly' },
    { route: 'tools', priority: 0.84, frequency: 'weekly' },
    { route: 'blog', priority: 0.74, frequency: 'weekly' },
    { route: 'tooldurcad', priority: 0.72, frequency: 'weekly' },
    { route: 'support', priority: 0.45, frequency: 'monthly' },
    { route: 'technical-call-library', priority: 0.7, frequency: 'weekly' },
    { route: 'roadmap', priority: 0.45, frequency: 'monthly' },
    { route: 'release-notes', priority: 0.45, frequency: 'monthly' },
  ];

  const publicLocales = INDEXABLE_LOCALES.filter((locale) => locale !== 'tr') as Locale[];
  const localizedStatic: MetadataRoute.Sitemap = publicLocales.flatMap((locale) =>
    localizedStaticRoutes.map((item) => ({
      url: `${BASE}${getLocalizedPath(locale, item.route)}`,
      lastModified: CONTENT_RELEASE_DATE,
      changeFrequency: item.frequency,
      priority: item.priority,
    }))
  );

  const categoryPages: MetadataRoute.Sitemap = indexableCategories.flatMap((category) => [
    { url: `${BASE}/kategori/${category.slug}`, lastModified: CONTENT_RELEASE_DATE, changeFrequency: 'weekly' as const, priority: 0.85 },
    ...publicLocales.map((locale) => ({ url: `${BASE}${getLocalizedPath(locale, 'category', category.slug)}`, lastModified: CONTENT_RELEASE_DATE, changeFrequency: 'weekly' as const, priority: 0.74 })),
  ]);

  const toolPages: MetadataRoute.Sitemap = indexableTools.flatMap((tool) => [
    { url: `${BASE}/arac/${tool.slug}`, lastModified: CONTENT_RELEASE_DATE, changeFrequency: tool.new ? ('weekly' as const) : ('monthly' as const), priority: priorityForTool(tool) },
    ...publicLocales.map((locale) => ({ url: `${BASE}${getLocalizedPath(locale, 'tool', tool.slug)}`, lastModified: CONTENT_RELEASE_DATE, changeFrequency: tool.new ? ('weekly' as const) : ('monthly' as const), priority: Math.max(priorityForTool(tool) - 0.08, 0.45) })),
  ]);

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...trStatic, ...localizedStatic, ...categoryPages, ...toolPages, ...blogPages];
}
