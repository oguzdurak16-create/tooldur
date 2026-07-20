'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Info, Sparkles, Layers } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const malzemeler = {
  celik: { ad: 'Çelik / Demir', yogunluk: 7.85 },
  paslanmaz: { ad: 'Paslanmaz Çelik', yogunluk: 7.9 },
  aluminyum: { ad: 'Alüminyum', yogunluk: 2.7 },
  bakir: { ad: 'Bakır', yogunluk: 8.96 },
  pirinc: { ad: 'Pirinç', yogunluk: 8.5 },
  kursun: { ad: 'Kurşun', yogunluk: 11.34 },
  cinko: { ad: 'Çinko', yogunluk: 7.14 },
  titanyum: { ad: 'Titanyum', yogunluk: 4.5 },
} as const;

type MalzemeKey = keyof typeof malzemeler;

type Sonuc = {
  alan: number;
  hacim: number;
  tekAgirlik: number;
  toplamAgirlik: number;
  m2Agirlik: number;
};

export default function LevhaAgirlikCalculator() {
  const [formData, setFormData] = useState({
    malzeme: 'celik' as MalzemeKey,
    uzunluk: '',
    genislik: '',
    kalinlik: '',
    adet: '1',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const hesapla = () => {
    const uzunluk = parseLocalizedNumber(formData.uzunluk);
    const genislik = parseLocalizedNumber(formData.genislik);
    const kalinlik = parseLocalizedNumber(formData.kalinlik);
    const adet = parseInt(formData.adet, 10) || 1;
    const yogunluk = malzemeler[formData.malzeme].yogunluk;

    if (
      Number.isNaN(uzunluk) ||
      Number.isNaN(genislik) ||
      Number.isNaN(kalinlik) ||
      uzunluk <= 0 ||
      genislik <= 0 ||
      kalinlik <= 0
    ) {
      return;
    }

    const alanMm2 = uzunluk * genislik;
    const alanM2 = alanMm2 / 1_000_000;

    const hacimMm3 = uzunluk * genislik * kalinlik;
    const hacimCm3 = hacimMm3 / 1000;

    const agirlikGram = hacimCm3 * yogunluk;
    const tekAgirlik = agirlikGram / 1000;
    const toplamAgirlik = tekAgirlik * adet;

    const m2Agirlik = kalinlik * yogunluk;

    setSonuc({
      alan: alanM2,
      hacim: hacimCm3,
      tekAgirlik,
      toplamAgirlik,
      m2Agirlik,
    });

    setSvgContent(
      generateDrawing({
        type: 'levha_kesit',
        length: uzunluk,
        width: genislik,
        thickness: kalinlik,
        result: toplamAgirlik,
      })
    );
  };

  const secilenMalzeme = malzemeler[formData.malzeme];

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-slate-500/10">
            <Layers className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Levha Ağırlık Hesaplama</h2>
            <p className="calc-prose mt-1">
              Malzeme, ölçü ve adet bilgilerine göre levha ağırlığını hızlıca hesaplayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <label className="calc-title block mb-2">Malzeme Cinsi</label>
            <select
              name="malzeme"
              value={formData.malzeme}
              onChange={handleChange}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/30"
            >
              {Object.entries(malzemeler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} (ρ = {val.yogunluk} g/cm³)
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Uzunluk (mm)"
            name="uzunluk"
            value={formData.uzunluk}
            onChange={handleChange}
            placeholder="Örn: 1000"
          />

          <InputField
            label="Genişlik (mm)"
            name="genislik"
            value={formData.genislik}
            onChange={handleChange}
            placeholder="Örn: 500"
          />

          <InputField
            label="Kalınlık (mm)"
            name="kalinlik"
            value={formData.kalinlik}
            onChange={handleChange}
            placeholder="Örn: 2"
          />

          <InputField
            label="Adet"
            name="adet"
            value={formData.adet}
            onChange={handleChange}
            placeholder="1"
          />
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen malzeme: {secilenMalzeme.ad}
          </p>
          <p className="calc-prose mt-2">
            Bu araç mm ölçüleri ve malzeme yoğunluğuna göre tek parça ve toplam ağırlığı hesaplar. Teklif, sevkiyat, satın alma ve atölye ön planlama için uygundur.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-slate-600 to-zinc-600 hover:from-slate-700 hover:to-zinc-700 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Ağırlık Hesapla
          </span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            {secilenMalzeme.ad} Levha Ağırlığı
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="calc-result rounded-xl p-4 col-span-2 md:col-span-1">
              <span className="text-sm calc-muted block mb-1">Tek Parça Ağırlığı</span>
              <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {formatSmartNumber(sonuc.tekAgirlik, 'tr-TR', 3)} kg
              </span>
            </div>

            {parseInt(formData.adet, 10) > 1 && (
              <div className="calc-result rounded-xl p-4">
                <span className="text-sm calc-muted block mb-1">
                  Toplam ({formData.adet} adet)
                </span>
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                  {formatSmartNumber(sonuc.toplamAgirlik, 'tr-TR', 3)} kg
                </span>
              </div>
            )}

            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Alan</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.alan, 'tr-TR', 4)} m²
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Hacim</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.hacim, 'tr-TR', 2)} cm³
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">
                {formData.kalinlik} mm için m² Ağırlığı
              </span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.m2Agirlik, 'tr-TR', 2)} kg/m²
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          Çelik Sac m² Ağırlıkları (kg/m²)
        </h4>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-sm">
          {[0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40].map((t) => (
            <div key={t} className="calc-soft rounded-lg p-2 text-center">
              <div className="font-bold text-[var(--foreground)]">{t} mm</div>
              <div className="calc-muted">{(t * 7.85).toFixed(1)} kg</div>
            </div>
          ))}
        </div>

        <p className="text-xs calc-muted mt-3">
          * Formül: Ağırlık (kg) = Uzunluk (m) × Genişlik (m) × Kalınlık (mm) × Yoğunluk (g/cm³)
        </p>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Levha ağırlığı hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, levha ölçülerini ve malzeme yoğunluğunu kullanarak tek parça ve toplam ağırlığı hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>levha ağırlık hesaplama</strong>, <strong>sac ağırlığı hesaplama</strong>,
              <strong> paslanmaz levha ağırlığı</strong>, <strong>alüminyum plaka kg hesabı</strong>.
            </p>
          </div>
        </div>
      </section>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="levha-agirlik"
        title="Levha Kesit Görseli"
      />
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/30"
      />
    </div>
  );
}