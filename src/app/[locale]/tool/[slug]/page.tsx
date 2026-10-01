import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalizedToolPage from '@/components/LocalizedToolPage';
import { isPublicLocale, languageAlternates, type PublicLocale } from '@/lib/siteLanguage';
import { getLocalizedToolBySlug, getOriginalToolBySlug } from '@/lib/toolLocalization';
import { isIndexableTool } from '@/lib/seoFocus';
export const revalidate = 86400;

interface Props { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as PublicLocale;
  if (!isPublicLocale(locale)) return { robots: { index: false, follow: false } };
  const tool = getLocalizedToolBySlug(resolvedParams.slug, locale);
  const originalTool = getOriginalToolBySlug(resolvedParams.slug);
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

export default async function LocalizedToolRoute({ params }: Props) {
  const resolvedParams = await params;
  if (!isPublicLocale(resolvedParams.locale)) notFound();
  return <LocalizedToolPage locale={resolvedParams.locale as PublicLocale} slug={resolvedParams.slug} />;
}
