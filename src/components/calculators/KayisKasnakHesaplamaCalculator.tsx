'use client';

import { useMemo, useState } from 'react';
import { Calculator, Sparkles, AlertTriangle, RotateCw } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const KAYIS_TIPLERI = [
  { ad: 'Z (10×6)', Lp_min: 400, seri: 'Z', genislik: 10, yukseklik: 6, dp_min: 50 },
  { ad: 'A (13×8)', Lp_min: 550, seri: 'A', genislik: 13, yukseklik: 8, dp_min: 75 },
  { ad: 'B (17×11)', Lp_min: 700, seri: 'B', genislik: 17, yukseklik: 11, dp_min: 125 },
  { ad: 'C (22×14)', Lp_min: 1200, seri: 'C', genislik: 22, yukseklik: 14, dp_min: 200 },
  { ad: 'D (32×19)', Lp_min: 2000, seri: 'D', genislik: 32, yukseklik: 19, dp_min: 355 },
] as const;

export default function KayisKasnakHesaplamaCalculator() {
  const [d1, setD1] = useState('100');
  const [d2, setD2] = useState('250');
  const [n1, setN1] = useState('1450');
  const [C, setC] = useState('500');
  const [guc, setGuc] = useState('5.5');
  const [kayisTip, setKayisTip] = useState(1);

  const values = useMemo(() => {
    const D1 = parseLocalizedNumber(d1) || 0;
    const D2 = parseLocalizedNumber(d2) || 0;
    const N1 = parseLocalizedNumber(n1) || 0;
    const cMes = parseLocalizedNumber(C) || 0;
    const P = parseLocalizedNumber(guc) || 0;

    const i = D1 > 0 ? D2 / D1 : 0;
    const n2 = D1 > 0 && D2 > 0 ? (N1 * D1) / D2 : 0;
    const v = D1 > 0 && N1 > 0 ? (Math.PI * D1 * N1) / 60000 : 0;
    const L =
      cMes > 0
        ? 2 * cMes + (Math.PI * (D1 + D2)) / 2 + Math.pow(D2 - D1, 2) / (4 * cMes)
        : 0;
    const alfa = cMes > 0 ? 180 - (57.3 * (D2 - D1)) / cMes : 180;

    const kayis = KAYIS_TIPLERI[kayisTip];
    const Pb =
      v > 0 ? (kayis.genislik * kayis.yukseklik * v * 0.001 * (1 - 5.2 / v)) * 0.8 : 0;
    const kaySayisi = Pb > 0 ? Math.ceil(P / Pb) : 0;

    return {
      D1,
      D2,
      N1,
      cMes,
      P,
      i,
      n2,
      v,
      L,
      alfa,
      kayis,
      Pb,
      kaySayisi,
    };
  }, [d1, d2, n1, C, guc, kayisTip]);

  const showResult = values.D1 > 0 && values.D2 > 0;

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <RotateCw className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Kayış Kasnak Hesaplama</h2>
            <p className="calc-prose mt-1">
              Çevrim oranı, çıkış devri, kayış hızı, kayış uzunluğu ve önerilen kayış sayısını hesaplayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField label="Tahrik Kasnağı Çapı d₁ (mm)" value={d1} onChange={setD1} />
          <InputField label="Tahrikli Kasnak Çapı d₂ (mm)" value={d2} onChange={setD2} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField label="Motor Devri n₁ (rpm)" value={n1} onChange={setN1} />
          <InputField label="Merkez Mesafesi C (mm)" value={C} onChange={setC} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField label="İletilen Güç (kW)" value={guc} onChange={setGuc} />
          <div>
            <label className="calc-title block mb-2">Kayış Tipi</label>
            <select
              value={kayisTip}
              onChange={(e) => setKayisTip(Number(e.target.value))}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              {KAYIS_TIPLERI.map((k, i) => (
                <option key={i} value={i}>
                  {k.ad}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen seri: {values.kayis.ad}
          </p>
          <p className="calc-prose mt-2">
            Bu araç V-kayış transmisyonlarında ön boyutlandırma ve hızlı kontrol için uygundur. Nihai seçimde üretici katalogları ve servis faktörleri ayrıca dikkate alınmalıdır.
          </p>
        </div>
      </div>

      {showResult && (
        <div className="calc-box">
          <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-4">
            ⚙️ Kayış-Kasnak Hesap Sonucu
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { l: 'Çevrim Oranı i', v: formatSmartNumber(values.i, 'tr-TR', 2) },
              { l: 'Çıkış Devri n₂', v: `${formatSmartNumber(values.n2, 'tr-TR', 0)} rpm` },
              { l: 'Kayış Hızı v', v: `${formatSmartNumber(values.v, 'tr-TR', 2)} m/s` },
              { l: 'Kayış Uzunluğu L', v: `${formatSmartNumber(values.L, 'tr-TR', 0)} mm` },
              { l: 'Sarım Açısı α₁', v: `${formatSmartNumber(values.alfa, 'tr-TR', 1)}°` },
              { l: 'Önerilen Kayış Sayısı', v: `${values.kaySayisi || '-'} adet (${values.kayis.seri})` },
            ].map((r, i) => (
              <div
                key={i}
                className="calc-soft flex justify-between py-3 px-4 rounded-xl"
              >
                <span className="calc-muted text-sm">{r.l}</span>
                <span className="font-bold font-mono text-[var(--foreground)]">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 calc-panel rounded-xl p-4 text-xs">
            <p className="font-mono calc-muted">
              L = 2C + π(d₁+d₂)/2 + (d₂−d₁)²/(4C)
            </p>
            <p className="font-mono calc-muted mt-1">
              α₁ = 180° − 57.3×(d₂−d₁)/C
            </p>
          </div>
        </div>
      )}

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-[var(--foreground)] mb-1">Kayış Hızı Uyarısı</p>
            <p className="calc-prose">
              V-kayış hızı genelde <strong>25 m/s</strong> değerini aşmamalıdır.
              {values.v > 25 && (
                <span className="text-red-600 font-semibold"> Mevcut hız {formatSmartNumber(values.v, 'tr-TR', 1)} m/s — sınır aşılıyor.</span>
              )}{' '}
              Sarım açısı <strong>120°</strong> altına düşmemelidir.
              {values.alfa < 120 && (
                <span className="text-red-600 font-semibold"> α = {formatSmartNumber(values.alfa, 'tr-TR', 1)}° — yetersiz.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Kayış kasnak hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç kasnak çapları, motor devri ve merkez mesafesine göre çevrim oranı, çıkış devri ve kayış uzunluğu hesabı yapar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>kayış kasnak hesaplama</strong>, <strong>v kayışı boy hesabı</strong>,
              <strong> kasnak çevrim oranı</strong>, <strong>kayış uzunluğu formülü</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar yaklaşık ön seçim içindir. Nihai uygulamada servis faktörü, kayma etkisi, kayış üretici tabloları ve gerçek standart boylar ayrıca kontrol edilmelidir.
          </p>
        </div>
      </section>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30"
      />
    </div>
  );
}