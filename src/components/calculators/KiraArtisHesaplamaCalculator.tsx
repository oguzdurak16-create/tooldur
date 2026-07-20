'use client';

import { useMemo, useState } from 'react';
import { Home, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

// Kullanıcı tarafından sağlanan TÜFE oranları
const TUFE: Record<string, number> = {
  '2026-03': 36.5,
  '2026-02': 37.3,
  '2026-01': 38.6,
  '2025-12': 44.4,
  '2025-11': 47.1,
  '2025-10': 48.6,
  '2025-09': 49.4,
  '2025-08': 51.7,
  '2025-07': 61.8,
  '2025-06': 71.6,
  '2025-05': 75.5,
  '2025-04': 69.8,
  '2025-03': 68.5,
  '2025-02': 67.1,
  '2025-01': 64.9,
  '2024-12': 44.4,
  '2024-11': 47.1,
  '2024-10': 48.6,
} as const;


const DEFAULT_DONEM = Object.keys(TUFE).sort().at(-1) || '2026-03';
const [DEFAULT_YIL, DEFAULT_AY] = DEFAULT_DONEM.split('-').map(Number);

const AYLAR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

export default function KiraArtisHesaplamaCalculator() {
  const [kira, setKira] = useState('');
  // SSR/client saat dilimi farkı hydration hatası üretmesin diye başlangıç dönemi sabit tutulur.
  const [ay, setAy] = useState(DEFAULT_AY);
  const [yil, setYil] = useState(DEFAULT_YIL);

  const hesap = useMemo(() => {
    const k = parseLocalizedNumber(kira) || 0;
    if (k <= 0) return null;

    const ayKey = `${yil}-${String(ay).padStart(2, '0')}`;
    const tufeOran = TUFE[ayKey] ?? null;

    if (tufeOran === null) {
      return {
        kira: k,
        ayKey,
        tufeOran: null as number | null,
        yeniKira: 0,
        fark: 0,
      };
    }

    const artisOran = tufeOran;
    const yeniKira = k * (1 + artisOran / 100);
    const fark = yeniKira - k;

    return {
      kira: k,
      ayKey,
      tufeOran,
      yeniKira,
      fark,
    };
  }, [kira, ay, yil]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <Home className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Kira Artış Hesaplama</h2>
            <p className="calc-prose mt-1">
              Mevcut aylık kira ve yenileme dönemine göre kira artışını hızlıca hesaplayın.
            </p>
          </div>
        </div>

        <div>
          <label className="calc-title block mb-2">Mevcut Aylık Kira (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={kira}
            onChange={(e) => setKira(e.target.value.replace(/[^0-9.,-]/g, ''))}
            placeholder="15000"
            className="calc-panel w-full text-lg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <label className="calc-title block mb-2">Sözleşme Yenileme Ayı</label>
            <select
              value={ay}
              onChange={(e) => setAy(Number(e.target.value))}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {AYLAR.map((a, i) => (
                <option key={i} value={i + 1}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="calc-title block mb-2">Yıl</label>
            <select
              value={yil}
              onChange={(e) => setYil(Number(e.target.value))}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen dönem: {AYLAR[ay - 1]} {yil}
          </p>
          <p className="calc-prose mt-2">
            Bu araç, girilen dönem için tanımlı TÜFE oranına göre yeni kira tutarını ve artış farkını gösterir.
          </p>
        </div>
      </div>

      {hesap && hesap.tufeOran !== null && (
        <div className="calc-box">
          <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-4">
            📈 Kira Artış Sonucu
          </h3>

          <div className="space-y-3">
            <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
              <span className="calc-muted text-sm">
                TÜFE Oranı ({AYLAR[ay - 1]} {yil})
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                %{formatSmartNumber(hesap.tufeOran, 'tr-TR', 1)}
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
              <span className="calc-muted text-sm">Mevcut Kira</span>
              <span className="font-bold text-[var(--foreground)]">
                {formatSmartNumber(hesap.kira, 'tr-TR', 2)} ₺
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
              <span className="calc-muted text-sm">Artış Tutarı</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                +{formatSmartNumber(hesap.fark, 'tr-TR', 2)} ₺
              </span>
            </div>

            <div className="calc-result rounded-xl p-4 flex justify-between items-center">
              <span className="font-bold text-[var(--foreground)]">Yasal Yeni Kira</span>
              <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                {formatSmartNumber(hesap.yeniKira, 'tr-TR', 2)} ₺
              </span>
            </div>
          </div>
        </div>
      )}

      {hesap && hesap.tufeOran === null && (
        <div className="calc-warn rounded-xl p-4 text-sm">
          Seçtiğiniz dönem ({AYLAR[ay - 1]} {yil}) için TÜFE verisi tanımlı değil. Lütfen farklı bir dönem seçin.
        </div>
      )}

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-[var(--foreground)] mb-1">Yasal Bilgi</p>
            <p className="calc-prose">
              6098 sayılı Türk Borçlar Kanunu m.344 gereğince konut kiralarında yıllık artış oranı, ilgili dönemde esas alınan TÜFE sınırına göre değerlendirilir. TÜFE verileri her ay açıklanır.
            </p>
          </div>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Kira artış hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, mevcut kira tutarını seçilen dönem için girilmiş TÜFE oranıyla çarpar ve artış sonrası yeni kira bedelini hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>kira artış hesaplama</strong>, <strong>tüfe kira zammı</strong>,
              <strong> yeni kira bedeli</strong>, <strong>kira zam oranı hesaplama</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}