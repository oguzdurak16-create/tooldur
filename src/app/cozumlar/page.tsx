import type { Metadata } from 'next';
import CozumlarClient from './CozumlarClient';

export const metadata: Metadata = {
  title: 'Mühendislik Sorunları ve Gerçek Çözümler',
  description: 'Mühendislik, üretim, yazılım ve teknik arızalarda gerçek kullanıcı deneyimlerini ara; kendi sorununu ve işe yarayan çözümü paylaş.',
  alternates: { canonical: 'https://www.tooldur.com/cozumlar' },
  openGraph: {
    title: 'Tooldur Çözüm Ağı',
    description: 'Gerçek teknik sorunlar, gerçek deneyimler, işe yarayan çözümler.',
    url: 'https://www.tooldur.com/cozumlar',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tooldur Çözüm Ağı',
    description: 'Gerçek teknik sorunlar, gerçek deneyimler, işe yarayan çözümler.',
  },
};

export default function CozumlarPage() {
  return <CozumlarClient />;
}
