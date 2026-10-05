import type { Metadata } from 'next';
import AllToolsClient from '@/components/AllToolsClient';
import { languageAlternates } from '@/lib/siteLanguage';
import { getToolsPageCopy } from '@/lib/toolLocalization';

const copy = getToolsPageCopy('en');

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: { canonical: '/en/tools', languages: languageAlternates('tools') },
  openGraph: {
    title: copy.title,
    description: copy.description,
    url: '/en/tools',
    type: 'website',
    locale: 'en_US',
    siteName: 'Tooldur',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Tooldur English engineering tools' }],
  },
  twitter: { card: 'summary_large_image', title: copy.title, description: copy.description, images: ['/og-image.png'] },
};

export default function EnglishToolsPage() {
  return <AllToolsClient locale="en" />;
}
