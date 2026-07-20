'use client';

import { useMemo, useState } from 'react';
import { Sun, Info } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

export default function GunesPaneliEnerjiCalculator() {
  const [panelWatt, setPanelWatt] = useState('550');
  const [adet, setAdet] = useState('12');
  const [gunes, setGunes] = useState('4.8');
  const [kayip, setKayip] = useState('18');

  const hesap = useMemo(() => {
    const watt = parseLocalizedNumber(panelWatt);
    const count = parseLocalizedNumber(adet);
    const sunHours = parseLocalizedNumber(gunes);
    const loss = parseLocalizedNumber(kayip) / 100;
    if (watt <= 0 || count <= 0 || sunHours <= 0 || loss < 0 || loss >= 1) return null;

    const kwp = (watt * count) / 1000;
    const daily = kwp * sunHours * (1 - loss);
    const monthly = daily * 30;
    const yearly = daily * 365;
    return { kwp, daily, monthly, yearly };
  }, [adet, gunes, kayip, panelWatt]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-yellow-500/10">
            <Sun className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Güneş Paneli Enerji Hesaplama</h2>
            <p className="calc-prose mt-1">PV sistemin yaklaşık günlük, aylık ve yıllık üretimini hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Panel gücü (W)" value={panelWatt} onChange={setPanelWatt} />
          <Input label="Panel adedi" value={adet} onChange={setAdet} />
          <Input label="Güneşlenme süresi (saat/gün)" value={gunes} onChange={setGunes} />
          <Input label="Sistem kaybı (%)" value={kayip} onChange={setKayip} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-yellow-600 dark:text-yellow-400 text-sm font-bold mb-4">Enerji Üretimi</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Result label="Kurulu güç" value={`${formatSmartNumber(hesap.kwp, 'tr-TR', 2)} kWp`} />
            <Result label="Günlük üretim" value={`${formatSmartNumber(hesap.daily, 'tr-TR', 2)} kWh`} highlight />
            <Result label="Aylık üretim" value={`${formatSmartNumber(hesap.monthly, 'tr-TR', 0)} kWh`} />
            <Result label="Yıllık üretim" value={`${formatSmartNumber(hesap.yearly, 'tr-TR', 0)} kWh`} />
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Sonuçlar güneşlenme süresi ve toplam kayıp varsayımıyla ön tahmindir. Gölge, yön, eğim, inverter ve bölgesel ışınım verileri nihai projede ayrıca değerlendirilmelidir.
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
      <input type="text" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500/25" />
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
