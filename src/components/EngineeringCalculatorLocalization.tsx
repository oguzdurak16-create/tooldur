'use client';

import { ReactNode, useEffect } from 'react';
import type { Locale } from '@/lib/siteLanguage';

type Dict = Record<string, string>;

type Props = {
  slug: string;
  locale?: Locale;
  children: ReactNode;
};

const COMMON: Dict = {
  'Hesapla': 'Calculate',
  'Sonuç': 'Result',
  'Sonuçlar': 'Results',
  'Malzeme': 'Material',
  'Güvenlik Katsayısı': 'Safety factor',
  'Sıcaklık (°C)': 'Temperature (°C)',
  'Durum': 'Status',
  'Uygun': 'Acceptable',
  'UYGUNSUZ': 'UNACCEPTABLE',
  'Yetersiz': 'Insufficient',
  'Güvenli': 'Safe',
  'Kritik uygulama': 'Critical application',
  'Yüksek risk': 'High risk',
  'Düşük risk': 'Low risk',
  'Çok düşük risk': 'Very low risk',
  'Standart': 'Standard',
  'Normal': 'Normal',
  'Öneri:': 'Recommendation:',
  'Örn:': 'Ex:',
  'örn.': 'e.g.',
  'Kopyala': 'Copy',
  'Teknik Çizim': 'Technical drawing',
  'SVG İndir': 'Download SVG',
};

const PUMP: Dict = {
  'Dalgıç Pompa Hesaplama Programı': 'Pump Power Calculator',
  'Debi, toplam basma yüksekliği, pompa verimi ve sıvı yoğunluğuna göre hidrolik güç, mil gücü ve standart motor kW ön seçimini hesaplayın.': 'Calculate hydraulic power, shaft power and a preliminary standard motor size from flow rate, total head, pump efficiency and fluid density.',
  'Toplam basma yüksekliğini gir': 'Enter total head',
  'Bileşenlerden hesapla': 'Calculate from components',
  'Debi Q (m³/h)': 'Flow rate Q (m³/h)',
  'Toplam Basma Yüksekliği H (mSS)': 'Total head H (mWC)',
  'Statik yükseklik (m)': 'Static head (m)',
  'Boru ve armatür kayıpları (m)': 'Pipe and fitting losses (m)',
  'Çıkışta gerekli basınç (bar)': 'Required outlet pressure (bar)',
  'Pompa Tipi': 'Pump type',
  'Pompa Verimi η (%)': 'Pump efficiency η (%)',
  'Tipik başlangıç aralığı:': 'Typical initial range:',
  'Sıvı': 'Fluid',
  'Yoğunluk ρ (kg/m³)': 'Density ρ (kg/m³)',
  'Seçilen yoğunluk': 'Selected density',
  'Motor emniyet payı (%)': 'Motor safety margin (%)',
  'Motor verimi (%)': 'Motor efficiency (%)',
  'Pompa gücü P = ρ·g·Q·H / η bağıntısıyla hesaplanır.': 'Pump power is calculated using P = ρ·g·Q·H / η.',
  'Kuyu derinliği tek başına toplam basma yüksekliği değildir. Dinamik su seviyesi, çıkış kotu, boru kayıpları ve istenen çıkış basıncı birlikte hesaba katılmalıdır.': 'Well depth alone is not the total head. Dynamic water level, discharge elevation, pipe losses and required outlet pressure must be considered together.',
  'Dalgıç pompa güç ve motor sonucu': 'Pump power and motor result',
  'Statik yükseklik': 'Static head',
  'Hat kayıpları': 'Line losses',
  'Basınç karşılığı': 'Pressure head',
  'Toplam basma H': 'Total head H',
  'Hidrolik güç': 'Hydraulic power',
  'Pompa mil gücü': 'Pump shaft power',
  'Paylı gerekli motor': 'Required motor with margin',
  'Önerilen standart motor': 'Recommended standard motor',
  'Tahmini elektrik giriş gücü': 'Estimated electrical input power',
  'Motor verimi:': 'Motor efficiency:',
  'Debi dönüşümü': 'Flow conversion',
  'Pompa eğrisi ve motor seçimi notu': 'Pump curve and motor selection note',
  'Standart motor sonucu ön seçimdir. Nihai pompa modeli; üreticinin Q-H eğrisi, çalışma noktası, NPSH şartı, kuyu soğutması, kablo gerilim düşümü ve yol verme yöntemiyle doğrulanmalıdır.': 'The standard motor result is preliminary. Verify the final pump model using the manufacturer Q-H curve, duty point, NPSH requirement, well cooling, cable voltage drop and starting method.',
  'Dalgıç pompa hesabında gerekli bilgiler': 'Required data for pump calculation',
  'Debi:': 'Flow rate:',
  'İhtiyaç duyulan su miktarı.': 'Required fluid quantity.',
  'Toplam basma:': 'Total head:',
  'statik kot farkı, hat kayıpları ve çıkış basıncının toplamıdır.': 'the sum of static elevation difference, line losses and outlet pressure.',
  'Verim:': 'Efficiency:',
  'Gerçek pompa eğrisindeki çalışma noktasından alınmalıdır. Tahmini verim yalnız ilk motor gücü kontrolü içindir.': 'Use the value at the duty point on the actual pump curve. Estimated efficiency is only for an initial motor-power check.',
  'Santrifüj Pompa': 'Centrifugal pump',
  'Dalgıç Pompa': 'Submersible pump',
  'Dişli Pompa (PD)': 'Gear pump (PD)',
  'Pistonlu Pompa': 'Piston pump',
  'Vidalı Pompa': 'Screw pump',
  'Su (20°C)': 'Water (20°C)',
  'Deniz Suyu': 'Seawater',
  'Dizel Yakıt': 'Diesel fuel',
  'Hidrolik Yağ': 'Hydraulic oil',
  'Süt': 'Milk',
  'Özel (yoğunluk gir)': 'Custom (enter density)',
};

