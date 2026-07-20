'use client';

import { useMemo, useState } from 'react';
import {
  Calculator,
  Sparkles,
  Gauge,
  CircleDot,
  Shield,
  Ruler,
  Info,
} from 'lucide-react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

// ─── Malzeme veritabanı ─────────────────────────────────────
const MALZEMELER: Record<string, { sertlik: number; gerilme: number; label: string }> = {
  'celik-karbonlu': { sertlik: 1.0, gerilme: 137, label: 'Karbon Çeliği (ASTM A53)' },
  'celik-paslanmaz': { sertlik: 1.0, gerilme: 137, label: 'Paslanmaz Çelik 304' },
  'celik-yuksek': { sertlik: 1.0, gerilme: 171, label: 'Yüksek Mukavemetli Çelik' },
  'demir-dokme': { sertlik: 1.0, gerilme: 100, label: 'Dökme Demir' },
  bakir: { sertlik: 1.0, gerilme: 55, label: 'Bakır (Cu)' },
  aluminyum: { sertlik: 1.0, gerilme: 69, label: 'Alüminyum 6061' },
  pirinc: { sertlik: 1.0, gerilme: 83, label: 'Pirinç' },
};

// ─── Standart boru serileri (DN → dış çap mm) ──────────────
const STANDART_DN: Record<number, number> = {
  15: 21.3,
  20: 26.9,
  25: 33.7,
  32: 42.4,
  40: 48.3,
  50: 60.3,
  65: 76.1,
  80: 88.9,
  100: 114.3,
  125: 139.7,
  150: 168.3,
  200: 219.1,
  250: 273.0,
  300: 323.9,
};

interface Sonuc {
  etKalinligi: number;
  standartEt: number;
  disCapiMm: number;
  icCapiMm: number;
  basincKapasitesi: number;
  agirlikMetre: number;
  kesitAlani: number;
  akisAlani: number;
  guvenlikKatsayisi: number;
  sinif: string;
  etKullanim: number;
}

const ET_SERISI = [1.5, 2, 2.3, 2.6, 2.9, 3.2, 3.6, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 8.8, 10, 11, 12.5, 14.2, 16];

