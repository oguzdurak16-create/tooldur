'use client';

import { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, Clipboard, Copy, Drill, Info, Ruler, Wrench } from 'lucide-react';
import type { Tool } from '@/data/tools';

type ThreadRow = {
  size: string;
  d: number;
  pitch: number;
  tapDrill: number;
  series: 'kaba' | 'ince';
  clearanceClose: number;
  clearanceNormal: number;
  clearanceLoose: number;
};

type FitClass = 'close' | 'normal' | 'loose';
type SeriesFilter = 'all' | ThreadRow['series'];

type ClearanceSet = Pick<ThreadRow, 'clearanceClose' | 'clearanceNormal' | 'clearanceLoose'>;

const clearanceByDiameter: Record<string, ClearanceSet> = {
  '2': { clearanceClose: 2.2, clearanceNormal: 2.4, clearanceLoose: 2.6 },
  '2.5': { clearanceClose: 2.7, clearanceNormal: 2.9, clearanceLoose: 3.1 },
  '3': { clearanceClose: 3.2, clearanceNormal: 3.4, clearanceLoose: 3.6 },
  '3.5': { clearanceClose: 3.7, clearanceNormal: 3.9, clearanceLoose: 4.2 },
  '4': { clearanceClose: 4.3, clearanceNormal: 4.5, clearanceLoose: 4.8 },
  '5': { clearanceClose: 5.3, clearanceNormal: 5.5, clearanceLoose: 5.8 },
  '6': { clearanceClose: 6.4, clearanceNormal: 6.6, clearanceLoose: 7 },
  '8': { clearanceClose: 8.4, clearanceNormal: 9, clearanceLoose: 10 },
  '10': { clearanceClose: 10.5, clearanceNormal: 11, clearanceLoose: 12 },
  '12': { clearanceClose: 13, clearanceNormal: 13.5, clearanceLoose: 14.5 },
  '14': { clearanceClose: 15, clearanceNormal: 15.5, clearanceLoose: 16.5 },
  '16': { clearanceClose: 17, clearanceNormal: 17.5, clearanceLoose: 18.5 },
  '18': { clearanceClose: 19, clearanceNormal: 20, clearanceLoose: 21 },
  '20': { clearanceClose: 21, clearanceNormal: 22, clearanceLoose: 24 },
  '22': { clearanceClose: 23, clearanceNormal: 24, clearanceLoose: 26 },
  '24': { clearanceClose: 25, clearanceNormal: 26, clearanceLoose: 28 },
  '27': { clearanceClose: 28, clearanceNormal: 30, clearanceLoose: 32 },
  '30': { clearanceClose: 31, clearanceNormal: 33, clearanceLoose: 35 },
  '33': { clearanceClose: 34, clearanceNormal: 36, clearanceLoose: 38 },
  '36': { clearanceClose: 37, clearanceNormal: 39, clearanceLoose: 42 },
  '39': { clearanceClose: 40, clearanceNormal: 42, clearanceLoose: 45 },
  '42': { clearanceClose: 43, clearanceNormal: 45, clearanceLoose: 48 },
};

