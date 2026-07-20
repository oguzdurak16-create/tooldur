import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Yol Haritası',
  description: 'Tooldur için planlanan mühendislik araçları, TooldurCAD geliştirmeleri ve proje yönetimi özellikleri.',
  alternates: { canonical: '/yol-haritasi' },
};

const roadmap = [
  { title: 'Hesap sonucu → projeye bağlama', status: 'Devam ediyor', items: ['Araç sayfalarından proje yönetimine not aktarma', 'Hesap geçmişiyle proje kayıtlarını ilişkilendirme', 'Proje içinde teknik not listesi'] },
  { title: 'PDF teknik çıktı', status: 'İlk sürüm aktif', items: ['Sayfa yazdırma/PDF çıktısı', 'Tooldur başlıklı teknik rapor görünümü', 'İleride özel PDF şablonları'] },
  { title: 'Yeni mühendislik tabloları', status: 'Planlandı', items: ['H7/H8 tolerans tabloları', 'Kama ölçü tabloları', 'Kılavuz matkap çapı tabloları', 'Cıvata tork ve yüzey pürüzlülüğü tabloları'] },
  { title: 'TooldurCAD entegrasyonu', status: 'Planlandı', items: ['Masaüstü hesap sonucunu Tooldur hesabına kaydetme', 'Sürüm kontrol sayfası', 'Kurulum ve hata bildirim akışı'] },
];

export default function YolHaritasiPage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '38px 0 80px' }}>
      <div className="td-container">
        <section style={{ border:'1px solid var(--border)', borderRadius:24, padding:24, background:'linear-gradient(135deg,rgba(17,24,39,.94),rgba(15,23,42,.72))' }}>
          <span style={{ color:'var(--amber)', fontWeight:900, fontSize:12 }}>GELİŞTİRME PLANI</span>
          <h1 style={{ color: 'var(--ink)', fontSize: 'clamp(32px,4vw,54px)', letterSpacing: '-.05em', margin: '8px 0' }}>Tooldur Yol Haritası</h1>
          <p style={{ color: 'var(--ink-4)', maxWidth: 760, lineHeight: 1.7 }}>Hedef; hesaplama araçlarını, teknik çizim çağrılarını, TooldurCAD’i ve proje yönetimini tek mühendislik çalışma alanında toplamak.</p>
          <Link href="/bizi-destekle" style={{ display:'inline-flex', marginTop:16, color:'#0b1220', background:'var(--amber)', padding:'11px 16px', borderRadius:14, textDecoration:'none', fontWeight:900 }}>Gelişimi destekle</Link>
        </section>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:14, marginTop:18 }}>
          {roadmap.map((item) => (
            <article key={item.title} style={{ border:'1px solid var(--border)', borderRadius:20, padding:18, background:'var(--bg-card)' }}>
              <span style={{ color:'var(--amber)', fontSize:12, fontWeight:900 }}>{item.status}</span>
              <h2 style={{ color:'var(--ink)', fontSize:20, margin:'8px 0 10px' }}>{item.title}</h2>
              <ul style={{ color:'var(--ink-4)', lineHeight:1.7, margin:0, paddingLeft:18 }}>{item.items.map((i)=><li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
