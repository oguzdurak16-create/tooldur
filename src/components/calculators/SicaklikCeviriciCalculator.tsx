'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check, Thermometer, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber } from '@/lib/calculator-utils';

type BirimKey = 'C' | 'F' | 'K';

const birimler: Record<BirimKey, string> = {
  C: 'Celsius (°C)',
  F: 'Fahrenheit (°F)',
  K: 'Kelvin (K)',
};

const referanslar = [
  { ad: 'Mutlak sıfır', C: -273.15 },
  { ad: 'Su donma', C: 0 },
  { ad: 'Oda sıcaklığı', C: 20 },
  { ad: 'Vücut sıcaklığı', C: 37 },
  { ad: 'Su kaynama', C: 100 },
];

const celsiusaCevir = (value: number, birim: BirimKey): number => {
  switch (birim) {
    case 'C':
      return value;
    case 'F':
      return ((value - 32) * 5) / 9;
    case 'K':
      return value - 273.15;
  }
};

const celsiusdanCevir = (celsius: number, birim: BirimKey): number => {
  switch (birim) {
    case 'C':
      return celsius;
    case 'F':
      return (celsius * 9) / 5 + 32;
    case 'K':
      return celsius + 273.15;
  }
};

export default function SicaklikCeviriciCalculator() {
  const [deger, setDeger] = useState('25');
  const [kaynakBirim, setKaynakBirim] = useState<BirimKey>('C');
  const [hedefBirim, setHedefBirim] = useState<BirimKey>('F');
  const [sonuc, setSonuc] = useState('');
  const [kopyalandi, setKopyalandi] = useState(false);

  const hesapla = useCallback(() => {
    const sayi = parseLocalizedNumber(deger);

    if (Number.isNaN(sayi)) {
      setSonuc('');
      return;
    }

    const celsius = celsiusaCevir(sayi, kaynakBirim);
    const sonucDeger = celsiusdanCevir(celsius, hedefBirim);

    setSonuc(
      sonucDeger.toLocaleString('tr-TR', {
        maximumFractionDigits: 4,
      })
    );
  }, [deger, hedefBirim, kaynakBirim]);

  useEffect(() => {
    hesapla();
  }, [hesapla]);

  const birimleriDegistir = () => {
    setKaynakBirim(hedefBirim);
    setHedefBirim(kaynakBirim);
  };

  const kopyala = async () => {
    if (!sonuc) return;
    try {
      await navigator.clipboard.writeText(sonuc);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      setKopyalandi(false);
    }
  };

  const tumDonusumler = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return null;

    const celsius = celsiusaCevir(sayi, kaynakBirim);

    return (['C', 'F', 'K'] as BirimKey[]).map((birim) => ({
      birim,
      etiket: birimler[birim],
      deger: celsiusdanCevir(celsius, birim),
    }));
  }, [deger, kaynakBirim]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end mb-8">
          <div>
            <label className="calc-title block mb-2">Değer</label>
            <input
              type="text"
              inputMode="decimal"
              value={deger}
              onChange={(e) => setDeger(e.target.value.replace(/[^0-9.,-]/g, ''))}
              className="calc-panel w-full text-lg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30"
              placeholder="0"
            />
            <select
              value={kaynakBirim}
              onChange={(e) => setKaynakBirim(e.target.value as BirimKey)}
              className="calc-panel w-full mt-2 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={birimleriDegistir}
            type="button"
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all self-center mb-2 border border-[var(--border)] calc-panel hover:brightness-105"
            aria-label="Birimleri değiştir"
          >
            <ArrowLeftRight className="w-5 h-5 text-rose-500" />
          </button>

          <div>
            <label className="calc-title block mb-2">Sonuç</label>
            <div className="relative">
              <input
                type="text"
                value={sonuc}
                readOnly
                className="w-full text-lg px-4 py-3 rounded-xl pr-12 border bg-emerald-500/10 border-emerald-500/20 text-[var(--foreground)] outline-none"
              />
              <button
                onClick={kopyala}
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400"
                aria-label="Sonucu kopyala"
              >
                {kopyalandi ? (
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
            <select
              value={hedefBirim}
              onChange={(e) => setHedefBirim(e.target.value as BirimKey)}
              className="calc-panel w-full mt-2 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="calc-box-accent">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Sıcaklık dönüşümleri Celsius tabanı üzerinden hesaplanır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç Celsius, Fahrenheit ve Kelvin arasında hızlı sıcaklık dönüşümü yapmak için uygundur.
          </p>
        </div>
      </div>

      {tumDonusumler && (
        <div className="calc-box">
          <h4 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-500" />
            {deger} {birimler[kaynakBirim]}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tumDonusumler.map((item) => (
              <div
                key={item.birim}
                className={`rounded-xl p-4 text-center border ${
                  item.birim === hedefBirim
                    ? 'calc-result border-rose-500/30'
                    : 'calc-soft border-[var(--border)]'
                }`}
              >
                <span className="text-2xl font-bold text-[var(--foreground)]">
                  {item.deger.toFixed(2)}
                </span>
                <span className="block text-sm calc-muted mt-1">{item.etiket}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3">Referans Sıcaklıklar</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 text-[var(--foreground)]">Tanım</th>
                <th className="text-center py-2 text-[var(--foreground)]">°C</th>
                <th className="text-center py-2 text-[var(--foreground)]">°F</th>
                <th className="text-center py-2 text-[var(--foreground)]">K</th>
              </tr>
            </thead>
            <tbody>
              {referanslar.map((ref) => (
                <tr key={ref.ad} className="border-b border-[var(--border)]">
                  <td className="py-2 text-[var(--foreground)]">{ref.ad}</td>
                  <td className="text-center py-2 calc-muted">{ref.C}</td>
                  <td className="text-center py-2 calc-muted">
                    {celsiusdanCevir(ref.C, 'F').toFixed(1)}
                  </td>
                  <td className="text-center py-2 calc-muted">
                    {celsiusdanCevir(ref.C, 'K').toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">Sıcaklık Dönüşüm Notu</p>
            <p className="calc-prose">
              Kelvin mutlak sıcaklık ölçeğidir. Negatif Kelvin fiziksel olarak mümkün değildir.
              Fahrenheit ölçeği özellikle ABD’de yaygın kullanılır.
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Sıcaklık dönüşümü hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç sıcaklık değerlerini Celsius, Fahrenheit ve Kelvin birimleri arasında dönüştürür.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>sıcaklık çevirici</strong>, <strong>fahrenheit celsius çevirme</strong>,
              <strong> kelvin celsius dönüşümü</strong>, <strong>derece çevirici</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
