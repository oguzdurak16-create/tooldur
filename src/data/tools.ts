export interface Tool {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  icon: string;
  popular?: boolean;
  new?: boolean;
  featured?: boolean;
  toleranceGuide?: boolean;
  keywords?: string[];
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: "makine",
    name: "Makine & Mekanik",
    slug: "makine",
    description: "Tolerans, geçme, kama, mil, rulman, tork ve imalat hesapları",
    icon: "Cog",
    color: "blue",
  },
  {
    id: "cevirici",
    name: "Birim Çeviriciler",
    slug: "cevirici",
    description: "Uzunluk, ağırlık, basınç, sıcaklık ve hacim dönüşümleri",
    icon: "ArrowLeftRight",
    color: "green",
  },
  {
    id: "elektrik",
    name: "Elektrik & Elektronik",
    slug: "elektrik",
    description: "Kablo kesiti, gerilim düşümü ve temel elektrik hesapları",
    icon: "Zap",
    color: "yellow",
  },
  {
    id: "insaat",
    name: "İnşaat & Yapı",
    slug: "insaat",
    description: "Metraj, ağırlık, beton ve yapı ön hesapları",
    icon: "Building2",
    color: "orange",
  },
  {
    id: "endustri",
    name: "Endüstri & Üretim",
    slug: "endustri",
    description: "OEE, takt süresi, kapasite ve üretim verimliliği hesapları",
    icon: "Factory",
    color: "yellow",
  },
  {
    id: "kimya",
    name: "Kimya & Proses",
    slug: "kimya",
    description: "Çözelti, seyreltme, proses ve akışkan ön hesapları",
    icon: "FlaskConical",
    color: "green",
  },
  {
    id: "cevre",
    name: "Çevre & Enerji",
    slug: "cevre",
    description: "Karbon emisyonu, enerji üretimi ve sürdürülebilirlik hesapları",
    icon: "Leaf",
    color: "blue",
  },
  {
    id: "yazilim",
    name: "Yazılım & Veri",
    slug: "yazilim",
    description: "SLA, uptime, kapasite ve teknik operasyon hesapları",
    icon: "Code2",
    color: "purple",
  },
  {
    id: "genel",
    name: "Genel Araçlar",
    slug: "genel",
    description: "Ana mühendislik araçlarının dışında kalan yardımcı hesaplar",
    icon: "Calculator",
    color: "purple",
  },
];

