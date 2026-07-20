"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ALL_MATERIALS, CATEGORIES, SUBCATEGORIES, MaterialEntry } from "@/data/materialLibrary";
import {
  ArrowLeft, Search, Copy, Check, BookOpen, ChevronRight,
  Zap, Building2, Layers, Link2, Star, X, ExternalLink, StickyNote, Hash,
} from "lucide-react";

const CAT_ICON: Record<string, any> = {
  profil: Layers, malzeme: Hash, kablo: Zap, "bağlantı": Link2,
};
const CAT_COLOR: Record<string, string> = {
  profil: "#2d5282", malzeme: "#b45309", kablo: "#d97706", "bağlantı": "#64748b",
};

export default function KutuphanePage() {
  const [search, setSearch]               = useState("");
  const [activeCategory, setActiveCategory] = useState("hepsi");
  const [activeSub, setActiveSub]         = useState("hepsi");
  const [selected, setSelected]           = useState<MaterialEntry | null>(null);
  const [copied, setCopied]               = useState(false);
  const [copiedNote, setCopiedNote]       = useState(false);

  const results = useMemo(() => {
    let list = ALL_MATERIALS;
    if (activeCategory !== "hepsi") list = list.filter(m => m.category === activeCategory);
    if (activeSub !== "hepsi")      list = list.filter(m => m.subcategory === activeSub);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.subcategory.toLowerCase().includes(q) ||
        m.tags.some((t: string) => t.includes(q)) ||
        m.properties.some((p: any) => String(p.value).toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, activeCategory, activeSub]);

  const subcats = activeCategory !== "hepsi" ? SUBCATEGORIES[activeCategory] || [] : [];

  const handleCopyProp = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyAsNote = async () => {
    if (!selected) return;
    const note = [
      `# ${selected.name}`,
      `**Standart:** ${selected.standard || "—"}`,
      "",
      "## Özellikler",
      ...selected.properties.map((p: any) => `- **${p.label}:** ${p.value}${p.unit ? " " + p.unit : ""}`),
      selected.note ? `\n> ${selected.note}` : "",
      "",
      `*Kaynak: tooldur.com*`,
    ].join("\n");
    await navigator.clipboard.writeText(note);
    setCopiedNote(true); setTimeout(() => setCopiedNote(false), 2000);
  };

  const highlight = selected?.properties.filter((p: any) => p.highlight) || [];
  const rest      = selected?.properties.filter((p: any) => !p.highlight) || [];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6" style={{ paddingTop: 24, paddingBottom: 48 }}>

        {/* Başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Link href="/dashboard" style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", textDecoration: "none", flexShrink: 0 }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Malzeme Kütüphanesi</h1>
            <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0 }}>{ALL_MATERIALS.length} kayıt · Çelik profil, beton, kablo, bağlantı</p>
          </div>
          <Link href="/dashboard/notlar" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--ink-2)", fontSize: 13, textDecoration: "none", transition: "all .15s", flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.color = "var(--blue)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-2)"; }}>
            <StickyNote size={13} /> Not Defteri
          </Link>
        </div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, alignItems: "start" }} className="kutuphane-grid">
          <style>{`
            @media(max-width:768px){
              .kutuphane-grid{ grid-template-columns:1fr !important; }
              .kutuphane-list{ max-height:300px !important; }
            }
          `}</style>

          {/* SOL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Arama */}
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Ara: IPE 200, C25, 2.5mm²..."
                style={{ width: "100%", padding: "9px 34px 9px 34px", background: "var(--bg-input)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--ink)", fontSize: 13, outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
                onFocus={e => (e.target.style.borderColor = "var(--blue)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", padding: 2 }}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Kategoriler */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Kategoriler</span>
              </div>
              <div style={{ padding: "6px 6px" }}>
                {CATEGORIES.map(cat => {
                  const Icon = CAT_ICON[cat.value] || BookOpen;
                  const isAct = activeCategory === cat.value;
                  const color = CAT_COLOR[cat.value] || "var(--blue)";
                  return (
                    <button key={cat.value} onClick={() => { setActiveCategory(cat.value); setActiveSub("hepsi"); setSelected(null); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", marginBottom: 2, borderRadius: "var(--radius-sm)", background: isAct ? `${color}12` : "transparent", border: `1px solid ${isAct ? color + "40" : "transparent"}`, cursor: "pointer", textAlign: "left", transition: "all .12s" }}>
                      <Icon size={14} style={{ color: isAct ? color : "var(--ink-4)", flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: isAct ? 600 : 400, color: isAct ? color : "var(--ink-2)" }}>{cat.label}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-4)", background: "var(--bg-muted)", padding: "1px 6px", borderRadius: 10 }}>{cat.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alt kategoriler */}
            {subcats.length > 0 && (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px 6px", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".05em" }}>Alt Kategori</span>
                </div>
                <div style={{ padding: "6px 6px" }}>
                  {["hepsi", ...subcats].map(sc => {
                    const isAct = activeSub === sc;
                    return (
                      <button key={sc} onClick={() => setActiveSub(sc)} style={{ width: "100%", display: "block", padding: "7px 10px", marginBottom: 2, borderRadius: "var(--radius-sm)", background: isAct ? "var(--blue-soft)" : "transparent", border: `1px solid ${isAct ? "var(--blue-light)" : "transparent"}`, cursor: "pointer", textAlign: "left", fontSize: 13, color: isAct ? "var(--blue)" : "var(--ink-2)", fontWeight: isAct ? 600 : 400, transition: "all .12s" }}>
                        {sc === "hepsi" ? "Tümü" : sc}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sonuç listesi */}
            <div className="kutuphane-list" style={{ display: "flex", flexDirection: "column", gap: 4, overflowY: "auto", maxHeight: "calc(100vh - 440px)" }}>
              {results.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <Search size={22} style={{ color: "var(--border-dark)", margin: "0 auto 10px" }} />
                  <p style={{ fontSize: 13, color: "var(--ink-4)" }}>Sonuç bulunamadı.</p>
                </div>
              )}
              {results.map(mat => {
                const Icon = CAT_ICON[mat.category] || BookOpen;
                const isSel = selected?.id === mat.id;
                const hlProp = mat.properties.find((p: any) => p.highlight);
                const color = CAT_COLOR[mat.category] || "var(--blue)";
                return (
                  <button key={mat.id} onClick={() => setSelected(isSel ? null : mat)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", background: isSel ? `${color}10` : "var(--bg-card)", border: `1px solid ${isSel ? color + "40" : "var(--border)"}`, borderRadius: "var(--radius-sm)", cursor: "pointer", textAlign: "left", transition: "all .12s" }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = "var(--border-mid)"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = "var(--border)"; }}>
                    <div style={{ width: 30, height: 30, borderRadius: 6, background: isSel ? `${color}18` : "var(--bg-muted)", border: `1px solid ${isSel ? color + "30" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={13} style={{ color: isSel ? color : "var(--ink-4)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: isSel ? color : "var(--ink)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mat.name}</p>
                      <p style={{ fontSize: 11, color: "var(--ink-4)", margin: 0 }}>{mat.subcategory}</p>
                    </div>
                    {hlProp && (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--ink-3)", flexShrink: 0 }}>
                        {hlProp.value}{hlProp.unit ? " " + hlProp.unit : ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SAĞ: Detay */}
          <div>
            {!selected ? (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "64px 24px", minHeight: 360 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--blue-soft)", border: "1px solid var(--blue-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <BookOpen size={22} style={{ color: "var(--blue)" }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>Malzeme seçin</p>
                <p style={{ fontSize: 13, color: "var(--ink-3)", maxWidth: 280, lineHeight: 1.6, marginBottom: 24 }}>
                  Sol listeden bir malzeme seçin, teknik özelliklerini buradan görüntüleyin.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 260 }}>
                  {["IPE 200", "C25/30", "NYY 1×2.5", "S355"].map(hint => (
                    <button key={hint} onClick={() => setSearch(hint.split(" ")[0])} style={{ padding: "8px 12px", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--ink-2)", transition: "all .12s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.color = "var(--blue)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-2)"; }}>
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                {/* Detay başlık */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: `${CAT_COLOR[selected.category] || "var(--blue)"}15`, border: `1px solid ${CAT_COLOR[selected.category] || "var(--blue)"}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {(()=>{ const Icon = CAT_ICON[selected.category] || BookOpen; return <Icon size={16} style={{ color: CAT_COLOR[selected.category] || "var(--blue)" }}/>; })()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{selected.name}</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{selected.subcategory}</span>
                      {selected.standard && <span style={{ fontSize: 11, color: "var(--blue)", background: "var(--blue-soft)", padding: "1px 7px", borderRadius: 20, fontWeight: 500 }}>{selected.standard}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleCopyAsNote} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 11px", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, color: copiedNote ? "var(--green)" : "var(--ink-2)", transition: "all .15s" }}>
                      {copiedNote ? <Check size={12} /> : <StickyNote size={12} />}
                      {copiedNote ? "Kopyalandı" : "Nota Kopyala"}
                    </button>
                    <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-3)" }}>
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {/* Highlight özellikleri */}
                {highlight.length > 0 && (
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {highlight.map((p: any, i: number) => (
                      <div key={i} style={{ background: "var(--blue-soft)", border: "1px solid var(--blue-light)", borderRadius: "var(--radius)", padding: "10px 18px", textAlign: "center", minWidth: 90 }}>
                        <p style={{ fontSize: 11, color: "var(--blue)", marginBottom: 4, fontWeight: 500 }}>{p.label}</p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--blue)", lineHeight: 1 }}>{p.value}</p>
                        {p.unit && <p style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3 }}>{p.unit}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Özellikler tablosu */}
                <div style={{ padding: "14px 18px" }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Teknik Özellikler</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {selected.properties.map((p: any, i: number) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: i % 2 === 0 ? "var(--bg-muted)" : "transparent" }}>
                        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{p.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: p.highlight ? "var(--blue)" : "var(--ink)" }}>
                            {p.value}
                            {p.unit && <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--ink-4)", fontWeight: 400, marginLeft: 3 }}>{p.unit}</span>}
                          </span>
                          <button onClick={() => handleCopyProp(`${p.label}: ${p.value}${p.unit ? " " + p.unit : ""}`)} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--green)" : "var(--ink-4)", padding: 3 }}>
                            {copied ? <Check size={11} /> : <Copy size={11} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selected.note && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--amber-light)", border: "1px solid rgba(180,83,9,.2)", borderRadius: "var(--radius)", display: "flex", gap: 8 }}>
                      <Star size={12} style={{ color: "var(--amber)", flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.6, margin: 0 }}>{selected.note}</p>
                    </div>
                  )}

                  <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selected.tags.map((tag: string) => (
                      <button key={tag} onClick={() => setSearch(tag)} style={{ padding: "3px 10px", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: 20, cursor: "pointer", fontSize: 11, color: "var(--ink-3)", transition: "all .12s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.color = "var(--blue)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-3)"; }}>
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alt linkler */}
                <div style={{ padding: "10px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 16 }}>
                  <Link href="/dashboard/cizim" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--blue)", textDecoration: "none", fontWeight: 500 }}>
                    <ExternalLink size={11} /> Teknik Çizime Git
                  </Link>
                  <Link href="/dashboard/notlar" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-3)", textDecoration: "none" }}>
                    <StickyNote size={11} /> Not Defteri
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}