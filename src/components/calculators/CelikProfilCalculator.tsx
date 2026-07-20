'use client';

import { useMemo, useState } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Info, Sparkles, Boxes, Ruler, Hash } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

// Çelik profil ağırlıkları (kg/m)
const profilVerileri: Record<string, Record<string, number>> = {
  IPE: {
    '80': 6.0,
    '100': 8.1,
    '120': 10.4,
    '140': 12.9,
    '160': 15.8,
    '180': 18.8,
    '200': 22.4,
    '220': 26.2,
    '240': 30.7,
    '270': 36.1,
    '300': 42.2,
    '330': 49.1,
    '360': 57.1,
    '400': 66.3,
    '450': 77.6,
    '500': 90.7,
    '550': 106.0,
    '600': 122.0,
  },
  HEA: {
    '100': 16.7,
    '120': 19.9,
    '140': 24.7,
    '160': 30.4,
    '180': 35.5,
    '200': 42.3,
    '220': 50.5,
    '240': 60.3,
    '260': 68.2,
    '280': 76.4,
    '300': 88.3,
    '320': 97.6,
    '340': 105.0,
    '360': 112.0,
    '400': 125.0,
    '450': 140.0,
    '500': 155.0,
    '550': 166.0,
    '600': 178.0,
  },
  HEB: {
    '100': 20.4,
    '120': 26.7,
    '140': 33.7,
    '160': 42.6,
    '180': 51.2,
    '200': 61.3,
    '220': 71.5,
    '240': 83.2,
    '260': 93.0,
    '280': 103.0,
    '300': 117.0,
    '320': 127.0,
    '340': 134.0,
    '360': 142.0,
    '400': 155.0,
    '450': 171.0,
    '500': 187.0,
    '550': 199.0,
    '600': 212.0,
  },
  UNP: {
    '50': 5.59,
    '65': 7.09,
    '80': 8.64,
    '100': 10.6,
    '120': 13.4,
    '140': 16.0,
    '160': 18.8,
    '180': 22.0,
    '200': 25.3,
    '220': 29.4,
    '240': 33.2,
    '260': 37.9,
    '280': 41.8,
    '300': 46.2,
  },
  'L (Eşit)': {
    '20x3': 0.88,
    '25x3': 1.12,
    '30x3': 1.36,
    '30x4': 1.78,
    '40x4': 2.42,
    '40x5': 2.97,
    '50x5': 3.77,
    '50x6': 4.47,
    '60x6': 5.42,
    '60x8': 7.09,
    '70x7': 7.38,
    '80x8': 9.63,
    '90x9': 12.2,
    '100x10': 15.0,
    '120x12': 21.6,
    '150x15': 33.8,
  },
};

