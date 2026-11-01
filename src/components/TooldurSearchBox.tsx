'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, X } from 'lucide-react';
import { tools, categories } from '@/data/tools';
import { recordZeroSearch } from '@/lib/searchInsights';
import { discoveryQuickQueries, normalizeToolQuery, rankTools } from '@/lib/toolDiscovery';
import styles from './TooldurSearchBox.module.css';

export default function TooldurSearchBox({ compact = false }: { compact?: boolean }) {
  const classes = compact ? {
    form: styles.form, input: styles.input, shortcut: styles.shortcut, results: styles.results,
    result: styles.result, empty: styles.empty,
  } : {
    form: 'td-searchbox', input: 'td-searchbox-input-wrap', shortcut: 'td-searchbox-shortcut', results: 'td-searchbox-results',
    result: 'td-searchbox-result', empty: 'td-searchbox-empty',
  };
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [popup, setPopup] = useState({ above: false, maxHeight: 420 });
  const resultsId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        if (query) {
          setQuery('');
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  const normalizedQuery = normalizeToolQuery(query);

  useEffect(() => {
    if (!compact || !normalizedQuery) return;
    const viewport = window.visualViewport;
    let frame = 0;
    const measure = () => {
      const rect = formRef.current?.getBoundingClientRect();
      if (!rect) return;
      const top = viewport?.offsetTop || 0;
      const bottom = top + (viewport?.height || window.innerHeight);
      const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 0;
      const below = Math.max(48, bottom - rect.bottom - 12);
      const above = Math.max(0, rect.top - Math.max(top, headerBottom) - 12);
      const opensAbove = below < 120 && above > below;
      const maxHeight = Math.floor(Math.min(420, opensAbove ? above : below));
      setPopup((previous) => previous.above === opensAbove && previous.maxHeight === maxHeight ? previous : { above: opensAbove, maxHeight });
    };
    const schedule = () => { window.cancelAnimationFrame(frame); frame = window.requestAnimationFrame(measure); };
    measure();
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    return () => {
      window.cancelAnimationFrame(frame);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
    };
  }, [compact, normalizedQuery]);

  const matches = useMemo(() => {
    return rankTools(tools, query)
      .slice(0, normalizedQuery ? 7 : 6)
      .map((tool) => ({ tool, category: categories.find((category) => category.id === tool.category) }));
  }, [normalizedQuery, query]);

  useEffect(() => {
    if (normalizedQuery.length < 3 || matches.length > 0) return;
    const handle = window.setTimeout(() => {
      recordZeroSearch(query, 'home-search');
    }, 900);
    return () => window.clearTimeout(handle);
  }, [matches.length, normalizedQuery, query]);

  return (
    <form ref={formRef} className={classes.form} role="search" action="/araclar" method="get">
      <div className={classes.input}>
        <Search size={20} aria-hidden="true" />
        <input
          name="q"
          type="search"
          ref={inputRef}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setActiveIndex(-1); }}
          onKeyDown={(event) => {
            if (!normalizedQuery || !matches.length) return;
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              const next = event.key === 'ArrowDown'
                ? Math.min(activeIndex + 1, matches.length - 1)
                : Math.max(activeIndex - 1, 0);
              setActiveIndex(next);
              document.getElementById(`${resultsId}-${next}`)?.scrollIntoView({ block: 'nearest' });
            } else if (event.key === 'Enter') {
              event.preventDefault();
              router.push(`/arac/${matches[Math.max(activeIndex, 0)].tool.slug}`);
            }
          }}
          placeholder={compact ? 'Konu veya araç ara…' : 'Ne hesaplamak istiyorsun? Örn: metrik diş, sac ağırlık, kablo kesiti...'}
          aria-label="Araç ara"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={normalizedQuery ? resultsId : undefined}
          aria-activedescendant={normalizedQuery && activeIndex >= 0 && matches[activeIndex] ? `${resultsId}-${activeIndex}` : undefined}
          aria-expanded={normalizedQuery.length > 0 && matches.length > 0}
          autoComplete="off"
        />
        <kbd className={classes.shortcut} aria-hidden="true">/</kbd>
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Aramayı temizle">
            <X size={16} />
          </button>
        )}
        {compact && <button className={styles.submit} type="submit">Ara</button>}
      </div>

      {normalizedQuery.length > 0 && (
        <div id={resultsId} data-placement={popup.above ? 'above' : 'below'} style={compact ? { maxHeight: popup.maxHeight } : undefined} className={classes.results} role="listbox" aria-label="Araç arama sonuçları" aria-live="polite">
          {matches.length > 0 ? (
            matches.map(({ tool, category }, index) => (
              <Link
                key={tool.id}
                href={`/arac/${tool.slug}`}
                id={`${resultsId}-${index}`}
                className={`${classes.result}${activeIndex === index ? ' active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                role="option"
                aria-selected={activeIndex === index}
                aria-label={`${tool.name} aracını aç`}
              >
                <span>
                  <strong>{tool.name}</strong>
                  <small>{category?.name || 'Araç'} • {tool.description}</small>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ))
          ) : (
            <div className={classes.empty}>Bu arama için doğrudan eşleşme bulunamadı. <Link href={`/araclar?q=${encodeURIComponent(query)}`}>Araç dizininde ara</Link> veya farklı kelime dene.</div>
          )}
        </div>
      )}

      {!compact && <div className="td-searchbox-quick" aria-label="Hızlı aramalar">
        {discoveryQuickQueries.map((item) => (
          <button key={item} type="button" onClick={() => { setQuery(item); setActiveIndex(-1); inputRef.current?.focus(); }}>
            {item}
          </button>
        ))}
      </div>}
    </form>
  );
}
