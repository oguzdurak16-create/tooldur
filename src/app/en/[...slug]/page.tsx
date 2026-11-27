import { blogPosts } from '@/data/blogPosts';
import { getEnglishGuide } from '@/data/englishBlog';
import { LocalizedRoutePage, localizedRouteMetadata } from '@/components/LocalizedRoute';

type Props = { params: Promise<{ slug: string[] }> };
const englishParams = async (params: Props['params']) => ({ ...await params, locale: 'en' });

export const revalidate = false;

export function generateStaticParams() {
  return blogPosts.map(post => {
    if (!getEnglishGuide(post.slug)) throw new Error(`Missing English guide: ${post.slug}`);
    return { slug: ['blog', post.slug] };
  });
}

export function generateMetadata({ params }: Props) {
  return localizedRouteMetadata({ params: englishParams(params) });
}

export default function EnglishRoutePage({ params }: Props) {
  return LocalizedRoutePage({ params: englishParams(params) });
}
