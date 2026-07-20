'use client';

import { useMemo, useState } from 'react';
import { Circle, Copy, Info, Sparkles } from 'lucide-react';
import { copyTextSafe, formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const uygulamalar = [
  { key: 'statik', ad: 'Statik radyal sızdırmazlık', squeeze: 18, fill: 75 },
  { key: 'dinamik', ad: 'Dinamik mil/piston', squeeze: 12, fill: 68 },
  { key: 'yuzey', ad: 'Yüzey/flanş sızdırmazlığı', squeeze: 22, fill: 80 },
] as const;

export default function ORingKanaliCalculator() {
  const [uygulama, setUygulama] = useState(0);
  const [kesit, setKesit] = useState('3.53');
  const [cap, setCap] = useState('40');
  const [sikisma, setSikisma] = useState(String(uygulamalar[0].squeeze));
  const [doluluk, setDoluluk] = useState(String(uygulamalar[0].fill));
  const [uzama, setUzama] = useState('2');
  const [kopyalandi, setKopyalandi] = useState(false);

  const hesap = useMemo(() => {
    const d2 = parseLocalizedNumber(kesit);
    const nominalCap = parseLocalizedNumber(cap);
    const squeeze = parseLocalizedNumber(sikisma);
    const fill = parseLocalizedNumber(doluluk);
    const stretch = parseLocalizedNumber(uzama);

    if (d2 <= 0 || nominalCap <= 0 || squeeze <= 0 || squeeze >= 40 || fill <= 0 || fill >= 95) return null;

    const kanalDerinligi = d2 * (1 - squeeze / 100);
    const oRingAlan = Math.PI * Math.pow(d2, 2) / 4;
    const kanalGenisligi = oRingAlan / (kanalDerinligi * (fill / 100));
    const sikismaMiktari = d2 - kanalDerinligi;
    const icCap = nominalCap * (1 - Math.max(stretch, 0) / 100);
    const disCap = icCap + 2 * d2;
    const kanalHacimOrani = (oRingAlan / (kanalDerinligi * kanalGenisligi)) * 100;
    const minRadyus = Math.max(0.15, d2 * 0.08);
    const pah = Math.max(0.3, d2 * 0.12);

    const durum =
      kanalHacimOrani > 85
        ? 'Doluluk yüksek, kanal genişliği artırılmalı'
        : squeeze > 25
          ? 'Sıkışma yüksek, montaj kuvveti kontrol edilmeli'
          : 'Ön tasarım aralığı uygun';

    return {
      d2,
      nominalCap,
      squeeze,
      fill,
      stretch,
      kanalDerinligi,
      kanalGenisligi,
      sikismaMiktari,
      icCap,
      disCap,
      kanalHacimOrani,
      minRadyus,
      pah,
      durum,
    };
  }, [cap, doluluk, kesit, sikisma, uzama]);

  const applyPreset = (index: number) => {
    setUygulama(index);
    setSikisma(String(uygulamalar[index].squeeze));
    setDoluluk(String(uygulamalar[index].fill));
  };

  const teknikCagri = hesap
    ? `O-ring kanal on tasarim: d2=${formatSmartNumber(hesap.d2, 'tr-TR', 2)} mm, kanal derinligi=${formatSmartNumber(hesap.kanalDerinligi, 'tr-TR', 2)} mm, kanal genisligi=${formatSmartNumber(hesap.kanalGenisligi, 'tr-TR', 2)} mm, sikisma=%${formatSmartNumber(hesap.squeeze, 'tr-TR', 1)}, doluluk=%${formatSmartNumber(hesap.kanalHacimOrani, 'tr-TR', 1)}.`
    : '';

  const kopyala = async () => {
    const ok = await copyTextSafe(teknikCagri);
    setKopyalandi(ok);
    window.setTimeout(() => setKopyalandi(false), 1800);
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10">
            <Circle className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">O-Ring Kanalı Hesaplama</h2>
            <p className="calc-prose mt-1">Sıkışma ve doluluk oranına göre O-ring kanal ölçülerini hızlıca ön boyutlandırın.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-5">
          {uygulamalar.map((item, index) => (
            <button
              key={item.key}
              type="button"
              onClick={() => applyPreset(index)}
              className={`calc-panel rounded-xl px-4 py-3 text-left transition ${uygulama === index ? 'ring-2 ring-sky-500/30' : ''}`}
            >
              <span className="block font-bold text-[var(--foreground)] text-sm">{item.ad}</span>
              <span className="block calc-muted text-xs mt-1">%{item.squeeze} sıkışma · %{item.fill} doluluk</span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InputField label="O-ring kesit çapı d2 (mm)" value={kesit} onChange={setKesit} />
          <InputField label="Nominal mil/delik çapı (mm)" value={cap} onChange={setCap} />
          <InputField label="Sıkışma oranı (%)" value={sikisma} onChange={setSikisma} />
          <InputField label="Hedef kanal doluluğu (%)" value={doluluk} onChange={setDoluluk} />
          <InputField label="O-ring uzama payı (%)" value={uzama} onChange={setUzama} />
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-sky-600 dark:text-sky-400 text-sm font-bold mb-4">Kanal Ölçüsü Sonuçları</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Result label="Kanal derinliği" value={`${formatSmartNumber(hesap.kanalDerinligi, 'tr-TR', 2)} mm`} />
            <Result label="Kanal genişliği" value={`${formatSmartNumber(hesap.kanalGenisligi, 'tr-TR', 2)} mm`} />
            <Result label="Sıkışma miktarı" value={`${formatSmartNumber(hesap.sikismaMiktari, 'tr-TR', 2)} mm`} />
            <Result label="O-ring iç çap önerisi" value={`${formatSmartNumber(hesap.icCap, 'tr-TR', 2)} mm`} />
            <Result label="O-ring dış çapı" value={`${formatSmartNumber(hesap.disCap, 'tr-TR', 2)} mm`} />
            <Result label="Gerçek doluluk" value={`%${formatSmartNumber(hesap.kanalHacimOrani, 'tr-TR', 1)}`} />
            <Result label="Min. dip radyüsü" value={`R ${formatSmartNumber(hesap.minRadyus, 'tr-TR', 2)} mm`} />
            <Result label="Giriş pahı" value={`${formatSmartNumber(hesap.pah, 'tr-TR', 2)} mm`} />
            <Result label="Durum" value={hesap.durum} />
          </div>

          <div className="mt-5 calc-box-accent">
            <div className="flex items-start justify-between gap-3">
              <p className="font-mono text-xs calc-muted leading-6">{teknikCagri}</p>
              <button type="button" onClick={kopyala} className="calc-chip shrink-0 inline-flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {kopyalandi ? 'Kopyalandı' : 'Kopyala'}
              </button>
            </div>
          </div>
        </div>
      )}

      <InfoBlock />
    </div>
  );
}

function InfoBlock() {
  return (
    <section className="calc-box space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="calc-section-title">Kullanım notu</h3>
      </div>
      <p className="calc-prose">
        Bu araç O-ring kanalını hızlı ön tasarım için hesaplar. Son ölçüler; akışkan, sıcaklık, basınç, malzeme sertliği ve üretici katalog toleranslarına göre doğrulanmalıdır.
      </p>
    </section>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^0-9.,-]/g, ''))}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/30"
      />
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="calc-soft rounded-xl p-4">
      <p className="text-xs calc-muted mb-1">{label}</p>
      <p className="font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}
