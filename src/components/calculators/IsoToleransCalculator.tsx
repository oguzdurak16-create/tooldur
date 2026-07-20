'use client';

import { useMemo, useState } from 'react';
import { Ruler, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Row = { max: number; it6: number; it7: number; it8: number; g: number; f: number; k: number; m: number };

const TABLE: Row[] = [
  { max: 3, it6: 6, it7: 10, it8: 14, g: -2, f: -6, k: 0, m: 2 },
  { max: 6, it6: 8, it7: 12, it8: 18, g: -4, f: -10, k: 1, m: 4 },
  { max: 10, it6: 9, it7: 15, it8: 22, g: -5, f: -13, k: 1, m: 6 },
  { max: 18, it6: 11, it7: 18, it8: 27, g: -6, f: -16, k: 1, m: 7 },
  { max: 30, it6: 13, it7: 21, it8: 33, g: -7, f: -20, k: 2, m: 8 },
  { max: 50, it6: 16, it7: 25, it8: 39, g: -9, f: -25, k: 2, m: 9 },
  { max: 80, it6: 19, it7: 30, it8: 46, g: -10, f: -30, k: 2, m: 11 },
  { max: 120, it6: 22, it7: 35, it8: 54, g: -12, f: -36, k: 3, m: 13 },
];

const fits = ['H7/h6', 'H7/g6', 'H7/f7', 'H7/k6', 'H7/m6', 'H8/h7'] as const;

function getRange(d: number) { return TABLE.find((r) => d <= r.max) || TABLE[TABLE.length - 1]; }

function shaftDeviation(fit: string, row: Row) {
  const shaft = fit.split('/')[1];
  if (shaft === 'h6') return { es: 0, ei: -row.it6, grade: row.it6 };
  if (shaft === 'h7') return { es: 0, ei: -row.it7, grade: row.it7 };
  if (shaft === 'g6') return { es: row.g, ei: row.g - row.it6, grade: row.it6 };
  if (shaft === 'f7') return { es: row.f, ei: row.f - row.it7, grade: row.it7 };
  if (shaft === 'k6') return { es: row.k + row.it6, ei: row.k, grade: row.it6 };
  if (shaft === 'm6') return { es: row.m + row.it6, ei: row.m, grade: row.it6 };
  return { es: 0, ei: -row.it6, grade: row.it6 };
}

export default function IsoToleransCalculator() {
  const [diameter, setDiameter] = useState('30');
  const [fit, setFit] = useState<(typeof fits)[number]>('H7/h6');

  const result = useMemo(() => {
    const d = parseLocalizedNumber(diameter) || 0;
    if (d <= 0 || d > 120) return null;
    const row = getRange(d);
    const holeGrade = fit.startsWith('H8') ? row.it8 : row.it7;
    const hole = { es: holeGrade, ei: 0 };
    const shaft = shaftDeviation(fit, row);
    const holeMin = d + hole.ei / 1000;
    const holeMax = d + hole.es / 1000;
    const shaftMin = d + shaft.ei / 1000;
    const shaftMax = d + shaft.es / 1000;
    const minClearance = holeMin - shaftMax;
    const maxClearance = holeMax - shaftMin;
    const type = minClearance > 0 ? 'Boşluklu geçme' : maxClearance < 0 ? 'Sıkı geçme' : 'Geçiş geçmesi';
    return { d, row, holeGrade, shaft, holeMin, holeMax, shaftMin, shaftMax, minClearance, maxClearance, type };
  }, [diameter, fit]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10"><Ruler className="w-6 h-6 text-cyan-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">ISO Geçme ve Tolerans Hesaplayıcı</h2>
            <p className="calc-prose mt-1">H7/h6, H7/g6, H7/f7, H7/k6, H7/m6 ve H8/h7 için pratik tolerans ön kontrolü yapın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="block"><span className="calc-title block mb-2">Nominal çap (mm)</span><input value={diameter} onChange={(e) => setDiameter(e.target.value.replace(/[^0-9.,]/g, ''))} inputMode="decimal" className="calc-panel w-full px-4 py-3 rounded-xl outline-none" /></label>
          <label className="block"><span className="calc-title block mb-2">Geçme tipi</span><select value={fit} onChange={(e) => setFit(e.target.value as any)} className="calc-panel w-full px-4 py-3 rounded-xl outline-none">{fits.map((f) => <option key={f} value={f}>{f}</option>)}</select></label>
        </div>

        <div className="calc-box-accent mt-6"><p className="calc-prose">Bu araç 0-120 mm aralığında hızlı ön kontrol içindir. Son teknik resim ve kalite dokümanı için güncel ISO 286 tablosu ayrıca doğrulanmalıdır.</p></div>
      </div>

      {result && (
        <div className="calc-box">
          <h3 className="text-cyan-600 dark:text-cyan-400 text-sm font-bold mb-4">🎯 Tolerans Sonucu</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Result label="Geçme sınıfı" value={result.type} strong />
            <Result label="Boşluk / sıkılık aralığı" value={`${formatSmartNumber(result.minClearance * 1000, 'tr-TR', 0)} / ${formatSmartNumber(result.maxClearance * 1000, 'tr-TR', 0)} µm`} />
            <Result label="Delik min - max" value={`${formatSmartNumber(result.holeMin, 'tr-TR', 4)} - ${formatSmartNumber(result.holeMax, 'tr-TR', 4)} mm`} />
            <Result label="Mil min - max" value={`${formatSmartNumber(result.shaftMin, 'tr-TR', 4)} - ${formatSmartNumber(result.shaftMax, 'tr-TR', 4)} mm`} />
            <Result label="Delik sapması" value={`0 / +${result.holeGrade} µm`} />
            <Result label="Mil sapması" value={`${result.shaft.ei} / ${result.shaft.es} µm`} />
          </div>
        </div>
      )}

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2"><Info className="w-4 h-4 text-cyan-500" /><h3 className="calc-section-title">Pratik kullanım</h3></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4 calc-prose"><strong>H7/h6</strong> hassas boşluklu geçme, <strong>H7/g6</strong> rahat kayan geçme, <strong>H7/f7</strong> serbest geçme için kullanılır.</div>
          <div className="calc-soft rounded-xl p-4 calc-prose"><strong>H7/k6</strong> ve <strong>H7/m6</strong> geçiş/sıkı geçme ön kontrolünde kullanılır. Gerçek montaj; malzeme, yüzey ve ısıl işlemden etkilenir.</div>
        </div>
      </section>
    </div>
  );
}

function Result({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={strong ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}><div className="calc-muted text-xs mb-1">{label}</div><div className={`font-bold ${strong ? 'text-xl text-cyan-600 dark:text-cyan-400' : 'text-[var(--foreground)]'}`}>{value}</div></div>;
}
