'use client';

import { useState } from 'react';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Droplets, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const OILS: Record<string, { nu40: number; nu100: number; name: string }> = {
  'ISO VG 32': { nu40: 32, nu100: 5.4, name: 'Hidrolik yağ' },
  'ISO VG 46': { nu40: 46, nu100: 6.8, name: 'Hidrolik yağ' },
  'ISO VG 68': { nu40: 68, nu100: 8.7, name: 'Makine yağı' },
  'ISO VG 100': { nu40: 100, nu100: 11.4, name: 'Dişli yağı' },
  'ISO VG 150': { nu40: 150, nu100: 15.0, name: 'Dişli yağı' },
  'SAE 10W-40': { nu40: 95, nu100: 14.5, name: 'Motor yağı' },
  'SAE 5W-30': { nu40: 62, nu100: 10.5, name: 'Motor yağı' },
};

type Mode = 'cevirici' | 'yag';

type CeviriciSonuc = {
  'mm²/s (cSt)': number;
  'm²/s': number;
  'cP (mPa·s)': number;
  'Pa·s': number;
  'poise (P)': number;
};

type YagSonuc = {
  nu: number;
  T: number;
  yag: string;
  desc: string;
};

export default function ViskoziteCalculator() {
  const { saveCalculation } = useCalculationHistory();

  const [mode, setMode] = useState<Mode>('cevirici');
  const [val, setVal] = useState('100');
  const [from, setFrom] = useState('mm²/s (cSt)');
  const [rho, setRho] = useState('870');
  const [yag, setYag] = useState('ISO VG 46');
  const [temp, setTemp] = useState('40');

  const [sonuc, setSonuc] = useState<CeviriciSonuc | YagSonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const hesapla = () => {
    if (mode === 'cevirici') {
      const v = parseLocalizedNumber(val) || 100;
      const r = parseLocalizedNumber(rho) || 870;

      let nu_cSt = v;

      if (from === 'm²/s') nu_cSt = v * 1e6;
      else if (from === 'cP (mPa·s)') nu_cSt = (v / r) * 1000;
      else if (from === 'Pa·s') nu_cSt = (v / r) * 1e6;
      else if (from === 'poise (P)') nu_cSt = ((v * 100) / r) * 1000;

      const mu_cP = (nu_cSt * r) / 1000;
      const susApprox = nu_cSt > 7.4 ? nu_cSt * 4.635 + 30 : 0;

      const yeniSonuc: CeviriciSonuc = {
        'mm²/s (cSt)': +nu_cSt.toFixed(4),
        'm²/s': +(nu_cSt / 1e6).toExponential(4),
        'cP (mPa·s)': +mu_cP.toFixed(4),
        'Pa·s': +(mu_cP / 1000).toExponential(4),
        'poise (P)': +(mu_cP / 100).toFixed(6),
      };

      setSonuc(yeniSonuc);

      setSvgContent(
        generateDrawing({
          type: 'viskozite_grafik',
          result: +nu_cSt.toFixed(2),
          result2: +mu_cP.toFixed(2),
          result3: +susApprox.toFixed(0),
        })
      );

      saveCalculation({
        toolSlug: 'viskozite-donusumu',
        toolName: 'Viskozite Dönüşümü',
        category: 'makine',
        inputs: {
          [from]: v,
          'ρ(kg/m³)': r,
        },
        outputs: {
          'ν(cSt)': +nu_cSt.toFixed(3),
          'μ(cP)': +mu_cP.toFixed(3),
        },
        summary: `${v} ${from} → ${nu_cSt.toFixed(2)} cSt / ${mu_cP.toFixed(2)} cP`,
      });
    } else {
      const oil = OILS[yag];
      const T = parseLocalizedNumber(temp) || 40;

      const T1 = 313.15;
      const T2 = 373.15;
      const nu1 = oil.nu40;
      const nu2 = oil.nu100;

      const W1 = Math.log10(Math.log10(nu1 + 0.7));
      const W2 = Math.log10(Math.log10(nu2 + 0.7));
      const B = (W1 - W2) / (Math.log10(T2) - Math.log10(T1));
      const A = W1 + B * Math.log10(T1);
      const TK = T + 273.15;
      const W = A - B * Math.log10(TK);
      const nu = Math.pow(10, Math.pow(10, W)) - 0.7;

      const yeniSonuc: YagSonuc = {
        nu: +nu.toFixed(2),
        T,
        yag,
        desc: oil.name,
      };

      setSonuc(yeniSonuc);

      saveCalculation({
        toolSlug: 'viskozite-donusumu',
        toolName: 'Yağ Viskozitesi',
        category: 'makine',
        inputs: {
          [yag]: 1,
          'T(°C)': T,
        },
        outputs: {
          'ν(cSt)': +nu.toFixed(2),
        },
        summary: `${yag} @ ${T}°C → ν=${nu.toFixed(1)} cSt`,
      });
    }
  };

  const isCeviriciSonuc = (data: CeviriciSonuc | YagSonuc | null): data is CeviriciSonuc => {
    return !!data && 'mm²/s (cSt)' in data;
  };

  const isYagSonuc = (data: CeviriciSonuc | YagSonuc | null): data is YagSonuc => {
    return !!data && 'nu' in data && 'desc' in data;
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10">
            <Droplets className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Viskozite Hesaplama
            </h2>
            <p className="calc-prose mt-1">
              Birim dönüşümü yapın veya yağ viskozitesini sıcaklığa göre yaklaşık hesaplayın.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {(['cevirici', 'yag'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              type="button"
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                mode === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
              }`}
            >
              {m === 'cevirici' ? 'Birim Çevirici' : 'Yağ Viskozitesi (Sıcaklık)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
          <div className="space-y-4">
            {mode === 'cevirici' ? (
              <>
                <div>
                  <label className="calc-title block mb-2">Giriş Birimi</label>
                  <select
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {['mm²/s (cSt)', 'm²/s', 'cP (mPa·s)', 'Pa·s', 'poise (P)'].map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Değer"
                  value={val}
                  onChange={setVal}
                  placeholder="100"
                />

                <div>
                  <label className="calc-title block mb-2">Yoğunluk ρ (kg/m³)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rho}
                    onChange={(e) => setRho(e.target.value.replace(/[^0-9.,-]/g, ''))}
                    placeholder="870"
                    className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <p className="text-xs calc-muted mt-1">Mineral yağ ~870, su ~1000</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="calc-title block mb-2">Yağ Sınıfı</label>
                  <select
                    value={yag}
                    onChange={(e) => setYag(e.target.value)}
                    className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {Object.entries(OILS).map(([k, v]) => (
                      <option key={k}>{k} — {v.name}</option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Sıcaklık (°C)"
                  value={temp}
                  onChange={setTemp}
                  placeholder="40"
                />
              </>
            )}

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
              {isCeviriciSonuc(sonuc) ? (
                Object.entries(sonuc).map(([k, v]) => (
                  <div
                    key={k}
                    className={`flex justify-between p-3 rounded-xl ${
                      k === from
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'calc-soft'
                    }`}
                  >
                    <span className="text-sm calc-muted">{k}</span>
                    <span className="font-bold text-blue-700 dark:text-blue-400">
                      {String(v)}
                    </span>
                  </div>
                ))
              ) : isYagSonuc(sonuc) ? (
                <div className="calc-result rounded-xl p-4 text-center">
                  <p className="text-xs calc-muted mb-1">
                    {sonuc.yag.split('—')[0].trim()} @ {sonuc.T}°C
                  </p>
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-400">
                    {formatSmartNumber(sonuc.nu, 'tr-TR', 2)}
                  </p>
                  <p className="text-sm text-blue-500 dark:text-blue-400">mm²/s (cSt)</p>
                  <p className="text-xs calc-muted mt-2">ASTM D341 Walther denklemi</p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Dinamik ve kinematik viskozite dönüşümü yoğunluğa bağlıdır.
          </p>
          <p className="calc-prose mt-2">
            Yağ modu ise ASTM D341 yaklaşımıyla sıcaklığa bağlı yaklaşık viskozite tahmini verir.
          </p>
        </div>
      </div>

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">Viskozite Notu</p>
            <p className="calc-prose">
              Kinematik viskozite birimi genelde <strong>cSt</strong>, dinamik viskozite birimi ise
              <strong> cP</strong> veya <strong>Pa·s</strong> olarak kullanılır.
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Viskozite hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç viskozite birimleri arasında dönüşüm yapar ve belirli yağ sınıfları için sıcaklığa bağlı yaklaşık viskozite hesabı sunar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>viskozite çevirici</strong>, <strong>cst cp dönüşümü</strong>,
              <strong> yağ viskozitesi sıcaklık hesabı</strong>, <strong>astm d341</strong>.
            </p>
          </div>
        </div>
      </section>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="viskozite"
        title="Viskozite Dönüşüm Grafiği"
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
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}