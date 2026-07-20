'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Sparkles, Box, Circle, Triangle } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const cisimler = {
  kup: { ad: 'Küp', icon: <Box className="w-4 h-4" /> },
  dikdortgenPrizma: { ad: 'Dikdörtgen Prizma', icon: <Box className="w-4 h-4" /> },
  silindir: { ad: 'Silindir', icon: <Circle className="w-4 h-4" /> },
  kure: { ad: 'Küre', icon: <Circle className="w-4 h-4" /> },
  koni: { ad: 'Koni', icon: <Triangle className="w-4 h-4" /> },
  piramit: { ad: 'Kare Piramit', icon: <Triangle className="w-4 h-4" /> },
  ucgenPrizma: { ad: 'Üçgen Prizma', icon: <Triangle className="w-4 h-4" /> },
};

type CisimKey = keyof typeof cisimler;

type Sonuc = {
  hacim: number;
  formul: string;
};

export default function HacimHesaplamaCalculator() {
  const [cisim, setCisim] = useState<CisimKey>('dikdortgenPrizma');
  const [formData, setFormData] = useState({
    a: '',
    b: '',
    c: '',
    h: '',
    r: '',
  });
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hesapla = () => {
    const a = parseLocalizedNumber(formData.a);
    const b = parseLocalizedNumber(formData.b);
    const c = parseLocalizedNumber(formData.c);
    const h = parseLocalizedNumber(formData.h);
    const r = parseLocalizedNumber(formData.r);

    let hacim: number;
    let formul: string;

    switch (cisim) {
      case 'kup':
        if (Number.isNaN(a)) return;
        hacim = a * a * a;
        formul = `V = a³ = ${a}³ = ${formatSmartNumber(hacim, 'tr-TR', 4)}`;
        break;

      case 'dikdortgenPrizma':
        if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) return;
        hacim = a * b * c;
        formul = `V = a × b × c = ${a} × ${b} × ${c} = ${formatSmartNumber(hacim, 'tr-TR', 4)}`;
        break;

      case 'silindir':
        if (Number.isNaN(r) || Number.isNaN(h)) return;
        hacim = Math.PI * r * r * h;
        formul = `V = πr²h = π × ${r}² × ${h} = ${formatSmartNumber(hacim, 'tr-TR', 4)}`;
        break;

      case 'kure':
        if (Number.isNaN(r)) return;
        hacim = (4 / 3) * Math.PI * r * r * r;
        formul = `V = (4/3)πr³ = (4/3) × π × ${r}³ = ${formatSmartNumber(hacim, 'tr-TR', 4)}`;
        break;

      case 'koni':
        if (Number.isNaN(r) || Number.isNaN(h)) return;
        hacim = (1 / 3) * Math.PI * r * r * h;
        formul = `V = (1/3)πr²h = (1/3) × π × ${r}² × ${h} = ${formatSmartNumber(hacim, 'tr-TR', 4)}`;
        break;

      case 'piramit':
        if (Number.isNaN(a) || Number.isNaN(h)) return;
        hacim = (1 / 3) * a * a * h;
        formul = `V = (1/3) × a² × h = (1/3) × ${a}² × ${h} = ${formatSmartNumber(hacim, 'tr-TR', 4)}`;
        break;

      case 'ucgenPrizma':
        if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(h)) return;
        hacim = (a * b / 2) * h;
        formul = `V = (${a} × ${b} / 2) × ${h} = ${formatSmartNumber(hacim, 'tr-TR', 4)}`;
        break;

      default:
        return;
    }

    setSonuc({ hacim, formul });

    const Lv = parseLocalizedNumber(formData.a) || 5;
    const Bv = parseLocalizedNumber(formData.b) || 3;
    const Hv = parseLocalizedNumber(formData.c) || parseLocalizedNumber(formData.h) || 2;

    setSvgContent(
      generateDrawing({
        type: 'hacim_sekil',
        length: Lv,
        width: Bv,
        height: Hv,
        result: hacim,
      })
    );
  };

  const inputAlanlari = () => {
    switch (cisim) {
      case 'kup':
        return (
          <InputField
            label="Kenar (a)"
            name="a"
            value={formData.a}
            onChange={handleChange}
            placeholder="Örn: 5"
          />
        );

      case 'dikdortgenPrizma':
        return (
          <>
            <InputField
              label="Uzunluk (a)"
              name="a"
              value={formData.a}
              onChange={handleChange}
              placeholder="Örn: 10"
            />
            <InputField
              label="Genişlik (b)"
              name="b"
              value={formData.b}
              onChange={handleChange}
              placeholder="Örn: 5"
            />
            <InputField
              label="Yükseklik (c)"
              name="c"
              value={formData.c}
              onChange={handleChange}
              placeholder="Örn: 3"
            />
          </>
        );

      case 'silindir':
        return (
          <>
            <InputField
              label="Yarıçap (r)"
              name="r"
              value={formData.r}
              onChange={handleChange}
              placeholder="Örn: 5"
            />
            <InputField
              label="Yükseklik (h)"
              name="h"
              value={formData.h}
              onChange={handleChange}
              placeholder="Örn: 10"
            />
          </>
        );

      case 'kure':
        return (
          <InputField
            label="Yarıçap (r)"
            name="r"
            value={formData.r}
            onChange={handleChange}
            placeholder="Örn: 5"
          />
        );

      case 'koni':
        return (
          <>
            <InputField
              label="Taban Yarıçapı (r)"
              name="r"
              value={formData.r}
              onChange={handleChange}
              placeholder="Örn: 5"
            />
            <InputField
              label="Yükseklik (h)"
              name="h"
              value={formData.h}
              onChange={handleChange}
              placeholder="Örn: 12"
            />
          </>
        );

      case 'piramit':
        return (
          <>
            <InputField
              label="Taban Kenarı (a)"
              name="a"
              value={formData.a}
              onChange={handleChange}
              placeholder="Örn: 6"
            />
            <InputField
              label="Yükseklik (h)"
              name="h"
              value={formData.h}
              onChange={handleChange}
              placeholder="Örn: 10"
            />
          </>
        );

      case 'ucgenPrizma':
        return (
          <>
            <InputField
              label="Üçgen Tabanı (a)"
              name="a"
              value={formData.a}
              onChange={handleChange}
              placeholder="Örn: 4"
            />
            <InputField
              label="Üçgen Yüksekliği (b)"
              name="b"
              value={formData.b}
              onChange={handleChange}
              placeholder="Örn: 3"
            />
            <InputField
              label="Prizma Yüksekliği (h)"
              name="h"
              value={formData.h}
              onChange={handleChange}
              placeholder="Örn: 10"
            />
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/10">
            <Box className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Geometrik Hacim Hesaplama</h2>
            <p className="calc-prose mt-1">
              Küp, prizma, silindir, küre, koni, piramit ve üçgen prizma için hacim hesabı yapın.
            </p>
          </div>
        </div>

        {/* Cisim Seçimi */}
        <div className="mb-6">
          <label className="calc-title">Cisim Seçin</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {Object.entries(cisimler).map(([key, val]) => (
              <button
                key={key}
                onClick={() => {
                  setCisim(key as CisimKey);
                  setSonuc(null);
                }}
                type="button"
                className={`p-3 rounded-xl border-2 font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                  cisim === key
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600'
                    : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                {val.icon}
                {val.ad}
              </button>
            ))}
          </div>
        </div>

        {/* Input Alanları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {inputAlanlari()}
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen cisim: {cisimler[cisim].ad}
          </p>
          <p className="calc-prose mt-2">
            Bu araç temel geometri formüllerine göre hacim hesaplar ve sonucu açıklayıcı formülle birlikte gösterir.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Hacim Hesapla
          </span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            {cisimler[cisim].ad} Hacmi
          </h3>

          <div className="calc-result rounded-2xl p-6 text-center">
            <span className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {sonuc.hacim.toFixed(4).replace(/\.?0+$/, '')}
            </span>
            <span className="text-xl calc-muted ml-2">birim³</span>
            <p className="calc-muted mt-3 text-sm font-mono break-words">{sonuc.formul}</p>
          </div>
        </div>
      )}

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="hacim-sekil"
        title="Geometrik Şekil Çizimi"
      />

      {/* Formüller */}
      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-3">Hacim Formülleri</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <FormulaCard title="Küp" formula="V = a³" />
          <FormulaCard title="Prizma" formula="V = a×b×c" />
          <FormulaCard title="Silindir" formula="V = πr²h" />
          <FormulaCard title="Küre" formula="V = (4/3)πr³" />
          <FormulaCard title="Koni" formula="V = (1/3)πr²h" />
          <FormulaCard title="Piramit" formula="V = (1/3)Ah" />
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Hacim hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, seçilen geometrik cismin temel ölçülerini kullanarak hacmini hesaplar ve kullanılan formülü açıkça gösterir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>hacim hesaplama</strong>, <strong>silindir hacmi</strong>,
              <strong> küre hacmi formülü</strong>, <strong>prizma hacmi nasıl bulunur</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar, girilen değerlerin aynı uzunluk biriminden geldiği varsayımıyla hesaplanır. Çıktı hacim olarak birim küp cinsindendir.
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
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
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
        className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-indigo-500/30"
      />
    </div>
  );
}

function FormulaCard({ title, formula }: { title: string; formula: string }) {
  return (
    <div className="calc-soft rounded-lg p-3 text-center">
      <div className="font-medium text-[var(--foreground)]">{title}</div>
      <div className="calc-muted">{formula}</div>
    </div>
  );
}