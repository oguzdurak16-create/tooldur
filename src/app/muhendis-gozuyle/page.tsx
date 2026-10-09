import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Wrench } from 'lucide-react';
import { mgStories } from '@/data/mgStories';
import MgStoryExplorer from './MgStoryExplorer';
import styles from './mg.module.css';

const ROOT = 'https://www.tooldur.com/muhendis-gozuyle';

export const metadata: Metadata = {
  title: 'Mühendis Gözüyle | Günlük Mekanizmaların Teknik Açıklamaları',
  description: 'Mühendis Gözüyle içeriklerinden seçilen mekanizmalar: şerit metre, basınç tankı, çelik halat, I profil, rulman ve üretim detaylarının teknik anlatımları.',
  alternates: { canonical: ROOT },
  openGraph: {
    type: 'website',
    title: 'Mühendis Gözüyle - Tooldur Teknik İçerik Arşivi',
    description: 'Günlük hayatta gördüğün teknik detayların neden böyle tasarlandığını öğren.',
    url: ROOT,
    siteName: 'Tooldur',
    images: [{ url: '/visuals/engineering-guides-og.webp', width: 1200, height: 630, alt: 'Tooldur mühendislik anlatımları' }],
  },
};

export default function MgPage() {
  const featured = mgStories[0];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Mühendis Gözüyle teknik içerik arşivi',
    url: ROOT,
    description: 'Mühendis Gözüyle konularından Tooldur için genişletilmiş teknik açıklamalar.',
    inLanguage: 'tr-TR',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: mgStories.map((story, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: story.title,
        url: ROOT + '/' + story.slug,
      })),
    },
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Sayfa yolu"><Link href="/">Tooldur</Link><span>/</span><strong>Mühendis Gözüyle</strong></nav>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}><BookOpen size={17} /> MÜHENDİS GÖZÜYLE × TOOLDUR</div>
            <h1>Gördüğün parçanın <em>neden öyle yapıldığını</em> öğren.</h1>
            <p>Günlük hayatta ve sanayide karşımıza çıkan gerçek mühendislik çözümleri. Kısa açıklamadan çalışma prensibine, oradan ilgili hesaplama aracına geç.</p>
            <div className={styles.heroActions}>
              <a href="#konular" className={styles.primaryButton}>Konuları incele <ArrowRight size={17} /></a>
              <Link href="/araclar" className={styles.secondaryButton}><Wrench size={17} /> Hesaplama araçları</Link>
            </div>
            <div className={styles.sourceNote}>Buradaki teknik yazılar MG paylaşımlarından genişletilmiştir. Görseller, Mühendis Gözüyle sayfasında yayımlanan özgün gönderi görselleridir.</div>
          </div>
          <Link className={styles.featured} href={'/muhendis-gozuyle/' + featured.slug} aria-label={featured.title + ' yazısına git'}>
            <Image src={featured.image} alt={featured.imageAlt} fill sizes="(max-width: 900px) 100vw, 400px" priority unoptimized />
            <span className={styles.featuredLabel}>ÖNE ÇIKAN KONU <ArrowRight size={16} /></span>
          </Link>
        </section>
        <section id="konular" className={styles.archive}>
          <div className={styles.sectionHeading}>
            <div><span className={styles.kicker}>TEKNİK KONU ARŞİVİ</span><h2>Merak ettiğin mekanizmayı bul</h2></div>
            <span className={styles.count}>{mgStories.length} teknik anlatım</span>
          </div>
          <MgStoryExplorer />
        </section>
      </div>
    </main>
  );
}
