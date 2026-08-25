import type { Metadata } from 'next';
import HumanityTest from './HumanityTest';

export const metadata: Metadata = {
  title: { absolute: 'İnsanlık Testi — İnsanları Okuyabilir misin?' },
  description: 'Sekiz kısa durumda sezgini kullan, insanlığın geri kalanıyla ne kadar aynı düşündüğünü gör.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/insanlik-testi' },
  openGraph: {
    title: 'İnsanları gerçekten okuyabiliyor musun?',
    description: '8 karar. 90 saniye. Cevap vermeden sonucu göremezsin.',
    url: 'https://www.tooldur.com/insanlik-testi',
    type: 'website',
    siteName: 'Human Signal Lab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İnsanları gerçekten okuyabiliyor musun?',
    description: '8 karar. 90 saniye. Cevap vermeden sonucu göremezsin.',
  },
};

export default function HumanityTestPage() {
  return <HumanityTest />;
}
