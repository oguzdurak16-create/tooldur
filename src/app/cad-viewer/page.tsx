import type { Metadata } from 'next';
import Link from 'next/link';
import CadViewer from './CadViewer';
import styles from './CadViewer.module.css';

const title = 'DWG ve STEP Viewer | Çizim Aç ve Ölçü Al';
const description = 'DWG çizim ve STEP model dosyalarını tarayıcıda aç. İki nokta arasını ölç, model boyutlarını gör ve dosyanı yüklemeden incele.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/cad-viewer' },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: '/cad-viewer', type: 'website' },
};

export default function CadViewerPage() {
  return (
    <main className={styles.page}>
      <div className={styles.intro}>
        <h1>DWG ve STEP görüntüleyici</h1>
        <p>Çizimi aç, yakınlaştır ve iki nokta arasındaki mesafeyi ölç. Dosyalar cihazında işlenir.</p>
      </div>
      <CadViewer />
      <section className={styles.details} aria-labelledby="cad-measure">
        <h2 id="cad-measure">Çizimden nasıl ölçü alınır?</h2>
        <p>Dosyanı seçtikten sonra <strong>Mesafe ölç</strong> düğmesine bas ve çizim üzerinde iki nokta seç. İşaretçi yakın bir köşe yakalarsa ölçüm o köşeye oturur. Sonuçta toplam mesafe ile üç eksendeki fark gösterilir.</p>
        <p>STEP modelleri 3B olarak ve milimetre cinsinden açılır. DWG görüntüsü model alanındaki çizgi, yay, daire, elips, çoklu çizgi ve desteklenen blokları gösterir. Yazılar, ölçü anotasyonları, pafta düzenleri ve bazı 3B DWG nesneleri görüntüye dahil olmayabilir.</p>
        <nav aria-label="İlgili araçlar">
          <Link href="/arac/sac-yerlesim-hesaplama">Sac yerleşim hesabı</Link>
          <Link href="/kurulum-indir">TooldurCAD</Link>
          <a href="/cad-engine/NOTICE.txt">Görüntüleyici kaynakları ve lisanslar</a>
        </nav>
      </section>
    </main>
  );
}
