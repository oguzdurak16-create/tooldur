'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Clock3, Heart, Sparkles } from 'lucide-react';
import { tools } from '@/data/tools';
import { getFavoriteToolSlugs, getRecentToolSlugs } from '@/lib/toolActivity';

const fallbackSlugs = [
  'kilavuz-matkap-hesaplama',
  'sac-bukum-kesim-hesaplayici',
  'iso-gecme-tolerans-hesaplama',
  'levha-agirlik-hesaplama',
];

export default function PersonalToolShelf() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setFavoriteSlugs(getFavoriteToolSlugs());
      setRecentSlugs(getRecentToolSlugs());
    };

    // Sunucudaki başlangıç rafı ile ilk istemci render'ı aynı kalır.
    // Kişisel veriler hydration tamamlandıktan sonra uygulanır.
    const timer = window.setTimeout(sync, 80);
    window.addEventListener('tooldur:tool-activity', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('tooldur:tool-activity', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const data = useMemo(() => {
    const selected = favoriteSlugs.length > 0
      ? favoriteSlugs
      : recentSlugs.length > 0
        ? recentSlugs
        : fallbackSlugs;
    return selected.map((slug) => tools.find((tool) => tool.slug === slug)).filter(Boolean).slice(0, 4);
  }, [favoriteSlugs, recentSlugs]);

  const mode = favoriteSlugs.length > 0 ? 'favorites' : recentSlugs.length > 0 ? 'recent' : 'starter';
  const Icon = mode === 'favorites' ? Heart : mode === 'recent' ? Clock3 : Sparkles;
  const title = mode === 'favorites' ? 'Favori araçların' : mode === 'recent' ? 'Son kullandığın araçlar' : 'Hızlı çalışma alanı';
  const description = mode === 'favorites'
    ? 'Sık kullandığın hesaplamalara tek adımda dön.'
    : mode === 'recent'
      ? 'Yarım bıraktığın teknik hesaba kaldığın yerden devam et.'
      : 'İmalatta en sık kullanılan hesaplamalarla başla.';

  return (
    <section className="td-personal-shelf" aria-label={title}>
      <div className="td-personal-shelf-head">
        <div><span><Icon size={14} /> KİŞİSEL KISAYOLLAR</span><h2>{title}</h2><p>{description}</p></div>
        <Link href="/araclar">Tüm araçlar <ArrowRight size={15} /></Link>
      </div>
      <div className="td-personal-shelf-grid">
        {data.map((tool) => tool && (
          <Link href={`/arac/${tool.slug}`} key={tool.slug}>
            <span>{tool.shortName}</span>
            <strong>{tool.name}</strong>
            <small>{tool.description}</small>
            <b>Aracı aç <ArrowRight size={14} /></b>
          </Link>
        ))}
      </div>
      <style>{`
        .td-personal-shelf{width:min(1180px,calc(100% - 32px));margin:26px auto 0;padding:22px;border:1px solid var(--border);border-radius:22px;background:linear-gradient(145deg,rgba(255,177,27,.06),rgba(56,189,248,.035)),var(--bg-card);box-shadow:var(--shadow-soft)}
        .td-personal-shelf-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:16px}.td-personal-shelf-head>div>span{display:inline-flex;align-items:center;gap:7px;color:var(--amber);font:800 10px/1 var(--font-mono);letter-spacing:.14em}.td-personal-shelf h2{margin:8px 0 4px;color:var(--ink);font-size:clamp(20px,2.5vw,28px);letter-spacing:-.025em}.td-personal-shelf p{margin:0;color:var(--ink-4);font-size:13px}.td-personal-shelf-head>a{display:inline-flex;align-items:center;gap:6px;color:var(--amber);text-decoration:none;font-size:12px;font-weight:850;white-space:nowrap}
        .td-personal-shelf-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.td-personal-shelf-grid>a{min-height:150px;display:flex;flex-direction:column;padding:15px;border:1px solid var(--border-dim);border-radius:16px;background:rgba(255,255,255,.025);text-decoration:none;transition:.18s}.td-personal-shelf-grid>a:hover{transform:translateY(-2px);border-color:rgba(255,177,27,.3);background:rgba(255,177,27,.045)}.td-personal-shelf-grid span{color:var(--amber);font:800 10px/1.2 var(--font-mono);text-transform:uppercase}.td-personal-shelf-grid strong{margin-top:9px;color:var(--ink);font-size:14px;line-height:1.35}.td-personal-shelf-grid small{margin-top:6px;color:var(--ink-4);font-size:11.5px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.td-personal-shelf-grid b{margin-top:auto;padding-top:12px;display:flex;align-items:center;gap:6px;color:var(--ink-2);font-size:11.5px}
        @media(max-width:900px){.td-personal-shelf-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.td-personal-shelf{width:calc(100% - 22px);padding:16px}.td-personal-shelf-head{align-items:flex-start}.td-personal-shelf-head>a{display:none}.td-personal-shelf-grid{grid-template-columns:1fr 1fr}.td-personal-shelf-grid>a{min-height:138px;padding:13px}.td-personal-shelf-grid small{display:none}}
      `}</style>
    </section>
  );
}
