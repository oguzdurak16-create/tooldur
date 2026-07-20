'use client';

import { useMemo, useState } from 'react';
import { Factory, Info } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

export default function OeeUretimCalculator() {
  const [planliSure, setPlanliSure] = useState('480');
  const [durus, setDurus] = useState('45');
  const [idealCevrim, setIdealCevrim] = useState('35');
  const [toplamAdet, setToplamAdet] = useState('690');
  const [saglamAdet, setSaglamAdet] = useState('660');

  const hesap = useMemo(() => {
    const planned = parseLocalizedNumber(planliSure);
    const downtime = parseLocalizedNumber(durus);
    const cycle = parseLocalizedNumber(idealCevrim);
    const total = parseLocalizedNumber(toplamAdet);
    const good = parseLocalizedNumber(saglamAdet);
    const run = planned - downtime;

    if (planned <= 0 || run <= 0 || cycle <= 0 || total <= 0 || good < 0) return null;

    const availability = run / planned;
    const performance = (cycle * total) / (run * 60);
    const quality = Math.min(good, total) / total;
    const oee = availability * performance * quality;
    const scrap = Math.max(total - good, 0);

    return { run, availability, performance, quality, oee, scrap };
  }, [durus, idealCevrim, planliSure, saglamAdet, toplamAdet]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10">
            <Factory className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">OEE Üretim Verimliliği Hesaplama</h2>
            <p className="calc-prose mt-1">Kullanılabilirlik, performans, kalite ve toplam OEE oranını hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Planlı üretim süresi (dk)" value={planliSure} onChange={setPlanliSure} />
          <Input label="Toplam duruş süresi (dk)" value={durus} onChange={setDurus} />
          <Input label="İdeal çevrim süresi (sn/adet)" value={idealCevrim} onChange={setIdealCevrim} />
          <Input label="Toplam üretilen adet" value={toplamAdet} onChange={setToplamAdet} />
          <Input label="Sağlam adet" value={saglamAdet} onChange={setSaglamAdet} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-amber-600 dark:text-amber-400 text-sm font-bold mb-4">OEE Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Result label="OEE" value={`%${formatSmartNumber(hesap.oee * 100, 'tr-TR', 1)}`} highlight />
            <Result label="Kullanılabilirlik" value={`%${formatSmartNumber(hesap.availability * 100, 'tr-TR', 1)}`} />
            <Result label="Performans" value={`%${formatSmartNumber(hesap.performance * 100, 'tr-TR', 1)}`} />
            <Result label="Kalite" value={`%${formatSmartNumber(hesap.quality * 100, 'tr-TR', 1)}`} />
            <Result label="Net çalışma süresi" value={`${formatSmartNumber(hesap.run, 'tr-TR', 0)} dk`} />
            <Result label="Fire adet" value={formatSmartNumber(hesap.scrap, 'tr-TR', 0)} />
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            OEE = Kullanılabilirlik x Performans x Kalite. Bu sonuç üretim hattı iyileştirme, duruş analizi ve kapasite planlama için ön kontrol sağlar.
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
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/25"
      />
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
