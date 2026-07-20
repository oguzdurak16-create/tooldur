'use client';

import { generateDrawing } from '@/lib/drawingEngine';
import TeknikCizimPanel from '@/components/TeknikCizimPanel';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { Calculator, Info, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

type Uygunluk = 'ideal' | 'kabul' | 'uygun_degil';

type Sonuc = {
  basamakSayisi: number;
  rihtYuksekligi: number;
  basamakGenisligi: number;
  merdivenAcisi: number;
  toplamUzunluk: number;
  blondelFormulu: number;
  uygunluk: Uygunluk;
};

export default function MerdivenHesaplamaCalculator() {
  const [formData, setFormData] = useState({
    katYuksekligi: '',
    merdivenUzunlugu: '',
    hesaplamaTipi: 'yukseklik',
  });

  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const hesapla = () => {
    const H = parseLocalizedNumber(formData.katYuksekligi);
    const L = parseLocalizedNumber(formData.merdivenUzunlugu);

    if (Number.isNaN(H) || H <= 0) return;

    let riht: number;
    let basamakSayisi: number;
    let basamakGenisligi: number;

    const hedefRiht = 17;
    basamakSayisi = Math.round(H / hedefRiht);

    if (basamakSayisi < 3) basamakSayisi = 3;

    riht = H / basamakSayisi;

    if (!Number.isNaN(L) && L > 0) {
      basamakGenisligi = L / (basamakSayisi - 1);
    } else {
      basamakGenisligi = 63 - 2 * riht;
    }

    const toplamUzunluk = basamakGenisligi * (basamakSayisi - 1);
    const aci = Math.atan(H / toplamUzunluk) * (180 / Math.PI);
    const blondel = 2 * riht + basamakGenisligi;

    let uygunluk: Uygunluk;
    if (
      riht >= 15 &&
      riht <= 18 &&
      basamakGenisligi >= 25 &&
      basamakGenisligi <= 32 &&
      blondel >= 60 &&
      blondel <= 66
    ) {
      uygunluk = 'ideal';
    } else if (
      riht >= 14 &&
      riht <= 20 &&
      basamakGenisligi >= 22 &&
      basamakGenisligi <= 35
    ) {
      uygunluk = 'kabul';
    } else {
      uygunluk = 'uygun_degil';
    }

    setSonuc({
      basamakSayisi,
      rihtYuksekligi: riht,
      basamakGenisligi,
      merdivenAcisi: aci,
      toplamUzunluk,
      blondelFormulu: blondel,
      uygunluk,
    });

    setSvgContent(
      generateDrawing({
        type: 'merdiven_kesit',
        count: basamakSayisi,
        height: riht,
        width: basamakGenisligi,
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="calc-title block mb-2">Kat Yüksekliği (cm)</label>
            <input
              type="text"
              inputMode="decimal"
              name="katYuksekligi"
              value={formData.katYuksekligi}
              onChange={handleChange}
              placeholder="Örn: 300"
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <span className="text-xs calc-muted block mt-2">
              Döşemeden döşemeye toplam yükseklik
            </span>
          </div>

          <div>
            <label className="calc-title block mb-2">Merdiven Uzunluğu (cm) - Opsiyonel</label>
            <input
              type="text"
              inputMode="decimal"
              name="merdivenUzunlugu"
              value={formData.merdivenUzunlugu}
              onChange={handleChange}
              placeholder="Boş bırakılırsa otomatik hesaplanır"
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <span className="text-xs calc-muted block mt-2">
              Yatayda kullanılabilir alan
            </span>
          </div>
        </div>

        <div className="calc-box-accent mb-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Merdiven hesabı Blondel formülü ve ergonomik ölçüler dikkate alınarak yapılır.
          </p>
          <p className="calc-prose mt-2">
            Bu araç konut ve genel kullanım merdivenlerinde ön ölçülendirme için uygundur. Nihai projede yönetmelik ve mimari detaylar ayrıca kontrol edilmelidir.
          </p>
        </div>

        <button
          onClick={hesapla}
          className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 transition-all shadow-lg active:scale-[0.98]"
          type="button"
        >
          <span className="inline-flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Merdiven Hesapla
          </span>
        </button>
      </div>

      {sonuc && (
        <div className="calc-box">
          <div
            className={`mb-4 p-3 rounded-xl flex items-center gap-2 ${
              sonuc.uygunluk === 'ideal'
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : sonuc.uygunluk === 'kabul'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                : 'bg-red-500/10 text-red-700 dark:text-red-400'
            }`}
          >
            {sonuc.uygunluk === 'ideal' ? (
              <>
                <CheckCircle className="w-5 h-5" />
                İdeal ölçüler. Ergonomik ve güvenli.
              </>
            ) : sonuc.uygunluk === 'kabul' ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                Kabul edilebilir ölçüler.
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                Uygun değil. Ölçüleri gözden geçirin.
              </>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="calc-result rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Basamak Sayısı</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {sonuc.basamakSayisi}
              </span>
            </div>

            <MetricCard
              title="Rıht Yüksekliği (h)"
              value={`${formatSmartNumber(sonuc.rihtYuksekligi, 'tr-TR', 1)} cm`}
              note="İdeal: 15-18 cm"
              ok={sonuc.rihtYuksekligi >= 15 && sonuc.rihtYuksekligi <= 18}
            />

            <MetricCard
              title="Basamak Genişliği (g)"
              value={`${formatSmartNumber(sonuc.basamakGenisligi, 'tr-TR', 1)} cm`}
              note="İdeal: 25-32 cm"
              ok={sonuc.basamakGenisligi >= 25 && sonuc.basamakGenisligi <= 32}
            />

            <MetricCard
              title="Merdiven Açısı"
              value={`${formatSmartNumber(sonuc.merdivenAcisi, 'tr-TR', 1)}°`}
              note="İdeal: 25-40°"
              ok={sonuc.merdivenAcisi >= 25 && sonuc.merdivenAcisi <= 40}
            />

            <div className="calc-soft rounded-xl p-4">
              <span className="text-sm calc-muted block mb-1">Toplam Uzunluk</span>
              <span className="text-xl font-bold text-[var(--foreground)]">
                {formatSmartNumber(sonuc.toplamUzunluk, 'tr-TR', 0)} cm
              </span>
            </div>

            <MetricCard
              title="Blondel Formülü"
              value={`${formatSmartNumber(sonuc.blondelFormulu, 'tr-TR', 1)} cm`}
              note="İdeal: 60-66 cm"
              ok={sonuc.blondelFormulu >= 60 && sonuc.blondelFormulu <= 66}
            />
          </div>
        </div>
      )}

      <div className="calc-box">
        <h4 className="font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500" />
          Merdiven Tasarım Kuralları
        </h4>
        <ul className="text-sm calc-muted space-y-1">
          <li>• <strong>Blondel Formülü:</strong> 2h + g = 60-66 cm</li>
          <li>• <strong>Rıht yüksekliği:</strong> 15-18 cm arası ideal</li>
          <li>• <strong>Basamak genişliği:</strong> 25-32 cm arası ideal</li>
          <li>• <strong>Merdiven eğimi:</strong> 25°-40° arası konforlu</li>
          <li>• <strong>Merdiven genişliği:</strong> Min. 80 cm konut, 120 cm ticari</li>
        </ul>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Merdiven hesabı hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu araç kat yüksekliği ve yatay uzunluğa göre basamak sayısı, rıht yüksekliği, basamak genişliği ve merdiven açısını hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>merdiven hesaplama</strong>, <strong>blondel formülü</strong>,
              <strong> rıht basamak hesabı</strong>, <strong>merdiven açısı hesaplama</strong>.
            </p>
          </div>
        </div>
      </section>

      <TeknikCizimPanel
        svgContent={svgContent}
        filename="merdiven-hesaplama"
        title="Merdiven Kesit Çizimi"
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  note,
  ok,
}: {
  title: string;
  value: string;
  note: string;
  ok: boolean;
}) {
  return (
    <div className="calc-soft rounded-xl p-4">
      <span className="text-sm calc-muted block mb-1">{title}</span>
      <span className="text-xl font-bold text-[var(--foreground)]">{value}</span>
      <span className={`text-xs block mt-1 ${ok ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
        {note}
      </span>
    </div>
  );
}