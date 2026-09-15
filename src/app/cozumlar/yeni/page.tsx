'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Send, X } from 'lucide-react';
import { useAuth } from '@/hooks/usePmAuth';
import { kategorileriGetir, konuEkle, type ForumKategori } from '@/lib/forum-db';

export default function YeniCozumPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [kategoriler, setKategoriler] = useState<ForumKategori[]>([]);
  const [kategoriId, setKategoriId] = useState('');
  const [baslik, setBaslik] = useState('');
  const [icerik, setIcerik] = useState('');
  const [etiket, setEtiket] = useState('');
  const [etiketler, setEtiketler] = useState<string[]>([]);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState('');

  useEffect(() => { kategorileriGetir().then(setKategoriler); }, []);
  useEffect(() => {
    if (!loading && !user) router.replace('/giris');
  }, [loading, user, router]);

  const etiketEkle = () => {
    const temiz = etiket.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 30);
    if (!temiz || etiketler.includes(temiz) || etiketler.length >= 8) return;
    setEtiketler((onceki) => [...onceki, temiz]);
    setEtiket('');
  };

  const kaydet = async () => {
    if (!user || gonderiyor) return;
    if (!kategoriId) return setHata('Bir kategori seçin.');
    if (baslik.trim().length < 5) return setHata('Başlık en az 5 karakter olmalı.');
    if (icerik.trim().length < 20) return setHata('Sorunu veya deneyimi biraz daha ayrıntılı anlatın.');

    setGonderiyor(true);
    setHata('');
    try {
      const konu = await konuEkle({
        kategoriId,
        baslik: baslik.trim(),
        icerik: icerik.trim(),
        etiketler,
        yazarAd: user.displayName,
        yazarFoto: user.photoURL || undefined,
      });
      router.push(`/cozumlar/${konu.id}`);
    } catch (error) {
      setHata(error instanceof Error ? error.message : 'Kayıt oluşturulamadı.');
      setGonderiyor(false);
    }
  };

  if (loading || !user) return null;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 16px 70px' }}>
        <Link href="/cozumlar" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-4)', textDecoration: 'none', fontSize: 12, marginBottom: 22 }}>
          <ArrowLeft size={14} /> Çözüm Ağına dön
        </Link>

        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 7px', color: 'var(--amber)', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Tooldur Çözüm Ağı</p>
          <h1 style={{ margin: 0, fontSize: 28 }}>Gerçek bir sorun veya çözüm deneyimi ekle</h1>
          <p style={{ margin: '9px 0 0', color: 'var(--ink-3)', lineHeight: 1.6, fontSize: 14 }}>
            Ne oldu, ne denedin, ne işe yaradı? Marka/model, hata kodu, ölçü, yazılım sürümü gibi ayrıntılar sonraki kişinin doğru sonucu bulmasını sağlar.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 18, padding: 20, border: '1px solid var(--border)', borderRadius: 14, background: 'var(--bg-card)' }}>
          <div>
            <label style={labelStyle}>Kategori *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
              {kategoriler.map((kategori) => {
                const secili = kategori.id === kategoriId;
                return (
                  <button key={kategori.id} type="button" onClick={() => setKategoriId(kategori.id)} style={{ padding: '10px 11px', borderRadius: 9, border: `1px solid ${secili ? 'var(--amber)' : 'var(--border)'}`, background: secili ? 'rgba(245,158,11,.09)' : 'var(--bg-input)', color: secili ? 'var(--amber)' : 'var(--ink-2)', textAlign: 'left', cursor: 'pointer', fontSize: 12, fontWeight: secili ? 700 : 500 }}>
                    {kategori.ikon} {kategori.ad}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Sorun / deneyim başlığı *</label>
            <input value={baslik} onChange={(e) => setBaslik(e.target.value)} maxLength={200} placeholder="Örn. SolidWorks 2026 teknik resimde görünüş ters geliyor" style={inputStyle} />
            <p style={helpStyle}>Google’da birinin gerçekten aratacağı kadar net yaz.</p>
          </div>

          <div>
            <label style={labelStyle}>Ne oldu, ne denedin, sonuç neydi? *</label>
            <textarea value={icerik} onChange={(e) => setIcerik(e.target.value)} rows={11} maxLength={20000} placeholder={'Sorunu ayrıntılı anlat.\n\nVarsa: cihaz / makine / yazılım, model, sürüm, hata kodu, ölçüler.\n\nDenediğin yöntemleri ve işe yarayan çözümü de ekle.'} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} />
            <p style={helpStyle}>{icerik.length} karakter</p>
          </div>

          <div>
            <label style={labelStyle}>Etiketler</label>
            {etiketler.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 9 }}>
                {etiketler.map((item) => (
                  <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 999, background: 'rgba(245,158,11,.1)', color: 'var(--amber)', fontSize: 11 }}>
                    #{item}
                    <button type="button" onClick={() => setEtiketler((onceki) => onceki.filter((x) => x !== item))} style={{ border: 0, background: 'transparent', color: 'inherit', padding: 0, cursor: 'pointer', display: 'flex' }}><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={etiket} onChange={(e) => setEtiket(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); etiketEkle(); } }} placeholder="solidworks, rulman, servo..." style={inputStyle} />
              <button type="button" onClick={etiketEkle} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 13px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-muted)', color: 'var(--ink-2)', cursor: 'pointer', flexShrink: 0 }}><Plus size={14} /> Ekle</button>
            </div>
          </div>

          {hata && <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,.25)', background: 'rgba(239,68,68,.08)', color: '#ef4444', fontSize: 12 }}>{hata}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9, paddingTop: 4 }}>
            <Link href="/cozumlar" style={{ padding: '10px 15px', borderRadius: 9, border: '1px solid var(--border)', color: 'var(--ink-3)', textDecoration: 'none', fontSize: 13 }}>İptal</Link>
            <button type="button" onClick={kaydet} disabled={gonderiyor} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 17px', borderRadius: 9, border: 0, background: 'var(--amber)', color: '#0a0a0f', fontWeight: 800, cursor: gonderiyor ? 'wait' : 'pointer' }}>
              <Send size={14} /> {gonderiyor ? 'Yayınlanıyor...' : 'Yayınla'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 7, color: 'var(--ink-3)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '11px 12px', borderRadius: 9, border: '1px solid var(--border-mid)', background: 'var(--bg-input)', color: 'var(--ink)', outline: 'none', fontSize: 13 };
const helpStyle: React.CSSProperties = { margin: '5px 0 0', color: 'var(--ink-4)', fontSize: 11 };
