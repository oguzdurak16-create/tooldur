import { getToolBySlug } from '@/data/tools';

type Detail = { formula: string; metrics: [string, string, string]; scene: string };

const DETAILS: Record<string, Detail> = {
  'kablo-kesiti-hesaplama': { formula: 'A → I, ΔU, L', metrics: ['Akım', 'Hat uzunluğu', 'Önerilen kesit'], scene: 'cable' },
  'voltaj-dusumu-hesaplama': { formula: 'ΔU = 2 · L · I · ρ / A', metrics: ['Giriş gerilimi', 'Kablo kesiti', 'Gerilim düşümü'], scene: 'voltage' },
  'elektrik-fatura-hesaplama': { formula: 'Tutar = kWh × Tarife', metrics: ['Tüketim', 'Birim fiyat', 'Toplam tutar'], scene: 'meter' },
  'guc-faktoru-duzeltme': { formula: 'Qc = P · (tanφ₁ − tanφ₂)', metrics: ['Aktif güç', 'Mevcut cosφ', 'Kompanzasyon'], scene: 'wave' },
  'led-direnc-hesaplama': { formula: 'R = (Vs − Vf) / I', metrics: ['Besleme', 'LED gerilimi', 'Standart direnç'], scene: 'circuit' },
  'ohm-kanunu-hesaplama': { formula: 'V = I · R', metrics: ['Gerilim', 'Akım', 'Direnç'], scene: 'circuit' },
  'beton-miktari-hesaplama': { formula: 'V = L · W · H', metrics: ['Uzunluk', 'Kesit', 'Beton hacmi'], scene: 'concrete' },
  'demir-agirligi-hesaplama': { formula: 'm = ρ · πd²/4 · L', metrics: ['Donatı çapı', 'Toplam boy', 'Toplam ağırlık'], scene: 'rebar' },
  'celik-profil-agirligi': { formula: 'm = ρ · A · L', metrics: ['Profil tipi', 'Birim ağırlık', 'Toplam ağırlık'], scene: 'profile' },
  'tugla-hesaplama': { formula: 'Adet = Duvar alanı / Tuğla alanı', metrics: ['Duvar alanı', 'Derz payı', 'Tuğla adedi'], scene: 'brick' },
  'merdiven-hesaplama': { formula: '2h + b ≈ 63 cm', metrics: ['Kat yüksekliği', 'Rıht', 'Basamak sayısı'], scene: 'stairs' },
  'levha-agirlik-hesaplama': { formula: 'm = ρ · L · W · t', metrics: ['Malzeme', 'Plaka ölçüsü', 'Ağırlık'], scene: 'plate' },
  'baklavali-sac-agirlik-hesaplama': { formula: 'm = ρ · L · W · t · adet', metrics: ['Sac ölçüsü', 'Desen payı', 'Toplam ağırlık'], scene: 'diamond' },
  'iso-gecme-tolerans-hesaplama': { formula: 'Boşluk = Delik − Mil', metrics: ['Nominal çap', 'Delik toleransı', 'Geçme tipi'], scene: 'tolerance' },
  'kilavuz-matkap-hesaplama': { formula: 'Matkap ≈ D − P', metrics: ['Metrik diş', 'Hatve', 'Matkap çapı'], scene: 'tap' },
  'yuzey-puruzlulugu-rehberi': { formula: 'Ra ↔ Rz ↔ N sınıfı', metrics: ['Ra değeri', 'İmalat yöntemi', 'Teknik resim notu'], scene: 'roughness' },
  'teknik-resim-cagri-olusturucu': { formula: 'Ölçü + tolerans + proses notu', metrics: ['Özellik tipi', 'Standart', 'Kopyalanabilir çağrı'], scene: 'drawing' },
  'civata-sikma-torku-hesaplama': { formula: 'T = K · F · d', metrics: ['Cıvata çapı', 'Dayanım sınıfı', 'Sıkma torku'], scene: 'bolt' },
  'sac-bukum-acinim-hesaplama': { formula: 'BA = α·π·(R + Kt) / 180', metrics: ['Sac kalınlığı', 'Büküm açısı', 'Açınım boyu'], scene: 'bend' },
  'sac-bukum-kesim-hesaplayici': { formula: 'F = L · t · τ', metrics: ['Sac kalınlığı', 'Kesme boyu', 'Gerekli kuvvet'], scene: 'shear' },
  'tork-hesaplama': { formula: 'T = F · r', metrics: ['Uygulanan kuvvet', 'Kol boyu', 'Tork'], scene: 'torque' },
  'basinc-hesaplama': { formula: 'P = F / A', metrics: ['Kuvvet', 'Alan', 'Basınç'], scene: 'pressure' },
  'hiz-hesaplama': { formula: 'v = s / t', metrics: ['Mesafe', 'Zaman', 'Hız'], scene: 'speed' },
  'mil-mukavemet-hesaplama': { formula: 'τ = 16T / (πd³)', metrics: ['Tork', 'Emniyet katsayısı', 'Mil çapı'], scene: 'shaft' },
  'kama-kanali-hesaplama': { formula: 'DIN 6885 · d → b × h', metrics: ['Mil çapı', 'Kama ölçüsü', 'Kanal ölçüsü'], scene: 'keyway' },
  'uzunluk-birimi-cevirici': { formula: 'L₂ = L₁ · k', metrics: ['Metre', 'İnç / feet', 'Dönüşüm'], scene: 'convert' },
  'agirlik-birimi-cevirici': { formula: 'm₂ = m₁ · k', metrics: ['Kilogram', 'Pound / ons', 'Dönüşüm'], scene: 'scale' },
  'alan-birimi-cevirici': { formula: 'A₂ = A₁ · k²', metrics: ['Metrekare', 'Hektar / dönüm', 'Dönüşüm'], scene: 'area' },
  'hacim-birimi-cevirici': { formula: 'V₂ = V₁ · k³', metrics: ['Litre', 'Galon / m³', 'Dönüşüm'], scene: 'volume' },
  'sicaklik-birimi-cevirici': { formula: '°F = °C · 9/5 + 32', metrics: ['Celsius', 'Fahrenheit', 'Kelvin'], scene: 'temperature' },
  'basinc-birimi-cevirici': { formula: 'bar ↔ psi ↔ Pa', metrics: ['Bar', 'PSI / atm', 'Dönüşüm'], scene: 'gauge' },
  'yuzde-hesaplama': { formula: '% = Parça / Bütün · 100', metrics: ['Başlangıç', 'Değişim', 'Yüzde'], scene: 'percent' },
  'alan-hesaplama': { formula: 'A = Geometriye göre', metrics: ['Şekil', 'Boyutlar', 'Alan'], scene: 'area' },
  'hacim-hesaplama': { formula: 'V = Taban alanı · h', metrics: ['Cisim', 'Boyutlar', 'Hacim'], scene: 'volume' },
  'pisagor-teoremi': { formula: 'a² + b² = c²', metrics: ['Dik kenar a', 'Dik kenar b', 'Hipotenüs'], scene: 'triangle' },
  'disli-carki-hesaplama': { formula: 'i = z₂ / z₁', metrics: ['Modül', 'Diş sayısı', 'Çevrim oranı'], scene: 'gear' },
  'yay-hesaplama': { formula: 'k = Gd⁴ / (8D³n)', metrics: ['Tel çapı', 'Aktif sarım', 'Yay sabiti'], scene: 'spring' },
  'rulman-omru-hesaplama': { formula: 'L₁₀ = (C / P)ᵖ', metrics: ['Dinamik kapasite', 'Eşdeğer yük', 'L10 ömrü'], scene: 'bearing' },
  'viskozite-donusumu': { formula: 'ν = μ / ρ', metrics: ['Dinamik viskozite', 'Yoğunluk', 'Kinematik viskozite'], scene: 'fluid' },
  'guc-verim-hesaplama': { formula: 'η = Pçıkış / Pgiriş', metrics: ['Giriş gücü', 'Toplam verim', 'Çıkış gücü'], scene: 'power' },
  'termal-iletim-hesaplama': { formula: 'Q = k · A · ΔT / L', metrics: ['İletkenlik', 'Sıcaklık farkı', 'Isı geçişi'], scene: 'thermal' },
  'devir-frekans-donusumu': { formula: 'n = 60 · f', metrics: ['RPM', 'Frekans', 'Açısal hız'], scene: 'frequency' },
  'boru-eti-hesaplama': { formula: 't ≈ P · D / (2σ)', metrics: ['İç basınç', 'Boru çapı', 'Et kalınlığı'], scene: 'pipe' },
  'o-ring-kanali-hesaplama': { formula: 'Sıkma = (d − g) / d', metrics: ['Kord çapı', 'Kanal derinliği', 'Doluluk oranı'], scene: 'oring' },
  'isil-genlesme-hesaplama': { formula: 'ΔL = α · L · ΔT', metrics: ['Başlangıç boyu', 'Sıcaklık farkı', 'Genleşme'], scene: 'expansion' },
  'reynolds-sayisi-hesaplama': { formula: 'Re = ρ · v · D / μ', metrics: ['Akış hızı', 'Viskozite', 'Akış rejimi'], scene: 'flow' },
  'basincli-kap-cidar-kalinligi': { formula: 't ≈ P · D / (2S · E)', metrics: ['İç basınç', 'Kap çapı', 'Cidar kalınlığı'], scene: 'vessel' },
  'proje-yonetimi': { formula: 'Planla → Uygula → Tamamla', metrics: ['Görevler', 'Termin', 'İlerleme'], scene: 'kanban' },
  'oee-uretim-verimliligi-hesaplama': { formula: 'OEE = A · P · Q', metrics: ['Kullanılabilirlik', 'Performans', 'Kalite'], scene: 'factory' },
  'takt-suresi-kapasite-hesaplama': { formula: 'Takt = Net süre / Talep', metrics: ['Net çalışma', 'Müşteri talebi', 'Takt süresi'], scene: 'factory' },
  'molarite-seyreltme-hesaplama': { formula: 'C₁V₁ = C₂V₂', metrics: ['Stok derişim', 'Hedef derişim', 'Çözücü miktarı'], scene: 'chemistry' },
  'karbon-emisyonu-hesaplama': { formula: 'CO₂e = Aktivite · Emisyon faktörü', metrics: ['Enerji tüketimi', 'Emisyon faktörü', 'Toplam CO₂e'], scene: 'carbon' },
  'gunes-paneli-enerji-hesaplama': { formula: 'E = P · h · η', metrics: ['Panel gücü', 'Güneşlenme', 'Enerji üretimi'], scene: 'solar' },
  'api-sla-uptime-hesaplama': { formula: 'Kesinti = (1 − SLA) · Süre', metrics: ['SLA hedefi', 'Dönem', 'İzinli kesinti'], scene: 'server' },
  'pazaryeri-fiyat-hesaplama': { formula: 'Fiyat = Maliyet + gider + kâr', metrics: ['Komisyon', 'Kargo / reklam', 'Satış fiyatı'], scene: 'market' },
  'kdv-hesaplama': { formula: 'Brüt = Net · (1 + KDV)', metrics: ['Net tutar', 'KDV oranı', 'Brüt tutar'], scene: 'receipt' },
  'bmi-hesaplama': { formula: 'BMI = kg / m²', metrics: ['Boy', 'Kilo', 'BMI sınıfı'], scene: 'health' },
  'kira-artis-hesaplama': { formula: 'Yeni kira = Eski kira · (1 + oran)', metrics: ['Mevcut kira', 'Artış oranı', 'Yeni kira'], scene: 'rent' },
  'kredi-hesaplama': { formula: 'Taksit = P·r(1+r)ⁿ / ((1+r)ⁿ−1)', metrics: ['Kredi tutarı', 'Vade / faiz', 'Aylık taksit'], scene: 'credit' },
  'konik-hesaplama': { formula: 'tanθ = (D − d) / (2L)', metrics: ['Büyük çap', 'Küçük çap', 'Torna açısı'], scene: 'cone' },
  'kayis-kasnak-hesaplama': { formula: 'n₁D₁ = n₂D₂', metrics: ['Kasnak çapları', 'Giriş devri', 'Çıkış devri'], scene: 'belt' },
  'pompa-guc-hesaplama': { formula: 'P = ρ · g · Q · H / η', metrics: ['Debi', 'Basma yüksekliği', 'Motor gücü'], scene: 'pump' },
  'kaynak-dikisi-hesaplama': { formula: 'σ = F / (a · L)', metrics: ['Kaynak tipi', 'Yük', 'Gerekli dikiş'], scene: 'weld' },
};

