'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { AlertCircle, Calculator, CheckCircle2, Clipboard, Info, Ruler, Sparkles, Wrench } from 'lucide-react';
import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { formatSmartNumber } from '@/lib/calculator-utils';

type KeywayRow = {
  min: number;
  max: number;
  b: number;
  h: number;
  t1: number;
  t2: number;
};

type UseCase = 'genel' | 'servis' | 'hassas' | 'agir';

type ToleranceTip = {
  title: string;
  summary: string;
  shaftHub: string;
  keySide: string;
  warning: string;
};

const keywayData: KeywayRow[] = [
  { min: 6, max: 8, b: 2, h: 2, t1: 1.2, t2: 1.0 },
  { min: 8, max: 10, b: 3, h: 3, t1: 1.8, t2: 1.4 },
  { min: 10, max: 12, b: 4, h: 4, t1: 2.5, t2: 1.8 },
  { min: 12, max: 17, b: 5, h: 5, t1: 3.0, t2: 2.3 },
  { min: 17, max: 22, b: 6, h: 6, t1: 3.5, t2: 2.8 },
  { min: 22, max: 30, b: 8, h: 7, t1: 4.0, t2: 3.3 },
  { min: 30, max: 38, b: 10, h: 8, t1: 5.0, t2: 3.3 },
  { min: 38, max: 44, b: 12, h: 8, t1: 5.0, t2: 3.3 },
  { min: 44, max: 50, b: 14, h: 9, t1: 5.5, t2: 3.8 },
  { min: 50, max: 58, b: 16, h: 10, t1: 6.0, t2: 4.3 },
  { min: 58, max: 65, b: 18, h: 11, t1: 7.0, t2: 4.4 },
  { min: 65, max: 75, b: 20, h: 12, t1: 7.5, t2: 4.9 },
  { min: 75, max: 85, b: 22, h: 14, t1: 9.0, t2: 5.4 },
  { min: 85, max: 95, b: 25, h: 14, t1: 9.0, t2: 5.4 },
];

const toleranceTips: Record<UseCase, ToleranceTip> = {
  genel: {
    title: 'Genel makine bağlantısı',
    summary: 'Boşluk yapmayacak, montajı da gereksiz zorlaştırmayacak orta karakter seçilir.',
    shaftHub: 'Mil-göbek geçmesi için boşluksuz veya çok az boşluklu karakter düşünülür.',
    keySide: 'Kama yanaklarında vuruntu oluşturmayacak ama montajı kilitlemeyecek yan boşluk hedeflenir.',
    warning: 'Teknik resimde kesin tolerans kodu verilmeden üretime geçilmemelidir.',
  },
  servis: {
    title: 'Sık sökülüp takılan bağlantı',
    summary: 'Bakım kolaylığı öne çıkar; aşırı sıkı karakterden kaçınılır.',
    shaftHub: 'Göbek deliği mil üzerinde kontrollü kayabilecek karakterde düşünülür.',
    keySide: 'Kama elle veya hafif vurma ile sökülebilmeli; yanaklarda ezilme riski takip edilmelidir.',
    warning: 'Fazla boşluk uzun vadede vuruntu ve kanal ezilmesi yapabilir.',
  },
  hassas: {
    title: 'Hassas merkezleme gereken bağlantı',
    summary: 'Salgı, paralellik ve merkez kaçıklığı toleransı ölçü kadar önemlidir.',
    shaftHub: 'Mil-göbek oturması merkezlemeyi koruyacak, salgıyı artırmayacak karakterde seçilir.',
    keySide: 'Kama kanalı simetrisi ve paralelliği ayrıca kontrol edilmelidir.',
    warning: 'Sadece b, h, t₁, t₂ ölçüsü hassas dönme için yeterli değildir.',
  },
  agir: {
    title: 'Yüksek tork / darbeli çalışma',
    summary: 'Boşluk, vuruntu ve kanal ezilmesi ana risktir; temas yüzeyleri daha kritik kontrol edilir.',
    shaftHub: 'Gevşek karakterden kaçınılır; tork aktarımı mil-göbek-kama birlikte değerlendirilir.',
    keySide: 'Yanak boşluğu minimum tutulmalı, kanal dibi keskin köşe bırakılmamalıdır.',
    warning: 'Darbeli yükte kama bağlantısı tek başına yeterli olmayabilir; kama boyu ve emniyet ayrıca hesaplanmalıdır.',
  },
};

