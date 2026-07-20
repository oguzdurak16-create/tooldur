'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/usePmAuth';
import {
  konuGetir, yorumlariGetir, yorumEkle, yorumSil,
  konuSil, konuBegeniToggle, yorumBegeniToggle,
  type ForumKonu, type ForumYorum,
} from '@/lib/forum-db';
import { ArrowLeft, Heart, MessageSquare, Eye, Share2, Trash2, CornerDownRight, Send, Pin, Lock } from 'lucide-react';

function zaman(iso: string) {
  const fark = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (fark < 60) return 'az önce';
  if (fark < 3600) return `${Math.floor(fark / 60)}dk önce`;
  if (fark < 86400) return `${Math.floor(fark / 3600)}sa önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Avatar({ ad, foto, size = 36 }: { ad: string; foto?: string | null; size?: number }) {
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

function Icerik({ text }: { text: string }) {
  const parcala = (t: string) => {
    const satir = t.split('\n');
    return satir.map((s, si) => {
      const parcalar = s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
      return (
        <span key={si}>
          {si > 0 && <br />}
          {parcalar.map((p, pi) => {
            if (p.startsWith('**') && p.endsWith('**')) return <strong key={pi}>{p.slice(2, -2)}</strong>;
            if (p.startsWith('`') && p.endsWith('`')) return <code key={pi} style={{ background: 'var(--bg-muted)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: '0.9em' }}>{p.slice(1, -1)}</code>;
            return <span key={pi}>{p}</span>;
          })}
        </span>
      );
    });
  };
  return <div style={{ lineHeight: 1.7, fontSize: 14, color: 'var(--ink-2)' }}>{parcala(text)}</div>;
}

export default function KonuClient({ id }: { id: string }) {
  const router   = useRouter();
  const { user } = useAuth();

  const [konu,        setKonu]        = useState<ForumKonu | null>(null);
  const [yorumlar,    setYorumlar]    = useState<ForumYorum[]>([]);
  const [yeniYorum,   setYeniYorum]   = useState('');
  const [cevaplanIcin,setCevaplanIcin]= useState<ForumYorum | null>(null);
  const [gonderiyor,  setGonderiyor]  = useState(false);
  const [yukleniyor,  setYukleniyor]  = useState(true);
  const [kopyalandi,  setKopyalandi]  = useState(false);
  const [onayModal,   setOnayModal]   = useState<{tip: 'yorum'|'konu'; id?: string} | null>(null);
  const [toast,       setToast]       = useState('');
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    Promise.all([
      konuGetir(id, user?.uid),
      yorumlariGetir(id, user?.uid),
    ]).then(([k, y]) => {
      setKonu(k); setYorumlar(y); setYukleniyor(false);
    });
  }, [id, user]);

  const gosterToast = (mesaj: string) => { setToast(mesaj); setTimeout(() => setToast(''), 2500); };

  const handleYorumGonder = async () => {
    if (!user || !yeniYorum.trim() || !konu?.id) return;
    if (konu.kapali) return;
    setGonderiyor(true);
    const y = await yorumEkle({
      konuId: konu.id,
      icerik: yeniYorum.trim(),
      ustId: cevaplanIcin?.id,
      yazarAd: user.displayName,
      yazarFoto: user.photoURL || undefined,
    });
    setYorumlar(prev => [...prev, { ...y, benim_begenim: false }]);
    setYeniYorum(''); setCevaplanIcin(null); setGonderiyor(false);
  };

  const handleKonuBegeni = async () => {
    if (!user || !konu) return;
    const yeni = await konuBegeniToggle(konu.id, user.uid);
    setKonu(prev => prev ? { ...prev, begeni_sayisi: prev.begeni_sayisi + (yeni ? 1 : -1), benim_begenim: yeni } : prev);
  };

  const handleYorumBegeni = async (y: ForumYorum) => {
    if (!user) return;
    const yeni = await yorumBegeniToggle(y.id, user.uid);
    setYorumlar(prev => prev.map(x => x.id === y.id ? { ...x, begeni_sayisi: x.begeni_sayisi + (yeni ? 1 : -1), benim_begenim: yeni } : x));
  };

  const handleYorumSil = (yId: string) => setOnayModal({ tip: 'yorum', id: yId });
  const handleKonuSil  = () => setOnayModal({ tip: 'konu' });

  const onayOnayla = async () => {
    if (!onayModal) return;
    if (onayModal.tip === 'yorum' && onayModal.id) {
      await yorumSil(onayModal.id);
      setYorumlar(prev => prev.filter(y => y.id !== onayModal.id));
      gosterToast('Yorum silindi.');
    } else if (onayModal.tip === 'konu' && konu) {
      await konuSil(konu.id);
      router.push('/forum');
    }
    setOnayModal(null);
  };

  const handlePaylasim = () => {
    navigator.clipboard.writeText(window.location.href).then(() => { setKopyalandi(true); setTimeout(() => setKopyalandi(false), 2000); });
  };

  const cevapla = (y: ForumYorum) => {
    setCevaplanIcin(y);
    textareaRef.current?.focus();
  };

  if (yukleniyor) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!konu) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <p style={{ fontSize: 32 }}>🔍</p>
      <p style={{ color: 'var(--ink-4)' }}>Konu bulunamadı.</p>
      <Link href="/forum" style={{ color: 'var(--amber)', textDecoration: 'none' }}>← Foruma dön</Link>
    </div>
  );

  const ustYorumlar = yorumlar.filter(y => !y.ust_id);
  const altYorumlar = (ustId: string) => yorumlar.filter(y => y.ust_id === ustId);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DiscussionForumPosting',
            headline: konu.baslik,
            text: konu.icerik,
            url: `https://www.tooldur.com/forum/konu/${konu.id}`,
            datePublished: konu.created_at,
            author: { '@type': 'Person', name: konu.yazar_ad },
            interactionStatistic: [
              { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: konu.begeni_sayisi || 0 },
              { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: konu.yorum_sayisi || 0 },
              { '@type': 'InteractionCounter', interactionType: 'https://schema.org/ViewAction', userInteractionCount: konu.goruntuleme || 0 },
            ],
          }),
        }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px 60px' }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 12, color: 'var(--ink-4)' }}>
            <Link href="/forum" style={{ color: 'var(--ink-4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={12} /> Forum</Link>
            {konu.kategori && <>
              <span>›</span>
              <Link href={`/forum/kategori/${konu.kategori.slug}`} style={{ color: 'var(--ink-4)', textDecoration: 'none' }}>{konu.kategori.ad}</Link>
            </>}
          </div>

          {/* Konu kartı */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            {/* Konu header */}
            <div style={{ padding: '20px 20px 16px' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {konu.pinli   && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', color: 'var(--amber)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Pin size={9} /> Sabitlenmiş</span>}
                {konu.kapali  && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: '#fee2e2', color: 'var(--red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Lock size={9} /> Kapalı</span>}
                {konu.kategori && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: konu.kategori.renk + '20', color: konu.kategori.renk, fontWeight: 600 }}>{konu.kategori.ikon} {konu.kategori.ad}</span>}
                {(konu.etiketler ?? []).map(e => <span key={e} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-muted)', color: 'var(--ink-4)', border: '1px solid var(--border)' }}>{e}</span>)}
              </div>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, color: 'var(--ink)', margin: '0 0 16px', lineHeight: 1.4 }}>{konu.baslik}</h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Avatar ad={konu.yazar_ad} foto={konu.yazar_foto} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{konu.yazar_ad}</span>
                    <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{zaman(konu.created_at)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--ink-4)', marginLeft: 'auto' }}><Eye size={11} /> {konu.goruntuleme}</span>
                  </div>
                  <Icerik text={konu.icerik} />
                </div>
              </div>
            </div>

            {/* Konu aksiyonları */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-muted)', flexWrap: 'wrap' }}>
              <button onClick={handleKonuBegeni} disabled={!user} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, border: `1px solid ${konu.benim_begenim ? 'var(--red)' : 'var(--border)'}`, background: konu.benim_begenim ? '#fee2e2' : 'transparent', color: konu.benim_begenim ? 'var(--red)' : 'var(--ink-3)', cursor: user ? 'pointer' : 'default', fontSize: 12, fontFamily: 'var(--font-sans)', transition: 'all .15s' }}>
                <Heart size={13} style={{ fill: konu.benim_begenim ? 'var(--red)' : 'none' }} /> {konu.begeni_sayisi}
              </button>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--ink-4)' }}>
                <MessageSquare size={13} /> {konu.yorum_sayisi} yorum
              </span>
              <button onClick={handlePaylasim} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)', background: kopyalandi ? 'var(--bg-muted)' : 'transparent', color: kopyalandi ? 'var(--green)' : 'var(--ink-3)', cursor: 'pointer', fontSize: 12, marginLeft: 4 }}>
                <Share2 size={12} /> {kopyalandi ? 'Kopyalandı!' : 'Paylaş'}
              </button>
              {user?.uid === konu.yazar_uid && (
                <button onClick={handleKonuSil} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-4)', cursor: 'pointer', fontSize: 12, marginLeft: 'auto' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--ink-4)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  <Trash2 size={12} /> Konuyu Sil
                </button>
              )}
            </div>
          </div>

          {/* Yorumlar */}
          {yorumlar.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={15} style={{ color: 'var(--amber)' }} /> {yorumlar.length} Yorum
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ustYorumlar.map(y => (
                  <div key={y.id}>
                    {/* Ana yorum */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <Avatar ad={y.yazar_ad} foto={y.yazar_foto} size={32} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{y.yazar_ad}</span>
                            <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{zaman(y.created_at)}</span>
                          </div>
                          <Icerik text={y.icerik} />
                          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                            <button onClick={() => handleYorumBegeni(y)} disabled={!user} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, border: `1px solid ${y.benim_begenim ? 'var(--red)' : 'var(--border)'}`, background: y.benim_begenim ? '#fee2e2' : 'transparent', color: y.benim_begenim ? 'var(--red)' : 'var(--ink-4)', cursor: user ? 'pointer' : 'default', fontSize: 11 }}>
                              <Heart size={11} style={{ fill: y.benim_begenim ? 'var(--red)' : 'none' }} /> {y.begeni_sayisi}
                            </button>
                            {user && !konu.kapali && (
                              <button onClick={() => cevapla(y)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-4)', cursor: 'pointer', fontSize: 11 }}>
                                <CornerDownRight size={11} /> Cevapla
                              </button>
                            )}
                            {user?.uid === y.yazar_uid && (
                              <button onClick={() => handleYorumSil(y.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '4px 8px', borderRadius: 20, border: '1px solid transparent', background: 'transparent', color: 'var(--ink-4)', cursor: 'pointer', fontSize: 11, marginLeft: 'auto' }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-4)')}>
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Alt yorumlar (cevaplar) */}
                    {altYorumlar(y.id).map(alt => (
                      <div key={alt.id} style={{ marginLeft: 28, marginTop: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--amber)', borderRadius: '0 10px 10px 0', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <Avatar ad={alt.yazar_ad} foto={alt.yazar_foto} size={26} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{alt.yazar_ad}</span>
                              <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{zaman(alt.created_at)}</span>
                            </div>
                            <Icerik text={alt.icerik} />
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              <button onClick={() => handleYorumBegeni(alt)} disabled={!user} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 20, border: `1px solid ${alt.benim_begenim ? 'var(--red)' : 'var(--border)'}`, background: alt.benim_begenim ? '#fee2e2' : 'transparent', color: alt.benim_begenim ? 'var(--red)' : 'var(--ink-4)', cursor: user ? 'pointer' : 'default', fontSize: 11 }}>
                                <Heart size={10} style={{ fill: alt.benim_begenim ? 'var(--red)' : 'none' }} /> {alt.begeni_sayisi}
                              </button>
                              {user?.uid === alt.yazar_uid && (
                                <button onClick={() => handleYorumSil(alt.id)} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 20, border: '1px solid transparent', background: 'transparent', color: 'var(--ink-4)', cursor: 'pointer', fontSize: 11, marginLeft: 'auto' }}
                                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-4)')}>
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yorum yaz */}
          {user ? (
            konu.kapali ? (
              <div style={{ padding: '14px 18px', background: '#fee2e2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--red)' }}>
                <Lock size={15} /> Bu konu kapatılmıştır, yeni yorum yapılamaz.
              </div>
            ) : (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <Avatar ad={user.displayName} foto={user.photoURL} size={34} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{user.displayName}</span>
                    {cevaplanIcin && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, padding: '5px 10px', background: 'var(--bg-muted)', borderRadius: 6, fontSize: 11, color: 'var(--ink-4)' }}>
                        <CornerDownRight size={11} style={{ color: 'var(--amber)' }} />
                        <span><strong style={{ color: 'var(--ink-2)' }}>{cevaplanIcin.yazar_ad}</strong>&apos;a cevap</span>
                        <button onClick={() => setCevaplanIcin(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: 12 }}>×</button>
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  ref={textareaRef}
                  value={yeniYorum}
                  onChange={e => setYeniYorum(e.target.value)}
                  placeholder="Yorumunuzu yazın... (**kalın**, `kod` desteklenir)"
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border-mid)', borderRadius: 8, color: 'var(--ink)', fontFamily: 'var(--font-sans)', fontSize: 13, resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--amber)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleYorumGonder(); }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>Ctrl+Enter ile gönder</span>
                  <button onClick={handleYorumGonder} disabled={!yeniYorum.trim() || gonderiyor}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: yeniYorum.trim() ? 'var(--amber)' : 'var(--bg-muted)', border: 'none', borderRadius: 8, color: yeniYorum.trim() ? '#0a0a0f' : 'var(--ink-4)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, cursor: yeniYorum.trim() ? 'pointer' : 'default', transition: 'all .15s' }}>
                    <Send size={13} /> {gonderiyor ? 'Gönderiliyor...' : 'Yorum Yap'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 14 }}>Yorum yapmak için giriş yapmanız gerekiyor.</p>
              <Link href="/giris" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', background: 'var(--amber)', color: '#0a0a0f', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Giriş Yap
              </Link>
            </div>
          )}
        </div>

        {/* Onay Modal */}
        {onayModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, maxWidth: 320, width: '100%', boxShadow: 'var(--shadow-lg)' }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
                {onayModal.tip === 'yorum' ? 'Yorumu sil?' : 'Konuyu sil?'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 20 }}>
                {onayModal.tip === 'konu' ? 'Tüm yorumlar da silinecek. Bu işlem geri alınamaz.' : 'Bu işlem geri alınamaz.'}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setOnayModal(null)} style={{ flex: 1, padding: '9px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--ink-3)' }}>Vazgeç</button>
                <button onClick={onayOnayla} style={{ flex: 1, padding: '9px', background: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'white', fontWeight: 700 }}>Evet, Sil</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 600, background: '#166534', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,.25)', whiteSpace: 'nowrap' }}>
            ✓ {toast}
          </div>
        )}
      </div>
    </>
  );
}
