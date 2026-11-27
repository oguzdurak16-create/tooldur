import SiteDocument from '@/components/SiteDocument';

export { metadata, viewport } from '@/components/SiteDocument';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument>{children}</SiteDocument>;
}
