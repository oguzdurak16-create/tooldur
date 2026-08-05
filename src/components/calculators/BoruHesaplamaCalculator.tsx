'use client';

import { useMemo, useState } from 'react';
import { CircleDot, Info } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

type Mode = 'thickness' | 'pressure';

type Material = { label: string; referenceStress: number; density: number };

const MATERIALS: Record<string, Material> = {
  carbon: { label: 'Karbon çeliği (ön değer)', referenceStress: 137, density: 7850 },
  stainless: { label: 'Paslanmaz çelik 304 (ön değer)', referenceStress: 137, density: 7900 },
  high: { label: 'Yüksek mukavemetli çelik (ön değer)', referenceStress: 171, density: 7850 },
  cast: { label: 'Dökme demir (ön değer)', referenceStress: 100, density: 7200 },
  copper: { label: 'Bakır (ön değer)', referenceStress: 55, density: 8960 },
  aluminum: { label: 'Alüminyum 6061 (ön değer)', referenceStress: 69, density: 2700 },
  brass: { label: 'Pirinç (ön değer)', referenceStress: 83, density: 8500 },
};

const DN: Record<number, number> = { 15: 21.3, 20: 26.9, 25: 33.7, 32: 42.4, 40: 48.3, 50: 60.3, 65: 76.1, 80: 88.9, 100: 114.3, 125: 139.7, 150: 168.3, 200: 219.1, 250: 273, 300: 323.9 };
const STANDARD_THICKNESSES = [1.5, 2, 2.3, 2.6, 2.9, 3.2, 3.6, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 8.8, 10, 11, 12.5, 14.2, 16];

