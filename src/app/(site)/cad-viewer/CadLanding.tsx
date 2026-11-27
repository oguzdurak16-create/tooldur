import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE_URL } from '@/lib/siteLanguage';
import CadViewer from './CadViewer';
import type { CadLocale } from './cad-copy';
import styles from './CadViewer.module.css';

export const cadPaths = { tr: '/cad-viewer', en: '/en/cad-viewer' } as const;
export const cadAlternates = { ...cadPaths, 'x-default': cadPaths.tr };

const landing = {
  tr: {
    title: 'Ücretsiz DWG ve STEP Görüntüleyici | Çizimden Ölçü Al',
    description: 'DWG, STEP ve STP CAD dosyalarını tarayıcıda aç. İki nokta arasındaki mesafeyi ölç, model boyutlarını gör. Dosyalar cihazında işlenir.',
    heading: 'DWG ve STEP görüntüleyici',
    intro: 'DWG çizimlerini ve STEP modellerini tarayıcıda aç, yakınlaştır ve iki nokta arasındaki mesafeyi ölç. Kayıt veya kurulum gerekmez.',
    related: 'İlgili araçlar', tools: 'Tüm mühendislik araçları', sheet: 'Sac yerleşim hesabı', licenses: 'Görüntüleyici kaynakları ve lisanslar',
    locale: 'tr_TR', imageAlt: 'Tooldur DWG ve STEP görüntüleyici',
    sections: [
      { title: 'DWG veya STEP dosyası nasıl açılır?', body: 'Dosya aç düğmesine bas veya çizimini görüntüleyiciye sürükle. 35 MB’a kadar .dwg, .step ve .stp dosyaları desteklenir. Görüntüleyici WebGL 2 ile çalışır. Dosyan sunucuya yüklenmeden cihazında işlenir.' },
      { title: 'Çizimden nasıl ölçü alınır?', body: 'Mesafe ölç düğmesini aç ve çizimde iki nokta seç. İşaretçi yakın bir köşeyi yakalarsa ölçüm o köşeye oturur. Araç toplam mesafeyi, X, Y ve Z yönlerindeki farkları ve modelin dış ölçülerini gösterir.' },
      { title: 'DWG ve STEP ölçü birimleri', body: 'STEP modelleri milimetreye çevrilerek 3B açılır. DWG dosyasının birimi okunabiliyorsa otomatik seçilir. Birimsiz DWG’de doğru çizim birimini seçtikten sonra sonuç milimetreye çevrilir.' },
      { title: 'Görüntüleme ve ölçüm kapsamı', body: 'DWG görüntüsü model alanındaki çizgi, yay, daire, elips, çoklu çizgi ve desteklenen blokları kapsar. Paftalar, yazılar, ölçü anotasyonları ve bazı özel nesneler görünmeyebilir. STEP eğri yüzeylerindeki mesafeler, görüntülenen yüzey ağına dayalı yaklaşık değerlerdir.' },
    ],
  },
  en: {
    title: 'Free Online DWG & STEP Viewer | Measure CAD Files',
    description: 'Open DWG, STEP and STP files in your browser. Measure point-to-point distances and view model dimensions. Files stay on your device.',
    heading: 'Online DWG and STEP viewer',
    intro: 'Open DWG drawings and 3D STEP models in your browser. Zoom, pan and measure distances between two points without an account or installation.',
    related: 'Related tools', tools: 'Engineering calculators', sheet: 'Sheet layout calculator (Turkish)', licenses: 'Viewer source and licenses',
    locale: 'en_US', imageAlt: 'Tooldur online DWG and STEP viewer',
    sections: [
      { title: 'How to open a DWG or STEP file', body: 'Choose Open file or drop your drawing onto the viewer. It supports .dwg, .step and .stp files up to 35 MB. The viewer requires WebGL 2 and processes your file locally in the browser.' },
      { title: 'How to measure a CAD drawing', body: 'Select Measure distance and click two points in the drawing. A click near a supported corner snaps to that corner. The viewer reports the point-to-point distance, X, Y and Z offsets, and the overall dimensions of the model.' },
      { title: 'DWG and STEP measurement units', body: 'STEP models open in 3D with dimensions converted to millimeters. For DWG files, the viewer uses the drawing units when available. For a unitless DWG, select the unit used to draw the file before reading measurements in millimeters.' },
      { title: 'Supported geometry and measurement accuracy', body: 'DWG model space supports lines, arcs, circles, ellipses, polylines and supported blocks. Layouts, text, dimension annotations and some special entities may be omitted. Measurements on curved STEP surfaces are approximate because they use the displayed mesh.' },
    ],
  },
} as const;

export function cadMetadata(locale: CadLocale): Metadata {
  const copy = landing[locale];
  const url = cadPaths[locale];
  const image = { url: '/cad-viewer/og', width: 1200, height: 630, alt: copy.imageAlt };
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: url, languages: cadAlternates },
    robots: { index: true, follow: true },
    openGraph: { title: copy.title, description: copy.description, url, type: 'website', locale: copy.locale, images: [image] },
    twitter: { card: 'summary_large_image', title: copy.title, description: copy.description, images: [image] },
  };
}

export default function CadLanding({ locale }: { locale: CadLocale }) {
  const copy = landing[locale];
  const alternative = locale === 'tr' ? 'en' : 'tr';
  const url = BASE_URL + cadPaths[locale];
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: copy.heading,
    description: copy.description,
    url,
    inLanguage: locale,
    isAccessibleForFree: true,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'JavaScript and WebGL 2',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'TRY' },
    publisher: { '@type': 'Organization', name: 'Tooldur', url: BASE_URL },
  };
  return (
    <main className={styles.page} lang={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className={styles.intro}>
        <Link className={styles.languageLink} href={cadPaths[alternative]} hrefLang={alternative} lang={alternative}>{locale === 'tr' ? 'English' : 'Türkçe'}</Link>
        <h1>{copy.heading}</h1>
        <p>{copy.intro}</p>
      </div>
      <CadViewer locale={locale} />
      <div className={styles.details}>
        {copy.sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
        <nav aria-label={copy.related}>
          <Link href={locale === 'tr' ? '/araclar' : '/en/tools'}>{copy.tools}</Link>
          <Link href="/arac/sac-yerlesim-hesaplama">{copy.sheet}</Link>
          <Link href={locale === 'tr' ? '/kurulum-indir' : '/en/tooldurcad'}>TooldurCAD</Link>
          <a href="/cad-engine/NOTICE.txt">{copy.licenses}</a>
        </nav>
      </div>
    </main>
  );
}
