'use client';

import { useMemo, useState } from 'react';
import { Activity, Scale, Ruler, UserRound, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const KATEGORILER = [
  { min: 0, max: 18.5, label: 'Zayıf', renk: '#60a5fa', emoji: '🔵' },
  { min: 18.5, max: 25, label: 'Normal', renk: '#22c55e', emoji: '🟢' },
  { min: 25, max: 30, label: 'Fazla Kilolu', renk: '#f59e0b', emoji: '🟡' },
  { min: 30, max: 35, label: 'Obez (Sınıf 1)', renk: '#fb923c', emoji: '🟠' },
  { min: 35, max: 40, label: 'Obez (Sınıf 2)', renk: '#ef4444', emoji: '🔴' },
  { min: 40, max: 999, label: 'Morbid Obez', renk: '#dc2626', emoji: '⚫' },
] as const;

export default function BmiHesaplamaCalculator() {
  const [boy, setBoy] = useState('');
  const [kilo, setKilo] = useState('');
  const [yas, setYas] = useState('');
  const [cinsiyet, setCinsiyet] = useState<'erkek' | 'kadin'>('erkek');

  const hesap = useMemo(() => {
    const boyCm = parseLocalizedNumber(boy);
    const kiloKg = parseLocalizedNumber(kilo);
    const yasNum = parseLocalizedNumber(yas);

    if (Number.isNaN(boyCm) || Number.isNaN(kiloKg) || boyCm <= 0 || kiloKg <= 0) {
      return null;
    }

    const boyMetre = boyCm / 100;
    const bmi = kiloKg / (boyMetre * boyMetre);
    const kategori = KATEGORILER.find((c) => bmi >= c.min && bmi < c.max) || KATEGORILER[0];
    const idealMin = 18.5 * boyMetre * boyMetre;
    const idealMax = 25 * boyMetre * boyMetre;

    return {
      boyCm,
      boyMetre,
      kiloKg,
      yasNum: Number.isNaN(yasNum) ? null : yasNum,
      bmi,
      kategori,
      idealMin,
      idealMax,
    };
  }, [boy, kilo, yas]);

  const bmiBarLeft = useMemo(() => {
    if (!hesap) return 0;
    return Math.min(Math.max(((hesap.bmi - 15) / 30) * 100, 0), 100);
  }, [hesap]);

  return (
    <div className="space-y-6">
      <div className="calc-box space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <Activity className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Vücut Kitle İndeksi Hesaplama</h2>
            <p className="text-sm calc-muted">Boy ve kilo bilgilerine göre BMI sonucunu anında görün.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Boy (cm)"
            value={boy}
            onChange={setBoy}
            placeholder="175"
            icon={<Ruler className="w-4 h-4" />}
          />
          <InputField
            label="Kilo (kg)"
            value={kilo}
            onChange={setKilo}
            placeholder="75"
            icon={<Scale className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Yaş"
            value={yas}
            onChange={setYas}
            placeholder="30"
            icon={<UserRound className="w-4 h-4" />}
          />

          <div>
            <label className="calc-title block mb-2">Cinsiyet</label>
            <div className="flex gap-2">
              {([
                ['erkek', '♂ Erkek'],
                ['kadin', '♀ Kadın'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCinsiyet(key)}
                  type="button"
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                    cinsiyet === key
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="calc-box-accent">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            BMI, kilonun boyun metre cinsinden karesine bölünmesiyle hesaplanır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç yetişkin bireyler için hızlı bir ön değerlendirme sunar. Yaş ve cinsiyet bilgisi burada
            destekleyici amaçla alınır; temel BMI formülü değişmez.
          </p>
        </div>
      </div>

      {hesap && (
        <div className="calc-box space-y-5">
          <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold flex items-center gap-2">
            📊 Vücut Kitle İndeksi Sonucu
          </h3>

          <div className="text-center mb-2">
            <div className="text-4xl font-bold" style={{ color: hesap.kategori.renk }}>
              {hesap.bmi.toFixed(1)}
            </div>
            <div className="text-lg font-bold mt-1" style={{ color: hesap.kategori.renk }}>
              {hesap.kategori.emoji} {hesap.kategori.label}
            </div>
          </div>

          <div
            className="relative h-4 rounded-full overflow-hidden"
            style={{
              background:
                'linear-gradient(90deg, #60a5fa 0%, #22c55e 25%, #f59e0b 50%, #fb923c 65%, #ef4444 80%, #dc2626 100%)',
            }}
          >
            <div
              className="absolute top-0 w-1 h-full bg-white shadow-lg"
              style={{ left: `${bmiBarLeft}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="calc-soft rounded-xl p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="calc-muted">İdeal Kilo Aralığı</span>
                <span className="font-bold text-[var(--foreground)]">
                  {hesap.idealMin.toFixed(1)} – {hesap.idealMax.toFixed(1)} kg
                </span>
              </div>
            </div>

            <div className="calc-soft rounded-xl p-4">
              <div className="flex justify-between gap-4 text-sm">
                <span className="calc-muted">BMI Formülü</span>
                <span className="font-mono text-[var(--foreground)] text-right">
                  BMI = {hesap.kiloKg} / ({hesap.boyMetre.toFixed(2)})²
                </span>
              </div>
            </div>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="text-sm calc-muted">
              Hesaplanan detaylı sonuç: <strong className="text-[var(--foreground)]">{hesap.bmi.toFixed(2)}</strong>
              {hesap.yasNum ? ` • Yaş: ${hesap.yasNum}` : ''}
              {` • Cinsiyet: ${cinsiyet === 'erkek' ? 'Erkek' : 'Kadın'}`}
            </p>
          </div>
        </div>
      )}

      <div className="calc-box space-y-4">
        <p className="font-bold text-sm text-[var(--foreground)] mb-1">BMI Kategorileri</p>

        <div className="space-y-1.5">
          {KATEGORILER.map((kategori) => {
            const aktif = hesap && kategori.label === hesap.kategori.label;

            return (
              <div
                key={kategori.label}
                className={`flex items-center gap-3 text-sm rounded-lg px-3 py-2 transition-all ${
                  aktif ? 'calc-soft' : ''
                }`}
                style={{
                  opacity: aktif ? 1 : 0.72,
                  fontWeight: aktif ? 700 : 400,
                }}
              >
                <span>{kategori.emoji}</span>
                <span className="flex-1 text-[var(--foreground)]">{kategori.label}</span>
                <span className="font-mono calc-muted">
                  {kategori.min} – {kategori.max === 999 ? '∞' : kategori.max}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">BMI hesaplama hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Vücut kitle indeksi, kişinin kilosunun boyunun metre cinsinden karesine bölünmesiyle bulunur.
              Boy ve kilo bilgileriyle hızlı ön değerlendirme sağlar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>bmi hesaplama</strong>, <strong>vücut kitle indeksi hesaplama</strong>,
              <strong> ideal kilo aralığı</strong>, <strong>boy kilo endeksi</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="calc-prose">
              Bu sonuç bilgi amaçlıdır. BMI tek başına tanı koydurmaz; kas kütlesi, yaş, vücut yapısı ve sağlık
              geçmişi gibi etkenler değerlendirmeyi değiştirebilir.
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
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="calc-title block mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
        placeholder={placeholder}
        className="calc-panel w-full text-lg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  );
}