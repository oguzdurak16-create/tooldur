import { getCategoryById, getToolBySlug } from '@/data/tools';

type Detail = {
  formula: string;
  metrics: [string, string, string];
  scene: string;
};

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

function sceneSvg(scene: string, accent: string) {
  const common = `stroke="${accent}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (scene) {
    case 'cable': return `<circle cx="310" cy="338" r="145" fill="#111923" stroke="#64748b" stroke-width="26"/><circle cx="310" cy="338" r="102" fill="#071018" stroke="${accent}" stroke-width="6"/>${[[260,295],[360,295],[260,390],[360,390]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="34" fill="#b87333" stroke="#f4d29b" stroke-width="4"/>`).join('')}<path d="M500 338h135" ${common}/><path d="m610 305 35 33-35 33" ${common}/>`;
    case 'voltage': return `<path d="M115 390 C220 260 320 470 430 320 S610 300 680 215" ${common}/><circle cx="115" cy="390" r="22" fill="${accent}"/><circle cx="680" cy="215" r="22" fill="${accent}"/><text x="90" y="445" fill="#e2e8f0" font-size="34">U₁</text><text x="650" y="190" fill="#e2e8f0" font-size="34">U₂</text><path d="M210 170h300" stroke="#334155" stroke-width="26"/><path d="M210 170h218" stroke="${accent}" stroke-width="26"/>`;
    case 'gear': return `<g transform="translate(255 330)"><circle r="118" fill="#1e293b" stroke="${accent}" stroke-width="16"/><circle r="42" fill="#05080d" stroke="#94a3b8" stroke-width="12"/>${Array.from({length:12},(_,i)=>`<rect x="-14" y="-154" width="28" height="44" rx="5" fill="${accent}" transform="rotate(${i*30})"/>`).join('')}</g><g transform="translate(520 355) scale(.72)"><circle r="118" fill="#1e293b" stroke="#f8fafc" stroke-width="16"/><circle r="42" fill="#05080d" stroke="#94a3b8" stroke-width="12"/>${Array.from({length:12},(_,i)=>`<rect x="-14" y="-154" width="28" height="44" rx="5" fill="#f8fafc" transform="rotate(${i*30})"/>`).join('')}</g>`;
    case 'bearing': return `<circle cx="360" cy="338" r="175" fill="#111827" stroke="#94a3b8" stroke-width="28"/><circle cx="360" cy="338" r="76" fill="#05080d" stroke="#64748b" stroke-width="22"/>${Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return `<circle cx="${360+125*Math.cos(a)}" cy="${338+125*Math.sin(a)}" r="28" fill="${accent}" stroke="#fde68a" stroke-width="4"/>`}).join('')}<path d="M575 195v286M545 225h60M545 451h60" ${common}/>`;
    case 'spring': return `<path d="M150 420 C185 210 245 210 280 420 S375 630 410 420 S505 210 540 420 S635 630 670 420" ${common}/><path d="M125 475h570M125 190h570" stroke="#64748b" stroke-width="22"/><path d="M410 150v120" ${common}/><path d="m380 230 30 40 30-40" fill="${accent}"/>`;
    case 'belt': return `<circle cx="235" cy="350" r="105" fill="#111827" stroke="#94a3b8" stroke-width="20"/><circle cx="540" cy="350" r="165" fill="#111827" stroke="${accent}" stroke-width="24"/><path d="M235 245 L540 185 M235 455 L540 515" stroke="#0f172a" stroke-width="28"/><path d="M235 245 L540 185 M235 455 L540 515" stroke="${accent}" stroke-width="7"/><circle cx="235" cy="350" r="32" fill="#020617"/><circle cx="540" cy="350" r="42" fill="#020617"/>`;
    case 'bolt': return `<rect x="290" y="190" width="145" height="95" rx="18" fill="#94a3b8"/><rect x="335" y="275" width="56" height="235" fill="#64748b"/><path d="M330 300h66M330 330h66M330 360h66M330 390h66M330 420h66M330 450h66" stroke="#f8fafc" stroke-width="7"/><rect x="275" y="355" width="175" height="84" fill="#1e293b" stroke="${accent}" stroke-width="7"/><path d="M460 235h165l-55-48" ${common}/><path d="M625 235l-55 48" ${common}/>`;
    case 'bend': return `<path d="M130 420h170V245h145v175h205" stroke="#94a3b8" stroke-width="44" fill="none" stroke-linejoin="round"/><path d="M300 420v-175M445 245v175" stroke="${accent}" stroke-width="8" stroke-dasharray="14 12"/><path d="M110 500h560" ${common}/><path d="m130 475-25 25 25 25M650 475l25 25-25 25" ${common}/>`;
    case 'shear': return `<rect x="130" y="355" width="520" height="105" fill="#64748b"/><path d="M330 170h250l-95 170H235z" fill="#1e293b" stroke="${accent}" stroke-width="9"/><path d="M405 170v130" ${common}/><path d="m375 275 30 40 30-40" fill="${accent}"/><path d="M370 350l70 115" stroke="#f8fafc" stroke-width="8"/>`;
    case 'shaft': return `<path d="M100 340h125v-65h155v40h150v-75h140v200H530v-75H380v40H225v-65H100z" fill="#64748b" stroke="#cbd5e1" stroke-width="8"/><path d="M105 340h565" stroke="${accent}" stroke-width="7" stroke-dasharray="20 14"/><path d="M410 195c65 65 65 225 0 290" ${common}/><path d="m440 205-30-10 10 30" fill="${accent}"/>`;
    case 'pipe': case 'flow': case 'fluid': case 'pump': return `<rect x="105" y="270" width="570" height="145" rx="72" fill="#0f172a" stroke="#64748b" stroke-width="24"/><path d="M145 342h465" ${common}/><path d="m565 305 40 37-40 37" ${common}/><circle cx="220" cy="342" r="92" fill="none" stroke="${accent}" stroke-width="8" stroke-dasharray="14 12"/><path d="M220 250v184M128 342h184" stroke="#94a3b8" stroke-width="5"/>`;
    case 'oring': return `<circle cx="270" cy="340" r="145" fill="none" stroke="#111827" stroke-width="62"/><circle cx="270" cy="340" r="145" fill="none" stroke="${accent}" stroke-width="8"/><path d="M500 205h155v270H500v-80h80V285h-80z" fill="#64748b" stroke="#cbd5e1" stroke-width="7"/><circle cx="575" cy="340" r="52" fill="#111827" stroke="${accent}" stroke-width="7"/>`;
    case 'thermal': case 'expansion': case 'temperature': return `<rect x="115" y="270" width="125" height="160" fill="#7f1d1d"/><rect x="240" y="270" width="125" height="160" fill="#78350f"/><rect x="365" y="270" width="125" height="160" fill="#334155"/><rect x="490" y="270" width="125" height="160" fill="#0c4a6e"/><path d="M145 350h440" ${common}/><path d="m545 315 40 35-40 35" fill="${accent}"/><text x="125" y="245" fill="#fb923c" font-size="30">T₁</text><text x="575" y="245" fill="#38bdf8" font-size="30">T₂</text>`;
    case 'weld': return `<rect x="120" y="380" width="570" height="105" fill="#64748b"/><rect x="340" y="160" width="105" height="225" fill="#94a3b8"/><path d="M340 385l-85 0 85-85zM445 385h85l-85-85z" fill="${accent}"/><path d="M160 535h490" ${common}/><path d="m180 510-25 25 25 25M630 510l25 25-25 25" ${common}/>`;
    case 'profile': return `<path d="M240 175h270v72H410v200h100v72H240v-72h100V247H240z" fill="#64748b" stroke="#cbd5e1" stroke-width="8"/><path d="M545 185v325M520 210h50M520 485h50" ${common}/><path d="M215 555h320" ${common}/>`;
    case 'rebar': return `${Array.from({length:6},(_,i)=>`<line x1="${155+i*85}" y1="190" x2="${155+i*85}" y2="500" stroke="${i%2?accent:'#94a3b8'}" stroke-width="18"/>`).join('')}${Array.from({length:4},(_,i)=>`<line x1="125" y1="${230+i*85}" x2="635" y2="${230+i*85}" stroke="${i%2?'#94a3b8':accent}" stroke-width="18"/>`).join('')}`;
    case 'stairs': return `<path d="M120 500h105v-70h105v-70h105v-70h105v-70h105" stroke="${accent}" stroke-width="34" fill="none"/><path d="M120 535h530M90 500v-280" stroke="#64748b" stroke-width="8"/>`;
    case 'triangle': case 'cone': return `<path d="M145 500h500L245 185z" fill="#0f172a" stroke="${accent}" stroke-width="12"/><path d="M245 185v315" stroke="#94a3b8" stroke-width="7" stroke-dasharray="14 12"/><rect x="225" y="465" width="35" height="35" fill="none" stroke="#f8fafc" stroke-width="6"/><text x="430" y="550" fill="#e2e8f0" font-size="34">L</text>`;
    case 'credit': case 'market': case 'receipt': case 'rent': case 'meter': return `<rect x="120" y="175" width="540" height="345" rx="28" fill="#0f172a" stroke="#64748b" stroke-width="8"/><path d="M180 440l90-95 80 55 125-155 115 80" ${common}/><circle cx="270" cy="345" r="17" fill="${accent}"/><circle cx="350" cy="400" r="17" fill="${accent}"/><circle cx="475" cy="245" r="17" fill="${accent}"/><rect x="175" y="215" width="145" height="62" rx="14" fill="${accent}" opacity=".22"/><rect x="345" y="215" width="120" height="62" rx="14" fill="#334155"/>`;
    case 'factory': return `<path d="M110 500V300l145 70v-95l150 95V220h115v280z" fill="#1e293b" stroke="#94a3b8" stroke-width="8"/><path d="M150 420h75v80h-75zM285 420h75v80h-75zM420 420h65v80h-65z" fill="${accent}" opacity=".75"/><circle cx="600" cy="335" r="88" fill="#0f172a" stroke="${accent}" stroke-width="12"/><path d="M600 335l45-40" ${common}/>`;
    case 'chemistry': return `<path d="M235 170h95v125l-105 185c-24 43 7 78 55 78h170c48 0 79-35 55-78L400 295V170h95" fill="#0f172a" stroke="#94a3b8" stroke-width="10"/><path d="M260 430h210l55 98H205z" fill="${accent}" opacity=".6"/><circle cx="315" cy="385" r="18" fill="#f8fafc"/><circle cx="420" cy="455" r="26" fill="#f8fafc" opacity=".7"/>`;
    case 'solar': return `<path d="M130 255h410l90 245H220z" fill="#0c4a6e" stroke="${accent}" stroke-width="10"/><path d="M215 255l-20 245M300 255l20 245M390 255l65 245M130 335h440M160 420h440" stroke="#93c5fd" stroke-width="5"/><circle cx="600" cy="190" r="66" fill="${accent}"/><path d="M600 95v-45M600 330v-45M505 190h-45M740 190h-45" ${common}/>`;
    case 'server': return `<rect x="150" y="175" width="500" height="105" rx="18" fill="#1e293b" stroke="#64748b" stroke-width="8"/><rect x="150" y="305" width="500" height="105" rx="18" fill="#1e293b" stroke="#64748b" stroke-width="8"/><rect x="150" y="435" width="500" height="105" rx="18" fill="#1e293b" stroke="#64748b" stroke-width="8"/><circle cx="205" cy="227" r="16" fill="${accent}"/><circle cx="205" cy="357" r="16" fill="#22c55e"/><circle cx="205" cy="487" r="16" fill="${accent}"/><path d="M250 227h330M250 357h330M250 487h330" stroke="#475569" stroke-width="14"/>`;
    case 'kanban': return `<rect x="110" y="180" width="170" height="350" rx="18" fill="#111827" stroke="#64748b" stroke-width="7"/><rect x="315" y="180" width="170" height="350" rx="18" fill="#111827" stroke="${accent}" stroke-width="7"/><rect x="520" y="180" width="170" height="350" rx="18" fill="#111827" stroke="#64748b" stroke-width="7"/>${[145,350,555].map((x,i)=>`<rect x="${x}" y="245" width="100" height="70" rx="12" fill="${i===1?accent:'#334155'}" opacity=".85"/><rect x="${x}" y="345" width="100" height="70" rx="12" fill="#334155"/>`).join('')}`;
    case 'health': return `<circle cx="355" cy="335" r="175" fill="#0f172a" stroke="#64748b" stroke-width="18"/><path d="M225 385a145 145 0 0 1 260-65" stroke="${accent}" stroke-width="26" fill="none"/><path d="M355 335l85-75" ${common}/><circle cx="355" cy="335" r="20" fill="#f8fafc"/><text x="300" y="515" fill="#e2e8f0" font-size="36">BMI</text>`;
    default: return `<rect x="125" y="190" width="545" height="330" rx="32" fill="#0f172a" stroke="#64748b" stroke-width="8"/><path d="M180 445l90-85 85 45 105-145 125 80" ${common}/><circle cx="270" cy="360" r="18" fill="${accent}"/><circle cx="355" cy="405" r="18" fill="${accent}"/><circle cx="460" cy="260" r="18" fill="${accent}"/>`;
  }
}

function hashColor(slug: string) {
  const palette = ['#fbbf24', '#f59e0b', '#eab308', '#fb923c', '#facc15'];
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

export async function GET(_request: Request, { params }: { params: { file: string } }) {
  const slug = decodeURIComponent(params.file).replace(/\.svg$/i, '');
  const tool = getToolBySlug(slug);
  if (!tool) return new Response('Not found', { status: 404 });

  const category = getCategoryById(tool.category);
  const detail = DETAILS[slug] || { formula: 'Girdi → Hesap → Sonuç', metrics: ['Girdi değerleri', 'Hesap kontrolü', 'Teknik sonuç'], scene: 'default' };
  const accent = hashColor(slug);
  const title = esc(tool.shortName || tool.name);
  const fullName = esc(tool.name);
  const categoryName = esc(category?.name || 'Tooldur');
  const formula = esc(detail.formula);
  const metrics = detail.metrics.map(esc);
  const titleSize = title.length > 28 ? 48 : title.length > 20 ? 56 : 66;

  const rows = metrics.map((metric, index) => {
    const y = 246 + index * 86;
    const state = index === 2 ? 'SONUÇ' : index === 1 ? 'KONTROL' : 'GİRDİ';
    return `<g><rect x="814" y="${y - 43}" width="372" height="66" rx="14" fill="#111923" stroke="#334155"/><circle cx="848" cy="${y - 10}" r="15" fill="${index === 2 ? accent : '#334155'}"/><text x="878" y="${y - 4}" fill="#e2e8f0" font-size="20" font-family="Arial, sans-serif">${metric}</text><text x="1160" y="${y - 4}" text-anchor="end" fill="${index === 2 ? accent : '#94a3b8'}" font-size="14" font-weight="700" font-family="Arial, sans-serif">${state}</text></g>`;
  }).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img" aria-label="${fullName}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#05080d"/><stop offset=".58" stop-color="#0a111b"/><stop offset="1" stop-color="#030507"/></linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(390 340) rotate(15) scale(520 360)"><stop stop-color="${accent}" stop-opacity=".16"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" fill="none" stroke="#334155" stroke-opacity=".22"/></pattern>
    <filter id="shadow"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".65"/></filter>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/><rect width="1280" height="720" fill="url(#grid)"/><rect width="1280" height="720" fill="url(#glow)"/>
  <path d="M24 24h210M24 24v85M1046 24h210M1256 24v85M24 696h210M24 696v-85M1046 696h210M1256 696v-85" stroke="${accent}" stroke-width="3" opacity=".75"/>
  <g font-family="Arial, sans-serif"><text x="54" y="58" fill="${accent}" font-size="16" font-weight="800" letter-spacing="3">${categoryName.toUpperCase()} · ÖZEL TOOL GÖRSELİ</text><text x="54" y="118" fill="#f8fafc" font-size="${titleSize}" font-weight="900">${title}</text><text x="56" y="150" fill="#94a3b8" font-size="18">${fullName}</text></g>
  <g filter="url(#shadow)"><rect x="42" y="178" width="710" height="410" rx="28" fill="#080d14" stroke="#263445" stroke-width="3"/>${sceneSvg(detail.scene, accent)}</g>
  <g filter="url(#shadow)"><rect x="782" y="178" width="456" height="410" rx="28" fill="#080d14" stroke="${accent}" stroke-opacity=".55" stroke-width="3"/><text x="814" y="220" fill="${accent}" font-size="18" font-weight="800" font-family="Arial, sans-serif" letter-spacing="2">HESAPLAMA PANELİ</text>${rows}<rect x="814" y="482" width="372" height="76" rx="16" fill="${accent}" opacity=".12" stroke="${accent}"/><text x="838" y="510" fill="#94a3b8" font-size="14" font-family="Arial, sans-serif">TEMEL BAĞINTI</text><text x="838" y="542" fill="${accent}" font-size="23" font-weight="800" font-family="Arial, sans-serif">${formula}</text></g>
  <g font-family="Arial, sans-serif"><rect x="42" y="612" width="1196" height="66" rx="20" fill="#0b121c" stroke="#263445"/><text x="72" y="651" fill="${accent}" font-size="17" font-weight="800">DOĞRU GİRDİ</text><text x="268" y="651" fill="#64748b" font-size="22">→</text><text x="324" y="651" fill="#e2e8f0" font-size="17" font-weight="800">HIZLI ÖN HESAP</text><text x="545" y="651" fill="#64748b" font-size="22">→</text><text x="602" y="651" fill="#e2e8f0" font-size="17" font-weight="800">TEKNİK KONTROL</text><text x="810" y="651" fill="#64748b" font-size="22">→</text><text x="866" y="651" fill="${accent}" font-size="17" font-weight="800">TOOLDUR</text><text x="1170" y="651" text-anchor="end" fill="#64748b" font-size="14">Ücretsiz mühendislik aracı</text></g>
  </svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}
