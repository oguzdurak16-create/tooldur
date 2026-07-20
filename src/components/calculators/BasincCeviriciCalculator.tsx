'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check, Info, Calculator, Gauge, Sparkles } from 'lucide-react';
import { copyTextSafe, formatCompactNumber, formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const birimler = {
  Pa: { ad: 'Pascal', carpan: 1, sembol: 'Pa' },
  kPa: { ad: 'Kilopascal', carpan: 1000, sembol: 'kPa' },
  MPa: { ad: 'Megapascal', carpan: 1000000, sembol: 'MPa' },
  bar: { ad: 'Bar', carpan: 100000, sembol: 'bar' },
  mbar: { ad: 'Milibar', carpan: 100, sembol: 'mbar' },
  psi: { ad: 'PSI', carpan: 6894.76, sembol: 'psi' },
  atm: { ad: 'Atmosfer', carpan: 101325, sembol: 'atm' },
  mmHg: { ad: 'mmHg (Torr)', carpan: 133.322, sembol: 'mmHg' },
  inHg: { ad: 'inHg', carpan: 3386.39, sembol: 'inHg' },
  'kgf/cm2': { ad: 'kgf/cm²', carpan: 98066.5, sembol: 'kgf/cm²' },
};

type BirimKey = keyof typeof birimler;

const populerDonusumler: Array<{ value: string; from: BirimKey; to: BirimKey; label: string }> = [
  { value: '1', from: 'bar', to: 'psi', label: '1 bar → psi' },
  { value: '1', from: 'atm', to: 'bar', label: '1 atm → bar' },
  { value: '100', from: 'kPa', to: 'bar', label: '100 kPa → bar' },
  { value: '1', from: 'MPa', to: 'bar', label: '1 MPa → bar' },
  { value: '760', from: 'mmHg', to: 'atm', label: '760 mmHg → atm' },
];

export default function BasincCevirici() {
  const [deger, setDeger] = useState('1');
  const [kaynakBirim, setKaynakBirim] = useState<BirimKey>('bar');
  const [hedefBirim, setHedefBirim] = useState<BirimKey>('psi');
  const [kopyalandi, setKopyalandi] = useState(false);

  const sonuc = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return '';

    const pascala = sayi * birimler[kaynakBirim].carpan;
    const sonucDeger = pascala / birimler[hedefBirim].carpan;

    return formatSmartNumber(sonucDeger, 'tr-TR', 6);
  }, [deger, kaynakBirim, hedefBirim]);

  const quickResults = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return [];

    const pascala = sayi * birimler[kaynakBirim].carpan;

    return Object.entries(birimler)
      .filter(([key]) => key !== kaynakBirim)
      .map(([key, val]) => ({
        key,
        ad: val.ad,
        sembol: val.sembol,
        deger: formatCompactNumber(pascala / val.carpan, 'tr-TR', 4),
      }));
  }, [deger, kaynakBirim]);

  const birimleriDegistir = () => {
    setKaynakBirim(hedefBirim);
    setHedefBirim(kaynakBirim);
  };

  const kopyala = async () => {
    if (!sonuc) return;

    const ok = await copyTextSafe(
      `${deger || '0'} ${birimler[kaynakBirim].sembol} = ${sonuc} ${birimler[hedefBirim].sembol}`
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="calc-box space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--foreground)] flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-500" />
              Basınç Birimi Çevirici
            </h2>
            <p className="calc-prose mt-1">
              Bar, psi, Pa, kPa, MPa, atm, mmHg ve diğer basınç birimleri arasında anlık dönüşüm yapın.
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-6 items-start">
          <div className="space-y-3">
            <label className="calc-title">Giriş Değeri</label>

            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={deger}
                onChange={(e) => setDeger(e.target.value)}
                className="w-full h-14 px-4 text-xl font-medium rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="0.00"
                aria-label="Basınç değeri"
              />
            </div>

            <select
              value={kaynakBirim}
              onChange={(e) => setKaynakBirim(e.target.value as BirimKey)}
              className="w-full h-12 px-3 rounded-lg calc-panel text-[var(--foreground)] font-medium outline-none hover:brightness-[1.02] transition-all cursor-pointer focus:ring-2 focus:ring-blue-500/30"
              aria-label="Kaynak basınç birimi"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} ({val.sembol})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center pt-8">
            <button
              onClick={birimleriDegistir}
              className="group w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 bg-gradient-to-br from-sky-500 to-cyan-500 text-white"
              title="Birimleri Takas Et"
              type="button"
            >
              <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          <div className="space-y-3">
            <label className="calc-title">Dönüştürülen Değer</label>

            <div className="relative">
              <input
                type="text"
                value={sonuc}
                readOnly
                className="w-full h-14 px-4 pr-14 text-xl font-bold rounded-xl cursor-default outline-none calc-result"
                aria-label="Basınç dönüşüm sonucu"
              />
              <button
                onClick={kopyala}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-emerald-500/10 transition-colors"
                type="button"
                title="Kopyala"
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
              className="w-full h-12 px-3 rounded-lg calc-panel text-[var(--foreground)] font-medium outline-none hover:brightness-[1.02] transition-all cursor-pointer focus:ring-2 focus:ring-blue-500/30"
              aria-label="Hedef basınç birimi"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} ({val.sembol})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div aria-live="polite" className="sr-only">
          {sonuc
            ? `${deger || '0'} ${birimler[kaynakBirim].sembol}, ${sonuc} ${birimler[hedefBirim].sembol} eder.`
            : 'Henüz sonuç yok.'}
        </div>

        <div className="calc-box-accent">
          <p className="text-sm text-[var(--foreground)] font-semibold">
            {deger || '0'} {birimler[kaynakBirim].sembol} = {sonuc || '—'} {birimler[hedefBirim].sembol}
          </p>
          <p className="calc-prose mt-2">
            Bu araç; kompresör, hidrolik, pnömatik, lastik basıncı, laboratuvar ve endüstriyel ölçümlerde hızlı
            karşılaştırma yapmak için uygundur.
          </p>
        </div>
      </div>

      <div className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-blue-500" />
          <h3 className="calc-section-title">
            {deger || '0'} {birimler[kaynakBirim].sembol} karşılıkları
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickResults.map((item) => (
            <div
              key={item.key}
              className="calc-soft rounded-xl p-3 flex flex-col"
            >
              <span className="text-[10px] uppercase tracking-wider font-bold calc-muted mb-1">
                {item.ad}
              </span>
              <span className="text-sm font-mono font-semibold text-[var(--foreground)] truncate">
                {item.deger}
                <span className="ml-1 calc-muted font-normal">{item.sembol}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Basınç çevirici nasıl kullanılır?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Basınç değerini girin, ardından kaynak ve hedef birimi seçin. Sonuç anında güncellenir ve tek tıkla
              kopyalanabilir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aranan örnekler: <strong>bar psi çevirici</strong>, <strong>kPa bar dönüşümü</strong>,
              <strong> atm bar hesaplama</strong>, <strong>mmHg atm çevirme</strong>.
            </p>
          </div>
        </div>

        <div className="calc-soft rounded-xl p-4">
          <h4 className="font-bold text-[var(--foreground)] mb-2">Kısa bilgi</h4>
          <ul className="space-y-2 calc-prose">
            <li>1 bar = 100.000 Pa</li>
            <li>1 atm = 101.325 Pa</li>
            <li>1 psi ≈ 6.894,76 Pa</li>
            <li>760 mmHg ≈ 1 atm</li>
          </ul>
        </div>
      </section>

      <p className="text-center text-xs calc-muted italic">
        * Hesaplamalar standart dönüşüm katsayıları ile yapılır. Kritik mühendislik uygulamalarında proje
        gereksinimlerine göre ayrıca doğrulama yapınız.
      </p>
    </div>
  );
}