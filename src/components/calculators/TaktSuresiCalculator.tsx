'use client';

import { useMemo, useState } from 'react';
import { Timer, Info } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

export default function TaktSuresiCalculator() {
  const [talep, setTalep] = useState('1200');
  const [vardiya, setVardiya] = useState('8');
  const [mola, setMola] = useState('60');
  const [verim, setVerim] = useState('85');
  const [hatSayisi, setHatSayisi] = useState('1');

  const hesap = useMemo(() => {
    const demand = parseLocalizedNumber(talep);
    const shiftHour = parseLocalizedNumber(vardiya);
    const breakMin = parseLocalizedNumber(mola);
    const efficiency = parseLocalizedNumber(verim) / 100;
    const lines = Math.max(parseLocalizedNumber(hatSayisi), 1);
    const netMinutes = shiftHour * 60 - breakMin;
    if (demand <= 0 || netMinutes <= 0 || efficiency <= 0) return null;

    const taktSec = (netMinutes * 60 * efficiency * lines) / demand;
    const hourlyCapacity = (3600 / taktSec) * lines;
    const shiftCapacity = (netMinutes * 60 * efficiency * lines) / taktSec;
    const targetCycle = taktSec * 0.92;

    return { netMinutes, taktSec, hourlyCapacity, shiftCapacity, targetCycle };
  }, [hatSayisi, mola, talep, vardiya, verim]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10">
            <Timer className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Takt Süresi ve Kapasite Hesaplama</h2>
            <p className="calc-prose mt-1">Talebe göre hattın üretmesi gereken ritmi ve yaklaşık kapasiteyi hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Günlük / vardiyalık talep (adet)" value={talep} onChange={setTalep} />
          <Input label="Vardiya süresi (saat)" value={vardiya} onChange={setVardiya} />
          <Input label="Mola ve planlı kayıp (dk)" value={mola} onChange={setMola} />
          <Input label="Planlanan verim (%)" value={verim} onChange={setVerim} />
          <Input label="Paralel hat sayısı" value={hatSayisi} onChange={setHatSayisi} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-sky-600 dark:text-sky-400 text-sm font-bold mb-4">Hat Planlama Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Result label="Takt süresi" value={`${formatSmartNumber(hesap.taktSec, 'tr-TR', 1)} sn/adet`} highlight />
            <Result label="Hedef çevrim" value={`${formatSmartNumber(hesap.targetCycle, 'tr-TR', 1)} sn/adet`} />
            <Result label="Net süre" value={`${formatSmartNumber(hesap.netMinutes, 'tr-TR', 0)} dk`} />
            <Result label="Saatlik kapasite" value={`${formatSmartNumber(hesap.hourlyCapacity, 'tr-TR', 0)} adet/saat`} />
            <Result label="Vardiya kapasitesi" value={`${formatSmartNumber(hesap.shiftCapacity, 'tr-TR', 0)} adet`} />
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Takt süresi müşteri talebine göre üretim ritmini gösterir. Gerçek hat dengelemede darboğaz, kalite kaybı ve operatör hareketleri ayrıca incelenmelidir.
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
      <input type="text" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/25" />
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