const rawThreads: Array<Pick<ThreadRow, 'd' | 'pitch' | 'tapDrill' | 'series'>> = [
  { d: 2, pitch: 0.4, tapDrill: 1.6, series: 'kaba' },
  { d: 2.5, pitch: 0.45, tapDrill: 2.05, series: 'kaba' },
  { d: 3, pitch: 0.5, tapDrill: 2.5, series: 'kaba' },
  { d: 3, pitch: 0.35, tapDrill: 2.65, series: 'ince' },
  { d: 3.5, pitch: 0.6, tapDrill: 2.9, series: 'kaba' },
  { d: 4, pitch: 0.7, tapDrill: 3.3, series: 'kaba' },
  { d: 4, pitch: 0.5, tapDrill: 3.5, series: 'ince' },
  { d: 5, pitch: 0.8, tapDrill: 4.2, series: 'kaba' },
  { d: 5, pitch: 0.5, tapDrill: 4.5, series: 'ince' },
  { d: 6, pitch: 1, tapDrill: 5, series: 'kaba' },
  { d: 6, pitch: 0.75, tapDrill: 5.2, series: 'ince' },
  { d: 8, pitch: 1.25, tapDrill: 6.8, series: 'kaba' },
  { d: 8, pitch: 1, tapDrill: 7, series: 'ince' },
  { d: 10, pitch: 1.5, tapDrill: 8.5, series: 'kaba' },
  { d: 10, pitch: 1.25, tapDrill: 8.8, series: 'ince' },
  { d: 10, pitch: 1, tapDrill: 9, series: 'ince' },
  { d: 12, pitch: 1.75, tapDrill: 10.2, series: 'kaba' },
  { d: 12, pitch: 1.5, tapDrill: 10.5, series: 'ince' },
  { d: 12, pitch: 1.25, tapDrill: 10.8, series: 'ince' },
  { d: 14, pitch: 2, tapDrill: 12, series: 'kaba' },
  { d: 14, pitch: 1.5, tapDrill: 12.5, series: 'ince' },
  { d: 16, pitch: 2, tapDrill: 14, series: 'kaba' },
  { d: 16, pitch: 1.5, tapDrill: 14.5, series: 'ince' },
  { d: 18, pitch: 2.5, tapDrill: 15.5, series: 'kaba' },
  { d: 18, pitch: 1.5, tapDrill: 16.5, series: 'ince' },
  { d: 20, pitch: 2.5, tapDrill: 17.5, series: 'kaba' },
  { d: 20, pitch: 2, tapDrill: 18, series: 'ince' },
  { d: 20, pitch: 1.5, tapDrill: 18.5, series: 'ince' },
  { d: 22, pitch: 2.5, tapDrill: 19.5, series: 'kaba' },
  { d: 22, pitch: 1.5, tapDrill: 20.5, series: 'ince' },
  { d: 24, pitch: 3, tapDrill: 21, series: 'kaba' },
  { d: 24, pitch: 2, tapDrill: 22, series: 'ince' },
  { d: 24, pitch: 1.5, tapDrill: 22.5, series: 'ince' },
  { d: 27, pitch: 3, tapDrill: 24, series: 'kaba' },
  { d: 27, pitch: 2, tapDrill: 25, series: 'ince' },
  { d: 30, pitch: 3.5, tapDrill: 26.5, series: 'kaba' },
  { d: 30, pitch: 2, tapDrill: 28, series: 'ince' },
  { d: 33, pitch: 3.5, tapDrill: 29.5, series: 'kaba' },
  { d: 33, pitch: 2, tapDrill: 31, series: 'ince' },
  { d: 36, pitch: 4, tapDrill: 32, series: 'kaba' },
  { d: 36, pitch: 3, tapDrill: 33, series: 'ince' },
  { d: 36, pitch: 2, tapDrill: 34, series: 'ince' },
  { d: 39, pitch: 4, tapDrill: 35, series: 'kaba' },
  { d: 39, pitch: 3, tapDrill: 36, series: 'ince' },
  { d: 42, pitch: 4.5, tapDrill: 37.5, series: 'kaba' },
  { d: 42, pitch: 3, tapDrill: 39, series: 'ince' },
];

const threadTable: ThreadRow[] = rawThreads.map((item) => ({
  ...item,
  size: `M${String(item.d).replace('.', ',')} × ${String(item.pitch).replace('.', ',')}`,
  ...clearanceByDiameter[String(item.d)],
}));

const fitLabels: Record<FitClass, string> = {
  close: 'Sıkı boşluk',
  normal: 'Normal boşluk',
  loose: 'Rahat montaj',
};

const fmt = (n: number, digits = 3) => n.toLocaleString('tr-TR', { maximumFractionDigits: digits });
const pitchDiameter = (d: number, pitch: number) => d - 0.649519 * pitch;
const internalMinorDiameter = (d: number, pitch: number) => d - 1.082532 * pitch;
const externalRootDiameter = (d: number, pitch: number) => d - 1.226869 * pitch;

function ResultCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="calc-soft rounded-2xl p-4 border border-[var(--border)]">
      <p className="text-xs calc-muted mb-1">{label}</p>
      <p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
      {note && <p className="text-xs calc-muted mt-2 leading-relaxed">{note}</p>}
    </div>
  );
}

