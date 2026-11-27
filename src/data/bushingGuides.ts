import type { BlogPost } from './blogPosts';

export const bushingGuidePath = '/burc-rehberi';
export const bushingGuideDate = '2026-11-27';

export const bushingSources = {
  skf: {
    label: 'SKF — Kompozit kaymalı yatak kataloğu',
    href: 'https://cdn.skfmediahub.skf.com/api/public/0901d19680229dfc/pdf_preview_medium/0901d19680229dfc_pdf_preview_medium.pdf',
  },
  du: { label: 'GGB — DU® teknik verileri', href: 'https://www.ggbearings.com/en/our-products/metal-polymer-bearings/du' },
  bronze: {
    label: 'GGB — GGB-DB katı yağlayıcılı bronz kataloğu',
    href: 'https://www.ggbearings.com/sites/default/files/2022-04/GGB-DB-self-lubricating-bronze-bearing-solutions.pdf',
  },
  igus: { label: 'igus — Yüzey basıncı hesabı', href: 'https://www.igus.sg/plain-bearing/wiki/load' },
};

const guide = { label: 'Burç seçimi teknik rehberi', href: bushingGuidePath };
const loadTool = { label: 'Burç yüzey basıncı ve PV hesabı', href: '/arac/burc-yuzey-basinci-pv-hesaplama' };
const fitTool = { label: 'Burç–mil çalışma boşluğu hesabı', href: '/arac/burc-mil-boslugu-hesaplama' };

