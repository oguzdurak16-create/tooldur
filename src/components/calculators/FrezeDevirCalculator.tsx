'use client';
import { useState } from 'react';
import type { Locale } from '@/lib/siteLanguage';
import { parseLocalizedNumber } from '@/lib/calculator-utils';
import { calculateMilling } from '@/lib/milling';

const fields = [
  { key: 'diameter', label: 'Takım çapı', english: 'Tool diameter', unit: 'mm', englishUnit: 'mm', value: '10' },
  { key: 'speed', label: 'Kesme hızı Vc', english: 'Cutting speed Vc', unit: 'm/dak', englishUnit: 'm/min', value: '120' },
  { key: 'teeth', label: 'Etkin diş adedi z', english: 'Effective tooth count z', unit: 'adet', englishUnit: '', value: '4' },
  { key: 'chip', label: 'Diş başına ilerleme fz', english: 'Feed per tooth fz', unit: 'mm/diş', englishUnit: 'mm/tooth', value: '0,05' },
] as const;
export default function FrezeDevirCalculator({ locale = 'tr' }: { locale?: Locale }) {
  const en = locale === 'en';
  const number = new Intl.NumberFormat(en ? 'en-US' : 'tr-TR', { maximumFractionDigits: 2 });
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(fields.map(f => [f.key, en ? f.value.replace(',', '.') : f.value])));
  const [answer, setAnswer] = useState<ReturnType<typeof calculateMilling> | null>(null);
  const [error, setError] = useState('');
  return <div className="calc-panel" style={{ padding: 24 }}>
    <h2 style={{ fontSize: 21, fontWeight: 750, marginBottom: 12 }}>{en ? "Milling speed and feed" : "Freze devir ve ilerleme hesabı"}</h2>
    <p className="calc-muted" style={{ marginBottom: 20 }}>{en ? "Replace the example values with the tool maker’s cutting data for your material and operation." : "Örnek değerleri takım üreticisinin malzeme ve operasyon önerilerine göre değiştirin."}</p>
    <form onSubmit={e => { e.preventDefault(); try { setAnswer(calculateMilling(...fields.map(f => parseLocalizedNumber(values[f.key])) as [number, number, number, number])); setError(''); } catch (err) { setAnswer(null); setError(en ? 'Enter valid positive values and a whole tooth count.' : err instanceof Error ? err.message : 'Girdileri kontrol edin.'); } }}>
      <div className="grid md:grid-cols-2 gap-4">{fields.map(field => <label key={field.key} style={{ display: 'grid', gap: 8, fontSize: 14 }}>{en ? field.english : field.label}{(en ? field.englishUnit : field.unit) && ` (${en ? field.englishUnit : field.unit})`}<input name={field.key} value={values[field.key]} inputMode={field.key === 'teeth' ? 'numeric' : 'decimal'} required onChange={e => { setValues(current => ({ ...current, [field.key]: e.target.value })); setAnswer(null); setError(''); }} style={{ width: '100%', minWidth: 0, minHeight: 48, border: '1px solid var(--border-mid)', borderRadius: 8, padding: 12, background: 'var(--bg-input)', color: 'var(--ink)', fontSize: 16 }} /></label>)}</div>
      <button type="submit" style={{ marginTop: 20, minHeight: 48, padding: '10px 22px', background: 'var(--action-bg)', color: 'var(--action-ink)', borderRadius: 8, fontWeight: 750 }}>{en ? "Calculate" : "Hesapla"}</button>
    </form>
    {error && <p role="alert" style={{ marginTop: 16 }}>{error}</p>}
    {answer && <div className="calc-result" role="status" style={{ marginTop: 24, padding: 20, borderRadius: 12 }}><p>{en ? 'Spindle speed' : 'İş mili devri'}{' '}<strong data-milling-rpm>{number.format(answer.rpm)}{en ? ' rpm' : ' dev/dak'}</strong></p><p>{en ? 'Table feed' : 'Tabla ilerlemesi'}{' '}<strong data-milling-feed>{number.format(answer.feed)}{en ? ' mm/min' : ' mm/dak'}</strong></p><p>{en ? 'Feed per revolution:' : 'Devir başına ilerleme:'}{' '}{number.format(answer.feedPerRevolution)}{en ? ' mm/rev' : ' mm/dev'}</p></div>}
    <p className="calc-muted" style={{ marginTop: 20, fontSize: 13, lineHeight: 1.7 }}>{en ? "n = 1000 × Vc / (π × D). Vf = n × z × fz. Cutting speed is in m/min and table feed is in mm/min. Check the result against spindle limits, tooling, workholding and material conditions." : "n = 1000 × Vc / (π × D); Vf = n × z × fz. m/dak ile mm/dak farklı büyüklüklerdir. Sonucu tezgâhın devir sınırı, takım, bağlama ve malzeme koşullarıyla doğrulayın; bu araç kesme parametresi önermez."}</p>
    <a href="https://www.sandvik.coromant.com/en-gb/knowledge/milling/formulas-and-definitions" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>{en ? "Source: Sandvik Coromant milling formulas" : "Kaynak: Sandvik Coromant frezeleme formülleri"}</a>
  </div>;
}