export default function KilavuzMatkapCalculator({ tool }: { tool?: Tool }) {
  const [size, setSize] = useState('M10 × 1,5');
  const [tableQuery, setTableQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<SeriesFilter>('all');
  const [fit, setFit] = useState<FitClass>('normal');
  const [depth, setDepth] = useState('20');
  const [blindHole, setBlindHole] = useState(true);
  const [copied, setCopied] = useState(false);

  const row = useMemo(() => threadTable.find((item) => item.size === size) || threadTable[13], [size]);
  const filteredRows = useMemo(() => {
    const q = tableQuery.trim().toLocaleLowerCase('tr-TR').replace('.', ',');
    return threadTable.filter((item) => {
      const matchesQuery = !q || item.size.toLocaleLowerCase('tr-TR').includes(q);
      const matchesSeries = seriesFilter === 'all' || item.series === seriesFilter;
      return matchesQuery && matchesSeries;
    });
  }, [seriesFilter, tableQuery]);

  const clearance = fit === 'close' ? row.clearanceClose : fit === 'loose' ? row.clearanceLoose : row.clearanceNormal;
  const depthNumber = Number(depth.replace(',', '.')) || row.d * 2;
  const drillDepth = blindHole ? depthNumber + Math.max(row.d * 0.7, row.pitch * 4) : depthNumber;
  const chamfer = row.d <= 8 ? '0,5 × 45°' : row.d <= 16 ? '1 × 45°' : '1,5 × 45°';
  const d2 = pitchDiameter(row.d, row.pitch);
  const D1 = internalMinorDiameter(row.d, row.pitch);
  const d3 = externalRootDiameter(row.d, row.pitch);

  const callout = [
    `${row.size} - 6H iç diş`,
    `Kılavuz matkap: Ø${fmt(row.tapDrill)} mm`,
    `Diş derinliği: ${fmt(depthNumber)} mm`,
    blindHole ? `Ön delik derinliği: min. ${fmt(drillDepth)} mm` : 'Açık delik: parça boyunca',
    `Giriş pahı: ${chamfer}`,
    `Bağlantı boşluk deliği (${fitLabels[fit]}): Ø${fmt(clearance)} mm`,
  ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(callout);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10"><Drill className="w-6 h-6 text-amber-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">{tool?.name || 'Metrik Diş Tablosu ve Kılavuz Matkap'}</h2>
            <p className="calc-prose mt-1">Metrik vida ölçüsüne göre kılavuz matkap çapını, teorik diş dibi çaplarını, boşluk deliğini ve teknik resim çağrısını görüntüleyin.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="calc-title text-sm font-semibold flex items-center gap-2"><Ruler className="w-4 h-4" /> Vida ölçüsü</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none">
              {threadTable.map((item) => <option key={item.size}>{item.size}</option>)}
            </select>
          </div>
          <div>
            <label className="calc-title text-sm font-semibold">Montaj boşluğu</label>
            <select value={fit} onChange={(e) => setFit(e.target.value as FitClass)} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none">
              <option value="close">Sıkı boşluk</option>
              <option value="normal">Normal boşluk</option>
              <option value="loose">Rahat montaj</option>
            </select>
          </div>
          <div>
            <label className="calc-title text-sm font-semibold">Diş derinliği (mm)</label>
            <input value={depth} onChange={(e) => setDepth(e.target.value.replace(/[^0-9.,]/g, ''))} inputMode="decimal" className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none" />
          </div>
          <div>
            <label className="calc-title text-sm font-semibold">Delik tipi</label>
            <button type="button" onClick={() => setBlindHole((v) => !v)} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel text-left font-semibold">
              {blindHole ? 'Kör delik' : 'Açık delik'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <ResultCard label="Kılavuz matkap çapı" value={`Ø${fmt(row.tapDrill)} mm`} note={`${row.size} • ${row.series === 'kaba' ? 'kaba' : 'ince'} hatve P=${fmt(row.pitch)} mm`} />
        <ResultCard label="İç diş dibi D1 (teorik)" value={`Ø${fmt(D1)} mm`} note="Temel profil değeri; gerçek 6H sınır ölçüsü değildir." />
        <ResultCard label="Dış diş dibi d3 (teorik)" value={`Ø${fmt(d3)} mm`} note={`Teorik adım çapı d2/D2: Ø${fmt(d2)} mm`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ResultCard label="Boşluk deliği" value={`Ø${fmt(clearance)} mm`} note={`${fitLabels[fit]} • sıkı Ø${fmt(row.clearanceClose)} / normal Ø${fmt(row.clearanceNormal)} / rahat Ø${fmt(row.clearanceLoose)}`} />
        <ResultCard label="Ön delik derinliği" value={blindHole ? `${fmt(drillDepth)} mm` : 'Parça boyunca'} note="Kör delikte talaş ve kılavuz çıkışı için emniyet payı eklenir." />
      </div>

      <div className="calc-box-accent">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:justify-between">
          <div>
            <h3 className="calc-section-title flex items-center gap-2"><Clipboard className="w-4 h-4" /> Teknik resim çağrısı</h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl calc-soft p-4 text-sm font-mono text-[var(--foreground)] leading-relaxed">{callout}</pre>
          </div>
          <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 hover:bg-amber-400 transition">
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopyalandı' : 'Çağrıyı kopyala'}
          </button>
        </div>
      </div>

      <section className="calc-box">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="calc-section-title">Metrik diş, kılavuz matkap ve diş dibi tablosu</h3>
            <p className="calc-prose mt-1">M2–M42 kaba ve yaygın ince hatveler için ön delik, temel profil çapları ve normal cıvata boşluğu.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <select value={seriesFilter} onChange={(e) => setSeriesFilter(e.target.value as SeriesFilter)} className="calc-panel rounded-xl px-4 py-2.5 outline-none">
              <option value="all">Tüm hatveler</option>
              <option value="kaba">Kaba hatve</option>
              <option value="ince">İnce hatve</option>
            </select>
            <input value={tableQuery} onChange={(e) => setTableQuery(e.target.value)} placeholder="Örn. M10 veya 1,25" className="calc-panel rounded-xl px-4 py-2.5 outline-none" />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="calc-soft text-left">
              <tr>
                <th className="px-4 py-3">Metrik diş</th>
                <th className="px-4 py-3">Seri</th>
                <th className="px-4 py-3">Kılavuz matkap</th>
                <th className="px-4 py-3">Adım çapı d2/D2</th>
                <th className="px-4 py-3">İç diş dibi D1</th>
                <th className="px-4 py-3">Dış diş dibi d3</th>
                <th className="px-4 py-3">Normal boşluk</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((item) => (
                <tr key={item.size} className="border-t border-[var(--border)] text-[var(--foreground)]">
                  <td className="px-4 py-3 font-bold">{item.size}</td>
                  <td className="px-4 py-3 capitalize">{item.series}</td>
                  <td className="px-4 py-3 font-semibold text-amber-500">Ø{fmt(item.tapDrill)} mm</td>
                  <td className="px-4 py-3">Ø{fmt(pitchDiameter(item.d, item.pitch))} mm</td>
                  <td className="px-4 py-3">Ø{fmt(internalMinorDiameter(item.d, item.pitch))} mm</td>
                  <td className="px-4 py-3">Ø{fmt(externalRootDiameter(item.d, item.pitch))} mm</td>
                  <td className="px-4 py-3">Ø{fmt(item.clearanceNormal)} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="calc-muted mt-3 text-xs">D1, d2/D2 ve d3 sütunları ISO metrik temel profil geometrisinden hesaplanan teorik değerlerdir. Tolerans sınıfı, kaplama ve üretim yöntemi gerçek sınır ölçülerini değiştirir.</p>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Wrench className="w-4 h-4" /> Kılavuz matkap formülü</h3><p className="calc-prose mt-2">Pratik başlangıç değeri yaklaşık d − P’dir. Diş yüzdesi, malzeme ve takım üreticisinin önerisi nihai matkap çapında önceliklidir.</p></div>
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Info className="w-4 h-4" /> Metrik diş dibi hesabı</h3><p className="calc-prose mt-2">Temel profil için iç diş dibi D1 = d − 1,082532P; dış diş dibi d3 = d − 1,226869P bağıntısıyla yaklaşık gösterilir.</p></div>
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Calculator className="w-4 h-4" /> Üretim kontrolü</h3><p className="calc-prose mt-2">Kör delikte dip mesafesi, matkap uç açısı, talaş boşluğu ve tam diş boyu CNC programında ayrıca kontrol edilmelidir.</p></div>
      </section>
    </div>
  );
}