export const bushingBlogPosts: BlogPost[] = [
  {
    slug: 'pap-burc-olculeri-ptfe-pom-farki',
    title: 'PAP Burç Nedir? PTFE ve POM Farkı, Ölçü ve Montaj',
    description: 'PAP burçta iç çap, dış çap ve boy nasıl okunur? PTFE ve POM kayma katmanını, montaj sonrası iç çapı ve C45 mil yüzeyini katalogdan kontrol edin.',
    date: bushingGuideDate,
    readTime: '5 dk okuma',
    category: 'Makine Elemanları',
    keywords: ['PAP burç', 'burç ölçüleri', '20x22 burç', 'PTFE burç', 'POM burç', 'C45 mil', 'burç montajı'],
    relatedTools: [fitTool, guide, { label: 'ISO geçme toleransı', href: '/arac/iso-gecme-tolerans-hesaplama' }],
    intro: [
      'PAP ibaresi piyasada sarımlı silindirik kaymalı burçlarda görülür. Seçim için üreticiyi, tam ürün kodunu, ölçü tablosunu ve kayma katmanı tanımını birlikte isteyin. Benzer kodlar aynı yağlama koşuluna, yüzeye ve yük sınırlarına sahip olmayabilir.',
    ],
    sections: [
      {
        heading: 'Ø20 × Ø22 × 20 ölçüsü nasıl okunur?',
        body: ['İlk değer nominal iç çap, ikinci değer dış çap, son değer boydur. Bu geometride nominal et kalınlığı (22 − 20) / 2 = 1 mm’dir. Üretici kataloğunda karşılık gelen satırı doğrulayın. 1 mm et kalınlığı tek başına yük kapasitesini belirlemez.'],
        list: ['d = 20 mm, mil ve kayma çapı.', 'D = 22 mm, gövdeyle eşleşen dış çap.', 'L = 20 mm, nominal boy. Pahlar ve desteklenmeyen bölgeler etkili yataklama boyunu azaltabilir.'],
      },
      {
        heading: 'Yağlamasız PTFE ve ilk yağlamalı POM',
        body: [
          'SKF kompozit kataloğunda PTFE kuru çalışmaya, POM ise ilk yağlamalı uygulamalara yönelik ayrı ürün aileleri olarak ele alınır. Satın alma sırasında malzeme eki, ürün teknik föyü ve üreticinin bakım koşulu siparişe yazılmalı.',
          'GGB DU® gibi bir metal-polimer örneği çelik arkalık, gözenekli bronz ara tabaka ve PTFE esaslı kayma katmanı kullanır. Burada kullanılan değerler belirli ürüne aittir. Başka bir PTFE katmanına genellenemez.',
        ],
      },
      {
        heading: 'Mil mi döner, burç mu?',
        body: [
          'Kayma, mil ile burcun iç yüzeyi arasındaki bağıl harekettir. Tipik uygulamada burç gövdesine preslenir ve hareket mil veya burcu taşıyan gövde üzerinden verilir. Gövdeye göre burç dış yüzeyinde kayma veya dönme görülürse montaj toleransı ve yük yönü yeniden kontrol edilir.',
          'C45 malzeme adı yüzey kalitesini tarif etmez. Milde gerçek pürüzlülüğü, yüzey sertliğini ve çap sapmalarını ölçün. GGB DU® kuru çalışma için Ra 0,3–0,5 µm verir ve 200 HB üzerinin ömrü iyileştirebileceğini belirtir. Bu değerler yalnızca DU® için katalog örneğidir.',
          'Çalışma boşluğu için burcun preslendikten sonraki iç çapını esas alın. Gövde deliği, gövde rijitliği ve montaj deformasyonu bu çapı değiştirir.',
        ],
      },
    ],
    faq: [
      { question: 'PAP burç otomatik olarak yağlamasız mıdır?', answer: 'Yağlama koşulu üreticinin kod son ekinde ve teknik föyünde belirtilir. PTFE ve POM ailelerini tam ürün koduyla kontrol edin.' },
      { question: 'Ø20 mm mil ve Ø20 mm nominal burçta boşluk sıfır mı?', answer: 'Nominal ölçüler eşit olabilir. Boşluk hesabında pres sonrası iç çapın ve milin alt-üst ölçü sınırları kullanılır.' },
    ],
  },
  {
    slug: 'agir-yuk-burcu-5-ton-salinimli-mafsal',
    title: '5 Ton Kuvvetli Mafsalda Ağır Yük Burcu Hesabı',
    description: 'Ø20 mm milde 5 ton-kuvvet pik yük için burç boyuna göre MPa hesabı, salınım hızı, PV ve saha ömrü doğrulaması.',
    date: bushingGuideDate,
    readTime: '5 dk okuma',
    category: 'Makine Elemanları',
    keywords: ['ağır yük burcu', '5 ton burç', 'salınımlı mafsal', 'burç yük hesabı', 'burç PV', 'yağlamasız mafsal'],
    relatedTools: [loadTool, guide, fitTool],
    intro: [
      'Tek burca 5 ton-kuvvet radyal pik yük gelirse F = 49,03 kN olur. Ø20 mm milde 20 mm etkili yataklama boyu 400 mm² izdüşüm alanı verir. Nominal radyal basınç yaklaşık 122,6 MPa’dır. Makas mafsalında pik kuvvetin oluştuğu anda milin hareket edip etmediği, karşılaştırılacak katalog sınırını ve PV değerlendirmesini değiştirir.',
    ],
    sections: [
      {
        heading: 'Boy değiştiğinde basınç',
        body: ['p = F / (d × L). F newton, çap ve boy mm girildiğinde sonuç MPa çıkar. Çap hesabında 22 mm dış çap yerine 20 mm kayma çapı esas alınır. Mil eğilmesi ve eğik montaj, kenardaki yerel basıncı nominal değerin üzerine çıkarabilir.'],
        list: ['15 mm etkili boy → 163,4 MPa.', '20 mm etkili boy → 122,6 MPa.', '25 mm etkili boy → 98,1 MPa.'],
      },
      {
        heading: '45° salınımda kayma ve PV',
        body: [
          '45° uçtan uca hareket örneğinde gidiş-dönüş 90° yol eder. Ø20 mm milde bir çevrimde 15,71 mm kayma olur. Dakikada 14 tam çevrim varsayılırsa ortalama kayma hızı 0,00367 m/s, 122,6 MPa sabit basınçla pV yaklaşık 0,449 MPa·m/s olur.',
          'Aynı çevrimde toplam hareket 1 saniyede bitiyorsa duruşlar hariç ortalama hız 0,0157 m/s, aynı basınçla pV yaklaşık 1,93 MPa·m/s olur. Bunlar sabit yükle yapılan iki ayrı ortalama hesabıdır. Kuvvet ve hız çevrim içinde değişiyorsa ölçülen zaman profillerini eşleştirin ve katalogdaki değerlendirme yöntemini kullanın.',
        ],
      },
      {
        heading: 'İki yıl hedefi nasıl değerlendirilir?',
        body: ['İki yıllık hedefi çalışma günü, vardiya saati, çevrim sayısı ve hareket altındaki yük profiliyle tarif edin. Ürün föyünün basınç, hız ve PV koşullarını gerçek sıcaklık, yağlama ve mil yüzeyine göre kontrol edin. Ömür doğrulaması için temsili yük altında boşluk artışını, aşınmayı, katman hasarını ve burcun yuvasında dönmesini izleyin.'],
      },
    ],
    faq: [
      { question: 'Katalogda 250 MPa statik sınır varsa 122,6 MPa hareketli yük kabul mü?', answer: 'Hareketli yük için ürünün dinamik basınç ve hız sınırlarını, PV koşulunu ve çalışma sıcaklığını birlikte kontrol edin. Statik sınır, bekleme durumundaki yük kontrolüne aittir.' },
      { question: 'İki burç varsa kuvveti ikiye bölebilir miyim?', answer: 'Ancak yük paylaşımı doğrulanmışsa. Moment, yatak açıklığı ve sehim her burcun tepkisini değiştirebilir.' },
    ],
  },
];
