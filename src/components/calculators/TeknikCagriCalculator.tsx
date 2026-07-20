'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Copy, FileText, ShieldCheck, Wrench } from 'lucide-react';
import type { Tool } from '@/data/tools';

type NoteType = 'delik' | 'dis' | 'pah' | 'kaynak' | 'sertlestirme' | 'kaplama' | 'genel';

const noteTypes: Record<NoteType, { label: string; hint: string }> = {
  delik: { label: 'Delik işleme', hint: 'Delik çapı, tolerans, pah ve çapak notu üretir.' },
  dis: { label: 'Dişli delik', hint: 'İç diş, kılavuz matkap ve derinlik notu üretir.' },
  pah: { label: 'Pah / kenar kırma', hint: 'Keskin kenar, çapak alma ve pah çağrısı üretir.' },
  kaynak: { label: 'Kaynak', hint: 'Dikiş tipi, kontrol ve temizlik notu üretir.' },
  sertlestirme: { label: 'Yüzey sertleştirme', hint: 'Sertlik, derinlik ve taşlama payı notu üretir.' },
  kaplama: { label: 'Kaplama / boya', hint: 'Kaplama türü, kalınlık ve maskeleme notu üretir.' },
  genel: { label: 'Genel imalat notu', hint: 'Genel tolerans, çapak ve kalite notu üretir.' },
};

