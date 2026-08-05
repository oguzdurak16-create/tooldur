'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Info, Sparkles, Layers } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';
import type { Locale } from '@/lib/siteLanguage';

const malzemeler = {
  celik: { ad: 'Çelik / Demir', adEn: 'Steel / Iron', yogunluk: 7.85 },
  paslanmaz: { ad: 'Paslanmaz Çelik', adEn: 'Stainless steel', yogunluk: 7.9 },
  aluminyum: { ad: 'Alüminyum', adEn: 'Aluminum', yogunluk: 2.7 },
  bakir: { ad: 'Bakır', adEn: 'Copper', yogunluk: 8.96 },
  pirinc: { ad: 'Pirinç', adEn: 'Brass', yogunluk: 8.5 },
  kursun: { ad: 'Kurşun', adEn: 'Lead', yogunluk: 11.34 },
  cinko: { ad: 'Çinko', adEn: 'Zinc', yogunluk: 7.14 },
  titanyum: { ad: 'Titanyum', adEn: 'Titanium', yogunluk: 4.5 },
} as const;

type MalzemeKey = keyof typeof malzemeler;

type Sonuc = {
  alan: number;
  hacim: number;
  tekAgirlik: number;
  toplamAgirlik: number;
  m2Agirlik: number;
};

export default function LevhaAgirlikCalculator({ locale = 'tr' }: { locale?: Locale }) {
  const isEnglish = locale === 'en';
  const numberLocale = isEnglish ? 'en-US' : 'tr-TR';
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hesapla = () => {
    const uzunluk = parseLocalizedNumber(formData.uzunluk);
    const genislik = parseLocalizedNumber(formData.genislik);
    const kalinlik = parseLocalizedNumber(formData.kalinlik);
    const adet = parseInt(formData.adet, 10) || 1;
    const yogunluk = malzemeler[formData.malzeme].yogunluk;

    if (Number.isNaN(uzunluk) || Number.isNaN(genislik) || Number.isNaN(kalinlik) || uzunluk <= 0 || genislik <= 0 || kalinlik <= 0) return;

    const alanM2 = (uzunluk * genislik) / 1_000_000;
    const hacimCm3 = (uzunluk * genislik * kalinlik) / 1000;
    const tekAgirlik = (hacimCm3 * yogunluk) / 1000;
    const toplamAgirlik = tekAgirlik * adet;
    const m2Agirlik = kalinlik * yogunluk;

    setSonuc({ alan: alanM2, hacim: hacimCm3, tekAgirlik, toplamAgirlik, m2Agirlik });
    setSvgContent(generateDrawing({ type: 'levha_kesit', length: uzunluk, width: genislik, thickness: kalinlik, result: toplamAgirlik }));
  };

  const secilenMalzeme = malzemeler[formData.malzeme];
  const selectedMaterialName = isEnglish ? secilenMalzeme.adEn : secilenMalzeme.ad;

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-slate-500/10"><Layers className="w-6 h-6 text-slate-600" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">{isEnglish ? 'Sheet and Plate Weight Calculator' : 'Levha Ağırlık Hesaplama'}</h2>
            <p className="calc-prose mt-1">
              {isEnglish ? 'Calculate sheet or plate weight from material, dimensions and quantity.' : 'Malzeme, ölçü ve adet bilgilerine göre levha ağırlığını hızlıca hesaplayın.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <label className="calc-title block mb-2">{isEnglish ? 'Material' : 'Malzeme Cinsi'}</label>
            <select name="malzeme" value={formData.malzeme} onChange={handleChange} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/30">
              {Object.entries(malzemeler).map(([key, val]) => (
                <option key={key} value={key}>{isEnglish ? val.adEn : val.ad} (ρ = {val.yogunluk} g/cm³)</option>
              ))}
            </select>
          </div>

          <InputField label={isEnglish ? 'Length (mm)' : 'Uzunluk (mm)'} name="uzunluk" value={formData.uzunluk} onChange={handleChange} placeholder={isEnglish ? 'Ex: 1000' : 'Örn: 1000'} />
          <InputField label={isEnglish ? 'Width (mm)' : 'Genişlik (mm)'} name="genislik" value={formData.genislik} onChange={handleChange} placeholder={isEnglish ? 'Ex: 500' : 'Örn: 500'} />
          <InputField label={isEnglish ? 'Thickness (mm)' : 'Kalınlık (mm)'} name="kalinlik" value={formData.kalinlik} onChange={handleChange} placeholder={isEnglish ? 'Ex: 2' : 'Örn: 2'} />
          <InputField label={isEnglish ? 'Quantity' : 'Adet'} name="adet" value={formData.adet} onChange={handleChange} placeholder="1" />
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">{isEnglish ? 'Selected material' : 'Seçilen malzeme'}: {selectedMaterialName}</p>
          <p className="calc-prose mt-2">
            {isEnglish
              ? 'The calculator uses millimeter dimensions and material density to determine single-piece and total weight. It is suitable for estimating, shipping, purchasing and workshop planning.'
              : 'Bu araç mm ölçüleri ve malzeme yoğunluğuna göre tek parça ve toplam ağırlığı hesaplar. Teklif, sevkiyat, satın alma ve atölye ön planlama için uygundur.'}
          </p>
        </div>

        <button onClick={hesapla} className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-slate-600 to-zinc-600 hover:from-slate-700 hover:to-zinc-700 transition-all shadow-lg active:scale-[0.98]" type="button">
          <span className="inline-flex items-center gap-2"><Calculator className="w-5 h-5" />{isEnglish ? 'Calculate Weight' : 'Ağırlık Hesapla'}</span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">{selectedMaterialName} {isEnglish ? 'Plate Weight' : 'Levha Ağırlığı'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="calc-result rounded-xl p-4 col-span-2 md:col-span-1">
              <span className="text-sm calc-muted block mb-1">{isEnglish ? 'Single-piece weight' : 'Tek Parça Ağırlığı'}</span>
              <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{formatSmartNumber(sonuc.tekAgirlik, numberLocale, 3)} kg</span>
            </div>

            {parseInt(formData.adet, 10) > 1 && (
              <div className="calc-result rounded-xl p-4">
                <span className="text-sm calc-muted block mb-1">{isEnglish ? `Total (${formData.adet} pieces)` : `Toplam (${formData.adet} adet)`}</span>
                <span className="text-2xl font-bold text-slate-700 dark:text-slate-300">{formatSmartNumber(sonuc.toplamAgirlik, numberLocale, 3)} kg</span>
              </div>
            )}

            <Metric label={isEnglish ? 'Area' : 'Alan'} value={`${formatSmartNumber(sonuc.alan, numberLocale, 4)} m²`} />
            <Metric label={isEnglish ? 'Volume' : 'Hacim'} value={`${formatSmartNumber(sonuc.hacim, numberLocale, 2)} cm³`} />
            <Metric label={isEnglish ? `Weight per m² at ${formData.kalinlik} mm` : `${formData.kalinlik} mm için m² Ağırlığı`} value={`${formatSmartNumber(sonuc.m2Agirlik, numberLocale, 2)} kg/m²`} />
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-slate-500" />{isEnglish ? 'Steel Sheet Weight per m² (kg/m²)' : 'Çelik Sac m² Ağırlıkları (kg/m²)'}</h4>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-sm">
          {[0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40].map((t) => (
            <div key={t} className="calc-soft rounded-lg p-2 text-center"><div className="font-bold text-[var(--foreground)]">{t} mm</div><div className="calc-muted">{(t * 7.85).toLocaleString(numberLocale, { maximumFractionDigits: 1 })} kg</div></div>
          ))}
        </div>
        <p className="text-xs calc-muted mt-3">
          {isEnglish ? '* Formula: Weight (kg) = Length (m) × Width (m) × Thickness (mm) × Density (g/cm³)' : '* Formül: Ağırlık (kg) = Uzunluk (m) × Genişlik (m) × Kalınlık (mm) × Yoğunluk (g/cm³)'}
        </p>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /><h3 className="calc-section-title">{isEnglish ? 'About plate weight calculation' : 'Levha ağırlığı hesabı hakkında'}</h3></div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4"><p className="calc-prose">{isEnglish ? 'This tool calculates single-piece and total weight using plate dimensions and material density.' : 'Bu araç, levha ölçülerini ve malzeme yoğunluğunu kullanarak tek parça ve toplam ağırlığı hesaplar.'}</p></div>
          <div className="calc-soft rounded-xl p-4"><p className="calc-prose">{isEnglish ? <><strong>Common searches:</strong> plate weight calculator, sheet metal weight, stainless plate weight and aluminum plate weight.</> : <>Sık aramalar: <strong>levha ağırlık hesaplama</strong>, <strong>sac ağırlığı hesaplama</strong>, <strong> paslanmaz levha ağırlığı</strong>, <strong>alüminyum plaka kg hesabı</strong>.</>}</p></div>
        </div>
      </section>

      <TeknikCizimPanel svgContent={svgContent} filename="levha-agirlik" title={isEnglish ? 'Plate Section View' : 'Levha Kesit Görseli'} />
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder }: { label: string; name: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder: string }) {
  return <div><label className="calc-title block mb-2">{label}</label><input type="text" inputMode="decimal" name={name} value={value} onChange={onChange} placeholder={placeholder} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/30" /></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="calc-soft rounded-xl p-4"><span className="text-sm calc-muted block mb-1">{label}</span><span className="text-xl font-bold text-[var(--foreground)]">{value}</span></div>;
}
