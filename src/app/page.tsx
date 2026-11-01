import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download, CheckCircle2 } from 'lucide-react';
import TooldurSearchBox from '@/components/TooldurSearchBox';
import { categories, tools } from '@/data/tools';
import { mgStories } from '@/data/mgStories';
import { getIndexableCategories, getIndexableTools } from '@/lib/seoFocus';
import { getIcon, Calculator } from '@/lib/icons';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Mühendislik Hesaplama: Tolerans, Sac ve Pompa | Tooldur' },
  description: 'Metrik diş tablosu, kılavuz matkap çapları, dalgıç pompa, torna derece, ISO tolerans ve imalat hesapları için ücretsiz online mühendislik araçları.',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'tr_TR', url: '/', siteName: 'Tooldur', title: 'Mühendislik Hesaplama Araçları | Tooldur', description: 'Sac ağırlığı, ISO tolerans, metrik diş ve pompa gücünü hesaplayın. Birimleri, hesap kapsamını ve sonucu aynı araçta kontrol edin.', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Mühendislik Hesaplama Araçları | Tooldur', description: 'Tolerans, sac ağırlığı, metrik diş ve pompa hesabına doğrudan ulaşın.', images: ['/og-image.png'] },
};

const searchIntentLinks = [
  { label: 'Metrik diş tablosu', detail: 'M2–M42 kılavuz matkap ve teorik diş ölçüleri', href: '/arac/kilavuz-matkap-hesaplama' },
  { label: 'Dalgıç pompa hesabı', detail: 'Debi, basma yüksekliği, verim ve motor gücü', href: '/arac/pompa-guc-hesaplama' },
  { label: 'Torna derece hesaplama', detail: 'Konik açı, yarım açı ve 1:N koniklik oranı', href: '/arac/konik-hesaplama' },
  { label: 'ISO geçme toleransı', detail: 'H7/h6, H7/g6 ve mil-delik sapmaları', href: '/arac/iso-gecme-tolerans-hesaplama' },
  { label: 'Sac ağırlık hesabı', detail: 'Çelik, galvaniz, paslanmaz ve alüminyum levha', href: '/arac/levha-agirlik-hesaplama' },
  { label: 'Sac büküm hesabı', detail: 'V kalıp, tonaj, büküm payı ve açınım', href: '/arac/sac-bukum-kesim-hesaplayici' },
  { label: 'Cıvata sıkma torku', detail: 'Çap, kalite sınıfı ve sürtünmeye göre tork', href: '/arac/civata-sikma-torku-hesaplama' },
  { label: 'Kablo kesiti hesabı', detail: 'Akım, mesafe ve gerilim düşümüne göre kesit', href: '/arac/kablo-kesiti-hesaplama' },
];

export default function Home() {
  const indexableTools = getIndexableTools(tools);
  const visibleCategories = getIndexableCategories(categories);
  const homeJsonLd = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: 'Öne çıkan mühendislik hesaplama araçları',
    itemListElement: searchIntentLinks.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.label, url: `https://www.tooldur.com${item.href}` })),
  };
  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }} />
    <section className={styles.intro} aria-labelledby="home-title">
      <div className={styles.container}>
        <div className={styles.welcome}>
          <div><h1 id="home-title">Mühendislik araçları</h1><p>Hesabını seç, sonucuna ulaş.</p></div>
          <span className={styles.free}><CheckCircle2 size={16} /> {indexableTools.length} ücretsiz araç</span>
        </div>
        <TooldurSearchBox compact />
      </div>
    </section>

    <div className={`${styles.container} ${styles.workspace}`}>
      <section className={styles.directory} aria-labelledby="tools-title">
        <div className={styles.sectionHeading}><h2 id="tools-title">Sık kullanılan hesaplar</h2><Link href="/araclar">Tüm araçlar <ArrowRight size={16} /></Link></div>
        <div className={styles.toolGrid}>
          {searchIntentLinks.map((item, index) => {
            const tool = tools.find((tool) => item.href === `/arac/${tool.slug}`);
            const Icon = getIcon(tool?.icon, Calculator);
            return <Link href={item.href} className={styles.tool} key={item.href}>
              <span className={styles.toolIcon} data-tone={index % 4}><Icon size={22} aria-hidden="true" /></span>
              <span className={styles.toolCopy}><strong>{item.label}</strong><small>{item.detail}</small></span>
              <ArrowRight className={styles.toolArrow} size={16} aria-hidden="true" />
            </Link>;
          })}
        </div>
      </section>
      <aside className={styles.browse} aria-labelledby="browse-title">
        <div className={styles.sectionHeading}><h2 id="browse-title">Çalışma alanını seç</h2></div>
        <div className={styles.categoryGrid}>{visibleCategories.map((category) => {
          const Icon = getIcon(category.icon, Calculator);
          return <Link key={category.id} href={`/kategori/${category.slug}`}><Icon size={18} aria-hidden="true" /><span>{category.name}</span><ArrowRight size={14} aria-hidden="true" /></Link>;
        })}</div>
      </aside>
    </div>

    <section className={`${styles.container} ${styles.extras}`} aria-label="Diğer çalışma araçları">
      <div className={styles.extra}><span className={styles.smallLabel}>SOLIDWORKS İÇİN</span><h2>Hesaptan çizime.</h2><p>TooldurCAD yardımcı araçlarıyla tasarımına devam et.</p><Link href="/kurulum-indir"><Download size={16} /> TooldurCAD’i indir <ArrowRight size={16} /></Link></div>
      <div className={styles.extra}><span className={styles.smallLabel}>SATINALMA İÇİN</span><h2>Sipariş ve faturayı karşılaştır.</h2><p>InvoiceGuard ile miktar ve birim fiyat farklarını tarayıcında kontrol et.</p><a href="https://invoiceguard.hatchable.site/?utm_source=tooldur&utm_medium=referral&utm_campaign=launch" target="_blank" rel="noopener noreferrer">InvoiceGuard’ı aç <ArrowRight size={16} /></a></div>
    </section>

    <section className={`${styles.container} ${styles.stories}`} aria-labelledby="stories-title">
      <div className={styles.sectionHeading}><div><span className={styles.smallLabel}>MÜHENDİS GÖZÜYLE</span><h2 id="stories-title">Biraz da nasıl çalıştığına bakalım.</h2></div><Link href="/muhendis-gozuyle">Tüm yazılar <ArrowRight size={16} /></Link></div>
      <div className={styles.storyGrid}>{mgStories.slice(0, 3).map((story) => <Link key={story.slug} href={'/muhendis-gozuyle/' + story.slug} className={styles.story}>
        <div className={styles.storyImage}><Image src={story.image} alt={story.imageAlt} fill sizes="(max-width: 640px) 100vw, 33vw" /></div><div className={styles.storyText}><span>{story.category}</span><h3>{story.title}</h3><p>{story.summary}</p></div>
      </Link>)}</div>
    </section>
  </main>;
}
