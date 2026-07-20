import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AllToolsClient from '@/components/AllToolsClient';
import { isPublicLocale, languageAlternates, type PublicLocale } from '@/lib/siteLanguage';
import { getToolsPageCopy } from '@/lib/toolLocalization';
export const revalidate = 86400;

interface Props { params: { locale: string } }

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: Props): Metadata {
  const locale = params.locale as PublicLocale;
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

export default function LocalizedToolsPage({ params }: Props) {
  if (!isPublicLocale(params.locale)) notFound();
  return <AllToolsClient locale={params.locale as PublicLocale} />;
}
