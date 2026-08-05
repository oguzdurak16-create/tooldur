'use client';

import { useMemo, useState } from 'react';
import {
  Zap,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ArrowLeftRight,
  ShieldAlert,
} from 'lucide-react';
import {
  copyTextSafe,
  formatCompactNumber,
  formatSmartNumber,
  parseLocalizedNumber,
} from '@/lib/calculator-utils';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import type { Locale } from '@/lib/siteLanguage';

const iletkenler = {
  bakir: {
    ad: 'Bakır',
    adEn: 'Copper',
    rho: 0.0175,
    renk: 'text-amber-500',
  },
  aluminyum: {
    ad: 'Alüminyum',
    adEn: 'Aluminum',
    rho: 0.0282,
    renk: 'text-slate-400',
  },
} as const;

const fazTipleri = {
  tek: { ad: 'Tek Faz', adEn: 'Single Phase', katsayi: 2 },
  uc: { ad: 'Üç Faz', adEn: 'Three Phase', katsayi: 1.7320508075688772 },
} as const;

const standartKesitler = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];

type IletkenKey = keyof typeof iletkenler;
type FazKey = keyof typeof fazTipleri;

type HesapSonucu = {
  voltajDusumu: number;
  voltajDusumYuzde: number;
  hedefVoltaj: number;
  gerekenKesit: number;
  onerilenStandartKesit: number | null;
  hatDirenci: number;
  gucKaybi: number;
  durum: 'iyi' | 'orta' | 'kritik';
  limitIcinde: boolean;
};

const populerPresets: Array<{
  akim: string;
  gerilim: string;
  uzunluk: string;
  kesit: string;
  faz: FazKey;
  iletken: IletkenKey;
  label: string;
  labelEn: string;
}> = [
  {
    akim: '16',
    gerilim: '230',
    uzunluk: '25',
    kesit: '2.5',
    faz: 'tek',
    iletken: 'bakir',
    label: 'Ev hattı',
    labelEn: 'Home circuit',
  },
  {
    akim: '32',
    gerilim: '400',
    uzunluk: '40',
    kesit: '6',
    faz: 'uc',
    iletken: 'bakir',
    label: '3 faz pano',
    labelEn: '3-phase panel',
  },
  {
    akim: '63',
    gerilim: '400',
    uzunluk: '60',
    kesit: '16',
    faz: 'uc',
    iletken: 'bakir',
    label: 'Motor besleme',
    labelEn: 'Motor feeder',
  },
  {
    akim: '100',
    gerilim: '400',
    uzunluk: '80',
    kesit: '35',
    faz: 'uc',
    iletken: 'aluminyum',
    label: 'Uzun hat',
    labelEn: 'Long run',
  },
];

function uygunKesitBul(gerekliKesit: number) {
  return standartKesitler.find((item) => item >= gerekliKesit) ?? null;
}

function temizSayisalDeger(value: string) {
  return value.replace(/[^0-9.,-]/g, '');
}

