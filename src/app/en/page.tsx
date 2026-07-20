import type { Metadata } from 'next';
import LocalizedSeoPage from '@/components/LocalizedSeoPage';
import { absoluteLocalizedUrl, languageAlternates } from '@/lib/siteLanguage';
import { getCopy } from '@/lib/localizedContent';

const page = getCopy('en').pages.home;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: {
    canonical: absoluteLocalizedUrl('en', 'home'),
    languages: languageAlternates('home'),
  },
  openGraph: {
    title: `${page.title} | ${getCopy('en').seoSuffix}`,
    description: page.description,
    url: absoluteLocalizedUrl('en', 'home'),
    type: 'website',
  },
};

export default function EnglishHomePage() {
  return <LocalizedSeoPage locale="en" route="home" />;
}
