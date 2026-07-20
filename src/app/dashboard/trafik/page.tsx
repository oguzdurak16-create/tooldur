"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { categories, tools, type Tool } from "@/data/tools";
import {
  clearZeroSearches,
  getZeroSearches,
  normalizeSearchTerm,
  recordZeroSearch,
  type ZeroSearchRecord,
} from "@/lib/searchInsights";

const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toolScore(tool: Tool) {
  return (tool.featured ? 40 : 0) + (tool.popular ? 26 : 0) + (tool.new ? 18 : 0) + (tool.toleranceGuide ? 10 : 0);
}

function relatedTools(tool: Tool) {
  return tools
    .filter((item) => item.category === tool.category && item.id !== tool.id)
    .sort((a, b) => toolScore(b) - toolScore(a))
    .slice(0, 4);
}

function matchesTool(record: ZeroSearchRecord) {
  return tools
    .filter((tool) => {
      const haystack = normalizeSearchTerm(
        [tool.name, tool.shortName, tool.description, tool.slug, tool.keywords?.join(" "), tool.tags?.join(" ")]
          .filter(Boolean)
          .join(" ")
      );
      const shortName = normalizeSearchTerm(tool.shortName || tool.name);
      return haystack.includes(record.normalized) || record.normalized.includes(shortName);
    })
    .slice(0, 3);
}

function buildBrief(tool: Tool) {
  const category = categoryById[tool.category];
  const links = relatedTools(tool)
    .map((item) => `- ${item.name}: https://www.tooldur.com/arac/${item.slug}`)
    .join("\n");

  return [
    `URL: https://www.tooldur.com/arac/${tool.slug}`,
    `Hedef başlık: ${tool.name} | Ücretsiz Online Hesaplama | Tooldur`,
    `H1: ${tool.name}`,
    `Kategori: ${category?.name || tool.category}`,
    "",
    "Arama niyeti:",
    `${tool.name} arayan kullanıcı hızlı ön hesap, doğru birim ve örnek yorum ister.`,
    "",
    "Sayfa blokları:",
    "- Kısa tanım ve hangi işte kullanıldığı",
    "- Girdi alanlarının teknik açıklaması",
    "- Örnek hesap senaryosu",
    "- Sık yapılan hatalar ve kontrol notları",
    "- SSS: ücretsiz kullanım, doğruluk, proje hesabı yerine geçip geçmediği",
    "",
    "İç linkler:",
    links || "- Aynı kategoriden en yakın 3 araca link ver.",
  ].join("\n");
}

