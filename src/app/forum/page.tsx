// src/app/forum/page.tsx
import type { Metadata } from 'next';
import ForumClient from './ForumClient';

export const metadata: Metadata = {
  title: 'Forum | Mühendislik Topluluğu',
  description: 'Mühendisler için soru-cevap, tartışma ve deneyim paylaşım platformu. Elektrik, inşaat, makine alanlarında toplulukla bağlantı kurun.',
  alternates: { canonical: '/forum' },
  openGraph: {
    title: 'Tooldur Forum - Mühendislik Topluluğu',
    description: 'Mühendisler için soru-cevap ve tartışma platformu.',
    url: 'https://www.tooldur.com/forum',
    type: 'website',
  },
};

export default function Page() {
  return <ForumClient />;
}