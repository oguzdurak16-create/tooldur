"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { renderMarkdown } from "@/lib/markdown";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  Code2,
  Cog,
  Edit3,
  Eye,
  FileText,
  Hash,
  Plus,
  Save,
  Search,
  Sparkles,
  Star,
  StickyNote,
  Trash2,
  X,
  Zap,
} from "lucide-react";

type Note = {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

const CATEGORIES = [
  { value: "genel", label: "Genel", icon: FileText, color: "#94a3b8" },
  { value: "elektrik", label: "Elektrik", icon: Zap, color: "#e99500" },
  { value: "insaat", label: "İnşaat", icon: Building2, color: "#fb923c" },
  { value: "makine", label: "Makine", icon: Cog, color: "#a78bfa" },
  { value: "formul", label: "Formüller", icon: Hash, color: "#f59e0b" },
  { value: "saha", label: "Saha Notları", icon: StickyNote, color: "#34d399" },
  { value: "onemli", label: "Önemli", icon: Star, color: "#f87171" },
];

const MARKDOWN_CHEATSHEET = [
  { label: "# Başlık", insert: "# Başlık\n" },
  { label: "Kalın", insert: "**kalın metin**" },
  { label: "İtalik", insert: "*italik metin*" },
  { label: "Kod", insert: "`kod`" },
  { label: "Formül", insert: "$$\nF = m × a\n$$\n" },
  { label: "Liste", insert: "- Madde 1\n- Madde 2\n" },
  { label: "Alıntı", insert: "> Alıntı metni\n" },
];

function getCatConfig(value: string) {
  return CATEGORIES.find((c) => c.value === value) || CATEGORIES[0];
}

function formatDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}

function getDefaultTemplate(category: string): string {
  switch (category) {
    case "formul":
      return "# Formül Notu\n\n**Konu:** \n\n## Formül\n\n$$\nFormülü buraya yaz\n$$\n\n## Açıklama\n\n- Değişkenler:\n  - \n\n## Kaynak\n\n";
    case "saha":
      return "# Saha Notu\n\n**Tarih:** \n**Yer:** \n**Proje:** \n\n## Gözlemler\n\n- \n\n## Alınacak Aksiyonlar\n\n- [ ] \n\n";
    case "elektrik":
      return "# Elektrik Notu\n\n**Konu:** \n\n## Teknik Bilgi\n\n`Gerilim:` V\n`Akım:` A\n`Güç:` W\n\n## Notlar\n\n";
    case "onemli":
      return "# Önemli Not\n\n**Konu:** \n\n> Bu bilgi kritik öneme sahiptir.\n\n## Detaylar\n\n";
    default:
      return "";
  }
}

