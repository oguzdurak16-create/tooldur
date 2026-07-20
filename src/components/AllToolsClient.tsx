'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Heart, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Locale } from '@/lib/siteLanguage';
import { getCategoryHref, getLocalizedCategories, getLocalizedTools, getToolsPageCopy } from '@/lib/toolLocalization';
import { normalizeSearchTerm, recordZeroSearch } from '@/lib/searchInsights';
import { isIndexableCategory, isIndexableTool } from '@/lib/seoFocus';
import { rankTools } from '@/lib/toolDiscovery';
import { getFavoriteToolSlugs, getRecentToolSlugs } from '@/lib/toolActivity';
import ToolCard from '@/components/ToolCard';
import styles from './AllToolsClient.module.css';

type Props = { locale?: Locale };

const FILTER_LABELS: Record<Locale, {
  description: string;
  example: string;
  favorites: string;
  recommended: string;
  recent: string;
  categories: string;
  categoriesText: string;
}> = {
  tr: { description: 'Teknik terimi yaz, kategoriyle daralt ve aynı tasarım düzeninde çalışan hesaplama aracını aç.', example: 'Örn: metrik diş, pompa, sac ağırlık, kablo kesiti', favorites: 'Favoriler', recommended: 'Önerilen', recent: 'Son kullanılan', categories: 'Kategoriler', categoriesText: 'Teknik alanına göre tüm araçları görüntüle.' },
  en: { description: 'Enter a technical term, narrow it by category and open a calculator in the same workspace.', example: 'E.g. metric thread, pump, sheet weight, cable size', favorites: 'Favorites', recommended: 'Recommended', recent: 'Recently used', categories: 'Categories', categoriesText: 'View all tools by engineering field.' },
  es: { description: 'Escribe un término técnico, filtra por categoría y abre la calculadora en el mismo espacio de trabajo.', example: 'Ej.: rosca métrica, bomba, peso de chapa, sección de cable', favorites: 'Favoritos', recommended: 'Recomendados', recent: 'Usados recientemente', categories: 'Categorías', categoriesText: 'Consulta todas las herramientas por área técnica.' },
  zh: { description: '输入技术术语，按分类筛选并在统一工作区中打开计算工具。', example: '例如：公制螺纹、泵、板材重量、电缆截面', favorites: '收藏', recommended: '推荐', recent: '最近使用', categories: '分类', categoriesText: '按工程领域查看全部工具。' },
  hi: { description: 'तकनीकी शब्द लिखें, श्रेणी से फ़िल्टर करें और उसी कार्यक्षेत्र में कैलकुलेटर खोलें।', example: 'जैसे: मीट्रिक थ्रेड, पंप, शीट वजन, केबल साइज़', favorites: 'पसंदीदा', recommended: 'सुझाए गए', recent: 'हाल में उपयोग', categories: 'श्रेणियाँ', categoriesText: 'इंजीनियरिंग क्षेत्र के अनुसार सभी टूल देखें।' },
  ar: { description: 'اكتب المصطلح التقني وحدد الفئة ثم افتح أداة الحساب ضمن مساحة العمل نفسها.', example: 'مثال: سن متري، مضخة، وزن صاج، مقطع كابل', favorites: 'المفضلة', recommended: 'موصى بها', recent: 'المستخدمة مؤخراً', categories: 'الفئات', categoriesText: 'اعرض جميع الأدوات حسب المجال الهندسي.' },
};

