import type { Metadata } from 'next';
import DownloadSetupClient from './DownloadSetupClient';

export const metadata: Metadata = {
  title: 'TooldurCAD Kurulum Dosyaları',
  description:
    'TooldurCAD Universal Lite ve SolidWorks destek paketlerini güvenli, üyeye özel bağlantılarla indirin.',
  alternates: {
    canonical: 'https://www.tooldur.com/kurulum-indir',
  },
  openGraph: {
    title: 'TooldurCAD Kurulum Dosyaları | Tooldur',
    description:
      'TooldurCAD Universal Lite ve SolidWorks destek paketleri, özellikleri ve ekran görüntüleri.',
    url: 'https://www.tooldur.com/kurulum-indir',
    type: 'website',
    images: [{ url: '/visuals/topics/tool-software-og.webp', width: 1200, height: 630, alt: 'TooldurCAD mühendislik çalışma alanı' }],
  },
};

export default function DownloadSetupPage() {
  return <DownloadSetupClient />;
}
