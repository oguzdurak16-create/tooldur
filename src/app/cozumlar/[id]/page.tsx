import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { cozumAciklamasi, cozumIndexlenebilir, cozumKategorisiMi } from '@/lib/cozum-seo';
import CozumDetayClient from './CozumDetayClient';

const BASE_URL = 'https://www.tooldur.com';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const canonical = `${BASE_URL}/cozumlar/${params.id}`;
  const { data } = await supabase
    .from('forum_konular')
    .select('baslik,icerik,kategori:forum_kategoriler(slug)')
    .eq('id', params.id)
    .maybeSingle();

  if (!data) {
    return {
      title: 'Teknik Sorun ve Çözümler',
      description: 'Gerçek kullanıcıların paylaştığı teknik sorun, çözüm ve deneyimler.',
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  const title = data.baslik;
  const socialTitle = `${data.baslik} | Tooldur`;
  const description = cozumAciklamasi(data.icerik);
  const kategori = data.kategori as { slug?: string | null } | null;
  const indexlenebilir = cozumIndexlenebilir(data) && cozumKategorisiMi(kategori?.slug);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: indexlenebilir, follow: true },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
  };
}

export default function CozumDetayPage({ params }: { params: { id: string } }) {
  return <CozumDetayClient id={params.id} />;
}
