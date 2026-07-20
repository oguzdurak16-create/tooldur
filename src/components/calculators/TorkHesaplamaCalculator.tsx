'use client';

import { useState } from 'react';
import { Calculator, Info, RotateCw, Sparkles } from 'lucide-react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type HesaplamaTipi = 'tork' | 'kuvvet' | 'mesafe';

type Sonuc = {
  deger: number;
  birim: string;
  formul: string;
};

const torkCarpan: Record<string, number> = {
  Nm: 1,
  kNm: 1000,
  'kgf.m': 9.80665,
  'kgf.cm': 0.0980665,
  'lbf.ft': 1.35582,
  'lbf.in': 0.112985,
};

const kuvvetCarpan: Record<string, number> = {
  N: 1,
  kN: 1000,
  kgf: 9.80665,
  lbf: 4.44822,
};

const mesafeCarpan: Record<string, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  in: 0.0254,
  ft: 0.3048,
};

export default function TorkHesaplamaCalculator() {
  const [hesaplamaTipi, setHesaplamaTipi] = useState<HesaplamaTipi>('tork');
  const [formData, setFormData] = useState({
    tork: '',
    kuvvet: '',
    mesafe: '',
    torkBirim: 'Nm',
    kuvvetBirim: 'N',
    mesafeBirim: 'm',
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
    const T = (parseLocalizedNumber(formData.tork) || 0) * torkCarpan[formData.torkBirim];
    const F = (parseLocalizedNumber(formData.kuvvet) || 0) * kuvvetCarpan[formData.kuvvetBirim];
    const r = (parseLocalizedNumber(formData.mesafe) || 0) * mesafeCarpan[formData.mesafeBirim];

    let sonucDeger = 0;
    let birim = '';
    let formul = '';

    switch (hesaplamaTipi) {
      case 'tork':
        if (F <= 0 || r <= 0) return;
        sonucDeger = F * r;
        birim = 'Nm';
        formul = `T = F × r = ${formData.kuvvet} ${formData.kuvvetBirim} × ${formData.mesafe} ${formData.mesafeBirim}`;
        break;

      case 'kuvvet':
        if (T <= 0 || r <= 0) return;
        sonucDeger = T / r;
        birim = 'N';
        formul = `F = T / r = ${formData.tork} ${formData.torkBirim} / ${formData.mesafe} ${formData.mesafeBirim}`;
        break;

      case 'mesafe':
        if (T <= 0 || F <= 0) return;
        sonucDeger = T / F;
        birim = 'm';
        formul = `r = T / F = ${formData.tork} ${formData.torkBirim} / ${formData.kuvvet} ${formData.kuvvetBirim}`;
        break;

      default:
        return;
    }

    setSonuc({
      deger: sonucDeger,
      birim,
      formul,
    });

    const Tv =
      hesaplamaTipi === 'tork'
        ? sonucDeger
        : (parseLocalizedNumber(formData.tork) || 0) * torkCarpan[formData.torkBirim];

    const dv = 30;

    setSvgContent(
      generateDrawing({
        type: 'tork_diyagram',
        result: 0,
        result2: 0,
        width: dv,
        load: Number.isNaN(Tv) ? 0 : Tv,
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
              { value: 'tork', label: 'Tork (T)' },
              { value: 'kuvvet', label: 'Kuvvet (F)' },
              { value: 'mesafe', label: 'Mesafe (r)' },
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
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                    : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                {tip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {hesaplamaTipi !== 'tork' && (
            <div>
              <label className="calc-title block mb-2">Tork</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  name="tork"
                  value={formData.tork}
                  onChange={handleChange}
                  placeholder="Örn: 100"
                  className="calc-panel flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
                <select
                  name="torkBirim"
                  value={formData.torkBirim}
                  onChange={handleChange}
                  className="calc-panel w-28 px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="Nm">Nm</option>
                  <option value="kNm">kNm</option>
                  <option value="kgf.m">kgf·m</option>
                  <option value="kgf.cm">kgf·cm</option>
                  <option value="lbf.ft">lbf·ft</option>
                </select>
              </div>
            </div>
          )}

          {hesaplamaTipi !== 'kuvvet' && (
            <div>
              <label className="calc-title block mb-2">Kuvvet</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  name="kuvvet"
                  value={formData.kuvvet}
                  onChange={handleChange}
                  placeholder="Örn: 50"
                  className="calc-panel flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
                <select
                  name="kuvvetBirim"
                  value={formData.kuvvetBirim}
                  onChange={handleChange}
                  className="calc-panel w-28 px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="N">N</option>
                  <option value="kN">kN</option>
                  <option value="kgf">kgf</option>
                  <option value="lbf">lbf</option>
                </select>
              </div>
            </div>
          )}

          {hesaplamaTipi !== 'mesafe' && (
            <div>
              <label className="calc-title block mb-2">Kol Uzunluğu (Mesafe)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  name="mesafe"
                  value={formData.mesafe}
                  onChange={handleChange}
                  placeholder="Örn: 2"
                  className="calc-panel flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
                <select
                  name="mesafeBirim"
                  value={formData.mesafeBirim}
                  onChange={handleChange}
                  className="calc-panel w-28 px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                  <option value="mm">mm</option>
                  <option value="in">inch</option>
                  <option value="ft">feet</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Tork, kuvvet ile kuvvet kolunun çarpımıdır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç tork, kuvvet veya mesafe değişkenlerinden bilinmeyeni birim dönüşümleriyle birlikte hesaplar.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg active:scale-[0.98]"
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
            <RotateCw className="w-5 h-5 text-cyan-500" />
            Sonuç
          </h3>

          <div className="calc-result rounded-xl p-6 text-center">
            <span className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
              {sonuc.deger.toFixed(4).replace(/\.?0+$/, '')}
            </span>
            <span className="text-xl calc-muted ml-2">{sonuc.birim}</span>
            <p className="calc-muted mt-2 text-sm">{sonuc.formul}</p>
          </div>

          {hesaplamaTipi === 'tork' && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              <div className="calc-soft rounded-lg p-3 text-center text-sm">
                <span className="calc-muted">kgf·m:</span>
                <span className="font-medium ml-1 text-[var(--foreground)]">
                  {(sonuc.deger / 9.80665).toFixed(3)}
                </span>
              </div>
              <div className="calc-soft rounded-lg p-3 text-center text-sm">
                <span className="calc-muted">lbf·ft:</span>
                <span className="font-medium ml-1 text-[var(--foreground)]">
                  {(sonuc.deger / 1.35582).toFixed(3)}
                </span>
              </div>
              <div className="calc-soft rounded-lg p-3 text-center text-sm">
                <span className="calc-muted">kgf·cm:</span>
                <span className="font-medium ml-1 text-[var(--foreground)]">
                  {(sonuc.deger / 0.0980665).toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="tork-hesaplama"
        title="Tork Diyagramı"
      />

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-500" />
          Tork Formülü
        </h4>

        <div className="calc-panel rounded-lg p-3 text-center mb-3">
          <span className="text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400">
            T = F × r
          </span>
        </div>

        <ul className="text-sm calc-muted space-y-1">
          <li>• T: Tork (döndürme momenti)</li>
          <li>• F: Uygulanan kuvvet</li>
          <li>• r: Kuvvetin dönme eksenine uzaklığı (kol)</li>
          <li>• 1 Nm = 0.102 kgf·m = 0.738 lbf·ft</li>
        </ul>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Tork hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç kuvvet ve moment kolu yardımıyla torku veya ilişkili diğer büyüklükleri hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>tork hesaplama</strong>, <strong>moment hesabı</strong>,
              <strong> kuvvet kolu hesabı</strong>, <strong>nm kgfm çevirme</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}