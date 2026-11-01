'use client';

import { useMemo, useState } from 'react';
import { Gauge, Info, Wrench } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';
import type { Locale } from '@/lib/siteLanguage';

const CLASSES: Record<string, { yieldStrength: number; ratio: number; note: string }> = {
  '8.8': { yieldStrength: 640, ratio: 0.75, note: 'Genel makine imalatında yaygın ön sıkma seviyesi' },
  '10.9': { yieldStrength: 900, ratio: 0.75, note: 'Yüksek dayanımlı bağlantılar için' },
  '12.9': { yieldStrength: 1080, ratio: 0.70, note: 'Yüksek dayanım, dikkatli montaj gerektirir' },
  'A2-70': { yieldStrength: 450, ratio: 0.65, note: 'Paslanmaz bağlantılar için yaklaşık ön kontrol' },
};

const THREADS: Record<string, { d: number; pitch: number; area: number }> = {
  M3: { d: 3, pitch: 0.5, area: 5.03 },
  M4: { d: 4, pitch: 0.7, area: 8.78 },
  M5: { d: 5, pitch: 0.8, area: 14.2 },
  M6: { d: 6, pitch: 1.0, area: 20.1 },
  M8: { d: 8, pitch: 1.25, area: 36.6 },
  M10: { d: 10, pitch: 1.5, area: 58.0 },
  M12: { d: 12, pitch: 1.75, area: 84.3 },
  M16: { d: 16, pitch: 2.0, area: 157 },
  M20: { d: 20, pitch: 2.5, area: 245 },
  M24: { d: 24, pitch: 3.0, area: 353 },
  M30: { d: 30, pitch: 3.5, area: 561 },
  M36: { d: 36, pitch: 4.0, area: 817 },
};

