'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber } from '@/lib/calculator-utils';

const birimler = {
  m: { ad: 'Metre', carpan: 1 },
  km: { ad: 'Kilometre', carpan: 1000 },
  cm: { ad: 'Santimetre', carpan: 0.01 },
  mm: { ad: 'Milimetre', carpan: 0.001 },
  in: { ad: 'İnç (inch)', carpan: 0.0254 },
  ft: { ad: 'Feet', carpan: 0.3048 },
  yd: { ad: 'Yard', carpan: 0.9144 },
  mi: { ad: 'Mil (mile)', carpan: 1609.344 },
  nm: { ad: 'Deniz Mili', carpan: 1852 },
} as const;

type BirimKey = keyof typeof birimler;

export default function UzunlukCeviriciCalculator() {
  const [deger, setDeger] = useState('1');
  const [kaynakBirim, setKaynakBirim] = useState<BirimKey>('m');
  const [hedefBirim, setHedefBirim] = useState<BirimKey>('cm');
  const [sonuc, setSonuc] = useState<string>('100');
  const [kopyalandi, setKopyalandi] = useState(false);

  const hesapla = useCallback(() => {
    const sayi = parseLocalizedNumber(deger);

    if (Number.isNaN(sayi)) {
      setSonuc('');
      return;
    }

    const metreye = sayi * birimler[kaynakBirim].carpan;
    const sonucDeger = metreye / birimler[hedefBirim].carpan;

    if (Math.abs(sonucDeger) < 0.0001 || Math.abs(sonucDeger) > 999999999) {
      setSonuc(sonucDeger.toExponential(6));
    } else {
      setSonuc(
        sonucDeger.toLocaleString('tr-TR', {
          maximumFractionDigits: 8,
        })
      );
    }
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

  const ceviriTablosu = useMemo(() => {
    const sayi = parseLocalizedNumber(deger);
    if (Number.isNaN(sayi)) return [];

    const metreye = sayi * birimler[kaynakBirim].carpan;

    return Object.entries(birimler)
      .filter(([key]) => key !== kaynakBirim)
      .map(([key, val]) => {
        const cevrilmis = metreye / val.carpan;
        return {
          key,
          ad: val.ad,
          deger: cevrilmis,
        };
      });
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
              onChange={(e) => setDeğerTemiz(setDeger, e.target.value)}
              className="calc-panel w-full text-lg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="0"
            />
            <select
              value={kaynakBirim}
              onChange={(e) => setKaynakBirim(e.target.value as BirimKey)}
              className="calc-panel w-full mt-2 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} ({key})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={birimleriDegistir}
            type="button"
            title="Birimleri değiştir"
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all self-center mb-2 border border-[var(--border)] calc-panel hover:brightness-105"
          >
            <ArrowLeftRight className="w-5 h-5 text-blue-500" />
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
                title="Kopyala"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-emerald-600 dark:hover:text-emerald-400"
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
              className="calc-panel w-full mt-2 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {Object.entries(birimler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} ({key})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="calc-box-accent">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Tüm dönüşümler metre tabanı üzerinden yapılır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç metre, kilometre, santimetre, milimetre, inç, feet, yard, mil ve deniz mili arasında uzunluk dönüşümü yapar.
          </p>
        </div>
      </div>

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3">
          {deger} {birimler[kaynakBirim].ad} Çeviri Tablosu
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {ceviriTablosu.map((item) => (
            <div key={item.key} className="calc-soft rounded-lg p-3">
              <span className="calc-muted">{item.ad}:</span>
              <span className="font-medium text-[var(--foreground)] ml-2">
                {item.deger.toLocaleString('tr-TR', { maximumFractionDigits: 6 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">Uzunluk Dönüşüm Notu</p>
            <p className="calc-prose">
              İnç, feet ve yard emperyal sistemde; deniz mili ise özellikle denizcilik ve havacılıkta kullanılır.
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Uzunluk dönüşümü hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç farklı uzunluk birimleri arasında hızlı ve hassas dönüşüm yapar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>uzunluk çevirici</strong>, <strong>metre santimetre çevirme</strong>,
              <strong> inch metre dönüşümü</strong>, <strong>deniz mili çevirme</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function setDeğerTemiz(setter: (value: string) => void, value: string) {
  setter(value.replace(/[^0-9.,-]/g, ''));
}
