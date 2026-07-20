'use client';

import { useState } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Info, Gauge, Sparkles, Zap } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Sonuc = {
  mevcutReaktif: number;
  hedefReaktif: number;
  kondansator: number;
  kondansatorKVAR: number;
  mevcutGorunurGuc: number;
  hedefGorunurGuc: number;
  tasarruf: number;
};

export default function GucFaktoruCalculator() {
  const [formData, setFormData] = useState({
    aktifGuc: '',
    mevcutPF: '0.75',
    hedefPF: '0.95',
    frekans: '50',
    gerilim: '400',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const hesapla = () => {
    const P = parseLocalizedNumber(formData.aktifGuc); // kW
    const PF1 = parseLocalizedNumber(formData.mevcutPF);
    const PF2 = parseLocalizedNumber(formData.hedefPF);
    const f = parseLocalizedNumber(formData.frekans);
    const V = parseLocalizedNumber(formData.gerilim);

    if (Number.isNaN(P) || Number.isNaN(PF1) || Number.isNaN(PF2) || P <= 0) return;
    if (PF1 <= 0 || PF1 > 1 || PF2 <= 0 || PF2 > 1) return;
    if (PF2 <= PF1) return;

    const phi1 = Math.acos(PF1);
    const Q1 = P * Math.tan(phi1);

    const phi2 = Math.acos(PF2);
    const Q2 = P * Math.tan(phi2);

    const Qc = Q1 - Q2;

    const C = ((Qc * 1000) / (2 * Math.PI * f * V * V)) * 1e6;

    const S1 = P / PF1;
    const S2 = P / PF2;
    const tasarruf = ((S1 - S2) / S1) * 100;

    const yeniSonuc: Sonuc = {
      mevcutReaktif: Q1,
      hedefReaktif: Q2,
      kondansator: C,
      kondansatorKVAR: Qc,
      mevcutGorunurGuc: S1,
      hedefGorunurGuc: S2,
      tasarruf,
    };

    setSonuc(yeniSonuc);

    const Pv = P || 0;
    const PF1v = PF1 || 0.75;
    const Qv = PF1v > 0 ? Pv * Math.tan(Math.acos(PF1v)) : 0;
    const pf = PF1v;

    setSvgContent(
      generateDrawing({
        type: 'guc_faktor',
        power: Pv,
        result: Qv,
        result2: pf,
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <Gauge className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Güç Faktörü Düzeltme Hesabı</h2>
            <p className="calc-prose mt-1">
              Aktif güç, mevcut güç faktörü ve hedef cos φ değerine göre gerekli kompanzasyon kondansatörünü hesaplayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InputField
            label="Aktif Güç (kW)"
            name="aktifGuc"
            value={formData.aktifGuc}
            onChange={handleChange}
            placeholder="Örn: 100"
          />

          <InputField
            label="Mevcut Güç Faktörü (cos φ)"
            name="mevcutPF"
            value={formData.mevcutPF}
            onChange={handleChange}
            placeholder="0.75"
          />

          <div>
            <label className="calc-title">Hedef Güç Faktörü (cos φ)</label>
            <select
              name="hedefPF"
              value={formData.hedefPF}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="0.90">0.90</option>
              <option value="0.92">0.92</option>
              <option value="0.95">0.95 (Önerilen)</option>
              <option value="0.98">0.98</option>
              <option value="0.99">0.99</option>
              <option value="1.00">1.00 (Unity)</option>
            </select>
          </div>

          <div>
            <label className="calc-title">Şebeke Gerilimi (V)</label>
            <select
              name="gerilim"
              value={formData.gerilim}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="230">230V (Tek Faz)</option>
              <option value="400">400V (Üç Faz)</option>
              <option value="690">690V</option>
              <option value="1000">1000V</option>
            </select>
          </div>

          <div>
            <label className="calc-title">Frekans (Hz)</label>
            <select
              name="frekans"
              value={formData.frekans}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="50">50 Hz (Türkiye/Avrupa)</option>
              <option value="60">60 Hz (Amerika)</option>
            </select>
          </div>
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Kompanzasyon hesabı, mevcut ve hedef güç faktörü arasındaki reaktif güç farkına göre yapılır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç; pano tasarımı, kondansatör seçimi, reaktif ceza riski ve trafo kapasite kullanımı için hızlı ön değerlendirme sağlar.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg active:scale-[0.98]"
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
            <Gauge className="w-5 h-5 text-emerald-500" />
            Kompanzasyon Sonuçları
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ResultCard
              title="Gerekli Kondansatör"
              value={`${formatSmartNumber(sonuc.kondansatorKVAR, 'tr-TR', 1)} kVAR`}
              subValue={`${formatSmartNumber(sonuc.kondansator, 'tr-TR', 1)} µF`}
              accent
            />

            <ResultCard
              title="Mevcut Reaktif Güç"
              value={`${formatSmartNumber(sonuc.mevcutReaktif, 'tr-TR', 1)} kVAR`}
            />

            <ResultCard
              title="Hedef Reaktif Güç"
              value={`${formatSmartNumber(sonuc.hedefReaktif, 'tr-TR', 1)} kVAR`}
            />

            <ResultCard
              title="Mevcut Görünür Güç"
              value={`${formatSmartNumber(sonuc.mevcutGorunurGuc, 'tr-TR', 1)} kVA`}
            />

            <ResultCard
              title="Hedef Görünür Güç"
              value={`${formatSmartNumber(sonuc.hedefGorunurGuc, 'tr-TR', 1)} kVA`}
            />

            <ResultCard
              title="Kapasite Tasarrufu"
              value={`%${formatSmartNumber(sonuc.tasarruf, 'tr-TR', 1)}`}
            />
          </div>

          <p className="mt-4 text-sm rounded-lg p-3 calc-box-accent">
            💡 Güç faktörü düzeltmesi ile trafo ve hat kapasitesinden tasarruf edilir, reaktif enerji ceza riski azaltılır.
          </p>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-500" />
          Güç Faktörü Hakkında
        </h4>

        <ul className="text-sm calc-muted space-y-2">
          <li>• cos φ &lt; 0.90 olduğunda reaktif enerji ceza riski oluşabilir.</li>
          <li>• cos φ = 0.95 endüstriyel tesisler için yaygın hedef değerdir.</li>
          <li>• Kompanzasyon çoğunlukla paralel kondansatör grubu ile yapılır.</li>
          <li>• Temel formül: Qc = P × (tan φ₁ - tan φ₂)</li>
        </ul>
      </div>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="guc-faktoru"
        title="Güç Üçgeni Diyagramı"
      />

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Güç faktörü düzeltmesi hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, aktif güce göre mevcut ve hedef cos φ değerleri arasındaki farktan gerekli kondansatör gücünü hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>kompanzasyon hesabı</strong>, <strong>güç faktörü düzeltme</strong>,
              <strong> kondansatör kVAR hesabı</strong>, <strong>reaktif güç hesabı</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar ön hesap içindir. Nihai kondansatör seçimi yapılırken harmonik durumu, kademeli kompanzasyon, kontaktör/reaktör yapısı ve işletme karakteri ayrıca değerlendirilmelidir.
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
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="calc-title">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30"
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
      <span className={`block ${accent ? 'text-2xl text-emerald-600 dark:text-emerald-400' : 'text-xl'} font-bold text-[var(--foreground)]`}>
        {value}
      </span>
      {subValue && <span className="text-xs calc-muted block mt-1">{subValue}</span>}
    </div>
  );
}