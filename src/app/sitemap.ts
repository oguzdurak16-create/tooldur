import { MetadataRoute } from 'next';
import { tools, categories } from '@/data/tools';
import { blogPosts } from '@/data/blogPosts';
import { getIndexableCategories, getIndexableTools } from '@/lib/seoFocus';
import { BASE_URL, getLocalizedPath, type Locale } from '@/lib/siteLanguage';

const BASE = BASE_URL;
// ES/ZH/HI/AR remain available to visitors but are intentionally noindex until
// each locale has enough independently reviewed editorial content.
const INDEXABLE_LOCALES: Locale[] = ['tr', 'en'];
type LocalizedRoute = Parameters<typeof getLocalizedPath>[1];

// Update only after a meaningful content or SEO change.
const SITE_RELEASE_DATE = new Date('2026-08-14T00:00:00+03:00');
const CONTENT_RELEASE_DATE = new Date('2026-08-14T00:00:00+03:00');
const POLICY_RELEASE_DATE = new Date('2026-05-21T00:00:00+03:00');

function priorityForTool(t: typeof tools[number]) {
  return t.featured ? 0.9 : t.popular ? 0.82 : t.category === 'makine' ? 0.74 : 0.62;
}

function languageAlternates(route: LocalizedRoute, slug?: string) {
  const languages: Record<string, string> = {
    'x-default': `${BASE}${getLocalizedPath('tr', route, slug)}`,
  };

  INDEXABLE_LOCALES.forEach((locale) => {
    languages[locale] = `${BASE}${getLocalizedPath(locale, route, slug)}`;
  });

  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const indexableTools = getIndexableTools(tools);
  const indexableCategories = getIndexableCategories(categories);

  const localizedStaticRoutes: Array<{
    route: LocalizedRoute;
    priority: number;
    frequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }> = [
    { route: 'home', priority: 1.0, frequency: 'daily' },
    { route: 'tools', priority: 0.95, frequency: 'weekly' },
    { route: 'blog', priority: 0.88, frequency: 'weekly' },
    { route: 'tooldurcad', priority: 0.9, frequency: 'weekly' },
    { route: 'support', priority: 0.65, frequency: 'monthly' },
    { route: 'technical-call-library', priority: 0.86, frequency: 'weekly' },
    { route: 'roadmap', priority: 0.55, frequency: 'monthly' },
    { route: 'release-notes', priority: 0.65, frequency: 'monthly' },
  ];

  const localizedStatic: MetadataRoute.Sitemap = INDEXABLE_LOCALES.flatMap((locale) =>
    localizedStaticRoutes.map((item) => ({
      url: `${BASE}${getLocalizedPath(locale, item.route)}`,
      lastModified: CONTENT_RELEASE_DATE,
      changeFrequency: item.frequency,
      priority: locale === 'tr' ? item.priority : Math.max(item.priority - 0.08, 0.45),
      alternates: languageAlternates(item.route),
    }))
  );

  const trOnlyStatic: MetadataRoute.Sitemap = [
    { url: `${BASE}/hakkimizda`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.45 },
    { url: `${BASE}/iletisim`, lastModified: SITE_RELEASE_DATE, changeFrequency: 'monthly', priority: 0.45 },
    { url: `${BASE}/gizlilik`, lastModified: POLICY_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/kullanim-sartlari`, lastModified: POLICY_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/cerez-politikasi`, lastModified: POLICY_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/kvkk-basvuru-formu`, lastModified: POLICY_RELEASE_DATE, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = indexableCategories.flatMap((category) =>
    INDEXABLE_LOCALES.map((locale) => ({
      url: `${BASE}${getLocalizedPath(locale, 'category', category.slug)}`,
      lastModified: CONTENT_RELEASE_DATE,
      changeFrequency: 'weekly' as const,
      priority: locale === 'tr' ? 0.85 : 0.74,
      alternates: languageAlternates('category', category.slug),
    }))
  );

  const toolPages: MetadataRoute.Sitemap = indexableTools.flatMap((tool) =>
    INDEXABLE_LOCALES.map((locale) => ({
      url: `${BASE}${getLocalizedPath(locale, 'tool', tool.slug)}`,
      lastModified: CONTENT_RELEASE_DATE,
      changeFrequency: tool.new ? ('weekly' as const) : ('monthly' as const),
      priority: locale === 'tr' ? priorityForTool(tool) : Math.max(priorityForTool(tool) - 0.08, 0.45),
      alternates: languageAlternates('tool', tool.slug),
    }))
  );

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    ...localizedStatic,
    ...trOnlyStatic,
    ...categoryPages,
    ...toolPages,
    ...blogPages,
  ];
}
