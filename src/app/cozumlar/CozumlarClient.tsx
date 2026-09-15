'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, Heart, MessageCircle, Plus, Search, Sparkles, Wrench } from 'lucide-react';
import { useAuth } from '@/hooks/usePmAuth';
import { kategorileriGetir, konulariGetir, type ForumKategori, type ForumKonu } from '@/lib/forum-db';

type Siralama = 'yeni' | 'populer' | 'aktif';

function zaman(iso: string) {
  const fark = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (fark < 60) return 'az önce';
  if (fark < 3600) return `${Math.floor(fark / 60)} dk önce`;
  if (fark < 86400) return `${Math.floor(fark / 3600)} sa önce`;
  if (fark < 604800) return `${Math.floor(fark / 86400)} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function CozumlarClient() {
  const { user } = useAuth();
  const [kategoriler, setKategoriler] = useState<ForumKategori[]>([]);
  const [konular, setKonular] = useState<ForumKonu[]>([]);
  const [kategoriId, setKategoriId] = useState('');
  const [arama, setArama] = useState('');
  const [aramaInput, setAramaInput] = useState('');
  const [siralama, setSiralama] = useState<Siralama>('aktif');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    kategorileriGetir().then(setKategoriler);
  }, []);

  useEffect(() => {
    let aktif = true;
    setYukleniyor(true);
    konulariGetir({
      kategoriId: kategoriId || undefined,
      arama: arama || undefined,
      siralama,
      limit: 40,
      userId: user?.uid,
    }).then((data) => {
      if (!aktif) return;
      setKonular(data);
      setYukleniyor(false);
    });
    return () => { aktif = false; };
  }, [kategoriId, arama, siralama, user?.uid]);

  const toplamCozum = useMemo(() => konular.reduce((sum, item) => sum + (item.yorum_sayisi || 0), 0), [konular]);
  const aramaYap = () => setArama(aramaInput.trim());

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <section style={{ borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(245,158,11,.08), transparent 78%)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '56px 16px 34px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 10px', border: '1px solid rgba(245,158,11,.3)', borderRadius: 999, color: 'var(--amber)', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <Sparkles size={14} /> Kullanıcı deneyimiyle büyüyen teknik bilgi ağı
          </div>
          <h1 style={{ margin: 0, maxWidth: 800, fontSize: 'clamp(30px, 5vw, 54px)', lineHeight: 1.05, letterSpacing: '-.035em' }}>
            Sorunu yaz. <span style={{ color: 'var(--amber)' }}>Gerçek çözümü bul.</span>
          </h1>
          <p style={{ maxWidth: 760, margin: '18px 0 0', color: 'var(--ink-3)', fontSize: 16, lineHeight: 1.65 }}>
            Katalog bilgisi değil; sahada denenmiş yöntemler, arızalar, ayarlar ve çözüm deneyimleri. Çözdüğün bir problem başka birinin saatlerini kurtarsın.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
            <Link href={user ? '/cozumlar/yeni' : '/giris'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 17px', borderRadius: 9, background: 'var(--amber)', color: '#0a0a0f', textDecoration: 'none', fontWeight: 800, fontSize: 13 }}>
              <Plus size={16} /> Sorun / Çözüm Ekle
            </Link>
            <a href="#cozumlar" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 17px', borderRadius: 9, border: '1px solid var(--border-mid)', color: 'var(--ink-2)', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
              Çözümlere göz at <ArrowRight size={14} />
            </a>
          </div>

          <div style={{ display: 'flex', gap: 22, marginTop: 28, flexWrap: 'wrap', color: 'var(--ink-4)', fontSize: 12 }}>
            <span><strong style={{ color: 'var(--ink)', fontSize: 16 }}>{kategoriler.length}</strong> kategori</span>
            <span><strong style={{ color: 'var(--ink)', fontSize: 16 }}>{konular.length}</strong> görüntülenen sorun</span>
            <span><strong style={{ color: 'var(--ink)', fontSize: 16 }}>{toplamCozum}</strong> çözüm/deneyim</span>
          </div>
        </div>
      </section>

      <section id="cozumlar" style={{ maxWidth: 1120, margin: '0 auto', padding: '30px 16px 70px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
              <input
                value={aramaInput}
                onChange={(e) => setAramaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && aramaYap()}
                placeholder="Örn. SolidWorks açılmıyor, inverter hata kodu, rulman ısınıyor..."
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px 12px 40px', borderRadius: 10, border: '1px solid var(--border-mid)', background: 'var(--bg-input)', color: 'var(--ink)', outline: 'none', fontSize: 13 }}
              />
            </div>
            <button onClick={aramaYap} style={{ padding: '0 18px', border: 0, borderRadius: 10, background: 'var(--amber)', color: '#0a0a0f', fontWeight: 800, cursor: 'pointer' }}>Ara</button>
          </div>

          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
            <button onClick={() => setKategoriId('')} style={chip(!kategoriId)}>Tümü</button>
            {kategoriler.map((kategori) => (
              <button key={kategori.id} onClick={() => setKategoriId(kategori.id)} style={chip(kategoriId === kategori.id)}>
                <span>{kategori.ikon}</span> {kategori.ad}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Gerçek sorunlar ve deneyimler</h2>
              <p style={{ margin: '4px 0 0', color: 'var(--ink-4)', fontSize: 12 }}>İşe yarayan teknik bilgi kullanıcıdan kullanıcıya birikiyor.</p>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([
                ['aktif', 'Aktif'],
                ['yeni', 'Yeni'],
                ['populer', 'Beğenilen'],
              ] as const).map(([id, label]) => (
                <button key={id} onClick={() => setSiralama(id)} style={sortButton(siralama === id)}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 10 }}>
            {yukleniyor ? (
              <div style={{ padding: 46, textAlign: 'center', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--ink-4)', background: 'var(--bg-card)' }}>Yükleniyor...</div>
            ) : konular.length === 0 ? (
              <div style={{ padding: 46, textAlign: 'center', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-card)' }}>
                <Wrench size={26} style={{ color: 'var(--amber)', marginBottom: 8 }} />
                <h3 style={{ margin: '0 0 6px' }}>Bu aramada henüz deneyim yok.</h3>
                <p style={{ margin: '0 0 16px', color: 'var(--ink-4)', fontSize: 13 }}>İlk kaydı sen oluştur; sonraki arayan kişi doğrudan bu sayfaya ulaşsın.</p>
                <Link href={user ? '/cozumlar/yeni' : '/giris'} style={{ color: 'var(--amber)', fontWeight: 700, textDecoration: 'none' }}>Sorunu ekle →</Link>
              </div>
            ) : konular.map((konu) => (
              <Link key={konu.id} href={`/cozumlar/${konu.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                <article style={{ padding: '17px 18px', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-card)', transition: 'border-color .15s, transform .15s' }}>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
                    {konu.kategori && <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: `${konu.kategori.renk}20`, color: konu.kategori.renk }}>{konu.kategori.ikon} {konu.kategori.ad}</span>}
                    {(konu.etiketler || []).slice(0, 4).map((etiket) => <span key={etiket} style={{ fontSize: 10, color: 'var(--ink-4)' }}>#{etiket}</span>)}
                  </div>
                  <h3 style={{ margin: 0, color: 'var(--ink)', fontSize: 16, lineHeight: 1.4 }}>{konu.baslik}</h3>
                  <p style={{ margin: '7px 0 0', color: 'var(--ink-3)', fontSize: 13, lineHeight: 1.55 }}>{konu.icerik.replace(/\s+/g, ' ').slice(0, 180)}{konu.icerik.length > 180 ? '…' : ''}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 13, color: 'var(--ink-4)', fontSize: 11, flexWrap: 'wrap' }}>
                    <span>{konu.yazar_ad}</span>
                    <span>{zaman(konu.son_aktif || konu.created_at)}</span>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: konu.yorum_sayisi > 0 ? 'var(--amber)' : 'var(--ink-4)', fontWeight: konu.yorum_sayisi > 0 ? 700 : 400 }}><MessageCircle size={12} /> {konu.yorum_sayisi || 0} çözüm</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Heart size={12} /> {konu.begeni_sayisi || 0}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {konu.goruntuleme || 0}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function chip(active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
    padding: '7px 11px', borderRadius: 999, cursor: 'pointer', fontSize: 11,
    border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
    background: active ? 'rgba(245,158,11,.11)' : 'var(--bg-card)',
    color: active ? 'var(--amber)' : 'var(--ink-3)', fontWeight: active ? 700 : 500,
  };
}

function sortButton(active: boolean): React.CSSProperties {
  return {
    padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
    border: `1px solid ${active ? 'var(--amber)' : 'var(--border)'}`,
    background: active ? 'rgba(245,158,11,.1)' : 'transparent',
    color: active ? 'var(--amber)' : 'var(--ink-4)', fontWeight: active ? 700 : 500,
  };
}