const WELD: Dict = {
  'Kaynak Tipi': 'Weld type',
  'Alın Kaynağı (Butt Weld)': 'Butt weld',
  'Köşe Kaynağı (Fillet Weld)': 'Fillet weld',
  'Elektrot': 'Electrode',
  'Levha Kalınlığı t (mm)': 'Plate thickness t (mm)',
  'Boğaz Kalınlığı a (mm)': 'Throat thickness a (mm)',
  'Dikiş Uzunluğu L (mm)': 'Weld length L (mm)',
  'Uygulanan Kuvvet F (kN)': 'Applied force F (kN)',
  'Güvenlik Katsayısı γM2': 'Safety factor γM2',
  'için kaynak kesit alanı ve taşıma kapasitesi hesaplanır.': 'weld area and load capacity are calculated.',
  'Bu araç ön kontrol içindir. Nihai değerlendirmede yük yönü, birleşim detayı, kaynak sınıfı ve standart kontroller ayrıca yapılmalıdır.': 'This tool is for preliminary checks. Load direction, joint detail, weld class and code checks must be evaluated separately in the final design.',
  'Kaynak Dikişi Kontrolü': 'Weld check',
  'GÜVENLİ': 'SAFE',
  'YETERSİZ': 'INSUFFICIENT',
  'Dikiş Kesit Alanı A_w': 'Effective weld area A_w',
  'Normal Gerilme σ': 'Normal stress σ',
  'Kayma Gerilmesi τ': 'Shear stress τ',
  'Dikiş Kapasitesi F_Rd': 'Weld capacity F_Rd',
  'Kullanım Oranı': 'Utilization ratio',
  'EN 1993-1-8 Notu': 'EN 1993-1-8 note',
  'Köşe kaynaklarında boğaz kalınlığı a, dikiş kenar ölçüsünün yaklaşık 0.7 katı alınır. Çift taraflı dikişlerde toplam alan iki katına çıkar. Bu hesap basitleştirilmiş yöntemle yapılmıştır; detaylı yöntemde yönlü gerilme bileşenleri ayrıca kontrol edilir.': 'For fillet welds, throat thickness a is approximately 0.7 times the weld leg size. The total area doubles for double-sided welds. This calculation uses a simplified method; directional stress components must also be checked in the detailed method.',
  'Kaynak dikişi hesabı hakkında': 'About weld calculation',
  'Bu araç alın ve köşe kaynaklarında etkin kaynak alanına göre yaklaşık taşıma kapasitesini ve kullanım oranını hesaplar.': 'This tool estimates capacity and utilization from the effective weld area for butt and fillet welds.',
  'Sık aramalar:': 'Common searches:',
  'kaynak dikişi hesaplama': 'weld calculation',
  'köşe kaynağı kapasitesi': 'fillet weld capacity',
  'alın kaynağı gerilme hesabı': 'butt weld stress calculation',
  'en 1993 kaynak kontrolü': 'EN 1993 weld check',
};