export default function CivataTorkCalculator({ locale = 'tr' }: { locale?: Locale }) {
  const isEnglish = locale === 'en';
  const numberLocale = isEnglish ? 'en-US' : 'tr-TR';
  const [thread, setThread] = useState('M10');
  const [grade, setGrade] = useState('8.8');
  const [k, setK] = useState('0.20');
  const [customPreload, setCustomPreload] = useState('');

  const result = useMemo(() => {
    const t = THREADS[thread];
    const g = CLASSES[grade];
    const nut = parseLocalizedNumber(k) || 0;
    if (!t || !g || !Number.isFinite(nut) || nut <= 0) return null;

    const autoPreload = t.area * g.yieldStrength * g.ratio;
    const manual = parseLocalizedNumber(customPreload);
    const manualUsed = customPreload.trim() !== '';
    if (manualUsed && (!Number.isFinite(manual) || manual <= 0)) return null;
    const preload = manualUsed ? manual : autoPreload;
    const torque = nut * preload * (t.d / 1000);
    const low = torque * 0.85;
    const high = torque * 1.15;

    return { t, g, preload, torque, low, high, autoPreload, manualUsed };
  }, [thread, grade, k, customPreload]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10"><Wrench className="w-6 h-6 text-amber-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {isEnglish ? 'Bolt Tightening Torque Calculator' : 'Cıvata Sıkma Torku Hesaplama'}
            </h2>
            <p className="calc-prose mt-1">
              {isEnglish
                ? 'Estimate tightening torque from metric thread size, property class and nut factor.'
                : 'Metrik vida, kalite sınıfı ve boyutsuz K tork katsayısına göre yaklaşık sıkma torkunu hesaplayın.'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field label={isEnglish ? 'Bolt size' : 'Vida ölçüsü'}>
            <select value={thread} onChange={(e) => setThread(e.target.value)} className="calc-panel w-full px-4 py-3 rounded-xl outline-none">
              {Object.keys(THREADS).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={isEnglish ? 'Bolt property class' : 'Cıvata kalite sınıfı'}>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="calc-panel w-full px-4 py-3 rounded-xl outline-none">
              {Object.keys(CLASSES).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={isEnglish ? 'Nut factor K' : 'Tork katsayısı K (boyutsuz)'}>
            <input value={k} onChange={(e) => setK(e.target.value.replace(/[^0-9.,-]/g, ''))} inputMode="decimal" className="calc-panel w-full px-4 py-3 rounded-xl outline-none" />
          </Field>
          <Field label={isEnglish ? 'Manual preload Fv (N) — optional' : 'Manuel ön yük Fv (N) - isteğe bağlı'}>
            <input
              value={customPreload}
              onChange={(e) => setCustomPreload(e.target.value.replace(/[^0-9.,-]/g, ''))}
              inputMode="decimal"
              placeholder={isEnglish ? 'Automatic when blank' : 'Boşsa otomatik'}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none"
            />
          </Field>
        </div>

        <div className="calc-box-accent mt-6">
          <p className="calc-prose">
            <strong>{isEnglish ? 'Tip:' : 'İpucu:'}</strong>{' '}
            {isEnglish
              ? 'K ≈ 0.20 is a practical assumption for dry/standard assembly; K ≈ 0.15 for lubricated assembly.'
              : 'K ≈ 0,20 kuru/standart montaj, K ≈ 0,15 yağlı montaj için pratik ön kabuldür.'}
          </p>
        </div>
      </div>

      {!result && <p role="alert" className="calc-box">{isEnglish ? 'K and an entered manual preload must be finite positive numbers. Leave manual preload blank to use the estimate.' : 'K ve girilmiş manuel ön yük pozitif, geçerli sayılar olmalıdır. Otomatik tahmin için manuel ön yükü boş bırakın.'}</p>}

      {result && (
        <div className="calc-box">
          <h3 className="text-amber-600 dark:text-amber-400 text-sm font-bold mb-4 flex items-center gap-2">
            <Gauge className="w-4 h-4" /> {isEnglish ? 'Tightening Torque Result' : 'Sıkma Torku Sonucu'}
          </h3>
          <div className="grid md:grid-cols-3 gap-3">
            <Result label={isEnglish ? 'Estimated torque' : 'Tahmini tork'} value={`${formatSmartNumber(result.torque, numberLocale, 1)} Nm`} strong />
            <Result label={isEnglish ? 'Illustrative ±15% sensitivity' : 'Örnek ±%15 duyarlılık'} value={`${formatSmartNumber(result.low, numberLocale, 1)} - ${formatSmartNumber(result.high, numberLocale, 1)} Nm`} />
            <Result label={isEnglish ? 'Preload' : 'Ön yük'} value={`${formatSmartNumber(result.preload, numberLocale, 0)} N`} />
            <Result label={isEnglish ? 'Tensile stress area' : 'Diş çekme alanı'} value={`${formatSmartNumber(result.t.area, numberLocale, 2)} mm²`} />
            <Result label={isEnglish ? 'Pitch' : 'Hatve'} value={`${result.t.pitch} mm`} />
            <Result label={isEnglish ? 'Nominal yield benchmark' : 'Nominal akma dayanımı varsayımı'} value={`${result.g.yieldStrength} MPa`} />
            <Result label={isEnglish ? 'Automatic preload fraction' : 'Otomatik ön yük oranı'} value={`%${formatSmartNumber(result.g.ratio * 100, numberLocale, 0)}`} />
            <Result label={isEnglish ? 'Preload source' : 'Kaynak'} value={result.manualUsed ? (isEnglish ? 'Manual Fv' : 'Manuel Fv') : (isEnglish ? 'Automatic preload' : 'Otomatik ön yük')} />
          </div>
        </div>
      )}

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">{isEnglish ? 'Formula and usage note' : 'Formül ve kullanım notu'}</h3>
        </div>
        <div className="calc-soft rounded-xl p-4 calc-prose">
          {isEnglish ? (
            <>Approximate formula: <strong>T = K × Fv × d</strong>. With Fv in N and d in m, T is in Nm. K is a dimensionless nut factor, not a friction coefficient. Automatic preload uses a stated fraction of nominal yield strength × tensile stress area; the ±15% band is a sensitivity example, not an acceptance tolerance. For critical joints, also verify the manufacturer torque table, lubrication condition and assembly procedure.</>
          ) : (
            <>Yaklaşık formül: <strong>T = K × Fv × d</strong>. Fv N, d metre girildiğinde T Nm çıkar. K boyutsuz tork katsayısıdır; sürtünme katsayısıyla aynı değildir. Otomatik ön yük, nominal akma dayanımı × çekme alanının seçili oranıdır; ±%15 aralığı kabul toleransı değil, örnek duyarlılıktır. Kritik bağlantılarda üretici tablosu, yağlama durumu ve montaj prosedürü ayrıca kontrol edilmelidir.</>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="calc-title block mb-2">{label}</span>{children}</label>;
}

function Result({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}>
      <div className="calc-muted text-xs mb-1">{label}</div>
      <div className={`font-bold ${strong ? 'text-2xl text-amber-600 dark:text-amber-400' : 'text-[var(--foreground)]'}`}>{value}</div>
    </div>
  );
}
