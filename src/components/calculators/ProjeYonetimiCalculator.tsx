'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  X,
  LayoutDashboard,
  List,
  BookOpen,
  Search,
  Calendar,
  User,
  Tag,
  GripVertical,
  FolderKanban,
} from 'lucide-react';

type Oncelik = 'dusuk' | 'orta' | 'yuksek';
type Durum = 'yapilacak' | 'devam' | 'inceleme' | 'tamamlandi';
type Sekme = 'dashboard' | 'kanban' | 'liste' | 'tutorial';

interface Gorev {
  id: string;
  baslik: string;
  proje: string;
  durum: Durum;
  oncelik: Oncelik;
  termin: string;
  atanan: string;
  etiket: string;
  olusturma: string;
}

interface Proje {
  id: string;
  ad: string;
  renk: string;
  emoji: string;
}

const KOLONLAR: { id: Durum; label: string; renk: string }[] = [
  { id: 'yapilacak', label: 'Yapılacak', renk: '#6b7280' },
  { id: 'devam', label: 'Devam Ediyor', renk: '#3b82f6' },
  { id: 'inceleme', label: 'İncelemede', renk: '#f59e0b' },
  { id: 'tamamlandi', label: 'Tamamlandı', renk: '#10b981' },
];

const ONCELIK_MAP: Record<
  Oncelik,
  { label: string; soft: string; color: string }
> = {
  dusuk: {
    label: 'Düşük',
    soft: 'bg-emerald-500/10',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
  orta: {
    label: 'Orta',
    soft: 'bg-amber-500/10',
    color: 'text-amber-600 dark:text-amber-400',
  },
  yuksek: {
    label: 'Yüksek',
    soft: 'bg-red-500/10',
    color: 'text-red-600 dark:text-red-400',
  },
};

const PROJE_RENKLERI = [
  '#3b82f6',
  '#10b981',
  '#ef4444',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#ec4899',
];

const PROJE_EMOJILER = [
  '📁',
  '🏗',
  '⚡',
  '🔧',
  '🏢',
  '🌿',
  '🎯',
  '🚀',
  '📐',
  '💡',
  '⚙️',
  '🔬',
];

const TUTORIAL = [
  {
    icon: '🎯',
    baslik: 'Proje Yönetimi Nedir?',
    icerik:
      'Görevleri görünür hale getirir, işleri önceliklendirir ve ekipte sorumluluğu netleştirir. Bu araç Kanban mantığıyla çalışır.',
  },
  {
    icon: '📋',
    baslik: 'Kanban Panosu',
    icerik:
      'Görevleri Yapılacak, Devam Ediyor, İncelemede ve Tamamlandı sütunları arasında sürükleyip bırakabilirsiniz.',
  },
  {
    icon: '⚡',
    baslik: 'Öncelik Sistemi',
    icerik:
      'Yüksek görevler kritik ve acil işler içindir. Orta, planlı işler içindir. Düşük ise bekleyebilen işlerdir.',
  },
  {
    icon: '📅',
    baslik: 'Termin Takibi',
    icerik:
      'Termin tarihi geçmiş görevler gecikmiş görünür. Üç gün içinde bitecek işler yaklaşan görevler olarak vurgulanır.',
  },
];

function uid() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return `id-${Date.now().toString(36)}`;
}

