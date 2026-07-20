'use client';

import { useState } from 'react';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import {
  Settings2,
  Activity,
  RotateCw,
  Maximize2,
  Zap,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type InputKey = 'm' | 'z1' | 'z2' | 'b' | 'n1';

type Sonuc = {
  d1: number;
  d2: number;
  a: number;
  i: number;
  n2: number;
  v: number;
};

export default function DisliCarkiCalculator() {
  const { saveCalculation } = useCalculationHistory();

  const [inputs, setInputs] = useState({
    m: '2',
    z1: '20',
    z2: '40',
    b: '20',
    n1: '1450',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const handleInputChange = (key: InputKey, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const hesapla = () => {
    const mv = parseLocalizedNumber(inputs.m) || 2;
    const z1v = parseInt(inputs.z1, 10) || 20;
    const z2v = parseInt(inputs.z2, 10) || 40;
    const bv = parseLocalizedNumber(inputs.b) || 20;
    const n1v = parseLocalizedNumber(inputs.n1) || 1450;

    const d1 = mv * z1v;
    const d2 = mv * z2v;
    const a = (d1 + d2) / 2;
    const i = z2v / z1v;
    const n2 = n1v / i;
    const v = (Math.PI * d1 * n1v) / 60000;

    const yeniSonuc: Sonuc = {
      d1,
      d2,
      a,
      i,
      n2: +n2.toFixed(1),
      v: +v.toFixed(2),
    };

    setSonuc(yeniSonuc);

    setSvgContent(
      generateDrawing({
        type: 'disli_carki',
        m: mv,
        z1: z1v,
        z2: z2v,
        d1,
        d2,
        n1: n1v,
        n2: +n2.toFixed(1),
        ratio: i,
        b: bv,
      })
    );

    saveCalculation({
      toolSlug: 'disli-carki-hesaplama',
      toolName: 'Dişli Çarkı Hesaplama',
      category: 'makine',
      inputs: { ...inputs, m: mv, b: bv },
      outputs: {
        'd1 (mm)': d1,
        'd2 (mm)': d2,
        'a (mm)': a,
        i: +i.toFixed(3),
        'n2 (rpm)': +n2.toFixed(1),
      },
      summary: `m=${mv}, z1=${z1v}/z2=${z2v}, i=${i.toFixed(2)}`,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Giriş Paneli */}
        <div className="lg:col-span-5 space-y-6">
          <div className="calc-box p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-[var(--border)] pb-4">
              <Settings2 className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-[var(--foreground)] uppercase tracking-tight text-sm">
                Tasarım Parametreleri
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Modül (m)', key: 'm', unit: 'mm', icon: <Activity size={16} /> },
                { label: 'Diş Sayısı (z₁)', key: 'z1', unit: 'diş', icon: <ChevronRight size={16} /> },
                { label: 'Diş Sayısı (z₂)', key: 'z2', unit: 'diş', icon: <ChevronRight size={16} /> },
                { label: 'Diş Genişliği (b)', key: 'b', unit: 'mm', icon: <Maximize2 size={16} /> },
                { label: 'Giriş Devri (n₁)', key: 'n1', unit: 'RPM', icon: <RotateCw size={16} /> },
              ].map((f) => (
                <div key={f.key} className="group">
                  <label className="block text-xs font-bold calc-muted mb-1.5 ml-1 uppercase">
                    {f.label}
                  </label>

                  <div className="relative flex items-center">
                    <div className="absolute left-3 calc-muted group-focus-within:text-blue-500 transition-colors">
                      {f.icon}
                    </div>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={inputs[f.key as InputKey]}
                      onChange={(e) => handleInputChange(f.key as InputKey, e.target.value.replace(/[^0-9.,-]/g, ''))}
                      className="w-full pl-10 pr-14 py-3 calc-panel rounded-xl outline-none transition-all font-medium text-[var(--foreground)] focus:ring-2 focus:ring-blue-500/30"
                    />

                    <span className="absolute right-4 text-[10px] font-bold calc-muted uppercase">
                      {f.unit}
                    </span>
                  </div>
                </div>
              ))}

              <div className="calc-box-accent">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Modül, diş sayısı ve giriş devrine göre taksimat çapı, çevrim oranı ve çıkış devri hesaplanır.
                </p>
                <p className="calc-prose mt-2">
                  Özellikle redüktör, güç aktarımı, makine tasarımı ve ön boyutlandırma çalışmalarında hızlı kontrol sağlar.
                </p>
              </div>

              <button
                onClick={hesapla}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                type="button"
              >
                <Zap size={18} />
                HESAPLA
              </button>
            </div>
          </div>
        </div>

        {/* Sonuç Paneli */}
        <div className="lg:col-span-7 space-y-6">
          {sonuc ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <ResultCard label="Taksimat Çapı (d₁)" value={formatSmartNumber(sonuc.d1, 'tr-TR', 2)} unit="mm" />
              <ResultCard label="Taksimat Çapı (d₂)" value={formatSmartNumber(sonuc.d2, 'tr-TR', 2)} unit="mm" />
              <ResultCard label="Eksen Mesafesi (a)" value={formatSmartNumber(sonuc.a, 'tr-TR', 2)} unit="mm" highlight />
              <ResultCard label="Çevrim Oranı (i)" value={sonuc.i.toFixed(3)} unit="oran" />
              <ResultCard label="Çıkış Devri (n₂)" value={formatSmartNumber(sonuc.n2, 'tr-TR', 1)} unit="RPM" />
              <ResultCard label="Çevre Hızı (v)" value={formatSmartNumber(sonuc.v, 'tr-TR', 2)} unit="m/s" />
            </div>
          ) : (
            <div className="calc-soft min-h-[300px] rounded-3xl flex flex-col items-center justify-center p-10 text-center border border-dashed border-[var(--border)]">
              <div className="calc-panel p-4 rounded-full mb-4">
                <Settings2 size={32} className="animate-spin-slow calc-muted" />
              </div>
              <p className="font-medium text-sm calc-muted">
                Hesaplama sonuçlarını görmek için parametreleri girip butona tıklayın.
              </p>
            </div>
          )}

          {svgContent && (
            <div className="rounded-3xl overflow-hidden border border-[var(--border)] calc-panel">
              <TeknikCizimPanel
                svgContent={svgContent}
                filename="disli-carki"
                title="Teknik Geometri Analizi"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bilgi ve Formül Paneli */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="calc-box-accent rounded-2xl p-5 flex gap-4 items-start">
          <div className="bg-blue-500 p-2 rounded-lg text-white">
            <Info size={20} />
          </div>
          <div>
            <h4 className="font-bold text-[var(--foreground)] text-sm mb-2 uppercase tracking-wider">
              Kullanılan Formüller
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] font-mono text-sky-700 dark:text-sky-300">
              <p>d = m × z</p>
              <p>a = (d₁ + d₂) / 2</p>
              <p>i = z₂ / z₁</p>
              <p>v = (π × d₁ × n₁) / 60,000</p>
            </div>
          </div>
        </div>

        <div className="calc-soft rounded-2xl p-5 flex items-center justify-between border border-[var(--border)]">
          <div className="text-xs calc-muted leading-relaxed">
            <p className="font-bold text-[var(--foreground)] uppercase mb-1">Not:</p>
            <p>
              Standart modül serileri kullanımı, imalat kolaylığı ve yedek parça bulunabilirliği açısından tavsiye edilir.
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Dişli çarkı hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, modül ve diş sayısına göre iki dişlinin taksimat çaplarını, eksen mesafesini, çevrim oranını ve çıkış devrini hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>dişli çarkı hesaplama</strong>, <strong>modül dişli hesabı</strong>,
              <strong> dişli çevrim oranı</strong>, <strong>eksen mesafesi hesaplama</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar ön tasarım ve hızlı kontrol amacı taşır. Nihai dişli tasarımında profil düzeltmesi, malzeme seçimi,
            yüzey sertliği, diş mukavemeti ve ilgili standartlar ayrıca değerlendirilmelidir.
          </p>
        </div>
      </section>
    </div>
  );
}

function ResultCard({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string | number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        highlight
          ? 'bg-blue-600 border-blue-600 shadow-blue-100 text-white'
          : 'calc-panel border-[var(--border)] hover:border-blue-200'
      }`}
    >
      <p
        className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
          highlight ? 'text-blue-100' : 'calc-muted'
        }`}
      >
        {label}
      </p>

      <div className="flex items-baseline gap-2">
        <span
          className={`text-2xl font-black tabular-nums ${
            highlight ? 'text-white' : 'text-[var(--foreground)]'
          }`}
        >
          {value}
        </span>
        <span
          className={`text-[10px] font-bold uppercase ${
            highlight ? 'text-blue-200' : 'calc-muted'
          }`}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}