import type { Tool } from '@/data/tools';

export type PriorityToolMeta = {
  title: string;
  description: string;
  keywords: string[];
};

export const PRIORITY_TOOL_SLUGS = [
  'iso-gecme-tolerans-hesaplama',
  'kama-kanali-hesaplama',
  'kilavuz-matkap-hesaplama',
  'konik-hesaplama',
  'levha-agirlik-hesaplama',
  'baklavali-sac-agirlik-hesaplama',
  'demir-agirligi-hesaplama',
  'civata-sikma-torku-hesaplama',
  'sac-bukum-acinim-hesaplama',
  'sac-bukum-kesim-hesaplayici',
  'mil-mukavemet-hesaplama',
  'disli-carki-hesaplama',
  'rulman-omru-hesaplama',
  'boru-eti-hesaplama',
  'o-ring-kanali-hesaplama',
  'kablo-kesiti-hesaplama',
  'voltaj-dusumu-hesaplama',
  'kaynak-dikisi-hesaplama',
  'yuzey-puruzlulugu-rehberi',
  'basincli-kap-cidar-kalinligi',
  'kayis-kasnak-hesaplama',
  'pompa-guc-hesaplama',
  'termal-iletim-hesaplama',
  'oee-uretim-verimliligi-hesaplama',
] as const;