function csvEscape(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export default function TrafficDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [zeroSearches, setZeroSearches] = useState<ZeroSearchRecord[]>([]);
  const [manualIdea, setManualIdea] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;
      if (!session) {
        window.location.href = "/giris?next=/dashboard/trafik";
        return;
      }

      setZeroSearches(getZeroSearches());
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const priorityTools = useMemo(() => {
    return [...tools]
      .sort((a, b) => toolScore(b) - toolScore(a))
      .slice(0, 10);
  }, []);

  const categoryCoverage = useMemo(() => {
    return categories.map((category) => {
      const categoryTools = tools.filter((tool) => tool.category === category.id);
      const popular = categoryTools.filter((tool) => tool.popular || tool.featured).length;
      const newTools = categoryTools.filter((tool) => tool.new).length;
      const score = Math.min(100, 36 + categoryTools.length * 7 + popular * 6 + newTools * 3);
      return { category, categoryTools, popular, newTools, score };
    });
  }, []);

  const gapRows = useMemo(() => {
    return zeroSearches.map((record) => ({
      record,
      suggestions: matchesTool(record),
      intent: matchesTool(record).length ? "Mevcut araca bağla" : "Yeni araç adayı",
    }));
  }, [zeroSearches]);

  const totalGapCount = zeroSearches.reduce((sum, item) => sum + item.count, 0);

  const showStatus = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2400);
  };

  const addManualIdea = () => {
    if (!manualIdea.trim()) return;
    recordZeroSearch(manualIdea, "traffic-panel");
    setZeroSearches(getZeroSearches());
    setManualIdea("");
    showStatus("Fırsat kaydedildi.");
  };

  const clearIdeas = () => {
    if (!confirm("Arama fırsatları temizlensin mi?")) return;
    clearZeroSearches();
    setZeroSearches([]);
    showStatus("Liste temizlendi.");
  };

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showStatus(message);
    } catch {
      window.prompt("Metni kopyala:", text);
    }
  };

  const exportCsv = () => {
    const rows = [
      ["query", "count", "source", "path", "first_at", "last_at"],
      ...zeroSearches.map((record) => [
        record.query,
        record.count,
        record.source,
        record.path,
        record.firstAt,
        record.lastAt,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tooldur-arama-firsatlari.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    showStatus("CSV hazırlandı.");
  };

  const growthPlan = [
    "Tooldur trafik planı",
    "",
    "Öncelikli arama boşlukları:",
    ...(gapRows.length
      ? gapRows.slice(0, 8).map((row, index) => `${index + 1}. ${row.record.query} (${row.record.count} kez) - ${row.intent}`)
      : ["Henüz sıfır sonuç araması yok."]),
    "",
    "Öncelikli içerik briefleri:",
    ...priorityTools.slice(0, 8).map((tool, index) => `${index + 1}. ${tool.name} - https://www.tooldur.com/arac/${tool.slug}`),
    "",
    "Uygulama sırası:",
    "1. Sıfır sonuç aramalarını yeni araç veya içerik başlığına çevir.",
    "2. Popüler araçlara örnek hesap ve SSS genişletmesi ekle.",
    "3. Aynı kategorideki araçlar arasında çift yönlü iç linkleri güçlendir.",
    "4. Araclar ve kategori sayfalarının schema çıktısını Search Console ile izle.",
  ].join("\n");

  if (loading) {
    return (
      <main className="traffic-page traffic-loading">
        <div className="traffic-spinner" />
        <style>{pageCss}</style>
      </main>
    );
  }

  return (
    <main className="traffic-page">
      <style>{pageCss}</style>

      <div className="traffic-shell">
        <section className="traffic-hero">
          <div className="traffic-title">
            <Link href="/dashboard" className="traffic-back" aria-label="Panele dön">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <span className="traffic-kicker">
                <BarChart3 size={15} /> Pro panel
              </span>
              <h1>Trafik Merkezi</h1>
              <p>Arama boşluklarını, içerik brieflerini ve iç link kümelerini tek operasyon ekranında takip et.</p>
            </div>
          </div>

          <div className="traffic-actions">
            <button type="button" onClick={() => copyText(growthPlan, "Trafik planı kopyalandı.")}>
              <Clipboard size={16} /> Planı kopyala
            </button>
            <button type="button" onClick={exportCsv} disabled={zeroSearches.length === 0}>
              <Download size={16} /> CSV
            </button>
            <Link href="/araclar">
              <ArrowUpRight size={16} /> Araçlar
            </Link>
          </div>
        </section>

        {status && (
          <div className="traffic-toast">
            <CheckCircle2 size={16} /> {status}
          </div>
        )}

        <section className="traffic-stats" aria-label="Trafik özeti">
          <div className="traffic-stat">
            <span>Yayındaki araç</span>
            <strong>{tools.length}</strong>
          </div>
          <div className="traffic-stat">
            <span>Kategori</span>
            <strong>{categories.length}</strong>
          </div>
          <div className="traffic-stat accent">
            <span>Arama fırsatı</span>
            <strong>{totalGapCount}</strong>
          </div>
          <div className="traffic-stat">
            <span>Brief kuyruğu</span>
            <strong>{priorityTools.length}</strong>
          </div>
        </section>

        <section className="traffic-grid">
          <div className="traffic-panel wide">
            <div className="traffic-panel-head">
              <div>
                <span><Search size={14} /> Zero-search</span>
                <h2>Arama Boşlukları</h2>
              </div>
              {zeroSearches.length > 0 && (
                <button type="button" className="traffic-danger" onClick={clearIdeas}>
                  <Trash2 size={15} /> Temizle
                </button>
              )}
            </div>

            <div className="traffic-input-row">
              <input
                value={manualIdea}
                onChange={(event) => setManualIdea(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addManualIdea();
                }}
                placeholder="Yeni araç veya içerik fırsatı gir..."
              />
              <button type="button" onClick={addManualIdea}>
                <Plus size={16} /> Ekle
              </button>
            </div>

            {gapRows.length === 0 ? (
              <div className="traffic-empty">
                <Lightbulb size={30} />
                <h3>Henüz yakalanan boşluk yok</h3>
                <p>Araç aramasında sonuç bulunmayan kelimeler burada birikir.</p>
              </div>
            ) : (
              <div className="traffic-gap-list">
                {gapRows.slice(0, 12).map(({ record, suggestions, intent }) => (
                  <article key={record.id} className="traffic-gap">
                    <div>
                      <div className="traffic-gap-title">
                        <strong>{record.query}</strong>
                        <span>{record.count} kez</span>
                      </div>
                      <p>
                        {intent} · {record.source} · {formatDate(record.lastAt)}
                      </p>
                    </div>
                    <div className="traffic-gap-links">
                      {suggestions.length > 0 ? (
                        suggestions.map((tool) => (
                          <Link key={tool.id} href={`/arac/${tool.slug}`}>
                            {tool.shortName}
                          </Link>
                        ))
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            copyText(
                              `Yeni araç adayı: ${record.query}\nHedef URL önerisi: /arac/${normalizeSearchTerm(record.query).replace(/\s+/g, "-")}-hesaplama\nKaynak: ${record.source}`,
                              "Yeni araç fikri kopyalandı."
                            )
                          }
                        >
                          Brief kopyala
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="traffic-panel">
            <div className="traffic-panel-head">
              <div>
                <span><Gauge size={14} /> Kapsama</span>
                <h2>Kategori Gücü</h2>
              </div>
            </div>

            <div className="traffic-coverage-list">
              {categoryCoverage.map(({ category, categoryTools, popular, score }) => (
                <article key={category.id} className="traffic-coverage">
                  <div>
                    <strong>{category.name}</strong>
                    <span>{categoryTools.length} araç · {popular} öncelikli</span>
                  </div>
                  <div className="traffic-meter" aria-hidden="true">
                    <span style={{ width: `${score}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="traffic-panel">
          <div className="traffic-panel-head">
            <div>
              <span><FileText size={14} /> İçerik</span>
              <h2>SEO Brief Kuyruğu</h2>
            </div>
          </div>

          <div className="traffic-brief-grid">
            {priorityTools.map((tool) => {
              const category = categoryById[tool.category];
              return (
                <article key={tool.id} className="traffic-brief">
                  <div className="traffic-brief-top">
                    <span>{category?.name || tool.category}</span>
                    <div>
                      {tool.featured && <em>Öne çıkan</em>}
                      {tool.popular && <em>Popüler</em>}
                      {tool.new && <em>Yeni</em>}
                    </div>
                  </div>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <div className="traffic-brief-links">
                    {relatedTools(tool).slice(0, 3).map((related) => (
                      <Link key={related.id} href={`/arac/${related.slug}`}>
                        {related.shortName}
                      </Link>
                    ))}
                  </div>
                  <button type="button" onClick={() => copyText(buildBrief(tool), "Brief kopyalandı.")}>
                    <Clipboard size={15} /> Brief kopyala
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="traffic-panel">
          <div className="traffic-panel-head">
            <div>
              <span><GitBranch size={14} /> İç link</span>
              <h2>Kategori Link Kümeleri</h2>
            </div>
          </div>

          <div className="traffic-link-grid">
            {categories.map((category) => {
              const categoryTools = tools
                .filter((tool) => tool.category === category.id)
                .sort((a, b) => toolScore(b) - toolScore(a))
                .slice(0, 5);
              return (
                <article key={category.id} className="traffic-link-cluster">
                  <div className="traffic-cluster-icon">
                    <Layers3 size={18} />
                  </div>
                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <div>
                      {categoryTools.map((tool) => (
                        <Link key={tool.id} href={`/arac/${tool.slug}`}>
                          {tool.shortName}
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

const pageCss = `
.traffic-page{
  min-height:100vh;
  background:
    linear-gradient(rgba(148,163,184,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,184,.045) 1px, transparent 1px),
    var(--bg,#070b14);
  background-size:56px 56px,56px 56px,auto;
  color:var(--ink,#f8fafc);
  padding:22px 16px 110px;
}
.traffic-shell{max-width:1320px;margin:0 auto;}
.traffic-loading{display:grid;place-items:center;}
.traffic-spinner{width:38px;height:38px;border-radius:50%;border:3px solid rgba(148,163,184,.2);border-top-color:var(--amber,#ffb11b);animation:trafficSpin .8s linear infinite;}
@keyframes trafficSpin{to{transform:rotate(360deg)}}
.traffic-hero{display:flex;justify-content:space-between;align-items:stretch;gap:18px;margin-bottom:16px;padding:22px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:22px;background:linear-gradient(135deg,rgba(17,24,39,.94),rgba(15,23,42,.74));box-shadow:0 24px 70px rgba(0,0,0,.22);}
.traffic-title{display:flex;gap:16px;align-items:flex-start;min-width:0;}
.traffic-back{width:44px;height:44px;display:grid;place-items:center;flex-shrink:0;border-radius:14px;background:rgba(15,23,42,.78);border:1px solid var(--border-mid,rgba(148,163,184,.22));color:var(--ink-2,#dbe3f2);text-decoration:none;}
.traffic-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:10px;padding:7px 11px;border-radius:999px;color:#2dd4a0;background:rgba(45,212,160,.09);border:1px solid rgba(45,212,160,.18);font-size:12px;font-weight:850;}
.traffic-title h1{margin:0;color:var(--ink,#f8fafc);font-size:clamp(30px,4vw,46px);line-height:1;font-weight:950;}
.traffic-title p{margin:10px 0 0;color:var(--ink-4,#69748b);font-size:14px;line-height:1.65;max-width:640px;}
.traffic-actions{display:flex;align-items:flex-start;justify-content:flex-end;gap:9px;flex-wrap:wrap;min-width:310px;}
.traffic-actions button,.traffic-actions a,.traffic-input-row button,.traffic-brief button,.traffic-danger,.traffic-gap-links button{height:42px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 13px;border-radius:13px;border:1px solid var(--border-mid,rgba(148,163,184,.22));background:rgba(15,23,42,.72);color:var(--ink-2,#dbe3f2);font-weight:850;text-decoration:none;cursor:pointer;}
.traffic-actions button:first-child,.traffic-input-row button{background:var(--amber,#ffb11b);border-color:var(--amber,#ffb11b);color:#0a0a0f;}
.traffic-actions button:disabled{opacity:.45;cursor:not-allowed;}
.traffic-toast{display:inline-flex;align-items:center;gap:8px;margin-bottom:14px;padding:10px 13px;border:1px solid rgba(45,212,160,.22);border-radius:14px;background:rgba(45,212,160,.08);color:#86efac;font-weight:800;font-size:13px;}
.traffic-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px;}
.traffic-stat{border:1px solid var(--border,rgba(148,163,184,.14));border-radius:18px;background:rgba(15,23,42,.72);padding:16px;}
.traffic-stat span{display:block;color:var(--ink-4,#69748b);font-size:12px;font-weight:800;margin-bottom:8px;}
.traffic-stat strong{display:block;color:var(--ink,#f8fafc);font-size:32px;line-height:1;font-weight:950;}
.traffic-stat.accent strong{color:#2dd4a0;}
.traffic-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(320px,.65fr);gap:16px;margin-bottom:16px;}
.traffic-panel{border:1px solid var(--border,rgba(148,163,184,.14));border-radius:22px;background:rgba(15,23,42,.72);padding:18px;box-shadow:0 20px 58px rgba(0,0,0,.18);}
.traffic-panel.wide{min-width:0;}
.traffic-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;}
.traffic-panel-head span{display:inline-flex;align-items:center;gap:7px;margin-bottom:7px;color:var(--ink-4,#69748b);font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;}
.traffic-panel-head h2{margin:0;color:var(--ink,#f8fafc);font-size:22px;font-weight:950;}
.traffic-danger{height:36px;border-color:rgba(248,113,113,.22);background:rgba(248,113,113,.07);color:#fca5a5;}
.traffic-input-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin-bottom:13px;}
.traffic-input-row input{height:46px;border-radius:14px;border:1px solid var(--border-mid,rgba(148,163,184,.22));background:rgba(8,13,24,.74);color:var(--ink,#f8fafc);outline:0;padding:0 14px;font-size:14px;}
.traffic-input-row input::placeholder{color:var(--ink-4,#69748b);}
.traffic-empty{min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px dashed var(--border-mid,rgba(148,163,184,.22));border-radius:18px;background:rgba(8,13,24,.32);padding:28px;}
.traffic-empty svg{color:var(--amber,#ffb11b);margin-bottom:12px;}
.traffic-empty h3{margin:0;color:var(--ink,#f8fafc);font-size:20px;font-weight:950;}
.traffic-empty p{margin:8px 0 0;color:var(--ink-4,#69748b);font-size:13px;}
.traffic-gap-list{display:grid;gap:10px;}
.traffic-gap{display:flex;align-items:center;justify-content:space-between;gap:14px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:16px;background:rgba(8,13,24,.34);padding:13px;}
.traffic-gap-title{display:flex;align-items:center;gap:9px;flex-wrap:wrap;}
.traffic-gap-title strong{color:var(--ink,#f8fafc);font-size:14px;}
.traffic-gap-title span{display:inline-flex;padding:4px 8px;border-radius:999px;background:rgba(45,212,160,.08);border:1px solid rgba(45,212,160,.18);color:#86efac;font-size:11px;font-weight:850;}
.traffic-gap p{margin:6px 0 0;color:var(--ink-4,#69748b);font-size:12px;}
.traffic-gap-links{display:flex;justify-content:flex-end;gap:7px;flex-wrap:wrap;max-width:360px;}
.traffic-gap-links a,.traffic-brief-links a,.traffic-link-cluster a{display:inline-flex;align-items:center;min-height:30px;padding:6px 9px;border-radius:999px;border:1px solid rgba(255,177,27,.17);background:rgba(255,177,27,.07);color:var(--amber,#ffb11b);font-size:11px;font-weight:850;text-decoration:none;}
.traffic-gap-links button{height:32px;font-size:12px;}
.traffic-coverage-list{display:grid;gap:10px;}
.traffic-coverage{border:1px solid var(--border,rgba(148,163,184,.14));border-radius:15px;background:rgba(8,13,24,.34);padding:12px;}
.traffic-coverage div:first-child{display:flex;justify-content:space-between;gap:10px;margin-bottom:10px;}
.traffic-coverage strong{color:var(--ink,#f8fafc);font-size:13px;}
.traffic-coverage span{color:var(--ink-4,#69748b);font-size:12px;}
.traffic-meter{height:8px;border-radius:999px;overflow:hidden;background:rgba(148,163,184,.13);}
.traffic-meter span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2dd4a0,#ffb11b);}
.traffic-brief-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;}
.traffic-brief{border:1px solid var(--border,rgba(148,163,184,.14));border-radius:18px;background:rgba(8,13,24,.36);padding:15px;}
.traffic-brief-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px;}
.traffic-brief-top span{color:#2dd4a0;font-size:11px;font-weight:900;text-transform:uppercase;}
.traffic-brief-top div{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;}
.traffic-brief-top em{font-style:normal;font-size:10px;color:var(--ink-3,#9ca8bf);padding:3px 6px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:999px;background:rgba(15,23,42,.7);}
.traffic-brief h3{margin:0 0 7px;color:var(--ink,#f8fafc);font-size:16px;font-weight:950;}
.traffic-brief p{min-height:62px;margin:0 0 11px;color:var(--ink-4,#69748b);font-size:12.5px;line-height:1.55;}
.traffic-brief-links{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;}
.traffic-brief button{width:100%;height:38px;background:rgba(255,177,27,.09);border-color:rgba(255,177,27,.2);color:var(--amber,#ffb11b);}
.traffic-link-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;}
.traffic-link-cluster{display:flex;gap:13px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:18px;background:rgba(8,13,24,.36);padding:15px;}
.traffic-cluster-icon{width:42px;height:42px;display:grid;place-items:center;flex:0 0 auto;border-radius:14px;color:#93c5fd;background:rgba(147,197,253,.08);border:1px solid rgba(147,197,253,.17);}
.traffic-link-cluster h3{margin:0 0 6px;color:var(--ink,#f8fafc);font-size:15px;font-weight:950;}
.traffic-link-cluster p{margin:0 0 10px;color:var(--ink-4,#69748b);font-size:12.5px;line-height:1.55;}
.traffic-link-cluster div:last-child div{display:flex;gap:6px;flex-wrap:wrap;}
@media(max-width:980px){
  .traffic-hero{display:block;}
  .traffic-actions{justify-content:flex-start;min-width:0;margin-top:16px;}
  .traffic-stats{grid-template-columns:repeat(2,minmax(0,1fr));}
  .traffic-grid{grid-template-columns:1fr;}
}
@media(max-width:640px){
  .traffic-page{padding:14px 12px 102px;}
  .traffic-hero{padding:18px;border-radius:20px;}
  .traffic-title{gap:12px;}
  .traffic-back{width:40px;height:40px;}
  .traffic-title h1{font-size:32px;}
  .traffic-stats{grid-template-columns:1fr;}
  .traffic-input-row{grid-template-columns:1fr;}
  .traffic-gap{align-items:flex-start;flex-direction:column;}
  .traffic-gap-links{justify-content:flex-start;max-width:none;}
  .traffic-panel{padding:14px;border-radius:19px;}
}
`;
