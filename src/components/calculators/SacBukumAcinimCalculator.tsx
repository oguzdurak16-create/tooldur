'use client';

import { useMemo, useState } from 'react';
import { Ruler, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

export default function SacBukumAcinimCalculator() {
  const [a, setA] = useState('100');
  const [b, setB] = useState('60');
  const [t, setT] = useState('3');
  const [r, setR] = useState('3');
  const [angle, setAngle] = useState('90');
  const [k, setK] = useState('0.40');
  const [qty, setQty] = useState('1');

  const result = useMemo(() => {
    const A = parseLocalizedNumber(a) || 0;
    const B = parseLocalizedNumber(b) || 0;
    const T = parseLocalizedNumber(t) || 0;
    const R = parseLocalizedNumber(r) || 0;
    const ANG = parseLocalizedNumber(angle) || 0;
    const K = parseLocalizedNumber(k) || 0;
    const Q = parseLocalizedNumber(qty) || 1;
    if (A <= 0 || B <= 0 || T <= 0 || R < 0 || ANG <= 0 || ANG >= 180 || K <= 0 || K >= 1) return null;

    const rad = ANG * Math.PI / 180;
    const bendAllowance = rad * (R + K * T);
    const outsideSetback = Math.tan(rad / 2) * (R + T);
    const bendDeduction = 2 * outsideSetback - bendAllowance;
    const flatLength = A + B - bendDeduction;
    const minInsideR = T;
    const risk = R < T ? 'İç radius sac kalınlığından küçük. Çatlama/iz riski artar.' : 'İç radius pratik ön kontrol için uygun görünüyor.';

    return { A, B, T, R, ANG, K, Q, bendAllowance, outsideSetback, bendDeduction, flatLength, totalLength: flatLength * Q, minInsideR, risk };
  }, [a, b, t, r, angle, k, qty]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10"><Ruler className="w-6 h-6 text-blue-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Sac Büküm Açınım Hesaplama</h2>
            <p className="calc-prose mt-1">Flanş ölçüsü, sac kalınlığı, iç radius, büküm açısı ve K faktörüne göre açınım boyunu hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="A flanş dış ölçüsü (mm)" value={a} setValue={setA} />
          <Input label="B flanş dış ölçüsü (mm)" value={b} setValue={setB} />
          <Input label="Sac kalınlığı t (mm)" value={t} setValue={setT} />
          <Input label="İç radius R (mm)" value={r} setValue={setR} />
          <Input label="Büküm açısı (°)" value={angle} setValue={setAngle} />
          <Input label="K faktörü" value={k} setValue={setK} />
          <Input label="Adet" value={qty} setValue={setQty} />
        </div>

        <div className="calc-box-accent mt-6">
          <p className="calc-prose">6 mm, 8 mm, 10 mm gibi kalın saclarda da sonuç verir. Kalın saclarda gerçek değer; kalıp ağzı, malzeme ve pres abkant ayarına göre değişebilir.</p>
        </div>
      </div>

      {result && (
        <div className="calc-box">
          <h3 className="text-blue-600 dark:text-blue-400 text-sm font-bold mb-4">📐 Açınım Sonucu</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <Result label="Tek parça açınım" value={`${formatSmartNumber(result.flatLength, 'tr-TR', 2)} mm`} strong />
            <Result label="Büküm payı BA" value={`${formatSmartNumber(result.bendAllowance, 'tr-TR', 2)} mm`} />
            <Result label="Büküm düşümü BD" value={`${formatSmartNumber(result.bendDeduction, 'tr-TR', 2)} mm`} />
            <Result label="Outside setback" value={`${formatSmartNumber(result.outsideSetback, 'tr-TR', 2)} mm`} />
            <Result label="Toplam boy" value={`${formatSmartNumber(result.totalLength, 'tr-TR', 2)} mm`} />
            <Result label="Önerilen min. iç R" value={`≈ ${formatSmartNumber(result.minInsideR, 'tr-TR', 1)} mm`} />
          </div>
          <div className="calc-soft rounded-xl p-4 mt-4 calc-prose"><strong>Kontrol:</strong> {result.risk}</div>
        </div>
      )}

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /><h3 className="calc-section-title">Formül</h3></div>
        <div className="calc-soft rounded-xl p-4 calc-prose">
          BA = θ × (R + K × t), OSSB = tan(θ / 2) × (R + t), BD = 2 × OSSB − BA, Açınım = A + B − BD. θ radyan cinsinden büküm açısıdır.
        </div>
      </section>
    </div>
  );
}

function Input({ label, value, setValue }: { label: string; value: string; setValue: (v: string) => void }) {
  return <label className="block"><span className="calc-title block mb-2">{label}</span><input value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9.,-]/g, ''))} inputMode="decimal" className="calc-panel w-full px-4 py-3 rounded-xl outline-none" /></label>;
}

function Result({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={strong ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}><div className="calc-muted text-xs mb-1">{label}</div><div className={`font-bold ${strong ? 'text-2xl text-blue-600 dark:text-blue-400' : 'text-[var(--foreground)]'}`}>{value}</div></div>;
}
