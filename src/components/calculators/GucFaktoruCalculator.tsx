'use client';

import { useState } from 'react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { Calculator, Info, Gauge, Sparkles } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Connection = 'single' | 'star' | 'delta';

type Sonuc = {
  mevcutReaktif: number;
  hedefReaktif: number;
  fazKapasitesi: number;
  kondansatorKVAR: number;
  mevcutGorunurGuc: number;
  hedefGorunurGuc: number;
  gorunurGucAzalmasi: number;
  connection: Connection;
};

export default function GucFaktoruCalculator() {
  const [formData, setFormData] = useState({
    aktifGuc: '',
    mevcutPF: '0.75',
    hedefPF: '0.95',
    frekans: '50',
    gerilim: '400',
    connection: 'delta' as Connection,
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hesapla = () => {
    const P = parseLocalizedNumber(formData.aktifGuc);
    const PF1 = parseLocalizedNumber(formData.mevcutPF);
    const PF2 = parseLocalizedNumber(formData.hedefPF);
    const f = parseLocalizedNumber(formData.frekans);
    const V = parseLocalizedNumber(formData.gerilim);
    const connection = formData.connection;

    if ([P, PF1, PF2, f, V].some((value) => Number.isNaN(value))) return;
    if (P <= 0 || f <= 0 || V <= 0 || PF1 <= 0 || PF1 > 1 || PF2 <= 0 || PF2 > 1 || PF2 <= PF1) return;

    const Q1 = P * Math.tan(Math.acos(PF1));
    const Q2 = P * Math.tan(Math.acos(PF2));
    const Qc = Q1 - Q2;
    const omega = 2 * Math.PI * f;
    const qVar = Qc * 1000;

    // Per-capacitor value. For a three-phase bank using line voltage:
    // star: Q = ω C V_L², delta: Q = 3 ω C V_L².
    const denominator = connection === 'delta' ? 3 * omega * V * V : omega * V * V;
    const phaseCapacitance = (qVar / denominator) * 1e6;

    const S1 = P / PF1;
    const S2 = P / PF2;
    const gorunurGucAzalmasi = ((S1 - S2) / S1) * 100;

    setSonuc({
      mevcutReaktif: Q1,
      hedefReaktif: Q2,
      fazKapasitesi: phaseCapacitance,
      kondansatorKVAR: Qc,
      mevcutGorunurGuc: S1,
      hedefGorunurGuc: S2,
      gorunurGucAzalmasi,
      connection,
    });

    setSvgContent(generateDrawing({ type: 'guc_faktor', power: P, result: Q1, result2: PF1 }));
  };

  const connectionLabel = formData.connection === 'delta' ? 'Üç faz üçgen (Δ)' : formData.connection === 'star' ? 'Üç faz yıldız (Y)' : 'Tek faz';

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10"><Gauge className="w-6 h-6 text-emerald-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Güç Faktörü Düzeltme Hesabı</h2>
            <p className="calc-prose mt-1">Gerekli kompanzasyon gücünü ve seçilen bağlantı tipine göre kondansatör başına yaklaşık kapasiteyi hesaplayın.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <InputField label="Aktif güç (kW)" name="aktifGuc" value={formData.aktifGuc} onChange={handleChange} placeholder="Örn: 100" />
          <InputField label="Mevcut güç faktörü (cos φ)" name="mevcutPF" value={formData.mevcutPF} onChange={handleChange} placeholder="0.75" />

          <div>
            <label className="calc-title">Hedef güç faktörü (cos φ)</label>
            <select name="hedefPF" value={formData.hedefPF} onChange={handleChange} className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="0.90">0.90</option><option value="0.92">0.92</option><option value="0.95">0.95</option><option value="0.98">0.98</option><option value="0.99">0.99</option><option value="1.00">1.00</option>
            </select>
          </div>

          <div>
            <label className="calc-title">Bağlantı tipi</label>
            <select name="connection" value={formData.connection} onChange={handleChange} className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="single">Tek faz</option>
              <option value="star">Üç faz yıldız (Y)</option>
              <option value="delta">Üç faz üçgen (Δ)</option>
            </select>
          </div>

          <div>
            <label className="calc-title">Hat / besleme gerilimi (V)</label>
            <select name="gerilim" value={formData.gerilim} onChange={handleChange} className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="230">230 V</option><option value="400">400 V</option><option value="690">690 V</option><option value="1000">1000 V</option>
            </select>
          </div>

          <div>
            <label className="calc-title">Frekans (Hz)</label>
            <select name="frekans" value={formData.frekans} onChange={handleChange} className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30">
              <option value="50">50 Hz</option><option value="60">60 Hz</option>
            </select>
          </div>
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">Qc = P × (tan φ₁ − tan φ₂)</p>
          <p className="calc-prose mt-2">µF sonucu kondansatör başınadır ve bağlantı şekline bağlıdır. Harmonikli tesislerde seri reaktör ve rezonans kontrolü ayrıca yapılmalıdır.</p>
        </div>

        <button onClick={hesapla} className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg active:scale-[0.98]" type="button">
          <span className="inline-flex items-center gap-2"><Calculator className="w-5 h-5" />Hesapla</span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2"><Gauge className="w-5 h-5 text-emerald-500" />Kompanzasyon Sonuçları</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ResultCard title="Gerekli kompanzasyon" value={`${formatSmartNumber(sonuc.kondansatorKVAR, 'tr-TR', 1)} kVAR`} subValue={`${connectionLabel}: ${formatSmartNumber(sonuc.fazKapasitesi, 'tr-TR', 1)} µF / kondansatör`} accent />
            <ResultCard title="Mevcut reaktif güç" value={`${formatSmartNumber(sonuc.mevcutReaktif, 'tr-TR', 1)} kVAR`} />
            <ResultCard title="Hedef reaktif güç" value={`${formatSmartNumber(sonuc.hedefReaktif, 'tr-TR', 1)} kVAR`} />
            <ResultCard title="Mevcut görünür güç" value={`${formatSmartNumber(sonuc.mevcutGorunurGuc, 'tr-TR', 1)} kVA`} />
            <ResultCard title="Hedef görünür güç" value={`${formatSmartNumber(sonuc.hedefGorunurGuc, 'tr-TR', 1)} kVA`} />
            <ResultCard title="Görünür güç azalması" value={`%${formatSmartNumber(sonuc.gorunurGucAzalmasi, 'tr-TR', 1)}`} />
          </div>
          <p className="mt-4 text-sm rounded-lg p-3 calc-box-accent">Bu yüzde enerji tüketimi tasarrufu değildir; aynı aktif güçte hat ve trafo üzerinden taşınan görünür gücün azalmasını gösterir.</p>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-emerald-500" />Tasarım notu</h4>
        <p className="calc-prose">Sonuç ön seçim içindir. Nihai kademe sayısı, anahtarlama elemanları, kondansatör toleransı, harmonikler, detuned reaktör ve işletme profili pano tasarımında doğrulanmalıdır.</p>
      </div>

      <TeknikCizimPanel svgContent={svgContent} filename="guc-faktoru" title="Güç Üçgeni Diyagramı" />

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /><h3 className="calc-section-title">Güç faktörü düzeltmesi hakkında</h3></div>
        <p className="calc-prose">Araç mevcut ve hedef cos φ değerleri arasındaki reaktif güç farkını hesaplar. kVAR sonucu temel seçim değeridir; µF sonucu bağlantı düzenine göre kondansatör başına yaklaşık değerdir.</p>
      </section>
    </div>
  );
}

function InputField({ label, name, value, onChange, placeholder }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) {
  return <div><label className="calc-title">{label}</label><input type="text" inputMode="decimal" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full mt-2 px-4 h-12 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>;
}

function ResultCard({ title, value, subValue, accent = false }: { title: string; value: string; subValue?: string; accent?: boolean }) {
  return <div className={accent ? 'calc-result rounded-xl p-4' : 'calc-soft rounded-xl p-4'}><span className="text-sm calc-muted block mb-1">{title}</span><span className={`block ${accent ? 'text-2xl text-emerald-600 dark:text-emerald-400' : 'text-xl'} font-bold text-[var(--foreground)]`}>{value}</span>{subValue && <span className="text-xs calc-muted block mt-1">{subValue}</span>}</div>;
}
