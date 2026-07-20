'use client';

import { useMemo, useState } from 'react';
import { Info, Ruler, Triangle } from 'lucide-react';
import type { Tool } from '@/data/tools';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

type Mode = 'diameters-length' | 'diameter-angle-length' | 'ratio-length';

type TaperResult = {
  D: number;
  d: number;
  L: number;
  delta: number;
  halfAngle: number;
  totalAngle: number;
  ratioN: number;
  conicity: number;
  slant: number;
};

const commonRatios = [5, 10, 12, 15, 20, 30, 50, 100];

function NumberInput({ label, value, onChange, unit = 'mm' }: { label: string; value: string; onChange: (v: string) => void; unit?: string }) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
          inputMode="decimal"
          className="calc-panel w-full rounded-xl px-4 py-3 pr-14 outline-none focus:ring-2 focus:ring-amber-500/30"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs calc-muted">{unit}</span>
      </div>
    </div>
  );
}

function Result({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="calc-soft rounded-2xl border border-[var(--border)] p-4">
      <p className="text-xs calc-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{value}</p>
      {note && <p className="mt-2 text-xs leading-relaxed calc-muted">{note}</p>}
    </div>
  );
}

function toDms(value: number) {
  const degree = Math.floor(value);
  const minuteFloat = (value - degree) * 60;
  const minute = Math.floor(minuteFloat);
  const second = (minuteFloat - minute) * 60;
  return `${degree}° ${minute}′ ${formatSmartNumber(second, 'tr-TR', 1)}″`;
}

function resultFromRatio(D: number, L: number, ratioN: number): TaperResult | null {
  if (D <= 0 || L <= 0 || ratioN <= 0) return null;
  const delta = L / ratioN;
  const d = D - delta;
  if (d <= 0) return null;
  const halfAngle = (Math.atan(delta / (2 * L)) * 180) / Math.PI;
  return {
    D,
    d,
    L,
    delta,
    halfAngle,
    totalAngle: halfAngle * 2,
    ratioN,
    conicity: 1 / ratioN,
    slant: Math.sqrt(L * L + Math.pow(delta / 2, 2)),
  };
}