export const tools: Tool[] = [
  // Elektrik & Elektronik
  {
    id: "kablo-kesiti",
    slug: "kablo-kesiti-hesaplama",
    name: "Kablo Kesiti Hesaplama",
    shortName: "Kablo Kesiti",
    description:
      "Akım, gerilim düşümü ve mesafeye göre uygun kablo kesitini hesaplayın.",
    category: "elektrik",
    icon: "Cable",
    popular: true,
  },
  {
    id: "voltaj-dusumu",
    slug: "voltaj-dusumu-hesaplama",
    name: "Voltaj Düşümü Hesaplama",
    shortName: "Voltaj Düşümü",
    description:
      "Kablo uzunluğu, akım, kesit, faz tipi ve iletken malzemesine göre yaklaşık voltaj düşümünü hesaplayın.",
    category: "elektrik",
    icon: "Zap",
    popular: true,
    new: true,
  },
  {
    id: "elektrik-fatura",
    slug: "elektrik-fatura-hesaplama",
    name: "Elektrik Fatura Hesaplama",
    shortName: "Elektrik Faturası",
    description: "Konut ve sanayi tipi elektrik faturası hesaplayın.",
    category: "elektrik",
    icon: "Receipt",
    popular: true,
  },
  {
    id: "guc-faktoru",
    slug: "guc-faktoru-duzeltme",
    name: "Güç Faktörü Düzeltme",
    shortName: "Güç Faktörü",
    description:
      "Reaktif güç kompanzasyonu için kondansatör kapasitesi hesaplayın.",
    category: "elektrik",
    icon: "Gauge",
  },
  {
    id: "led-direnc",
    slug: "led-direnc-hesaplama",
    name: "LED Direnç Hesaplama",
    shortName: "LED Direnç",
    description: "LED devreleri için uygun direnç değerini hesaplayın.",
    category: "elektrik",
    icon: "Lightbulb",
  },
  {
    id: "ohm-kanunu",
    slug: "ohm-kanunu-hesaplama",
    name: "Ohm Kanunu Hesaplama",
    shortName: "Ohm Kanunu",
    description: "Gerilim, akım ve direnç arasındaki ilişkiyi hesaplayın.",
    category: "elektrik",
    icon: "CircuitBoard",
  },

  // İnşaat & Yapı
  {
    id: "beton-hesaplama",
    slug: "beton-miktari-hesaplama",
    name: "Beton Miktarı Hesaplama",
    shortName: "Beton Miktarı",
    description:
      "Döküm alanı için gerekli beton, çimento, kum ve çakıl miktarını hesaplayın.",
    category: "insaat",
    icon: "Box",
    popular: true,
  },
  {
    id: "demir-hesaplama",
    slug: "demir-agirligi-hesaplama",
    name: "Donatı Ağırlıkları ve İnşaat Demiri Hesaplama",
    shortName: "Donatı Ağırlıkları",
    description: "Ø6–Ø40 donatı birim ağırlıklarını görüntüleyin; çap, toplam uzunluk veya boy adedine göre demir ağırlığını kg ve ton olarak hesaplayın.",
    category: "insaat",
    icon: "Columns3",
    keywords: ["donatı ağırlıkları", "inşaat demiri kg/m", "demir ağırlık tablosu", "nervürlü demir ağırlığı", "donatı tonaj hesabı", "Ø12 demir ağırlığı"],
    popular: true,
  },
  {
    id: "celik-profil",
    slug: "celik-profil-agirligi",
    name: "Çelik Profil Ağırlığı",
    shortName: "Çelik Profil",
    description: "IPE, HEA, UNP ve diğer profillerin ağırlığını hesaplayın.",
    category: "insaat",
    icon: "RectangleHorizontal",
    toleranceGuide: true,
    keywords: ["tolerans", "imalat toleransı", "teknik resim", "uygulama notu"],
    popular: true,
  },
  {
    id: "tugla-hesaplama",
    slug: "tugla-hesaplama",
    name: "Tuğla Hesaplama",
    shortName: "Tuğla Adedi",
    description: "Duvar alanına göre gerekli tuğla adedini hesaplayın.",
    category: "insaat",
    icon: "LayoutGrid",
  },
  {
    id: "merdiven-hesaplama",
    slug: "merdiven-hesaplama",
    name: "Merdiven Hesaplama",
    shortName: "Merdiven",
    description: "Yükseklik ve açıya göre merdiven basamak hesabı yapın.",
    category: "insaat",
    icon: "Stairs",
  },
  {
    id: "levha-agirlik",
    slug: "levha-agirlik-hesaplama",
    name: "Sac Ağırlık Hesaplama",
    shortName: "Sac Ağırlığı",
    description:
      "Çelik, alüminyum, bakır ve diğer metal levhaların ağırlığını hesaplayın.",
    category: "makine",
    icon: "Square",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    popular: true,
  },
  {
    id: "baklavali-sac-agirlik",
    slug: "baklavali-sac-agirlik-hesaplama",
    name: "Baklavalı Sac Ağırlık Hesaplama",
    shortName: "Baklavalı Sac",
    description:
      "Baklavalı sac için en, boy, kalınlık, malzeme ve adet bilgilerine göre yaklaşık plaka ve toplam ağırlığı hesaplayın.",
    category: "insaat",
    icon: "Weight",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    popular: true,
    new: true,
  },

  // Makine & Mekanik

  {
    id: "iso-tolerans",
    slug: "iso-gecme-tolerans-hesaplama",
    name: "ISO Geçme ve Tolerans Hesaplama",
    shortName: "ISO Tolerans",
    description:
      "H7/h6, H7/g6, H7/f7, H7/k6, H7/m6 ve H8/h7 için mil-delik tolerans aralığını hesaplayın.",
    category: "makine",
    icon: "Ruler",
    toleranceGuide: true,
    keywords: ["H7", "h6", "g6", "f7", "ISO 286", "geçme toleransı", "mil delik toleransı"],
    popular: true,
    new: true,
  },

  {
    id: "kilavuz-matkap",
    slug: "kilavuz-matkap-hesaplama",
    name: "Metrik Diş Tablosu, Diş Dibi ve Kılavuz Matkap",
    shortName: "Metrik Diş Tablosu",
    description:
      "M2–M42 kaba ve ince metrik dişlerde kılavuz matkap çapını, teorik diş dibi ve adım çaplarını, boşluk deliğini ve teknik resim çağrısını görüntüleyin.",
    category: "makine",
    icon: "Drill",
    toleranceGuide: true,
    keywords: ["metrik diş tablosu", "metrik kılavuz tablosu", "kılavuz matkap çapları", "metrik diş dibi hesaplama", "M10 matkap çapı", "diş çağrısı", "teknik resim", "iç diş", "dış diş dibi"],
    popular: true,
    new: true,
  },
  {
    id: "yuzey-puruzlulugu",
    slug: "yuzey-puruzlulugu-rehberi",
    name: "Yüzey Pürüzlülüğü Rehberi",
    shortName: "Yüzey Pürüzlülüğü",
    description:
      "Ra değerini yaklaşık N sınıfı, Rz karşılığı, imalat yöntemi ve teknik resim yüzey notuna dönüştürün.",
    category: "makine",
    icon: "Gauge",
    toleranceGuide: true,
    keywords: ["Ra", "Rz", "N8", "yüzey pürüzlülüğü", "teknik resim", "işleme yüzeyi"],
    popular: true,
    new: true,
  },
  {
    id: "teknik-cagri",
    slug: "teknik-resim-cagri-olusturucu",
    name: "Teknik Resim Çağrı Oluşturucu",
    shortName: "Teknik Çağrı",
    description:
      "Delik, diş, pah, kaynak, sertleştirme ve kaplama için kopyalanabilir teknik resim notları oluşturun.",
    category: "makine",
    icon: "FileText",
    toleranceGuide: true,
    keywords: ["teknik resim", "çağrı metni", "imalat notu", "yüzey sertleştirme", "kaplama", "kaynak notu"],
    popular: true,
    new: true,
  },

  {
    id: "civata-tork",
    slug: "civata-sikma-torku-hesaplama",
    name: "Cıvata Sıkma Torku Hesaplama",
    shortName: "Cıvata Torku",
    description:
      "Metrik cıvata ölçüsü, kalite sınıfı ve sürtünme katsayısına göre yaklaşık sıkma torku hesaplayın.",
    category: "makine",
    icon: "Gauge",
    toleranceGuide: true,
    keywords: ["cıvata tork", "sıkma torku", "M8 tork", "M10 tork", "tork tablosu"],
    popular: true,
    new: true,
  },
  {
    id: "sac-bukum-acinim",
    slug: "sac-bukum-acinim-hesaplama",
    name: "Sac Büküm Açınım Hesaplama",
    shortName: "Sac Açınım",
    description:
      "Sac kalınlığı, iç radius, büküm açısı ve K faktörüne göre abkant büküm açınım boyunu hesaplayın.",
    category: "makine",
    icon: "Ruler",
    toleranceGuide: true,
    keywords: ["sac büküm", "açınım", "K faktörü", "bend allowance", "abkant"],
    popular: true,
    new: true,
  },
  {
    id: "sac-bukum-kesim",
    slug: "sac-bukum-kesim-hesaplayici",
    name: "Sac Büküm ve Kesim Hesaplayıcı",
    shortName: "Büküm Kesim",
    description: "Sac kalınlığı, malzeme, V kalıp açıklığı, büküm boyu, giyotin kesme bilgisi ve hidrolik silindir değerlerine göre abkant tonajı, açınım, kalıp ön tasarım bilgisi ve kesme kuvveti hesaplayın.",
    category: "makine",
    icon: "Gauge",
    toleranceGuide: true,
    keywords: [
      "sac büküm",
      "sac kesim",
      "abkant tonaj hesabı",
      "giyotin kesme kuvveti",
      "V kalıp hesabı",
      "kalıp tasarımı",
      "büküm açınım",
      "hidrolik silindir kuvveti",
      "sac imalat hesapları"
    ],
    popular: true,
    new: true,
  },
  {
    id: "tork-hesaplama",
    slug: "tork-hesaplama",
    name: "Tork Hesaplama",
    shortName: "Tork",
    description: "Kuvvet ve kol uzunluğuna göre tork hesaplayın.",
    category: "makine",
    icon: "RotateCw",
    toleranceGuide: true,
    keywords: ["tolerans", "imalat toleransı", "teknik resim", "uygulama notu"],
    popular: true
  },
  {
    id: "basinc-hesaplama",
    slug: "basinc-hesaplama",
    name: "Basınç Hesaplama",
    shortName: "Basınç",
    description: "Kuvvet ve alana göre basınç hesaplayın.",
    category: "makine",
    icon: "Gauge",
    toleranceGuide: true,
    keywords: ["tolerans", "imalat toleransı", "teknik resim", "uygulama notu"],
  },
  {
    id: "hiz-hesaplama",
    slug: "hiz-hesaplama",
    name: "Hız Hesaplama",
    shortName: "Hız",
    description: "Yol ve zamana göre hız hesaplayın.",
    category: "makine",
    icon: "Gauge",
  },
  {
    id: "mil-mukavemet",
    slug: "mil-mukavemet-hesaplama",
    name: "Mil Mukavemet Hesaplama",
    shortName: "Mil Mukavemet",
    description: "Tork ve güvenlik katsayısına göre mil çapı hesaplayın.",
    category: "makine",
    icon: "Cylinder",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    popular: true
  },
  {
    id: "kama-kanali",
    slug: "kama-kanali-hesaplama",
    name: "Kama Kanalı Hesaplama (DIN 6885)",
    shortName: "Kama Kanalı",
    description:
      "Mil çapına göre DIN 6885 standart kama ve kanal ölçülerini hesaplayın.",
    category: "makine",
    icon: "Ruler",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    popular: true
  },

  // Birim Çeviriciler
  {
    id: "uzunluk-cevirici",
    slug: "uzunluk-birimi-cevirici",
    name: "Uzunluk Birimi Çevirici",
    shortName: "Uzunluk",
    description:
      "Metre, feet, inç, mil ve diğer uzunluk birimleri arasında dönüşüm.",
    category: "cevirici",
    icon: "Ruler",
    popular: true,
  },
  {
    id: "agirlik-cevirici",
    slug: "agirlik-birimi-cevirici",
    name: "Ağırlık Birimi Çevirici",
    shortName: "Ağırlık",
    description:
      "Kilogram, pound, ons ve diğer ağırlık birimleri arasında dönüşüm.",
    category: "cevirici",
    icon: "Scale",
  },
  {
    id: "alan-cevirici",
    slug: "alan-birimi-cevirici",
    name: "Alan Birimi Çevirici",
    shortName: "Alan",
    description:
      "Metrekare, dönüm, hektar ve diğer alan birimleri arasında dönüşüm.",
    category: "cevirici",
    icon: "Square",
  },
  {
    id: "hacim-cevirici",
    slug: "hacim-birimi-cevirici",
    name: "Hacim Birimi Çevirici",
    shortName: "Hacim",
    description:
      "Litre, galon, metreküp ve diğer hacim birimleri arasında dönüşüm.",
    category: "cevirici",
    icon: "Box",
  },
  {
    id: "sicaklik-cevirici",
    slug: "sicaklik-birimi-cevirici",
    name: "Sıcaklık Birimi Çevirici",
    shortName: "Sıcaklık",
    description: "Celsius, Fahrenheit ve Kelvin arasında dönüşüm.",
    category: "cevirici",
    icon: "Thermometer",
  },
  {
    id: "basinc-cevirici",
    slug: "basinc-birimi-cevirici",
    name: "Basınç Birimi Çevirici",
    shortName: "Basınç",
    description: "Bar, PSI, atm ve diğer basınç birimleri arasında dönüşüm.",
    category: "cevirici",
    icon: "Gauge",
  },

  // Genel Araçlar
  {
    id: "yuzde-hesaplama",
    slug: "yuzde-hesaplama",
    name: "Yüzde Hesaplama",
    shortName: "Yüzde",
    description: "Yüzde hesaplama, artış/azalış ve oran hesaplamaları.",
    category: "genel",
    icon: "Percent",
  },
  {
    id: "alan-hesaplama",
    slug: "alan-hesaplama",
    name: "Alan Hesaplama",
    shortName: "Alan",
    description:
      "Kare, dikdörtgen, daire, üçgen ve diğer şekillerin alanını hesaplayın.",
    category: "genel",
    icon: "Square",
  },
  {
    id: "hacim-hesaplama",
    slug: "hacim-hesaplama",
    name: "Hacim Hesaplama",
    shortName: "Hacim",
    description: "Küp, silindir, küre ve diğer cisimlerin hacmini hesaplayın.",
    category: "genel",
    icon: "Box",
  },
  {
    id: "pisagor",
    slug: "pisagor-teoremi",
    name: "Pisagor Teoremi",
    shortName: "Pisagor",
    description: "Dik üçgende kenar uzunluklarını hesaplayın.",
    category: "genel",
    icon: "Triangle",
  },

  // Makine — yeni SEO araçları
  {
    id: "disli-carki",
    slug: "disli-carki-hesaplama",
    name: "Dişli Çarkı Hesaplama",
    shortName: "Dişli Çarkı",
    description:
      "Modül, diş sayısı ve devir girişiyle çap, merkez mesafesi, çevrim oranı ve çevre hızını hesaplayın.",
    category: "makine",
    icon: "Cog",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    popular: true,
    new: true,
  },
  {
    id: "yay-hesaplama",
    slug: "yay-hesaplama",
    name: "Yay Hesaplama",
    shortName: "Yay Hesaplama",
    description:
      "Silindirik basma yayında rijitlik, sıkışma ve kayma gerilmesini hesaplayın.",
    category: "makine",
    icon: "Cog",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    new: true,
  },
  {
    id: "rulman-omru",
    slug: "rulman-omru-hesaplama",
    name: "Rulman Ömrü Hesaplama",
    shortName: "Rulman Ömrü",
    description:
      "ISO 281'e göre bilyalı ve makaralı rulmanlarda L10 nominal ömrünü saat ve yıl cinsinden hesaplayın.",
    category: "makine",
    icon: "Circle",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    popular: true,
    new: true,
  },
  {
    id: "viskozite",
    slug: "viskozite-donusumu",
    name: "Viskozite Dönüşümü",
    shortName: "Viskozite",
    description:
      "cSt, cP, Pa·s, poise birimleri arasında dönüşüm yapın. ASTM D341 ile yağ viskozitesini sıcaklığa göre hesaplayın.",
    category: "makine",
    icon: "Droplets",
    keywords: ["tolerans", "imalat toleransı", "teknik resim", "uygulama notu"],
    popular: true,
    new: true,
  },
  {
    id: "guc-verim",
    slug: "guc-verim-hesaplama",
    name: "Güç-Verim Hesaplama",
    shortName: "Güç Verimi",
    description:
      "Güç aktarma zincirinde toplam verimi, çıkış gücünü ve güç kayıplarını hesaplayın.",
    category: "makine",
    icon: "Zap",
    toleranceGuide: true,
    keywords: ["tolerans", "imalat toleransı", "teknik resim", "uygulama notu"],
    new: true,
  },
  {
    id: "termal-iletim",
    slug: "termal-iletim-hesaplama",
    name: "Endüstriyel Isı ve Termal İletim Hesaplama",
    shortName: "Termal İletim",
    description:
      "Endüstriyel düz plaka ve silindirik duvarlarda ısı akısı, ısı kaybı ve termal direnç hesabı. 12 malzeme dahil.",
    category: "makine",
    icon: "Thermometer",
    toleranceGuide: true,
    keywords: ["endüstriyel ısı termal hesaplama", "ısı kaybı hesabı", "termal direnç", "Fourier ısı iletimi", "boru izolasyonu"],
    new: true,
  },
  {
    id: "devir-frekans",
    slug: "devir-frekans-donusumu",
    name: "Devir-Frekans Dönüşümü",
    shortName: "Devir-Frekans",
    description:
      "rpm, Hz, rad/s ve çevre hızı (m/s) arasında dönüşüm. AC motor senkron devir hesabı dahil.",
    category: "makine",
    icon: "RotateCw",
    toleranceGuide: true,
    keywords: ["tolerans", "imalat toleransı", "teknik resim", "uygulama notu"],
    popular: true,
    new: true,
  },
  {
    id: "boru-eti-hesaplama",
    slug: "boru-eti-hesaplama",
    name: "Boru Et Kalınlığı Hesaplama",
    shortName: "Boru Et Kalınlığı",
    description:
      "Barlow formülüne göre basınçlı boru et kalınlığı hesabı. DN seçimi, malzeme kütüphanesi, birim ağırlık ve izin verilen basınç hesaplamaları.",
    category: "makine",
    icon: "Circle",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    popular: true,
    new: true,
  },
  {
    id: "o-ring-kanali",
    slug: "o-ring-kanali-hesaplama",
    name: "O-Ring Kanalı Hesaplama",
    shortName: "O-Ring Kanalı",
    description:
      "O-ring kesit çapı, sıkışma oranı ve kanal doluluk yüzdesine göre kanal derinliği, genişliği ve ön tasarım ölçülerini hesaplayın.",
    category: "makine",
    icon: "Circle",
    toleranceGuide: true,
    keywords: ["o-ring", "sızdırmazlık", "kanal ölçüsü", "gland fill", "sıkışma oranı", "teknik resim"],
    popular: true,
    new: true,
  },
  {
    id: "isil-genlesme",
    slug: "isil-genlesme-hesaplama",
    name: "Isıl Genleşme Hesaplama",
    shortName: "Isıl Genleşme",
    description:
      "Malzeme genleşme katsayısı, başlangıç boyu ve sıcaklık farkına göre boy değişimini ve montaj boşluğu ihtiyacını hesaplayın.",
    category: "makine",
    icon: "Thermometer",
    toleranceGuide: true,
    keywords: ["ısıl genleşme", "termal genleşme", "boşluk hesabı", "montaj toleransı", "alüminyum çelik genleşme"],
    new: true,
  },
  {
    id: "reynolds-sayisi",
    slug: "reynolds-sayisi-hesaplama",
    name: "Reynolds Sayısı Hesaplama",
    shortName: "Reynolds Sayısı",
    description:
      "Boru çapı, debi, yoğunluk ve viskozite ile Reynolds sayısını, akış rejimini ve ortalama akış hızını hesaplayın.",
    category: "makine",
    icon: "Droplets",
    keywords: ["reynolds", "akış rejimi", "laminer türbülanslı", "boru debisi", "viskozite"],
    popular: true,
    new: true,
  },
  {
    id: "basincli-kap-cidar",
    slug: "basincli-kap-cidar-kalinligi",
    name: "Basınçlı Kap Cidar Kalınlığı",
    shortName: "Kap Cidarı",
    description:
      "İç basınç, çap, izin verilen gerilme, kaynak verimi ve korozyon payına göre silindirik basınçlı kap için yaklaşık cidar kalınlığı hesaplayın.",
    category: "makine",
    icon: "Cylinder",
    toleranceGuide: true,
    keywords: ["basınçlı kap", "cidar kalınlığı", "ASME", "silindirik tank", "korozyon payı"],
    new: true,
  },
  {
    id: "proje-yonetimi",
    slug: "proje-yonetimi",
    name: "Proje Yönetimi Panosu",
    shortName: "Proje Panosu",
    description:
      "Kanban panosu ile projelerinizi ve görevlerinizi ücretsiz yönetin. Kayıt gerektirmez, tarayıcıda çalışır.",
    category: "genel",
    icon: "LayoutDashboard",
    new: true,
  },

  // Diğer mühendislik dalları
  {
    id: "oee-uretim",
    slug: "oee-uretim-verimliligi-hesaplama",
    name: "OEE Üretim Verimliliği Hesaplama",
    shortName: "OEE",
    description:
      "Planlı süre, duruş, çevrim süresi, toplam adet ve sağlam adet ile kullanılabilirlik, performans, kalite ve OEE oranını hesaplayın.",
    category: "endustri",
    icon: "Factory",
    keywords: ["OEE", "üretim verimliliği", "kullanılabilirlik", "performans", "kalite oranı", "lean üretim"],
    popular: true,
    new: true,
  },
  {
    id: "takt-suresi",
    slug: "takt-suresi-kapasite-hesaplama",
    name: "Takt Süresi ve Kapasite Hesaplama",
    shortName: "Takt Süresi",
    description:
      "Talep, net çalışma süresi, vardiya ve verim bilgileriyle takt süresi, hedef çevrim süresi ve yaklaşık üretim kapasitesini hesaplayın.",
    category: "endustri",
    icon: "Timer",
    keywords: ["takt süresi", "üretim kapasitesi", "hat dengeleme", "vardiya kapasitesi", "lean manufacturing"],
    new: true,
  },
  {
    id: "molarite-seyreltme",
    slug: "molarite-seyreltme-hesaplama",
    name: "Molarite Seyreltme Hesaplama",
    shortName: "Molarite",
    description:
      "C1V1=C2V2 bağıntısıyla stok çözelti, hedef molarite ve final hacme göre gerekli stok hacmi ve çözücü miktarını hesaplayın.",
    category: "kimya",
    icon: "FlaskConical",
    keywords: ["molarite", "seyreltme", "C1V1 C2V2", "çözelti hazırlama", "laboratuvar hesaplama"],
    popular: true,
    new: true,
  },
  {
    id: "karbon-emisyonu",
    slug: "karbon-emisyonu-hesaplama",
    name: "Karbon Emisyonu Hesaplama",
    shortName: "Karbon Emisyonu",
    description:
      "Elektrik, doğal gaz, dizel ve benzin tüketimine göre yaklaşık CO2e emisyonunu ve ağaç eşdeğeri azaltım ihtiyacını hesaplayın.",
    category: "cevre",
    icon: "Leaf",
    keywords: ["karbon emisyonu", "CO2 hesaplama", "sürdürülebilirlik", "enerji tüketimi", "karbon ayak izi"],
    popular: true,
    new: true,
  },
  {
    id: "gunes-paneli-enerji",
    slug: "gunes-paneli-enerji-hesaplama",
    name: "Güneş Paneli Enerji Hesaplama",
    shortName: "Güneş Enerjisi",
    description:
      "Panel gücü, panel adedi, güneşlenme süresi ve sistem kaybına göre günlük, aylık ve yıllık yaklaşık elektrik üretimini hesaplayın.",
    category: "cevre",
    icon: "Sun",
    keywords: ["güneş paneli", "solar enerji", "PV üretim", "kWh hesaplama", "yenilenebilir enerji"],
    new: true,
  },
  {
    id: "api-sla-uptime",
    slug: "api-sla-uptime-hesaplama",
    name: "API SLA ve Uptime Hesaplama",
    shortName: "SLA Uptime",
    description:
      "SLA yüzdesine göre aylık/yıllık izin verilen kesinti süresini ve gerçek uptime oranını hesaplayın.",
    category: "yazilim",
    icon: "Code2",
    keywords: ["SLA hesaplama", "uptime", "downtime", "API erişilebilirlik", "SRE", "servis seviyesi"],
    popular: true,
    new: true,
  },

  // SEO trafik araçları
  {
    id: "pazaryeri-fiyat-hesaplama",
    slug: "pazaryeri-fiyat-hesaplama",
    name: "Pazaryeri Fiyat Hesaplama",
    shortName: "Pazaryeri Fiyat",
    description:
      "Trendyol, Hepsiburada, n11, Amazon Türkiye, Çiçeksepeti ve Pazarama için ürün satış fiyatını komisyon, KDV, kargo, reklam ve hedef kâra göre hesaplayın.",
    category: "genel",
    icon: "Store",
    featured: true,
  },
  {
    id: "kdv-hesaplama",
    slug: "kdv-hesaplama",
    name: "KDV Hesaplama",
    shortName: "KDV",
    description:
      "KDV dahil/hariç tutar hesaplama. %1, %10, %20 KDV oranlarıyla anlık hesaplama.",
    category: "genel",
    icon: "Receipt",
    new: true,
  },
  {
    id: "bmi-hesaplama",
    slug: "bmi-hesaplama",
    name: "Vücut Kitle İndeksi (BMI)",
    shortName: "BMI",
    description:
      "Boy ve kiloya göre vücut kitle indeksi hesaplama. İdeal kilo aralığı ve WHO kategorileri.",
    category: "genel",
    icon: "Heart",
    new: true,
  },
  {
    id: "kira-artis-hesaplama",
    slug: "kira-artis-hesaplama",
    name: "Kira Artış Hesaplama",
    shortName: "Kira Artışı",
    description:
      "TÜFE oranına göre yasal kira artış hesaplama. Güncel TÜİK verileriyle 2026 kira zammı.",
    category: "genel",
    icon: "TrendingUp",
    new: true,
  },
  {
    id: "kredi-hesaplama",
    slug: "kredi-hesaplama",
    name: "Kredi Hesaplama",
    shortName: "Kredi",
    description:
      "İhtiyaç, konut, taşıt kredisi taksit ve faiz hesaplama. Ödeme planı tablosu.",
    category: "genel",
    icon: "CreditCard",
    new: true,
  },

  // Mekanik mühendislik
  {
    id: "konik-hesaplama",
    slug: "konik-hesaplama",
    name: "Konik ve Torna Derece Hesaplama",
    shortName: "Konik Hesap",
    description:
      "Büyük çap, küçük çap, boy, toplam açı veya 1:N oranına göre koniklik ile torna yarım açısını derece olarak hesaplayın.",
    category: "makine",
    icon: "Triangle",
    toleranceGuide: true,
    keywords: [
      "konik hesaplama",
      "koniklik oranı",
      "koni açısı hesaplama",
      "büyük çap küçük çap",
      "torna konik hesabı",
      "torna derece hesaplama",
      "konik açı hesaplama",
      "1:10 koniklik açısı",
    ],
    new: true,
    popular: true,
  },

  {
    id: "kayis-kasnak-hesaplama",
    slug: "kayis-kasnak-hesaplama",
    name: "Kayış-Kasnak Hesaplama",
    shortName: "Kayış-Kasnak",
    description:
      "V-kayış tahrik sistemi tasarımı. Çevrim oranı, kayış uzunluğu, hız ve kayış sayısı hesabı.",
    category: "makine",
    icon: "Cog",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    new: true,
    popular: true
  },
  {
    id: "pompa-guc-hesaplama",
    slug: "pompa-guc-hesaplama",
    name: "Dalgıç Pompa Hesaplama Programı",
    shortName: "Dalgıç Pompa",
    description:
      "Debi, statik yükseklik, hat kaybı, çıkış basıncı, sıvı yoğunluğu ve verime göre toplam basma yüksekliğini, pompa mil gücünü ve standart motor kW ön seçimini hesaplayın.",
    category: "makine",
    icon: "Droplets",
    keywords: [
      "dalgıç pompa hesaplama programı",
      "dalgıç pompa seçimi",
      "pompa güç hesabı",
      "debi basma yüksekliği",
      "pompa motor kW",
      "kuyu pompası hesabı",
      "toplam basma yüksekliği hesabı",
      "pompa motor seçimi",
    ],
    popular: true,
    new: true,
  },
  {
    id: "kaynak-dikisi-hesaplama",
    slug: "kaynak-dikisi-hesaplama",
    name: "Kaynak Dikişi Mukavemet",
    shortName: "Kaynak Dikişi",
    description:
      "Alın ve köşe kaynağı mukavemet kontrolü. EN 1993-1-8 standardına göre dikiş kapasitesi.",
    category: "makine",
    icon: "Flame",
    toleranceGuide: true,
    keywords: [
      "tolerans",
      "geçme toleransı",
      "imalat toleransı",
      "teknik resim",
    ],
    new: true,
    popular: true
  },
];

