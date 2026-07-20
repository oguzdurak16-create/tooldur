import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocalizedCategoryPage from '@/components/LocalizedCategoryPage';
import { categories } from '@/data/tools';
import { isPublicLocale, languageAlternates, type PublicLocale } from '@/lib/siteLanguage';
import { getLocalizedCategory } from '@/lib/toolLocalization';
import { isIndexableCategory } from '@/lib/seoFocus';
export const revalidate = 86400;

interface Props { params: { locale: string; slug: string } }

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale as PublicLocale;
  if (!isPublicLocale(locale)) return { robots: { index: false, follow: false } };
  const original = categories.find((c) => c.slug === params.slug);
  if (!original) return { robots: { index: false, follow: false } };
  const category = getLocalizedCategory(original, locale);
  const robots = locale === 'en' && isIndexableCategory(original) ? { index: true, follow: true } : { index: false, follow: true };
  return { robots, title: category.name, description: category.description, alternates: { canonical: `/${locale}/category/${category.slug}`, languages: languageAlternates('category', category.slug) } };
}

export default function LocalizedCategoryRoute({ params }: Props) {
  if (!isPublicLocale(params.locale)) notFound();
  return <LocalizedCategoryPage locale={params.locale as PublicLocale} slug={params.slug} />;
}
