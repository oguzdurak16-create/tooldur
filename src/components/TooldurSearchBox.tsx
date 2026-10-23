'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, X } from 'lucide-react';
import { tools, categories } from '@/data/tools';
import { recordZeroSearch } from '@/lib/searchInsights';
import { discoveryQuickQueries, normalizeToolQuery, rankTools } from '@/lib/toolDiscovery';

export default function TooldurSearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
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
    <div className="td-searchbox" role="search">
      <div className="td-searchbox-input-wrap">
        <Search size={20} aria-hidden="true" />
        <input
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
          placeholder="Ne hesaplamak istiyorsun? Örn: metrik diş, sac ağırlık, kablo kesiti..."
          aria-label="Araç ara"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={normalizedQuery ? resultsId : undefined}
          aria-activedescendant={normalizedQuery && activeIndex >= 0 && matches[activeIndex] ? `${resultsId}-${activeIndex}` : undefined}
          aria-expanded={normalizedQuery.length > 0 && matches.length > 0}
          autoComplete="off"
        />
        <kbd className="td-searchbox-shortcut" aria-hidden="true">/</kbd>
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Aramayı temizle">
            <X size={16} />
          </button>
        )}
      </div>

      {normalizedQuery.length > 0 && (
        <div id={resultsId} className="td-searchbox-results" role="listbox" aria-label="Araç arama sonuçları" aria-live="polite">
          {matches.length > 0 ? (
            matches.map(({ tool, category }, index) => (
              <Link
                key={tool.id}
                href={`/arac/${tool.slug}`}
                id={`${resultsId}-${index}`}
                className={`td-searchbox-result${activeIndex === index ? ' active' : ''}`}
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
            <div className="td-searchbox-empty">Bu arama için araç bulunamadı. Farklı kelime dene.</div>
          )}
        </div>
      )}

      <div className="td-searchbox-quick" aria-label="Hızlı aramalar">
        {discoveryQuickQueries.map((item) => (
          <button key={item} type="button" onClick={() => { setQuery(item); setActiveIndex(-1); inputRef.current?.focus(); }}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
