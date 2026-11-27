'use client';

import { useId, useState, type FormEvent } from 'react';
import type { Tool } from '@/data/tools';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';
import { calculateBushingClearance, calculateBushingLoad } from '@/lib/bushing';
import type { Locale } from '@/lib/siteLanguage';

const units = { N: 1, kN: 1000, tf: 9806.65 };
type MotionKind = 'static' | 'rotation' | 'oscillation';
type Result = { items: [string, string][]; note?: string };

function NumberField({ name, label, value, optional = false, hidden = false }: {
  name: string; label: string; value?: string; optional?: boolean; hidden?: boolean;
}) {
  return <label className={hidden ? "hidden" : "block"}>
    <span className="calc-title">{label}</span>
    <input className="w-full mt-1 px-3 py-2 rounded-xl calc-panel" name={name}
      type="text" inputMode="decimal" defaultValue={value} required={!optional && !hidden} />
  </label>;
}

export default function BushingCalculator({ tool, locale = 'tr' }: { tool: Tool; locale?: Locale }) {
  const tr = locale === 'tr';
  const fit = tool.slug === 'burc-mil-boslugu-hesaplama';
  const [motion, setMotion] = useState<MotionKind>('oscillation');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState(false);
  const help = useId();
  const label = (turkish: string, english: string) => tr ? turkish : english;
  const format = (value: number, unit: string, digits = 5) => {
    const rounded = Math.abs(value) < 1e-10 ? 0 : value;
    return formatSmartNumber(rounded, tr ? 'tr-TR' : 'en-US', digits) + ' ' + unit;
  };

  function clearResult() {
    setResult(null);
    setError(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearResult();
    const data = new FormData(event.currentTarget);
    const number = (key: string) => parseLocalizedNumber(String(data.get(key) ?? ''));

    if (fit) {
      const value = calculateBushingClearance(number('boreMin'), number('boreMax'), number('shaftMin'), number('shaftMax'));
      if (!value) { setError(true); return; }

      const note = value.min > 0
        ? label('Tüm ölçü kombinasyonlarında boşluk var.', 'All size combinations leave clearance.')
        : value.max < 0
          ? label('Tüm ölçü kombinasyonlarında sıkılık var.', 'All size combinations produce interference.')
          : label('Sıfır boşluk veya boşluktan sıkılığa geçiş mümkün.', 'Zero clearance or a transition to interference is possible.');
      setResult({ items: [
        [label('En küçük çap boşluğu', 'Minimum diametral clearance'), format(value.min * 1000, 'µm')],
        [label('En büyük çap boşluğu', 'Maximum diametral clearance'), format(value.max * 1000, 'µm')],
      ], note });
      return;
    }

    const unit = data.get('unit') as keyof typeof units;
    const movingSeconds = String(data.get('movingSeconds') ?? '').trim() ? number('movingSeconds') : undefined;
    const movement = motion === 'oscillation'
      ? { kind: motion, angle: number('angle'), cyclesPerMinute: number('cycles'), movingSeconds } as const
      : motion === 'rotation' ? { kind: motion, rpm: number('rpm') } as const : { kind: motion } as const;
    const value = calculateBushingLoad(number('force') * units[unit], number('diameter'), number('length'), movement);
    if (!value) { setError(true); return; }

    const items: Result['items'] = [
      [label('İzdüşüm alanı', 'Projected area'), format(value.area, 'mm²')],
      [label('Nominal yüzey basıncı', 'Nominal bearing pressure'), format(value.pressure, 'MPa')],
    ];
    if (movement.kind !== 'static') {
      items.push(
        [label('Çevrim ortalama kayma hızı', 'Cycle-average sliding speed'), format(value.speed, 'm/s')],
        [label('Girilen basınç × çevrim ortalama hız', 'Entered-load pressure × cycle-average speed'), format(value.pv, 'MPa·m/s')],
      );
    }
    if (value.movingSpeed !== null && value.movingPv !== null) {
      items.push(
        [label('Hareket süresindeki ortalama hız', 'Average speed during motion'), format(value.movingSpeed, 'm/s')],
        [label('Girilen yükle hareket süresi PV’si', 'PV during motion at entered load'), format(value.movingPv, 'MPa·m/s')],
      );
    }
    setResult({ items });
  }

  return <div className="calc-box space-y-4">
    <form className="space-y-4" aria-describedby={help} onChange={clearResult} onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        {fit ? <>
          <NumberField name="boreMin" label={label('Takılı burç iç çapı, en küçük (mm)', 'Installed bore, minimum (mm)')} value="20,020" />
          <NumberField name="boreMax" label={label('Takılı burç iç çapı, en büyük (mm)', 'Installed bore, maximum (mm)')} value="20,050" />
          <NumberField name="shaftMin" label={label('Mil çapı, en küçük (mm)', 'Shaft diameter, minimum (mm)')} value="19,980" />
          <NumberField name="shaftMax" label={label('Mil çapı, en büyük (mm)', 'Shaft diameter, maximum (mm)')} value="20,000" />
        </> : <>
          <NumberField name="force" label={label('Tek burca gelen radyal kuvvet', 'Radial force on one bushing')} value="5" />
          <label><span className="calc-title">{label('Kuvvet birimi', 'Force unit')}</span>
            <select name="unit" defaultValue="tf" className="w-full mt-1 px-3 py-2 rounded-xl calc-panel">
              <option value="N">N</option><option value="kN">kN</option><option value="tf">{label('ton-kuvvet (tf)', 'tonne-force (tf)')}</option>
            </select>
          </label>
          <NumberField name="diameter" label={label('Burç iç çapı d (mm)', 'Bore diameter d (mm)')} value="20" />
          <NumberField name="length" label={label('Etkili yataklama boyu L (mm)', 'Effective bearing length L (mm)')} value="20" />
          <label><span className="calc-title">{label('Hareket tipi', 'Motion type')}</span>
            <select name="motion" value={motion} onChange={event => setMotion(event.target.value as MotionKind)} className="w-full mt-1 px-3 py-2 rounded-xl calc-panel">
              <option value="oscillation">{label('Salınım (ileri-geri)', 'Oscillation (back and forth)')}</option>
              <option value="rotation">{label('Sürekli dönme', 'Continuous rotation')}</option>
              <option value="static">{label('Hareketsiz', 'Stationary')}</option>
            </select>
          </label>
          <NumberField name="rpm" hidden={motion !== 'rotation'} label={label('Devir/dakika (rpm)', 'Revolutions per minute (rpm)')} />
            <NumberField name="angle" hidden={motion !== 'oscillation'} label={label('İki uç arası açı (°)', 'Angle between endpoints (°)')} value="45" />
            <NumberField name="cycles" hidden={motion !== 'oscillation'} label={label('Tam gidiş-dönüş / dakika', 'Full out-and-back cycles / minute')} value="14" />
            <NumberField name="movingSeconds" hidden={motion !== 'oscillation'} label={label('Çevrimde toplam hareket süresi (s, isteğe bağlı)', 'Total moving time per cycle (s, optional)')} optional />
        </>}
      </div>
      <p id={help} className="calc-prose">{fit
        ? label('Pres montajından sonraki burç iç çapı sınırlarını girin. Sonuç çap farkıdır. Eksi değer sıkılığı gösterir.',
          'Enter the bore limits after press fitting. Results are diametral. Negative values indicate interference.')
        : label('Açı, iki uç arasındaki tek yön hareketidir. Bir tam çevrim gidiş ve dönüşü kapsar. Girilen yük hareket boyunca sabit varsayılır. Hesap yerel kenar basıncını veya ömrü vermez.',
          'Enter the one-way angle between endpoints. A full cycle includes the return. The entered load is held constant for the calculation. Local edge pressure and wear life are outside its scope.')}</p>
      <button type="submit" className="rounded-xl bg-[#ffb11b] px-5 py-2.5 font-bold text-[#191203]">
        {label('Hesapla', 'Calculate')}
      </button>
      {error && <p role="alert" className="calc-prose">{fit
        ? label('Pozitif çaplar girin. En küçük değer en büyük değeri aşmamalı.', 'Enter positive diameters. Each minimum must be no greater than its maximum.')
        : label('Pozitif sayılar kullanın. Açı en fazla 360° olabilir. Toplam hareket süresi 60 / çevrim sayısını aşmamalı.',
          'Use positive numbers. The angle may not exceed 360°. Moving time must be no greater than 60 divided by cycles per minute.')}</p>}
    </form>
    <div aria-live="polite">{result && <div className="calc-panel rounded-xl p-4" data-result="">
      <dl className="grid gap-3 sm:grid-cols-2">{result.items.map(([name, value]) => <div key={name}>
        <dt className="calc-prose">{name}</dt><dd className="text-xl font-bold">{value}</dd>
      </div>)}</dl>
      {result.note && <p className="calc-prose mt-3">{result.note}</p>}
    </div>}</div>
  </div>;
}
