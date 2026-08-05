'use client';

import { useState } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { Gauge, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';
import type { Locale } from '@/lib/siteLanguage';

type RulmanTipi = 'bilyali' | 'makarali';

type Sonuc = {
  L10: number;
  L10h: number;
  L10y: number;
  p: number;
};

export default function RulmanOmuruCalculator({ locale = 'tr' }: { locale?: Locale }) {
  const { saveCalculation } = useCalculationHistory();
  const isEnglish = locale === 'en';
  const numberLocale = isEnglish ? 'en-US' : 'tr-TR';

  const [C, setC] = useState('30');
  const [P, setP] = useState('5');
  const [n, setN] = useState('1450');
  const [tip, setTip] = useState<RulmanTipi>('bilyali');

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const hesapla = () => {
    const Cv = parseLocalizedNumber(C) || 30;
    const Pv = parseLocalizedNumber(P) || 5;
    const nv = parseLocalizedNumber(n) || 1450;

    if (Cv <= 0 || Pv <= 0 || nv <= 0) return;

    const p = tip === 'bilyali' ? 3 : 10 / 3;
    const L10 = Math.pow(Cv / Pv, p);
    const L10h = (L10 * 1_000_000) / (60 * nv);
    const L10y = L10h / (365 * 8);

    const yeniSonuc: Sonuc = {
      L10: +L10.toFixed(2),
      L10h: +L10h.toFixed(0),
      L10y: +L10y.toFixed(1),
      p: +p.toFixed(2),
    };

    setSonuc(yeniSonuc);

    setSvgContent(
      generateDrawing({
        type: 'rulman_omur',
        result: +L10h.toFixed(0),
        result2: Cv * 1000,
        load: Pv * 1000,
        n1: nv,
      })
    );

    saveCalculation({
      toolSlug: 'rulman-omru-hesaplama',
      toolName: isEnglish ? 'Bearing Life Calculator' : 'Rulman Ömrü Hesaplama',
      category: 'makine',
      inputs: {
        'C(kN)': Cv,
        'P(kN)': Pv,
        'n(rpm)': nv,
        [isEnglish ? 'Type' : 'Tip']: tip === 'bilyali' ? (isEnglish ? 'Ball bearing' : 'Bilyalı') : (isEnglish ? 'Roller bearing' : 'Makaralı'),
      },
      outputs: {
        'L10(Mrev)': +L10.toFixed(2),
        [isEnglish ? 'L10h(hours)' : 'L10h(saat)']: +L10h.toFixed(0),
        [isEnglish ? 'L10y(years)' : 'L10y(yıl)']: +L10y.toFixed(1),
      },
      summary: isEnglish
        ? `C=${Cv}kN P=${Pv}kN → L10=${L10h.toFixed(0)} hours (${L10y.toFixed(1)} years)`
        : `C=${Cv}kN P=${Pv}kN → L10=${L10h.toFixed(0)} saat (${L10y.toFixed(1)} yıl)`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10">
            <Gauge className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {isEnglish ? 'Bearing Life Calculator' : 'Rulman Ömrü Hesaplama'}
            </h2>
            <p className="calc-prose mt-1">
              {isEnglish
                ? 'Calculate basic bearing life in million revolutions, operating hours and years using the ISO 281 life equation.'
                : 'ISO 281 temel ömür bağıntısına göre rulman ömrünü milyon devir, saat ve yıl olarak hesaplayın.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="calc-title block mb-2">{isEnglish ? 'Bearing type' : 'Rulman Tipi'}</label>
              <select
                value={tip}
                onChange={(e) => setTip(e.target.value as RulmanTipi)}
                className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30"
              >
                <option value="bilyali">{isEnglish ? 'Ball bearing (p = 3)' : 'Bilyalı rulman (p = 3)'}</option>
                <option value="makarali">{isEnglish ? 'Roller bearing (p = 10/3)' : 'Makaralı rulman (p = 10/3)'}</option>
              </select>
            </div>

            <InputField label={isEnglish ? 'Dynamic load rating C (kN)' : 'Dinamik yük kapasitesi C (kN)'} value={C} onChange={setC} placeholder="30" />
            <InputField label={isEnglish ? 'Equivalent dynamic load P (kN)' : 'Eşdeğer dinamik yük P (kN)'} value={P} onChange={setP} placeholder="5" />
            <InputField label={isEnglish ? 'Rotational speed n (rpm)' : 'Devir sayısı n (rpm)'} value={n} onChange={setN} placeholder="1450" />

            <button
              onClick={hesapla}
              className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg active:scale-[0.98]"
              type="button"
            >
              {isEnglish ? 'Calculate' : 'Hesapla'}
            </button>
          </div>

          {sonuc && (
            <div className="space-y-3">
              <h3 className="font-semibold text-[var(--foreground)]">{isEnglish ? 'Results' : 'Sonuçlar'}</h3>

              <ResultRow label={isEnglish ? 'Life exponent p' : 'Üs p'} value={formatSmartNumber(sonuc.p, numberLocale, 2)} className="calc-soft" valueClassName="text-[var(--foreground)]" />
              <ResultRow label={isEnglish ? 'L₁₀ (million revolutions)' : 'L₁₀ (milyon devir)'} value={`${formatSmartNumber(sonuc.L10, numberLocale, 2)} Mrev`} className="calc-result" valueClassName="text-sky-600 dark:text-sky-400" />
              <ResultRow label={isEnglish ? 'L₁₀ (hours)' : 'L₁₀ (saat)'} value={`${formatSmartNumber(sonuc.L10h, numberLocale, 0)} ${isEnglish ? 'h' : 'sa'}`} className="calc-soft" valueClassName="text-emerald-600 dark:text-emerald-400" />
              <ResultRow label={isEnglish ? 'L₁₀ (years at 8 h/day)' : 'L₁₀ (yıl, 8 sa/gün)'} value={`${formatSmartNumber(sonuc.L10y, numberLocale, 1)} ${isEnglish ? 'years' : 'yıl'}`} className="calc-soft" valueClassName="text-emerald-600 dark:text-emerald-400" />

              <div className={`p-3 rounded-xl border text-sm font-semibold text-center ${sonuc.L10h >= 20000 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                {sonuc.L10h >= 20000
                  ? (isEnglish ? 'Industrial target (>20,000 h) is met' : 'Endüstriyel standart (>20.000 sa) karşılanıyor')
                  : (isEnglish ? 'L10 is below 20,000 h — review the bearing selection' : 'L10 < 20.000 sa — rulman kontrolü gerekli')}
              </div>
            </div>
          )}
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {isEnglish ? 'Basic rating life is calculated using the ISO 281 equation.' : 'Temel ömür hesabı, ISO 281 bağıntısına göre yapılır.'}
          </p>
          <p className="calc-prose mt-2">
            {isEnglish
              ? 'This tool returns basic L₁₀ life. Lubrication, contamination, temperature, alignment and shock loads must also be evaluated in real applications.'
              : 'Bu araç temel L₁₀ ömrünü verir. Gerçek uygulamada yağlama, kirlenme, sıcaklık, hizalama ve darbe yükleri ayrıca değerlendirilmelidir.'}
          </p>
        </div>
      </div>

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">{isEnglish ? 'ISO 281 Note' : 'ISO 281 Notu'}</p>
            <p className="calc-prose">
              <strong>L₁₀ = (C/P)^p</strong> {isEnglish ? 'million revolutions. This is the basic rating life calculation and assumes' : 'milyon devir. Bu hesap temel ömür içindir ve varsayılan olarak'} <strong>a₁ = 1</strong> {isEnglish ? '.' : 'kabul edilir.'}
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">{isEnglish ? 'About bearing life calculation' : 'Rulman ömrü hesabı hakkında'}</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              {isEnglish
                ? 'The calculator estimates basic bearing life from dynamic load rating, equivalent load and rotational speed.'
                : 'Bu araç rulmanın dinamik yük kapasitesi, eşdeğer yük ve devir sayısına göre temel ömrünü hesaplar.'}
            </p>
          </div>
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              {isEnglish
                ? <><strong>Common searches:</strong> bearing life calculator, ISO 281, L10 calculation and bearing operating hours.</>
                : <>Sık aramalar: <strong>rulman ömrü hesaplama</strong>, <strong>iso 281</strong>, <strong> l10 hesabı</strong>, <strong>rulman saat ömrü</strong>.</>}
            </p>
          </div>
        </div>
      </section>

      <TeknikCizimPanel svgContent={svgContent} filename="rulman-omru" title={isEnglish ? 'Bearing Life Analysis' : 'Rulman Ömür Analizi'} />
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input type="text" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))} placeholder={placeholder} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30" />
    </div>
  );
}

function ResultRow({ label, value, className, valueClassName }: { label: string; value: string; className: string; valueClassName?: string }) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-xl ${className}`}>
      <span className="text-sm calc-muted">{label}</span>
      <span className={`font-bold ${valueClassName || 'text-[var(--foreground)]'}`}>{value}</span>
    </div>
  );
}
