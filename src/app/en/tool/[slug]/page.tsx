import type { Metadata } from 'next';
import LocalizedToolPage from '@/components/LocalizedToolPage';
import { languageAlternates } from '@/lib/siteLanguage';
import { getLocalizedToolBySlug, getOriginalToolBySlug } from '@/lib/toolLocalization';
import { isIndexableTool } from '@/lib/seoFocus';
export const revalidate = 86400;

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getLocalizedToolBySlug(slug, 'en');
  const originalTool = getOriginalToolBySlug(slug);
  if (!tool || !originalTool) return { robots: { index: false, follow: false } };
  return {
    title: tool.name,
    robots: isIndexableTool(originalTool) ? { index: true, follow: true } : { index: false, follow: true },
    description: tool.description,
    alternates: { canonical: `/en/tool/${tool.slug}`, languages: languageAlternates('tool', tool.slug) },
    openGraph: { title: tool.name, description: tool.description, type: 'website' },
  };
}

export default async function EnglishToolRoute({ params }: Props) {
  const { slug } = await params;
  return <LocalizedToolPage locale="en" slug={slug} />;
}