const meta: Record<string, PriorityToolMeta> = {
  'iso-gecme-tolerans-hesaplama': {
    title: 'ISO Geçme Toleransı Hesaplama – H7, h6, g6 ve k6',
    description: 'Nominal çapa göre H7, H8, h6, g6, k6 ve diğer ISO geçme toleranslarının alt-üst sapmalarını ve geçme tipini hesaplayın.',
    keywords: ['ISO 286 tolerans', 'H7 h6 geçme', 'H7 g6 geçme', 'mil delik toleransı', 'geçme toleransı hesaplama'],
  },
  'kama-kanali-hesaplama': {
    title: 'Kama Kanalı Hesaplama – Mil Çapına Göre DIN 6885 Ölçüsü',
    description: 'Mil çapına göre kama genişliği, yüksekliği, kanal derinliği ve teknik resim ölçülerini DIN 6885 yaklaşımıyla hızlıca belirleyin.',
    keywords: ['kama kanalı ölçüsü', 'mil çapına göre kama', 'DIN 6885', 'kama ölçü tablosu', 'kama kanalı hesaplama'],
  },
  'kilavuz-matkap-hesaplama': {
    title: 'Metrik Diş Tablosu ve Kılavuz Matkap Çapları – M2–M42',
    description: 'M2–M42 kaba ve ince metrik dişlerde kılavuz matkap çaplarını, teorik diş dibi ve adım çaplarını, boşluk deliklerini ve teknik resim çağrısını görüntüleyin.',
    keywords: ['metrik diş tablosu', 'kılavuz tablosu', 'kılavuz matkap çapları', 'metrik diş dibi hesaplama', 'M8 matkap çapı', 'M10 matkap çapı', 'iç diş dibi', 'dış diş dibi'],
  },
  'konik-hesaplama': {
    title: 'Konik ve Torna Derece Hesaplama – Çap, Boy, Açı ve 1:N',
    description: 'Büyük çap, küçük çap, konik boy, toplam açı veya 1:N oranından torna yarım açısını, toplam koni açısını ve küçük çapı hesaplayın.',
    keywords: ['konik hesaplama', 'torna derece hesaplama', 'koniklik oranı', 'koni açısı hesaplama', 'torna konik hesabı', '1:10 koniklik açısı'],
  },
  'levha-agirlik-hesaplama': {
    title: 'Sac Ağırlık Hesaplama – Çelik, Galvanizli, Alüminyum Levha',
    description: 'En, boy, kalınlık, adet ve yoğunluğa göre düz sac, galvanizli sac, paslanmaz, alüminyum ve bakır levha ağırlığını kg olarak hesaplayın.',
    keywords: ['sac ağırlık hesaplama', 'sac ağırlık', 'levha ağırlığı', 'galvanizli sac ağırlığı', 'çelik plaka kg', 'alüminyum levha ağırlığı'],
  },
  'baklavali-sac-agirlik-hesaplama': {
    title: 'Baklavalı Sac Ağırlık Hesaplama – Plaka ve m² Ağırlığı',
    description: 'Baklavalı sac en, boy, kalınlık, adet ve desen katsayısına göre tek plaka, toplam ve metrekare ağırlığını kg olarak hesaplayın.',
    keywords: ['baklavalı sac ağırlık', 'baklavalı sac kg', 'baklava desenli sac ağırlığı', 'sac ağırlık hesaplama', 'baklavalı sac tablosu'],
  },
  'demir-agirligi-hesaplama': {
    title: 'Donatı Ağırlıkları Tablosu – Ø6–Ø40 İnşaat Demiri kg/m',
    description: 'Ø6–Ø40 donatıların kg/m, 6 metre ve 12 metre boy ağırlıklarını görüntüleyin; toplam uzunluk veya boy adedine göre demir tonajını hesaplayın.',
    keywords: ['donatı ağırlıkları', 'demir ağırlık tablosu', 'inşaat demiri kg/m', 'nervürlü demir ağırlığı', 'Ø12 demir ağırlığı', 'donatı tonaj hesabı'],
  },
  'civata-sikma-torku-hesaplama': {
    title: 'Cıvata Sıkma Torku Hesaplama – M6, M8, M10, M12',
    description: 'Cıvata çapı, kalite sınıfı, sürtünme ve yağlama durumuna göre yaklaşık sıkma torku ve ön yük değerini hesaplayın.',
    keywords: ['cıvata sıkma torku', 'M8 tork değeri', 'M10 tork değeri', 'cıvata ön yük', 'cıvata tork hesabı'],
  },
  'sac-bukum-acinim-hesaplama': {
    title: 'Sac Büküm Açınım Hesaplama – K Faktörü ve Büküm Payı',
    description: 'Sac kalınlığı, iç radius, açı ve K faktörüne göre büküm payı, büküm düşümü ve düz boy açınımını hesaplayın.',
    keywords: ['sac açınım hesaplama', 'K faktörü', 'büküm payı', 'bend allowance', 'sac düz boy hesabı'],
  },
  'sac-bukum-kesim-hesaplayici': {
    title: 'Sac Büküm ve Kesim Hesaplama – V Kalıp, Tonaj, Açınım',
    description: 'Sac kalınlığı ve malzemeye göre V kalıp açıklığı, iç radius, minimum flanş, tonaj, bıçak boşluğu ve açınım değerlerini hesaplayın.',
    keywords: ['V kalıp seçimi', 'abkant tonaj hesabı', 'sac büküm hesabı', 'giyotin bıçak boşluğu', 'minimum flanş'],
  },
  'mil-mukavemet-hesaplama': {
    title: 'Mil Çapı ve Mukavemet Hesaplama – Eğilme ve Burulma',
    description: 'Tork, eğilme momenti, malzeme dayanımı ve emniyet katsayısına göre gerekli mil çapını ve gerilmeleri ön hesaplayın.',
    keywords: ['mil çapı hesaplama', 'mil mukavemet hesabı', 'burulma gerilmesi', 'eğilme momenti', 'şaft çapı'],
  },
  'disli-carki-hesaplama': {
    title: 'Dişli Çark Hesaplama – Modül, Diş Sayısı ve Merkez Mesafesi',
    description: 'Modül ve diş sayısına göre hatve çapı, dış çap, dip çapı, aktarım oranı ve iki dişli arasındaki merkez mesafesini hesaplayın.',
    keywords: ['dişli modül hesabı', 'hatve çapı', 'dişli merkez mesafesi', 'dişli oranı', 'dişli çark hesaplama'],
  },
  'rulman-omru-hesaplama': {
    title: 'Rulman Ömrü Hesaplama – L10 Ömrü ve Çalışma Saati',
    description: 'Dinamik yük kapasitesi, eşdeğer yük, rulman tipi ve devre göre teorik L10 rulman ömrünü devir ve saat olarak hesaplayın.',
    keywords: ['rulman ömrü hesaplama', 'L10 ömrü', 'dinamik yük kapasitesi', 'rulman çalışma saati', 'eşdeğer rulman yükü'],
  },
  'boru-eti-hesaplama': {
    title: 'Boru Et Kalınlığı Hesaplama – İç Basınç ve Barlow Formülü',
    description: 'İç basınç, boru çapı, izin verilen gerilme ve kaynak verimine göre teorik minimum boru et kalınlığını ön hesaplayın.',
    keywords: ['boru et kalınlığı', 'Barlow formülü', 'basınçlı boru hesabı', 'boru cidar kalınlığı', 'iç basınç hesabı'],
  },
  'o-ring-kanali-hesaplama': {
    title: 'O-Ring Kanalı Hesaplama – Sıkıştırma, Doluluk ve Kanal Ölçüsü',
    description: 'O-ring kesiti, uygulama tipi ve sıkıştırma oranına göre kanal genişliği, derinliği, doluluk ve montaj boşluklarını hesaplayın.',
    keywords: ['o-ring kanal ölçüsü', 'o-ring sıkıştırma oranı', 'o-ring kanal derinliği', 'statik sızdırmazlık', 'o-ring hesaplama'],
  },
  'kablo-kesiti-hesaplama': {
    title: 'Kablo Kesiti Hesaplama – Akım, Mesafe ve Gerilim Düşümü',
    description: 'Akım, hat uzunluğu, gerilim, faz tipi, iletken malzemesi ve izin verilen gerilim düşümüne göre gerekli kablo kesitini hesaplayın.',
    keywords: ['kablo kesiti hesaplama', 'akım kablo kesiti', 'mesafeye göre kablo', 'gerilim düşümü', 'bakır kablo kesiti'],
  },
  'voltaj-dusumu-hesaplama': {
    title: 'Voltaj Düşümü Hesaplama – Kablo Uzunluğu ve Kesite Göre',
    description: 'Akım, kablo uzunluğu, kesit, faz ve iletken malzemesine göre voltaj düşümünü volt ve yüzde olarak hesaplayın.',
    keywords: ['voltaj düşümü hesaplama', 'gerilim düşümü yüzde', 'kablo uzunluğu voltaj kaybı', 'üç faz gerilim düşümü', 'kablo kesiti'],
  },
  'kaynak-dikisi-hesaplama': {
    title: 'Kaynak Dikişi Mukavemet Hesaplama – Köşe Kaynağı ve Boğaz',
    description: 'Yük, kaynak boyu, dikiş sayısı ve izin verilen gerilmeye göre köşe kaynak dikişi boğaz kalınlığını ve yaklaşık kapasiteyi hesaplayın.',
    keywords: ['kaynak dikişi hesabı', 'köşe kaynağı boğaz kalınlığı', 'kaynak mukavemeti', 'kaynak boyu', 'kaynak kapasitesi'],
  },
  'yuzey-puruzlulugu-rehberi': {
    title: 'Yüzey Pürüzlülüğü Rehberi – Ra, Rz ve İşleme Karşılıkları',
    description: 'Ra ve Rz yüzey pürüzlülüğü değerlerini, tipik imalat yöntemlerini ve teknik resimde kullanılacak yüzey çağrılarını karşılaştırın.',
    keywords: ['Ra 3.2', 'Ra Rz farkı', 'yüzey pürüzlülüğü tablosu', 'teknik resim yüzey işareti', 'işleme yüzeyi'],
  },
  'basincli-kap-cidar-kalinligi': {
    title: 'Basınçlı Kap Cidar Kalınlığı Hesaplama – Silindirik Gövde',
    description: 'İç basınç, iç çap, izin verilen gerilme, kaynak verimi ve korozyon payına göre teorik basınçlı kap cidar kalınlığını hesaplayın.',
    keywords: ['basınçlı kap cidar hesabı', 'silindirik gövde et kalınlığı', 'iç basınç', 'kaynak verimi', 'korozyon payı'],
  },
  'kayis-kasnak-hesaplama': {
    title: 'Kayış Kasnak Hesaplama – Devir Oranı ve Kasnak Çapı',
    description: 'Motor devri, hedef devir ve kasnak çaplarına göre kayış-kasnak aktarım oranını, çıkış devrini ve çevresel hızı hesaplayın.',
    keywords: ['kayış kasnak hesabı', 'kasnak çapı hesaplama', 'devir düşürme', 'aktarım oranı', 'motor kasnağı'],
  },
  'pompa-guc-hesaplama': {
    title: 'Dalgıç Pompa Hesaplama Programı – Debi, Basma Yüksekliği, Motor kW',
    description: 'Debi, statik yükseklik, boru kaybı, çıkış basıncı, yoğunluk ve verimden toplam basma yüksekliğini, pompa mil gücünü ve standart motor kW ön seçimini hesaplayın.',
    keywords: ['dalgıç pompa hesaplama programı', 'dalgıç pompa hesabı', 'pompa güç hesabı', 'toplam basma yüksekliği', 'pompa motor gücü', 'pompa kW hesabı', 'kuyu pompası hesabı'],
  },
  'termal-iletim-hesaplama': {
    title: 'Endüstriyel Isı ve Termal İletim Hesaplama – Isı Kaybı, W ve K/W',
    description: 'Düz plaka ve silindirik duvarda malzeme iletkenliği, kalınlık, alan ve sıcaklık farkına göre ısı akısı ile termal direnci hesaplayın.',
    keywords: ['endüstriyel ısı termal hesaplama', 'termal iletim hesaplama', 'ısı kaybı hesabı', 'termal direnç', 'Fourier ısı iletimi'],
  },
  'oee-uretim-verimliligi-hesaplama': {
    title: 'OEE Hesaplama – Kullanılabilirlik, Performans ve Kalite',
    description: 'Planlı üretim süresi, duruş, ideal çevrim, toplam üretim ve sağlam ürün verileriyle OEE oranını ve kayıp bileşenlerini hesaplayın.',
    keywords: ['OEE hesaplama', 'üretim verimliliği', 'kullanılabilirlik performans kalite', 'makine verimliliği', 'üretim kayıpları'],
  },
};

