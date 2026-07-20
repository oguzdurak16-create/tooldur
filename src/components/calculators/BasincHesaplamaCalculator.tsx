'use client';

import { useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check, Info, Calculator, Hash, Sparkles, Gauge } from 'lucide-react';
import { copyTextSafe, formatCompactNumber, formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const birimler = {
  Pa: { ad: 'Pascal', carpan: 1, sembol: 'Pa' },
  kPa: { ad: 'Kilopascal', carpan: 1000, sembol: 'kPa' },
  MPa: { ad: 'Megapascal', carpan: 1000000, sembol: 'MPa' },
  bar: { ad: 'Bar', carpan: 100000, sembol: 'bar' },
  mbar: { ad: 'Milibar', carpan: 100, sembol: 'mbar' },
  psi: { ad: 'PSI', carpan: 6894.75729, sembol: 'psi' },
  atm: { ad: 'Atmosfer', carpan: 101325, sembol: 'atm' },
  mmHg: { ad: 'mmHg (Torr)', carpan: 133.322368, sembol: 'mmHg' },
  inHg: { ad: 'inHg', carpan: 3386.388, sembol: 'inHg' },
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
  const [deger, setDeger] = useState<string>('1');
  const [kaynakBirim, setKaynakBirim] = useState<BirimKey>('bar');
  const [hedefBirim, setHedefBirim] = useState<BirimKey>('psi');
  const [kopyalandi, setKopyalandi] = useState(false);

  const temizDeger = useMemo(() => {
    const n = parseLocalizedNumber(deger);
    return Number.isNaN(n) ? 0 : n;
  }, [deger]);

  const sonuc = useMemo(() => {
    if (temizDeger === 0) return '0';

    const pascala = temizDeger * birimler[kaynakBirim].carpan;
    const sonucDeger = pascala / birimler[hedefBirim].carpan;

    return formatSmartNumber(sonucDeger, 'tr-TR', 6);
  }, [temizDeger, kaynakBirim, hedefBirim]);

  const tumSonuclar = useMemo(() => {
    const pascala = temizDeger * birimler[kaynakBirim].carpan;

    return Object.entries(birimler).map(([key, val]) => {
      const v = pascala / val.carpan;
      return {
        key,
        ad: val.ad,
        sembol: val.sembol,
        deger: formatCompactNumber(v, 'tr-TR', 3),
        aktif: key === hedefBirim,
      };
    });
  }, [temizDeger, kaynakBirim, hedefBirim]);

  const birimleriDegistir = () => {
    setKaynakBirim(hedefBirim);
    setHedefBirim(kaynakBirim);
  };

  const kopyala = async () => {
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="calc-box overflow-hidden p-0">
        {/* Header */}
        <div className="px-6 py-6 md:px-8 border-b border-[var(--border)] bg-[color:var(--foreground)] text-[color:var(--background)]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg text-white">
                <Calculator size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Basınç Birim Çevirici
                </h2>
                <p className="text-xs uppercase tracking-widest opacity-70">
                  Profesyonel Dönüştürücü
                </p>
              </div>
            </div>

            <Hash className="opacity-20" />
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-8 items-center">
            {/* Kaynak Girişi */}
            <div className="space-y-4">
              <label className="block text-sm font-bold calc-muted uppercase ml-1">
                Giriş Miktarı
              </label>

              <div className="group relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={deger}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setDeger(val);
                  }}
                  className="w-full h-16 px-5 pr-16 text-2xl font-bold rounded-2xl calc-panel outline-none transition-all focus:ring-2 focus:ring-blue-500/30"
                  placeholder="0.00"
                  aria-label="Basınç giriş değeri"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 calc-muted font-medium">
                  {birimler[kaynakBirim].sembol}
                </span>
              </div>

              <select
                value={kaynakBirim}
                onChange={(e) => setKaynakBirim(e.target.value as BirimKey)}
                className="w-full h-12 px-4 calc-panel rounded-xl text-[var(--foreground)] font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                aria-label="Kaynak basınç birimi"
              >
                {Object.entries(birimler).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.ad}
                  </option>
                ))}
              </select>
            </div>

            {/* Orta Takas Butonu */}
            <div className="flex justify-center">
              <button
                onClick={birimleriDegistir}
                className="w-14 h-14 bg-gradient-to-br from-sky-500 to-cyan-500 text-white rounded-full flex items-center justify-center transition-all shadow-lg active:scale-90 group"
                type="button"
                title="Birimleri değiştir"
              >
                <ArrowLeftRight className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            {/* Hedef Çıktı */}
            <div className="space-y-4">
              <label className="block text-sm font-bold calc-muted uppercase ml-1">Sonuç</label>

              <div className="relative">
                <div className="w-full min-h-16 px-5 py-4 flex items-center text-2xl font-black rounded-2xl calc-result">
                  <span className="break-all">{sonuc}</span>
                  <span className="ml-auto text-sm font-bold opacity-60 uppercase tracking-widest pl-3">
                    {birimler[hedefBirim].sembol}
                  </span>
                </div>

                <button
                  onClick={kopyala}
                  className="absolute -right-3 -top-3 p-2 bg-[var(--background)] shadow-md border border-[var(--border)] rounded-lg hover:bg-[color:var(--bg-surface)] transition-colors group"
                  type="button"
                  title="Sonucu kopyala"
                >
                  {kopyalandi ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 calc-muted group-hover:text-blue-500" />
                  )}
                </button>
              </div>

              <select
                value={hedefBirim}
                onChange={(e) => setHedefBirim(e.target.value as BirimKey)}
                className="w-full h-12 px-4 calc-panel rounded-xl text-[var(--foreground)] font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
                aria-label="Hedef basınç birimi"
              >
                {Object.entries(birimler).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.ad}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div aria-live="polite" className="sr-only">
            {deger || '0'} {birimler[kaynakBirim].sembol}, {sonuc} {birimler[hedefBirim].sembol} eder.
          </div>

          <div className="calc-box-accent">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {deger || '0'} {birimler[kaynakBirim].sembol} = {sonuc} {birimler[hedefBirim].sembol}
            </p>
            <p className="calc-prose mt-2">
              Kompresör, hidrolik, pnömatik, laboratuvar ve proses uygulamalarında bar, psi, kPa, MPa ve atm
              karşılaştırmaları için hızlı kullanım sunar.
            </p>
          </div>

          {/* Hızlı Karşılaştırma Paneli */}
          <div className="calc-soft rounded-3xl p-6 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <Info size={20} className="text-blue-500" />
              <h3 className="calc-section-title">
                Tüm birimlerde karşılığı
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tumSonuclar.map((item) => (
                <div
                  key={item.key}
                  className={`p-4 rounded-2xl border transition-all ${
                    item.aktif
                      ? 'calc-result'
                      : 'calc-panel'
                  }`}
                >
                  <p className="text-[10px] font-black calc-muted uppercase mb-1">
                    {item.ad}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-mono font-bold text-[var(--foreground)]">
                      {item.deger}
                    </span>
                    <span className="text-[10px] calc-muted">{item.sembol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center border-t border-[var(--border)] bg-[color:var(--bg-surface)]">
          <p className="text-[11px] calc-muted">
            Hassas mühendislik hesaplamaları için katsayıları ayrıca teyit ediniz. 1 atm = 101.325 Pa baz alınmıştır.
          </p>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Basınç dönüşümü hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Basınç değerini girip kaynak ve hedef birimi seçerek anında dönüşüm yapabilirsiniz. Virgül ya da nokta
              ile ondalıklı giriş desteklenir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>bar psi çevirici</strong>, <strong>kPa bar dönüşümü</strong>,
              <strong> atm kaç bar</strong>, <strong>mmHg atm çevirme</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}