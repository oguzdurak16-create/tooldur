import type { Metadata } from 'next';
import CozumlarClient from './CozumlarClient';

export const metadata: Metadata = {
  title: 'Mühendislik Sorunları ve Gerçek Çözümler | Tooldur',
  description: 'Mühendislik, üretim, yazılım ve teknik arızalarda gerçek kullanıcı deneyimlerini ara; kendi sorununu ve işe yarayan çözümü paylaş.',
  alternates: { canonical: 'https://www.tooldur.com/cozumlar' },
  openGraph: {
    title: 'Tooldur Çözüm Ağı',
    description: 'Gerçek teknik sorunlar, gerçek deneyimler, işe yarayan çözümler.',
    url: 'https://www.tooldur.com/cozumlar',
    type: 'website',
  },
};

export default function CozumlarPage() {
  return <CozumlarClient />;
}
