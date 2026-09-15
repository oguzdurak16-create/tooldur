'use client';

import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/usePmAuth';

type Hedef =
  | { konuId: string; yorumId?: never }
  | { yorumId: string; konuId?: never };

type Neden = 'spam' | 'yanlis_bilgi' | 'hakaret' | 'reklam' | 'diger';

const NEDENLER: Array<{ value: Neden; label: string }> = [
  { value: 'spam', label: 'Spam / tekrar içerik' },
  { value: 'yanlis_bilgi', label: 'Yanlış veya tehlikeli bilgi' },
  { value: 'hakaret', label: 'Hakaret / uygunsuz dil' },
  { value: 'reklam', label: 'Reklam / bağlantı spamı' },
  { value: 'diger', label: 'Diğer' },
];

export default function CozumRaporButton({ hedef, compact = false }: { hedef: Hedef; compact?: boolean }) {
  const { user } = useAuth();
  const [acik, setAcik] = useState(false);
  const [neden, setNeden] = useState<Neden>('yanlis_bilgi');
  const [aciklama, setAciklama] = useState('');
  const [gonderiyor, setGonderiyor] = useState(false);
  const [mesaj, setMesaj] = useState('');

  const raporla = async () => {
    if (!user) {
      window.location.href = '/giris';
      return;
    }

    setGonderiyor(true);
    setMesaj('');
    const { error } = await supabase.from('cozum_agi_raporlar').insert({
      konu_id: 'konuId' in hedef ? hedef.konuId : null,
      yorum_id: 'yorumId' in hedef ? hedef.yorumId : null,
      bildiren_uid: user.uid,
      neden,
      aciklama: aciklama.trim().slice(0, 1000),
    });
    setGonderiyor(false);

    if (error) {
      if (error.code === '23505') setMesaj('Bu içeriği daha önce bildirdiniz.');
      else if (error.code === '42P01') setMesaj('Raporlama altyapısı henüz etkin değil.');
      else setMesaj(error.message || 'Rapor gönderilemedi.');
      return;
    }

    setMesaj('Bildiriminiz alındı.');
    setAciklama('');
    setTimeout(() => setAcik(false), 900);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => user ? setAcik(true) : (window.location.href = '/giris')}
        title="İçeriği bildir"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: compact ? '5px 8px' : '7px 10px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--ink-4)', cursor: 'pointer', fontSize: compact ? 10 : 11,
        }}
      >
        <Flag size={compact ? 11 : 12} /> Bildir
      </button>

      {acik && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,.72)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: 'min(460px,100%)', border: '1px solid var(--border-mid)', borderRadius: 14, background: 'var(--bg-card)', padding: 18, boxShadow: '0 24px 70px rgba(0,0,0,.45)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17 }}>İçeriği bildir</h3>
                <p style={{ margin: '5px 0 0', color: 'var(--ink-4)', fontSize: 11 }}>Spam, hatalı veya uygunsuz içerikler moderasyona gönderilir.</p>
              </div>
              <button type="button" onClick={() => setAcik(false)} aria-label="Kapat" style={{ border: 0, background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <label style={{ display: 'block', marginTop: 16, marginBottom: 6, color: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }}>Neden</label>
            <select value={neden} onChange={(e) => setNeden(e.target.value as Neden)} style={{ width: '100%', padding: 10, borderRadius: 9, border: '1px solid var(--border-mid)', background: 'var(--bg-input)', color: 'var(--ink)' }}>
              {NEDENLER.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>

            <label style={{ display: 'block', marginTop: 13, marginBottom: 6, color: 'var(--ink-3)', fontSize: 11, fontWeight: 700 }}>Açıklama <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(isteğe bağlı)</span></label>
            <textarea value={aciklama} onChange={(e) => setAciklama(e.target.value)} maxLength={1000} rows={4} placeholder="Kısaca neden bildirdiğinizi yazabilirsiniz..." style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 9, border: '1px solid var(--border-mid)', background: 'var(--bg-input)', color: 'var(--ink)', resize: 'vertical' }} />

            {mesaj && <p style={{ margin: '10px 0 0', color: mesaj.includes('alındı') ? '#22c55e' : '#ef4444', fontSize: 11 }}>{mesaj}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button type="button" onClick={() => setAcik(false)} style={{ padding: '8px 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer' }}>Vazgeç</button>
              <button type="button" onClick={raporla} disabled={gonderiyor} style={{ padding: '8px 12px', borderRadius: 8, border: 0, background: 'var(--amber)', color: '#0a0a0f', fontWeight: 800, cursor: gonderiyor ? 'wait' : 'pointer' }}>{gonderiyor ? 'Gönderiliyor...' : 'Bildir'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