const SHAFT: Dict = {
  'Ne Hesaplanacak?': 'What should be calculated?',
  'Mil Çapı (d)': 'Shaft diameter (d)',
  'Max. Tork (T)': 'Maximum torque (T)',
  'Gerilme (τ)': 'Stress (τ)',
  'Tork (Nm)': 'Torque (Nm)',
  'Mil Çapı (mm)': 'Shaft diameter (mm)',
  'Statik yük': 'Static load',
  'Değişken yük': 'Variable load',
  'Darbe yükü': 'Impact load',
  'İzin verilen kayma gerilmesi, yaklaşık olarak': 'Allowable shear stress is approximated by',
  'bağıntısıyla alınır.': '.',
  'Bu araç dolu dairesel miller için torsiyon altında hızlı ön kontrol sağlar. Nihai tasarımda yorulma, çentik etkisi, kama kanalı ve birleşik yüklemeler ayrıca değerlendirilmelidir.': 'This tool provides a quick torsional check for solid circular shafts. Fatigue, notch effects, keyways and combined loading must be considered in the final design.',
  'Min. mil çapı:': 'Minimum shaft diameter:',
  'Max. taşıyabileceği tork:': 'Maximum transmissible torque:',
  'Kayma gerilmesi:': 'Shear stress:',
  'Hesaplanan değeri standart mil çapına yuvarlayın. Yaygın çaplar:': 'Round the calculated value up to a standard shaft diameter. Common diameters:',
  'İzin Verilen τ': 'Allowable τ',
  '✓ Güvenli': '✓ Safe',
  '✗ Yetersiz': '✗ Insufficient',
  'Mil Mukavemet Formülleri': 'Shaft strength formulas',
  'Kayma Gerilmesi': 'Shear stress',
  'Min. Çap': 'Minimum diameter',
  'İzin Verilen Kayma': 'Allowable shear stress',
  'Polar Atalet Momenti': 'Polar moment of inertia',
  'Mil mukavemeti hesabı hakkında': 'About shaft strength calculation',
  'Mil Mukavemeti': 'Shaft strength',
  'Isıl işlemsiz': 'Untreated',
  'Isıl işlemli': 'Heat treated',
};

