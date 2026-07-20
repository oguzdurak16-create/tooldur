'use client';

import { useState } from 'react';
import { Calculator, Info, Zap, Receipt, Gauge, Sparkles } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Sonuc = {
  tuketim: number;
  enerjiBedeli: number;
  dagitimBedeli: number;
  araToplam: number;
  kdv: number;
  toplam: number;
};

export default function ElektrikFaturaCalculator() {
  const [formData, setFormData] = useState({
    girisYontemi: 'tuketim',
    oncekiEndeks: '',
    sonrakiEndeks: '',
    tuketim: '',
    birimFiyat: '',
    dagitimFiyat: '',
    kdvOrani: '20',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const hesapla = () => {
    let tuketim: number;

    if (formData.girisYontemi === 'endeks') {
      const onceki = parseLocalizedNumber(formData.oncekiEndeks);
      const sonraki = parseLocalizedNumber(formData.sonrakiEndeks);

      if (Number.isNaN(onceki) || Number.isNaN(sonraki) || sonraki < onceki) return;
      tuketim = sonraki - onceki;
    } else {
      tuketim = parseLocalizedNumber(formData.tuketim);
      if (Number.isNaN(tuketim) || tuketim < 0) return;
    }

    const birimFiyat = parseLocalizedNumber(formData.birimFiyat);
    const dagitimFiyat = parseLocalizedNumber(formData.dagitimFiyat) || 0;
    const kdvOrani = (parseLocalizedNumber(formData.kdvOrani) || 0) / 100;

    if (Number.isNaN(birimFiyat) || birimFiyat <= 0) return;

    const enerjiBedeli = tuketim * birimFiyat;
    const dagitimBedeli = tuketim * dagitimFiyat;
    const araToplam = enerjiBedeli + dagitimBedeli;
    const kdv = araToplam * kdvOrani;
    const toplam = araToplam + kdv;

    setSonuc({
      tuketim,
      enerjiBedeli,
      dagitimBedeli,
      araToplam,
      kdv,
      toplam,
    });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Elektrik Fatura Hesaplama</h2>
            <p className="calc-prose mt-1">
              kWh tüketimi veya sayaç endeksi ile enerji bedeli, dağıtım bedeli, KDV ve toplam tutarı hesaplayın.
            </p>
          </div>
        </div>

        {/* Giriş Yöntemi */}
        <div className="mb-6">
          <label className="calc-title">Tüketim Giriş Yöntemi</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => setFormData({ ...formData, girisYontemi: 'tuketim' })}
              type="button"
              className={`p-3 rounded-xl border-2 font-medium transition-all ${
                formData.girisYontemi === 'tuketim'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              Direkt kWh Gir
            </button>

            <button
              onClick={() => setFormData({ ...formData, girisYontemi: 'endeks' })}
              type="button"
              className={`p-3 rounded-xl border-2 font-medium transition-all ${
                formData.girisYontemi === 'endeks'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              Sayaç Endeksi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {formData.girisYontemi === 'endeks' ? (
            <>
              <InputField
                label="Önceki Sayaç Endeksi"
                name="oncekiEndeks"
                value={formData.oncekiEndeks}
                onChange={handleChange}
                placeholder="Örn: 12500"
                icon={<Gauge className="w-4 h-4" />}
              />

              <InputField
                label="Güncel Sayaç Endeksi"
                name="sonrakiEndeks"
                value={formData.sonrakiEndeks}
                onChange={handleChange}
                placeholder="Örn: 12750"
                icon={<Gauge className="w-4 h-4" />}
              />
            </>
          ) : (
            <InputField
              label="Tüketim (kWh)"
              name="tuketim"
              value={formData.tuketim}
              onChange={handleChange}
              placeholder="Örn: 250"
              icon={<Zap className="w-4 h-4" />}
            />
          )}

          <div>
            <label className="calc-title">Enerji Birim Fiyatı (₺/kWh)</label>
            <input
              type="text"
              inputMode="decimal"
              name="birimFiyat"
              value={formData.birimFiyat}
              onChange={handleChange}
              placeholder="Örn: 2.50"
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <span className="text-xs calc-muted block mt-2">Faturanızdaki enerji bedeli satırından kontrol edebilirsiniz.</span>
          </div>

          <InputField
            label="Dağıtım Birim Fiyatı (₺/kWh) - Opsiyonel"
            name="dagitimFiyat"
            value={formData.dagitimFiyat}
            onChange={handleChange}
            placeholder="Örn: 0.80"
            icon={<Receipt className="w-4 h-4" />}
          />

          <div>
            <label className="calc-title">KDV Oranı (%)</label>
            <select
              name="kdvOrani"
              value={formData.kdvOrani}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="0">%0 (KDV Hariç)</option>
              <option value="10">%10</option>
              <option value="20">%20 (Standart)</option>
            </select>
          </div>
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Bu araç, elektrik faturasında yer alan temel kalemleri yaklaşık olarak hesaplar.
          </p>
          <p className="calc-prose mt-2">
            Tüketim, enerji birim fiyatı, dağıtım bedeli ve KDV bilgilerini girerek toplam tutarı hızlıca görebilirsiniz.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Faturayı Hesapla
          </span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Fatura Hesabı
          </h3>

          <div className="calc-soft rounded-xl p-4">
            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="calc-muted">Tüketim</span>
              <span className="font-medium text-[var(--foreground)]">
                {formatSmartNumber(sonuc.tuketim, 'tr-TR', 2)} kWh
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="calc-muted">Enerji Bedeli</span>
              <span className="font-medium text-[var(--foreground)]">
                {formatSmartNumber(sonuc.enerjiBedeli, 'tr-TR', 2)} ₺
              </span>
            </div>

            {sonuc.dagitimBedeli > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span className="calc-muted">Dağıtım Bedeli</span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatSmartNumber(sonuc.dagitimBedeli, 'tr-TR', 2)} ₺
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
              <span className="calc-muted">Ara Toplam</span>
              <span className="font-medium text-[var(--foreground)]">
                {formatSmartNumber(sonuc.araToplam, 'tr-TR', 2)} ₺
              </span>
            </div>

            {sonuc.kdv > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                <span className="calc-muted">KDV ({formData.kdvOrani}%)</span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatSmartNumber(sonuc.kdv, 'tr-TR', 2)} ₺
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-3">
              <span className="text-lg font-semibold text-[var(--foreground)]">Toplam</span>
              <span className="text-2xl font-bold text-amber-500">
                {formatSmartNumber(sonuc.toplam, 'tr-TR', 2)} ₺
              </span>
            </div>
          </div>

          <p className="mt-4 text-sm rounded-lg p-3 calc-box-accent">
            💡 Gerçek fatura tutarı; belediye tüketim vergisi, fonlar veya ek hizmet kalemleri içerebilir.
          </p>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500" />
          Birim Fiyat Nereden Bulunur?
        </h4>

        <ul className="text-sm calc-muted space-y-2">
          <li>• Enerji birim fiyatı faturanızdaki enerji bedeli satırından bulunabilir.</li>
          <li>• Dağıtım bedeli ilgili dağıtım kaleminde yer alır.</li>
          <li>• Tarifeler abone grubuna ve dönemsel fiyatlara göre değişebilir.</li>
          <li>• Güncel karşılaştırma için kendi fatura kalemlerinizi baz almak en sağlıklı yöntemdir.</li>
        </ul>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Elektrik faturası hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, aylık elektrik tüketimini doğrudan kWh olarak veya sayaç endeks farkından hesaplayarak tahmini fatura tutarı oluşturur.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>elektrik faturası hesaplama</strong>, <strong>kwh fatura hesaplama</strong>,
              <strong> sayaç endeksinden tüketim hesaplama</strong>, <strong>elektrik birim fiyatı hesaplama</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar yaklaşık hesap verir. Nihai fatura tutarı; sözleşme tipi, vergi kalemleri, dönemsel tarife ve ek ücretlere göre değişebilir.
          </p>
        </div>
      </section>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="calc-title flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
      />
    </div>
  );
}