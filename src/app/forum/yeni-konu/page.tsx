'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/usePmAuth';
import { kategorileriGetir, konuEkle, type ForumKategori } from '@/lib/forum-db';
import { ArrowLeft, PenSquare, Plus, X, Eye } from 'lucide-react';

function OnIzleme({ baslik, icerik }: { baslik: string; icerik: string }) {
  if (!baslik && !icerik) return null;
  const parcala = (t: string) => t.split('\n').map((s, si) => {
    const parcalar = s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return <span key={si}>{si > 0 && <br />}{parcalar.map((p, pi) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={pi}>{p.slice(2, -2)}</strong>;
      if (p.startsWith('`') && p.endsWith('`')) return <code key={pi} style={{ background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.9em' }}>{p.slice(1, -1)}</code>;
      return <span key={pi}>{p}</span>;
    })}</span>;
  });
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', marginTop: 16 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Önizleme</p>
      {baslik && <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px' }}>{baslik}</h2>}
      {icerik && <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>{parcala(icerik)}</div>}
    </div>
  );
}

function YeniKonuContent() {
  const router     = useRouter();
  const params     = useSearchParams();
  const { user, loading } = useAuth();

  const [kategoriler,  setKategoriler]  = useState<ForumKategori[]>([]);
  const [kategoriId,   setKategoriId]   = useState(params.get('kategori') ?? '');
  const [baslik,       setBaslik]       = useState('');
  const [icerik,       setIcerik]       = useState('');
  const [etiket,       setEtiket]       = useState('');
  const [etiketler,    setEtiketler]    = useState<string[]>([]);
  const [onIzle,       setOnIzle]       = useState(false);
  const [gonderiyor,   setGonderiyor]   = useState(false);
  const [hata,         setHata]         = useState('');

  useEffect(() => { kategorileriGetir().then(setKategoriler); }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/giris');
  }, [user, loading, router]);

  const etiketEkle = () => {
    const e = etiket.trim().toLowerCase().replace(/\s+/g, '-');
    if (!e || etiketler.includes(e) || etiketler.length >= 5) return;
    setEtiketler(prev => [...prev, e]);
    setEtiket('');
  };

  const handleGonder = async () => {
    if (!user) return;
    if (!kategoriId) { setHata('Kategori seçin.'); return; }
    if (!baslik.trim()) { setHata('Başlık zorunlu.'); return; }
    if (!icerik.trim()) { setHata('İçerik zorunlu.'); return; }
    if (icerik.trim().length < 20) { setHata('İçerik en az 20 karakter olmalı.'); return; }

    setGonderiyor(true); setHata('');
    try {
      const konu = await konuEkle({
        kategoriId,
        baslik: baslik.trim(),
        icerik: icerik.trim(),
        etiketler,
        yazarAd: user.displayName,
        yazarFoto: user.photoURL || undefined,
      });
      router.push(`/forum/konu/${konu.id}`);
    } catch {
      setHata('Bir hata oluştu, tekrar deneyin.');
      setGonderiyor(false);
    }
  };

  if (loading) return null;
  if (!user) return null;

  const seciliKat = kategoriler.find(k => k.id === kategoriId);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 60px' }}>

        <Link href="/forum" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-4)', textDecoration: 'none', fontSize: 12, marginBottom: 20 }}>
          <ArrowLeft size={13} /> Foruma Dön
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PenSquare size={17} style={{ color: 'var(--amber)' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Yeni Konu Aç</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Kategori *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
              {kategoriler.map(k => (
                <button key={k.id} onClick={() => setKategoriId(k.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 9, border: `1.5px solid ${kategoriId === k.id ? k.renk : 'var(--border)'}`, background: kategoriId === k.id ? k.renk + '15' : 'var(--bg-card)', cursor: 'pointer', transition: 'all .15s', textAlign: 'left' }}>
                  <span style={{ fontSize: 18 }}>{k.ikon}</span>
                  <span style={{ fontSize: 12, fontWeight: kategoriId === k.id ? 700 : 500, color: kategoriId === k.id ? k.renk : 'var(--ink-2)' }}>{k.ad}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Başlık *</label>
            <input
              value={baslik}
              onChange={e => setBaslik(e.target.value)}
              placeholder="Net ve açıklayıcı bir başlık yazın..."
              maxLength={150}
              style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-mid)', borderRadius: 8, color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
            />
            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>{baslik.length}/150</div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>İçerik *</label>
              <button onClick={() => setOnIzle(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: onIzle ? 'var(--bg-muted)' : 'transparent', color: 'var(--ink-3)', fontSize: 11, cursor: 'pointer' }}>
                <Eye size={11} /> {onIzle ? 'Düzenle' : 'Önizle'}
              </button>
            </div>
            <textarea
              value={icerik}
              onChange={e => setIcerik(e.target.value)}
              placeholder="Konunuzu detaylı açıklayın...&#10;&#10;Markdown ipuçları:&#10;**kalın metin**&#10;`kod parçası`"
              rows={10}
              style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border-mid)', borderRadius: 8, color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 13, resize: 'vertical', outline: 'none', lineHeight: 1.7, boxSizing: 'border-box' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>
              <span>**kalın**, `kod` desteklenir</span>
              <span>{icerik.length} karakter</span>
            </div>
          </div>

          {onIzle && <OnIzleme baslik={baslik} icerik={icerik} />}

          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Etiketler (max 5)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: etiketler.length ? 10 : 0 }}>
              {etiketler.map(e => (
                <span key={e} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'var(--blue-soft)', color: 'var(--blue)', fontSize: 12, fontWeight: 500 }}>
                  {e}
                  <button onClick={() => setEtiketler(prev => prev.filter(x => x !== e))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', padding: 0, lineHeight: 1, display: 'flex' }}><X size={11} /></button>
                </span>
              ))}
            </div>
            {etiketler.length < 5 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={etiket}
                  onChange={e => setEtiket(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), etiketEkle())}
                  placeholder="etiket-ekle..."
                  style={{ flex: 1, padding: '9px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-mid)', borderRadius: 8, color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 13, outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
                />
                <button onClick={etiketEkle} style={{ padding: '9px 14px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                  <Plus size={13} /> Ekle
                </button>
              </div>
            )}
          </div>

          {hata && <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--red)' }}>{hata}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <Link href="/forum" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-3)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
              İptal
            </Link>
            <button onClick={handleGonder} disabled={gonderiyor || !baslik.trim() || !icerik.trim() || !kategoriId}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 24px', background: baslik.trim() && icerik.trim() && kategoriId ? 'var(--amber)' : 'var(--bg-muted)', border: 'none', borderRadius: 8, color: baslik.trim() && icerik.trim() && kategoriId ? '#0a0a0f' : 'var(--ink-4)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: baslik.trim() && icerik.trim() && kategoriId ? 'pointer' : 'default', transition: 'all .15s', boxShadow: baslik.trim() && icerik.trim() && kategoriId ? '0 2px 10px rgba(245,158,11,0.3)' : 'none' }}>
              <PenSquare size={14} /> {gonderiyor ? 'Yayınlanıyor...' : 'Konuyu Yayınla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function YeniKonuPage() {
  return (
    <Suspense fallback={null}>
      <YeniKonuContent />
    </Suspense>
  );
}