export default function NotlarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("hepsi");
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("genel");

  const fetchNotes = async (userId?: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = userId || session?.user?.id;
    if (!uid) return;

    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", uid)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    setNotes((data || []) as Note[]);
  };

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      await fetchNotes(session.user.id);
      setLoading(false);
    };
    load();
  }, [router]);

  const filtered = useMemo(() => {
    let result = notes;
    if (selectedCategory !== "hepsi") result = result.filter((n) => n.category === selectedCategory);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((n) =>
        [n.title, n.content, n.category].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return result;
  }, [notes, selectedCategory, search]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { hepsi: notes.length };
    for (const n of notes) map[n.category || "genel"] = (map[n.category || "genel"] || 0) + 1;
    return map;
  }, [notes]);

  const openNote = (note: Note, preview = true) => {
    setActiveNote(note);
    setEditTitle(note.title || "");
    setEditContent(note.content || "");
    setEditCategory(note.category || "genel");
    setIsPreview(preview);
    setIsEditing(!preview);
  };

  const handleNewNote = () => {
    const category = selectedCategory !== "hepsi" ? selectedCategory : "genel";
    setActiveNote(null);
    setEditTitle("");
    setEditContent(getDefaultTemplate(category));
    setEditCategory(category);
    setIsEditing(true);
    setIsPreview(false);
  };

  const closeEditor = () => {
    setActiveNote(null);
    setIsEditing(false);
    setIsPreview(false);
    setEditTitle("");
    setEditContent("");
    setEditCategory("genel");
  };

  const handleSave = useCallback(async () => {
    if (!editTitle.trim()) return;
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setSaving(false);
      return;
    }

    if (activeNote) {
      const { data } = await supabase
        .from("notes")
        .update({
          title: editTitle.trim(),
          content: editContent,
          category: editCategory,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeNote.id)
        .select()
        .single();

      if (data) {
        setNotes((prev) => prev.map((n) => (n.id === activeNote.id ? (data as Note) : n)));
        setActiveNote(data as Note);
      }
    } else {
      const { data } = await supabase
        .from("notes")
        .insert({
          user_id: session.user.id,
          title: editTitle.trim(),
          content: editContent,
          category: editCategory,
          pinned: false,
        })
        .select()
        .single();

      if (data) {
        setNotes((prev) => [data as Note, ...prev]);
        setActiveNote(data as Note);
      }
    }

    setSaving(false);
    setSaveMsg("Kaydedildi");
    setIsPreview(true);
    setIsEditing(false);
    setTimeout(() => setSaveMsg(""), 1800);
  }, [activeNote, editCategory, editContent, editTitle]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu notu silmek istiyor musunuz?")) return;
    await supabase.from("notes").delete().eq("id", id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNote?.id === id) closeEditor();
  };

  const handlePin = async (note: Note) => {
    const { data } = await supabase
      .from("notes")
      .update({ pinned: !note.pinned })
      .eq("id", note.id)
      .select()
      .single();
    if (data) {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? (data as Note) : n)));
      if (activeNote?.id === note.id) setActiveNote(data as Note);
    }
  };

  const insertToEditor = (text: string) => {
    const ta = document.getElementById("note-editor") as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const next = editContent.slice(0, start) + text + editContent.slice(end);
    setEditContent(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  const showEditor = isEditing || isPreview;

  if (loading) {
    return (
      <div className="notes-page notes-loading">
        <div className="notes-spinner" />
        <style>{pageCss}</style>
      </div>
    );
  }

  return (
    <main className="notes-page">
      <style>{pageCss}</style>
      <div className="notes-shell">
        <section className="notes-hero">
          <div className="notes-title-wrap">
            <Link href="/dashboard" className="notes-back" aria-label="Panele dön">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="notes-kicker"><BookOpen size={15} /> Markdown destekli</div>
              <h1>Not Defteri</h1>
              <p>Formül, saha notu, proje fikri ve teknik bilgileri düzenli tut.</p>
            </div>
          </div>
          <button onClick={handleNewNote} className="notes-new-btn">
            <Plus size={18} /> Yeni not
          </button>
        </section>

        <section className="notes-toolbar">
          <div className="notes-search">
            <Search size={18} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Notlarda ara..." />
          </div>
          <div className="notes-chips">
            {[{ value: "hepsi", label: "Tümü", icon: Sparkles, color: "#f59e0b" }, ...CATEGORIES].map((cat) => {
              const Icon = cat.icon;
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={active ? "notes-chip active" : "notes-chip"}
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

        <section className={showEditor ? "notes-workspace editor-open" : "notes-workspace"}>
          <aside className="notes-list-panel">
            <div className="notes-list-head">
              <div>
                <strong>Notlarım</strong>
                <span>{filtered.length} not</span>
              </div>
              <button onClick={handleNewNote}><Plus size={16} /></button>
            </div>

            {filtered.length === 0 ? (
              <div className="notes-empty-list">
                <StickyNote size={28} />
                <b>Henüz not yok</b>
                <p>İlk notunu oluşturup teknik bilgilerini sakla.</p>
                <button onClick={handleNewNote}>Not oluştur</button>
              </div>
            ) : (
              <div className="notes-list">
                {filtered.map((note) => {
                  const cat = getCatConfig(note.category);
                  const Icon = cat.icon;
                  const active = activeNote?.id === note.id;
                  return (
                    <button key={note.id} onClick={() => openNote(note, true)} className={active ? "note-card active" : "note-card"} style={{ ["--cat" as any]: cat.color }}>
                      <div className="note-card-icon"><Icon size={17} /></div>
                      <div className="note-card-body">
                        <div className="note-card-title">
                          <span>{note.title || "Başlıksız not"}</span>
                          {note.pinned && <Star size={13} fill="currentColor" />}
                        </div>
                        <p>{note.content?.replace(/[#*_`>\-]/g, " ").trim() || "İçerik yok"}</p>
                        <small>{cat.label} · {formatDate(note.updated_at)}</small>
                      </div>
                      <ChevronRight size={16} className="note-card-arrow" />
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="notes-editor-panel" onKeyDown={handleKeyDown}>
            {!showEditor ? (
              <div className="notes-empty-editor">
                <div className="notes-empty-icon"><Edit3 size={34} /></div>
                <h2>Not seç veya yeni oluştur</h2>
                <p>Soldan bir not açabilir ya da hızlıca yeni bir markdown notu oluşturabilirsin.</p>
                <button onClick={handleNewNote}><Plus size={17} /> Yeni not oluştur</button>
              </div>
            ) : (
              <>
                <div className="editor-topbar">
                  <button onClick={closeEditor} className="editor-icon-btn"><X size={17} /></button>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Not başlığı..." />
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {activeNote && (
                    <button onClick={() => handlePin(activeNote)} className={activeNote.pinned ? "editor-pin active" : "editor-pin"}>
                      <Star size={15} />
                    </button>
                  )}
                  <div className="editor-toggle">
                    <button onClick={() => { setIsEditing(true); setIsPreview(false); }} className={isEditing ? "active" : ""}><Edit3 size={14} /> Yaz</button>
                    <button onClick={() => { setIsPreview(true); setIsEditing(false); }} className={isPreview ? "active" : ""}><Eye size={14} /> Önizle</button>
                  </div>
                  <button onClick={handleSave} disabled={saving || !editTitle.trim()} className="editor-save">
                    {saveMsg ? <Check size={16} /> : <Save size={16} />}
                    {saving ? "Kaydediliyor" : saveMsg || "Kaydet"}
                  </button>
                </div>

                {isEditing && (
                  <div className="markdown-toolbar">
                    {MARKDOWN_CHEATSHEET.map((item) => (
                      <button key={item.label} onClick={() => insertToEditor(item.insert)}>
                        <Code2 size={13} /> {item.label}
                      </button>
                    ))}
                    <span>Ctrl+S</span>
                  </div>
                )}

                <div className="editor-content">
                  {isEditing ? (
                    <textarea
                      id="note-editor"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder={"Notunu yaz... Markdown desteklenir.\n\n# Başlık\n**kalın**, *italik*, `kod`\n$$ formül $$"}
                    />
                  ) : (
                    <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent || "<p>İçerik yok.</p>") }} />
                  )}
                </div>

                <div className="editor-footer">
                  <span>{editContent.split(/\s+/).filter(Boolean).length} kelime · {editContent.length} karakter</span>
                  <div>
                    {activeNote && <button onClick={() => handleDelete(activeNote.id)}><Trash2 size={14} /> Sil</button>}
                    {activeNote && <span>Güncellendi: {formatDate(activeNote.updated_at)}</span>}
                  </div>
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

const pageCss = `
.notes-page{min-height:100vh;padding:24px 16px 110px;color:var(--ink,#f8fafc);background:radial-gradient(circle at 82% 0%,rgba(255,177,27,.10),transparent 30%),linear-gradient(rgba(148,163,184,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.045) 1px,transparent 1px),var(--bg,#070b14);background-size:auto,56px 56px,56px 56px,auto;}.notes-shell{max-width:1280px;margin:0 auto}.notes-loading{display:grid;place-items:center}.notes-spinner{width:36px;height:36px;border-radius:50%;border:3px solid rgba(148,163,184,.18);border-top-color:var(--amber,#ffb11b);animation:notesSpin .8s linear infinite}@keyframes notesSpin{to{transform:rotate(360deg)}}
.notes-hero{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:22px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:24px;background:linear-gradient(135deg,rgba(17,24,39,.92),rgba(15,23,42,.74));box-shadow:0 24px 70px rgba(0,0,0,.24);margin-bottom:18px}.notes-title-wrap{display:flex;gap:16px;align-items:flex-start}.notes-back{width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:rgba(15,23,42,.78);border:1px solid var(--border-mid,rgba(148,163,184,.22));color:var(--ink-2,#dbe3f2);text-decoration:none;flex-shrink:0}.notes-kicker{display:inline-flex;align-items:center;gap:8px;margin-bottom:10px;padding:7px 11px;border-radius:999px;color:var(--amber,#ffb11b);background:rgba(255,177,27,.09);border:1px solid rgba(255,177,27,.17);font-size:12px;font-weight:850}.notes-title-wrap h1{margin:0;font-size:clamp(28px,4vw,44px);line-height:1;font-weight:950;letter-spacing:-.045em}.notes-title-wrap p{margin:10px 0 0;max-width:620px;color:var(--ink-4,#69748b);font-size:14px;line-height:1.6}.notes-new-btn,.notes-empty-editor button,.notes-empty-list button{height:48px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 18px;border:0;border-radius:15px;background:var(--amber,#ffb11b);color:#0a0a0f;font-weight:950;cursor:pointer;white-space:nowrap}.notes-toolbar{padding:16px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:22px;background:rgba(15,23,42,.68);margin-bottom:18px}.notes-search{height:52px;display:flex;align-items:center;gap:11px;padding:0 16px;border:1px solid var(--border-mid,rgba(148,163,184,.22));border-radius:16px;background:rgba(8,13,24,.74);color:var(--ink-4,#69748b);margin-bottom:12px}.notes-search input{width:100%;height:100%;background:transparent;border:0;outline:0;color:var(--ink,#f8fafc);font-size:14px}.notes-chips{display:flex;gap:9px;flex-wrap:wrap}.notes-chip{height:38px;display:inline-flex;align-items:center;gap:8px;padding:0 12px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:999px;background:rgba(22,31,49,.72);color:var(--ink-3,#9ca8bf);font-weight:850;cursor:pointer}.notes-chip svg{color:var(--chip)}.notes-chip em{font-style:normal;color:var(--ink-4,#69748b);font-size:11px}.notes-chip.active{background:color-mix(in srgb,var(--chip) 18%,rgba(15,23,42,.9));border-color:color-mix(in srgb,var(--chip) 45%,transparent);color:var(--ink,#f8fafc)}
.notes-workspace{display:grid;grid-template-columns:360px minmax(0,1fr);gap:18px;align-items:start}.notes-list-panel,.notes-editor-panel{border:1px solid var(--border,rgba(148,163,184,.14));border-radius:24px;background:rgba(15,23,42,.72);overflow:hidden}.notes-list-panel{position:sticky;top:86px;max-height:calc(100vh - 120px);display:flex;flex-direction:column}.notes-list-head{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid var(--border,rgba(148,163,184,.14))}.notes-list-head strong{display:block;color:var(--ink,#f8fafc);font-size:15px;font-weight:950}.notes-list-head span{display:block;color:var(--ink-4,#69748b);font-size:12px;margin-top:3px}.notes-list-head button{width:38px;height:38px;border-radius:13px;border:1px solid rgba(255,177,27,.20);background:rgba(255,177,27,.08);color:var(--amber,#ffb11b);display:grid;place-items:center;cursor:pointer}.notes-list{padding:10px;overflow:auto;display:grid;gap:9px}.note-card{width:100%;display:flex;align-items:center;gap:12px;padding:12px;border-radius:17px;border:1px solid transparent;background:transparent;color:inherit;text-align:left;cursor:pointer}.note-card:hover,.note-card.active{background:rgba(22,31,49,.72);border-color:var(--border,rgba(148,163,184,.14))}.note-card.active{border-color:color-mix(in srgb,var(--cat) 42%,transparent)}.note-card-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:14px;flex-shrink:0;color:var(--cat);background:color-mix(in srgb,var(--cat) 12%,rgba(15,23,42,.78));border:1px solid color-mix(in srgb,var(--cat) 24%,transparent)}.note-card-body{min-width:0;flex:1}.note-card-title{display:flex;align-items:center;gap:6px;color:var(--ink,#f8fafc);font-size:14px;font-weight:900}.note-card-title span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.note-card p{margin:5px 0;color:var(--ink-4,#69748b);font-size:12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.note-card small{color:var(--ink-4,#69748b);font-size:11px}.note-card-arrow{color:var(--ink-4,#69748b)}.notes-empty-list{padding:34px 18px;text-align:center;display:grid;place-items:center;color:var(--ink-4,#69748b)}.notes-empty-list b{color:var(--ink,#f8fafc);margin-top:10px}.notes-empty-list p{font-size:13px;line-height:1.6}.notes-empty-list button{height:42px;font-size:13px}.notes-editor-panel{min-height:620px;display:flex;flex-direction:column}.notes-empty-editor{min-height:620px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px}.notes-empty-icon{width:76px;height:76px;border-radius:24px;display:grid;place-items:center;color:var(--amber,#ffb11b);background:rgba(255,177,27,.08);border:1px solid rgba(255,177,27,.16);margin-bottom:16px}.notes-empty-editor h2{margin:0;font-size:25px;font-weight:950}.notes-empty-editor p{max-width:410px;color:var(--ink-4,#69748b);line-height:1.6;margin:10px 0 22px}.editor-topbar{display:flex;gap:10px;align-items:center;padding:14px;border-bottom:1px solid var(--border,rgba(148,163,184,.14));flex-wrap:wrap}.editor-icon-btn,.editor-pin{width:40px;height:40px;display:grid;place-items:center;border-radius:13px;border:1px solid var(--border,rgba(148,163,184,.14));background:rgba(22,31,49,.72);color:var(--ink-3,#9ca8bf);cursor:pointer}.editor-pin.active{color:var(--amber,#ffb11b);border-color:rgba(255,177,27,.25);background:rgba(255,177,27,.08)}.editor-topbar input{flex:1;min-width:180px;height:42px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:14px;background:rgba(8,13,24,.72);color:var(--ink,#f8fafc);outline:0;padding:0 14px;font-size:15px;font-weight:850}.editor-topbar select{height:42px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:14px;background:rgba(8,13,24,.72);color:var(--ink-2,#dbe3f2);outline:0;padding:0 12px}.editor-toggle{display:flex;padding:4px;border-radius:14px;background:rgba(8,13,24,.72);border:1px solid var(--border,rgba(148,163,184,.14))}.editor-toggle button{height:34px;display:flex;align-items:center;gap:6px;padding:0 10px;border:0;border-radius:10px;background:transparent;color:var(--ink-4,#69748b);font-weight:850;cursor:pointer}.editor-toggle button.active{background:rgba(255,177,27,.12);color:var(--amber,#ffb11b)}.editor-save{height:42px;display:inline-flex;align-items:center;gap:8px;border:0;border-radius:14px;padding:0 15px;background:var(--amber,#ffb11b);color:#0a0a0f;font-weight:950;cursor:pointer}.editor-save:disabled{opacity:.55;cursor:not-allowed}.markdown-toolbar{display:flex;gap:7px;flex-wrap:wrap;padding:10px 14px;border-bottom:1px solid var(--border,rgba(148,163,184,.14));background:rgba(8,13,24,.32)}.markdown-toolbar button{height:32px;display:flex;align-items:center;gap:6px;border:1px solid var(--border,rgba(148,163,184,.14));border-radius:10px;background:rgba(22,31,49,.72);color:var(--ink-3,#9ca8bf);font-size:12px;font-weight:800;cursor:pointer}.markdown-toolbar span{margin-left:auto;align-self:center;color:var(--ink-4,#69748b);font-size:12px}.editor-content{flex:1;min-height:420px;display:flex}.editor-content textarea{width:100%;min-height:100%;resize:none;border:0;outline:0;background:rgba(8,13,24,.54);color:var(--ink,#f8fafc);padding:20px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:14px;line-height:1.8}.markdown-preview{width:100%;overflow:auto;padding:22px;color:var(--ink-2,#dbe3f2);line-height:1.8}.markdown-preview h1,.markdown-preview h2,.markdown-preview h3{color:var(--ink,#f8fafc)}.markdown-preview code{background:rgba(255,177,27,.10);color:var(--amber,#ffb11b);padding:2px 6px;border-radius:6px}.markdown-preview pre{background:rgba(8,13,24,.8);border:1px solid var(--border,rgba(148,163,184,.14));padding:14px;border-radius:14px;overflow:auto}.editor-footer{min-height:46px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 14px;border-top:1px solid var(--border,rgba(148,163,184,.14));color:var(--ink-4,#69748b);font-size:12px}.editor-footer>div{display:flex;align-items:center;gap:12px}.editor-footer button{height:32px;display:flex;align-items:center;gap:6px;border:1px solid rgba(248,113,113,.18);background:rgba(248,113,113,.06);color:#fca5a5;border-radius:10px;font-weight:850;cursor:pointer}
@media(max-width:960px){.notes-page{padding:14px 12px 104px}.notes-hero{display:block;padding:18px}.notes-new-btn{width:100%;margin-top:16px}.notes-workspace{grid-template-columns:1fr}.notes-list-panel{position:static;max-height:none}.notes-workspace.editor-open .notes-list-panel{display:none}.notes-editor-panel{min-height:560px}.editor-topbar{align-items:stretch}.editor-topbar input,.editor-topbar select,.editor-save{width:100%}.editor-toggle{width:100%}.editor-toggle button{flex:1;justify-content:center}.markdown-toolbar{overflow-x:auto;flex-wrap:nowrap}.markdown-toolbar button{white-space:nowrap}.markdown-toolbar span{display:none}.notes-chips{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px}.notes-chip{flex:0 0 auto}.notes-title-wrap{gap:12px}.notes-back{width:40px;height:40px}.notes-title-wrap h1{font-size:31px}.editor-footer{align-items:flex-start;flex-direction:column;padding:12px 14px}.editor-footer>div{align-items:flex-start;flex-direction:column;gap:8px}.editor-content{min-height:420px}}
`;
