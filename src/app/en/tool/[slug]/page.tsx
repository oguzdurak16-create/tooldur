import type { Metadata } from 'next';
import LocalizedToolPage from '@/components/LocalizedToolPage';
import { languageAlternates } from '@/lib/siteLanguage';
import { getLocalizedToolBySlug, getOriginalToolBySlug } from '@/lib/toolLocalization';
import { isIndexableTool } from '@/lib/seoFocus';
export const revalidate = 86400;

interface Props { params: { slug: string } }

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: Props): Metadata {
  const tool = getLocalizedToolBySlug(params.slug, 'en');
  const originalTool = getOriginalToolBySlug(params.slug);
  if (!tool || !originalTool) return { robots: { index: false, follow: false } };
  return {
    title: tool.name,
    robots: isIndexableTool(originalTool) ? { index: true, follow: true } : { index: false, follow: true },
    description: tool.description,
    alternates: { canonical: `/en/tool/${tool.slug}`, languages: languageAlternates('tool', tool.slug) },
    openGraph: { title: tool.name, description: tool.description, type: 'website' },
  };
}

export default function EnglishToolRoute({ params }: Props) {
  return <LocalizedToolPage locale="en" slug={params.slug} />;
}
