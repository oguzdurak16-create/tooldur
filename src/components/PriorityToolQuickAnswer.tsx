import Link from 'next/link';

type QuickAnswer = {
  eyebrow: string;
  title: string;
  lead: string;
  rows: Array<{ label: string; value: string; note?: string }>;
  links: Array<{ href: string; label: string }>;
};

const quickAnswers: Record<string, QuickAnswer> = {
  'kilavuz-matkap-hesaplama': {
    eyebrow: 'Atölye hızlı tablosu',
    title: 'Metrik diş ve kılavuz matkap için hızlı cevaplar',
    lead: 'Standart kaba hatvede ön delik çapı için pratik başlangıç değeri nominal çap eksi hatvedir. Nihai seçimde malzeme, diş yüzdesi ve kılavuz üreticisinin verisi kontrol edilmelidir.',
    rows: [
      { label: 'M6 × 1,0', value: 'Ø5,0 mm', note: 'Standart kaba hatve' },
      { label: 'M8 × 1,25', value: 'Ø6,8 mm', note: 'En sık kullanılan M8 ön delik' },
      { label: 'M10 × 1,5', value: 'Ø8,5 mm', note: 'Standart M10 kaba hatve' },
      { label: 'M12 × 1,75', value: 'Ø10,2 mm', note: 'Standart M12 kaba hatve' },
    ],
    links: [
      { href: '/arac/civata-sikma-torku-hesaplama', label: 'Cıvata sıkma torkunu hesapla' },
      { href: '/arac/teknik-resim-cagri-olusturucu', label: 'Teknik resim çağrısı oluştur' },
    ],
  },
  'iso-gecme-tolerans-hesaplama': {
    eyebrow: 'Geçme seçimi özeti',
    title: 'H7 geçmelerini hızlı yorumla',
    lead: 'Aynı nominal çapta delik ve mil tolerans sınıfları montajın boşluklu, geçiş veya sıkı karakterini değiştirir. Aşağıdaki eşleştirmeler hızlı başlangıç içindir.',
    rows: [
      { label: 'H7/h6', value: 'Hassas boşluklu', note: 'Genel merkezleme ve sökülebilir montaj' },
      { label: 'H7/g6', value: 'Kayan geçme', note: 'Rahat hareket ve düşük zorlanma' },
      { label: 'H7/k6', value: 'Geçiş geçmesi', note: 'İyi merkezleme, kontrollü montaj' },
      { label: 'H7/m6', value: 'Sıkı / geçiş', note: 'Yük ve moment aktarımı olan uygulamalar' },
    ],
    links: [
      { href: '/arac/kama-kanali-hesaplama', label: 'Kama kanalı ölçüsüne geç' },
      { href: '/arac/yuzey-puruzlulugu-rehberi', label: 'Yüzey pürüzlülüğü rehberini aç' },
    ],
  },
  'sac-bukum-acinim-hesaplama': {
    eyebrow: 'Abkant ön kontrolü',
    title: 'Açınım hesabında önce bu dört değeri sabitle',
    lead: 'Düz boy hesabı yalnız açıyı değil, gerçek iç radiusu ve atölyede kullandığın büküm karakterini de ister. Seri üretimde en güvenilir K faktörü, deneme parçasından türetilen kendi büküm tablonundur.',
    rows: [
      { label: 'Sac kalınlığı', value: 't', note: 'Malzeme sertifikasındaki gerçek kalınlık tercih edilir' },
      { label: 'İç radius', value: 'Ri', note: 'Punch ucu ve V açıklığı sonucu etkiler' },
      { label: 'Büküm açısı', value: 'θ', note: 'İç/dış açı tanımını sabitle' },
      { label: 'K faktörü', value: 'K', note: 'Numune bükümle kalibre edilmelidir' },
    ],
    links: [
      { href: '/arac/sac-bukum-kesim-hesaplayici', label: 'V kalıp ve tonaj hesabına geç' },
      { href: '/arac/levha-agirlik-hesaplama', label: 'Sac ağırlığını hesapla' },
    ],
  },
  'sac-bukum-kesim-hesaplayici': {
    eyebrow: 'V kalıp ve tonaj ön seçimi',
    title: 'Abkant hesabında tek tonaj sonucu yeterli değildir',
    lead: 'Air bending için V açıklığı, doğal iç radius, minimum flanş ve çizgisel takım yükü birlikte kontrol edilmelidir. Aynı toplam tonaj, farklı büküm boyunda takım açısından bambaşka yük oluşturabilir.',
    rows: [
      { label: 'V kalıp başlangıcı', value: 'yaklaşık 6t–12t', note: 'Malzeme ve yöntemle değişir' },
      { label: 'Minimum flanş', value: 'yaklaşık 0,7V', note: 'Kalıp omuzlarına güvenli oturma için' },
      { label: 'Takım kontrolü', value: 'ton/m', note: 'Makinenin toplam tonajından ayrı değerlendirilir' },
      { label: 'Kesme boşluğu', value: 'malzemeye bağlı', note: 'Kalınlık, mukavemet ve kesim kalitesi belirler' },
    ],
    links: [
      { href: '/arac/sac-bukum-acinim-hesaplama', label: 'Açınım ve K faktörü hesabını aç' },
      { href: '/arac/levha-agirlik-hesaplama', label: 'Plaka ağırlığı ve sevkiyat hesabı' },
    ],
  },
  'levha-agirlik-hesaplama': {
    eyebrow: 'Hızlı sac ağırlık kontrolü',
    title: '1 m² sacın ağırlığını hızlıca bul',
    lead: 'Düz levha için ağırlık, alan × kalınlık × yoğunluk ile hesaplanır. Çelik yoğunluğu yaklaşık 7.850 kg/m³ alındığında 1 m² ve 1 mm çelik sac yaklaşık 7,85 kg gelir.',
    rows: [
      { label: '1 m², 1 mm çelik', value: '≈ 7,85 kg', note: 'Yoğunluk: 7.850 kg/m³' },
      { label: '1 m², 2 mm çelik', value: '≈ 15,70 kg', note: 'Düz karbon çeliği için' },
      { label: '1 m², 3 mm alüminyum', value: '≈ 8,10 kg', note: 'Yoğunluk: yaklaşık 2.700 kg/m³' },
      { label: 'Formül', value: 'en × boy × t × ρ', note: 'Bütün birimleri aynı sistemde kullan' },
    ],
    links: [
      { href: '/arac/baklavali-sac-agirlik-hesaplama', label: 'Baklavalı sac için hesapla' },
      { href: '/arac/sac-bukum-kesim-hesaplayici', label: 'Sac büküm ve kesim hesabına geç' },
    ],
  },
  'demir-agirligi-hesaplama': {
    eyebrow: 'Donatı hızlı tablosu',
    title: 'Donatı ağırlıkları için hızlı cevaplar',
    lead: 'Nervürlü inşaat demirinde teorik birim ağırlık yaklaşık d² / 162 bağıntısıyla bulunur. Toplam sipariş ve sevkiyat hesabında boy adedi, fire ve proje metrajı ayrıca kontrol edilmelidir.',
    rows: [
      { label: 'Ø8 donatı', value: '0,395 kg/m', note: '12 metre boy yaklaşık 4,74 kg' },
      { label: 'Ø12 donatı', value: '0,888 kg/m', note: '12 metre boy yaklaşık 10,66 kg' },
      { label: 'Ø16 donatı', value: '1,578 kg/m', note: '12 metre boy yaklaşık 18,94 kg' },
      { label: 'Pratik formül', value: 'd² / 162', note: 'd milimetre, sonuç kg/m' },
    ],
    links: [
      { href: '/arac/beton-miktari-hesaplama', label: 'Beton miktarını hesapla' },
      { href: '/arac/celik-profil-agirligi', label: 'Çelik profil ağırlığına geç' },
    ],
  },
  'konik-hesaplama': {
    eyebrow: 'Torna ve teknik resim',
    title: 'Konik ve torna derece hesabı için temel bağıntılar',
    lead: 'Konik parçada büyük çap D, küçük çap d ve eksenel boy L birbirine bağlıdır. Toplam koni açısı ile torna ayarında kullanılan yarım açı aynı değer değildir.',
    rows: [
      { label: 'Çap farkı', value: 'D − d', note: 'Aynı kesitte ölçülen çaplar' },
      { label: 'Koniklik', value: '(D − d) / L', note: 'Birim boydaki çap değişimi' },
      { label: '1:N oranı', value: 'N = L / (D − d)', note: 'Örn. 1:10' },
      { label: 'Yarım açı', value: 'atan((D − d) / 2L)', note: 'Torna üst kızak ayarında kullanılır' },
    ],
    links: [
      { href: '/arac/mil-mukavemet-hesaplama', label: 'Mil çapı ve mukavemet hesabı' },
      { href: '/arac/iso-gecme-tolerans-hesaplama', label: 'Mil-delik toleransını hesapla' },
    ],
  },
  'pompa-guc-hesaplama': {
    eyebrow: 'Pompa motor gücü ön hesabı',
    title: 'Dalgıç pompa hesabında debi ve basma yüksekliğini birlikte kontrol et',
    lead: 'Pompa gücü hesabında yalnız motor kW değeri yeterli değildir. Debi, toplam basma yüksekliği, sıvı yoğunluğu, boru kayıpları ve verim birlikte değerlendirilmelidir.',
    rows: [
      { label: 'Hidrolik güç', value: 'ρ × g × Q × H', note: 'Q m³/s ve H metre alınır' },
      { label: 'Motor gücü', value: 'Ph / η', note: 'Pompa ve motor verimleri hesaba katılır' },
      { label: 'Toplam basma', value: 'statik + kayıplar', note: 'Boru, dirsek, vana ve filtre kayıpları eklenir' },
      { label: 'Nihai seçim', value: 'pompa eğrisi', note: 'Çalışma noktası eğri üzerinde doğrulanır' },
    ],
    links: [
      { href: '/arac/reynolds-sayisi-hesaplama', label: 'Reynolds sayısı ve akış rejimi' },
      { href: '/arac/boru-eti-hesaplama', label: 'Basınçlı boru et kalınlığı' },
    ],
  },
};

