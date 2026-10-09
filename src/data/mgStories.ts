// Adaptations of established Mühendis Gözüyle topics for Tooldur.
// These articles are not verbatim exports of Facebook posts and do not
// include original Facebook images. publishedAt is the Tooldur release date.
export type MgStory = {
  slug: string;
  title: string;
  category: string;
  hook: string;
  summary: string;
  image: string;
  imageAlt: string;
  readTime: string;
  lead: string;
  sections: { heading: string; body: string }[];
  takeaways: string[];
  caution: string;
  relatedTools: { label: string; href: string }[];
};

export const MG_SITE_PUBLISHED_AT = '2026-10-09';
export const mgStories: MgStory[] = [
  {
    "slug": "serit-metrenin-kancasi-neden-oynar",
    "title": "Şerit metrenin kancası neden oynar?",
    "category": "Ölçme ve Tolerans",
    "hook": "Oynayan kanca üretim hatası değil, ölçüm düzeltmesidir.",
    "summary": "Şerit metrenin ucundaki küçük boşluk, içten ve dıştan ölçüm arasında kanca kalınlığını telafi eder.",
    "image": "/mg/serit-metrenin-kancasi-neden-oynar.svg",
    "imageAlt": "Hareketli şerit metre kancasının içten ve dıştan ölçüm konumları; temsili mühendislik çizimi",
    "readTime": "4 dk",
    "lead": "Kancanın hafifçe ileri geri hareket etmesi çoğu şerit metrede bilinçli bir tasarımdır. Uçta oluşan bu hareket, iki farklı ölçüm temasında sıfır noktasını düzeltmeye yarar.",
    "sections": [
      {
        "heading": "Dıştan ve içten ölçüm neden farklı?",
        "body": "Bir levhanın dış kenarına kancayı takıp şeridi çektiğinizde kanca dışa yaslanır. İki yüzey arasına şeridi bastırarak ölçtüğünüzde ise kanca içeri itilir. Bu iki konum arasındaki tasarım hareketi, kanca sacının kalınlığını karşılamak içindir."
      },
      {
        "heading": "Boşluk ne kadar olmalı?",
        "body": "İdeal düzende kancanın kontrollü hareket mesafesi kendi kalınlığına karşılık gelir. Bu değer tüm şerit metrelerde aynı değildir. Aşırı zorlanmış, eğilmiş veya gevşemiş kanca sıfır referansını bozabilir; normal kontrollü hareket ile hasarlı bağlantı aynı şey değildir."
      },
      {
        "heading": "Sahada nasıl kontrol edilir?",
        "body": "Aynı referans parçayı önce kancaya takarak, sonra kancayı iterek ve mümkünse hassas bir karşılaştırma mastarıyla ölçün. Fark oluşuyorsa yalnızca şerit bölüntüsünü değil kancanın düzlüğünü ve bağlantı durumunu da denetleyin."
      }
    ],
    "takeaways": [
      "Kontrollü hareket, kanca kalınlığını telafi eder.",
      "İçten ölçümde kanca içeri, dıştan ölçümde dışarı oturur.",
      "Kanca eğilmişse hareket etmesi tek başına doğruluk garantisi değildir."
    ],
    "caution": "Hassas imalat ölçüsü için şerit metre yerine uygun kalibrasyonlu ölçme ekipmanı kullanın.",
    "relatedTools": [
      {
        "label": "ISO geçme toleransı",
        "href": "/arac/iso-gecme-tolerans-hesaplama"
      }
    ]
  },
  {
    "slug": "basinc-tanklarinin-uclari-neden-bombeli",
    "title": "Basınç tanklarının uçları neden bombeli?",
    "category": "Basınçlı Sistemler",
    "hook": "Düz kapak kolay görünür; basınç altında daha zorlanabilir.",
    "summary": "Bombeli kapak, iç basıncın oluşturduğu yükleri geometri üzerinden daha elverişli dağıtır.",
    "image": "/mg/basinc-tanklarinin-uclari-neden-bombeli.svg",
    "imageAlt": "Bombeli kapaklı basınçlı kap ve yük yönleri; temsili teknik çizim",
    "readTime": "5 dk",
    "lead": "Basınçlı kaplarda uçların düz yerine bombeli olması yalnızca estetik seçim değildir. Basınç yükünün kabuk boyunca nasıl taşındığı, kapağın eğriliği ve geçiş geometrisiyle doğrudan ilişkilidir.",
    "sections": [
      {
        "heading": "Düz ve eğrisel yüzeyin yük taşıma davranışı",
        "body": "Düz bir kapak basınç etkisi altında eğilme gerilmelerine ve sehimlere maruz kalır. Uygun eğrilikli başlık ise yükün önemli bir kısmını kabuk düzlemindeki zar gerilmeleriyle taşıyabilir. Bu yüzden aynı koşul için farklı et kalınlığı ve takviye gereksinimleri ortaya çıkar."
      },
      {
        "heading": "Her bombeli uç aynı değildir",
        "body": "Yarım küresel, eliptik ve torisferik kapakların gerilme dağılımları farklıdır. Özellikle silindirik gövdeyle kapak geçiş bölgesi ayrıca incelenir. 'Bombeli ise her zaman güvenli' sonucu çıkarılamaz."
      },
      {
        "heading": "Hesaplama sınırı",
        "body": "İnce cidarlı ideal kap yaklaşımları ilk fikir verir; gerçek imalat için çalışma basıncı, çap, malzeme, kaynak verimi, sıcaklık, korozyon payı ve ilgili tasarım standardı birlikte değerlendirilmelidir."
      }
    ],
    "takeaways": [
      "Geometri, basınç kaynaklı gerilme türünü değiştirir.",
      "Başlık tipleri arasında doğrudan kalınlık eşitliği varsayılmaz.",
      "Geçiş bölgesi ve kaynak detayları kritiktir."
    ],
    "caution": "Gerçek basınçlı kap boyutlandırmasını yalnızca genel formülle sonuçlandırmayın; geçerli tasarım standardını ve yetkili kontrolü esas alın.",
    "relatedTools": [
      {
        "label": "Basınçlı kap cidar hesabı",
        "href": "/arac/basincli-kap-cidar-kalinligi"
      },
      {
        "label": "Basınç hesabı",
        "href": "/arac/basinc-hesaplama"
      }
    ]
  },
  {
    "slug": "celik-halat-neden-ince-tellerden-olusur",
    "title": "Çelik halat neden çok sayıda ince telden yapılır?",
    "category": "Makine Elemanları",
    "hook": "Tek kalın çubuk güçlü olabilir; fakat makaranın etrafında kolay bükülmez.",
    "summary": "Çok telli halat tasarımı taşıma kapasitesiyle birlikte esneklik ve eğilme davranışını yönetir.",
    "image": "/mg/celik-halat-neden-ince-tellerden-olusur.svg",
    "imageAlt": "İnce tellerden meydana gelen çok demetli çelik halat kesiti; temsili çizim",
    "readTime": "5 dk",
    "lead": "Vinçte, asansörde veya çekme sisteminde görülen çelik halatlar tek bir kalın çelik telden oluşmaz. İnce tellerin demetler hâlinde örülmesi bilinçli bir mekanik çözümdür.",
    "sections": [
      {
        "heading": "Neden tek bir kalın çubuk değil?",
        "body": "Halatın makaradan veya tamburdan geçerken tekrar tekrar eğilmesi gerekir. Çapı küçük teller, aynı dış çaptaki yekpare çelik çubuğa kıyasla bu bükülme hareketini daha uygun biçimde karşılar. Halatın gerçek davranışı tel çapı, demet yapısı, öz ve sarım düzeniyle değişir."
      },
      {
        "heading": "Teller yükü nasıl paylaşır?",
        "body": "Çok telli yapı yükün birden fazla elemana dağıtılmasını sağlar; ancak her telin her anda eşit yük taşıdığı veya birkaç tel koptuğunda halatın güvenle kullanılabileceği varsayılamaz. Yük kapasitesi halat sınıfına, yapıya ve standartlaştırılmış kopma deneylerine göre belirlenir."
      },
      {
        "heading": "Asıl kontrol noktası",
        "body": "Tel kırıkları, dış çap azalması, korozyon, kuş kafesi benzeri şekil bozuklukları ve makara çapı yorulma ömrünü etkiler. İç teller gözle görünmediği için uygun periyodik kontrol ve değiştirme kriterleri önemlidir."
      }
    ],
    "takeaways": [
      "Tellerin küçük çapı eğilme kabiliyetine katkı sağlar.",
      "Sarım geometrisi ve öz tipi davranışı değiştirir.",
      "Çok telli olmak, kopuk telin güvenle tolere edileceği anlamına gelmez."
    ],
    "caution": "Kaldırma ekipmanında işletme ve hurdaya ayırma kararlarını üretici ve ilgili standart kriterleriyle verin.",
    "relatedTools": []
  },
  {
    "slug": "i-profil-neden-i-seklindedir",
    "title": "I profil neden I şeklindedir?",
    "category": "Yapısal Mekanik",
    "hook": "Aynı malzemeyi başka yere koyunca eğilmeye direnç değişir.",
    "summary": "Başlıklar malzemeyi eğilme nötr ekseninden uzağa taşır; gövde başlıkları birbirine bağlar.",
    "image": "/mg/i-profil-neden-i-seklindedir.svg",
    "imageAlt": "I kesitinin başlık ve gövdesinde eğilme-gerilme davranışını gösteren temsili çizim",
    "readTime": "5 dk",
    "lead": "Bir I profilin geometrisi tesadüf değildir. Taşıyıcı kesitin kütlesini, belirli bir doğrultudaki eğilme rijitliğini artıracak biçimde dağıtmaya yardımcı olur.",
    "sections": [
      {
        "heading": "Başlıklar neden geniş?",
        "body": "Eğilmede kesitin nötr ekseninden uzak lifler daha büyük normal gerilme taşır. Başlıklarda bulunan malzeme eksenden uzakta yer aldığı için kuvvetli eksen etrafındaki ikinci alan momentine yüksek katkı verir. Rijitlik değerlendirmesinde malzemenin elastisite modülü ile kesitin I değeri birlikte kullanılır."
      },
      {
        "heading": "Ortadaki ince gövde ne yapar?",
        "body": "Gövde başlıkları belirli aralıkta tutar ve kesme kuvvetinin önemli bölümünü taşır. Ancak ince gövde yerel burkulma açısından, basınç altındaki başlık da yanal burulmalı burkulma açısından ayrıca kontrol gerektirebilir."
      },
      {
        "heading": "Yalnızca ağırlığa bakmak doğru mu?",
        "body": "Aynı kütleye sahip iki profilin eğilme, burkulma ve burulma davranışı aynı olmak zorunda değildir. Yük doğrultusu, mesnet koşulu ve kesit geometrisi birlikte değerlendirilir."
      }
    ],
    "takeaways": [
      "Başlıkların eksenden uzaklığı eğilme rijitliğini etkiler.",
      "Gövde, kesme taşınmasında ve kesit geometrisinde görev alır.",
      "Zayıf eksen ve burkulma denetimi unutulmamalıdır."
    ],
    "caution": "Kesit ağırlığı tek başına taşıma kapasitesi değildir; nihai tasarımda yükleme ve stabilite hesabı gerekir.",
    "relatedTools": [
      {
        "label": "Çelik profil ağırlığı",
        "href": "/arac/celik-profil-agirligi"
      },
      {
        "label": "Mil mukavemet hesabı",
        "href": "/arac/mil-mukavemet-hesaplama"
      }
    ]
  },
  {
    "slug": "acik-agiz-anahtar-neden-15-derece",
    "title": "Açık ağız anahtar neden 15° eğiktir?",
    "category": "Bağlantı Elemanları",
    "hook": "Anahtarın kafasındaki küçük açı dar alanda işe yarar.",
    "summary": "Açık ağız ile sap arasındaki yaygın 15° açı, anahtarı ters çevirerek sınırlı hareket alanında farklı kavrama konumlarına ulaşmayı kolaylaştırır.",
    "image": "/mg/acik-agiz-anahtar-neden-15-derece.svg",
    "imageAlt": "Altıgen somuna yerleşen 15 derece eğik açık ağız anahtar; temsili çizim",
    "readTime": "4 dk",
    "lead": "Birçok açık ağız anahtarın çenesi sap eksenine göre yaklaşık 15° eğimlidir. Bu küçük detay, anahtarı bütünüyle döndüremediğiniz yerlerde işe yarar.",
    "sections": [
      {
        "heading": "Dar alanda nasıl avantaj sağlar?",
        "body": "Altıgen somunun yüzey düzeni 60° aralıklarla tekrar eder. Anahtarı çevirip diğer yüzüne aldığınızda çene açısının yerleşim farkından yararlanılır. Uygun geometrilerde yaklaşık 30°'lik ek erişim konumları elde etmek mümkün olabilir."
      },
      {
        "heading": "Her anahtar aynı değildir",
        "body": "15° yaygın bir tasarımdır, zorunlu evrensel kural değildir. Açık ağız, yıldız, cırcırlı ve ofset anahtarlar farklı hareket olanakları sunar. Somunun aşınması, çene boşluğu ve tork seviyesi de seçimi etkiler."
      },
      {
        "heading": "Bağlantının emniyeti",
        "body": "Anahtarın avantajı erişimdir; doğru sıkma torkunu kendi başına garanti etmez. Kritik bağlantılar için uygun başlık, tork kontrollü ekipman ve üretici prosedürü gerekir."
      }
    ],
    "takeaways": [
      "Sap-çene ofseti dar alan erişimi artırır.",
      "Anahtarı ters çevirmek yeni kavrama konumu sağlayabilir.",
      "Tork kontrolü için ayrıca uygun yöntem gerekir."
    ],
    "caution": "Sıkışmış veya kritik bağlantılarda kayma riskine karşı anahtarın somunu yeterince kavradığından emin olun.",
    "relatedTools": [
      {
        "label": "Cıvata sıkma torku",
        "href": "/arac/civata-sikma-torku-hesaplama"
      }
    ]
  },
  {
    "slug": "honlama-yuzeyindeki-capraz-izler",
    "title": "Honlama yüzeyindeki çapraz izler neden var?",
    "category": "Üretim Yöntemleri",
    "hook": "Bu izler rastgele çizik değil, kontrollü bir yüzey dokusudur.",
    "summary": "Honlama işleminin bıraktığı çapraz izler, yüzey geometrisi ve yağ tutma davranışı üzerinde etkilidir.",
    "image": "/mg/honlama-yuzeyindeki-capraz-izler.svg",
    "imageAlt": "Honlanmış silindirik yüzeyde çapraz tarama dokusu; temsili teknik çizim",
    "readTime": "5 dk",
    "lead": "Motor silindiri ve bazı hidrolik bileşenlerin iç yüzeylerinde görülen çapraz honlama izleri, son yüzey işleme operasyonunun izleridir.",
    "sections": [
      {
        "heading": "İzler ne işe yarar?",
        "body": "Kontrollü honlama, istenen çap, form ve yüzey dokusuna yaklaşmak için yapılır. Yüzey üzerindeki çukurluk ve olukların belirli bir bölümü yağ filminin tutulmasına katkı sağlayabilir; ancak tek ölçüt görünür çizgi yoğunluğu değildir."
      },
      {
        "heading": "Neden çapraz görünür?",
        "body": "Takımın dönmesiyle eksen boyunca ileri-geri hareketinin bileşimi çapraz iz oluşturur. Desen açısı işleme parametreleriyle değişebilir. Doğru açı, pürüzlülük ve plato oranı; malzeme, yağlama ve sızdırmazlık elemanına göre belirlenir."
      },
      {
        "heading": "Yanlış yorumlanan nokta",
        "body": "Yüzey ne kadar pürüzlü olursa o kadar iyi yağ tutar demek doğru değildir. Çok sivri tepecikler aşınmayı artırabilir; çok düz veya uygun dokusu olmayan yüzey de istenen yağ filmi davranışını sağlamayabilir."
      }
    ],
    "takeaways": [
      "Çapraz desen dönme ve ileri-geri hareketten doğar.",
      "Yağ filmi için yüzey topografyası önemlidir.",
      "Rastgele derin çizikler honlama kalitesi demek değildir."
    ],
    "caution": "Fonksiyonel yüzeyleri yalnızca Ra sayısıyla değerlendirmek yetersiz kalabilir; uygulamaya özel yüzey parametrelerini kontrol edin.",
    "relatedTools": [
      {
        "label": "Yüzey pürüzlülüğü rehberi",
        "href": "/arac/yuzey-puruzlulugu-rehberi"
      }
    ]
  },
  {
    "slug": "gemilerde-kurban-anot-ne-ise-yarar",
    "title": "Gemilerde kurban anot ne işe yarar?",
    "category": "Korozyon ve Malzeme",
    "hook": "Bazı metal parçalar bilerek önce aşınsın diye takılır.",
    "summary": "Uygun elektrokimyasal koşullarda daha aktif bir metal, korunan yüzey yerine korozyona uğramaya yönlendirilir.",
    "image": "/mg/gemilerde-kurban-anot-ne-ise-yarar.svg",
    "imageAlt": "Tekne gövdesine bağlı kurban anot ve elektrokimyasal koruma; temsili çizim",
    "readTime": "5 dk",
    "lead": "Tekne gövdeleri, pervaneler ve deniz suyuyla temas eden sistemlerde bazı metal parçalar görünüşte 'gereksiz' bir eklenti gibi durur. Oysa kurban anotlar, katodik korumanın temel unsurlarındandır.",
    "sections": [
      {
        "heading": "Neden anot tüketilir?",
        "body": "Elektriksel olarak bağlantılı metaller uygun bir elektrolit içinde farklı korozyon potansiyellerine sahip olabilir. Seçilen daha aktif anot, korunan yapıya elektron sağlayarak o yüzeydeki korozyon tepkimelerini baskılamaya yardımcı olur. Bu sırada anot zamanla tüketilir."
      },
      {
        "heading": "Hangi malzeme seçilir?",
        "body": "Çinko, alüminyum alaşımları veya magnezyum gibi anotlar farklı ortamlarda kullanılır. Deniz suyu, tatlı su, tuzluluk, korunan metal ve elektriksel süreklilik seçimi belirler. Tek bir malzeme her ortamda doğru değildir."
      },
      {
        "heading": "Bakım neden kritik?",
        "body": "Anot kütlesi azalırsa, kaplama bozulursa veya elektriksel bağlantı kaybolursa koruma etkinliği düşebilir. Düzenli görsel muayene ve gerekiyorsa potansiyel ölçümü yapılmalıdır."
      }
    ],
    "takeaways": [
      "Kurban anot tüketilerek daha değerli yüzeyin korunmasına katkı verir.",
      "Alaşım ve su ortamı birlikte seçilir.",
      "Korozyondan korunmada bağlantı ve bakım önemlidir."
    ],
    "caution": "Kurban anot, iyi kaplama ve düzenli bakımın yerine geçmez; elektriksel kaçak gibi problemler ayrıca incelenmelidir.",
    "relatedTools": []
  },
  {
    "slug": "rulman-kafesi-ne-ise-yarar",
    "title": "Bilyalı rulmanda kafes ne işe yarar?",
    "category": "Rulmanlar",
    "hook": "Kafes, rulmanın ana yük taşıyan parçası değildir.",
    "summary": "Kafes bilyaların birbirinden ayrılmasına, çevresel aralıklarının korunmasına ve bazı çalışma koşullarında yönlendirilmelerine yardımcı olur.",
    "image": "/mg/rulman-kafesi-ne-ise-yarar.svg",
    "imageAlt": "Bilyalı rulmanda kafesin bilyaları ayırdığı temsili kesit",
    "readTime": "5 dk",
    "lead": "Bilyalı rulmanı dağıttığınızda göze çarpan ince halka ya da kafes, bilyaları yerinde tutan bir yardımcı elemandır. Rulmanın yük yolu ise esas olarak iç bilezik, yuvarlanma elemanları ve dış bilezik üzerinden oluşur.",
    "sections": [
      {
        "heading": "Kafes neden var?",
        "body": "Kafes, bilyaların birbirleriyle doğrudan yoğun temasını önleyip onları çevre boyunca uygun aralıkta tutar. Böylece bilya-bilya sürtünmesi, düzensiz hareket ve bazı çalışma koşullarında ısınma riskleri azaltılabilir."
      },
      {
        "heading": "Hangi malzemeden yapılır?",
        "body": "Çelik sac, pirinç veya mühendislik polimerleri gibi farklı kafes malzemeleri kullanılır. Seçimi dönme hızı, sıcaklık, yağlama, titreşim ve uygulamanın özel gereksinimleri belirler."
      },
      {
        "heading": "Kafes arızası neyi gösterir?",
        "body": "Kafes hasarı çoğu zaman yağlama, yanlış montaj, sıcaklık, aşırı hız veya titreşim gibi başka koşullarla birlikte araştırılmalıdır. 'Kafes yük taşımaz' ifadesi, kafeste hiçbir iç kuvvet oluşmaz anlamına gelmez."
      }
    ],
    "takeaways": [
      "Rulman yükünün ana yolu bilezikler ve yuvarlanma elemanlarıdır.",
      "Kafes bilyaları birbirinden ayırır ve düzenler.",
      "Kafes malzemesi uygulama koşullarına göre seçilir."
    ],
    "caution": "Rulman ömrü hesabında gerçek yük, devir, yağlama ve çalışma koşulları önemlidir; yalnızca kafes tipine bakılarak seçim yapılamaz.",
    "relatedTools": [
      {
        "label": "Rulman ömrü hesabı",
        "href": "/arac/rulman-omru-hesaplama"
      }
    ]
  }
];

export const getMgStory = (slug: string) => mgStories.find((story) => story.slug === slug);
