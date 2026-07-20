import { Metadata } from 'next';
import AllToolsClient from '@/components/AllToolsClient';
import { categories, tools } from '@/data/tools';
import { getIndexableCategories, getIndexableTools } from '@/lib/seoFocus';

const title = 'Mühendislik ve İmalat Hesaplama Araçları';
const description =
  'Makine, sac şekillendirme, tolerans, metrik diş, elektrik, üretim ve yapı işleri için ücretsiz teknik hesaplama araçları.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/araclar' },
  keywords: [
    'mühendislik hesaplama araçları',
    'online hesaplama',
    'makine mühendisliği hesaplama',
    'elektrik hesaplama',
    'inşaat hesaplama',
    'birim çevirici',
  ],
  openGraph: {
    title: `${title} | Tooldur`,
    description,
    type: 'website',
    url: 'https://www.tooldur.com/araclar',
    images: [{ url: '/visuals/topics/all-tools-overview-og.webp', width: 1200, height: 630, alt: 'Tooldur mühendislik hesaplama araçları' }],
  },
};

export default function AllToolsPage() {
  const indexableTools = getIndexableTools(tools);
  const indexableCategories = getIndexableCategories(categories);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: title,
        description,
        url: 'https://www.tooldur.com/araclar',
        primaryImageOfPage: 'https://www.tooldur.com/visuals/topics/all-tools-overview-og.webp',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: indexableTools.length,
          itemListElement: indexableTools.map((tool, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: tool.name,
            url: `https://www.tooldur.com/arac/${tool.slug}`,
          })),
        },
        about: indexableCategories.map((category) => ({
          '@type': 'Thing',
          name: category.name,
          description: category.description,
          url: `https://www.tooldur.com/kategori/${category.slug}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.tooldur.com' },
          { '@type': 'ListItem', position: 2, name: 'Araçlar', item: 'https://www.tooldur.com/araclar' },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AllToolsClient />
    </>
  );
}
