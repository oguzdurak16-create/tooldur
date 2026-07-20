import { supabase } from './supabase';

/* ── Tipler ─────────────────────────────────────────── */
export interface ForumKategori {
  id:         string;
  slug:       string;
  ad:         string;
  aciklama:   string;
  ikon:       string;
  renk:       string;
  sira:       number;
  konu_sayisi?: number;
}

export interface ForumKonu {
  id:             string;
  kategori_id:    string;
  baslik:         string;
  icerik:         string;
  yazar_uid:      string;
  yazar_ad:       string;
  yazar_foto:     string | null;
  begeni_sayisi:  number;
  goruntuleme:    number;
  yorum_sayisi:   number;
  pinli:          boolean;
  kapali:         boolean;
  etiketler:      string[];
  son_aktif:      string;
  created_at:     string;
  kategori?:      { slug: string; ad: string; ikon: string; renk: string };
  benim_begenim?: boolean;
}

export interface ForumYorum {
  id:            string;
  konu_id:       string;
  yazar_uid:     string;
  yazar_ad:      string;
  yazar_foto:    string | null;
  icerik:        string;
  begeni_sayisi: number;
  ust_id:        string | null;
  created_at:    string;
  benim_begenim?: boolean;
}

/* ── Kategoriler ─────────────────────────────────────── */
export async function kategorileriGetir(): Promise<ForumKategori[]> {
  const { data } = await supabase
    .from('forum_kategoriler')
    .select('*')
    .order('sira');
  if (!data) return [];
  const kategoriler = data as ForumKategori[];

  // Her kategori için konu sayısı
  const sonuc = await Promise.all(kategoriler.map(async (k: ForumKategori) => {
    const { count } = await supabase
      .from('forum_konular')
      .select('*', { count: 'exact', head: true })
      .eq('kategori_id', k.id);
    return { ...k, konu_sayisi: count ?? 0 };
  }));
  return sonuc;
}

export async function kategoriGetir(slug: string): Promise<ForumKategori | null> {
  const { data } = await supabase
    .from('forum_kategoriler')
    .select('*')
    .eq('slug', slug)
    .single();
  return data;
}

/* ── Konular ─────────────────────────────────────────── */
export async function konulariGetir(opts: {
  kategoriId?: string;
  arama?: string;
  siralama?: 'yeni' | 'populer' | 'aktif';
  limit?: number;
  offset?: number;
  userId?: string;
}): Promise<ForumKonu[]> {
  let q = supabase
    .from('forum_konular')
    .select('*, kategori:forum_kategoriler(slug,ad,ikon,renk)');

  if (opts.kategoriId) q = q.eq('kategori_id', opts.kategoriId);
  if (opts.arama) {
    const aranan = opts.arama.replace(/[%_\\]/g, '\\$&').slice(0, 80);
    q = q.ilike('baslik', `%${aranan}%`);
  }

  if (opts.siralama === 'populer') q = q.order('begeni_sayisi', { ascending: false });
  else if (opts.siralama === 'aktif') q = q.order('yorum_sayisi', { ascending: false });
  else q = q.order('pinli', { ascending: false }).order('son_aktif', { ascending: false });

  q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 20) - 1);
  const { data } = await q;
  if (!data) return [];
  const konular = data as ForumKonu[];

  // Beğeni kontrolü
  if (opts.userId) {
    const ids = konular.map((k: ForumKonu) => k.id);
    const { data: begeniler } = await supabase
      .from('forum_begeni_konular')
      .select('konu_id')
      .eq('user_id', opts.userId)
      .in('konu_id', ids);
    const begeniSet = new Set((begeniler ?? []).map((b: any) => b.konu_id));
    return konular.map((k: ForumKonu) => ({ ...k, benim_begenim: begeniSet.has(k.id) }));
  }
  return konular;
}

export async function konuGetir(id: string, userId?: string): Promise<ForumKonu | null> {
  // Görüntüleme artır
  try {
    await supabase.rpc('forum_goruntulenme_artir', { konu_id: id });
  } catch {}

  const { data } = await supabase
    .from('forum_konular')
    .select('*, kategori:forum_kategoriler(slug,ad,ikon,renk)')
    .eq('id', id)
    .single();
  if (!data) return null;

  if (userId) {
    const { data: beg } = await supabase
      .from('forum_begeni_konular')
      .select('konu_id')
      .eq('konu_id', id)
      .eq('user_id', userId)
      .maybeSingle();
    return { ...data, benim_begenim: !!beg };
  }
  return data;
}

