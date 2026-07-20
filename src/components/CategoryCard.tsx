import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { Category, getToolsByCategory } from '@/data/tools';
import { getIcon, Folder } from '@/lib/icons';
import { getCategoryHref, getToolsPageCopy } from '@/lib/toolLocalization';
import type { Locale } from '@/lib/siteLanguage';
import { getCategoryVisual } from '@/lib/visualAssets';

interface CategoryCardProps {
  category: Category;
  locale?: Locale;
}

const colorMap: Record<string, { accent: string; bg: string; soft: string }> = {
  yellow: { accent: '#ffb11b', bg: 'rgba(255,177,27,0.12)', soft: 'rgba(255,177,27,0.08)' },
  orange: { accent: '#fbbf24', bg: 'rgba(251,191,36,0.12)', soft: 'rgba(251,191,36,0.08)' },
  blue: { accent: '#60a5fa', bg: 'rgba(96,165,250,0.12)', soft: 'rgba(96,165,250,0.08)' },
  green: { accent: '#6ee7b7', bg: 'rgba(110,231,183,0.12)', soft: 'rgba(110,231,183,0.08)' },
  purple: { accent: '#c4b5fd', bg: 'rgba(196,181,253,0.12)', soft: 'rgba(196,181,253,0.08)' },
};

export default function CategoryCard({ category, locale = 'tr' }: CategoryCardProps) {
  const IconComponent = getIcon(category.icon, Folder);
  const colors = colorMap[category.color] || colorMap.blue;
  const toolCount = getToolsByCategory(category.id).length;
  const copy = getToolsPageCopy(locale);
  const visual = getCategoryVisual(category.id);
  const style = {
    '--category-accent': colors.accent,
    '--category-accent-bg': colors.bg,
    '--category-accent-soft': colors.soft,
  } as CSSProperties;

  return (
    <Link href={getCategoryHref(category.slug, locale)} className="category-card-link">
      <article className="category-card-modern" style={style}>
        <div className="category-card-glow" />
        <div className="category-card-visual">
          <Image src={visual.src} alt={`${category.name} – ${visual.alt}`} fill sizes="(max-width: 768px) 100vw, 300px" />
        </div>
        <div className="category-card-icon"><IconComponent size={21} /></div>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <div className="category-card-footer">
          <span>{toolCount} {copy.toolCountSuffix}</span>
          <span className="category-card-open">
            {copy.openAction}
            <ArrowRight size={14} />
          </span>
        </div>
      </article>
    </Link>
  );
}
