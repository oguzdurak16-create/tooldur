// src/app/forum/konu/[id]/page.tsx
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import KonuClient from './KonuClient';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: konu } = await supabase
    .from('forum_konular')
    .select('baslik, icerik, yazar_ad, created_at')
    .eq('id', id)
    .maybeSingle();

  if (!konu) {
    return { title: 'Konu bulunamadı', robots: { index: false, follow: false } };
  }

  const desc = (konu.icerik || '').slice(0, 155).replace(/\s+/g, ' ').trim();
  return {
    title: konu.baslik,
    description: desc,
    alternates: { canonical: `/forum/konu/${id}` },
    openGraph: {
      title: konu.baslik,
      description: desc,
      type: 'article',
      authors: [konu.yazar_ad],
      publishedTime: konu.created_at,
    },
    twitter: { card: 'summary_large_image', title: konu.baslik, description: desc },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <KonuClient id={id} />;
}