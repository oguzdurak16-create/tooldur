'use client';

import { useMemo, useState } from 'react';
import { Gauge, Info, Sparkles } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type HeadMode = 'total' | 'components';

const POMPA_TIPLERI = [
  { ad: 'Santrifüj Pompa', verimMin: 60, verimMax: 85 },
  { ad: 'Dalgıç Pompa', verimMin: 55, verimMax: 78 },
  { ad: 'Dişli Pompa (PD)', verimMin: 75, verimMax: 90 },
  { ad: 'Pistonlu Pompa', verimMin: 80, verimMax: 92 },
  { ad: 'Vidalı Pompa', verimMin: 60, verimMax: 80 },
] as const;

const SIVI = [
  { ad: 'Su (20°C)', yogunluk: 998 },
  { ad: 'Deniz Suyu', yogunluk: 1025 },
  { ad: 'Dizel Yakıt', yogunluk: 850 },
  { ad: 'Hidrolik Yağ', yogunluk: 870 },
  { ad: 'Süt', yogunluk: 1030 },
  { ad: 'Özel (yoğunluk gir)', yogunluk: 0 },
] as const;

const STANDARD_MOTOR_KW = [
  0.12, 0.18, 0.25, 0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5,
  22, 30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 355, 400,
];

function nextStandardMotor(requiredKw: number) {
  return STANDARD_MOTOR_KW.find((value) => value >= requiredKw) || requiredKw;
}

