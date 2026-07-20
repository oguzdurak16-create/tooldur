'use client';

import { useState } from 'react';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Activity, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Sonuc = {
  k: number;
  delta: number;
  C: number;
  Wahl: number;
  tau: number;
  L0_est: number;
};

export default function YayHesaplamaCalculator() {
  const { saveCalculation } = useCalculationHistory();

  const [d, setD] = useState('5');
  const [D, setDD] = useState('40');
  const [n, setN] = useState('8');
  const [G, setG] = useState('80000');
  const [F, setF] = useState('500');

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const hesapla = () => {
    const dv = parseLocalizedNumber(d) || 5;
    const Dv = parseLocalizedNumber(D) || 40;
    const nv = parseLocalizedNumber(n) || 8;
    const Gv = parseLocalizedNumber(G) || 80000;
    const Fv = parseLocalizedNumber(F) || 500;

    if ([dv, Dv, nv, Gv, Fv].some((v) => Number.isNaN(v) || v <= 0)) return;

    const k = (Gv * Math.pow(dv, 4)) / (8 * Math.pow(Dv, 3) * nv);
    const delta = Fv / k;
    const C = Dv / dv;
    const Wahl = (4 * C - 1) / (4 * C - 4) + 0.615 / C;
    const tau = (Wahl * 8 * Fv * Dv) / (Math.PI * Math.pow(dv, 3));
    const L0_est = (nv + 2) * dv;

    const yeniSonuc: Sonuc = {
      k: +k.toFixed(2),
      delta: +delta.toFixed(2),
      C: +C.toFixed(2),
      Wahl: +Wahl.toFixed(3),
      tau: +tau.toFixed(1),
      L0_est: +L0_est.toFixed(0),
    };

    setSonuc(yeniSonuc);

    setSvgContent(
      generateDrawing({
        type: 'yay_kesit',
        wireDia: dv,
        coilDia: Dv,
        turns: nv,
        force: Fv,
        stiffness: +k.toFixed(2),
        deflection: +delta.toFixed(2),
      })
    );

    saveCalculation({
      toolSlug: 'yay-hesaplama',
      toolName: 'Yay Hesaplama',
      category: 'makine',
      inputs: {
        'd(mm)': dv,
        'D(mm)': Dv,
        n: nv,
        'G(MPa)': Gv,
        'F(N)': Fv,
      },
      outputs: {
        'k(N/mm)': +k.toFixed(2),
        'δ(mm)': +delta.toFixed(2),
        'τ(MPa)': +tau.toFixed(1),
      },
      summary: `d=${dv}mm D=${Dv}mm n=${nv} → k=${k.toFixed(1)}N/mm, δ=${delta.toFixed(1)}mm`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Yay Hesaplama
            </h2>
            <p className="calc-prose mt-1">
              Basma yayında tel çapı, orta çap, sarım sayısı, kayma modülü ve kuvvete göre rijitlik, sıkışma ve gerilme hesabı yapın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InputField
              label="Tel çapı d (mm)"
              value={d}
              onChange={setD}
              placeholder="5"
            />
            <InputField
              label="Orta çap D (mm)"
              value={D}
              onChange={setDD}
              placeholder="40"
            />
            <InputField
              label="Etkin sarım sayısı n"
              value={n}
              onChange={setN}
              placeholder="8"
            />
            <InputField
              label="Kayma modülü G (MPa)"
              value={G}
              onChange={setG}
              placeholder="80000"
            />
            <InputField
              label="Uygulanan kuvvet F (N)"
              value={F}
              onChange={setF}
              placeholder="500"
            />

            <button
              onClick={hesapla}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              type="button"
            >
              Hesapla
            </button>
          </div>

          {sonuc && (
            <div className="space-y-3">
              <h3 className="font-semibold text-[var(--foreground)]">Sonuçlar</h3>

              {[
                { label: 'Yay rijitliği k', val: `${formatSmartNumber(sonuc.k, 'tr-TR', 2)} N/mm` },
                { label: 'Sıkışma δ', val: `${formatSmartNumber(sonuc.delta, 'tr-TR', 2)} mm` },
                { label: 'Sarım oranı C', val: formatSmartNumber(sonuc.C, 'tr-TR', 2) },
                { label: 'Wahl faktörü K_w', val: formatSmartNumber(sonuc.Wahl, 'tr-TR', 3) },
                { label: 'Max. kayma gerilmesi τ', val: `${formatSmartNumber(sonuc.tau, 'tr-TR', 1)} MPa` },
                { label: 'Tahmini boş boy L₀', val: `${formatSmartNumber(sonuc.L0_est, 'tr-TR', 0)} mm` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between p-3 calc-soft rounded-xl">
                  <span className="text-sm calc-muted">{r.label}</span>
                  <span className="font-bold text-blue-700 dark:text-blue-400">{r.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Bu hesap, silindirik helisel basma yayı için temel mühendislik yaklaşımı kullanır.
          </p>
          <p className="calc-prose mt-2">
            Sonuçlar ön tasarım içindir. Yorulma, uç formu, malzeme sınıfı, emniyet katsayısı ve gerçek çalışma koşulları ayrıca değerlendirilmelidir.
          </p>
        </div>
      </div>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="yay-hesaplama"
        title="Yay Kesit & Diyagramı"
      />

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">Formüller</p>
            <p className="calc-prose">
              <strong>k = Gd⁴ / (8D³n)</strong> · <strong>τ = K_w·8FD / (πd³)</strong> · <strong>C = D/d</strong>
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Yay hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç helisel basma yayı için yay rijitliği, sıkışma miktarı, sarım oranı ve maksimum kayma gerilmesini hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>yay hesaplama</strong>, <strong>yay rijitliği hesabı</strong>,
              <strong> basma yayı hesabı</strong>, <strong>wahl faktörü</strong>.
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
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        placeholder={placeholder}
        className="w-full px-4 py-3 border rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}