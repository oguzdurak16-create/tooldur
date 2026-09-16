import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { cozumAciklamasi, cozumIndexlenebilir, cozumKategorisiMi } from '@/lib/cozum-seo';
import CozumDetayClient from './CozumDetayClient';

const BASE_URL = 'https://www.tooldur.com';

type CozumKonuMeta = {
  baslik: string;
  icerik: string;
  kategori: { slug?: string | null } | null;
};

async function cozumKonuMetaGetir(id: string): Promise<CozumKonuMeta | null> {
  const { data } = await supabase
    .from('forum_konular')
    .select('baslik,icerik,kategori:forum_kategoriler(slug)')
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;

  const kategori = data.kategori as { slug?: string | null } | null;
  if (!cozumKategorisiMi(kategori?.slug)) return null;

  return {
    baslik: data.baslik,
    icerik: data.icerik,
    kategori,
  };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const canonical = `${BASE_URL}/cozumlar/${params.id}`;
  const data = await cozumKonuMetaGetir(params.id);

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
  const indexlenebilir = cozumIndexlenebilir(data);

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

export default async function CozumDetayPage({ params }: { params: { id: string } }) {
  const data = await cozumKonuMetaGetir(params.id);
  if (!data) notFound();

  return <CozumDetayClient id={params.id} />;
}
