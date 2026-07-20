'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check, RotateCcw, LandPlot, Sparkles } from 'lucide-react';
import { copyTextSafe, formatCompactNumber, formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const birimler = {
  m2: { ad: 'Metrekare', carpan: 1 },
  km2: { ad: 'Kilometrekare', carpan: 1000000 },
  cm2: { ad: 'Santimetrekare', carpan: 0.0001 },
  mm2: { ad: 'Milimetrekare', carpan: 0.000001 },
  ha: { ad: 'Hektar', carpan: 10000 },
  donum: { ad: 'Dönüm / Dekar', carpan: 1000 },
  evlek: { ad: 'Evlek', carpan: 250 },
  ar: { ad: 'Ar', carpan: 100 },
  ft2: { ad: 'Feet kare', carpan: 0.09290304 },
  in2: { ad: 'İnç kare', carpan: 0.00064516 },
  yd2: { ad: 'Yard kare', carpan: 0.83612736 },
  ac: { ad: 'Acre', carpan: 4046.8564224 },
  mi2: { ad: 'Mil kare', carpan: 2589988.11 },
};

type BirimKey = keyof typeof birimler;

const populerDonusumler: Array<{ value: string; from: BirimKey; to: BirimKey; label: string }> = [
  { value: '1000', from: 'm2', to: 'donum', label: '1000 m² → dönüm' },
  { value: '1', from: 'ha', to: 'donum', label: '1 ha → dönüm' },
  { value: '1', from: 'donum', to: 'm2', label: '1 dönüm → m²' },
  { value: '1', from: 'km2', to: 'ha', label: '1 km² → ha' },
  { value: '500', from: 'm2', to: 'ft2', label: '500 m² → ft²' },
];

export default function AlanCeviriciCalculator() {
  const [deger, setDeger] = useState('1');
  const [kaynakBirim, setKaynakBirim] = useState<BirimKey>('m2');
  const [hedefBirim, setHedefBirim] = useState<BirimKey>('donum');
  const [kopyalandi, setKopyalandi] = useState(false);

  const sonuc = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return '';

    const m2ye = sayi * birimler[kaynakBirim].carpan;
    const sonucDeger = m2ye / birimler[hedefBirim].carpan;
    return formatSmartNumber(sonucDeger);
  }, [deger, kaynakBirim, hedefBirim]);

  const quickResults = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return [];

    const m2ye = sayi * birimler[kaynakBirim].carpan;

    return Object.entries(birimler)
      .filter(([key]) => key !== kaynakBirim)
      .map(([key, val]) => ({
        key,
        ad: val.ad,
        deger: formatCompactNumber(m2ye / val.carpan),
      }));
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
              <LandPlot className="w-5 h-5 text-emerald-500" />
              Alan Çevirici
            </h2>
            <p className="calc-prose mt-1">
              Metrekare, dönüm, dekar, hektar, acre ve diğer alan birimleri arasında hızlı dönüşüm yapın.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {populerDonusumler.map((item) => (
              <button key={item.label} onClick={() => presetUygula(item)} className="calc-chip" type="button">
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
                className="w-full p-3 rounded-xl text-lg outline-none transition-all calc-panel focus:ring-2 focus:ring-sky-500/30"
                placeholder="0"
                aria-label="Alan değeri"
              />
              {deger && (
                <button
                  onClick={sifirla}
                  className="absolute right-3 top-1/2 -translate-y-1/2 calc-muted hover:text-red-500 p-1 transition-colors"
                  type="button"
                  title="Temizle"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            <select
              value={kaynakBirim}
              onChange={(e) => setKaynakBirim(e.target.value as BirimKey)}
              className="w-full p-3 rounded-xl cursor-pointer outline-none transition-all calc-panel hover:brightness-[1.02] focus:ring-2 focus:ring-sky-500/30"
              aria-label="Kaynak alan birimi"
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
                className="w-full p-3 rounded-xl text-lg font-semibold outline-none calc-result pr-14"
                aria-label="Alan dönüşüm sonucu"
              />
              <button
                onClick={kopyala}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors hover:bg-emerald-500/10"
                title="Kopyala"
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
              className="w-full p-3 rounded-xl cursor-pointer outline-none transition-all calc-panel hover:brightness-[1.02] focus:ring-2 focus:ring-sky-500/30"
              aria-label="Hedef alan birimi"
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
            Özellikle <strong>metrekare dönüm çevirici</strong>, <strong>hektar dönüm hesaplama</strong> ve
            <strong> arsa alan dönüşümü</strong> için uygundur.
          </p>
        </div>
      </div>

      <div className="calc-box space-y-4">
        <h3 className="calc-section-title">
          {deger || '0'} {birimler[kaynakBirim].ad} karşılığı
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickResults.map((item) => (
            <div key={item.key} className="calc-soft rounded-xl p-3 flex flex-col">
              <span className="calc-muted text-xs font-medium uppercase tracking-wider">{item.ad}</span>
              <span className="font-bold text-[var(--foreground)] text-sm mt-1">
                {item.deger} <small className="calc-muted text-[10px]">{item.key}</small>
              </span>
            </div>
          ))}
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Alan çevirici ne işe yarar?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Tarla, arsa, bahçe, emlak ve proje ölçülerinde metrekare, dönüm, dekar ve hektar arasında hızlı
              karşılaştırma yapabilirsiniz.
            </p>
          </div>
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aranan örnekler: <strong>1 dönüm kaç metrekare</strong>, <strong>1000 m2 kaç dönüm</strong>,
              <strong> 1 hektar kaç dönüm</strong>.
            </p>
          </div>
        </div>

        <div className="calc-soft rounded-xl p-4">
          <h4 className="font-bold text-[var(--foreground)] mb-2">Hızlı bilgi</h4>
          <ul className="space-y-2 calc-prose">
            <li>1 dönüm = 1000 m²</li>
            <li>1 hektar = 10.000 m²</li>
            <li>1 ar = 100 m²</li>
            <li>1 evlek = 250 m²</li>
          </ul>
        </div>
      </section>
    </div>
  );
}