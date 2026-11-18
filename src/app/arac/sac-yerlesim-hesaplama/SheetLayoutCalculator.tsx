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
    ['density', 'Yoğunluk (kg/m³)', '7850'],
  ] },
  { title: 'Parça ve sipariş', fields: [
    ['partWidth', 'Parça eni (mm)', '423,71'],
    ['partLength', 'Parça boyu (mm)', '553,36'],
    ['gap', 'Parçalar arası boşluk (mm)', '3'],
    ['quantity', 'Sipariş adedi', '100'],
    ['pricePerKg', 'Kg fiyatı (₺, isteğe bağlı)', ''],
  ] },
] as const;

type Field = typeof groups[number]['fields'][number][0];
const initialValues = Object.fromEntries(groups.flatMap(group => group.fields.map(([key, , value]) => [key, value]))) as Record<Field, string>;
const number = (value: number) => formatSmartNumber(value, 'tr-TR', 2);
const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });

export default function SheetLayoutCalculator() {
  const [values, setValues] = useState(initialValues);
  const valuesAsNumbers = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, parseLocalizedNumber(value)])) as Record<Field, number>;
  const result = calculateSheetLayout({
    ...valuesAsNumbers,
    pricePerKg: values.pricePerKg.trim() ? valuesAsNumbers.pricePerKg : null,
  });

  return (
    <section className={styles.calculator} aria-label="Sac yerleşim aracı">
      <div className={styles.fields}>
        {groups.map(group => (
          <fieldset key={group.title}>
            <legend>{group.title}</legend>
            <div className={styles.inputs}>
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
