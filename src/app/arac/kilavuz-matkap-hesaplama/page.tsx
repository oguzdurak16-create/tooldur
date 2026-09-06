import type { Metadata } from 'next';
import ToolPage from '../[slug]/page';

export const metadata: Metadata = {
  title: { absolute: 'Kılavuz Matkap Çapları – M4–M42 Metrik Diş Tablosu | Tooldur' },
  description: 'M4, M5, M6, M8, M10, M12, M16, M20 ve M36 için kılavuz matkap çaplarını bulun; kaba/ince hatve, diş dibi ve adım çaplarını hesaplayın.',
  keywords: [
    'kılavuz matkap çapları',
    'kılavuz matkap hesaplama',
    'metrik diş tablosu',
    'M4 kılavuz matkap çapı',
    'M5 kılavuz matkap çapı',
    'M6 kılavuz matkap çapı',
    'M8 kılavuz matkap çapı',
    'M8 matkap çapı',
    'M10 kılavuz matkap çapı',
    'M10 diş dibi çapı',
    'M12 kılavuz matkap çapı',
    'M16 kılavuz matkap çapı',
    'M20 kılavuz matkap çapı',
    'M36 kılavuz matkap çapı',
    'M36x4 kılavuz matkap çapı',
    'metrik diş dibi hesaplama',
  ],
  alternates: { canonical: 'https://www.tooldur.com/arac/kilavuz-matkap-hesaplama' },
  robots: { index: true, follow: true },
};

export default async function Page() {
  return ToolPage({ params: { slug: 'kilavuz-matkap-hesaplama' } });
}
