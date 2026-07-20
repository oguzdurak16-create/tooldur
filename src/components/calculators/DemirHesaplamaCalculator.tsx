'use client';

import { useMemo, useState } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Info, Sparkles, Ruler, Hash, CircleDot } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

// İnşaat demiri çapları ve birim ağırlıkları (kg/m)
const demirCaplari: Record<string, number> = {
  '6': 0.222,
  '8': 0.395,
  '10': 0.617,
  '12': 0.888,
  '14': 1.208,
  '16': 1.578,
  '18': 1.998,
  '20': 2.466,
  '22': 2.984,
  '24': 3.551,
  '25': 3.853,
  '26': 4.168,
  '28': 4.834,
  '30': 5.549,
  '32': 6.313,
  '36': 7.99,
  '40': 9.865,
};

export default function DemirHesaplamaCalculator() {
  const [hesaplamaTipi, setHesaplamaTipi] = useState<'uzunluk' | 'adet'>('uzunluk');
  const [formData, setFormData] = useState({
    cap: '12',
    uzunluk: '',
    adet: '',
    boyUzunluk: '12',
  });

  const [sonuc, setSonuc] = useState<{
    birimAgirlik: number;
    toplamUzunluk: number;
    toplamAgirlik: number;
    boyAdedi?: number;
  } | null>(null);

  const [svgContent, setSvgContent] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const seciliBirimAgirlik = useMemo(() => demirCaplari[formData.cap], [formData.cap]);

  const hesapla = () => {
    const cap = formData.cap;
    const birimAgirlik = demirCaplari[cap];

    let toplamUzunluk: number;
    let boyAdedi: number | undefined;

    if (hesaplamaTipi === 'uzunluk') {
      toplamUzunluk = parseLocalizedNumber(formData.uzunluk);
      if (Number.isNaN(toplamUzunluk) || toplamUzunluk <= 0) return;
    } else {
      const adet = parseInt(formData.adet, 10);
      const boyUzunluk = parseLocalizedNumber(formData.boyUzunluk);

      if (Number.isNaN(adet) || Number.isNaN(boyUzunluk) || adet <= 0 || boyUzunluk <= 0) return;

      toplamUzunluk = adet * boyUzunluk;
      boyAdedi = adet;
    }

    const toplamAgirlik = toplamUzunluk * birimAgirlik;

    setSonuc({
      birimAgirlik,
      toplamUzunluk,
      toplamAgirlik,
      boyAdedi,
    });

    const capN = parseLocalizedNumber(formData.cap) || 12;
    const lenN =
      hesaplamaTipi === 'adet'
        ? parseLocalizedNumber(formData.boyUzunluk) || 6
        : parseLocalizedNumber(formData.uzunluk) || 6;
    const adetN = boyAdedi || 1;

    setSvgContent(
      generateDrawing({
        type: 'demir_donatı',
        width: capN,
        length: lenN,
        count: adetN,
        result: toplamAgirlik,
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10">
            <CircleDot className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Donatı Ağırlıkları ve İnşaat Demiri Hesaplama</h2>
            <p className="calc-prose mt-1">
              Donatı çapı, toplam uzunluk veya boy adedine göre toplam ağırlığı hesaplayın; Ø6–Ø40 kg/m, 6 metre ve 12 metre boy ağırlıklarını tabloda karşılaştırın.
            </p>
          </div>
        </div>

        {/* Hesaplama Tipi */}
        <div className="mb-6">
          <label className="calc-title">Hesaplama Yöntemi</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => setHesaplamaTipi('uzunluk')}
              type="button"
              className={`p-3 rounded-xl border-2 font-medium transition-all ${
                hesaplamaTipi === 'uzunluk'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              Toplam Uzunluk
            </button>

            <button
              onClick={() => setHesaplamaTipi('adet')}
              type="button"
              className={`p-3 rounded-xl border-2 font-medium transition-all ${
                hesaplamaTipi === 'adet'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              Boy Adedi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="calc-title">Demir Çapı (mm)</label>
            <select
              name="cap"
              value={formData.cap}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              {Object.entries(demirCaplari).map(([cap, agirlik]) => (
                <option key={cap} value={cap}>
                  Ø{cap} mm ({agirlik} kg/m)
                </option>
              ))}
            </select>
          </div>

          {hesaplamaTipi === 'uzunluk' ? (
            <InputField
              label="Toplam Uzunluk (m)"
              name="uzunluk"
              value={formData.uzunluk}
              onChange={handleChange}
              placeholder="Örn: 100"
              icon={<Ruler className="w-4 h-4" />}
            />
          ) : (
            <>
              <InputField
                label="Boy Adedi"
                name="adet"
                value={formData.adet}
                onChange={handleChange}
                placeholder="Örn: 10"
                icon={<Hash className="w-4 h-4" />}
              />

              <div>
                <label className="calc-title">Boy Uzunluğu (m)</label>
                <select
                  name="boyUzunluk"
                  value={formData.boyUzunluk}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <option value="6">6 m</option>
                  <option value="9">9 m</option>
                  <option value="12">12 m (Standart)</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen çap: Ø{formData.cap} mm • Birim ağırlık: {formatSmartNumber(seciliBirimAgirlik, 'tr-TR', 3)} kg/m
          </p>
          <p className="calc-prose mt-2">
            Bu araç, standart donatı birim ağırlıklarını kullanarak toplam metraj ve ağırlık hesabı yapar.
            Teklif, keşif, metraj ve saha planlamasında hızlı ön kontrol için uygundur.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg active:scale-[0.98]"
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
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Ø{formData.cap} mm Demir Ağırlığı
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard
              title="Birim Ağırlık"
              value={`${formatSmartNumber(sonuc.birimAgirlik, 'tr-TR', 3)} kg/m`}
            />

            <ResultCard
              title="Toplam Uzunluk"
              value={`${formatSmartNumber(sonuc.toplamUzunluk, 'tr-TR', 1)} m`}
              subValue={
                sonuc.boyAdedi
                  ? `(${sonuc.boyAdedi} boy × ${formData.boyUzunluk} m)`
                  : undefined
              }
            />

            <ResultCard
              title="Toplam Ağırlık"
              value={`${formatSmartNumber(sonuc.toplamAgirlik, 'tr-TR', 2)} kg`}
              subValue={`${formatSmartNumber(sonuc.toplamAgirlik / 1000, 'tr-TR', 3)} ton`}
              accent
            />
          </div>
        </div>
      )}

      {/* Hızlı Referans Tablosu */}
      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-500" />
          Donatı Ağırlıkları Tablosu (Ø6–Ø40)
        </h4>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead className="calc-soft text-left">
              <tr>
                <th className="px-4 py-3">Donatı çapı</th>
                <th className="px-4 py-3">Birim ağırlık</th>
                <th className="px-4 py-3">6 m boy ağırlığı</th>
                <th className="px-4 py-3">12 m boy ağırlığı</th>
                <th className="px-4 py-3">1 ton için yaklaşık metre</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(demirCaplari).map(([cap, agirlik]) => (
                <tr key={cap} className="border-t border-[var(--border)] text-[var(--foreground)]">
                  <td className="px-4 py-3 font-bold">Ø{cap} mm</td>
                  <td className="px-4 py-3 font-semibold text-orange-500">{formatSmartNumber(agirlik, 'tr-TR', 3)} kg/m</td>
                  <td className="px-4 py-3">{formatSmartNumber(agirlik * 6, 'tr-TR', 2)} kg</td>
                  <td className="px-4 py-3">{formatSmartNumber(agirlik * 12, 'tr-TR', 2)} kg</td>
                  <td className="px-4 py-3">{formatSmartNumber(1000 / agirlik, 'tr-TR', 1)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs calc-muted mt-3">
          Yaklaşık formül: birim ağırlık (kg/m) = çap² / 162 ≈ çap² × 0,00617. Sipariş ve saha hesabında standart, tolerans, fire ve gerçek kantar değeri ayrıca kontrol edilmelidir.
        </p>
      </div>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="demir-agirlik"
        title="Demir Donatısı Çizimi"
      />

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Donatı ağırlıkları nasıl hesaplanır?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Donatı hesabında seçilen çapın <strong>kg/m birim ağırlığı</strong>, toplam uzunluk ile çarpılarak
              toplam ağırlık bulunur.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>demir ağırlık hesaplama</strong>, <strong>inşaat demiri kg/m</strong>,
              <strong> nervürlü demir metrajı</strong>, <strong>donatı ağırlıkları</strong>, <strong>donatı tonaj hesabı</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar standart teorik ağırlıklara dayanır. Nihai sipariş, kesim listesi ve saha sarfiyatında
            fire, bindirme payı ve uygulama detayları ayrıca değerlendirilmelidir.
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
        className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-orange-500/30"
      />
    </div>
  );
}

function ResultCard({
  title,
  value,
  subValue,
  accent = false,
}: {
  title: string;
  value: string;
  subValue?: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}>
      <span className="text-sm calc-muted block mb-1">{title}</span>
      <span className={`block ${accent ? 'text-2xl text-orange-600 dark:text-orange-400' : 'text-xl'} font-bold text-[var(--foreground)]`}>
        {value}
      </span>
      {subValue && <span className="text-xs calc-muted block mt-1">{subValue}</span>}
    </div>
  );
}