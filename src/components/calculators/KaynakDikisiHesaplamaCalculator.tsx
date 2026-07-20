'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, Sparkles } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const KAYNAK_TIPLERI = [
  { ad: 'Alın Kaynağı (Butt Weld)', tip: 'alin' },
  { ad: 'Köşe Kaynağı (Fillet Weld)', tip: 'kose' },
] as const;

const MALZEMELER = [
  { ad: 'S235 (St37)', fy: 235, fu: 360 },
  { ad: 'S275 (St44)', fy: 275, fu: 430 },
  { ad: 'S355 (St52)', fy: 355, fu: 510 },
  { ad: 'S460', fy: 460, fu: 550 },
] as const;

const ELEKTROTLAR = [
  { ad: 'E42 (AWS E6013)', fu_w: 420 },
  { ad: 'E50 (AWS E7018)', fu_w: 500 },
  { ad: 'E60', fu_w: 600 },
] as const;

export default function KaynakDikisiHesaplamaCalculator() {
  const [tip, setTip] = useState(0);
  const [malzeme, setMalzeme] = useState(0);
  const [elektrot, setElektrot] = useState(1);
  const [kalinlik, setKalinlik] = useState('10');
  const [uzunluk, setUzunluk] = useState('200');
  const [kuvvet, setKuvvet] = useState('100');
  const [guvenlik, setGuvenlik] = useState('1.25');

  const hesap = useMemo(() => {
    const a = parseLocalizedNumber(kalinlik) || 0;
    const L = parseLocalizedNumber(uzunluk) || 0;
    const F = parseLocalizedNumber(kuvvet) || 0;
    const gamma = parseLocalizedNumber(guvenlik) || 1.25;
    const mal = MALZEMELER[malzeme];
    const elek = ELEKTROTLAR[elektrot];
    const isAlin = KAYNAK_TIPLERI[tip].tip === 'alin';

    if (a <= 0 || L <= 0 || F <= 0) return null;

    let A_w = 0;
    let sigma = 0;
    let tau = 0;
    let kapasite = 0;
    let oranText = '';

    if (isAlin) {
      A_w = a * L;
      sigma = A_w > 0 ? (F * 1000) / A_w : 0;
      tau = 0;
      const f_vw = mal.fu / gamma;
      kapasite = (A_w * f_vw) / 1000;
      oranText = `σ = F/A = ${F}×1000 / ${A_w.toFixed(0)} = ${sigma.toFixed(1)} MPa`;
    } else {
      const beta_w =
        mal.fy <= 235 ? 0.8 : mal.fy <= 275 ? 0.85 : mal.fy <= 355 ? 0.9 : 1.0;

      A_w = a * L;
      const f_vw_d = elek.fu_w / (Math.sqrt(3) * beta_w * gamma);
      sigma = A_w > 0 ? (F * 1000) / A_w : 0;
      tau = sigma / Math.sqrt(2);
      kapasite = (f_vw_d * A_w) / 1000;
      oranText = `τ = F/(a·L·√3) → f_vw,d = ${elek.fu_w}/(√3×${beta_w}×${gamma}) = ${f_vw_d.toFixed(1)} MPa`;
    }

    const kullanimOrani = kapasite > 0 ? (F / kapasite) * 100 : 0;
    const guvenli = kullanimOrani <= 100;

    return {
      a,
      L,
      F,
      gamma,
      mal,
      elek,
      isAlin,
      A_w,
      sigma,
      tau,
      kapasite,
      oranText,
      kullanimOrani,
      guvenli,
    };
  }, [tip, malzeme, elektrot, kalinlik, uzunluk, kuvvet, guvenlik]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="mb-6">
          <label className="calc-title block mb-2">Kaynak Tipi</label>
          <div className="flex gap-2">
            {KAYNAK_TIPLERI.map((k, i) => (
              <button
                key={i}
                onClick={() => setTip(i)}
                type="button"
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                  tip === i
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
                }`}
              >
                {k.ad}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="calc-title block mb-2">Malzeme</label>
            <select
              value={malzeme}
              onChange={(e) => setMalzeme(Number(e.target.value))}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              {MALZEMELER.map((m, i) => (
                <option key={i} value={i}>
                  {m.ad} (fy={m.fy}, fu={m.fu})
                </option>
              ))}
            </select>
          </div>

          {KAYNAK_TIPLERI[tip].tip !== 'alin' && (
            <div>
              <label className="calc-title block mb-2">Elektrot</label>
              <select
                value={elektrot}
                onChange={(e) => setElektrot(Number(e.target.value))}
                className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30"
              >
                {ELEKTROTLAR.map((e, i) => (
                  <option key={i} value={i}>
                    {e.ad} (fu={e.fu_w} MPa)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField
            label={KAYNAK_TIPLERI[tip].tip === 'alin' ? 'Levha Kalınlığı t (mm)' : 'Boğaz Kalınlığı a (mm)'}
            value={kalinlik}
            onChange={setKalinlik}
          />
          <InputField
            label="Dikiş Uzunluğu L (mm)"
            value={uzunluk}
            onChange={setUzunluk}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <InputField
            label="Uygulanan Kuvvet F (kN)"
            value={kuvvet}
            onChange={setKuvvet}
          />
          <InputField
            label="Güvenlik Katsayısı γM2"
            value={guvenlik}
            onChange={setGuvenlik}
          />
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {KAYNAK_TIPLERI[tip].ad} için kaynak kesit alanı ve taşıma kapasitesi hesaplanır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç ön kontrol içindir. Nihai değerlendirmede yük yönü, birleşim detayı, kaynak sınıfı ve standart kontroller ayrıca yapılmalıdır.
          </p>
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3
            className={`text-sm font-bold mb-4 ${
              hesap.guvenli ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {hesap.guvenli ? '✅' : '⚠️'} Kaynak Dikişi Kontrolü — {hesap.guvenli ? 'GÜVENLİ' : 'YETERSİZ'}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { l: 'Dikiş Kesit Alanı A_w', v: `${formatSmartNumber(hesap.A_w, 'tr-TR', 0)} mm²` },
              {
                l: hesap.isAlin ? 'Normal Gerilme σ' : 'Kayma Gerilmesi τ',
                v: `${formatSmartNumber(hesap.isAlin ? hesap.sigma : hesap.tau, 'tr-TR', 1)} MPa`,
              },
              { l: 'Dikiş Kapasitesi F_Rd', v: `${formatSmartNumber(hesap.kapasite, 'tr-TR', 1)} kN` },
              { l: 'Kullanım Oranı', v: `%${formatSmartNumber(hesap.kullanimOrani, 'tr-TR', 1)}` },
            ].map((r, i) => (
              <div
                key={i}
                className={hesap.guvenli ? 'calc-result rounded-xl p-4 flex justify-between' : 'calc-soft rounded-xl p-4 flex justify-between'}
              >
                <span className="calc-muted text-sm">{r.l}</span>
                <span className="font-bold font-mono text-[var(--foreground)]">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 calc-panel rounded-xl p-4 text-sm">
            <p className="calc-muted font-mono">{hesap.oranText}</p>
          </div>
        </div>
      )}

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-[var(--foreground)] mb-1">EN 1993-1-8 Notu</p>
            <p className="calc-prose">
              Köşe kaynaklarında boğaz kalınlığı a, dikiş kenar ölçüsünün yaklaşık 0.7 katı alınır. Çift taraflı dikişlerde toplam alan iki katına çıkar. Bu hesap basitleştirilmiş yöntemle yapılmıştır; detaylı yöntemde yönlü gerilme bileşenleri ayrıca kontrol edilir.
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Kaynak dikişi hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç alın ve köşe kaynaklarında etkin kaynak alanına göre yaklaşık taşıma kapasitesini ve kullanım oranını hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>kaynak dikişi hesaplama</strong>, <strong>köşe kaynağı kapasitesi</strong>,
              <strong> alın kaynağı gerilme hesabı</strong>, <strong>en 1993 kaynak kontrolü</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30"
      />
    </div>
  );
}