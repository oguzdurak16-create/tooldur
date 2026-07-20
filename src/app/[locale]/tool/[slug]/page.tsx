import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalizedToolPage from '@/components/LocalizedToolPage';
import { isPublicLocale, languageAlternates, type PublicLocale } from '@/lib/siteLanguage';
import { getLocalizedToolBySlug, getOriginalToolBySlug } from '@/lib/toolLocalization';
import { isIndexableTool } from '@/lib/seoFocus';
export const revalidate = 86400;

interface Props { params: { locale: string; slug: string } }

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale as PublicLocale;
  if (!isPublicLocale(locale)) return { robots: { index: false, follow: false } };
  const tool = getLocalizedToolBySlug(params.slug, locale);
  const originalTool = getOriginalToolBySlug(params.slug);
  if (!tool || !originalTool) return { robots: { index: false, follow: false } };
  const robots = locale === 'en' && isIndexableTool(originalTool) ? { index: true, follow: true } : { index: false, follow: true };
  return {
    title: tool.name,
    robots,
    description: tool.description,
    alternates: { canonical: `/${locale}/tool/${tool.slug}`, languages: languageAlternates('tool', tool.slug) },
    openGraph: { title: tool.name, description: tool.description, type: 'website' },
  };
}

export default function LocalizedToolRoute({ params }: Props) {
  if (!isPublicLocale(params.locale)) notFound();
  return <LocalizedToolPage locale={params.locale as PublicLocale} slug={params.slug} />;
}
