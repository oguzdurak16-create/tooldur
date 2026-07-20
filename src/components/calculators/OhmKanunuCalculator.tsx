'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Calculator, Info, Sparkles } from 'lucide-react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type HesaplamaTipi = 'gerilim' | 'akim' | 'direnc';

type Sonuc = {
  deger: number;
  birim: string;
  aciklama: string;
};

export default function OhmKanunuCalculator() {
  const [hesaplamaTipi, setHesaplamaTipi] = useState<HesaplamaTipi>('gerilim');
  const [formData, setFormData] = useState({
    gerilim: '',
    akim: '',
    direnc: '',
  });
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const hesapla = () => {
    const V = parseLocalizedNumber(formData.gerilim);
    const I = parseLocalizedNumber(formData.akim);
    const R = parseLocalizedNumber(formData.direnc);

    let sonucDeger: number;
    let birim: string;
    let aciklama: string;

    switch (hesaplamaTipi) {
      case 'gerilim':
        if (Number.isNaN(I) || Number.isNaN(R)) return;
        sonucDeger = I * R;
        birim = 'V';
        aciklama = `V = I × R = ${I} × ${R}`;
        break;

      case 'akim':
        if (Number.isNaN(V) || Number.isNaN(R) || R === 0) return;
        sonucDeger = V / R;
        birim = 'A';
        aciklama = `I = V / R = ${V} / ${R}`;
        break;

      case 'direnc':
        if (Number.isNaN(V) || Number.isNaN(I) || I === 0) return;
        sonucDeger = V / I;
        birim = 'Ω';
        aciklama = `R = V / I = ${V} / ${I}`;
        break;

      default:
        return;
    }

    setSonuc({ deger: sonucDeger, birim, aciklama });

    const Vf = parseLocalizedNumber(formData.gerilim) || 0;
    const If = parseLocalizedNumber(formData.akim) || 0;
    const Rf = parseLocalizedNumber(formData.direnc) || 0;

    const Vd = hesaplamaTipi === 'gerilim' ? sonucDeger : Vf;
    const Id = hesaplamaTipi === 'akim' ? sonucDeger : If;
    const Rd = hesaplamaTipi === 'direnc' ? sonucDeger : Rf;

    setSvgContent(
      generateDrawing({
        type: 'ohm_devre',
        voltage: Vd,
        current: Id,
        resistance: Rd,
        power: Vd * Id,
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="mb-6">
          <label className="calc-title block mb-2">Ne Hesaplanacak?</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'gerilim', label: 'Gerilim (V)' },
              { value: 'akim', label: 'Akım (I)' },
              { value: 'direnc', label: 'Direnç (R)' },
            ].map((tip) => (
              <button
                key={tip.value}
                onClick={() => {
                  setHesaplamaTipi(tip.value as HesaplamaTipi);
                  setSonuc(null);
                }}
                type="button"
                className={`p-3 rounded-xl border-2 font-medium transition-all ${
                  hesaplamaTipi === tip.value
                    ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                    : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                {tip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {hesaplamaTipi !== 'gerilim' && (
            <InputField
              label="Gerilim (V)"
              name="gerilim"
              value={formData.gerilim}
              onChange={handleChange}
              placeholder="Örn: 12"
            />
          )}

          {hesaplamaTipi !== 'akim' && (
            <InputField
              label="Akım (A)"
              name="akim"
              value={formData.akim}
              onChange={handleChange}
              placeholder="Örn: 0.5"
            />
          )}

          {hesaplamaTipi !== 'direnc' && (
            <InputField
              label="Direnç (Ω)"
              name="direnc"
              value={formData.direnc}
              onChange={handleChange}
              placeholder="Örn: 24"
            />
          )}
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Ohm kanunu: V = I × R
          </p>
          <p className="calc-prose mt-2">
            Bu araç temel elektrik hesaplarında gerilim, akım veya direnç değerlerinden eksik olanı hızlıca bulmak için kullanılır.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg active:scale-[0.98]"
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
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Sonuç</h3>
          <div className="calc-result rounded-xl p-6 text-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {formatSmartNumber(sonuc.deger, 'tr-TR', 4).replace(/\.?0+$/, '')}
            </span>
            <span className="text-xl calc-muted ml-2">{sonuc.birim}</span>
            <p className="calc-muted mt-2">{sonuc.aciklama}</p>
          </div>
        </div>
      )}

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="ohm-kanunu"
        title="Ohm Kanunu Devresi"
      />

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Ohm Kanunu Formülleri
        </h4>

        <div className="grid grid-cols-3 gap-4 text-center">
          <FormulaCard formula="V = I × R" label="Gerilim" />
          <FormulaCard formula="I = V / R" label="Akım" />
          <FormulaCard formula="R = V / I" label="Direnç" />
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Ohm kanunu hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, gerilim, akım ve direnç arasındaki temel ilişkiyi kullanarak eksik elektriksel büyüklüğü hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>ohm kanunu hesaplama</strong>, <strong>volt amper ohm hesabı</strong>,
              <strong> direnç hesaplama</strong>, <strong>elektrik temel formülleri</strong>.
            </p>
          </div>
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
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}

function FormulaCard({ formula, label }: { formula: string; label: string }) {
  return (
    <div className="calc-soft rounded-lg p-3">
      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formula}</div>
      <div className="text-xs calc-muted">{label}</div>
    </div>
  );
}