import type { Metadata } from 'next';
import DownloadSetupClient from './DownloadSetupClient';
import FolderPilotDownloadClient from './FolderPilotDownloadClient';

export const metadata: Metadata = {
  title: 'Tooldur Masaüstü Uygulamaları | FolderPilot ve TooldurCAD',
  description:
    'Tooldur FolderPilot ve TooldurCAD Windows kurulum paketlerini güvenli, üyeye özel indirme bağlantılarıyla indirin.',
  alternates: {
    canonical: 'https://www.tooldur.com/kurulum-indir',
  },
  openGraph: {
    title: 'Tooldur Masaüstü Uygulamaları | Tooldur',
    description:
      'Tooldur FolderPilot dosya çalışma alanı ile TooldurCAD mühendislik destek paketlerini keşfedin ve üyelik doğrulamasıyla indirin.',
    url: 'https://www.tooldur.com/kurulum-indir',
    type: 'website',
    images: [{ url: '/visuals/topics/tool-software-og.webp', width: 1200, height: 630, alt: 'Tooldur masaüstü yazılımları' }],
  },
};

export default function DownloadSetupPage() {
  return (
    <>
      <FolderPilotDownloadClient />
      <DownloadSetupClient />
    </>
  );
}
