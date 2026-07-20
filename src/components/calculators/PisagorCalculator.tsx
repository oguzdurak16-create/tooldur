'use client';

import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Calculator, Triangle, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type HesaplamaTipi = 'hipotenus' | 'dik_kenar';

type Sonuc = {
  deger: number;
  formul: string;
  aciklama: string;
};

export default function PisagorCalculator() {
  const [hesaplamaTipi, setHesaplamaTipi] = useState<HesaplamaTipi>('hipotenus');
  const [formData, setFormData] = useState({
    a: '',
    b: '',
    c: '',
  });
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [uyari, setUyari] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setUyari('');
  };

  const hesapla = () => {
    setUyari('');

    const a = parseLocalizedNumber(formData.a);
    const b = parseLocalizedNumber(formData.b);
    const c = parseLocalizedNumber(formData.c);

    let sonucDeger: number;
    let formul: string;
    let aciklama: string;

    if (hesaplamaTipi === 'hipotenus') {
      if (Number.isNaN(a) || Number.isNaN(b) || a <= 0 || b <= 0) return;

      sonucDeger = Math.sqrt(a * a + b * b);
      formul = `c = √(a² + b²) = √(${a}² + ${b}²) = √(${a * a} + ${b * b}) = √${a * a + b * b}`;
      aciklama = `Hipotenüs (c) = ${sonucDeger.toFixed(4)}`;
    } else {
      if (Number.isNaN(c) || Number.isNaN(b) || c <= 0 || b <= 0) return;

      if (c <= b) {
        setSonuc(null);
        setSvgContent('');
        setUyari('Hipotenüs, dik kenardan büyük olmalıdır.');
        return;
      }

      sonucDeger = Math.sqrt(c * c - b * b);
      formul = `a = √(c² - b²) = √(${c}² - ${b}²) = √(${c * c} - ${b * b}) = √${c * c - b * b}`;
      aciklama = `Dik Kenar (a) = ${sonucDeger.toFixed(4)}`;
    }

    setSonuc({ deger: sonucDeger, formul, aciklama });

    const aD = hesaplamaTipi === 'hipotenus' ? parseLocalizedNumber(formData.a) || 3 : sonucDeger;
    const bD = parseLocalizedNumber(formData.b) || 4;
    const cD = hesaplamaTipi === 'hipotenus' ? sonucDeger : parseLocalizedNumber(formData.c) || Math.sqrt(aD * aD + bD * bD);

    setSvgContent(
      generateDrawing({
        type: 'pisagor_ucgen',
        a: aD,
        width: bD,
        c: cD,
      })
    );
  };

  const aVal = parseLocalizedNumber(formData.a) || 0;
  const bVal = parseLocalizedNumber(formData.b) || 0;

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="mb-6">
          <label className="calc-title block mb-2">Ne Hesaplanacak?</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setHesaplamaTipi('hipotenus');
                setSonuc(null);
                setUyari('');
              }}
              type="button"
              className={`p-4 rounded-xl border-2 font-medium transition-all ${
                hesaplamaTipi === 'hipotenus'
                  ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              <div className="text-lg">Hipotenüs (c)</div>
              <div className="text-sm calc-muted">a ve b biliniyor</div>
            </button>

            <button
              onClick={() => {
                setHesaplamaTipi('dik_kenar');
                setSonuc(null);
                setUyari('');
              }}
              type="button"
              className={`p-4 rounded-xl border-2 font-medium transition-all ${
                hesaplamaTipi === 'dik_kenar'
                  ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              <div className="text-lg">Dik Kenar (a)</div>
              <div className="text-sm calc-muted">b ve c biliniyor</div>
            </button>
          </div>
        </div>

        <div className="calc-soft rounded-xl p-6 mb-6 flex justify-center">
          <svg width="200" height="150" viewBox="0 0 200 150">
            <polygon points="20,130 180,130 20,20" fill="none" stroke="#8b5cf6" strokeWidth="2" />
            <polyline points="20,115 35,115 35,130" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
            <text x="100" y="148" textAnchor="middle" className="text-sm fill-current" style={{ color: '#6b7280' }}>
              a
            </text>
            <text x="8" y="75" textAnchor="middle" className="text-sm fill-current" style={{ color: '#6b7280' }}>
              b
            </text>
            <text x="110" y="65" textAnchor="middle" className="text-sm fill-current" style={{ color: '#6b7280' }}>
              c
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {hesaplamaTipi === 'hipotenus' ? (
            <>
              <InputField
                label="Dik Kenar (a)"
                name="a"
                value={formData.a}
                onChange={handleChange}
                placeholder="Örn: 3"
              />
              <InputField
                label="Dik Kenar (b)"
                name="b"
                value={formData.b}
                onChange={handleChange}
                placeholder="Örn: 4"
              />
            </>
          ) : (
            <>
              <InputField
                label="Hipotenüs (c)"
                name="c"
                value={formData.c}
                onChange={handleChange}
                placeholder="Örn: 5"
              />
              <InputField
                label="Bilinen Dik Kenar (b)"
                name="b"
                value={formData.b}
                onChange={handleChange}
                placeholder="Örn: 4"
              />
            </>
          )}
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Pisagor teoremi: a² + b² = c²
          </p>
          <p className="calc-prose mt-2">
            Bu araç dik üçgende hipotenüsü veya eksik dik kenarı hesaplamak için kullanılır.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Hesapla
          </span>
        </button>
      </div>

      {uyari && (
        <div className="calc-warn rounded-xl p-4 flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{uyari}</span>
        </div>
      )}

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Triangle className="w-5 h-5 text-violet-500" />
            Sonuç
          </h3>

          <div className="calc-result rounded-xl p-6 text-center">
            <span className="text-4xl font-bold text-violet-600 dark:text-violet-400">
              {formatSmartNumber(sonuc.deger, 'tr-TR', 4).replace(/\.?0+$/, '')}
            </span>
            <span className="text-xl calc-muted ml-2">birim</span>
            <p className="text-[var(--foreground)] mt-2 font-medium">{sonuc.aciklama}</p>
            <p className="calc-muted mt-1 text-sm font-mono break-words">{sonuc.formul}</p>
          </div>

          {hesaplamaTipi === 'hipotenus' && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="calc-soft rounded-lg p-3 text-center">
                <span className="calc-muted text-sm">Çevre</span>
                <span className="font-bold text-[var(--foreground)] block">
                  {formatSmartNumber(aVal + bVal + sonuc.deger, 'tr-TR', 2)}
                </span>
              </div>
              <div className="calc-soft rounded-lg p-3 text-center">
                <span className="calc-muted text-sm">Alan</span>
                <span className="font-bold text-[var(--foreground)] block">
                  {formatSmartNumber((aVal * bVal) / 2, 'tr-TR', 2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="pisagor"
        title="Pisagor Üçgeni"
      />

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-violet-500" />
          Pisagor Teoremi
        </h4>

        <div className="calc-panel rounded-lg p-4 text-center mb-3">
          <span className="text-2xl font-mono font-bold text-violet-600 dark:text-violet-400">
            a² + b² = c²
          </span>
        </div>

        <p className="text-sm calc-muted">
          Bir dik üçgende, dik kenarların karelerinin toplamı hipotenüsün karesine eşittir.
        </p>

        <div className="mt-4">
          <h5 className="font-medium text-[var(--foreground)] mb-2">Pisagor Üçlüleri</h5>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm">
            {[
              [3, 4, 5],
              [5, 12, 13],
              [8, 15, 17],
              [7, 24, 25],
              [20, 21, 29],
            ].map(([a, b, c], i) => (
              <div key={i} className="calc-soft rounded-lg p-2 text-center">
                <span className="calc-muted">
                  {a}, {b}, {c}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Pisagor hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, dik üçgende iki kenardan üçüncüsünü bulmak için Pisagor teoremini kullanır.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>pisagor hesaplama</strong>, <strong>hipotenüs bulma</strong>,
              <strong> dik üçgen hesaplama</strong>, <strong>pisagor üçlüleri</strong>.
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
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30"
      />
    </div>
  );
}