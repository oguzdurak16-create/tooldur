import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download, ShieldCheck, Wrench } from 'lucide-react';
import TooldurSearchBox from '@/components/TooldurSearchBox';
import ToolCard from '@/components/ToolCard';
import CategoryCard from '@/components/CategoryCard';
import { categories, tools, type Tool } from '@/data/tools';
import { getIndexableCategories, getIndexableTools } from '@/lib/seoFocus';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: 'Tooldur | Mühendislik Hesaplama Araçları',
  description: 'Makine, sac, elektrik, üretim ve yapı hesapları için ücretsiz mühendislik araçları.',
  alternates: { canonical: '/' },
};

const prioritySlugs = [
  'kilavuz-matkap-hesaplama',
  'sac-bukum-kesim-hesaplayici',
  'iso-gecme-tolerans-hesaplama',
  'levha-agirlik-hesaplama',
  'civata-sikma-torku-hesaplama',
  'rulman-omru-hesaplama',
];

const quickSearches = [
  { label: 'Metrik diş', href: '/arac/kilavuz-matkap-hesaplama' },
  { label: 'Sac ağırlık', href: '/arac/levha-agirlik-hesaplama' },
  { label: 'Kablo kesiti', href: '/arac/kablo-kesiti-hesaplama' },
];

export default function Home() {
  const indexableTools = getIndexableTools(tools);
  const featuredTools = prioritySlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is Tool => Boolean(tool));
  const visibleCategories = getIndexableCategories(categories).slice(0, 6);

  return (
    <main className={styles.page}>
      <section className={`td-container ${styles.hero}`}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><Wrench size={14} /> Mühendislik hesap araçları</div>
          <h1 className={styles.heroTitle}>Hesabı bul. <span><em>Sonucu kontrol et.</em> İşine devam et.</span></h1>
          <p className={styles.heroLead}>Teknik terimi veya hesabı yaz. Tooldur seni doğrudan ilgili araca götürsün.</p>

          <div className={styles.searchWrap}><TooldurSearchBox /></div>
          <div className={styles.quickLinks}>{quickSearches.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</div>

          <div className={styles.heroActions}>
            <Link href="/araclar" className={`${styles.button} ${styles.buttonPrimary}`}>Tüm araçlar <ArrowRight size={16} /></Link>
            <Link href="/kurulum-indir" className={styles.button}><Download size={16} /> TooldurCAD</Link>
          </div>

          <div className={styles.heroStats}>
            <div><strong>{indexableTools.length}+ araç</strong><span>Tek arama alanında</span></div>
            <div><strong>Ücretsiz</strong><span>Üyelik gerektirmeden</span></div>
            <div><strong>Açık kapsam</strong><span>Ön hesap ve doğrulama notlarıyla</span></div>
          </div>
        </div>

        <div className={styles.visual} aria-label="Tooldur hesaplama çalışma alanı">
          <div className={styles.visualTop}><div className={styles.visualDots}><i /><i /><i /></div><span>tool workspace</span></div>
          <div className={styles.visualBody}><Image src="/home/hero-engineering.webp" alt="Teknik çizimler ve mekanik parçalar" fill priority sizes="(max-width: 900px) 100vw, 46vw" /><div className={styles.visualShade} /></div>
          <div className={`${styles.dataCard} ${styles.dataCardTop}`}><small>Örnek araç</small><strong>Metrik diş</strong><span>M8 × 1,25</span></div>
          <div className={`${styles.dataCard} ${styles.dataCardRight}`}><small>Kılavuz matkap</small><strong>Ø6,8 mm</strong><span className={styles.dataStatus}>Tablo değeri</span></div>
          <div className={`${styles.dataCard} ${styles.dataCardBottom}`}><div><small>Sonuç kapsamı</small><strong>Ön kontrol</strong></div><ShieldCheck size={27} color="var(--success)" /></div>
        </div>
      </section>

      <section className={`td-container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div><span className={styles.sectionLabel}>ÖNE ÇIKANLAR</span><h2>En sık kullanılan araçlar</h2><p>Doğrudan girdilere ve sonuca geç.</p></div>
          <Link href="/araclar" className={styles.textLink}>Tümünü gör <ArrowRight size={15} /></Link>
        </div>
        <div className={styles.toolsGrid}>{featuredTools.map((tool) => <ToolCard tool={tool} key={tool.slug} />)}</div>
      </section>

      <section className={`td-container ${styles.section}`}>
        <div className={styles.sectionHead}><div><span className={styles.sectionLabel}>KATEGORİLER</span><h2>Çalışma alanını seç</h2><p>Benzer araçları teknik alanına göre görüntüle.</p></div></div>
        <div className={styles.categoriesGrid}>{visibleCategories.map((category) => <CategoryCard category={category} key={category.id} />)}</div>
      </section>

      <section className={`td-container ${styles.workspace}`}>
        <div className={styles.workspaceVisual}><Image src="/visuals/topics/tool-software.webp" alt="TooldurCAD çalışma alanı" fill sizes="(max-width: 900px) 100vw, 52vw" /></div>
        <div className={styles.workspaceCopy}>
          <span className={styles.sectionLabel}>TOOLDURCAD</span>
          <h2>Hesaptan çizime geç.</h2>
          <p>SolidWorks için ücretsiz yardımcı araçları ayrı çalışma alanından indir.</p>
          <div className={styles.workspaceActions}><Link href="/kurulum-indir" className={`${styles.button} ${styles.buttonPrimary}`}><Download size={16} /> İndirme sayfası</Link></div>
        </div>
      </section>
    </main>
  );
}
