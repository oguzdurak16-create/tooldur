import { supabase } from './supabase';
import type { Proje, Gorev, Yorum, UyeRef, Ek, PmAktivite, PmAktiviteTipi } from '../app/proje-yonetimi/pm-types';

/* ─── Tip dönüşümleri ──────────────────────────────────── */
function dbToProje(r: any): Proje {
  return {
    id: r.id, ad: r.ad, aciklama: r.aciklama ?? '',
    renk: r.renk ?? '#1e3a5f', emoji: r.emoji ?? '📁',
    sahipUid: r.sahip_uid,
    uyeler: r._uyeler ?? [], davetliler: r._davetliler ?? [],
    olusturmaTarih: r.created_at,
  };
}
function dbToAktivite(r: any): PmAktivite {
  return {
    id: r.id,
    projeId: r.proje_id,
    gorevId: r.gorev_id,
    tip: r.tip,
    aciklama: r.aciklama,
    actorUid: r.actor_uid,
    actorAd: r.actor_ad ?? '',
    actorFoto: r.actor_foto ?? undefined,
    createdAt: r.created_at,
  };
}

async function aktiviteLogEkle(params: {
  projeId: string;
  gorevId: string;
  tip: PmAktiviteTipi;
  aciklama: string;
  actorUid: string;
  actorAd: string;
  actorFoto?: string;
}) {
  const { error } = await supabase.from('pm_aktiviteler').insert({
    proje_id: params.projeId,
    gorev_id: params.gorevId,
    tip: params.tip,
    aciklama: params.aciklama,
    actor_uid: params.actorUid,
    actor_ad: params.actorAd,
    actor_foto: params.actorFoto ?? null,
  });
  if (error) throw error;
}

