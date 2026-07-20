'use client';

import { useState } from 'react';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { Zap, Gauge, Sparkles, ArrowRightLeft, Info } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const COMPONENTS: Record<string, { eta: number; label: string }> = {
  'V-kayış': { eta: 0.96, label: 'V-kayış transmisyonu' },
  'Düz dişli': { eta: 0.98, label: 'Silindirik dişli çifti' },
  'Helisel dişli': { eta: 0.985, label: 'Helisel dişli çifti' },
  'Konik dişli': { eta: 0.97, label: 'Konik dişli çifti' },
  'Sonsuz vida': { eta: 0.75, label: 'Sonsuz vida (λ<6°)' },
  Zincir: { eta: 0.97, label: 'Zincir transmisyonu' },
  'Bilyalı rulman': { eta: 0.99, label: 'Bilyalı rulman (çift)' },
  'Makaralı rulman': { eta: 0.988, label: 'Makaralı rulman (çift)' },
  'Hidrolik kavrama': { eta: 0.95, label: 'Hidrolik kavrama' },
  'Diş kavrama': { eta: 0.99, label: 'Diş kavrama' },
};

type Sonuc = {
  eta_total: number;
  P_cikis: number;
  P_kayip: number;
  P_gir: number;
  secili: string[];
};

export default function GucVerimCalculator() {
  const { saveCalculation } = useCalculationHistory();

  const [Pgir, setPgir] = useState('5.5');
  const [secili, setSecili] = useState<string[]>([]);
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);

  const toggle = (key: string) => {
    setSecili((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  const hesapla = () => {
    const P = parseLocalizedNumber(Pgir) || 5.5;
    if (secili.length === 0) return;

    const etaTotalRaw = secili.reduce((acc, key) => acc * COMPONENTS[key].eta, 1);
    const P_cikis = P * etaTotalRaw;
    const P_kayip = P - P_cikis;

    const yeniSonuc: Sonuc = {
      eta_total: +(etaTotalRaw * 100).toFixed(2),
      P_cikis: +P_cikis.toFixed(3),
      P_kayip: +P_kayip.toFixed(3),
      P_gir: P,
      secili,
    };

    setSonuc(yeniSonuc);

    saveCalculation({
      toolSlug: 'guc-verim-hesaplama',
      toolName: 'Güç-Verim Hesaplama',
      category: 'makine',
      inputs: { 'P_gir(kW)': P, Elemanlar: secili.join(', ') },
      outputs: {
        'η_toplam(%)': +(etaTotalRaw * 100).toFixed(2),
        'P_çıkış(kW)': +P_cikis.toFixed(3),
        'P_kayıp(kW)': +P_kayip.toFixed(3),
      },
      summary: `P=${P}kW · η=${(etaTotalRaw * 100).toFixed(1)}% → P_çıkış=${P_cikis.toFixed(2)}kW`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10">
            <ArrowRightLeft className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Güç ve Verim Hesabı</h2>
            <p className="calc-prose mt-1">
              Güç aktarma zincirindeki elemanlara göre toplam verimi, çıkış gücünü ve kayıpları hesaplayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="calc-title">Giriş Gücü P (kW)</label>
              <input
                type="text"
                inputMode="decimal"
                value={Pgir}
                onChange={(e) => setPgir(e.target.value.replace(/[^0-9.,-]/g, ''))}
                className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="calc-title">Güç Aktarma Elemanları</label>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-2">
                {Object.entries(COMPONENTS).map(([key, val]) => {
                  const aktif = secili.includes(key);

                  return (
                    <label
                      key={key}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        aktif
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'calc-soft border-[var(--border)] hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={aktif}
                          onChange={() => toggle(key)}
                          className="accent-blue-600"
                        />
                        <div>
                          <div className="text-sm text-[var(--foreground)] font-medium">{key}</div>
                          <div className="text-xs calc-muted">{val.label}</div>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          val.eta >= 0.98
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        η={val.eta}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="calc-box-accent">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Seçilen her elemanın verimi çarpılarak toplam sistem verimi hesaplanır.
              </p>
              <p className="calc-prose mt-2">
                Özellikle redüktör, transmisyon, kavrama, rulman ve aktarım zincirlerinde güç kaybı tahmini için kullanılır.
              </p>
            </div>

            <button
              onClick={hesapla}
              disabled={secili.length === 0}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              type="button"
            >
              Hesapla
            </button>
          </div>

          {sonuc ? (
            <div className="space-y-3">
              <div className="bg-blue-600 rounded-2xl p-5 text-white text-center shadow-lg">
                <p className="text-sm opacity-80 mb-1">Toplam Verim</p>
                <p className="text-4xl font-bold">%{formatSmartNumber(sonuc.eta_total, 'tr-TR', 2)}</p>
                <p className="text-sm opacity-70 mt-1">{sonuc.secili.length} eleman</p>
              </div>

              {[
                { l: 'Giriş gücü', v: `${formatSmartNumber(sonuc.P_gir, 'tr-TR', 3)} kW`, accent: false },
                { l: 'Çıkış gücü', v: `${formatSmartNumber(sonuc.P_cikis, 'tr-TR', 3)} kW`, accent: true },
                { l: 'Güç kaybı', v: `${formatSmartNumber(sonuc.P_kayip, 'tr-TR', 3)} kW`, accent: false },
              ].map((row) => (
                <div
                  key={row.l}
                  className={row.accent ? 'calc-result rounded-xl p-4 flex justify-between' : 'calc-soft rounded-xl p-4 flex justify-between'}
                >
                  <span className="text-sm calc-muted">{row.l}</span>
                  <span className="font-bold text-[var(--foreground)]">{row.v}</span>
                </div>
              ))}

              <div className="calc-panel rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">Seçilen eleman zinciri</p>
                {sonuc.secili.map((key) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="calc-muted">{key}</span>
                    <span className="font-semibold text-[var(--foreground)]">η={COMPONENTS[key].eta}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center calc-soft rounded-2xl border border-dashed border-[var(--border)] min-h-48">
              <p className="calc-muted text-sm">Eleman seç ve hesapla</p>
            </div>
          )}
        </div>
      </div>

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Verim Hesabı Hakkında
        </h4>

        <ul className="text-sm calc-muted space-y-2">
          <li>• Toplam verim, zincirdeki tüm eleman verimlerinin çarpımı ile bulunur.</li>
          <li>• Küçük kayıplar çoklu elemanlarda toplamda önemli hale gelir.</li>
          <li>• Sonsuz vida gibi elemanlarda kayıp oranı daha yüksek olabilir.</li>
          <li>• Ön hesap için uygundur; gerçek sistem yük, yağlama ve hizalamaya göre değişebilir.</li>
        </ul>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Güç verimi hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, giriş gücü ile seçilen transmisyon elemanlarının verimlerini kullanarak teorik çıkış gücünü ve kayıpları hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>mekanik verim hesabı</strong>, <strong>güç kaybı hesaplama</strong>,
              <strong> transmisyon verimi</strong>, <strong>çıkış gücü hesabı</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Gauge className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="calc-prose">
              Sonuçlar nominal verim değerlerine dayanır. Gerçek uygulamada sıcaklık, yük, montaj kalitesi, rulman durumu ve yağlama koşulları verimi etkiler.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}