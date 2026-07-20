'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Calculator,
  Info,
  Package,
  Droplets,
  Mountain,
  Layers,
  Ruler,
  Construction,
  Sparkles,
} from 'lucide-react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const KARISIM_ORANLARI: Record<
  string,
  { cimento: number; kum: number; cakil: number; su: number; renk: string }
> = {
  C16: { cimento: 250, kum: 700, cakil: 1150, su: 175, renk: 'border-slate-300 text-slate-600' },
  C20: { cimento: 300, kum: 650, cakil: 1150, su: 180, renk: 'border-blue-300 text-blue-600' },
  C25: { cimento: 350, kum: 600, cakil: 1150, su: 175, renk: 'border-emerald-300 text-emerald-600' },
  C30: { cimento: 400, kum: 550, cakil: 1150, su: 170, renk: 'border-orange-300 text-orange-600' },
  C35: { cimento: 450, kum: 500, cakil: 1150, su: 165, renk: 'border-rose-300 text-rose-600' },
};

export default function BetonHesaplamaCalculator() {
  const { saveCalculation } = useCalculationHistory();

  const [formData, setFormData] = useState({
    uzunluk: '',
    genislik: '',
    yukseklik: '',
    betonSinifi: 'C25',
    fireOrani: '10',
  });

  const [svgContent, setSvgContent] = useState<string>('');
  const [hesaplandi, setHesaplandi] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setHesaplandi(false);
  };

  const sonuc = useMemo(() => {
    const L = parseLocalizedNumber(formData.uzunluk);
    const W = parseLocalizedNumber(formData.genislik);
    const H = parseLocalizedNumber(formData.yukseklik);
    const fireYuzde = parseLocalizedNumber(formData.fireOrani);

    if (
      Number.isNaN(L) ||
      Number.isNaN(W) ||
      Number.isNaN(H) ||
      Number.isNaN(fireYuzde) ||
      L <= 0 ||
      W <= 0 ||
      H <= 0 ||
      fireYuzde < 0
    ) {
      return null;
    }

    const fire = 1 + fireYuzde / 100;
    const netHacim = L * W * H;
    const brutHacim = netHacim * fire;
    const oranlar = KARISIM_ORANLARI[formData.betonSinifi];

    return {
      netHacim,
      brutHacim,
      cimento: brutHacim * oranlar.cimento,
      kum: brutHacim * oranlar.kum,
      cakil: brutHacim * oranlar.cakil,
      su: brutHacim * oranlar.su,
      torbaSayisi: (brutHacim * oranlar.cimento) / 50,
    };
  }, [formData]);

  const handleHesapla = () => {
    if (!sonuc) return;

    setHesaplandi(true);

    setSvgContent(
      generateDrawing({
        type: 'beton_plak_hacim',
        length: parseLocalizedNumber(formData.uzunluk),
        width: parseLocalizedNumber(formData.genislik),
        height: parseLocalizedNumber(formData.yukseklik),
      })
    );

    saveCalculation({
      toolSlug: 'beton-miktari-hesaplama',
      toolName: 'Beton Miktarı Hesaplama',
      category: 'insaat',
      inputs: formData,
      outputs: { Hacim: sonuc.brutHacim.toFixed(2) },
      summary: `${formData.uzunluk}x${formData.genislik}x${formData.yukseklik} m - ${formData.betonSinifi}`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Giriş Kartı */}
      <div className="calc-box p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-[var(--border)] pb-5">
          <div className="p-3 rounded-2xl bg-orange-500/10">
            <Construction className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Boyut ve Malzeme Ayarları</h2>
            <p className="text-sm calc-muted font-medium">Proje detaylarını giriniz</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <InputField
            label="Uzunluk (m)"
            name="uzunluk"
            value={formData.uzunluk}
            onChange={handleChange}
            placeholder="0.00"
            icon={<Ruler className="w-4 h-4" />}
          />

          <InputField
            label="Genişlik (m)"
            name="genislik"
            value={formData.genislik}
            onChange={handleChange}
            placeholder="0.00"
            icon={<Ruler className="w-4 h-4 rotate-90" />}
          />

          <InputField
            label="Kalınlık (m)"
            name="yukseklik"
            value={formData.yukseklik}
            onChange={handleChange}
            placeholder="0.15"
            icon={<Layers className="w-4 h-4" />}
          />

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold calc-title">Beton Dayanım Sınıfı</label>
            <select
              name="betonSinifi"
              value={formData.betonSinifi}
              onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl calc-panel appearance-none cursor-pointer outline-none font-semibold text-[var(--foreground)] focus:ring-2 focus:ring-orange-500/30"
              aria-label="Beton sınıfı"
            >
              {Object.keys(KARISIM_ORANLARI).map((sinif) => (
                <option key={sinif} value={sinif}>
                  {sinif} Sınıfı Hazır Beton
                </option>
              ))}
            </select>
          </div>

          <InputField
            label="Emniyet Payı (Fire %)"
            name="fireOrani"
            value={formData.fireOrani}
            onChange={handleChange}
            placeholder="10"
          />
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Beton döküm hacmi, ölçülerin çarpımı ve fire oranı eklenerek hesaplanır.
          </p>
          <p className="calc-prose mt-2">
            Özellikle temel, saha betonu, plak, döşeme ve küçük şantiye projelerinde hızlı beton miktarı
            tahmini için uygundur.
          </p>
        </div>

        <button
          onClick={handleHesapla}
          className="w-full py-4 bg-gradient-to-r from-slate-900 to-orange-600 hover:from-slate-800 hover:to-orange-500 text-white rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          type="button"
        >
          <Calculator className="w-6 h-6" />
          Hesapla
        </button>
      </div>

      {/* Sonuç Alanı */}
      {hesaplandi && sonuc && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="calc-box relative overflow-hidden group p-8">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                <Construction size={120} />
              </div>

              <p className="calc-muted font-bold uppercase tracking-widest text-xs mb-2">Toplam Brüt Hacim</p>

              <div className="flex items-baseline gap-2 mb-8 flex-wrap">
                <h3 className="text-5xl md:text-6xl font-black text-[var(--foreground)] tracking-tight">
                  {formatSmartNumber(sonuc.brutHacim, 'tr-TR', 2)}
                </h3>
                <span className="text-2xl font-bold calc-muted">m³</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ResultItem
                  icon={<Package className="text-orange-500" />}
                  label="Çimento"
                  value={`${formatSmartNumber(sonuc.cimento, 'tr-TR', 0)} kg`}
                  subValue={`${formatSmartNumber(sonuc.torbaSayisi, 'tr-TR', 1)} Torba (50 kg)`}
                />

                <ResultItem
                  icon={<Droplets className="text-blue-500" />}
                  label="Su İhtiyacı"
                  value={`${formatSmartNumber(sonuc.su, 'tr-TR', 0)} Litre`}
                  subValue="Temiz şebeke suyu"
                />

                <ResultItem
                  icon={<Mountain className="text-amber-600" />}
                  label="Kum (İnce)"
                  value={`${formatSmartNumber(sonuc.kum, 'tr-TR', 0)} kg`}
                  subValue={`${formatSmartNumber(sonuc.kum / 1600, 'tr-TR', 2)} m³`}
                />

                <ResultItem
                  icon={<Mountain className="text-slate-500" />}
                  label="Çakıl (Agrega)"
                  value={`${formatSmartNumber(sonuc.cakil, 'tr-TR', 0)} kg`}
                  subValue={`${formatSmartNumber(sonuc.cakil / 1700, 'tr-TR', 2)} m³`}
                />
              </div>
            </div>

            <TeknikCizimPanel
              svgContent={svgContent}
              filename="beton"
              title="Teknik Kesit Görünümü"
            />
          </div>

          <div className="space-y-6">
            <div
              className={`calc-panel p-6 rounded-3xl border-2 ${KARISIM_ORANLARI[formData.betonSinifi].renk}`}
            >
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Info size={18} />
                Beton Sınıfı Detayı
              </h4>
              <p className="text-sm leading-relaxed opacity-80">
                Seçilen <strong>{formData.betonSinifi}</strong> sınıfı beton, santral şartlarında hazırlanan
                standart miks tasarımdır. Saha tipi dökümlerde su/çimento oranına dikkat edilmelidir.
              </p>
            </div>

            <div className="calc-soft p-6 rounded-3xl border border-[var(--border)]">
              <h4 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                <Construction size={16} />
                Şantiye Notları
              </h4>

              <ul className="space-y-4">
                <li className="flex gap-3 text-sm calc-muted">
                  <div className="w-5 h-5 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[10px] font-bold text-[var(--foreground)]">
                    1
                  </div>
                  Hacim döküm sırasında genişleme, kalıp esnemesi veya seviye farkı nedeniyle artabilir.
                </li>

                <li className="flex gap-3 text-sm calc-muted">
                  <div className="w-5 h-5 rounded-full bg-[var(--background)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[10px] font-bold text-[var(--foreground)]">
                    2
                  </div>
                  Pompalı dökümlerde mikser içinde kalan yaklaşık 0.25 m³ pay ayrıca kontrol edilmelidir.
                </li>
              </ul>
            </div>

            <div className="calc-box-accent">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Net hacim: {formatSmartNumber(sonuc.netHacim, 'tr-TR', 2)} m³
              </p>
              <p className="calc-prose mt-2">
                Fire dahil toplam beton ihtiyacı: {formatSmartNumber(sonuc.brutHacim, 'tr-TR', 2)} m³
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Beton miktarı nasıl hesaplanır?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Beton hacmi temel olarak <strong>uzunluk × genişlik × kalınlık</strong> formülüyle bulunur.
              Daha sonra fire oranı eklenerek brüt ihtiyaç hesaplanır.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>beton miktarı hesaplama</strong>, <strong>1 m3 beton için ne kadar çimento</strong>,
              <strong> temel betonu hesabı</strong>, <strong>şap ve plak beton hacmi</strong>.
            </p>
          </div>
        </div>

        <div className="calc-soft rounded-xl p-4">
          <h4 className="font-bold text-[var(--foreground)] mb-2">Örnek kullanım</h4>
          <ul className="space-y-2 calc-prose">
            <li>5 m × 4 m × 0,15 m döşeme için net hacim 3,00 m³ olur.</li>
            <li>%10 fire ile brüt ihtiyaç 3,30 m³ seviyesine çıkar.</li>
            <li>Seçilen beton sınıfına göre çimento, su, kum ve agrega ihtiyacı otomatik hesaplanır.</li>
          </ul>
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
  icon?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold calc-title flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-12 px-4 rounded-xl calc-panel outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all"
        placeholder={placeholder}
      />
    </div>
  );
}

function ResultItem({
  icon,
  label,
  value,
  subValue,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  subValue: string;
}) {
  return (
    <div className="p-4 rounded-2xl calc-soft flex items-start gap-4 hover:shadow-md transition-all">
      <div className="p-2 bg-[var(--background)] rounded-xl shadow-sm border border-[var(--border)]">{icon}</div>
      <div>
        <p className="text-[10px] font-bold calc-muted uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-[var(--foreground)]">{value}</p>
        <p className="text-[11px] font-medium calc-muted mt-0.5">{subValue}</p>
      </div>
    </div>
  );
}