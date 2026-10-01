import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: 'Forum Kategorisi',
    description: 'Tooldur forum kategori sayfası.',
    robots: { index: false, follow: true },
    alternates: { canonical: `/forum/kategori/${slug}` },
  };
}

export default function ForumKategoriLayout({ children }: { children: React.ReactNode }) {
  return children;
}