export default function KonikHesaplamaCalculator({ tool }: { tool?: Tool }) {
  const [mode, setMode] = useState<Mode>('diameters-length');
  const [bigDiameter, setBigDiameter] = useState('50');
  const [smallDiameter, setSmallDiameter] = useState('40');
  const [length, setLength] = useState('100');
  const [includedAngle, setIncludedAngle] = useState('5,7248');
  const [ratio, setRatio] = useState('10');

  const result = useMemo<TaperResult | null>(() => {
    const D = parseLocalizedNumber(bigDiameter) || 0;
    const L = parseLocalizedNumber(length) || 0;
    if (D <= 0 || L <= 0) return null;

    if (mode === 'diameters-length') {
      const d = parseLocalizedNumber(smallDiameter) || 0;
      if (d <= 0 || D <= d) return null;
      const delta = D - d;
      const halfAngle = (Math.atan(delta / (2 * L)) * 180) / Math.PI;
      const ratioN = L / delta;
      return {
        D,
        d,
        L,
        delta,
        halfAngle,
        totalAngle: halfAngle * 2,
        ratioN,
        conicity: delta / L,
        slant: Math.sqrt(L * L + Math.pow(delta / 2, 2)),
      };
    }

    if (mode === 'ratio-length') {
      const ratioN = parseLocalizedNumber(ratio) || 0;
      return resultFromRatio(D, L, ratioN);
    }

    const angle = parseLocalizedNumber(includedAngle) || 0;
    if (angle <= 0 || angle >= 180) return null;
    const halfAngleRad = (angle / 2) * (Math.PI / 180);
    const delta = 2 * L * Math.tan(halfAngleRad);
    const d = D - delta;
    if (d <= 0) return null;
    const ratioN = L / delta;
    return {
      D,
      d,
      L,
      delta,
      halfAngle: angle / 2,
      totalAngle: angle,
      ratioN,
      conicity: delta / L,
      slant: Math.sqrt(L * L + Math.pow(delta / 2, 2)),
    };
  }, [bigDiameter, includedAngle, length, mode, ratio, smallDiameter]);

  const fmt = (value: number, digits = 3) => formatSmartNumber(value, 'tr-TR', digits);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-2xl bg-amber-500/10 p-3"><Triangle className="h-6 w-6 text-amber-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">{tool?.name || 'Konik ve Torna Derece Hesaplama'}</h2>
            <p className="calc-prose mt-1">Çaplardan, toplam açıdan veya 1:N koniklik oranından torna yarım açısını, küçük çapı ve konik ölçülerini hesaplayın.</p>
          </div>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <button type="button" onClick={() => setMode('diameters-length')} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${mode === 'diameters-length' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'calc-panel border-[var(--border)] text-[var(--foreground)]'}`}>
            Çaplardan dereceyi bul
          </button>
          <button type="button" onClick={() => setMode('diameter-angle-length')} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${mode === 'diameter-angle-length' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'calc-panel border-[var(--border)] text-[var(--foreground)]'}`}>
            Dereceden küçük çapı bul
          </button>
          <button type="button" onClick={() => setMode('ratio-length')} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${mode === 'ratio-length' ? 'border-amber-500 bg-amber-500 text-slate-950' : 'calc-panel border-[var(--border)] text-[var(--foreground)]'}`}>
            1:N orandan dereceyi bul
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <NumberInput label="Büyük çap D" value={bigDiameter} onChange={setBigDiameter} />
          {mode === 'diameters-length' && <NumberInput label="Küçük çap d" value={smallDiameter} onChange={setSmallDiameter} />}
          {mode === 'diameter-angle-length' && <NumberInput label="Toplam koni açısı" value={includedAngle} onChange={setIncludedAngle} unit="°" />}
          {mode === 'ratio-length' && <NumberInput label="Koniklik oranı 1:N" value={ratio} onChange={setRatio} unit="N" />}
          <NumberInput label="Konik boy L" value={length} onChange={setLength} />
        </div>

        {!result && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
            Büyük çap küçük çaptan büyük olmalı; çap, boy, açı ve oran değerleri sıfırdan büyük girilmelidir.
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Result label="Torna yarım açısı" value={`${fmt(result.halfAngle, 5)}°`} note={toDms(result.halfAngle)} />
            <Result label="Toplam koni açısı" value={`${fmt(result.totalAngle, 5)}°`} note={toDms(result.totalAngle)} />
            <Result label="Koniklik oranı" value={`1 : ${fmt(result.ratioN, 4)}`} note={`Koniklik C = ${fmt(result.conicity, 6)}`} />
            <Result label="Küçük çap" value={`${fmt(result.d, 3)} mm`} note={`Çap farkı D − d = ${fmt(result.delta, 3)} mm`} />
          </div>

          <div className="calc-box-accent">
            <h3 className="calc-section-title flex items-center gap-2"><Triangle className="h-4 w-4" /> Torna derece hesabında kullanılan bağıntılar</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="calc-soft rounded-xl p-4 font-mono text-sm text-[var(--foreground)]">tan(α) = (D − d) / (2L)</div>
              <div className="calc-soft rounded-xl p-4 font-mono text-sm text-[var(--foreground)]">Toplam açı = 2α</div>
              <div className="calc-soft rounded-xl p-4 font-mono text-sm text-[var(--foreground)]">Koniklik = (D − d) / L = 1 / N</div>
            </div>
            <p className="calc-prose mt-3">Üst kızak veya aparat ayarında çoğunlukla yarım açı α kullanılır. Teknik resimdeki açının toplam mı yarım mı olduğu üretimden önce doğrulanmalıdır.</p>
          </div>
        </>
      )}

      <section className="calc-box">
        <h3 className="calc-section-title">Yaygın koniklik oranları ve torna derece tablosu</h3>
        <p className="calc-prose mt-1">Tablodaki değerler, çap değişimine göre tanımlanan 1:N koniklik oranı içindir.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[650px] border-collapse text-sm">
            <thead className="calc-soft text-left">
              <tr>
                <th className="px-4 py-3">Koniklik</th>
                <th className="px-4 py-3">Torna yarım açısı</th>
                <th className="px-4 py-3">Toplam koni açısı</th>
                <th className="px-4 py-3">100 mm boyda çap farkı</th>
              </tr>
            </thead>
            <tbody>
              {commonRatios.map((ratioN) => {
                const half = (Math.atan(1 / (2 * ratioN)) * 180) / Math.PI;
                return (
                  <tr key={ratioN} className="border-t border-[var(--border)] text-[var(--foreground)]">
                    <td className="px-4 py-3 font-bold">1:{ratioN}</td>
                    <td className="px-4 py-3 text-amber-500 font-semibold">{fmt(half, 5)}°</td>
                    <td className="px-4 py-3">{fmt(half * 2, 5)}°</td>
                    <td className="px-4 py-3">{fmt(100 / ratioN, 3)} mm</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Ruler className="h-4 w-4" /> Ölçü tanımı</h3><p className="calc-prose mt-2">D ve d aynı eksen üzerindeki büyük ve küçük çap; L ise bu iki çap arasındaki eksenel boydur. Boy, eğik yüzey uzunluğu değildir.</p></div>
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Info className="h-4 w-4" /> 1:10 koniklik</h3><p className="calc-prose mt-2">1:10 oranı, eksen boyunca 10 mm ilerlemede çapın 1 mm değiştiğini ifade eder. Bu oran için torna yarım açısı yaklaşık 2,8624°’dir.</p></div>
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Triangle className="h-4 w-4" /> İmalat kontrolü</h3><p className="calc-prose mt-2">Torna ayarı sonrası mastar, boyalı temas kontrolü veya iki farklı kesitte çap ölçümüyle gerçek koniklik doğrulanmalıdır.</p></div>
      </section>
    </div>
  );
}
