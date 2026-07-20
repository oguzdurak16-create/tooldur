'use client';

import { useMemo, useState } from 'react';
import { Calculator, Percent, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type HesaplamaTipi =
  | 'yuzdeHesapla'
  | 'yuzdeBul'
  | 'yuzdeArtis'
  | 'yuzdeAzalis'
  | 'artisMiktari';

type Sonuc = {
  deger: string;
  aciklama: string;
};

const hesaplamaTipleri: Array<{
  value: HesaplamaTipi;
  label: string;
  inputs: Array<'sayi1' | 'sayi2' | 'yuzde'>;
}> = [
  { value: 'yuzdeHesapla', label: "X'in Y%'si", inputs: ['sayi1', 'yuzde'] },
  { value: 'yuzdeBul', label: "X, Y'nin %kaçı", inputs: ['sayi1', 'sayi2'] },
  { value: 'yuzdeArtis', label: "X'e Y% artış", inputs: ['sayi1', 'yuzde'] },
  { value: 'yuzdeAzalis', label: "X'den Y% azalış", inputs: ['sayi1', 'yuzde'] },
  { value: 'artisMiktari', label: "X'ten Y'ye değişim %", inputs: ['sayi1', 'sayi2'] },
];

function temizSayisal(value: string) {
  return value.replace(/[^0-9.,-]/g, '');
}

export default function YuzdeHesaplamaCalculator() {
  const [hesaplamaTipi, setHesaplamaTipi] = useState<HesaplamaTipi>('yuzdeHesapla');
  const [formData, setFormData] = useState({
    sayi1: '',
    sayi2: '',
    yuzde: '',
  });
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);

  const aktifTip = useMemo(
    () => hesaplamaTipleri.find((t) => t.value === hesaplamaTipi),
    [hesaplamaTipi]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: temizSayisal(e.target.value),
    });
  };

  const hesapla = () => {
    const s1 = parseLocalizedNumber(formData.sayi1);
    const s2 = parseLocalizedNumber(formData.sayi2);
    const y = parseLocalizedNumber(formData.yuzde);

    let sonucDeger = 0;
    let aciklama = '';

    switch (hesaplamaTipi) {
      case 'yuzdeHesapla':
        if (Number.isNaN(s1) || Number.isNaN(y)) return;
        sonucDeger = s1 * (y / 100);
        aciklama = `${formatSmartNumber(s1, 'tr-TR', 4)} sayısının %${formatSmartNumber(y, 'tr-TR', 4)}'i = ${formatSmartNumber(sonucDeger, 'tr-TR', 4)}`;
        break;

      case 'yuzdeBul':
        if (Number.isNaN(s1) || Number.isNaN(s2) || s2 === 0) return;
        sonucDeger = (s1 / s2) * 100;
        aciklama = `${formatSmartNumber(s1, 'tr-TR', 4)}, ${formatSmartNumber(s2, 'tr-TR', 4)} sayısının %${formatSmartNumber(sonucDeger, 'tr-TR', 4)}'i`;
        break;

      case 'yuzdeArtis':
        if (Number.isNaN(s1) || Number.isNaN(y)) return;
        sonucDeger = s1 * (1 + y / 100);
        aciklama = `${formatSmartNumber(s1, 'tr-TR', 4)} + %${formatSmartNumber(y, 'tr-TR', 4)} artış = ${formatSmartNumber(sonucDeger, 'tr-TR', 4)}`;
        break;

      case 'yuzdeAzalis':
        if (Number.isNaN(s1) || Number.isNaN(y)) return;
        sonucDeger = s1 * (1 - y / 100);
        aciklama = `${formatSmartNumber(s1, 'tr-TR', 4)} - %${formatSmartNumber(y, 'tr-TR', 4)} azalış = ${formatSmartNumber(sonucDeger, 'tr-TR', 4)}`;
        break;

      case 'artisMiktari':
        if (Number.isNaN(s1) || Number.isNaN(s2) || s1 === 0) return;
        sonucDeger = ((s2 - s1) / s1) * 100;
        aciklama = `${formatSmartNumber(s1, 'tr-TR', 4)}'den ${formatSmartNumber(s2, 'tr-TR', 4)}'ye değişim = %${formatSmartNumber(sonucDeger, 'tr-TR', 4)}`;
        break;

      default:
        return;
    }

    setSonuc({
      deger: sonucDeger.toLocaleString('tr-TR', { maximumFractionDigits: 4 }),
      aciklama,
    });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="mb-6">
          <label className="calc-title block mb-2">Hesaplama Tipi</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {hesaplamaTipleri.map((tip) => (
              <button
                key={tip.value}
                onClick={() => {
                  setHesaplamaTipi(tip.value);
                  setSonuc(null);
                }}
                type="button"
                className={`p-3 rounded-xl border-2 font-medium transition-all text-sm ${
                  hesaplamaTipi === tip.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
                    : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                {tip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {aktifTip?.inputs.includes('sayi1') && (
            <div>
              <label className="calc-title block mb-2">
                {hesaplamaTipi === 'artisMiktari' ? 'Eski Değer' : 'Sayı'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="sayi1"
                value={formData.sayi1}
                onChange={handleChange}
                placeholder="Örn: 100"
                className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          )}

          {aktifTip?.inputs.includes('sayi2') && (
            <div>
              <label className="calc-title block mb-2">
                {hesaplamaTipi === 'artisMiktari' ? 'Yeni Değer' : 'Sayı 2'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="sayi2"
                value={formData.sayi2}
                onChange={handleChange}
                placeholder="Örn: 200"
                className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          )}

          {aktifTip?.inputs.includes('yuzde') && (
            <div>
              <label className="calc-title block mb-2">Yüzde (%)</label>
              <input
                type="text"
                inputMode="decimal"
                name="yuzde"
                value={formData.yuzde}
                onChange={handleChange}
                placeholder="Örn: 20"
                className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          )}
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Yüzde işlemleri tek ekranda hızlıca hesaplanır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç bir sayının yüzdesini bulma, yüzde artış-azalış ve iki değer arasındaki yüzde değişimi hesaplamak için uygundur.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Hesapla
          </span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Percent className="w-5 h-5 text-indigo-500" />
            Sonuç
          </h3>

          <div className="calc-result rounded-xl p-6 text-center">
            <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {sonuc.deger}
            </span>
            <p className="calc-muted mt-2">{sonuc.aciklama}</p>
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3">Yüzde Formülleri</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="calc-soft rounded-lg p-3">
            <span className="font-medium text-[var(--foreground)]">X'in Y%'si:</span>
            <span className="calc-muted ml-2">X × (Y/100)</span>
          </div>
          <div className="calc-soft rounded-lg p-3">
            <span className="font-medium text-[var(--foreground)]">X, Y'nin %kaçı:</span>
            <span className="calc-muted ml-2">(X/Y) × 100</span>
          </div>
          <div className="calc-soft rounded-lg p-3">
            <span className="font-medium text-[var(--foreground)]">%Y artış:</span>
            <span className="calc-muted ml-2">X × (1 + Y/100)</span>
          </div>
          <div className="calc-soft rounded-lg p-3">
            <span className="font-medium text-[var(--foreground)]">Değişim %:</span>
            <span className="calc-muted ml-2">((Yeni-Eski)/Eski) × 100</span>
          </div>
        </div>
      </div>

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">Yüzde Hesabı Notu</p>
            <p className="calc-prose">
              Yüzde değişim hesabında eski değer sıfır olamaz. Finans, indirim, zam, kâr ve performans karşılaştırmalarında bu araç pratik kullanım sunar.
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Yüzde hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç yüzde bulma, yüzde artış-azalış ve iki sayı arasındaki yüzde farkını hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>yüzde hesaplama</strong>, <strong>zam oranı hesaplama</strong>,
              <strong> indirim hesaplama</strong>, <strong>yüzde değişim hesabı</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}