export default function BoruHesaplamaCalculator() {
  const { saveCalculation } = useCalculationHistory();

  const [mod, setMod] = useState<'etkap' | 'basinc'>('etkap');
  const [disCapMm, setDisCapMm] = useState('114.3');
  const [etMm, setEtMm] = useState('');
  const [basinc, setBasinc] = useState('10');
  const [sicaklik, setSicaklik] = useState('20');
  const [malzeme, setMalzeme] = useState('celik-karbonlu');
  const [guvenlik, setGuvenlik] = useState('4');
  const [dnSecim, setDnSecim] = useState('');
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState('');

  const aktifMalzeme = useMemo(() => MALZEMELER[malzeme], [malzeme]);

  const dnDegistir = (dn: string) => {
    setDnSecim(dn);
    const dnNum = parseInt(dn, 10);
    if (STANDART_DN[dnNum]) setDisCapMm(STANDART_DN[dnNum].toString());
  };

  const hesapla = () => {
    const D = parseLocalizedNumber(disCapMm) || 114.3;
    const P = parseLocalizedNumber(basinc) || 10;
    const T = parseLocalizedNumber(sicaklik) || 20;
    const sf = parseLocalizedNumber(guvenlik) || 4;
    const mal = MALZEMELER[malzeme];

    const tempFactor = T > 200 ? 1 - (T - 200) * 0.0015 : 1.0;
    const sigma = mal.gerilme * tempFactor;

    const P_mpa = P / 10;
    const tHesap = (P_mpa * D) / (2 * sigma / sf + 2 * 0.4 * P_mpa);

    const standartEt = ET_SERISI.find((e) => e >= tHesap) ?? ET_SERISI[ET_SERISI.length - 1];
    const etKullanim = mod === 'etkap' ? standartEt : parseLocalizedNumber(etMm) || standartEt;

    const d_ic = D - 2 * etKullanim;
    const P_izin = (2 * sigma * etKullanim) / (D - 2 * 0.4 * etKullanim) * 10;

    const rho = malzeme.includes('aluminyum')
      ? 2700
      : malzeme.includes('bakir')
      ? 8960
      : malzeme.includes('pirinc')
      ? 8500
      : 7850;

    const A_metal = (Math.PI / 4) * (D * D - d_ic * d_ic) / 1e6;
    const agirlik = A_metal * rho;
    const kesitAlan = A_metal * 1e4;
    const akisAlan = ((Math.PI / 4) * (d_ic * d_ic)) / 1e4;

    let sinif = 'Uygun';
    if (etKullanim < tHesap) sinif = 'UYGUNSUZ — et kalınlığı yetersiz';
    else if (etKullanim / tHesap < 1.2) sinif = 'Minimum (ek güvenlik önerilir)';
    else if (etKullanim / tHesap >= 2) sinif = 'Fazla güvenli (ekonomik değil)';

    const r: Sonuc = {
      etKalinligi: +tHesap.toFixed(2),
      standartEt,
      disCapiMm: D,
      icCapiMm: +d_ic.toFixed(2),
      basincKapasitesi: +P_izin.toFixed(1),
      agirlikMetre: +agirlik.toFixed(3),
      kesitAlani: +kesitAlan.toFixed(3),
      akisAlani: +akisAlan.toFixed(2),
      guvenlikKatsayisi: +(etKullanim / tHesap).toFixed(2),
      sinif,
      etKullanim,
    };

    setSonuc(r);

    setSvgContent(
      generateDrawing({
        type: 'kablo_kesit',
        width: D,
        thickness: etKullanim,
        result: D,
      })
    );

    saveCalculation({
      toolSlug: 'boru-eti-hesaplama',
      toolName: 'Boru Et Kalınlığı Hesaplama',
      category: 'makine',
      inputs: {
        'Dış Çap (mm)': D,
        'Basınç (bar)': P,
        Malzeme: mal.label,
        'Sıcaklık (°C)': T,
      },
      outputs: {
        'Et Kalınlığı (mm)': r.etKalinligi,
        'Standart Et (mm)': r.standartEt,
        'Basınç Kap. (bar)': r.basincKapasitesi,
      },
      summary: `Ø${D}mm · P=${P}bar → t=${r.standartEt}mm`,
    });
  };

  const uygunsuz = sonuc?.sinif.includes('UYGUNSUZ');
  const minimum = sonuc?.sinif.includes('Minimum');

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10">
            <CircleDot className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Boru Et Kalınlığı Hesaplama</h2>
            <p className="calc-prose mt-1">
              Barlow formülüne göre minimum et kalınlığı veya mevcut et kalınlığına göre basınç kapasitesi hesaplayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sol */}
          <div className="space-y-4">
            <div>
              <label className="calc-title">Hesaplama Modu</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { id: 'etkap', label: 'Et Kalınlığı Bul' },
                  { id: 'basinc', label: 'Basınç Kapasitesi' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMod(m.id as 'etkap' | 'basinc')}
                    type="button"
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      mod === m.id
                        ? 'bg-sky-500 text-white border-sky-500'
                        : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="calc-title">DN Nominal Çap</label>
              <select
                className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
                value={dnSecim}
                onChange={(e) => dnDegistir(e.target.value)}
              >
                <option value="">— Manuel giriş —</option>
                {Object.entries(STANDART_DN).map(([dn, dc]) => (
                  <option key={dn} value={dn}>
                    DN {dn} (Ø{dc} mm)
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label="Dış Çap — D (mm)"
              value={disCapMm}
              onChange={(v) => {
                setDisCapMm(v);
                setDnSecim('');
              }}
              placeholder="örn. 114.3"
            />

            {mod === 'basinc' && (
              <InputField
                label="Mevcut Et Kalınlığı — t (mm)"
                value={etMm}
                onChange={setEtMm}
                placeholder="örn. 6.3"
              />
            )}

            <InputField
              label="Tasarım Basıncı (bar)"
              value={basinc}
              onChange={setBasinc}
              placeholder="örn. 10"
            />

            <div>
              <label className="calc-title">Malzeme</label>
              <select
                className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
                value={malzeme}
                onChange={(e) => setMalzeme(e.target.value)}
              >
                {Object.entries(MALZEMELER).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Sıcaklık (°C)"
                value={sicaklik}
                onChange={setSicaklik}
                placeholder="20"
              />

              <div>
                <label className="calc-title">Güvenlik Katsayısı</label>
                <select
                  className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
                  value={guvenlik}
                  onChange={(e) => setGuvenlik(e.target.value)}
                >
                  <option value="2.5">2.5 — Çok düşük risk</option>
                  <option value="3">3.0 — Düşük risk</option>
                  <option value="4">4.0 — Standart</option>
                  <option value="5">5.0 — Yüksek risk</option>
                  <option value="6">6.0 — Kritik uygulama</option>
                </select>
              </div>
            </div>

            <div className="calc-box-accent">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Seçilen malzeme: {aktifMalzeme.label}
              </p>
              <p className="calc-prose mt-2">
                Gerilme değeri: {aktifMalzeme.gerilme} MPa. Yüksek sıcaklıklarda dayanım lineer olarak azaltılır.
              </p>
            </div>

            <button onClick={hesapla} className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg active:scale-[0.98]" type="button">
              <span className="inline-flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Hesapla
              </span>
            </button>
          </div>

          {/* Sağ */}
          {sonuc ? (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-5"
                style={{
                  background: uygunsuz
                    ? 'rgba(239,68,68,0.08)'
                    : 'linear-gradient(135deg, rgba(14,165,233,0.10), rgba(6,182,212,0.08))',
                  border: `1px solid ${
                    uygunsuz ? 'rgba(239,68,68,0.22)' : 'rgba(14,165,233,0.18)'
                  }`,
                }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.15em] font-black mb-2"
                  style={{ color: uygunsuz ? '#dc2626' : '#0284c7' }}
                >
                  {mod === 'etkap' ? 'Minimum Et Kalınlığı' : 'İzin Verilen Basınç'}
                </div>

                <div
                  className="text-4xl font-black leading-none"
                  style={{ color: uygunsuz ? '#dc2626' : '#0284c7' }}
                >
                  {mod === 'etkap'
                    ? `${formatSmartNumber(sonuc.standartEt, 'tr-TR', 2)} mm`
                    : `${formatSmartNumber(sonuc.basincKapasitesi, 'tr-TR', 1)} bar`}
                </div>

                {mod === 'etkap' && (
                  <div className="text-sm calc-muted mt-3">
                    Hesaplanan: {formatSmartNumber(sonuc.etKalinligi, 'tr-TR', 2)} mm → Standart öneri:{' '}
                    <strong className="text-[var(--foreground)]">
                      {formatSmartNumber(sonuc.standartEt, 'tr-TR', 2)} mm
                    </strong>
                  </div>
                )}
              </div>

              <div
                className="px-3 py-2 rounded-xl text-sm font-semibold border"
                style={{
                  background: uygunsuz
                    ? 'rgba(239,68,68,0.08)'
                    : minimum
                    ? 'rgba(245,158,11,0.10)'
                    : 'rgba(34,197,94,0.10)',
                  borderColor: uygunsuz
                    ? 'rgba(239,68,68,0.20)'
                    : minimum
                    ? 'rgba(245,158,11,0.20)'
                    : 'rgba(34,197,94,0.20)',
                  color: uygunsuz ? '#dc2626' : minimum ? '#d97706' : '#16a34a',
                }}
              >
                {uygunsuz ? '✗' : '✓'} {sonuc.sinif}
              </div>

              <div className="calc-soft rounded-2xl p-4 space-y-3">
                {[
                  { l: 'Dış Çap', v: `${formatSmartNumber(sonuc.disCapiMm, 'tr-TR', 2)} mm` },
                  { l: 'İç Çap', v: `${formatSmartNumber(sonuc.icCapiMm, 'tr-TR', 2)} mm` },
                  { l: 'Kullanılan Et Kalınlığı', v: `${formatSmartNumber(sonuc.etKullanim, 'tr-TR', 2)} mm` },
                  { l: 'Güvenlik Katsayısı', v: `${formatSmartNumber(sonuc.guvenlikKatsayisi, 'tr-TR', 2)}×` },
                  { l: 'Birim Ağırlık', v: `${formatSmartNumber(sonuc.agirlikMetre, 'tr-TR', 3)} kg/m` },
                  { l: 'Metal Kesit Alanı', v: `${formatSmartNumber(sonuc.kesitAlani, 'tr-TR', 3)} cm²` },
                  { l: 'Akış Alanı', v: `${formatSmartNumber(sonuc.akisAlani, 'tr-TR', 2)} cm²` },
                ].map((r) => (
                  <div
                    key={r.l}
                    className="flex justify-between items-center gap-4 border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm calc-muted">{r.l}</span>
                    <span className="text-sm font-semibold text-[var(--foreground)]">{r.v}</span>
                  </div>
                ))}
              </div>

              <div className="calc-panel rounded-xl p-4 text-sm">
                <p className="font-mono calc-muted leading-7">
                  Barlow Formülü: t = P·D / (2·S/sf + 2·y·P)
                  <br />
                  S = {MALZEMELER[malzeme].gerilme} MPa · sf = {guvenlik} · y = 0.4
                </p>
              </div>
            </div>
          ) : (
            <div className="calc-soft rounded-2xl border border-dashed border-[var(--border)] min-h-[280px] flex items-center justify-center p-6">
              <p className="calc-muted text-sm text-center">
                Parametreleri girin ve <strong className="text-[var(--foreground)]">Hesapla</strong> butonuna basın.
              </p>
            </div>
          )}
        </div>
      </div>

      {svgContent && (
        <TeknikCizimPanel
          svgContent={svgContent}
          filename="boru-kesiti"
          title="Boru Kesit Görünüşü"
        />
      )}

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Boru et kalınlığı hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, boru dış çapı, tasarım basıncı, malzeme ve güvenlik katsayısına göre minimum et kalınlığını
              veya mevcut et kalınlığına göre izin verilen basıncı tahmin eder.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>boru et kalınlığı hesaplama</strong>, <strong>barlow formülü</strong>,
              <strong> basınca göre boru seçimi</strong>, <strong>boru basınç kapasitesi</strong>.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="calc-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-sky-500" />
              <span className="font-semibold text-[var(--foreground)]">Basınç</span>
            </div>
            <p className="calc-prose">Tasarım basıncı arttıkça gerekli et kalınlığı da artar.</p>
          </div>

          <div className="calc-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-sky-500" />
              <span className="font-semibold text-[var(--foreground)]">Çap</span>
            </div>
            <p className="calc-prose">Aynı basınç altında daha büyük dış çap daha fazla et kalınlığı ister.</p>
          </div>

          <div className="calc-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-sky-500" />
              <span className="font-semibold text-[var(--foreground)]">Güvenlik</span>
            </div>
            <p className="calc-prose">Yüksek güvenlik katsayısı daha emniyetli fakat daha ağır ve maliyetli seçim doğurur.</p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="calc-prose">
              Bu sonuçlar ön mühendislik değerlendirmesi içindir. Nihai seçimde yürürlükteki standartlar,
              kaynak katsayıları, korozyon payı, üretim toleransı ve proje şartnameleri ayrıca kontrol edilmelidir.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="calc-title">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        placeholder={placeholder}
        className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
      />
    </div>
  );
}