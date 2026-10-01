import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalizedCategoryPage from '@/components/LocalizedCategoryPage';
import { categories } from '@/data/tools';
import { isPublicLocale, languageAlternates, type PublicLocale } from '@/lib/siteLanguage';
import { getLocalizedCategory } from '@/lib/toolLocalization';
import { isIndexableCategory } from '@/lib/seoFocus';
export const revalidate = 86400;

interface Props { params: Promise<{ locale: string; slug: string }> }

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as PublicLocale;
  if (!isPublicLocale(locale)) return { robots: { index: false, follow: false } };
  const original = categories.find((c) => c.slug === resolvedParams.slug);
  if (!original) return { robots: { index: false, follow: false } };
  const category = getLocalizedCategory(original, locale);
  const robots = locale === 'en' && isIndexableCategory(original) ? { index: true, follow: true } : { index: false, follow: true };
  return { robots, title: category.name, description: category.description, alternates: { canonical: `/${locale}/category/${category.slug}`, languages: languageAlternates('category', category.slug) } };
}

export default async function LocalizedCategoryRoute({ params }: Props) {
  const resolvedParams = await params;
  if (!isPublicLocale(resolvedParams.locale)) notFound();
  return <LocalizedCategoryPage locale={resolvedParams.locale as PublicLocale} slug={resolvedParams.slug} />;
}
