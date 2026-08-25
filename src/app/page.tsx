import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Download, ShieldCheck, Wrench } from 'lucide-react';
import TooldurSearchBox from '@/components/TooldurSearchBox';
import ToolCard from '@/components/ToolCard';
import CategoryCard from '@/components/CategoryCard';
import { categories, tools, type Tool } from '@/data/tools';
import { getIndexableCategories, getIndexableTools } from '@/lib/seoFocus';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Mühendislik Hesaplama Araçları | Tooldur' },
  description: 'Metrik diş tablosu, kılavuz matkap çapları, dalgıç pompa, torna derece, ISO tolerans ve imalat hesapları için ücretsiz online mühendislik araçları.',
  alternates: { canonical: '/' },
};

const prioritySlugs = [
  'kilavuz-matkap-hesaplama',
  'pompa-guc-hesaplama',
  'konik-hesaplama',
  'iso-gecme-tolerans-hesaplama',
  'levha-agirlik-hesaplama',
  'civata-sikma-torku-hesaplama',
];

const quickSearches = [
  { label: 'Metrik diş tablosu', href: '/arac/kilavuz-matkap-hesaplama' },
  { label: 'Dalgıç pompa hesabı', href: '/arac/pompa-guc-hesaplama' },
  { label: 'Torna derece hesabı', href: '/arac/konik-hesaplama' },
];

const searchIntentLinks = [
  { label: 'Metrik diş tablosu', detail: 'M2–M42 kılavuz matkap ve teorik diş ölçüleri', href: '/arac/kilavuz-matkap-hesaplama' },
  { label: 'Dalgıç pompa hesabı', detail: 'Debi, basma yüksekliği, verim ve motor gücü', href: '/arac/pompa-guc-hesaplama' },
  { label: 'Torna derece hesabı', detail: 'Konik açı, yarım açı ve 1:N koniklik oranı', href: '/arac/konik-hesaplama' },
  { label: 'ISO geçme toleransı', detail: 'H7/h6, H7/g6 ve mil-delik sapmaları', href: '/arac/iso-gecme-tolerans-hesaplama' },
  { label: 'Sac ağırlık hesabı', detail: 'Çelik, galvaniz, paslanmaz ve alüminyum levha', href: '/arac/levha-agirlik-hesaplama' },
  { label: 'Sac büküm hesabı', detail: 'V kalıp, tonaj, büküm payı ve açınım', href: '/arac/sac-bukum-kesim-hesaplayici' },
  { label: 'Cıvata sıkma torku', detail: 'Çap, kalite sınıfı ve sürtünmeye göre tork', href: '/arac/civata-sikma-torku-hesaplama' },
  { label: 'Kablo kesiti hesabı', detail: 'Akım, mesafe ve gerilim düşümüne göre kesit', href: '/arac/kablo-kesiti-hesaplama' },
];

export default function Home() {
  const indexableTools = getIndexableTools(tools);
  const featuredTools = prioritySlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is Tool => Boolean(tool));
  const visibleCategories = getIndexableCategories(categories).slice(0, 6);
  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Öne çıkan mühendislik hesaplama araçları',
    itemListElement: searchIntentLinks.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      url: `https://www.tooldur.com${item.href}`,
    })),
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
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
          <div><span className={styles.sectionLabel}>ARAMADA ÖNE ÇIKANLAR</span><h2>En çok aranan mühendislik araçları</h2><p>Metrik diş, pompa ve torna hesabı başta olmak üzere doğrudan girdilere ve sonuca geç.</p></div>
          <Link href="/araclar" className={styles.textLink}>Tümünü gör <ArrowRight size={15} /></Link>
        </div>
        <div className={styles.toolsGrid}>{featuredTools.map((tool) => <ToolCard tool={tool} key={tool.slug} />)}</div>
      </section>

      <section className={`td-container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div><span className={styles.sectionLabel}>DOĞRUDAN ÇÖZÜM</span><h2>Aradığın teknik hesaba doğrudan git</h2><p>En çok aranan mühendislik teriminden ilgili tabloya veya hesaplama ekranına tek adımda ulaş.</p></div>
        </div>
        <div className={styles.intentGrid}>
          {searchIntentLinks.map((item) => (
            <Link href={item.href} className={styles.intentCard} key={item.href}>
              <span>{item.label}</span><strong>{item.detail}</strong><b aria-hidden="true"><ArrowRight size={15} /></b>
            </Link>
          ))}
        </div>
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
          <div className={styles.stepList}>
            <div><CheckCircle2 size={15} /> Hesabı veya teknik terimi bul.</div>
            <div><CheckCircle2 size={15} /> Girdileri kontrol edip sonucu doğrula.</div>
            <div><CheckCircle2 size={15} /> Teknik çıktıyı tasarım sürecine taşı.</div>
          </div>
          <div className={styles.workspaceActions}><Link href="/kurulum-indir" className={`${styles.button} ${styles.buttonPrimary}`}><Download size={16} /> İndirme sayfası</Link></div>
        </div>
      </section>

      <section className={`td-container ${styles.finalCta}`}>
        <div><span className={styles.sectionLabel}>HESABI BİLİYORSAN</span><h2>Arama kutusundan doğrudan çalışma alanına geç.</h2><p>Metrik diş, sac büküm, tolerans, pompa, donatı, tork veya kablo kesiti gibi teknik terimleri yaz.</p></div>
        <Link href="/araclar" className={`${styles.button} ${styles.buttonPrimary}`}>Araç ara <ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
