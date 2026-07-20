'use client';

import { useState } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { Activity, RotateCw, Gauge, Info, Sparkles } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Sonuc = {
  f_Hz: number;
  omega: number;
  v_ms: number;
  v_kmh: number;
  n_sync: number;
  T_rev: number;
  n: number;
};

export default function FrekansDevirCalculator() {
  const { saveCalculation } = useCalculationHistory();

  const [val, setVal] = useState('1450');
  const [d, setD] = useState('150');
  const [p, setP] = useState('4');
  const [f, setF] = useState('50');
  const [svgContent, setSvgContent] = useState<string>('');
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);

  const hesapla = () => {
    const n = parseLocalizedNumber(val) || 1450;
    const dv = parseLocalizedNumber(d) || 150;
    const pv = parseInt(p, 10) || 4;
    const fv = parseLocalizedNumber(f) || 50;

    const f_Hz = n / 60;
    const omega = (2 * Math.PI * n) / 60;
    const v_ms = (Math.PI * (dv / 1000) * n) / 60;
    const v_kmh = v_ms * 3.6;
    const n_sync = (120 * fv) / pv;
    const T_rev = 60 / n;

    const yeniSonuc: Sonuc = {
      f_Hz: +f_Hz.toFixed(3),
      omega: +omega.toFixed(3),
      v_ms: +v_ms.toFixed(3),
      v_kmh: +v_kmh.toFixed(2),
      n_sync: +n_sync.toFixed(0),
      T_rev: +(T_rev * 1000).toFixed(2),
      n,
    };

    setSonuc(yeniSonuc);

    setSvgContent(
      generateDrawing({
        type: 'devir_frekans',
        rpm: n,
        diameter: dv,
        pole: pv,
        frequency: fv,
        result: v_ms,
      })
    );

    saveCalculation({
      toolSlug: 'devir-frekans-donusumu',
      toolName: 'Devir-Frekans Dönüşümü',
      category: 'makine',
      inputs: { 'n(rpm)': n, 'd(mm)': dv, 'f(Hz)': fv, 'p(kutup)': pv },
      outputs: {
        'f(Hz)': +f_Hz.toFixed(3),
        'ω(rad/s)': +omega.toFixed(2),
        'v(m/s)': +v_ms.toFixed(3),
      },
      summary: `n=${n}rpm → f=${f_Hz.toFixed(2)}Hz, ω=${omega.toFixed(1)}rad/s, v=${v_ms.toFixed(2)}m/s`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10">
            <RotateCw className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Devir Frekans Dönüşümü</h2>
            <p className="calc-prose mt-1">
              Devir sayısından frekans, açısal hız, çevre hızı ve motor senkron devir hesaplarını hızlıca yapın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InputField
              label="Devir sayısı n (rpm)"
              value={val}
              onChange={setVal}
              icon={<RotateCw className="w-4 h-4" />}
            />

            <InputField
              label="Çap d (mm) — çevre hızı için"
              value={d}
              onChange={setD}
              icon={<Activity className="w-4 h-4" />}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="calc-title">Şebeke f (Hz)</label>
                <select
                  value={f}
                  onChange={(e) => setF(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="50">50 Hz (TR/EU)</option>
                  <option value="60">60 Hz (US)</option>
                </select>
              </div>

              <div>
                <label className="calc-title">Kutup sayısı</label>
                <select
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="2">2 kutup (3000 rpm)</option>
                  <option value="4">4 kutup (1500 rpm)</option>
                  <option value="6">6 kutup (1000 rpm)</option>
                  <option value="8">8 kutup (750 rpm)</option>
                </select>
              </div>
            </div>

            <div className="calc-box-accent">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Devir, frekans ve çevre hızı ilişkisi aynı anda değerlendirilir.
              </p>
              <p className="calc-prose mt-2">
                Özellikle motor, redüktör, kasnak ve dönen ekipman hesaplarında hızlı ön kontrol sağlar.
              </p>
            </div>

            <button
              onClick={hesapla}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg active:scale-[0.98]"
              type="button"
            >
              Hesapla
            </button>
          </div>

          {sonuc ? (
            <div className="space-y-3">
              {[
                { l: 'Frekans f', v: `${formatSmartNumber(sonuc.f_Hz, 'tr-TR', 3)} Hz`, accent: false },
                { l: 'Açısal hız ω', v: `${formatSmartNumber(sonuc.omega, 'tr-TR', 3)} rad/s`, accent: false },
                { l: 'Çevre hızı v', v: `${formatSmartNumber(sonuc.v_ms, 'tr-TR', 3)} m/s`, accent: true },
                { l: 'Çevre hızı v', v: `${formatSmartNumber(sonuc.v_kmh, 'tr-TR', 2)} km/h`, accent: false },
                { l: 'Periyot T', v: `${formatSmartNumber(sonuc.T_rev, 'tr-TR', 2)} ms/dev`, accent: false },
                { l: 'Senkron devir n₀', v: `${formatSmartNumber(sonuc.n_sync, 'tr-TR', 0)} rpm`, accent: true },
              ].map((r, i) => (
                <div
                  key={i}
                  className={r.accent ? 'calc-result rounded-xl p-4 flex justify-between' : 'calc-soft rounded-xl p-4 flex justify-between'}
                >
                  <span className="text-sm calc-muted">{r.l}</span>
                  <span className="font-bold text-[var(--foreground)]">{r.v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="calc-soft rounded-2xl border border-dashed border-[var(--border)] min-h-[280px] flex items-center justify-center p-6">
              <p className="calc-muted text-sm text-center">
                Parametreleri girin ve sonucu görmek için hesapla butonuna basın.
              </p>
            </div>
          )}
        </div>
      </div>

      {svgContent && (
        <TeknikCizimPanel
          svgContent={svgContent}
          filename="devir-frekans"
          title="Devir ve Hareket Diyagramı"
        />
      )}

      <div className="calc-panel rounded-xl p-4 text-xs">
        <p className="font-mono calc-muted leading-7">
          ω = 2πn / 60 · v = πdn / 60000 · n_senkron = 120f / p
        </p>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Devir ve frekans hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, dönme hareketinde devir sayısından frekans, açısal hız ve çevre hızını hesaplar.
              Ayrıca AC motorlar için kutup sayısına göre teorik senkron devir değerini verir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>rpm hz dönüşümü</strong>, <strong>devir frekans hesabı</strong>,
              <strong> açısal hız hesaplama</strong>, <strong>senkron motor devri</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="calc-prose">
              Senkron devir değeri teoriktir. Gerçek motor devirleri kayma, yük ve sürücü karakteristiğine bağlı olarak farklı olabilir.
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
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="calc-title flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}