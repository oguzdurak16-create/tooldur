'use client';

import { useMemo, useState } from 'react';
import { Droplets, Info, Waves } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const akiskanlar = [
  { ad: 'Su (20°C)', rho: 998, mu: 1.002 },
  { ad: 'Hava (20°C)', rho: 1.204, mu: 0.0181 },
  { ad: 'Deniz suyu', rho: 1025, mu: 1.08 },
  { ad: 'Hidrolik yağ', rho: 870, mu: 46 },
  { ad: 'Özel akışkan', rho: 0, mu: 0 },
] as const;

export default function ReynoldsSayisiCalculator() {
  const [akiskan, setAkiskan] = useState(0);
  const [cap, setCap] = useState('50');
  const [debi, setDebi] = useState('6');
  const [rho, setRho] = useState('998');
  const [mu, setMu] = useState('1.002');

  const hesap = useMemo(() => {
    const Dmm = parseLocalizedNumber(cap);
    const Qm3h = parseLocalizedNumber(debi);
    const base = akiskanlar[akiskan];
    const density = base.rho || parseLocalizedNumber(rho);
    const dynamicMuMpas = base.mu || parseLocalizedNumber(mu);

    if (Dmm <= 0 || Qm3h <= 0 || density <= 0 || dynamicMuMpas <= 0) return null;

    const D = Dmm / 1000;
    const Q = Qm3h / 3600;
    const area = Math.PI * Math.pow(D, 2) / 4;
    const velocity = Q / area;
    const dynamicMu = dynamicMuMpas / 1000;
    const re = (density * velocity * D) / dynamicMu;
    const regime = re < 2300 ? 'Laminer' : re < 4000 ? 'Geçiş bölgesi' : 'Türbülanslı';
    const frictionHint = re < 2300 ? 64 / re : 0.3164 / Math.pow(re, 0.25);
    const kinematicCst = dynamicMuMpas / density * 1000;

    return { Dmm, Qm3h, density, dynamicMuMpas, D, Q, area, velocity, re, regime, frictionHint, kinematicCst };
  }, [akiskan, cap, debi, mu, rho]);

  const setFluid = (index: number) => {
    setAkiskan(index);
    if (akiskanlar[index].rho) setRho(String(akiskanlar[index].rho));
    if (akiskanlar[index].mu) setMu(String(akiskanlar[index].mu));
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10">
            <Waves className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Reynolds Sayısı Hesaplama</h2>
            <p className="calc-prose mt-1">Boru içi akışta hız, Reynolds sayısı ve akış rejimini hesaplayın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="calc-title block mb-2">Akışkan</label>
            <select value={akiskan} onChange={(event) => setFluid(Number(event.target.value))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30">
              {akiskanlar.map((item, index) => (
                <option key={item.ad} value={index}>{item.ad}</option>
              ))}
            </select>
          </div>
          <InputField label="Boru iç çapı D (mm)" value={cap} onChange={setCap} />
          <InputField label="Debi Q (m³/h)" value={debi} onChange={setDebi} />
          <InputField label="Yoğunluk ρ (kg/m³)" value={rho} onChange={setRho} disabled={akiskanlar[akiskan].rho > 0} />
          <InputField label="Dinamik viskozite μ (mPa·s)" value={mu} onChange={setMu} disabled={akiskanlar[akiskan].mu > 0} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-cyan-600 dark:text-cyan-400 text-sm font-bold mb-4">Akış Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Result label="Reynolds sayısı" value={formatSmartNumber(hesap.re, 'tr-TR', 0)} />
            <Result label="Akış rejimi" value={hesap.regime} />
            <Result label="Ortalama hız" value={`${formatSmartNumber(hesap.velocity, 'tr-TR', 3)} m/s`} />
            <Result label="Kesit alanı" value={`${formatSmartNumber(hesap.area * 1e6, 'tr-TR', 1)} mm²`} />
            <Result label="Kinematik viskozite" value={`${formatSmartNumber(hesap.kinematicCst, 'tr-TR', 3)} cSt`} />
            <Result label="Yaklaşık sürtünme katsayısı" value={formatSmartNumber(hesap.frictionHint, 'tr-TR', 4)} />
          </div>

          <div className="mt-5 calc-panel rounded-xl p-4">
            <p className="font-mono text-xs calc-muted">
              Re = ρ·v·D / μ = {formatSmartNumber(hesap.density, 'tr-TR', 1)} × {formatSmartNumber(hesap.velocity, 'tr-TR', 3)} × {formatSmartNumber(hesap.D, 'tr-TR', 3)} / {formatSmartNumber(hesap.dynamicMuMpas / 1000, 'tr-TR', 6)}
            </p>
          </div>
        </div>
      )}

      <section className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Genel sınıflandırma: Re &lt; 2300 laminer, 2300-4000 geçiş, Re &gt; 4000 türbülanslı kabul edilir. Gerçek sınırlar boru pürüzlülüğü, giriş şartları ve sıcaklığa göre değişebilir.
          </p>
        </div>
      </section>
    </div>
  );
}

function InputField({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <div className="relative">
        <Droplets className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          inputMode="decimal"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))}
          className="calc-panel w-full pl-10 pr-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-70"
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
