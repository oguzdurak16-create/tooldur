'use client';

import { useMemo, useState } from 'react';
import { Leaf, Info } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const factors = {
  elektrik: 0.42,
  dogalGaz: 1.9,
  dizel: 2.68,
  benzin: 2.31,
};

export default function KarbonEmisyonuCalculator() {
  const [elektrik, setElektrik] = useState('1200');
  const [dogalGaz, setDogalGaz] = useState('250');
  const [dizel, setDizel] = useState('80');
  const [benzin, setBenzin] = useState('40');

  const hesap = useMemo(() => {
    const e = Math.max(parseLocalizedNumber(elektrik), 0);
    const g = Math.max(parseLocalizedNumber(dogalGaz), 0);
    const d = Math.max(parseLocalizedNumber(dizel), 0);
    const b = Math.max(parseLocalizedNumber(benzin), 0);
    const elektrikKg = e * factors.elektrik;
    const gazKg = g * factors.dogalGaz;
    const dizelKg = d * factors.dizel;
    const benzinKg = b * factors.benzin;
    const total = elektrikKg + gazKg + dizelKg + benzinKg;
    const ton = total / 1000;
    const treeEquivalent = total / 21;
    return { elektrikKg, gazKg, dizelKg, benzinKg, total, ton, treeEquivalent };
  }, [benzin, dizel, dogalGaz, elektrik]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-green-500/10">
            <Leaf className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Karbon Emisyonu Hesaplama</h2>
            <p className="calc-prose mt-1">Enerji ve yakıt tüketimlerinden yaklaşık CO2e emisyonunu hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Elektrik tüketimi (kWh)" value={elektrik} onChange={setElektrik} />
          <Input label="Doğal gaz (m³)" value={dogalGaz} onChange={setDogalGaz} />
          <Input label="Dizel (L)" value={dizel} onChange={setDizel} />
          <Input label="Benzin (L)" value={benzin} onChange={setBenzin} />
        </div>
      </div>

      <div className="calc-box">
        <h3 className="text-green-600 dark:text-green-400 text-sm font-bold mb-4">Emisyon Sonuçları</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Result label="Toplam emisyon" value={`${formatSmartNumber(hesap.ton, 'tr-TR', 3)} ton CO2e`} highlight />
          <Result label="Toplam kg CO2e" value={`${formatSmartNumber(hesap.total, 'tr-TR', 1)} kg`} />
          <Result label="Ağaç eşdeğeri" value={`${formatSmartNumber(hesap.treeEquivalent, 'tr-TR', 0)} ağaç/yıl`} />
          <Result label="Elektrik" value={`${formatSmartNumber(hesap.elektrikKg, 'tr-TR', 1)} kg`} />
          <Result label="Doğal gaz" value={`${formatSmartNumber(hesap.gazKg, 'tr-TR', 1)} kg`} />
          <Result label="Sıvı yakıt" value={`${formatSmartNumber(hesap.dizelKg + hesap.benzinKg, 'tr-TR', 1)} kg`} />
        </div>
      </div>

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Emisyon faktörleri yaklaşık ön analiz içindir. Kurumsal raporlama için ülke, tedarikçi ve metodolojiye özel resmi faktörler kullanılmalıdır.
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
      <input type="text" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500/25" />
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
