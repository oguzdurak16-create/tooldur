'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Copy, Gauge, Info, Layers, Sparkles, Wrench } from 'lucide-react';
import type { Tool } from '@/data/tools';

type ProcessKey = 'torna' | 'freze' | 'taslama' | 'lazer' | 'dokum' | 'polisaj';

type RoughnessRow = { n: string; ra: number; rz: string; use: string };

const rows: RoughnessRow[] = [
  { n: 'N5', ra: 0.4, rz: '1,6 - 2,5', use: 'Hassas taşlama / hassas yataklama yüzeyi' },
  { n: 'N6', ra: 0.8, rz: '3,2 - 4', use: 'Taşlanmış hassas geçme yüzeyi' },
  { n: 'N7', ra: 1.6, rz: '6,3 - 8', use: 'İyi işlenmiş tornalama / frezeleme' },
  { n: 'N8', ra: 3.2, rz: '12,5 - 16', use: 'Genel talaşlı imalat yüzeyi' },
  { n: 'N9', ra: 6.3, rz: '25 - 32', use: 'Kaba talaşlı imalat / genel dış yüzey' },
  { n: 'N10', ra: 12.5, rz: '50 - 63', use: 'Kaba yüzey / kaynaklı imalat sonrası' },
];

const processTargets: Record<ProcessKey, { label: string; recommended: number; note: string }> = {
  torna: { label: 'Tornalama', recommended: 3.2, note: 'Genel tornalama için Ra 3,2 sık kullanılan başlangıç değeridir.' },
  freze: { label: 'Frezeleme', recommended: 3.2, note: 'Genel freze yüzeyleri için Ra 3,2 - 6,3 aralığı pratik seçilir.' },
  taslama: { label: 'Taşlama', recommended: 0.8, note: 'Yataklama ve hassas geçmelerde taşlama sonrası Ra 0,8 veya daha iyi istenebilir.' },
  lazer: { label: 'Lazer / plazma kesim', recommended: 12.5, note: 'Kesim kenarı ayrıca çapak alma ve temizleme notu gerektirebilir.' },
  dokum: { label: 'Döküm yüzey', recommended: 12.5, note: 'İşlenmeyecek döküm yüzeyler için kaba pürüzlülük ve temizleme şartı ayrı yazılmalıdır.' },
  polisaj: { label: 'Polisaj', recommended: 0.4, note: 'Sızdırmazlık, görünür yüzey veya düşük sürtünme ihtiyacında daha ince yüzey istenebilir.' },
};

const fmt = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

function nearestRow(ra: number) {
  return rows.reduce((best, item) => Math.abs(item.ra - ra) < Math.abs(best.ra - ra) ? item : best, rows[0]);
}

export default function YuzeyPuruzluluguCalculator({ tool }: { tool?: Tool }) {
  const [process, setProcess] = useState<ProcessKey>('freze');
  const [ra, setRa] = useState('3.2');
  const [copied, setCopied] = useState(false);

  const raNumber = Number(ra.replace(',', '.')) || processTargets[process].recommended;
  const row = useMemo(() => nearestRow(raNumber), [raNumber]);
  const rzApprox = raNumber * 4;
  const callout = `Yüzey pürüzlülüğü: Ra ${fmt(raNumber)} µm (${row.n} yaklaşık)\nYaklaşık Rz: ${fmt(rzApprox)} µm\nİşlem önerisi: ${processTargets[process].label}\nNot: Keskin kenarlar çapaksız olacak, ölçü ve yüzey kalite şartı teknik resimde ayrıca kontrol edilecek.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(callout);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-sky-500/10"><Gauge className="w-6 h-6 text-sky-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">{tool?.name || 'Yüzey Pürüzlülüğü Rehberi'}</h2>
            <p className="calc-prose mt-1">Ra değerini N sınıfı, yaklaşık Rz ve teknik resim notuna çevirir. İmalat yöntemi seçimine göre pratik öneri verir.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="calc-title text-sm font-semibold">İmalat yöntemi</label>
            <select value={process} onChange={(e) => { const p = e.target.value as ProcessKey; setProcess(p); setRa(String(processTargets[p].recommended)); }} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none">
              {Object.entries(processTargets).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>
          <div>
            <label className="calc-title text-sm font-semibold">Hedef Ra (µm)</label>
            <input value={ra} onChange={(e) => setRa(e.target.value.replace(/[^0-9.,]/g, ''))} inputMode="decimal" className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="calc-soft rounded-2xl p-4"><p className="text-xs calc-muted">Ra</p><p className="text-2xl font-bold text-[var(--foreground)]">{fmt(raNumber)} µm</p></div>
        <div className="calc-soft rounded-2xl p-4"><p className="text-xs calc-muted">Yaklaşık sınıf</p><p className="text-2xl font-bold text-[var(--foreground)]">{row.n}</p></div>
        <div className="calc-soft rounded-2xl p-4"><p className="text-xs calc-muted">Yaklaşık Rz</p><p className="text-2xl font-bold text-[var(--foreground)]">{fmt(rzApprox)} µm</p></div>
        <div className="calc-soft rounded-2xl p-4"><p className="text-xs calc-muted">Kullanım</p><p className="text-sm font-semibold text-[var(--foreground)] mt-1">{row.use}</p></div>
      </div>

      <div className="calc-box-accent">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:justify-between">
          <div>
            <h3 className="calc-section-title flex items-center gap-2"><Layers className="w-4 h-4" /> Teknik resim notu</h3>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl calc-soft p-4 text-sm font-mono text-[var(--foreground)] leading-relaxed">{callout}</pre>
          </div>
          <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 hover:bg-amber-400 transition">
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopyalandı' : 'Notu kopyala'}
          </button>
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Sparkles className="w-4 h-4" /> Seçim mantığı</h3><p className="calc-prose mt-2">Gereksiz düşük Ra değeri maliyeti artırır. Sadece yataklama, sızdırmazlık, sürtünme veya görünür yüzey ihtiyacı varsa daha hassas yüzey seçilmelidir.</p></div>
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Wrench className="w-4 h-4" /> İmalat uyarısı</h3><p className="calc-prose mt-2">Pürüzlülük değeri tek başına ölçü toleransı yerine geçmez. Geometrik tolerans, ölçü toleransı ve kaplama kalınlığı ayrıca değerlendirilir.</p></div>
        <div className="calc-box"><h3 className="calc-section-title flex items-center gap-2"><Info className="w-4 h-4" /> Yaklaşım</h3><p className="calc-prose mt-2">Ra-Rz ilişkisi malzeme ve işleme izine göre değişir. Buradaki Rz değeri hızlı ön kontrol içindir.</p></div>
      </section>
    </div>
  );
}