function yukle<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function gun(offset: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const ORNEK_PROJELER: Proje[] = [
  { id: 'ornek-proje-elektrik', ad: 'Elektrik Projesi', renk: '#3b82f6', emoji: '⚡' },
  { id: 'ornek-proje-bina-a', ad: 'Bina A', renk: '#10b981', emoji: '🏗' },
  { id: 'ornek-proje-makine-hatti', ad: 'Makine Hattı', renk: '#f59e0b', emoji: '⚙️' },
];

const ORNEK_GOREVLER: Gorev[] = [
  {
    id: 'ornek-gorev-1',
    baslik: 'Kablo kesiti hesaplamalarını kontrol et',
    proje: 'Elektrik Projesi',
    durum: 'devam',
    oncelik: 'yuksek',
    termin: gun(3),
    atanan: 'Ali K.',
    etiket: 'elektrik',
    olusturma: gun(-5),
  },
  {
    id: 'ornek-gorev-2',
    baslik: 'Beton metrajı raporu hazırla',
    proje: 'Bina A',
    durum: 'yapilacak',
    oncelik: 'orta',
    termin: gun(7),
    atanan: 'Ayşe M.',
    etiket: 'inşaat',
    olusturma: gun(-3),
  },
  {
    id: 'ornek-gorev-3',
    baslik: 'Profil ağırlık listesi güncelle',
    proje: 'Bina A',
    durum: 'inceleme',
    oncelik: 'orta',
    termin: gun(1),
    atanan: 'Ali K.',
    etiket: 'inşaat',
    olusturma: gun(-7),
  },
  {
    id: 'ornek-gorev-4',
    baslik: 'Teknik çizim revizyonu tamamla',
    proje: 'Makine Hattı',
    durum: 'tamamlandi',
    oncelik: 'dusuk',
    termin: gun(-2),
    atanan: 'Mert S.',
    etiket: 'makine',
    olusturma: gun(-10),
  },
  {
    id: 'ornek-gorev-5',
    baslik: 'Moment hesabı raporunu sun',
    proje: 'Makine Hattı',
    durum: 'yapilacak',
    oncelik: 'yuksek',
    termin: gun(5),
    atanan: 'Mert S.',
    etiket: 'makine',
    olusturma: gun(-2),
  },
  {
    id: 'ornek-gorev-6',
    baslik: 'Rulman ömrü analizini tamamla',
    proje: 'Makine Hattı',
    durum: 'devam',
    oncelik: 'orta',
    termin: gun(4),
    atanan: 'Selin T.',
    etiket: 'makine',
    olusturma: gun(-1),
  },
  {
    id: 'ornek-gorev-7',
    baslik: 'Elektrik pano şeması çiz',
    proje: 'Elektrik Projesi',
    durum: 'tamamlandi',
    oncelik: 'yuksek',
    termin: gun(-1),
    atanan: 'Ali K.',
    etiket: 'elektrik',
    olusturma: gun(-8),
  },
  {
    id: 'ornek-gorev-8',
    baslik: 'Temel kazı hesabını doğrula',
    proje: 'Bina A',
    durum: 'yapilacak',
    oncelik: 'dusuk',
    termin: gun(14),
    atanan: '',
    etiket: 'inşaat',
    olusturma: gun(-1),
  },
];

export default function ProjeYonetimiCalculator() {
  const [gorevler, setGorevler] = useState<Gorev[]>([]);
  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [sekme, setSekme] = useState<Sekme>('dashboard');

  const [modal, setModal] = useState(false);
  const [projeModal, setProjeModal] = useState(false);
  const [editGorev, setEditGorev] = useState<Gorev | null>(null);

  const [filtrePrj, setFiltrePrj] = useState('hepsi');
  const [filtreOnc, setFiltreOnc] = useState<Oncelik | 'hepsi'>('hepsi');
  const [aramaQ, setAramaQ] = useState('');

  const [suruklenen, setSuruklenen] = useState<string | null>(null);
  const [dropHedef, setDropHedef] = useState<Durum | null>(null);

  const [yeniProjeAd, setYeniProjeAd] = useState('');
  const [yeniProjeEmoji, setYeniProjeEmoji] = useState(PROJE_EMOJILER[0]);

  const formBos: Gorev = {
    id: '',
    baslik: '',
    proje: '',
    durum: 'yapilacak',
    oncelik: 'orta',
    termin: '',
    atanan: '',
    etiket: '',
    olusturma: gun(0),
  };

  const [form, setForm] = useState<Gorev>(formBos);

  useEffect(() => {
    const p = yukle('tdpm3_projeler', ORNEK_PROJELER);
    const g = yukle('tdpm3_gorevler', ORNEK_GOREVLER);
    setProjeler(p);
    setGorevler(g);
    setForm((prev) => ({ ...prev, proje: p[0]?.ad || '' }));
  }, []);

  useEffect(() => {
    if (projeler.length) {
      localStorage.setItem('tdpm3_projeler', JSON.stringify(projeler));
    }
  }, [projeler]);

  useEffect(() => {
    if (gorevler.length || localStorage.getItem('tdpm3_gorevler')) {
      localStorage.setItem('tdpm3_gorevler', JSON.stringify(gorevler));
    }
  }, [gorevler]);

  const filtreli = useMemo(() => {
    return gorevler.filter((g) => {
      if (filtrePrj !== 'hepsi' && g.proje !== filtrePrj) return false;
      if (filtreOnc !== 'hepsi' && g.oncelik !== filtreOnc) return false;
      if (aramaQ && !g.baslik.toLowerCase().includes(aramaQ.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [gorevler, filtrePrj, filtreOnc, aramaQ]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const toplam = gorevler.length;
  const tamamlanan = gorevler.filter((g) => g.durum === 'tamamlandi').length;
  const devamEden = gorevler.filter((g) => g.durum === 'devam').length;
  const inceleme = gorevler.filter((g) => g.durum === 'inceleme').length;
  const yapilacak = gorevler.filter((g) => g.durum === 'yapilacak').length;
  const geciken = gorevler.filter(
    (g) => g.termin && g.durum !== 'tamamlandi' && new Date(g.termin) < today
  ).length;
  const yaklasan = gorevler.filter((g) => {
    if (!g.termin || g.durum === 'tamamlandi') return false;
    const fark = (new Date(g.termin).getTime() - today.getTime()) / 86400000;
    return fark >= 0 && fark <= 3;
  }).length;
  const ilerleme = toplam ? Math.round((tamamlanan / toplam) * 100) : 0;

  const projeRengi = (ad: string) =>
    projeler.find((p) => p.ad === ad)?.renk ?? '#6b7280';

  const projeEmoji = (ad: string) =>
    projeler.find((p) => p.ad === ad)?.emoji ?? '📁';

  const gorevKaydet = () => {
    if (!form.baslik.trim()) return;

    if (editGorev) {
      setGorevler((prev) =>
        prev.map((g) => (g.id === editGorev.id ? { ...form, id: editGorev.id } : g))
      );
    } else {
      setGorevler((prev) => [...prev, { ...form, id: uid(), olusturma: gun(0) }]);
    }

    setModal(false);
    setEditGorev(null);
    setForm({ ...formBos, proje: projeler[0]?.ad || '' });
  };

  const gorevSil = (id: string) =>
    setGorevler((prev) => prev.filter((g) => g.id !== id));

  const gorevDuzenle = (g: Gorev) => {
    setEditGorev(g);
    setForm({ ...g });
    setModal(true);
  };

  const durumDegistir = (id: string, durum: Durum) => {
    setGorevler((prev) => prev.map((g) => (g.id === id ? { ...g, durum } : g)));
  };

  const projeEkle = () => {
    if (!yeniProjeAd.trim()) return;
    const renk = PROJE_RENKLERI[projeler.length % PROJE_RENKLERI.length];
    setProjeler((prev) => [
      ...prev,
      {
        id: uid(),
        ad: yeniProjeAd.trim(),
        renk,
        emoji: yeniProjeEmoji,
      },
    ]);
    setYeniProjeAd('');
    setYeniProjeEmoji(PROJE_EMOJILER[0]);
  };

  const projeSil = (id: string) => {
    const proje = projeler.find((p) => p.id === id);
    if (!proje) return;
    setGorevler((prev) => prev.filter((g) => g.proje !== proje.ad));
    setProjeler((prev) => prev.filter((p) => p.id !== id));
  };

  const aciGorev = (durum?: Durum) => {
    setEditGorev(null);
    setForm({
      ...formBos,
      proje: projeler[0]?.ad || '',
      durum: durum || 'yapilacak',
    });
    setModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="calc-box">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4">
          <TabButton
            active={sekme === 'dashboard'}
            onClick={() => setSekme('dashboard')}
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
          />
          <TabButton
            active={sekme === 'kanban'}
            onClick={() => setSekme('kanban')}
            icon={<FolderKanban className="w-4 h-4" />}
            label="Kanban"
          />
          <TabButton
            active={sekme === 'liste'}
            onClick={() => setSekme('liste')}
            icon={<List className="w-4 h-4" />}
            label="Liste"
          />
          <TabButton
            active={sekme === 'tutorial'}
            onClick={() => setSekme('tutorial')}
            icon={<BookOpen className="w-4 h-4" />}
            label="Nasıl Kullanılır?"
          />

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => setProjeModal(true)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              type="button"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Proje
            </button>
            <button
              onClick={() => aciGorev()}
              className="rounded-lg px-3 py-2 text-sm font-semibold bg-amber-400 text-black hover:bg-amber-300"
              type="button"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Görev
            </button>
          </div>
        </div>

        {sekme === 'dashboard' && (
          <div className="space-y-4 pt-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Toplam" value={String(toplam)} />
              <StatCard title="Tamamlandı" value={String(tamamlanan)} accent="emerald" />
              <StatCard title="Devam" value={String(devamEden)} accent="blue" />
              <StatCard
                title="Gecikmiş"
                value={String(geciken)}
                accent={geciken > 0 ? 'red' : 'default'}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Genel İlerleme
                  </span>
                  <span className="font-mono text-amber-500">%{ilerleme}</span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${ilerleme}%` }}
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <MiniProgress label="Yapılacak" count={yapilacak} total={toplam} color="#6b7280" />
                  <MiniProgress label="Devam" count={devamEden} total={toplam} color="#3b82f6" />
                  <MiniProgress label="İnceleme" count={inceleme} total={toplam} color="#f59e0b" />
                  <MiniProgress label="Tamam" count={tamamlanan} total={toplam} color="#10b981" />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
                <div className="font-semibold text-gray-900 dark:text-white mb-3">Projeler</div>
                <div className="space-y-3">
                  {projeler.map((p) => {
                    const pt = gorevler.filter((g) => g.proje === p.ad).length;
                    const pk = gorevler.filter(
                      (g) => g.proje === p.ad && g.durum === 'tamamlandi'
                    ).length;
                    const pp = pt > 0 ? Math.round((pk / pt) * 100) : 0;

                    return (
                      <div key={p.id}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span>{p.emoji}</span>
                            <span className="text-sm text-gray-900 dark:text-white">{p.ad}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-zinc-400">%{pp}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden dark:bg-zinc-700">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pp}%`, background: p.renk }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Dikkat Gerektiren Görevler
                </span>
                <div className="flex gap-2 text-xs">
                  {yaklasan > 0 && (
                    <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-600">
                      ⏰ {yaklasan} yaklaşan
                    </span>
                  )}
                  {geciken > 0 && (
                    <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-600">
                      ⚠ {geciken} gecikmiş
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {gorevler
                  .filter((g) => g.termin && g.durum !== 'tamamlandi')
                  .sort((a, b) => a.termin.localeCompare(b.termin))
                  .slice(0, 5)
                  .map((g) => {
                    const gec = new Date(g.termin) < today;
                    return (
                      <div
                        key={g.id}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 dark:border-zinc-700"
                      >
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ background: projeRengi(g.proje) }}
                        />
                        <span>{projeEmoji(g.proje)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 dark:text-white truncate">
                            {g.baslik}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400">
                            {g.proje} · {g.atanan || 'Atanmamış'}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-mono ${
                            gec ? 'text-red-600' : 'text-amber-600'
                          }`}
                        >
                          {g.termin}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {(sekme === 'kanban' || sekme === 'liste') && (
          <div className="pt-5 space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
                <input
                  value={aramaQ}
                  onChange={(e) => setAramaQ(e.target.value)}
                  placeholder="Görev ara..."
                  className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-amber-500/20"
                />
              </div>

              <select
                value={filtrePrj}
                onChange={(e) => setFiltrePrj(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-amber-500/20"
              >
                <option value="hepsi">Tüm Projeler</option>
                {projeler.map((p) => (
                  <option key={p.id} value={p.ad}>
                    {p.emoji} {p.ad}
                  </option>
                ))}
              </select>

              <select
                value={filtreOnc}
                onChange={(e) => setFiltreOnc(e.target.value as Oncelik | 'hepsi')}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-amber-500/20"
              >
                <option value="hepsi">Tüm Öncelikler</option>
                <option value="yuksek">🔴 Yüksek</option>
                <option value="orta">🟡 Orta</option>
                <option value="dusuk">🟢 Düşük</option>
              </select>

              <span className="text-xs text-gray-500 dark:text-zinc-400">
                {filtreli.length} görev
              </span>
            </div>

            {sekme === 'kanban' ? (
              <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-4">
                {KOLONLAR.map((kol) => {
                  const kg = filtreli.filter((g) => g.durum === kol.id);
                  const isDrop = dropHedef === kol.id;

                  return (
                    <div
                      key={kol.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDropHedef(kol.id);
                      }}
                      onDrop={() => {
                        if (suruklenen) durumDegistir(suruklenen, kol.id);
                        setSuruklenen(null);
                        setDropHedef(null);
                      }}
                      onDragLeave={() => setDropHedef(null)}
                      className="rounded-xl border p-3 min-h-[220px] bg-gray-50 dark:bg-zinc-950"
                      style={{ borderColor: isDrop ? kol.renk : 'var(--border)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: kol.renk }}
                        />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
                          {kol.label}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {kg.length}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {kg.map((g) => (
                          <KanbanKart
                            key={g.id}
                            gorev={g}
                            projeRengi={projeRengi(g.proje)}
                            projeEmoji={projeEmoji(g.proje)}
                            surukleniyor={suruklenen === g.id}
                            onSil={() => gorevSil(g.id)}
                            onDuzenle={() => gorevDuzenle(g)}
                            onDragStart={() => setSuruklenen(g.id)}
                            onDragEnd={() => {
                              setSuruklenen(null);
                              setDropHedef(null);
                            }}
                            onDurumDegistir={(d) => durumDegistir(g.id, d)}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => aciGorev(kol.id)}
                        className="w-full mt-3 rounded-lg py-2 text-sm text-gray-500 hover:bg-gray-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        type="button"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Ekle
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[1.5fr,120px,120px,120px,120px,60px] gap-2 px-4 py-3 text-xs text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-700">
                    <div>Görev</div>
                    <div>Proje</div>
                    <div>Durum</div>
                    <div>Öncelik</div>
                    <div>Termin</div>
                    <div></div>
                  </div>

                  {filtreli.map((g) => (
                    <div
                      key={g.id}
                      className="grid grid-cols-[1.5fr,120px,120px,120px,120px,60px] gap-2 px-4 py-3 border-b border-gray-200 dark:border-zinc-700 items-center"
                    >
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">{g.baslik}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">
                          {g.atanan || 'Atanmamış'} · {g.etiket || 'etiketsiz'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {projeEmoji(g.proje)} {g.proje}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-zinc-300">
                        {durumEtiketi(g.durum)}
                      </div>
                      <div className="text-xs">
                        <span
                          className={`px-2 py-1 rounded-full ${ONCELIK_MAP[g.oncelik].soft} ${ONCELIK_MAP[g.oncelik].color}`}
                        >
                          {ONCELIK_MAP[g.oncelik].label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400">
                        {g.termin || '-'}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => gorevDuzenle(g)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                          type="button"
                        >
                          D
                        </button>
                        <button
                          onClick={() => gorevSil(g.id)}
                          className="text-xs text-red-500"
                          type="button"
                        >
                          S
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {sekme === 'tutorial' && (
          <div className="pt-5 grid md:grid-cols-2 gap-4">
            {TUTORIAL.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {item.baslik}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-line">
                  {item.icerik}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-zinc-400">
        ℹ Veriler tarayıcı belleğinize kaydedilir. Bu araç yerel çalışır.
      </p>

      {modal && (
        <Overlay onClose={() => setModal(false)}>
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editGorev ? 'Görevi Düzenle' : 'Yeni Görev'}
              </h3>
              <button
                onClick={() => setModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-4">
              <Field label="Başlık">
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
                  value={form.baslik}
                  onChange={(e) => setForm({ ...form, baslik: e.target.value })}
                />
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Proje">
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
                    value={form.proje}
                    onChange={(e) => setForm({ ...form, proje: e.target.value })}
                  >
                    {projeler.map((p) => (
                      <option key={p.id} value={p.ad}>
                        {p.emoji} {p.ad}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Durum">
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
                    value={form.durum}
                    onChange={(e) => setForm({ ...form, durum: e.target.value as Durum })}
                  >
                    {KOLONLAR.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Öncelik">
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
                    value={form.oncelik}
                    onChange={(e) => setForm({ ...form, oncelik: e.target.value as Oncelik })}
                  >
                    <option value="dusuk">Düşük</option>
                    <option value="orta">Orta</option>
                    <option value="yuksek">Yüksek</option>
                  </select>
                </Field>

                <Field label="Termin">
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
                    value={form.termin}
                    onChange={(e) => setForm({ ...form, termin: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Atanan">
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
                    value={form.atanan}
                    onChange={(e) => setForm({ ...form, atanan: e.target.value })}
                  />
                </Field>

                <Field label="Etiket">
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
                    value={form.etiket}
                    onChange={(e) => setForm({ ...form, etiket: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setModal(false)}
                className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                type="button"
              >
                Vazgeç
              </button>
              <button
                onClick={gorevKaydet}
                className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black hover:bg-amber-300"
                type="button"
              >
                Kaydet
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {projeModal && (
        <Overlay onClose={() => setProjeModal(false)}>
          <div className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Projeler
              </h3>
              <button
                onClick={() => setProjeModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-5">
              {projeler.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <span>{p.emoji}</span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: p.renk }}
                  />
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">
                    {p.ad}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">
                    {gorevler.filter((g) => g.proje === p.ad).length} görev
                  </span>
                  <button
                    onClick={() => projeSil(p.id)}
                    className="text-red-500"
                    type="button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Field label="Yeni Proje">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {PROJE_EMOJILER.map((e) => (
                    <button
                      key={e}
                      onClick={() => setYeniProjeEmoji(e)}
                      className={`w-9 h-9 rounded-lg border ${
                        yeniProjeEmoji === e
                          ? 'border-amber-400 bg-amber-400/10'
                          : 'border-gray-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
                      }`}
                      type="button"
                    >
                      {e}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
                    value={yeniProjeAd}
                    onChange={(e) => setYeniProjeAd(e.target.value)}
                    placeholder="Proje adı"
                  />
                  <button
                    onClick={projeEkle}
                    className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black hover:bg-amber-300"
                    type="button"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </Field>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: JSX.Element;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-2 ${
        active
          ? 'bg-amber-400/15 text-amber-500'
          : 'text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200'
      }`}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({
  title,
  value,
  accent = 'default',
}: {
  title: string;
  value: string;
  accent?: 'default' | 'emerald' | 'blue' | 'red';
}) {
  const cls =
    accent === 'emerald'
      ? 'text-emerald-500'
      : accent === 'blue'
      ? 'text-blue-500'
      : accent === 'red'
      ? 'text-red-500'
      : 'text-gray-900 dark:text-white';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="text-xs text-gray-500 dark:text-zinc-400 mb-2">{title}</div>
      <div className={`text-3xl font-bold ${cls}`}>{value}</div>
    </div>
  );
}

function MiniProgress({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-xs text-gray-500 dark:text-zinc-400 flex-1">{label}</span>
      <span className="text-xs text-gray-500 dark:text-zinc-400">{count}</span>
      <div className="w-16 h-1.5 rounded-full bg-gray-200 overflow-hidden dark:bg-zinc-700">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function KanbanKart({
  gorev,
  projeRengi,
  projeEmoji,
  surukleniyor,
  onSil,
  onDuzenle,
  onDragStart,
  onDragEnd,
  onDurumDegistir,
}: {
  gorev: Gorev;
  projeRengi: string;
  projeEmoji: string;
  surukleniyor: boolean;
  onSil: () => void;
  onDuzenle: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDurumDegistir: (d: Durum) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900 ${
        surukleniyor ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-gray-400 dark:text-zinc-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {gorev.baslik}
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span
              className="px-2 py-1 rounded-full"
              style={{ background: `${projeRengi}20`, color: projeRengi }}
            >
              {projeEmoji} {gorev.proje}
            </span>

            <span
              className={`px-2 py-1 rounded-full ${ONCELIK_MAP[gorev.oncelik].soft} ${ONCELIK_MAP[gorev.oncelik].color}`}
            >
              {ONCELIK_MAP[gorev.oncelik].label}
            </span>
          </div>

          <div className="mt-3 space-y-1 text-xs text-gray-500 dark:text-zinc-400">
            {gorev.atanan && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {gorev.atanan}
              </div>
            )}
            {gorev.etiket && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {gorev.etiket}
              </div>
            )}
            {gorev.termin && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {gorev.termin}
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-between items-center gap-2">
            <select
              value={gorev.durum}
              onChange={(e) => onDurumDegistir(e.target.value as Durum)}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:focus:ring-amber-500/20"
            >
              {KOLONLAR.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={onDuzenle}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                type="button"
              >
                Düzenle
              </button>
              <button onClick={onSil} className="text-xs text-red-500" type="button">
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Overlay({
  children,
  onClose,
}: {
  children: JSX.Element;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: JSX.Element;
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}

function durumEtiketi(durum: Durum) {
  switch (durum) {
    case 'yapilacak':
      return 'Yapılacak';
    case 'devam':
      return 'Devam';
    case 'inceleme':
      return 'İnceleme';
    case 'tamamlandi':
      return 'Tamamlandı';
    default:
      return durum;
  }
}