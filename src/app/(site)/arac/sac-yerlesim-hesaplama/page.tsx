import type { Metadata } from 'next';
import Link from 'next/link';
import { BASE_URL } from '@/lib/siteLanguage';
import SheetLayoutCalculator from './SheetLayoutCalculator';
import styles from './SheetLayout.module.css';

const title = 'Sac Yerleşim Hesaplama | Bir Plakadan Kaç Parça Çıkar?';
const description = 'Dikdörtgen sac parçaları için düz ve 90° yerleşimi karşılaştırın. Kenar payı ve parça aralığıyla plaka adedini, sac kullanım oranını ve malzeme maliyetini hesaplayın.';
const url = BASE_URL + '/arac/sac-yerlesim-hesaplama';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
  openGraph: { title, description, url, type: 'website' },
};

export default function SheetLayoutPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Sac Yerleşim Hesaplama',
    url,
    description,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'TRY' },
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <header className={styles.header}>
        <h1>Sac yerleşim hesaplama</h1>
        <p>{description}</p>
      </header>
      <SheetLayoutCalculator />
      <section className={styles.guide} aria-labelledby="method">
        <h2 id="method">Bir plakadan kaç parça çıkar?</h2>
        <p>Her kenardaki payı plaka ölçüsünden düş. Her eksendeki parça sayısını bulmak için boşluk eklenmiş kullanılabilir ölçüyü parça ölçüsü ve boşluk toplamına böl, sonucu aşağı yuvarla. Parça aralığı yalnızca yan yana gelen iki parça arasında uygulanır.</p>
        <p>Örneğin 1.500 × 3.500 mm plakaya, her kenarda 5 mm pay ve parçalar arasında 3 mm aralıkla 423,71 × 553,36 mm ölçüsünde <strong>18 parça</strong> yerleşir. Tüm parçalar 90° döndürülürse <strong>16 parça</strong> yerleşir.</p>
        <h2>Fire ve sipariş maliyeti</h2>
        <p>Plaka verimi, dolu plakadaki net parça alanının toplam plaka alanına oranıdır. Sipariş firesi son plaka eksik dolduğunda artabilir. Malzeme bedeli satın alınan tam plakalar üzerinden hesaplanır. Artan sacın yeniden kullanım değeri, kesim işçiliği ve KDV maliyete girmez.</p>
        <p>Bu hesap eş ölçüdeki dikdörtgenleri tek yönde sıralar. Aynı plakada yönleri karıştıran yerleşimler, farklı geometriler, lif yönü ve makinenin kesim koşulları için ayrıca kontrol gerekir.</p>
        <nav className={styles.links} aria-label="İlgili sac hesapları">
          <Link href="/cad-viewer">DWG ve STEP çiziminden ölçü al</Link>
          <Link href="/arac/levha-agirlik-hesaplama">Sac ağırlık hesabı</Link>
          <Link href="/arac/sac-bukum-kesim-hesaplayici">Sac büküm ve kesim hesabı</Link>
        </nav>
      </section>
    </main>
  );
}
