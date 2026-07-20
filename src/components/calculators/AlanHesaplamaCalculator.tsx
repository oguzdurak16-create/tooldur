'use client';

import { useMemo, useState } from 'react';
import { Calculator, Square, Circle, Triangle, RotateCcw, Info, Sparkles } from 'lucide-react';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';

const birimler = ['mm', 'cm', 'm', 'in', 'ft'];

const sekiller = {
  kare: { ad: 'Kare', icon: <Square className="w-4 h-4" /> },
  dikdortgen: { ad: 'Dikdörtgen', icon: <Square className="w-4 h-4" /> },
  daire: { ad: 'Daire', icon: <Circle className="w-4 h-4" /> },
  ucgen: { ad: 'Üçgen (3 Kenar)', icon: <Triangle className="w-4 h-4" /> },
  ucgenYukseklik: { ad: 'Üçgen (Taban-Yükseklik)', icon: <Triangle className="w-4 h-4" /> },
  yamuk: { ad: 'Yamuk', icon: <Square className="w-4 h-4" /> },
  paralelkenar: { ad: 'Paralelkenar', icon: <Square className="w-4 h-4" /> },
  eskenarDortgen: { ad: 'Eşkenar Dörtgen', icon: <Square className="w-4 h-4" /> },
  elips: { ad: 'Elips', icon: <Circle className="w-4 h-4" /> },
};

type SekilKey = keyof typeof sekiller;

type SonucType = {
  alan: number;
  cevre: number;
  formulAlan: string;
  formulCevre: string;
};

const sekilBilgileri: Record<SekilKey, { aciklama: string; arama: string[] }> = {
  kare: {
    aciklama: 'Kare alanı ve çevresi tek kenar uzunluğuna göre hesaplanır.',
    arama: ['kare alan hesaplama', 'kare çevresi hesaplama'],
  },
  dikdortgen: {
    aciklama: 'Dikdörtgende alan uzun kenar ile kısa kenarın çarpımıdır.',
    arama: ['dikdörtgen alan hesaplama', 'dikdörtgen çevresi nasıl bulunur'],
  },
  daire: {
    aciklama: 'Dairede alan ve çevre hesaplaması yarıçap üzerinden yapılır.',
    arama: ['daire alanı hesaplama', 'çember çevresi hesaplama'],
  },
  ucgen: {
    aciklama: 'Üçgende üç kenar biliniyorsa Heron formülü ile alan bulunabilir.',
    arama: ['üçgen alan hesaplama', 'heron formülü'],
  },
  ucgenYukseklik: {
    aciklama: 'Taban ve yükseklik biliniyorsa üçgen alanı doğrudan hesaplanır.',
    arama: ['üçgen alanı taban yükseklik', 'üçgen alan formülü'],
  },
  yamuk: {
    aciklama: 'Yamuk alanı üst taban, alt taban ve yükseklik ile hesaplanır.',
    arama: ['yamuk alan hesaplama', 'yamuk formülü'],
  },
  paralelkenar: {
    aciklama: 'Paralelkenarda alan taban ile yüksekliğin çarpımıdır.',
    arama: ['paralelkenar alan hesaplama', 'paralelkenar formülü'],
  },
  eskenarDortgen: {
    aciklama: 'Eşkenar dörtgende köşegenler ile alan, köşegenlerden türetilen kenar ile çevre bulunur.',
    arama: ['eşkenar dörtgen alanı', 'eşkenar dörtgen çevresi'],
  },
  elips: {
    aciklama: 'Elipste alan büyük ve küçük yarı eksen ile, çevre ise yaklaşık formülle bulunur.',
    arama: ['elips alanı hesaplama', 'elips çevresi formülü'],
  },
};

