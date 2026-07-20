'use client';

import { useMemo, useState } from 'react';
import { CreditCard, Sparkles, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type PlanRow = {
  ay: number;
  taksit: number;
  anapara: number;
  faizTutar: number;
  kalan: number;
};

export default function KrediHesaplamaCalculator() {
  const [tutar, setTutar] = useState('');
  const [vade, setVade] = useState('12');
  const [faiz, setFaiz] = useState('3.5');

  const hesap = useMemo(() => {
    const t = parseLocalizedNumber(tutar) || 0;
    const v = parseInt(vade, 10) || 12;
    const f = parseLocalizedNumber(faiz) || 0;
    const aylikFaiz = f / 100;

    if (t <= 0 || v <= 0) return null;

    const taksit =
      aylikFaiz > 0
        ? (t * aylikFaiz * Math.pow(1 + aylikFaiz, v)) / (Math.pow(1 + aylikFaiz, v) - 1)
        : t / v;

    const toplamOdeme = taksit * v;
    const toplamFaiz = toplamOdeme - t;

    const plan: PlanRow[] = [];
    let kalan = t;

    for (let i = 1; i <= v; i++) {
      const ayFaiz = kalan * aylikFaiz;
      const ayAnapara = taksit - ayFaiz;
      kalan -= ayAnapara;

      plan.push({
        ay: i,
        taksit,
        anapara: ayAnapara,
        faizTutar: ayFaiz,
        kalan: Math.max(kalan, 0),
      });
    }

    return {
      tutar: t,
      vade: v,
      faiz: f,
      aylikFaiz,
      taksit,
      toplamOdeme,
      toplamFaiz,
      yillikBasitFaiz: f * 12,
      plan,
    };
  }, [tutar, vade, faiz]);

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10">
            <CreditCard className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Kredi Hesaplama</h2>
            <p className="calc-prose mt-1">
              Kredi tutarı, vade ve aylık faiz oranına göre taksit, toplam ödeme ve ödeme planını hesaplayın.
            </p>
          </div>
        </div>

        <div>
          <label className="calc-title block mb-2">Kredi Tutarı (₺)</label>
          <input
            type="text"
            inputMode="decimal"
            value={tutar}
            onChange={(e) => setTutar(e.target.value.replace(/[^0-9.,-]/g, ''))}
            placeholder="100000"
            className="calc-panel w-full text-lg px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <label className="calc-title block mb-2">Vade (Ay)</label>
            <select
              value={vade}
              onChange={(e) => setVade(e.target.value)}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {[3, 6, 9, 12, 18, 24, 36, 48, 60, 72, 84, 96, 120].map((item) => (
                <option key={item} value={item}>
                  {item} Ay
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="calc-title block mb-2">Aylık Faiz Oranı (%)</label>
            <input
              type="text"
              inputMode="decimal"
              value={faiz}
              onChange={(e) => setFaiz(e.target.value.replace(/[^0-9.,-]/g, ''))}
              placeholder="3.50"
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Hesaplama yöntemi: eşit taksitli anüite modeli
          </p>
          <p className="calc-prose mt-2">
            Bu araç; ihtiyaç kredisi, taşıt kredisi veya genel taksit planı analizlerinde aylık ödeme ve toplam maliyet görmek için uygundur.
          </p>
        </div>
      </div>

      {hesap && (
        <>
          <div className="calc-box">
            <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-4">
              💳 Kredi Hesap Sonucu
            </h3>

            <div className="space-y-3">
              <div className="calc-result rounded-xl p-4 flex justify-between items-center">
                <span className="calc-muted text-sm">Aylık Taksit</span>
                <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                  {formatSmartNumber(hesap.taksit, 'tr-TR', 2)} ₺
                </span>
              </div>

              <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
                <span className="calc-muted text-sm">Toplam Ödeme</span>
                <span className="font-bold text-[var(--foreground)]">
                  {formatSmartNumber(hesap.toplamOdeme, 'tr-TR', 2)} ₺
                </span>
              </div>

              <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
                <span className="calc-muted text-sm">Toplam Faiz</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {formatSmartNumber(hesap.toplamFaiz, 'tr-TR', 2)} ₺
                </span>
              </div>

              <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
                <span className="calc-muted text-sm">Yıllık Faiz Oranı</span>
                <span className="font-bold text-[var(--foreground)]">
                  %{formatSmartNumber(hesap.yillikBasitFaiz, 'tr-TR', 2)}
                </span>
              </div>
            </div>
          </div>

          <div className="calc-box">
            <p className="font-bold text-sm text-[var(--foreground)] mb-3">
              Ödeme Planı{hesap.vade > 12 ? ' (ilk 6 + son ay)' : ''}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {['Ay', 'Taksit', 'Anapara', 'Faiz', 'Kalan Borç'].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-3 calc-muted font-semibold text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(hesap.vade <= 12
                    ? hesap.plan
                    : [...hesap.plan.slice(0, 6), null, hesap.plan[hesap.plan.length - 1]]
                  ).map((row, i) => {
                    if (!row) {
                      return (
                        <tr key={`dots-${i}`} className="border-b border-[var(--border)]">
                          <td colSpan={5} className="text-center py-3 calc-muted">
                            ⋯
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={row.ay} className="border-b border-[var(--border)]">
                        <td className="py-3 px-3 font-mono text-[var(--foreground)]">{row.ay}</td>
                        <td className="py-3 px-3 font-mono text-[var(--foreground)]">
                          {formatSmartNumber(row.taksit, 'tr-TR', 2)} ₺
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                          {formatSmartNumber(row.anapara, 'tr-TR', 2)} ₺
                        </td>
                        <td className="py-3 px-3 font-mono text-amber-600 dark:text-amber-400">
                          {formatSmartNumber(row.faizTutar, 'tr-TR', 2)} ₺
                        </td>
                        <td className="py-3 px-3 font-mono calc-muted">
                          {formatSmartNumber(row.kalan, 'tr-TR', 2)} ₺
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Bu hesaplama aylık faiz oranı ve eşit taksit varsayımıyla yapılır. Banka tahsis ücreti, sigorta, dosya masrafı ve ek vergiler gerçek toplam maliyeti değiştirebilir.
          </p>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Kredi hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, kredi tutarı ve aylık faiz oranını kullanarak aylık taksiti ve toplam geri ödeme tutarını hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>kredi hesaplama</strong>, <strong>aylık taksit hesaplama</strong>,
              <strong> ihtiyaç kredisi hesaplama</strong>, <strong>toplam geri ödeme</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}