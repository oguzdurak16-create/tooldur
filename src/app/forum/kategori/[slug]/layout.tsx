import type { Metadata } from 'next';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  return {
    title: 'Forum Kategorisi',
    description: 'Tooldur forum kategori sayfası.',
    robots: { index: false, follow: true },
    alternates: { canonical: `/forum/kategori/${params.slug}` },
  };
}

export default function ForumKategoriLayout({ children }: { children: React.ReactNode }) {
  return children;
}
