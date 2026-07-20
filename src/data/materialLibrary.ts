/**
 * Tooldur — Malzeme Kütüphanesi Veritabanı
 * Kaynak: TS 648, EN 10025, IEC 60228, TS 500
 */

// ─── TİP TANIMLARI ────────────────────────────────────────────

export interface MaterialEntry {
    id: string;
    name: string;
    category: string;
    subcategory: string;
    tags: string[];
    properties: Property[];
    note?: string;
    standard?: string;
  }
  
  export interface Property {
    label: string;
    value: string | number;
    unit?: string;
    highlight?: boolean;
  }
  
  // ─── ÇELİK PROFİLLER ─────────────────────────────────────────
  
  const ipeData: MaterialEntry[] = [
    { id:"ipe80",  name:"IPE 80",  category:"profil", subcategory:"IPE", tags:["ipe","i profil","çelik profil"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:80,unit:"mm"},{label:"Flanş Genişliği",value:46,unit:"mm"},{label:"Gövde Kalınlığı",value:3.8,unit:"mm"},{label:"Flanş Kalınlığı",value:5.2,unit:"mm"},{label:"Birim Ağırlık",value:6.0,unit:"kg/m",highlight:true},{label:"Alan",value:7.64,unit:"cm²"},{label:"Ix",value:80.1,unit:"cm⁴"},{label:"Wx",value:20.0,unit:"cm³"}]},
    { id:"ipe100", name:"IPE 100", category:"profil", subcategory:"IPE", tags:["ipe","i profil","çelik profil"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:100,unit:"mm"},{label:"Flanş Genişliği",value:55,unit:"mm"},{label:"Gövde Kalınlığı",value:4.1,unit:"mm"},{label:"Flanş Kalınlığı",value:5.7,unit:"mm"},{label:"Birim Ağırlık",value:8.1,unit:"kg/m",highlight:true},{label:"Alan",value:10.3,unit:"cm²"},{label:"Ix",value:171,unit:"cm⁴"},{label:"Wx",value:34.2,unit:"cm³"}]},
    { id:"ipe120", name:"IPE 120", category:"profil", subcategory:"IPE", tags:["ipe","i profil"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:120,unit:"mm"},{label:"Flanş Genişliği",value:64,unit:"mm"},{label:"Gövde Kalınlığı",value:4.4,unit:"mm"},{label:"Flanş Kalınlığı",value:6.3,unit:"mm"},{label:"Birim Ağırlık",value:10.4,unit:"kg/m",highlight:true},{label:"Alan",value:13.2,unit:"cm²"},{label:"Ix",value:318,unit:"cm⁴"},{label:"Wx",value:53.0,unit:"cm³"}]},
    { id:"ipe140", name:"IPE 140", category:"profil", subcategory:"IPE", tags:["ipe","i profil"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:140,unit:"mm"},{label:"Flanş Genişliği",value:73,unit:"mm"},{label:"Gövde Kalınlığı",value:4.7,unit:"mm"},{label:"Flanş Kalınlığı",value:6.9,unit:"mm"},{label:"Birim Ağırlık",value:12.9,unit:"kg/m",highlight:true},{label:"Alan",value:16.4,unit:"cm²"},{label:"Ix",value:541,unit:"cm⁴"},{label:"Wx",value:77.3,unit:"cm³"}]},
    { id:"ipe160", name:"IPE 160", category:"profil", subcategory:"IPE", tags:["ipe","i profil"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:160,unit:"mm"},{label:"Flanş Genişliği",value:82,unit:"mm"},{label:"Gövde Kalınlığı",value:5.0,unit:"mm"},{label:"Flanş Kalınlığı",value:7.4,unit:"mm"},{label:"Birim Ağırlık",value:15.8,unit:"kg/m",highlight:true},{label:"Alan",value:20.1,unit:"cm²"},{label:"Ix",value:869,unit:"cm⁴"},{label:"Wx",value:109,unit:"cm³"}]},
    { id:"ipe180", name:"IPE 180", category:"profil", subcategory:"IPE", tags:["ipe","i profil"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:180,unit:"mm"},{label:"Flanş Genişliği",value:91,unit:"mm"},{label:"Gövde Kalınlığı",value:5.3,unit:"mm"},{label:"Flanş Kalınlığı",value:8.0,unit:"mm"},{label:"Birim Ağırlık",value:18.8,unit:"kg/m",highlight:true},{label:"Alan",value:23.9,unit:"cm²"},{label:"Ix",value:1317,unit:"cm⁴"},{label:"Wx",value:146,unit:"cm³"}]},
    { id:"ipe200", name:"IPE 200", category:"profil", subcategory:"IPE", tags:["ipe","i profil","yaygın"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:200,unit:"mm"},{label:"Flanş Genişliği",value:100,unit:"mm"},{label:"Gövde Kalınlığı",value:5.6,unit:"mm"},{label:"Flanş Kalınlığı",value:8.5,unit:"mm"},{label:"Birim Ağırlık",value:22.4,unit:"kg/m",highlight:true},{label:"Alan",value:28.5,unit:"cm²"},{label:"Ix",value:1943,unit:"cm⁴"},{label:"Wx",value:194,unit:"cm³"}]},
    { id:"ipe240", name:"IPE 240", category:"profil", subcategory:"IPE", tags:["ipe","i profil","yaygın"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:240,unit:"mm"},{label:"Flanş Genişliği",value:120,unit:"mm"},{label:"Gövde Kalınlığı",value:6.2,unit:"mm"},{label:"Flanş Kalınlığı",value:9.8,unit:"mm"},{label:"Birim Ağırlık",value:30.7,unit:"kg/m",highlight:true},{label:"Alan",value:39.1,unit:"cm²"},{label:"Ix",value:3892,unit:"cm⁴"},{label:"Wx",value:324,unit:"cm³"}]},
    { id:"ipe300", name:"IPE 300", category:"profil", subcategory:"IPE", tags:["ipe","i profil","yaygın"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:300,unit:"mm"},{label:"Flanş Genişliği",value:150,unit:"mm"},{label:"Gövde Kalınlığı",value:7.1,unit:"mm"},{label:"Flanş Kalınlığı",value:10.7,unit:"mm"},{label:"Birim Ağırlık",value:42.2,unit:"kg/m",highlight:true},{label:"Alan",value:53.8,unit:"cm²"},{label:"Ix",value:8356,unit:"cm⁴"},{label:"Wx",value:557,unit:"cm³"}]},
    { id:"ipe400", name:"IPE 400", category:"profil", subcategory:"IPE", tags:["ipe","i profil"],  standard:"EN 10034", properties:[{label:"Yükseklik",value:400,unit:"mm"},{label:"Flanş Genişliği",value:180,unit:"mm"},{label:"Gövde Kalınlığı",value:8.6,unit:"mm"},{label:"Flanş Kalınlığı",value:13.5,unit:"mm"},{label:"Birim Ağırlık",value:66.3,unit:"kg/m",highlight:true},{label:"Alan",value:84.5,unit:"cm²"},{label:"Ix",value:23130,unit:"cm⁴"},{label:"Wx",value:1156,unit:"cm³"}]},
  ];
  
  const heaData: MaterialEntry[] = [
    { id:"hea100", name:"HEA 100", category:"profil", subcategory:"HEA", tags:["hea","h profil","geniş flanşlı"], standard:"EN 10034", properties:[{label:"Yükseklik",value:96,unit:"mm"},{label:"Flanş Genişliği",value:100,unit:"mm"},{label:"Gövde Kalınlığı",value:5.0,unit:"mm"},{label:"Flanş Kalınlığı",value:8.0,unit:"mm"},{label:"Birim Ağırlık",value:16.7,unit:"kg/m",highlight:true},{label:"Alan",value:21.2,unit:"cm²"},{label:"Ix",value:349,unit:"cm⁴"}]},
    { id:"hea200", name:"HEA 200", category:"profil", subcategory:"HEA", tags:["hea","h profil","geniş flanşlı","yaygın"], standard:"EN 10034", properties:[{label:"Yükseklik",value:190,unit:"mm"},{label:"Flanş Genişliği",value:200,unit:"mm"},{label:"Gövde Kalınlığı",value:6.5,unit:"mm"},{label:"Flanş Kalınlığı",value:10.0,unit:"mm"},{label:"Birim Ağırlık",value:42.3,unit:"kg/m",highlight:true},{label:"Alan",value:53.8,unit:"cm²"},{label:"Ix",value:3692,unit:"cm⁴"},{label:"Wx",value:389,unit:"cm³"}]},
    { id:"hea300", name:"HEA 300", category:"profil", subcategory:"HEA", tags:["hea","h profil","geniş flanşlı"], standard:"EN 10034", properties:[{label:"Yükseklik",value:290,unit:"mm"},{label:"Flanş Genişliği",value:300,unit:"mm"},{label:"Gövde Kalınlığı",value:8.5,unit:"mm"},{label:"Flanş Kalınlığı",value:14.0,unit:"mm"},{label:"Birim Ağırlık",value:88.3,unit:"kg/m",highlight:true},{label:"Alan",value:112,unit:"cm²"},{label:"Ix",value:18260,unit:"cm⁴"},{label:"Wx",value:1260,unit:"cm³"}]},
    { id:"hea400", name:"HEA 400", category:"profil", subcategory:"HEA", tags:["hea","h profil","geniş flanşlı"], standard:"EN 10034", properties:[{label:"Yükseklik",value:390,unit:"mm"},{label:"Flanş Genişliği",value:300,unit:"mm"},{label:"Gövde Kalınlığı",value:11.0,unit:"mm"},{label:"Flanş Kalınlığı",value:19.0,unit:"mm"},{label:"Birim Ağırlık",value:125,unit:"kg/m",highlight:true},{label:"Alan",value:159,unit:"cm²"},{label:"Ix",value:45070,unit:"cm⁴"},{label:"Wx",value:2311,unit:"cm³"}]},
  ];
  
  // ─── ÇELİK KALİTELERİ ────────────────────────────────────────
  
  const steelGrades: MaterialEntry[] = [
    { id:"s235", name:"S235 (St 37)", category:"malzeme", subcategory:"Yapısal Çelik", tags:["çelik","s235","st37","yapısal"], standard:"EN 10025", properties:[{label:"Akma Gerilmesi",value:235,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:"360–510",unit:"MPa"},{label:"Min. Uzama",value:26,unit:"%"},{label:"Elastisite Modülü",value:210000,unit:"MPa"},{label:"Yoğunluk",value:7850,unit:"kg/m³"},{label:"Termal Genleşme",value:"12×10⁻⁶",unit:"1/°C"}], note:"Genel yapısal kullanım, kaynaklı konstrüksiyon"},
    { id:"s275", name:"S275 (St 44)", category:"malzeme", subcategory:"Yapısal Çelik", tags:["çelik","s275","st44","yapısal"], standard:"EN 10025", properties:[{label:"Akma Gerilmesi",value:275,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:"430–580",unit:"MPa"},{label:"Min. Uzama",value:23,unit:"%"},{label:"Elastisite Modülü",value:210000,unit:"MPa"},{label:"Yoğunluk",value:7850,unit:"kg/m³"}], note:"Köprü ve taşıyıcı sistem"},
    { id:"s355", name:"S355 (St 52)", category:"malzeme", subcategory:"Yapısal Çelik", tags:["çelik","s355","st52","yüksek mukavemet","yaygın"], standard:"EN 10025", properties:[{label:"Akma Gerilmesi",value:355,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:"490–630",unit:"MPa"},{label:"Min. Uzama",value:22,unit:"%"},{label:"Elastisite Modülü",value:210000,unit:"MPa"},{label:"Yoğunluk",value:7850,unit:"kg/m³"}], note:"Yüksek mukavemetli yapısal çelik, yaygın kullanım"},
    { id:"c45",  name:"C45",          category:"malzeme", subcategory:"Makine Çeliği",  tags:["çelik","c45","makine","mil","dişli"], standard:"EN 10083", properties:[{label:"Akma Gerilmesi (N)",value:370,unit:"MPa",highlight:true},{label:"Akma Gerilmesi (QT)",value:490,unit:"MPa"},{label:"Çekme Dayanımı",value:"650–800",unit:"MPa"},{label:"Sertlik (HB)",value:"170–210",unit:"HB"},{label:"Elastisite Modülü",value:210000,unit:"MPa"}], note:"Mil, dişli, kam — ısıl işlem uygulanabilir"},
    { id:"42crmo4", name:"42CrMo4",   category:"malzeme", subcategory:"Makine Çeliği",  tags:["çelik","42crmo4","alaşımlı","yüksek mukavemet","mil"], standard:"EN 10083", properties:[{label:"Akma Gerilmesi (QT)",value:650,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:"900–1100",unit:"MPa"},{label:"Sertlik (HB)",value:"250–300",unit:"HB"},{label:"Darbe Dayanımı",value:50,unit:"J"}], note:"Kritik yüklü miller, şaftlar"},
    { id:"aisi304", name:"AISI 304 (Paslanmaz)", category:"malzeme", subcategory:"Paslanmaz Çelik", tags:["paslanmaz","304","korozyon","inox"], standard:"EN 1.4301", properties:[{label:"Akma Gerilmesi",value:205,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:515,unit:"MPa"},{label:"Uzama",value:40,unit:"%"},{label:"Yoğunluk",value:7900,unit:"kg/m³"},{label:"Maks. Çalışma Sıcaklığı",value:925,unit:"°C"}], note:"Gıda, kimya, mimari uygulamalar"},
  ];
  
  // ─── BETON SINIFLARI ──────────────────────────────────────────
  
  const concreteGrades: MaterialEntry[] = [
    { id:"c16", name:"C16/20", category:"malzeme", subcategory:"Beton", tags:["beton","c16","düşük dayanım"], standard:"TS EN 206", properties:[{label:"Karakteristik Dayanım (fck)",value:16,unit:"MPa",highlight:true},{label:"Silindir Dayanımı",value:16,unit:"MPa"},{label:"Küp Dayanımı",value:20,unit:"MPa"},{label:"Çekme Dayanımı (fctm)",value:1.9,unit:"MPa"},{label:"E Modülü",value:27500,unit:"MPa"},{label:"Birim Hacim Ağırlığı",value:2500,unit:"kg/m³"}], note:"Grobeton, temel dolgusu"},
    { id:"c20", name:"C20/25", category:"malzeme", subcategory:"Beton", tags:["beton","c20","yaygın"], standard:"TS EN 206", properties:[{label:"Karakteristik Dayanım (fck)",value:20,unit:"MPa",highlight:true},{label:"Küp Dayanımı",value:25,unit:"MPa"},{label:"Çekme Dayanımı (fctm)",value:2.2,unit:"MPa"},{label:"E Modülü",value:29000,unit:"MPa"},{label:"Birim Hacim Ağırlığı",value:2500,unit:"kg/m³"}], note:"Hafif yüklü döşeme ve kirişler"},
    { id:"c25", name:"C25/30", category:"malzeme", subcategory:"Beton", tags:["beton","c25","yaygın","deprem"], standard:"TS EN 206", properties:[{label:"Karakteristik Dayanım (fck)",value:25,unit:"MPa",highlight:true},{label:"Küp Dayanımı",value:30,unit:"MPa"},{label:"Çekme Dayanımı (fctm)",value:2.6,unit:"MPa"},{label:"E Modülü",value:30500,unit:"MPa"},{label:"Birim Hacim Ağırlığı",value:2500,unit:"kg/m³"}], note:"Konut ve ofis yapıları — en yaygın sınıf"},
    { id:"c30", name:"C30/37", category:"malzeme", subcategory:"Beton", tags:["beton","c30","yüksek dayanım","deprem"], standard:"TS EN 206", properties:[{label:"Karakteristik Dayanım (fck)",value:30,unit:"MPa",highlight:true},{label:"Küp Dayanımı",value:37,unit:"MPa"},{label:"Çekme Dayanımı (fctm)",value:2.9,unit:"MPa"},{label:"E Modülü",value:32000,unit:"MPa"},{label:"Birim Hacim Ağırlığı",value:2500,unit:"kg/m³"}], note:"Deprem bölgesi yapıları, köprüler"},
    { id:"c35", name:"C35/45", category:"malzeme", subcategory:"Beton", tags:["beton","c35","yüksek dayanım"], standard:"TS EN 206", properties:[{label:"Karakteristik Dayanım (fck)",value:35,unit:"MPa",highlight:true},{label:"Küp Dayanımı",value:45,unit:"MPa"},{label:"Çekme Dayanımı (fctm)",value:3.2,unit:"MPa"},{label:"E Modülü",value:33500,unit:"MPa"}], note:"Yüksek katlı yapılar, köprü temelleri"},
    { id:"c40", name:"C40/50", category:"malzeme", subcategory:"Beton", tags:["beton","c40","yüksek performans"], standard:"TS EN 206", properties:[{label:"Karakteristik Dayanım (fck)",value:40,unit:"MPa",highlight:true},{label:"Küp Dayanımı",value:50,unit:"MPa"},{label:"Çekme Dayanımı (fctm)",value:3.5,unit:"MPa"},{label:"E Modülü",value:35000,unit:"MPa"}], note:"Endüstriyel yapılar, ön gerilmeli elemanlar"},
  ];
  
  // ─── DONATI ÇELİĞİ ───────────────────────────────────────────
  
  const rebarData: MaterialEntry[] = [
    { id:"b420c", name:"B420C (S420)", category:"malzeme", subcategory:"Donatı", tags:["donatı","betonarme","b420","s420","yaygın"], standard:"TS 708", properties:[{label:"Akma Gerilmesi",value:420,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:500,unit:"MPa"},{label:"Min. Uzama",value:12,unit:"%"},{label:"Elastisite Modülü",value:200000,unit:"MPa"},{label:"Yoğunluk",value:7850,unit:"kg/m³"}], note:"Türkiye'de en yaygın betonarme donatısı"},
    { id:"b500c", name:"B500C (S500)", category:"malzeme", subcategory:"Donatı", tags:["donatı","betonarme","b500","s500","yüksek mukavemet"], standard:"TS 708", properties:[{label:"Akma Gerilmesi",value:500,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:575,unit:"MPa"},{label:"Min. Uzama",value:10,unit:"%"},{label:"Elastisite Modülü",value:200000,unit:"MPa"}], note:"Deprem bölgesi yapıları için önerilen"},
  ];
  
  // ─── KABLO KATEKTİFLERİ ───────────────────────────────────────
  
  const cableData: MaterialEntry[] = [
    { id:"nyy1x1.5",  name:"NYY 1×1.5",  category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","pvc","güç"], standard:"IEC 60228", properties:[{label:"Kesit",value:1.5,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:18,unit:"A"},{label:"Max. Akım (toprak)",value:14,unit:"A"},{label:"Direnç (20°C)",value:12.1,unit:"Ω/km"},{label:"Dış Çap",value:7.2,unit:"mm"},{label:"Ağırlık",value:60,unit:"kg/km"}]},
    { id:"nyy1x2.5",  name:"NYY 1×2.5",  category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç","yaygın"], standard:"IEC 60228", properties:[{label:"Kesit",value:2.5,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:24,unit:"A"},{label:"Max. Akım (toprak)",value:19,unit:"A"},{label:"Direnç (20°C)",value:7.41,unit:"Ω/km"},{label:"Dış Çap",value:8.2,unit:"mm"},{label:"Ağırlık",value:80,unit:"kg/km"}]},
    { id:"nyy1x4",    name:"NYY 1×4",    category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç"], standard:"IEC 60228", properties:[{label:"Kesit",value:4,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:32,unit:"A"},{label:"Max. Akım (toprak)",value:25,unit:"A"},{label:"Direnç (20°C)",value:4.61,unit:"Ω/km"},{label:"Dış Çap",value:9.2,unit:"mm"},{label:"Ağırlık",value:106,unit:"kg/km"}]},
    { id:"nyy1x6",    name:"NYY 1×6",    category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç"], standard:"IEC 60228", properties:[{label:"Kesit",value:6,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:41,unit:"A"},{label:"Max. Akım (toprak)",value:32,unit:"A"},{label:"Direnç (20°C)",value:3.08,unit:"Ω/km"},{label:"Dış Çap",value:10.2,unit:"mm"}]},
    { id:"nyy1x10",   name:"NYY 1×10",   category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç","orta gerilim"], standard:"IEC 60228", properties:[{label:"Kesit",value:10,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:55,unit:"A"},{label:"Max. Akım (toprak)",value:44,unit:"A"},{label:"Direnç (20°C)",value:1.83,unit:"Ω/km"},{label:"Dış Çap",value:12.0,unit:"mm"}]},
    { id:"nyy1x16",   name:"NYY 1×16",   category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç"], standard:"IEC 60228", properties:[{label:"Kesit",value:16,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:72,unit:"A"},{label:"Max. Akım (toprak)",value:57,unit:"A"},{label:"Direnç (20°C)",value:1.15,unit:"Ω/km"},{label:"Dış Çap",value:13.7,unit:"mm"}]},
    { id:"nyy1x25",   name:"NYY 1×25",   category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç","sanayi"], standard:"IEC 60228", properties:[{label:"Kesit",value:25,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:92,unit:"A"},{label:"Max. Akım (toprak)",value:73,unit:"A"},{label:"Direnç (20°C)",value:0.727,unit:"Ω/km"},{label:"Dış Çap",value:16.0,unit:"mm"}]},
    { id:"nyy1x35",   name:"NYY 1×35",   category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç","sanayi"], standard:"IEC 60228", properties:[{label:"Kesit",value:35,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:112,unit:"A"},{label:"Max. Akım (toprak)",value:88,unit:"A"},{label:"Direnç (20°C)",value:0.524,unit:"Ω/km"},{label:"Dış Çap",value:17.8,unit:"mm"}]},
    { id:"nyy1x50",   name:"NYY 1×50",   category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç","sanayi"], standard:"IEC 60228", properties:[{label:"Kesit",value:50,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:135,unit:"A"},{label:"Max. Akım (toprak)",value:107,unit:"A"},{label:"Direnç (20°C)",value:0.387,unit:"Ω/km"},{label:"Dış Çap",value:20.5,unit:"mm"}]},
    { id:"nyy1x70",   name:"NYY 1×70",   category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç","yüksek akım"], standard:"IEC 60228", properties:[{label:"Kesit",value:70,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:168,unit:"A"},{label:"Max. Akım (toprak)",value:133,unit:"A"},{label:"Direnç (20°C)",value:0.268,unit:"Ω/km"},{label:"Dış Çap",value:23.0,unit:"mm"}]},
    { id:"nyy1x95",   name:"NYY 1×95",   category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç","yüksek akım"], standard:"IEC 60228", properties:[{label:"Kesit",value:95,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:200,unit:"A"},{label:"Max. Akım (toprak)",value:159,unit:"A"},{label:"Direnç (20°C)",value:0.193,unit:"Ω/km"},{label:"Dış Çap",value:25.9,unit:"mm"}]},
    { id:"nyy1x120",  name:"NYY 1×120",  category:"kablo", subcategory:"Güç Kablosu", tags:["kablo","nyy","bakır","güç","trafo","yüksek akım"], standard:"IEC 60228", properties:[{label:"Kesit",value:120,unit:"mm²",highlight:true},{label:"Max. Akım (hava)",value:230,unit:"A"},{label:"Max. Akım (toprak)",value:183,unit:"A"},{label:"Direnç (20°C)",value:0.153,unit:"Ω/km"},{label:"Dış Çap",value:28.5,unit:"mm"}]},
  ];
  
  // ─── CİVATA & FLANŞ ───────────────────────────────────────────
  
  const boltData: MaterialEntry[] = [
    { id:"m8-88",  name:"M8 — 8.8 Sınıfı",  category:"bağlantı", subcategory:"Civata", tags:["civata","m8","8.8","çelik bağlantı"], standard:"ISO 898-1", properties:[{label:"Anma Çapı",value:8,unit:"mm",highlight:true},{label:"Sınıf",value:"8.8"},{label:"Akma Gerilmesi",value:640,unit:"MPa"},{label:"Çekme Dayanımı",value:800,unit:"MPa"},{label:"Somunla Kullanım Adımı",value:1.25,unit:"mm"},{label:"Anahtar Genişliği (SW)",value:13,unit:"mm"}]},
    { id:"m10-88", name:"M10 — 8.8 Sınıfı", category:"bağlantı", subcategory:"Civata", tags:["civata","m10","8.8","çelik bağlantı"], standard:"ISO 898-1", properties:[{label:"Anma Çapı",value:10,unit:"mm",highlight:true},{label:"Sınıf",value:"8.8"},{label:"Akma Gerilmesi",value:640,unit:"MPa"},{label:"Çekme Dayanımı",value:800,unit:"MPa"},{label:"Adım",value:1.5,unit:"mm"},{label:"Anahtar Genişliği (SW)",value:17,unit:"mm"}]},
    { id:"m12-88", name:"M12 — 8.8 Sınıfı", category:"bağlantı", subcategory:"Civata", tags:["civata","m12","8.8","yaygın"], standard:"ISO 898-1", properties:[{label:"Anma Çapı",value:12,unit:"mm",highlight:true},{label:"Sınıf",value:"8.8"},{label:"Akma Gerilmesi",value:640,unit:"MPa"},{label:"Çekme Dayanımı",value:800,unit:"MPa"},{label:"Adım",value:1.75,unit:"mm"},{label:"Anahtar Genişliği (SW)",value:19,unit:"mm"}]},
    { id:"m16-88", name:"M16 — 8.8 Sınıfı", category:"bağlantı", subcategory:"Civata", tags:["civata","m16","8.8","yaygın"], standard:"ISO 898-1", properties:[{label:"Anma Çapı",value:16,unit:"mm",highlight:true},{label:"Sınıf",value:"8.8"},{label:"Akma Gerilmesi",value:640,unit:"MPa"},{label:"Çekme Dayanımı",value:800,unit:"MPa"},{label:"Adım",value:2.0,unit:"mm"},{label:"Anahtar Genişliği (SW)",value:24,unit:"mm"}]},
    { id:"m20-109",name:"M20 — 10.9 Sınıfı",category:"bağlantı", subcategory:"Civata", tags:["civata","m20","10.9","yüksek mukavemet"], standard:"ISO 898-1", properties:[{label:"Anma Çapı",value:20,unit:"mm",highlight:true},{label:"Sınıf",value:"10.9"},{label:"Akma Gerilmesi",value:900,unit:"MPa"},{label:"Çekme Dayanımı",value:1000,unit:"MPa"},{label:"Adım",value:2.5,unit:"mm"},{label:"Anahtar Genişliği (SW)",value:30,unit:"mm"}]},
  ];
  
  // ─── ALÜMİNYUM ────────────────────────────────────────────────
  
  const aluminumData: MaterialEntry[] = [
    { id:"al6061", name:"Al 6061-T6", category:"malzeme", subcategory:"Alüminyum", tags:["alüminyum","6061","t6","hafif","profil"], standard:"ASTM B221", properties:[{label:"Akma Gerilmesi",value:276,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:310,unit:"MPa"},{label:"Uzama",value:12,unit:"%"},{label:"Yoğunluk",value:2700,unit:"kg/m³"},{label:"E Modülü",value:68900,unit:"MPa"},{label:"Isıl İletkenlik",value:167,unit:"W/m·K"}], note:"Yapısal alüminyum profillerde en yaygın"},
    { id:"al7075", name:"Al 7075-T6", category:"malzeme", subcategory:"Alüminyum", tags:["alüminyum","7075","yüksek mukavemet","havacılık"], standard:"ASTM B211", properties:[{label:"Akma Gerilmesi",value:503,unit:"MPa",highlight:true},{label:"Çekme Dayanımı",value:572,unit:"MPa"},{label:"Uzama",value:11,unit:"%"},{label:"Yoğunluk",value:2810,unit:"kg/m³"},{label:"E Modülü",value:71700,unit:"MPa"}], note:"Havacılık, savunma, yüksek yük"},
  ];
  
  // ─── TÜM VERİTABANI ──────────────────────────────────────────
  
  export const ALL_MATERIALS: MaterialEntry[] = [
    ...ipeData,
    ...heaData,
    ...steelGrades,
    ...concreteGrades,
    ...rebarData,
    ...cableData,
    ...boltData,
    ...aluminumData,
  ];
  
  export const CATEGORIES = [
    { value: "hepsi",    label: "Tümü",             count: ALL_MATERIALS.length },
    { value: "profil",   label: "Çelik Profiller",  count: ALL_MATERIALS.filter(m=>m.category==="profil").length },
    { value: "malzeme",  label: "Malzemeler",       count: ALL_MATERIALS.filter(m=>m.category==="malzeme").length },
    { value: "kablo",    label: "Kablo & İletken",  count: ALL_MATERIALS.filter(m=>m.category==="kablo").length },
    { value: "bağlantı", label: "Bağlantı Elemanı", count: ALL_MATERIALS.filter(m=>m.category==="bağlantı").length },
  ];
  
  export const SUBCATEGORIES: Record<string, string[]> = {
    profil:   ["IPE", "HEA"],
    malzeme:  ["Yapısal Çelik", "Makine Çeliği", "Paslanmaz Çelik", "Beton", "Donatı", "Alüminyum"],
    kablo:    ["Güç Kablosu"],
    bağlantı: ["Civata"],
  };