'use client';

import { useState } from 'react';
import { calculateSheetLayout } from '@/lib/sheet-layout';
import { formatSmartNumber, parseLocalizedNumber } from '@/lib/calculator-utils';
import styles from './SheetLayout.module.css';

const groups = [
  { title: 'Plaka', fields: [
    ['sheetWidth', 'Plaka eni (mm)', '1500'],
    ['sheetLength', 'Plaka boyu (mm)', '3500'],
    ['edge', 'Her kenardan pay (mm)', '5'],
    ['thickness', 'Kalınlık (mm)', '1,5'],
  ] },
  { title: 'Parça ve sipariş', fields: [
    ['partWidth', 'Parça eni (mm)', '423,71'],
    ['partLength', 'Parça boyu (mm)', '553,36'],
    ['gap', 'Parçalar arası boşluk (mm)', '3'],
    ['quantity', 'Sipariş adedi', '100'],
    ['pricePerKg', 'Kg fiyatı (₺, isteğe bağlı)', ''],
  ] },
] as const;

const grades = {
  st37: { label: 'St37 (S235 ailesi)', density: 7850 },
  st44: { label: 'St44 (S275 ailesi)', density: 7850 },
  st52: { label: 'St52 (S355 ailesi)', density: 7850 },
  stainless: { label: 'Paslanmaz çelik', density: 7900 },
  aluminum: { label: 'Alüminyum', density: 2700 },
} as const;

type Grade = keyof typeof grades | 'custom';
type Field = typeof groups[number]['fields'][number][0];
const initialValues = Object.fromEntries(groups.flatMap(group => group.fields.map(([key, , value]) => [key, value]))) as Record<Field, string>;
const number = (value: number) => formatSmartNumber(value, 'tr-TR', 2);
const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

export default function SheetLayoutCalculator() {
  const [values, setValues] = useState(initialValues);
  const [grade, setGrade] = useState<Grade>('st37');
  const [customDensity, setCustomDensity] = useState('7850');
  const density = grade === 'custom' ? parseLocalizedNumber(customDensity) : grades[grade].density;
  const valuesAsNumbers = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, parseLocalizedNumber(value)])) as Record<Field, number>;
  const result = calculateSheetLayout({
    ...valuesAsNumbers,
    density,
    pricePerKg: values.pricePerKg.trim() ? valuesAsNumbers.pricePerKg : null,
  });

  return (
    <section className={styles.calculator} aria-label="Sac yerleşim aracı">
      <div className={styles.fields}>
        {groups.map(group => (
          <fieldset key={group.title}>
            <legend>{group.title}</legend>
            <div className={styles.inputs}>
              {group.title === 'Plaka' && (
                <>
                  <label>
                    Sac kalitesi
                    <select value={grade} onChange={event => setGrade(event.target.value as Grade)}>
                      {Object.entries(grades).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
                      <option value="custom">Özel yoğunluk</option>
                    </select>
                  </label>
                  <label>
                    Yoğunluk (kg/m³)
                    <input
                      inputMode="decimal"
                      value={grade === 'custom' ? customDensity : String(density)}
                      onChange={event => setCustomDensity(event.target.value)}
                      readOnly={grade !== 'custom'}
                    />
                  </label>
                </>
              )}
              {group.fields.map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    inputMode={key === 'quantity' ? 'numeric' : 'decimal'}
                    maxLength={16}
                    value={values[key]}
                    onChange={event => setValues(previous => ({ ...previous, [key]: event.target.value }))}
                  />
                </label>
              ))}
            </div>
            {group.title === 'Plaka' && <p className={styles.materialNote}>St37, St44 ve St52 için hesapta 7.850 kg/m³ alınır. Kaliteye göre kg fiyatını sipariş alanına girebilirsin.</p>}
          </fieldset>
        ))}
      </div>
      <div className={styles.results} aria-live="polite">
        <h2>Yerleşim sonucu</h2>
        {!result ? <p>Ölçü ve yoğunluğu pozitif, payları sıfır veya daha büyük, sipariş adedini pozitif tam sayı olarak girin. Kenar payı plaka içinde kullanılabilir alan bırakmalı.</p> : (
          <>
            <div className={styles.metrics}>
              <div><span>Bir plakadan</span><strong>{number(result.perSheet)} adet</strong></div>
              <div><span>Tam plaka ihtiyacı</span><strong>{result.sheets === null ? '—' : number(result.sheets)}</strong></div>
              <div><span>Dolu plakada kullanım</span><strong>%{number(result.utilization)}</strong></div>
              <div><span>Siparişte fire ve kalan sac</span><strong>{result.orderUtilization === null ? '—' : '%' + number(100 - result.orderUtilization)}</strong></div>
            </div>
            <p>Düz yerleşim {number(result.straightCount)} adet · 90° yerleşim {number(result.rotatedCount)} adet</p>
            {result.perSheet === 0 ? <p>Parça, verilen kenar payıyla iki yönde de plakaya sığmıyor.</p> :
              <p>{result.useRotated ? '90° yerleşim' : 'Düz yerleşim'} · {number(result.columns)} sütun × {number(result.rows)} sıra · Plaka ağırlığı {number(result.sheetWeight)} kg</p>}
            {result.totalCost !== null && result.costPerPart !== null &&
              <p className={styles.cost}>Toplam malzeme {money.format(result.totalCost)} · Parça başına {money.format(result.costPerPart)}</p>}
          </>
        )}
      </div>
    </section>
  );
}