const useCaseLabels: { key: UseCase; label: string }[] = [
  { key: 'genel', label: 'Genel bağlantı' },
  { key: 'servis', label: 'Sık sökülür' },
  { key: 'hassas', label: 'Hassas merkezleme' },
  { key: 'agir', label: 'Yüksek tork / darbeli' },
];

export default function KamaKanaliCalculator() {
  const [shaftDiameter, setShaftDiameter] = useState<string>('');
  const [useCase, setUseCase] = useState<UseCase>('genel');
  const [result, setResult] = useState<KeywayRow | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [copiedNote, setCopiedNote] = useState(false);

  const calculateKeyway = (diameter: number) => {
    const data = keywayData.find((d) => diameter > d.min && diameter <= d.max);

    if (data) {
      setResult(data);
      setSvgContent(
        generateDrawing({
          type: 'kama_kanali',
          shaftDia: diameter,
          b: data.b,
          h: data.h,
          t1: data.t1,
          t2: data.t2,
        })
      );
    } else {
      setResult(null);
      setSvgContent('');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.,-]/g, '');
    setShaftDiameter(raw);

    const normalized = parseFloat(raw.replace(',', '.'));
    if (!Number.isNaN(normalized)) {
      calculateKeyway(normalized);
    } else {
      setResult(null);
      setSvgContent('');
    }
  };

  const selectedTip = toleranceTips[useCase];
  const shaftValue = parseFloat(shaftDiameter.replace(',', '.'));
  const showError = shaftDiameter !== '' && (Number.isNaN(shaftValue) || !result);
  const drawingLegend = result
    ? [
        { label: 'd', value: `${formatSmartNumber(shaftValue, 'tr-TR', 2)} mm`, note: 'Girilen mil çapı' },
        { label: 'b', value: `${formatSmartNumber(result.b, 'tr-TR', 2)} mm`, note: 'Kama/kanal genişliği' },
        { label: 't₁', value: `${formatSmartNumber(result.t1, 'tr-TR', 2)} mm`, note: 'Mil kanal derinliği' },
        { label: 't₂', value: `${formatSmartNumber(result.t2, 'tr-TR', 2)} mm`, note: 'Göbek kanal derinliği' },
      ]
    : [];

  const drawingNote = result
    ? `Kama bağlantısında çizimdeki d mil çapını, b kama genişliğini, t₁ mil kanal derinliğini, t₂ göbek kanal derinliğini gösterir. Çizim ölçülerin nerede kullanılacağını anlatır; kesin tolerans karakteri aşağıdaki ön kontrol notuna göre ayrıca seçilmelidir.`
    : '';

  const drawingText = result
    ? `Kama kanalı: d=${formatSmartNumber(shaftValue, 'tr-TR', 2)} mm, b=${result.b} mm, h=${result.h} mm, t1=${result.t1} mm, t2=${result.t2} mm. Ön kontrol: ${selectedTip.title}. Kanal kenarları çapaksız olacak, keskin köşe kırılacak, montaj sonrası boşluk/vuruntu kontrol edilecek. Kesin tolerans resmi standart, üretici katalog değeri veya mühendislik onayıyla netleştirilecek.`
    : '';

  const copyDrawingText = async () => {
    if (!drawingText) return;
    try {
      await navigator.clipboard.writeText(drawingText);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 1800);
    } catch {
      setCopiedNote(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/10">
            <Calculator className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Kama Kanalı Ölçü ve Tolerans Ön Kontrolü</h2>
            <p className="calc-prose mt-1">
              Mil çapını girin; kama ölçüsü, çizim açıklaması ve üretim öncesi tolerans karakteri birlikte görünsün.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_1.2fr] gap-4">
          <div>
            <label className="calc-title flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Mil Çapı (mm)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={shaftDiameter}
              onChange={handleInputChange}
              placeholder="Örn: 30"
              className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none focus:ring-2 focus:ring-blue-500/30 text-lg"
            />
          </div>

          <div>
            <label className="calc-title flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Kullanım karakteri
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {useCaseLabels.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setUseCase(item.key)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold border transition ${
                    useCase === item.key
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300'
                      : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-blue-400/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Bu araç standart tablo kopyası gibi değil, ücretsiz ölçü + tolerans öngörüsü mantığıyla çalışır.
          </p>
          <p className="calc-prose mt-2">
            Sonuçlar imalat öncesi hızlı kontrol içindir. Kesin teknik resim toleransı; yük, malzeme, yüzey işlemi, göbek boyu, sökülebilirlik ve müşteri şartnamesine göre belirlenmelidir.
          </p>
        </div>

        {result ? (
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Genişlik b', val: `${formatSmartNumber(result.b, 'tr-TR', 2)} mm` },
                { label: 'Yükseklik h', val: `${formatSmartNumber(result.h, 'tr-TR', 2)} mm` },
                { label: 'Mil oluğu t₁', val: `${formatSmartNumber(result.t1, 'tr-TR', 2)} mm` },
                { label: 'Göbek oluğu t₂', val: `${formatSmartNumber(result.t2, 'tr-TR', 2)} mm` },
              ].map((item) => (
                <div key={item.label} className="calc-result rounded-xl p-4 text-center">
                  <div className="text-xs calc-muted mb-1">{item.label}</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{item.val}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Tolerans öngörüsü: {selectedTip.title}</h3>
                  <p className="calc-prose mt-1">{selectedTip.summary}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3 mt-4">
                {[
                  { title: 'Mil - göbek geçmesi', text: selectedTip.shaftHub },
                  { title: 'Kama yanak boşluğu', text: selectedTip.keySide },
                  { title: 'Risk notu', text: selectedTip.warning },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl bg-[var(--card)] border border-[var(--border)] p-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {item.title}
                    </div>
                    <p className="calc-prose mt-2 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-[var(--card)] border border-[var(--border)] p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-sm font-bold text-[var(--foreground)]">Teknik resim notu örneği</div>
                    <p className="calc-prose mt-1 text-sm">{drawingText}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyDrawingText}
                    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300"
                  >
                    <Clipboard className="w-4 h-4" />
                    {copiedNote ? 'Kopyalandı' : 'Notu kopyala'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {showError && (
          <div className="mt-4 p-4 rounded-xl flex items-start gap-3 calc-warn">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Girilen çap için desteklenen ölçü bulunamadı. Desteklenen aralık yaklaşık <strong>6–95 mm</strong>.
            </p>
          </div>
        )}
      </div>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="kama-kanali"
        title="Kama Kanalı Teknik Çizimi"
        description={drawingNote}
        legendItems={drawingLegend}
      />

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Kama bağlantısında nelere bakılır?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Ölçü tarafında b, h, t₁ ve t₂ değerleri ana başlangıçtır. Ancak bağlantının çalışıp çalışmayacağını yalnızca bu değerler belirlemez; kanal merkezleme, yüzey kalitesi, göbek boyu ve boşluk karakteri de önemlidir.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Tolerans tarafında amaç; kama yanaklarında vuruntu oluşturmamak, göbeği mil üzerinde gereksiz sıkıştırmamak ve bakım ihtiyacına göre sökülebilirliği korumaktır.
            </p>
          </div>
        </div>

        <div className="calc-panel rounded-xl p-4">
          <p className="calc-prose">
            Buradaki toleranslar resmi standart tablosu değildir. Kullanıcıya yön veren ön kontrol bilgisidir. Kesin değer için güncel standart, üretici katalogları veya yetkili mühendis onayı esas alınmalıdır.
          </p>
        </div>
      </section>
    </div>
  );
}
