'use client';

import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { useState } from 'react';
import { Calculator, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const tuglaTipleri = {
  standart: { ad: 'Standart Tuğla', boyut: '19×9×5 cm', adetM2: 65, harckgM2: 25 },
  yatay: { ad: 'Yatay Delikli', boyut: '19×19×8.5 cm', adetM2: 25, harckgM2: 20 },
  dikey: { ad: 'Dikey Delikli', boyut: '19×19×13.5 cm', adetM2: 25, harckgM2: 18 },
  bims: { ad: 'Bims Blok', boyut: '39×19×18.5 cm', adetM2: 12.5, harckgM2: 15 },
  gazbeton: { ad: 'Gazbeton', boyut: '60×25×20 cm', adetM2: 6.7, harckgM2: 8 },
  briket: { ad: 'Briket', boyut: '39×19×18.5 cm', adetM2: 12.5, harckgM2: 15 },
} as const;

type HesaplamaTipi = 'boyut' | 'alan';

type Sonuc = {
  brutAlan: number;
  netAlan: number;
  tuglaAdet: number;
  harcMiktari: number;
};

export default function TuglaHesaplamaCalculator() {
  const [hesaplamaTipi, setHesaplamaTipi] = useState<HesaplamaTipi>('boyut');
  const [formData, setFormData] = useState({
    tuglaTipi: 'standart',
    uzunluk: '',
    yukseklik: '',
    alan: '',
    kapiPencereAlani: '0',
    fireOrani: '5',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [uyari, setUyari] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setUyari('');
  };

  const hesapla = () => {
    setUyari('');

    const tugla = tuglaTipleri[formData.tuglaTipi as keyof typeof tuglaTipleri];
    const kapiPencere = parseLocalizedNumber(formData.kapiPencereAlani) || 0;
    const fire = parseLocalizedNumber(formData.fireOrani) || 0;

    let brutAlan = 0;

    if (hesaplamaTipi === 'boyut') {
      const uzunluk = parseLocalizedNumber(formData.uzunluk);
      const yukseklik = parseLocalizedNumber(formData.yukseklik);

      if (uzunluk <= 0 || yukseklik <= 0) return;
      brutAlan = uzunluk * yukseklik;
    } else {
      brutAlan = parseLocalizedNumber(formData.alan);
      if (brutAlan <= 0) return;
    }

    const netAlan = brutAlan - kapiPencere;

    if (netAlan <= 0) {
      setSonuc(null);
      setSvgContent('');
      setUyari('Net alan sıfır veya negatif olamaz.');
      return;
    }

    const tuglaAdet = Math.ceil(netAlan * tugla.adetM2 * (1 + fire / 100));
    const harcMiktari = netAlan * tugla.harckgM2;

    setSonuc({
      brutAlan,
      netAlan,
      tuglaAdet,
      harcMiktari,
    });

    setSvgContent(
      generateDrawing({
        type: 'tugla_duvar',
        area: netAlan,
        length: parseLocalizedNumber(formData.uzunluk || '1') || 1,
        result: tuglaAdet,
      })
    );
  };

  const secilenTugla = tuglaTipleri[formData.tuglaTipi as keyof typeof tuglaTipleri];

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="mb-6">
          <label className="calc-title block mb-2">Giriş Yöntemi</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setHesaplamaTipi('boyut')}
              type="button"
              className={`p-3 rounded-xl border-2 font-medium transition-all ${
                hesaplamaTipi === 'boyut'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              Uzunluk × Yükseklik
            </button>

            <button
              onClick={() => setHesaplamaTipi('alan')}
              type="button"
              className={`p-3 rounded-xl border-2 font-medium transition-all ${
                hesaplamaTipi === 'alan'
                  ? 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300'
                  : 'calc-panel border-[var(--border)] text-[var(--foreground)]'
              }`}
            >
              Direkt Alan (m²)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="md:col-span-2">
            <label className="calc-title block mb-2">Tuğla/Blok Tipi</label>
            <select
              name="tuglaTipi"
              value={formData.tuglaTipi}
              onChange={handleChange}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              {Object.entries(tuglaTipleri).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.ad} ({val.boyut}) - {val.adetM2} adet/m²
                </option>
              ))}
            </select>
          </div>

          {hesaplamaTipi === 'boyut' ? (
            <>
              <InputField
                label="Duvar Uzunluğu (m)"
                name="uzunluk"
                value={formData.uzunluk}
                onChange={handleChange}
                placeholder="Örn: 10"
              />
              <InputField
                label="Duvar Yüksekliği (m)"
                name="yukseklik"
                value={formData.yukseklik}
                onChange={handleChange}
                placeholder="Örn: 3"
              />
            </>
          ) : (
            <InputField
              label="Duvar Alanı (m²)"
              name="alan"
              value={formData.alan}
              onChange={handleChange}
              placeholder="Örn: 30"
            />
          )}

          <InputField
            label="Kapı/Pencere Alanı (m²)"
            name="kapiPencereAlani"
            value={formData.kapiPencereAlani}
            onChange={handleChange}
            placeholder="0"
          />

          <div>
            <label className="calc-title block mb-2">Fire Oranı (%)</label>
            <select
              name="fireOrani"
              value={formData.fireOrani}
              onChange={handleChange}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="0">%0 (Fire yok)</option>
              <option value="3">%3</option>
              <option value="5">%5 (Önerilen)</option>
              <option value="10">%10</option>
            </select>
          </div>
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Hesap, net duvar alanı üzerinden tuğla adedi ve yaklaşık harç miktarını verir.
          </p>
          <p className="calc-prose mt-2">
            Fire oranı, kırılma, kesim ve şantiye kayıpları için eklenir. Uygulamada sipariş verirken küçük bir güvenlik payı bırakmak faydalıdır.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Hesapla
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
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            {secilenTugla.ad} Hesabı
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Brüt Duvar Alanı</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.brutAlan, 'tr-TR', 2)} m²
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Net Duvar Alanı</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.netAlan, 'tr-TR', 2)} m²
              </span>
            </div>

            <div className="calc-result rounded-xl p-4 border border-orange-500/30">
              <span className="text-sm calc-muted block mb-1">Gerekli Tuğla/Blok</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {sonuc.tuglaAdet} adet
              </span>
              <span className="text-xs calc-muted block">
                (%{formData.fireOrani} fire dahil)
              </span>
            </div>

            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Harç Miktarı</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.harcMiktari, 'tr-TR', 1)} kg
              </span>
              <span className="text-xs calc-muted block">
                (~{formatSmartNumber(sonuc.harcMiktari / 40, 'tr-TR', 1)} torba)
              </span>
            </div>
          </div>
        </div>
      )}

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="tugla-hesaplama"
        title="Tuğla Duvar Şeması"
      />

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-orange-500" />
          Tuğla/Blok Tipleri
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {Object.entries(tuglaTipleri).map(([key, val]) => (
            <div key={key} className="calc-soft rounded-lg p-3">
              <span className="font-medium text-[var(--foreground)]">{val.ad}</span>
              <span className="calc-muted ml-2">→ {val.adetM2} adet/m²</span>
            </div>
          ))}
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Tuğla hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç duvar alanına göre yaklaşık tuğla veya blok adedini ve harç ihtiyacını hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>tuğla hesaplama</strong>, <strong>duvar için kaç tuğla gider</strong>,
              <strong> bims blok hesabı</strong>, <strong>gazbeton adet hesabı</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/30"
      />
    </div>
  );
}