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

const iletkenler = {
  bakir: {
    ad: 'Bakır',
    rho: 0.0175,
    renk: 'text-amber-500',
  },
  aluminyum: {
    ad: 'Alüminyum',
    rho: 0.0282,
    renk: 'text-slate-400',
  },
} as const;

const fazTipleri = {
  tek: { ad: 'Tek Faz', katsayi: 2 },
  uc: { ad: 'Üç Faz', katsayi: 1.7320508075688772 },
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
}> = [
  {
    akim: '16',
    gerilim: '230',
    uzunluk: '25',
    kesit: '2.5',
    faz: 'tek',
    iletken: 'bakir',
    label: 'Ev hattı',
  },
  {
    akim: '32',
    gerilim: '400',
    uzunluk: '40',
    kesit: '6',
    faz: 'uc',
    iletken: 'bakir',
    label: '3 faz pano',
  },
  {
    akim: '63',
    gerilim: '400',
    uzunluk: '60',
    kesit: '16',
    faz: 'uc',
    iletken: 'bakir',
    label: 'Motor besleme',
  },
  {
    akim: '100',
    gerilim: '400',
    uzunluk: '80',
    kesit: '35',
    faz: 'uc',
    iletken: 'aluminyum',
    label: 'Uzun hat',
  },
];

function uygunKesitBul(gerekliKesit: number) {
  return standartKesitler.find((item) => item >= gerekliKesit) ?? null;
}

function temizSayisalDeger(value: string) {
  return value.replace(/[^0-9.,-]/g, '');
}

