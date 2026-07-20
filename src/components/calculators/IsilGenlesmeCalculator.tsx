'use client';

import { useMemo, useState } from 'react';
import { Info, Ruler, Thermometer } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const malzemeler = [
  { ad: 'Çelik', alpha: 12 },
  { ad: 'Paslanmaz Çelik', alpha: 17 },
  { ad: 'Alüminyum', alpha: 23 },
  { ad: 'Bakır', alpha: 16.5 },
  { ad: 'Pirinç', alpha: 19 },
  { ad: 'Dökme Demir', alpha: 10.5 },
  { ad: 'Beton', alpha: 10 },
  { ad: 'Özel katsayı', alpha: 0 },
] as const;

export default function IsilGenlesmeCalculator() {
  const [malzeme, setMalzeme] = useState(0);
  const [boy, setBoy] = useState('1000');
  const [ilkSicaklik, setIlkSicaklik] = useState('20');
  const [sonSicaklik, setSonSicaklik] = useState('80');
  const [ozelAlpha, setOzelAlpha] = useState('12');
  const [emniyet, setEmniyet] = useState('20');

  const hesap = useMemo(() => {
    const L0 = parseLocalizedNumber(boy);
    const t1 = parseLocalizedNumber(ilkSicaklik);
    const t2 = parseLocalizedNumber(sonSicaklik);
    const alphaMicro = malzemeler[malzeme].alpha || parseLocalizedNumber(ozelAlpha);
    const pay = parseLocalizedNumber(emniyet);

    if (L0 <= 0 || !Number.isFinite(t1) || !Number.isFinite(t2) || alphaMicro <= 0) return null;

    const deltaT = t2 - t1;
    const alpha = alphaMicro * 1e-6;
    const deltaL = alpha * L0 * deltaT;
    const finalLength = L0 + deltaL;
    const absDelta = Math.abs(deltaL);
    const recommendedClearance = absDelta * (1 + Math.max(pay, 0) / 100);
    const strain = alpha * deltaT;

    return { L0, t1, t2, alphaMicro, deltaT, deltaL, finalLength, absDelta, recommendedClearance, strain };
  }, [boy, emniyet, ilkSicaklik, malzeme, ozelAlpha, sonSicaklik]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10">
            <Thermometer className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Isıl Genleşme Hesaplama</h2>
            <p className="calc-prose mt-1">Sıcaklık değişiminde boy uzaması/kısalması ve montaj boşluğu ihtiyacını hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="calc-title block mb-2">Malzeme</label>
            <select
              value={malzeme}
              onChange={(event) => setMalzeme(Number(event.target.value))}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              {malzemeler.map((item, index) => (
                <option key={item.ad} value={index}>
                  {item.ad} {item.alpha ? `(${item.alpha} µm/m°C)` : ''}
                </option>
              ))}
            </select>
          </div>
          {malzemeler[malzeme].alpha === 0 && (
            <InputField label="Genleşme katsayısı α (µm/m°C)" value={ozelAlpha} onChange={setOzelAlpha} />
          )}
          <InputField label="Başlangıç boyu L0 (mm)" value={boy} onChange={setBoy} />
          <InputField label="İlk sıcaklık (°C)" value={ilkSicaklik} onChange={setIlkSicaklik} />
          <InputField label="Son sıcaklık (°C)" value={sonSicaklik} onChange={setSonSicaklik} />
          <InputField label="Boşluk emniyet payı (%)" value={emniyet} onChange={setEmniyet} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-orange-600 dark:text-orange-400 text-sm font-bold mb-4">Genleşme Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Result label="Sıcaklık farkı ΔT" value={`${formatSmartNumber(hesap.deltaT, 'tr-TR', 2)} °C`} />
            <Result label="Boy değişimi ΔL" value={`${formatSmartNumber(hesap.deltaL, 'tr-TR', 4)} mm`} />
            <Result label="Mutlak hareket" value={`${formatSmartNumber(hesap.absDelta, 'tr-TR', 4)} mm`} />
            <Result label="Son boy" value={`${formatSmartNumber(hesap.finalLength, 'tr-TR', 4)} mm`} />
            <Result label="Önerilen min. boşluk" value={`${formatSmartNumber(hesap.recommendedClearance, 'tr-TR', 3)} mm`} />
            <Result label="Termal strain" value={`${formatSmartNumber(hesap.strain * 1000, 'tr-TR', 4)} mm/m`} />
          </div>

          <div className="mt-5 calc-panel rounded-xl p-4">
            <p className="font-mono text-xs calc-muted">
              ΔL = α · L0 · ΔT = {formatSmartNumber(hesap.alphaMicro, 'tr-TR', 2)}e-6 × {formatSmartNumber(hesap.L0, 'tr-TR', 2)} × {formatSmartNumber(hesap.deltaT, 'tr-TR', 2)}
            </p>
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Uzun kızaklar, şase bağlantıları, boru hatları ve alüminyum/çelik karma montajlarda sıcaklık aralığını gerçek çalışma koşullarına göre seçin. Sabitlenmiş parçalarda genleşme gerilmesi ayrıca kontrol edilmelidir.
          </p>
        </div>
      </section>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <div className="relative">
        <Ruler className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))}
          className="calc-panel w-full pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30"
        />
      </div>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="calc-soft rounded-xl p-4">
      <p className="text-xs calc-muted mb-1">{label}</p>
      <p className="font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
