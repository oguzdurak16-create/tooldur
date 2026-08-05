'use client';

import { useMemo, useState } from 'react';
import { Gauge, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';
import type { Locale } from '@/lib/siteLanguage';

type BearingType = 'ball' | 'roller';

export default function RulmanOmuruCalculator({ locale = 'tr' }: { locale?: Locale }) {
  const isEnglish = locale === 'en';
  const numberLocale = isEnglish ? 'en-US' : 'tr-TR';
  const [capacity, setCapacity] = useState('30');
  const [load, setLoad] = useState('5');
  const [speed, setSpeed] = useState('1450');
  const [type, setType] = useState<BearingType>('ball');

  const result = useMemo(() => {
    const C = parseLocalizedNumber(capacity);
    const P = parseLocalizedNumber(load);
    const n = parseLocalizedNumber(speed);
    if ([C, P, n].some((value) => Number.isNaN(value) || value <= 0)) return null;
    const exponent = type === 'ball' ? 3 : 10 / 3;
    const millionRevolutions = (C / P) ** exponent;
    const hours = millionRevolutions * 1_000_000 / (60 * n);
    const yearsAtEightHours = hours / (365 * 8);
    return { exponent, millionRevolutions, hours, yearsAtEightHours };
  }, [capacity, load, speed, type]);

  const referenceMet = (result?.hours ?? 0) >= 20_000;

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10"><Gauge className="w-6 h-6 text-sky-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">{isEnglish ? 'Bearing Life Calculator' : 'Rulman Ömrü Hesaplama'}</h2>
            <p className="calc-prose mt-1">{isEnglish ? 'Calculate basic L10 rating life using the ISO 281 life equation.' : 'ISO 281 temel ömür bağıntısıyla temel L10 rulman ömrünü hesaplayın.'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="calc-title block mb-2">{isEnglish ? 'Bearing type' : 'Rulman tipi'}</label><select value={type} onChange={(event) => setType(event.target.value as BearingType)} className="calc-panel w-full px-4 py-3 rounded-xl outline-none"><option value="ball">{isEnglish ? 'Ball bearing (p = 3)' : 'Bilyalı rulman (p = 3)'}</option><option value="roller">{isEnglish ? 'Roller bearing (p = 10/3)' : 'Makaralı rulman (p = 10/3)'}</option></select></div>
          <Input label={isEnglish ? 'Dynamic load rating C (kN)' : 'Dinamik yük kapasitesi C (kN)'} value={capacity} onChange={setCapacity} />
          <Input label={isEnglish ? 'Equivalent dynamic load P (kN)' : 'Eşdeğer dinamik yük P (kN)'} value={load} onChange={setLoad} />
          <Input label={isEnglish ? 'Rotational speed n (rpm)' : 'Devir sayısı n (rpm)'} value={speed} onChange={setSpeed} />
        </div>
      </div>

      {result && (
        <div className="calc-box">
          <h3 className="text-sky-600 dark:text-sky-400 text-sm font-bold mb-4">{isEnglish ? 'Basic rating life' : 'Temel ömür sonucu'}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Card label={isEnglish ? 'Life exponent p' : 'Ömür üssü p'} value={formatSmartNumber(result.exponent, numberLocale, 3)} />
            <Card label={isEnglish ? 'L10 million revolutions' : 'L10 milyon devir'} value={`${formatSmartNumber(result.millionRevolutions, numberLocale, 2)} Mrev`} highlight />
            <Card label={isEnglish ? 'L10 hours' : 'L10 saat'} value={`${formatSmartNumber(result.hours, numberLocale, 0)} ${isEnglish ? 'h' : 'sa'}`} />
            <Card label={isEnglish ? 'Years at 8 h/day' : '8 sa/gün ile yıl'} value={`${formatSmartNumber(result.yearsAtEightHours, numberLocale, 1)} ${isEnglish ? 'years' : 'yıl'}`} />
          </div>
          <div className={`mt-4 rounded-xl border p-3 text-center text-sm font-semibold ${referenceMet ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
            {referenceMet
              ? (isEnglish ? 'The optional 20,000-hour reference target is met.' : 'İsteğe bağlı 20.000 saat referans hedefi karşılanıyor.')
              : (isEnglish ? 'Below the optional 20,000-hour reference target.' : 'İsteğe bağlı 20.000 saat referans hedefinin altında.')}
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3"><Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" /><p className="calc-prose"><strong>L10 = (C/P)^p</strong> {isEnglish ? 'is basic rating life at the standard reliability basis. The 20,000-hour value above is not an ISO requirement. Lubrication, contamination, temperature, alignment, duty cycle and shock loading require separate evaluation.' : 'standart güvenilirlik temelindeki temel ömürdür. Yukarıdaki 20.000 saat değeri ISO şartı değildir. Yağlama, kirlenme, sıcaklık, hizalama, çalışma çevrimi ve darbe yükleri ayrıca değerlendirilmelidir.'}</p></div>
      </section>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="calc-title block mb-2">{label}</label><input value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))} inputMode="decimal" className="calc-panel w-full px-4 py-3 rounded-xl outline-none" /></div>;
}

function Card({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div className={highlight ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}><p className="text-xs calc-muted mb-1">{label}</p><p className="font-bold text-[var(--foreground)]">{value}</p></div>;
}
