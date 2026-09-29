import { seoBlogExpansionPosts } from './seoBlogExpansion';

export type BlogSection = {
  heading: string;
  body: string[];
  list?: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  keywords: string[];
  relatedTools: { label: string; href: string }[];
  intro: string[];
  sections: BlogSection[];
  faq: { question: string; answer: string }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'mil-delik-toleransi-h7-h8-h6-js9-nedir',
    title: 'Mil Delik Toleransı Nedir? H7, H8, h6 ve JS9 Geçme Seçimi',
    description:
      'Mil delik toleransı, H7, H8, h6, JS9 ve geçme toleransı seçiminde dikkat edilmesi gereken temel noktalar. Makine tasarımcıları için pratik rehber.',
    date: '2026-05-21',
    readTime: '7 dk okuma',
    category: 'Tolerans',
    keywords: ['mil delik toleransı', 'H7 tolerans', 'H8 tolerans', 'h6 tolerans', 'JS9 geçme', 'ISO geçme toleransı'],
    relatedTools: [
      { label: 'Geçme Toleransı Hesapla', href: '/arac/iso-gecme-tolerans-hesaplama' },
      { label: 'Tolerans Rehberi', href: '/arac/iso-gecme-tolerans-hesaplama' },
      { label: 'Teknik Çağrı Oluşturucu', href: '/arac/teknik-resim-cagri-olusturucu' },
    ],
    intro: [
      'Makine tasarımında mil ve delik toleransı, parçaların birbiriyle nasıl çalışacağını doğrudan belirler. Aynı nominal ölçüye sahip iki parça, seçilen tolerans alanına göre boşluklu, geçişli veya sıkı geçme davranışı gösterebilir.',
      'H7, H8, h6 ve JS9 gibi ifadeler teknik resimde küçük görünür; fakat üretim maliyeti, montaj kolaylığı, rulman yatağı, kama kanalı ve servis edilebilirlik üzerinde ciddi etkisi vardır.',
    ],
    sections: [
      {
        heading: 'Mil delik toleransı ne işe yarar?',
        body: [
          'Tolerans, bir ölçünün üretimde kabul edilebilir en büyük ve en küçük sınırını tanımlar. Mil ve delik sisteminde bu sınırlar, parçaların birbirine boşlukla mı yoksa sıkı şekilde mi oturacağını belirler.',
          'Örneğin bir delik çapı Ø25 H7 seçildiğinde delik nominal olarak 25 mm kabul edilir, ancak üretimde izin verilen üst ve alt sapmalar H7 tolerans alanına göre değerlendirilir. Mil tarafında h6, g6, k6, m6 gibi alanlar kullanıldığında geçme karakteri değişir.',
        ],
        list: [
          'Boşluklu geçme: Montaj kolaydır, parça dönebilir veya rahat hareket edebilir.',
          'Geçişli geçme: Montaj kontrollüdür; bazı durumlarda hafif sıkılık, bazı durumlarda düşük boşluk oluşabilir.',
          'Sıkı geçme: Parça pres, ısıtma veya soğutma ile monte edilir; sökülmesi daha zordur.',
        ],
      },
      {
        heading: 'H7 ve H8 farkı nedir?',
        body: [
          'H7 ve H8 delik toleransları, delik esaslı sistemde çok sık kullanılır. Genel mantık olarak H7 daha dar tolerans, H8 ise daha geniş tolerans aralığı anlamına gelir.',
          'Daha dar tolerans daha kontrollü montaj sağlayabilir; ancak üretim maliyetini artırabilir. Daha geniş tolerans üretimi kolaylaştırır, fakat hassas geçme gereken yerlerde istenmeyen boşluk oluşturabilir.',
        ],
        list: [
          'H7: Rulman yatağı, hassas merkezleme ve kontrollü geçme uygulamalarında sık görülür.',
          'H8: Genel imalat, daha toleranslı montaj ve hassasiyetin kritik olmadığı yerlerde tercih edilebilir.',
          'Tasarımda seçim yapılırken sadece ölçüye değil, yük, hız, sıcaklık ve montaj yöntemine de bakılmalıdır.',
        ],
      },
      {
        heading: 'h6 ve JS9 ne zaman kullanılır?',
        body: [
          'h6 genellikle mil tarafında kullanılan hassas bir tolerans alanıdır. Delik esaslı sistemlerde H7/h6 gibi kombinasyonlar kontrollü boşluklu veya hassas geçme davranışı için tercih edilebilir.',
          'JS9 ise tolerans alanı nominal ölçü etrafında simetrik kabul edilen uygulamalarda görülür. Özellikle kama kanalı gibi genişlik toleranslarında JS9, üretim ve montaj açısından pratik bir referans olabilir.',
        ],
        list: [
          'Mil h6: Hassas işlenmiş mil, rulman veya merkezleme gereken bölgelerde kullanılır.',
          'Göbek JS9: Kama kanalı genişliği gibi uygulamalarda karşı parça toleransı olarak tercih edilebilir.',
          'Kama kanalı örneği: Mil N9/JS9, göbek JS9 gibi çağrılar pratikte sık karşılaşılır.',
        ],
      },
      {
        heading: 'Teknik resimde tolerans nasıl yazılmalı?',
        body: [
          'Teknik resimde sadece nominal ölçü yazmak çoğu zaman yeterli değildir. Parçanın görevi kritikse ölçüyle birlikte tolerans alanı da belirtilmelidir.',
          'Örneğin Ø25 H7, Ø25 h6 veya kama kanalı için b: h9 gibi çağrılar üreticiye net bilgi verir. Bu sayede imalatçı, ölçüyü hangi sınırlar içinde işlemesi gerektiğini daha doğru anlar.',
        ],
        list: [
          'Ölçü çağrısını sade ve standartlara uygun yaz.',
          'Fonksiyonel yüzeylerde toleransı mutlaka belirt.',
          'Montaj parçası varsa mil, delik ve göbek toleranslarını birlikte değerlendir.',
        ],
      },
    ],
    faq: [
      { question: 'H7 her zaman en doğru seçim midir?', answer: 'Hayır. H7 sık kullanılan bir delik toleransıdır ama her uygulama için doğru değildir. Parçanın görevi, montaj şekli, maliyet ve çalışma şartları birlikte değerlendirilmelidir.' },
      { question: 'H8 daha kötü tolerans mı demektir?', answer: 'Kötü değil, daha geniş tolerans demektir. Hassasiyetin kritik olmadığı veya üretim kolaylığının önemli olduğu uygulamalarda H8 daha mantıklı olabilir.' },
      { question: 'Kama kanalında JS9 neden kullanılır?', answer: 'JS9, kama kanalı gibi genişlik toleranslarında simetrik tolerans mantığı sunduğu için montaj ve üretim açısından pratik olabilir.' },
    ],
  },
  {
    slug: 'kama-kanali-hesaplama-mil-capina-gore-kama-olcusu',
    title: 'Kama Kanalı Hesaplama: Mil Çapına Göre Kama Ölçüsü Nasıl Seçilir?',
    description:
      'Mil çapına göre kama kanalı genişliği, yüksekliği, tolerans çağrısı ve teknik resim notu nasıl belirlenir? Makine tasarımı için pratik kama kanalı rehberi.',
    date: '2026-05-21',
    readTime: '6 dk okuma',
    category: 'Makine Tasarımı',
    keywords: ['kama kanalı hesaplama', 'mil kama ölçüsü', 'DIN 6885 kama', 'kama genişliği', 'kama kanalı toleransı'],
    relatedTools: [
      { label: 'Kama Kanalı Hesapla', href: '/arac/kama-kanali-hesaplama' },
      { label: 'Mil Mukavemet Hesaplama', href: '/arac/mil-mukavemet-hesaplama' },
      { label: 'Teknik Çağrı Oluşturucu', href: '/arac/teknik-resim-cagri-olusturucu' },
    ],
    intro: [
      'Kama kanalı, mil ile göbek arasında tork aktarımı sağlayan en yaygın bağlantı çözümlerinden biridir. Basit görünür; ancak yanlış kama ölçüsü, yanlış tolerans veya eksik teknik çağrı ciddi montaj ve çalışma problemleri oluşturabilir.',
      'Kama kanalı seçimi yapılırken sadece mil çapına bakmak yeterli değildir. Aktarılacak tork, göbek malzemesi, çalışma yönü, servis ihtiyacı ve üretim yöntemi de değerlendirilmelidir.',
    ],
    sections: [
      {
        heading: 'Kama ölçüsü nasıl seçilir?',
        body: [
          'Pratikte kama ölçüsü genellikle mil çapı aralığına göre seçilir. Standart tablolarda her mil çapı aralığı için önerilen kama genişliği ve yüksekliği bulunur.',
          'Örneğin belirli bir mil çapı için 8 x 7 mm gibi bir kama önerilebilir. Burada ilk değer kama genişliğini, ikinci değer ise kama yüksekliğini ifade eder.',
        ],
        list: [
          'Mil çapını belirle.',
          'İlgili standart aralığından kama genişliği ve yüksekliğini seç.',
          'Mil ve göbek kanal toleranslarını ayrıca kontrol et.',
          'Teknik resimde kanal genişliği, derinlik ve tolerans çağrısını açık yaz.',
        ],
      },
      {
        heading: 'Kama kanalında tolerans neden önemlidir?',
        body: [
          'Kama sadece ölçü olarak doğru olsa bile tolerans yanlış seçilirse montaj zorlaşabilir veya çalışma sırasında boşluk oluşabilir. Boşluk, darbeli yüklerde kama ve kanal yüzeylerinde ezilme riskini artırabilir.',
          'Mil kanalı ve göbek kanalı ayrı ayrı değerlendirilmelidir. Mil tarafında daha sıkı, göbek tarafında montajı kolaylaştıran toleranslar tercih edilebilir. Ancak seçim uygulamaya göre değişir.',
        ],
        list: [
          'Gevşek geçme: Sökülebilir bağlantılar için daha pratiktir.',
          'Normal geçme: Genel makine tasarımında sık tercih edilir.',
          'Sıkı geçme: Titreşim, yön değiştiren yük veya yüksek tork uygulamalarında değerlendirilebilir.',
        ],
      },
      {
        heading: 'Teknik resimde kama kanalı nasıl çağrılır?',
        body: [
          'Teknik resimde kama kanalı için sadece “kama kanalı açılacak” yazmak yeterli değildir. Genişlik, yükseklik, derinlik, tolerans ve referans standart bilgisi mümkün olduğunca açık verilmelidir.',
          'Örnek bir teknik çağrı şu mantıkta olabilir: “KAMA KANALI: 8 x 7 mm. Mil çapı Ø25. İşleme öncesi ilgili standart ve işletme tolerans tablosu kontrol edilmelidir.”',
        ],
        list: [
          'Kama genişliği ve yüksekliği belirtilmeli.',
          'Mil çapı ve kanal konumu net olmalı.',
          'Kanal toleransı ve yüzey durumu kritikse ayrıca yazılmalı.',
          'Üretici katalogları ve standart tablolar son kontrol olarak kullanılmalı.',
        ],
      },
      {
        heading: 'Sık yapılan hatalar',
        body: [
          'Kama bağlantılarında en sık hata, mil çapına göre ölçü seçip tork ve çalışma şartlarını hiç kontrol etmemektir. Özellikle darbeli yük, sık dur-kalk veya yön değiştiren hareketlerde sadece tablo ölçüsüne güvenmek yeterli olmayabilir.',
        ],
        list: [
          'Tork kontrolü yapmadan kama seçmek.',
          'Göbek kanalını mil kanalıyla aynı tolerans mantığında düşünmek.',
          'Teknik resimde çağrıyı eksik bırakmak.',
          'Malzeme dayanımını ve yüzey basıncını dikkate almamak.',
        ],
      },
    ],
    faq: [
      { question: 'Kama ölçüsü sadece mil çapına göre seçilebilir mi?', answer: 'Ön seçim mil çapına göre yapılabilir; ancak tork, malzeme, yük tipi ve çalışma şartları ayrıca kontrol edilmelidir.' },
      { question: 'Kama kanalı toleransı yazmak gerekli mi?', answer: 'Fonksiyonel bağlantılarda gereklidir. Tolerans belirtilmezse imalatçı genel toleransla işleyebilir ve montajda istenmeyen boşluk veya sıkılık oluşabilir.' },
      { question: 'Kama kanalı teknik çağrısı otomatik oluşturulabilir mi?', answer: 'TooldurCAD ve Tooldur içindeki teknik çağrı araçları, seçilen değerlere göre kopyalanabilir teknik not üretmek için kullanılabilir.' },
    ],
  },
  {
    slug: 'kilavuz-matkap-capi-nasil-hesaplanir-metrik-dis-tablosu',
    title: 'Kılavuz Matkap Çapı Nasıl Hesaplanır? Metrik Diş İçin Pratik Rehber',
    description:
      'Metrik vida için kılavuz matkap çapı, hatve, ön delik ve diş toleransı nasıl seçilir? M6, M8, M10, M12 gibi ölçüler için pratik açıklama.',
    date: '2026-05-21',
    readTime: '6 dk okuma',
    category: 'Delik ve Diş',
    keywords: ['kılavuz matkap çapı', 'metrik diş tablosu', 'M8 matkap çapı', 'M10 kılavuz matkap', 'ön delik çapı'],
    relatedTools: [
      { label: 'Kılavuz / Matkap Hesapla', href: '/arac/kilavuz-matkap-hesaplama' },
      { label: 'Cıvata Torku Hesapla', href: '/arac/civata-sikma-torku-hesaplama' },
      { label: 'Teknik Çağrı Oluşturucu', href: '/arac/teknik-resim-cagri-olusturucu' },
    ],
    intro: [
      'Kılavuz çekilecek bir delikte matkap çapı yanlış seçilirse dişler zayıf kalabilir, kılavuz kırılabilir veya cıvata bağlantısı beklenen dayanımı vermez. Bu yüzden ön delik çapı, vida ölçüsü ve hatve birlikte değerlendirilmelidir.',
      'Metrik dişlerde pratik hesap mantığı genellikle nominal çap eksi hatve yaklaşımıyla anlatılır. Ancak gerçek üretimde malzeme, kılavuz tipi, delik derinliği ve istenen diş yüzdesi de önemlidir.',
    ],
    sections: [
      {
        heading: 'Kılavuz matkap çapı temel mantığı',
        body: [
          'En basit yaklaşımda kılavuz matkap çapı, vida nominal çapından hatve değerinin çıkarılmasıyla bulunur. Örneğin M10 x 1,5 için pratik ön delik çapı yaklaşık 8,5 mm olarak seçilebilir.',
          'Bu yöntem hızlı ön seçim sağlar. Fakat kritik bağlantılarda üretici katalogları, standart tablolar ve kullanılan kılavuz tipi mutlaka kontrol edilmelidir.',
        ],
        list: [
          'M6 x 1 için yaklaşık ön delik: 5 mm',
          'M8 x 1,25 için yaklaşık ön delik: 6,8 mm',
          'M10 x 1,5 için yaklaşık ön delik: 8,5 mm',
          'M12 x 1,75 için yaklaşık ön delik: 10,2 mm',
        ],
      },
      {
        heading: 'Hatve neden önemlidir?',
        body: [
          'Aynı nominal vida çapında farklı hatve seçenekleri olabilir. İnce dişte hatve daha küçük olduğu için ön delik çapı kaba dişe göre farklı çıkar.',
          'Örneğin M10 kaba diş ile M10 ince diş aynı matkapla delinmemelidir. Hatve yanlış alınırsa diş formu hatalı olur ve bağlantı güvenilirliği düşer.',
        ],
        list: [
          'Kaba diş: Genel kullanımda yaygındır.',
          'İnce diş: Daha hassas ayar, titreşim veya sınırlı et kalınlığı gibi durumlarda tercih edilebilir.',
          'Teknik resimde ölçü sadece M10 yazıyorsa varsayım kaba diş olabilir; kritik işlerde hatveyi açık yazmak daha güvenlidir.',
        ],
      },
      {
        heading: 'Teknik resimde kılavuz deliği nasıl belirtilir?',
        body: [
          'Teknik resimde diş ölçüsü, derinlik, delik tipi ve tolerans bilgisi mümkün olduğunca açık verilmelidir. Kör deliklerde kılavuz çıkış payı ve matkap ucu konisi ayrıca düşünülmelidir.',
          'Örnek çağrı: “M10 x 1,5 - 6H, kılavuz derinliği 20 mm, ön delik Ø8,5 mm.” Bu tip bir not üreticiye daha net bilgi verir.',
        ],
        list: [
          'Diş ölçüsü ve hatve yazılmalı.',
          'Diş toleransı gerekirse belirtilmeli.',
          'Kör delik ve açık delik ayrımı net olmalı.',
          'Diş derinliği ile matkap derinliği karıştırılmamalı.',
        ],
      },
      {
        heading: 'Kılavuz kırılmasını azaltmak için kontrol listesi',
        body: [
          'Kılavuz kırılması genellikle yanlış matkap çapı, yetersiz yağlama, yanlış devir, talaş tahliyesi veya kör delikte dip payının yanlış bırakılması nedeniyle oluşur.',
        ],
        list: [
          'Malzemeye uygun kılavuz seç.',
          'Ön delik çapını tabloya göre kontrol et.',
          'Kör delikte yeterli dip boşluğu bırak.',
          'Talaş tahliyesi için uygun kılavuz tipi kullan.',
          'Kesme sıvısı ve devir değerlerini kontrol et.',
        ],
      },
    ],
    faq: [
      { question: 'Kılavuz matkap çapı nasıl hızlı hesaplanır?', answer: 'Pratik yaklaşım nominal vida çapından hatveyi çıkarmaktır. Örneğin M10 x 1,5 için 10 - 1,5 = 8,5 mm.' },
      { question: 'M10 için her zaman 8,5 mm matkap mı kullanılır?', answer: 'Hayır. Bu M10 x 1,5 kaba diş için pratik değerdir. İnce dişlerde hatve değiştiği için ön delik çapı da değişir.' },
      { question: 'Kör delikte nelere dikkat edilmeli?', answer: 'Diş derinliği, matkap derinliği ve kılavuz çıkış payı ayrı düşünülmelidir. Kılavuzun dibe vurması kırılma riskini artırır.' },
    ],
  },
  {
    slug: 'teknik-resimde-yuzey-puruzlulugu-ra-rz-nedir',
    title: 'Teknik Resimde Yüzey Pürüzlülüğü: Ra, Rz ve İşaretler Ne Anlama Gelir?',
    description:
      'Teknik resimde yüzey pürüzlülüğü işaretleri, Ra ve Rz değerleri, işleme yöntemi ve yüzey kalitesi seçimi hakkında pratik mühendislik rehberi.',
    date: '2026-05-21',
    readTime: '7 dk okuma',
    category: 'Teknik Resim',
    keywords: ['yüzey pürüzlülüğü', 'Ra nedir', 'Rz nedir', 'teknik resim işaretleri', 'yüzey kalitesi'],
    relatedTools: [
      { label: 'Yüzey Pürüzlülüğü Rehberi', href: '/arac/yuzey-puruzlulugu-rehberi' },
      { label: 'Teknik Çağrı Oluşturucu', href: '/arac/teknik-resim-cagri-olusturucu' },
      { label: 'Geçme Toleransı Hesapla', href: '/arac/iso-gecme-tolerans-hesaplama' },
    ],
    intro: [
      'Yüzey pürüzlülüğü, teknik resimde parçanın sadece ölçüsünü değil, yüzeyinin ne kadar düzgün işlenmesi gerektiğini anlatır. Özellikle yataklama yüzeyleri, sızdırmazlık bölgeleri, geçme yüzeyleri ve sürtünmeli çalışan parçalar için kritik bir bilgidir.',
      'Ra ve Rz değerleri çoğu teknik resimde görülür; ancak gereğinden düşük pürüzlülük istemek üretim maliyetini artırabilir. Gereğinden yüksek pürüzlülük ise çalışma ömrünü, sızdırmazlığı ve montaj kalitesini düşürebilir.',
    ],
    sections: [
      {
        heading: 'Ra nedir?',
        body: [
          'Ra, yüzey profilindeki ortalama pürüzlülük değerini ifade eder. Pratikte yüzey kalitesini belirtmek için en sık kullanılan parametrelerden biridir.',
          'Düşük Ra değeri daha düzgün yüzey anlamına gelir. Ancak her yüzey için düşük Ra istemek doğru değildir; çünkü işleme süresi ve maliyet artabilir.',
        ],
        list: [
          'Genel işlenmiş yüzeylerde orta Ra değerleri yeterli olabilir.',
          'Sızdırmazlık yüzeylerinde daha kontrollü yüzey istenebilir.',
          'Rulman ve hassas geçme yüzeylerinde yüzey kalitesi ayrıca değerlendirilmelidir.',
        ],
      },
      {
        heading: 'Rz nedir?',
        body: [
          'Rz, yüzey profilindeki tepe ve çukur farklarını dikkate alan bir pürüzlülük parametresidir. Ra tek başına yüzeyin tüm karakterini anlatmayabilir; bu yüzden bazı teknik uygulamalarda Rz de belirtilir.',
          'Özellikle temas davranışı, yağ filmi, sızdırmazlık ve aşınma açısından yüzeyin tepe-çukur yapısı önemliyse Rz değeri daha anlamlı hale gelebilir.',
        ],
      },
      {
        heading: 'Teknik resimde yüzey pürüzlülüğü nasıl seçilir?',
        body: [
          'Yüzey pürüzlülüğü seçimi, parçanın görevine göre yapılmalıdır. Her yüzeye aynı kaliteyi vermek hem gereksiz maliyet oluşturur hem de üretim süresini uzatır.',
          'Önce yüzeyin fonksiyonunu belirlemek gerekir: Bu yüzey sadece dış görünüş için mi, montaj için mi, yataklama için mi, sızdırmazlık için mi kullanılıyor?',
        ],
        list: [
          'Fonksiyonsuz dış yüzeylerde genel yüzey kalitesi yeterli olabilir.',
          'Montaj yüzeylerinde tolerans ve pürüzlülük birlikte değerlendirilmelidir.',
          'Sızdırmazlık yüzeylerinde yüzey yönü ve işleme izi önemlidir.',
          'Kaynaklı veya döküm yüzeylerde gereksiz hassas yüzey kalitesi istemekten kaçınılmalıdır.',
        ],
      },
      {
        heading: 'Sık yapılan teknik resim hataları',
        body: [
          'Yüzey pürüzlülüğü hataları genellikle ya hiç çağrı verilmemesi ya da her yere gereğinden hassas çağrı verilmesi şeklinde görülür. İkisi de üretimde problem çıkarabilir.',
        ],
        list: [
          'Tüm parçaya gereksiz düşük Ra değeri vermek.',
          'Sızdırmazlık yüzeyinde işleme yönünü belirtmemek.',
          'Geçme yüzeylerinde tolerans ve pürüzlülüğü birlikte düşünmemek.',
          'Döküm, kaynak veya sac parçada gerçekçi olmayan yüzey kalitesi istemek.',
        ],
      },
    ],
    faq: [
      { question: 'Ra küçük olursa yüzey daha mı iyidir?', answer: 'Evet, daha düzgün yüzey anlamına gelir; ancak her zaman daha doğru değildir. Gereksiz düşük Ra değeri maliyeti artırır.' },
      { question: 'Ra ve Rz aynı şey mi?', answer: 'Hayır. Ra ortalama pürüzlülük değeridir, Rz ise yüzeydeki tepe ve çukur farklarını daha farklı bir yaklaşımla ifade eder.' },
      { question: 'Yüzey pürüzlülüğü teknik resimde mutlaka yazılmalı mı?', answer: 'Fonksiyonel yüzeylerde yazılmalıdır. Kritik olmayan yüzeyler için genel teknik resim notu yeterli olabilir.' },
    ],
  },
  {
    slug: 'm8-kilavuz-matkap-capi-kac-mm',
    title: 'M8 Kılavuz Matkap Çapı Kaç mm? Pratik Delik Hazırlama Rehberi',
    description: 'M8 kılavuz çekmeden önce hangi matkap çapı seçilir, kör delikte nelere dikkat edilir ve teknik resimde nasıl belirtilir?',
    date: '2026-05-21',
    readTime: '4 dk okuma',
    category: 'Kılavuz Matkap',
    keywords: ['M8 kılavuz matkap çapı', 'M8 matkap kaç mm', 'M8 diş çekme', 'metrik kılavuz tablosu'],
    relatedTools: [{ label: 'Kılavuz Matkap Hesapla', href: '/arac/kilavuz-matkap-hesaplama' }, { label: 'Teknik Çağrı Oluşturucu', href: '/arac/teknik-resim-cagri-olusturucu' }],
    intro: ['M8 kılavuz çekilecek bir parçada ilk kontrol edilmesi gereken konu delik çapıdır. Delik küçük olursa kılavuz zorlanır, büyük olursa diş tutma yüzeyi azalır.', 'Bu nedenle kılavuz öncesi matkap çapı hem imalat kalitesi hem de bağlantı güvenliği açısından kritik bir değerdir.'],
    sections: [{ heading: 'M8 için temel mantık', body: ['Metrik kaba dişte pratik hesap, nominal çap eksi adım şeklinde yapılır. M8 kaba diş için adım genellikle 1.25 mm kabul edilir. Bu mantıkla ön delik çapı yaklaşık 6.8 mm seviyesindedir.'], list: ['Kör delikte talaş boşluğu bırakılmalıdır.', 'Diş boyu teknik resimde açıkça belirtilmelidir.', 'Malzeme sertliği ve kılavuz tipi delik kalitesini etkiler.'] }, { heading: 'Teknik resimde nasıl yazılır?', body: ['Teknik resimde yalnızca M8 yazmak bazı durumlarda yeterli değildir. Kör delik, etkin diş boyu, havşa ve yüzey şartı gibi bilgiler ayrıca verilmelidir.'] }],
    faq: [{ question: 'M8 için her zaman 6.8 mm matkap mı kullanılır?', answer: 'Genel metrik kaba dişte pratik değer 6.8 mm civarıdır; ancak standart, malzeme ve diş tipi kontrol edilmelidir.' }],
  },
  {
    slug: 'm10-kilavuz-matkap-capi-kac-mm',
    title: 'M10 Kılavuz Matkap Çapı Kaç mm? Metrik Diş Ön Delik Rehberi',
    description: 'M10 kılavuz için matkap çapı nasıl seçilir, kaba ve ince diş farkı nedir, teknik çizimde hangi notlar verilmelidir?',
    date: '2026-05-21',
    readTime: '4 dk okuma',
    category: 'Kılavuz Matkap',
    keywords: ['M10 kılavuz matkap çapı', 'M10 matkap kaç mm', 'M10 diş çekme', 'M10 ön delik'],
    relatedTools: [{ label: 'Kılavuz Matkap Hesapla', href: '/arac/kilavuz-matkap-hesaplama' }, { label: 'Teknik Çağrı Kütüphanesi', href: '/teknik-cagri-kutuphanesi' }],
    intro: ['M10 vida bağlantıları makine imalatında çok sık kullanılır. Kılavuz öncesi delik çapı doğru seçilmezse kılavuz kırılması, zayıf diş formu veya montaj problemi oluşabilir.'],
    sections: [{ heading: 'M10 kaba dişte pratik yaklaşım', body: ['M10 kaba dişte adım çoğunlukla 1.5 mm kabul edilir. Pratik hesapla ön delik çapı yaklaşık 8.5 mm seviyesine gelir. İnce dişte ise adım farklı olduğu için matkap çapı da değişir.'], list: ['Diş adımı mutlaka doğrulanmalıdır.', 'Kör deliklerde delik derinliği etkin diş boyundan fazla olmalıdır.', 'Kılavuz girişi için uygun pah bırakılmalıdır.'] }],
    faq: [{ question: 'M10 ince diş için aynı matkap kullanılır mı?', answer: 'Hayır. İnce dişte adım değiştiği için ön delik çapı da değişir.' }],
  },
  {
    slug: 'h7-tolerans-tablosu-nasil-okunur',
    title: 'H7 Tolerans Tablosu Nasıl Okunur? Delik Toleransı Pratik Rehberi',
    description: 'H7 toleransının anlamı, teknik resimde kullanımı ve delik tolerans tablosunun nasıl okunacağı hakkında pratik mühendislik rehberi.',
    date: '2026-05-21',
    readTime: '5 dk okuma',
    category: 'Tolerans',
    keywords: ['H7 tolerans tablosu', 'H7 delik toleransı', 'H7 nedir', 'delik toleransı'],
    relatedTools: [{ label: 'ISO Geçme Toleransı', href: '/arac/iso-gecme-tolerans-hesaplama' }, { label: 'Tolerans Rehberi', href: '/arac/iso-gecme-tolerans-hesaplama' }],
    intro: ['H7, makine teknik resimlerinde en sık görülen delik toleranslarından biridir. Özellikle rulman yuvası, hassas merkezleme ve kontrollü montaj gereken yerlerde karşımıza çıkar.'],
    sections: [{ heading: 'H7 neyi ifade eder?', body: ['H harfi delik tolerans alanını, 7 ise tolerans kalitesini ifade eder. Ölçü büyüdükçe tolerans aralığı da değişir. Bu nedenle H7 değeri tek bir sabit sayı değildir; nominal çapa göre okunur.'], list: ['Nominal çap aralığını bul.', 'H7 satırındaki alt ve üst sapmayı oku.', 'Mil toleransıyla birlikte geçme karakterini değerlendir.'] }],
    faq: [{ question: 'H7 hassas tolerans mıdır?', answer: 'Genel imalata göre kontrollü ve hassas sayılır; ancak her uygulama için otomatik doğru seçim değildir.' }],
  },
  {
    slug: 'rulman-yatagi-toleransi-nasil-secilir',
    title: 'Rulman Yatağı Toleransı Nasıl Seçilir?',
    description: 'Rulman yatağı için mil ve gövde toleransı seçerken yük yönü, dönme durumu, montaj ve yüzey kalitesi nasıl değerlendirilir?',
    date: '2026-05-21',
    readTime: '6 dk okuma',
    category: 'Rulman',
    keywords: ['rulman yatağı toleransı', 'rulman geçme toleransı', 'rulman mil toleransı', 'rulman gövde toleransı'],
    relatedTools: [{ label: 'ISO Geçme Toleransı', href: '/arac/iso-gecme-tolerans-hesaplama' }, { label: 'Rulman Ömrü Hesapla', href: '/arac/rulman-omru-hesaplama' }],
    intro: ['Rulman yatağı toleransı yanlış seçildiğinde rulman ya gevşek kalır ya da fazla sıkı oturur. İki durumda da ısınma, ses, titreşim ve erken arıza riski artar.'],
    sections: [{ heading: 'Seçimde ana kriterler', body: ['Yükün hangi bilezik üzerinde döndüğü, rulmanın demonte edilme ihtiyacı, sıcaklık farkı ve gövde rijitliği tolerans seçiminde birlikte değerlendirilmelidir.'], list: ['Dönen yüke maruz bilezik genelde daha sıkı oturur.', 'Sabit yüke maruz bilezikte sökülebilirlik korunabilir.', 'Yüzey pürüzlülüğü ve geometrik toleranslar ölçü kadar önemlidir.'] }],
    faq: [{ question: 'Sadece H7 yazmak yeterli mi?', answer: 'Kritik rulman yataklarında hayır. Mil, gövde, yüzey kalitesi ve geometrik tolerans birlikte düşünülmelidir.' }],
  },
  {
    slug: 'civata-sikma-torku-nasil-hesaplanir',
    title: 'Cıvata Sıkma Torku Nasıl Hesaplanır?',
    description: 'Cıvata sıkma torku, sürtünme, kalite sınıfı ve ön yük arasındaki ilişki. Makine tasarımcıları için pratik açıklama.',
    date: '2026-05-21',
    readTime: '5 dk okuma',
    category: 'Bağlantı Elemanları',
    keywords: ['cıvata sıkma torku', 'M8 tork', 'M10 tork', 'cıvata tork hesabı'],
    relatedTools: [{ label: 'Cıvata Tork Hesapla', href: '/arac/civata-sikma-torku-hesaplama' }],
    intro: ['Cıvata sıkma torku, bağlantının güvenli çalışması için kritik bir değerdir. Fazla tork dişi veya cıvatayı zorlar; düşük tork ise bağlantının gevşemesine neden olabilir.'],
    sections: [{ heading: 'Torku etkileyen faktörler', body: ['Tork yalnızca cıvata çapına bağlı değildir. Kalite sınıfı, yağlama durumu, yüzey kaplaması ve sürtünme katsayısı sonucu ciddi biçimde değiştirir.'], list: ['Kuru ve yağlı bağlantılar farklı tork ister.', 'Kaplama sürtünmeyi değiştirebilir.', 'Kritik bağlantılarda üretici standardı esas alınmalıdır.'] }],
    faq: [{ question: 'Tablodaki tork değeri her zaman güvenli midir?', answer: 'Hayır. Tork tablosu başlangıç değeridir; gerçek uygulamada malzeme, yağlama ve emniyet şartı kontrol edilmelidir.' }],
  },
  {
    slug: 'ra-3-2-yuzey-puruzlulugu-ne-demek',
    title: 'Ra 3.2 Yüzey Pürüzlülüğü Ne Demek?',
    description: 'Teknik resimde Ra 3.2, Ra 1.6 ve Ra 6.3 değerlerinin anlamı, kullanım yerleri ve imalat etkileri.',
    date: '2026-05-21',
    readTime: '5 dk okuma',
    category: 'Teknik Resim',
    keywords: ['Ra 3.2 nedir', 'yüzey pürüzlülüğü', 'teknik resimde Ra', 'Ra Rz farkı'],
    relatedTools: [{ label: 'Yüzey Pürüzlülüğü Rehberi', href: '/arac/yuzey-puruzlulugu-rehberi' }, { label: 'Teknik Çağrı Kütüphanesi', href: '/teknik-cagri-kutuphanesi' }],
    intro: ['Ra 3.2, teknik resimlerde sık karşılaşılan bir yüzey pürüzlülüğü değeridir. Bu değer yüzeyin ortalama pürüzlülük seviyesini ifade eder ve üretim yöntemini doğrudan etkileyebilir.'],
    sections: [{ heading: 'Ra değeri neyi anlatır?', body: ['Ra, yüzey profilindeki ortalama sapmayı ifade eder. Düşük Ra değeri daha düzgün yüzey anlamına gelir; ancak üretim süresi ve maliyet artabilir.'], list: ['Ra 6.3 genel işlenmiş yüzeylerde görülebilir.', 'Ra 3.2 birçok standart işleme yüzeyi için uygundur.', 'Ra 1.6 daha hassas temas veya sızdırmazlık yüzeylerinde tercih edilebilir.'] }],
    faq: [{ question: 'Ra küçükse her zaman daha mı iyi?', answer: 'Teknik olarak daha düzgün yüzeydir; fakat gereksiz düşük Ra maliyeti artırabilir.' }],
  },
  {
    slug: 'sac-bukum-k-faktoru-nedir',
    title: 'Sac Büküm K Faktörü Nedir? Açınım Hesabında Neden Önemlidir?',
    description: 'Sac büküm açınımında K faktörü, nötr eksen, büküm yarıçapı ve malzeme kalınlığı ilişkisi.',
    date: '2026-05-21',
    readTime: '5 dk okuma',
    category: 'Sac Metal',
    keywords: ['K faktörü', 'sac büküm açınım', 'bend allowance', 'sac açınım hesabı'],
    relatedTools: [{ label: 'Sac Büküm Açınım Hesapla', href: '/arac/sac-bukum-acinim-hesaplama' }],
    intro: ['Sac bükümde parçanın doğru açınımını bulmak için K faktörü önemlidir. Yanlış K faktörü, büküm sonrası parçanın kısa veya uzun çıkmasına neden olabilir.'],
    sections: [{ heading: 'K faktörü neyi temsil eder?', body: ['K faktörü, nötr eksenin sac kalınlığı içindeki konumunu yaklaşık olarak ifade eder. Malzeme, kalınlık, büküm yarıçapı ve kalıp yapısı bu değeri etkiler.'], list: ['Her malzeme için tek sabit değer kabul edilmemelidir.', 'Atölye denemeleriyle firma içi değer oluşturulabilir.', 'CAD açınım ayarları üretimle uyumlu olmalıdır.'] }],
    faq: [{ question: 'K faktörü CAD içinde değiştirilmeli mi?', answer: 'Evet, üretim sonuçlarına göre CAD veya CAM tarafındaki K faktörü ayarı doğrulanmalıdır.' }],
  },
  {
    slug: 'teknik-resimde-genel-tolerans-nasil-yazilir',
    title: 'Teknik Resimde Genel Tolerans Nasıl Yazılır?',
    description: 'Teknik resimde genel tolerans notu, özel toleranslar ve imalat için açık çağrı yazma mantığı.',
    date: '2026-05-21',
    readTime: '5 dk okuma',
    category: 'Teknik Resim',
    keywords: ['genel tolerans', 'teknik resim tolerans notu', 'ISO 2768', 'teknik çağrı'],
    relatedTools: [{ label: 'Teknik Çağrı Oluşturucu', href: '/arac/teknik-resim-cagri-olusturucu' }, { label: 'Teknik Çağrı Kütüphanesi', href: '/teknik-cagri-kutuphanesi' }],
    intro: ['Teknik resimde her ölçüye ayrı tolerans yazmak çoğu zaman gerekli değildir. Ancak genel tolerans notu doğru verilmezse imalatçı hangi sınırlar içinde çalışacağını net anlayamaz.'],
    sections: [{ heading: 'Genel tolerans notu ne zaman kullanılır?', body: ['Kritik olmayan ölçüler için genel tolerans notu kullanılır. Kritik ölçülerde ise tolerans doğrudan ilgili ölçü üzerine yazılmalıdır.'], list: ['Fonksiyonel ölçüler özel tolerans ister.', 'Genel tolerans notu antette veya teknik notlar bölümünde yer alabilir.', 'Kaynaklı ve talaşlı parçalar ayrı değerlendirilmelidir.'] }],
    faq: [{ question: 'Genel tolerans her ölçüyü kapsar mı?', answer: 'Hayır. Özel tolerans verilen ölçüler genel nottan bağımsız değerlendirilir.' }],
  },
  {
    slug: 'segman-kanali-olcusu-nasil-belirlenir',
    title: 'Segman Kanalı Ölçüsü Nasıl Belirlenir?',
    description: 'İç ve dış segman kanalı tasarımında kanal genişliği, kanal çapı, boşluk ve teknik resim kontrol notları.',
    date: '2026-05-21',
    readTime: '5 dk okuma',
    category: 'Makine Tasarımı',
    keywords: ['segman kanalı ölçüsü', 'iç segman kanalı', 'dış segman kanalı', 'segman kanal toleransı'],
    relatedTools: [{ label: 'Teknik Çağrı Oluşturucu', href: '/arac/teknik-resim-cagri-olusturucu' }, { label: 'Kama Kanalı Hesapla', href: '/arac/kama-kanali-hesaplama' }],
    intro: ['Segman kanalı küçük bir detay gibi görünür; ancak kanal ölçüsü yanlışsa segman oturmaz, boşluk yapar veya montaj sırasında deforme olabilir.'],
    sections: [{ heading: 'Segman kanalında ne kontrol edilir?', body: ['Kanal genişliği, kanal çapı, kanal kenar çapakları ve montaj boşluğu birlikte kontrol edilmelidir. İç ve dış segmanlarda ölçü mantığı farklıdır.'], list: ['Segman katalog ölçüsü esas alınmalıdır.', 'Kanal kenarlarında çapak bırakılmamalıdır.', 'Montaj sonrası segmanın yuvaya tam oturduğu doğrulanmalıdır.'] }],
    faq: [{ question: 'Segman kanalı elle tahmin edilebilir mi?', answer: 'Hayır. Segman standardı veya üretici katalog değeri esas alınmalıdır.' }],
  },
  {
    slug: 'kaynak-sembolu-ve-kaynak-notu-nasil-yazilir',
    title: 'Kaynak Sembolü ve Kaynak Notu Nasıl Yazılır?',
    description: 'Teknik resimde kaynak notu, kaynak sonrası temizlik, çarpılma kontrolü ve imalat açıklaması nasıl verilir?',
    date: '2026-05-21',
    readTime: '5 dk okuma',
    category: 'Teknik Resim',
    keywords: ['kaynak sembolü', 'kaynak notu', 'teknik resimde kaynak', 'kaynaklı imalat notu'],
    relatedTools: [{ label: 'Kaynak Dikişi Hesapla', href: '/arac/kaynak-dikisi-hesaplama' }, { label: 'Teknik Çağrı Kütüphanesi', href: '/teknik-cagri-kutuphanesi' }],
    intro: ['Kaynaklı imalatta sadece geometri çizmek yeterli değildir. Kaynak tipi, kaynak boyu, temizlik ve ölçü kontrol notları imalat kalitesini doğrudan etkiler.'],
    sections: [{ heading: 'Kaynak notunda neler olmalı?', body: ['Kaynak tipi ve ölçüsü sembolle verilir; ek imalat şartları ise teknik not olarak yazılabilir. Özellikle çapak, cüruf, sıçrantı ve çarpılma kontrolü belirtilmelidir.'], list: ['Kaynak sonrası temizlik notu eklenebilir.', 'Çarpılma ve ölçü kontrolü belirtilmelidir.', 'Kritik kaynaklarda kalite standardı ayrıca yazılmalıdır.'] }],
    faq: [{ question: 'Kaynak sembolü olmadan sadece not yeterli mi?', answer: 'Basit işlerde açıklayıcı not yardımcı olabilir; fakat teknik resimde doğru sembol kullanımı daha nettir.' }],
  },


  {
    slug: 'm6-kilavuz-matkap-capi-kac-mm',
    title: 'M6 Kılavuz Matkap Çapı Kaç mm? M6 × 1 ve İnce Diş Tablosu',
    description: 'M6 kaba ve ince diş için kılavuz matkap çapını, diş adımını ve kör delikte dikkat edilmesi gereken temel ölçüleri görün.',
    date: '2026-09-29',
    readTime: '4 dk okuma',
    category: 'Kılavuz Matkap',
    keywords: ['M6 matkap çapı', 'M6 kılavuz matkap çapı', 'M6 diş adımı', 'M6 hatve', 'M6 ön delik'],
    relatedTools: [
      { label: 'Metrik Diş ve Kılavuz Matkap Tablosu', href: '/arac/kilavuz-matkap-hesaplama' },
      { label: 'Cıvata Sıkma Torku', href: '/arac/civata-sikma-torku-hesaplama' },
    ],
    intro: [
      'M6 kaba metrik dişin standart adımı 1,0 mm’dir. Pratik ön delik değeri Ø5,0 mm’dir. M6 × 0,75 ince dişte ise ön delik yaklaşık Ø5,2 mm seçilir.',
      'Bu değerler genel başlangıç değeridir. Malzeme, istenen diş yüzdesi, kılavuz tipi ve üretici tavsiyesi nihai matkap çapını etkileyebilir.',
    ],
    sections: [
      {
        heading: 'M6 kaba ve ince diş değerleri',
        body: ['M6 × 1,0 kaba dişte nominal çap 6 mm ve hatve 1,0 mm’dir. M6 × 0,75 ince dişte hatve küçüldüğü için ön delik çapı büyür.'],
        list: ['M6 × 1,0: Ø5,0 mm kılavuz matkap.', 'M6 × 0,75: yaklaşık Ø5,2 mm kılavuz matkap.', 'Normal cıvata boşluk deliği yaklaşık Ø6,6 mm’dir.'],
      },
      {
        heading: 'Kör delikte yalnız matkap çapı yeterli değildir',
        body: ['Etkin diş derinliğinin altında talaş ve kılavuz çıkışı için ek delik derinliği bırakılmalıdır. Giriş pahı da kılavuzun düzgün başlamasına yardımcı olur.'],
      },
    ],
    faq: [
      { question: 'M6 kılavuz için kaçlık matkap kullanılır?', answer: 'M6 × 1,0 kaba diş için yaygın başlangıç değeri Ø5,0 mm’dir. İnce dişte hatveye göre değer değişir.' },
      { question: 'M6 diş adımı kaç mm?', answer: 'Standart kaba M6 diş adımı 1,0 mm’dir. Yaygın ince seri M6 × 0,75’tir.' },
    ],
  },
  {
    slug: 'm12-kilavuz-matkap-capi-kac-mm',
    title: 'M12 Kılavuz Matkap Çapı Kaç mm? M12 Hatve ve Ön Delik',
    description: 'M12 × 1,75 kaba diş ve M12 ince dişlerde hatveye göre kılavuz matkap çaplarını karşılaştırın.',
    date: '2026-09-29',
    readTime: '4 dk okuma',
    category: 'Kılavuz Matkap',
    keywords: ['M12 matkap çapı', 'M12 kılavuz matkap çapı', 'M12 diş adımı', 'M12 hatve', 'M12 ön delik'],
    relatedTools: [
      { label: 'Metrik Diş ve Kılavuz Matkap Tablosu', href: '/arac/kilavuz-matkap-hesaplama' },
      { label: 'Teknik Resim Çağrısı', href: '/arac/teknik-resim-cagri-olusturucu' },
    ],
    intro: [
      'M12 kaba metrik dişte standart hatve 1,75 mm’dir ve pratik kılavuz matkap çapı Ø10,2 mm’dir. İnce seride M12 × 1,5 için yaklaşık Ø10,5 mm, M12 × 1,25 için yaklaşık Ø10,8 mm kullanılır.',
      'Teknik resimde yalnız M12 yazmak kaba dişi ifade edebilir; fakat ince dişte hatvenin açıkça yazılması gerekir.',
    ],
    sections: [
      {
        heading: 'M12 diş adımı ve matkap çapları',
        body: ['Hatve küçüldükçe diş oluğunun derinliği azalır ve kılavuz öncesi delik çapı büyür. Bu yüzden kaba ve ince diş aynı matkapla hazırlanmaz.'],
        list: ['M12 × 1,75: Ø10,2 mm.', 'M12 × 1,5: Ø10,5 mm.', 'M12 × 1,25: Ø10,8 mm.', 'Normal bağlantı boşluk deliği yaklaşık Ø13,5 mm’dir.'],
      },
      {
        heading: 'İmalatta hangi değer esas alınmalı?',
        body: ['Tablo değeri iyi bir başlangıçtır. Paslanmaz, yüksek dayanımlı çelik veya form kılavuzu gibi uygulamalarda takım üreticisinin önerdiği ön delik çapı esas alınmalıdır.'],
      },
    ],
    faq: [
      { question: 'M12 kılavuz için kaçlık matkap?', answer: 'M12 × 1,75 kaba diş için yaygın kılavuz matkap değeri Ø10,2 mm’dir.' },
      { question: 'M12 ince diş için 10,2 mm kullanılır mı?', answer: 'Genellikle hayır. Örneğin M12 × 1,5 için yaklaşık Ø10,5 mm, M12 × 1,25 için yaklaşık Ø10,8 mm kullanılır.' },
    ],
  },
  {
    slug: 'm16-kilavuz-matkap-capi-kac-mm',
    title: 'M16 Kılavuz Matkap Çapı Kaç mm? M16 × 2 ve M16 × 1,5',
    description: 'M16 kaba ve ince dişlerde kılavuz matkap çapı, diş adımı ve bağlantı boşluk deliği değerlerini görün.',
    date: '2026-09-29',
    readTime: '4 dk okuma',
    category: 'Kılavuz Matkap',
    keywords: ['M16 kılavuz matkap çapı', 'M16 matkap çapı', 'M16 diş adımı', 'M16 hatve', 'M16 ön delik'],
    relatedTools: [
      { label: 'Metrik Diş ve Kılavuz Matkap Tablosu', href: '/arac/kilavuz-matkap-hesaplama' },
      { label: 'Cıvata Sıkma Torku', href: '/arac/civata-sikma-torku-hesaplama' },
    ],
    intro: [
      'M16 kaba dişin standart hatvesi 2,0 mm’dir. M16 × 2 için pratik kılavuz matkap çapı Ø14,0 mm’dir. Yaygın M16 × 1,5 ince dişte yaklaşık Ø14,5 mm ön delik kullanılır.',
      'Kılavuz çapı seçiminde diş standardının yanında malzeme ve takım tipi de kontrol edilmelidir.',
    ],
    sections: [
      {
        heading: 'M16 için hızlı tablo',
        body: ['Kaba ve ince diş arasındaki 0,5 mm hatve farkı ön delik çapını da değiştirir.'],
        list: ['M16 × 2,0: Ø14,0 mm kılavuz matkap.', 'M16 × 1,5: Ø14,5 mm kılavuz matkap.', 'Normal bağlantı boşluk deliği yaklaşık Ø17,5 mm’dir.'],
      },
      {
        heading: 'Teknik resimde M16 nasıl belirtilir?',
        body: ['Kaba dişte M16 çağrısı çoğu durumda yeterlidir; ince dişte M16 × 1,5 şeklinde hatve açıkça belirtilmelidir. Kör delikte etkin diş boyu ile toplam delik derinliği ayrı düşünülmelidir.'],
      },
    ],
    faq: [
      { question: 'M16 kılavuz için kaçlık matkap kullanılır?', answer: 'M16 × 2 kaba diş için yaygın başlangıç değeri Ø14,0 mm’dir.' },
      { question: 'M16 diş adımı kaç?', answer: 'Standart kaba M16 hatvesi 2,0 mm’dir. Yaygın ince seri M16 × 1,5’tir.' },
    ],
  },
  {
    slug: 'm20-kilavuz-matkap-capi-kac-mm',
    title: 'M20 Kılavuz Matkap Çapı Kaç mm? Kaba ve İnce Diş Değerleri',
    description: 'M20 × 2,5 kaba diş ile M20 × 2 ve M20 × 1,5 ince dişlerin kılavuz matkap çaplarını karşılaştırın.',
    date: '2026-09-29',
    readTime: '4 dk okuma',
    category: 'Kılavuz Matkap',
    keywords: ['M20 matkap çapı', 'M20 kılavuz matkap çapı', 'M20 diş adımı', 'M20 hatve', 'M20 ön delik'],
    relatedTools: [
      { label: 'Metrik Diş ve Kılavuz Matkap Tablosu', href: '/arac/kilavuz-matkap-hesaplama' },
      { label: 'Cıvata Sıkma Torku', href: '/arac/civata-sikma-torku-hesaplama' },
    ],
    intro: [
      'M20 kaba dişte standart hatve 2,5 mm’dir ve yaygın kılavuz matkap çapı Ø17,5 mm’dir. M20 × 2 için yaklaşık Ø18,0 mm, M20 × 1,5 için yaklaşık Ø18,5 mm ön delik kullanılır.',
      'Büyük çaplı dişlerde delik doğruluğu, eksen kaçıklığı ve kılavuzlama torku küçük çaplara göre daha kritik hale gelir.',
    ],
    sections: [
      {
        heading: 'M20 kaba ve ince hatve tablosu',
        body: ['İnce diş seçildiğinde daha büyük ön delik gerekir; çünkü hatve küçüldükçe diş profili sığlaşır.'],
        list: ['M20 × 2,5: Ø17,5 mm.', 'M20 × 2,0: Ø18,0 mm.', 'M20 × 1,5: Ø18,5 mm.', 'Normal bağlantı boşluk deliği yaklaşık Ø22 mm’dir.'],
      },
      {
        heading: 'M20 kılavuzlamada pratik kontrol',
        body: ['Derin kör deliklerde talaş tahliyesi, kesme sıvısı ve kılavuz geometrisi önemlidir. Seri üretimde takım üreticisinin tavsiye ettiği delik toleransı ayrıca kontrol edilmelidir.'],
      },
    ],
    faq: [
      { question: 'M20 kılavuz için kaçlık matkap?', answer: 'M20 × 2,5 kaba diş için yaygın başlangıç değeri Ø17,5 mm’dir.' },
      { question: 'M20 ince dişte matkap çapı nedir?', answer: 'M20 × 2 için yaklaşık Ø18,0 mm, M20 × 1,5 için yaklaşık Ø18,5 mm kullanılır.' },
    ],
  },
  {
    slug: 'm30-hatve-kilavuz-matkap-capi',
    title: 'M30 Hatve Kaç mm? M30 Kılavuz Matkap Çapı ve İnce Diş',
    description: 'M30 kaba diş hatvesi, M30 × 3,5 kılavuz matkap çapı ve M30 × 2 ince diş ön delik değerlerini görün.',
    date: '2026-09-29',
    readTime: '4 dk okuma',
    category: 'Kılavuz Matkap',
    keywords: ['M30 hatve', 'M30 diş adımı', 'M30 matkap çapı', 'M30 kılavuz matkap çapı', 'M30 ince diş'],
    relatedTools: [
      { label: 'Metrik Diş ve Kılavuz Matkap Tablosu', href: '/arac/kilavuz-matkap-hesaplama' },
      { label: 'Teknik Resim Çağrısı', href: '/arac/teknik-resim-cagri-olusturucu' },
    ],
    intro: [
      'M30 kaba metrik dişin standart hatvesi 3,5 mm’dir. M30 × 3,5 için yaygın kılavuz matkap çapı Ø26,5 mm’dir. M30 × 2 ince dişte ise yaklaşık Ø28,0 mm ön delik kullanılır.',
      'M30 gibi büyük dişlerde kaba ve ince seri farkı hem ön delik çapını hem de bağlantının mekanik davranışını belirgin biçimde değiştirir.',
    ],
    sections: [
      {
        heading: 'M30 hatve ve ön delik değerleri',
        body: ['Kaba seri genel amaçlı bağlantılarda yaygındır. İnce seri daha küçük hatveyle daha fazla diş turu sağlar; ancak uygulamaya göre dayanım ve montaj şartları ayrıca değerlendirilmelidir.'],
        list: ['M30 × 3,5 kaba diş: Ø26,5 mm kılavuz matkap.', 'M30 × 2 ince diş: Ø28,0 mm kılavuz matkap.', 'Normal bağlantı boşluk deliği yaklaşık Ø33 mm’dir.'],
      },
      {
        heading: 'M30 teknik resim çağrısı',
        body: ['Kaba dişte M30 çağrısı çoğu standart uygulamada kaba hatveyi ifade eder. İnce dişte hatve M30 × 2 şeklinde açıkça yazılmalıdır. Tolerans sınıfı gerekiyorsa M30 × 2 - 6H gibi tamamlanabilir.'],
      },
    ],
    faq: [
      { question: 'M30 hatve kaç mm?', answer: 'Standart kaba M30 diş hatvesi 3,5 mm’dir.' },
      { question: 'M30 kılavuz matkap çapı kaç?', answer: 'M30 × 3,5 kaba diş için yaygın kılavuz matkap değeri Ø26,5 mm’dir. M30 × 2 ince dişte yaklaşık Ø28,0 mm kullanılır.' },
    ],
  },

  ...seoBlogExpansionPosts,
];

export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);
