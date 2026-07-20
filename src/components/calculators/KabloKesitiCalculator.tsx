'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Info, AlertCircle, Sparkles, Cable } from 'lucide-react';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Sonuc = {
  hesaplananKesit: number;
  standartKesit: number;
  kabloCapi: number;
  gerilimDusumu: number;
  gercekGerilimDusumu: number;
};

export default function KabloKesitiCalculator() {
  const { saveCalculation } = useCalculationHistory();

  const [formData, setFormData] = useState({
    akim: '',
    mesafe: '',
    gerilim: '220',
    faz: 'tek',
    iletkenTipi: 'bakir',
    maxGerilimDusumu: '3',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const kabloBilgileri = [
    { kesit: 1.5, cap: 1.38 },
    { kesit: 2.5, cap: 1.78 },
    { kesit: 4, cap: 2.26 },
    { kesit: 6, cap: 2.76 },
    { kesit: 10, cap: 3.57 },
    { kesit: 16, cap: 4.51 },
    { kesit: 25, cap: 5.64 },
    { kesit: 35, cap: 6.68 },
    { kesit: 50, cap: 7.98 },
    { kesit: 70, cap: 9.44 },
    { kesit: 95, cap: 11.0 },
    { kesit: 120, cap: 12.36 },
    { kesit: 150, cap: 13.82 },
    { kesit: 185, cap: 15.35 },
    { kesit: 240, cap: 17.48 },
    { kesit: 300, cap: 19.54 },
  ];

  const iletkenlik = {
    bakir: 56,
    aluminyum: 35,
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const hesapla = () => {
    const akim = parseLocalizedNumber(formData.akim);
    const mesafe = parseLocalizedNumber(formData.mesafe);
    const gerilim = parseLocalizedNumber(formData.gerilim);
    const maxDusum = parseLocalizedNumber(formData.maxGerilimDusumu);
    const gamma = iletkenlik[formData.iletkenTipi as keyof typeof iletkenlik];

    if (Number.isNaN(akim) || Number.isNaN(mesafe) || akim <= 0 || mesafe <= 0) return;

    const fazKatsayisi = formData.faz === 'tek' ? 2 : Math.sqrt(3);

    const hesaplananKesit =
      (fazKatsayisi * akim * mesafe * 100) / (gamma * gerilim * maxDusum);

    const uygunKablo =
      kabloBilgileri.find((k) => k.kesit >= hesaplananKesit) ||
      kabloBilgileri[kabloBilgileri.length - 1];

    const gercekDusum =
      (fazKatsayisi * akim * mesafe * 100) /
      (gamma * gerilim * uygunKablo.kesit);

    const result: Sonuc = {
      hesaplananKesit,
      standartKesit: uygunKablo.kesit,
      kabloCapi: uygunKablo.cap,
      gerilimDusumu: maxDusum,
      gercekGerilimDusumu: gercekDusum,
    };

    setSonuc(result);

    setSvgContent(
      generateDrawing({
        type: 'kablo_kesit_elektrik',
        result: result.standartKesit,
      })
    );

    saveCalculation({
      toolSlug: 'kablo-kesiti-hesaplama',
      toolName: 'Kablo Kesiti Hesaplama',
      category: 'elektrik',
      inputs: {
        'Akım (A)': formData.akim,
        'Mesafe (m)': formData.mesafe,
        'Gerilim (V)': formData.gerilim,
        Faz: formData.faz === 'tek' ? 'Tek Faz' : 'Üç Faz',
        İletken: formData.iletkenTipi === 'bakir' ? 'Bakır' : 'Alüminyum',
        'Max Düşüm (%)': formData.maxGerilimDusumu,
      },
      outputs: {
        'Önerilen Kesit (mm²)': uygunKablo.kesit,
        'İletken Çapı (mm)': uygunKablo.cap,
        'Gerçek Gerilim Düşümü (%)': parseFloat(gercekDusum.toFixed(2)),
      },
      summary: `${formData.akim}A, ${formData.mesafe}m, ${formData.faz === 'tek' ? 'Tek Faz' : 'Üç Faz'} → ${uygunKablo.kesit} mm²`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10">
            <Cable className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Kablo Kesiti Hesaplama</h2>
            <p className="calc-prose mt-1">
              Akım, mesafe, faz tipi ve gerilim düşüm toleransına göre önerilen kablo kesitini hesaplayın.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="calc-title">Çekeceğiniz Akım (Amper)</label>
            <input
              type="text"
              inputMode="decimal"
              name="akim"
              value={formData.akim}
              onChange={handleChange}
              placeholder="Örn: 16"
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <span className="text-xs calc-muted block mt-2">Cihazın etiketinde yazabilir.</span>
          </div>

          <div>
            <label className="calc-title">Kablo Uzunluğu (metre)</label>
            <input
              type="text"
              inputMode="decimal"
              name="mesafe"
              value={formData.mesafe}
              onChange={handleChange}
              placeholder="Örn: 25"
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div>
            <label className="calc-title">Şebeke Gerilimi</label>
            <select
              name="gerilim"
              value={formData.gerilim}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="220">220V (Ev tipi - Tek Faz)</option>
              <option value="380">380V (Üç Faz)</option>
            </select>
          </div>

          <div>
            <label className="calc-title">Faz Tipi</label>
            <select
              name="faz"
              value={formData.faz}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="tek">Tek Faz (Evler)</option>
              <option value="uc">Üç Faz (Sanayi)</option>
            </select>
          </div>

          <div>
            <label className="calc-title">Kablo Cinsi</label>
            <select
              name="iletkenTipi"
              value={formData.iletkenTipi}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="bakir">Bakır (Önerilen)</option>
              <option value="aluminyum">Alüminyum</option>
            </select>
          </div>

          <div>
            <label className="calc-title">Gerilim Düşümü Toleransı</label>
            <select
              name="maxGerilimDusumu"
              value={formData.maxGerilimDusumu}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="3">%3 (Standart)</option>
              <option value="5">%5 (Uzun mesafeler)</option>
            </select>
          </div>
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Hesap, izin verilen gerilim düşümüne göre minimum iletken kesitini bulur.
          </p>
          <p className="calc-prose mt-2">
            Bu araç ev, atölye ve sanayi beslemelerinde hızlı ön seçim için uygundur. Nihai uygulama öncesinde yetkili elektrik uzmanı kontrolü gerekir.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Kablo Hesapla
          </span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-sky-500" />
            Önerilen Kablo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard
              title="Kablo Kesiti"
              value={`${sonuc.standartKesit} mm²`}
              accent
            />

            <ResultCard
              title="İletken Çapı"
              value={`Ø ${formatSmartNumber(sonuc.kabloCapi, 'tr-TR', 2)} mm`}
              accent
            />

            <ResultCard
              title="Hesaplanan Min. Kesit"
              value={`${formatSmartNumber(sonuc.hesaplananKesit, 'tr-TR', 2)} mm²`}
            />

            <ResultCard
              title="Gerçek Gerilim Düşümü"
              value={`%${formatSmartNumber(sonuc.gercekGerilimDusumu, 'tr-TR', 2)}`}
            />
          </div>

          <div className="mt-4 p-4 rounded-xl flex items-start gap-3 calc-warn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Not:</strong> Bu hesap gerilim düşümüne göredir. Sigorta, akım taşıma kapasitesi, döşeme tipi ve ortam sıcaklığı ayrıca değerlendirilmelidir.
            </p>
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-500" />
          Standart Kablo Kesitleri ve Çapları
        </h4>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-sm">
          {kabloBilgileri.slice(0, 8).map((k) => (
            <div key={k.kesit} className="calc-soft rounded-lg p-2 text-center">
              <div className="font-bold text-[var(--foreground)]">{k.kesit} mm²</div>
              <div className="calc-muted">Ø{k.cap} mm</div>
            </div>
          ))}
        </div>

        <p className="text-xs calc-muted mt-3">
          * Çap değerleri tek damarlı bakır iletken için yaklaşık referans değerlerdir.
        </p>
      </div>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="kablo-kesiti"
        title="Kablo Kesit Görünüşü"
      />

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Kablo kesiti hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, gerilim düşümü yaklaşımıyla minimum iletken kesitini belirler ve en yakın standart kabloyu önerir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>kablo kesiti hesaplama</strong>, <strong>gerilim düşümü hesabı</strong>,
              <strong> akıma göre kablo seçimi</strong>, <strong>bakır kablo kesiti</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar ön seçim amaçlıdır. Nihai projede kablo döşeme şekli, ortam sıcaklığı, grup faktörü, kısa devre dayanımı ve ilgili standartlar ayrıca dikkate alınmalıdır.
          </p>
        </div>
      </section>
    </div>
  );
}

function ResultCard({
  title,
  value,
  accent = false,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}>
      <span className="text-sm calc-muted block mb-1">{title}</span>
      <span className={`block ${accent ? 'text-3xl text-sky-600 dark:text-sky-400' : 'text-xl'} font-bold text-[var(--foreground)]`}>
        {value}
      </span>
    </div>
  );
}