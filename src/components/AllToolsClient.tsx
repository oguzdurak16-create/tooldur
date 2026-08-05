'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Locale } from '@/lib/siteLanguage';
import { getLocalizedCategories, getLocalizedTools, getToolsPageCopy } from '@/lib/toolLocalization';
import { normalizeSearchTerm, recordZeroSearch } from '@/lib/searchInsights';
import { isIndexableCategory, isIndexableTool } from '@/lib/seoFocus';
import { rankTools } from '@/lib/toolDiscovery';
import ToolCard from '@/components/ToolCard';
import styles from './AllToolsClient.module.css';

type Props = { locale?: Locale };

const TEXT: Record<Locale, { description: string; example: string }> = {
  tr: { description: 'Aracı yaz veya tek bir kategori seç. Sonuca doğrudan geç.', example: 'Örn: metrik diş, pompa, sac ağırlık, kablo kesiti' },
  en: { description: 'Search for a tool or select one category. Go directly to the calculation.', example: 'E.g. metric thread, pump, sheet weight, cable size' },
  es: { description: 'Busca una herramienta o elige una categoría.', example: 'Ej.: rosca métrica, bomba, peso de chapa' },
  zh: { description: '搜索工具或选择一个分类。', example: '例如：公制螺纹、泵、板材重量' },
  hi: { description: 'टूल खोजें या एक श्रेणी चुनें।', example: 'जैसे: मीट्रिक थ्रेड, पंप, शीट वजन' },
  ar: { description: 'ابحث عن أداة أو اختر فئة واحدة.', example: 'مثال: سن متري، مضخة، وزن صاج' },
};

export default function AllToolsClient({ locale = 'tr' }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const allTools = useMemo(() => getLocalizedTools(locale), [locale]);
  const allCategories = useMemo(() => getLocalizedCategories(locale), [locale]);
  const indexableTools = useMemo(() => allTools.filter(isIndexableTool), [allTools]);
  const indexableCategories = useMemo(() => allCategories.filter(isIndexableCategory), [allCategories]);
  const copy = getToolsPageCopy(locale);
  const labels = TEXT[locale];
  const sourceTools = search.trim() ? allTools : indexableTools;
  const visibleCategories = search.trim() ? allCategories : indexableCategories;

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('q');
    if (query) setSearch(query);
  }, []);

  const filteredTools = useMemo(() => {
    return rankTools(sourceTools, search).filter((tool) => activeCategory === 'all' || tool.category === activeCategory);
  }, [activeCategory, search, sourceTools]);

  const normalizedSearch = normalizeSearchTerm(search);
  useEffect(() => {
    if (normalizedSearch.length < 3 || filteredTools.length) return;
    const handle = window.setTimeout(() => recordZeroSearch(search, 'tools-page-search'), 900);
    return () => window.clearTimeout(handle);
  }, [filteredTools.length, normalizedSearch, search]);

  const filtersActive = Boolean(search || activeCategory !== 'all');
  const reset = () => { setSearch(''); setActiveCategory('all'); };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.hero}>
          <div><div className={styles.eyebrow}>{copy.badge}</div><h1>{copy.title}</h1><p>{labels.description}</p></div>
          <div className={styles.count}><strong>{filteredTools.length}</strong><span>{filtersActive ? copy.result : copy.tool}</span></div>
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.controlTop}>
            <label className={styles.search}>
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={labels.example} aria-label={copy.searchLabel} />
              {search && <button type="button" className={styles.clear} onClick={() => setSearch('')} aria-label={copy.resetFilters}><X size={16} /></button>}
            </label>
          </div>
          <div className={styles.chips} aria-label={copy.categoryLabel}>
            <button type="button" className={`${styles.chip} ${activeCategory === 'all' ? styles.active : ''}`} onClick={() => setActiveCategory('all')}>{copy.allCategories}</button>
            {visibleCategories.map((category) => <button type="button" key={category.id} className={`${styles.chip} ${activeCategory === category.id ? styles.active : ''}`} onClick={() => setActiveCategory(category.id)}>{category.name}</button>)}
          </div>
        </div>

        {filtersActive && <div className={styles.resetRow}><button type="button" className={styles.reset} onClick={reset}>{copy.resetFilters}</button></div>}

        {filteredTools.length ? (
          <div className={styles.grid}>{filteredTools.map((tool) => <ToolCard key={tool.slug} tool={tool} locale={locale} />)}</div>
        ) : (
          <div className={styles.empty}><strong>{copy.noResultsTitle}</strong><p>{copy.noResultsText}</p></div>
        )}
      </section>
    </main>
  );
}
