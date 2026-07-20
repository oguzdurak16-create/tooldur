'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check, Sparkles, Beaker } from 'lucide-react';
import { copyTextSafe, formatCompactNumber, formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const birimler = {
  L: { ad: 'Litre', carpan: 1 },
  mL: { ad: 'Mililitre', carpan: 0.001 },
  m3: { ad: 'Metreküp', carpan: 1000 },
  cm3: { ad: 'Santimetreküp', carpan: 0.001 },
  mm3: { ad: 'Milimetreküp', carpan: 0.000001 },
  gal_us: { ad: 'Galon (US)', carpan: 3.78541 },
  gal_uk: { ad: 'Galon (UK)', carpan: 4.54609 },
  qt: { ad: 'Quart (US)', carpan: 0.946353 },
  pt: { ad: 'Pint (US)', carpan: 0.473176 },
  fl_oz: { ad: 'Fluid ounce (US)', carpan: 0.0295735 },
  cup: { ad: 'Cup (US)', carpan: 0.236588 },
  tbsp: { ad: 'Yemek kaşığı', carpan: 0.0147868 },
  tsp: { ad: 'Çay kaşığı', carpan: 0.00492892 },
  bbl: { ad: 'Varil (petrol)', carpan: 158.987 },
};

type BirimKey = keyof typeof birimler;

const populerDonusumler: Array<{ value: string; from: BirimKey; to: BirimKey; label: string }> = [
  { value: '1', from: 'L', to: 'mL', label: '1 L → mL' },
  { value: '1', from: 'm3', to: 'L', label: '1 m³ → L' },
  { value: '1', from: 'gal_us', to: 'L', label: '1 gal → L' },
  { value: '1', from: 'cup', to: 'mL', label: '1 cup → mL' },
  { value: '1', from: 'bbl', to: 'L', label: '1 varil → L' },
];

export default function HacimCeviriciCalculator() {
  const [deger, setDeger] = useState('1');
  const [kaynakBirim, setKaynakBirim] = useState<BirimKey>('L');
  const [hedefBirim, setHedefBirim] = useState<BirimKey>('mL');
  const [kopyalandi, setKopyalandi] = useState(false);

  const sonuc = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return '';

    const litreye = sayi * birimler[kaynakBirim].carpan;
    const sonucDeger = litreye / birimler[hedefBirim].carpan;

    return formatSmartNumber(sonucDeger, 'tr-TR', 8);
  }, [deger, kaynakBirim, hedefBirim]);

  const tabloSonuclari = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return [];

    const litreye = sayi * birimler[kaynakBirim].carpan;

    return Object.entries(birimler)
      .filter(([key]) => key !== kaynakBirim)
      .slice(0, 9)
      .map(([key, val]) => ({
        key,
        ad: val.ad,
        deger: formatCompactNumber(litreye / val.carpan, 'tr-TR', 6),
      }));
  }, [deger, kaynakBirim]);

  const birimleriDegistir = () => {
    const temp = kaynakBirim;
    setKaynakBirim(hedefBirim);
    setHedefBirim(temp);
  };

  const kopyala = async () => {
    if (!sonuc) return;

    const ok = await copyTextSafe(
      `${deger || '0'} ${birimler[kaynakBirim].ad} = ${sonuc} ${birimler[hedefBirim].ad}`
    );

    if (!ok) return;

    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 2000);
  };

  const presetUygula = (item: (typeof populerDonusumler)[number]) => {
    setDeger(item.value);
    setKaynakBirim(item.from);
    setHedefBirim(item.to);
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-cyan-500/10">
            <Beaker className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Hacim Birimi Çevirici</h2>
            <p className="calc-prose mt-1">
              Litre, mililitre, metreküp, galon, cup, yemek kaşığı ve diğer hacim birimleri arasında dönüşüm yapın.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {populerDonusumler.map((item) => (
            <button
              key={item.label}
              onClick={() => presetUygula(item)}
              className="calc-chip"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end mb-8">
          <div>
            <label className="calc-title">Değer</label>
            <input
              type="text"
              inputMode="decimal"
              value={deger}
              onChange={(e) => setDeger(e.target.value.replace(/[^0-9.,-]/g, ''))}
              className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-cyan-500/30 text-lg"
              placeholder="0"
            />

            <select
              value={kaynakBirim}
              onChange={(e) => setKaynakBirim(e.target.value as BirimKey)}
              className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={birimleriDegistir}
            className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-sky-500 text-white rounded-full flex items-center justify-center transition-all self-center mb-2 shadow-lg active:scale-90"
            type="button"
            title="Birimleri değiştir"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>

          <div>
            <label className="calc-title">Sonuç</label>
            <div className="relative mt-2">
              <input
                type="text"
                value={sonuc}
                readOnly
                className="w-full px-4 py-3 rounded-xl calc-result pr-12 text-lg outline-none"
              />
              <button
                onClick={kopyala}
                className="absolute right-3 top-1/2 -translate-y-1/2 calc-muted hover:text-cyan-600 transition-colors"
                type="button"
                title="Kopyala"
              >
                {kopyalandi ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>

            <select
              value={hedefBirim}
              onChange={(e) => setHedefBirim(e.target.value as BirimKey)}
              className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-cyan-500/30"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="calc-box-accent">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {deger || '0'} {birimler[kaynakBirim].ad} = {sonuc || '—'} {birimler[hedefBirim].ad}
          </p>
          <p className="calc-prose mt-2">
            Bu araç mutfak ölçüleri, laboratuvar hacimleri, sıvı hesapları ve endüstriyel dönüşümler için uygundur.
          </p>
        </div>
      </div>

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3">
          {deger || '0'} {birimler[kaynakBirim].ad} çeviri tablosu
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {tabloSonuclari.map((item) => (
            <div key={item.key} className="calc-soft rounded-lg p-3">
              <span className="calc-muted">{item.ad}:</span>
              <span className="font-medium text-[var(--foreground)] ml-2">
                {item.deger}
              </span>
            </div>
          ))}
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Hacim dönüşümü hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, litre tabanlı dönüşüm mantığıyla hacim birimleri arasında hızlı ve anlaşılır sonuç üretir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>hacim çevirici</strong>, <strong>litre ml dönüşümü</strong>,
              <strong> galon litre çevirme</strong>, <strong>cup ml hesabı</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar standart dönüşüm katsayılarına göre hesaplanır. Özellikle mutfak ve günlük kullanımda
            US/UK hacim farklarına dikkat edilmelidir.
          </p>
        </div>
      </section>
    </div>
  );
}