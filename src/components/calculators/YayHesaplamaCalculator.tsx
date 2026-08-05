'use client';

import { useMemo, useState } from 'react';
import { Activity, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Result = { k: number; delta: number; ratio: number; wahl: number; stress: number; solidLength: number };

export default function YayHesaplamaCalculator() {
  const [d, setD] = useState('5');
  const [D, setDMean] = useState('40');
  const [n, setN] = useState('8');
  const [G, setG] = useState('80000');
  const [F, setF] = useState('500');

  const result = useMemo<Result | null>(() => {
    const wire = parseLocalizedNumber(d);
    const mean = parseLocalizedNumber(D);
    const turns = parseLocalizedNumber(n);
    const shearModulus = parseLocalizedNumber(G);
    const force = parseLocalizedNumber(F);
    if ([wire, mean, turns, shearModulus, force].some((value) => Number.isNaN(value) || value <= 0) || mean <= wire) return null;

    const ratio = mean / wire;
    if (ratio <= 1) return null;
    const k = (shearModulus * wire ** 4) / (8 * mean ** 3 * turns);
    const delta = force / k;
    const wahl = (4 * ratio - 1) / (4 * ratio - 4) + 0.615 / ratio;
    const stress = (wahl * 8 * force * mean) / (Math.PI * wire ** 3);
    const solidLength = (turns + 2) * wire;
    return { k, delta, ratio, wahl, stress, solidLength };
  }, [D, F, G, d, n]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10"><Activity className="w-6 h-6 text-blue-500" /></div>
          <div><h2 className="text-xl font-bold text-[var(--foreground)]">Yay Hesaplama</h2><p className="calc-prose mt-1">Silindirik helisel basma yayı için rijitlik, sıkışma ve kayma gerilmesi ön hesabı.</p></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Tel çapı d (mm)" value={d} onChange={setD} />
          <Input label="Orta çap D (mm)" value={D} onChange={setDMean} />
          <Input label="Etkin sarım sayısı n" value={n} onChange={setN} />
          <Input label="Kayma modülü G (MPa)" value={G} onChange={setG} />
          <Input label="Kuvvet F (N)" value={F} onChange={setF} />
        </div>
      </div>

      {result && (
        <div className="calc-box">
          <h3 className="text-blue-600 dark:text-blue-400 text-sm font-bold mb-4">Yay Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card label="Yay rijitliği" value={`${formatSmartNumber(result.k, 'tr-TR', 2)} N/mm`} />
            <Card label="Sıkışma" value={`${formatSmartNumber(result.delta, 'tr-TR', 2)} mm`} />
            <Card label="Sarım oranı C" value={formatSmartNumber(result.ratio, 'tr-TR', 2)} />
            <Card label="Wahl faktörü" value={formatSmartNumber(result.wahl, 'tr-TR', 3)} />
            <Card label="Maks. kayma gerilmesi" value={`${formatSmartNumber(result.stress, 'tr-TR', 1)} MPa`} />
            <Card label="Yaklaşık blok boyu" value={`${formatSmartNumber(result.solidLength, 'tr-TR', 1)} mm`} />
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3"><Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" /><p className="calc-prose"><strong>(n + 2) × d</strong> serbest boy değil, yaklaşık blok/katı boydur. Serbest boy; çalışma stroku, ön yük, blok payı ve uç formuna göre ayrıca belirlenmelidir.</p></div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="calc-title block mb-2">{label}</label><input value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))} inputMode="decimal" className="calc-panel w-full px-4 py-3 rounded-xl outline-none" /></div>;
}

function Card({ label, value }: { label: string; value: string }) {
  return <div className="calc-soft rounded-xl p-4"><p className="text-xs calc-muted mb-1">{label}</p><p className="font-bold text-[var(--foreground)]">{value}</p></div>;
}
