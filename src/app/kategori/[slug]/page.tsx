import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BookOpen, Calculator, CheckCircle2 } from 'lucide-react';
import { categories, getToolsByCategory } from '@/data/tools';
import { blogPosts } from '@/data/blogPosts';
import ToolCard from '@/components/ToolCard';
import CategoryCard from '@/components/CategoryCard';
import { getIcon, Folder } from '@/lib/icons';
import { getCategoryVisual } from '@/lib/visualAssets';
import { isIndexableCategory, isIndexableTool } from '@/lib/seoFocus';
import styles from '@/components/CategoryPage.module.css';

export const revalidate = 86400;

interface Props {
  params: { slug: string };
}

const colorMap: Record<string, { accent: string }> = {
  yellow: { accent: '#fbbf24' },
  orange: { accent: '#fb923c' },
  blue: { accent: '#38bdf8' },
  green: { accent: '#6ee7b7' },
  purple: { accent: '#c4b5fd' },
};

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) return { title: 'Kategori Bulunamadı' };

  const visual = getCategoryVisual(category.id);
  const indexable = isIndexableCategory(category);

  return {
    title: `${category.name} Hesaplama Araçları`,
    description: `${category.name} için ücretsiz online hesaplama araçları. ${category.description}`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: `/kategori/${category.slug}` },
    openGraph: {
      title: `${category.name} Hesaplama Araçları | Tooldur`,
      description: category.description,
      type: 'website',
      url: `https://www.tooldur.com/kategori/${category.slug}`,
      siteName: 'Tooldur',
      images: [{ url: visual.og, width: 1200, height: 630, alt: `${category.name} hesaplama araçları – ${visual.alt}` }],
    },
  };
}

export default function CategoryPage({ params }: Props) {
  const category = categories.find((item) => item.slug === params.slug);
  if (!category) notFound();

  const allCategoryTools = getToolsByCategory(category.id);
  const categoryTools = isIndexableCategory(category)
    ? allCategoryTools.filter(isIndexableTool)
    : allCategoryTools;
  const otherCategories = categories.filter((item) => item.id !== category.id && isIndexableCategory(item));
  const toolSlugs = new Set(categoryTools.map((tool) => tool.slug));
  const relatedPosts = blogPosts
    .filter((post) => post.relatedTools.some((item) => Array.from(toolSlugs).some((slug) => item.href.endsWith(`/arac/${slug}`))))
    .slice(0, 6);
  const IconComponent = getIcon(category.icon, Folder);
  const colors = colorMap[category.color] || colorMap.blue;
  const visual = getCategoryVisual(category.id);
  const pageStyle = { '--category-accent': colors.accent } as CSSProperties;

  return (
    <main className={styles.page} style={pageStyle}>
      <div className={styles.breadcrumbBar}>
        <div className="td-container">
          <nav className={styles.breadcrumb} aria-label="Sayfa yolu">
            <Link href="/">Ana Sayfa</Link><span>/</span>
            <Link href="/araclar">Tüm Araçlar</Link><span>/</span>
            <strong>{category.name}</strong>
          </nav>
        </div>
      </div>

      <section className={styles.hero}>
        <div className={`td-container ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><Calculator size={13} /> Mühendislik araç grubu</div>
            <div className={styles.titleRow}>
              <div className={styles.icon}><IconComponent size={29} /></div>
              <h1 className={styles.title}>{category.name}</h1>
            </div>
            <p className={styles.description}>{category.description}</p>
            <div className={styles.heroMeta}>
              <div className={styles.metaItem}><CheckCircle2 size={14} /> {categoryTools.length} ücretsiz araç</div>
              <div className={styles.metaItem}><CheckCircle2 size={14} /> Kayıt gerektirmez</div>
              <div className={styles.metaItem}><CheckCircle2 size={14} /> Mobil uyumlu</div>
            </div>
          </div>

          <div className={styles.visual}>
            <Image src={visual.src} alt={`${category.name} – ${visual.alt}`} fill priority sizes="(max-width: 1050px) 100vw, 440px" />
            <div className={styles.visualBadge}>
              <div><strong>{categoryTools.length}</strong><span>hesaplama aracı</span></div>
              <div className={styles.visualCode}>TOOLDUR / {category.slug.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </section>

      <section className={`td-container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionIndex}>01 / Araçlar</div>
            <h2>Bu kategorideki araçlar</h2>
            <p>{category.name} alanındaki hesabı seçin, değerleri girin ve sonucu doğrudan alın.</p>
          </div>
        </div>

        {categoryTools.length > 0 ? (
          <div className={styles.toolGrid}>
            {categoryTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        ) : (
          <div className={styles.empty}>Bu kategoride henüz araç yok.</div>
        )}
      </section>

      {relatedPosts.length > 0 && (
        <section className={`td-container ${styles.section}`}>
          <div className={styles.sectionHead}>
            <div>
              <div className={styles.sectionIndex}>02 / Teknik bilgi</div>
              <h2>İlgili mühendislik rehberleri</h2>
              <p>Hesap sonucunu uygulamaya aktarırken kullanılan yöntemleri ve teknik ayrıntıları inceleyin.</p>
            </div>
            <BookOpen size={23} color="var(--category-accent)" />
          </div>
          <div className={styles.guideGrid}>
            {relatedPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.guideCard}>
                <div className={styles.guideLabel}>{post.category}</div>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <div className={styles.guideArrow}>Rehberi aç <ArrowRight size={13} /></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={`td-container ${styles.otherSection}`}>
        <div className={styles.sectionHead}>
          <div>
            <div className={styles.sectionIndex}>03 / Keşfet</div>
            <h2>Diğer kategoriler</h2>
            <p>Farklı mühendislik disiplinleri için hazırlanmış hesaplama alanlarına geçin.</p>
          </div>
        </div>
        <div className={styles.categoryGrid}>
          {otherCategories.map((item) => <CategoryCard key={item.id} category={item} />)}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'CollectionPage',
                name: `${category.name} Hesaplama Araçları`,
                description: category.description,
                url: `https://www.tooldur.com/kategori/${category.slug}`,
                primaryImageOfPage: `https://www.tooldur.com${visual.og}`,
                hasPart: categoryTools.map((tool) => ({
                  '@type': 'SoftwareApplication',
                  name: tool.name,
                  url: `https://www.tooldur.com/arac/${tool.slug}`,
                  applicationCategory: 'UtilitiesApplication',
                  operatingSystem: 'Any',
                })),
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.tooldur.com' },
                  { '@type': 'ListItem', position: 2, name: 'Araçlar', item: 'https://www.tooldur.com/araclar' },
                  { '@type': 'ListItem', position: 3, name: category.name, item: `https://www.tooldur.com/kategori/${category.slug}` },
                ],
              },
            ],
          }),
        }}
      />
    </main>
  );
}