export default function TeknikCagriCalculator({ tool }: { tool?: Tool }) {
  const [type, setType] = useState<NoteType>('delik');
  const [dimension, setDimension] = useState('Ø25 H7');
  const [depth, setDepth] = useState('');
  const [surface, setSurface] = useState('Ra 3,2');
  const [material, setMaterial] = useState('');
  const [copied, setCopied] = useState(false);

  const note = useMemo(() => {
    const d = dimension.trim() || 'ÖLÇÜ';
    const dep = depth.trim();
    const surf = surface.trim();
    const mat = material.trim();
    if (type === 'delik') return `${d} delik işlenecek.${dep ? ` Derinlik: ${dep}.` : ''} Giriş pahı 0,5×45° uygulanacak. Delik çapaksız olacak. ${surf ? `Yüzey: ${surf}.` : ''} Ölçü üretim sonrası mastar veya uygun ölçüm cihazı ile kontrol edilecek.`;
    if (type === 'dis') return `${d} iç diş açılacak.${dep ? ` Diş derinliği: ${dep}.` : ''} Kılavuz girişi pahlanacak. Dişler çapaksız ve eziksiz olacak. Karşı parça ile montaj kontrolü yapılacak.`;
    if (type === 'pah') return `Tüm keskin kenarlar çapaksız olacaktır. Belirtilmeyen kenarlara 0,5×45° pah veya R0,5 kenar kırma uygulanacaktır. Fonksiyonel kenarlar teknik resimde ayrıca belirtilen değere göre işlenecektir.`;
    if (type === 'kaynak') return `${d} kaynak dikişi uygulanacak.${mat ? ` Malzeme: ${mat}.` : ''} Kaynak sonrası cüruf, sıçrantı ve keskin çapak temizlenecek. Kritik bölgelerde gözle kontrol ve gerekiyorsa penetrant/ölçü kontrolü yapılacaktır.`;
    if (type === 'sertlestirme') return `${d} bölgesi yüzey sertleştirilecektir.${dep ? ` Etkin sertlik derinliği: ${dep}.` : ''}${mat ? ` Malzeme: ${mat}.` : ''} Sertleştirme sonrası ölçü değişimi ve taşlama payı kontrol edilecektir. Sertlik değeri ilgili şartnameye göre doğrulanacaktır.`;
    if (type === 'kaplama') return `${d} yüzeyi kaplanacaktır.${dep ? ` Kaplama kalınlığı: ${dep}.` : ''} Diş, hassas geçme ve referans yüzeyler gerekiyorsa maskelenecektir. Kaplama sonrası ölçü ve görünüm kontrolü yapılacaktır.`;
    return `Belirtilmeyen ölçüler için genel imalat toleransı uygulanacaktır. Keskin kenarlar çapaksız olacak, yüzeyler temiz teslim edilecektir. Kritik ölçüler üretim sonrası kontrol edilecek ve uygunsuzluklar raporlanacaktır.`;
  }, [type, dimension, depth, surface, material]);

  const checklist = useMemo(() => {
    if (type === 'delik') return ['Delik çapı toleransı yazıldı mı?', 'Pah ve çapak alma belirtildi mi?', 'Ölçüm yöntemi/mastar ihtiyacı net mi?'];
    if (type === 'dis') return ['Diş standardı ve toleransı net mi?', 'Kör delikte dip mesafesi yeterli mi?', 'Karşı parça montajı kontrol edilecek mi?'];
    if (type === 'kaynak') return ['Dikiş tipi ve boyutu net mi?', 'Kaynak sonrası temizlik yazıldı mı?', 'Kontrol yöntemi gerekli mi?'];
    if (type === 'sertlestirme') return ['Sertlik aralığı yazıldı mı?', 'Etkin derinlik gerekli mi?', 'Taşlama/kaplama sonrası ölçü etkisi kontrol edildi mi?'];
    if (type === 'kaplama') return ['Kaplama kalınlığı yazıldı mı?', 'Maskelenecek yüzeyler belirtildi mi?', 'Kaplama sonrası ölçü etkisi kontrol edildi mi?'];
    return ['Genel tolerans standardı belirtildi mi?', 'Çapak alma notu var mı?', 'Kritik ölçüler işaretlendi mi?'];
  }, [type]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-emerald-500/10"><FileText className="w-6 h-6 text-emerald-500" /></div>
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">{tool?.name || 'Teknik Resim Çağrı Oluşturucu'}</h2>
            <p className="calc-prose mt-1">Teknik resme yazılacak imalat notlarını daha düzenli üretir. Delik, diş, kaynak, kaplama ve sertleştirme notlarını kopyalanabilir hale getirir.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="calc-title text-sm font-semibold">Çağrı tipi</label>
            <select value={type} onChange={(e) => setType(e.target.value as NoteType)} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none">
              {Object.entries(noteTypes).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
            </select>
          </div>
          <div>
            <label className="calc-title text-sm font-semibold">Ölçü / bölge</label>
            <input value={dimension} onChange={(e) => setDimension(e.target.value)} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none" placeholder="Örn: Ø25 H7" />
          </div>
          <div>
            <label className="calc-title text-sm font-semibold">Derinlik / kalınlık</label>
            <input value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none" placeholder="Örn: 20 mm" />
          </div>
          <div>
            <label className="calc-title text-sm font-semibold">Yüzey / malzeme</label>
            <input value={surface} onChange={(e) => setSurface(e.target.value)} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none" placeholder="Örn: Ra 3,2" />
          </div>
        </div>

        <div className="mt-4">
          <label className="calc-title text-sm font-semibold">Ek malzeme / şartname notu</label>
          <input value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full mt-2 px-4 py-3 rounded-xl calc-panel outline-none" placeholder="Örn: C45, galvaniz, boyalı yüzey, müşteri standardı" />
        </div>
      </div>

      <div className="calc-box-accent">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:justify-between">
          <div className="flex-1">
            <h3 className="calc-section-title flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Kopyalanabilir teknik çağrı</h3>
            <div className="mt-3 rounded-2xl calc-soft p-4 text-[var(--foreground)] leading-relaxed">{note}</div>
          </div>
          <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-slate-950 hover:bg-amber-400 transition">
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopyalandı' : 'Çağrıyı kopyala'}
          </button>
        </div>
      </div>

      <section className="grid md:grid-cols-2 gap-4">
        <div className="calc-box">
          <h3 className="calc-section-title flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Ön kontrol listesi</h3>
          <div className="mt-3 space-y-2">
            {checklist.map((item) => <div key={item} className="flex gap-2 text-sm text-[var(--foreground)]"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{item}</div>)}
          </div>
        </div>
        <div className="calc-box">
          <h3 className="calc-section-title flex items-center gap-2"><Wrench className="w-4 h-4" /> Kullanım notu</h3>
          <p className="calc-prose mt-2">Bu araç teknik resim notunu standartlaştırmak için yardımcıdır. Nihai not; firma standardı, müşteri şartnamesi, malzeme ve üretim yöntemi dikkate alınarak mühendislik onayıyla kullanılmalıdır.</p>
          <p className="calc-muted text-sm mt-3">Seçili tip: {noteTypes[type].hint}</p>
        </div>
      </section>
    </div>
  );
}
