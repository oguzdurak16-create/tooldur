'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/usePmAuth';
import { kategoriGetir, konulariGetir, type ForumKategori, type ForumKonu } from '@/lib/forum-db';
import { PenSquare, Heart, MessageSquare, Eye, Pin, ArrowLeft, Clock, Flame, TrendingUp } from 'lucide-react';

function zaman(iso: string) {
  const fark = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (fark < 60) return 'az önce';
  if (fark < 3600) return `${Math.floor(fark / 60)}dk önce`;
  if (fark < 86400) return `${Math.floor(fark / 3600)}sa önce`;
  if (fark < 604800) return `${Math.floor(fark / 86400)}g önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

function Avatar({ ad, foto, size = 34 }: { ad: string; foto?: string | null; size?: number }) {
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

export default function KategoriPage() {
  const params   = useParams();
  const slug     = params.slug as string;
  const { user } = useAuth();

  const [kategori,   setKategori]   = useState<ForumKategori | null>(null);
  const [konular,    setKonular]    = useState<ForumKonu[]>([]);
  const [siralama,   setSiralama]   = useState<'yeni'|'populer'|'aktif'>('yeni');
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    kategoriGetir(slug).then(setKategori);
  }, [slug]);

  useEffect(() => {
    if (!kategori) return;
    setYukleniyor(true);
    konulariGetir({ kategoriId: kategori.id, siralama, userId: user?.uid }).then(data => {
      setKonular(data); setYukleniyor(false);
    });
  }, [kategori, siralama, user]);

  if (!kategori && !yukleniyor) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ fontSize: 32 }}>🔍</p>
      <p style={{ color: 'var(--ink-4)' }}>Kategori bulunamadı.</p>
      <Link href="/forum" style={{ color: 'var(--amber)', textDecoration: 'none', fontSize: 13 }}>← Foruma dön</Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px' }}>
          <Link href="/forum" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-4)', textDecoration: 'none', fontSize: 12, marginBottom: 14 }}>
            <ArrowLeft size={13} /> Tüm Forum
          </Link>
          {kategori && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: kategori.renk + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{kategori.ikon}</div>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: '0 0 3px' }}>{kategori.ad}</h1>
                  <p style={{ fontSize: 13, color: 'var(--ink-4)', margin: 0 }}>{kategori.aciklama}</p>
                </div>
              </div>
              {user && (
                <Link href={`/forum/yeni-konu?kategori=${kategori.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--amber)', color: '#0a0a0f', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, boxShadow: '0 2px 10px rgba(245,158,11,0.25)' }}>
                  <PenSquare size={14} /> Konu Aç
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px' }}>
        {/* Sıralama */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          {([{ id: 'yeni', label: 'En Yeni', icon: <Clock size={12} /> }, { id: 'populer', label: 'Popüler', icon: <Flame size={12} /> }, { id: 'aktif', label: 'Aktif', icon: <TrendingUp size={12} /> }] as const).map(s => (
            <button key={s.id} onClick={() => setSiralama(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 20, border: `1px solid ${siralama === s.id ? 'var(--amber)' : 'var(--border)'}`, background: siralama === s.id ? 'rgba(245,158,11,0.1)' : 'transparent', color: siralama === s.id ? 'var(--amber)' : 'var(--ink-3)', fontSize: 12, cursor: 'pointer', fontWeight: siralama === s.id ? 600 : 400 }}>
              {s.icon} {s.label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-4)' }}>{konular.length} konu</span>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {yukleniyor ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>
              <div style={{ width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 10px' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Yükleniyor...
            </div>
          ) : konular.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>{kategori?.ikon ?? '💬'}</p>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 16 }}>Bu kategoride henüz konu yok.</p>
              {user && <Link href={`/forum/yeni-konu?kategori=${kategori?.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--amber)', color: '#0a0a0f', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}><PenSquare size={14} /> İlk konuyu aç</Link>}
            </div>
          ) : konular.map((k, i) => (
            <Link key={k.id} href={`/forum/konu/${k.id}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ padding: '14px 16px', borderBottom: i < konular.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .12s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-muted)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Avatar ad={k.yazar_ad} foto={k.yazar_foto} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      {k.pinli && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', color: 'var(--amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}><Pin size={8} /> SABİT</span>}
                      {(k.etiketler ?? []).slice(0, 3).map(e => <span key={e} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--bg-muted)', color: 'var(--ink-4)', border: '1px solid var(--border)' }}>{e}</span>)}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.baslik}</h3>
                    <p style={{ fontSize: 12, color: 'var(--ink-4)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{k.icerik.replace(/\n/g, ' ').slice(0, 100)}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7 }}>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{k.yazar_ad}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{zaman(k.son_aktif)}</span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                        {[{ v: k.begeni_sayisi, i: <Heart size={11} /> }, { v: k.yorum_sayisi, i: <MessageSquare size={11} /> }, { v: k.goruntuleme, i: <Eye size={11} /> }].map((s, j) => (
                          <span key={j} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--ink-4)' }}>{s.i} {s.v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
