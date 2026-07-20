'use client';

import { useMemo, useState } from 'react';
import {
  Store,
  Calculator,
  Percent,
  Sparkles,
  Info,
  Download,
  Truck,
  TicketPercent,
  Megaphone,
} from 'lucide-react';
import { parseLocalizedNumber, formatSmartNumber } from '@/lib/calculator-utils';

const PAZARYERLERI = [
  { key: 'trendyol', ad: 'Trendyol' },
  { key: 'hepsiburada', ad: 'Hepsiburada' },
  { key: 'n11', ad: 'n11' },
  { key: 'amazontr', ad: 'Amazon Türkiye' },
  { key: 'ciceksepeti', ad: 'Çiçeksepeti' },
  { key: 'pazarama', ad: 'Pazarama' },
] as const;

const POPULER_KAR_ORANLARI = [10, 15, 20, 25, 30, 35, 40] as const;

type KarModu = 'oran' | 'tutar';

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '');
          if (value.includes('"') || value.includes(',') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function fiyatHesapla(
  toplamMaliyet: number,
  komisyonOrani: number,
  ekKesintiOrani: number,
  kdvOrani: number,
  kuponOrani: number,
  reklamOrani: number,
  hedefKar: number
) {
  const toplamKesintiOrani = komisyonOrani + ekKesintiOrani + kuponOrani + reklamOrani;

  if (toplamMaliyet <= 0 || toplamKesintiOrani >= 1) return null;

  const gerekliNet = toplamMaliyet + hedefKar;
  const satisKdvHaric = gerekliNet / (1 - toplamKesintiOrani);
  const satisKdvDahil = satisKdvHaric * (1 + kdvOrani);

  const komisyonTutari = satisKdvHaric * komisyonOrani;
  const ekKesintiTutari = satisKdvHaric * ekKesintiOrani;
  const kuponTutari = satisKdvHaric * kuponOrani;
  const reklamTutari = satisKdvHaric * reklamOrani;
  const toplamKesintiTutari =
    komisyonTutari + ekKesintiTutari + kuponTutari + reklamTutari;

  const netEleGecen = satisKdvHaric - toplamKesintiTutari;
  const netKar = netEleGecen - toplamMaliyet;

  return {
    satisKdvHaric,
    satisKdvDahil,
    komisyonTutari,
    ekKesintiTutari,
    kuponTutari,
    reklamTutari,
    toplamKesintiTutari,
    netEleGecen,
    netKar,
    toplamKesintiOrani,
  };
}

export default function PazaryeriFiyatHesaplamaCalculator() {
  const [pazaryeri, setPazaryeri] = useState<string>('trendyol');

  const [alisFiyati, setAlisFiyati] = useState('100');
  const [kargoGideri, setKargoGideri] = useState('20');
  const [paketlemeGideri, setPaketlemeGideri] = useState('5');
  const [digerGider, setDigerGider] = useState('0');

  const [komisyonOrani, setKomisyonOrani] = useState('18');
  const [ekKesintiOrani, setEkKesintiOrani] = useState('0');
  const [kdvOrani, setKdvOrani] = useState('20');

  const [karModu, setKarModu] = useState<KarModu>('oran');
  const [hedefKarOrani, setHedefKarOrani] = useState('20');
  const [hedefKarTutari, setHedefKarTutari] = useState('40');

  const [reklamOrani, setReklamOrani] = useState('0');
  const [kuponOrani, setKuponOrani] = useState('0');

  const [ucretsizKargoEsigi, setUcretsizKargoEsigi] = useState('500');
  const [ucretsizKargoAcik, setUcretsizKargoAcik] = useState(false);

  const hesap = useMemo(() => {
    const alis = parseLocalizedNumber(alisFiyati) || 0;
    const kargo = parseLocalizedNumber(kargoGideri) || 0;
    const paket = parseLocalizedNumber(paketlemeGideri) || 0;
    const diger = parseLocalizedNumber(digerGider) || 0;

    const komisyon = (parseLocalizedNumber(komisyonOrani) || 0) / 100;
    const ekKesinti = (parseLocalizedNumber(ekKesintiOrani) || 0) / 100;
    const kdv = (parseLocalizedNumber(kdvOrani) || 0) / 100;
    const reklam = (parseLocalizedNumber(reklamOrani) || 0) / 100;
    const kupon = (parseLocalizedNumber(kuponOrani) || 0) / 100;

    const kargoBedeliNormal = kargo;
    const esik = parseLocalizedNumber(ucretsizKargoEsigi) || 0;

    const toplamMaliyetNormal = alis + kargoBedeliNormal + paket + diger;
    if (toplamMaliyetNormal <= 0) return null;

    let hedefKar = 0;
    if (karModu === 'oran') {
      hedefKar = toplamMaliyetNormal * ((parseLocalizedNumber(hedefKarOrani) || 0) / 100);
    } else {
      hedefKar = parseLocalizedNumber(hedefKarTutari) || 0;
    }

    const minimum = fiyatHesapla(
      toplamMaliyetNormal,
      komisyon,
      ekKesinti,
      kdv,
      kupon,
      reklam,
      0
    );

    const onerilen = fiyatHesapla(
      toplamMaliyetNormal,
      komisyon,
      ekKesinti,
      kdv,
      kupon,
      reklam,
      hedefKar
    );

    const agresif = fiyatHesapla(
      toplamMaliyetNormal,
      komisyon,
      ekKesinti,
      kdv,
      kupon,
      reklam,
      hedefKar * 1.25
    );

    const ucretsizKargoToplamMaliyet = alis + paket + diger + kargoBedeliNormal;
    const ucretsizKargoHedef = fiyatHesapla(
      ucretsizKargoToplamMaliyet,
      komisyon,
      ekKesinti,
      kdv,
      kupon,
      reklam,
      hedefKar
    );

    return {
      pazaryeri,
      toplamMaliyetNormal,
      hedefKar,
      minimum,
      onerilen,
      agresif,
      kdv,
      komisyon,
      ekKesinti,
      reklam,
      kupon,
      esik,
      ucretsizKargoAcik,
      ucretsizKargoHedef,
      kargoBedeliNormal,
      alis,
      paket,
      diger,
    };
  }, [
    alisFiyati,
    kargoGideri,
    paketlemeGideri,
    digerGider,
    komisyonOrani,
    ekKesintiOrani,
    kdvOrani,
    karModu,
    hedefKarOrani,
    hedefKarTutari,
    reklamOrani,
    kuponOrani,
    ucretsizKargoEsigi,
    ucretsizKargoAcik,
    pazaryeri,
  ]);

  const csvIndir = () => {
    if (!hesap || !hesap.onerilen || !hesap.minimum || !hesap.agresif) return;

    downloadCsv('pazaryeri-fiyat-hesabi.csv', [
      ['Alan', 'Değer'],
      ['Pazaryeri', PAZARYERLERI.find((p) => p.key === pazaryeri)?.ad || pazaryeri],
      ['Toplam Maliyet', hesap.toplamMaliyetNormal.toFixed(2)],
      ['Hedef Net Kar', hesap.hedefKar.toFixed(2)],
      ['Minimum Fiyat KDV Dahil', hesap.minimum.satisKdvDahil.toFixed(2)],
      ['Önerilen Fiyat KDV Dahil', hesap.onerilen.satisKdvDahil.toFixed(2)],
      ['Agresif Fiyat KDV Dahil', hesap.agresif.satisKdvDahil.toFixed(2)],
      ['Komisyon Oranı %', (hesap.komisyon * 100).toFixed(2)],
      ['Ek Kesinti %', (hesap.ekKesinti * 100).toFixed(2)],
      ['Kupon Oranı %', (hesap.kupon * 100).toFixed(2)],
      ['Reklam Oranı %', (hesap.reklam * 100).toFixed(2)],
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-violet-500/10">
            <Store className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Pazaryeri Fiyat Hesaplama</h2>
            <p className="calc-prose mt-1">
              Ürün maliyeti, kargo, komisyon, indirim, reklam ve KDV dahil satış fiyatını doğru belirleyin.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="calc-title block mb-2">Pazaryeri</label>
            <select
              value={pazaryeri}
              onChange={(e) => setPazaryeri(e.target.value)}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {PAZARYERLERI.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.ad}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="calc-title block mb-2">Komisyon Oranı (%)</label>
            <input
              type="text"
              inputMode="decimal"
              value={komisyonOrani}
              onChange={(e) => setKomisyonOrani(e.target.value.replace(/[^0-9.,-]/g, ''))}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30"
              placeholder="Örn: 18"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <InputTL label="Ürün Alış Fiyatı (₺)" value={alisFiyati} onChange={setAlisFiyati} />
          <InputTL label="Kargo Gideri (₺)" value={kargoGideri} onChange={setKargoGideri} />
          <InputTL label="Paketleme Gideri (₺)" value={paketlemeGideri} onChange={setPaketlemeGideri} />
          <InputTL label="Diğer Giderler (₺)" value={digerGider} onChange={setDigerGider} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <InputPercent
            label="Ek Kesinti / Hizmet Bedeli (%)"
            value={ekKesintiOrani}
            onChange={setEkKesintiOrani}
          />
          <div>
            <label className="calc-title block mb-2">KDV Oranı (%)</label>
            <select
              value={kdvOrani}
              onChange={(e) => setKdvOrani(e.target.value)}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <option value="1">%1</option>
              <option value="10">%10</option>
              <option value="20">%20</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <InputPercent
            label="Kupon / İndirim Katkı Payı (%)"
            value={kuponOrani}
            onChange={setKuponOrani}
            icon={<TicketPercent className="w-4 h-4" />}
          />
          <InputPercent
            label="Reklam Gideri Oranı (%)"
            value={reklamOrani}
            onChange={setReklamOrani}
            icon={<Megaphone className="w-4 h-4" />}
          />
        </div>

        <div className="mt-6">
          <label className="calc-title block mb-2">Kâr Hedefi Türü</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKarModu('oran')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                karModu === 'oran'
                  ? 'bg-violet-500 text-white border-violet-500'
                  : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
              }`}
            >
              <Percent className="w-4 h-4 inline mr-2" />
              Oranla Kâr
            </button>

            <button
              type="button"
              onClick={() => setKarModu('tutar')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                karModu === 'tutar'
                  ? 'bg-violet-500 text-white border-violet-500'
                  : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
              }`}
            >
              ₺ Tutarla Kâr
            </button>
          </div>
        </div>

        {karModu === 'oran' ? (
          <div className="mt-4 space-y-3">
            <label className="calc-title block">Hedef Kâr Oranı (%)</label>
            <div className="flex gap-2 flex-wrap">
              {POPULER_KAR_ORANLARI.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setHedefKarOrani(String(o))}
                  className={`calc-chip ${Number(hedefKarOrani) === o ? 'ring-2 ring-violet-500/40' : ''}`}
                >
                  %{o}
                </button>
              ))}
            </div>
            <input
              type="text"
              inputMode="decimal"
              value={hedefKarOrani}
              onChange={(e) => setHedefKarOrani(e.target.value.replace(/[^0-9.,-]/g, ''))}
              className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30"
              placeholder="Örn: 20"
            />
          </div>
        ) : (
          <div className="mt-4">
            <InputTL label="Hedef Net Kâr Tutarı (₺)" value={hedefKarTutari} onChange={setHedefKarTutari} />
          </div>
        )}

        <div className="mt-6">
          <label className="calc-title block mb-2">Ücretsiz Kargo Senaryosu</label>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setUcretsizKargoAcik((v) => !v)}
              className={`py-3 rounded-xl border font-semibold transition-all ${
                ucretsizKargoAcik
                  ? 'bg-violet-500 text-white border-violet-500'
                  : 'calc-panel text-[var(--foreground)] border-[var(--border)]'
              }`}
            >
              <Truck className="w-4 h-4 inline mr-2" />
              {ucretsizKargoAcik ? 'Ücretsiz kargo simülasyonu açık' : 'Ücretsiz kargo simülasyonu kapalı'}
            </button>

            <InputTL
              label="Ücretsiz Kargo Eşiği (₺)"
              value={ucretsizKargoEsigi}
              onChange={setUcretsizKargoEsigi}
            />
          </div>
        </div>

        <div className="calc-box-accent mt-6">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Seçilen pazaryeri: {PAZARYERLERI.find((p) => p.key === pazaryeri)?.ad}
          </p>
          <p className="calc-prose mt-2">
            Bu tool kategoriye göre değişen komisyonu kullanıcı girişli bırakır. Böylece her kategori için gerçekçi fiyat çalışması yapabilirsin.
          </p>
        </div>
      </div>

      {hesap?.minimum && hesap?.onerilen && hesap?.agresif && (
        <div className="calc-box space-y-4">
          <h3 className="text-violet-600 dark:text-violet-400 text-sm font-bold flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Fiyatlandırma Sonucu
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <PriceCard
              title="Minimum Fiyat"
              subtitle="Başa baş nokta"
              value={`${formatSmartNumber(hesap.minimum.satisKdvDahil, 'tr-TR', 2)} ₺`}
            />
            <PriceCard
              title="Önerilen Fiyat"
              subtitle="Hedef kâra göre"
              value={`${formatSmartNumber(hesap.onerilen.satisKdvDahil, 'tr-TR', 2)} ₺`}
              accent
            />
            <PriceCard
              title="Agresif Fiyat"
              subtitle="Daha yüksek kâr"
              value={`${formatSmartNumber(hesap.agresif.satisKdvDahil, 'tr-TR', 2)} ₺`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ResultCard title="Toplam Maliyet" value={`${formatSmartNumber(hesap.toplamMaliyetNormal, 'tr-TR', 2)} ₺`} />
            <ResultCard title="Hedef Net Kâr" value={`${formatSmartNumber(hesap.hedefKar, 'tr-TR', 2)} ₺`} />
            <ResultCard title="Önerilen Fiyat KDV Hariç" value={`${formatSmartNumber(hesap.onerilen.satisKdvHaric, 'tr-TR', 2)} ₺`} />
            <ResultCard title="Toplam Kesinti Oranı" value={`%${formatSmartNumber(hesap.onerilen.toplamKesintiOrani * 100, 'tr-TR', 2)}`} />
            <ResultCard title="Komisyon Tutarı" value={`${formatSmartNumber(hesap.onerilen.komisyonTutari, 'tr-TR', 2)} ₺`} />
            <ResultCard title="Ek Kesinti Tutarı" value={`${formatSmartNumber(hesap.onerilen.ekKesintiTutari, 'tr-TR', 2)} ₺`} />
            <ResultCard title="Kupon Etkisi" value={`${formatSmartNumber(hesap.onerilen.kuponTutari, 'tr-TR', 2)} ₺`} />
            <ResultCard title="Reklam Gideri" value={`${formatSmartNumber(hesap.onerilen.reklamTutari, 'tr-TR', 2)} ₺`} />
            <ResultCard title="Net Eline Geçen" value={`${formatSmartNumber(hesap.onerilen.netEleGecen, 'tr-TR', 2)} ₺`} />
            <ResultCard title="Gerçekleşen Net Kâr" value={`${formatSmartNumber(hesap.onerilen.netKar, 'tr-TR', 2)} ₺`} />
          </div>

          {hesap.ucretsizKargoAcik && hesap.ucretsizKargoHedef && (
            <div className="calc-panel rounded-xl p-4">
              <p className="font-semibold text-[var(--foreground)] mb-2">
                Ücretsiz kargo eşiği senaryosu
              </p>
              <p className="calc-prose">
                {formatSmartNumber(hesap.esik, 'tr-TR', 2)} ₺ ve üzeri siparişte ücretsiz kargo vermek istiyorsan,
                önerilen fiyatın bu eşik çevresinde kaldığında kargo yükünü yine sen taşıyacağın için kârlılığın ayrıca kontrol edilmelidir.
              </p>
              <p className="mt-2 text-sm calc-muted">
                Kargo dahil hedefli önerilen fiyat: {formatSmartNumber(hesap.ucretsizKargoHedef.satisKdvDahil, 'tr-TR', 2)} ₺
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={csvIndir}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-3 font-semibold calc-panel hover:brightness-[1.03] transition-all"
            >
              <Download className="w-4 h-4" />
              CSV İndir
            </button>
          </div>
        </div>
      )}

      <div className="calc-box">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="calc-prose">
            Pazaryerlerinde komisyon tek başına yeterli değildir. Kupon katkısı, reklam harcaması, ücretsiz kargo, iade maliyeti ve kampanya katılımı gerçek marjı ciddi düşürebilir. Bu yüzden bu tool, net satış fiyatını geriye doğru hesaplayarak daha güvenli fiyat belirlemeni sağlar.
          </p>
        </div>
      </div>

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">Pazaryeri fiyatlandırması hakkında</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Bu tool, ürünün satış fiyatını maliyet, hedef kâr, pazaryeri kesintileri ve vergi etkisini birlikte düşünerek hesaplar.
            </p>
          </div>

          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Sık aramalar: <strong>pazaryeri fiyat hesaplama</strong>, <strong>ürün satış fiyatı belirleme</strong>,
              <strong> trendyol komisyonlu fiyat</strong>, <strong>hepsiburada satış fiyatı hesabı</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function InputTL({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="calc-title block mb-2">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30"
      />
    </div>
  );
}

function InputPercent({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: JSX.Element;
}) {
  return (
    <div>
      <label className="calc-title block mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,-]/g, ''))}
        className="calc-panel w-full px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30"
      />
    </div>
  );
}

function ResultCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="calc-soft rounded-xl p-4 flex justify-between items-center">
      <span className="calc-muted text-sm">{title}</span>
      <span className="font-bold text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function PriceCard({
  title,
  subtitle,
  value,
  accent = false,
}: {
  title: string;
  subtitle: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={accent ? 'calc-result rounded-xl p-5' : 'calc-soft rounded-xl p-5'}>
      <p className="text-sm calc-muted">{title}</p>
      <p className="text-xs calc-muted mt-1">{subtitle}</p>
      <p className={`mt-3 text-2xl font-bold ${accent ? 'text-violet-600 dark:text-violet-400' : 'text-[var(--foreground)]'}`}>
        {value}
      </p>
    </div>
  );
}