const BELT: Dict = {
  'Kayış Kasnak Hesaplama': 'Belt and Pulley Calculator',
  'Çevrim oranı, çıkış devri, kayış hızı, kayış uzunluğu ve önerilen kayış sayısını hesaplayın.': 'Calculate transmission ratio, output speed, belt speed, belt length and recommended belt quantity.',
  'Tahrik Kasnağı Çapı d₁ (mm)': 'Driver pulley diameter d₁ (mm)',
  'Tahrikli Kasnak Çapı d₂ (mm)': 'Driven pulley diameter d₂ (mm)',
  'Motor Devri n₁ (rpm)': 'Motor speed n₁ (rpm)',
  'Merkez Mesafesi C (mm)': 'Center distance C (mm)',
  'İletilen Güç (kW)': 'Transmitted power (kW)',
  'Kayış Tipi': 'Belt type',
  'Seçilen seri:': 'Selected series:',
  'Bu araç V-kayış transmisyonlarında ön boyutlandırma ve hızlı kontrol için uygundur. Nihai seçimde üretici katalogları ve servis faktörleri ayrıca dikkate alınmalıdır.': 'This tool is suitable for preliminary sizing and quick checks of V-belt drives. Manufacturer catalogs and service factors must be considered for final selection.',
  'Kayış-Kasnak Hesap Sonucu': 'Belt and pulley result',
  'Çevrim Oranı i': 'Transmission ratio i',
  'Çıkış Devri n₂': 'Output speed n₂',
  'Kayış Hızı v': 'Belt speed v',
  'Kayış Uzunluğu L': 'Belt length L',
  'Sarım Açısı α₁': 'Wrap angle α₁',
  'Önerilen Kayış Sayısı': 'Recommended belt quantity',
  'adet': 'pcs',
  'Kayış Hızı Uyarısı': 'Belt speed warning',
  'V-kayış hızı genelde': 'V-belt speed should generally not exceed',
  'değerini aşmamalıdır.': '.',
  'Mevcut hız': 'Current speed',
  'sınır aşılıyor.': 'limit exceeded.',
  'Sarım açısı': 'Wrap angle',
  'altına düşmemelidir.': 'should not fall below.',
  'yetersiz.': 'insufficient.',
  'Kayış kasnak hesabı hakkında': 'About belt and pulley calculation',
  'Bu araç kasnak çapları, motor devri ve merkez mesafesine göre çevrim oranı, çıkış devri ve kayış uzunluğu hesabı yapar.': 'This tool calculates transmission ratio, output speed and belt length from pulley diameters, motor speed and center distance.',
  'kayış kasnak hesaplama': 'belt and pulley calculation',
  'v kayışı boy hesabı': 'V-belt length calculation',
  'kasnak çevrim oranı': 'pulley transmission ratio',
  'kayış uzunluğu formülü': 'belt length formula',
  'Sonuçlar yaklaşık ön seçim içindir. Nihai uygulamada servis faktörü, kayma etkisi, kayış üretici tabloları ve gerçek standart boylar ayrıca kontrol edilmelidir.': 'Results are for preliminary selection. Service factor, slip, manufacturer tables and actual standard belt lengths must be checked for the final application.',
};

const PIPE: Dict = {
  'Boru Et Kalınlığı Hesaplama': 'Pipe Wall Thickness Calculator',
  'Barlow formülüne göre minimum et kalınlığı veya mevcut et kalınlığına göre basınç kapasitesi hesaplayın.': 'Calculate minimum wall thickness using the Barlow equation or pressure capacity from an existing wall thickness.',
  'Hesaplama Modu': 'Calculation mode',
  'Et Kalınlığı Bul': 'Find wall thickness',
  'Basınç Kapasitesi': 'Pressure capacity',
  'DN Nominal Çap': 'DN nominal diameter',
  '— Manuel giriş —': '— Manual entry —',
  'Dış Çap — D (mm)': 'Outer diameter — D (mm)',
  'Mevcut Et Kalınlığı — t (mm)': 'Existing wall thickness — t (mm)',
  'Tasarım Basıncı (bar)': 'Design pressure (bar)',
  'Karbon Çeliği (ASTM A53)': 'Carbon steel (ASTM A53)',
  'Paslanmaz Çelik 304': 'Stainless steel 304',
  'Yüksek Mukavemetli Çelik': 'High-strength steel',
  'Dökme Demir': 'Cast iron',
  'Bakır (Cu)': 'Copper (Cu)',
  'Alüminyum 6061': 'Aluminum 6061',
  'Pirinç': 'Brass',
  'Seçilen malzeme:': 'Selected material:',
  'Gerilme değeri:': 'Allowable stress:',
  'Yüksek sıcaklıklarda dayanım lineer olarak azaltılır.': 'Strength is reduced linearly at elevated temperatures.',
  'Minimum Et Kalınlığı': 'Minimum wall thickness',
  'İzin Verilen Basınç': 'Allowable pressure',
  'Hesaplanan:': 'Calculated:',
  'Standart öneri:': 'Standard recommendation:',
  'UYGUNSUZ — et kalınlığı yetersiz': 'UNACCEPTABLE — insufficient wall thickness',
  'Minimum (ek güvenlik önerilir)': 'Minimum (additional margin recommended)',
  'Fazla güvenli (ekonomik değil)': 'Excessive margin (not economical)',
  'Dış Çap': 'Outer diameter',
  'İç Çap': 'Inner diameter',
  'Kullanılan Et Kalınlığı': 'Wall thickness used',
  'Birim Ağırlık': 'Weight per meter',
  'Metal Kesit Alanı': 'Metal cross-sectional area',
  'Akış Alanı': 'Flow area',
  'Barlow Formülü:': 'Barlow equation:',
  'Parametreleri girin ve': 'Enter the parameters and press',
  'butonuna basın.': '.',
  'Boru Kesit Görünüşü': 'Pipe cross-section view',
  'Boru et kalınlığı hesabı hakkında': 'About pipe wall thickness calculation',
  'Bu araç, boru dış çapı, tasarım basıncı, malzeme ve güvenlik katsayısına göre minimum et kalınlığını veya mevcut et kalınlığına göre izin verilen basıncı tahmin eder.': 'This tool estimates minimum wall thickness from pipe outside diameter, design pressure, material and safety factor, or allowable pressure from an existing wall thickness.',
  'boru et kalınlığı hesaplama': 'pipe wall thickness calculation',
  'barlow formülü': 'Barlow equation',
  'basınca göre boru seçimi': 'pipe selection by pressure',
  'boru basınç kapasitesi': 'pipe pressure capacity',
  'Basınç': 'Pressure',
  'Tasarım basıncı arttıkça gerekli et kalınlığı da artar.': 'Required wall thickness increases as design pressure increases.',
  'Çap': 'Diameter',
  'Aynı basınç altında daha büyük dış çap daha fazla et kalınlığı ister.': 'At the same pressure, a larger outside diameter requires a thicker wall.',
  'Güvenlik': 'Safety',
  'Yüksek güvenlik katsayısı daha emniyetli fakat daha ağır ve maliyetli seçim doğurur.': 'A higher safety factor produces a safer but heavier and more expensive selection.',
};

