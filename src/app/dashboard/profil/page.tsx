"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Building2, Zap, Cog, Activity,
  Calculator, Save, CheckCircle2, AlertCircle, BookOpen,
  Phone, MapPin, Globe, Wrench, Cpu, Droplets, Flame,
  Layers, TreePine, Ship, Plane, Radio, FlaskConical, Trash2,
} from "lucide-react";

const BRANCHES = [
  { value: "elektrik",    label: "Elektrik & Elektronik",     icon: Zap },
  { value: "insaat",      label: "İnşaat",                    icon: Building2 },
  { value: "makine",      label: "Makine",                    icon: Cog },
  { value: "mekatronik",  label: "Mekatronik",                icon: Cpu },
  { value: "bilgisayar",  label: "Bilgisayar",                icon: Radio },
  { value: "endustri",    label: "Endüstri",                  icon: Layers },
  { value: "kimya",       label: "Kimya",                     icon: FlaskConical },
  { value: "cevre",       label: "Çevre",                     icon: TreePine },
  { value: "metalurji",   label: "Metalurji & Malzeme",       icon: Wrench },
  { value: "insaat_zemin",label: "Geoteknik & Zemin",         icon: Layers },
  { value: "maden",       label: "Maden",                     icon: Wrench },
  { value: "petrol",      label: "Petrol & Doğalgaz",         icon: Flame },
  { value: "gemi",        label: "Gemi & Deniz",              icon: Ship },
  { value: "havacilik",   label: "Havacılık & Uzay",          icon: Plane },
  { value: "biyomedikal", label: "Biyomedikal",               icon: Activity },
  { value: "gida",        label: "Gıda",                      icon: FlaskConical },
  { value: "tekstil",     label: "Tekstil",                   icon: Layers },
  { value: "hidrolik",    label: "Hidrolik & Su Kaynakları",  icon: Droplets },
  { value: "nukleer",     label: "Nükleer",                   icon: Zap },
  { value: "diger",       label: "Diğer",                     icon: Calculator },
];

const TITLES = [
  "Mühendis", "Kıdemli Mühendis", "Baş Mühendis", "Proje Mühendisi",
  "Saha Mühendisi", "Tasarım Mühendisi", "Teknik Direktör",
  "Müdür", "Şef", "Tekniker", "Öğretim Görevlisi", "Araştırmacı",
  "Yönetici Ortak", "Serbest Mühendis", "Diğer",
];

