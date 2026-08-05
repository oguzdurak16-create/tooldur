'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const BELT_TYPES = [
  { name: 'Z (10×6)', series: 'Z', minPulley: 50 },
  { name: 'A (13×8)', series: 'A', minPulley: 75 },
  { name: 'B (17×11)', series: 'B', minPulley: 125 },
  { name: 'C (22×14)', series: 'C', minPulley: 200 },
  { name: 'D (32×19)', series: 'D', minPulley: 355 },
] as const;

export default function KayisKasnakHesaplamaCalculator() {
  const [d1, setD1] = useState('100');
  const [d2, setD2] = useState('250');
  const [n1, setN1] = useState('1450');
  const [center, setCenter] = useState('500');
  const [power, setPower] = useState('5.5');
  const [beltType, setBeltType] = useState(1);

  const values = useMemo(() => {
    const driver = parseLocalizedNumber(d1);
    const driven = parseLocalizedNumber(d2);
    const inputRpm = parseLocalizedNumber(n1);
    const c = parseLocalizedNumber(center);
    const transmittedPower = parseLocalizedNumber(power);
    if ([driver, driven, inputRpm, c, transmittedPower].some((value) => Number.isNaN(value) || value <= 0)) return null;

    const ratio = driven / driver;
    const outputRpm = inputRpm * driver / driven;
    const beltSpeed = Math.PI * driver * inputRpm / 60000;
    const beltLength = 2 * c + Math.PI * (driver + driven) / 2 + (driven - driver) ** 2 / (4 * c);
    const argument = Math.abs(driven - driver) / (2 * c);
    const wrapAngle = argument < 1 ? 180 - (2 * Math.asin(argument) * 180 / Math.PI) : 0;
    const belt = BELT_TYPES[beltType];
    return { driver, driven, ratio, outputRpm, beltSpeed, beltLength, wrapAngle, belt, transmittedPower };
  }, [beltType, center, d1, d2, n1, power]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10"><RotateCw className="w-6 h-6 text-emerald-500" /></div>
          <div><h2 className="text-xl font-bold text-[var(--foreground)]">Kayış Kasnak Geometri Hesabı</h2><p className="calc-prose mt-1">Çevrim oranı, çıkış devri, kayış hızı, yaklaşık kayış boyu ve küçük kasnak sarım açısını hesaplayın.</p></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Tahrik kasnağı d₁ (mm)" value={d1} onChange={setD1} />
          <Input label="Tahrik edilen kasnak d₂ (mm)" value={d2} onChange={setD2} />
          <Input label="Giriş devri n₁ (rpm)" value={n1} onChange={setN1} />
          <Input label="Merkez mesafesi C (mm)" value={center} onChange={setCenter} />
          <Input label="İletilecek güç (kW)" value={power} onChange={setPower} />
          <div><label className="calc-title block mb-2">Ön kontrol kayış serisi</label><select value={beltType} onChange={(event) => setBeltType(Number(event.target.value))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none">{BELT_TYPES.map((belt, index) => <option key={belt.series} value={index}>{belt.name}</option>)}</select></div>
        </div>
      </div>

      {values && (
        <div className="calc-box">
          <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-4">Kayış-Kasnak Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card label="Çevrim oranı i" value={formatSmartNumber(values.ratio, 'tr-TR', 3)} />
            <Card label="Çıkış devri n₂" value={`${formatSmartNumber(values.outputRpm, 'tr-TR', 0)} rpm`} />
            <Card label="Kayış hızı" value={`${formatSmartNumber(values.beltSpeed, 'tr-TR', 2)} m/s`} />
            <Card label="Yaklaşık hatve boyu" value={`${formatSmartNumber(values.beltLength, 'tr-TR', 0)} mm`} />
            <Card label="Küçük kasnak sarım açısı" value={`${formatSmartNumber(values.wrapAngle, 'tr-TR', 1)}°`} />
            <Card label="Seri minimum kasnak kontrolü" value={values.driver >= values.belt.minPulley ? 'Uygun ön aralık' : `En az Ø${values.belt.minPulley} mm`} />
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" /><div><p className="font-bold text-[var(--foreground)] mb-1">Kayış sayısı katalogdan seçilmelidir</p><p className="calc-prose">Kayış adedi; güç, servis faktörü, küçük kasnak çapı, devir, sarım açısı, standart boy ve üretici güç tablolarına bağlıdır. Bu nedenle önceki ampirik “önerilen kayış sayısı” sonucu kaldırıldı. Araç yalnız geometrik ön hesabı verir.</p></div></div>
      </section>

      {values && (values.beltSpeed > 25 || values.wrapAngle < 120) && (
        <div className="calc-box"><div className="calc-warn rounded-xl p-4 text-sm font-semibold">{values.beltSpeed > 25 ? `Kayış hızı ${formatSmartNumber(values.beltSpeed, 'tr-TR', 1)} m/s; üretici sınırı kontrol edilmeli. ` : ''}{values.wrapAngle < 120 ? `Sarım açısı ${formatSmartNumber(values.wrapAngle, 'tr-TR', 1)}°; gerdirme veya yerleşim revizyonu gerekebilir.` : ''}</div></div>
      )}
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="calc-title block mb-2">{label}</label><input value={value} onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))} inputMode="decimal" className="calc-panel w-full px-4 py-3 rounded-xl outline-none" /></div>;
}

function Card({ label, value }: { label: string; value: string }) {
  return <div className="calc-soft rounded-xl p-4"><p className="text-xs calc-muted mb-1">{label}</p><p className="font-bold text-[var(--foreground)]">{value}</p></div>;
}
