import type { Tool } from '@/data/tools';
import type { BlogPost } from '@/data/blogPosts';

export type ToolSeoSection = {
  heading: string;
  body: string[];
  list?: string[];
};

export type ToolSeoContent = {
  useCaseTitle: string;
  intro: string[];
  sections: ToolSeoSection[];
  faq: { question: string; answer: string }[];
  howTo: { name: string; text: string }[];
};

const categoryPurpose: Record<string, string> = {
  makine: 'makine tasarımı, teknik resim hazırlığı, imalat ön kontrolü ve parça seçimi süreçlerinde',
  cevirici: 'mühendislik hesaplarında kullanılan birimleri hızlı ve hatasız dönüştürme sürecinde',
  elektrik: 'elektrik tesisatı, pano, kablo, güç ve temel devre ön hesabı süreçlerinde',
  insaat: 'metraj, malzeme ağırlığı, ön keşif ve yapı uygulama hesabı süreçlerinde',
  endustri: 'üretim planlama, kapasite, verimlilik ve süreç iyileştirme hesaplarında',
  kimya: 'çözelti hazırlama, akışkan özellikleri ve proses ön hesaplarında',
  cevre: 'enerji üretimi, emisyon ve sürdürülebilirlik ön değerlendirmelerinde',
  yazilim: 'SLA, kullanılabilirlik ve teknik operasyon planlama hesaplarında',
  genel: 'günlük hesap, ticari kontrol, maliyet ve pratik mühendislik yardımcı hesaplarında',
};

const categoryChecks: Record<string, string[]> = {
  makine: [
    'Nominal ölçü, tolerans ve çalışma şartını birlikte değerlendirin.',
    'Sonucu teknik resme aktarmadan önce ilgili standart, katalog veya firma içi talimatla doğrulayın.',
    'Kritik parçalarda yalnızca hesap sonucuna değil, yük, malzeme, montaj ve servis koşullarına da bakın.',
  ],
  cevirici: [
    'Girdi birimini ve çıktı birimini aynı fiziksel büyüklük içinde seçin.',
    'Hesap sonucunu teknik dokümana yazarken birimi mutlaka belirtin.',
    'Yuvarlama hassasiyetini işin ihtiyacına göre değerlendirin.',
  ],
  elektrik: [
    'Gerilim, akım, güç ve faz bilgilerini doğru girdiğinizden emin olun.',
    'Sonucu uygulamaya almadan önce yerel yönetmelik, standart ve güvenlik gerekliliklerini kontrol edin.',
    'Kablo, koruma elemanı ve ekipman seçiminde ortam sıcaklığı, mesafe ve yük tipi dikkate alınmalıdır.',
  ],
  insaat: [
    'Ölçüleri aynı birim sistemiyle girin ve metrajı uygulama fireleriyle birlikte değerlendirin.',
    'Malzeme yoğunluğu, kesit tipi ve uygulama şartı sonucu değiştirebilir.',
    'Kesin imalat veya satın alma öncesi saha ölçüsü ve proje detayı kontrol edilmelidir.',
  ],
  endustri: [
    'Vardiya, planlı duruş, çevrim süresi ve üretim adedi verilerini aynı dönemden alın.',
    'Teorik kapasite ile fiili kapasiteyi ayrı değerlendirin.',
    'Sonucu darboğaz, kalite kaybı ve plansız duruş kayıtlarıyla doğrulayın.',
  ],
  kimya: [
    'Konsantrasyon, hacim ve sıcaklık birimlerini aynı sistemde kullanın.',
    'Saflık, yoğunluk ve sıcaklığa bağlı özellikleri gerekiyorsa ayrıca düzeltin.',
    'Laboratuvar ve proses uygulamalarında güvenlik bilgi formu ile prosedürü esas alın.',
  ],
  cevre: [
    'Tüketim ve üretim verilerini aynı tarih aralığı için kullanın.',
    'Emisyon faktörü veya güneşlenme verisinin kaynağını not edin.',
    'Sonucu saha ölçümü ve güncel resmi katsayılarla doğrulayın.',
  ],
  yazilim: [
    'Ölçüm dönemini ve planlı bakım sürelerini açık biçimde tanımlayın.',
    'Yüzde değerleri ile dakika/saat karşılıklarını birlikte kontrol edin.',
    'SLA sonucunu izleme sistemindeki gerçek kesinti kayıtlarıyla karşılaştırın.',
  ],
  genel: [
    'Girdi değerlerini kontrol edin ve sonucu kullanım amacına göre yuvarlayın.',
    'Maliyet, oran veya genel hesaplarda varsayımları ayrıca not edin.',
    'Sonucu kayıt altına alırken tarih ve açıklama eklemek tekrar kontrolü kolaylaştırır.',
  ],
};

