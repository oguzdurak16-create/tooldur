import type { Metadata } from 'next';
import LocalizedCategoryPage from '@/components/LocalizedCategoryPage';
import { categories } from '@/data/tools';
import { languageAlternates } from '@/lib/siteLanguage';
import { getLocalizedCategory } from '@/lib/toolLocalization';
import { isIndexableCategory } from '@/lib/seoFocus';
export const revalidate = 86400;

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const original = categories.find((c) => c.slug === slug);
  if (!original) return { robots: { index: false, follow: false } };
  const category = getLocalizedCategory(original, 'en');
  return { title: category.name, description: category.description, robots: isIndexableCategory(original) ? { index: true, follow: true } : { index: false, follow: true }, alternates: { canonical: `/en/category/${category.slug}`, languages: languageAlternates('category', category.slug) } };
}

export default async function EnglishCategoryRoute({ params }: Props) {
  const { slug } = await params;
  return <LocalizedCategoryPage locale="en" slug={slug} />;
}
