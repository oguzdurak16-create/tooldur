import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AllToolsClient from '@/components/AllToolsClient';
import { isPublicLocale, languageAlternates, type PublicLocale } from '@/lib/siteLanguage';
import { getToolsPageCopy } from '@/lib/toolLocalization';
export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as PublicLocale;
  if (!isPublicLocale(locale)) return { robots: { index: false, follow: false } };
  const copy = getToolsPageCopy(locale);
  const robots = locale === 'en' ? { index: true, follow: true } : { index: false, follow: true };
  return {
    title: copy.title,
    robots,
    description: copy.description,
    alternates: { canonical: `/${locale}/tools`, languages: languageAlternates('tools') },
  };
}

export default async function LocalizedToolsPage({ params }: Props) {
  const resolvedParams = await params;
  if (!isPublicLocale(resolvedParams.locale)) notFound();
  return <AllToolsClient locale={resolvedParams.locale as PublicLocale} />;
}
