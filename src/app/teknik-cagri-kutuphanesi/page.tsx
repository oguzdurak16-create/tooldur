import type { Metadata } from 'next';
import Link from 'next/link';
import { ClipboardList, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Teknik Çizim Çağrı Kütüphanesi',
  description: 'Makine teknik resimleri için tolerans, yüzey pürüzlülüğü, kaynak, kaplama, ısıl işlem ve montaj notu örnekleri.',
  alternates: { canonical: '/teknik-cagri-kutuphanesi' },
};

const callouts = [
  { title: 'Genel tolerans notu', tag: 'Tolerans', text: 'Belirtilmeyen ölçüler için genel tolerans ISO 2768-mK kabul edilecektir. Kritik ölçüler teknik resim üzerinde ayrıca belirtilmiştir.' },
  { title: 'Yüzey pürüzlülüğü notu', tag: 'Yüzey', text: 'İşlenmiş yüzeylerde Ra 3.2, yataklama ve sızdırmazlık yüzeylerinde Ra 1.6 değeri hedeflenecektir. Çapak ve keskin köşe bırakılmayacaktır.' },
  { title: 'Kama kanalı çağrısı', tag: 'Kama', text: 'Kama kanalı ölçüleri ilgili mil çapına göre seçilecektir. Kanal yanakları çapaksız olacak, montaj sonrası kama boşluğu ve vuruntu kontrol edilecektir.' },
  { title: 'Rulman yatağı notu', tag: 'Rulman', text: 'Rulman oturma yüzeylerinde ölçü, eşmerkezlilik ve yüzey kalitesi birlikte kontrol edilecektir. Tolerans seçimi rulman tipi ve yük karakterine göre doğrulanacaktır.' },
  { title: 'Kaynak imalat notu', tag: 'Kaynak', text: 'Kaynak bölgeleri çapak, cüruf ve sıçrantıdan temizlenecektir. Kaynak sonrası parça çarpılma ve ölçü kontrolünden geçirilecektir.' },
  { title: 'Kaplama / boya notu', tag: 'Kaplama', text: 'Kaplama veya boya uygulanacak yüzeylerde maskeleme bölgeleri teknik resme göre korunacaktır. Kaplama kalınlığı montaj boşluklarını etkilemeyecek şekilde kontrol edilecektir.' },
  { title: 'Isıl işlem notu', tag: 'Isıl işlem', text: 'Isıl işlem uygulanacak parçalar işlem sonrası sertlik, çatlak ve ölçü değişimi yönünden kontrol edilecektir. Nihai işleme payı süreç planına göre bırakılmalıdır.' },
  { title: 'Montaj kontrol notu', tag: 'Montaj', text: 'Montaj öncesi temas yüzeyleri temizlenecek, bağlantı elemanları uygun torkla sıkılacak ve hareketli parçalar serbest çalışma yönünden kontrol edilecektir.' },
  { title: 'Diş / kılavuz notu', tag: 'Diş', text: 'Kılavuz çekilen deliklerde diş başlangıcı çapaksız olacaktır. Kör deliklerde etkin diş boyu ve talaş boşluğu ayrıca kontrol edilecektir.' },
  { title: 'Keskin köşe notu', tag: 'İmalat', text: 'Aksi belirtilmedikçe keskin köşeler kırılacak, çapak alınacak ve montajı engelleyecek yüzey bozukluğu bırakılmayacaktır.' },
];

export default function TeknikCagriKutuphanePage() {
  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '34px 0 80px' }}>
      <div className="td-container">
        <section style={{ border: '1px solid var(--border)', borderRadius: 26, padding: '28px', background: 'linear-gradient(135deg,rgba(17,24,39,.94),rgba(15,23,42,.74))', marginBottom: 22 }}>
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--amber)', background: 'rgba(255,177,27,.08)', border: '1px solid rgba(255,177,27,.20)', borderRadius: 999, padding: '7px 11px', fontSize: 12, fontWeight: 900, marginBottom: 16 }}>
            <ClipboardList size={15} /> Teknik çizim kütüphanesi
          </div>
          <h1 style={{ margin: 0, color: 'var(--ink)', fontSize: 'clamp(30px,4vw,52px)', lineHeight: 1, letterSpacing: '-.05em', fontWeight: 950 }}>Teknik Çağrı Kütüphanesi</h1>
          <p style={{ color: 'var(--ink-4)', lineHeight: 1.7, maxWidth: 760, marginTop: 14 }}>
            Teknik resim, imalat notu, tolerans açıklaması ve montaj kontrolü için sık kullanılan çağrı metinleri. Metinleri kopyalayıp teknik resme, üretim notuna veya proje kaydına ekleyebilirsin.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <Link href="/arac/teknik-resim-cagri-olusturucu" className="td-workspace-action primary" style={{ minHeight: 46, width: 'max-content' }}>Çağrı oluşturucuya git <ArrowRight size={17} /></Link>
            <Link href="/dashboard/cizim" className="td-workspace-action" style={{ minHeight: 46, width: 'max-content' }}>Çizim panelini aç</Link>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14 }}>
          {callouts.map((item) => (
            <article key={item.title} style={{ border: '1px solid var(--border)', borderRadius: 20, padding: 18, background: 'var(--bg-card)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--amber)', fontSize: 11, fontWeight: 900, marginBottom: 10 }}><CheckCircle2 size={14} />{item.tag}</span>
              <h2 style={{ color: 'var(--ink)', fontSize: 18, margin: '0 0 9px', fontWeight: 900 }}>{item.title}</h2>
              <p style={{ color: 'var(--ink-4)', lineHeight: 1.65, margin: 0, fontSize: 14 }}>{item.text}</p>
              <textarea readOnly value={item.text} style={{ width: '100%', marginTop: 12, minHeight: 86, resize: 'vertical', borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(8,13,24,.52)', color: 'var(--ink-2)', padding: 12, fontSize: 12, lineHeight: 1.45 }} />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