const DICTS: Record<string, Dict> = {
  'pompa-guc-hesaplama': PUMP,
  'kaynak-dikisi-hesaplama': WELD,
  'mil-mukavemet-hesaplama': SHAFT,
  'kayis-kasnak-hesaplama': BELT,
  'boru-eti-hesaplama': PIPE,
};

function preserveSpacing(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] || '';
  const trailing = original.match(/\s*$/)?.[0] || '';
  return `${leading}${translated}${trailing}`;
}

function normalizeEnglishNumbers(value: string) {
  let next = value;
  next = next.replace(/\b\d{1,3}(?:\.\d{3})+,\d+\b/g, (token) => {
    const normalized = token.replace(/\./g, '').replace(',', '.');
    const [integer, decimals] = normalized.split('.');
    return `${Number(integer).toLocaleString('en-US')}.${decimals}`;
  });
  next = next.replace(/\b\d{1,3}(?:\.\d{3})+\b/g, (token) => token.replace(/\./g, ','));
  next = next.replace(/(\d),(\d)/g, '$1.$2');
  next = next.replace(/%(\d+(?:\.\d+)?)/g, '$1%');
  return next;
}

function translateValue(value: string, dict: Dict) {
  const trimmed = value.trim();
  if (!trimmed) return value;

  let translated = dict[trimmed] || COMMON[trimmed] || trimmed;
  const entries = Object.entries({ ...COMMON, ...dict }).sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of entries) {
    if (source && translated.includes(source)) translated = translated.split(source).join(target);
  }

  translated = normalizeEnglishNumbers(translated);
  return preserveSpacing(value, translated);
}

function translateRoot(root: HTMLElement, dict: Dict) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || !node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  for (const node of textNodes) {
    const translated = translateValue(node.nodeValue || '', dict);
    if (translated !== node.nodeValue) node.nodeValue = translated;
  }

  root.querySelectorAll<HTMLElement>('[placeholder], [aria-label], [title]').forEach((element) => {
    for (const attribute of ['placeholder', 'aria-label', 'title']) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const translated = translateValue(value, dict);
      if (translated !== value) element.setAttribute(attribute, translated);
    }
  });
}

export default function EngineeringCalculatorLocalization({ slug, locale = 'tr', children }: Props) {
  useEffect(() => {
    if (locale !== 'en') return;
    const root = document.querySelector<HTMLElement>(`[data-engineering-localization="${slug}"]`);
    const dict = DICTS[slug];
    if (!root || !dict) return;

    let frame = 0;
    const run = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => translateRoot(root, dict));
    };

    run();
    const observer = new MutationObserver(run);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'aria-label', 'title'],
    });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [locale, slug]);

  return <div data-engineering-localization={slug}>{children}</div>;
}
