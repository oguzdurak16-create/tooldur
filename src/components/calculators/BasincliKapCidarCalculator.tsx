'use client';

import { useMemo, useState } from 'react';
import { Cylinder, Info, ShieldCheck } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const malzemeler = [
  { ad: 'S235JR yaklaşık', stress: 120 },
  { ad: 'S355JR yaklaşık', stress: 160 },
  { ad: 'AISI 304 yaklaşık', stress: 137 },
  { ad: 'AISI 316 yaklaşık', stress: 137 },
  { ad: 'Özel izin verilen gerilme', stress: 0 },
] as const;

export default function BasincliKapCidarCalculator() {
  const [cap, setCap] = useState('1000');
  const [basinc, setBasinc] = useState('1.0');
  const [malzeme, setMalzeme] = useState(1);
  const [gerilme, setGerilme] = useState('160');
  const [kaynakVerimi, setKaynakVerimi] = useState('0.85');
  const [korozyon, setKorozyon] = useState('1');
  const [minSac, setMinSac] = useState('3');

  const hesap = useMemo(() => {
    const D = parseLocalizedNumber(cap);
    const P = parseLocalizedNumber(basinc);
    const S = malzemeler[malzeme].stress || parseLocalizedNumber(gerilme);
    const E = parseLocalizedNumber(kaynakVerimi);
    const c = parseLocalizedNumber(korozyon);
    const min = parseLocalizedNumber(minSac);

    if (D <= 0 || P <= 0 || S <= 0 || E <= 0 || E > 1 || c < 0 || min < 0) return null;

    const denominator = 2 * S * E - 1.2 * P;
    if (denominator <= 0) return null;

    const pressureThickness = (P * D) / denominator;
    const totalThickness = pressureThickness + c;
    const selectedThickness = Math.max(totalThickness, min);
    const hoopStress = (P * D) / (2 * Math.max(selectedThickness - c, 0.001));
    const utilization = hoopStress / (S * E) * 100;
    const mawp = (2 * S * E * Math.max(selectedThickness - c, 0.001)) / (D + 1.2 * Math.max(selectedThickness - c, 0.001));

    return { D, P, S, E, c, min, pressureThickness, totalThickness, selectedThickness, hoopStress, utilization, mawp };
  }, [basinc, cap, gerilme, kaynakVerimi, korozyon, malzeme, minSac]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-violet-500/10">
            <Cylinder className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Basınçlı Kap Cidar Kalınlığı</h2>
            <p className="calc-prose mt-1">Silindirik kabuk için iç basınca göre yaklaşık cidar kalınlığı ve kullanım oranını hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField label="İç çap D (mm)" value={cap} onChange={setCap} />
          <InputField label="Tasarım basıncı P (MPa)" value={basinc} onChange={setBasinc} />
          <div>
            <label className="calc-title block mb-2">Malzeme / izin verilen gerilme</label>
            <select value={malzeme} onChange={(event) => setMalzeme(Number(event.target.value))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30">
              {malzemeler.map((item, index) => (
                <option key={item.ad} value={index}>{item.ad} {item.stress ? `(${item.stress} MPa)` : ''}</option>
              ))}
            </select>
          </div>
          {malzemeler[malzeme].stress === 0 && <InputField label="İzin verilen gerilme S (MPa)" value={gerilme} onChange={setGerilme} />}
          <InputField label="Kaynak verimi E (0-1)" value={kaynakVerimi} onChange={setKaynakVerimi} />
          <InputField label="Korozyon payı c (mm)" value={korozyon} onChange={setKorozyon} />
          <InputField label="Minimum sac kalınlığı (mm)" value={minSac} onChange={setMinSac} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-violet-600 dark:text-violet-400 text-sm font-bold mb-4">Cidar Kalınlığı Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Result label="Basınca göre t" value={`${formatSmartNumber(hesap.pressureThickness, 'tr-TR', 3)} mm`} />
            <Result label="Korozyon dahil t" value={`${formatSmartNumber(hesap.totalThickness, 'tr-TR', 3)} mm`} />
            <Result label="Önerilen min. kalınlık" value={`${formatSmartNumber(hesap.selectedThickness, 'tr-TR', 2)} mm`} />
            <Result label="Yaklaşık çevresel gerilme" value={`${formatSmartNumber(hesap.hoopStress, 'tr-TR', 1)} MPa`} />
            <Result label="Kullanım oranı" value={`%${formatSmartNumber(hesap.utilization, 'tr-TR', 1)}`} />
            <Result label="Seçilen t ile MAWP" value={`${formatSmartNumber(hesap.mawp, 'tr-TR', 3)} MPa`} />
          </div>

          <div className="mt-5 calc-panel rounded-xl p-4">
            <p className="font-mono text-xs calc-muted">
              t = P·D / (2·S·E - 1.2·P) = {formatSmartNumber(hesap.P, 'tr-TR', 3)} × {formatSmartNumber(hesap.D, 'tr-TR', 1)} / (2 × {formatSmartNumber(hesap.S, 'tr-TR', 1)} × {formatSmartNumber(hesap.E, 'tr-TR', 2)} - 1.2 × {formatSmartNumber(hesap.P, 'tr-TR', 3)})
            </p>
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">Önemli güvenlik notu</p>
            <p className="calc-prose">
              Bu hesap yalnızca ön boyutlandırma içindir. Basınçlı kap tasarımı; uygulanacak standarda, malzeme sertifikasına, sıcaklığa, test basıncına, kaynak detayına ve yetkili mühendis kontrolüne göre tamamlanmalıdır.
            </p>
          </div>
        </div>
      </section>

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Formül ince cidarlı silindirik kabuk yaklaşımıyla verilmiştir. Dış basınç, vakum, burkulma, kapak/dip geometrisi ve nozul takviyeleri bu hızlı hesap kapsamına dahil değildir.
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
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30"
      />
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