export default function VoltajDusumuCalculator() {
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
      label: `Voltaj düşümü • ${fazTipleri[fazTipi].ad} • ${iletkenler[iletkenTipi].ad}`,
    });
  }, [hesap, kesit, akim, fazTipi, iletkenTipi]);

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

    const metin = [
      'Voltaj Düşümü Hesabı',
      `Akım: ${akim} A`,
      `Gerilim: ${gerilim} V`,
      `Uzunluk: ${uzunluk} m`,
      `Kesit: ${kesit} mm²`,
      `Faz: ${fazTipleri[fazTipi].ad}`,
      `İletken: ${iletkenler[iletkenTipi].ad}`,
      `Voltaj düşümü: ${formatSmartNumber(hesap.voltajDusumu)} V`,
      `Voltaj düşümü yüzde: ${formatSmartNumber(hesap.voltajDusumYuzde)} %`,
      `Hat sonu voltajı: ${formatSmartNumber(hesap.hedefVoltaj)} V`,
      `Önerilen minimum kesit: ${formatSmartNumber(hesap.gerekenKesit)} mm²`,
      `Önerilen standart kesit: ${
        hesap.onerilenStandartKesit ? `${hesap.onerilenStandartKesit} mm²` : '300 mm² üzeri'
      }`,
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
              Voltaj Düşümü Hesaplama
            </h2>
            <p className="calc-prose mt-1">
              Kablo uzunluğu, akım, kesit ve iletken tipine göre hat üzerindeki voltaj düşümünü hızlıca hesaplayın.
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
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="calc-title">Akım (A)</label>
            <input
              type="text"
              inputMode="decimal"
              value={akim}
              onChange={(e) => setAkim(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 32"
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">Şebeke Gerilimi (V)</label>
            <input
              type="text"
              inputMode="decimal"
              value={gerilim}
              onChange={(e) => setGerilim(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 400"
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">Hat Uzunluğu (m)</label>
            <input
              type="text"
              inputMode="decimal"
              value={uzunluk}
              onChange={(e) => setUzunluk(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 40"
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">Kablo Kesiti (mm²)</label>
            <input
              type="text"
              inputMode="decimal"
              value={kesit}
              onChange={(e) => setKesit(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 6"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="calc-title">Faz Tipi</label>
            <select
              value={fazTipi}
              onChange={(e) => setFazTipi(e.target.value as FazKey)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {Object.entries(fazTipleri).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.ad}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="calc-title">İletken Tipi</label>
            <select
              value={iletkenTipi}
              onChange={(e) => setIletkenTipi(e.target.value as IletkenKey)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {Object.entries(iletkenler).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.ad}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="calc-title">İzin Verilen Maks. Düşüm (%)</label>
            <input
              type="text"
              inputMode="decimal"
              value={maxDusumYuzde}
              onChange={(e) => setMaxDusumYuzde(temizSayisalDeger(e.target.value))}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 3"
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
            Temizle
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
            <span className="text-sm font-semibold text-emerald-500">Sonucu Kopyala</span>
          </button>
        </div>

        <div aria-live="polite" className="sr-only">
          {hesap
            ? `Voltaj düşümü ${formatSmartNumber(hesap.voltajDusumu)} volt ve yüzde ${formatSmartNumber(
                hesap.voltajDusumYuzde
              )}.`
            : 'Henüz hesap sonucu yok.'}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="calc-result rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="calc-muted text-xs uppercase tracking-wide">Voltaj Düşümü</div>
                <div className="text-3xl font-extrabold text-[var(--foreground)]">
                  {hesap ? formatSmartNumber(hesap.voltajDusumu) : '—'} V
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
                  {hesap.durum === 'iyi' ? 'Uygun' : hesap.durum === 'orta' ? 'Sınırda' : 'Yüksek'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Düşüm (%)</div>
                <div className="font-bold text-lg text-amber-500">
                  {hesap ? formatSmartNumber(hesap.voltajDusumYuzde) : '—'} %
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Hat Sonu Voltajı</div>
                <div className="font-bold text-lg text-sky-500">
                  {hesap ? formatSmartNumber(hesap.hedefVoltaj) : '—'} V
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Gerekli Min. Kesit</div>
                <div className="font-bold text-lg text-fuchsia-500">
                  {hesap ? formatSmartNumber(hesap.gerekenKesit) : '—'} mm²
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Önerilen Standart Kesit</div>
                <div className="font-bold text-lg text-emerald-500">
                  {hesap?.onerilenStandartKesit ? formatSmartNumber(hesap.onerilenStandartKesit) : '300+'} mm²
                </div>
              </div>
            </div>
          </div>

          <div className="calc-box-accent space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <p className="text-sm text-[var(--foreground)] font-semibold">Hat özeti ve yorum</p>
            </div>

            <p className="calc-prose">
              {hesap
                ? `${akim || '0'} A akım, ${uzunluk || '0'} m hat uzunluğu ve ${kesit || '0'} mm² ${
                    iletkenler[iletkenTipi].ad
                  } kablo için yaklaşık voltaj düşümü ${formatSmartNumber(hesap.voltajDusumu)} V yani %${formatSmartNumber(
                    hesap.voltajDusumYuzde
                  )}.`
                : 'Girdileri doldurduğunuzda burada otomatik yorum oluşur.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Yaklaşık Hat Direnci</div>
                <div className="font-bold text-[var(--foreground)]">
                  {hesap ? formatCompactNumber(hesap.hatDirenci) : '—'} Ω
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Yaklaşık Güç Kaybı</div>
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
                  ? `Seçilen ${kesit} mm² kesit, belirlediğiniz %${maxDusumYuzde} sınırının içinde.`
                  : `Seçilen ${kesit} mm² kesit, belirlediğiniz %${maxDusumYuzde} sınırını aşıyor. Daha büyük kesit önerilir.`}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="calc-box">
        <h3 className="calc-section-title mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-sky-500" />
          Standart kesitlere göre hızlı karşılaştırma
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {hizliKesitSonuclari.map((item) => (
            <div key={item.kesit} className="calc-soft rounded-xl p-3">
              <div className="calc-muted text-xs mb-1">Kesit</div>
              <div className="font-extrabold text-[var(--foreground)] text-lg">{item.kesit} mm²</div>
              <div className="mt-2 text-sm">
                <div className="calc-muted">Düşüm</div>
                <div className="font-bold text-amber-500">{item.volt} V</div>
              </div>
              <div className="mt-2 text-sm">
                <div className="calc-muted">Yüzde</div>
                <div className="font-bold text-sky-500">% {item.yuzde}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Voltaj düşümü nasıl hesaplanır?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Basit yaklaşımda voltaj düşümü; akım, hat uzunluğu, iletken özdirenci ve kesite bağlıdır.
              Tek faz için yaklaşık formül <strong>Vd = 2 × ρ × L × I / S</strong>, üç faz için
              <strong> Vd = 1.732 × ρ × L × I / S</strong> şeklindedir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              En sık aranan sorgular: <strong>voltaj düşümü hesaplama</strong>, <strong>kablo voltaj kaybı</strong>,
              <strong> üç faz voltaj düşümü</strong>, <strong>gerilim düşümü hesabı</strong>.
            </p>
          </div>
        </div>

        <div className="calc-soft rounded-xl p-4">
          <h4 className="font-bold text-[var(--foreground)] mb-2">Kullanım notları</h4>
          <ul className="space-y-2 calc-prose">
            <li>Sonuçlar yaklaşık mühendislik ön hesabı içindir.</li>
            <li>Reaktif etki, sıcaklık, kablo döşeme tipi ve empedans detayları bu basit modelde yoktur.</li>
            <li>Kritik projelerde standartlara ve üretici tablolarına göre kontrol yapın.</li>
          </ul>
        </div>
      </section>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="voltaj-dusumu"
        title="Voltaj Düşümü Görseli"
      />
    </div>
  );
}