const esc = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
const line = (d: string, accent: string, width = 8) => `<path d="${d}" stroke="${accent}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

function sceneSvg(scene: string, a: string) {
  const steel = '#94a3b8';
  const dark = '#111827';
  const pale = '#71859c';
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const wing = (side: number) => `${x2 - 23 * Math.cos(angle) + side * 13 * Math.sin(angle)} ${y2 - 23 * Math.sin(angle) - side * 13 * Math.cos(angle)}`;
    return `${line(`M${x1} ${y1}L${x2} ${y2}`, a, 6)}<path d="M${wing(1)}L${x2} ${y2}L${wing(-1)}" stroke="${a}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  switch (scene) {
    case 'tolerance': return `<circle cx="225" cy="340" r="130" fill="${dark}" stroke="${steel}" stroke-width="34"/><circle cx="225" cy="340" r="64" fill="#05080d" stroke="${a}" stroke-width="8"/><rect x="410" y="292" width="245" height="96" rx="45" fill="${steel}"/><rect x="520" y="265" width="78" height="150" rx="25" fill="#64748b"/>${arrow(330,340,395,340)}<text x="170" y="535" fill="${a}" font-size="34">H7</text><text x="520" y="535" fill="${a}" font-size="34">g6</text>`;
    case 'tap': return `<path d="M170 190h80v65h-8v215l-32 50-32-50V255h-8z" fill="${steel}" stroke="${pale}" stroke-width="5"/><path d="M178 280l64 30-64 30 64 30-64 30 64 30-64 30" stroke="${a}" stroke-width="7" fill="none"/><path d="M390 190h240v320H390z" fill="${steel}" stroke="${pale}" stroke-width="5"/><path d="M465 190v245l45 35 45-35V190" fill="${dark}" stroke="${a}" stroke-width="7"/><path d="M450 220h30m60 0h30m-120 40h30m60 0h30m-120 40h30m60 0h30m-120 40h30m60 0h30m-120 40h30m60 0h30" stroke="${pale}" stroke-width="7"/><path d="M510 155v365" stroke="${a}" stroke-width="3" stroke-dasharray="12 10"/>${arrow(300,345,365,345)}<text x="430" y="565" fill="${a}" font-size="42" font-weight="700">D − P</text>`;
    case 'roughness': return `${line('M110 415 C160 250 205 510 260 320 S355 455 410 275 S510 475 570 300 S640 395 685 255',a,12)}<path d="M115 505h570M115 195h570" stroke="${steel}" stroke-width="5"/><text x="135" y="545" fill="${pale}" font-size="30">Ra</text><text x="610" y="545" fill="${a}" font-size="30">Rz</text>`;
    case 'drawing': return `<rect x="110" y="175" width="570" height="360" rx="16" fill="#f8fafc" opacity=".9"/><path d="M205 430h360V265H205zM265 430V265M505 430V265" stroke="#0f172a" stroke-width="8" fill="none"/><circle cx="385" cy="348" r="62" fill="none" stroke="#0f172a" stroke-width="8"/>${line('M160 235H620',a,7)}<text x="180" y="220" fill="#0f172a" font-size="24">Ø40 H7 · M10 × 1.5 · Ra 3.2</text>`;
    case 'circuit': case 'wave': return `<circle cx="180" cy="350" r="62" fill="${dark}" stroke="${a}" stroke-width="10"/><path d="M242 350h95l22-45 42 90 42-90 42 90 22-45h105" stroke="${pale}" stroke-width="10" fill="none"/><circle cx="625" cy="350" r="42" fill="${a}" opacity=".85"/><path d="M145 350h70M590 350h70" stroke="${a}" stroke-width="8"/><text x="145" y="465" fill="${a}" font-size="32">V</text><text x="590" y="465" fill="${a}" font-size="32">I</text>`;
    case 'concrete': return `<path d="M135 430l180-155 345 95-180 155z" fill="#64748b" stroke="${pale}" stroke-width="8"/><path d="M315 275v125l345-30M480 525V400L135 430" stroke="${a}" stroke-width="7"/><circle cx="250" cy="395" r="14" fill="${a}"/><circle cx="390" cy="432" r="14" fill="${a}"/><circle cx="525" cy="468" r="14" fill="${a}"/>`;
    case 'brick': return `${Array.from({length:4},(_,r)=>Array.from({length:5},(_,c)=>`<rect x="${120+c*112+(r%2)*-55}" y="${205+r*78}" width="104" height="68" rx="5" fill="${r%2?'#9a3412':'#7c2d12'}" stroke="${a}" stroke-width="4"/>`).join('')).join('')}`;
    case 'plate': case 'diamond': return `<path d="M155 360l150-150 350 70-150 150z" fill="${steel}" stroke="${pale}" stroke-width="5"/><path d="M155 360v22l350 70 150-150v-22L505 430z" fill="#475569" stroke="${pale}" stroke-width="5"/><path d="M155 422l350 70M505 492l150-150M155 405v34M505 475v34M655 325v34" stroke="${a}" stroke-width="5" fill="none"/><text x="315" y="492" fill="${a}" font-size="40">L</text><text x="610" y="450" fill="${a}" font-size="40">W</text>${scene === 'diamond' ? `<path d="M300 285l-18 20m68 4-18 20m68 4-18 20m68 4-18 20m-85-115-18 20m68 4-18 20m68 4-18 20m68 4-18 20" stroke="${pale}" stroke-width="9" stroke-linecap="round"/>` : ''}`;
    case 'torque': return `<circle cx="245" cy="355" r="112" fill="${dark}" stroke="${steel}" stroke-width="24"/><circle cx="245" cy="355" r="28" fill="${a}"/><path d="M245 355L610 245" stroke="${steel}" stroke-width="34" stroke-linecap="round"/>${arrow(610,245,610,440)}<path d="M155 355a90 90 0 0 1 105-87" stroke="${a}" stroke-width="10" fill="none"/><text x="135" y="455" fill="${a}" font-size="40">T</text><text x="625" y="425" fill="${a}" font-size="40">F</text>`;
    case 'pressure': case 'gauge': return `<circle cx="355" cy="345" r="175" fill="${dark}" stroke="${steel}" stroke-width="20"/><path d="M215 390a150 150 0 0 1 280-80" stroke="${a}" stroke-width="22" fill="none"/><path d="M355 345l95-82" stroke="${pale}" stroke-width="12"/><circle cx="355" cy="345" r="22" fill="${a}"/><text x="285" y="520" fill="${pale}" font-size="36">bar / psi</text>`;
    case 'speed': case 'frequency': return `<circle cx="355" cy="345" r="172" fill="${dark}" stroke="${steel}" stroke-width="20"/>${Array.from({length:9},(_,i)=>{const ang=(-135+i*33.75)*Math.PI/180;return `<line x1="${355+125*Math.cos(ang)}" y1="${345+125*Math.sin(ang)}" x2="${355+155*Math.cos(ang)}" y2="${345+155*Math.sin(ang)}" stroke="${a}" stroke-width="8"/>`}).join('')}<path d="M355 345l105-88" stroke="${pale}" stroke-width="12"/><circle cx="355" cy="345" r="22" fill="${a}"/><text x="300" y="515" fill="${a}" font-size="34">RPM</text>`;
    case 'keyway': return `<path d="M110 340h570" stroke="${steel}" stroke-width="110" stroke-linecap="round"/><rect x="320" y="250" width="145" height="90" rx="8" fill="#05080d" stroke="${a}" stroke-width="8"/><rect x="335" y="210" width="115" height="125" rx="8" fill="${a}" opacity=".7"/><path d="M320 185h145M320 170v30M465 170v30" stroke="${pale}" stroke-width="7"/>`;
    case 'convert': return `${arrow(150,285,610,285)}${arrow(610,425,150,425)}<rect x="125" y="235" width="145" height="90" rx="18" fill="${dark}" stroke="${steel}" stroke-width="7"/><rect x="490" y="385" width="145" height="90" rx="18" fill="${dark}" stroke="${steel}" stroke-width="7"/><text x="170" y="295" fill="${a}" font-size="32">SI</text><text x="525" y="445" fill="${a}" font-size="32">US</text>`;
    case 'scale': return `<path d="M350 190v310M210 245h280" stroke="${steel}" stroke-width="16"/><path d="M210 245l-90 185h180zM490 245l-90 185h180z" fill="${dark}" stroke="${a}" stroke-width="8"/><rect x="270" y="500" width="160" height="45" rx="12" fill="${a}"/>`;
    case 'area': return `<rect x="135" y="215" width="230" height="250" fill="${dark}" stroke="${a}" stroke-width="10"/><circle cx="520" cy="340" r="130" fill="${dark}" stroke="${steel}" stroke-width="10"/><path d="M135 510h230M110 215v250" stroke="${pale}" stroke-width="7"/><text x="205" y="560" fill="${a}" font-size="30">A</text>`;
    case 'volume': return `<path d="M180 250l220-75 220 75v245l-220 75-220-75z" fill="${dark}" stroke="${steel}" stroke-width="9"/><path d="M180 250l220 75 220-75M400 325v245" stroke="${a}" stroke-width="8"/><text x="365" y="520" fill="${a}" font-size="34">V</text>`;
    case 'percent': return `<circle cx="355" cy="350" r="180" fill="${dark}" stroke="${steel}" stroke-width="18"/><path d="M235 470L475 230" stroke="${a}" stroke-width="24"/><circle cx="255" cy="255" r="42" fill="none" stroke="${a}" stroke-width="18"/><circle cx="455" cy="445" r="42" fill="none" stroke="${a}" stroke-width="18"/>`;
    case 'power': return `<circle cx="235" cy="350" r="115" fill="${dark}" stroke="${steel}" stroke-width="20"/><circle cx="520" cy="350" r="150" fill="${dark}" stroke="${a}" stroke-width="24"/>${arrow(350,350,430,350)}<path d="M520 250v200M420 350h200" stroke="${pale}" stroke-width="8"/><text x="190" y="515" fill="${pale}" font-size="30">P₁</text><text x="485" y="545" fill="${a}" font-size="30">P₂</text>`;
    case 'vessel': return `<rect x="220" y="185" width="300" height="330" rx="145" fill="${dark}" stroke="${steel}" stroke-width="22"/><path d="M370 185v330" stroke="${a}" stroke-width="8" stroke-dasharray="16 12"/><path d="M160 350h120M460 350h120" stroke="${a}" stroke-width="8"/><path d="M175 320l-30 30 30 30M565 320l30 30-30 30" fill="none" stroke="${a}" stroke-width="8"/>`;
    case 'carbon': return `<path d="M190 430c-10-155 115-250 270-215 145 33 195 180 95 295-88 100-286 78-365-80z" fill="#14532d" stroke="${a}" stroke-width="10"/><path d="M245 465c95-105 180-145 285-190" stroke="${pale}" stroke-width="10"/><text x="275" y="390" fill="#dcfce7" font-size="54" font-weight="800">CO₂e</text>`;
    case 'cable': return `<circle cx="310" cy="338" r="145" fill="${dark}" stroke="#64748b" stroke-width="26"/><circle cx="310" cy="338" r="102" fill="#071018" stroke="${a}" stroke-width="6"/>${[[260,295],[360,295],[260,390],[360,390]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="34" fill="#b87333" stroke="#f4d29b" stroke-width="4"/>`).join('')}${arrow(500,338,645,338)}`;
    case 'voltage': return `${line('M115 390 C220 260 320 470 430 320 S610 300 680 215',a)}<circle cx="115" cy="390" r="22" fill="${a}"/><circle cx="680" cy="215" r="22" fill="${a}"/><text x="90" y="445" fill="${pale}" font-size="34">U₁</text><text x="650" y="190" fill="${pale}" font-size="34">U₂</text>`;
    case 'gear': return `<g transform="translate(255 330)"><circle r="118" fill="${dark}" stroke="${a}" stroke-width="16"/><circle r="42" fill="#05080d" stroke="${steel}" stroke-width="12"/>${Array.from({length:12},(_,i)=>`<rect x="-14" y="-154" width="28" height="44" rx="5" fill="${a}" transform="rotate(${i*30})"/>`).join('')}</g><g transform="translate(520 355) scale(.72)"><circle r="118" fill="${dark}" stroke="${pale}" stroke-width="16"/><circle r="42" fill="#05080d" stroke="${steel}" stroke-width="12"/>${Array.from({length:12},(_,i)=>`<rect x="-14" y="-154" width="28" height="44" rx="5" fill="${pale}" transform="rotate(${i*30})"/>`).join('')}</g>`;
    case 'bearing': return `<circle cx="360" cy="338" r="175" fill="${dark}" stroke="${steel}" stroke-width="28"/><circle cx="360" cy="338" r="76" fill="#05080d" stroke="#64748b" stroke-width="22"/>${Array.from({length:10},(_,i)=>{const n=i*Math.PI/5;return `<circle cx="${360+125*Math.cos(n)}" cy="${338+125*Math.sin(n)}" r="28" fill="${a}"/>`}).join('')}`;
    case 'spring': return `${line('M150 420 C185 210 245 210 280 420 S375 630 410 420 S505 210 540 420 S635 630 670 420',a,12)}<path d="M125 475h570M125 190h570" stroke="${steel}" stroke-width="22"/>${arrow(410,150,410,270)}`;
    case 'belt': return `<circle cx="235" cy="350" r="105" fill="${dark}" stroke="${steel}" stroke-width="20"/><circle cx="540" cy="350" r="165" fill="${dark}" stroke="${a}" stroke-width="24"/><path d="M235 245L540 185M235 455L540 515" stroke="#05080d" stroke-width="28"/><path d="M235 245L540 185M235 455L540 515" stroke="${a}" stroke-width="7"/>`;
    case 'bolt': return `<path d="M240 250l45-26 45 26v52l-45 26-45-26z" fill="${steel}" stroke="${pale}" stroke-width="6"/><path d="M275 326v180h35V326" fill="#64748b" stroke="${pale}" stroke-width="5"/><path d="M273 355h40m-40 25h40m-40 25h40m-40 25h40m-40 25h40m-40 25h40" stroke="${a}" stroke-width="5"/><path d="M285 276l275-80" stroke="${steel}" stroke-width="35" stroke-linecap="round"/><path d="M195 235a130 130 0 0 1 214-55" stroke="${a}" stroke-width="7" fill="none"/>${arrow(399,171,420,192)}${arrow(560,206,560,385)}<text x="580" y="330" fill="${a}" font-size="42" font-weight="700">F</text><text x="415" y="310" fill="${a}" font-size="38">r</text>`;
    case 'bend': return `<path d="M130 420h170V245h145v175h205" stroke="${steel}" stroke-width="44" fill="none" stroke-linejoin="round"/><path d="M300 420v-175M445 245v175" stroke="${a}" stroke-width="8" stroke-dasharray="14 12"/>${arrow(130,500,650,500)}`;
    case 'shear': return `<rect x="130" y="355" width="520" height="105" fill="#64748b"/><path d="M330 170h250l-95 170H235z" fill="${dark}" stroke="${a}" stroke-width="9"/>${arrow(405,170,405,315)}<path d="M370 350l70 115" stroke="${pale}" stroke-width="8"/>`;
    case 'shaft': return `<path d="M100 340h125v-65h155v40h150v-75h140v200H530v-75H380v40H225v-65H100z" fill="#64748b" stroke="${pale}" stroke-width="8"/><path d="M105 340h565" stroke="${a}" stroke-width="7" stroke-dasharray="20 14"/>${line('M410 195c65 65 65 225 0 290',a)}`;
    case 'pump': return `<path d="M110 260h540M110 300q25-20 50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0t50 0" stroke="#5a9bc6" stroke-width="6" fill="none" opacity=".65"/><path d="M310 305V170h260" stroke="${steel}" stroke-width="28" fill="none" stroke-linejoin="round"/><rect x="265" y="315" width="90" height="205" rx="35" fill="${steel}" stroke="${pale}" stroke-width="5"/><path d="M275 365h70m-70 24h70m-70 24h70m-70 24h70" stroke="${dark}" stroke-width="9"/><rect x="285" y="460" width="50" height="45" rx="12" fill="${dark}"/>${arrow(310,290,310,210)}${arrow(440,170,565,170)}${arrow(625,495,625,185)}<text x="650" y="365" fill="${a}" font-size="42">H</text><text x="480" y="135" fill="${a}" font-size="42">Q</text>`;
    case 'pipe': case 'flow': case 'fluid': return `<rect x="105" y="270" width="570" height="145" rx="72" fill="#0f172a" stroke="#64748b" stroke-width="24"/>${arrow(145,342,610,342)}<circle cx="220" cy="342" r="92" fill="none" stroke="${a}" stroke-width="8" stroke-dasharray="14 12"/>`;
    case 'oring': return `<circle cx="270" cy="340" r="145" fill="none" stroke="${dark}" stroke-width="62"/><circle cx="270" cy="340" r="145" fill="none" stroke="${a}" stroke-width="8"/><path d="M500 205h155v270H500v-80h80V285h-80z" fill="#64748b" stroke="${pale}" stroke-width="7"/><circle cx="575" cy="340" r="52" fill="${dark}" stroke="${a}" stroke-width="7"/>`;
    case 'thermal': case 'expansion': case 'temperature': return `<rect x="115" y="270" width="125" height="160" fill="#7f1d1d"/><rect x="240" y="270" width="125" height="160" fill="#78350f"/><rect x="365" y="270" width="125" height="160" fill="#334155"/><rect x="490" y="270" width="125" height="160" fill="#0c4a6e"/>${arrow(145,350,585,350)}<text x="125" y="245" fill="#fb923c" font-size="30">T₁</text><text x="575" y="245" fill="#38bdf8" font-size="30">T₂</text>`;
    case 'weld': return `<rect x="120" y="380" width="570" height="105" fill="#64748b"/><rect x="340" y="160" width="105" height="225" fill="${steel}"/><path d="M340 385h-85l85-85zM445 385h85l-85-85z" fill="${a}"/>${arrow(160,535,650,535)}`;
    case 'profile': return `<path d="M240 175h270v72H410v200h100v72H240v-72h100V247H240z" fill="#64748b" stroke="${pale}" stroke-width="8"/>${arrow(215,555,535,555)}`;
    case 'rebar': return `${Array.from({length:6},(_,i)=>`<line x1="${155+i*85}" y1="190" x2="${155+i*85}" y2="500" stroke="${i%2?a:steel}" stroke-width="18"/>`).join('')}${Array.from({length:4},(_,i)=>`<line x1="125" y1="${230+i*85}" x2="635" y2="${230+i*85}" stroke="${i%2?steel:a}" stroke-width="18"/>`).join('')}`;
    case 'stairs': return `<path d="M120 500h105v-70h105v-70h105v-70h105v-70h105" stroke="${a}" stroke-width="34" fill="none"/><path d="M120 535h530M90 500v-280" stroke="${steel}" stroke-width="8"/>`;
    case 'cone': return `<path d="M155 220L615 300v110l-460 80z" fill="${steel}" stroke="${pale}" stroke-width="6"/><path d="M110 355h570" stroke="${a}" stroke-width="4" stroke-dasharray="18 12"/><path d="M155 535h460M155 510v45m460-135v135M110 220v270M90 220h40M90 490h40M660 300v110m-20-110h40m-40 110h40" stroke="${a}" stroke-width="4" fill="none"/><path d="M550 355a65 65 0 0 0-1-66" stroke="${a}" stroke-width="5" fill="none"/><text x="45" y="370" fill="${a}" font-size="40">D</text><text x="685" y="370" fill="${a}" font-size="40">d</text><text x="365" y="580" fill="${a}" font-size="40">L</text><text x="515" y="335" fill="${dark}" font-size="38">θ</text>`;
    case 'triangle': return `<path d="M145 500h500L245 185z" fill="#0f172a" stroke="${a}" stroke-width="12"/><path d="M245 185v315" stroke="${steel}" stroke-width="7" stroke-dasharray="14 12"/>`;
    case 'credit': case 'market': case 'receipt': case 'rent': case 'meter': return `<rect x="120" y="175" width="540" height="345" rx="28" fill="#0f172a" stroke="${steel}" stroke-width="8"/>${line('M180 440l90-95 80 55 125-155 115 80',a)}<rect x="175" y="215" width="145" height="62" rx="14" fill="${a}" opacity=".22"/>`;
    case 'factory': return `<path d="M110 500V300l145 70v-95l150 95V220h115v280z" fill="#1e293b" stroke="${steel}" stroke-width="8"/><path d="M150 420h75v80h-75zM285 420h75v80h-75zM420 420h65v80h-65z" fill="${a}"/><circle cx="600" cy="335" r="88" fill="#0f172a" stroke="${a}" stroke-width="12"/>`;
    case 'chemistry': return `<path d="M235 170h95v125L225 480c-24 43 7 78 55 78h170c48 0 79-35 55-78L400 295V170h95" fill="#0f172a" stroke="${steel}" stroke-width="10"/><path d="M260 430h210l55 98H205z" fill="${a}" opacity=".6"/>`;
    case 'solar': return `<path d="M130 255h410l90 245H220z" fill="#0c4a6e" stroke="${a}" stroke-width="10"/><path d="M215 255l-20 245M300 255l20 245M390 255l65 245M130 335h440M160 420h440" stroke="#93c5fd" stroke-width="5"/><circle cx="600" cy="190" r="66" fill="${a}"/>`;
    case 'server': return `${[175,305,435].map((y,i)=>`<rect x="150" y="${y}" width="500" height="105" rx="18" fill="#1e293b" stroke="#64748b" stroke-width="8"/><circle cx="205" cy="${y+52}" r="16" fill="${i===1?'#22c55e':a}"/><path d="M250 ${y+52}h330" stroke="#475569" stroke-width="14"/>`).join('')}`;
    case 'kanban': return `${[110,315,520].map((x,i)=>`<rect x="${x}" y="180" width="170" height="350" rx="18" fill="${dark}" stroke="${i===1?a:steel}" stroke-width="7"/><rect x="${x+35}" y="245" width="100" height="70" rx="12" fill="${i===1?a:'#334155'}"/><rect x="${x+35}" y="345" width="100" height="70" rx="12" fill="#334155"/>`).join('')}`;
    case 'health': return `<circle cx="355" cy="335" r="175" fill="#0f172a" stroke="${steel}" stroke-width="18"/><path d="M225 385a145 145 0 0 1 260-65" stroke="${a}" stroke-width="26" fill="none"/><path d="M355 335l85-75" stroke="${pale}" stroke-width="12"/><text x="300" y="515" fill="${pale}" font-size="36">BMI</text>`;
    default: return `<rect x="125" y="190" width="545" height="330" rx="32" fill="#0f172a" stroke="${steel}" stroke-width="8"/>${line('M180 445l90-85 85 45 105-145 125 80',a)}`;
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const slug = file.replace(/\.svg$/i, '');
  const tool = getToolBySlug(slug);
  if (!tool) return new Response('Not found', { status: 404 });
  const detail = DETAILS[slug] || { formula: 'Girdi → Hesap → Sonuç', metrics: ['Girdi', 'Kontrol', 'Sonuç'], scene: 'default' };
  const title = esc(tool.name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-labelledby="title desc"><title id="title">${title}</title><desc id="desc">${esc(detail.formula)}. Kavramsal teknik çizim; ölçeksizdir.</desc><defs><pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="#8094aa" stroke-opacity=".1" stroke-width="1"/></pattern></defs><rect width="1280" height="720" fill="url(#grid)"/><g transform="translate(80 -140) scale(1.4)" font-family="Arial, sans-serif">${sceneSvg(detail.scene, '#b37d25')}</g></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } });
}
