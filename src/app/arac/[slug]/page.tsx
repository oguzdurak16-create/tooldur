import type { Metadata } from 'next';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calculator, ChevronRight, CircleHelp } from 'lucide-react';
import ToleranceGuide from '@/components/ToleranceGuide';
import CalculatorClientLoader from '@/components/CalculatorClientLoader';
import { tools, getToolBySlug, getCategoryById } from '@/data/tools';
import { getToleranceGuide } from '@/data/toleranceGuides';
import { blogPosts } from '@/data/blogPosts';
import { getRelatedBlogPosts, getToolSeoContent } from '@/lib/toolSeoContent';
import { getContextualRelatedTools, getPriorityToolMeta } from '@/lib/priorityToolSeo';
import { getToolVisual } from '@/lib/visualAssets';
import PriorityToolQuickAnswer from '@/components/PriorityToolQuickAnswer';
import ToolEngagementBar from '@/components/ToolEngagementBar';
import CalculationWorkbench from '@/components/CalculationWorkbench';
import { isIndexableTool } from '@/lib/seoFocus';
import styles from './ToolPage.module.css';
export const revalidate = 86400;

interface Props {
  params: { slug: string };
}

const colorMap: Record<string, { accent: string; bg: string; soft: string }> = {
  yellow: { accent: '#ffb11b', bg: 'rgba(255,177,27,0.10)', soft: 'rgba(255,177,27,0.06)' },
  orange: { accent: '#fbbf24', bg: 'rgba(251,191,36,0.10)', soft: 'rgba(251,191,36,0.06)' },
  blue: { accent: '#60a5fa', bg: 'rgba(96,165,250,0.10)', soft: 'rgba(96,165,250,0.06)' },
  green: { accent: '#6ee7b7', bg: 'rgba(110,231,183,0.10)', soft: 'rgba(110,231,183,0.06)' },
  purple: { accent: '#c4b5fd', bg: 'rgba(196,181,253,0.10)', soft: 'rgba(196,181,253,0.06)' },
};

