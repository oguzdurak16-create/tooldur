import SiteDocument, { metadata as siteMetadata } from '@/components/SiteDocument';
import type { Metadata } from 'next';

export { viewport } from '@/components/SiteDocument';

export const metadata: Metadata = {
  ...siteMetadata,
  title: { default: 'Tooldur | Free Engineering Calculators', template: '%s | Tooldur' },
  description: 'Free engineering calculators for mechanical design, electrical work, construction and manufacturing.',
  keywords: ['engineering calculators', 'mechanical design', 'shaft fits', 'manufacturing', 'Tooldur'],
  openGraph: { ...siteMetadata.openGraph, locale: 'en_US' },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="en">{children}</SiteDocument>;
}