const specific: Record<string, Partial<ToolSeoContent>> = {
  'sac-bukum-kesim-hesaplayici': {
    useCaseTitle: 'Sac büküm, V kalıp seçimi ve giyotin kesme ön hesabı',
    intro: [
      'Sac Büküm ve Kesim Hesaplayıcı; 90° air bending için abkant tonajı, V kalıp açıklığı, doğal iç radius, minimum flanş, açınım ve giyotin kesme kuvvetini aynı ekranda kontrol eder.',
      'Kalıp tasarımı sekmesi, yalnız sac kalınlığına bakarak kesin takım gövdesi üretmek yerine gerekli ton/metre yükünü ve geometrik başlangıç değerlerini gösterir. Kalıp yüksekliği, taban genişliği ve gövde et kalınlığı takım kapasitesi ve kesit hesabıyla doğrulanmalıdır.',
    ],
    sections: [
      {
        heading: 'V kalıp açıklığı nasıl seçilir?',
        body: [
          'Genel air bending uygulamalarında V açıklığı sac kalınlığının yaklaşık 6–12 katı aralığında seçilir. Daha dar V açıklığı daha küçük radius oluşturabilir ancak tonajı ve iz riskini artırır.',
          'Daha geniş V açıklığı gerekli kuvveti azaltır; buna karşılık doğal iç radius ve bükülebilir minimum flanş büyür. Bu nedenle sadece makine tonajına göre değil, parça geometrisine göre de seçim yapılmalıdır.',
        ],
        list: [
          'Malzeme ve sac kalınlığını seçin.',
          'Parçanın minimum flanş ve hedef iç radius değerlerini kontrol edin.',
          'Makine kapasitesi ile takımın izin verilen ton/metre yükünü ayrı ayrı doğrulayın.',
        ],
      },
      {
        heading: 'Kalıp tasarım sonucunda hangi değerler ön bilgidir?',
        body: [
          'V açıklığı, yaklaşık doğal iç radius, minimum flanş ve gerekli tonaj hızlı ön seçim için kullanılabilir.',
          'Punch uç radiusu ve alt kalıp omuz radiusu başlangıç aralığı verir. Kalıp gövdesinin et kalınlığı, yüksekliği, bağlantı bölgesi ve ısıl işlemi yalnız sac kalınlığından hesaplanamaz; gerçek kesit ve yük durumuna göre tasarlanmalıdır.',
        ],
      },
      {
        heading: 'Giyotin hesabı nasıl değerlendirilir?',
        body: [
          'Giyotin kesme kuvveti malzeme dayanımı, sac kalınlığı ve bıçak açısına bağlıdır. Bıçak açısı aynı anda kesilen boyu azaltarak anlık kuvveti düşürür.',
          'Bıçak boşluğu için gösterilen değer başlangıç önerisidir. Makinenin kendi otomatik veya üretici tablosundaki boşluk ayarı nihai referans olmalıdır.',
        ],
      },
    ],
    faq: [
      { question: '3 mm sac için kaç mm V kalıp kullanılır?', answer: 'Genel başlangıç seçimi 8 × t yaklaşımıyla yaklaşık 24 mm V açıklığıdır. Hedef radius, minimum flanş, malzeme ve takım kapasitesine göre 18, 24, 30 veya 36 mm gibi alternatifler karşılaştırılmalıdır.' },
      { question: 'Kalıp yüksekliği sac kalınlığından hesaplanabilir mi?', answer: 'Tek başına hesaplanamaz. Kalıp boyu, izin verilen ton/metre yükü, takım çeliği, ısıl işlem, bağlama standardı ve kesit gerilmesi birlikte değerlendirilmelidir.' },
      { question: 'Hesap bottoming veya coining için kullanılabilir mi?', answer: 'Hayır. Araç öncelikle 90° air bending hesabı içindir. Bottoming ve coining çok daha yüksek tonaj ve farklı takım koşulları gerektirir.' },
      { question: 'Giyotin bıçak boşluğu kesin değer midir?', answer: 'Hayır. Gösterilen değer malzeme ve kalınlığa bağlı başlangıç değeridir. Makine üreticisinin ayar tablosu ve kesim denemesiyle doğrulanmalıdır.' },
    ],
    howTo: [
      { name: 'Malzemeyi ve sac kalınlığını seçin', text: 'Bükülecek veya kesilecek sacın malzeme sınıfını ve gerçek kalınlığını girin.' },
      { name: 'Büküm boyu ve V açıklığını belirleyin', text: 'Otomatik V oranını kullanın veya mevcut kalıbın gerçek V açıklığını manuel girin.' },
      { name: 'Makine ve takım kapasitesini kontrol edin', text: 'Makine toplam tonajını ve kalıbın izin verilen ton/metre yükünü ayrı alanlara girin.' },
      { name: 'Radius, flanş ve tonaj sonuçlarını karşılaştırın', text: 'Kalıp alternatifleri tablosundan parça geometrisine ve kapasiteye uygun seçeneği değerlendirin.' },
      { name: 'Üretici tablosuyla doğrulayın', text: 'Nihai seçimden önce makine ve takım üreticisinin güncel katalog değerlerini kontrol edin.' },
    ],
  },
  'iso-gecme-tolerans-hesaplama': {
    useCaseTitle: 'Mil delik toleransı ve geçme seçimi için pratik kullanım',
    intro: [
      'Mil delik toleransı, parçaların montaj karakterini doğrudan belirler. Aynı nominal çapta bile H7, H8, h6, g6 veya JS9 gibi tolerans alanları farklı boşluk ve sıkılık davranışı oluşturur.',
      'Bu araç, geçme seçimi yaparken ölçü, tolerans sınıfı ve teknik resim çağrısını hızlı kontrol etmek isteyen tasarımcılar için hazırlanmıştır.',
    ],
    sections: [
      {
        heading: 'Geçme toleransı seçerken nelere bakılır?',
        body: [
          'Geçme seçimi sadece nominal ölçüye göre yapılmamalıdır. Parçanın döneceği, kayacağı, presleneceği veya sökülebilir olması tolerans seçimini değiştirir.',
          'Hassas merkezleme gereken bölgelerde daha dar toleranslar tercih edilirken, kolay montaj ve servis ihtiyacı olan bağlantılarda daha kontrollü boşluklar gerekebilir.',
        ],
        list: ['Fonksiyon: dönen, kayan, merkezleyen veya sabitleyen yüzey.', 'Montaj tipi: elle geçme, pres geçme, ısıtma/soğutma ile montaj.', 'Üretim maliyeti: dar tolerans genellikle daha yüksek işlem maliyeti oluşturur.'],
      },
    ],
  },
  'kama-kanali-hesaplama': {
    useCaseTitle: 'Mil çapına göre kama kanalı ölçüsü ve teknik çağrı',
    intro: [
      'Kama kanalı hesabı, mil ile göbek arasında tork aktarımı yapılacak bağlantılarda en sık kullanılan mekanik tasarım kontrollerinden biridir.',
      'Bu araç mil çapına göre önerilen kama ölçüsünü, kanal bilgisini ve teknik resme aktarılabilecek çağrı metnini hızlıca hazırlamak için kullanılır.',
    ],
    sections: [
      {
        heading: 'Kama kanalı sonucunu nasıl yorumlamalısınız?',
        body: [
          'Sonuçta verilen kama genişliği ve yüksekliği ön seçim niteliğindedir. Aktarılacak tork, malzeme dayanımı, çalışma yönü ve göbek boyu ayrıca kontrol edilmelidir.',
          'Teknik resimde kanal genişliği, derinlik, tolerans ve ilgili standart referansı net yazılırsa imalatçı için belirsizlik azalır.',
        ],
        list: ['Mil çapını doğru girin.', 'Önerilen kama ölçüsünü standart tabloyla kontrol edin.', 'Kanal toleransını ve yüzey durumunu teknik çağrıya ekleyin.'],
      },
    ],
  },
  'kilavuz-matkap-hesaplama': {
    useCaseTitle: 'Metrik diş tablosu, kılavuz matkap çapları ve diş dibi hesabı',
    intro: [
      'Metrik diş tablosu; vida anma çapını, kaba veya ince hatveyi, kılavuz ön delik çapını, teorik adım çapını ve diş dibi çaplarını aynı ekranda karşılaştırmayı sağlar. M2–M42 aralığındaki yaygın ölçüler tabloda listelenmiştir.',
      'Kılavuz matkap çapı pratikte yaklaşık anma çapı eksi hatve bağıntısıyla seçilir. Ön delik çok küçük olduğunda kılavuz torku ve takım kırılma riski artar; büyük olduğunda diş doluluğu azalabilir.',
    ],
    sections: [
      {
        heading: 'Metrik diş ve kılavuz tablosu nasıl okunur?',
        body: [
          'M10 × 1,5 ifadesinde 10 mm anma çapını, 1,5 mm ise hatveyi gösterir. Standart kaba hatvede yaygın kılavuz matkap çapı Ø8,5 mm’dir; M10 × 1,25 ince hatvede yaklaşık Ø8,8 mm kullanılır.',
          'Aynı anma çapındaki kaba ve ince hatve farklı ön delik ve temel profil çapları oluşturur. Teknik resimde standart dışı veya ince hatve kullanılıyorsa hatve açıkça yazılmalıdır.',
        ],
        list: ['Metrik diş ölçüsünü ve hatveyi birlikte kontrol edin.', 'Kör delikte talaş payını ve matkap uç açısını hesaba katın.', 'Kılavuz üreticisinin malzemeye özel ön delik önerisini nihai referans olarak kullanın.'],
      },
      {
        heading: 'Metrik diş dibi nasıl hesaplanır?',
        body: [
          'ISO metrik temel profil geometrisinde teorik iç diş dibi çapı D1 = d − 1,082532P; teorik dış diş dibi çapı d3 = d − 1,226869P bağıntısıyla gösterilebilir. Adım çapı d2/D2 yaklaşık d − 0,649519P’dir.',
          'Bu değerler temel profil geometrisidir. Gerçek iç ve dış diş sınır ölçüleri; 6H, 6g gibi tolerans sınıflarına, kaplamaya ve üretim yöntemine göre farklılaşır.',
        ],
      },
      {
        heading: 'Kılavuz matkap çapları hangi işlerde kullanılır?',
        body: [
          'Talaşlı imalat hazırlığı, CNC delik operasyonu, teknik resim çağrısı, bağlantı elemanı seçimi ve montaj deliği kontrolünde hızlı referans sağlar.',
          'Sert, sünek veya talaş yapışması yüksek malzemelerde kesme kılavuzu ile form kılavuzu için aynı ön delik kullanılmayabilir.',
        ],
      },
    ],
    faq: [
      { question: 'M10 kılavuz matkap çapı kaç mm?', answer: 'Standart M10 × 1,5 kaba hatve için yaygın ön delik Ø8,5 mm’dir. M10 × 1,25 ince hatvede yaklaşık Ø8,8 mm kullanılır.' },
      { question: 'M8 kılavuz matkap çapı kaç mm?', answer: 'Standart M8 × 1,25 için yaygın ön delik Ø6,8 mm’dir. M8 × 1,0 ince hatvede yaklaşık Ø7,0 mm kullanılır.' },
      { question: 'Metrik diş dibi çapı gerçek ölçü müdür?', answer: 'Tablodaki D1 ve d3 temel profil için teorik değerlerdir. Gerçek sınır ölçüleri tolerans sınıfına ve ilgili standarda göre kontrol edilmelidir.' },
      { question: 'Kılavuz matkap çapı her malzemede aynı mıdır?', answer: 'Hayır. Tablo başlangıç değeri verir; malzeme, kılavuz tipi, hedef diş yüzdesi ve takım üreticisinin önerisi nihai çapı değiştirebilir.' },
    ],
  },
  'konik-hesaplama': {
    useCaseTitle: 'Konik ve torna derece hesaplama: çap, boy, açı ve 1:N oranı',
    intro: [
      'Konik hesaplama; büyük çap D, küçük çap d ve eksenel boy L arasındaki geometrik ilişkiyi kullanarak toplam koni açısını, torna yarım açısını ve 1:N koniklik oranını bulur.',
      'Araç ayrıca toplam açıdan küçük çapı veya doğrudan 1:N oranından torna derece ayarını hesaplar. Üst kızak ayarında kullanılan yarım açı ile teknik resimde verilen toplam açı karıştırılmamalıdır.',
    ],
    sections: [
      {
        heading: 'Torna derece hesabı nasıl yapılır?',
        body: [
          'Çap farkı D − d ve konik boy L biliniyorsa yarım açı için tan(α) = (D − d) / (2L) bağıntısı kullanılır. Torna üst kızağı çoğunlukla bu α yarım açısına ayarlanır.',
          'Toplam koni açısı 2α’dır. Araç sonucu ondalık dereceyle ve derece-dakika-saniye biçiminde birlikte gösterir.',
        ],
        list: ['D ve d değerlerini çap olarak girin.', 'L değerini çapların ölçüldüğü eksenel mesafe olarak alın.', 'Tezgâh ayarında toplam açı yerine gereken yarım açıyı doğrulayın.'],
      },
      {
        heading: '1:N koniklik oranından açı nasıl bulunur?',
        body: [
          'Çap değişimine göre tanımlanan 1:N koniklikte N = L / (D − d) bağıntısı kullanılır. Yarım açı α = arctan(1 / 2N) ile hesaplanır.',
          'Örneğin 1:10 koniklikte torna yarım açısı yaklaşık 2,8624°, toplam koni açısı yaklaşık 5,7248°’dir.',
        ],
      },
      {
        heading: 'Konik ölçü teknik resimde nasıl verilir?',
        body: [
          'Parçanın fonksiyonuna göre büyük-küçük çap ve boy birlikte ölçülendirilebilir; ayrıca 1:10 koniklik veya toplam açı çağrısı verilebilir.',
          'Aşırı tanımlama ve tolerans çakışmasını önlemek için hangi ölçünün referans, hangisinin kontrol ölçüsü olduğu netleştirilmelidir.',
        ],
      },
    ],
    faq: [
      { question: '1:10 koniklik kaç derecedir?', answer: 'Çap değişimine göre 1:10 koniklik için yarım açı yaklaşık 2,8624°, toplam koni açısı yaklaşık 5,7248°’dir.' },
      { question: 'Tornada toplam açı mı yarım açı mı kullanılır?', answer: 'Üst kızak veya aparat ayarında çoğunlukla koninin yarım açısı kullanılır; tezgâh yöntemine ve teknik resimdeki açı tanımına göre doğrulama yapılmalıdır.' },
      { question: 'Konik boy eğik yüzey uzunluğu mudur?', answer: 'Hayır. L, büyük ve küçük çap kesitleri arasındaki eksenel mesafedir. Eğik yüzey uzunluğu farklı bir değerdir.' },
    ],
  },
  'levha-agirlik-hesaplama': {
    useCaseTitle: 'Düz, galvanizli ve metal sac ağırlığı nasıl hesaplanır?',
    intro: [
      'Sac ağırlık hesabı; en, boy, kalınlık, adet ve malzeme yoğunluğunun çarpımına dayanır. Çelik, galvanizli, paslanmaz, alüminyum ve bakır levhalarda satın alma, teklif, stok ve taşıma planı için teorik kilogram değerini verir.',
      'Baklavalı sac gibi desenli ürünlerde kabartma nedeniyle düz sac hesabına ilave katsayı gerekebilir. Bu nedenle desenli sac için ilgili baklavalı sac hesaplayıcısını kullanmak daha doğru başlangıç sağlar.',
    ],
    sections: [
      {
        heading: 'Sac ağırlık formülü nedir?',
        body: [
          'Ağırlık = en × boy × kalınlık × yoğunluk bağıntısıyla hesaplanır. Ölçüler metreye çevrildiğinde yoğunluk kg/m³ kullanılır; pratik çelik hesabında mm ölçülerle uygun dönüşüm katsayısı uygulanabilir.',
          'Galvaniz kaplama ağırlığı çoğu genel hesapta toplamın küçük bölümüdür; hassas sevkiyat veya satın alma hesabında kaplama sınıfı ve gerçek tartım ayrıca dikkate alınmalıdır.',
        ],
        list: ['Düz sac için gerçek malzeme yoğunluğunu seçin.', 'Baklavalı sac için desen katsayısını kullanın.', 'Adet, fire, palet ve ambalajı sevkiyat hesabına ayrıca ekleyin.'],
      },
      {
        heading: 'Baklavalı ve boyalı sac ağırlığı neden farklı çıkar?',
        body: [
          'Baklavalı yüzey, kabartma geometrisine göre birim alan başına metal miktarını artırabilir. Üreticilerin nominal kalınlık tanımı ve desen yüksekliği de sonucu etkiler.',
          'Boya ve galvaniz kaplama teorik net sac ağırlığına ek yük getirir; büyük tonajlarda sertifika veya kantar değeriyle doğrulama yapılmalıdır.',
        ],
      },
    ],
    faq: [
      { question: '1 m² 1 mm çelik sac kaç kg gelir?', answer: 'Çelik yoğunluğu yaklaşık 7.850 kg/m³ kabul edilirse 1 m² alan ve 1 mm kalınlık yaklaşık 7,85 kg gelir.' },
      { question: 'Baklavalı sac düz sac gibi hesaplanır mı?', answer: 'Ön hesap düz sac ağırlığından başlatılabilir; kabartma ve üretici tanımına göre desen katsayısı eklenmelidir.' },
      { question: 'Galvanizli sac ağırlığı nasıl hesaplanır?', answer: 'Temel çelik sac ağırlığına kaplama kütlesi eklenir. Genel ön hesapta fark küçük olabilir; hassas işte kaplama sınıfı ve sertifika değeri kullanılmalıdır.' },
    ],
  },
  'baklavali-sac-agirlik-hesaplama': {
    useCaseTitle: 'Baklavalı sac plaka ve metrekare ağırlığı hesabı',
    intro: [
      'Baklavalı sac ağırlığı, düz sac hacim hesabına desen veya kabartma katsayısı eklenerek yaklaşık bulunur. En, boy, kalınlık, malzeme, adet ve katsayı kullanılarak tek plaka ile toplam kilogram hesaplanabilir.',
      'Üreticiye göre nominal kalınlığın kabartma hariç veya dahil tanımlanması sonucu etkileyebilir. Satın alma ve taşıma öncesinde ürün kataloğundaki kg/m² değeriyle karşılaştırma yapılmalıdır.',
    ],
    sections: [
      {
        heading: 'Baklavalı sac ağırlık hesabında desen katsayısı',
        body: [
          'Desen katsayısı, kabartmanın düz levhaya göre oluşturduğu yaklaşık ağırlık artışını temsil eder. Araçta varsayılan değer başlangıç içindir; farklı desen ve üreticilerde değişebilir.',
          'Tek plaka ağırlığı, metrekare ağırlığı ve toplam sipariş ağırlığı birlikte kontrol edilerek forklift, vinç ve sevkiyat planı yapılabilir.',
        ],
        list: ['Nominal kalınlık tanımını katalogdan kontrol edin.', 'Üretici kg/m² tablosu varsa öncelik verin.', 'Kesim firesini ve paketleme ağırlığını ayrıca ekleyin.'],
      },
    ],
    faq: [
      { question: 'Baklavalı sac neden düz sactan ağırdır?', answer: 'Kabartmalı desen metal geometrisini ve bazı üretim tiplerinde birim alan başına kütleyi artırabilir; fark üretici ve desen tipine bağlıdır.' },
      { question: 'Desen katsayısı kaç alınmalı?', answer: 'Araç başlangıç değeri sunar. En doğru katsayı üretici kataloğundaki nominal kalınlık ve kg/m² bilgisine göre belirlenir.' },
    ],
  },
  'demir-agirligi-hesaplama': {
    useCaseTitle: 'Donatı ağırlıkları tablosu ve inşaat demiri tonaj hesabı',
    intro: [
      'Donatı ağırlıkları tablosu, Ø6–Ø40 nervürlü inşaat demirlerinin metre başına teorik kilogramını, 6 metre ve 12 metre boy ağırlıklarını karşılaştırır.',
      'Hesaplayıcı; seçilen çap, toplam uzunluk veya boy adedinden toplam kg ve ton değerini bulur. Metraj, keşif, sipariş ve saha planlamasında hızlı ön kontrol sağlar.',
    ],
    sections: [
      {
        heading: 'Donatı birim ağırlığı nasıl hesaplanır?',
        body: [
          'Pratik formül kg/m = çap² / 162 olarak kullanılır. Çap milimetre cinsindendir. Örneğin Ø12 donatı yaklaşık 0,888 kg/m gelir.',
          'Toplam ağırlık, kg/m birim ağırlığın toplam metreyle çarpılmasıyla bulunur. Boy adediyle hesapta 6, 9 veya 12 metre boy uzunluğu toplam metrajı belirler.',
        ],
        list: ['Donatı çapını proje veya kesim listesinden alın.', 'Bindirme, kanca, fire ve kesim kayıplarını ayrıca ekleyin.', 'Kesin siparişte üretici sertifikası ve kantar değerini kontrol edin.'],
      },
      {
        heading: 'Donatı tonajı neden teorik sonuçtan farklı çıkabilir?',
        body: [
          'Çap ve hadde toleransları, kesim firesi, bindirme boyları, kanca ve filiz detayları ile saha kayıpları teorik metrajı değiştirebilir.',
          'Proje keşfi için tablo değeri uygundur; satın alma ve hakediş hesabında onaylı metraj listesi esas alınmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'Ø12 demir 1 metre kaç kg?', answer: 'Ø12 donatı teorik olarak yaklaşık 0,888 kg/m’dir. 12 metrelik bir boy yaklaşık 10,66 kg gelir.' },
      { question: 'Ø16 demir 12 metre kaç kg?', answer: 'Ø16 donatı yaklaşık 1,578 kg/m’dir; 12 metrelik bir boy yaklaşık 18,94 kg gelir.' },
      { question: '1 ton Ø8 demir yaklaşık kaç metredir?', answer: 'Ø8 donatı yaklaşık 0,395 kg/m kabul edilirse 1 ton yaklaşık 2.532 metreye karşılık gelir.' },
    ],
  },
  'civata-sikma-torku-hesaplama': {
    useCaseTitle: 'Cıvata sıkma torku ve ön yük ilişkisi',
    intro: [
      'Cıvata sıkma torku, bağlantıda istenen ön yükü oluşturmak için kullanılan pratik kontrol değeridir. Aynı çap ve kalite sınıfında bile diş sürtünmesi, yüzey kaplaması ve yağlama durumu gerekli torku ciddi biçimde değiştirebilir.',
      'Bu araç; cıvata ölçüsü, dayanım sınıfı ve sürtünme koşullarına göre başlangıç torku belirlemek ve bağlantı elemanlarını karşılaştırmak için hazırlanmıştır.',
    ],
    sections: [
      {
        heading: 'Tork tablosu neden tek başına yeterli değildir?',
        body: [
          'Uygulanan torkun büyük bölümü diş ve baş altı sürtünmesini yenmek için harcanır. Bu nedenle kuru, yağlı, galvanizli veya kaplamalı bağlantılarda aynı tork farklı ön yük oluşturabilir.',
          'Kritik bağlantılarda üretici tablosu, yağlama şartı, sıkma sırası ve kalibre edilmiş tork ekipmanı birlikte kullanılmalıdır.',
        ],
        list: ['Cıvata çapı ve kalite sınıfını doğrulayın.', 'Kuru veya yağlı montaj koşulunu netleştirin.', 'Flanşlı bağlantılarda çapraz ve kademeli sıkma sırası uygulayın.'],
      },
      {
        heading: 'Sonuç hangi durumlarda yeniden kontrol edilmelidir?',
        body: [
          'Titreşimli, darbeli, yüksek sıcaklıklı veya emniyet açısından kritik bağlantılarda yalnız yaklaşık tork değeriyle karar verilmemelidir.',
          'Bağlanan parçanın ezilme dayanımı, rondela kullanımı, diş tutma boyu ve tekrar sıkma gereksinimi ayrıca değerlendirilmelidir.',
        ],
      },
    ],
  },
  'sac-bukum-acinim-hesaplama': {
    useCaseTitle: 'Sac büküm açınımı, büküm payı ve K faktörü',
    intro: [
      'Sac büküm açınım hesabı, büküm sonrası hedef ölçülere ulaşmak için düz boyun belirlenmesini sağlar. İç radius, sac kalınlığı, büküm açısı ve nötr eksenin konumunu temsil eden K faktörü sonucu doğrudan etkiler.',
      'Araç; tek veya çoklu bükümlerde büküm payını, büküm düşümünü ve yaklaşık düz boyu hızlı biçimde kontrol etmek için kullanılabilir.',
    ],
    sections: [
      {
        heading: 'K faktörü nasıl seçilir?',
        body: [
          'K faktörü nötr eksenin sac kalınlığı içindeki konumunu ifade eder. Malzeme, iç radius, kalınlık, büküm yöntemi ve takım geometrisi değiştikçe aynı K faktörü her parçada doğru sonuç vermeyebilir.',
          'Seri üretimde en güvenilir yaklaşım, gerçek makine ve kalıpla numune büküp ölçülen açınıma göre firma içi K faktörü veya büküm tablosu oluşturmaktır.',
        ],
        list: ['Gerçek iç radiusu kullanın.', 'Büküm açısının iç veya dış tanımını kontrol edin.', 'İlk parçadan sonra ölçü farkına göre K faktörünü kalibre edin.'],
      },
      {
        heading: 'Açınım farkı neden oluşur?',
        body: [
          'Sac kalınlık toleransı, hadde yönü, yaylanma, V açıklığı ve radius değişimi hesaplanan düz boy ile gerçek üretim sonucunu etkileyebilir.',
          'Dar toleranslı parçalarda teorik hesap, makine büküm tablosu ve numune ölçümü birlikte değerlendirilmelidir.',
        ],
      },
    ],
  },
  'mil-mukavemet-hesaplama': {
    useCaseTitle: 'Mil çapı, eğilme ve burulma dayanımı ön kontrolü',
    intro: [
      'Mil mukavemet hesabı; tork, eğilme momenti, malzeme dayanımı ve emniyet katsayısına göre gerekli çapın ön seçimini destekler. Kama kanalı, omuz, segman kanalı ve çap değişimleri gerilme yığılması oluşturduğu için yalnız nominal çap yeterli değildir.',
      'Bu araç, ilk boyutlandırma aşamasında yük bileşenlerini karşılaştırmak ve kritik kesitleri belirlemek için kullanılabilir.',
    ],
    sections: [
      {
        heading: 'Mil hesabında hangi yükler birlikte ele alınır?',
        body: [
          'Dönen millerde burulma torkuna ek olarak kasnak, dişli, zincir ve rulman reaksiyonlarından kaynaklanan eğilme momentleri oluşabilir. Değişken yük altında yorulma etkisi statik dayanımdan daha kritik hale gelebilir.',
          'Kritik kesit genellikle omuz, kama kanalı veya yatak geçişi gibi geometrinin değiştiği bölgede oluşur.',
        ],
        list: ['Tork ve eğilme momentini aynı çalışma durumuna göre girin.', 'Malzemenin akma ve yorulma davranışını ayırın.', 'Kama kanalı ve çentik etkisi için uygun düzeltme kullanın.'],
      },
      {
        heading: 'Hesaplanan çap nasıl doğrulanır?',
        body: [
          'Çap seçildikten sonra sehim, kritik devir, rulman yerleşimi, yüzey kalitesi ve üretilebilirlik ayrıca kontrol edilmelidir.',
          'Darbeli veya tersinir yüklerde servis katsayısı ve yorulma hesabı olmadan yalnız statik sonuçla nihai tasarım yapılmamalıdır.',
        ],
      },
    ],
  },
  'disli-carki-hesaplama': {
    useCaseTitle: 'Modül, diş sayısı ve hatve çapı hesabı',
    intro: [
      'Dişli çark geometrisinde modül ve diş sayısı, hatve çapını ve karşılıklı çalışan iki dişlinin merkez mesafesini belirleyen temel değerlerdir.',
      'Bu araç düz dişli için temel çapları ve oranları hızlı kontrol etmek, ilk yerleşim ölçülerini oluşturmak ve teknik resim hazırlığına başlangıç vermek amacıyla kullanılabilir.',
    ],
    sections: [
      {
        heading: 'Dişli geometrisinde temel ilişkiler',
        body: [
          'Hatve çapı modül ile diş sayısının çarpımına bağlıdır. İki dişlinin merkez mesafesi ise hatve çaplarının toplamının yarısıyla ilişkilidir.',
          'Aktarma oranı yalnız diş sayılarıyla belirlenebilir; ancak diş dibi dayanımı, yüzey basıncı, genişlik, malzeme ve kalite sınıfı ayrıca hesaplanmalıdır.',
        ],
        list: ['Her iki dişlide aynı modül ve uyumlu basınç açısı kullanın.', 'Çok düşük diş sayısında alttan kesme riskini kontrol edin.', 'Dayanım hesabını yalnız geometrik sonuçtan ayrı değerlendirin.'],
      },
    ],
  },
  'rulman-omru-hesaplama': {
    useCaseTitle: 'Rulman L10 ömrü ve eşdeğer dinamik yük hesabı',
    intro: [
      'Rulman ömrü hesabı, katalogdaki dinamik yük kapasitesi ile rulmana etkiyen eşdeğer yük arasındaki ilişkiyi kullanarak teorik L10 ömrünü tahmin eder.',
      'Devir sayısı, radyal ve eksenel yükler ile rulman tipi birlikte değerlendirilerek devir veya çalışma saati cinsinden ön kontrol yapılabilir.',
    ],
    sections: [
      {
        heading: 'L10 ömrü neyi ifade eder?',
        body: [
          'L10 ömrü, aynı koşullardaki yeterince büyük bir rulman grubunun yüzde 90’ının yorulma hasarı oluşmadan ulaşmasının beklendiği teorik ömürdür. Bu değer tek bir rulmanın kesin arıza zamanını göstermez.',
          'Yağlama, kirlilik, hizasızlık, montaj ön yükü, sıcaklık ve titreşim gerçek servis ömrünü katalog hesabından önemli ölçüde farklılaştırabilir.',
        ],
        list: ['Dinamik yük kapasitesini doğru rulman kodundan alın.', 'Radyal ve eksenel yüklerin eşdeğer yük hesabını kontrol edin.', 'Saat dönüşümünde gerçek çalışma devrini kullanın.'],
      },
    ],
  },
  'boru-eti-hesaplama': {
    useCaseTitle: 'Basınçlı boru et kalınlığı için Barlow ön hesabı',
    intro: [
      'Boru et kalınlığı hesabı; iç basınç, çap, izin verilen gerilme ve bağlantı verimi gibi temel değerlerle basınç altında gerekli minimum cidarı tahmin eder.',
      'Araç hızlı ön boyutlandırma sağlar; korozyon payı, üretim toleransı, sıcaklık düşürme katsayısı ve ilgili borulama standardı nihai seçimde ayrıca uygulanmalıdır.',
    ],
    sections: [
      {
        heading: 'Minimum et kalınlığına hangi paylar eklenir?',
        body: [
          'Teorik basınç cidarı tek başına sipariş kalınlığı değildir. Korozyon veya erozyon payı, hadde toleransı, diş açma veya kanal kaybı ve servis şartları ayrıca eklenebilir.',
          'Yüksek sıcaklıkta malzemenin izin verilen gerilmesi azalabileceği için oda sıcaklığı dayanım değeriyle hesap yapmak güvenli olmayabilir.',
        ],
        list: ['Tasarım basıncı ve tasarım sıcaklığını kullanın.', 'Dış çap ile iç çap tanımını karıştırmayın.', 'Seçilen standart boru kalınlığını bir üst ticari ölçüye yuvarlayın.'],
      },
    ],
  },
  'o-ring-kanali-hesaplama': {
    useCaseTitle: 'O-ring kanal ölçüsü, sıkışma ve doluluk kontrolü',
    intro: [
      'O-ring kanal hesabı, seçilen kesit çapına göre kanal genişliği, derinliği, sıkışma oranı ve kanal doluluğu için başlangıç ölçülerini verir.',
      'Statik veya dinamik uygulama, içten veya dıştan basınç, malzeme sertliği ve çalışma sıcaklığı kanal geometrisini etkilediği için kullanım tipi doğru seçilmelidir.',
    ],
    sections: [
      {
        heading: 'Sıkışma ve kanal doluluğu neden önemlidir?',
        body: [
          'Yetersiz sıkışma sızdırmazlığı azaltabilir; aşırı sıkışma ise sürtünme, ısınma ve erken deformasyon oluşturabilir. Kanal içinde genleşme için yeterli boşluk bırakılmalıdır.',
          'Dinamik uygulamalarda yüzey pürüzlülüğü, hız, yağlama ve boşluk ekstrüzyonu ayrıca kontrol edilir.',
        ],
        list: ['O-ring kesit çapını katalogdan doğrulayın.', 'Statik ve dinamik kullanım tipini ayırın.', 'Basınç yüksekse destek halkası gereksinimini değerlendirin.'],
      },
    ],
  },
  'kablo-kesiti-hesaplama': {
    useCaseTitle: 'Akım ve gerilim düşümüne göre kablo kesiti seçimi',
    intro: [
      'Kablo kesiti seçimi yalnız akım taşıma kapasitesine göre yapılmaz. Hat uzunluğu, gerilim düşümü, iletken malzemesi, faz tipi, döşeme şekli ve ortam sıcaklığı birlikte değerlendirilmelidir.',
      'Bu araç, yük akımı ve mesafeye göre başlangıç kesiti belirlemek ve alternatif kesitlerde oluşan gerilim düşümünü karşılaştırmak için kullanılabilir.',
    ],
    sections: [
      {
        heading: 'Kablo kesiti neden büyütülür?',
        body: [
          'Uzun hatlarda iletken direnci gerilim kaybı ve ısı oluşturur. Akım taşıma açısından yeterli görünen bir kesit, izin verilen gerilim düşümünü sağlayamayabilir.',
          'Demetleme, yüksek ortam sıcaklığı ve kapalı kanal gibi koşullar akım taşıma kapasitesini düşürebilir; standart düzeltme katsayıları uygulanmalıdır.',
        ],
        list: ['Tek faz veya üç faz bağlantıyı doğru seçin.', 'Tek yön mesafe ile toplam iletken uzunluğunu karıştırmayın.', 'Koruma elemanı ve kısa devre dayanımını ayrıca kontrol edin.'],
      },
    ],
  },
  'voltaj-dusumu-hesaplama': {
    useCaseTitle: 'Kablo hattında voltaj düşümü ve yüzde kayıp hesabı',
    intro: [
      'Voltaj düşümü; akım, hat uzunluğu, kablo kesiti, iletken malzemesi ve faz düzenine bağlı olarak yük uçlarındaki gerilimin azalmasını ifade eder.',
      'Araç farklı kesitleri karşılaştırarak volt cinsinden kaybı ve kaynak gerilimine göre yüzde düşümü hızlı biçimde gösterir.',
    ],
    sections: [
      {
        heading: 'Gerilim düşümü nasıl azaltılır?',
        body: [
          'Kablo kesitini büyütmek, hat uzunluğunu azaltmak veya besleme düzenini değiştirmek iletken direncinden kaynaklanan kaybı azaltabilir.',
          'Motor gibi kalkış akımı yüksek yüklerde yalnız sürekli çalışma akımı değil, kalkış anındaki gerilim düşümü de ayrıca değerlendirilmelidir.',
        ],
        list: ['İletken malzemesini doğru seçin.', 'Hat uzunluğunu gerçek güzergâha göre girin.', 'Yükün sürekli ve kalkış akımını ayrı kontrol edin.'],
      },
    ],
  },
  'kaynak-dikisi-hesaplama': {
    useCaseTitle: 'Köşe kaynak dikişi boğaz kalınlığı ve taşıma ön hesabı',
    intro: [
      'Kaynak dikişi hesabı, uygulanan kuvvet ve momentlere göre köşe kaynağının etkin boğaz alanını ve yaklaşık gerilmesini kontrol etmeye yardımcı olur.',
      'Dikiş boyu, kaynak ölçüsü, yük yönü, malzeme ve güvenlik katsayısı birlikte değerlendirilerek ilk kaynak boyutlandırması yapılabilir.',
    ],
    sections: [
      {
        heading: 'Kaynak ölçüsü seçerken nelere bakılır?',
        body: [
          'Daha büyük kaynak her zaman daha güvenli veya ekonomik değildir. İnce parçaya aşırı büyük kaynak uygulanması deformasyon, yanma ve yüksek ısı girdisi oluşturabilir.',
          'Eksantrik yükler ve moment etkisi varsa dikiş grubundaki gerilme dağılımı yalnız toplam kaynak boyuna bölünerek değerlendirilemez.',
        ],
        list: ['Etkin boğaz kalınlığı ile görünen ayak ölçüsünü ayırın.', 'Kesme, çekme ve moment yüklerini birlikte kontrol edin.', 'Uygulanacak kaynak standardı ve kalite seviyesini teknik resimde belirtin.'],
      },
    ],
  },
  'yuzey-puruzlulugu-rehberi': {
    useCaseTitle: 'Teknik resimde Ra ve Rz yüzey pürüzlülüğü seçimi',
    intro: [
      'Yüzey pürüzlülüğü, parçanın sürtünme, sızdırmazlık, yataklama ve kaplama davranışını etkiler. Ra değeri tek başına kalite ifadesi gibi görünse de fonksiyonel yüzeylerde doğru seçilmelidir.',
      'Bu rehber, teknik resimde yüzey çağrısı hazırlarken pratik bir başlangıç noktası sunar.',
    ],
    sections: [
      {
        heading: 'Ra değeri seçilirken nelere dikkat edilir?',
        body: [
          'Çok düşük Ra değeri her zaman daha iyi seçim değildir; işlem maliyetini artırabilir. Çok yüksek Ra değeri ise yataklama, sızdırmazlık veya görsel kalite açısından problem oluşturabilir.',
          'Seçim yapılırken yüzeyin fonksiyonu, üretim yöntemi ve kontrol edilebilirliği birlikte değerlendirilmelidir.',
        ],
        list: ['Yataklama ve sızdırmazlık yüzeylerinde daha kontrollü pürüzlülük gerekir.', 'Genel dış yüzeylerde daha ekonomik değerler yeterli olabilir.', 'Kaplama öncesi yüzey hazırlığı ayrıca kontrol edilmelidir.'],
      },
    ],
  },
  'basincli-kap-cidar-kalinligi': {
    useCaseTitle: 'Basınçlı kap cidar kalınlığı nasıl ön hesaplanır?',
    intro: [
      'Basınçlı kap cidar kalınlığı; iç basınç, gövde çapı, çalışma sıcaklığındaki izin verilen malzeme gerilmesi, kaynak birleşim verimi ve korozyon payıyla birlikte değerlendirilir.',
      'Bu araç silindirik gövde için hızlı ön boyutlandırma sağlar. Nihai tasarımda başlıklar, nozullar, lokal yükler, dış basınç, test şartları ve uygulanacak basınçlı ekipman kodu ayrıca kontrol edilmelidir.',
    ],
    sections: [
      {
        heading: 'Tasarım basıncı ve malzeme değeri nasıl seçilir?',
        body: [
          'Normal çalışma basıncı ile tasarım basıncı aynı kabul edilmemelidir. Olası işletme sapmaları, sıcaklık ve emniyet yaklaşımı dikkate alınarak proje tasarım değeri kullanılmalıdır.',
          'Malzeme için oda sıcaklığındaki çekme dayanımı yerine, ilgili tasarım sıcaklığında kabul edilen izin verilen gerilme değeri esas alınmalıdır.',
        ],
        list: ['Basınç ve gerilme birimlerini eşleştirin.', 'Kaynak birleşim verimini muayene seviyesine göre doğrulayın.', 'Korozyon ve eksi sac toleransını sonuçtan sonra ayrıca ekleyin.'],
      },
      {
        heading: 'Online sonuç hangi kontrollerin yerine geçmez?',
        body: [
          'Nozul takviyesi, mesnet ve kaldırma kulağı yükleri, başlık kalınlığı, yorulma, vakum veya dış basınç burkulması bu basit cidar hesabının dışında kalabilir.',
          'Basınçlı ekipman imalatında yürürlükteki mevzuat, tasarım standardı, malzeme sertifikası, kaynak prosedürü ve uygunluk değerlendirmesi birlikte yürütülmelidir.',
        ],
      },
    ],
    faq: [
      { question: 'Hesaplanan değer sipariş sac kalınlığı mıdır?', answer: 'Hayır. Teorik basınç cidarıdır; korozyon payı, eksi tolerans ve imalat şartları eklenerek uygun standart kalınlık seçilir.' },
      { question: 'Basınçlı kap hesabı CE için yeterli olur mu?', answer: 'Hayır. İlgili yönetmelik ve tasarım koduna göre yetkin mühendislik doğrulaması ile uygunluk süreci gerekir.' },
    ],
  },
  'kayis-kasnak-hesaplama': {
    useCaseTitle: 'Kayış-kasnak devir oranı ve kasnak çapı hesabı',
    intro: [
      'Kayış-kasnak hesabı, motor devrini hedef makine devrine dönüştürmek için kasnak çapları arasındaki oranı kullanır. Kayma ihmal edildiğinde devir oranı çap oranıyla doğrudan ilişkilidir.',
      'Araç ilk yerleşim ve oran kontrolü sağlar; kayış tipi, güç kapasitesi, sarım açısı, eksen mesafesi, ön germe ve servis katsayısı nihai seçimde ayrıca değerlendirilmelidir.',
    ],
    sections: [
      {
        heading: 'Devir oranı nasıl yorumlanır?',
        body: [
          'Tahrik eden kasnak küçülüp tahrik edilen kasnak büyüdükçe çıkış devri düşer ve teorik tork artışı oluşur. Tersi durumda çıkış devri yükselir.',
          'Etkin çalışma çapı ile dış çap aynı olmayabilir. Üretici kataloglarında verilen hatve veya referans çapının kullanılması daha doğru sonuç verir.',
        ],
        list: ['Motor ve çıkış devrini aynı birimde girin.', 'Kasnakların etkin çapını kullanın.', 'Kayışın izin verilen çevresel hızını ve minimum kasnak çapını kontrol edin.'],
      },
      {
        heading: 'Geometrik oran dışında hangi kontroller gerekir?',
        body: [
          'Aktarılacak güç, darbe yükü, günlük çalışma süresi ve ortam şartı kayış kesiti ile kayış sayısını etkiler. Yetersiz sarım açısı kayma ve erken aşınma oluşturabilir.',
          'Mil ve rulmanlara gelen radyal kayış yükü, özellikle yüksek ön germeli sistemlerde ayrıca hesaplanmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'Kasnak çap oranı devir oranına eşit midir?', answer: 'Kayma ihmal edildiğinde ters orantılıdır; gerçek sistemde kayma ve etkin çap farkı küçük sapmalar oluşturabilir.' },
      { question: 'Bu hesap kayış tipini de seçer mi?', answer: 'Hayır. Oran ve devir ön kontrolü sağlar; güç kapasitesi için üretici seçim tabloları kullanılmalıdır.' },
    ],
  },
  'pompa-guc-hesaplama': {
    useCaseTitle: 'Dalgıç pompa debi, toplam basma yüksekliği ve motor kW hesabı',
    intro: [
      'Dalgıç pompa hesaplama programı; debi, statik yükseklik, boru ve armatür kayıpları, gerekli çıkış basıncı, sıvı yoğunluğu ve pompa veriminden toplam basma yüksekliğini ve pompa mil gücünü hesaplar.',
      'Hesaplanan mil gücüne seçilen emniyet payı eklenir ve bir üst standart motor kW değeri ön seçim olarak gösterilir. Nihai pompa modeli üretici Q-H eğrisindeki çalışma noktasından seçilmelidir.',
    ],
    sections: [
      {
        heading: 'Dalgıç pompa toplam basma yüksekliği nasıl hesaplanır?',
        body: [
          'Statik yükseklik, dinamik su seviyesi ile basma noktasının kot farkıdır. Buna boru sürtünme kaybı, dirsek, vana ve filtre kayıpları ile çıkışta istenen basıncın metre sıvı sütunu karşılığı eklenir.',
          'Kuyu derinliği tek başına toplam basma yüksekliği değildir. Su seviyesi, boru çapı, debi ve basınç ihtiyacı sonucu doğrudan değiştirir.',
        ],
        list: ['İhtiyaç debisini m³/h cinsinden belirleyin.', 'Kuyu tabanı yerine dinamik su seviyesini kullanın.', 'Hat kayıplarını ve gerekli çıkış basıncını ekleyin.', 'Çalışma noktasını üretici pompa eğrisinde doğrulayın.'],
      },
      {
        heading: 'Pompa gücü ve standart motor kW nasıl seçilir?',
        body: [
          'Hidrolik güç ρ·g·Q·H bağıntısıyla bulunur. Pompa verimine bölündüğünde pompa mil gücü elde edilir. Motorun mekanik çıkış gücü, bu değerin üzerinde seçilmelidir.',
          'Araç emniyet paylı gerekli gücü bir üst standart motor değerine yuvarlar. Kablo kesiti, motor verimi, yol verme yöntemi, düşük gerilim ve saatlik başlatma sayısı ayrıca kontrol edilmelidir.',
        ],
      },
      {
        heading: 'Dalgıç pompa seçiminde pompa eğrisi neden gereklidir?',
        body: [
          'Aynı motor kW değerine sahip pompalar farklı debi ve basma yüksekliği eğrilerine sahip olabilir. İstenen Q-H noktası pompanın verimli ve kararlı çalışma bölgesinde bulunmalıdır.',
          'NPSH, kuyu soğutması, kum oranı, sıvı sıcaklığı ve minimum su seviyesi üretici teknik dokümanından kontrol edilmelidir.',
        ],
      },
    ],
    faq: [
      { question: 'Dalgıç pompa seçimi sadece kuyu derinliğine göre yapılır mı?', answer: 'Hayır. Dinamik su seviyesi, çıkış kotu, boru kayıpları, gerekli çıkış basıncı ve debi birlikte değerlendirilir.' },
      { question: 'Pompa hesabındaki standart motor kW kesin seçim midir?', answer: 'Hayır. Değer ön seçimdir. Nihai motor ve pompa, üretici Q-H eğrisi, verim, çalışma şartı ve elektriksel kontrollerle doğrulanmalıdır.' },
      { question: '1 bar kaç metre su sütunudur?', answer: 'Saf su için yaklaşık 10,2 metre su sütununa karşılık gelir; sıvı yoğunluğu değiştiğinde basınç yüksekliği de değişir.' },
      { question: 'Basma yüksekliği ile basınç aynı şey midir?', answer: 'Doğrudan aynı birim değildir. Basma yüksekliği metre sıvı sütunu, basınç ise bar veya pascal olarak ifade edilir ve yoğunluk üzerinden dönüştürülür.' },
    ],
  },
  'termal-iletim-hesaplama': {
    useCaseTitle: 'Endüstriyel ısı kaybı, termal iletim ve direnç hesabı',
    intro: [
      'Endüstriyel termal hesaplama; düz plaka veya silindirik duvarda malzeme ısı iletkenliği, kalınlık, alan ve sıcaklık farkına göre iletilen ısıyı ve termal direnci bulur.',
      'Makine gövdesi, fırın duvarı, boru izolasyonu ve ısıtılmış yüzeylerde ön değerlendirme sağlar. Taşınım, radyasyon, temas direnci ve çok katmanlı yapı etkileri gerekiyorsa ayrıca modellenmelidir.',
    ],
    sections: [
      {
        heading: 'Fourier ısı iletimi hesabı nasıl yapılır?',
        body: [
          'Düz plaka için Q = k·A·ΔT/L bağıntısı kullanılır. k malzeme iletkenliği, A ısı geçiş alanı, ΔT sıcaklık farkı ve L duvar kalınlığıdır.',
          'Silindirik boru veya izolasyon katmanında radyal geometri nedeniyle logaritmik bağıntı kullanılır. İç ve dış yarıçapların doğru girilmesi gerekir.',
        ],
        list: ['k değerini çalışma sıcaklığına yakın alın.', 'Kalınlık ve alan birimlerini kontrol edin.', 'İzolasyon hesabında iç-dış taşınım dirençlerini ayrıca değerlendirin.'],
      },
      {
        heading: 'Endüstriyel ısı kaybı neden gerçek değerden farklı olabilir?',
        body: [
          'Yüzey hava akımı, emissivite, bağlantı köprüleri, nem, temas boşlukları ve sıcaklığa bağlı malzeme özellikleri gerçek ısı kaybını değiştirir.',
          'Araç iletim bileşenini ön hesaplar. Enerji tüketimi veya ekipman boyutlandırması için bütün ısı transfer mekanizmaları aynı modelde ele alınmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'Termal direnç K/W neyi gösterir?', answer: 'Bir elemanın bir watt ısı akışında oluşturduğu sıcaklık farkını temsil eder. Değer büyüdükçe iletime karşı direnç artar.' },
      { question: 'Bu araç izolasyon kalınlığı seçer mi?', answer: 'Belirli bir kalınlıkta iletim ve direnci hesaplar. Ekonomik izolasyon kalınlığı için enerji maliyeti, taşınım ve yüzey şartları ayrıca değerlendirilmelidir.' },
    ],
  },
  'oee-uretim-verimliligi-hesaplama': {
    useCaseTitle: 'OEE ile üretim kayıpları nasıl ölçülür?',
    intro: [
      'OEE; kullanılabilirlik, performans ve kalite oranlarını tek göstergede birleştirerek planlanan üretim süresinin ne kadar etkili kullanıldığını gösterir.',
      'Araç vardiya veya dönem verileriyle hızlı hesap yapar. Sonucun anlamlı olması için duruş, ideal çevrim, toplam üretim ve sağlam ürün tanımlarının işletmede tutarlı biçimde kullanılması gerekir.',
    ],
    sections: [
      {
        heading: 'Kullanılabilirlik, performans ve kalite neyi gösterir?',
        body: [
          'Kullanılabilirlik planlanan süreden duruşlar çıkarıldıktan sonra kalan çalışma oranıdır. Performans gerçek üretim hızını ideal çevrimle karşılaştırır. Kalite ise sağlam ürünün toplam üretime oranını verir.',
          'Bu üç bileşen aynı zaman aralığı ve aynı ürün-operasyon tanımı üzerinden hesaplanmalıdır.',
        ],
        list: ['Planlı mola ve plansız duruş kodlarını ayırın.', 'İdeal çevrim süresini ürün bazında doğrulayın.', 'Hurda ve yeniden işleme tanımını sabitleyin.'],
      },
      {
        heading: 'OEE sonucu nasıl aksiyona çevrilir?',
        body: [
          'Yalnız toplam yüzdeyi takip etmek yerine kayıp dakika ve kayıp adet bazında en büyük nedenler sıralanmalıdır. Mikro duruşlar performans kaybı içinde görünmez hale gelebilir.',
          'İyileştirme sonrası aynı veri toplama yöntemi korunmalı; aksi halde görülen artış gerçek süreç gelişimi yerine tanım değişikliğinden kaynaklanabilir.',
        ],
      },
    ],
    faq: [
      { question: 'Yüksek OEE her zaman yüksek kârlılık demek midir?', answer: 'Hayır. OEE ekipman etkinliğini gösterir; talep, ürün karması, maliyet ve teslimat performansı ayrıca değerlendirilmelidir.' },
      { question: 'Planlı bakım OEE hesabına dahil edilir mi?', answer: 'İşletmenin planlanan üretim süresi tanımına bağlıdır. Kullanılan yöntem raporda açık ve dönemler arasında tutarlı olmalıdır.' },
    ],
  },

};

function makeBaseContent(tool: Tool, categoryName?: string): ToolSeoContent {
  const purpose = categoryPurpose[tool.category] || categoryPurpose.genel;
  const checks = categoryChecks[tool.category] || categoryChecks.genel;
  const categoryText = categoryName ? `${categoryName} kategorisinde` : 'Tooldur içinde';

  return {
    useCaseTitle: `${tool.name} ne işe yarar?`,
    intro: [
      `${tool.name}, ${purpose} hızlı ön hesap yapmayı kolaylaştıran ücretsiz bir Tooldur aracıdır. ${tool.description}`,
      `${categoryText} yer alan bu hesaplayıcı, tasarım ve kontrol sırasında tekrar eden hesapları daha düzenli hale getirmek için hazırlanmıştır. Sonuçlar pratik mühendislik kontrolü sağlar; kritik uygulamalarda ilgili standart ve proje şartnamesi ayrıca doğrulanmalıdır.`,
    ],
    sections: [
      {
        heading: `${tool.shortName || tool.name} nasıl kullanılır?`,
        body: [
          'Formdaki temel değerleri girin ve sonucu ekranda kontrol edin. Girdi alanlarında birim bilgisi varsa bütün değerleri aynı birim sistemiyle kullanın.',
          'Hesap sonucunu teknik dokümana, teklif hazırlığına, ön tasarım kontrolüne veya proje notuna aktarırken varsayımları ayrıca belirtmek daha güvenli olur.',
        ],
        list: checks,
      },
      {
        heading: 'Sonuçları değerlendirirken dikkat edilmesi gerekenler',
        body: [
          'Online hesaplama araçları hızlı karar vermeyi kolaylaştırır; ancak her hesap sonucu uygulama şartlarından bağımsız düşünülmemelidir.',
          'Malzeme, üretim yöntemi, güvenlik katsayısı, tolerans, çevre şartları ve işletme koşulları sonucu etkileyebilir. Bu nedenle kritik parçalarda nihai karar öncesi mühendislik kontrolü yapılmalıdır.',
        ],
      },
    ],
    faq: [
      { question: `${tool.name} ücretsiz mi?`, answer: `Evet. ${tool.name} Tooldur üzerinde ücretsiz olarak kullanılabilir.` },
      { question: 'Sonucu kullanmadan önce neyi kontrol etmeliyim?', answer: 'Girdi birimleri, malzeme veya uygulama varsayımları ve ilgili standart ya da üretici verisi kontrol edilmelidir.' },
      { question: 'Bu sonuç hangi amaçla kullanılmalıdır?', answer: 'Araç hızlı ön kontrol içindir. Emniyet, uygunluk veya yüksek maliyet etkisi olan uygulamalarda nihai tasarım doğrulaması ayrıca yapılmalıdır.' },
    ],
    howTo: [
      { name: 'Girdi değerlerini belirleyin', text: `${tool.name} için gerekli ölçü, değer veya seçenekleri teknik dokümandan alın.` },
      { name: 'Hesaplamayı çalıştırın', text: 'Formu doldurup sonucu ekranda kontrol edin.' },
      { name: 'Sonucu doğrulayın', text: 'Sonucu ilgili standart, katalog veya proje şartnamesiyle karşılaştırın.' },
      { name: 'Girdi ve sonucu not alın', text: 'Gerekirse kullanılan giriş değerlerini, varsayımları ve sonucu kendi iş kaydınıza not edin.' },
    ],
  };
}

export function getToolSeoContent(tool: Tool, categoryName?: string): ToolSeoContent {
  const base = makeBaseContent(tool, categoryName);
  const override = specific[tool.slug];
  if (!override) return base;
  return {
    ...base,
    ...override,
    intro: override.intro || base.intro,
    // Öncelikli araçlarda yalnız araca özgü metin gösterilir. Böylece her sayfaya
    // aynı proje/PDF/teknik resim şablonunun eklenmesi engellenir.
    sections: override.sections && override.sections.length > 0 ? override.sections : base.sections,
    faq: override.faq || base.faq,
    howTo: override.howTo || base.howTo,
  };
}

export function getRelatedBlogPosts(tool: Tool, blogPosts: BlogPost[], limit = 3): BlogPost[] {
  const terms = [tool.slug, tool.name, tool.shortName, ...(tool.keywords || []), ...(tool.tags || [])]
    .join(' ')
    .toLocaleLowerCase('tr-TR')
    .split(/[^a-zA-ZığüşöçİĞÜŞÖÇ0-9]+/)
    .filter((term) => term.length > 2);

  const scored = blogPosts.map((post) => {
    const haystack = [post.slug, post.title, post.description, post.category, ...(post.keywords || [])]
      .join(' ')
      .toLocaleLowerCase('tr-TR');
    let score = 0;
    for (const term of Array.from(new Set(terms))) {
      if (haystack.includes(term)) score += 1;
    }
    if (post.relatedTools?.some((rt) => rt.href.includes(tool.slug))) score += 5;
    return { post, score };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}
