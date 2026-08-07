import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bütçe & Harcama',
  description: 'Günlük harcamalarını, fişlerini ve aylık bütçe limitlerini takip et.',
  manifest: '/butce-manifest.json',
  applicationName: 'Tooldur Bütçe',
  appleWebApp: {
    capable: true,
    title: 'Bütçe',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
