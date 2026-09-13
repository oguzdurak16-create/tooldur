import type { Metadata } from 'next';
import ToolPage from '../[slug]/page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: 'Torna Derece Hesaplama – Koniklik, Konik Açı ve 1:N | Tooldur' },
    description: 'Torna derece hesaplama: büyük çap, küçük çap ve boydan konik yarım açıyı, toplam koni açısını ve 1:N koniklik oranını hesaplayın.',
    keywords: ['torna derece hesaplama', 'koniklik hesaplama', 'koniklik açısı hesaplama', 'koniklik hesaplama formülü', 'konik açı hesaplama', '1:N koniklik'],
    alternates: { canonical: 'https://www.tooldur.com/arac/konik-hesaplama' },
    robots: { index: true, follow: true },
  };
}

export default async function Page() {
  return ToolPage({ params: { slug: 'konik-hesaplama' } });
}
