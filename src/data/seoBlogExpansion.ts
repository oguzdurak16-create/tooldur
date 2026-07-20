import type { BlogPost } from './blogPosts';

export const seoBlogExpansionPosts: BlogPost[] = [
  {
    slug: 'h7-g6-gecme-nedir-nerede-kullanilir',
    title: 'H7/g6 Geçme Nedir? Boşluklu Geçme Seçimi ve Kullanım Alanları',
    description: 'H7/g6 geçmenin çalışma mantığı, tipik kullanım alanları, nominal çapa göre tolerans değişimi ve teknik resimde doğru gösterimi.',
    date: '2026-06-17',
    readTime: '6 dk okuma',
    category: 'Tolerans',
    keywords: ['H7 g6 geçme', 'H7/g6 tolerans', 'boşluklu geçme', 'mil delik toleransı', 'ISO geçme toleransı'],
    relatedTools: [
      { label: 'ISO Geçme Toleransı Hesapla', href: '/arac/iso-gecme-tolerans-hesaplama' },
      { label: 'Yüzey Pürüzlülüğü Rehberi', href: '/arac/yuzey-puruzlulugu-rehberi' },
    ],
    intro: [
      'H7/g6, delik esaslı sistemde sık kullanılan boşluklu geçme kombinasyonlarından biridir. Delik H7 alanında, mil ise nominal ölçünün altında kalan g6 alanında üretildiği için montaj sonrasında kontrollü bir boşluk oluşması beklenir.',
      'Bu ifade tek başına sabit bir mikron değeri değildir. Alt ve üst sapmalar nominal çap aralığına göre değişir; bu nedenle teknik resimdeki ölçü mutlaka ilgili çapla birlikte değerlendirilmelidir.',
    ],
    sections: [
      {
        heading: 'H7/g6 geçme hangi durumlarda tercih edilir?',
        body: [
          'Parçaların rahat monte edilmesi, sökülebilmesi ve düşük boşlukla hareket etmesi gereken uygulamalarda değerlendirilebilir. Kılavuz miller, kayar yataklamalar, merkezleme elemanları ve hassas fakat sıkı olmayan montajlar buna örnek olabilir.',
          'Yük, hız, yağlama, sıcaklık ve yüzey kalitesi uygun değilse yalnız tolerans kombinasyonu iyi çalışma garantisi vermez.',
        ],
        list: ['Nominal çap aralığını doğrulayın.', 'Minimum ve maksimum boşluğu ayrı hesaplayın.', 'Yüzey pürüzlülüğü ile geometrik toleransları da belirtin.'],
      },
      {
        heading: 'Teknik resimde nasıl yazılır?',
        body: [
          'Montaj resminde geçme Ø25 H7/g6 gibi birlikte gösterilebilir. Parça resimlerinde ise delik ölçüsü Ø25 H7, mil ölçüsü Ø25 g6 olarak ayrı çağrılır.',
          'Fonksiyon için kritikse eş merkezlilik, silindiriklik, salgı veya yüzey pürüzlülüğü gibi ek gereksinimler yalnız ölçü toleransına bırakılmamalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'H7/g6 her zaman boşluklu geçme midir?', answer: 'Genel olarak boşluklu geçme karakteri verir; kesin minimum ve maksimum boşluk nominal çapa göre hesaplanmalıdır.' },
      { question: 'H7/g6 rulman yatağı için otomatik doğru seçim midir?', answer: 'Hayır. Rulman bilezik yükü, dönme durumu, sıcaklık ve üretici önerisi ayrıca değerlendirilmelidir.' },
    ],
  },
  {
    slug: 'h7-h6-gecme-nedir-bosluk-ve-montaj',
    title: 'H7/h6 Geçme Nedir? Boşluk, Montaj ve Hassas Merkezleme',
    description: 'H7/h6 geçmenin sınır ölçüleri, sıfıra yaklaşan minimum boşluk, montaj davranışı ve makine tasarımındaki kullanım alanları.',
    date: '2026-06-17',
    readTime: '6 dk okuma',
    category: 'Tolerans',
    keywords: ['H7 h6 geçme', 'H7/h6 tolerans', 'hassas boşluklu geçme', 'delik esaslı sistem', 'mil toleransı'],
    relatedTools: [
      { label: 'ISO Geçme Toleransı Hesapla', href: '/arac/iso-gecme-tolerans-hesaplama' },
      { label: 'Teknik Resim Çağrısı Oluştur', href: '/arac/teknik-resim-cagri-olusturucu' },
    ],
    intro: [
      'H7/h6 kombinasyonu, delik esaslı sistemde hassas boşluklu geçme amacıyla kullanılan yaygın seçeneklerden biridir. h tolerans alanında milin üst sapması sıfıra dayanır; bu nedenle en sıkı durumda boşluk sıfıra yaklaşabilir.',
      'Gerçek montaj davranışı nominal çap, ölçüm belirsizliği, yüzey pürüzlülüğü, sıcaklık ve geometrik sapmalardan etkilenir.',
    ],
    sections: [
      {
        heading: 'H7/h6 ile ne tür montaj elde edilir?',
        body: [
          'Hassas merkezleme ve kolay sökülebilir montaj gereken yerlerde değerlendirilebilir. Parçalar teorik olarak pres geçme gibi tasarlanmaz; fakat yüzey tepecikleri, kaplama veya sıcaklık farkı montaj kuvvetini artırabilir.',
          'Dönen veya kayarak çalışan yüzeylerde yağ filmi için yeterli çalışma boşluğu ayrıca kontrol edilmelidir.',
        ],
        list: ['Mil ve deliğin gerçek sıcaklığını dikkate alın.', 'Kaplama kalınlığını tolerans zincirine ekleyin.', 'Ölçüm yöntemi ile yüzey kalitesini teknik resimde tanımlayın.'],
      },
      {
        heading: 'H7/h6 ile H7/g6 arasındaki fark',
        body: [
          'g6 mili nominal ölçünün biraz altında konumlandığı için H7/g6 genellikle daha belirgin bir minimum boşluk verir. h6 ise nominal sınıra kadar çıkabildiğinden daha sıkı merkezleme sağlayabilir.',
          'Seçim yalnız montaj hissine göre değil; yük, hareket tipi, yağlama ve bakım gereksinimine göre yapılmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'H7/h6 pres geçme midir?', answer: 'Normal yaklaşımda pres geçme değildir; hassas boşluklu veya sıfıra yakın boşluklu montaj olarak değerlendirilir.' },
      { question: 'H7/h6 hareketli mil için kullanılabilir mi?', answer: 'Kullanım koşuluna bağlıdır. Hız, yağlama ve gerekli minimum çalışma boşluğu ayrıca kontrol edilmelidir.' },
    ],
  },
  {
    slug: '90-derece-sac-bukum-acinimi-nasil-hesaplanir',
    title: '90 Derece Sac Büküm Açınımı Nasıl Hesaplanır? Örnek Yaklaşım',
    description: '90 derece sac bükümde düz boy, büküm payı, K faktörü, iç radius ve büküm düşümü ilişkisini adım adım öğrenin.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Sac Metal',
    keywords: ['90 derece sac açınım', 'sac düz boy hesabı', 'büküm payı', 'K faktörü', 'bend allowance'],
    relatedTools: [
      { label: 'Sac Büküm Açınım Hesapla', href: '/arac/sac-bukum-acinim-hesaplama' },
      { label: 'Sac Büküm ve Kesim Hesaplayıcı', href: '/arac/sac-bukum-kesim-hesaplayici' },
    ],
    intro: [
      '90 derece bükümlü bir parçanın düz boyu, yalnız iki flanş boyunun toplanmasıyla bulunmaz. Büküm bölgesindeki nötr eksen uzunluğu hesaba katılmalı ve ölçülerin içten mi dıştan mı verildiği netleştirilmelidir.',
      'Sac kalınlığı, gerçek iç radius, K faktörü ve takım düzeni değiştiğinde aynı dış ölçüler için gereken açınım da değişebilir.',
    ],
    sections: [
      {
        heading: 'Büküm payı hangi değerlerle hesaplanır?',
        body: [
          'Yaygın yaklaşımda büküm payı; büküm açısı, iç radius, sac kalınlığı ve K faktörüne bağlıdır. K faktörü nötr eksenin sac kalınlığı içindeki yaklaşık konumunu temsil eder.',
          'Teorik sonuç ilk parça için başlangıç verir. Seri üretimde gerçek abkant, V kalıp, malzeme ve hadde yönüyle numune büküm yapılarak değer kalibre edilmelidir.',
        ],
        list: ['İç radiusu tahmin yerine ölçün.', 'Flanş ölçülerinin iç veya dış ölçü olduğunu belirleyin.', 'CAD ve atölye büküm tablosunda aynı K faktörünü kullanın.'],
      },
      {
        heading: 'Büküm düşümü ne zaman kullanılır?',
        body: [
          'Dış ölçüler üzerinden çalışan imalat yöntemlerinde toplam dış boylardan büküm düşümü çıkarılarak düz boy bulunabilir. İç ölçü veya teğet boy kullanılan çizimlerde ise büküm payı yaklaşımı daha doğrudan olabilir.',
          'Birden fazla büküm varsa her büküm ayrı değerlendirilir ve toplam açınımda ilgili paylar birlikte ele alınır.',
        ],
      },
    ],
    faq: [
      { question: 'Her 90 derece bükümde aynı K faktörü kullanılır mı?', answer: 'Hayır. Malzeme, kalınlık, radius ve büküm yöntemi değiştikçe uygun K faktörü de değişebilir.' },
      { question: 'Açınım neden üretimde birkaç milimetre farklı çıkabilir?', answer: 'Gerçek radius, kalınlık toleransı, yaylanma, V açıklığı ve ölçüm yöntemi teorik sonuçtan sapma oluşturabilir.' },
    ],
  },
  {
    slug: 'sac-kalinligina-gore-v-kalip-nasil-secilir',
    title: 'Sac Kalınlığına Göre V Kalıp Nasıl Seçilir?',
    description: 'Abkant bükümde V kalıp açıklığı, iç radius, minimum flanş, tonaj ve malzeme dayanımı arasındaki ilişkiyi pratik olarak öğrenin.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Sac Metal',
    keywords: ['V kalıp seçimi', 'sac kalınlığı V açıklığı', 'abkant kalıp', 'minimum flanş', 'büküm tonajı'],
    relatedTools: [
      { label: 'Sac Büküm ve Kesim Hesaplayıcı', href: '/arac/sac-bukum-kesim-hesaplayici' },
      { label: 'Sac Açınım Hesapla', href: '/arac/sac-bukum-acinim-hesaplama' },
    ],
    intro: [
      'Abkantta V kalıp açıklığı yalnız sac kalınlığına göre değil; malzeme dayanımı, hedef iç radius, minimum flanş, büküm yöntemi ve makine tonajına göre seçilir.',
      'Çok dar V açıklığı tonajı ve iz riskini artırabilir. Çok geniş V açıklığı ise iç radiusu ve minimum bükülebilir flanşı büyütebilir.',
    ],
    sections: [
      {
        heading: 'V açıklığı seçimi sonucu nasıl etkiler?',
        body: [
          'Havada bükümde iç radius büyük ölçüde V açıklığı ve malzeme davranışıyla oluşur. Kalıp açıklığı genişledikçe gerekli tonaj genellikle azalır; buna karşılık daha büyük radius ve daha uzun minimum flanş gerekebilir.',
          'Tabanlama veya ezme gibi yöntemlerde ilişki farklıdır ve takım üreticisinin kapasite tablosu esas alınmalıdır.',
        ],
        list: ['Malzeme çekme dayanımını doğrulayın.', 'Parçadaki en kısa flanşı kontrol edin.', 'Makine ve takımın metre başına tonaj sınırını aşmayın.'],
      },
      {
        heading: 'Kalıp seçiminde atölye doğrulaması',
        body: [
          'Teorik seçimden sonra takım omuz radiusu, punch uç radiusu, sac yüzey kalitesi ve büküm boyu kontrol edilmelidir. Uzun parçalarda tonaj kadar sehim ve bombe ayarı da ölçüyü etkiler.',
          'Dar toleranslı parçalarda ilk ürün ölçülerek açınım ve açı kompanzasyonu güncellenmelidir.',
        ],
      },
    ],
    faq: [
      { question: 'V açıklığı için tek bir kalınlık çarpanı yeterli midir?', answer: 'Başlangıç seçimi için kullanılabilir; nihai seçim malzeme, radius, flanş, tonaj ve takım kataloğuyla doğrulanmalıdır.' },
      { question: 'Daha dar V kalıp daha keskin büküm verir mi?', answer: 'Genellikle daha küçük radiusa yaklaşabilir; ancak tonaj, iz, çatlama ve takım kapasitesi riski artabilir.' },
    ],
  },
  {
    slug: 'm6-m8-m10-m12-civata-torku-nasil-belirlenir',
    title: 'M6, M8, M10 ve M12 Cıvata Torku Nasıl Belirlenir?',
    description: 'Metrik cıvatalarda sıkma torkunu etkileyen kalite sınıfı, sürtünme, yağlama, kaplama ve ön yük ilişkisini öğrenin.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Bağlantı Elemanları',
    keywords: ['M6 cıvata torku', 'M8 cıvata torku', 'M10 cıvata torku', 'M12 cıvata torku', 'cıvata sıkma tablosu'],
    relatedTools: [
      { label: 'Cıvata Sıkma Torku Hesapla', href: '/arac/civata-sikma-torku-hesaplama' },
      { label: 'Kılavuz Matkap Hesapla', href: '/arac/kilavuz-matkap-hesaplama' },
    ],
    intro: [
      'M6, M8, M10 veya M12 ifadesi yalnız diş çapını belirtir; güvenli sıkma torkunu tek başına belirlemez. Kalite sınıfı, bağlantı yüzeyi, yağlama, kaplama ve hedef ön yük birlikte değerlendirilmelidir.',
      'Aynı cıvata kuru ve yağlı montajda farklı sürtünme gösterdiği için aynı tork farklı ön yük oluşturabilir.',
    ],
    sections: [
      {
        heading: 'Tork değerini belirleyen ana değişkenler',
        body: [
          'Yaklaşık tork hesabında nominal çap, hedef ön yük ve sürtünmeyi temsil eden tork katsayısı kullanılır. Ancak uygulanan torkun büyük kısmı diş ve baş altı sürtünmesine harcanır.',
          'Kaplamalı, yağlı veya tekrar kullanılan bağlantılarda katalogdaki kuru tork değerinin doğrudan uygulanması aşırı ön yük oluşturabilir.',
        ],
        list: ['Cıvata kalite sınıfını okuyun.', 'Somun veya diş açılmış parçanın dayanımını kontrol edin.', 'Yağlama ve kaplama şartını montaj talimatında sabitleyin.'],
      },
      {
        heading: 'Kritik bağlantılarda neden yalnız tork yetmez?',
        body: [
          'Titreşim, yorulma, sızdırmazlık veya emniyet açısından kritik bağlantılarda ön yük doğrulaması, sıkma sırası ve kalibre edilmiş ekipman gerekir.',
          'Flanşlı bağlantılarda cıvatalar çapraz ve kademeli sıkılmalı; ezilebilir ara malzeme varsa oturma kaybı ayrıca değerlendirilmelidir.',
        ],
      },
    ],
    faq: [
      { question: 'M10 cıvatanın tek bir doğru tork değeri var mı?', answer: 'Hayır. Kalite sınıfı, yağlama, kaplama, diş adımı ve hedef ön yük değiştikçe gerekli tork da değişir.' },
      { question: 'Yağlı cıvatada kuru tork değeri kullanılabilir mi?', answer: 'Doğrudan kullanılması aşırı ön yük riski yaratabilir. Yağlama şartına uygun değer veya üretici talimatı kullanılmalıdır.' },
    ],
  },
  {
    slug: 'rulman-l10-omru-nasil-hesaplanir',
    title: 'Rulman L10 Ömrü Nasıl Hesaplanır? Devirden Saate Dönüşüm',
    description: 'Rulman dinamik yük kapasitesi, eşdeğer yük, bilyalı ve makaralı rulman üsleri ile L10 ömrünün çalışma saatine çevrilmesi.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Rulman',
    keywords: ['L10 rulman ömrü', 'rulman ömrü hesaplama', 'dinamik yük kapasitesi', 'eşdeğer yük', 'rulman çalışma saati'],
    relatedTools: [
      { label: 'Rulman Ömrü Hesapla', href: '/arac/rulman-omru-hesaplama' },
      { label: 'ISO Geçme Toleransı', href: '/arac/iso-gecme-tolerans-hesaplama' },
    ],
    intro: [
      'L10 ömrü, aynı koşullardaki yeterince büyük bir rulman grubunun yüzde 90’ının yorulma hasarı oluşmadan ulaşmasının beklendiği teorik ömürdür. Tek bir rulmanın kesin arıza zamanını göstermez.',
      'Hesapta katalog dinamik yük kapasitesi ile rulmana etkiyen eşdeğer dinamik yük karşılaştırılır; sonuç önce devir, ardından çalışma devri kullanılarak saat cinsine çevrilebilir.',
    ],
    sections: [
      {
        heading: 'Hesap için hangi veriler gerekir?',
        body: [
          'Rulman tipi, dinamik yük kapasitesi, radyal ve eksenel yükler, yük katsayıları ve çalışma devri temel girdilerdir. Bilyalı ve makaralı rulmanlarda ömür denklemindeki üs aynı değildir.',
          'Eşdeğer yük hesabı yalnız toplam kuvvetin alınması değildir; rulman tipine ve eksenel-radyal yük oranına göre katalog katsayıları kullanılabilir.',
        ],
        list: ['Doğru rulman kodunun C değerini kullanın.', 'Yüklerin aynı çalışma durumuna ait olduğundan emin olun.', 'Şok ve değişken yükler için uygun servis yaklaşımı kullanın.'],
      },
      {
        heading: 'Gerçek ömür neden teorik sonuçtan farklıdır?',
        body: [
          'Kirlilik, yetersiz yağlama, yanlış geçme, hizasızlık, elektrik akımı, yüksek sıcaklık ve montaj hasarı gerçek ömrü ciddi biçimde azaltabilir.',
          'Bu nedenle L10 sonucu yağlama ömrü, keçeleme, yatak toleransı ve bakım planıyla birlikte değerlendirilmelidir.',
        ],
      },
    ],
    faq: [
      { question: 'L10 ömrü garanti edilen minimum ömür müdür?', answer: 'Hayır. İstatistiksel bir temel ömür göstergesidir ve gerçek çalışma şartlarından etkilenir.' },
      { question: 'Rulman ömrü saat cinsine nasıl çevrilir?', answer: 'Teorik devir ömrü, dakikadaki gerçek çalışma devri kullanılarak çalışma saatine dönüştürülür.' },
    ],
  },
  {
    slug: 'barlow-formulu-ile-boru-et-kalinligi-hesabi',
    title: 'Barlow Formülü ile Boru Et Kalınlığı Hesabı Nasıl Yapılır?',
    description: 'İç basınçlı borularda çap, izin verilen gerilme, kaynak verimi, sıcaklık ve korozyon payıyla cidar ön hesabı.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Basınçlı Sistemler',
    keywords: ['Barlow formülü', 'boru et kalınlığı hesabı', 'basınçlı boru', 'boru cidar kalınlığı', 'iç basınç'],
    relatedTools: [
      { label: 'Boru Et Kalınlığı Hesapla', href: '/arac/boru-eti-hesaplama' },
      { label: 'Basınçlı Kap Cidar Hesapla', href: '/arac/basincli-kap-cidar-kalinligi' },
    ],
    intro: [
      'Barlow yaklaşımı, ince cidarlı borularda iç basınç ile çevresel gerilme arasındaki ilişkiyi kullanarak teorik cidar kalınlığı için hızlı bir ön hesap sağlar.',
      'Bu sonuç doğrudan sipariş et kalınlığı değildir. İlgili borulama standardı, sıcaklıkta izin verilen gerilme, üretim toleransı, kaynak katsayısı ve korozyon payı ayrıca uygulanmalıdır.',
    ],
    sections: [
      {
        heading: 'Temel girdiler nelerdir?',
        body: [
          'İç basınç, boru çapı, malzemenin çalışma sıcaklığındaki izin verilen gerilmesi ve bağlantı verimi temel girdilerdir. Kullanılan çapın iç veya dış çap olması, denklem biçimine göre doğru seçilmelidir.',
          'Basınç birimi ile gerilme birimi uyumlu değilse sonuç hatalı çıkar. Tüm değerler aynı birim sistemine çevrilmelidir.',
        ],
        list: ['Tasarım basıncını çalışma basıncından ayırın.', 'Sıcaklığa bağlı malzeme değerini kullanın.', 'Kaynaklı boruda uygun birleşim verimini kontrol edin.'],
      },
      {
        heading: 'Teorik kalınlığa hangi paylar eklenir?',
        body: [
          'Korozyon veya erozyon payı, eksi hadde toleransı, diş veya kanal kaybı ve mekanik yük gereksinimleri teorik basınç cidarına eklenebilir.',
          'Dış yük, vakum, ovalleşme, darbe ve destek aralığı gibi etkiler Barlow hesabının dışında kalabilir; nihai tasarım ilgili kodla doğrulanmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'Barlow formülü nihai boru seçimi için yeterli mi?', answer: 'Hayır. Hızlı ön hesap sağlar; standarda bağlı katsayılar ve diğer yük durumları ayrıca kontrol edilmelidir.' },
      { question: 'Korozyon payı formül sonucuna dahil midir?', answer: 'Temel teorik sonuçta genellikle ayrı değerlendirilir ve gerekli minimum kalınlığa sonradan eklenir.' },
    ],
  },
  {
    slug: 'torktan-mil-capi-nasil-hesaplanir',
    title: 'Torktan Mil Çapı Nasıl Hesaplanır? Burulma ve Emniyet Kontrolü',
    description: 'Aktarılan tork, izin verilen kayma gerilmesi, eğilme, kama kanalı ve emniyet katsayısına göre mil çapı ön seçimi.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Makine Tasarımı',
    keywords: ['torktan mil çapı', 'mil çapı hesaplama', 'burulma gerilmesi', 'şaft hesabı', 'mil mukavemeti'],
    relatedTools: [
      { label: 'Mil Mukavemet Hesapla', href: '/arac/mil-mukavemet-hesaplama' },
      { label: 'Kama Kanalı Hesapla', href: '/arac/kama-kanali-hesaplama' },
    ],
    intro: [
      'Dolu dairesel bir milin ilk çap tahmini, aktarılan tork ile izin verilen kayma gerilmesi arasındaki burulma ilişkisi kullanılarak yapılabilir. Ancak gerçek makine millerinde çoğu zaman eğilme momenti de bulunur.',
      'Kama kanalı, segman kanalı, omuz ve çap geçişleri gerilme yığılması oluşturduğundan yalnız düzgün mil formülüyle nihai tasarım yapılmamalıdır.',
    ],
    sections: [
      {
        heading: 'Sadece tork bulunan durumda ön seçim',
        body: [
          'Tork arttıkça gerekli çap büyür; malzemenin izin verilen kayma gerilmesi yükseldikçe aynı tork için gereken çap azalabilir. Emniyet katsayısı, yükün kararlılığı ve darbe durumu izin verilen değerin belirlenmesinde etkilidir.',
          'Hesaplanan teorik çap, standart malzeme ve rulman ölçülerine uygun bir üst çapa yuvarlanır.',
        ],
        list: ['Tork birimini doğru kullanın.', 'Darbeli ve tersinir yükleri ayırın.', 'Kama kanalı için net kesit ve çentik etkisini kontrol edin.'],
      },
      {
        heading: 'Eğilme ve burulma birlikte nasıl değerlendirilir?',
        body: [
          'Dişli, kasnak veya zincir kuvvetleri rulman reaksiyonları üzerinden eğilme momenti oluşturur. Bu durumda eşdeğer gerilme yaklaşımıyla eğilme ve burulma birlikte ele alınır.',
          'Çap seçimi sonrasında sehim, yatak açıklığı, kritik devir, yorulma ve yüzey kalitesi kontrolleri yapılmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'Hesaplanan mil çapını doğrudan kullanabilir miyim?', answer: 'Ön boyutlandırma için kullanılabilir; yorulma, sehim, çentik, kritik devir ve üretim koşulları ayrıca doğrulanmalıdır.' },
      { question: 'Kama kanalı mil dayanımını etkiler mi?', answer: 'Evet. Net kesiti azaltır ve gerilme yığılması oluşturabilir; tasarım hesabında dikkate alınmalıdır.' },
    ],
  },
  {
    slug: 'disli-modul-dis-sayisi-ve-merkez-mesafesi-hesabi',
    title: 'Dişli Modül, Diş Sayısı ve Merkez Mesafesi Nasıl Hesaplanır?',
    description: 'Düz dişlilerde modül, diş sayısı, hatve çapı, dış çap, aktarım oranı ve merkez mesafesi arasındaki temel ilişkiler.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Dişli Çark',
    keywords: ['dişli modül hesabı', 'diş sayısı', 'merkez mesafesi', 'hatve çapı', 'dişli oranı'],
    relatedTools: [
      { label: 'Dişli Çark Hesapla', href: '/arac/disli-carki-hesaplama' },
      { label: 'Mil Mukavemet Hesapla', href: '/arac/mil-mukavemet-hesaplama' },
    ],
    intro: [
      'Düz dişli geometrisinde modül ve diş sayısı hatve çapını belirler. Birbirine çalışan iki dişlinin hatve çapları ise standart yerleşimde merkez mesafesinin temelini oluşturur.',
      'Geometrik hesap, dişlinin yük taşıma kapasitesini tek başına göstermez. Malzeme, diş genişliği, kalite, yağlama, hız ve servis katsayısı ayrıca ele alınmalıdır.',
    ],
    sections: [
      {
        heading: 'Temel geometrik ilişkiler',
        body: [
          'Hatve çapı modül ile diş sayısının çarpımıyla ilişkilidir. Standart düz dişlide dış çap, hatve çapına modüle bağlı bir ilaveyle bulunur. İki dişlinin aktarım oranı diş sayıları oranından elde edilir.',
          'Karşılıklı çalışan dişlilerde modül ve basınç açısı uyumlu olmalıdır. Profil kaydırma varsa standart merkez mesafesi ilişkisi değişebilir.',
        ],
        list: ['Her iki dişlide aynı modülü kullanın.', 'Basınç açısını ve profil tipini doğrulayın.', 'Düşük diş sayısında alttan kesme riskini kontrol edin.'],
      },
      {
        heading: 'Geometri sonrası hangi kontroller yapılır?',
        body: [
          'Diş dibi eğilme dayanımı, yüzey temas basıncı, mil ve rulman yükleri, yağlama ve gürültü hedefi kontrol edilmelidir.',
          'Yüksek hızlı veya hassas aktarmalarda dişli kalite sınıfı, salgı ve gövde rijitliği merkez mesafesi kadar önemlidir.',
        ],
      },
    ],
    faq: [
      { question: 'Sadece modül ve diş sayısı dişliyi seçmek için yeterli mi?', answer: 'Hayır. Geometriyi verir; dayanım, genişlik, malzeme, kalite ve servis koşulları ayrıca hesaplanmalıdır.' },
      { question: 'Merkez mesafesi değişirse dişliler çalışır mı?', answer: 'Sınırlı değişiklikler boşluğu etkileyebilir; profil kaydırma ve temas koşulları teknik olarak doğrulanmalıdır.' },
    ],
  },
  {
    slug: 'o-ring-kanal-olcusu-ve-sikistirma-orani-nasil-secilir',
    title: 'O-Ring Kanal Ölçüsü ve Sıkıştırma Oranı Nasıl Seçilir?',
    description: 'Statik ve dinamik O-ring uygulamalarında kanal derinliği, genişliği, sıkıştırma, doluluk, boşluk ve yüzey kalitesi seçimi.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Sızdırmazlık',
    keywords: ['o-ring kanal ölçüsü', 'o-ring sıkıştırma oranı', 'kanal derinliği', 'o-ring doluluk', 'statik sızdırmazlık'],
    relatedTools: [
      { label: 'O-Ring Kanalı Hesapla', href: '/arac/o-ring-kanali-hesaplama' },
      { label: 'Yüzey Pürüzlülüğü Rehberi', href: '/arac/yuzey-puruzlulugu-rehberi' },
    ],
    intro: [
      'O-ring kanalının derinliği ve genişliği, contanın ne kadar sıkışacağını ve kanal içinde ne kadar hacim dolduracağını belirler. Aşırı sıkıştırma sürtünme, ısınma ve erken hasar; yetersiz sıkıştırma ise kaçak riski oluşturabilir.',
      'Statik yüzeysel, statik radyal, piston veya mil uygulamalarında aynı kanal oranı kullanılmaz. Basınç, hareket, malzeme sertliği ve sıcaklık birlikte değerlendirilmelidir.',
    ],
    sections: [
      {
        heading: 'Kanal derinliği ve genişliği neyi kontrol eder?',
        body: [
          'Kanal derinliği O-ring kesitinin sıkıştırma miktarını belirler. Kanal genişliği ise sıkışan elastomerin yana doğru genişlemesi ve sıcaklıkta hacim değişimi için alan sağlar.',
          'Kanal doluluğu fazla olursa elastomerin hareket edecek hacmi kalmaz. Çok düşük dolulukta ise basınç altında kararsızlık ve ekstrüzyon riski artabilir.',
        ],
        list: ['O-ring gerçek kesit toleransını kullanın.', 'Kanal ve karşı yüzey ölçü toleranslarını zincire ekleyin.', 'Basınçta ekstrüzyon boşluğunu kontrol edin.'],
      },
      {
        heading: 'Yüzey ve giriş geometrisi neden önemlidir?',
        body: [
          'Keskin kenarlar montaj sırasında O-ring yüzeyini kesebilir. Uygun giriş pahı, çapaksız kanal ve kontrollü yüzey pürüzlülüğü sızdırmazlık ömrünü artırır.',
          'Dinamik uygulamalarda yağlama ve yüzey kalitesi daha kritiktir; hız ve sıcaklık elastomer seçimini de etkiler.',
        ],
      },
    ],
    faq: [
      { question: 'Statik ve dinamik O-ring kanalı aynı ölçüde olabilir mi?', answer: 'Her zaman değil. Hareket, sürtünme ve yağlama nedeniyle dinamik uygulamalarda farklı sıkıştırma ve yüzey şartları gerekebilir.' },
      { question: 'Kanalı O-ring çapına tam eşit yapmak doğru mu?', answer: 'Genellikle hayır. Sıkıştırma ve hacim genişlemesi için uygulamaya uygun derinlik ve genişlik gerekir.' },
    ],
  },
  {
    slug: 'kablo-kesiti-ve-gerilim-dusumu-birlikte-nasil-hesaplanir',
    title: 'Kablo Kesiti ve Gerilim Düşümü Birlikte Nasıl Hesaplanır?',
    description: 'Akım, mesafe, faz tipi, bakır-alüminyum iletken, sıcaklık ve izin verilen gerilim düşümüyle kablo ön seçimi.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Elektrik',
    keywords: ['kablo kesiti hesaplama', 'gerilim düşümü', 'mesafeye göre kablo', 'akım taşıma kapasitesi', 'bakır kablo'],
    relatedTools: [
      { label: 'Kablo Kesiti Hesapla', href: '/arac/kablo-kesiti-hesaplama' },
      { label: 'Voltaj Düşümü Hesapla', href: '/arac/voltaj-dusumu-hesaplama' },
    ],
    intro: [
      'Kablo kesiti yalnız akım taşıma kapasitesine göre seçilmemelidir. Uzun hatlarda gerilim düşümü, kısa devre dayanımı, döşeme şekli, ortam sıcaklığı ve gruplanma etkisi daha büyük kesit gerektirebilir.',
      'Ön hesapta akım, hat uzunluğu, sistem gerilimi, tek veya üç faz durumu ve iletken malzemesi birlikte kullanılır.',
    ],
    sections: [
      {
        heading: 'Gerilim düşümü hesabında hangi uzunluk kullanılır?',
        body: [
          'Tek fazlı devrede gidiş-dönüş iletken yolu; üç fazlı dengeli sistemde ise ilgili üç faz bağıntısı dikkate alınır. Hesap aracındaki uzunluk tanımının tek yön mü toplam yol mu olduğu kontrol edilmelidir.',
          'Kablo direnci sıcaklıkla değiştiği için uzun ve yüksek yüklü hatlarda yalnız oda sıcaklığı değeri yeterli olmayabilir.',
        ],
        list: ['Yük akımını gerçek çalışma durumuna göre belirleyin.', 'Döşeme ve ortam düzeltme katsayılarını kontrol edin.', 'Koruma elemanı ile kablonun koordinasyonunu doğrulayın.'],
      },
      {
        heading: 'Kesit seçiminin son kontrolü',
        body: [
          'Hesaplanan kesit bir üst standart kesite yuvarlanır ve akım taşıma tablosuyla karşılaştırılır. Motor gibi kalkış akımı yüksek yüklerde başlangıç anındaki gerilim düşümü ayrıca incelenmelidir.',
          'Nihai seçim yerel tesisat kuralları, proje şartnamesi ve yetkili elektrik mühendisi kontrolüyle yapılmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'Sadece akıma göre kablo seçmek yeterli mi?', answer: 'Hayır. Gerilim düşümü, döşeme şekli, sıcaklık, kısa devre ve koruma elemanı uyumu da kontrol edilmelidir.' },
      { question: 'Alüminyum ve bakır kabloda aynı kesit kullanılabilir mi?', answer: 'İletkenlikleri farklıdır; aynı koşulda gerekli kesit ve bağlantı detayları değişebilir.' },
    ],
  },
  {
    slug: 'voltaj-dusumu-yuzde-hesabi-ve-kablo-uzunlugu',
    title: 'Voltaj Düşümü Yüzde Hesabı: Kablo Uzunluğu Sonucu Nasıl Etkiler?',
    description: 'Kablo uzunluğu, akım, kesit, iletken malzemesi ve faz tipinin voltaj düşümü ile yüzde kayıp üzerindeki etkisi.',
    date: '2026-06-17',
    readTime: '6 dk okuma',
    category: 'Elektrik',
    keywords: ['voltaj düşümü yüzde', 'kablo uzunluğu gerilim düşümü', 'gerilim kaybı', 'kablo kesiti', 'üç faz voltaj düşümü'],
    relatedTools: [
      { label: 'Voltaj Düşümü Hesapla', href: '/arac/voltaj-dusumu-hesaplama' },
      { label: 'Kablo Kesiti Hesapla', href: '/arac/kablo-kesiti-hesaplama' },
    ],
    intro: [
      'Hat uzadıkça iletken direnci artar ve yük akımı altında daha fazla gerilim düşümü oluşur. Aynı güçte daha büyük kesit veya daha yüksek sistem gerilimi kullanılması düşümü azaltabilir.',
      'Yüzde gerilim düşümü, hesaplanan volt kaybının nominal sistem gerilimine oranlanmasıyla değerlendirilir. Kabul edilecek sınır proje türüne ve yürürlükteki kurallara göre belirlenmelidir.',
    ],
    sections: [
      {
        heading: 'Gerilim düşümünü artıran etkenler',
        body: [
          'Yüksek akım, uzun mesafe, küçük kesit ve düşük iletkenlik düşümü artırır. Alternatif akım sistemlerinde güç faktörü ile reaktans da özellikle büyük kesit ve uzun hatlarda etkili olabilir.',
          'Bağlantı noktalarındaki gevşeklik veya oksitlenme teorik kablo hesabında görünmeyen ek gerilim kaybı ve ısınma oluşturabilir.',
        ],
        list: ['Hat uzunluğunu doğru tanımlayın.', 'Gerçek yük akımını kullanın.', 'Bağlantı ve klemens kayıplarını saha ölçümüyle kontrol edin.'],
      },
      {
        heading: 'Sonuç nasıl yorumlanır?',
        body: [
          'Volt ve yüzde değerleri birlikte incelenmelidir. Düşük gerilimli sistemlerde küçük bir volt kaybı yüzde olarak daha büyük olabilir.',
          'Motor, sürücü, aydınlatma veya hassas elektronik yüklerin izin verdiği gerilim aralığına göre kesit yeniden seçilebilir.',
        ],
      },
    ],
    faq: [
      { question: 'Kablo kesitini büyütmek gerilim düşümünü azaltır mı?', answer: 'Genellikle evet. Daha büyük kesit iletken direncini azaltır; nihai seçim diğer elektriksel ve ekonomik kriterlerle yapılmalıdır.' },
      { question: 'Gerilim düşümü sınırı her projede aynı mı?', answer: 'Hayır. Tesis türü, yük ve uygulanacak mevzuat veya proje şartnamesine göre değişebilir.' },
    ],
  },
  {
    slug: 'kose-kaynagi-bogaz-kalinligi-nasil-hesaplanir',
    title: 'Köşe Kaynağı Boğaz Kalınlığı Nasıl Hesaplanır?',
    description: 'Köşe kaynaklarında a ölçüsü, kaynak boyu, dikiş sayısı, yük yönü, izin verilen gerilme ve etkin kaynak alanı ilişkisi.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Kaynak',
    keywords: ['köşe kaynağı boğaz kalınlığı', 'a ölçüsü', 'kaynak dikişi hesabı', 'kaynak mukavemeti', 'etkin kaynak alanı'],
    relatedTools: [
      { label: 'Kaynak Dikişi Hesapla', href: '/arac/kaynak-dikisi-hesaplama' },
      { label: 'Levha Ağırlığı Hesapla', href: '/arac/levha-agirlik-hesaplama' },
    ],
    intro: [
      'Köşe kaynağında taşıyan kesit, görünür kaynak ayağından farklı olan etkin boğaz alanıdır. Boğaz kalınlığı, etkin kaynak boyu ve dikiş sayısıyla birlikte yük taşıma kapasitesini belirler.',
      'Yükün yönü, eksantriklik, kaynak grubu geometrisi, ana malzeme ve kaynak sarf malzemesi dayanımı nihai hesabı etkiler.',
    ],
    sections: [
      {
        heading: 'Basit doğrudan yükte temel yaklaşım',
        body: [
          'Doğrudan kesme yükünde toplam etkin alan, boğaz kalınlığı ile etkin kaynak boyunun ve paralel dikiş sayısının çarpımıyla ilişkilendirilebilir. Uygun izin verilen gerilme kullanılarak ilk boyutlandırma yapılır.',
          'Kaynak başlangıç ve bitiş bölgeleri, krater, kesintiler ve gerçek etkin boy göz önüne alınmalıdır.',
        ],
        list: ['Yükün kaynağa göre yönünü belirleyin.', 'Tek veya çift taraflı dikişi doğru tanımlayın.', 'Minimum ve maksimum kaynak ölçüsü gereksinimlerini kontrol edin.'],
      },
      {
        heading: 'Eksantrik yükte neden daha ayrıntılı hesap gerekir?',
        body: [
          'Yük kaynak grubunun ağırlık merkezinden geçmiyorsa doğrudan kuvvete ek olarak moment oluşur. Bu durumda kaynak grubundaki gerilme dağılımı yalnız toplam uzunluğa bölünerek bulunamaz.',
          'Yorulmalı, dinamik veya emniyet kritik birleşimlerde ilgili kaynak standardı, detay sınıfı, muayene ve kalite şartları uygulanmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'Kaynak ayağı ile boğaz kalınlığı aynı mı?', answer: 'Hayır. Köşe kaynağında etkin boğaz, kaynak geometrisine bağlı olarak ayak ölçüsünden farklıdır.' },
      { question: 'Kaynak boyunu artırmak kapasiteyi artırır mı?', answer: 'Basit durumda etkin alanı artırır; ancak yük dağılımı, eksantriklik ve birleşim rijitliği ayrıca kontrol edilmelidir.' },
    ],
  },
  {
    slug: 'basincli-kap-cidar-kalinligi-on-hesabi',
    title: 'Basınçlı Kap Cidar Kalınlığı Ön Hesabı Nasıl Yapılır?',
    description: 'Silindirik basınçlı kapta iç basınç, çap, izin verilen gerilme, kaynak verimi, sıcaklık ve korozyon payı ile cidar hesabı.',
    date: '2026-06-17',
    readTime: '8 dk okuma',
    category: 'Basınçlı Sistemler',
    keywords: ['basınçlı kap cidar hesabı', 'silindirik gövde kalınlığı', 'iç basınç', 'kaynak verimi', 'korozyon payı'],
    relatedTools: [
      { label: 'Basınçlı Kap Cidar Hesapla', href: '/arac/basincli-kap-cidar-kalinligi' },
      { label: 'Boru Et Kalınlığı Hesapla', href: '/arac/boru-eti-hesaplama' },
    ],
    intro: [
      'Silindirik basınçlı kaplarda gövde cidarı; tasarım basıncı, çap, malzemenin çalışma sıcaklığındaki izin verilen gerilmesi ve kaynak birleşim verimiyle ilişkilidir.',
      'Online sonuç yalnız ön boyutlandırmadır. Başlık tipi, nozullar, lokal gerilmeler, dış yükler, test basıncı, üretim toleransı ve yürürlükteki basınçlı ekipman kuralları ayrıca değerlendirilmelidir.',
    ],
    sections: [
      {
        heading: 'Tasarım girdileri nasıl seçilir?',
        body: [
          'Normal çalışma basıncı yerine emniyet payı ve olası işletme durumlarını içeren tasarım basıncı kullanılmalıdır. Malzeme dayanımı oda sıcaklığındaki çekme değeri değil, ilgili sıcaklık için izin verilen tasarım gerilmesi olmalıdır.',
          'Kaynak verimi, uygulanacak kaynak detayı ve muayene seviyesine bağlı olabilir. Rastgele yüksek değer seçmek cidarı güvenli olmayan biçimde küçültebilir.',
        ],
        list: ['Tasarım sıcaklığı ve basıncını birlikte belirleyin.', 'Malzeme sertifikası ve izin verilen gerilmeyi doğrulayın.', 'Kaynak ve tahribatsız muayene kapsamını tanımlayın.'],
      },
      {
        heading: 'Hesaplanan kalınlığa eklenecek paylar',
        body: [
          'Korozyon payı, eksi sac toleransı, şekillendirme incelmesi ve gerekli minimum imalat kalınlığı teorik basınç cidarına eklenebilir.',
          'Nozul çevresi, mesnet, kaldırma kulağı ve gövde birleşimlerinde lokal kontrol gerekebilir. Dış basınç veya vakum varsa burkulma hesabı ayrıca yapılmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'Online cidar hesabı CE tasarımı için yeterli mi?', answer: 'Hayır. İlgili yönetmelik, harmonize standart veya kabul edilen tasarım koduna göre yetkin mühendislik doğrulaması gerekir.' },
      { question: 'Korozyon payı her kapta aynı mı?', answer: 'Hayır. Akışkan, malzeme, ömür, sıcaklık ve bakım yaklaşımına göre belirlenir.' },
    ],
  },
  {
    slug: 'pompa-gucu-debi-ve-basma-yuksekliginden-nasil-hesaplanir',
    title: 'Pompa Gücü Debi ve Basma Yüksekliğinden Nasıl Hesaplanır?',
    description: 'Debi, toplam dinamik basma yüksekliği, yoğunluk, pompa verimi ve motor payıyla hidrolik güç ve motor gücü hesabı.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Akışkanlar',
    keywords: ['pompa güç hesabı', 'debi basma yüksekliği', 'hidrolik güç', 'pompa motor gücü', 'pompa verimi'],
    relatedTools: [
      { label: 'Pompa Gücü Hesapla', href: '/arac/pompa-guc-hesaplama' },
      { label: 'Reynolds Sayısı Hesapla', href: '/arac/reynolds-sayisi-hesaplama' },
    ],
    intro: [
      'Pompanın akışkana aktardığı hidrolik güç; debi, toplam basma yüksekliği, yoğunluk ve yerçekimi ivmesiyle ilişkilidir. Motordan çekilecek güç ise pompa ve tahrik verimleri nedeniyle daha yüksek olur.',
      'Toplam basma yüksekliği yalnız kot farkı değildir; hat sürtünmesi, vana ve fittings kayıpları, giriş-çıkış basınç farkı da sisteme göre eklenir.',
    ],
    sections: [
      {
        heading: 'Toplam basma yüksekliği nasıl belirlenir?',
        body: [
          'Statik yükseklik, emiş ve basma hatlarındaki sürtünme kayıpları ile gerekli uç basınç birlikte değerlendirilir. Debi değiştikçe sürtünme kaybı da değiştiğinden tek bir sabit değer değildir.',
          'Pompa çalışma noktası, sistem eğrisi ile pompa eğrisinin kesiştiği bölgede oluşur. Yalnız motor gücü hesabı pompanın uygun çalışma noktasında olduğunu göstermez.',
        ],
        list: ['Debi birimini doğru çevirin.', 'Akışkan yoğunluğunu ve viskozitesini kontrol edin.', 'Pompa eğrisindeki gerçek verimi kullanın.'],
      },
      {
        heading: 'Motor gücü nasıl seçilir?',
        body: [
          'Hidrolik güç pompa verimine bölünerek mil gücü tahmin edilir; kaplin, kayış veya sürücü kayıpları varsa ayrıca dikkate alınabilir. Motor, çalışma eğrisi boyunca aşırı yüklenmeyecek şekilde seçilmelidir.',
          'Kavitasyon kontrolü için NPSH şartı, güç hesabından bağımsız olarak incelenmelidir.',
        ],
      },
    ],
    faq: [
      { question: 'Basma yüksekliği sadece dikey metre midir?', answer: 'Hayır. Statik kot farkına ek olarak boru, vana ve ekipman kayıpları ile basınç gereksinimi de dahil olabilir.' },
      { question: 'Pompa verimi bilinmiyorsa ne yapılır?', answer: 'Ön tahmin yapılabilir; nihai motor seçimi üretici pompa eğrisindeki çalışma noktası verimiyle doğrulanmalıdır.' },
    ],
  },
  {
    slug: 'oee-nasil-hesaplanir-kullanilabilirlik-performans-kalite',
    title: 'OEE Nasıl Hesaplanır? Kullanılabilirlik, Performans ve Kalite',
    description: 'Planlı üretim süresi, duruş, ideal çevrim, toplam üretim ve sağlam ürün verileriyle OEE hesabını ve kayıpları yorumlayın.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Üretim',
    keywords: ['OEE nasıl hesaplanır', 'kullanılabilirlik performans kalite', 'üretim verimliliği', 'makine duruşu', 'ideal çevrim süresi'],
    relatedTools: [
      { label: 'OEE Hesapla', href: '/arac/oee-uretim-verimliligi-hesaplama' },
      { label: 'Takt Süresi Hesapla', href: '/arac/takt-suresi-kapasite-hesaplama' },
    ],
    intro: [
      'OEE, ekipmanın planlanan üretim süresini ne kadar etkili kullandığını üç bileşenle gösterir: kullanılabilirlik, performans ve kalite. Bu üç oran çarpılarak toplam OEE değeri elde edilir.',
      'Tek başına yüksek veya düşük yüzde nedenleri açıklamaz. Duruş kayıtları, hız kaybı ve hurda nedenleri ayrı izlenmelidir.',
    ],
    sections: [
      {
        heading: 'Üç bileşen nasıl hesaplanır?',
        body: [
          'Kullanılabilirlik, planlanan üretim süresinin duruşlar sonrası ne kadarının çalışmaya ayrıldığını gösterir. Performans, gerçek üretim hızını ideal çevrimle karşılaştırır. Kalite ise sağlam ürünün toplam üretime oranıdır.',
          'Veriler aynı vardiya veya aynı raporlama döneminden alınmazsa oranlar anlamını kaybeder.',
        ],
        list: ['Planlı mola ile arızayı ayrı kodlayın.', 'İdeal çevrim süresini gerçek ürün ve operasyon için tanımlayın.', 'Rework ve hurda sınıflandırmasını sabitleyin.'],
      },
      {
        heading: 'OEE sonucu nasıl iyileştirilir?',
        body: [
          'Önce en düşük bileşen değil, toplam kayba en fazla dakika veya adet etkisi yapan neden bulunmalıdır. Kısa fakat sık mikro duruşlar performans kaybında gizlenebilir.',
          'OEE hedefi hatlar arasında doğrudan kopyalanmamalı; ürün çeşitliliği, proses ve planlama yapısı dikkate alınmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'OEE yüzde 100 olabilir mi?', answer: 'Teorik olarak mümkün görünse de gerçek üretimde planlama, ölçüm yöntemi ve süreç kayıpları nedeniyle sürdürülebilirliği ayrıca sorgulanmalıdır.' },
      { question: 'Planlı bakım OEE duruşuna dahil mi?', answer: 'Şirketin OEE tanımına bağlıdır. Planlanan üretim süresinin nasıl tanımlandığı raporda açık olmalıdır.' },
    ],
  },

  {
    slug: 'giyotin-bicak-boslugu-nasil-ayarlanir',
    title: 'Giyotin Bıçak Boşluğu Nasıl Ayarlanır? Sac Kalınlığına Göre Pratik Rehber',
    description: 'Giyotin makasta bıçak boşluğunu sac kalınlığı, malzeme dayanımı ve kesim kalitesine göre seçme; çapak, ezilme ve bıçak ömrünü etkileyen noktalar.',
    date: '2026-06-17',
    readTime: '7 dk okuma',
    category: 'Sac Metal',
    keywords: ['giyotin bıçak boşluğu', 'sac kesim boşluğu', 'giyotin makas ayarı', 'sac kalınlığı', 'kesim çapağı'],
    relatedTools: [
      { label: 'Sac Büküm ve Kesim Hesaplayıcı', href: '/arac/sac-bukum-kesim-hesaplayici' },
      { label: 'Sac Büküm Açınım Hesapla', href: '/arac/sac-bukum-acinim-hesaplama' },
    ],
    intro: [
      'Giyotin makasta üst ve alt bıçak arasındaki boşluk, kesim kalitesini ve takım ömrünü doğrudan etkiler. Boşluk çok dar olduğunda kesme kuvveti yükselir, bıçak aşınması hızlanır ve sac kenarında ezilme görülebilir. Boşluk fazla olduğunda ise çapak, kenar eğimi ve deformasyon artabilir.',
      'Doğru başlangıç değeri; sac kalınlığına, malzemenin çekme dayanımına, sertliğine ve hedeflenen kenar kalitesine göre belirlenmelidir. Makine üreticisinin tablosu ve gerçek kesim denemesi nihai ayar için esas alınmalıdır.',
    ],
    sections: [
      {
        heading: 'Bıçak boşluğu neye göre seçilir?',
        body: [
          'Bıçak boşluğu genellikle sac kalınlığının belirli bir yüzdesi olarak ifade edilir. Ancak aynı kalınlıktaki yumuşak çelik, paslanmaz çelik ve alüminyum için aynı oran uygun olmayabilir. Daha yüksek dayanımlı ve sert malzemelerde farklı boşluk gerekebilir.',
          'Boşluk değerinin makinenin iki tarafında eşit olması da önemlidir. Paralellik bozukluğu, kesim boyunca değişen çapak ve eğri kenar oluşturabilir.',
        ],
        list: [
          'Sac kalınlığını ve gerçek malzeme sınıfını doğrulayın.',
          'Makine üreticisinin bıçak boşluğu tablosunu başlangıç olarak kullanın.',
          'Kesim boyu boyunca sağ ve sol boşluğun eşitliğini kontrol edin.',
          'İlk kesimde çapak, yüzey kırılması ve kenar dikliğini inceleyin.',
        ],
      },
      {
        heading: 'Boşluk çok dar veya çok geniş olursa ne olur?',
        body: [
          'Çok dar boşluk, bıçakların birbirine yaklaşmasına ve gereksiz yüksek kesme kuvvetine neden olabilir. Kesim yüzeyinde çift kırılma izi, ezilme veya bıçak köşelerinde hasar görülebilir.',
          'Çok geniş boşlukta malzeme kesilmeden önce daha fazla plastik şekil değiştirir. Bunun sonucu olarak çapak yüksekliği, kenar eğimi ve ince saclarda kıvrılma artabilir.',
        ],
        list: [
          'Dar boşluk belirtisi: yüksek ses, yüksek kuvvet, parlak yüzey oranının artması ve bıçak aşınması.',
          'Geniş boşluk belirtisi: belirgin çapak, eğimli kesim yüzeyi ve sac kenarında yuvarlanma.',
          'Her ayar değişikliğinden sonra kısa numune kesimi yapın.',
        ],
      },
      {
        heading: 'Kesim kalitesi nasıl kontrol edilir?',
        body: [
          'Kesilen kenarda yuvarlanma bölgesi, parlak kesme yüzeyi, kırılma yüzeyi ve çapak birlikte değerlendirilmelidir. Sadece çapak yüksekliğine bakmak, bıçak keskinliği veya paralellik sorunlarını gözden kaçırabilir.',
          'Bıçakların körelmesi, doğru boşluk kullanılsa bile kesim kalitesini bozabilir. Bu nedenle boşluk ayarı ile bıçak durumu ayrı ayrı kontrol edilmelidir.',
        ],
        list: [
          'Kesim boyunca çapak yüksekliğini karşılaştırın.',
          'Kenarın dikliğini ve sacın burulmasını kontrol edin.',
          'Bıçak keskinliği, bindirme ve paralellik ayarlarını bakım planına alın.',
        ],
      },
      {
        heading: 'Hesaplanan değer nasıl kullanılmalı?',
        body: [
          'Online hesaplayıcıdan alınan değer, makine ayarı için ön seçim sağlar. Nihai değer; makinenin mekanik yapısı, bıçak geometrisi, aşınma durumu ve üretici tavsiyesiyle doğrulanmalıdır.',
          'Seri üretim öncesinde aynı malzeme partisinden numune kesmek, ayarı kayıt altına almak ve tekrar eden işler için şirket içi bir kesim tablosu oluşturmak en güvenli yöntemdir.',
        ],
      },
    ],
    faq: [
      { question: 'Giyotin bıçak boşluğu iki bıçak arasındaki toplam boşluk mudur?', answer: 'Makine ve kaynak tablosuna göre ifade biçimi değişebilir. Bazı tablolar tek taraflı, bazıları toplam boşluk verir. Ayar yapmadan önce makine kılavuzundaki tanımı kontrol edin.' },
      { question: 'Paslanmaz çelikte aynı kalınlıktaki siyah sac ayarı kullanılabilir mi?', answer: 'Her zaman uygun değildir. Paslanmazın dayanımı ve iş sertleşmesi farklı olabileceğinden üretici tablosu ve numune kesimiyle doğrulama gerekir.' },
      { question: 'Çapak sadece bıçak boşluğundan mı kaynaklanır?', answer: 'Hayır. Körelmiş bıçak, paralellik hatası, yanlış bindirme, malzeme sertliği ve makine ayarı da çapak oluşturabilir.' },
    ],
  },

  {
    slug: 'metrik-dis-tablosu-m3-m36-kilavuz-matkap-caplari',
    title: 'Metrik Diş Tablosu: M3–M36 Hatve ve Kılavuz Matkap Çapları',
    description: 'M3–M36 metrik kaba ve ince dişlerde standart hatve, kılavuz matkap çapı ve cıvata boşluk deliği ölçülerini karşılaştırın.',
    date: '2026-06-18',
    readTime: '8 dk okuma',
    category: 'Talaşlı İmalat',
    keywords: ['metrik diş tablosu', 'metrik kılavuz tablosu', 'M3 M36 hatve', 'kılavuz matkap çapı', 'metrik vida tablosu'],
    relatedTools: [
      { label: 'Metrik Diş ve Kılavuz Tablosu', href: '/arac/kilavuz-matkap-hesaplama' },
      { label: 'Cıvata Sıkma Torku', href: '/arac/civata-sikma-torku-hesaplama' },
    ],
    intro: [
      'Metrik diş tablosu, vida anma çapı ile hatveyi doğru eşleştirmek ve kılavuz öncesi matkap çapını seçmek için kullanılır. Özellikle M6, M8, M10 ve M12 gibi sık kullanılan ölçülerde kaba ve ince hatvenin karıştırılması üretim hatasına yol açabilir.',
      'Kılavuz matkap çapı yalnız nominal ölçüden ibaret değildir. Malzeme, takım geometrisi, diş yüzdesi ve kör delik derinliği takım ömrünü ve diş kalitesini etkiler.',
    ],
    sections: [
      {
        heading: 'Metrik diş ölçüsü nasıl okunur?',
        body: [
          'M10 × 1,5 ifadesinde M metrik profili, 10 mm anma çapını ve 1,5 mm hatveyi gösterir. Kaba hatve çoğu standart bağlantıda varsayılan kabul edilir; ince hatve kullanılıyorsa teknik resimde açıkça yazılmalıdır.',
          'Aynı çapta hatve küçüldükçe kılavuz ön deliği büyür. Örneğin M10 × 1,5 için yaklaşık Ø8,5 mm, M10 × 1,25 için yaklaşık Ø8,8 mm ön delik kullanılır.',
        ],
        list: ['Vida çapını ve hatveyi birlikte okuyun.', 'Kör delikte matkap ucu payını ekleyin.', 'Malzemeye göre takım üreticisinin tablosunu kontrol edin.'],
      },
      {
        heading: 'Kılavuz matkap çapı neden önemlidir?',
        body: [
          'Küçük ön delik daha yüksek diş doluluğu sağlayabilir; ancak kılavuz torkunu ve kırılma riskini artırır. Büyük ön delik ise takım yükünü azaltır fakat diş kesitini zayıflatabilir.',
          'Seri imalatta matkap gerçek çapı, salgı, takım aşınması ve kaplama durumu ölçülerek süreç kontrolü yapılmalıdır.',
        ],
      },
    ],
    faq: [
      { question: 'M8 kılavuz matkap çapı kaçtır?', answer: 'M8 × 1,25 kaba hatvede yaygın ön delik Ø6,8 mm; M8 × 1,0 ince hatvede yaklaşık Ø7,0 mm’dir.' },
      { question: 'M12 kılavuz matkap çapı kaçtır?', answer: 'M12 × 1,75 kaba hatvede yaygın ön delik Ø10,2 mm; M12 × 1,5 ince hatvede yaklaşık Ø10,5 mm’dir.' },
    ],
  },
  {
    slug: 'dalgic-pompa-hesaplama-debi-basma-yuksekligi-motor-gucu',
    title: 'Dalgıç Pompa Hesaplama: Debi, Basma Yüksekliği ve Motor Gücü',
    description: 'Kuyu ve drenaj uygulamalarında dalgıç pompa debisi, toplam dinamik basma yüksekliği ve gerekli motor kW değeri nasıl hesaplanır?',
    date: '2026-06-18',
    readTime: '8 dk okuma',
    category: 'Akışkanlar',
    keywords: ['dalgıç pompa hesaplama programı', 'dalgıç pompa seçimi', 'pompa basma yüksekliği', 'pompa motor gücü', 'debi hesabı'],
    relatedTools: [
      { label: 'Dalgıç Pompa Gücü Hesapla', href: '/arac/pompa-guc-hesaplama' },
      { label: 'Boru Et Kalınlığı Hesapla', href: '/arac/boru-eti-hesaplama' },
      { label: 'Reynolds Sayısı Hesapla', href: '/arac/reynolds-sayisi-hesaplama' },
    ],
    intro: [
      'Dalgıç pompa seçiminde yalnız kuyu derinliğine bakmak yeterli değildir. İhtiyaç duyulan debi, dinamik su seviyesi, çıkış kotu, boru sürtünmesi, vana ve dirsek kayıpları ile istenen çıkış basıncı birlikte değerlendirilmelidir.',
      'Bu değerlerin toplamı pompanın çalışacağı toplam dinamik basma yüksekliğini oluşturur. Pompa eğrisinde bu yükseklik ile debinin kesiştiği nokta çalışma noktasıdır.',
    ],
    sections: [
      {
        heading: 'Toplam dinamik basma yüksekliği nasıl bulunur?',
        body: [
          'Statik yükseklik, dinamik su seviyesi ile basma noktası arasındaki kot farkıdır. Hat kayıpları ve gerekli çıkış basıncı metre su sütununa çevrilerek bu değere eklenir.',
          'Boru çapı küçüldükçe aynı debide hız ve sürtünme kaybı artar. Bu nedenle pompa ile boru hattı birlikte boyutlandırılmalıdır.',
        ],
        list: ['Dinamik su seviyesini ölçün.', 'Hedef debiyi belirleyin.', 'Boru uzunluğu ve çapını girin.', 'Vana-dirsek kayıplarını ekleyin.', 'Pompa eğrisinde çalışma noktasını doğrulayın.'],
      },
      {
        heading: 'Motor kW değeri nasıl hesaplanır?',
        body: [
          'Hidrolik güç; sıvı yoğunluğu, yer çekimi ivmesi, hacimsel debi ve toplam basma yüksekliğinin çarpımıdır. Pompa verimine bölünerek yaklaşık mil gücü bulunur.',
          'Motor seçiminde üretici eğrisi, motor verimi, servis faktörü, yol verme yöntemi, kablo kesiti ve gerilim düşümü ayrıca kontrol edilmelidir.',
        ],
      },
    ],
    faq: [
      { question: 'Kuyu 100 metre ise 100 metre basan pompa yeterli midir?', answer: 'Her zaman değil. Dinamik su seviyesi, çıkış kotu, boru kayıpları ve gerekli basınç toplam basma yüksekliğini belirler.' },
      { question: 'Dalgıç pompa debisi nasıl seçilir?', answer: 'Kullanım ihtiyacı ile kuyunun sürdürülebilir debisi birlikte değerlendirilir. Pompa debisi kuyunun yenilenme kapasitesini aşmamalıdır.' },
    ],
  },
  {
    slug: 'konik-hesaplama-buyuk-cap-kucuk-cap-boy-aci',
    title: 'Konik Hesaplama: Büyük Çap, Küçük Çap, Boy ve Açı Formülleri',
    description: 'Torna ve makine tasarımında koniklik oranı, 1:N gösterimi, toplam koni açısı ve yarım açı nasıl hesaplanır?',
    date: '2026-06-18',
    readTime: '7 dk okuma',
    category: 'Makine Tasarımı',
    keywords: ['konik hesaplama', 'koniklik oranı', 'koni açısı hesaplama', 'torna konik hesabı', '1:10 koniklik'],
    relatedTools: [
      { label: 'Konik Hesaplama Aracı', href: '/arac/konik-hesaplama' },
      { label: 'Mil Mukavemet Hesapla', href: '/arac/mil-mukavemet-hesaplama' },
      { label: 'ISO Geçme Toleransı', href: '/arac/iso-gecme-tolerans-hesaplama' },
    ],
    intro: [
      'Konik bir parçayı tanımlamak için büyük çap D, küçük çap d, eksenel boy L ve açı değerlerinden uygun bir kombinasyon kullanılır. Bu değerlerden üçü biliniyorsa diğer geometrik büyüklükler hesaplanabilir.',
      'Torna ayarında çoğunlukla yarım açı kullanılır; teknik resimlerde ise toplam koni açısı veya 1:N koniklik çağrısı görülebilir.',
    ],
    sections: [
      {
        heading: 'Koniklik oranı 1:N nasıl bulunur?',
        body: [
          'Çap farkı D − d alınır. N = L / (D − d) bağıntısıyla oran bulunur ve 1:N biçiminde yazılır. Örneğin 100 mm boyda çap 10 mm değişiyorsa koniklik 1:10 olur.',
          'Bazı kaynaklar çap değişimi yerine yarıçap değişimini esas alabilir. Hesap veya çizimde kullanılan tanımın açık olması gerekir.',
        ],
        list: ['Büyük ve küçük çapı aynı birimde kullanın.', 'Boyu çapların ölçüldüğü eksenel mesafe alın.', 'Toplam açı ile yarım açıyı ayırın.'],
      },
      {
        heading: 'Koni açısı nasıl hesaplanır?',
        body: [
          'Yarım açı için tan(α) = (D − d) / (2L) bağıntısı kullanılır. Toplam koni açısı 2α’dır.',
          'Kısa ve dik konilerde ölçüm hatası açı sonucunu daha fazla etkileyebilir. Hassas imalatta konik mastar veya temas kontrolü kullanılmalıdır.',
        ],
      },
    ],
    faq: [
      { question: '1:20 koniklik kaç derecedir?', answer: 'Çap esaslı 1:20 koniklikte yarım açı arctan(1/40), toplam açı ise bunun iki katıdır; yaklaşık toplam 2,864° olur.' },
      { question: 'Torna üst kızağı hangi açıya ayarlanır?', answer: 'Genellikle koninin yarım açısına ayarlanır. Makine yöntemi ve verilen teknik resim çağrısı kontrol edilmelidir.' },
    ],
  },
  {
    slug: 'baklavali-sac-agirlik-tablosu-ve-hesaplama',
    title: 'Baklavalı Sac Ağırlık Tablosu ve Plaka Hesaplama Yöntemi',
    description: 'Baklavalı sacın m² ve plaka ağırlığı nasıl hesaplanır? Desen katsayısı, nominal kalınlık ve üretici kg/m² değerleri.',
    date: '2026-06-18',
    readTime: '6 dk okuma',
    category: 'Sac Metal',
    keywords: ['baklavalı sac ağırlık', 'baklavalı sac tablosu', 'baklava desenli sac kg', 'sac ağırlık hesaplama', 'plaka ağırlığı'],
    relatedTools: [
      { label: 'Baklavalı Sac Ağırlık Hesapla', href: '/arac/baklavali-sac-agirlik-hesaplama' },
      { label: 'Düz Sac Ağırlık Hesapla', href: '/arac/levha-agirlik-hesaplama' },
    ],
    intro: [
      'Baklavalı sac ağırlığı düz levha ağırlığından başlatılarak hesaplanabilir; ancak kabartma deseni ve üreticinin nominal kalınlık tanımı nedeniyle sonuç katalog değerinden farklı çıkabilir.',
      'En güvenilir kontrol, üreticinin kg/m² tablosunu veya ürün sertifikasını kullanmaktır. Hesaplayıcı teklif ve taşıma planı için hızlı ön değer sağlar.',
    ],
    sections: [
      {
        heading: 'Baklavalı sac plaka ağırlığı nasıl hesaplanır?',
        body: [
          'Önce en × boy × kalınlık ile hacim bulunur ve malzeme yoğunluğuyla çarpılır. Ardından desene göre yaklaşık katsayı uygulanabilir.',
          'Toplam sipariş ağırlığı için tek plaka değeri adetle çarpılır. Kesim firesi, palet ve ambalaj sevkiyat ağırlığına ayrıca eklenir.',
        ],
        list: ['Nominal kalınlığı katalog tanımıyla kontrol edin.', 'Desen katsayısını üretici kg/m² değerine göre kalibre edin.', 'Yük kaldırma ekipmanında toplam paket ağırlığını kullanın.'],
      },
    ],
    faq: [
      { question: 'Baklavalı sac düz sactan yüzde kaç ağırdır?', answer: 'Tek bir sabit oran yoktur. Desen geometrisi, nominal kalınlık ve üretim yöntemine göre değişir; üretici kg/m² bilgisi esas alınmalıdır.' },
      { question: 'Baklavalı sac ağırlığı m² üzerinden bulunabilir mi?', answer: 'Evet. Üretici kg/m² değeri biliniyorsa alanla çarpılarak plaka ve toplam ağırlık bulunabilir.' },
    ],
  },
  {
    slug: 'endustriyel-isi-termal-iletim-hesaplama',
    title: 'Endüstriyel Isı ve Termal İletim Hesaplama: Q, W ve K/W',
    description: 'Düz plaka ve silindirik duvarda Fourier bağıntısıyla ısı akısı, termal direnç ve ısı kaybı nasıl hesaplanır?',
    date: '2026-06-18',
    readTime: '7 dk okuma',
    category: 'Termal',
    keywords: ['endüstriyel ısı termal hesaplama', 'termal iletim', 'ısı kaybı hesabı', 'termal direnç K/W', 'Fourier yasası'],
    relatedTools: [
      { label: 'Termal İletim Hesapla', href: '/arac/termal-iletim-hesaplama' },
      { label: 'Isıl Genleşme Hesapla', href: '/arac/isil-genlesme-hesaplama' },
    ],
    intro: [
      'Endüstriyel ekipmanlarda ısı kaybı; iletim, taşınım ve radyasyon mekanizmalarının birlikte etkisiyle oluşur. Düz plaka veya boru duvarı içinden iletim, Fourier bağıntısıyla ön hesaplanabilir.',
      'Malzemenin ısı iletkenliği k, sıcaklık ve malzeme yapısına bağlıdır. Katalogdaki tek bir oda sıcaklığı değeri yüksek sıcaklık uygulamalarında yeterli olmayabilir.',
    ],
    sections: [
      {
        heading: 'Düz plaka için ısı iletim formülü',
        body: [
          'Q = k·A·ΔT/L bağıntısında Q watt cinsinden ısı akışı, k W/mK cinsinden iletkenlik, A m² alan, ΔT sıcaklık farkı ve L metre cinsinden kalınlıktır.',
          'Termal direnç R = L/(kA) olarak tanımlanır ve K/W birimiyle ifade edilir. Çok katmanlı duvarlarda dirençler seri olarak toplanabilir.',
        ],
        list: ['Kalınlığı metreye çevirin.', 'k değerini çalışma sıcaklığına göre seçin.', 'Isı köprülerini ve temas dirençlerini ayrıca değerlendirin.'],
      },
      {
        heading: 'Silindirik boru izolasyonunda hesap neden farklıdır?',
        body: [
          'Isı geçiş alanı yarıçapla değiştiği için silindirik duvarda logaritmik bağıntı kullanılır. İç ve dış yarıçap, boru boyu ve malzeme iletkenliği gerekir.',
          'Gerçek dış yüzey sıcaklığı için iç ve dış taşınım dirençleri de modele eklenmelidir.',
        ],
      },
    ],
    faq: [
      { question: 'W ile kW dönüşümü nasıl yapılır?', answer: '1 kW = 1000 W. Hesaplanan watt değeri 1000’e bölünerek kW bulunur.' },
      { question: 'Termal direnç yüksek olursa ne olur?', answer: 'Aynı sıcaklık farkında iletilen ısı azalır. İzolasyon malzemelerinde yüksek termal direnç hedeflenir.' },
    ],
  },

];
