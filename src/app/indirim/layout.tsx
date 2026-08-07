import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merve İndirim',
  description: 'Kategori bazlı indirim ve fiyat düşüşü takip uygulaması.',
  applicationName: 'Merve İndirim',
  manifest: '/manifest-indirim.json',
  appleWebApp: {
    capable: true,
    title: 'Merve İndirim',
    statusBarStyle: 'black-translucent',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function IndirimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