export default function AlanCevreHesaplama() {
  const [sekil, setSekil] = useState<SekilKey>('dikdortgen');
  const [birim, setBirim] = useState('cm');
  const [formData, setFormData] = useState({ a: '', b: '', c: '', h: '', r: '', d1: '', d2: '' });
  const [sonuc, setSonuc] = useState<SonucType | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const aktifBilgi = useMemo(() => sekilBilgileri[sekil], [sekil]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setHata(null);
  };

  const hesapla = () => {
    const a = parseLocalizedNumber(formData.a);
    const b = parseLocalizedNumber(formData.b);
    const c = parseLocalizedNumber(formData.c);
    const h = parseLocalizedNumber(formData.h);
    const r = parseLocalizedNumber(formData.r);
    const d1 = parseLocalizedNumber(formData.d1);
    const d2 = parseLocalizedNumber(formData.d2);

    let alan = 0;
    let cevre = 0;
    let formulAlan = '';
    let formulCevre = '';

    try {
      switch (sekil) {
        case 'kare':
          if (isNaN(a)) return;
          alan = a * a;
          cevre = 4 * a;
          formulAlan = `A = a² = ${a}²`;
          formulCevre = `Ç = 4a = 4 × ${a}`;
          break;

        case 'dikdortgen':
          if (isNaN(a) || isNaN(b)) return;
          alan = a * b;
          cevre = 2 * (a + b);
          formulAlan = `A = a × b = ${a} × ${b}`;
          formulCevre = `Ç = 2(a + b) = 2(${a} + ${b})`;
          break;

        case 'daire':
          if (isNaN(r)) return;
          alan = Math.PI * Math.pow(r, 2);
          cevre = 2 * Math.PI * r;
          formulAlan = `A = πr² = π × ${r}²`;
          formulCevre = `Ç = 2πr = 2 × π × ${r}`;
          break;

        case 'ucgen':
          if (isNaN(a) || isNaN(b) || isNaN(c)) return;
          if (a + b <= c || a + c <= b || b + c <= a) {
            setHata('Geçersiz üçgen: İki kenarın toplamı üçüncü kenardan büyük olmalıdır.');
            setSonuc(null);
            return;
          }
          const s = (a + b + c) / 2;
          alan = Math.sqrt(s * (s - a) * (s - b) * (s - c));
          cevre = a + b + c;
          formulAlan = `A = √[s(s-a)(s-b)(s-c)]`;
          formulCevre = `Ç = a + b + c = ${a} + ${b} + ${c}`;
          break;

        case 'ucgenYukseklik':
          if (isNaN(a) || isNaN(h)) return;
          alan = (a * h) / 2;
          cevre = 0;
          formulAlan = `A = (a × h) / 2 = (${a} × ${h}) / 2`;
          formulCevre = `Çevre için diğer kenar bilgileri gerekir`;
          break;

        case 'yamuk':
          if (isNaN(a) || isNaN(b) || isNaN(h)) return;
          alan = ((a + b) * h) / 2;
          cevre = 0;
          formulAlan = `A = [(a + b) × h] / 2`;
          formulCevre = `Çevre için yan kenarlar gerekir`;
          break;

        case 'paralelkenar':
          if (isNaN(a) || isNaN(h)) return;
          alan = a * h;
          cevre = 0;
          formulAlan = `A = a × h`;
          formulCevre = `Çevre için diğer kenar gerekir`;
          break;

        case 'eskenarDortgen':
          if (isNaN(d1) || isNaN(d2)) return;
          alan = (d1 * d2) / 2;
          const kenar = Math.sqrt(Math.pow(d1 / 2, 2) + Math.pow(d2 / 2, 2));
          cevre = kenar * 4;
          formulAlan = `A = (d₁ × d₂) / 2`;
          formulCevre = `Ç = 4 × √[(d₁/2)² + (d₂/2)²]`;
          break;

        case 'elips':
          if (isNaN(a) || isNaN(b)) return;
          alan = Math.PI * a * b;
          const hElips = Math.pow(a - b, 2) / Math.pow(a + b, 2);
          cevre = Math.PI * (a + b) * (1 + (3 * hElips) / (10 + Math.sqrt(4 - 3 * hElips)));
          formulAlan = `A = π × a × b`;
          formulCevre = `Ç ≈ π(a + b)`;
          break;
      }

      setSonuc({ alan, cevre, formulAlan, formulCevre });
      setHata(null);
    } catch {
      setHata('Hesaplama hatası oluştu.');
      setSonuc(null);
    }
  };

  const sifirla = () => {
    setFormData({ a: '', b: '', c: '', h: '', r: '', d1: '', d2: '' });
    setSonuc(null);
    setHata(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="calc-box">
        <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <Calculator className="text-orange-500" />
              Geometrik Alan ve Çevre Hesaplayıcı
            </h2>
            <p className="calc-prose mt-1">{aktifBilgi.aciklama}</p>
          </div>

          <select
            value={birim}
            onChange={(e) => setBirim(e.target.value)}
            className="p-2 px-3 rounded-lg text-sm outline-none calc-panel focus:ring-2 focus:ring-orange-500/30"
            aria-label="Ölçü birimi"
          >
            {birimler.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Object.entries(sekiller).map(([key, val]) => {
            const aktif = sekil === key;

            return (
              <button
                key={key}
                onClick={() => {
                  setSekil(key as SekilKey);
                  setSonuc(null);
                  setHata(null);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 ${
                  aktif
                    ? 'border-orange-500 bg-orange-500/10 text-orange-500 shadow-sm'
                    : 'calc-soft border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)]'
                }`}
                type="button"
              >
                {val.icon}
                <span className="text-[10px] font-bold uppercase text-center">{val.ad}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 calc-soft p-6 rounded-2xl border border-dashed border-[var(--border)]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {sekil === 'kare' && <InputField label="Kenar (a)" name="a" value={formData.a} onChange={handleChange} />}
            {sekil === 'dikdortgen' && (
              <>
                <InputField label="Uzun Kenar (a)" name="a" value={formData.a} onChange={handleChange} />
                <InputField label="Kısa Kenar (b)" name="b" value={formData.b} onChange={handleChange} />
              </>
            )}
            {sekil === 'daire' && <InputField label="Yarıçap (r)" name="r" value={formData.r} onChange={handleChange} />}
            {sekil === 'ucgen' && (
              <>
                <InputField label="Kenar a" name="a" value={formData.a} onChange={handleChange} />
                <InputField label="Kenar b" name="b" value={formData.b} onChange={handleChange} />
                <InputField label="Kenar c" name="c" value={formData.c} onChange={handleChange} />
              </>
            )}
            {(sekil === 'ucgenYukseklik' || sekil === 'paralelkenar') && (
              <>
                <InputField label="Taban (a)" name="a" value={formData.a} onChange={handleChange} />
                <InputField label="Yükseklik (h)" name="h" value={formData.h} onChange={handleChange} />
              </>
            )}
            {sekil === 'yamuk' && (
              <>
                <InputField label="Üst Taban (a)" name="a" value={formData.a} onChange={handleChange} />
                <InputField label="Alt Taban (b)" name="b" value={formData.b} onChange={handleChange} />
                <InputField label="Yükseklik (h)" name="h" value={formData.h} onChange={handleChange} />
              </>
            )}
            {sekil === 'eskenarDortgen' && (
              <>
                <InputField label="Köşegen 1 (d1)" name="d1" value={formData.d1} onChange={handleChange} />
                <InputField label="Köşegen 2 (d2)" name="d2" value={formData.d2} onChange={handleChange} />
              </>
            )}
            {sekil === 'elips' && (
              <>
                <InputField label="Büyük Yarı Eksen (a)" name="a" value={formData.a} onChange={handleChange} />
                <InputField label="Küçük Yarı Eksen (b)" name="b" value={formData.b} onChange={handleChange} />
              </>
            )}
          </div>

          {hata && <div className="calc-warn text-sm font-medium">{hata}</div>}

          <div className="flex gap-2 pt-2">
            <button
              onClick={hesapla}
              className="flex-1 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              type="button"
            >
              HESAPLA
            </button>

            <button
              onClick={sifirla}
              className="p-3 rounded-xl transition-colors calc-panel hover:brightness-[1.03] text-[var(--muted-foreground)]"
              type="button"
              title="Sıfırla"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="calc-panel p-4 rounded-xl">
            <div className="flex items-start gap-3 text-sm text-[var(--muted-foreground)]">
              <Info className="w-8 h-8 text-sky-500 shrink-0" />
              <p>
                Seçtiğiniz <strong className="text-[var(--foreground)]">{sekiller[sekil].ad}</strong> için değerleri
                girin. Ondalıklı sayılar için virgül veya nokta kullanabilirsiniz.
              </p>
            </div>
          </div>

          <div className="calc-box-accent">
            <h3 className="font-bold text-[var(--foreground)] mb-2">Bu şekil için sık aramalar</h3>
            <ul className="space-y-2 calc-prose">
              {aktifBilgi.arama.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {sonuc && (
        <>
          <div aria-live="polite" className="sr-only">
            Alan sonucu {formatSmartNumber(sonuc.alan)} {birim} kare. Çevre sonucu{' '}
            {sonuc.cevre === 0 ? 'hesaplanamadı' : `${formatSmartNumber(sonuc.cevre)} ${birim}`}.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            <ResultCard title="ALAN" value={sonuc.alan} unit={`${birim}²`} formula={sonuc.formulAlan} color="emerald" />
            <ResultCard title="ÇEVRE" value={sonuc.cevre} unit={birim} formula={sonuc.formulCevre} color="blue" />
          </div>
        </>
      )}

      <section className="calc-box space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="calc-section-title">{sekiller[sekil].ad} nasıl hesaplanır?</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">{aktifBilgi.aciklama}</p>
          </div>
          <div className="calc-soft rounded-xl p-4">
            <p className="calc-prose">
              Hesaplama sonrasında hem formül gösterilir hem de sonuçlar seçtiğiniz birime göre listelenir.
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
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="calc-muted text-[11px] font-bold uppercase tracking-wider">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2.5 rounded-lg outline-none font-semibold calc-panel focus:ring-2 focus:ring-orange-500/30 text-[var(--foreground)]"
        placeholder="0.00"
      />
    </div>
  );
}

function ResultCard({
  title,
  value,
  unit,
  formula,
  color,
}: {
  title: string;
  value: number;
  unit: string;
  formula: string;
  color: 'emerald' | 'blue';
}) {
  const colorMap = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} p-6 rounded-2xl shadow-xl text-white relative overflow-hidden`}>
      <div className="relative z-10">
        <span className="text-[10px] font-black opacity-60 tracking-[0.2em]">{title}</span>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-4xl font-black tabular-nums">
            {value === 0 ? '---' : formatSmartNumber(value, 'tr-TR', 4)}
          </span>
          <span className="text-lg font-bold opacity-80">{value === 0 ? '' : unit}</span>
        </div>

        <p className="text-[11px] mt-4 font-mono bg-black/10 p-2 rounded-lg inline-block">{formula}</p>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
        <Calculator size={100} />
      </div>
    </div>
  );
}