export type ToleranceFitCard = {
  label: string;
  value: string;
  use: string;
};

export type ToleranceRow = {
  item: string;
  tolerance: string;
  note: string;
};

export type ToleranceGuide = {
  title: string;
  intro: string;
  standards: string[];
  fitCards: ToleranceFitCard[];
  rows: ToleranceRow[];
  notes: string[];
};

const commonSources = [
  "Güncel standart kontrolü",
  "Üretici katalog değeri",
  "Müşteri şartnamesi",
  "İmalat yöntemi",
];

const commonNotes = [
  "Harf/rakam sınıfları seçim yönü verir; sayısal sapma tablosu değildir.",
  "Kritik ölçülerde ölçüm yöntemi, yüzey pürüzlülüğü ve kaplama sonrası ölçü ayrıca yazılmalıdır.",
  "Seri üretimde ilk numune ölçümüyle sınıf doğrulanmalıdır.",
];

export const toleranceGuides: Record<string, ToleranceGuide> = {
  "sac-bukum-kesim-hesaplayici": {
    title: "Sac büküm ve kesim tasarım kontrolleri",
    intro: "V kalıp, punch, giyotin bıçak boşluğu ve takım yükü için ön seçimden sonra üretici kapasitesi ve gerçek imalat şartları doğrulanmalıdır.",
    standards: [
      "WILA / Wilson Tool air bending kuvvet tabloları",
      "Makine üreticisi tonaj ve bıçak boşluğu tablosu",
      "Takım üreticisi izin verilen ton/metre kapasitesi",
      "Malzeme sertifikası ve firma içi büküm tablosu",
    ],
    fitCards: [
      { label: "Genel V açıklığı", value: "6t–12t", use: "Air bending başlangıç aralığı." },
      { label: "Minimum flanş", value: "≈ 0,7V", use: "Sacın kalıp omuzlarında güvenli oturması için ön kontrol." },
      { label: "Doğal iç radius", value: "≈ kᵣ × V", use: "Malzeme türüne göre yaklaşık air-bending radiusu." },
      { label: "Takım yükü", value: "ton/m", use: "Makine toplam tonajından ayrı kontrol edilmelidir." },
    ],
    rows: [
      { item: "V kalıp açıklığı", tolerance: "Mevcut standart V", note: "Hedef radius, flanş ve makine tonajı birlikte değerlendirilir." },
      { item: "Punch uç radiusu", tolerance: "Katalog aralığı", note: "Air bending doğal radiusundan büyük punch ucu sonucu değiştirebilir." },
      { item: "Alt kalıp omuz radiusu", tolerance: "Takım üreticisi değeri", note: "İz, sürtünme ve küçük flanş davranışını etkiler." },
      { item: "Kalıp gövde kesiti", tolerance: "Gerilme / FEA", note: "Yalnız sac kalınlığından türetilmemelidir." },
      { item: "İzin verilen takım yükü", tolerance: "ton/m", note: "Hesaplanan emniyetli çizgisel yükten büyük olmalıdır." },
      { item: "Giyotin bıçak boşluğu", tolerance: "Makine tablosu", note: "Malzeme, sertlik, kalınlık ve kesim kalitesine göre ayarlanır." },
    ],
    notes: [
      "Hesaplar 90° air bending ve ön kesme hesabı içindir; bottoming/coining için kullanılmamalıdır.",
      "Kalıp yüksekliği, taban genişliği, bağlama geometrisi ve segment boyu makine standardına göre belirlenmelidir.",
      "Seri üretimde ilk parça bükümü ve kesim denemesiyle açı, radius, açınım ve çapak sonucu doğrulanmalıdır.",
    ],
  },
  "mil-mukavemet-hesaplama": {
    title: "Mil geçme toleransları",
    intro: "Mil çapı sonucundan sonra geçme sınıfı seçimi yapılmalıdır.",
    standards: commonSources,
    fitCards: [
      { label: "Kayar", value: "H7/g6", use: "Kolay sökme, düşük zorlanma." },
      { label: "Normal merkezleme", value: "H7/h6", use: "Genel mil-göbek eşleşmesi." },
      { label: "Geçiş", value: "H7/k6", use: "Az boşluk, iyi merkezleme." },
      { label: "Sıkı", value: "H7/m6 - H7/p6", use: "Yüksek tork, darbe veya kayma riski." },
    ],
    rows: [
      { item: "Fonksiyonel mil çapı", tolerance: "h6 / h7", note: "Tornalı-taşlanmış mil yüzeyi için başlangıç sınıfı." },
      { item: "Göbek deliği", tolerance: "H7 / H8", note: "Raybalı veya hassas işlenmiş deliklerde yaygın başlangıç." },
      { item: "Serbest yüzey", tolerance: "h11 / h12", note: "Geçme gerekmeyen çaplarda ekonomik işleme." },
      { item: "Rulman oturma", tolerance: "h6 / j6 / k6", note: "Yük yönü ve bilezik dönüşüne göre seçilir." },
      { item: "Kaplama sonrası çap", tolerance: "Son ölçüye göre", note: "Boya, krom, galvaniz veya nitrasyon ölçüyü değiştirebilir." },
      { item: "Salgı kontrolü", tolerance: "Resimde ayrı ver", note: "Geçme toleransı salgı toleransının yerine geçmez." },
    ],
    notes: commonNotes,
  },

  "kama-kanali-hesaplama": {
    title: "Kama kanalı toleransları",
    intro: "Kama ölçüsünden sonra mil kanalı, göbek kanalı ve hazır kama toleransı seçilmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Normal kama", value: "b: h9", use: "Hazır kama genişliği için pratik başlangıç." },
      { label: "Mil kanalı", value: "N9 / P9", use: "Boşluğu azaltmak veya sıkı oturma istemek için." },
      { label: "Göbek kanalı", value: "JS9 / H9", use: "Sökülebilir ve genel bağlantılar için." },
      { label: "Kayar bağlantı", value: "D10 / H9", use: "Eksenel hareket veya ayarlı göbeklerde." },
    ],
    rows: [
      { item: "Kama genişliği", tolerance: "h9", note: "Hazır kama kullanılıyorsa önce gerçek kama ölçüsü kontrol edilir." },
      { item: "Mil kanal genişliği", tolerance: "P9 / N9", note: "Darbeli tahrikte boşluğu azaltmak için düşünülür." },
      { item: "Göbek kanal genişliği", tolerance: "JS9 / H9", note: "Genel makine bağlantılarında sökülebilirlik sağlar." },
      { item: "Kanal derinliği", tolerance: "t1 / t2 özel", note: "Derinlik hatası mil kesitini ve göbek oturmasını etkiler." },
      { item: "Göbek deliği", tolerance: "H7 / H8", note: "Mil geçmesiyle birlikte seçilir." },
      { item: "Mil çapı", tolerance: "h6 / k6", note: "Sökülebilirlik ve tork ihtiyacına göre belirlenir." },
    ],
    notes: commonNotes,
  },

  "disli-carki-hesaplama": {
    title: "Dişli çark toleransları",
    intro: "Dişli geometrisinden sonra göbek deliği, mil geçmesi, kama ve salgı kontrolü belirlenmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Göbek deliği", value: "H7 / H8", use: "Mil üzerinde merkezleme için." },
      { label: "Mil tarafı", value: "h6 / k6", use: "Sökülebilir veya geçiş oturma." },
      { label: "Sıkı bağlantı", value: "m6 / p6", use: "Darbeli, ters yönlü veya yüksek torklu sistem." },
      { label: "Kama kanalı", value: "JS9 / P9", use: "Boşluk karakterine göre seçilir." },
    ],
    rows: [
      { item: "Dişli göbek deliği", tolerance: "H7 / H8", note: "Salgı ve merkezleme için delik kalitesi önemlidir." },
      { item: "Mil çapı", tolerance: "h6 / k6 / m6", note: "Tork, sökme ihtiyacı ve çalışma yönüne göre seçilir." },
      { item: "Kama", tolerance: "h9", note: "Hazır kama genişliğiyle kanal uyumu kontrol edilir." },
      { item: "Kama kanalı", tolerance: "JS9 / P9", note: "Boşluk ve vuruntu riskine göre seçilir." },
      { item: "Diş salgısı", tolerance: "Ayrı ver", note: "Geçme toleransı dişli salgısını tek başına garanti etmez." },
      { item: "Eksen mesafesi", tolerance: "Özel tolerans", note: "Yan boşluk, ses ve ısınmayı etkiler." },
    ],
    notes: commonNotes,
  },

  "rulman-omru-hesaplama": {
    title: "Rulman oturma toleransları",
    intro: "Rulman ömründen sonra mil-yuva oturması ve iç boşluk kontrolü gerekir.",
    standards: commonSources,
    fitCards: [
      { label: "Mil kolay sökme", value: "h6", use: "Hafif yük, bakım odaklı uygulama." },
      { label: "Mil geçiş", value: "j6 / k6", use: "Genel dönen iç bilezik uygulamaları." },
      { label: "Mil sıkı", value: "m6 / n6", use: "Yüksek yük veya sürünme riski." },
      { label: "Yuva", value: "H7 / J7 / K7", use: "Dış bilezik yük durumuna göre." },
    ],
    rows: [
      { item: "İç bilezik - mil", tolerance: "h6 / j6 / k6 / m6", note: "Bileziğe göre dönen yükte daha sıkı sınıf gerekebilir." },
      { item: "Dış bilezik - yuva", tolerance: "H7 / J7 / K7", note: "Gövde malzemesi ve yük yönü etkiler." },
      { item: "Omuz çapı", tolerance: "Katalogdan", note: "Rulman pahı ve omuz yüksekliği uyumlu olmalıdır." },
      { item: "Yuva genişliği", tolerance: "H8 / H9", note: "Sıkıştırma veya eksenel gezme durumuna göre değerlendirilir." },
      { item: "Salgı", tolerance: "Ayrı ver", note: "Yüksek devirde mil ve yatak salgısı kritik hale gelir." },
      { item: "İç boşluk", tolerance: "C2 / CN / C3", note: "Sıkı geçme ve sıcaklık iç boşluğu azaltabilir." },
    ],
    notes: commonNotes,
  },

  "yay-hesaplama": {
    title: "Yay toleransları",
    intro: "Yay hesabından sonra tel çapı, serbest boy ve kuvvet toleransı seçilmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Kuvvet", value: "±5% / ±10%", use: "Kritik yaylarda ölçüden çok kuvvet kabulü." },
      { label: "Serbest boy", value: "Özel ±mm", use: "Ön yük ve strok için." },
      { label: "Dış çap", value: "Yuva boşluğuna göre", use: "Sürtme ve sıkışma riskini azaltır." },
      { label: "Tel çapı", value: "Tedarikçi tol.", use: "Rijitliğe en çok etki eden ölçü." },
    ],
    rows: [
      { item: "Tel çapı", tolerance: "Tedarikçi sınıfı", note: "Küçük tel sapması kuvvet sonucunu büyütür." },
      { item: "Dış çap", tolerance: "Yuva boşluğu", note: "Kılavuzlu yayda sürtme bırakılmamalıdır." },
      { item: "Serbest boy", tolerance: "±0,5 / ±1 mm", note: "Yay boyuna göre özel seçilmelidir." },
      { item: "Kuvvet", tolerance: "±5% / ±10%", note: "Belirli sıkışma boyunda test edilmelidir." },
      { item: "Diklik", tolerance: "Özel ver", note: "Taşlanmış uçlu yaylarda önemlidir." },
      { item: "Malzeme", tolerance: "Föy ile", note: "Tel standardı ve yüzey işlemi belirtilmelidir." },
    ],
    notes: commonNotes,
  },

  "boru-eti-hesaplama": {
    title: "Boru toleransları",
    intro: "Et hesabından sonra dış çap, et kalınlığı ve ovalite kontrol edilmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Et kalınlığı", value: "Min. et", use: "Nominal değil, alt sınır dikkate alınır." },
      { label: "Dış çap", value: "OD tol.", use: "Flanş, kelepçe ve conta uyumu için." },
      { label: "Ovalite", value: "Özel kontrol", use: "Sızdırmaz bağlantıda önemlidir." },
      { label: "Korozyon", value: "+ pay", use: "Servis şartına göre eklenir." },
    ],
    rows: [
      { item: "Et kalınlığı", tolerance: "Alt tolerans", note: "Teorik minimumun üstünde nominal boru seçilmelidir." },
      { item: "Dış çap", tolerance: "Boru standardı", note: "Bağlantı elemanına göre doğrulanır." },
      { item: "Ovalite", tolerance: "Özel ver", note: "Conta ve kelepçede kaçak riskini etkiler." },
      { item: "Flanş deliği", tolerance: "H13 / H14", note: "Cıvata geçiş deliği için kaba tolerans yeterli olabilir." },
      { item: "Pim/dübel deliği", tolerance: "H7 / H8", note: "Merkezleme gereken bağlantıda kullanılır." },
      { item: "Korozyon payı", tolerance: "+mm", note: "Akışkan ve çalışma süresine göre belirlenir." },
    ],
    notes: commonNotes,
  },

  "kaynak-dikisi-hesaplama": {
    title: "Kaynak ölçü ve kalite toleransları",
    intro: "Kaynak hesabından sonra boğaz ölçüsü, uzunluk ve kalite sınıfı yazılmalıdır.",
    standards: commonSources,
    fitCards: [
      { label: "Kalite seviyesi", value: "B / C / D", use: "Kritiklik arttıkça kabul seviyesi sıkılaşır." },
      { label: "Boğaz ölçüsü", value: "a ölçüsü", use: "Taşıyıcı kesit için ana ölçü." },
      { label: "Dikiş uzunluğu", value: "L ±mm", use: "Etkin kaynak boyu kontrol edilir." },
      { label: "Muayene", value: "VT / PT / MT / UT", use: "Parça riskine göre seçilir." },
    ],
    rows: [
      { item: "Köşe kaynak boğazı", tolerance: "a min.", note: "Eksik boğaz kapasiteyi doğrudan düşürür." },
      { item: "Bacak ölçüsü", tolerance: "z ölçüsü", note: "Saha ölçümünde daha pratik olabilir." },
      { item: "Dikiş uzunluğu", tolerance: "L özel", note: "Başlangıç ve bitiş bölgeleri ayrıca değerlendirilir." },
      { item: "Kusur kabulü", tolerance: "B / C / D", note: "Statik ve yorulmalı bağlantı aynı kabulü gerektirmez." },
      { item: "Kaynak ağzı", tolerance: "Açı + kök", note: "Nüfuziyet için resimde yazılmalıdır." },
      { item: "Çarpılma", tolerance: "Özel ver", note: "İnce sac ve uzun dikişte ölçüyü bozar." },
    ],
    notes: commonNotes,
  },

  "kayis-kasnak-hesaplama": {
    title: "Kayış-kasnak toleransları",
    intro: "Kasnak hesabından sonra göbek deliği, mil geçmesi, kama ve hizalama toleransı belirlenmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Kasnak deliği", value: "H7 / H8", use: "Mil üzerinde merkezleme." },
      { label: "Mil", value: "h6 / k6", use: "Sökülebilir veya geçiş oturma." },
      { label: "Kama", value: "h9 + JS9/P9", use: "Kama ve kanal uyumu." },
      { label: "Hizalama", value: "Açı + paralel", use: "Kayış ömrü için." },
    ],
    rows: [
      { item: "Kasnak göbek deliği", tolerance: "H7 / H8", note: "Salgı ve titreşim için önemlidir." },
      { item: "Mil çapı", tolerance: "h6 / k6 / m6", note: "Tork ve sökme ihtiyacına göre seçilir." },
      { item: "Kama genişliği", tolerance: "h9", note: "Hazır kama ile uyumlu olmalıdır." },
      { item: "Kama kanalı", tolerance: "JS9 / P9", note: "Boşluk karakterine göre seçilir." },
      { item: "Eksen mesafesi", tolerance: "Ayar payı", note: "Gerdirme için slot veya tabla bırakılır." },
      { item: "Kasnak hizası", tolerance: "Özel ver", note: "Açısal/paralel kaçıklık kayışı bozar." },
    ],
    notes: commonNotes,
  },


  "levha-agirlik-hesaplama": {
    title: "Sac/levha toleransları",
    intro: "Ağırlık hesabından sonra kalınlık, kesim ve delik toleransı belirtilmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Genel ölçü", value: "ISO 2768-m", use: "Genel sac parça başlangıcı." },
      { label: "Hassas ölçü", value: "ISO 2768-f", use: "Montaj kritik ölçüler için." },
      { label: "Cıvata deliği", value: "H13 / H14", use: "Geçiş delikleri." },
      { label: "Pim deliği", value: "H7 / H8", use: "Merkezleme gereken delikler." },
    ],
    rows: [
      { item: "Kalınlık", tolerance: "Sac standardı", note: "Nominal ve gerçek kalınlık farklı olabilir." },
      { item: "Lazer kesim ölçü", tolerance: "ISO 2768-m/f", note: "Kritik ölçüler ayrıca sıkılaştırılır." },
      { item: "Cıvata geçiş deliği", tolerance: "H13 / H14", note: "Konum toleransı da gerekebilir." },
      { item: "Pim/dübel deliği", tolerance: "H7 / H8", note: "Rayba veya hassas işlem gerekebilir." },
      { item: "Büküm ölçüsü", tolerance: "Özel ver", note: "Kalıp, R ve malzeme yönü etkiler." },
      { item: "Çapak/pah", tolerance: "Notla belirt", note: "Montaj ve iş güvenliği için yazılır." },
    ],
    notes: commonNotes,
  },

  "baklavali-sac-agirlik-hesaplama": {
    title: "Baklavalı sac toleransları",
    intro: "Baklavalı sacda taban kalınlığı, desen yüksekliği ve kesim ölçüsü ayrıca kontrol edilir.",
    standards: commonSources,
    fitCards: [
      { label: "Taban kalınlığı", value: "Tedarikçi tol.", use: "Ağırlığı belirleyen ana ölçü." },
      { label: "Kesim ölçüsü", value: "ISO 2768-m", use: "Genel kesim parçaları." },
      { label: "Hassas delik", value: "H7 / H8", use: "Merkezleme gereken yerlerde." },
      { label: "Geçiş deliği", value: "H13 / H14", use: "Cıvata geçiş uygulamaları." },
    ],
    rows: [
      { item: "Taban kalınlığı", tolerance: "Üretici değeri", note: "Desen dahil toplam yükseklikle karıştırılmamalıdır." },
      { item: "Desen yüksekliği", tolerance: "Üretici değeri", note: "Ağırlığı ve zemin yüksekliğini etkiler." },
      { item: "Kesim en-boy", tolerance: "ISO 2768-m", note: "Kritik montajda özel ölçü verilir." },
      { item: "Cıvata deliği", tolerance: "H13 / H14", note: "Sahada montaj kolaylığı sağlar." },
      { item: "Pim deliği", tolerance: "H7 / H8", note: "Merkezleme gerekiyorsa hassas işlenir." },
      { item: "Kantar ağırlığı", tolerance: "Gerçek değer", note: "Teorik hesap satın alma teyidi değildir." },
    ],
    notes: commonNotes,
  },

  "tork-hesaplama": {
    title: "Tork bağlantı toleransları",
    intro: "Tork sonucundan sonra bağlantının boşluk, geçme ve yüzey basıncı kontrol edilmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Kayar bağlantı", value: "H7/g6", use: "Düşük tork, kolay sökme." },
      { label: "Normal", value: "H7/h6", use: "Genel merkezleme." },
      { label: "Geçiş", value: "H7/k6", use: "Boşluğu azaltma." },
      { label: "Sıkı", value: "H7/m6", use: "Darbeli veya yüksek tork." },
    ],
    rows: [
      { item: "Tork aktaran mil", tolerance: "h6 / k6 / m6", note: "Tork ve sökme ihtiyacına göre." },
      { item: "Göbek deliği", tolerance: "H7 / H8", note: "Merkezleme için delik tarafı belirlenir." },
      { item: "Kama", tolerance: "h9", note: "Hazır kama toleransı kontrol edilir." },
      { item: "Kama kanalı", tolerance: "JS9 / P9", note: "Boşluk/vuruntu riskine göre." },
      { item: "Cıvata deliği", tolerance: "H13 / H14", note: "Geçiş deliği için kullanılabilir." },
      { item: "Setskur düzlüğü", tolerance: "Özel ver", note: "Gevşeme ve yüzey ezilmesi dikkate alınır." },
    ],
    notes: commonNotes,
  },

  "basinc-hesaplama": {
    title: "Basınçlı parça toleransları",
    intro: "Basınç hesabından sonra conta yüzeyi, delik ve yüzey kalitesi seçilmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Conta yüzeyi", value: "Ra + düzlük", use: "Sızdırmazlık için." },
      { label: "Merkezleme deliği", value: "H7 / H8", use: "Pim veya yataklama için." },
      { label: "Cıvata deliği", value: "H13 / H14", use: "Flanş geçiş delikleri." },
      { label: "Test", value: "Basınç sınırı", use: "İşletme ve test ayrı yazılır." },
    ],
    rows: [
      { item: "Conta oturma yüzeyi", tolerance: "Ra + düzlük", note: "Kaçak riskini doğrudan etkiler." },
      { item: "Flanş cıvata deliği", tolerance: "H13 / H14", note: "Geçiş deliği, konumla birlikte değerlendirilir." },
      { item: "Merkezleme çapı", tolerance: "H7 / h6", note: "Erkek-dişi merkezleme varsa." },
      { item: "Basınç yüzeyi", tolerance: "Özel ölçü", note: "Gerçek temas alanı nominalden farklı olabilir." },
      { item: "Paralellik", tolerance: "Özel ver", note: "Conta ezilmesini dengeler." },
      { item: "Test basıncı", tolerance: "Ayrı değer", note: "İşletme basıncıyla aynı yazılmamalıdır." },
    ],
    notes: commonNotes,
  },

  "celik-profil-agirligi": {
    title: "Profil imalat toleransları",
    intro: "Profil ağırlığından sonra boy kesimi, delik ve kaynak hazırlığı belirlenmelidir.",
    standards: commonSources,
    fitCards: [
      { label: "Genel ölçü", value: "ISO 2768-m", use: "Konstrüksiyon parçaları." },
      { label: "Hassas ölçü", value: "ISO 2768-f", use: "Montaj referansları." },
      { label: "Cıvata deliği", value: "H13 / H14", use: "Geçiş deliği." },
      { label: "Pim deliği", value: "H7 / H8", use: "Konumlama için." },
    ],
    rows: [
      { item: "Profil boyu", tolerance: "ISO 2768-m/f", note: "Montaj hassasiyetine göre." },
      { item: "Cıvata deliği", tolerance: "H13 / H14", note: "Konum toleransı ayrıca gerekebilir." },
      { item: "Pim/dübel deliği", tolerance: "H7 / H8", note: "Rayba veya hassas delik işlemi gerekebilir." },
      { item: "Kaynak ağzı", tolerance: "Açı + kök", note: "Nüfuziyet için yazılır." },
      { item: "Doğrusallık", tolerance: "Özel ver", note: "Uzun şasede montajı etkiler." },
      { item: "Kaplama sonrası", tolerance: "Son ölçü", note: "Galvaniz ve boya delik ölçüsünü etkileyebilir." },
    ],
    notes: commonNotes,
  },


  "viskozite-donusumu": {
    title: "Viskozite ölçüm toleransları",
    intro: "Viskozite dönüşümünden sonra sıcaklık, yoğunluk ve ölçüm yöntemi aynı olmalıdır.",
    standards: commonSources,
    fitCards: [
      { label: "Sıcaklık", value: "40°C / 100°C", use: "Yağlarda referans sıcaklık önemli." },
      { label: "Yoğunluk", value: "ρ değeri", use: "cSt-cP dönüşümünde." },
      { label: "Cihaz", value: "Kalibrasyon", use: "Ölçüm güvenilirliği." },
      { label: "Yağ sınıfı", value: "ISO VG", use: "Üretici föyüyle kontrol." },
    ],
    rows: [
      { item: "Referans sıcaklık", tolerance: "40°C / 100°C", note: "Değerin hangi sıcaklıkta olduğu yazılmalıdır." },
      { item: "Yoğunluk", tolerance: "Föy değeri", note: "Varsayılan yoğunluk hatayı büyütebilir." },
      { item: "Ölçüm cihazı", tolerance: "Kalibre", note: "Laboratuvar ve saha sonucu farklı olabilir." },
      { item: "Yağ sınıfı", tolerance: "ISO VG", note: "Uygulama sıcaklığıyla birlikte seçilir." },
      { item: "Kirlenme", tolerance: "Kontrol", note: "Su ve partikül viskoziteyi değiştirir." },
      { item: "Kabul", tolerance: "Üretici aralığı", note: "Makine üreticisinin aralığı esas alınır." },
    ],
    notes: commonNotes,
  },

  "guc-verim-hesaplama": {
    title: "Güç aktarım toleransları",
    intro: "Güç-verim hesabından sonra hizalama, boşluk ve ısı kontrolü gerekir.",
    standards: commonSources,
    fitCards: [
      { label: "Kaplin deliği", value: "H7 / H8", use: "Mil oturması için." },
      { label: "Mil", value: "h6 / k6", use: "Aktarma göbeği." },
      { label: "Kama", value: "h9 + JS9/P9", use: "Moment aktarımı." },
      { label: "Hizalama", value: "Özel tolerans", use: "Verim ve ömür için." },
    ],
    rows: [
      { item: "Kaplin/kasnak deliği", tolerance: "H7 / H8", note: "Aktarma elemanında merkezleme sağlar." },
      { item: "Mil çapı", tolerance: "h6 / k6 / m6", note: "Tork ve sökülebilirlik belirler." },
      { item: "Kama", tolerance: "h9", note: "Kanal uyumu kontrol edilir." },
      { item: "Kama kanalı", tolerance: "JS9 / P9", note: "Boşluk ve vuruntu riskine göre." },
      { item: "Hizalama", tolerance: "Özel ver", note: "Kötü hizalama kayıp gücü artırır." },
      { item: "Isıl genleşme", tolerance: "Kontrol", note: "Sıcak çalışma boşlukları değiştirir." },
    ],
    notes: commonNotes,
  },

  "termal-iletim-hesaplama": {
    title: "Termal temas toleransları",
    intro: "Termal hesaplarda yüzey teması, kalınlık ve sıkma şartı sonucu ciddi etkiler.",
    standards: commonSources,
    fitCards: [
      { label: "Kalınlık", value: "±mm", use: "Isı direncini doğrudan değiştirir." },
      { label: "Yüzey", value: "Ra değeri", use: "Temas direnci için." },
      { label: "Düzlük", value: "Özel ver", use: "Boşlukları azaltır." },
      { label: "Sıkma", value: "Tork değeri", use: "Temas kalitesini etkiler." },
    ],
    rows: [
      { item: "Plaka kalınlığı", tolerance: "±mm", note: "Hesap sonucuna direkt etki eder." },
      { item: "Temas yüzeyi", tolerance: "Ra özel", note: "Kaba yüzey temas direncini artırır." },
      { item: "Düzlük", tolerance: "Özel ver", note: "İyi temas için kritik olabilir." },
      { item: "Cıvata deliği", tolerance: "H13 / H14", note: "Geçiş deliği için." },
      { item: "Merkezleme deliği", tolerance: "H7 / H8", note: "Termal plaka konumlamasında." },
      { item: "Sıkma torku", tolerance: "Montaj notu", note: "Yetersiz sıkma ısı geçişini bozar." },
    ],
    notes: commonNotes,
  },

  "devir-frekans-donusumu": {
    title: "Dönen parça toleransları",
    intro: "Devir yükseldikçe oturma, salgı, balans ve hizalama daha kritik olur.",
    standards: commonSources,
    fitCards: [
      { label: "Rulman mili", value: "h6 / k6", use: "Yük ve devir durumuna göre." },
      { label: "Göbek deliği", value: "H7 / H8", use: "Kasnak/fan/kaplin için." },
      { label: "Sıkı oturma", value: "m6 / p6", use: "Yüksek devir ve gevşeme riski." },
      { label: "Salgı", value: "Özel ver", use: "Titreşim kontrolü için." },
    ],
    rows: [
      { item: "Mil çapı", tolerance: "h6 / k6 / m6", note: "Devir ve yük arttıkça seçim sıkılaşabilir." },
      { item: "Göbek deliği", tolerance: "H7 / H8", note: "Dönen parçanın merkezlenmesi için." },
      { item: "Rulman oturma", tolerance: "h6 / j6 / k6", note: "Üretici katalog önerisiyle seçilir." },
      { item: "Salgı", tolerance: "Özel tolerans", note: "Yüksek devirde zorunlu kontrol olur." },
      { item: "Balans", tolerance: "Kalite sınıfı", note: "Çap ve devir arttıkça gerekir." },
      { item: "Muhafaza", tolerance: "Güvenlik", note: "Yüksek devirli parçada korunma düşünülür." },
    ],
    notes: commonNotes,
  },
};

export function getToleranceGuide(slug: string): ToleranceGuide | undefined {
  return toleranceGuides[slug];
}

export function hasToleranceGuide(slug: string): boolean {
  return Boolean(toleranceGuides[slug]);
}
