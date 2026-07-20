'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Info, Lightbulb, AlertTriangle, Sparkles } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type LedKey =
  | 'kirmizi'
  | 'yesil'
  | 'sari'
  | 'turuncu'
  | 'mavi'
  | 'beyaz'
  | 'mor'
  | 'kizilotesi'
  | 'ozel';

const ledTipleri: Record<
  LedKey,
  { ad: string; vf: number; renk: string }
> = {
  kirmizi: { ad: 'Kırmızı', vf: 2.0, renk: 'bg-red-500' },
  yesil: { ad: 'Yeşil', vf: 2.1, renk: 'bg-green-500' },
  sari: { ad: 'Sarı', vf: 2.1, renk: 'bg-yellow-400' },
  turuncu: { ad: 'Turuncu', vf: 2.0, renk: 'bg-orange-500' },
  mavi: { ad: 'Mavi', vf: 3.2, renk: 'bg-blue-500' },
  beyaz: { ad: 'Beyaz', vf: 3.2, renk: 'bg-white border' },
  mor: { ad: 'Mor/UV', vf: 3.4, renk: 'bg-purple-500' },
  kizilotesi: { ad: 'Kızılötesi (IR)', vf: 1.5, renk: 'bg-red-900' },
  ozel: { ad: 'Özel Değer', vf: 0, renk: 'bg-gray-400' },
};

const e24Serisi = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0,
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1,
] as const;

type Sonuc = {
  direnc: number;
  standartDirenc: number;
  guc: number;
  gercekAkim: number;
};

