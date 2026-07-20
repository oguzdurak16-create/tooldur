import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sürüm Notları',
  description: 'Tooldur ve TooldurCAD için güncel sürüm notları, yeni özellikler ve geliştirme kayıtları.',
  alternates: { canonical: '/surum-notlari' },
};

const versions = [
  {
    version: 'v1.0.3',
    title: 'TooldurCAD v1.0.3 kurulum dosyaları güncellemesi',
    date: 'Haziran 2026',
    items: ['SolidWorks kurulum paketi v1.0.3 dosyasına yönlendirildi.', 'Universal Lite kurulum paketi v1.0.3 dosyasına yönlendirildi.', 'Kurulum sayfasındaki dosya adları, boyut ve tarih bilgileri güncellendi.', 'Üyelere özel kısa süreli indirme linki akışı korundu.'],
  },
  {
    version: 'v18',
    title: 'Çalışma alanı, proje kaydı ve teknik çağrı kütüphanesi',
    date: 'Mayıs 2026',
    items: ['Araç sayfalarına geçmişe kaydet, projeye aktar ve PDF/yazdır aksiyonları eklendi.', 'Teknik çağrı kütüphanesi ayrı sayfa olarak hazırlandı.', 'Roadmap ve sürüm notları sayfaları oluşturuldu.', 'Blog tarafına yeni SEO odaklı mühendislik yazıları eklendi.'],
  },
  {
    version: 'v17',
    title: 'Blog ve SEO altyapısı',
    date: 'Mayıs 2026',
    items: ['Blog ana sayfası eklendi.', 'İlk mühendislik blog yazıları yayına hazırlandı.', 'Blog yazıları sitemap içine alındı.', 'Article ve FAQ schema yapısı oluşturuldu.'],
  },
];

export default function SurumNotlariPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '38px 0 80px' }}>
      <div className="td-container">
        <h1 style={{ color: 'var(--ink)', fontSize: 'clamp(32px,4vw,54px)', letterSpacing: '-.05em', margin: 0 }}>Sürüm Notları</h1>
        <p style={{ color: 'var(--ink-4)', maxWidth: 720, lineHeight: 1.7 }}>Tooldur, TooldurCAD ve proje yönetimi özelliklerinde yapılan önemli güncellemeler.</p>
        <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
          {versions.map((v) => (
            <article key={v.version} style={{ border: '1px solid var(--border)', borderRadius: 22, padding: 20, background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <strong style={{ color: 'var(--amber)', fontSize: 13 }}>{v.version}</strong>
                <span style={{ color: 'var(--ink-4)', fontSize: 13 }}>{v.date}</span>
              </div>
              <h2 style={{ color: 'var(--ink)', margin: '10px 0', fontSize: 22 }}>{v.title}</h2>
              <ul style={{ color: 'var(--ink-3)', lineHeight: 1.75, margin: 0, paddingLeft: 18 }}>{v.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </div>
        <Link href="/kurulum-indir" style={{ display:'inline-flex', marginTop: 22, color:'var(--amber)', fontWeight:900 }}>TooldurCAD indirme sayfasına git →</Link>
      </div>
    </main>
  );
}
