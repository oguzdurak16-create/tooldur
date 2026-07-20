"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mod, setMod] = useState<"giris" | "kayit" | "sifre">("giris");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [adSoyad, setAdSoyad] = useState("");
  const [goster, setGoster] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [kullanim, setKullanim] = useState(false);
  const [iletisim, setIletisim] = useState(false);

  const temizle = () => { setHata(""); setMesaj(""); };

  const getRedirectPath = () => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) return redirect;
    return "/dashboard";
  };

  const googleIleDevam = async () => {
    temizle();
    setYukleniyor(true);
    try {
      const redirectPath = getRedirectPath();
      window.localStorage.setItem('tooldur-auth-redirect', redirectPath);
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
      if (error) throw error;
    } catch (e: any) {
      setYukleniyor(false);
      setHata(e?.message || "Google ile giriş başlatılamadı. Supabase Google ayarlarını kontrol edin.");
    }
  };


  const submit = async () => {
    temizle();
    if (!email.trim()) { setHata("E-posta adresi gerekli."); return; }
    if (mod !== "sifre" && sifre.length < 6) { setHata("Şifre en az 6 karakter olmalı."); return; }
    if (mod === "kayit") {
      if (!kvkk) { setHata("KVKK Aydınlatma Metni ve Gizlilik Politikası’nı okuduğunuzu onaylamanız gerekir."); return; }
      if (!kullanim) { setHata("Üyelik için Kullanım Şartları’nı kabul etmeniz gerekir."); return; }
    }
    setYukleniyor(true);
    try {
      if (mod === "giris") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: sifre });
        if (error) throw error;
        router.push(getRedirectPath());
      } else if (mod === "kayit") {
        const { error } = await supabase.auth.signUp({
          email, password: sifre,
          options: {
            data: {
              full_name: adSoyad.trim() || email.split("@")[0],
              kvkk_aydinlatma_okundu: true,
              kvkk_aydinlatma_tarihi: new Date().toISOString(),
              kullanim_onay: true,
              kullanim_onay_tarihi: new Date().toISOString(),
              iletisim_izni: iletisim,
              ticari_ileti_izni: iletisim,
              ticari_ileti_tarihi: iletisim ? new Date().toISOString() : null,
              onay_tarihi: new Date().toISOString(),
            }
          },
        });
        if (error) throw error;
        setMesaj("Kayıt başarılı! Giriş yapabilirsiniz.");
        setMod("giris"); setSifre("");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: "https://www.tooldur.com/dashboard" });
        if (error) throw error;
        setMesaj("Şifre sıfırlama e-postası gönderildi.");
      }
    } catch (e: any) {
      const code = e?.message ?? "";
      if (code.includes("Invalid login credentials")) setHata("E-posta veya şifre hatalı.");
      else if (code.includes("User already registered")) setHata("Bu e-posta zaten kayıtlı.");
      else if (code.includes("Email not confirmed")) setHata("E-postanızı onaylamanız gerekiyor.");
      else setHata(e?.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally { setYukleniyor(false); }
  };

  const Checkbox = ({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) => (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", lineHeight: 1.55 }}>
      <div onClick={onChange} style={{
        width: 17, height: 17, borderRadius: 5, flexShrink: 0, marginTop: 1,
        border: `1.5px solid ${checked ? "var(--amber)" : "var(--border-dark)"}`,
        background: checked ? "var(--amber)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .15s", cursor: "pointer",
      }}>
        {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#05070d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </div>
      <span style={{ fontSize: 12.5, color: "var(--ink-3)", userSelect: "none" }}>{children}</span>
    </label>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px",
    background: "var(--bg-input)", border: "1.5px solid var(--border-mid)",
    borderRadius: 9, color: "var(--ink)", fontFamily: "var(--font-sans)",
    fontSize: 14, outline: "none", transition: "border-color .18s, box-shadow .18s",
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "var(--bg)", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,177,27,0.04), transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, background: "var(--amber)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 16px rgba(255,177,27,0.28)" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 17, fontWeight: 700, color: "#05070d" }}>T</span>
            </div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
              tool<span style={{ color: "var(--amber)" }}>dur</span>
            </span>
          </Link>
          <p style={{ fontSize: 13, color: "var(--ink-4)" }}>Mühendislik hesaplama araçları</p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-mid)", borderRadius: 18, padding: "28px", boxShadow: "0 24px 72px rgba(0,0,0,0.44)" }}>

          {/* Tabs (giris/kayit) */}
          {mod !== "sifre" && (
            <div style={{ display: "flex", border: "1px solid var(--border-mid)", borderRadius: 10, overflow: "hidden", marginBottom: 24, background: "var(--bg-muted)" }}>
              {(["giris", "kayit"] as const).map(m => (
                <button type="button" key={m} onClick={() => { setMod(m); temizle(); }}
                  style={{
                    flex: 1, padding: "10px",
                    border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600,
                    background: mod === m ? "var(--amber)" : "transparent",
                    color: mod === m ? "#05070d" : "var(--ink-4)",
                    transition: "all .18s",
                    fontFamily: "var(--font-sans)",
                  }}>
                  {m === "giris" ? "Giriş Yap" : "Üye Ol"}
                </button>
              ))}
            </div>
          )}


          {mod === "giris" && (
            <>
              <button
                type="button"
                onClick={googleIleDevam}
                disabled={yukleniyor}
                style={{
                  width: "100%",
                  minHeight: 46,
                  borderRadius: 11,
                  border: "1px solid var(--border-mid)",
                  background: "rgba(255,255,255,.04)",
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: yukleniyor ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: "var(--font-sans)",
                  marginBottom: 14,
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", color: "#111827", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14 }}>G</span>
                Google ile giriş yap
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ height: 1, flex: 1, background: "var(--border-mid)" }} />
                <span style={{ fontSize: 11, color: "var(--ink-4)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".14em" }}>veya e-posta</span>
                <div style={{ height: 1, flex: 1, background: "var(--border-mid)" }} />
              </div>
            </>
          )}

          {/* Şifre sıfırlama başlık */}
          {mod === "sifre" && (
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>Şifre Sıfırla</h2>
              <p style={{ fontSize: 13, color: "var(--ink-4)" }}>E-postanıza sıfırlama bağlantısı gönderilecek.</p>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mod === "kayit" && (
              <div>
                <label className="td-label">Ad Soyad</label>
                <input style={inputStyle} type="text" placeholder="Ahmet Yılmaz" value={adSoyad} onChange={e => setAdSoyad(e.target.value)}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--amber)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,177,27,.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--border-mid)"; e.currentTarget.style.boxShadow = "none"; }} />
              </div>
            )}

            <div>
              <label className="td-label">E-posta</label>
              <div style={{ position: "relative" }}>
                <Mail size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
                <input style={{ ...inputStyle, paddingLeft: 36 }} type="email" placeholder="muhendis@firma.com"
                  value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
                  onFocus={e => { e.currentTarget.style.borderColor = "var(--amber)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,177,27,.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "var(--border-mid)"; e.currentTarget.style.boxShadow = "none"; }} />
              </div>
            </div>

            {mod !== "sifre" && (
              <div>
                <label className="td-label">Şifre</label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)", pointerEvents: "none" }} />
                  <input style={{ ...inputStyle, paddingLeft: 36, paddingRight: 42 }} type={goster ? "text" : "password"}
                    placeholder="En az 6 karakter" value={sifre} onChange={e => setSifre(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()}
                    onFocus={e => { e.currentTarget.style.borderColor = "var(--amber)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,177,27,.12)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "var(--border-mid)"; e.currentTarget.style.boxShadow = "none"; }} />
                  <button type="button" onClick={() => setGoster(!goster)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", display: "flex", alignItems: "center", padding: 4 }}>
                    {goster ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {mod === "kayit" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "14px", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <p style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: ".08em" }}>Aydınlatma ve Onaylar</p>
                <Checkbox checked={kvkk} onChange={() => setKvkk(!kvkk)}>
                  <Link href="/gizlilik" target="_blank" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 500 }}>KVKK Aydınlatma Metni ve Gizlilik Politikası</Link>
                  {"’nı okudum. Bu işaretleme açık rıza değil, üyelik süreciyle ilgili bilgilendirmeyi okuduğunuza dair onaydır. "}
                  <span style={{ color: "var(--red)", fontWeight: 600 }}>Zorunlu</span>
                </Checkbox>
                <Checkbox checked={kullanim} onChange={() => setKullanim(!kullanim)}>
                  <Link href="/kullanim-sartlari" target="_blank" style={{ color: "var(--amber)", textDecoration: "none", fontWeight: 500 }}>Kullanım Şartları</Link>
                  {"’nı üyelik sözleşmesi kapsamında kabul ediyorum. "}<span style={{ color: "var(--red)", fontWeight: 600 }}>Zorunlu</span>
                </Checkbox>
                <Checkbox checked={iletisim} onChange={() => setIletisim(!iletisim)}>
                  Tooldur tarafından ürün güncellemeleri, yeni araçlar ve duyurular için elektronik ileti almak istiyorum. <span style={{ color: "var(--ink-4)", fontWeight: 600 }}>(Opsiyonel; üyelik için şart değildir)</span>
                </Checkbox>
                <p style={{ fontSize: 11, color: "var(--ink-4)", lineHeight: 1.5 }}>
                  Ticari ileti izni ayrı ve isteğe bağlıdır. Bu izni vermeseniz de hesap oluşturabilirsiniz; tercihinizi daha sonra profil ayarlarından değiştirebilirsiniz.
                </p>
              </div>
            )}

            {hata && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 13px", background: "var(--red-light)", border: "1px solid rgba(241,102,102,.2)", borderRadius: 9, fontSize: 13, color: "var(--red)" }}>
                <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {hata}
              </div>
            )}
            {mesaj && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", background: "var(--green-light)", border: "1px solid rgba(45,212,160,.2)", borderRadius: 9, fontSize: 13, color: "var(--green)" }}>
                <CheckCircle2 size={13} /> {mesaj}
              </div>
            )}

            <button type="submit" disabled={yukleniyor}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "13px", background: "var(--amber)", color: "#05070d",
                fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
                borderRadius: 10, border: "none", cursor: yukleniyor ? "not-allowed" : "pointer",
                opacity: yukleniyor ? 0.7 : 1, transition: "all .18s",
                boxShadow: "0 2px 16px rgba(255,177,27,.28)",
              }}>
              {yukleniyor ? "İşleniyor..." : mod === "giris" ? "Giriş Yap" : mod === "kayit" ? "Hesap Oluştur" : "Sıfırlama Gönder"}
            </button>
          </form>

          {mod === "giris" && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button type="button" onClick={() => { setMod("sifre"); temizle(); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: "var(--ink-4)", fontFamily: "var(--font-sans)" }}>
                Şifremi unuttum
              </button>
            </div>
          )}
          {mod === "sifre" && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button type="button" onClick={() => { setMod("giris"); temizle(); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, color: "var(--amber)", fontFamily: "var(--font-sans)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <ArrowLeft size={12} /> Giriş ekranına dön
              </button>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 18, fontSize: 11, color: "var(--ink-4)" }}>
          tooldur.com · 256-bit SSL koruması
        </p>
      </div>
    </div>
  );
}