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
    locale: 'en_US',
    siteName: 'Tooldur',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Tooldur English engineering calculators' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${page.title} | ${getCopy('en').seoSuffix}`,
    description: page.description,
    images: ['/og-image.png'],
  },
};

export default function EnglishHomePage() {
  return <LocalizedSeoPage locale="en" route="home" />;
}