export const getToolsByCategory = (categoryId: string): Tool[] => {
  return tools.filter((tool) => tool.category === categoryId);
};

export const getPopularTools = (): Tool[] => {
  const priority = [
    "iso-gecme-tolerans-hesaplama",
    "civata-sikma-torku-hesaplama",
    "sac-bukum-acinim-hesaplama",
    "sac-bukum-kesim-hesaplayici",
    "kilavuz-matkap-hesaplama",
    "konik-hesaplama",
    "pompa-guc-hesaplama",
    "termal-iletim-hesaplama",
    "teknik-resim-cagri-olusturucu",
    "yuzey-puruzlulugu-rehberi",
    "kama-kanali-hesaplama",
    "mil-mukavemet-hesaplama",
    "tork-hesaplama",
    "levha-agirlik-hesaplama",
    "rulman-omru-hesaplama",
    "boru-eti-hesaplama",
    "o-ring-kanali-hesaplama",
    "reynolds-sayisi-hesaplama",
    "oee-uretim-verimliligi-hesaplama",
    "molarite-seyreltme-hesaplama",
    "karbon-emisyonu-hesaplama",
    "api-sla-uptime-hesaplama",
    "isil-genlesme-hesaplama",
    "basincli-kap-cidar-kalinligi",
    "takt-suresi-kapasite-hesaplama",
    "gunes-paneli-enerji-hesaplama",
    "kaynak-dikisi-hesaplama",
    "disli-carki-hesaplama",
    "kayis-kasnak-hesaplama",
    "celik-profil-agirligi",
    "uzunluk-birimi-cevirici",
    "agirlik-birimi-cevirici",
  ];

  const ordered = priority
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter(Boolean) as Tool[];

  const rest = tools.filter(
    (tool) => tool.popular && !priority.includes(tool.slug) && tool.category !== "genel"
  );

  return [...ordered, ...rest];
};

export const getToolBySlug = (slug: string): Tool | undefined => {
  return tools.find((tool) => tool.slug === slug);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((cat) => cat.id === id);
};
