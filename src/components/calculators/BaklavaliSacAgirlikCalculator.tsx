"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Weight,
  Ruler,
  Layers3,
  Calculator,
} from "lucide-react";
import {
  copyTextSafe,
  formatCompactNumber,
  formatSmartNumber,
  parseLocalizedNumber,
} from "@/lib/calculator-utils";

const malzemeler = {
  celik: {
    ad: "Çelik",
    yogunluk: 7850,
  },
  paslanmaz: {
    ad: "Paslanmaz Çelik",
    yogunluk: 7930,
  },
  alüminyum: {
    ad: "Alüminyum",
    yogunluk: 2700,
  },
} as const;

type MalzemeKey = keyof typeof malzemeler;

const presets: Array<{
  en: string;
  boy: string;
  kalinlik: string;
  adet: string;
  malzeme: MalzemeKey;
  label: string;
}> = [
  { en: "1000", boy: "2000", kalinlik: "3", adet: "1", malzeme: "celik", label: "1000×2000×3" },
  { en: "1250", boy: "2500", kalinlik: "4", adet: "1", malzeme: "celik", label: "1250×2500×4" },
  { en: "1500", boy: "3000", kalinlik: "5", adet: "1", malzeme: "celik", label: "1500×3000×5" },
  { en: "1000", boy: "2000", kalinlik: "2", adet: "2", malzeme: "alüminyum", label: "2 adet Alüminyum" },
];

// Baklavalı sac için pratik yaklaşım:
// düz sac ağırlığı × desen katsayısı
// çelikte sahada kullanılan yaklaşık yaklaşım için güvenli, basit model
const DEFAULT_PATTERN_FACTOR = 1.08;

