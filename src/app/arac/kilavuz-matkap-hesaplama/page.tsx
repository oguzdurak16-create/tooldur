import type { Metadata } from 'next';
import ToolPage from '../[slug]/page';

export const metadata: Metadata = {
  title: { absolute: 'Kılavuz Matkap Hesaplama – M2–M42 Matkap Çapları | Tooldur' },
  description: 'Kılavuz matkap çapını M2–M42 metrik dişlerde bulun. M6, M8, M10, M12 ve ince dişler için ön delik, adım ve teorik diş ölçülerini görüntüleyin.',
  keywords: ['kılavuz matkap hesaplama', 'kılavuz matkap çapı', 'metrik diş tablosu', 'M8 matkap çapı', 'M10 matkap çapı', 'M36 kılavuz matkap çapı'],
  alternates: { canonical: '/arac/kilavuz-matkap-hesaplama' },
  robots: { index: true, follow: true },
};

export default async function Page() {
  return ToolPage({ params: { slug: 'kilavuz-matkap-hesaplama' } });
}
