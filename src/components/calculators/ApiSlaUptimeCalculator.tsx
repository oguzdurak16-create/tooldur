'use client';

import { useMemo, useState } from 'react';
import { Code2, Info } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const periods = [
  { label: 'Aylık (30 gün)', minutes: 30 * 24 * 60 },
  { label: 'Yıllık (365 gün)', minutes: 365 * 24 * 60 },
  { label: 'Haftalık', minutes: 7 * 24 * 60 },
] as const;

export default function ApiSlaUptimeCalculator() {
  const [sla, setSla] = useState('99.9');
  const [period, setPeriod] = useState(0);
  const [incidentCount, setIncidentCount] = useState('3');
  const [incidentMin, setIncidentMin] = useState('12');

  const hesap = useMemo(() => {
    const target = parseLocalizedNumber(sla);
    const count = Math.max(parseLocalizedNumber(incidentCount), 0);
    const avg = Math.max(parseLocalizedNumber(incidentMin), 0);
    const totalMinutes = periods[period].minutes;
    if (target <= 0 || target >= 100) return null;

    const allowedDowntime = totalMinutes * (1 - target / 100);
    const actualDowntime = count * avg;
    const actualUptime = (1 - actualDowntime / totalMinutes) * 100;
    const remaining = allowedDowntime - actualDowntime;
    return { totalMinutes, allowedDowntime, actualDowntime, actualUptime, remaining };
  }, [incidentCount, incidentMin, period, sla]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-violet-500/10">
            <Code2 className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">API SLA ve Uptime Hesaplama</h2>
            <p className="calc-prose mt-1">SLA hedefi ve kesinti kayıtlarıyla izin verilen downtime ve gerçek uptime oranını hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="SLA hedefi (%)" value={sla} onChange={setSla} />
          <div>
            <label className="calc-title block mb-2">Dönem</label>
            <select value={period} onChange={(event) => setPeriod(Number(event.target.value))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/25">
              {periods.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}
            </select>
          </div>
          <Input label="Olay sayısı" value={incidentCount} onChange={setIncidentCount} />
          <Input label="Ortalama kesinti (dk/olay)" value={incidentMin} onChange={setIncidentMin} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-violet-600 dark:text-violet-400 text-sm font-bold mb-4">SLA Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Result label="İzin verilen kesinti" value={`${formatSmartNumber(hesap.allowedDowntime, 'tr-TR', 1)} dk`} />
            <Result label="Gerçek kesinti" value={`${formatSmartNumber(hesap.actualDowntime, 'tr-TR', 1)} dk`} />
            <Result label="Gerçek uptime" value={`%${formatSmartNumber(hesap.actualUptime, 'tr-TR', 4)}`} highlight />
            <Result label={hesap.remaining >= 0 ? 'Kalan bütçe' : 'Aşım'} value={`${formatSmartNumber(Math.abs(hesap.remaining), 'tr-TR', 1)} dk`} />
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            SLA hesabı olay sonrası değerlendirme ve kapasite planlama için kullanılır. Bakım pencereleri, bölgesel servisler ve sözleşme istisnaları ayrıca ele alınmalıdır.
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
      <input type="text" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/25" />
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