const relations: Record<string, string[]> = {
  'iso-gecme-tolerans-hesaplama': ['yuzey-puruzlulugu-rehberi', 'kama-kanali-hesaplama', 'rulman-omru-hesaplama', 'teknik-resim-cagri-olusturucu'],
  'kama-kanali-hesaplama': ['mil-mukavemet-hesaplama', 'iso-gecme-tolerans-hesaplama', 'tork-hesaplama', 'teknik-resim-cagri-olusturucu'],
  'kilavuz-matkap-hesaplama': ['konik-hesaplama', 'teknik-resim-cagri-olusturucu', 'civata-sikma-torku-hesaplama', 'iso-gecme-tolerans-hesaplama'],
  'konik-hesaplama': ['kilavuz-matkap-hesaplama', 'mil-mukavemet-hesaplama', 'disli-carki-hesaplama', 'iso-gecme-tolerans-hesaplama'],
  'levha-agirlik-hesaplama': ['baklavali-sac-agirlik-hesaplama', 'sac-bukum-kesim-hesaplayici', 'sac-bukum-acinim-hesaplama', 'celik-profil-agirligi'],
  'baklavali-sac-agirlik-hesaplama': ['levha-agirlik-hesaplama', 'sac-bukum-kesim-hesaplayici', 'sac-bukum-acinim-hesaplama', 'celik-profil-agirligi'],
  'demir-agirligi-hesaplama': ['beton-miktari-hesaplama', 'celik-profil-agirligi', 'levha-agirlik-hesaplama', 'tugla-hesaplama'],
  'civata-sikma-torku-hesaplama': ['kilavuz-matkap-hesaplama', 'tork-hesaplama', 'mil-mukavemet-hesaplama', 'kaynak-dikisi-hesaplama'],
  'sac-bukum-acinim-hesaplama': ['sac-bukum-kesim-hesaplayici', 'levha-agirlik-hesaplama', 'yuzey-puruzlulugu-rehberi', 'teknik-resim-cagri-olusturucu'],
  'sac-bukum-kesim-hesaplayici': ['sac-bukum-acinim-hesaplama', 'levha-agirlik-hesaplama', 'yuzey-puruzlulugu-rehberi', 'guc-verim-hesaplama'],
  'mil-mukavemet-hesaplama': ['kama-kanali-hesaplama', 'rulman-omru-hesaplama', 'tork-hesaplama', 'disli-carki-hesaplama'],
  'disli-carki-hesaplama': ['mil-mukavemet-hesaplama', 'rulman-omru-hesaplama', 'kayis-kasnak-hesaplama', 'tork-hesaplama'],
  'rulman-omru-hesaplama': ['iso-gecme-tolerans-hesaplama', 'mil-mukavemet-hesaplama', 'disli-carki-hesaplama', 'devir-frekans-donusumu'],
  'boru-eti-hesaplama': ['basincli-kap-cidar-kalinligi', 'basinc-hesaplama', 'pompa-guc-hesaplama', 'reynolds-sayisi-hesaplama'],
  'o-ring-kanali-hesaplama': ['iso-gecme-tolerans-hesaplama', 'yuzey-puruzlulugu-rehberi', 'basinc-hesaplama', 'isil-genlesme-hesaplama'],
  'kablo-kesiti-hesaplama': ['voltaj-dusumu-hesaplama', 'guc-faktoru-duzeltme', 'guc-verim-hesaplama', 'ohm-kanunu-hesaplama'],
  'voltaj-dusumu-hesaplama': ['kablo-kesiti-hesaplama', 'ohm-kanunu-hesaplama', 'guc-faktoru-duzeltme', 'elektrik-fatura-hesaplama'],
  'kaynak-dikisi-hesaplama': ['mil-mukavemet-hesaplama', 'levha-agirlik-hesaplama', 'yuzey-puruzlulugu-rehberi', 'teknik-resim-cagri-olusturucu'],
  'yuzey-puruzlulugu-rehberi': ['iso-gecme-tolerans-hesaplama', 'o-ring-kanali-hesaplama', 'teknik-resim-cagri-olusturucu', 'kilavuz-matkap-hesaplama'],
  'basincli-kap-cidar-kalinligi': ['boru-eti-hesaplama', 'basinc-hesaplama', 'kaynak-dikisi-hesaplama', 'termal-iletim-hesaplama'],
  'kayis-kasnak-hesaplama': ['devir-frekans-donusumu', 'tork-hesaplama', 'mil-mukavemet-hesaplama', 'disli-carki-hesaplama'],
  'pompa-guc-hesaplama': ['reynolds-sayisi-hesaplama', 'boru-eti-hesaplama', 'basinc-hesaplama', 'termal-iletim-hesaplama'],
  'termal-iletim-hesaplama': ['isil-genlesme-hesaplama', 'basincli-kap-cidar-kalinligi', 'boru-eti-hesaplama', 'pompa-guc-hesaplama'],
  'oee-uretim-verimliligi-hesaplama': ['takt-suresi-kapasite-hesaplama', 'guc-verim-hesaplama', 'proje-yonetimi', 'api-sla-uptime-hesaplama'],
};

export function getPriorityToolMeta(slug: string): PriorityToolMeta | undefined {
  return meta[slug];
}

export function getContextualRelatedTools(tool: Tool, allTools: Tool[], limit = 4): Tool[] {
  const preferred = (relations[tool.slug] || [])
    .map((slug) => allTools.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is Tool => Boolean(candidate));

  const sameCategory = allTools.filter((candidate) => candidate.category === tool.category && candidate.id !== tool.id);
  const merged = [...preferred, ...sameCategory].filter(
    (candidate, index, list) => candidate.id !== tool.id && list.findIndex((item) => item.id === candidate.id) === index
  );
  return merged.slice(0, limit);
}
