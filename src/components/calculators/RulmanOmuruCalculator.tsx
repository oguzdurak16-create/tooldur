'use client';

import { useState } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { Gauge, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type RulmanTipi = 'bilyali' | 'makarali';

type Sonuc = {
  L10: number;
  L10h: number;
  L10y: number;
  p: number;
};

export default function RulmanOmuruCalculator() {
  const { saveCalculation } = useCalculationHistory();

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
      toolName: 'Rulman Ömrü Hesaplama',
      category: 'makine',
      inputs: {
        'C(kN)': Cv,
        'P(kN)': Pv,
        'n(rpm)': nv,
        Tip: tip,
      },
      outputs: {
        'L10(Mrev)': +L10.toFixed(2),
        'L10h(saat)': +L10h.toFixed(0),
        'L10y(yıl)': +L10y.toFixed(1),
      },
      summary: `C=${Cv}kN P=${Pv}kN → L10=${L10h.toFixed(0)} saat (${L10y.toFixed(1)} yıl)`,
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
              Rulman Ömrü Hesaplama
            </h2>
            <p className="calc-prose mt-1">
              ISO 281 temel ömür bağıntısına göre rulman ömrünü milyon devir, saat ve yıl olarak hesaplayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="calc-title block mb-2">Rulman Tipi</label>
              <select
                value={tip}
                onChange={(e) => setTip(e.target.value as RulmanTipi)}
                className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30"
              >
                <option value="bilyali">Bilyalı rulman (p = 3)</option>
                <option value="makarali">Makaralı rulman (p = 10/3)</option>
              </select>
            </div>

            <InputField
              label="Dinamik yük kapasitesi C (kN)"
              value={C}
              onChange={setC}
              placeholder="30"
            />

            <InputField
              label="Eşdeğer dinamik yük P (kN)"
              value={P}
              onChange={setP}
              placeholder="5"
            />

            <InputField
              label="Devir sayısı n (rpm)"
              value={n}
              onChange={setN}
              placeholder="1450"
            />

            <button
              onClick={hesapla}
              className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg active:scale-[0.98]"
              type="button"
            >
              Hesapla
            </button>
          </div>

          {sonuc && (
            <div className="space-y-3">
              <h3 className="font-semibold text-[var(--foreground)]">Sonuçlar</h3>

              <ResultRow
                label="Üs p"
                value={formatSmartNumber(sonuc.p, 'tr-TR', 2)}
                className="calc-soft"
                valueClassName="text-[var(--foreground)]"
              />

              <ResultRow
                label="L₁₀ (milyon devir)"
                value={`${formatSmartNumber(sonuc.L10, 'tr-TR', 2)} Mrev`}
                className="calc-result"
                valueClassName="text-sky-600 dark:text-sky-400"
              />

              <ResultRow
                label="L₁₀ (saat)"
                value={`${formatSmartNumber(sonuc.L10h, 'tr-TR', 0)} sa`}
                className="calc-soft"
                valueClassName="text-emerald-600 dark:text-emerald-400"
              />

              <ResultRow
                label="L₁₀ (yıl, 8 sa/gün)"
                value={`${formatSmartNumber(sonuc.L10y, 'tr-TR', 1)} yıl`}
                className="calc-soft"
                valueClassName="text-emerald-600 dark:text-emerald-400"
              />

              <div
                className={`p-3 rounded-xl border text-sm font-semibold text-center ${
                  sonuc.L10h >= 20000
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                }`}
              >
                {sonuc.L10h >= 20000
                  ? '✓ Endüstriyel standart (>20.000 sa) karşılanıyor'
                  : '⚠ L10 < 20.000 sa — rulman kontrolü gerekli'}
              </div>
            </div>
          )}
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Temel ömür hesabı, ISO 281 bağıntısına göre yapılır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç temel L₁₀ ömrünü verir. Gerçek uygulamada yağlama, kirlenme, sıcaklık, hizalama ve darbe yükleri ayrıca değerlendirilmelidir.
          </p>
        </div>
      </div>

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">ISO 281 Notu</p>
            <p className="calc-prose">
              <strong>L₁₀ = (C/P)^p</strong> milyon devir. Bu hesap temel ömür içindir ve varsayılan olarak
              <strong> a₁ = 1</strong> kabul edilir.
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Rulman ömrü hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç rulmanın dinamik yük kapasitesi, eşdeğer yük ve devir sayısına göre temel ömrünü hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>rulman ömrü hesaplama</strong>, <strong>iso 281</strong>,
              <strong> l10 hesabı</strong>, <strong>rulman saat ömrü</strong>.
            </p>
          </div>
        </div>
      </section>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="rulman-omru"
        title="Rulman Ömür Analizi"
      />
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
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        placeholder={placeholder}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30"
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string;
  value: string;
  className: string;
  valueClassName?: string;
}) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-xl ${className}`}>
      <span className="text-sm calc-muted">{label}</span>
      <span className={`font-bold ${valueClassName || 'text-[var(--foreground)]'}`}>
        {value}
      </span>
    </div>
  );
}