'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/usePmAuth';
import {
  kategorileriGetir, konulariGetir,
  type ForumKategori, type ForumKonu,
} from '@/lib/forum-db';
import { Search, PenSquare, TrendingUp, Clock, Flame, Users, MessageSquare, Eye, Heart, Pin, ChevronRight } from 'lucide-react';

function zaman(iso: string) {
  const d = new Date(iso), now = new Date();
  const fark = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (fark < 60)   return 'az önce';
  if (fark < 3600) return `${Math.floor(fark / 60)}dk önce`;
  if (fark < 86400)return `${Math.floor(fark / 3600)}sa önce`;
  if (fark < 604800)return `${Math.floor(fark / 86400)}g önce`;
  return d.toLocaleDateString('tr-TR', { day:'2-digit', month:'short' });
}

function Avatar({ ad, foto, size = 32 }: { ad: string; foto?: string | null; size?: number }) {
  const renkler = ['#f59e0b','#2d5282','#166534','#991b1b','#6d28d9','#0e7490','#be185d'];
  const renk = renkler[ad.charCodeAt(0) % renkler.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: renk, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
      {foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : ad.slice(0, 2).toUpperCase()}
    </div>
  );
}

function KonuKart({ konu }: { konu: ForumKonu }) {
  const gec = !!(konu.etiketler ?? []).length;
  return (
    <Link href={`/forum/konu/${konu.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', transition: 'background .12s', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Avatar ad={konu.yazar_ad} foto={konu.yazar_foto} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              {konu.pinli && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', color: 'var(--amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Pin size={8} /> SABİTLENDİ</span>}
              {konu.kategori && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: konu.kategori.renk + '20', color: konu.kategori.renk, fontWeight: 600 }}>
                  {konu.kategori.ikon} {konu.kategori.ad}
                </span>
              )}
              {(konu.etiketler ?? []).slice(0, 2).map(e => (
                <span key={e} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-muted)', color: 'var(--ink-4)', border: '1px solid var(--border)' }}>{e}</span>
              ))}
            </div>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {konu.baslik}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--ink-4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {konu.icerik.replace(/\n/g, ' ').slice(0, 120)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{konu.yazar_ad}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{zaman(konu.son_aktif)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--ink-4)' }}><Heart size={11} /> {konu.begeni_sayisi}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--ink-4)' }}><MessageSquare size={11} /> {konu.yorum_sayisi}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--ink-4)' }}><Eye size={11} /> {konu.goruntuleme}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ForumPage() {
  const { user } = useAuth();
  const [kategoriler,  setKategoriler]  = useState<ForumKategori[]>([]);
  const [konular,      setKonular]      = useState<ForumKonu[]>([]);
  const [siralama,     setSiralama]     = useState<'yeni'|'populer'|'aktif'>('yeni');
  const [arama,        setArama]        = useState('');
  const [aramaGecici,  setAramaGecici]  = useState('');
  const [yukleniyor,   setYukleniyor]   = useState(true);
  const [toplamKonu,   setToplamKonu]   = useState(0);

  useEffect(() => {
    kategorileriGetir().then(setKategoriler);
  }, []);

  useEffect(() => {
    setYukleniyor(true);
    konulariGetir({ siralama, arama: arama || undefined, limit: 30, userId: user?.uid }).then(data => {
      setKonular(data);
      setToplamKonu(data.length);
      setYukleniyor(false);
    });
  }, [siralama, arama, user]);

  const aramaYap = () => setArama(aramaGecici);

  const toplamYorum = kategoriler.reduce((a, k) => a + (k.konu_sayisi ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <style>{`
        .forum-grid { display: grid; grid-template-columns: 1fr 300px; gap: 24px; max-width: 1100px; margin: 0 auto; padding: 28px 16px; }
        @media(max-width: 768px) { .forum-grid { grid-template-columns: 1fr; } .forum-sidebar { display: none; } }
      `}</style>

      {/* Hero */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', margin: '0 0 6px' }}>
                Mühendis Forumu
              </h1>
              <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: 0 }}>
                Projelerini tanıt, deneyim paylaş, iş fırsatları bul
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                {[
                  { label: 'Kategori', val: kategoriler.length, icon: <Users size={13} /> },
                  { label: 'Konu',     val: toplamKonu,         icon: <MessageSquare size={13} /> },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-4)' }}>
                    {s.icon} <strong style={{ color: 'var(--ink-2)', fontFamily: 'var(--font-mono)' }}>{s.val}</strong> {s.label}
                  </div>
                ))}
              </div>
            </div>
            {user ? (
              <Link href="/forum/yeni-konu" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--amber)', color: '#0a0a0f', borderRadius: 9, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 12px rgba(245,158,11,0.3)', flexShrink: 0 }}>
                <PenSquare size={15} /> Konu Aç
              </Link>
            ) : (
              <Link href="/giris" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '1.5px solid var(--amber)', color: 'var(--amber)', borderRadius: 9, fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}>
                Giriş Yap → Yaz
              </Link>
            )}
          </div>

          {/* Arama */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
              <input
                value={aramaGecici}
                onChange={e => setAramaGecici(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && aramaYap()}
                placeholder="Konu ara..."
                style={{ width: '100%', padding: '10px 12px 10px 34px', background: 'var(--bg-input)', border: '1.5px solid var(--border-mid)', borderRadius: 8, color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
              />
            </div>
            <button onClick={aramaYap} style={{ padding: '10px 18px', background: 'var(--amber)', border: 'none', borderRadius: 8, color: '#0a0a0f', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              Ara
            </button>
            {arama && <button onClick={() => { setArama(''); setAramaGecici(''); }} style={{ padding: '10px 14px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--ink-3)', fontSize: 12, cursor: 'pointer' }}>Temizle</button>}
          </div>
        </div>
      </div>

      <div className="forum-grid">
        {/* ── Sol: konu listesi ── */}
        <div>
          {/* Sıralama */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            {([
              { id: 'yeni',    label: 'En Yeni',   icon: <Clock size={13} />    },
              { id: 'populer', label: 'Popüler',   icon: <Flame size={13} />    },
              { id: 'aktif',   label: 'Aktif',     icon: <TrendingUp size={13} />},
            ] as const).map(s => (
              <button key={s.id} onClick={() => setSiralama(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, border: `1px solid ${siralama === s.id ? 'var(--amber)' : 'var(--border)'}`, background: siralama === s.id ? 'rgba(245,158,11,0.1)' : 'transparent', color: siralama === s.id ? 'var(--amber)' : 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--font-sans)', cursor: 'pointer', fontWeight: siralama === s.id ? 600 : 400 }}>
                {s.icon} {s.label}
              </button>
            ))}
            {arama && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-4)' }}>"{arama}" için {konular.length} sonuç</span>}
          </div>

          {/* Konular */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {yukleniyor ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>
                <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                Yükleniyor...
              </div>
            ) : konular.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
                <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 16 }}>
                  {arama ? 'Arama sonucu bulunamadı.' : 'Henüz konu açılmamış.'}
                </p>
                {user && <Link href="/forum/yeni-konu" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--amber)', color: '#0a0a0f', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}><PenSquare size={14} /> İlk konuyu aç</Link>}
              </div>
            ) : konular.map(k => <KonuKart key={k.id} konu={k} />)}
          </div>
        </div>

        {/* ── Sağ: sidebar ── */}
        <div className="forum-sidebar">
          {/* Kategoriler */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '.12em', textTransform: 'uppercase' }}>Kategoriler</span>
            </div>
            {kategoriler.map(k => (
              <Link key={k.id} href={`/forum/kategori/${k.slug}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: k.renk + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{k.ikon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.ad}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{k.konu_sayisi ?? 0} konu</div>
                </div>
                <ChevronRight size={13} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>

          {/* Kural kutusu */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>Forum Kuralları</p>
            {['Saygılı ve yapıcı ol', 'Spam ve reklam yasak', 'Doğru kategoride yaz', 'Kaynak göster', 'Kişisel saldırı yapma'].map((k, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7, fontSize: 12, color: 'var(--ink-3)' }}>
                <span style={{ color: 'var(--amber)', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span> {k}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
