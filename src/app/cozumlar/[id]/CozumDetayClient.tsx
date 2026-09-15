'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Eye, Heart, MessageCircle, Send, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/usePmAuth';
import {
  konuBegeniToggle,
  konuGetir,
  yorumBegeniToggle,
  yorumEkle,
  yorumlariGetir,
  type ForumKonu,
  type ForumYorum,
} from '@/lib/forum-db';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function CozumDetayClient({ id }: { id: string }) {
  const { user } = useAuth();
  const [konu, setKonu] = useState<ForumKonu | null>(null);
  const [yorumlar, setYorumlar] = useState<ForumYorum[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [cozum, setCozum] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState('');
  const [paylasildi, setPaylasildi] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let aktif = true;
    setYukleniyor(true);
    Promise.all([konuGetir(id, user?.uid), yorumlariGetir(id, user?.uid)]).then(([k, y]) => {
      if (!aktif) return;
      setKonu(k);
      setYorumlar(y);
      setYukleniyor(false);
    });
    return () => { aktif = false; };
  }, [id, user?.uid]);

  const anaYorumlar = useMemo(() => yorumlar.filter((y) => !y.ust_id), [yorumlar]);

  const sorunBendeDeVar = async () => {
    if (!user || !konu) return;
    const aktif = await konuBegeniToggle(konu.id, user.uid);
    setKonu((onceki) => onceki ? { ...onceki, benim_begenim: aktif, begeni_sayisi: onceki.begeni_sayisi + (aktif ? 1 : -1) } : onceki);
  };

  const iseYaradi = async (yorum: ForumYorum) => {
    if (!user) return;
    const aktif = await yorumBegeniToggle(yorum.id, user.uid);
    setYorumlar((onceki) => onceki.map((item) => item.id === yorum.id ? { ...item, benim_begenim: aktif, begeni_sayisi: item.begeni_sayisi + (aktif ? 1 : -1) } : item));
  };

  const cozumGonder = async () => {
    if (!user) {
      window.location.href = '/giris';
      return;
    }
    if (!konu || cozum.trim().length < 2) return;
    setGonderiyor(true);
    setHata('');
    try {
      const yeni = await yorumEkle({
        konuId: konu.id,
        icerik: cozum.trim(),
        yazarAd: user.displayName,
        yazarFoto: user.photoURL || undefined,
      });
      setYorumlar((onceki) => [...onceki, { ...yeni, benim_begenim: false }]);
      setKonu((onceki) => onceki ? { ...onceki, yorum_sayisi: onceki.yorum_sayisi + 1 } : onceki);
      setCozum('');
    } catch (error) {
      setHata(error instanceof Error ? error.message : 'Çözüm gönderilemedi.');
    } finally {
      setGonderiyor(false);
    }
  };

  const paylas = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setPaylasildi(true);
      setTimeout(() => setPaylasildi(false), 1800);
    } catch {}
  };

  if (yukleniyor) return <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: 'var(--ink-4)' }}>Yükleniyor...</div>;
  if (!konu) return (
    <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: 20, textAlign: 'center' }}>
      <div><h1>İçerik bulunamadı.</h1><Link href="/cozumlar" style={{ color: 'var(--amber)' }}>Çözüm Ağına dön</Link></div>
    </div>
  );

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
    <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: qaJson }} />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '26px 16px 70px' }}>
        <Link href="/cozumlar" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ink-4)', textDecoration: 'none', fontSize: 12, marginBottom: 18 }}>
          <ArrowLeft size={14} /> Çözüm Ağı
        </Link>

        <article style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ padding: '22px 22px 18px' }}>
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
              {konu.kategori && <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: `${konu.kategori.renk}20`, color: konu.kategori.renk }}>{konu.kategori.ikon} {konu.kategori.ad}</span>}
              {(konu.etiketler || []).map((etiket) => <span key={etiket} style={{ fontSize: 10, color: 'var(--ink-4)' }}>#{etiket}</span>)}
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 34px)', lineHeight: 1.2, letterSpacing: '-.02em' }}>{konu.baslik}</h1>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 11, color: 'var(--ink-4)', fontSize: 11 }}>
              <span>{konu.yazar_ad}</span>
              <span>{formatDate(konu.created_at)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {konu.goruntuleme || 0}</span>
            </div>
            <div style={{ marginTop: 20, whiteSpace: 'pre-wrap', color: 'var(--ink-2)', lineHeight: 1.75, fontSize: 14 }}>{konu.icerik}</div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-muted)' }}>
            <button onClick={sorunBendeDeVar} disabled={!user} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 999, border: `1px solid ${konu.benim_begenim ? 'var(--amber)' : 'var(--border)'}`, background: konu.benim_begenim ? 'rgba(245,158,11,.1)' : 'transparent', color: konu.benim_begenim ? 'var(--amber)' : 'var(--ink-3)', fontSize: 11, cursor: user ? 'pointer' : 'default' }}>
              <Heart size={13} /> Bende de oldu · {konu.begeni_sayisi || 0}
            </button>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--ink-4)', fontSize: 11 }}><MessageCircle size={13} /> {anaYorumlar.length} çözüm</span>
            <button onClick={paylas} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: paylasildi ? 'var(--amber)' : 'var(--ink-3)', cursor: 'pointer', fontSize: 11 }}><Share2 size={12} /> {paylasildi ? 'Kopyalandı' : 'Paylaş'}</button>
          </div>
        </article>

        <section style={{ marginTop: 26 }}>
          <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <div><h2 style={{ margin: 0, fontSize: 20 }}>Çözümler ve gerçek deneyimler</h2><p style={{ margin: '4px 0 0', color: 'var(--ink-4)', fontSize: 12 }}>Denediysen sonucu yaz; “işe yaradı” oyları faydalı çözümleri öne çıkarır.</p></div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {anaYorumlar.length === 0 ? (
              <div style={{ padding: 28, border: '1px dashed var(--border-mid)', borderRadius: 12, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Henüz çözüm paylaşılmamış. İlk deneyimi sen ekleyebilirsin.</div>
            ) : [...anaYorumlar].sort((a, b) => (b.begeni_sayisi || 0) - (a.begeni_sayisi || 0)).map((yorum, index) => (
              <article key={yorum.id} style={{ padding: 18, borderRadius: 12, border: `1px solid ${index === 0 && yorum.begeni_sayisi > 0 ? 'rgba(34,197,94,.35)' : 'var(--border)'}`, background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <strong style={{ fontSize: 12 }}>{yorum.yazar_ad}</strong>
                  <span style={{ color: 'var(--ink-4)', fontSize: 10 }}>{formatDate(yorum.created_at)}</span>
                  {index === 0 && yorum.begeni_sayisi > 0 && <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: 10, fontWeight: 800 }}><CheckCircle2 size={12} /> En çok işe yarayan</span>}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--ink-2)', lineHeight: 1.7, fontSize: 13 }}>{yorum.icerik}</div>
                <button onClick={() => iseYaradi(yorum)} disabled={!user} style={{ marginTop: 13, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 9px', borderRadius: 8, border: `1px solid ${yorum.benim_begenim ? '#22c55e' : 'var(--border)'}`, background: yorum.benim_begenim ? 'rgba(34,197,94,.08)' : 'transparent', color: yorum.benim_begenim ? '#22c55e' : 'var(--ink-4)', fontSize: 11, cursor: user ? 'pointer' : 'default' }}><CheckCircle2 size={12} /> İşe yaradı · {yorum.begeni_sayisi || 0}</button>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 24, padding: 18, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-card)' }}>
          <h2 style={{ margin: '0 0 5px', fontSize: 17 }}>Çözüm veya deneyim ekle</h2>
          <p style={{ margin: '0 0 12px', color: 'var(--ink-4)', fontSize: 12 }}>Ne yaptın, hangi ayar/değer işe yaradı, ne işe yaramadı? Mümkün olduğunca somut yaz.</p>
          <textarea ref={textareaRef} value={cozum} onChange={(e) => setCozum(e.target.value)} rows={6} placeholder={user ? 'Denediğin çözümü yaz...' : 'Çözüm eklemek için giriş yapmalısın.'} disabled={!user} style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 9, border: '1px solid var(--border-mid)', background: 'var(--bg-input)', color: 'var(--ink)', resize: 'vertical', outline: 'none', lineHeight: 1.6 }} />
          {hata && <p style={{ margin: '8px 0 0', color: '#ef4444', fontSize: 11 }}>{hata}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            {user ? (
              <button onClick={cozumGonder} disabled={gonderiyor || !cozum.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 13px', border: 0, borderRadius: 8, background: cozum.trim() ? 'var(--amber)' : 'var(--bg-muted)', color: cozum.trim() ? '#0a0a0f' : 'var(--ink-4)', fontWeight: 800, cursor: cozum.trim() ? 'pointer' : 'default' }}><Send size={13} /> {gonderiyor ? 'Gönderiliyor...' : 'Çözümü paylaş'}</button>
            ) : (
              <Link href="/giris" style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>Giriş yap →</Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