export default function VoltajDusumuCalculator({ locale = 'tr' }: { locale?: Locale }) {
  const isEnglish = locale === 'en';
  const numberLocale = isEnglish ? 'en-US' : 'tr-TR';
  const phaseName = (key: FazKey) => isEnglish ? fazTipleri[key].adEn : fazTipleri[key].ad;
  const conductorName = (key: IletkenKey) => isEnglish ? iletkenler[key].adEn : iletkenler[key].ad;

  const [akim, setAkim] = useState('32');
  const [gerilim, setGerilim] = useState('400');
  const [uzunluk, setUzunluk] = useState('40');
  const [kesit, setKesit] = useState('6');
  const [fazTipi, setFazTipi] = useState<FazKey>('uc');
  const [iletkenTipi, setIletkenTipi] = useState<IletkenKey>('bakir');
  const [maxDusumYuzde, setMaxDusumYuzde] = useState('3');
  const [kopyalandi, setKopyalandi] = useState(false);

  const hesap = useMemo<HesapSonucu | null>(() => {
    const I = parseLocalizedNumber(akim);
    const V = parseLocalizedNumber(gerilim);
    const L = parseLocalizedNumber(uzunluk);
    const S = parseLocalizedNumber(kesit);
    const maxPct = parseLocalizedNumber(maxDusumYuzde);

    if ([I, V, L, S, maxPct].some((v) => Number.isNaN(v) || v <= 0)) {
      return null;
    }

    const rho = iletkenler[iletkenTipi].rho;
    const katsayi = fazTipleri[fazTipi].katsayi;

    const voltajDusumu = (katsayi * rho * L * I) / S;
    const voltajDusumYuzde = (voltajDusumu / V) * 100;
    const hedefVoltaj = V - voltajDusumu;

    const gerekenKesit = (katsayi * rho * L * I) / ((maxPct / 100) * V);
    const onerilenStandartKesit = uygunKesitBul(gerekenKesit);

    const hatDirenci = (rho * L) / S;
    const gucKaybi = fazTipi === 'tek'
      ? I * voltajDusumu
      : 1.7320508075688772 * I * voltajDusumu;

    let durum: 'iyi' | 'orta' | 'kritik' = 'iyi';
    if (voltajDusumYuzde > maxPct) durum = 'kritik';
    else if (voltajDusumYuzde > maxPct * 0.8) durum = 'orta';

    return {
      voltajDusumu,
      voltajDusumYuzde,
      hedefVoltaj,
      gerekenKesit,
      onerilenStandartKesit,
      hatDirenci,
      gucKaybi,
      durum,
      limitIcinde: voltajDusumYuzde <= maxPct,
    };
  }, [akim, gerilim, uzunluk, kesit, fazTipi, iletkenTipi, maxDusumYuzde]);

  const hizliKesitSonuclari = useMemo(() => {
    const I = parseLocalizedNumber(akim);
    const V = parseLocalizedNumber(gerilim);
    const L = parseLocalizedNumber(uzunluk);

    if ([I, V, L].some((v) => Number.isNaN(v) || v <= 0)) return [];

    const rho = iletkenler[iletkenTipi].rho;
    const katsayi = fazTipleri[fazTipi].katsayi;

    return standartKesitler.slice(0, 10).map((s) => {
      const vd = (katsayi * rho * L * I) / s;
      const pct = (vd / V) * 100;
      return {
        kesit: s,
        volt: formatCompactNumber(vd),
        yuzde: formatCompactNumber(pct),
      };
    });
  }, [akim, gerilim, uzunluk, iletkenTipi, fazTipi]);

  const svgContent = useMemo(() => {
    if (!hesap) return '';

    return generateDrawing({
      type: 'tork_diyagram',
      result: hesap.voltajDusumu,
      result2: hesap.voltajDusumYuzde,
      width: parseLocalizedNumber(kesit) || 0,
      load: parseLocalizedNumber(akim) || 0,
      label: `${isEnglish ? 'Voltage drop' : 'Voltaj düşümü'} • ${phaseName(fazTipi)} • ${conductorName(iletkenTipi)}`,
    });
  }, [hesap, kesit, akim, fazTipi, iletkenTipi, isEnglish]);

  const sifirla = () => {
    setAkim('');
    setGerilim('');
    setUzunluk('');
    setKesit('');
    setMaxDusumYuzde('3');
    setFazTipi('uc');
    setIletkenTipi('bakir');
  };

  const kopyala = async () => {
    if (!hesap) return;

    const metin = isEnglish
      ? [
          'Voltage Drop Calculation',
          `Current: ${akim} A`,
          `Voltage: ${gerilim} V`,
          `Length: ${uzunluk} m`,
          `Cross-section: ${kesit} mm²`,
          `Phase: ${phaseName(fazTipi)}`,
          `Conductor: ${conductorName(iletkenTipi)}`,
          `Voltage drop: ${formatSmartNumber(hesap.voltajDusumu, numberLocale)} V`,
          `Voltage drop percentage: ${formatSmartNumber(hesap.voltajDusumYuzde, numberLocale)}%`,
          `End-of-line voltage: ${formatSmartNumber(hesap.hedefVoltaj, numberLocale)} V`,
          `Required minimum size: ${formatSmartNumber(hesap.gerekenKesit, numberLocale)} mm²`,
          `Recommended standard size: ${hesap.onerilenStandartKesit ? `${hesap.onerilenStandartKesit} mm²` : 'Above 300 mm²'}`,
        ].join('\n')
      : [
          'Voltaj Düşümü Hesabı',
          `Akım: ${akim} A`,
          `Gerilim: ${gerilim} V`,
          `Uzunluk: ${uzunluk} m`,
          `Kesit: ${kesit} mm²`,
          `Faz: ${phaseName(fazTipi)}`,
          `İletken: ${conductorName(iletkenTipi)}`,
          `Voltaj düşümü: ${formatSmartNumber(hesap.voltajDusumu, numberLocale)} V`,
          `Voltaj düşümü yüzde: ${formatSmartNumber(hesap.voltajDusumYuzde, numberLocale)} %`,
          `Hat sonu voltajı: ${formatSmartNumber(hesap.hedefVoltaj, numberLocale)} V`,
          `Önerilen minimum kesit: ${formatSmartNumber(hesap.gerekenKesit, numberLocale)} mm²`,
          `Önerilen standart kesit: ${hesap.onerilenStandartKesit ? `${hesap.onerilenStandartKesit} mm²` : '300 mm² üzeri'}`,
        ].join('\n');

    const ok = await copyTextSafe(metin);
    if (!ok) return;
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 1800);
  };

  const presetUygula = (item: (typeof populerPresets)[number]) => {
    setAkim(item.akim);
    setGerilim(item.gerilim);
    setUzunluk(item.uzunluk);
    setKesit(item.kesit);
    setFazTipi(item.faz);
    setIletkenTipi(item.iletken);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="calc-box space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--foreground)] flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              {isEnglish ? 'Voltage Drop Calculator' : 'Voltaj Düşümü Hesaplama'}
            </h2>
            <p className="calc-prose mt-1">
              {isEnglish
                ? 'Quickly calculate line voltage drop from cable length, current, conductor size and material.'
                : 'Kablo uzunluğu, akım, kesit ve iletken tipine göre hat üzerindeki voltaj düşümünü hızlıca hesaplayın.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {populerPresets.map((item) => (
              <button
                key={item.label}
                onClick={() => presetUygula(item)}
                className="calc-chip"
                type="button"
              >
                {isEnglish ? item.labelEn : item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="calc-title">{isEnglish ? 'Current (A)' : 'Akım (A)'}</label>
            <input
              type="text"
              inputMode="decimal"
              value={akim}
              onChange={(e) => setAkim(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder={isEnglish ? 'Ex: 32' : 'Örn: 32'}
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">{isEnglish ? 'Line Voltage (V)' : 'Şebeke Gerilimi (V)'}</label>
            <input
              type="text"
              inputMode="decimal"
              value={gerilim}
              onChange={(e) => setGerilim(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder={isEnglish ? 'Ex: 400' : 'Örn: 400'}
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">{isEnglish ? 'Line Length (m)' : 'Hat Uzunluğu (m)'}</label>
            <input
              type="text"
              inputMode="decimal"
              value={uzunluk}
              onChange={(e) => setUzunluk(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder={isEnglish ? 'Ex: 40' : 'Örn: 40'}
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">{isEnglish ? 'Cable Cross-Section (mm²)' : 'Kablo Kesiti (mm²)'}</label>
            <input
              type="text"
              inputMode="decimal"
              value={kesit}
              onChange={(e) => setKesit(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder={isEnglish ? 'Ex: 6' : 'Örn: 6'}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="calc-title">{isEnglish ? 'Phase Type' : 'Faz Tipi'}</label>
            <select
              value={fazTipi}
              onChange={(e) => setFazTipi(e.target.value as FazKey)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {Object.entries(fazTipleri).map(([key, item]) => (
                <option key={key} value={key}>
                  {isEnglish ? item.adEn : item.ad}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="calc-title">{isEnglish ? 'Conductor Material' : 'İletken Tipi'}</label>
            <select
              value={iletkenTipi}
              onChange={(e) => setIletkenTipi(e.target.value as IletkenKey)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {Object.entries(iletkenler).map(([key, item]) => (
                <option key={key} value={key}>
                  {isEnglish ? item.adEn : item.ad}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="calc-title">{isEnglish ? 'Maximum Allowed Drop (%)' : 'İzin Verilen Maks. Düşüm (%)'}</label>
            <input
              type="text"
              inputMode="decimal"
              value={maxDusumYuzde}
              onChange={(e) => setMaxDusumYuzde(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder={isEnglish ? 'Ex: 3' : 'Örn: 3'}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={sifirla}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl calc-panel hover:border-red-500/30 transition-colors"
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
            {isEnglish ? 'Clear' : 'Temizle'}
          </button>

          <button
            onClick={kopyala}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors"
            type="button"
          >
            {kopyalandi ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-sm font-semibold text-emerald-500">
              {isEnglish ? (kopyalandi ? 'Copied' : 'Copy Result') : (kopyalandi ? 'Kopyalandı' : 'Sonucu Kopyala')}
            </span>
          </button>
        </div>

        <div aria-live="polite" className="sr-only">
          {hesap
            ? isEnglish
              ? `Voltage drop is ${formatSmartNumber(hesap.voltajDusumu, numberLocale)} volts and ${formatSmartNumber(hesap.voltajDusumYuzde, numberLocale)} percent.`
              : `Voltaj düşümü ${formatSmartNumber(hesap.voltajDusumu, numberLocale)} volt ve yüzde ${formatSmartNumber(hesap.voltajDusumYuzde, numberLocale)}.`
            : isEnglish ? 'No calculation result yet.' : 'Henüz hesap sonucu yok.'}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="calc-result rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="calc-muted text-xs uppercase tracking-wide">{isEnglish ? 'Voltage Drop' : 'Voltaj Düşümü'}</div>
                <div className="text-3xl font-extrabold text-[var(--foreground)]">
                  {hesap ? formatSmartNumber(hesap.voltajDusumu, numberLocale) : '—'} V
                </div>
              </div>

              {hesap && (
                <div
                  className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    hesap.durum === 'iyi'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : hesap.durum === 'orta'
                      ? 'bg-amber-500/10 text-amber-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {hesap.durum === 'iyi'
                    ? (isEnglish ? 'Acceptable' : 'Uygun')
                    : hesap.durum === 'orta'
                      ? (isEnglish ? 'Borderline' : 'Sınırda')
                      : (isEnglish ? 'High' : 'Yüksek')}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">{isEnglish ? 'Drop (%)' : 'Düşüm (%)'}</div>
                <div className="font-bold text-lg text-amber-500">
                  {hesap ? formatSmartNumber(hesap.voltajDusumYuzde, numberLocale) : '—'} %
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">{isEnglish ? 'End-of-Line Voltage' : 'Hat Sonu Voltajı'}</div>
                <div className="font-bold text-lg text-sky-500">
                  {hesap ? formatSmartNumber(hesap.hedefVoltaj, numberLocale) : '—'} V
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">{isEnglish ? 'Required Minimum Size' : 'Gerekli Min. Kesit'}</div>
                <div className="font-bold text-lg text-fuchsia-500">
                  {hesap ? formatSmartNumber(hesap.gerekenKesit, numberLocale) : '—'} mm²
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">{isEnglish ? 'Recommended Standard Size' : 'Önerilen Standart Kesit'}</div>
                <div className="font-bold text-lg text-emerald-500">
                  {hesap?.onerilenStandartKesit ? formatSmartNumber(hesap.onerilenStandartKesit, numberLocale) : '300+'} mm²
                </div>
              </div>
            </div>
          </div>

          <div className="calc-box-accent space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <p className="text-sm text-[var(--foreground)] font-semibold">
                {isEnglish ? 'Line Summary and Interpretation' : 'Hat özeti ve yorum'}
              </p>
            </div>

            <p className="calc-prose">
              {hesap
                ? isEnglish
                  ? `For ${akim || '0'} A, a ${uzunluk || '0'} m line and a ${kesit || '0'} mm² ${conductorName(iletkenTipi)} cable, the approximate voltage drop is ${formatSmartNumber(hesap.voltajDusumu, numberLocale)} V, or ${formatSmartNumber(hesap.voltajDusumYuzde, numberLocale)}%.`
                  : `${akim || '0'} A akım, ${uzunluk || '0'} m hat uzunluğu ve ${kesit || '0'} mm² ${conductorName(iletkenTipi)} kablo için yaklaşık voltaj düşümü ${formatSmartNumber(hesap.voltajDusumu, numberLocale)} V yani %${formatSmartNumber(hesap.voltajDusumYuzde, numberLocale)}.`
                : isEnglish ? 'Enter the values to generate an automatic interpretation.' : 'Girdileri doldurduğunuzda burada otomatik yorum oluşur.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">{isEnglish ? 'Approximate Line Resistance' : 'Yaklaşık Hat Direnci'}</div>
                <div className="font-bold text-[var(--foreground)]">
                  {hesap ? formatCompactNumber(hesap.hatDirenci) : '—'} Ω
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">{isEnglish ? 'Approximate Power Loss' : 'Yaklaşık Güç Kaybı'}</div>
                <div className="font-bold text-[var(--foreground)]">
                  {hesap ? formatCompactNumber(hesap.gucKaybi) : '—'} W
                </div>
              </div>
            </div>

            {hesap && (
              <div
                className={`rounded-xl p-3 text-sm font-semibold ${
                  hesap.limitIcinde
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {hesap.limitIcinde
                  ? isEnglish
                    ? `The selected ${kesit} mm² cable is within your ${maxDusumYuzde}% limit.`
                    : `Seçilen ${kesit} mm² kesit, belirlediğiniz %${maxDusumYuzde} sınırının içinde.`
                  : isEnglish
                    ? `The selected ${kesit} mm² cable exceeds your ${maxDusumYuzde}% limit. A larger size is recommended.`
                    : `Seçilen ${kesit} mm² kesit, belirlediğiniz %${maxDusumYuzde} sınırını aşıyor. Daha büyük kesit önerilir.`}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="calc-box">
        <h3 className="calc-section-title mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-sky-500" />
          {isEnglish ? 'Quick Comparison by Standard Cable Size' : 'Standart kesitlere göre hızlı karşılaştırma'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {hizliKesitSonuclari.map((item) => (
            <div key={item.kesit} className="calc-soft rounded-xl p-3">
              <div className="calc-muted text-xs mb-1">{isEnglish ? 'Size' : 'Kesit'}</div>
              <div className="font-extrabold text-[var(--foreground)] text-lg">{item.kesit} mm²</div>
              <div className="mt-2 text-sm">
                <div className="calc-muted">{isEnglish ? 'Drop' : 'Düşüm'}</div>
                <div className="font-bold text-amber-500">{item.volt} V</div>
              </div>
              <div className="mt-2 text-sm">
                <div className="calc-muted">{isEnglish ? 'Percent' : 'Yüzde'}</div>
                <div className="font-bold text-sky-500">{item.yuzde} %</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">
            {isEnglish ? 'How is voltage drop calculated?' : 'Voltaj düşümü nasıl hesaplanır?'}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              {isEnglish ? (
                <>In the simplified model, voltage drop depends on current, line length, conductor resistivity and cross-sectional area. The approximate formula is <strong>Vd = 2 × ρ × L × I / S</strong> for single phase and <strong>Vd = 1.732 × ρ × L × I / S</strong> for three phase.</>
              ) : (
                <>Basit yaklaşımda voltaj düşümü; akım, hat uzunluğu, iletken özdirenci ve kesite bağlıdır. Tek faz için yaklaşık formül <strong>Vd = 2 × ρ × L × I / S</strong>, üç faz için <strong>Vd = 1.732 × ρ × L × I / S</strong> şeklindedir.</>
              )}
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              {isEnglish ? (
                <>Common searches: <strong>voltage drop calculator</strong>, <strong>cable voltage loss</strong>, <strong>three-phase voltage drop</strong>, <strong>voltage drop calculation</strong>.</>
              ) : (
                <>En sık aranan sorgular: <strong>voltaj düşümü hesaplama</strong>, <strong>kablo voltaj kaybı</strong>, <strong>üç faz voltaj düşümü</strong>, <strong>gerilim düşümü hesabı</strong>.</>
              )}
            </p>
          </div>
        </div>

        <div className="calc-soft rounded-xl p-4">
          <h4 className="font-bold text-[var(--foreground)] mb-2">{isEnglish ? 'Usage Notes' : 'Kullanım notları'}</h4>
          <ul className="space-y-2 calc-prose">
            {isEnglish ? (
              <>
                <li>Results are approximate preliminary engineering calculations.</li>
                <li>Reactive effects, temperature, installation method and detailed impedance are not included in this simplified model.</li>
                <li>For critical projects, verify against applicable standards and manufacturer data.</li>
              </>
            ) : (
              <>
                <li>Sonuçlar yaklaşık mühendislik ön hesabı içindir.</li>
                <li>Reaktif etki, sıcaklık, kablo döşeme tipi ve empedans detayları bu basit modelde yoktur.</li>
                <li>Kritik projelerde standartlara ve üretici tablolarına göre kontrol yapın.</li>
              </>
            )}
          </ul>
        </div>
      </section>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="voltaj-dusumu"
        title={isEnglish ? 'Voltage Drop Diagram' : 'Voltaj Düşümü Görseli'}
      />
    </div>
  );
}
