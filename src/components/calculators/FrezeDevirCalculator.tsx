'use client';
import { useState } from 'react';
import { parseLocalizedNumber } from '@/lib/calculator-utils';
import { calculateMilling } from '@/lib/milling';

const fields = [
  { key: 'diameter', label: 'Takım çapı', unit: 'mm', value: '10' },
  { key: 'speed', label: 'Kesme hızı Vc', unit: 'm/dak', value: '120' },
  { key: 'teeth', label: 'Etkin diş adedi z', unit: 'adet', value: '4' },
  { key: 'chip', label: 'Diş başına ilerleme fz', unit: 'mm/diş', value: '0,05' },
] as const;
const number = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });
export default function FrezeDevirCalculator() {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(fields.map(f => [f.key, f.value])));
  const [answer, setAnswer] = useState<ReturnType<typeof calculateMilling> | null>(null);
  const [error, setError] = useState('');
  return <div className="calc-panel" style={{ padding: 24 }}>
    <h2 style={{ fontSize: 21, fontWeight: 750, marginBottom: 12 }}>Freze devir ve ilerleme hesabı</h2>
    <p className="calc-muted" style={{ marginBottom: 20 }}>Örnek değerleri takım üreticisinin malzeme ve operasyon önerilerine göre değiştirin.</p>
    <form onSubmit={e => { e.preventDefault(); try { setAnswer(calculateMilling(...fields.map(f => parseLocalizedNumber(values[f.key])) as [number, number, number, number])); setError(''); } catch (err) { setAnswer(null); setError(err instanceof Error ? err.message : 'Girdileri kontrol edin.'); } }}>
      <div className="grid md:grid-cols-2 gap-4">{fields.map(field => <label key={field.key} style={{ display: 'grid', gap: 8, fontSize: 14 }}>{field.label} ({field.unit})<input name={field.key} value={values[field.key]} inputMode={field.key === 'teeth' ? 'numeric' : 'decimal'} required onChange={e => { setValues(current => ({ ...current, [field.key]: e.target.value })); setAnswer(null); setError(''); }} style={{ width: '100%', minWidth: 0, minHeight: 48, border: '1px solid var(--border-mid)', borderRadius: 8, padding: 12, background: 'var(--bg-input)', color: 'var(--ink)', fontSize: 16 }} /></label>)}</div>
      <button type="submit" style={{ marginTop: 20, minHeight: 48, padding: '10px 22px', background: 'var(--action-bg)', color: 'var(--action-ink)', borderRadius: 8, fontWeight: 750 }}>Hesapla</button>
    </form>
    {error && <p role="alert" style={{ marginTop: 16 }}>{error}</p>}
    {answer && <div className="calc-result" role="status" style={{ marginTop: 24, padding: 20, borderRadius: 12 }}><p>İş mili devri <strong data-milling-rpm>{number.format(answer.rpm)} dev/dak</strong></p><p>Tabla ilerlemesi <strong data-milling-feed>{number.format(answer.feed)} mm/dak</strong></p><p>Devir başına ilerleme: {number.format(answer.feedPerRevolution)} mm/dev</p></div>}
    <p className="calc-muted" style={{ marginTop: 20, fontSize: 13, lineHeight: 1.7 }}>n = 1000 × Vc / (π × D); Vf = n × z × fz. m/dak ile mm/dak farklı büyüklüklerdir. Sonucu tezgâhın devir sınırı, takım, bağlama ve malzeme koşullarıyla doğrulayın; bu araç kesme parametresi önermez.</p>
    <a href="https://www.sandvik.coromant.com/en-gb/knowledge/milling/formulas-and-definitions" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>Kaynak: Sandvik Coromant frezeleme formülleri</a>
  </div>;
}
