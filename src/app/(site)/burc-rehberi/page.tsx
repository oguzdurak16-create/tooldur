import type { Metadata } from 'next';
import Link from 'next/link';
import { bushingBlogPosts, bushingGuidePath, bushingSources } from '@/data/bushingGuides';

const title = 'Ağır Yük Burcu Seçimi | PAP, PTFE, Bronz ve Polimer';
const description = 'Yağlamasız ve salınımlı mafsallar için teknik burç seçimi. PAP, PTFE, POM, bronz ve polimeri karşılaştırın, yüzey basıncını ve çalışma boşluğunu hesaplayın.';

export const metadata: Metadata = {
  title: { absolute: title + ' | Tooldur' },
  description,
  alternates: { canonical: bushingGuidePath },
  openGraph: { title, description, url: bushingGuidePath, type: 'website', locale: 'tr_TR' },
};

const materials = [
  ['Çelik sırtlı PTFE kompozit', 'İnce cidar ve kuru kayma gereken mafsallar', 'Ürün koduna özgü dinamik yük, PV, mil yüzeyi ve yuva rijitliği'],
  ['POM kompozit', 'İlk yağlamanın uygulanabildiği çalışma düzenleri', 'İlk yağlama ve bakım şartı, sıcaklık ve izin verilen boşluk'],
  ['Katı yağlayıcılı bronz', 'Düşük hızda yük taşıyan ve gövde ölçüsü buna elveren mafsallar', 'Ürün serisine özgü yük, salınım stroku ve yağlayıcı ceplerinin düzeni'],
  ['Katı polimer', 'Korozyon ve kuru çalışma şartları için uygun polimer kaliteleri', 'Sıcaklıkta yük sınırı, süreye bağlı deformasyon ve montaj sonrası çap'],
];

export default function BushingGuidePage() {
  return <main className="td-container py-10 space-y-10">
    <header className="max-w-3xl space-y-3">
      <nav aria-label="Sayfa yolu" className="calc-prose flex gap-2 flex-wrap">
        <Link href="/">Ana sayfa</Link><span aria-hidden="true">/</span>
        <Link href="/kategori/makine">Makine & Mekanik</Link><span aria-hidden="true">/</span>
        <span aria-current="page">Burç rehberi</span>
      </nav>
      <h1 className="text-4xl sm:text-5xl font-extrabold">Ağır yük burcu seçimi</h1>
      <p className="calc-prose text-lg">Yağlamasız veya salınımlı bir mafsalda burç seçimine tek burca gelen kuvvet, iç çap ve etkili boy ile başlayın. Katalog karşılaştırması için yükün hangi hızda ve sıcaklıkta oluştuğunu belirleyin.</p>
    </header>

    <section aria-labelledby="burc-tools" className="space-y-3">
      <h2 id="burc-tools" className="text-2xl font-bold">Burç hesaplama araçları</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link className="calc-panel block rounded-xl p-5" href="/arac/burc-yuzey-basinci-pv-hesaplama">
          <strong className="block text-lg">Yüzey basıncı ve PV</strong><span className="calc-prose">Radyal yük, çap ve boydan MPa hesabı. Dönme veya salınımda kayma hızı ve PV.</span>
        </Link>
        <Link className="calc-panel block rounded-xl p-5" href="/arac/burc-mil-boslugu-hesaplama">
          <strong className="block text-lg">Burç–mil çalışma boşluğu</strong><span className="calc-prose">Pres sonrası iç çap ve mil çapından en küçük ve en büyük çap boşluğu.</span>
        </Link>
      </div>
    </section>

    <section className="space-y-3" aria-labelledby="burc-materials">
      <h2 id="burc-materials" className="text-2xl font-bold">Burç malzemeleri ve kullanım koşulları</h2>
      <div className="calc-panel overflow-x-auto rounded-xl" role="region" aria-label="Burç malzemeleri tablosu" tabIndex={0}>
        <table className="w-full text-left min-w-[36rem]">
          <thead><tr className="border-b border-[var(--border)]">
            <th scope="col" className="p-3">Aile</th><th scope="col" className="p-3">Nerede değerlendirilir?</th><th scope="col" className="p-3">Katalogda ne kontrol edilir?</th>
          </tr></thead>
          <tbody>{materials.map(([family, use, check]) => <tr key={family} className="border-b last:border-0 border-[var(--border)]">
            <th scope="row" className="p-3">{family}</th><td className="p-3">{use}</td><td className="p-3">{check}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section className="space-y-3 max-w-3xl" aria-labelledby="burc-example">
      <h2 id="burc-example" className="text-2xl font-bold">Ø20 mm milde 5 ton-kuvvet örneği</h2>
      <p className="calc-prose">Tek burç, Ø20 mm iç çap ve 20 mm etkili boy ile 49.033 N / (20 × 20) = <strong>122,6 MPa</strong> nominal radyal basınç oluşur. Ø22 mm dış çap gövdeye montajı tarif eder. Kenar yüküne yol açan mil eğilmesi ve eksen kaçıklığı ayrıca değerlendirilir.</p>
      <p className="calc-prose">Örneğin GGB, DU® için 250 MPa statik, 140 MPa dinamik ve kuru çalışmada 1,8 MPa·m/s üst sınırlarını listeler. Bunlar belirli ürüne ait ayrı sınır değerleridir. Aynı anda kullanılabilecek bir çalışma noktası veya iki yıl ömür garantisi oluşturmaz.</p>
    </section>

    <section className="space-y-3" aria-labelledby="burc-articles">
      <h2 id="burc-articles" className="text-2xl font-bold">Teknik yazılar</h2>
      <div className="grid gap-3 sm:grid-cols-2">{bushingBlogPosts.map(post =>
        <Link key={post.slug} className="calc-panel block rounded-xl p-5" href={'/blog/' + post.slug}>
          <strong className="block text-lg">{post.title}</strong><span className="calc-prose">{post.description}</span>
        </Link>)}</div>
    </section>

    <section className="space-y-3" aria-labelledby="burc-sources">
      <h2 id="burc-sources" className="text-2xl font-bold">Üretici kaynakları</h2>
      <ul className="list-disc pl-5 space-y-1">{Object.values(bushingSources).map(source =>
        <li key={source.href}><a className="underline underline-offset-4" href={source.href}>{source.label}</a></li>)}</ul>
    </section>
  </main>;
}
