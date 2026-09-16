import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { cozumAciklamasi, cozumIndexlenebilir, cozumKategorisiMi } from '@/lib/cozum-seo';
import type { ForumKonu, ForumYorum } from '@/lib/forum-db';
import CozumDetayClient from './CozumDetayClient';

const BASE_URL = 'https://www.tooldur.com';

async function cozumKonuGetir(id: string): Promise<ForumKonu | null> {
  const { data } = await supabase
    .from('forum_konular')
    .select('*, kategori:forum_kategoriler(slug,ad,ikon,renk)')
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;

  const kategori = data.kategori as { slug?: string | null } | null;
  if (!cozumKategorisiMi(kategori?.slug)) return null;

  return data as ForumKonu;
}

async function cozumYorumlariGetir(konuId: string): Promise<ForumYorum[]> {
  const { data } = await supabase
    .from('forum_yorumlar')
    .select('*')
    .eq('konu_id', konuId)
    .order('created_at', { ascending: true });

  return (data ?? []) as ForumYorum[];
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const canonical = `${BASE_URL}/cozumlar/${params.id}`;
  const data = await cozumKonuGetir(params.id);

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
  const konu = await cozumKonuGetir(params.id);
  if (!konu) notFound();

  const yorumlar = await cozumYorumlariGetir(konu.id);
  const anaYorumlar = yorumlar.filter((yorum) => !yorum.ust_id);
  const qaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: konu.baslik,
      text: konu.icerik,
      answerCount: anaYorumlar.length,
      dateCreated: konu.created_at,
      author: { '@type': 'Person', name: konu.yazar_ad },
      suggestedAnswer: anaYorumlar.map((yorum) => ({
        '@type': 'Answer',
        text: yorum.icerik,
        dateCreated: yorum.created_at,
        upvoteCount: yorum.begeni_sayisi || 0,
        author: { '@type': 'Person', name: yorum.yazar_ad },
      })),
    },
  }).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: qaJson }} />
      <CozumDetayClient id={params.id} initialKonu={konu} initialYorumlar={yorumlar} />
    </>
  );
}
