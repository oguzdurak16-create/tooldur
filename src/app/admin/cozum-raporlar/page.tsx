'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, ExternalLink, Flag, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/usePmAuth';

type RaporDurumu = 'bekliyor' | 'incelendi' | 'reddedildi' | 'islem_yapildi';

type Rapor = {
  id: string;
  konu_id: string | null;
  yorum_id: string | null;
  neden: string;
  aciklama: string;
  durum: RaporDurumu;
  created_at: string;
  konu?: { id: string; baslik: string; yazar_ad: string } | null;
  yorum?: { id: string; konu_id: string; icerik: string; yazar_ad: string } | null;
};

const NEDEN: Record<string, string> = {
  spam: 'Spam / tekrar',
  yanlis_bilgi: 'Yanlış veya tehlikeli bilgi',
  hakaret: 'Hakaret / uygunsuz dil',
  reklam: 'Reklam',
  diger: 'Diğer',
};

function tarih(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function CozumRaporlarAdminPage() {
  const { user, loading } = useAuth();
  const [yetkili, setYetkili] = useState<boolean | null>(null);
  const [raporlar, setRaporlar] = useState<Rapor[]>([]);
  const [durum, setDurum] = useState<'bekliyor' | 'tumu'>('bekliyor');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = '/giris';
      return;
    }

    supabase.rpc('is_mod_or_admin').then(({ data, error }) => {
      if (error) {
        setHata(error.message || 'Yetki kontrolü yapılamadı.');
        setYetkili(false);
        return;
      }
      setYetkili(Boolean(data));
    });
  }, [loading, user]);

  const yukle = useCallback(async () => {
    if (!yetkili) return;
    setYukleniyor(true);
    setHata('');

    let q = supabase
      .from('cozum_agi_raporlar')
      .select('id,konu_id,yorum_id,neden,aciklama,durum,created_at,konu:forum_konular(id,baslik,yazar_ad),yorum:forum_yorumlar(id,konu_id,icerik,yazar_ad)')
      .order('created_at', { ascending: false })
      .limit(250);

    if (durum === 'bekliyor') q = q.eq('durum', 'bekliyor');

    const { data, error } = await q;
    if (error) {
      setHata(error.code === '42P01' ? 'Raporlama tablosu henüz production veritabanında oluşturulmamış.' : error.message);
      setRaporlar([]);
    } else {
      setRaporlar((data || []) as Rapor[]);
    }
    setYukleniyor(false);
  }, [durum, yetkili]);

  useEffect(() => { yukle(); }, [yukle]);

  const guncelle = async (id: string, yeniDurum: RaporDurumu) => {
    const { error } = await supabase.from('cozum_agi_raporlar').update({ durum: yeniDurum }).eq('id', id);
    if (error) return setHata(error.message);
    setRaporlar((onceki) => durum === 'bekliyor' ? onceki.filter((r) => r.id !== id) : onceki.map((r) => r.id === id ? { ...r, durum: yeniDurum } : r));
  };

  const bekleyen = useMemo(() => raporlar.filter((r) => r.durum === 'bekliyor').length, [raporlar]);

  if (loading || yetkili === null) return <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', color: 'var(--ink-4)' }}>Yetki kontrol ediliyor...</main>;

  if (!yetkili) return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center' }}><ShieldCheck size={34} style={{ color: 'var(--amber)' }} /><h1>Yetkisiz erişim</h1><p style={{ color: 'var(--ink-4)' }}>Bu ekran yalnız moderatör ve yöneticilere açıktır.</p></div>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 16px 70px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
          <div>
            <p style={{ margin: '0 0 5px', color: 'var(--amber)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em' }}>Moderasyon</p>
            <h1 style={{ margin: 0, fontSize: 28 }}>Çözüm Ağı bildirimleri</h1>
            <p style={{ margin: '7px 0 0', color: 'var(--ink-4)', fontSize: 13 }}>Kullanıcıların işaretlediği sorun ve çözümleri incele.</p>
          </div>
          <button type="button" onClick={yukle} disabled={yukleniyor} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--bg-card)', color: 'var(--ink-2)', cursor: 'pointer' }}><RefreshCw size={14} /> Yenile</button>
        </div>

        <div style={{ display: 'flex', gap: 7, marginBottom: 16 }}>
          <button onClick={() => setDurum('bekliyor')} style={filterStyle(durum === 'bekliyor')}>Bekleyen {durum === 'tumu' && bekleyen > 0 ? `(${bekleyen})` : ''}</button>
          <button onClick={() => setDurum('tumu')} style={filterStyle(durum === 'tumu')}>Tümü</button>
        </div>

        {hata && <div style={{ marginBottom: 14, padding: 12, borderRadius: 9, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.08)', color: '#ef4444', fontSize: 12 }}>{hata}</div>}

        {yukleniyor ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>Yükleniyor...</div>
        ) : raporlar.length === 0 ? (
          <div style={{ padding: 44, textAlign: 'center', border: '1px dashed var(--border-mid)', borderRadius: 12, color: 'var(--ink-4)' }}><Flag size={25} style={{ marginBottom: 8 }} /><div>Bu filtrede rapor yok.</div></div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {raporlar.map((rapor) => {
              const konuId = rapor.konu_id || rapor.yorum?.konu_id || '';
              const baslik = rapor.konu?.baslik || (rapor.yorum ? rapor.yorum.icerik.slice(0, 110) : 'İçerik bulunamadı');
              const yazar = rapor.konu?.yazar_ad || rapor.yorum?.yazar_ad || '-';
              return (
                <article key={rapor.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 999, background: 'rgba(239,68,68,.09)', color: '#ef4444', fontSize: 10, fontWeight: 800 }}><AlertTriangle size={11} /> {NEDEN[rapor.neden] || rapor.neden}</span>
                    <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>{rapor.yorum_id ? 'Çözüm' : 'Sorun'}</span>
                    <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>{tarih(rapor.created_at)}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--ink-4)', fontSize: 10 }}>{rapor.durum}</span>
                  </div>
                  <h2 style={{ margin: '10px 0 4px', fontSize: 15, lineHeight: 1.45 }}>{baslik}</h2>
                  <p style={{ margin: 0, color: 'var(--ink-4)', fontSize: 11 }}>Yazar: {yazar}</p>
                  {rapor.aciklama && <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: 'var(--bg-muted)', color: 'var(--ink-3)', fontSize: 12, lineHeight: 1.55 }}>{rapor.aciklama}</div>}

                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                    {konuId && <Link href={`/cozumlar/${konuId}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 9px', borderRadius: 8, border: '1px solid var(--border)', color: 'var(--ink-2)', textDecoration: 'none', fontSize: 11 }}><ExternalLink size={12} /> İçeriği aç</Link>}
                    {rapor.durum === 'bekliyor' && <>
                      <button onClick={() => guncelle(rapor.id, 'incelendi')} style={actionStyle('#22c55e')}><CheckCircle2 size={12} /> İncelendi</button>
                      <button onClick={() => guncelle(rapor.id, 'reddedildi')} style={actionStyle('var(--ink-4)')}><XCircle size={12} /> Reddet</button>
                      <button onClick={() => guncelle(rapor.id, 'islem_yapildi')} style={actionStyle('var(--amber)')}><ShieldCheck size={12} /> İşlem yapıldı</button>
                    </>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function filterStyle(active: boolean): React.CSSProperties {
  return { padding: '7px 10px', borderRadius: 8, border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`, background: active ? 'rgba(245,158,11,.1)' : 'transparent', color: active ? 'var(--amber)' : 'var(--ink-4)', cursor: 'pointer', fontSize: 11, fontWeight: 700 };
}

function actionStyle(color: string): React.CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 9px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color, cursor: 'pointer', fontSize: 11 };
}
