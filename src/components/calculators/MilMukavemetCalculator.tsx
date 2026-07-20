'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Calculator, Info, Cog, Download, Sparkles } from 'lucide-react';
import { generateDrawing } from '@/lib/drawingEngine';
import { sanitizeSvgContent } from '@/lib/security';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type HesaplamaTipi = 'cap' | 'tork' | 'gerilme';

type Sonuc = {
  deger: number;
  birim: string;
  formul: string;
  aciklama: string;
};

const malzemeler: Record<string, { ad: string; akma: number }> = {
  st37: { ad: 'St 37 (S235)', akma: 235 },
  st44: { ad: 'St 44 (S275)', akma: 275 },
  st52: { ad: 'St 52 (S355)', akma: 355 },
  c45: { ad: 'C45 (Isıl işlemsiz)', akma: 370 },
  c45q: { ad: 'C45 (Isıl işlemli)', akma: 490 },
  '42crmo4': { ad: '42CrMo4', akma: 650 },
  paslanmaz: { ad: 'AISI 304', akma: 205 },
  aluminyum: { ad: 'Al 6061-T6', akma: 240 },
};

export default function MilMukavemetCalculator() {
  const [hesaplamaTipi, setHesaplamaTipi] = useState<HesaplamaTipi>('cap');
  const [formData, setFormData] = useState({
    tork: '',
    cap: '',
    gerilme: '',
    guvenlik: '2',
    malzeme: 'st37',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const safeSvgContent = sanitizeSvgContent(svgContent);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hesapla = () => {
    const T = parseLocalizedNumber(formData.tork);
    const d = parseLocalizedNumber(formData.cap);
    const tau = parseLocalizedNumber(formData.gerilme);
    const n = parseLocalizedNumber(formData.guvenlik);
    const malzeme = malzemeler[formData.malzeme];

    if (!malzeme || Number.isNaN(n) || n <= 0) return;

    const tauIzin = (0.577 * malzeme.akma) / n;

    let sonucDeger: number;
    let birim: string;
    let formul: string;
    let aciklama: string;

    switch (hesaplamaTipi) {
      case 'cap':
        if (Number.isNaN(T) || T <= 0) return;
        sonucDeger = Math.pow((16 * T * 1000) / (Math.PI * tauIzin), 1 / 3);
        birim = 'mm';
        formul = `d = ∛(16T / πτ) = ∛(16 × ${T} × 1000 / π × ${tauIzin.toFixed(1)})`;
        aciklama = `Min. mil çapı: ${sonucDeger.toFixed(2)} mm (Güvenlik: ${n})`;
        break;

      case 'tork':
        if (Number.isNaN(d) || d <= 0) return;
        sonucDeger = (Math.PI * Math.pow(d, 3) * tauIzin) / (16 * 1000);
        birim = 'Nm';
        formul = `T = (πd³τ) / 16 = (π × ${d}³ × ${tauIzin.toFixed(1)}) / 16000`;
        aciklama = `Max. taşıyabileceği tork: ${sonucDeger.toFixed(2)} Nm`;
        break;

      case 'gerilme':
        if (Number.isNaN(T) || T <= 0 || Number.isNaN(d) || d <= 0) return;
        sonucDeger = (16 * T * 1000) / (Math.PI * Math.pow(d, 3));
        birim = 'MPa';
        formul = `τ = 16T / (πd³) = 16 × ${T} × 1000 / (π × ${d}³)`;
        aciklama = `Kayma gerilmesi: ${sonucDeger.toFixed(2)} MPa`;
        break;

      default:
        return;
    }

    setSonuc({ deger: sonucDeger, birim, formul, aciklama });

    const tauIzin2 = (0.577 * malzeme.akma) / n;
    const capForDraw = hesaplamaTipi === 'cap' ? sonucDeger : d || sonucDeger;
    const tauForDraw = hesaplamaTipi === 'gerilme' ? sonucDeger : 0;

    setSvgContent(
      generateDrawing({
        type: 'tork_diyagram',
        result: tauForDraw,
        result2: tauIzin2,
        width: capForDraw,
        load: hesaplamaTipi === 'tork' ? sonucDeger : T || 0,
        label: `Mil Mukavemeti — ${malzeme.ad}`,
      })
    );
  };

  const izinVerilenTau =
    (0.577 * malzemeler[formData.malzeme].akma) / parseLocalizedNumber(formData.guvenlik || '2');

  const gerilmeGuvenli =
    hesaplamaTipi === 'gerilme' && sonuc ? sonuc.deger <= izinVerilenTau : null;

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="mb-6">
          <label className="calc-title block mb-2">Ne Hesaplanacak?</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'cap', label: 'Mil Çapı (d)' },
              { value: 'tork', label: 'Max. Tork (T)' },
              { value: 'gerilme', label: 'Gerilme (τ)' },
            ].map((tip) => (
              <button
                key={tip.value}
                onClick={() => {
                  setHesaplamaTipi(tip.value as HesaplamaTipi);
                  setSonuc(null);
                }}
                type="button"
                className={`p-3 rounded-xl border-2 font-medium transition-all text-sm ${
                  hesaplamaTipi === tip.value
                    ? 'border-slate-500 bg-slate-500/10 text-slate-700 dark:text-slate-300'
                    : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                {tip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <label className="calc-title block mb-2">Malzeme</label>
            <select
              name="malzeme"
              value={formData.malzeme}
              onChange={handleChange}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/30"
            >
              {Object.entries(malzemeler).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} (σy = {val.akma} MPa)
                </option>
              ))}
            </select>
          </div>

          {hesaplamaTipi !== 'tork' && (
            <InputField
              label="Tork (Nm)"
              name="tork"
              value={formData.tork}
              onChange={handleChange}
              placeholder="Örn: 100"
            />
          )}

          {hesaplamaTipi !== 'cap' && (
            <InputField
              label="Mil Çapı (mm)"
              name="cap"
              value={formData.cap}
              onChange={handleChange}
              placeholder="Örn: 25"
            />
          )}

          <div>
            <label className="calc-title block mb-2">Güvenlik Katsayısı</label>
            <select
              name="guvenlik"
              value={formData.guvenlik}
              onChange={handleChange}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/30"
            >
              <option value="1.5">1.5 (Statik yük)</option>
              <option value="2">2.0 (Normal)</option>
              <option value="2.5">2.5 (Değişken yük)</option>
              <option value="3">3.0 (Darbe yükü)</option>
              <option value="4">4.0 (Kritik uygulama)</option>
            </select>
          </div>
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            İzin verilen kayma gerilmesi, yaklaşık olarak τ<sub>izin</sub> = 0.577 × σ<sub>y</sub> / n bağıntısıyla alınır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç dolu dairesel miller için torsiyon altında hızlı ön kontrol sağlar. Nihai tasarımda yorulma, çentik etkisi, kama kanalı ve birleşik yüklemeler ayrıca değerlendirilmelidir.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-slate-600 to-zinc-700 hover:from-slate-700 hover:to-zinc-800 transition-all shadow-lg active:scale-[0.98]"
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
            <Cog className="w-5 h-5 text-slate-600" />
            Sonuç
          </h3>

          <div className="calc-result rounded-xl p-6 text-center">
            <span className="text-4xl font-bold text-slate-700 dark:text-slate-300">
              {formatSmartNumber(sonuc.deger, 'tr-TR', 2)}
            </span>
            <span className="text-xl calc-muted ml-2">{sonuc.birim}</span>
            <p className="text-[var(--foreground)] mt-2">{sonuc.aciklama}</p>
            <p className="calc-muted mt-2 text-sm font-mono break-words">{sonuc.formul}</p>
          </div>

          {hesaplamaTipi === 'cap' && (
            <div className="mt-4 calc-warn rounded-lg p-3 text-sm">
              <strong>Öneri:</strong> Hesaplanan değeri standart mil çapına yuvarlayın. Yaygın çaplar:
              6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 30, 32, 35, 40, 45, 50 mm
            </div>
          )}

          {hesaplamaTipi === 'gerilme' && gerilmeGuvenli !== null && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div
                className={`p-3 rounded-lg text-center ${
                  gerilmeGuvenli
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'bg-red-500/10 text-red-700 dark:text-red-400'
                }`}
              >
                <span className="text-sm">İzin Verilen τ</span>
                <span className="font-bold block">
                  {formatSmartNumber(izinVerilenTau, 'tr-TR', 1)} MPa
                </span>
              </div>

              <div
                className={`p-3 rounded-lg text-center ${
                  gerilmeGuvenli
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                    : 'bg-red-500/10 text-red-700 dark:text-red-400'
                }`}
              >
                <span className="text-sm">Durum</span>
                <span className="font-bold block">
                  {gerilmeGuvenli ? '✓ Güvenli' : '✗ Yetersiz'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-600" />
          Mil Mukavemet Formülleri
        </h4>

        {svgContent && (
          <div className="mt-4 border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="calc-panel px-4 py-2 flex items-center justify-between border-b border-[var(--border)]">
              <span className="text-sm font-medium text-[var(--foreground)]">Teknik Çizim</span>
              <button
                onClick={() => {
                  const blob = new Blob([safeSvgContent], { type: 'image/svg+xml' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'mil-mukavemet.svg';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-800 font-medium"
                type="button"
              >
                <Download className="w-3 h-3" />
                SVG İndir
              </button>
            </div>

            <div
              className="p-2 flex justify-center bg-white dark:bg-zinc-950"
              dangerouslySetInnerHTML={{ __html: safeSvgContent }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
          <FormulaCard title="Kayma Gerilmesi" formula="τ = 16T / (πd³)" />
          <FormulaCard title="Min. Çap" formula="d = ∛(16T / πτizin)" />
          <FormulaCard title="İzin Verilen Kayma" formula="τizin = 0.577 × σy / n" />
          <FormulaCard title="Polar Atalet Momenti" formula="J = πd⁴ / 32" />
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Mil mukavemeti hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, dolu dairesel milin burulma altında minimum çapını, taşıyabileceği torku veya oluşan kayma gerilmesini hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>mil çapı hesaplama</strong>, <strong>torsiyon gerilmesi</strong>,
              <strong> mil mukavemeti</strong>, <strong>şaft tork hesabı</strong>.
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
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-500/30"
      />
    </div>
  );
}

function FormulaCard({ title, formula }: { title: string; formula: string }) {
  return (
    <div className="calc-soft rounded-lg p-3">
      <div className="font-medium text-[var(--foreground)] mb-1">{title}</div>
      <div className="font-mono text-slate-600 dark:text-slate-300">{formula}</div>
    </div>
  );
}