export default function BaklavaliSacAgirlikCalculator() {
  const [en, setEn] = useState("1000");
  const [boy, setBoy] = useState("2000");
  const [kalinlik, setKalinlik] = useState("3");
  const [adet, setAdet] = useState("1");
  const [malzeme, setMalzeme] = useState<MalzemeKey>("celik");
  const [desenKatsayi, setDesenKatsayi] = useState(String(DEFAULT_PATTERN_FACTOR));
  const [kopyalandi, setKopyalandi] = useState(false);

  const hesap = useMemo(() => {
    const widthMm = parseLocalizedNumber(en);
    const lengthMm = parseLocalizedNumber(boy);
    const thickMm = parseLocalizedNumber(kalinlik);
    const qty = parseLocalizedNumber(adet);
    const factor = parseLocalizedNumber(desenKatsayi);

    if ([widthMm, lengthMm, thickMm, qty, factor].some((v) => Number.isNaN(v) || v <= 0)) {
      return null;
    }

    const density = malzemeler[malzeme].yogunluk;

    const widthM = widthMm / 1000;
    const lengthM = lengthMm / 1000;
    const thickM = thickMm / 1000;

    const alanM2 = widthM * lengthM;
    const hacimDuzM3 = alanM2 * thickM;
    const tekPlakaDuzKg = hacimDuzM3 * density;
    const tekPlakaBaklavaliKg = tekPlakaDuzKg * factor;
    const toplamKg = tekPlakaBaklavaliKg * qty;
    const m2Agirlik = alanM2 > 0 ? tekPlakaBaklavaliKg / alanM2 : 0;

    return {
      alanM2,
      density,
      tekPlakaDuzKg,
      tekPlakaBaklavaliKg,
      toplamKg,
      m2Agirlik,
      qty,
      factor,
    };
  }, [en, boy, kalinlik, adet, malzeme, desenKatsayi]);

  const quickMetrics = useMemo(() => {
    if (!hesap) return [];

    return [
      { label: "Alan", value: `${formatCompactNumber(hesap.alanM2)} m²` },
      { label: "Düz sac ağırlığı", value: `${formatCompactNumber(hesap.tekPlakaDuzKg)} kg` },
      { label: "m² başına ağırlık", value: `${formatCompactNumber(hesap.m2Agirlik)} kg/m²` },
      { label: "Yoğunluk", value: `${formatCompactNumber(hesap.density)} kg/m³` },
    ];
  }, [hesap]);

  const sifirla = () => {
    setEn("");
    setBoy("");
    setKalinlik("");
    setAdet("1");
    setMalzeme("celik");
    setDesenKatsayi(String(DEFAULT_PATTERN_FACTOR));
  };

  const presetUygula = (item: (typeof presets)[number]) => {
    setEn(item.en);
    setBoy(item.boy);
    setKalinlik(item.kalinlik);
    setAdet(item.adet);
    setMalzeme(item.malzeme);
    setDesenKatsayi(String(DEFAULT_PATTERN_FACTOR));
  };

  const kopyala = async () => {
    if (!hesap) return;

    const text = [
      "Baklavalı Sac Ağırlık Hesabı",
      `Malzeme: ${malzemeler[malzeme].ad}`,
      `En: ${en} mm`,
      `Boy: ${boy} mm`,
      `Kalınlık: ${kalinlik} mm`,
      `Adet: ${adet}`,
      `Desen katsayısı: ${desenKatsayi}`,
      `Tek plaka: ${formatSmartNumber(hesap.tekPlakaBaklavaliKg)} kg`,
      `Toplam: ${formatSmartNumber(hesap.toplamKg)} kg`,
      `m² başına ağırlık: ${formatSmartNumber(hesap.m2Agirlik)} kg/m²`,
    ].join("\n");

    const ok = await copyTextSafe(text);
    if (!ok) return;
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="calc-box space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--foreground)] flex items-center gap-2">
              <Weight className="w-5 h-5 text-amber-500" />
              Baklavalı Sac Ağırlık Hesaplama
            </h2>
            <p className="calc-prose mt-1">
              En, boy, kalınlık, malzeme ve adet bilgilerine göre baklavalı sac yaklaşık ağırlığını hesaplayın.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((item) => (
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
            <label className="calc-title">En (mm)</label>
            <input
              type="text"
              inputMode="decimal"
              value={en}
              onChange={(e) => setEn(e.target.value)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 1000"
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">Boy (mm)</label>
            <input
              type="text"
              inputMode="decimal"
              value={boy}
              onChange={(e) => setBoy(e.target.value)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 2000"
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">Kalınlık (mm)</label>
            <input
              type="text"
              inputMode="decimal"
              value={kalinlik}
              onChange={(e) => setKalinlik(e.target.value)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 3"
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">Adet</label>
            <input
              type="text"
              inputMode="numeric"
              value={adet}
              onChange={(e) => setAdet(e.target.value)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="calc-title">Malzeme</label>
            <select
              value={malzeme}
              onChange={(e) => setMalzeme(e.target.value as MalzemeKey)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {Object.entries(malzemeler).map(([key, item]) => (
                <option key={key} value={key}>
                  {item.ad}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="calc-title">Desen Katsayısı</label>
            <input
              type="text"
              inputMode="decimal"
              value={desenKatsayi}
              onChange={(e) => setDesenKatsayi(e.target.value)}
              className="w-full p-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Örn: 1.08"
            />
          </div>

          <div className="space-y-2">
            <label className="calc-title">Bilgi</label>
            <div className="calc-soft rounded-xl p-3 h-[50px] flex items-center text-sm calc-prose">
              Varsayılan baklava katsayısı: <strong className="ml-1">1.08</strong>
            </div>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="calc-result rounded-2xl p-4 space-y-3">
            <div>
              <div className="calc-muted text-xs uppercase tracking-wide">Tek Plaka Ağırlığı</div>
              <div className="text-3xl font-extrabold text-[var(--foreground)]">
                {hesap ? formatSmartNumber(hesap.tekPlakaBaklavaliKg) : "—"} kg
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Toplam Ağırlık</div>
                <div className="font-bold text-lg text-amber-500">
                  {hesap ? formatSmartNumber(hesap.toplamKg) : "—"} kg
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">m² Başına</div>
                <div className="font-bold text-lg text-sky-500">
                  {hesap ? formatSmartNumber(hesap.m2Agirlik) : "—"} kg/m²
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Düz Sac</div>
                <div className="font-bold text-lg text-fuchsia-500">
                  {hesap ? formatSmartNumber(hesap.tekPlakaDuzKg) : "—"} kg
                </div>
              </div>

              <div className="calc-soft rounded-xl p-3">
                <div className="calc-muted text-xs mb-1">Desen Katsayısı</div>
                <div className="font-bold text-lg text-emerald-500">
                  {hesap ? formatSmartNumber(hesap.factor) : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="calc-box-accent space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              <p className="text-sm text-[var(--foreground)] font-semibold">
                Hesap özeti
              </p>
            </div>

            <p className="calc-prose">
              {hesap
                ? `${en || "0"} × ${boy || "0"} mm ölçülerinde, ${kalinlik || "0"} mm kalınlığında ${
                    malzemeler[malzeme].ad
                  } baklavalı sac için tek plaka yaklaşık ağırlık ${formatSmartNumber(
                    hesap.tekPlakaBaklavaliKg
                  )} kg, toplam ağırlık ise ${formatSmartNumber(hesap.toplamKg)} kg çıkar.`
                : "Girdileri doldurduğunuzda burada otomatik özet oluşur."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickMetrics.map((item) => (
                <div key={item.label} className="calc-soft rounded-xl p-3">
                  <div className="calc-muted text-xs mb-1">{item.label}</div>
                  <div className="font-bold text-[var(--foreground)]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="calc-box">
        <h3 className="calc-section-title mb-4 flex items-center gap-2">
          <Layers3 className="w-4 h-4 text-sky-500" />
          Baklavalı sac nasıl hesaplanır?
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Önce düz sac hacmi hesaplanır: <strong>en × boy × kalınlık</strong>. Sonra malzeme yoğunluğu ile
              çarpılarak düz sac ağırlığı bulunur. Baklavalı desen için yaklaşık ağırlık, bu sonucun desen katsayısı ile
              çarpılmasıyla elde edilir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              En sık aranan sorgular: <strong>baklavalı sac ağırlık hesaplama</strong>, <strong>baklava desenli sac kg</strong>,
              <strong> gözyaşı desenli sac ağırlığı</strong>.
            </p>
          </div>
        </div>

        <div className="calc-soft rounded-xl p-4">
          <h4 className="font-bold text-[var(--foreground)] mb-2 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-amber-500" />
            Not
          </h4>
          <ul className="space-y-2 calc-prose">
            <li>Bu hesap yaklaşık ağırlık verir.</li>
            <li>Gerçek ağırlık, üretici desen formuna ve toleranslara göre değişebilir.</li>
            <li>Kritik siparişlerde üretici katalog değerleriyle kontrol yapın.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}