export default function AllToolsClient({ locale = 'tr' }: Props) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortMode, setSortMode] = useState<'recommended' | 'az' | 'recent'>('recommended');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  const allTools = useMemo(() => getLocalizedTools(locale), [locale]);
  const allCategories = useMemo(() => getLocalizedCategories(locale), [locale]);
  const indexableTools = useMemo(() => allTools.filter(isIndexableTool), [allTools]);
  const indexableCategories = useMemo(() => allCategories.filter(isIndexableCategory), [allCategories]);
  const copy = getToolsPageCopy(locale);
  const labels = FILTER_LABELS[locale];
  const sourceTools = search.trim() ? allTools : indexableTools;
  const visibleCategories = search.trim() ? allCategories : indexableCategories;

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('q');
    if (query) setSearch(query);
  }, []);

  useEffect(() => {
    const sync = () => {
      setFavoriteSlugs(getFavoriteToolSlugs());
      setRecentSlugs(getRecentToolSlugs());
    };
    sync();
    window.addEventListener('tooldur:tool-activity', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('tooldur:tool-activity', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const filteredTools = useMemo(() => {
    const ranked = rankTools(sourceTools, search).filter((tool) => {
      const categoryMatch = activeCategory === 'all' || tool.category === activeCategory;
      const favoriteMatch = !favoriteOnly || favoriteSlugs.includes(tool.slug);
      return categoryMatch && favoriteMatch;
    });
    if (sortMode === 'az') return [...ranked].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    if (sortMode === 'recent') {
      return [...ranked].sort((a, b) => {
        const ai = recentSlugs.indexOf(a.slug);
        const bi = recentSlugs.indexOf(b.slug);
        if (ai === -1 && bi === -1) return a.name.localeCompare(b.name, 'tr');
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    }
    return ranked;
  }, [activeCategory, favoriteOnly, favoriteSlugs, recentSlugs, search, sortMode, sourceTools]);

  const normalizedSearch = normalizeSearchTerm(search);
  useEffect(() => {
    if (normalizedSearch.length < 3 || filteredTools.length) return;
    const handle = window.setTimeout(() => recordZeroSearch(search, 'tools-page-search'), 900);
    return () => window.clearTimeout(handle);
  }, [filteredTools.length, normalizedSearch, search]);

  const filtersActive = Boolean(search || activeCategory !== 'all' || favoriteOnly || sortMode !== 'recommended');
  const reset = () => { setSearch(''); setActiveCategory('all'); setFavoriteOnly(false); setSortMode('recommended'); };

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.hero}>
          <div>
            <div className={styles.eyebrow}>{copy.badge}</div>
            <h1>{copy.title}</h1>
            <p>{labels.description}</p>
          </div>
          <div className={styles.count}><strong>{filteredTools.length}</strong><span>{filtersActive ? copy.result : copy.tool}</span></div>
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.controlTop}>
            <label className={styles.search}>
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={labels.example} aria-label={copy.searchLabel} />
              {search && <button type="button" className={styles.clear} onClick={() => setSearch('')} aria-label={copy.resetFilters}><X size={16} /></button>}
            </label>
            <div className={styles.actions}>
              <button type="button" className={`${styles.filter} ${favoriteOnly ? styles.active : ''}`} onClick={() => setFavoriteOnly((value) => !value)} disabled={!favoriteSlugs.length && !favoriteOnly}>
                <Heart size={15} fill={favoriteOnly ? 'currentColor' : 'none'} /> {labels.favorites} {favoriteSlugs.length ? `(${favoriteSlugs.length})` : ''}
              </button>
              <label className={styles.sortWrap}>
                <SlidersHorizontal size={14} />
                <select className={styles.sort} value={sortMode} onChange={(event) => setSortMode(event.target.value as 'recommended' | 'az' | 'recent')}>
                  <option value="recommended">{labels.recommended}</option>
                  <option value="recent">{labels.recent}</option>
                  <option value="az">A-Z</option>
                </select>
              </label>
            </div>
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

        <div className={styles.categorySection}>
          <h2>{labels.categories}</h2><p>{labels.categoriesText}</p>
          <div className={styles.categoryGrid}>
            {indexableCategories.map((category) => {
              const count = indexableTools.filter((tool) => tool.category === category.id).length;
              return <Link key={category.id} href={getCategoryHref(category.slug, locale)} className={styles.category}><strong>{category.name}</strong><span>{count} {copy.toolCountSuffix}</span></Link>;
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