export async function konuEkle(params: {
  kategoriId: string;
  baslik: string;
  icerik: string;
  etiketler: string[];
  yazarAd: string;
  yazarFoto?: string;
}): Promise<ForumKonu> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmalısınız');

  // Ban kontrolü
  const { data: profil } = await supabase
    .from('profiles')
    .select('is_banned')
    .eq('id', user.id)
    .maybeSingle();
  if (profil?.is_banned) throw new Error('Hesabınız askıya alınmış');

  // Basit input validasyonu
  const baslik = params.baslik.trim();
  const icerik = params.icerik.trim();
  if (baslik.length < 5 || baslik.length > 200) throw new Error('Başlık 5-200 karakter olmalı');
  if (icerik.length < 10 || icerik.length > 20000) throw new Error('İçerik 10-20000 karakter olmalı');

  const etiketler = (params.etiketler ?? [])
    .map(e => e.trim().slice(0, 30))
    .filter(Boolean)
    .slice(0, 8);

  const { data, error } = await supabase
    .from('forum_konular')
    .insert({
      kategori_id: params.kategoriId,
      baslik,
      icerik,
      etiketler,
      yazar_uid:  user.id,          // ← auth'tan alınır
      yazar_ad:   params.yazarAd,
      yazar_foto: params.yazarFoto ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function konuSil(id: string): Promise<void> {
  await supabase.from('forum_konular').delete().eq('id', id);
}

/* ── Yorumlar ─────────────────────────────────────────── */
export async function yorumlariGetir(konuId: string, userId?: string): Promise<ForumYorum[]> {
  const { data } = await supabase
    .from('forum_yorumlar')
    .select('*')
    .eq('konu_id', konuId)
    .order('created_at', { ascending: true });
  if (!data) return [];
  const yorumlar = data as ForumYorum[];

  if (userId) {
    const ids = yorumlar.map((y: ForumYorum) => y.id);
    const { data: begeniler } = await supabase
      .from('forum_begeni_yorumlar')
      .select('yorum_id')
      .eq('user_id', userId)
      .in('yorum_id', ids);
    const begeniSet = new Set((begeniler ?? []).map((b: any) => b.yorum_id));
    return yorumlar.map((y: ForumYorum) => ({ ...y, benim_begenim: begeniSet.has(y.id) }));
  }
  return yorumlar;
}

export async function yorumEkle(params: {
  konuId: string;
  icerik: string;
  ustId?: string;
  yazarAd: string;
  yazarFoto?: string;
}): Promise<ForumYorum> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmalısınız');

  const icerik = params.icerik.trim();
  if (icerik.length < 2 || icerik.length > 5000) throw new Error('Yorum 2-5000 karakter olmalı');

  const { data, error } = await supabase
    .from('forum_yorumlar')
    .insert({
      konu_id:    params.konuId,
      icerik,
      ust_id:     params.ustId ?? null,
      yazar_uid:  user.id,
      yazar_ad:   params.yazarAd,
      yazar_foto: params.yazarFoto ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function yorumSil(id: string): Promise<void> {
  await supabase.from('forum_yorumlar').delete().eq('id', id);
}

/* ── Beğeniler ─────────────────────────────────────────── */
export async function konuBegeniToggle(konuId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('forum_konu_begeni_toggle', {
    p_konu_id: konuId,
    p_user_id: userId,
  });
  if (error) throw error;
  return data as boolean;
}

export async function yorumBegeniToggle(yorumId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('forum_yorum_begeni_toggle', {
    p_yorum_id: yorumId,
    p_user_id: userId,
  });
  if (error) throw error;
  return data as boolean;
}

/* ── Görüntülenme RPC (Supabase'e ekle) ─────────────────
   SQL Editor'da çalıştır:
   CREATE OR REPLACE FUNCTION forum_goruntulenme_artir(konu_id UUID)
   RETURNS void LANGUAGE sql AS $$
     UPDATE forum_konular SET goruntuleme = goruntuleme + 1 WHERE id = konu_id;
   $$;
─────────────────────────────────────────────────────── */