export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");
  const [user, setUser]       = useState<any>(null);
  const [silOnay,       setSilOnay]       = useState(false);
  const [silYukleniyor, setSilYukleniyor] = useState(false);
  const [silHata,       setSilHata]       = useState("");

  const [form, setForm] = useState({
    full_name: "", title: "", branch: "",
    company: "", city: "", phone: "", website: "", bio: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/giris"); return; }
      setUser(session.user);
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) setForm({ full_name: data.full_name||"", title: data.title||"", branch: data.branch||"", company: data.company||"", city: data.city||"", phone: data.phone||"", website: data.website||"", bio: data.bio||"" });
      setLoading(false);
    };
    load();
  }, [router]);

  const set = (f: string, v: string) => { setForm(p => ({ ...p, [f]: v })); setSaved(false); };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      setError("Ad Soyad zorunlu.");
      return;
    }
  
    if (!form.branch) {
      setError("Mühendislik dalı seçimi zorunlu.");
      return;
    }
  
    setError("");
    setSaving(true);
  
    const profilePayload = {
      id: user.id,
      email: user.email ?? null,
      full_name: form.full_name.trim(),
      title: form.title || null,
      branch: form.branch || null,
      company: form.company.trim() || null,
      city: form.city.trim() || null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      bio: form.bio.trim() || null,
      updated_at: new Date().toISOString(),
    };
  
    const { error: e } = await supabase
      .from("profiles")
      .upsert(profilePayload);
  
    setSaving(false);
  
    if (e) {
      setError("Kayıt hatası: " + e.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleHesapSil = async () => {
    setSilYukleniyor(true);
    setSilHata("");
    try {
      const { error } = await supabase.rpc("delete_user");
      if (error) throw error;
      await supabase.auth.signOut();
      router.push("/");
    } catch (e: any) {
      setSilHata("Hesap silinirken hata oluştu: " + (e?.message ?? ""));
      setSilYukleniyor(false);
    }
  };

  // Tamamlanma yüzdesi
  const dolu = [form.full_name, form.title, form.branch, form.company, form.city, form.bio].filter(Boolean).length;
  const pct  = Math.round(dolu / 6 * 100);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--blue)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 48 }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6" style={{ paddingTop: 28 }}>

        {/* Geri + başlık */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Link href="/dashboard" style={{ width: 34, height: 34, borderRadius: "var(--radius-sm)", background: "var(--bg-card)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", textDecoration: "none" }}>
            <ArrowLeft size={15} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Profilim</h1>
            <p style={{ fontSize: 12, color: "var(--ink-4)", margin: 0 }}>{user?.email}</p>
          </div>
          {/* Tamamlanma */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: pct === 100 ? "var(--green)" : "var(--ink-3)", marginBottom: 4 }}>%{pct} tamamlandı</div>
            <div style={{ width: 80, height: 4, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green)" : pct >= 50 ? "var(--blue)" : "var(--amber)", borderRadius: 99, transition: "width .4s" }} />
            </div>
          </div>
        </div>

        {/* Hata / başarı */}
        {error && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 16, background: "var(--red-light)", border: "1px solid rgba(153,27,27,.2)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--red)" }}><AlertCircle size={13} /> {error}</div>}
        {saved && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 16, background: "var(--green-light)", border: "1px solid rgba(22,101,52,.2)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--green)" }}><CheckCircle2 size={13} /> Profiliniz kaydedildi!</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Kişisel bilgiler */}
          <Section baslik="Kişisel Bilgiler" ikon={<User size={14} />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Alan label="Ad Soyad *" placeholder="Ahmet Yılmaz" value={form.full_name} onChange={v => set("full_name", v)} />
              <div>
                <label className="td-label">Unvan *</label>
                <select className="td-select" value={form.title} onChange={e => set("title", e.target.value)}>
                  <option value="">Seçin...</option>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <Alan label="Kısa Biyografi" placeholder="Kendiniz hakkında..." value={form.bio} onChange={v => set("bio", v)} textarea />
          </Section>

          {/* Mühendislik dalı */}
          <Section baslik="Mühendislik Dalı *" ikon={<Cog size={14} />}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8 }}>
              {BRANCHES.map(b => {
                const Ikon = b.icon;
                const sec = form.branch === b.value;
                return (
                  <button key={b.value} onClick={() => set("branch", b.value)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "9px 10px",
                    borderRadius: "var(--radius-sm)", border: `1.5px solid ${sec ? "var(--blue)" : "var(--border)"}`,
                    background: sec ? "var(--blue-soft)" : "var(--bg-muted)",
                    cursor: "pointer", textAlign: "left", transition: "all .12s",
                  }}>
                    <Ikon size={13} style={{ color: sec ? "var(--blue)" : "var(--ink-4)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: sec ? 600 : 400, color: sec ? "var(--blue)" : "var(--ink-2)", lineHeight: 1.3 }}>{b.label}</span>
                    {sec && <CheckCircle2 size={11} style={{ color: "var(--blue)", marginLeft: "auto", flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Mesleki bilgiler */}
          <Section baslik="Mesleki Bilgiler" ikon={<BookOpen size={14} />}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Alan label="Şirket / Kurum" placeholder="ABC Mühendislik" value={form.company} onChange={v => set("company", v)} />
              <Alan label="Şehir" placeholder="İstanbul" value={form.city} onChange={v => set("city", v)} />
              <Alan label="Telefon" placeholder="+90 555 000 00 00" value={form.phone} onChange={v => set("phone", v)} />
              <Alan label="Web / LinkedIn" placeholder="linkedin.com/in/..." value={form.website} onChange={v => set("website", v)} />
            </div>
          </Section>

          {/* Kaydet */}
          <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: "12px", fontSize: 14, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Kaydediliyor..." : saved ? "✓ Kaydedildi!" : "Profili Kaydet"}
          </button>

          {/* Hesap Sil */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <Trash2 size={14} style={{ color: "#dc2626" }} />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0 }}>Tehlikeli Bölge</h2>
            </div>
            <div style={{ padding: "16px" }}>
              {silHata && <div style={{ marginBottom: 12, padding: "10px 14px", background: "var(--red-light)", border: "1px solid rgba(153,27,27,.2)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--red)" }}>{silHata}</div>}
              {!silOnay ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 3 }}>Hesabı Kalıcı Olarak Sil</div>
                    <div style={{ fontSize: 12, color: "var(--ink-4)" }}>Tüm verileriniz silinir. Bu işlem geri alınamaz.</div>
                  </div>
                  <button onClick={() => setSilOnay(true)} style={{ padding: "8px 16px", background: "none", border: "1px solid #fca5a5", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, color: "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }}>
                    Hesabı Sil
                  </button>
                </div>
              ) : (
                <div style={{ background: "#fff1f1", border: "1px solid #fca5a5", borderRadius: "var(--radius-sm)", padding: "14px" }}>
                  <p style={{ fontSize: 13, color: "#dc2626", fontWeight: 700, margin: "0 0 6px" }}>⚠️ Emin misiniz?</p>
                  <p style={{ fontSize: 12, color: "#991b1b", margin: "0 0 14px", lineHeight: 1.6 }}>
                    Profiliniz, kayıtlı hesabınız ve tüm verileriniz kalıcı olarak silinecek. Bu işlem geri alınamaz.
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setSilOnay(false)} style={{ flex: 1, padding: "9px", background: "white", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 13, color: "var(--ink-3)" }}>
                      Vazgeç
                    </button>
                    <button onClick={handleHesapSil} disabled={silYukleniyor} style={{ flex: 1, padding: "9px", background: "#dc2626", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 13, color: "white", fontWeight: 700, opacity: silYukleniyor ? 0.7 : 1 }}>
                      {silYukleniyor ? "Siliniyor..." : "Evet, Hesabı Sil"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Section({ baslik, ikon, children }: { baslik: string; ikon: any; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--ink-3)" }}>{ikon}</span>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", margin: 0 }}>{baslik}</h2>
      </div>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>{children}</div>
    </div>
  );
}

function Alan({ label, placeholder, value, onChange, textarea }: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; textarea?: boolean;
}) {
  return (
    <div>
      <label className="td-label">{label}</label>
      {textarea
        ? <textarea className="td-input" style={{ resize: "vertical", minHeight: 70 }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} rows={3} />
        : <input className="td-input" type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}