export default function CelikProfilCalculator() {
  const [formData, setFormData] = useState({
    profilTipi: 'IPE',
    profilBoyut: '200',
    uzunluk: '',
    adet: '1',
  });

  const [sonuc, setSonuc] = useState<{
    birimAgirlik: number;
    tekParcaAgirlik: number;
    toplamAgirlik: number;
  } | null>(null);
  const [svgContent, setSvgContent] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'profilTipi') {
      const yeniBoyutlar = Object.keys(profilVerileri[value]);
      setFormData((prev) => ({
        ...prev,
        profilTipi: value,
        profilBoyut: yeniBoyutlar[0],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const mevcutBoyutlar = useMemo(
    () => Object.keys(profilVerileri[formData.profilTipi]),
    [formData.profilTipi]
  );

  const hesapla = () => {
    const uzunluk = parseLocalizedNumber(formData.uzunluk);
    const adet = parseInt(formData.adet, 10);

    if (Number.isNaN(uzunluk) || uzunluk <= 0 || Number.isNaN(adet) || adet <= 0) {
      return;
    }

    const birimAgirlik = profilVerileri[formData.profilTipi][formData.profilBoyut];
    const tekParcaAgirlik = birimAgirlik * uzunluk;
    const toplamAgirlik = tekParcaAgirlik * adet;

    setSonuc({
      birimAgirlik,
      tekParcaAgirlik,
      toplamAgirlik,
    });

    setSvgContent(
      generateDrawing({
        type: 'celik_profil_agirlik',
        label: formData.profilTipi,
        thickness: birimAgirlik,
        length: uzunluk || 6,
        count: adet || 1,
        result: toplamAgirlik,
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10">
            <Boxes className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Çelik Profil Ağırlık Hesaplama</h2>
            <p className="calc-prose mt-1">
              IPE, HEA, HEB, UNP ve eşit köşebent profiller için birim, tek parça ve toplam ağırlığı hesaplayın.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="calc-title">Profil Tipi</label>
            <select
              name="profilTipi"
              value={formData.profilTipi}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {Object.keys(profilVerileri).map((tip) => (
                <option key={tip} value={tip}>
                  {tip}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="calc-title">Profil Boyutu</label>
            <select
              name="profilBoyut"
              value={formData.profilBoyut}
              onChange={handleChange}
              className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {mevcutBoyutlar.map((boyut) => (
                <option key={boyut} value={boyut}>
                  {formData.profilTipi} {boyut}
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Uzunluk (m)"
            name="uzunluk"
            value={formData.uzunluk}
            onChange={handleChange}
            placeholder="Örn: 6"
            icon={<Ruler className="w-4 h-4" />}
          />

          <InputField
            label="Adet"
            name="adet"
            value={formData.adet}
            onChange={handleChange}
            placeholder="1"
            icon={<Hash className="w-4 h-4" />}
          />
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen profil: {formData.profilTipi} {formData.profilBoyut}
          </p>
          <p className="calc-prose mt-2">
            Bu araç standart profil tablolarındaki <strong>kg/m</strong> değerlerini baz alarak toplam ağırlık hesabı yapar.
            Özellikle teklif, sevkiyat, satın alma ve kaba metraj işlerinde hızlı kontrol sağlar.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg active:scale-[0.98]"
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
            <Calculator className="w-5 h-5 text-blue-500" />
            {formData.profilTipi} {formData.profilBoyut} Profil Ağırlığı
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard
              title="Birim Ağırlık"
              value={`${formatSmartNumber(sonuc.birimAgirlik, 'tr-TR', 2)} kg/m`}
            />

            <ResultCard
              title={`Tek Parça (${formData.uzunluk || '0'} m)`}
              value={`${formatSmartNumber(sonuc.tekParcaAgirlik, 'tr-TR', 2)} kg`}
            />

            <ResultCard
              title={`Toplam (${formData.adet || '0'} adet)`}
              value={`${formatSmartNumber(sonuc.toplamAgirlik, 'tr-TR', 2)} kg`}
              accent
              subValue={`${formatSmartNumber(sonuc.toplamAgirlik / 1000, 'tr-TR', 3)} ton`}
            />
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          Çelik Profil Tipleri
        </h4>

        <div className="grid md:grid-cols-2 gap-3">
          <InfoItem
            title="IPE"
            text="Avrupa standardı I profildir. Kiriş ve taşıyıcı sistemlerde sık kullanılır."
          />
          <InfoItem
            title="HEA / HEB"
            text="Geniş flanşlı profillerdir. Kolon ve ağır taşıyıcı uygulamalarda tercih edilir."
          />
          <InfoItem
            title="UNP"
            text="U profil formundadır. Çerçeve, destek ve bağlantı uygulamalarında kullanılır."
          />
          <InfoItem
            title="L (Eşit)"
            text="Eşit kollu köşebenttir. Destek, bağlantı ve yardımcı elemanlarda yaygındır."
          />
        </div>
      </div>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="celik-profil"
        title="Çelik Profil Kesit Görseli"
      />

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Çelik profil ağırlığı nasıl hesaplanır?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Çelik profil ağırlık hesabında temel mantık, profilin tabloda verilen <strong>birim metre ağırlığını</strong>,
              profil uzunluğu ve adet ile çarpmaktır.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>ipe profil ağırlık hesaplama</strong>, <strong>hea heb kg/m</strong>,
              <strong> unp profil ağırlığı</strong>, <strong>köşebent ağırlık tablosu</strong>.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Sonuçlar standart profil tablolarına göre yaklaşık ağırlık verir. Nihai satın alma ve üretim kararlarında
            üretici katalogları ve proje kesit listeleri ayrıca kontrol edilmelidir.
          </p>
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
  icon,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="calc-title flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}

function ResultCard({
  title,
  value,
  subValue,
  accent = false,
}: {
  title: string;
  value: string;
  subValue?: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}>
      <span className="text-sm calc-muted block mb-1">{title}</span>
      <span className={`block ${accent ? 'text-2xl text-blue-600 dark:text-blue-400' : 'text-xl'} font-bold text-[var(--foreground)]`}>
        {value}
      </span>
      {subValue && <span className="text-xs calc-muted block mt-1">{subValue}</span>}
    </div>
  );
}

function InfoItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="calc-soft rounded-xl p-4">
      <p className="font-semibold text-[var(--foreground)] mb-1">{title}</p>
      <p className="calc-prose">{text}</p>
    </div>
  );
}