'use client';

import { useState } from 'react';
import { Calculator, Info, Gauge, Sparkles } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type HesaplamaTipi = 'hiz' | 'mesafe' | 'zaman';

type Sonuc = {
  deger: number;
  birim: string;
  formul: string;
};

export default function HizHesaplamaCalculator() {
  const [hesaplamaTipi, setHesaplamaTipi] = useState<HesaplamaTipi>('hiz');
  const [formData, setFormData] = useState({
    hiz: '',
    mesafe: '',
    zaman: '',
    hizBirim: 'km/h',
    mesafeBirim: 'km',
    zamanBirim: 'saat',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);

  const hizCarpan: Record<string, number> = {
    'm/s': 1,
    'km/h': 0.277778,
    mph: 0.44704,
    knot: 0.514444,
  };

  const mesafeCarpan: Record<string, number> = {
    m: 1,
    km: 1000,
    mi: 1609.34,
    ft: 0.3048,
  };

  const zamanCarpan: Record<string, number> = {
    s: 1,
    dk: 60,
    saat: 3600,
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const hesapla = () => {
    const v = parseLocalizedNumber(formData.hiz) * hizCarpan[formData.hizBirim];
    const s = parseLocalizedNumber(formData.mesafe) * mesafeCarpan[formData.mesafeBirim];
    const t = parseLocalizedNumber(formData.zaman) * zamanCarpan[formData.zamanBirim];

    let sonucDeger: number;
    let birim: string;
    let formul: string;

    switch (hesaplamaTipi) {
      case 'hiz':
        if (Number.isNaN(s) || Number.isNaN(t) || t === 0) return;
        sonucDeger = s / t;
        birim = 'm/s';
        formul = `v = s / t = ${formData.mesafe} ${formData.mesafeBirim} / ${formData.zaman} ${formData.zamanBirim}`;
        break;

      case 'mesafe':
        if (Number.isNaN(v) || Number.isNaN(t)) return;
        sonucDeger = v * t;
        birim = 'm';
        formul = `s = v × t = ${formData.hiz} ${formData.hizBirim} × ${formData.zaman} ${formData.zamanBirim}`;
        break;

      case 'zaman':
        if (Number.isNaN(s) || Number.isNaN(v) || v === 0) return;
        sonucDeger = s / v;
        birim = 's';
        formul = `t = s / v = ${formData.mesafe} ${formData.mesafeBirim} / ${formData.hiz} ${formData.hizBirim}`;
        break;

      default:
        return;
    }

    setSonuc({ deger: sonucDeger, birim, formul });
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10">
            <Gauge className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Hız Hesaplama</h2>
            <p className="calc-prose mt-1">
              Hız, mesafe ve zaman arasında dönüşümlü hesap yapın.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="calc-title">Ne Hesaplanacak?</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { value: 'hiz', label: 'Hız (v)' },
              { value: 'mesafe', label: 'Mesafe (s)' },
              { value: 'zaman', label: 'Zaman (t)' },
            ].map((tip) => (
              <button
                key={tip.value}
                onClick={() => {
                  setHesaplamaTipi(tip.value as HesaplamaTipi);
                  setSonuc(null);
                }}
                type="button"
                className={`p-3 rounded-xl border-2 font-medium transition-all ${
                  hesaplamaTipi === tip.value
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600'
                    : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
                }`}
              >
                {tip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {hesaplamaTipi !== 'hiz' && (
            <div>
              <label className="calc-title">Hız</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  inputMode="decimal"
                  name="hiz"
                  value={formData.hiz}
                  onChange={handleChange}
                  placeholder="Örn: 90"
                  className="calc-panel flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
                <select
                  name="hizBirim"
                  value={formData.hizBirim}
                  onChange={handleChange}
                  className="calc-panel w-24 px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="km/h">km/h</option>
                  <option value="m/s">m/s</option>
                  <option value="mph">mph</option>
                  <option value="knot">knot</option>
                </select>
              </div>
            </div>
          )}

          {hesaplamaTipi !== 'mesafe' && (
            <div>
              <label className="calc-title">Mesafe</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  inputMode="decimal"
                  name="mesafe"
                  value={formData.mesafe}
                  onChange={handleChange}
                  placeholder="Örn: 100"
                  className="calc-panel flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
                <select
                  name="mesafeBirim"
                  value={formData.mesafeBirim}
                  onChange={handleChange}
                  className="calc-panel w-24 px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="km">km</option>
                  <option value="m">m</option>
                  <option value="mi">mil</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>
          )}

          {hesaplamaTipi !== 'zaman' && (
            <div>
              <label className="calc-title">Zaman</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  inputMode="decimal"
                  name="zaman"
                  value={formData.zaman}
                  onChange={handleChange}
                  placeholder="Örn: 1"
                  className="calc-panel flex-1 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                />
                <select
                  name="zamanBirim"
                  value={formData.zamanBirim}
                  onChange={handleChange}
                  className="calc-panel w-24 px-3 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="saat">saat</option>
                  <option value="dk">dakika</option>
                  <option value="s">saniye</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Temel ilişki: hız = mesafe / zaman
          </p>
          <p className="calc-prose mt-2">
            Bu araç; araç hızı, yol süresi, yürüyüş mesafesi, makine ilerleme hızı ve temel fizik hesapları için uygundur.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Hesapla
          </span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-500" />
            Sonuç
          </h3>

          <div className="calc-result rounded-2xl p-6 text-center">
            <span className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
              {sonuc.deger.toFixed(4).replace(/\.?0+$/, '')}
            </span>
            <span className="text-xl calc-muted ml-2">{sonuc.birim}</span>
            <p className="calc-muted mt-2 text-sm">{sonuc.formul}</p>
          </div>

          {hesaplamaTipi === 'hiz' && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <MiniCard label="km/h" value={(sonuc.deger * 3.6).toFixed(2)} />
              <MiniCard label="mph" value={(sonuc.deger * 2.237).toFixed(2)} />
              <MiniCard label="knot" value={(sonuc.deger * 1.944).toFixed(2)} />
              <MiniCard label="ft/s" value={(sonuc.deger * 3.281).toFixed(2)} />
            </div>
          )}

          {hesaplamaTipi === 'zaman' && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniCard label="saniye" value={sonuc.deger.toFixed(1)} />
              <MiniCard label="dakika" value={(sonuc.deger / 60).toFixed(2)} />
              <MiniCard label="saat" value={(sonuc.deger / 3600).toFixed(3)} />
            </div>
          )}
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-500" />
          Hız Formülü
        </h4>

        <div className="calc-soft rounded-lg p-4 text-center mb-3">
          <span className="text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400">
            v = s / t
          </span>
        </div>

        <ul className="text-sm calc-muted space-y-2">
          <li>• 1 km/h = 0.278 m/s = 0.621 mph</li>
          <li>• 1 m/s = 3.6 km/h = 2.237 mph</li>
          <li>• 1 knot = 1.852 km/h</li>
        </ul>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Hız hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç hız, mesafe ve zaman arasındaki temel fiziksel ilişkiyi kullanarak eksik değeri hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>hız hesaplama</strong>, <strong>mesafe zaman hesaplama</strong>,
              <strong> km saat m/s dönüşümü</strong>, <strong>yol süre hesabı</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="calc-soft rounded-lg p-3 text-center text-sm">
      <span className="calc-muted">{label}:</span>
      <span className="font-medium text-[var(--foreground)] ml-2">{value}</span>
    </div>
  );
}