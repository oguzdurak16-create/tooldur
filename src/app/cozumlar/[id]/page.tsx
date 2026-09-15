import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import CozumDetayClient from './CozumDetayClient';

const BASE_URL = 'https://www.tooldur.com';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data } = await supabase
    .from('forum_konular')
    .select('baslik,icerik')
    .eq('id', params.id)
    .maybeSingle();

  if (!data) {
    return {
      title: 'Teknik Sorun ve Çözümler | Tooldur Çözüm Ağı',
      description: 'Gerçek kullanıcıların paylaştığı teknik sorun, çözüm ve deneyimler.',
      robots: { index: false, follow: true },
    };
  }

  const title = `${data.baslik} | Tooldur`;
  const description = String(data.icerik || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155) || 'Gerçek kullanıcı deneyimleri ve teknik çözümler.';
  const canonical = `${BASE_URL}/cozumlar/${params.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function CozumDetayPage({ params }: { params: { id: string } }) {
  return <CozumDetayClient id={params.id} />;
}
