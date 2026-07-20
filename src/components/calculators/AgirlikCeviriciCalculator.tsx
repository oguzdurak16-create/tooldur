'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check, RotateCcw, Scale, Sparkles } from 'lucide-react';
import { copyTextSafe, formatCompactNumber, formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const birimler = {
  kg: { ad: 'Kilogram', carpan: 1 },
  g: { ad: 'Gram', carpan: 0.001 },
  mg: { ad: 'Miligram', carpan: 0.000001 },
  ton: { ad: 'Ton (metrik)', carpan: 1000 },
  lb: { ad: 'Pound (libre)', carpan: 0.45359237 },
  oz: { ad: 'Ons (ounce)', carpan: 0.02834952 },
  st: { ad: 'Stone', carpan: 6.35029 },
  gr: { ad: 'Grain', carpan: 0.00006479891 },
  ct: { ad: 'Karat', carpan: 0.0002 },
  quintal: { ad: 'Kental', carpan: 100 },
  okka: { ad: 'Okka (Osmanlı)', carpan: 1.2829 },
  uston: { ad: 'Kısa Ton (US)', carpan: 907.1847 },
};

type BirimKey = keyof typeof birimler;

const populerDonusumler: Array<{ value: string; from: BirimKey; to: BirimKey; label: string }> = [
  { value: '1', from: 'kg', to: 'lb', label: '1 kg → lb' },
  { value: '1000', from: 'g', to: 'kg', label: '1000 g → kg' },
  { value: '1', from: 'ton', to: 'kg', label: '1 ton → kg' },
  { value: '1', from: 'lb', to: 'kg', label: '1 lb → kg' },
  { value: '1', from: 'oz', to: 'g', label: '1 oz → g' },
  { value: '1', from: 'ct', to: 'g', label: '1 karat → g' },
];

export default function AgirlikCeviriciCalculator() {
  const [deger, setDeger] = useState('1');
  const [kaynakBirim, setKaynakBirim] = useState<BirimKey>('kg');
  const [hedefBirim, setHedefBirim] = useState<BirimKey>('lb');
  const [kopyalandi, setKopyalandi] = useState(false);

  const sonuc = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return '';

    const kgye = sayi * birimler[kaynakBirim].carpan;
    const sonucDeger = kgye / birimler[hedefBirim].carpan;
    return formatSmartNumber(sonucDeger);
  }, [deger, kaynakBirim, hedefBirim]);

  const quickResults = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return [];

    const kgye = sayi * birimler[kaynakBirim].carpan;

    return Object.entries(birimler)
      .filter(([key]) => key !== kaynakBirim)
      .map(([key, val]) => {
        const cevrilmis = kgye / val.carpan;
        return {
          key,
          ad: val.ad,
          deger: formatCompactNumber(cevrilmis),
        };
      });
  }, [deger, kaynakBirim]);

  const birimleriDegistir = () => {
    setKaynakBirim(hedefBirim);
    setHedefBirim(kaynakBirim);
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

  const sifirla = () => {
    setDeger('');
  };

  const presetUygula = (item: (typeof populerDonusumler)[number]) => {
    setDeger(item.value);
    setKaynakBirim(item.from);
    setHedefBirim(item.to);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="calc-box space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--foreground)] flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-500" />
              Ağırlık Çevirici
            </h2>
            <p className="calc-prose mt-1">
              Kilogram, gram, pound, ons, ton, karat ve diğer ağırlık birimleri arasında hızlı dönüşüm yapın.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
          <div className="space-y-2">
            <label className="calc-title">Değer</label>

            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={deger}
                onChange={(e) => setDeger(e.target.value)}
                className="w-full p-3 rounded-xl text-lg calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
                placeholder="0"
                aria-label="Ağırlık değeri"
              />
              {deger && (
                <button
                  onClick={sifirla}
                  className="absolute right-3 top-1/2 -translate-y-1/2 calc-muted hover:text-red-500 transition-colors"
                  title="Temizle"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={kaynakBirim}
              onChange={(e) => setKaynakBirim(e.target.value as BirimKey)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
              aria-label="Kaynak birim"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} ({key})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center pb-2">
            <button
              onClick={birimleriDegistir}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg hover:rotate-180 active:scale-90 bg-gradient-to-br from-sky-500 to-cyan-500 text-white"
              title="Birimleri yer değiştir"
              type="button"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="calc-title">Sonuç</label>

            <div className="relative">
              <input
                type="text"
                value={sonuc}
                readOnly
                className="w-full p-3 pr-14 rounded-xl text-lg font-semibold outline-none calc-result"
                aria-label="Dönüşüm sonucu"
              />
              <button
                onClick={kopyala}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
                title="Sonucu kopyala"
                type="button"
              >
                {kopyalandi ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Copy className="w-5 h-5 text-emerald-500" />
                )}
              </button>
            </div>

            <select
              value={hedefBirim}
              onChange={(e) => setHedefBirim(e.target.value as BirimKey)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-sky-500/30"
              aria-label="Hedef birim"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} ({key})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div aria-live="polite" className="sr-only">
          {sonuc
            ? `${deger || '0'} ${birimler[kaynakBirim].ad}, ${sonuc} ${birimler[hedefBirim].ad} eder.`
            : 'Henüz sonuç yok.'}
        </div>

        <div className="calc-box-accent">
          <p className="text-sm text-[var(--foreground)] font-semibold">
            {deger || '0'} {birimler[kaynakBirim].ad} = {sonuc || '—'} {birimler[hedefBirim].ad}
          </p>
          <p className="calc-prose mt-2">
            Kargo, mutfak, spor, kuyumculuk ve günlük kullanım için hızlı ağırlık dönüşümü yapabilirsiniz.
          </p>
        </div>
      </div>

      <div className="calc-box">
        <h3 className="calc-section-title mb-4">
          {deger || '0'} {birimler[kaynakBirim].ad} diğer birimlerde
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickResults.map((item) => (
            <div key={item.key} className="calc-soft rounded-xl p-3 flex justify-between items-center">
              <span className="calc-muted text-sm font-medium">{item.ad}</span>
              <span className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                {item.deger} <small className="calc-muted text-[10px]">{item.key}</small>
              </span>
            </div>
          ))}
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Ağırlık çevirici nasıl kullanılır?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Önce değeri girin, sonra kaynak ve hedef birimi seçin. Virgül veya nokta kullanabilirsiniz.
            </p>
          </div>
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              En sık aranan sorgular: <strong>kg lb çevirici</strong>, <strong>gram ons çevirme</strong>,
              <strong> ton kilogram dönüşümü</strong>.
            </p>
          </div>
        </div>

        <div className="calc-soft rounded-xl p-4">
          <h4 className="font-bold text-[var(--foreground)] mb-2">Örnekler</h4>
          <ul className="space-y-2 calc-prose">
            <li>1 kilogram kaç pound eder?</li>
            <li>1000 gram kaç kilogramdır?</li>
            <li>1 ons kaç gramdır?</li>
            <li>1 karat kaç gram eder?</li>
          </ul>
        </div>
      </section>
    </div>
  );
}