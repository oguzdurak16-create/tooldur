import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import TooldurSearchBox from '@/components/TooldurSearchBox';
import ToolCard from '@/components/ToolCard';
import CategoryCard from '@/components/CategoryCard';
import PersonalToolShelf from '@/components/PersonalToolShelf';
import { categories, tools, type Tool } from '@/data/tools';
import { getIndexableCategories, getIndexableTools } from '@/lib/seoFocus';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: 'Tooldur | Mühendislik Hesaplama Araçları',
  description: 'Metrik diş tablosu, kılavuz matkap çapları, torna derece, donatı ağırlıkları, dalgıç pompa ve imalat hesapları için ücretsiz mühendislik araçları.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Tooldur | Mühendislik Hesaplama Araçları',
    description: 'Metrik diş, torna derece, donatı ağırlıkları, dalgıç pompa ve imalat hesaplarını tek çalışma alanında toplayın.',
    images: [{ url: '/visuals/home-engineering-og.webp', width: 1200, height: 630, alt: 'Tooldur mühendislik hesaplama çalışma alanı' }],
  },
};

const prioritySlugs = [
  'kilavuz-matkap-hesaplama',
  'sac-bukum-kesim-hesaplayici',
  'iso-gecme-tolerans-hesaplama',
  'levha-agirlik-hesaplama',
  'civata-sikma-torku-hesaplama',
  'rulman-omru-hesaplama',
  'pompa-guc-hesaplama',
  'konik-hesaplama',
];

const quickSearches = [
  { label: 'M8 kılavuz', href: '/arac/kilavuz-matkap-hesaplama' },
  { label: 'H7/g6 tolerans', href: '/arac/iso-gecme-tolerans-hesaplama' },
  { label: 'Sac ağırlık', href: '/arac/levha-agirlik-hesaplama' },
  { label: 'Pompa gücü', href: '/arac/pompa-guc-hesaplama' },
];

const searchedSolutions = [
  { query: 'Metrik diş tablosu', answer: 'M2-M42 kılavuz matkap ve teorik diş ölçüleri', href: '/arac/kilavuz-matkap-hesaplama' },
  { query: 'Dalgıç pompa hesaplama', answer: 'Debi, basma yüksekliği, verim ve motor gücü', href: '/arac/pompa-guc-hesaplama' },
  { query: 'Torna derece hesaplama', answer: 'Konik açı, yarım açı ve 1:N koniklik oranı', href: '/arac/konik-hesaplama' },
  { query: 'Donatı ağırlıkları', answer: 'Ø6-Ø40 demir kg/m tablosu ve toplam tonaj', href: '/arac/demir-agirligi-hesaplama' },
  { query: 'Kablo kesiti', answer: 'Akım, hat uzunluğu ve gerilim düşümüne göre kesit', href: '/arac/kablo-kesiti-hesaplama' },
  { query: 'Cıvata torku', answer: 'Çap, kalite ve sürtünmeye göre sıkma torku', href: '/arac/civata-sikma-torku-hesaplama' },
];

const workflowSteps = [
  'Hesabı veya teknik terimi yaz.',
  'İlgili aracı aç ve girdileri tanımla.',
  'Sonucu kaydet, kopyala veya CSV olarak dışa aktar.',
];

