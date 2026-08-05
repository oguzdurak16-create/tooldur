'use client';

import { useMemo, useState } from 'react';
import { Ruler, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';
import type { Locale } from '@/lib/siteLanguage';

export default function SacBukumAcinimCalculator({ locale = 'tr' }: { locale?: Locale }) {
  const isEnglish = locale === 'en';
  const numberLocale = isEnglish ? 'en-US' : 'tr-TR';
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
    const risk = R < T
      ? (isEnglish ? 'The inside radius is smaller than the sheet thickness. Cracking and marking risk increases.' : 'İç radius sac kalınlığından küçük. Çatlama/iz riski artar.')
      : (isEnglish ? 'The inside radius appears suitable for a preliminary manufacturing check.' : 'İç radius pratik ön kontrol için uygun görünüyor.');

    return { A, B, T, R, ANG, K, Q, bendAllowance, outsideSetback, bendDeduction, flatLength, totalLength: flatLength * Q, minInsideR, risk };
  }, [a, b, t, r, angle, k, qty, isEnglish]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10"><Ruler className="w-6 h-6 text-blue-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {isEnglish ? 'Sheet Metal Bend Allowance Calculator' : 'Sac Büküm Açınım Hesaplama'}
            </h2>
            <p className="calc-prose mt-1">
              {isEnglish
                ? 'Calculate flat length from flange dimensions, sheet thickness, inside radius, bend angle and K-factor.'
                : 'Flanş ölçüsü, sac kalınlığı, iç radius, büküm açısı ve K faktörüne göre açınım boyunu hesaplayın.'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label={isEnglish ? 'Flange A outside dimension (mm)' : 'A flanş dış ölçüsü (mm)'} value={a} setValue={setA} />
          <Input label={isEnglish ? 'Flange B outside dimension (mm)' : 'B flanş dış ölçüsü (mm)'} value={b} setValue={setB} />
          <Input label={isEnglish ? 'Sheet thickness t (mm)' : 'Sac kalınlığı t (mm)'} value={t} setValue={setT} />
          <Input label={isEnglish ? 'Inside radius R (mm)' : 'İç radius R (mm)'} value={r} setValue={setR} />
          <Input label={isEnglish ? 'Bend angle (°)' : 'Büküm açısı (°)'} value={angle} setValue={setAngle} />
          <Input label={isEnglish ? 'K-factor' : 'K faktörü'} value={k} setValue={setK} />
          <Input label={isEnglish ? 'Quantity' : 'Adet'} value={qty} setValue={setQty} />
        </div>

        <div className="calc-box-accent mt-6">
          <p className="calc-prose">
            {isEnglish
              ? 'The calculator also supports thicker sheets such as 6, 8 and 10 mm. Actual values may vary with die opening, material and press-brake setup.'
              : '6 mm, 8 mm, 10 mm gibi kalın saclarda da sonuç verir. Kalın saclarda gerçek değer; kalıp ağzı, malzeme ve pres abkant ayarına göre değişebilir.'}
          </p>
        </div>
      </div>

      {result && (
        <div className="calc-box">
          <h3 className="text-blue-600 dark:text-blue-400 text-sm font-bold mb-4">
            📐 {isEnglish ? 'Flat Pattern Result' : 'Açınım Sonucu'}
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <Result label={isEnglish ? 'Single-piece flat length' : 'Tek parça açınım'} value={`${formatSmartNumber(result.flatLength, numberLocale, 2)} mm`} strong />
            <Result label={isEnglish ? 'Bend allowance BA' : 'Büküm payı BA'} value={`${formatSmartNumber(result.bendAllowance, numberLocale, 2)} mm`} />
            <Result label={isEnglish ? 'Bend deduction BD' : 'Büküm düşümü BD'} value={`${formatSmartNumber(result.bendDeduction, numberLocale, 2)} mm`} />
            <Result label="Outside setback" value={`${formatSmartNumber(result.outsideSetback, numberLocale, 2)} mm`} />
            <Result label={isEnglish ? 'Total length' : 'Toplam boy'} value={`${formatSmartNumber(result.totalLength, numberLocale, 2)} mm`} />
            <Result label={isEnglish ? 'Recommended minimum inside R' : 'Önerilen min. iç R'} value={`≈ ${formatSmartNumber(result.minInsideR, numberLocale, 1)} mm`} />
          </div>
          <div className="calc-soft rounded-xl p-4 mt-4 calc-prose">
            <strong>{isEnglish ? 'Check:' : 'Kontrol:'}</strong> {result.risk}
          </div>
        </div>
      )}

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /><h3 className="calc-section-title">{isEnglish ? 'Formula' : 'Formül'}</h3></div>
        <div className="calc-soft rounded-xl p-4 calc-prose">
          {isEnglish
            ? 'BA = θ × (R + K × t), OSSB = tan(θ / 2) × (R + t), BD = 2 × OSSB − BA, Flat length = A + B − BD. θ is the bend angle in radians.'
            : 'BA = θ × (R + K × t), OSSB = tan(θ / 2) × (R + t), BD = 2 × OSSB − BA, Açınım = A + B − BD. θ radyan cinsinden büküm açısıdır.'}
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
