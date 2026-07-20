import Link from 'next/link';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import { Tool } from '@/data/tools';
import { getIcon, Calculator } from '@/lib/icons';
import { getLocalizedCategoryById, getToolHref, getToolsPageCopy } from '@/lib/toolLocalization';
import type { Locale } from '@/lib/siteLanguage';
import { getToolVisual } from '@/lib/visualAssets';

interface ToolCardProps {
  tool: Tool;
  locale?: Locale;
}

const colorMap: Record<string, { accent: string; bg: string; soft: string }> = {
  yellow: { accent: '#ffb11b', bg: 'rgba(255,177,27,0.12)', soft: 'rgba(255,177,27,0.08)' },
  orange: { accent: '#fbbf24', bg: 'rgba(251,191,36,0.12)', soft: 'rgba(251,191,36,0.08)' },
  blue: { accent: '#60a5fa', bg: 'rgba(96,165,250,0.12)', soft: 'rgba(96,165,250,0.08)' },
  green: { accent: '#6ee7b7', bg: 'rgba(110,231,183,0.12)', soft: 'rgba(110,231,183,0.08)' },
  purple: { accent: '#c4b5fd', bg: 'rgba(196,181,253,0.12)', soft: 'rgba(196,181,253,0.08)' },
};

export default function ToolCard({ tool, locale = 'tr' }: ToolCardProps) {
  const IconComponent = getIcon(tool.icon, Calculator);
  const category = getLocalizedCategoryById(tool.category, locale);
  const colors = colorMap[category?.color || 'yellow'] || colorMap.yellow;
  const copy = getToolsPageCopy(locale);
  const badgeText = tool.new ? copy.newBadge : tool.popular ? copy.popularBadge : tool.toleranceGuide ? copy.toleranceBadge : null;
  const visual = getToolVisual(tool.category, tool.slug);

  const style = {
    '--tool-accent': colors.accent,
    '--tool-accent-bg': colors.bg,
    '--tool-accent-soft': colors.soft,
  } as CSSProperties;

  return (
    <Link href={getToolHref(tool.slug, locale)} className="tool-card-link">
      <article className="tool-card-modern" style={style}>
        <div className="tool-card-glow" />

        <div className="tool-card-visual">
          <Image src={visual.src} alt={`${tool.name} – ${visual.alt}`} fill sizes="(max-width: 768px) 100vw, 360px" />
        </div>

        <div className="tool-card-top">
          <div className="tool-card-icon">
            <IconComponent size={21} />
          </div>

          <div className="tool-card-content">
            <div className="tool-card-meta">
              <span>{category?.name || copy.tool}</span>
              {badgeText && <span className="tool-card-badge">{badgeText}</span>}
            </div>

            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
          </div>
        </div>

        <div className="tool-card-footer">
          <span className="tool-card-free">{copy.freeTool}</span>
          <span className="tool-card-open">
            {copy.openAction}
            <ArrowRight size={14} />
          </span>
        </div>
      </article>
    </Link>
  );
}
