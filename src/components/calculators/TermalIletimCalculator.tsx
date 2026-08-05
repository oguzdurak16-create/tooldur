'use client';

import { useState } from 'react';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Flame, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';
import type { Locale } from '@/lib/siteLanguage';

const MATERIALS: Record<string, number> = {
  'Alüminyum (saf)': 237,
  'Bakır (saf)': 401,
  'Çelik (karbon)': 50,
  'Paslanmaz 304': 16.3,
  'Dökme demir': 55,
  'Pirinç': 120,
  'Titanyum': 21.9,
  Beton: 1.7,
  Cam: 1.0,
  'Hava (25°C)': 0.026,
  'Su (25°C)': 0.607,
  'Motor yağı': 0.145,
};

const EN_MATERIALS: Record<string, string> = {
  'Alüminyum (saf)': 'Aluminum (pure)',
  'Bakır (saf)': 'Copper (pure)',
  'Çelik (karbon)': 'Carbon steel',
  'Paslanmaz 304': 'Stainless steel 304',
  'Dökme demir': 'Cast iron',
  'Pirinç': 'Brass',
  'Titanyum': 'Titanium',
  Beton: 'Concrete',
  Cam: 'Glass',
  'Hava (25°C)': 'Air (25°C)',
  'Su (25°C)': 'Water (25°C)',
  'Motor yağı': 'Engine oil',
};

type Mode = 'plaka' | 'silindir';

type Sonuc =
  | {
      Q: number;
      R: number;
      mode: 'plaka';
      Lm: number;
      A: number;
    }
  | {
      Q: number;
      R: number;
      mode: 'silindir';
      r1: string;
      r2: string;
    };