export default function BoruHesaplamaCalculator() {
  const [mode, setMode] = useState<Mode>('thickness');
  const [outsideDiameter, setOutsideDiameter] = useState('114.3');
  const [existingThickness, setExistingThickness] = useState('6.3');
  const [pressureBar, setPressureBar] = useState('10');
  const [temperature, setTemperature] = useState('20');
  const [materialKey, setMaterialKey] = useState('carbon');
  const [safetyFactor, setSafetyFactor] = useState('4');
  const [jointEfficiency, setJointEfficiency] = useState('1');
  const [corrosionAllowance, setCorrosionAllowance] = useState('0');
  const [dn, setDn] = useState('100');

  const result = useMemo(() => {
    const D = parseLocalizedNumber(outsideDiameter);
    const designPressureBar = parseLocalizedNumber(pressureBar);
    const temp = parseLocalizedNumber(temperature);
    const sf = parseLocalizedNumber(safetyFactor);
    const efficiency = parseLocalizedNumber(jointEfficiency);
    const corrosion = parseLocalizedNumber(corrosionAllowance);
    const enteredThickness = parseLocalizedNumber(existingThickness);
    const material = MATERIALS[materialKey];

    if (!material || [D, designPressureBar, temp, sf, efficiency, corrosion].some(Number.isNaN)) return null;
    if (D <= 0 || designPressureBar <= 0 || sf <= 0 || efficiency <= 0 || efficiency > 1 || corrosion < 0) return null;

    // This reduction is only a transparent preliminary assumption, not a code material table.
    const temperatureFactor = Math.max(0.25, temp > 200 ? 1 - (temp - 200) * 0.0015 : 1);
    const allowableStress = material.referenceStress * temperatureFactor * efficiency / sf;
    const pressureMpa = designPressureBar / 10;
    const y = 0.4;
    const structuralRequired = pressureMpa * D / (2 * allowableStress + 2 * y * pressureMpa);
    const nominalRequired = structuralRequired + corrosion;
    const standardThickness = STANDARD_THICKNESSES.find((value) => value >= nominalRequired) ?? nominalRequired;
    const usedThickness = mode === 'thickness' ? standardThickness : enteredThickness;

    if (!Number.isFinite(usedThickness) || usedThickness <= corrosion || usedThickness * 2 >= D) return null;
    const structuralAvailable = usedThickness - corrosion;
    const pressureDenominator = D - 2 * y * structuralAvailable;
    if (pressureDenominator <= 0) return null;

    const allowablePressureBar = 2 * allowableStress * structuralAvailable / pressureDenominator * 10;
    const innerDiameter = D - 2 * usedThickness;
    const metalAreaM2 = Math.PI / 4 * (D ** 2 - innerDiameter ** 2) / 1e6;
    const weightPerMeter = metalAreaM2 * material.density;
    const ratio = usedThickness / nominalRequired;
    const status = usedThickness + 1e-9 < nominalRequired
      ? 'Yetersiz'
      : ratio < 1.2
        ? 'Minimum aralık'
        : ratio >= 2
          ? 'Yüksek pay'
          : 'Uygun ön aralık';

    return { material, allowableStress, structuralRequired, nominalRequired, standardThickness, usedThickness, allowablePressureBar, innerDiameter, weightPerMeter, ratio, status };
  }, [corrosionAllowance, existingThickness, jointEfficiency, materialKey, mode, outsideDiameter, pressureBar, safetyFactor, temperature]);

  const changeDn = (value: string) => {
    setDn(value);
    const diameter = DN[Number(value)];
    if (diameter) setOutsideDiameter(String(diameter));
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10"><CircleDot className="w-6 h-6 text-sky-500" /></div>
          <div><h2 className="text-xl font-bold text-[var(--foreground)]">Boru Et Kalınlığı Ön Hesabı</h2><p className="calc-prose mt-1">Aynı güvenlik, kaynak verimi ve korozyon varsayımlarıyla gerekli et kalınlığını veya mevcut borunun yaklaşık basınç kapasitesini hesaplayın.</p></div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button type="button" onClick={() => setMode('thickness')} className={`py-3 rounded-xl font-semibold ${mode === 'thickness' ? 'bg-sky-500 text-white' : 'calc-panel'}`}>Et kalınlığı bul</button>
          <button type="button" onClick={() => setMode('pressure')} className={`py-3 rounded-xl font-semibold ${mode === 'pressure' ? 'bg-sky-500 text-white' : 'calc-panel'}`}>Basınç kapasitesi</button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div><label className="calc-title block mb-2">DN seçimi</label><select value={dn} onChange={(event) => changeDn(event.target.value)} className="calc-panel w-full px-4 py-3 rounded-xl outline-none"><option value="">Manuel çap</option>{Object.entries(DN).map(([key, value]) => <option key={key} value={key}>DN {key} — Ø{value} mm</option>)}</select></div>
          <Input label="Dış çap D (mm)" value={outsideDiameter} onChange={(value) => { setOutsideDiameter(value); setDn(''); }} />
          {mode === 'pressure' && <Input label="Mevcut nominal et t (mm)" value={existingThickness} onChange={setExistingThickness} />}
          <Input label="Tasarım basıncı (bar)" value={pressureBar} onChange={setPressureBar} />
          <Input label="Sıcaklık (°C)" value={temperature} onChange={setTemperature} />
          <Input label="Güvenlik katsayısı" value={safetyFactor} onChange={setSafetyFactor} />
          <Input label="Kaynak/birleşim verimi E (0–1)" value={jointEfficiency} onChange={setJointEfficiency} />
          <Input label="Korozyon payı c (mm)" value={corrosionAllowance} onChange={setCorrosionAllowance} />
          <div className="md:col-span-2"><label className="calc-title block mb-2">Malzeme ön değeri</label><select value={materialKey} onChange={(event) => setMaterialKey(event.target.value)} className="calc-panel w-full px-4 py-3 rounded-xl outline-none">{Object.entries(MATERIALS).map(([key, material]) => <option key={key} value={key}>{material.label}</option>)}</select></div>
        </div>
      </div>

      {result && (
        <div className="calc-box">
          <h3 className="text-sky-600 dark:text-sky-400 text-sm font-bold mb-4">Boru Ön Hesap Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Card label="Hesaplanan yapısal et" value={`${formatSmartNumber(result.structuralRequired, 'tr-TR', 2)} mm`} />
            <Card label="Korozyon dahil gerekli et" value={`${formatSmartNumber(result.nominalRequired, 'tr-TR', 2)} mm`} />
            <Card label="Önerilen / kullanılan et" value={`${formatSmartNumber(result.usedThickness, 'tr-TR', 2)} mm`} highlight />
            <Card label="Yaklaşık izin verilen basınç" value={`${formatSmartNumber(result.allowablePressureBar, 'tr-TR', 1)} bar`} />
            <Card label="İç çap" value={`${formatSmartNumber(result.innerDiameter, 'tr-TR', 2)} mm`} />
            <Card label="Yaklaşık ağırlık" value={`${formatSmartNumber(result.weightPerMeter, 'tr-TR', 3)} kg/m`} />
            <Card label="Durum" value={result.status} />
            <Card label="Hesapta kullanılan gerilme" value={`${formatSmartNumber(result.allowableStress, 'tr-TR', 1)} MPa`} />
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3"><Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" /><p className="calc-prose">Bu araç kod tasarımı değildir. Malzeme izin gerilmesi, sıcaklık azaltma katsayısı, üretim toleransı, dış basınç, yorulma, korozyon, kaynak kalitesi ve ilgili ASME/EN/API kuralları nihai seçimde yetkili mühendis tarafından doğrulanmalıdır.</p></div>
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
