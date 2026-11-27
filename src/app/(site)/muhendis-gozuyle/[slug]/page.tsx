import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Clock3, ExternalLink, Wrench } from 'lucide-react';
import { getMgStory, MG_SITE_PUBLISHED_AT, mgStories } from '@/data/mgStories';
import styles from '../mg.module.css';

const BASE = 'https://www.tooldur.com';
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return mgStories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = getMgStory(slug);
  if (!story) return {};
  const url = BASE + '/muhendis-gozuyle/' + story.slug;
  return {
    title: story.title + ' | Mühendis Gözüyle',
    description: story.summary,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: story.title,
      description: story.summary,
      url,
      publishedTime: MG_SITE_PUBLISHED_AT,
      siteName: 'Tooldur',
      images: [{ url: BASE + '/visuals/engineering-guides-og.webp', width: 1200, height: 630, alt: 'Tooldur mühendislik rehberleri' }],
    },
    twitter: { card: 'summary_large_image', title: story.title, description: story.summary, images: [BASE + '/visuals/engineering-guides-og.webp'] },
  };
}

export default async function MgStoryPage({ params }: Props) {
  const { slug } = await params;
  const story = getMgStory(slug);
  if (!story) notFound();

  const index = mgStories.findIndex((item) => item.slug === story.slug);
  const more = [1, 2].map((step) => mgStories[(index + step) % mgStories.length]);
  const storyUrl = BASE + '/muhendis-gozuyle/' + story.slug;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: story.title,
    description: story.summary,
    datePublished: MG_SITE_PUBLISHED_AT,
    dateModified: MG_SITE_PUBLISHED_AT,
    mainEntityOfPage: storyUrl,
    url: storyUrl,
    image: BASE + story.image,
    inLanguage: 'tr-TR',
    author: { '@type': 'Organization', name: 'Mühendis Gözüyle' },
    publisher: { '@type': 'Organization', '@id': BASE + '/#organization', name: 'Tooldur' },
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Sayfa yolu">
          <Link href="/">Tooldur</Link><span>/</span><Link href="/muhendis-gozuyle">Mühendis Gözüyle</Link><span>/</span><strong>{story.title}</strong>
        </nav>
        <div className={styles.articleLayout}>
          <article className={styles.article}>
            <Link href="/muhendis-gozuyle" className={styles.backLink}><ArrowLeft size={17} /> Tüm konulara dön</Link>
            <div className={styles.kicker}><BookOpen size={16} /> {story.category} <span>·</span> <Clock3 size={15} /> {story.readTime}</div>
            <h1 className={styles.articleTitle}>{story.title}</h1>
            <p className={styles.articleHook}>{story.hook}</p>
            <figure className={styles.articleVisual}>
              <Image src={story.image} alt={story.imageAlt} fill sizes="(max-width: 850px) 100vw, 560px" priority unoptimized />
              <figcaption>Mühendis Gözüyle Facebook sayfasında yayımlanmış orijinal gönderi görseli.</figcaption>
            </figure>
            <p className={styles.articleLead}>{story.lead}</p>
            {story.sections.map((section) => (
              <section key={section.heading} className={styles.articleSection}>
                <h2>{section.heading}</h2>
                <p>{section.body}</p>
              </section>
            ))}
            <section className={styles.takeawayBox}>
              <h2>Özetle</h2>
              <ul>{story.takeaways.map((point) => <li key={point}>{point}</li>)}</ul>
            </section>
            <div className={styles.caution}><strong>Mühendislik notu:</strong> {story.caution}</div>
            <p className={styles.adaptationNote}>Bu anlatım, Mühendis Gözüyle kanalında ele alınan konu temel alınarak Tooldur için genişletilmiştir. Görsel özgün gönderiden alınmıştır.</p>
            <a href={story.sourcePostUrl} target="_blank" rel="noopener noreferrer" className={styles.originalLink}>Orijinal Facebook gönderisini görüntüle <ExternalLink size={16} /></a>
          </article>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarPanel}>
              <h2><Wrench size={18} /> Hesaplamaya geç</h2>
              <p>Teorik açıklamayı uygulamada kullanmak için ilgili Tooldur araçlarını aç.</p>
              {story.relatedTools.length ? story.relatedTools.map((tool) => (
                <Link href={tool.href} key={tool.href} className={styles.toolLink}>{tool.label}<ArrowRight size={16} /></Link>
              )) : <Link href="/araclar" className={styles.toolLink}>Tüm mühendislik araçları<ArrowRight size={16} /></Link>}
            </div>
            <div className={styles.sidebarPanel}>
              <h2>Bir sonraki teknik konu</h2>
              {more.map((other) => <Link className={styles.otherLink} key={other.slug} href={'/muhendis-gozuyle/' + other.slug}>{other.title}<ArrowRight size={15} /></Link>)}
            </div>
            <Link href="/muhendis-gozuyle" className={styles.archiveLink}>Mühendis Gözüyle arşivini aç <ArrowRight size={16} /></Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