export default function PriorityToolQuickAnswer({ slug }: { slug: string }) {
  const answer = quickAnswers[slug];
  if (!answer) return null;

  return (
    <section style={{ padding: '0 0 30px', background: 'var(--bg)' }} aria-label={`${answer.title} özeti`}>
      <div className="td-container">
        <div style={{ border: '1px solid var(--border)', borderRadius: 18, background: 'var(--bg-card)', padding: 'clamp(18px, 3vw, 26px)' }}>
          <div style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
            {answer.eyebrow}
          </div>
          <h2 style={{ color: 'var(--ink)', fontSize: 'clamp(21px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-.02em', margin: 0 }}>
            {answer.title}
          </h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 14.5, lineHeight: 1.75, margin: '10px 0 18px', maxWidth: 900 }}>
            {answer.lead}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            {answer.rows.map((row) => (
              <div key={row.label} style={{ border: '1px solid var(--border-dim)', borderRadius: 13, padding: 14, background: 'var(--bg-surface)' }}>
                <div style={{ color: 'var(--ink-4)', fontSize: 12, lineHeight: 1.35 }}>{row.label}</div>
                <div style={{ color: 'var(--ink)', fontWeight: 800, fontSize: 17, marginTop: 5 }}>{row.value}</div>
                {row.note && <div style={{ color: 'var(--ink-4)', fontSize: 11.5, lineHeight: 1.45, marginTop: 5 }}>{row.note}</div>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            {answer.links.map((link) => (
              <Link key={link.href} href={link.href} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 38, padding: '0 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--ink-2)', fontSize: 13, fontWeight: 750, textDecoration: 'none' }}>
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
