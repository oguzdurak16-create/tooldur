import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yeni Konu Aç – Forum',
  robots: { index: false, follow: false },
  alternates: { canonical: '/forum/yeni-konu' },
};

export default function YeniKonuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
