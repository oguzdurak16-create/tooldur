import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalizedSeoPage from '@/components/LocalizedSeoPage';
import { blogPosts } from '@/data/blogPosts';
import { categories, tools } from '@/data/tools';
import { getCopy, type LocalizedPageKey } from '@/lib/localizedContent';
import {
  absoluteLocalizedUrl,
  languageAlternates,
  PUBLIC_LOCALES,
  STATIC_I18N_LOCALES,
  type Locale,
  type PublicLocale,
  type RouteKey,
} from '@/lib/siteLanguage';

export const revalidate = 86400;

type PageParams = {
  locale: string;
  slug?: string[];
};

export const dynamicParams = true;

const staticPageSegments: Array<{ route: RouteKey; slug: string[] }> = [
  { route: 'home', slug: [] },
  { route: 'blog', slug: ['blog'] },
  { route: 'tooldurcad', slug: ['tooldurcad'] },
  { route: 'support', slug: ['support'] },
  { route: 'technical-call-library', slug: ['technical-call-library'] },
  { route: 'roadmap', slug: ['roadmap'] },
  { route: 'release-notes', slug: ['release-notes'] },
  { route: 'project-management', slug: ['project-management'] },
  { route: 'about', slug: ['about'] },
  { route: 'contact', slug: ['contact'] },
  { route: 'privacy', slug: ['privacy'] },
  { route: 'terms', slug: ['terms'] },
  { route: 'cookies', slug: ['cookies'] },
];

const pageKeyByRoute: Partial<Record<RouteKey, LocalizedPageKey>> = {
  home: 'home',
  tools: 'tools',
  blog: 'blog',
  tooldurcad: 'tooldurcad',
  support: 'support',
  'technical-call-library': 'technical-call-library',
  roadmap: 'roadmap',
  'release-notes': 'release-notes',
  'project-management': 'project-management',
  about: 'about',
  contact: 'contact',
  privacy: 'privacy',
  terms: 'terms',
  cookies: 'cookies',
};

function resolveSlug(slug?: string[]): { route: RouteKey; itemSlug?: string } | null {
  const parts = slug || [];
  if (parts.length === 0) return { route: 'home' };
  const first = parts[0];

  const direct = staticPageSegments.find((item) => item.slug.length === parts.length && item.slug.every((segment, index) => segment === parts[index]));
  if (direct) return { route: direct.route };

  if (first === 'blog' && parts[1]) return { route: 'blog-post', itemSlug: parts[1] };

  return null;
}

function isGeneratedLocale(locale: string): locale is PublicLocale {
  return (PUBLIC_LOCALES as readonly string[]).includes(locale);
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const resolvedParams = await params;
  if (!isGeneratedLocale(resolvedParams.locale)) return {};

  const resolved = resolveSlug(resolvedParams.slug);
  if (!resolved) return {};

  const locale = resolvedParams.locale as Locale;
  const copy = getCopy(locale);
  const route = resolved.route;
  const robots: Metadata['robots'] = locale === 'en' && route !== 'project-management'
    ? { index: true, follow: true }
    : { index: false, follow: true };

  if (route === 'tool') {
    const tool = tools.find((item) => item.slug === resolved.itemSlug);
    if (!tool) return {};
    return {
      title: tool.name,
      robots,
      description: `${copy.toolIntro} ${tool.description}`,
      alternates: {
        canonical: absoluteLocalizedUrl(locale, route, tool.slug),
        languages: languageAlternates(route, tool.slug),
      },
      openGraph: {
        title: tool.name,
        description: tool.description,
        url: absoluteLocalizedUrl(locale, route, tool.slug),
        type: 'website',
      },
    };
  }

  if (route === 'category') {
    const category = categories.find((item) => item.slug === resolved.itemSlug);
    if (!category) return {};
    const title = copy.categoryNames[category.id] || category.name;
    const description = copy.categoryDescriptions[category.id] || category.description;
    return {
      title,
      robots,
      description,
      alternates: {
        canonical: absoluteLocalizedUrl(locale, route, category.slug),
        languages: languageAlternates(route, category.slug),
      },
    };
  }

  if (route === 'blog-post') {
    const post = blogPosts.find((item) => item.slug === resolved.itemSlug);
    if (!post) return {};
    return {
      title: post.title,
      robots,
      description: `${copy.blogIntro} ${post.description}`,
      alternates: {
        canonical: absoluteLocalizedUrl(locale, route, post.slug),
        languages: languageAlternates(route, post.slug),
      },
    };
  }

  const pageKey = pageKeyByRoute[route] || 'home';
  const page = copy.pages[pageKey];
  return {
    title: page.title,
    robots,
    description: page.description,
    alternates: {
      canonical: absoluteLocalizedUrl(locale, route),
      languages: languageAlternates(route),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: absoluteLocalizedUrl(locale, route),
      type: 'website',
    },
  };
}

export default async function LocalizedRoutePage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = await params;
  if (!isGeneratedLocale(resolvedParams.locale)) {
    notFound();
  }

  const resolved = resolveSlug(resolvedParams.slug);
  if (!resolved) {
    notFound();
  }

  const locale = resolvedParams.locale as Locale;

  if (resolved.route === 'blog-post' && !blogPosts.some((item) => item.slug === resolved.itemSlug)) notFound();

  return <LocalizedSeoPage locale={locale} route={resolved.route} slug={resolved.itemSlug} />;
}
