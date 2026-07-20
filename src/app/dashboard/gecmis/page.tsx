"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calculator,
  ChevronDown,
  Clock3,
  Cog,
  Filter,
  History,
  Layers3,
  Search,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

type HistoryRecord = {
  id: string;
  user_id?: string;
  tool_slug?: string;
  tool_name?: string;
  category?: string;
  inputs?: Record<string, unknown> | null;
  outputs?: Record<string, unknown> | null;
  summary?: string | null;
  calculated_at?: string;
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  elektrik: { label: "Elektrik", icon: Zap, color: "#e99500" },
  insaat: { label: "İnşaat", icon: Building2, color: "#fb923c" },
  makine: { label: "Makine", icon: Cog, color: "#a78bfa" },
  cevirici: { label: "Çevirici", icon: Layers3, color: "#34d399" },
  genel: { label: "Genel", icon: Calculator, color: "#f59e0b" },
};

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatFullDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCategory(record: HistoryRecord) {
  return CATEGORY_CONFIG[record.category || ""] || CATEGORY_CONFIG.genel;
}

function pairs(obj?: Record<string, unknown> | null) {
  if (!obj || typeof obj !== "object") return [] as [string, unknown][];
  return Object.entries(obj).slice(0, 12);
}

export default function GecmisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("hepsi");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      const { data } = await supabase
        .from("calculation_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("calculated_at", { ascending: false })
        .limit(200);

      setRecords((data || []) as HistoryRecord[]);
      setLoading(false);
    };

    load();
  }, [router]);

  const filtered = useMemo(() => {
    let list = records;

    if (selectedCategory !== "hepsi") {
      list = list.filter((r) => r.category === selectedCategory);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) =>
        [r.tool_name, r.summary, r.category]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return list;
  }, [records, search, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { hepsi: records.length };
    for (const r of records) {
      const k = r.category || "genel";
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }, [records]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kaydı silmek istiyor musunuz?")) return;
    await supabase.from("calculation_history").delete().eq("id", id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const handleDeleteAll = async () => {
    if (!confirm("Tüm hesaplama geçmişi silinsin mi? Bu işlem geri alınamaz.")) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from("calculation_history").delete().eq("user_id", session.user.id);
    setRecords([]);
    setExpandedId(null);
  };

  if (loading) {
    return (
      <div className="history-page history-loading">
        <div className="history-spinner" />
        <style>{pageCss}</style>
      </div>
    );
  }

  return (
    <main className="history-page">
      <style>{pageCss}</style>

      <div className="history-shell">
        <section className="history-hero">
          <div className="history-title-wrap">
            <Link href="/dashboard" className="history-back" aria-label="Panele dön">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="history-kicker">
                <History size={15} /> Panel kayıtları
              </div>
              <h1>Hesaplama Geçmişi</h1>
              <p>Son kullandığın araçları, girdileri ve sonuçları tek yerde takip et.</p>
            </div>
          </div>

          <div className="history-hero-stats">
            <div className="history-stat-card accent">
              <span>Toplam kayıt</span>
              <strong>{records.length}</strong>
            </div>
            <div className="history-stat-card">
              <span>Filtrelenen</span>
              <strong>{filtered.length}</strong>
            </div>
            {records.length > 0 && (
              <button onClick={handleDeleteAll} className="history-danger">
                <Trash2 size={15} /> Tümünü sil
              </button>
            )}
          </div>
        </section>

        <section className="history-toolbar">
          <div className="history-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Araç adı, kategori veya sonuç ara..."
            />
          </div>

          <div className="history-filter-head">
            <Filter size={15} /> Kategori
          </div>

          <div className="history-chips">
            {[{ value: "hepsi", label: "Tümü", icon: Sparkles, color: "#f59e0b" }, ...Object.entries(CATEGORY_CONFIG).map(([value, cfg]) => ({ value, ...cfg }))].map((cat) => {
              const Icon = cat.icon;
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={active ? "history-chip active" : "history-chip"}
                  style={{ ["--chip" as any]: cat.color }}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                  <em>{categoryCounts[cat.value] || 0}</em>
                </button>
              );
            })}
          </div>
        </section>

        {records.length === 0 ? (
          <section className="history-empty">
            <div className="history-empty-icon"><Clock3 size={34} /></div>
            <h2>Henüz hesaplama yok</h2>
            <p>Bir hesaplama aracı kullandığında sonuçlar otomatik olarak burada görünecek.</p>
            <Link href="/araclar" className="history-primary-btn">
              Araçları keşfet <ArrowUpRight size={17} />
            </Link>
          </section>
        ) : filtered.length === 0 ? (
          <section className="history-empty small">
            <div className="history-empty-icon"><Search size={30} /></div>
            <h2>Sonuç bulunamadı</h2>
            <p>Arama kelimesini veya kategori filtresini değiştir.</p>
          </section>
        ) : (
          <section className="history-list">
            {filtered.map((record) => {
              const cfg = getCategory(record);
              const Icon = cfg.icon;
              const isExpanded = expandedId === record.id;
              return (
                <article key={record.id} className={isExpanded ? "history-item open" : "history-item"}>
                  <button className="history-item-main" onClick={() => setExpandedId(isExpanded ? null : record.id)}>
                    <div className="history-item-icon" style={{ ["--cat" as any]: cfg.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="history-item-text">
                      <div className="history-item-top">
                        <h3>{record.tool_name || "Hesaplama"}</h3>
                        <span>{formatDate(record.calculated_at)}</span>
                      </div>
                      <p>{record.summary || "Detayları görüntülemek için aç."}</p>
                    </div>
                    <ChevronDown className="history-chevron" size={18} />
                  </button>

                  {isExpanded && (
                    <div className="history-detail">
                      <div className="history-detail-grid">
                        <div className="history-detail-box">
                          <h4>Girdiler</h4>
                          {pairs(record.inputs).length ? pairs(record.inputs).map(([k, v]) => (
                            <div key={k} className="history-kv"><span>{k}</span><strong>{String(v)}</strong></div>
                          )) : <p className="history-none">Girdi kaydı yok.</p>}
                        </div>
                        <div className="history-detail-box result">
                          <h4>Sonuçlar</h4>
                          {pairs(record.outputs).length ? pairs(record.outputs).map(([k, v]) => (
                            <div key={k} className="history-kv"><span>{k}</span><strong>{String(v)}</strong></div>
                          )) : <p className="history-none">Sonuç kaydı yok.</p>}
                        </div>
                      </div>

                      <div className="history-detail-actions">
                        <span><Activity size={13} /> {formatFullDate(record.calculated_at)}</span>
                        <div>
                          {record.tool_slug && (
                            <Link href={`/arac/${record.tool_slug}`} className="history-soft-btn">
                              Araca git <ArrowUpRight size={14} />
                            </Link>
                          )}
                          <button onClick={() => handleDelete(record.id)} className="history-delete-btn">
                            <Trash2 size={14} /> Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

const pageCss = `
.history-page{
  min-height:100vh;
  background:
    radial-gradient(circle at 82% 0%, rgba(255,177,27,.10), transparent 30%),
    linear-gradient(rgba(148,163,184,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,184,.045) 1px, transparent 1px),
    var(--bg,#070b14);
  background-size:auto,56px 56px,56px 56px,auto;
  color:var(--ink,#f8fafc);
  padding:24px 16px 110px;
}
.history-shell{max-width:1180px;margin:0 auto;}
.history-loading{display:grid;place-items:center;}
.history-spinner{width:36px;height:36px;border-radius:50%;border:3px solid rgba(148,163,184,.18);border-top-color:var(--amber,#ffb11b);animation:historySpin .8s linear infinite;}@keyframes historySpin{to{transform:rotate(360deg)}}
.history-hero{display:flex;align-items:stretch;justify-content:space-between;gap:18px;margin-bottom:18px;padding:22px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:24px;background:linear-gradient(135deg,rgba(17,24,39,.92),rgba(15,23,42,.74));box-shadow:0 24px 70px rgba(0,0,0,.24);}
.history-title-wrap{display:flex;gap:16px;align-items:flex-start;min-width:0;}
.history-back{width:44px;height:44px;display:grid;place-items:center;flex-shrink:0;border-radius:14px;background:rgba(15,23,42,.78);border:1px solid var(--border-mid,rgba(148,163,184,.22));color:var(--ink-2,#dbe3f2);text-decoration:none;}
.history-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:10px;padding:7px 11px;border-radius:999px;color:var(--amber,#ffb11b);background:rgba(255,177,27,.09);border:1px solid rgba(255,177,27,.17);font-size:12px;font-weight:800;}
.history-title-wrap h1{margin:0;color:var(--ink,#f8fafc);font-size:clamp(28px,4vw,44px);letter-spacing:-.045em;line-height:1;font-weight:950;}
.history-title-wrap p{margin:10px 0 0;color:var(--ink-4,#69748b);font-size:14px;line-height:1.6;max-width:620px;}
.history-hero-stats{display:grid;grid-template-columns:repeat(2, minmax(116px,1fr));gap:10px;align-content:start;min-width:300px;}
.history-stat-card{border-radius:18px;border:1px solid var(--border,rgba(148,163,184,.14));background:rgba(15,23,42,.62);padding:15px;}
.history-stat-card span{display:block;color:var(--ink-4,#69748b);font-size:12px;font-weight:700;margin-bottom:7px;}.history-stat-card strong{font-size:30px;color:var(--ink,#f8fafc);line-height:1;font-weight:950;}.history-stat-card.accent strong{color:var(--amber,#ffb11b)}
.history-danger{grid-column:1/-1;min-height:42px;border:1px solid rgba(248,113,113,.22);background:rgba(248,113,113,.06);color:#fca5a5;border-radius:14px;font-weight:850;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;}
.history-toolbar{padding:16px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:22px;background:rgba(15,23,42,.68);margin-bottom:18px;}
.history-search{height:52px;display:flex;align-items:center;gap:11px;padding:0 16px;border:1px solid var(--border-mid,rgba(148,163,184,.22));border-radius:16px;background:rgba(8,13,24,.74);color:var(--ink-4,#69748b);}
.history-search input{width:100%;height:100%;background:transparent;border:0;outline:0;color:var(--ink,#f8fafc);font-size:14px;}.history-search input::placeholder{color:var(--ink-4,#69748b)}
.history-filter-head{display:flex;align-items:center;gap:7px;margin:14px 0 10px;color:var(--ink-4,#69748b);font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.06em;}
.history-chips{display:flex;gap:9px;flex-wrap:wrap;}.history-chip{height:38px;display:inline-flex;align-items:center;gap:8px;padding:0 12px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:999px;background:rgba(22,31,49,.72);color:var(--ink-3,#9ca8bf);font-weight:800;cursor:pointer;}.history-chip svg{color:var(--chip)}.history-chip em{font-style:normal;color:var(--ink-4,#69748b);font-size:11px}.history-chip.active{background:color-mix(in srgb,var(--chip) 18%, rgba(15,23,42,.9));border-color:color-mix(in srgb,var(--chip) 45%, transparent);color:var(--ink,#f8fafc)}
.history-list{display:grid;gap:12px;}.history-item{border:1px solid var(--border,rgba(148,163,184,.14));border-radius:20px;background:rgba(15,23,42,.72);overflow:hidden;}.history-item.open{border-color:rgba(255,177,27,.22);box-shadow:0 20px 60px rgba(0,0,0,.20)}
.history-item-main{width:100%;display:flex;align-items:center;gap:14px;padding:16px;background:transparent;border:0;text-align:left;cursor:pointer;}.history-item-icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;flex-shrink:0;color:var(--cat);background:color-mix(in srgb,var(--cat) 12%, rgba(15,23,42,.78));border:1px solid color-mix(in srgb,var(--cat) 24%, transparent)}
.history-item-text{min-width:0;flex:1}.history-item-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.history-item h3{margin:0;color:var(--ink,#f8fafc);font-size:15px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.history-item-top span{color:var(--ink-4,#69748b);font-size:12px;font-weight:700;white-space:nowrap}.history-item p{margin:5px 0 0;color:var(--ink-4,#69748b);font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.history-chevron{color:var(--ink-4,#69748b);transition:.18s}.history-item.open .history-chevron{transform:rotate(180deg);color:var(--amber,#ffb11b)}
.history-detail{border-top:1px solid var(--border,rgba(148,163,184,.14));padding:16px;background:rgba(8,13,24,.32)}.history-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.history-detail-box{border:1px solid var(--border,rgba(148,163,184,.14));border-radius:16px;background:rgba(15,23,42,.62);padding:14px}.history-detail-box h4{margin:0 0 11px;color:var(--ink-3,#9ca8bf);font-size:11px;letter-spacing:.08em;text-transform:uppercase}.history-kv{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid rgba(148,163,184,.08)}.history-kv:last-child{border-bottom:0}.history-kv span{color:var(--ink-4,#69748b);font-size:12px}.history-kv strong{color:var(--ink-2,#dbe3f2);font-size:12px;text-align:right}.history-detail-box.result .history-kv strong{color:#34d399}.history-none{white-space:normal!important;color:var(--ink-4,#69748b)!important;margin:0!important}.history-detail-actions{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px}.history-detail-actions>span{display:flex;align-items:center;gap:7px;color:var(--ink-4,#69748b);font-size:12px}.history-detail-actions>div{display:flex;gap:8px;flex-wrap:wrap}.history-soft-btn,.history-delete-btn{height:38px;display:inline-flex;align-items:center;gap:7px;padding:0 12px;border-radius:12px;font-weight:850;text-decoration:none;cursor:pointer}.history-soft-btn{border:1px solid rgba(255,177,27,.22);background:rgba(255,177,27,.08);color:var(--amber,#ffb11b)}.history-delete-btn{border:1px solid rgba(248,113,113,.18);background:rgba(248,113,113,.06);color:#fca5a5}.history-empty{min-height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px dashed var(--border-mid,rgba(148,163,184,.22));border-radius:24px;background:rgba(15,23,42,.62);padding:28px}.history-empty.small{min-height:260px}.history-empty-icon{width:72px;height:72px;display:grid;place-items:center;border-radius:22px;color:var(--amber,#ffb11b);background:rgba(255,177,27,.08);border:1px solid rgba(255,177,27,.16);margin-bottom:16px}.history-empty h2{margin:0;color:var(--ink,#f8fafc);font-size:24px;font-weight:950}.history-empty p{max-width:420px;color:var(--ink-4,#69748b);line-height:1.6;margin:9px 0 20px}.history-primary-btn{height:46px;display:inline-flex;align-items:center;gap:8px;padding:0 18px;border-radius:14px;background:var(--amber,#ffb11b);color:#0a0a0f;text-decoration:none;font-weight:900;}
@media(max-width:760px){.history-page{padding:14px 12px 104px}.history-hero{display:block;padding:18px;border-radius:22px}.history-title-wrap{gap:12px}.history-back{width:40px;height:40px}.history-title-wrap h1{font-size:31px}.history-hero-stats{min-width:0;margin-top:16px}.history-detail-grid{grid-template-columns:1fr}.history-detail-actions{align-items:flex-start;flex-direction:column}.history-item-main{padding:13px}.history-item-icon{width:42px;height:42px}.history-item-top{align-items:flex-start;flex-direction:column;gap:3px}.history-item p{white-space:normal}.history-chips{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px}.history-chip{flex:0 0 auto}.history-toolbar{padding:12px}.history-search{height:48px}}
`;