function buildKeywords(toolName: string, categoryName?: string) {
  const base = [
    toolName,
    `${toolName} hesaplama`,
    `${toolName} hesaplayıcı`,
    `${toolName} online`,
    `${toolName} ücretsiz`,
    'hesaplama aracı',
    'online hesaplama',
    'ücretsiz hesaplama',
  ];

  if (categoryName) {
    base.push(categoryName, `${categoryName} araçları`, `${categoryName} hesaplama`);
  }

  return Array.from(new Set(base.filter(Boolean)));
}

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {
      title: 'Araç Bulunamadı',
      description: 'Aradığınız araç bulunamadı.',
      robots: { index: false, follow: false },
    };
  }

  const category = getCategoryById(tool.category);
  const toleranceGuide = getToleranceGuide(slug);
  const priorityMeta = getPriorityToolMeta(tool.slug);
  const title = priorityMeta?.title || `${tool.name} – Ücretsiz Online Hesaplama`;
  const description = priorityMeta?.description || tool.description || `${tool.name} ile hızlı, ücretsiz ve online hesaplama yapın.`;
  const visual = getToolVisual(tool.category, tool.slug);
  const indexable = isIndexableTool(tool);

  return {
    title,
    description,
    keywords: Array.from(new Set([
      ...buildKeywords(tool.name, category?.name),
      ...(tool.keywords || []),
      ...(tool.tags || []),
      ...(priorityMeta?.keywords || []),
      ...(toleranceGuide ? ['tolerans', 'geçme toleransı', 'imalat toleransı', 'teknik resim toleransı'] : []),
    ])),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.tooldur.com/arac/${tool.slug}`,
      siteName: 'Tooldur',
      locale: 'tr_TR',
      images: [{ url: visual.og, width: 1200, height: 630, alt: `${tool.name} – ${visual.alt}` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [visual.og] },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: { canonical: tool.slug === 'proje-yonetimi' ? '/proje-yonetimi' : `/arac/${tool.slug}` },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = params;
  const tool = getToolBySlug(slug);

  if (!tool) notFound();
  if (tool.slug === 'proje-yonetimi') permanentRedirect('/proje-yonetimi');

  const category = getCategoryById(tool.category);
  const relatedTools = getContextualRelatedTools(tool, tools, 4).filter(isIndexableTool);
  const colors = colorMap[(category as any)?.color || 'yellow'] || colorMap.yellow;
  const toleranceGuide = getToleranceGuide(slug);
  const seoContent = getToolSeoContent(tool, category?.name);
  const relatedPosts = getRelatedBlogPosts(tool, blogPosts, 3);
  const visual = getToolVisual(tool.category, tool.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: tool.name,
        description: tool.description || `${tool.name} ile hızlı, ücretsiz ve online hesaplama yapın.`,
        url: `https://www.tooldur.com/arac/${tool.slug}`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
        publisher: { '@type': 'Organization', name: 'Tooldur', url: 'https://www.tooldur.com' },
        image: `https://www.tooldur.com${visual.og}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.tooldur.com' },
          { '@type': 'ListItem', position: 2, name: 'Araçlar', item: 'https://www.tooldur.com/araclar' },
          ...(category ? [{ '@type': 'ListItem', position: 3, name: category.name, item: `https://www.tooldur.com/kategori/${category.slug}` }] : []),
          { '@type': 'ListItem', position: category ? 4 : 3, name: tool.name, item: `https://www.tooldur.com/arac/${tool.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: seoContent.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
      {
        '@type': 'HowTo',
        name: `${tool.name} nasıl kullanılır?`,
        description: `${tool.name} aracını kullanarak hızlı ön hesap yapma adımları.`,
        step: seoContent.howTo.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      },
    ],
  };

  const pageStyle = { '--tool-color': colors.accent } as CSSProperties;

  return (
    <main className={styles.page} style={pageStyle}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.breadcrumbBar}>
        <div className="td-container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Ana Sayfa</Link><ChevronRight size={13} />
            <Link href="/araclar">Tüm Araçlar</Link>
            {category && <><ChevronRight size={13} /><Link href={`/kategori/${category.slug}`}>{category.name}</Link></>}
            <ChevronRight size={13} /><strong>{tool.name}</strong>
          </nav>
        </div>
      </div>

      <section className={styles.hero}>
        <div className={`td-container ${styles.heroGrid}`}>
          <div>
            {category && <span className={styles.category}>{category.name}</span>}
            <h1>{tool.name}</h1>
            {tool.description && <p className={styles.description}>{tool.description}</p>}
            <ToolEngagementBar slug={tool.slug} name={tool.name} />
          </div>

          <div className={styles.visual}>
            <Image src={visual.src} alt={`${tool.name} – ${visual.alt}`} fill priority sizes="(max-width: 920px) 100vw, 430px" />
            <div className={styles.visualTop}><span>Tooldur çalışma alanı</span><span>Ücretsiz araç</span></div>
            <div className={styles.caption}>{visual.caption}</div>
          </div>
        </div>
      </section>

      <section id="hesaplama" className={styles.calculatorSection}>
        <div className="td-container">
          <div className={styles.calculatorHeader}>
            <div><Calculator size={14} /> Hesaplama çalışma alanı</div>
            <span>Girdiler cihazında otomatik kaydedilir.</span>
          </div>
          <div className={styles.calculatorFrame}>
            <div className={`${styles.calculatorInner} tool-compact-calculator`}>
              <CalculatorClientLoader slug={slug} tool={tool} />
            </div>
          </div>
          <CalculationWorkbench toolSlug={tool.slug} toolName={tool.name} />
        </div>
      </section>

      <PriorityToolQuickAnswer slug={slug} />
      {toleranceGuide && <ToleranceGuide guide={toleranceGuide} />}

      <section className={styles.contentSection}>
        <div className={`td-container ${styles.contentGrid}`}>
          <article className={styles.article}>
            <h2>{seoContent.useCaseTitle}</h2>
            {seoContent.intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {seoContent.sections.map((section) => (
              <section key={section.heading}>
                <h3>{section.heading}</h3>
                {section.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {section.list && <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul>}
              </section>
            ))}
          </article>

          <aside className={styles.side}>
            <div className={styles.sideCard}>
              <h2><CircleHelp size={17} color="var(--tool-color)" /> Sık sorulan sorular</h2>
              {seoContent.faq.map((item) => <div className={styles.faq} key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}
            </div>

            {relatedPosts.length > 0 && (
              <div className={styles.sideCard}>
                <h2><BookOpen size={17} color="var(--tool-color)" /> İlgili rehberler</h2>
                {relatedPosts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.guideLink}>
                    <strong>{post.title}</strong><span>{post.description}</span>
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>

      {relatedTools.length > 0 && (
        <section className={styles.related}>
          <div className="td-container">
            <div className={styles.relatedHead}><h2>Benzer araçlar</h2><p>Aynı teknik iş akışında kullanabileceğin diğer hesaplamalar.</p></div>
            <div className={styles.relatedGrid}>
              {relatedTools.map((relatedTool) => (
                <Link key={relatedTool.id} href={`/arac/${relatedTool.slug}`} className={styles.relatedCard}>
                  <strong>{relatedTool.name}</strong><span>{relatedTool.description}</span><b>Aracı aç <ArrowRight size={13} /></b>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
