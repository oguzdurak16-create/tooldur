'use client';

import { useMemo, useState } from 'react';
import { Receipt, Sparkles, Megaphone } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const ORANLAR = [1, 10, 20] as const;

export default function KdvHesaplamaCalculator() {
  const [mod, setMod] = useState<'dahil' | 'hariç'>('hariç');
  const [tutar, setTutar] = useState('');
  const [oran, setOran] = useState(20);

  const hesap = useMemo(() => {
    const t = parseLocalizedNumber(tutar) || 0;
    if (t <= 0) return null;

    const kdvHaric = mod === 'hariç' ? t : t / (1 + oran / 100);
    const kdvTutar = kdvHaric * (oran / 100);
    const kdvDahil = kdvHaric + kdvTutar;

    return {
      t,
      kdvHaric,
      kdvTutar,
      kdvDahil,
    };
  }, [tutar, mod, oran]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <Receipt className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">KDV Hesaplama</h2>
            <p className="calc-prose mt-1">
              KDV hariç tutardan KDV dahil toplamı veya KDV dahil tutardan net tutarı hızlıca hesaplayın.
            </p>
          </div>
        </div>

        <div>
          <label className="calc-title block mb-2">Hesaplama Türü</label>
          <div className="flex gap-2">
            {([
              ['hariç', 'KDV Hariç → Dahil'],
              ['dahil', 'KDV Dahil → Hariç'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMod(key)}
                type="button"
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all border ${
                  mod === key
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <label className="calc-title block mb-2">
            {mod === 'hariç' ? 'KDV Hariç Tutar (₺)' : 'KDV Dahil Tutar (₺)'}
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={tutar}
            onChange={(e) => setTutar(e.target.value.replace(/[^0-9.,-]/g, ''))}
            placeholder="0.00"
            className="calc-panel w-full text-lg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="mt-5">
          <label className="calc-title block mb-2">KDV Oranı</label>
          <div className="flex gap-2">
            {ORANLAR.map((o) => (
              <button
                key={o}
                onClick={() => setOran(o)}
                type="button"
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                  oran === o
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
                }`}
              >
                %{o}
              </button>
            ))}
          </div>
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen oran: %{oran}
          </p>
          <p className="calc-prose mt-2">
            Bu araç teklif, fatura, e-ticaret satış fiyatı ve muhasebe ön kontrol işlemlerinde hızlı kullanım için uygundur.
          </p>
        </div>
      </div>

      {hesap && (
        <div className="calc-box">
          <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-4 flex items-center gap-2">
            💰 KDV Hesap Sonucu
          </h3>

          <div className="space-y-3">
            <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
              <span className="calc-muted text-sm">KDV Hariç Tutar</span>
              <span className="font-bold text-[var(--foreground)]">
                {formatSmartNumber(hesap.kdvHaric, 'tr-TR', 2)} ₺
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
              <span className="calc-muted text-sm">KDV Tutarı (%{oran})</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {formatSmartNumber(hesap.kdvTutar, 'tr-TR', 2)} ₺
              </span>
            </div>

            <div className="calc-result rounded-xl p-4 flex justify-between items-center">
              <span className="text-[var(--foreground)] font-bold">KDV Dahil Toplam</span>
              <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                {formatSmartNumber(hesap.kdvDahil, 'tr-TR', 2)} ₺
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2">KDV Oranları</h4>
        <div className="calc-panel rounded-xl p-4 text-sm">
          <p className="calc-prose">
            <strong>%1</strong> — Temel gıda, gazete, dergi <br />
            <strong>%10</strong> — İşlenmiş gıda, konut teslimi, tekstil <br />
            <strong>%20</strong> — Genel oran, diğer mal ve hizmetler
          </p>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">KDV hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç KDV hariç tutardan KDV dahil fiyatı veya KDV dahil tutardan net satış tutarını hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>kdv hesaplama</strong>, <strong>kdv dahil hariç hesaplama</strong>,
              <strong> yüzde 20 kdv</strong>, <strong>fiyat üzerine kdv ekleme</strong>.
            </p>
          </div>
        </div>
      </section>

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Bankanız için reklam verebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}