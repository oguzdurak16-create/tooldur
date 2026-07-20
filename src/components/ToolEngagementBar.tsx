'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Heart, Share2 } from 'lucide-react';
import { isFavoriteTool, recordToolVisit, toggleFavoriteTool } from '@/lib/toolActivity';
import type { Locale } from '@/lib/siteLanguage';

type Props = { slug: string; name: string; locale?: Locale };

export default function ToolEngagementBar({ slug, name, locale = 'tr' }: Props) {
  const [favorite, setFavorite] = useState(false);
  const [status, setStatus] = useState('');
  const tr = locale === 'tr';

  useEffect(() => {
    recordToolVisit(slug);
    setFavorite(isFavoriteTool(slug));
  }, [slug]);

  const flash = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(''), 1800);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash(tr ? 'Bağlantı kopyalandı' : 'Link copied');
    } catch {
      window.prompt(tr ? 'Bağlantıyı kopyalayın:' : 'Copy the link:', window.location.href);
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url: window.location.href });
      } catch {
        return;
      }
    } else {
      await copyLink();
    }
  };

  return (
    <div className="td-tool-engagement" aria-label={tr ? 'Araç işlemleri' : 'Tool actions'}>
      <a href="#hesaplama" className="td-tool-engagement-primary">{tr ? 'Hesaplamaya geç' : 'Open calculator'}</a>
      <button
        type="button"
        className={favorite ? 'active' : ''}
        onClick={() => {
          const next = toggleFavoriteTool(slug);
          setFavorite(next);
          flash(next ? (tr ? 'Favorilere eklendi' : 'Added to favorites') : (tr ? 'Favorilerden çıkarıldı' : 'Removed from favorites'));
        }}
      >
        <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
        {favorite ? (tr ? 'Favorilerde' : 'Favorited') : (tr ? 'Favorilere ekle' : 'Add favorite')}
      </button>
      <button type="button" onClick={copyLink}><Copy size={15} /> {tr ? 'Bağlantıyı kopyala' : 'Copy link'}</button>
      <button type="button" onClick={share} aria-label={tr ? 'Aracı paylaş' : 'Share tool'}><Share2 size={15} /><span>{tr ? 'Paylaş' : 'Share'}</span></button>
      {status && <span className="td-tool-engagement-status"><Check size={13} /> {status}</span>}
      <style>{`
        .td-tool-engagement{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:17px;position:relative}
        .td-tool-engagement button,.td-tool-engagement a{min-height:38px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 12px;border:1px solid var(--border-mid);border-radius:11px;background:var(--bg-card);color:var(--ink-2);font-size:12px;font-weight:800;text-decoration:none;cursor:pointer}
        .td-tool-engagement button:hover,.td-tool-engagement button.active{border-color:rgba(255,177,27,.38);color:var(--amber);background:rgba(255,177,27,.07)}
        .td-tool-engagement .td-tool-engagement-primary{border-color:transparent;background:var(--amber);color:#07111f}
        .td-tool-engagement-status{display:inline-flex;align-items:center;gap:5px;color:var(--green);font-size:11.5px;font-weight:800}
        @media(max-width:560px){.td-tool-engagement{display:grid;grid-template-columns:1fr 1fr}.td-tool-engagement a,.td-tool-engagement button{width:100%;padding:0 8px}.td-tool-engagement-status{grid-column:1/-1}.td-tool-engagement button span{display:none}}
      `}</style>
    </div>
  );
}
