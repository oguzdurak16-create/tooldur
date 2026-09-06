import type { Metadata } from 'next';
import ToolPage from '../[slug]/page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: 'Koniklik Hesaplama – Konik Açı, Oran ve Torna Derecesi | Tooldur' },
    description: 'Koniklik hesaplama için büyük çap, küçük çap ve boydan konik açı, yarım açı ve 1:N oranını bulun; torna derece hesabını tek ekranda yapın.',
    keywords: ['koniklik hesaplama', 'koniklik açısı hesaplama', 'koniklik hesaplama formülü', 'torna derece hesaplama', 'konik açı hesaplama', '1:N koniklik'],
    alternates: { canonical: 'https://www.tooldur.com/arac/konik-hesaplama' },
    robots: { index: true, follow: true },
  };
}

export default async function Page() {
  return ToolPage({ params: { slug: 'konik-hesaplama' } });
}
