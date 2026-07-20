'use client';

import { useEffect, useRef, useState } from 'react';
import {
  X, Plus, Trash2, Paperclip, MessageSquare, CheckSquare,
  Upload, File as FileIcon, Clock
} from 'lucide-react';
import type { Gorev, Yorum, CheckItem, Ek, UyeRef, PmAktivite } from './pm-types';
import {
  gorevGuncelle,
  yorumEkle,
  dosyaYukle,
  ekSilVeLogla,
  gorevAktivitesiEkle,
  gorevAktiviteleriniDinle,
} from '@/lib/pm-db-supabase';
import { KOLONLAR, ONCELIK_MAP } from './pm-constants';

interface Props {
  gorev: Gorev;
  projeId: string;
  sahipUid: string;
  uyeler: UyeRef[];
  benimUid: string;
  benimAd: string;
  benimFoto?: string;
  onKapat: () => void;
}

export default function GorevDetayModal({
  gorev,
  projeId,
  sahipUid,
  uyeler,
  benimUid,
  benimAd,
  benimFoto,
  onKapat,
}: Props) {
  const atanmis = (gorev.atananlar ?? []).some(a => a.uid === benimUid);
  const yetkili = benimUid === sahipUid || atanmis;

  const [baslik, setBaslik] = useState(gorev.baslik);
  const [aciklama, setAciklama] = useState(gorev.aciklama ?? '');
  const [durum, setDurum] = useState(gorev.durum);
  const [oncelik, setOncelik] = useState(gorev.oncelik);
  const [termin, setTermin] = useState(gorev.termin ?? '');
  const [atananlar, setAtananlar] = useState<UyeRef[]>(gorev.atananlar ?? []);
  const [etiketler, setEtiketler] = useState<string[]>(gorev.etiketler ?? []);
  const [yeniEtiket, setYeniEtiket] = useState('');
  const [checklist, setChecklist] = useState<CheckItem[]>(gorev.checklistler ?? []);
  const [yeniCheckMetin, setYeniCheckMetin] = useState('');
  const [yorumMetni, setYorumMetni] = useState('');
  const [ekYukleniyor, setEkYukleniyor] = useState(false);
  const [localEkler, setLocalEkler] = useState<Ek[]>(gorev.ekler ?? []);
  const [localYorumlar, setLocalYorumlar] = useState<Yorum[]>(gorev.yorumlar ?? []);
  const [yuklemePct, setYuklemePct] = useState(0);
  const [kaydetYukleniyor, setKaydetYukleniyor] = useState(false);
  const [aktiviteler, setAktiviteler] = useState<PmAktivite[]>([]);
  const [islemHatasi, setIslemHatasi] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const oncekiOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escapeKapat = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !kaydetYukleniyor && !ekYukleniyor) onKapat();
    };
    window.addEventListener('keydown', escapeKapat);

    return () => {
      document.body.style.overflow = oncekiOverflow;
      window.removeEventListener('keydown', escapeKapat);
    };
  }, [ekYukleniyor, kaydetYukleniyor, onKapat]);

  useEffect(() => {
    const unsub = gorevAktiviteleriniDinle(gorev.id, setAktiviteler);
    return () => unsub?.();
  }, [gorev.id]);

  const aktiviteEkle = async (tip: PmAktivite['tip'], aciklamaText: string) => {
    await gorevAktivitesiEkle({
      projeId,
      gorevId: gorev.id,
      tip,
      aciklama: aciklamaText,
      actorUid: benimUid,
      actorAd: benimAd,
      actorFoto: benimFoto,
    });
  };

  const kaydet = async () => {
    if (!baslik.trim()) {
      setIslemHatasi('Görev başlığı boş bırakılamaz.');
      return;
    }

    setKaydetYukleniyor(true);
    setIslemHatasi('');

    try {
      const degisenler: string[] = [];
      if (gorev.baslik !== baslik.trim()) degisenler.push('başlık');
      if ((gorev.aciklama ?? '') !== aciklama) degisenler.push('açıklama');
      if (gorev.durum !== durum) degisenler.push('durum');
      if (gorev.oncelik !== oncelik) degisenler.push('öncelik');
      if ((gorev.termin ?? '') !== termin) degisenler.push('termin');
      if (JSON.stringify(gorev.etiketler ?? []) !== JSON.stringify(etiketler)) degisenler.push('etiketler');

      const oncekiAtanan = JSON.stringify((gorev.atananlar ?? []).map(a => a.uid).sort());
      const yeniAtanan = JSON.stringify((atananlar ?? []).map(a => a.uid).sort());
      if (oncekiAtanan !== yeniAtanan) degisenler.push('atananlar');

      await gorevGuncelle(gorev.id, {
        baslik: baslik.trim(),
        aciklama,
        durum,
        oncelik,
        termin,
        atananlar,
        etiketler,
        checklistler: checklist,
      });

      if (degisenler.length > 0) {
        if (gorev.durum !== durum) {
          await aktiviteEkle(
            'durum_degisti',
            `Durum değişti: ${KOLONLAR.find(k => k.id === gorev.durum)?.label || gorev.durum} → ${KOLONLAR.find(k => k.id === durum)?.label || durum}`
          );
        } else {
          await aktiviteEkle('gorev_guncellendi', `Görev güncellendi: ${degisenler.join(', ')}`);
        }
      }

      onKapat();
    } catch (error) {
      setIslemHatasi(error instanceof Error ? error.message : 'Görev kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setKaydetYukleniyor(false);
    }
  };

  const checkEkle = async () => {
    if (!yeniCheckMetin.trim()) return;

    const yeni: CheckItem = {
      id: crypto.randomUUID(),
      metin: yeniCheckMetin.trim(),
      tamamlandi: false,
    };

    const liste = [...checklist, yeni];
    setChecklist(liste);
    setYeniCheckMetin('');

    await gorevGuncelle(gorev.id, { checklistler: liste });
    await aktiviteEkle('checklist_degisti', `Checklist maddesi eklendi: ${yeni.metin}`);
  };

  const checkToggle = async (id: string) => {
    const hedef = checklist.find(c => c.id === id);
    const liste = checklist.map(c =>
      c.id === id ? { ...c, tamamlandi: !c.tamamlandi } : c
    );

    setChecklist(liste);
    await gorevGuncelle(gorev.id, { checklistler: liste });
    await aktiviteEkle(
      'checklist_degisti',
      hedef ? `Checklist güncellendi: ${hedef.metin}` : 'Checklist güncellendi'
    );
  };

  const checkSil = async (id: string) => {
    const hedef = checklist.find(c => c.id === id);
    const liste = checklist.filter(c => c.id !== id);

    setChecklist(liste);
    await gorevGuncelle(gorev.id, { checklistler: liste });
    await aktiviteEkle(
      'checklist_degisti',
      hedef ? `Checklist maddesi silindi: ${hedef.metin}` : 'Checklist maddesi silindi'
    );
  };

  const checkPct = checklist.length
    ? Math.round((checklist.filter(c => c.tamamlandi).length / checklist.length) * 100)
    : 0;

  const yorumGonder = async () => {
    if (!yorumMetni.trim()) return;

    const yeniYorum: Yorum = {
      id: crypto.randomUUID(),
      metin: yorumMetni.trim(),
      yazarUid: benimUid,
      yazarAd: benimAd,
      yazarFoto: benimFoto,
      tarih: new Date().toISOString(),
    };

    setIslemHatasi('');
    try {
      await yorumEkle(gorev.id, benimUid, benimAd, benimFoto, yorumMetni.trim(), projeId);
      setLocalYorumlar(prev => [...prev, yeniYorum]);
      setYorumMetni('');
    } catch (error) {
      setIslemHatasi(error instanceof Error ? error.message : 'Yorum gönderilemedi.');
    }
  };

  const dosyaSec = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setIslemHatasi('Maksimum dosya boyutu 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setEkYukleniyor(true);
    setIslemHatasi('');

    try {
      const yeniEk = await dosyaYukle(
        gorev.id,
        benimUid,
        file,
        pct => setYuklemePct(pct),
        { projeId, actorAd: benimAd, actorFoto: benimFoto }
      );
      setLocalEkler(prev => [...prev, yeniEk]);
    } catch (error) {
      setIslemHatasi(error instanceof Error ? error.message : 'Dosya yüklenemedi.');
    } finally {
      setEkYukleniyor(false);
      setYuklemePct(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const uyeToggle = async (uye: UyeRef) => {
    const varMi = atananlar.find(a => a.uid === uye.uid);
    const yeniListe = varMi
      ? atananlar.filter(a => a.uid !== uye.uid)
      : [...atananlar, uye];

    setAtananlar(yeniListe);
    await gorevGuncelle(gorev.id, { atananlar: yeniListe });

    await aktiviteEkle(
      'gorev_guncellendi',
      varMi
        ? `${uye.displayName || uye.email} görevden çıkarıldı`
        : `${uye.displayName || uye.email} göreve atandı`
    );
  };

  const etiketEkle = () => {
    const e = yeniEtiket.trim().toLowerCase();

    if (!e || etiketler.includes(e)) {
      setYeniEtiket('');
      return;
    }

    setEtiketler([...etiketler, e]);
    setYeniEtiket('');
  };

  const s = {
    fontSize: 11,
    fontFamily: 'var(--font-mono)',
    letterSpacing: '.08em',
    color: 'var(--ink-3)',
    textTransform: 'uppercase' as const,
    display: 'block',
    marginBottom: 8,
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-muted)',
    border: '1px solid var(--border)',
    borderRadius: 12,
  };

  const sectionTitleRow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        background: 'rgba(0,0,0,.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'calc(14px + env(safe-area-inset-top)) 12px calc(20px + env(safe-area-inset-bottom))',
        overflowY: 'auto',
      }}
      onClick={e => e.target === e.currentTarget && !kaydetYukleniyor && !ekYukleniyor && onKapat()}
      role="dialog"
      aria-modal="true"
      aria-label="Görev detayları"
    >
      <style>{`
        .gdm-shell{
          width:min(1080px,100%);
          max-width:100%;
          max-height:calc(100svh - 28px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
          border-radius:24px;
          overflow:auto;
          overscroll-behavior:contain;
          border:1px solid var(--border);
          background:var(--bg-card);
          box-shadow:var(--shadow-lg);
        }
        .gdm-head{
          display:flex;
          align-items:center;
          gap:12px;
          padding:16px 18px;
          border-bottom:1px solid var(--border);
          background:linear-gradient(180deg,var(--bg-card),var(--bg-muted));
          position:sticky;
          top:0;
          z-index:5;
        }
        .gdm-head-input{
          flex:1;
          min-width:0;
          font-family:var(--font-sans);
          font-size:18px;
          font-weight:700;
          color:var(--ink);
          background:none;
          border:none;
          outline:none;
        }
        .gdm-close{
          position:relative;
          z-index:10;
          width:42px;
          height:42px;
          border-radius:12px;
          border:1px solid var(--border);
          background:var(--bg-muted);
          color:var(--ink-3);
          display:flex;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          flex-shrink:0;
        }
        .gdm-grid{
          display:grid;
          grid-template-columns:minmax(0,1fr) 300px;
        }
        .gdm-main{
          padding:22px;
          min-width:0;
        }
        .gdm-side{
          padding:22px;
          border-left:1px solid var(--border);
          background:linear-gradient(180deg,var(--bg-card),var(--bg-muted));
        }
        .gdm-block{
          margin-bottom:22px;
        }
        .gdm-list-item{
          display:flex;
          align-items:center;
          gap:8px;
          padding:8px 10px;
          border-bottom:1px solid var(--border);
          background:transparent;
        }
        .gdm-subtle{
          font-size:12px;
          color:var(--ink-4);
        }
        .gdm-comment,
        .gdm-activity{
          display:flex;
          gap:10px;
          padding:10px 12px;
          background:var(--bg-muted);
          border:1px solid var(--border);
          border-radius:12px;
        }
        .gdm-avatar{
          width:32px;
          height:32px;
          border-radius:999px;
          flex-shrink:0;
          background:rgba(255,177,27,.12);
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
          color:var(--amber);
          font-size:11px;
          font-weight:700;
        }
        .gdm-footer-btn{
          width:100%;
          height:44px;
          border-radius:12px;
          border:1px solid var(--border);
          background:linear-gradient(180deg,#ffc24a,#ffb11b);
          color:#07111f;
          font-weight:700;
          cursor:pointer;
        }
        .gdm-mini-btn{
          height:34px;
          min-width:34px;
          padding:0 10px;
          border-radius:10px;
          border:1px solid var(--border);
          background:var(--bg-muted);
          color:var(--ink-2);
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:6px;
        }
        .gdm-tag{
          display:inline-flex;
          align-items:center;
          gap:4px;
          padding:5px 9px;
          border-radius:999px;
          background:var(--bg-muted);
          border:1px solid var(--border);
          font-size:11px;
          color:var(--ink-2);
        }
        .gdm-compose-row{min-width:0;}
        .gdm-compose-row .td-input{min-width:0;}
        .gdm-save-sticky{position:sticky; bottom:12px; z-index:4; box-shadow:0 14px 34px rgba(0,0,0,.28);}
        .gdm-error{margin:12px 18px 0;padding:11px 12px;border-radius:14px;border:1px solid rgba(239,68,68,.24);background:rgba(239,68,68,.10);color:#fecaca;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;font-weight:750;}
        .gdm-error button{width:28px;height:28px;flex-shrink:0;border:0;border-radius:9px;background:rgba(239,68,68,.12);color:#fecaca;display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .gdm-close:disabled,.gdm-footer-btn:disabled{opacity:.55;cursor:not-allowed;transform:none;}
        @media (max-width: 900px){
          .gdm-grid{
            grid-template-columns:1fr !important;
          }
          .gdm-side{
            border-left:none;
            border-top:1px solid var(--border);
          }
        }
        @media (max-width: 640px){
          .gdm-shell{
            width:100%;
            max-width:none;
            max-height:calc(100svh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
            border-radius:0;
          }
          .gdm-head{
            padding:14px;
          }
          .gdm-head-input{
            font-size:16px;
          }
          .gdm-main,
          .gdm-side{
            padding:16px;
          }
          .gdm-side{padding-bottom:calc(24px + env(safe-area-inset-bottom));}
          .gdm-compose-row{display:grid !important; grid-template-columns:minmax(0,1fr) auto; align-items:center;}
          .gdm-compose-row .gdm-mini-btn{min-width:44px; height:42px;}
          .gdm-comment,
          .gdm-activity{
            padding:10px;
          }
        }
      `}</style>

      <div className="gdm-shell">
        <div className="gdm-head">
          <input
            value={baslik}
            onChange={e => yetkili && setBaslik(e.target.value)}
            readOnly={!yetkili}
            className="gdm-head-input"
          />
          <button onClick={onKapat} className="gdm-close" aria-label="Görev detayını kapat" disabled={kaydetYukleniyor || ekYukleniyor}>
            <X size={16} />
          </button>
        </div>

        {!!islemHatasi && (
          <div className="gdm-error" role="alert">
            <span>{islemHatasi}</span>
            <button onClick={() => setIslemHatasi('')} aria-label="Hata mesajını kapat"><X size={14} /></button>
          </div>
        )}

        <div className="gdm-grid">
          <div className="gdm-main">
            <div className="gdm-block">
              <label style={s}>Açıklama</label>
              <textarea
                value={aciklama}
                onChange={e => yetkili && setAciklama(e.target.value)}
                readOnly={!yetkili}
                placeholder="Görev açıklaması..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid var(--border)',
                  borderRadius: 12,
                  background: 'var(--bg-input)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  lineHeight: 1.55,
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            <div className="gdm-block">
              <div style={sectionTitleRow}>
                <CheckSquare size={14} style={{ color: 'var(--amber)' }} />
                <span style={{ ...s, marginBottom: 0 }}>Checklist</span>
                {checklist.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>
                    %{checkPct}
                  </span>
                )}
              </div>

              {checklist.length > 0 && (
                <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${checkPct}%`, background: 'var(--amber)', borderRadius: 99, transition: 'width .3s' }} />
                </div>
              )}

              <div style={cardStyle}>
                {checklist.length === 0 && (
                  <div style={{ padding: '14px 12px', fontSize: 12, color: 'var(--ink-4)' }}>
                    Henüz checklist maddesi yok.
                  </div>
                )}

                {checklist.map(c => (
                  <div key={c.id} className="gdm-list-item">
                    <input
                      type="checkbox"
                      checked={c.tamamlandi}
                      onChange={() => yetkili && checkToggle(c.id)}
                      style={{ cursor: yetkili ? 'pointer' : 'default', accentColor: 'var(--amber)' }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: 'var(--ink)',
                        textDecoration: c.tamamlandi ? 'line-through' : 'none',
                        opacity: c.tamamlandi ? 0.55 : 1,
                      }}
                    >
                      {c.metin}
                    </span>
                    {yetkili && (
                      <button
                        onClick={() => checkSil(c.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 2 }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {yetkili && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input
                    className="td-input"
                    value={yeniCheckMetin}
                    onChange={e => setYeniCheckMetin(e.target.value)}
                    placeholder="Yeni madde..."
                    onKeyDown={e => e.key === 'Enter' && checkEkle()}
                    style={{ flex: 1, fontSize: 12 }}
                  />
                  <button onClick={checkEkle} className="gdm-mini-btn">
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="gdm-block">
              <div style={sectionTitleRow}>
                <Paperclip size={14} style={{ color: 'var(--amber)' }} />
                <span style={{ ...s, marginBottom: 0 }}>Ekler</span>

                {yetkili && (
                  <button onClick={() => fileInputRef.current?.click()} className="gdm-mini-btn" style={{ marginLeft: 'auto' }}>
                    <Upload size={12} />
                    Dosya Ekle
                  </button>
                )}

                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={dosyaSec} />
              </div>

              {ekYukleniyor && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${yuklemePct}%`, background: 'var(--amber)', borderRadius: 99, transition: 'width .2s' }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                    Yükleniyor %{yuklemePct}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {localEkler.map(ek => (
                  <div key={ek.id} style={{ ...cardStyle, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileIcon size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
                    <a
                      href={ek.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: 'var(--amber)',
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ek.ad}
                    </a>
                    <span style={{ fontSize: 10, color: 'var(--ink-4)', flexShrink: 0 }}>
                      {(ek.boyut / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={async () => {
                        await ekSilVeLogla({
                          ekId: ek.id,
                          url: ek.url,
                          projeId,
                          gorevId: gorev.id,
                          actorUid: benimUid,
                          actorAd: benimAd,
                          actorFoto: benimFoto,
                          dosyaAdi: ek.ad,
                        });
                        setLocalEkler(prev => prev.filter(x => x.id !== ek.id));
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 2 }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {localEkler.length === 0 && !ekYukleniyor && (
                  <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>Henüz ek yok.</p>
                )}
              </div>
            </div>

            <div className="gdm-block">
              <div style={sectionTitleRow}>
                <Clock size={14} style={{ color: 'var(--amber)' }} />
                <span style={{ ...s, marginBottom: 0 }}>Aktivite Geçmişi</span>
              </div>

              {aktiviteler.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>Henüz aktivite yok.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {aktiviteler.slice(0, 12).map(a => (
                    <div key={a.id} className="gdm-activity">
                      <div className="gdm-avatar">
                        {a.actorFoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.actorFoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          (a.actorAd || '?').slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 700, marginBottom: 3 }}>
                          {a.actorAd || 'Sistem'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                          {a.aciklama}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', marginTop: 5 }}>
                          {new Date(a.createdAt).toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="gdm-block" style={{ marginBottom: 0 }}>
              <div style={sectionTitleRow}>
                <MessageSquare size={14} style={{ color: 'var(--amber)' }} />
                <span style={{ ...s, marginBottom: 0 }}>Yorumlar</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {localYorumlar.map(y => (
                  <div key={y.id} className="gdm-comment">
                    <div className="gdm-avatar">
                      {y.yazarFoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={y.yazarFoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        y.yazarAd.slice(0, 2).toUpperCase()
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{y.yazarAd}</span>
                        <span style={{ fontSize: 10, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                          {y.tarih
                            ? new Date(y.tarih).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>{y.metin}</p>
                    </div>
                  </div>
                ))}
              </div>

              {yetkili && (
                <div className="gdm-compose-row" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input
                    className="td-input"
                    value={yorumMetni}
                    onChange={e => setYorumMetni(e.target.value)}
                    placeholder="Yorum yaz..."
                    onKeyDown={e => e.key === 'Enter' && yorumGonder()}
                    style={{ flex: 1 }}
                  />
                  <button onClick={yorumGonder} className="gdm-mini-btn">
                    Gönder
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="gdm-side">
            <div style={{ ...cardStyle, padding: 14, marginBottom: 14 }}>
              <label style={s}>Durum</label>
              <select
                value={durum}
                onChange={e => yetkili && setDurum(e.target.value as any)}
                disabled={!yetkili}
                className="td-input"
                style={{ width: '100%', marginBottom: 14 }}
              >
                {KOLONLAR.map(k => (
                  <option key={k.id} value={k.id}>{k.label}</option>
                ))}
              </select>

              <label style={s}>Öncelik</label>
              <select
                value={oncelik}
                onChange={e => yetkili && setOncelik(e.target.value as any)}
                disabled={!yetkili}
                className="td-input"
                style={{ width: '100%', marginBottom: 14 }}
              >
                {Object.entries(ONCELIK_MAP).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>

              <label style={s}>Termin</label>
              <input
                type="date"
                value={termin}
                onChange={e => yetkili && setTermin(e.target.value)}
                disabled={!yetkili}
                className="td-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ ...cardStyle, padding: 14, marginBottom: 14 }}>
              <label style={s}>Atananlar</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {uyeler.map(uye => {
                  const secili = atananlar.some(a => a.uid === uye.uid);
                  return (
                    <label
                      key={uye.uid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        fontSize: 12,
                        color: 'var(--ink)',
                        cursor: yetkili ? 'pointer' : 'default',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={secili}
                        onChange={() => yetkili && uyeToggle(uye)}
                        disabled={!yetkili}
                      />
                      <span style={{ lineHeight: 1.4 }}>{uye.displayName || uye.email}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ ...cardStyle, padding: 14, marginBottom: 16 }}>
              <label style={s}>Etiketler</label>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {etiketler.map(etiket => (
                  <span key={etiket} className="gdm-tag">
                    #{etiket}
                    {yetkili && (
                      <button
                        onClick={() => setEtiketler(prev => prev.filter(x => x !== etiket))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 0 }}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {yetkili && (
                <div className="gdm-compose-row" style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="td-input"
                    value={yeniEtiket}
                    onChange={e => setYeniEtiket(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && etiketEkle()}
                    placeholder="etiket"
                    style={{ flex: 1 }}
                  />
                  <button onClick={etiketEkle} className="gdm-mini-btn">
                    <Plus size={13} />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={kaydet}
              disabled={!yetkili || kaydetYukleniyor}
              className="gdm-footer-btn gdm-save-sticky"
              style={{
                opacity: yetkili ? 1 : 0.6,
                cursor: yetkili ? 'pointer' : 'default',
              }}
            >
              {kaydetYukleniyor ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