export default function LedDirencCalculator() {
  const [formData, setFormData] = useState({
    kaynakGerilim: '12',
    ledTipi: 'kirmizi' as LedKey,
    ledGerilim: '',
    ledAkim: '20',
    ledAdet: '1',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [uyari, setUyari] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setUyari('');
  };

  const enYakinStandartDirenc = (deger: number): number => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(deger)));
    const normalized = deger / magnitude;
  
    let enYakin: number = e24Serisi[0];
    let minFark = Math.abs(normalized - e24Serisi[0]);
  
    for (const e24 of e24Serisi) {
      const fark = Math.abs(normalized - e24);
      if (fark < minFark) {
        minFark = fark;
        enYakin = e24;
      }
    }
  
    const sonucDegeri = enYakin * magnitude;
  
    if (sonucDegeri < deger) {
      const index = e24Serisi.indexOf(enYakin as (typeof e24Serisi)[number]);
      if (index < e24Serisi.length - 1) {
        return e24Serisi[index + 1] * magnitude;
      }
      return e24Serisi[0] * magnitude * 10;
    }
  
    return sonucDegeri;
  };

  const hesapla = () => {
    setUyari('');

    const Vs = parseLocalizedNumber(formData.kaynakGerilim);
    const Vf =
      formData.ledTipi === 'ozel'
        ? parseLocalizedNumber(formData.ledGerilim)
        : ledTipleri[formData.ledTipi].vf;
    const If = (parseLocalizedNumber(formData.ledAkim) || 0) / 1000;
    const adet = parseInt(formData.ledAdet, 10);

    if (Number.isNaN(Vs) || Number.isNaN(Vf) || Number.isNaN(If) || Number.isNaN(adet) || If <= 0 || adet <= 0) {
      setSonuc(null);
      setSvgContent('');
      setUyari('Lütfen tüm alanlara geçerli değer girin.');
      return;
    }

    const toplamVf = Vf * adet;

    if (toplamVf >= Vs) {
      setSonuc(null);
      setSvgContent('');
      setUyari('Kaynak gerilimi, seri bağlı LED toplam geriliminden büyük olmalıdır.');
      return;
    }

    const direnc = (Vs - toplamVf) / If;
    const standartDirenc = enYakinStandartDirenc(direnc);
    const guc = If * If * standartDirenc;
    const gercekAkim = ((Vs - toplamVf) / standartDirenc) * 1000;

    setSonuc({
      direnc,
      standartDirenc,
      guc,
      gercekAkim,
    });

    setSvgContent(
      generateDrawing({
        type: 'led_direnc',
        voltage: Vs,
        result: Vf,
        current: If,
        resistance: direnc,
      })
    );
  };

  const secilenLed = ledTipleri[formData.ledTipi];
  const minDirencGucu =
    sonuc && sonuc.guc < 0.25 ? '1/4W' : sonuc && sonuc.guc < 0.5 ? '1/2W' : '1W';

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="calc-title block mb-2">Kaynak Gerilimi (V)</label>
            <select
              name="kaynakGerilim"
              value={formData.kaynakGerilim}
              onChange={handleChange}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              <option value="3.3">3.3V</option>
              <option value="5">5V (USB)</option>
              <option value="9">9V (Pil)</option>
              <option value="12">12V</option>
              <option value="24">24V</option>
            </select>
          </div>

          <div>
            <label className="calc-title block mb-2">LED Rengi / Tipi</label>
            <select
              name="ledTipi"
              value={formData.ledTipi}
              onChange={handleChange}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {Object.entries(ledTipleri).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} {val.vf > 0 ? `(~${val.vf}V)` : ''}
                </option>
              ))}
            </select>
          </div>

          {formData.ledTipi === 'ozel' && (
            <div>
              <label className="calc-title block mb-2">LED İleri Gerilimi (V)</label>
              <input
                type="text"
                inputMode="decimal"
                name="ledGerilim"
                value={formData.ledGerilim}
                onChange={handleChange}
                placeholder="Örn: 2.0"
                className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
          )}

          <div>
            <label className="calc-title block mb-2">LED Akımı (mA)</label>
            <input
              type="text"
              inputMode="decimal"
              name="ledAkim"
              value={formData.ledAkim}
              onChange={handleChange}
              placeholder="Örn: 20"
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <span className="text-xs calc-muted block mt-2">
              Standart LED: 20mA, high-power LED: 350mA+
            </span>
          </div>

          <div>
            <label className="calc-title block mb-2">Seri LED Adedi</label>
            <input
              type="text"
              inputMode="numeric"
              name="ledAdet"
              value={formData.ledAdet}
              onChange={handleChange}
              placeholder="1"
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen LED: {secilenLed.ad}
          </p>
          <p className="calc-prose mt-2">
            Bu araç, seri LED bağlantısında uygun direnç değerini, E24 standart direnç karşılığını ve direnç gücünü hesaplar.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Direnç Hesapla
          </span>
        </button>
      </div>

      {uyari && (
        <div className="calc-warn rounded-xl p-4 flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{uyari}</span>
        </div>
      )}

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Hesaplama Sonucu
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Hesaplanan Direnç</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.direnc, 'tr-TR', 1)} Ω
              </span>
            </div>

            <div className="calc-result rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Standart Direnç (E24)</span>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatSmartNumber(sonuc.standartDirenc, 'tr-TR', 0)} Ω
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Direnç Gücü</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.guc * 1000, 'tr-TR', 1)} mW
              </span>
              <span className="text-xs calc-muted block mt-1">
                Min. {minDirencGucu} direnç kullanın
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Gerçek Akım</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.gercekAkim, 'tr-TR', 2)} mA
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500" />
          LED Direnç Formülü
        </h4>

        <div className="calc-panel rounded-lg p-3 text-center mb-3">
          <span className="text-lg font-mono font-bold text-amber-600 dark:text-amber-400">
            R = (Vs - Vf) / If
          </span>
        </div>

        <ul className="text-sm calc-muted space-y-1">
          <li>• Vs: Kaynak gerilimi</li>
          <li>• Vf: LED ileri gerilimi</li>
          <li>• If: LED akımı</li>
        </ul>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">LED direnç hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç, LED’in çalışma akımını güvenli seviyede tutmak için gerekli seri direnç değerini hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>led direnç hesaplama</strong>, <strong>seri led direnci</strong>,
              <strong> 12v led direnç hesabı</strong>, <strong>e24 standart direnç seçimi</strong>.
            </p>
          </div>
        </div>
      </section>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="led-direnc"
        title="LED Direnç Devresi"
      />
    </div>
  );
}