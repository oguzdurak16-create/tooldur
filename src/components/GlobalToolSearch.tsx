'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Calculator, FolderKanban, Search, Wrench, X } from 'lucide-react';
import type { Locale } from '@/lib/siteLanguage';
import { getLocalizedPath } from '@/lib/siteLanguage';
import { getLocalizedCategories, getLocalizedTools, getToolHref } from '@/lib/toolLocalization';
import { discoveryQuickQueries, normalizeToolQuery, rankTools } from '@/lib/toolDiscovery';
import { recordZeroSearch } from '@/lib/searchInsights';

type Props = { locale: Locale };

type PageResult = {
  href: string;
  title: string;
  description: string;
  icon: typeof Wrench;
  terms: string;
};

export default function GlobalToolSearch({ locale }: Props) {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const tools = useMemo(() => getLocalizedTools(locale), [locale]);
  const categories = useMemo(() => getLocalizedCategories(locale), [locale]);
  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.id, item.name])), [categories]);

  const pages = useMemo<PageResult[]>(() => [
    {
      href: getLocalizedPath(locale, 'tools'),
      title: locale === 'tr' ? 'Tüm teknik araçlar' : 'All engineering tools',
      description: locale === 'tr' ? 'Hesaplama araçlarının tamamını kategoriye göre görüntüle.' : 'Browse every calculator by category.',
      icon: Calculator,
      terms: 'tum araclar hesaplama tools calculators',
    },
    {
      href: getLocalizedPath(locale, 'tooldurcad'),
      title: 'TooldurCAD',
      description: locale === 'tr' ? 'SolidWorks ve masaüstü mühendislik araçları.' : 'SolidWorks and desktop engineering utilities.',
      icon: Wrench,
      terms: 'cad cam solidworks eklenti addin desktop kurulum indir',
    },
    {
      href: getLocalizedPath(locale, 'blog'),
      title: locale === 'tr' ? 'Teknik rehberler' : 'Engineering guides',
      description: locale === 'tr' ? 'İmalat, tolerans, mekanik tasarım ve uygulama notları.' : 'Manufacturing, tolerance and design guides.',
      icon: BookOpen,
      terms: 'blog rehber makale teknik bilgi tolerans imalat',
    },
    {
      href: getLocalizedPath(locale, 'project-management'),
      title: locale === 'tr' ? 'Proje yönetimi' : 'Project management',
      description: locale === 'tr' ? 'Hesap sonuçlarını görev ve proje akışına bağla.' : 'Connect calculation results to projects and tasks.',
      icon: FolderKanban,
      terms: 'proje gorev takip project task planning',
    },
  ], [locale]);

  const normalizedQuery = normalizeToolQuery(query);
  const matchedTools = useMemo(() => rankTools(tools, query).slice(0, normalizedQuery ? 8 : 6), [normalizedQuery, query, tools]);
  const matchedPages = useMemo(() => {
    if (!normalizedQuery) return pages.slice(0, 2);
    return pages.filter((page) => normalizeToolQuery(`${page.title} ${page.description} ${page.terms}`).includes(normalizedQuery));
  }, [normalizedQuery, pages]);
  const resultCount = matchedTools.length + matchedPages.length;

  useEffect(() => {
    const openSearch = () => setOpen(true);
    const keyHandler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === '/' && !typing && !target?.isContentEditable) {
        event.preventDefault();
        setOpen(true);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('tooldur:open-search', openSearch);
    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('tooldur:open-search', openSearch);
      window.removeEventListener('keydown', keyHandler);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    document.body.style.overflow = 'hidden';
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open || normalizedQuery.length < 3 || resultCount > 0) return;
    const handle = window.setTimeout(() => recordZeroSearch(query, 'global-command-search'), 900);
    return () => window.clearTimeout(handle);
  }, [open, normalizedQuery.length, query, resultCount]);

  const selectByIndex = (index: number) => {
    const destinations = [
      ...matchedTools.map((tool) => getToolHref(tool.slug, locale)),
      ...matchedPages.map((page) => page.href),
    ];
    const destination = destinations[index];
    if (destination) window.location.href = destination;
  };

  if (!open) return null;

  return (
    <div className="td-command-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="td-command" role="dialog" aria-modal="true" aria-label={locale === 'tr' ? 'Tooldur arama' : 'Tooldur search'} onMouseDown={(event) => event.stopPropagation()}>
        <div className="td-command-input">
          <Search size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((value) => Math.min(value + 1, Math.max(resultCount - 1, 0)));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((value) => Math.max(value - 1, 0));
              } else if (event.key === 'Enter') {
                event.preventDefault();
                selectByIndex(activeIndex);
              }
            }}
            placeholder={locale === 'tr' ? 'Araç, hesap veya teknik konu ara...' : 'Search tools, calculations or topics...'}
            aria-label={locale === 'tr' ? 'Araç ara' : 'Search tools'}
            autoComplete="off"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} aria-label={locale === 'tr' ? 'Aramayı temizle' : 'Clear search'}><X size={17} /></button>
          ) : (
            <kbd>ESC</kbd>
          )}
        </div>

        {!query && (
          <div className="td-command-quick" aria-label={locale === 'tr' ? 'Hızlı aramalar' : 'Quick searches'}>
            {discoveryQuickQueries.map((item) => <button key={item} type="button" onClick={() => setQuery(item)}>{item}</button>)}
          </div>
        )}

        <div className="td-command-results">
          {matchedTools.length > 0 && (
            <div className="td-command-group">
              <div className="td-command-label">{locale === 'tr' ? 'HESAPLAMA ARAÇLARI' : 'CALCULATION TOOLS'}</div>
              {matchedTools.map((tool, index) => (
                <Link
                  key={tool.slug}
                  href={getToolHref(tool.slug, locale)}
                  className={`td-command-result${activeIndex === index ? ' active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span className="td-command-result-icon"><Calculator size={17} /></span>
                  <span><strong>{tool.name}</strong><small>{categoryMap.get(tool.category)} · {tool.description}</small></span>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          )}

          {matchedPages.length > 0 && (
            <div className="td-command-group">
              <div className="td-command-label">{locale === 'tr' ? 'SAYFALAR' : 'PAGES'}</div>
              {matchedPages.map((page, pageIndex) => {
                const index = matchedTools.length + pageIndex;
                const Icon = page.icon;
                return (
                  <Link key={page.href} href={page.href} className={`td-command-result${activeIndex === index ? ' active' : ''}`} onMouseEnter={() => setActiveIndex(index)}>
                    <span className="td-command-result-icon"><Icon size={17} /></span>
                    <span><strong>{page.title}</strong><small>{page.description}</small></span>
                    <ArrowRight size={16} />
                  </Link>
                );
              })}
            </div>
          )}

          {resultCount === 0 && (
            <div className="td-command-empty">
              <strong>{locale === 'tr' ? 'Sonuç bulunamadı.' : 'No result found.'}</strong>
              <span>{locale === 'tr' ? 'Daha kısa bir teknik terim veya parça adı deneyin.' : 'Try a shorter technical term or component name.'}</span>
            </div>
          )}
        </div>

        <div className="td-command-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> {locale === 'tr' ? 'seç' : 'select'}</span>
          <span><kbd>ENTER</kbd> {locale === 'tr' ? 'aç' : 'open'}</span>
          <span><kbd>ESC</kbd> {locale === 'tr' ? 'kapat' : 'close'}</span>
        </div>
      </section>

      <style>{`
        .td-command-backdrop{position:fixed;inset:0;z-index:2000;background:rgba(1,5,12,.76);backdrop-filter:blur(10px);padding:clamp(18px,7vh,72px) 16px;display:flex;align-items:flex-start;justify-content:center}
        .td-command{width:min(720px,100%);max-height:min(760px,calc(100vh - 36px));overflow:hidden;display:flex;flex-direction:column;border:1px solid rgba(148,163,184,.22);border-radius:22px;background:#0b1728;box-shadow:0 35px 120px rgba(0,0,0,.58)}
        .td-command-input{display:flex;align-items:center;gap:12px;min-height:68px;padding:0 18px;border-bottom:1px solid rgba(148,163,184,.14);color:#ffb11b}
        .td-command-input input{flex:1;min-width:0;border:0!important;box-shadow:none!important;background:transparent!important;color:#f8fafc!important;font-size:17px!important}
        .td-command-input button{width:34px;height:34px;border:0;border-radius:10px;background:rgba(255,255,255,.06);color:#cbd5e1;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
        .td-command kbd{border:1px solid rgba(148,163,184,.18);background:rgba(255,255,255,.055);border-radius:6px;padding:3px 6px;color:#94a3b8;font:700 10px/1.2 var(--font-mono)}
        .td-command-quick{display:flex;gap:7px;overflow:auto;padding:12px 16px 4px}
        .td-command-quick button{flex:0 0 auto;border:1px solid rgba(255,177,27,.18);border-radius:999px;background:rgba(255,177,27,.07);color:#ffd47a;padding:7px 10px;font-size:11.5px;font-weight:800;cursor:pointer}
        .td-command-results{overflow:auto;padding:10px}
        .td-command-group+.td-command-group{margin-top:8px;padding-top:8px;border-top:1px solid rgba(148,163,184,.1)}
        .td-command-label{padding:7px 9px;color:#70829a;font:800 10px/1 var(--font-mono);letter-spacing:.13em}
        .td-command-result{display:grid;grid-template-columns:38px minmax(0,1fr) 20px;align-items:center;gap:11px;min-height:58px;padding:8px 10px;border-radius:13px;color:#e7eef8;text-decoration:none}
        .td-command-result.active,.td-command-result:hover{background:rgba(255,177,27,.10)}
        .td-command-result-icon{width:36px;height:36px;border:1px solid rgba(255,177,27,.18);border-radius:11px;background:rgba(255,177,27,.08);color:#ffb11b;display:inline-flex;align-items:center;justify-content:center}
        .td-command-result strong{display:block;font-size:13.5px;line-height:1.35}
        .td-command-result small{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#91a3ba;font-size:11.5px}
        .td-command-result>svg{color:#64748b}
        .td-command-empty{padding:40px 18px;text-align:center;color:#e2e8f0}.td-command-empty span{display:block;margin-top:7px;color:#8fa1b8;font-size:13px}
        .td-command-footer{display:flex;gap:18px;justify-content:flex-end;align-items:center;padding:10px 16px;border-top:1px solid rgba(148,163,184,.12);color:#7f91a8;font-size:10.5px}.td-command-footer span{display:inline-flex;align-items:center;gap:5px}
        @media(max-width:620px){.td-command-backdrop{padding:8px}.td-command{max-height:calc(100vh - 16px);border-radius:16px}.td-command-input{min-height:60px;padding:0 13px}.td-command-input input{font-size:15px!important}.td-command-result small{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.td-command-footer{justify-content:flex-start;overflow:auto}.td-command-footer span:last-child{display:none}}
      `}</style>
    </div>
  );
}