export default function Home() {
  const indexableTools = getIndexableTools(tools);
  const featuredTools = prioritySlugs
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter((tool): tool is Tool => Boolean(tool));
  const indexableCategories = getIndexableCategories(categories).slice(0, 8);

  return (
    <main className={styles.page}>
      <section className={`td-container ${styles.hero}`}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><Wrench size={14} /> Ücretsiz mühendislik çalışma alanı</div>
          <h1 className={styles.heroTitle}>
            Teknik hesabı bul. <span><em>Ölçüyü doğrula.</em> Tasarıma devam et.</span>
          </h1>
          <p className={styles.heroLead}>
            Tooldur; makine, sac şekillendirme, elektrik, üretim ve yapı hesaplarını tek, hızlı ve tutarlı bir arayüzde toplar.
          </p>

          <div className={styles.searchWrap}><TooldurSearchBox /></div>
          <div className={styles.quickLinks}>
            {quickSearches.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
          </div>

          <div className={styles.heroActions}>
            <Link href="/araclar" className={`${styles.button} ${styles.buttonPrimary}`}>Tüm araçları aç <ArrowRight size={16} /></Link>
            <Link href="/kurulum-indir" className={styles.button}><Download size={16} /> TooldurCAD</Link>
          </div>

          <div className={styles.heroStats}>
            <div><strong>{indexableTools.length}+ araç</strong><span>Teknik ön hesap ve kontrol</span></div>
            <div><strong>Üyeliksiz kullanım</strong><span>Favoriler ve geçmiş cihazında</span></div>
            <div><strong>Tek tema</strong><span>Mobil, masaüstü ve panel</span></div>
          </div>
        </div>

        <div className={styles.visual} aria-label="Tooldur mühendislik çalışma alanı önizlemesi">
          <div className={styles.visualTop}>
            <div className={styles.visualDots}><i /><i /><i /></div>
            <span>tool workspace / live calculation</span>
          </div>
          <div className={styles.visualBody}>
            <Image src="/home/hero-engineering.webp" alt="Teknik çizimler ve mekanik parçalar" fill priority sizes="(max-width: 900px) 100vw, 46vw" />
            <div className={styles.visualShade} />
          </div>
          <div className={`${styles.dataCard} ${styles.dataCardTop}`}>
            <small>Aktif araç</small><strong>Metrik diş</strong><span>M8 × 1,25</span>
          </div>
          <div className={`${styles.dataCard} ${styles.dataCardRight}`}>
            <small>Kılavuz matkap</small><strong>Ø6,8 mm</strong><span className={styles.dataStatus}>Standart değer</span>
          </div>
          <div className={`${styles.dataCard} ${styles.dataCardBottom}`}>
            <div><small>Çalışma durumu</small><strong>Hesap doğrulandı</strong></div>
            <ShieldCheck size={27} color="var(--success)" />
          </div>
        </div>
      </section>

      <PersonalToolShelf />

      <section className={`td-container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div><span className={styles.sectionLabel}>HIZLI ARAÇ RAFI</span><h2>En sık kullanılan teknik hesaplar</h2><p>Gereksiz adım olmadan girdiye, sonuca ve uygulama notuna ulaş.</p></div>
          <Link href="/araclar" className={styles.textLink}>Tüm araçlar <ArrowRight size={15} /></Link>
        </div>
        <div className={styles.toolsGrid}>{featuredTools.map((tool) => <ToolCard tool={tool} key={tool.slug} />)}</div>
      </section>

      <section className={`td-container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div><span className={styles.sectionLabel}>KONUYA GÖRE</span><h2>Çalışma alanını seç</h2><p>Makine, elektrik, yapı, üretim ve süreç hesapları aynı tasarım sistemiyle düzenlendi.</p></div>
        </div>
        <div className={styles.categoriesGrid}>{indexableCategories.map((category) => <CategoryCard category={category} key={category.id} />)}</div>
      </section>

      <section className={`td-container ${styles.section}`}>
        <div className={styles.sectionHead}>
          <div><span className={styles.sectionLabel}>DOĞRUDAN ÇÖZÜM</span><h2>Aranan terimden doğru hesaba geç</h2><p>Genel içerik yerine, kullanıcının teknik sorusunu çözen araca doğrudan ulaş.</p></div>
        </div>
        <div className={styles.intentGrid}>
          {searchedSolutions.map((item) => (
            <Link href={item.href} className={styles.intentCard} key={`${item.query}-${item.href}`}>
              <span>{item.query}</span><strong>{item.answer}</strong><b><ArrowRight size={15} /></b>
            </Link>
          ))}
        </div>
      </section>

      <section className={`td-container ${styles.workspace}`}>
        <div className={styles.workspaceVisual}>
          <Image src="/visuals/topics/tool-software.webp" alt="TooldurCAD ve dijital mühendislik çalışma alanı" fill sizes="(max-width: 900px) 100vw, 52vw" />
        </div>
        <div className={styles.workspaceCopy}>
          <span className={styles.sectionLabel}>HESAPTAN CAD'E</span>
          <h2>Teknik iş akışını aynı ekosistemde sürdür.</h2>
          <p>TooldurCAD, hesap geçmişi, teknik rehberler ve proje alanı ile sonucu tasarım sürecine bağlar.</p>
          <div className={styles.stepList}>
            {workflowSteps.map((step) => <div key={step}><CheckCircle2 size={17} /><span>{step}</span></div>)}
          </div>
          <div className={styles.workspaceActions}>
            <Link href="/kurulum-indir" className={`${styles.button} ${styles.buttonPrimary}`}><Zap size={16} /> TooldurCAD sayfası</Link>
            <Link href="/blog" className={styles.button}><BookOpen size={16} /> Teknik rehberler</Link>
          </div>
        </div>
      </section>

      <section className={`td-container ${styles.finalCta}`}>
        <div><span className={styles.sectionLabel}>HESABI BİLİYORSAN</span><h2>Arama kutusundan doğrudan çalışma alanına geç.</h2><p>Metrik diş, sac büküm, tolerans, pompa, donatı, tork veya kablo kesiti gibi terimleri yaz.</p></div>
        <Link href="/araclar" className={`${styles.button} ${styles.buttonPrimary}`}><Search size={16} /> Araç ara</Link>
      </section>
    </main>
  );
}
