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
    openGraph: {
      title: tool.name,
      description: tool.description,
      url: `/en/tool/${tool.slug}`,
      type: 'website',
      locale: 'en_US',
      siteName: 'Tooldur',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: `${tool.name} | Tooldur` }],
    },
    twitter: { card: 'summary_large_image', title: tool.name, description: tool.description, images: ['/og-image.png'] },
  };
}

export default async function EnglishToolRoute({ params }: Props) {
  const { slug } = await params;
  return <LocalizedToolPage locale="en" slug={slug} />;
}