export default function PompaGucHesaplamaCalculator() {
  const [headMode, setHeadMode] = useState<HeadMode>('total');
  const [debi, setDebi] = useState('50');
  const [toplamBasma, setToplamBasma] = useState('30');
  const [statikYukseklik, setStatikYukseklik] = useState('20');
  const [hatKaybi, setHatKaybi] = useState('5');
  const [cikisBasinci, setCikisBasinci] = useState('0,5');
  const [verim, setVerim] = useState('70');
  const [motorPayi, setMotorPayi] = useState('15');
  const [motorVerimi, setMotorVerimi] = useState('90');
  const [pompaTip, setPompaTip] = useState(1);
  const [siviTip, setSiviTip] = useState(0);
  const [ozelYogunluk, setOzelYogunluk] = useState('1000');

  const hesap = useMemo(() => {
    const Q = parseLocalizedNumber(debi) || 0;
    const etaPump = parseLocalizedNumber(verim) || 0;
    const etaMotor = parseLocalizedNumber(motorVerimi) || 0;
    const margin = parseLocalizedNumber(motorPayi) || 0;
    const rho = SIVI[siviTip].yogunluk || parseLocalizedNumber(ozelYogunluk) || 998;
    const g = 9.81;

    let H = parseLocalizedNumber(toplamBasma) || 0;
    let pressureHead = 0;
    let staticHead = 0;
    let frictionHead = 0;

    if (headMode === 'components') {
      staticHead = parseLocalizedNumber(statikYukseklik) || 0;
      frictionHead = parseLocalizedNumber(hatKaybi) || 0;
      const pressureBar = parseLocalizedNumber(cikisBasinci) || 0;
      pressureHead = pressureBar > 0 ? (pressureBar * 100000) / (rho * g) : 0;
      H = staticHead + frictionHead + pressureHead;
    }

    if (Q <= 0 || H <= 0 || etaPump <= 0 || etaPump > 100 || etaMotor <= 0 || etaMotor > 100 || rho <= 0) return null;

    const Qm3s = Q / 3600;
    const hydraulicW = rho * g * Qm3s * H;
    const shaftKw = hydraulicW / (etaPump / 100) / 1000;
    const requiredMotorKw = shaftKw * (1 + Math.max(margin, 0) / 100);
    const standardMotorKw = nextStandardMotor(requiredMotorKw);
    const electricalInputKw = standardMotorKw / (etaMotor / 100);

    return {
      Q,
      H,
      etaPump,
      etaMotor,
      margin,
      rho,
      g,
      Qm3s,
      hydraulicKw: hydraulicW / 1000,
      shaftKw,
      requiredMotorKw,
      standardMotorKw,
      electricalInputKw,
      hp: standardMotorKw * 1.34102209,
      pressureHead,
      staticHead,
      frictionHead,
    };
  }, [cikisBasinci, debi, hatKaybi, headMode, motorPayi, motorVerimi, ozelYogunluk, siviTip, statikYukseklik, toplamBasma, verim]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <Gauge className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Dalgıç Pompa Hesaplama Programı</h2>
            <p className="calc-prose mt-1">Debi, toplam basma yüksekliği, pompa verimi ve sıvı yoğunluğuna göre hidrolik güç, mil gücü ve standart motor kW ön seçimini hesaplayın.</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setHeadMode('total')} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${headMode === 'total' ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'calc-panel border-[var(--border)] text-[var(--foreground)]'}`}>
            Toplam basma yüksekliğini gir
          </button>
          <button type="button" onClick={() => setHeadMode('components')} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${headMode === 'components' ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'calc-panel border-[var(--border)] text-[var(--foreground)]'}`}>
            Bileşenlerden hesapla
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField label="Debi Q (m³/h)" value={debi} onChange={setDebi} />
          {headMode === 'total' ? (
            <InputField label="Toplam Basma Yüksekliği H (mSS)" value={toplamBasma} onChange={setToplamBasma} />
          ) : (
            <InputField label="Statik yükseklik (m)" value={statikYukseklik} onChange={setStatikYukseklik} />
          )}
        </div>

        {headMode === 'components' && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <InputField label="Boru ve armatür kayıpları (m)" value={hatKaybi} onChange={setHatKaybi} />
            <InputField label="Çıkışta gerekli basınç (bar)" value={cikisBasinci} onChange={setCikisBasinci} />
          </div>
        )}

        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div>
            <label className="calc-title block mb-2">Pompa Tipi</label>
            <select value={pompaTip} onChange={(e) => setPompaTip(Number(e.target.value))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30">
              {POMPA_TIPLERI.map((pump, index) => <option key={pump.ad} value={index}>{pump.ad}</option>)}
            </select>
          </div>
          <div>
            <label className="calc-title block mb-2">Pompa Verimi η (%)</label>
            <input type="text" inputMode="decimal" value={verim} onChange={(e) => setVerim(e.target.value.replace(/[^0-9.,-]/g, ''))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30" />
            <p className="text-xs calc-muted mt-2">Tipik başlangıç aralığı: {POMPA_TIPLERI[pompaTip].verimMin}–{POMPA_TIPLERI[pompaTip].verimMax}%</p>
          </div>
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <div>
            <label className="calc-title block mb-2">Sıvı</label>
            <select value={siviTip} onChange={(e) => setSiviTip(Number(e.target.value))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30">
              {SIVI.map((fluid, index) => <option key={fluid.ad} value={index}>{fluid.ad} {fluid.yogunluk > 0 ? `(${fluid.yogunluk} kg/m³)` : ''}</option>)}
            </select>
          </div>
          {siviTip === SIVI.length - 1 ? (
            <InputField label="Yoğunluk ρ (kg/m³)" value={ozelYogunluk} onChange={setOzelYogunluk} />
          ) : (
            <div className="calc-soft rounded-xl p-4">
              <p className="text-xs calc-muted">Seçilen yoğunluk</p>
              <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{SIVI[siviTip].yogunluk} kg/m³</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 mt-4 md:grid-cols-2">
          <InputField label="Motor emniyet payı (%)" value={motorPayi} onChange={setMotorPayi} />
          <InputField label="Motor verimi (%)" value={motorVerimi} onChange={setMotorVerimi} />
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">Pompa gücü P = ρ·g·Q·H / η bağıntısıyla hesaplanır.</p>
          <p className="calc-prose mt-2">Kuyu derinliği tek başına toplam basma yüksekliği değildir. Dinamik su seviyesi, çıkış kotu, boru kayıpları ve istenen çıkış basıncı birlikte hesaba katılmalıdır.</p>
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-4">Dalgıç pompa güç ve motor sonucu</h3>

          {headMode === 'components' && (
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ResultCard label="Statik yükseklik" value={`${formatSmartNumber(hesap.staticHead, 'tr-TR', 2)} m`} />
              <ResultCard label="Hat kayıpları" value={`${formatSmartNumber(hesap.frictionHead, 'tr-TR', 2)} m`} />
              <ResultCard label="Basınç karşılığı" value={`${formatSmartNumber(hesap.pressureHead, 'tr-TR', 2)} m`} />
              <ResultCard label="Toplam basma H" value={`${formatSmartNumber(hesap.H, 'tr-TR', 2)} mSS`} accent />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ResultCard label="Hidrolik güç" value={`${formatSmartNumber(hesap.hydraulicKw, 'tr-TR', 3)} kW`} />
            <ResultCard label="Pompa mil gücü" value={`${formatSmartNumber(hesap.shaftKw, 'tr-TR', 3)} kW`} />
            <ResultCard label={`Paylı gerekli motor (${formatSmartNumber(hesap.margin, 'tr-TR', 1)}%)`} value={`${formatSmartNumber(hesap.requiredMotorKw, 'tr-TR', 3)} kW`} />
            <ResultCard label="Önerilen standart motor" value={`${formatSmartNumber(hesap.standardMotorKw, 'tr-TR', 2)} kW`} note={`${formatSmartNumber(hesap.hp, 'tr-TR', 2)} HP`} accent />
            <ResultCard label="Tahmini elektrik giriş gücü" value={`${formatSmartNumber(hesap.electricalInputKw, 'tr-TR', 2)} kW`} note={`Motor verimi: %${formatSmartNumber(hesap.etaMotor, 'tr-TR', 1)}`} />
            <ResultCard label="Debi dönüşümü" value={`${formatSmartNumber(hesap.Qm3s * 1000, 'tr-TR', 2)} L/s`} note={`${formatSmartNumber(hesap.Q, 'tr-TR', 2)} m³/h`} />
          </div>

          <div className="mt-4 calc-panel rounded-xl p-4 text-xs">
            <p className="font-mono calc-muted">Pmil = {formatSmartNumber(hesap.rho, 'tr-TR', 0)} × {formatSmartNumber(hesap.g, 'tr-TR', 2)} × {formatSmartNumber(hesap.Qm3s, 'tr-TR', 5)} × {formatSmartNumber(hesap.H, 'tr-TR', 2)} / {formatSmartNumber(hesap.etaPump / 100, 'tr-TR', 3)}</p>
            <p className="font-mono calc-muted mt-1">Pompa mil gücü = {formatSmartNumber(hesap.shaftKw, 'tr-TR', 3)} kW</p>
          </div>
        </div>
      )}

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">Pompa eğrisi ve motor seçimi notu</p>
            <p className="calc-prose">Standart motor sonucu ön seçimdir. Nihai pompa modeli; üreticinin Q-H eğrisi, çalışma noktası, NPSH şartı, kuyu soğutması, kablo gerilim düşümü ve yol verme yöntemiyle doğrulanmalıdır.</p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Dalgıç pompa hesabında gerekli bilgiler</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4"><p className="calc-prose"><strong>Debi:</strong> İhtiyaç duyulan su miktarı. <strong>Toplam basma:</strong> statik kot farkı, hat kayıpları ve çıkış basıncının toplamıdır.</p></div>
          <div className="calc-soft rounded-xl p-4"><p className="calc-prose"><strong>Verim:</strong> Gerçek pompa eğrisindeki çalışma noktasından alınmalıdır. Tahmini verim yalnız ilk motor gücü kontrolü içindir.</p></div>
        </div>
      </section>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input type="text" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))} className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30" />
    </div>
  );
}

function ResultCard({ label, value, note, accent = false }: { label: string; value: string; note?: string; accent?: boolean }) {
  return (
    <div className={accent ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}>
      <span className="text-xs calc-muted block mb-1">{label}</span>
      <span className="block text-xl font-bold text-[var(--foreground)]">{value}</span>
      {note && <span className="text-xs calc-muted block mt-1">{note}</span>}
    </div>
  );
}