export async function gorevAktiviteleriniGetir(gorevId: string): Promise<PmAktivite[]> {
  const { data, error } = await supabase
    .from('pm_aktiviteler')
    .select('*')
    .eq('gorev_id', gorevId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return (data ?? []).map(dbToAktivite);
}

export function gorevAktiviteleriniDinle(
  gorevId: string,
  cb: (a: PmAktivite[]) => void
): () => void {
  gorevAktiviteleriniGetir(gorevId).then(cb).catch(() => cb([]));

  const ch = supabase
    .channel(`pm_aktivite_${gorevId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pm_aktiviteler', filter: `gorev_id=eq.${gorevId}` },
      () => {
        gorevAktiviteleriniGetir(gorevId).then(cb).catch(() => cb([]));
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(ch);
  };
}

export async function gorevAktivitesiEkle(params: {
  projeId: string;
  gorevId: string;
  tip: PmAktiviteTipi;
  aciklama: string;
  actorUid: string;
  actorAd: string;
  actorFoto?: string;
}) {
  await aktiviteLogEkle(params);
}

function dbToGorev(r: any): Gorev {
  return {
    id: r.id, baslik: r.baslik, aciklama: r.aciklama ?? '',
    durum: r.durum, oncelik: r.oncelik, termin: r.termin ?? '',
    etiketler: r.etiketler ?? [], checklistler: r.checklistler ?? [],
    atananlar: r._atananlar ?? [], ekler: r._ekler ?? [], yorumlar: r._yorumlar ?? [],
    olusturanUid: r.olusturan_uid,
    olusturmaTarih: r.created_at, guncellenmeTarih: r.updated_at,
  };
}

/* ─── Projeler ─────────────────────────────────────────── */
async function projeleriGetir(uid: string): Promise<Proje[]> {
  const [{ data: sahip }, { data: uyeIds }] = await Promise.all([
    supabase.from('pm_projeler').select('*').eq('sahip_uid', uid).order('created_at', { ascending: false }),
    supabase.from('pm_proje_uyeler').select('proje_id').eq('user_id', uid),
  ]);

  let uyeProjeler: any[] = [];
  if (uyeIds?.length) {
    const { data } = await supabase.from('pm_projeler').select('*').in('id', uyeIds.map((r: any) => r.proje_id));
    uyeProjeler = data ?? [];
  }

  const all = [...(sahip ?? []), ...uyeProjeler];
  const tekil = Array.from(new Map(all.map(p => [p.id, p])).values());

  return Promise.all(tekil.map(async p => {
    const [{ data: uyeler }, { data: davetler }] = await Promise.all([
      supabase.from('pm_proje_uyeler').select('user_id, rol, pm_kullanici_profiller(uid,display_name,email,photo_url)').eq('proje_id', p.id),
      supabase.from('pm_davetler').select('email').eq('proje_id', p.id),
    ]);
    return dbToProje({
      ...p,
      _uyeler: (uyeler ?? []).map((u: any) => ({
        uid: u.user_id,
        email: u.pm_kullanici_profiller?.email ?? '',
        displayName: u.pm_kullanici_profiller?.display_name ?? '',
        photoURL: u.pm_kullanici_profiller?.photo_url ?? '',
        rol: (u.rol ?? 'uye') as 'sahip' | 'uye',
      })),
      _davetliler: (davetler ?? []).map((d: any) => d.email),
    });
  }));
}

export function projeleriDinle(uid: string, cb: (p: Proje[]) => void): () => void {
  projeleriGetir(uid).then(cb);
  const ch = supabase.channel(`pm_proj_${uid}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_projeler' }, () => projeleriGetir(uid).then(cb))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_proje_uyeler', filter: `user_id=eq.${uid}` }, () => projeleriGetir(uid).then(cb))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

export async function projeEkle(uid: string, data: Omit<Proje, 'id' | 'olusturmaTarih' | 'uyeler' | 'davetliler'>) {
  const { data: row, error } = await supabase.from('pm_projeler')
    .insert({ sahip_uid: uid, ad: data.ad, aciklama: data.aciklama, renk: data.renk, emoji: data.emoji })
    .select().single();
  if (error) throw error;
  return row;
}

export async function projeGuncelle(
  projeId: string,
  data: Partial<Pick<Proje, 'ad' | 'aciklama' | 'renk' | 'emoji'>>
) {
  const patch: Record<string, string> = {};
  if (data.ad !== undefined) patch.ad = data.ad.trim();
  if (data.aciklama !== undefined) patch.aciklama = data.aciklama.trim();
  if (data.renk !== undefined) patch.renk = data.renk;
  if (data.emoji !== undefined) patch.emoji = data.emoji;
  if (!Object.keys(patch).length) return;

  const { error } = await supabase.from('pm_projeler').update(patch).eq('id', projeId);
  if (error) throw error;
}

export async function projeSil(projeId: string) {
  const { error } = await supabase.from('pm_projeler').delete().eq('id', projeId);
  if (error) throw error;
}

export async function uyeDavetEt(projeId: string, email: string) {
  const { data: mevcut } = await supabase
    .from('pm_davetler')
    .select('id')
    .eq('proje_id', projeId)
    .eq('email', email)
    .maybeSingle();
  if (mevcut) return;
  const { error } = await supabase.from('pm_davetler').insert({ proje_id: projeId, email });
  if (error) throw error;
}

export async function projeDavetIptalEt(projeId: string, email: string) {
  const { error } = await supabase
    .from('pm_davetler')
    .delete()
    .eq('proje_id', projeId)
    .eq('email', email.trim().toLowerCase());
  if (error) throw error;
}

export interface BekleyenDavet {
  proje_id: string;
  proje_adi: string;
  proje_emoji: string;
  davet_eden?: string;
  email: string;
}

export async function bekleyenDavetleriGetir(email: string): Promise<BekleyenDavet[]> {
  const { data: davetRows } = await supabase
    .from('pm_davetler')
    .select('proje_id, email')
    .eq('email', email);
  if (!davetRows?.length) return [];

  const projeIds = davetRows.map((d: any) => d.proje_id);
  const { data: projeler } = await supabase
    .from('pm_projeler')
    .select('id, ad, emoji, sahip_uid')
    .in('id', projeIds);

  type ProjeDavetRow = { id: string; ad?: string | null; emoji?: string | null; sahip_uid?: string | null };
  const projeMap = new Map<string, ProjeDavetRow>(
    ((projeler ?? []) as ProjeDavetRow[]).map((p) => [p.id, p])
  );

  const davetler: BekleyenDavet[] = [];
  for (const d of davetRows as any[]) {
    const proje = projeMap.get(d.proje_id);
    const projeAdi = proje?.ad || 'Proje';
    const projeEmoji = proje?.emoji || '📁';

    let davetEden = '';
    if (proje?.sahip_uid) {
      const { data: profil } = await supabase
        .from('pm_kullanici_profiller')
        .select('display_name, email')
        .eq('uid', proje.sahip_uid)
        .maybeSingle();
      davetEden = profil?.display_name || profil?.email || '';
    }

    davetler.push({
      proje_id: d.proje_id,
      proje_adi: projeAdi,
      proje_emoji: projeEmoji,
      davet_eden: davetEden,
      email: d.email,
    });
  }
  return davetler;
}

export async function davetiKabulEt(projeId: string, uid: string, email: string, displayName: string) {
  await supabase.from('pm_proje_uyeler').upsert({ proje_id: projeId, user_id: uid, rol: 'uye' });
  await supabase.from('pm_davetler').delete().eq('proje_id', projeId).eq('email', email);
  await supabase.from('pm_kullanici_profiller').upsert({
    uid, email, display_name: displayName, updated_at: new Date().toISOString(),
  });
}

export async function davetiReddet(projeId: string, email: string) {
  await supabase.from('pm_davetler').delete().eq('proje_id', projeId).eq('email', email);
}

/* ─── Görevler ─────────────────────────────────────────── */
async function gorevleriTamGetir(projeId: string): Promise<Gorev[]> {
  const { data: gorevler } = await supabase.from('pm_gorevler').select('*').eq('proje_id', projeId).order('created_at');
  if (!gorevler?.length) return [];
  const ids = gorevler.map((g: any) => g.id);
  const [{ data: yorumlar }, { data: ekler }] = await Promise.all([
    supabase.from('pm_yorumlar').select('*').in('gorev_id', ids).order('created_at'),
    supabase.from('pm_ekler').select('*').in('gorev_id', ids).order('created_at'),
  ]);
  return gorevler.map((g: any) => dbToGorev({
    ...g,
    _atananlar: (g.atananlar ?? []),
    _yorumlar: (yorumlar ?? []).filter((y: any) => y.gorev_id === g.id).map((y: any) => ({
      id: y.id, metin: y.metin, yazarUid: y.yazar_uid, yazarAd: y.yazar_ad ?? '',
      yazarFoto: y.yazar_foto, tarih: y.created_at,
    })),
    _ekler: (ekler ?? []).filter((e: any) => e.gorev_id === g.id).map((e: any) => ({
      id: e.id, ad: e.ad, url: e.url, boyut: e.boyut, tip: e.tip,
      yukleyenUid: e.yukleyen_uid, tarih: e.created_at,
    })),
  }));
}

export function gorevleriDinle(projeId: string, cb: (g: Gorev[]) => void): () => void {
  gorevleriTamGetir(projeId).then(cb);
  const ch = supabase.channel(`pm_gorev_${projeId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_gorevler', filter: `proje_id=eq.${projeId}` }, () => gorevleriTamGetir(projeId).then(cb))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_yorumlar' }, () => gorevleriTamGetir(projeId).then(cb))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pm_ekler' }, () => gorevleriTamGetir(projeId).then(cb))
    .subscribe();
  return () => { supabase.removeChannel(ch); };
}

export async function gorevEkle(
  uid: string,
  projeId: string,
  data: Pick<Gorev, 'baslik' | 'aciklama' | 'durum' | 'oncelik' | 'termin' | 'etiketler' | 'checklistler'> & {
    atananlar?: UyeRef[];
  },
  activity?: { actorAd: string; actorFoto?: string }
) {
  const { data: row, error } = await supabase
    .from('pm_gorevler')
    .insert({
      proje_id: projeId,
      olusturan_uid: uid,
      baslik: data.baslik,
      aciklama: data.aciklama,
      durum: data.durum,
      oncelik: data.oncelik,
      termin: data.termin || null,
      etiketler: data.etiketler,
      checklistler: data.checklistler,
      atananlar: (data.atananlar ?? []).map((uye) => ({
        uid: uye.uid,
        email: uye.email,
        displayName: uye.displayName,
        photoURL: uye.photoURL || '',
      })),
    })
    .select()
    .single();

  if (error) throw error;

  if (activity?.actorAd) {
    await aktiviteLogEkle({
      projeId,
      gorevId: row.id,
      tip: 'gorev_olusturuldu',
      aciklama: `Görev oluşturuldu: ${data.baslik}`,
      actorUid: uid,
      actorAd: activity.actorAd,
      actorFoto: activity.actorFoto,
    });
  }

  return row;
}

export async function gorevGuncelle(gorevId: string, data: Partial<Pick<Gorev, 'baslik' | 'aciklama' | 'durum' | 'oncelik' | 'termin' | 'etiketler' | 'checklistler' | 'atananlar'>>) {
  const patch: any = {};
  if (data.baslik       !== undefined) patch.baslik       = data.baslik;
  if (data.aciklama     !== undefined) patch.aciklama     = data.aciklama;
  if (data.durum        !== undefined) patch.durum        = data.durum;
  if (data.oncelik      !== undefined) patch.oncelik      = data.oncelik;
  if (data.termin       !== undefined) patch.termin       = data.termin || null;
  if (data.etiketler    !== undefined) patch.etiketler    = data.etiketler;
  if (data.checklistler !== undefined) patch.checklistler = data.checklistler;
  if (data.atananlar    !== undefined) patch.atananlar    = data.atananlar.map(a => ({
    uid: a.uid,
    email: a.email,
    displayName: a.displayName,
    photoURL: a.photoURL || '',
  }));
  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from('pm_gorevler').update(patch).eq('id', gorevId);
    if (error) throw error;
  }
}

export async function gorevSil(gorevId: string) {
  await supabase.from('pm_gorevler').delete().eq('id', gorevId);
}

/* ─── Yorumlar ─────────────────────────────────────────── */
export async function yorumEkle(
  gorevId: string,
  _uid: string,   // artık kullanılmıyor, geriye uyum için kalsın
  ad: string,
  foto: string | undefined,
  metin: string,
  projeId?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Giriş yapmalısınız');

  const m = metin.trim();
  if (m.length < 1 || m.length > 5000) throw new Error('Yorum 1-5000 karakter olmalı');

  await supabase.from('pm_yorumlar').insert({
    gorev_id: gorevId,
    yazar_uid: user.id,
    yazar_ad: ad,
    yazar_foto: foto ?? null,
    metin: m,
  });

  if (projeId) {
    await aktiviteLogEkle({
      projeId, gorevId,
      tip: 'yorum_eklendi',
      aciklama: 'Yorum eklendi',
      actorUid: user.id,
      actorAd: ad,
      actorFoto: foto,
    });
  }
}

/* ─── Dosya Yükleme ────────────────────────────────────── */
export async function dosyaYukle(
  gorevId: string,
  uid: string,
  file: File,
  onProgress?: (pct: number) => void,
  activity?: { projeId: string; actorAd: string; actorFoto?: string },
): Promise<Ek> {
  const safeName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');

  const path = `pm-ekler/${uid}/${gorevId}/${Date.now()}_${safeName}`;

  onProgress?.(10);

  const { error: uploadError } = await supabase.storage
    .from('tooldur-ekler')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    if (
      uploadError.message?.includes('Bucket not found') ||
      uploadError.message?.includes('not found')
    ) {
      throw new Error('Storage bucket bulunamadı. Supabase Console’dan "tooldur-ekler" bucket’ı oluşturun.');
    }
    throw uploadError;
  }

  onProgress?.(70);

  const { data: { publicUrl } } = supabase.storage
    .from('tooldur-ekler')
    .getPublicUrl(path);

  const { data: row, error: dbError } = await supabase
    .from('pm_ekler')
    .insert({
      gorev_id: gorevId,
      yukleyen_uid: uid,
      ad: file.name,
      url: publicUrl,
      boyut: file.size,
      tip: file.type,
    })
    .select()
    .single();

  if (dbError) throw dbError;

  if (activity) {
    await aktiviteLogEkle({
      projeId: activity.projeId,
      gorevId,
      tip: 'ek_yuklendi',
      aciklama: `Ek yüklendi: ${file.name}`,
      actorUid: uid,
      actorAd: activity.actorAd,
      actorFoto: activity.actorFoto,
    });
  }

  onProgress?.(100);

  return {
    id: row.id,
    ad: file.name,
    url: publicUrl,
    boyut: file.size,
    tip: file.type,
    yukleyenUid: uid,
    tarih: row.created_at,
  };
}

export async function ekSil(ekId: string, url: string) {
  try {
    const path = url.split('/tooldur-ekler/')[1];
    if (path) await supabase.storage.from('tooldur-ekler').remove([decodeURIComponent(path)]);
  } catch { /* storage silme başarısız olsa da db'den sil */ }
  await supabase.from('pm_ekler').delete().eq('id', ekId);
}
export async function ekSilVeLogla(params: {
  ekId: string;
  url: string;
  projeId: string;
  gorevId: string;
  actorUid: string;
  actorAd: string;
  actorFoto?: string;
  dosyaAdi?: string;
}) {
  await ekSil(params.ekId, params.url);

  await aktiviteLogEkle({
    projeId: params.projeId,
    gorevId: params.gorevId,
    tip: 'ek_silindi',
    aciklama: params.dosyaAdi ? `Ek silindi: ${params.dosyaAdi}` : 'Ek silindi',
    actorUid: params.actorUid,
    actorAd: params.actorAd,
    actorFoto: params.actorFoto,
  });
}

/* ─── Kullanıcı Arama ──────────────────────────────────── */
export async function kullanicilariAra(query: string, mevcutUyeUidler: string[]): Promise<UyeRef[]> {
  if (!query.trim() || query.length < 2) return [];

  const { data: profil } = await supabase
    .from('pm_kullanici_profiller')
    .select('uid, display_name, email, photo_url')
    .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  return (profil ?? [])
    .filter((u: any) => !mevcutUyeUidler.includes(u.uid))
    .map((u: any) => ({
      uid: u.uid,
      email: u.email,
      displayName: u.display_name || u.email,
      photoURL: u.photo_url || '',
    }));
}

export async function projeUyeEkle(projeId: string, uye: UyeRef) {
  await supabase.from('pm_proje_uyeler').upsert({ proje_id: projeId, user_id: uye.uid, rol: 'uye' });
  await supabase.from('pm_davetler').delete().eq('proje_id', projeId).eq('email', uye.email);
}

export async function projeUyeKaldir(projeId: string, userId: string) {
  await supabase.from('pm_proje_uyeler').delete().eq('proje_id', projeId).eq('user_id', userId);
}

/* ─── Kullanıcı Profilini Güncelle ────────────────────── */
export async function kullaniciProfilGuncelle(uid: string, data: { display_name?: string; photo_url?: string }) {
  await supabase.from('pm_kullanici_profiller').upsert({ uid, ...data, updated_at: new Date().toISOString() });
}