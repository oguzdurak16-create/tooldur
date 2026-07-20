'use client';

import { useMemo, useState } from 'react';
import { FlaskConical, Info } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

export default function MolariteSeyreltmeCalculator() {
  const [stok, setStok] = useState('1');
  const [hedef, setHedef] = useState('0.1');
  const [hacim, setHacim] = useState('500');

  const hesap = useMemo(() => {
    const c1 = parseLocalizedNumber(stok);
    const c2 = parseLocalizedNumber(hedef);
    const v2 = parseLocalizedNumber(hacim);
    if (c1 <= 0 || c2 <= 0 || v2 <= 0 || c2 > c1) return null;

    const v1 = (c2 * v2) / c1;
    const solvent = v2 - v1;
    const dilution = c1 / c2;

    return { c1, c2, v2, v1, solvent, dilution };
  }, [hacim, hedef, stok]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <FlaskConical className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Molarite Seyreltme Hesaplama</h2>
            <p className="calc-prose mt-1">C1V1 = C2V2 bağıntısıyla çözelti hazırlama hacimlerini bulun.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Stok molarite C1 (M)" value={stok} onChange={setStok} />
          <Input label="Hedef molarite C2 (M)" value={hedef} onChange={setHedef} />
          <Input label="Final hacim V2 (mL)" value={hacim} onChange={setHacim} />
        </div>
      </div>

      {hesap ? (
        <div className="calc-box">
          <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-4">Seyreltme Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Result label="Gerekli stok hacmi" value={`${formatSmartNumber(hesap.v1, 'tr-TR', 2)} mL`} highlight />
            <Result label="Eklenecek çözücü" value={`${formatSmartNumber(hesap.solvent, 'tr-TR', 2)} mL`} />
            <Result label="Seyreltme oranı" value={`${formatSmartNumber(hesap.dilution, 'tr-TR', 2)} x`} />
            <Result label="Final hacim" value={`${formatSmartNumber(hesap.v2, 'tr-TR', 2)} mL`} />
          </div>
        </div>
      ) : (
        <div className="calc-box-accent">
          <p className="calc-prose">Hedef molarite stok molariteden küçük veya eşit olmalı, tüm değerler pozitif girilmelidir.</p>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Hesaplama ideal seyreltme varsayımıyla yapılır. Isı açığa çıkaran asit/baz seyreltmelerinde güvenlik prosedürü ve laboratuvar talimatları esas alınmalıdır.
          </p>
        </div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input type="text" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/25" />
    </div>
  );
}

function Result({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}>
      <p className="text-xs calc-muted mb-1">{label}</p>
      <p className="font-bold text-[var(--foreground)] text-xl">{value}</p>
    </div>
  );
}
