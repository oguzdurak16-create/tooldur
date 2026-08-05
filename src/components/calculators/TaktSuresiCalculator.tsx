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
  const [gercekCevrim, setGercekCevrim] = useState('18');

  const hesap = useMemo(() => {
    const demand = parseLocalizedNumber(talep);
    const shiftHour = parseLocalizedNumber(vardiya);
    const breakMin = parseLocalizedNumber(mola);
    const efficiencyPercent = parseLocalizedNumber(verim);
    const lines = Math.floor(parseLocalizedNumber(hatSayisi));
    const actualCycle = parseLocalizedNumber(gercekCevrim);
    const netMinutes = shiftHour * 60 - breakMin;

    if (
      demand <= 0 ||
      shiftHour <= 0 ||
      breakMin < 0 ||
      netMinutes <= 0 ||
      efficiencyPercent <= 0 ||
      efficiencyPercent > 100 ||
      lines < 1 ||
      actualCycle <= 0
    ) return null;

    const efficiency = efficiencyPercent / 100;
    const netSeconds = netMinutes * 60;

    // Takt is defined from customer demand and net available production time.
    // Parallel lines do not change the plant takt; they increase the permissible cycle per line.
    const taktSec = netSeconds / demand;
    const requiredCyclePerLine = taktSec * lines;
    const practicalTargetCycle = requiredCyclePerLine * efficiency;
    const practicalCapacity = (netSeconds * efficiency * lines) / actualCycle;
    const capacityDifference = practicalCapacity - demand;
    const demandPerLine = demand / lines;

    return {
      netMinutes,
      taktSec,
      requiredCyclePerLine,
      practicalTargetCycle,
      practicalCapacity,
      capacityDifference,
      demandPerLine,
      lines,
    };
  }, [gercekCevrim, hatSayisi, mola, talep, vardiya, verim]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10">
            <Timer className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Takt Süresi ve Kapasite Hesaplama</h2>
            <p className="calc-prose mt-1">Müşteri talebine göre saf takt süresini, hat başına hedef çevrimi ve mevcut çevrimle ulaşılabilir kapasiteyi hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Günlük / vardiyalık toplam talep (adet)" value={talep} onChange={setTalep} />
          <Input label="Vardiya süresi (saat)" value={vardiya} onChange={setVardiya} />
          <Input label="Mola ve planlı kayıp (dk)" value={mola} onChange={setMola} />
          <Input label="Planlanan çalışma verimi (%)" value={verim} onChange={setVerim} />
          <Input label="Paralel hat sayısı" value={hatSayisi} onChange={setHatSayisi} />
          <Input label="Gerçek / beklenen çevrim (sn/adet)" value={gercekCevrim} onChange={setGercekCevrim} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-sky-600 dark:text-sky-400 text-sm font-bold mb-4">Hat Planlama Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Result label="Takt süresi" value={`${formatSmartNumber(hesap.taktSec, 'tr-TR', 1)} sn/adet`} highlight />
            <Result label="Hat başına izin verilen çevrim" value={`${formatSmartNumber(hesap.requiredCyclePerLine, 'tr-TR', 1)} sn/adet`} />
            <Result label="Verim düzeltilmiş hedef çevrim" value={`${formatSmartNumber(hesap.practicalTargetCycle, 'tr-TR', 1)} sn/adet`} />
            <Result label="Net planlı süre" value={`${formatSmartNumber(hesap.netMinutes, 'tr-TR', 0)} dk`} />
            <Result label="Hat başına talep" value={`${formatSmartNumber(hesap.demandPerLine, 'tr-TR', 1)} adet`} />
            <Result label="Tahmini vardiya kapasitesi" value={`${formatSmartNumber(hesap.practicalCapacity, 'tr-TR', 0)} adet`} />
            <Result
              label={hesap.capacityDifference >= 0 ? 'Kapasite fazlası' : 'Kapasite açığı'}
              value={`${formatSmartNumber(Math.abs(hesap.capacityDifference), 'tr-TR', 0)} adet`}
            />
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Takt = net kullanılabilir üretim süresi / müşteri talebi. Verim oranı taktın tanımına eklenmez; ayrı bir pratik hedef çevrim ve kapasite hesabında kullanılır. Darboğaz, kalite kaybı ve operatör hareketleri ayrıca incelenmelidir.
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