export default function TermalIletimCalculator({ locale = 'tr' }: { locale?: Locale }) {
  const { saveCalculation } = useCalculationHistory();
  const isEnglish = locale === 'en';
  const numberLocale = isEnglish ? 'en-US' : 'tr-TR';

  const [mode, setMode] = useState<Mode>('plaka');
  const [mat, setMat] = useState('Çelik (karbon)');
  const [k, setK] = useState('50');
  const [L, setL] = useState('10');
  const [A, setA] = useState('0.01');
  const [dt, setDt] = useState('80');
  const [r1, setR1] = useState('25');
  const [r2, setR2] = useState('32');

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const applyMaterial = (name: string) => {
    setMat(name);
    setK(String(MATERIALS[name]));
  };

  const hesapla = () => {
    const kv = parseLocalizedNumber(k) || 50;
    const dtv = parseLocalizedNumber(dt) || 80;

    if (kv <= 0 || dtv <= 0) return;

    let Q = 0;
    let R = 0;

    if (mode === 'plaka') {
      const Lm = (parseLocalizedNumber(L) || 0) / 1000;
      const Av = parseLocalizedNumber(A) || 0.01;

      if (Lm <= 0 || Av <= 0) return;

      R = Lm / (kv * Av);
      Q = (kv * Av * dtv) / Lm;

      setSonuc({
        Q: +Q.toFixed(2),
        R: +R.toFixed(4),
        mode: 'plaka',
        Lm: +Lm.toFixed(4),
        A: Av,
      });

      setSvgContent(
        generateDrawing({
          type: 'termal_plaka',
          heatFlow: +Q.toFixed(2),
          deltaT: dtv,
          length: parseLocalizedNumber(L) || 0,
          kValue: kv,
          area: Av,
        })
      );
    } else {
      const r1m = (parseLocalizedNumber(r1) || 0) / 1000;
      const r2m = (parseLocalizedNumber(r2) || 0) / 1000;
      const Lm = (parseLocalizedNumber(L) || 0) / 1000 || 1;

      if (r1m <= 0 || r2m <= 0 || Lm <= 0 || r2m <= r1m) return;

      R = Math.log(r2m / r1m) / (2 * Math.PI * kv * Lm);
      Q = dtv / R;

      setSonuc({
        Q: +Q.toFixed(2),
        R: +R.toFixed(4),
        mode: 'silindir',
        r1,
        r2,
      });

      setSvgContent(
        generateDrawing({
          type: 'termal_silindir',
          heatFlow: +Q.toFixed(2),
          deltaT: dtv,
          r1: parseLocalizedNumber(r1) || 0,
          r2: parseLocalizedNumber(r2) || 0,
          kValue: kv,
        })
      );
    }

    const materialName = isEnglish ? EN_MATERIALS[mat] || mat : mat;
    saveCalculation({
      toolSlug: 'termal-iletim-hesaplama',
      toolName: isEnglish ? 'Thermal Conduction Calculator' : 'Endüstriyel Isı ve Termal İletim Hesaplama',
      category: 'makine',
      inputs: {
        [isEnglish ? 'Material' : 'Malzeme']: materialName,
        'k(W/mK)': kv,
        'ΔT(°C)': dtv,
      },
      outputs: {
        'Q(W)': +Q.toFixed(2),
        'R(K/W)': +R.toFixed(4),
      },
      summary: `${materialName} ΔT=${dtv}°C → Q=${Q.toFixed(1)}W, R=${R.toFixed(4)}K/W`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-orange-500/10">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              {isEnglish ? 'Thermal Conduction Calculator' : 'Endüstriyel Isı ve Termal İletim Hesaplama'}
            </h2>
            <p className="calc-prose mt-1">
              {isEnglish
                ? 'Calculate heat flow and thermal resistance for flat-plate or cylindrical geometry.'
                : 'Düz plaka veya silindirik geometri için ısı akısı ve termal direnci hesaplayın.'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {(['plaka', 'silindir'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              type="button"
              className={`flex-1 py-2 rounded-xl font-medium text-sm border transition-all ${
                mode === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              {m === 'plaka'
                ? isEnglish ? 'Flat Plate' : 'Düz Plaka'
                : isEnglish ? 'Cylindrical' : 'Silindirik'}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <label className="calc-title block mb-2">{isEnglish ? 'Material' : 'Malzeme'}</label>
          <select
            value={mat}
            onChange={(e) => applyMaterial(e.target.value)}
            className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            {Object.keys(MATERIALS).map((m) => (
              <option key={m} value={m}>
                {isEnglish ? EN_MATERIALS[m] || m : m} — k={MATERIALS[m]} W/mK
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {mode === 'plaka' ? (
            <>
              <InputField
                label={isEnglish ? 'Thickness (mm)' : 'Kalınlık (mm)'}
                value={L}
                onChange={setL}
                placeholder="10"
              />
              <InputField
                label={isEnglish ? 'Area (m²)' : 'Alan (m²)'}
                value={A}
                onChange={setA}
                placeholder="0.01"
              />
            </>
          ) : (
            <>
              <InputField
                label={isEnglish ? 'Inner radius r₁ (mm)' : 'İç yarıçap r₁ (mm)'}
                value={r1}
                onChange={setR1}
                placeholder="25"
              />
              <InputField
                label={isEnglish ? 'Outer radius r₂ (mm)' : 'Dış yarıçap r₂ (mm)'}
                value={r2}
                onChange={setR2}
                placeholder="32"
              />
              <InputField
                label={isEnglish ? 'Length (mm)' : 'Uzunluk (mm)'}
                value={L}
                onChange={setL}
                placeholder="10"
              />
            </>
          )}

          <InputField
            label={isEnglish ? 'Temperature difference ΔT (°C)' : 'ΔT Sıcaklık Farkı (°C)'}
            value={dt}
            onChange={setDt}
            placeholder="80"
          />
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {isEnglish ? "Fourier's law of heat conduction is used." : 'Fourier ısı iletim bağıntısı kullanılır.'}
          </p>
          <p className="calc-prose mt-2">
            {isEnglish
              ? 'One-dimensional conduction is used for a flat plate, and radial conduction is used for cylindrical geometry.'
              : 'Düz plaka için bir boyutlu iletim, silindirik geometri için radyal iletim yaklaşımı kullanılır.'}
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full mt-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          type="button"
        >
          {isEnglish ? 'Calculate' : 'Hesapla'}
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 calc-result rounded-xl text-center">
              <div className="text-xs calc-muted mb-1">{isEnglish ? 'Heat Flow Q' : 'Isı Akısı Q'}</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatSmartNumber(sonuc.Q, numberLocale, 2)} W
              </div>
            </div>

            <div className="p-4 calc-soft rounded-xl text-center">
              <div className="text-xs calc-muted mb-1">{isEnglish ? 'Thermal Resistance R' : 'Termal Direnç R'}</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatSmartNumber(sonuc.R, numberLocale, 4)} K/W
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">
              {isEnglish ? 'Thermal Conduction Note' : 'Termal İletim Notu'}
            </p>
            <p className="calc-prose">
              {isEnglish
                ? 'Thermal conductivity may vary with temperature. This tool performs a basic engineering calculation using a constant k value.'
                : 'Malzeme iletkenliği sıcaklığa bağlı değişebilir. Bu araç sabit k değeri ile temel mühendislik hesabı yapar.'}
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">
            {isEnglish ? 'About thermal conduction calculations' : 'Termal iletim hesabı hakkında'}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              {isEnglish
                ? 'This tool calculates heat transferred by conduction and thermal resistance in flat-plate or cylindrical geometry.'
                : 'Bu araç düz plaka veya silindirik geometride iletim yoluyla geçen ısı miktarını ve termal direnci hesaplar.'}
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              {isEnglish ? (
                <>Common searches: <strong>thermal conduction calculator</strong>, <strong>heat flow calculation</strong>, <strong>thermal resistance</strong>, <strong>Fourier heat conduction</strong>.</>
              ) : (
                <>Sık aramalar: <strong>termal iletim hesaplama</strong>, <strong>ısı akısı hesabı</strong>, <strong>termal direnç</strong>, <strong>fourier ısı iletimi</strong>.</>
              )}
            </p>
          </div>
        </div>
      </section>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="termal-iletim"
        title={isEnglish ? 'Thermal Conduction Diagram' : 'Termal İletim Diyagramı'}
      />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        placeholder={placeholder}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}
