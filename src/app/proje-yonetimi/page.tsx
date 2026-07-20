"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  GripVertical,
  RotateCcw,
  Clock3,
  Gauge,
  Target,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  ArrowUpDown,
  Trash2,
  UserMinus,
  MailX,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/usePmAuth";
import AuthEkrani from "./AuthEkrani";
import GorevDetayModal from "./GorevDetayModal";

import {
  projeleriDinle,
  gorevleriDinle,
  projeEkle,
  projeGuncelle,
  projeSil,
  gorevEkle,
  gorevSil,
  gorevGuncelle,
  uyeDavetEt,
  projeUyeKaldir,
  projeDavetIptalEt,
  kullanicilariAra,
  bekleyenDavetleriGetir,
  davetiKabulEt,
  davetiReddet,
  type BekleyenDavet,
} from "@/lib/pm-db-supabase";

import {
  useBildirimler,
  gorevBildirimleriniHesapla,
  type InAppBildirim,
} from "@/hooks/useBildirimler";

import type { Durum, Gorev, Oncelik, Proje, UyeRef } from "./pm-types";
import {
  KOLONLAR,
  ONCELIK_MAP,
  PROJE_EMOJILER,
  PROJE_RENKLERI,
} from "./pm-constants";

type Sekme = "kanban" | "liste" | "takvim" | "analiz";
type HizliFiltre = "tum" | "acik" | "bugun" | "geciken" | "tamamlanan";
type Siralama = "varsayilan" | "termin" | "oncelik" | "guncel";

type GorevForm = {
  baslik: string;
  aciklama: string;
  durum: Durum;
  oncelik: Oncelik;
  termin: string;
  etiketler: string;
  atananlar: UyeRef[];
};

function bugunAnahtari() {
  const d = new Date();
  const yil = d.getFullYear();
  const ay = String(d.getMonth() + 1).padStart(2, "0");
  const gun = String(d.getDate()).padStart(2, "0");
  return `${yil}-${ay}-${gun}`;
}

function tarihOlustur(value: string) {
  const [yil, ay, gun] = value.split("-").map(Number);
  if (!yil || !ay || !gun) return new Date(value);
  return new Date(yil, ay - 1, gun);
}

function tarihFormatla(value: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "Termin yok";
  return tarihOlustur(value).toLocaleDateString("tr-TR", options);
}

function hataMesaji(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
}

function Avatar({ uye, size = 30 }: { uye: UyeRef; size?: number }) {
  const fallback = (uye.displayName || uye.email || "?").slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        overflow: "hidden",
        background: "linear-gradient(135deg, #ffb11b, #e99500)",
        color: "#07111f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(10, size * 0.35),
        fontWeight: 700,
        flexShrink: 0,
        border: "2px solid var(--bg-card)",
      }}
    >
      {uye.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={uye.photoURL} alt={uye.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        fallback
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  maxWidth = 560,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  useEffect(() => {
    const oncekiOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oncekiOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="pmx-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pmx-modal-shell" style={{ maxWidth }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="pmx-modal-head">
          <div>
            <div className="pmx-eyebrow">Tooldur</div>
            <h3 className="pmx-modal-title">{title}</h3>
          </div>
          <button className="pmx-icon-btn" onClick={onClose} aria-label="Pencereyi kapat">
            <X size={16} />
          </button>
        </div>
        <div className="pmx-modal-body">{children}</div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="pmx-stat-card">
      <div className="pmx-stat-top">
        <div className="pmx-stat-icon">{icon}</div>
        <span className="pmx-stat-label">{label}</span>
      </div>
      <div className="pmx-stat-value">{value}</div>
      <div className="pmx-stat-hint">{hint}</div>
    </div>
  );
}

function TaskCard({
  gorev,
  onOpen,
  onDelete,
  onStatusChange,
}: {
  gorev: Gorev;
  onOpen: (g: Gorev) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, durum: Durum) => void;
}) {
  const oncelik = ONCELIK_MAP[gorev.oncelik];
  const checklistToplam = gorev.checklistler?.length ?? 0;
  const checklistTamam = gorev.checklistler?.filter((c) => c.tamamlandi).length ?? 0;
  const gecikmis = !!gorev.termin && gorev.durum !== "tamamlandi" && gorev.termin < bugunAnahtari();

  return (
    <div
      className="pmx-task-card"
      onClick={() => onOpen(gorev)}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(gorev); } }}
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", gorev.id);
      }}
    >
      <div className="pmx-task-top">
        <div className="pmx-task-top-left">
          <GripVertical size={14} className="pmx-drag-handle" />
          <span className="pmx-priority-pill" style={{ background: oncelik.bg, color: oncelik.color }}>
            {oncelik.label}
          </span>
        </div>

        <div className="pmx-task-actions">
          <button
            className="pmx-ghost-btn pmx-complete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(gorev.id, gorev.durum === "tamamlandi" ? "yapilacak" : "tamamlandi");
            }}
            title={gorev.durum === "tamamlandi" ? "Görevi yeniden aç" : "Tamamlandı olarak işaretle"}
          >
            {gorev.durum === "tamamlandi" ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
          </button>
          <button
            className="pmx-ghost-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Görev silinsin mi?")) onDelete(gorev.id);
            }}
            title="Görevi sil"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h4 className="pmx-task-title">{gorev.baslik}</h4>

      {!!gorev.aciklama && <p className="pmx-task-desc">{gorev.aciklama}</p>}

      {!!gorev.etiketler?.length && (
        <div className="pmx-tag-wrap">
          {gorev.etiketler.slice(0, 3).map((etiket) => (
            <span key={etiket} className="pmx-tag">
              #{etiket}
            </span>
          ))}
        </div>
      )}

      <div className="pmx-task-meta">
        <span className={`pmx-meta-chip ${gecikmis ? "is-danger" : ""}`}>
          <CalendarDays size={12} />
          {tarihFormatla(gorev.termin)}
        </span>

        <span className="pmx-meta-chip">
          <CheckCircle2 size={12} />
          {checklistToplam ? `${checklistTamam}/${checklistToplam}` : "Check yok"}
        </span>
      </div>

      <label className="pmx-mobile-status" onClick={(e) => e.stopPropagation()}>
        <span>Durumu değiştir</span>
        <select
          value={gorev.durum}
          onChange={(e) => onStatusChange(gorev.id, e.target.value as Durum)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`${gorev.baslik} görev durumunu değiştir`}
        >
          {KOLONLAR.map((kolon) => (
            <option key={kolon.id} value={kolon.id}>{kolon.label}</option>
          ))}
        </select>
      </label>

      <div className="pmx-task-footer">
        <div className="pmx-avatar-row">
          {gorev.atananlar?.length ? (
            gorev.atananlar.slice(0, 3).map((uye, index) => (
              <div key={uye.uid} style={{ marginLeft: index === 0 ? 0 : -10 }}>
                <Avatar uye={uye} size={28} />
              </div>
            ))
          ) : (
            <span className="pmx-muted">Atanmamış</span>
          )}
        </div>

        <span className="pmx-muted">
          {gorev.yorumlar?.length ?? 0} yorum · {gorev.ekler?.length ?? 0} ek
        </span>
      </div>
    </div>
  );
}

function ProjeOlusturModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (payload: { ad: string; aciklama: string; renk: string; emoji: string }) => Promise<void>;
}) {
  const [ad, setAd] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [renk, setRenk] = useState(PROJE_RENKLERI[0]);
  const [emoji, setEmoji] = useState(PROJE_EMOJILER[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal title="Yeni Proje Oluştur" onClose={onClose}>
      <div className="pmx-form-grid">
        <div>
          <label className="pmx-label">Proje adı</label>
          <input className="pmx-input" value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Örn. Mobil Uygulama" />
        </div>

        <div>
          <label className="pmx-label">Açıklama</label>
          <textarea
            className="pmx-input pmx-textarea"
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Kısa proje özeti"
          />
        </div>

        <div>
          <label className="pmx-label">Renk</label>
          <div className="pmx-color-grid">
            {PROJE_RENKLERI.map((r) => (
              <button
                key={r}
                className={`pmx-color-btn ${renk === r ? "is-active" : ""}`}
                style={{ background: r }}
                onClick={() => setRenk(r)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="pmx-label">Emoji</label>
          <div className="pmx-emoji-grid">
            {PROJE_EMOJILER.map((e) => (
              <button key={e} className={`pmx-emoji-btn ${emoji === e ? "is-active" : ""}`} onClick={() => setEmoji(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {!!error && <div className="pmx-error-note">{error}</div>}

        <div className="pmx-actions">
          <button className="pmx-btn pmx-btn-secondary" onClick={onClose}>
            Vazgeç
          </button>
          <button
            className="pmx-btn pmx-btn-primary"
            disabled={!ad.trim() || saving}
            onClick={async () => {
              setSaving(true);
              setError("");
              try {
                await onSave({ ad: ad.trim(), aciklama: aciklama.trim(), renk, emoji });
                onClose();
              } catch (err) {
                setError(hataMesaji(err));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Kaydediliyor..." : "Projeyi Oluştur"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ProjeAyarModal({
  proje,
  onClose,
  onSave,
}: {
  proje: Proje;
  onClose: () => void;
  onSave: (payload: { ad: string; aciklama: string; renk: string; emoji: string }) => Promise<void>;
}) {
  const [ad, setAd] = useState(proje.ad);
  const [aciklama, setAciklama] = useState(proje.aciklama || "");
  const [renk, setRenk] = useState(proje.renk || PROJE_RENKLERI[0]);
  const [emoji, setEmoji] = useState(proje.emoji || PROJE_EMOJILER[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal title="Proje Ayarları" onClose={onClose} maxWidth={620}>
      <div className="pmx-settings-preview">
        <div className="pmx-settings-emoji" style={{ background: `${renk}22`, borderColor: `${renk}66` }}>{emoji}</div>
        <div>
          <strong>{ad.trim() || "Proje adı"}</strong>
          <span>{aciklama.trim() || "Proje açıklaması burada görünür."}</span>
        </div>
      </div>

      <div className="pmx-form-grid">
        <div>
          <label className="pmx-label">Proje adı</label>
          <input className="pmx-input" value={ad} onChange={(e) => setAd(e.target.value)} maxLength={80} />
        </div>
        <div>
          <label className="pmx-label">Açıklama</label>
          <textarea className="pmx-input pmx-textarea" value={aciklama} onChange={(e) => setAciklama(e.target.value)} maxLength={500} />
        </div>
        <div>
          <label className="pmx-label">Proje rengi</label>
          <div className="pmx-color-grid">
            {PROJE_RENKLERI.map((r) => (
              <button key={r} type="button" className={`pmx-color-btn ${renk === r ? "is-active" : ""}`} style={{ background: r }} onClick={() => setRenk(r)} aria-label={`Renk ${r}`} />
            ))}
          </div>
        </div>
        <div>
          <label className="pmx-label">Proje simgesi</label>
          <div className="pmx-emoji-grid">
            {PROJE_EMOJILER.map((e) => (
              <button key={e} type="button" className={`pmx-emoji-btn ${emoji === e ? "is-active" : ""}`} onClick={() => setEmoji(e)}>{e}</button>
            ))}
          </div>
        </div>

        {!!error && <div className="pmx-error-note">{error}</div>}

        <div className="pmx-actions">
          <button className="pmx-btn pmx-btn-secondary" onClick={onClose}>Vazgeç</button>
          <button
            className="pmx-btn pmx-btn-primary"
            disabled={!ad.trim() || saving}
            onClick={async () => {
              setSaving(true);
              setError("");
              try {
                await onSave({ ad: ad.trim(), aciklama: aciklama.trim(), renk, emoji });
                onClose();
              } catch (err) {
                setError(hataMesaji(err));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function GorevOlusturModal({
  onClose,
  onSave,
  initialDurum = "yapilacak",
  uyeler,
}: {
  onClose: () => void;
  onSave: (payload: GorevForm) => Promise<void>;
  initialDurum?: Durum;
  uyeler: UyeRef[];
}) {
  const [form, setForm] = useState<GorevForm>({
    baslik: "",
    aciklama: "",
    durum: initialDurum,
    oncelik: "orta",
    termin: "",
    etiketler: "",
    atananlar: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof GorevForm>(key: K, value: GorevForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Modal title="Yeni Görev Oluştur" onClose={onClose}>
      <div className="pmx-form-grid">
        <div>
          <label className="pmx-label">Başlık</label>
          <input className="pmx-input" value={form.baslik} onChange={(e) => setField("baslik", e.target.value)} placeholder="Görev başlığı" />
        </div>

        <div>
          <label className="pmx-label">Açıklama</label>
          <textarea
            className="pmx-input pmx-textarea"
            value={form.aciklama}
            onChange={(e) => setField("aciklama", e.target.value)}
            placeholder="Detay gir"
          />
        </div>

        <div className="pmx-two-col">
          <div>
            <label className="pmx-label">Durum</label>
            <select className="pmx-input" value={form.durum} onChange={(e) => setField("durum", e.target.value as Durum)}>
              {KOLONLAR.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="pmx-label">Öncelik</label>
            <select className="pmx-input" value={form.oncelik} onChange={(e) => setField("oncelik", e.target.value as Oncelik)}>
              <option value="dusuk">Düşük</option>
              <option value="orta">Orta</option>
              <option value="yuksek">Yüksek</option>
            </select>
          </div>
        </div>

        <div className="pmx-two-col">
          <div>
            <label className="pmx-label">Termin</label>
            <input className="pmx-input" type="date" value={form.termin} onChange={(e) => setField("termin", e.target.value)} />
          </div>

          <div>
            <label className="pmx-label">Etiketler</label>
            <input
              className="pmx-input"
              value={form.etiketler}
              onChange={(e) => setField("etiketler", e.target.value)}
              placeholder="ui, api, acil"
            />
          </div>
        </div>

        {!!uyeler.length && (
          <div>
            <label className="pmx-label">Atananlar</label>
            <div className="pmx-assignee-grid">
              {uyeler.map((uye) => {
                const secili = form.atananlar.some((atanan) => atanan.uid === uye.uid);
                return (
                  <button
                    type="button"
                    key={uye.uid}
                    className={`pmx-assignee-choice ${secili ? "is-active" : ""}`}
                    onClick={() => setField("atananlar", secili ? form.atananlar.filter((x) => x.uid !== uye.uid) : [...form.atananlar, uye])}
                  >
                    <Avatar uye={uye} size={30} />
                    <span>{uye.displayName || uye.email}</span>
                    <CheckCircle2 size={15} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!!error && <div className="pmx-error-note">{error}</div>}

        <div className="pmx-actions">
          <button className="pmx-btn pmx-btn-secondary" onClick={onClose}>
            Vazgeç
          </button>
          <button
            className="pmx-btn pmx-btn-primary"
            disabled={!form.baslik.trim() || saving}
            onClick={async () => {
              setSaving(true);
              setError("");
              try {
                await onSave(form);
                onClose();
              } catch (err) {
                setError(hataMesaji(err));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Kaydediliyor..." : "Görevi Oluştur"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DavetModal({
  proje,
  onClose,
  onInviteEmail,
  onRemoveMember,
  onCancelInvite,
  canManage,
  sahip,
}: {
  proje: Proje;
  onClose: () => void;
  onInviteEmail: (email: string) => Promise<void>;
  onRemoveMember: (uid: string) => Promise<void>;
  onCancelInvite: (email: string) => Promise<void>;
  canManage: boolean;
  sahip: UyeRef | null;
}) {
  const [query, setQuery] = useState("");
  const [sonuclar, setSonuclar] = useState<UyeRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string>("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const ekipUyeleri = useMemo(
    () => Array.from(new Map([...(sahip ? [sahip] : []), ...(proje.uyeler || [])].map((uye) => [uye.uid, uye])).values()),
    [proje.uyeler, sahip]
  );
  const mevcutUidler = useMemo(() => ekipUyeleri.map((u) => u.uid), [ekipUyeleri]);
  const davetliler = proje.davetliler || [];
  const emailMi = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query.trim());

  useEffect(() => {
    const q = query.trim();
    setInfo("");

    if (q.length < 2) {
      setSonuclar([]);
      setLoading(false);
      return;
    }

    let alive = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await kullanicilariAra(q, mevcutUidler);
        if (alive) setSonuclar(rows);
      } catch {
        if (alive) setSonuclar([]);
      } finally {
        if (alive) setLoading(false);
      }
    }, 260);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query, mevcutUidler]);

  async function sendEmailInvite(email: string) {
    const temiz = email.trim().toLowerCase();
    if (!temiz) return;
    setSending(temiz);
    setInfo("");
    setError("");
    try {
      await onInviteEmail(temiz);
      setInfo(`${temiz} için davet kaydedildi.`);
      setQuery("");
      setSonuclar([]);
    } catch (err) {
      setError(hataMesaji(err));
    } finally {
      setSending("");
    }
  }

  async function inviteKnownUser(uye: UyeRef) {
    if (!uye.email) return;
    setSending(uye.uid);
    setInfo("");
    setError("");
    try {
      await onInviteEmail(uye.email.trim().toLowerCase());
      setInfo(`${uye.displayName || uye.email} için davet gönderildi. Projeye ancak kabul edince eklenecek.`);
      setQuery("");
      setSonuclar([]);
    } catch (err) {
      setError(hataMesaji(err));
    } finally {
      setSending("");
    }
  }

  return (
    <Modal title="Takım Yönetimi" onClose={onClose} maxWidth={720}>
      <div className="pmx-invite-modal">
        <section className="pmx-team-section">
          <div className="pmx-team-section-head">
            <div>
              <div className="pmx-panel-title">Proje Ekibi</div>
              <span>{ekipUyeleri.length} kayıtlı üye</span>
            </div>
            <span className="pmx-meta-chip">{canManage ? "Yönetici" : "Üye"}</span>
          </div>
          <div className="pmx-team-list">
            {ekipUyeleri.length ? ekipUyeleri.map((uye) => (
              <div key={uye.uid} className="pmx-team-row">
                <Avatar uye={uye} size={40} />
                <div className="pmx-user-row-main">
                  <strong>{uye.displayName || uye.email}</strong>
                  <span>{uye.email || "E-posta bilgisi yok"}</span>
                </div>
                <span className="pmx-member-role">{uye.uid === proje.sahipUid || uye.rol === "sahip" ? "Sahip" : "Üye"}</span>
                {canManage && uye.uid !== proje.sahipUid && (
                  <button
                    className="pmx-ghost-btn pmx-danger-icon"
                    title="Üyeyi projeden çıkar"
                    onClick={async () => {
                      if (!confirm(`${uye.displayName || uye.email} projeden çıkarılsın mı?`)) return;
                      setSending(`remove-${uye.uid}`);
                      setError("");
                      try {
                        await onRemoveMember(uye.uid);
                      } catch (err) {
                        setError(hataMesaji(err));
                      } finally {
                        setSending("");
                      }
                    }}
                    disabled={sending === `remove-${uye.uid}`}
                  >
                    <UserMinus size={15} />
                  </button>
                )}
              </div>
            )) : <div className="pmx-mini-state">Projeye henüz ekip üyesi katılmadı.</div>}
          </div>
        </section>

        <div className="pmx-invite-hero">
          <div className="pmx-invite-hero-icon"><UserPlus size={20} /></div>
          <div>
            <strong>Projeye davet gönder</strong>
            <span>Kullanıcı doğrudan eklenmez. Daveti kabul edince projeye katılır.</span>
          </div>
        </div>

        <div>
          <label className="pmx-label">E-posta veya kullanıcı adı</label>
          <div className="pmx-member-search">
            <Search size={17} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Örn. merve@firma.com veya Merve"
            />
          </div>
          <div className="pmx-help-text">
            Kayıtlı kullanıcıyı seçersen e-posta adresine davet kaydedilir. Kullanıcı onaylamadan üye olmaz.
          </div>
        </div>

        {loading && <div className="pmx-mini-state">Kullanıcılar aranıyor...</div>}

        {!loading && query.trim().length >= 2 && (
          <div className="pmx-user-results">
            {sonuclar.length ? (
              sonuclar.map((uye) => {
                const pending = davetliler.includes(uye.email);
                return (
                  <div key={uye.uid} className="pmx-user-row">
                    <Avatar uye={uye} size={38} />
                    <div className="pmx-user-row-main">
                      <strong>{uye.displayName || uye.email}</strong>
                      <span>{uye.email}</span>
                    </div>
                    <button
                      className="pmx-btn pmx-btn-primary"
                      disabled={pending || sending === uye.uid || sending === uye.email}
                      onClick={() => inviteKnownUser(uye)}
                    >
                      {pending ? "Davetli" : sending === uye.uid ? "Gönderiliyor..." : "Davet Gönder"}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="pmx-mini-state">Kayıtlı kullanıcı bulunamadı.</div>
            )}
          </div>
        )}

        {emailMi && !davetliler.includes(query.trim().toLowerCase()) && (
          <button
            className="pmx-email-invite"
            disabled={!!sending}
            onClick={() => sendEmailInvite(query)}
          >
            <UserPlus size={18} />
            <span><strong>{query.trim().toLowerCase()}</strong> adresine davet gönder</span>
            <ChevronRight size={16} />
          </button>
        )}

        {!!davetliler.length && (
          <div className="pmx-pending-box">
            <div className="pmx-panel-title" style={{ marginBottom: 10 }}>Bekleyen Davetler</div>
            <div className="pmx-pending-list">
              {davetliler.map((email) => (
                <div key={email} className="pmx-pending-row">
                  <span className="pmx-meta-chip">{email}</span>
                  {canManage && (
                    <button
                      className="pmx-ghost-btn pmx-danger-icon"
                      title="Daveti iptal et"
                      onClick={async () => {
                        setSending(`cancel-${email}`);
                        setError("");
                        try {
                          await onCancelInvite(email);
                        } catch (err) {
                          setError(hataMesaji(err));
                        } finally {
                          setSending("");
                        }
                      }}
                      disabled={sending === `cancel-${email}`}
                    >
                      <MailX size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!!error && <div className="pmx-error-note">{error}</div>}
        {!!info && <div className="pmx-success-note">{info}</div>}
      </div>
    </Modal>
  );
}

function ListeGorunumu({
  gorevler,
  onOpen,
  onDelete,
}: {
  gorevler: Gorev[];
  onOpen: (g: Gorev) => void;
  onDelete: (id: string) => void;
}) {
  if (!gorevler.length) return <div className="pmx-empty">Filtreye uygun görev bulunamadı.</div>;

  return (
    <div className="pmx-list-wrap">
      {gorevler.map((gorev) => {
        const durumLabel = KOLONLAR.find((k) => k.id === gorev.durum)?.label || gorev.durum;
        const oncelik = ONCELIK_MAP[gorev.oncelik];

        return (
          <div key={gorev.id} className="pmx-list-item" onClick={() => onOpen(gorev)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(gorev); } }} role="button" tabIndex={0}>
            <div className="pmx-list-main">
              <h4>{gorev.baslik}</h4>
              <p>{gorev.aciklama || "Açıklama yok"}</p>
            </div>

            <div className="pmx-list-side">
              <span className="pmx-meta-chip">{durumLabel}</span>
              <span className="pmx-priority-pill" style={{ background: oncelik.bg, color: oncelik.color }}>
                {oncelik.label}
              </span>
              <span className="pmx-muted">{tarihFormatla(gorev.termin)}</span>
              <button
                className="pmx-ghost-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Görev silinsin mi?")) onDelete(gorev.id);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TakvimGorunumu({ gorevler, onOpen }: { gorevler: Gorev[]; onOpen: (g: Gorev) => void }) {
  const tarihli = [...gorevler]
    .filter((g) => !!g.termin)
    .sort((a, b) => tarihOlustur(a.termin).getTime() - tarihOlustur(b.termin).getTime());

  if (!tarihli.length) return <div className="pmx-empty">Terminli görev yok.</div>;

  return (
    <div className="pmx-timeline">
      {tarihli.map((gorev) => {
        const gecikmis = gorev.durum !== "tamamlandi" && gorev.termin < bugunAnahtari();
        return (
          <button key={gorev.id} className="pmx-timeline-item" onClick={() => onOpen(gorev)}>
            <div className="pmx-timeline-date">
              <span>{tarihFormatla(gorev.termin, { day: "2-digit" })}</span>
              <small>{tarihFormatla(gorev.termin, { month: "short" })}</small>
            </div>
            <div className="pmx-timeline-content">
              <h4>{gorev.baslik}</h4>
              <p>{gorev.aciklama || "Açıklama yok"}</p>
            </div>
            <div className={`pmx-timeline-status ${gecikmis ? "is-danger" : ""}`}>
              {gecikmis ? "Gecikmiş" : KOLONLAR.find((k) => k.id === gorev.durum)?.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function GanttGorunumu({ gorevler, onOpen }: { gorevler: Gorev[]; onOpen: (g: Gorev) => void }) {
  const tarihli = [...gorevler]
    .filter((g) => !!g.termin)
    .sort((a, b) => tarihOlustur(a.termin).getTime() - tarihOlustur(b.termin).getTime());

  if (!tarihli.length) return <div className="pmx-empty">Gantt için terminli görev yok.</div>;

  const gunMs = 24 * 60 * 60 * 1000;
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const minTermin = tarihOlustur(tarihli[0].termin);
  minTermin.setHours(0, 0, 0, 0);
  const maxTermin = tarihOlustur(tarihli[tarihli.length - 1].termin);
  maxTermin.setHours(0, 0, 0, 0);

  const baslangic = new Date(Math.min(bugun.getTime(), minTermin.getTime()));
  baslangic.setDate(baslangic.getDate() - 1);
  const bitis = new Date(Math.max(bugun.getTime(), maxTermin.getTime()));
  bitis.setDate(bitis.getDate() + 3);

  const toplamGun = Math.max(7, Math.round((bitis.getTime() - baslangic.getTime()) / gunMs) + 1);
  const gunler = Array.from({ length: toplamGun }, (_, i) => {
    const d = new Date(baslangic);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="pmx-gantt-shell">
      <div className="pmx-gantt-head">
        <div>
          <div className="pmx-panel-title">Gantt & Takvim</div>
          <p>Terminli görevlerin zaman çizelgesi</p>
        </div>
        <span className="pmx-meta-chip">{tarihli.length} görev</span>
      </div>

      <div className="pmx-gantt-scroll">
        <div className="pmx-gantt-grid" style={{ minWidth: Math.max(720, 210 + toplamGun * 54) }}>
          <div className="pmx-gantt-left pmx-gantt-left-head">Görev</div>
          <div className="pmx-gantt-days" style={{ gridTemplateColumns: `repeat(${toplamGun}, 54px)` }}>
            {gunler.map((gun) => {
              const isToday = gun.toDateString() === bugun.toDateString();
              return (
                <div key={gun.toISOString()} className={`pmx-gantt-day ${isToday ? "is-today" : ""}`}>
                  <strong>{gun.toLocaleDateString("tr-TR", { day: "2-digit" })}</strong>
                  <span>{gun.toLocaleDateString("tr-TR", { month: "short" })}</span>
                </div>
              );
            })}
          </div>

          {tarihli.map((gorev) => {
            const termin = tarihOlustur(gorev.termin);
            termin.setHours(0, 0, 0, 0);
            const gunIndex = Math.max(0, Math.round((termin.getTime() - baslangic.getTime()) / gunMs));
            const startIndex = Math.max(0, Math.round((Math.min(bugun.getTime(), termin.getTime()) - baslangic.getTime()) / gunMs));
            const span = Math.max(1, gunIndex - startIndex + 1);
            const kolon = KOLONLAR.find((k) => k.id === gorev.durum);
            const gecikmis = gorev.durum !== "tamamlandi" && termin < bugun;

            return (
              <React.Fragment key={gorev.id}>
                <button className="pmx-gantt-left" onClick={() => onOpen(gorev)}>
                  <span className="pmx-project-dot" style={{ background: kolon?.renk || "var(--amber)" }} />
                  <span>{gorev.baslik}</span>
                </button>
                <div className="pmx-gantt-row" style={{ gridTemplateColumns: `repeat(${toplamGun}, 54px)` }}>
                  {gunler.map((gun) => (
                    <div key={`${gorev.id}-${gun.toISOString()}`} className="pmx-gantt-cell" />
                  ))}
                  <button
                    className={`pmx-gantt-bar ${gecikmis ? "is-danger" : ""}`}
                    style={{ gridColumn: `${startIndex + 1} / span ${span}`, background: gecikmis ? "rgba(239,68,68,.72)" : kolon?.renk || "var(--amber)" }}
                    onClick={() => onOpen(gorev)}
                    title={gorev.baslik}
                  >
                    <span>{gorev.baslik}</span>
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AnalizGorunumu({ gorevler }: { gorevler: Gorev[] }) {
  const gercekToplam = gorevler.length;
  const toplam = gercekToplam || 1;
  const tamamlanan = gorevler.filter((g) => g.durum === "tamamlandi").length;
  const tamamlanmaOrani = Math.round((tamamlanan / toplam) * 100);
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const haftaSonu = new Date(bugun);
  haftaSonu.setDate(haftaSonu.getDate() + 7);

  const geciken = gorevler.filter((g) => {
    if (!g.termin || g.durum === "tamamlandi") return false;
    const d = tarihOlustur(g.termin);
    d.setHours(0, 0, 0, 0);
    return d < bugun;
  });

  const buHafta = gorevler.filter((g) => {
    if (!g.termin || g.durum === "tamamlandi") return false;
    const d = tarihOlustur(g.termin);
    d.setHours(0, 0, 0, 0);
    return d >= bugun && d <= haftaSonu;
  });

  const yuksekOncelik = gorevler.filter((g) => g.oncelik === "yuksek" && g.durum !== "tamamlandi").length;
  const riskPuani = Math.min(100, Math.round((geciken.length * 24 + yuksekOncelik * 14 + buHafta.length * 6) / Math.max(1, gercekToplam) * 3));
  const saglikPuani = Math.max(0, 100 - riskPuani);
  const saglikMetni = saglikPuani >= 75 ? "İyi" : saglikPuani >= 45 ? "Dikkat" : "Riskli";

  const durumVerisi = KOLONLAR.map((kolon) => {
    const value = gorevler.filter((g) => g.durum === kolon.id).length;
    return {
      label: kolon.label,
      value,
      color: kolon.renk,
      pct: Math.round((value / toplam) * 100),
    };
  });

  const oncelikVerisi = (["dusuk", "orta", "yuksek"] as Oncelik[]).map((o) => {
    const value = gorevler.filter((g) => g.oncelik === o).length;
    return {
      label: ONCELIK_MAP[o].label,
      value,
      color: ONCELIK_MAP[o].color,
      bg: ONCELIK_MAP[o].bg,
      pct: Math.round((value / toplam) * 100),
    };
  });

  const uyeYuku = new Map<string, { ad: string; email?: string; count: number; tamam: number }>();
  gorevler.forEach((g) => {
    const uyeler = g.atananlar?.length ? g.atananlar : [{ uid: "atanmamis", displayName: "Atanmamış", email: "" } as UyeRef];
    uyeler.forEach((uye) => {
      const key = uye.uid || uye.email || "atanmamis";
      const onceki = uyeYuku.get(key) || { ad: uye.displayName || uye.email || "Atanmamış", email: uye.email, count: 0, tamam: 0 };
      onceki.count += 1;
      if (g.durum === "tamamlandi") onceki.tamam += 1;
      uyeYuku.set(key, onceki);
    });
  });
  const uyeYukuListesi = Array.from(uyeYuku.values()).sort((a, b) => b.count - a.count).slice(0, 6);

  const yaklasanTerminler = [...gorevler]
    .filter((g) => g.termin && g.durum !== "tamamlandi")
    .sort((a, b) => new Date(a.termin).getTime() - new Date(b.termin).getTime())
    .slice(0, 6);

  const raporCumleleri = [
    gercekToplam ? `${gercekToplam} görevden ${tamamlanan} tanesi tamamlandı.` : "Bu projede henüz görev yok.",
    geciken.length ? `${geciken.length} görev gecikmiş görünüyor.` : "Geciken görev yok.",
    buHafta.length ? `${buHafta.length} görev önümüzdeki yedi gün içinde teslim edilmeli.` : "Bu hafta teslim baskısı yok.",
    yuksekOncelik ? `${yuksekOncelik} yüksek öncelikli açık görev var.` : "Açık yüksek öncelikli görev yok.",
  ];

  return (
    <div className="pmx-analytics-page">
      <section className="pmx-health-card">
        <div className="pmx-health-main">
          <div className="pmx-eyebrow">Proje Sağlığı</div>
          <div className="pmx-health-score">{saglikPuani}</div>
          <div className="pmx-health-label">{saglikMetni}</div>
          <p>
            Geciken işler, yüksek öncelikli açık görevler ve yakın terminler birlikte değerlendirilerek
            hızlı bir proje sağlık skoru üretildi.
          </p>
        </div>

        <div className="pmx-health-ring" style={{ "--score": `${saglikPuani}%` } as React.CSSProperties}>
          <span>{tamamlanmaOrani}%</span>
          <small>Tamamlanma</small>
        </div>
      </section>

      <section className="pmx-kpi-grid">
        <div className="pmx-kpi-card">
          <Target size={18} />
          <strong>{tamamlanmaOrani}%</strong>
          <span>Tamamlanma oranı</span>
        </div>
        <div className="pmx-kpi-card">
          <AlertTriangle size={18} />
          <strong>{geciken.length}</strong>
          <span>Geciken açık görev</span>
        </div>
        <div className="pmx-kpi-card">
          <CalendarDays size={18} />
          <strong>{buHafta.length}</strong>
          <span>Bu hafta teslim</span>
        </div>
        <div className="pmx-kpi-card">
          <Gauge size={18} />
          <strong>{yuksekOncelik}</strong>
          <span>Yüksek öncelik</span>
        </div>
      </section>

      <div className="pmx-analytics-grid">
        <div className="pmx-panel">
          <div className="pmx-panel-title">Durum Dağılımı</div>
          <div className="pmx-chart-stack">
            {durumVerisi.map((item) => (
              <div key={item.label} className="pmx-chart-row">
                <div className="pmx-chart-head">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="pmx-bar">
                  <div className="pmx-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pmx-panel">
          <div className="pmx-panel-title">Öncelik Dağılımı</div>
          <div className="pmx-chart-stack">
            {oncelikVerisi.map((item) => (
              <div key={item.label} className="pmx-chart-row">
                <div className="pmx-chart-head">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <div className="pmx-bar">
                  <div className="pmx-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="pmx-analytics-grid pmx-analytics-grid-2">
        <div className="pmx-panel">
          <div className="pmx-panel-title">Takım İş Yükü</div>
          <div className="pmx-workload-list">
            {uyeYukuListesi.length ? (
              uyeYukuListesi.map((uye) => {
                const pct = Math.round((uye.tamam / Math.max(1, uye.count)) * 100);
                return (
                  <div key={uye.ad} className="pmx-workload-row">
                    <div>
                      <strong>{uye.ad}</strong>
                      <span>{uye.count} görev · {pct}% tamamlandı</span>
                    </div>
                    <div className="pmx-workload-meter"><span style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })
            ) : (
              <div className="pmx-empty" style={{ padding: 22 }}>Henüz görev ataması yok.</div>
            )}
          </div>
        </div>

        <div className="pmx-panel">
          <div className="pmx-panel-title">Yaklaşan Terminler</div>
          <div className="pmx-deadline-list">
            {yaklasanTerminler.length ? (
              yaklasanTerminler.map((gorev) => {
                const d = tarihOlustur(gorev.termin);
                const kalan = Math.ceil((d.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={gorev.id} className={`pmx-deadline-row ${kalan < 0 ? "is-danger" : kalan <= 2 ? "is-warn" : ""}`}>
                    <div>
                      <strong>{gorev.baslik}</strong>
                      <span>{d.toLocaleDateString("tr-TR")} · {KOLONLAR.find((k) => k.id === gorev.durum)?.label}</span>
                    </div>
                    <b>{kalan < 0 ? `${Math.abs(kalan)} gün geçti` : kalan === 0 ? "Bugün" : `${kalan} gün`}</b>
                  </div>
                );
              })
            ) : (
              <div className="pmx-empty" style={{ padding: 22 }}>Yaklaşan termin yok.</div>
            )}
          </div>
        </div>
      </section>

      <section className="pmx-report-card">
        <div>
          <div className="pmx-panel-title">Yönetici Özeti</div>
          <p>{raporCumleleri.join(" ")}</p>
        </div>
        <div className="pmx-report-actions">
          <button
            className="pmx-btn pmx-btn-secondary"
            onClick={() => navigator.clipboard?.writeText(raporCumleleri.join(" "))}
          >
            Özeti Kopyala
          </button>
        </div>
      </section>
    </div>
  );
}

export default function ProjeYonetimiPage() {
  const { user, loading, cikisYap } = useAuth();

  const [projeler, setProjeler] = useState<Proje[]>([]);
  const [gorevler, setGorevler] = useState<Gorev[]>([]);
  const [projelerYukleniyor, setProjelerYukleniyor] = useState(true);
  const [gorevlerYukleniyor, setGorevlerYukleniyor] = useState(false);
  const [panelHatasi, setPanelHatasi] = useState("");
  const [aktifProjeId, setAktifProjeId] = useState<string>("");
  const [seciliGorev, setSeciliGorev] = useState<Gorev | null>(null);
  const [sekme, setSekme] = useState<Sekme>("kanban");
  const [arama, setArama] = useState("");
  const [oncelikFiltre, setOncelikFiltre] = useState<Oncelik | "tum">("tum");
  const [uyeFiltre, setUyeFiltre] = useState<string>("tum");
  const [bildirimAcik, setBildirimAcik] = useState(false);
  const [projeModalAcik, setProjeModalAcik] = useState(false);
  const [projeAyarModalAcik, setProjeAyarModalAcik] = useState(false);
  const [gorevModalAcik, setGorevModalAcik] = useState(false);
  const [gorevBaslangicDurum, setGorevBaslangicDurum] = useState<Durum>("yapilacak");
  const [davetModalAcik, setDavetModalAcik] = useState(false);
  const [davetler, setDavetler] = useState<BekleyenDavet[]>([]);
  const [pendingToolItem, setPendingToolItem] = useState<any>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Durum | null>(null);
  const [kompaktGorunum, setKompaktGorunum] = useState(false);
  const [hizliFiltre, setHizliFiltre] = useState<HizliFiltre>("tum");
  const [siralama, setSiralama] = useState<Siralama>("varsayilan");

  useBildirimler(gorevler);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("pmx-task-search")?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && aktifProjeId) {
        event.preventDefault();
        setGorevBaslangicDurum("yapilacak");
        setGorevModalAcik(true);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [aktifProjeId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("tooldur_pending_project_item");
    if (raw) {
      try {
        setPendingToolItem(JSON.parse(raw));
      } catch {
        localStorage.removeItem("tooldur_pending_project_item");
      }
    }

    setKompaktGorunum(localStorage.getItem("tooldur_pm_compact") === "1");
    const kayitliSiralama = localStorage.getItem("tooldur_pm_sort") as Siralama | null;
    if (["varsayilan", "termin", "oncelik", "guncel"].includes(kayitliSiralama || "")) {
      setSiralama(kayitliSiralama as Siralama);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tooldur_pm_compact", kompaktGorunum ? "1" : "0");
  }, [kompaktGorunum]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("tooldur_pm_sort", siralama);
  }, [siralama]);

  useEffect(() => {
    if (!user?.uid) return;
    setProjelerYukleniyor(true);
    const unsub = projeleriDinle(user.uid, (rows) => {
      setProjeler(rows);
      setProjelerYukleniyor(false);
      setAktifProjeId((prev) => {
        if (prev && rows.some((proje) => proje.id === prev)) return prev;
        const kayitli = typeof window !== "undefined" ? localStorage.getItem("tooldur_pm_active_project") : "";
        if (kayitli && rows.some((proje) => proje.id === kayitli)) return kayitli;
        return rows[0]?.id || "";
      });
    });
    return () => unsub?.();
  }, [user?.uid]);

  useEffect(() => {
    if (!aktifProjeId) {
      setGorevler([]);
      setGorevlerYukleniyor(false);
      return;
    }
    setGorevler([]);
    setGorevlerYukleniyor(true);
    const unsub = gorevleriDinle(aktifProjeId, (rows) => {
      setGorevler(rows);
      setGorevlerYukleniyor(false);
    });
    return () => unsub?.();
  }, [aktifProjeId]);

  useEffect(() => {
    if (typeof window === "undefined" || !aktifProjeId) return;
    localStorage.setItem("tooldur_pm_active_project", aktifProjeId);
  }, [aktifProjeId]);

  useEffect(() => {
    if (!user?.email) return;
    bekleyenDavetleriGetir(user.email).then(setDavetler).catch(() => setDavetler([]));
  }, [user?.email, projeler.length]);

  const aktifProje = useMemo(
    () => projeler.find((p) => p.id === aktifProjeId) || null,
    [projeler, aktifProjeId]
  );

  const bildirimler: InAppBildirim[] = useMemo(() => gorevBildirimleriniHesapla(gorevler), [gorevler]);

  const gorevModalUyeleri = useMemo(() => {
    if (!user) return aktifProje?.uyeler || [];
    const benimRef: UyeRef = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      rol: aktifProje?.sahipUid === user.uid ? "sahip" : "uye",
    };
    return Array.from(
      new Map([benimRef, ...(aktifProje?.uyeler || [])].map((uye) => [uye.uid, uye])).values()
    );
  }, [aktifProje?.sahipUid, aktifProje?.uyeler, user]);

  const filtreSayilari = useMemo(() => {
    const bugun = bugunAnahtari();
    return {
      tum: gorevler.length,
      acik: gorevler.filter((g) => g.durum !== "tamamlandi").length,
      bugun: gorevler.filter((g) => g.termin === bugun && g.durum !== "tamamlandi").length,
      geciken: gorevler.filter((g) => !!g.termin && g.termin < bugun && g.durum !== "tamamlandi").length,
      tamamlanan: gorevler.filter((g) => g.durum === "tamamlandi").length,
    };
  }, [gorevler]);

  const filtreliGorevler = useMemo(() => {
    const bugun = bugunAnahtari();
    const oncelikSirasi: Record<Oncelik, number> = { yuksek: 0, orta: 1, dusuk: 2 };

    const rows = gorevler.filter((g) => {
      const aramaOk =
        !arama.trim() ||
        [g.baslik, g.aciklama, ...(g.etiketler || [])]
          .join(" ")
          .toLowerCase()
          .includes(arama.trim().toLowerCase());

      const oncelikOk = oncelikFiltre === "tum" || g.oncelik === oncelikFiltre;
      const uyeOk = uyeFiltre === "tum" || (g.atananlar || []).some((u) => u.uid === uyeFiltre);
      const hizliOk =
        hizliFiltre === "tum" ||
        (hizliFiltre === "acik" && g.durum !== "tamamlandi") ||
        (hizliFiltre === "bugun" && g.termin === bugun && g.durum !== "tamamlandi") ||
        (hizliFiltre === "geciken" && !!g.termin && g.termin < bugun && g.durum !== "tamamlandi") ||
        (hizliFiltre === "tamamlanan" && g.durum === "tamamlandi");

      return aramaOk && oncelikOk && uyeOk && hizliOk;
    });

    return [...rows].sort((a, b) => {
      if (siralama === "oncelik") return oncelikSirasi[a.oncelik] - oncelikSirasi[b.oncelik];
      if (siralama === "termin") {
        if (!a.termin && !b.termin) return 0;
        if (!a.termin) return 1;
        if (!b.termin) return -1;
        return a.termin.localeCompare(b.termin);
      }
      if (siralama === "guncel") {
        return new Date(b.guncellenmeTarih || b.olusturmaTarih).getTime() - new Date(a.guncellenmeTarih || a.olusturmaTarih).getTime();
      }
      return 0;
    });
  }, [arama, gorevler, hizliFiltre, oncelikFiltre, siralama, uyeFiltre]);

  const ozet = useMemo(() => {
    const toplam = gorevler.length;
    const tamamlanan = gorevler.filter((g) => g.durum === "tamamlandi").length;
    const bugun = bugunAnahtari();
    const bugunTeslim = gorevler.filter((g) => g.termin === bugun && g.durum !== "tamamlandi").length;
    const geciken = gorevler.filter((g) => g.termin && g.durum !== "tamamlandi" && g.termin < bugun).length;

    return { toplam, tamamlanan, bugunTeslim, geciken };
  }, [gorevler]);

  async function handleCreateProject(payload: { ad: string; aciklama: string; renk: string; emoji: string }) {
    if (!user) return;
    await projeEkle(user.uid, {
      ad: payload.ad,
      aciklama: payload.aciklama,
      renk: payload.renk,
      emoji: payload.emoji,
      sahipUid: user.uid,
    });
  }

  async function handleUpdateProject(payload: { ad: string; aciklama: string; renk: string; emoji: string }) {
    if (!aktifProje || aktifProje.sahipUid !== user?.uid) return;
    await projeGuncelle(aktifProje.id, payload);
    setProjeler((prev) => prev.map((proje) => proje.id === aktifProje.id ? { ...proje, ...payload } : proje));
  }

  function openTaskModal(durum: Durum = "yapilacak") {
    setGorevBaslangicDurum(durum);
    setGorevModalAcik(true);
  }

  async function handleCreateTask(form: GorevForm) {
    if (!user || !aktifProjeId) return;

    await gorevEkle(
      user.uid,
      aktifProjeId,
      {
        baslik: form.baslik.trim(),
        aciklama: form.aciklama.trim(),
        durum: form.durum,
        oncelik: form.oncelik,
        termin: form.termin,
        etiketler: form.etiketler
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean),
        checklistler: [],
        atananlar: form.atananlar,
      },
      { actorAd: user.displayName, actorFoto: user.photoURL }
    );
  }

  async function handleDeleteTask(id: string) {
    setPanelHatasi("");
    try {
      await gorevSil(id);
      if (seciliGorev?.id === id) setSeciliGorev(null);
    } catch (error) {
      setPanelHatasi(hataMesaji(error));
    }
  }

  async function handleMoveTask(id: string, durum: Durum) {
    const current = gorevler.find((g) => g.id === id);
    if (!current || current.durum === durum) return;
    setGorevler((prev) => prev.map((g) => (g.id === id ? { ...g, durum } : g)));
    try {
      await gorevGuncelle(id, { durum });
    } catch (error) {
      setGorevler((prev) => prev.map((g) => (g.id === id ? { ...g, durum: current.durum } : g)));
      console.error(error);
      setPanelHatasi("Görev durumu güncellenemedi. Lütfen tekrar deneyin.");
    }
  }

  async function handleInviteEmail(email: string) {
    if (!aktifProje) return;
    await uyeDavetEt(aktifProje.id, email.trim().toLowerCase());
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === aktifProje.id
          ? { ...p, davetliler: Array.from(new Set([...(p.davetliler || []), email.trim().toLowerCase()])) }
          : p
      )
    );
  }

  async function handleRemoveMember(uid: string) {
    if (!aktifProje || aktifProje.sahipUid !== user?.uid) return;
    await projeUyeKaldir(aktifProje.id, uid);
    setProjeler((prev) => prev.map((proje) => proje.id === aktifProje.id
      ? { ...proje, uyeler: (proje.uyeler || []).filter((uye) => uye.uid !== uid) }
      : proje));
  }

  async function handleCancelInvite(email: string) {
    if (!aktifProje || aktifProje.sahipUid !== user?.uid) return;
    await projeDavetIptalEt(aktifProje.id, email);
    setProjeler((prev) => prev.map((proje) => proje.id === aktifProje.id
      ? { ...proje, davetliler: (proje.davetliler || []).filter((item) => item !== email) }
      : proje));
  }


  async function handleSavePendingToolAsTask() {
    if (!pendingToolItem || !aktifProjeId || !user) return;
    await gorevEkle(
      user.uid,
      aktifProjeId,
      {
        baslik: pendingToolItem.toolName || "Tooldur hesap kaydı",
        aciklama: `${pendingToolItem.note || pendingToolItem.summary || "Tooldur araç kaydı"}

Link: ${pendingToolItem.url || ""}`.trim(),
        durum: "yapilacak",
        oncelik: "orta",
        termin: "",
        etiketler: ["tooldur", "hesap", String(pendingToolItem.category || "teknik").toLowerCase()],
        checklistler: [],
      },
      { actorAd: user.displayName, actorFoto: user.photoURL }
    );
    localStorage.removeItem("tooldur_pending_project_item");
    setPendingToolItem(null);
  }

  function handleDismissPendingTool() {
    localStorage.removeItem("tooldur_pending_project_item");
    setPendingToolItem(null);
  }

  async function handleDeleteProject() {
    if (!aktifProje) return;
    if (!confirm(`"${aktifProje.ad}" silinsin mi? Bu işlem geri alınamaz.`)) return;
    setPanelHatasi("");
    try {
      await projeSil(aktifProje.id);
      setAktifProjeId("");
    } catch (error) {
      setPanelHatasi(hataMesaji(error));
    }
  }

  if (loading) {
    return (
      <div className="pmx-center-screen">
        <span className="pmx-loading-ring" />
        <strong>Proje paneli hazırlanıyor</strong>
      </div>
    );
  }

  if (!user) return <AuthEkrani />;

  return (
    <>
      <style>{`
        .pmx-page{
          min-height: calc(100vh - 72px);
          background:
            radial-gradient(circle at 88% 0%, rgba(245,166,35,.12), transparent 28%),
            radial-gradient(circle at 8% 18%, rgba(255,177,27,.10), transparent 24%),
            linear-gradient(rgba(148,163,184,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,.045) 1px, transparent 1px),
            var(--bg);
          background-size: auto, auto, 56px 56px, 56px 56px, auto;
          padding: 18px 14px 110px;
          color: var(--ink);
        }
        .pmx-shell{
          max-width: 1460px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 286px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }
        .pmx-sidebar,
        .pmx-main-card,
        .pmx-panel,
        .pmx-stat-card{
          border: 1px solid rgba(148,163,184,.14);
          background: linear-gradient(180deg, rgba(18,25,40,.92), rgba(12,18,30,.88));
          box-shadow: 0 22px 70px rgba(0,0,0,.22);
          backdrop-filter: blur(12px);
        }
        .pmx-sidebar{
          border-radius: 24px;
          padding: 14px;
          position: sticky;
          top: 86px;
          height: fit-content;
        }
        .pmx-logo{
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 10px 16px;
          border-bottom: 1px solid rgba(148,163,184,.12);
          margin-bottom: 14px;
        }
        .pmx-logo-badge{
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ffb11b, #e99500);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #07111f;
          font-weight: 950;
          box-shadow: 0 16px 34px rgba(245,166,35,.18);
        }
        .pmx-brand-title{font-size: 16px; font-weight: 950; color: var(--ink); letter-spacing:-.02em;}
        .pmx-brand-sub{font-size: 10px; color: var(--ink-4); letter-spacing: .10em; text-transform: uppercase; font-weight:800;}
        .pmx-section-title{
          font-size: 10px;
          color: var(--ink-4);
          text-transform: uppercase;
          letter-spacing: .12em;
          margin: 16px 10px 8px;
          font-weight: 900;
        }
        .pmx-nav-item,
        .pmx-project-item{
          width: 100%;
          border: 1px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 12px;
          border-radius: 15px;
          background: transparent;
          color: var(--ink-3);
          text-align: left;
          transition: .18s ease;
          font-weight: 750;
        }
        .pmx-nav-item:hover,
        .pmx-project-item:hover{
          background: rgba(22,31,49,.72);
          color: var(--ink);
          border-color: rgba(148,163,184,.14);
        }
        .pmx-project-item.is-active{
          background: linear-gradient(135deg, rgba(245,166,35,.14), rgba(255,177,27,.07));
          color: var(--ink);
          border: 1px solid rgba(245,166,35,.24);
        }
        .pmx-project-dot{
          width: 10px;
          height: 10px;
          border-radius: 999px;
          flex-shrink: 0;
          box-shadow: 0 0 18px currentColor;
        }
        .pmx-project-main{flex: 1; min-width: 0;}
        .pmx-project-main strong{
          display: block;
          font-size: 13px;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pmx-project-main span{
          display: block;
          font-size: 11px;
          color: var(--ink-4);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pmx-sidebar-nav{display:grid; gap:4px;}
        .pmx-project-list{display:grid; gap:6px; max-height:360px; overflow:auto; padding-right:2px; scrollbar-width:thin;}
        .pmx-side-actions{display: grid; gap: 10px; margin-top: 14px;}
        .pmx-side-actions .pmx-btn{width:100%; min-width:0; justify-content:center; overflow:visible;}
        .pmx-side-actions .pmx-btn svg{flex-shrink:0;}
        .pmx-main-card{
          border-radius: 28px;
          padding: clamp(14px, 1.4vw, 20px);
          overflow: visible;
        }
        .pmx-topbar{
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding: 6px 4px 18px;
        }
        .pmx-title-wrap h1{
          margin: 0;
          font-size: clamp(30px, 3vw, 44px);
          line-height: .98;
          color: var(--ink);
          letter-spacing: -.045em;
          font-weight: 950;
        }
        .pmx-title-wrap p{
          margin: 10px 0 0;
          color: var(--ink-4);
          font-size: 13px;
          max-width: 760px;
          line-height: 1.55;
        }
        .pmx-toolbar{display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end;}
        .pmx-btn{
          height: 42px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,.14);
          padding: 0 14px;
          font-weight: 900;
          cursor: pointer;
          transition: .18s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
        }
        .pmx-btn:hover,.pmx-icon-btn:hover,.pmx-ghost-btn:hover{transform: translateY(-1px); border-color: rgba(245,166,35,.28);}
        .pmx-btn-primary{background: linear-gradient(180deg, #ffc24a, #f5a623); color: #07111f; border-color: transparent; box-shadow: 0 16px 34px rgba(245,166,35,.18);}
        .pmx-btn-secondary{background: rgba(22,31,49,.72); color: var(--ink-2);}
        .pmx-icon-btn,.pmx-ghost-btn{
          width: 42px; height: 42px; border-radius: 14px; border: 1px solid rgba(148,163,184,.14);
          background: rgba(22,31,49,.72); color: var(--ink-3); display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .pmx-ghost-btn{width: 30px; height: 30px; border-radius: 10px;}
        .pmx-stat-grid{display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px;}
        .pmx-stat-card{border-radius: 22px; padding: 16px; position:relative; overflow:hidden;}
        .pmx-stat-card::after{content:""; position:absolute; inset:auto -20px -35px auto; width:90px; height:90px; border-radius:50%; background:rgba(245,166,35,.08); pointer-events:none;}
        .pmx-stat-top{display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px;}
        .pmx-stat-icon{width: 40px; height: 40px; border-radius: 14px; background: rgba(15,23,42,.70); display:flex; align-items:center; justify-content:center; color: #f5a623; border:1px solid rgba(245,166,35,.12);}
        .pmx-stat-label{font-size: 12px; color: var(--ink-4); font-weight:800;}
        .pmx-stat-value{font-size: clamp(26px, 2vw, 36px); line-height: 1; color: var(--ink); font-weight: 950; letter-spacing:-.03em;}
        .pmx-stat-hint{font-size: 12px; color: var(--ink-3); margin-top: 8px;}
        .pmx-alerts{display: grid; gap: 8px; margin: 12px 0 16px;}
        .pmx-invite-item{display: flex; gap: 12px; align-items: center; justify-content: space-between; border: 1px solid rgba(245,166,35,.24); background: rgba(245,166,35,.08); border-radius: 18px; padding: 14px;}
        .pmx-invite-main{display:flex; gap:12px; align-items:center; min-width: 0;}
        .pmx-invite-main strong{display:block; color:var(--ink); font-size:14px;}
        .pmx-invite-main span{display:block; color:var(--ink-3); font-size:12px; margin-top:2px;}
        .pmx-invite-actions{display:flex; gap:8px; flex-shrink:0;}
        .pmx-controls{display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:18px;}
        .pmx-controls .pmx-search{flex:1 1 260px;}
        .pmx-tabs{display: inline-flex; gap: 6px; padding: 6px; border-radius: 16px; background: rgba(15,23,42,.62); border: 1px solid rgba(148,163,184,.14); overflow-x: auto; scrollbar-width:none;}
        .pmx-tabs::-webkit-scrollbar{display:none;}
        .pmx-tab{height: 38px; padding: 0 14px; border-radius: 12px; border: 0; background: transparent; color: var(--ink-3); font-weight: 900; cursor: pointer; white-space: nowrap; display:flex; align-items:center; gap:8px;}
        .pmx-tab.is-active{background: rgba(245,166,35,.11); color: var(--ink); box-shadow: inset 0 0 0 1px rgba(245,166,35,.14);}
        .pmx-search{height: 46px; border-radius: 16px; border: 1px solid rgba(148,163,184,.14); background: rgba(15,23,42,.72); display: flex; align-items: center; gap: 10px; padding: 0 14px;}
        .pmx-search input{flex: 1; border: 0; outline: none; background: transparent; color: var(--ink); font-size: 14px; min-width:0;}
        .pmx-filter{height: 46px; min-width: 150px; border-radius: 16px; border: 1px solid rgba(148,163,184,.14); background: rgba(15,23,42,.72); color: var(--ink); padding: 0 12px;}
        .pmx-mobile-board-hint{display:none;}
        .pmx-board{display: grid; grid-template-columns: repeat(4, minmax(250px, 1fr)); gap: 14px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin; overscroll-behavior-x:contain; -webkit-overflow-scrolling:touch;}
        .pmx-column{min-width: 250px; background: rgba(15,23,42,.42); border: 1px solid rgba(148,163,184,.12); border-radius: 22px; padding: 12px;}
        .pmx-column-head{display:flex; align-items:center; justify-content:space-between; margin-bottom: 10px; padding: 6px 4px 10px; border-bottom: 1px solid rgba(148,163,184,.12);}
        .pmx-column-head strong{display:flex; align-items:center; gap:8px; color: var(--ink); font-size: 14px;}
        .pmx-count{min-width: 28px; height: 28px; padding: 0 8px; border-radius: 999px; background: rgba(22,31,49,.82); color: var(--ink-3); display:flex; align-items:center; justify-content:center; font-size: 12px; font-weight: 900;}
        .pmx-column-body{display: flex; flex-direction: column; gap: 10px; min-height: 180px;}
        .pmx-task-card{background: linear-gradient(180deg, rgba(18,25,40,.96), rgba(12,18,30,.92)); border: 1px solid rgba(148,163,184,.13); border-radius: 18px; padding: 14px; cursor: pointer; transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;}
        .pmx-task-card:focus-visible,.pmx-list-item:focus-visible{outline:2px solid rgba(255,177,27,.55);outline-offset:2px;}
        .pmx-task-card:hover{transform: translateY(-2px); border-color: rgba(245,166,35,.28); box-shadow: 0 14px 36px rgba(0,0,0,.20);}
        .pmx-task-top,.pmx-task-footer{display:flex; align-items:center; justify-content:space-between; gap:10px;}
        .pmx-task-title{margin: 12px 0 8px; font-size: 15px; color: var(--ink); line-height: 1.35;}
        .pmx-task-desc{margin: 0 0 10px; font-size: 12px; color: var(--ink-3); line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;}
        .pmx-priority-pill{display:inline-flex; align-items:center; justify-content:center; height: 28px; padding: 0 10px; border-radius: 999px; font-size: 11px; font-weight: 900; white-space: nowrap;}
        .pmx-tag-wrap{display:flex; flex-wrap:wrap; gap:6px; margin-bottom: 10px;}
        .pmx-tag{display:inline-flex; align-items:center; padding: 5px 9px; border-radius: 999px; background: rgba(22,31,49,.72); border: 1px solid rgba(148,163,184,.12); font-size: 11px; color: var(--ink-3);}
        .pmx-task-meta{display:flex; flex-wrap:wrap; gap:8px; margin-bottom: 12px;}
        .pmx-mobile-status{display:none;}
        .pmx-meta-chip{display:inline-flex; align-items:center; gap:6px; height: 28px; padding: 0 10px; border-radius: 999px; background: rgba(22,31,49,.72); border: 1px solid rgba(148,163,184,.12); font-size: 11px; color: var(--ink-3);}
        .pmx-meta-chip.is-danger,.pmx-timeline-status.is-danger{color: #fecaca; border-color: rgba(239,68,68,.26); background: rgba(239,68,68,.12);}
        .pmx-avatar-row{display:flex; align-items:center;}
        .pmx-muted{font-size: 11px; color: var(--ink-4);}
        .pmx-list-wrap{display:grid; gap:10px;}
        .pmx-list-item{border:1px solid rgba(148,163,184,.13); background: rgba(18,25,40,.88); border-radius: 20px; padding: 14px 16px; display:flex; gap:12px; align-items:center; justify-content:space-between; cursor:pointer;}
        .pmx-list-main{flex:1; min-width:0;}
        .pmx-list-main h4{margin:0; color:var(--ink); font-size:15px;}
        .pmx-list-main p{margin:6px 0 0; color:var(--ink-3); font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
        .pmx-list-side{display:flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:flex-end;}
        .pmx-timeline{display:grid; gap:10px;}
        .pmx-timeline-item{width:100%; border:1px solid rgba(148,163,184,.13); background: rgba(18,25,40,.88); border-radius: 20px; padding: 14px; display:grid; grid-template-columns: 72px 1fr auto; gap:14px; align-items:center; text-align:left; cursor:pointer;}
        .pmx-timeline-date{height:64px; border-radius:18px; background: rgba(15,23,42,.72); display:flex; flex-direction:column; align-items:center; justify-content:center; color: var(--ink); border:1px solid rgba(148,163,184,.12);}
        .pmx-timeline-date span{font-size:22px; font-weight:950; line-height:1;}
        .pmx-timeline-date small{font-size:11px; color:var(--ink-4); margin-top:4px;}
        .pmx-timeline-content h4{margin:0; color:var(--ink); font-size:15px;}
        .pmx-timeline-content p{margin:6px 0 0; color:var(--ink-3); font-size:12px;}
        .pmx-timeline-status{height: 34px; padding: 0 12px; border-radius: 999px; background: rgba(22,31,49,.72); border:1px solid rgba(148,163,184,.12); display:flex; align-items:center; justify-content:center; color:var(--ink-2); font-size:12px; font-weight:900; white-space: nowrap;}
        .pmx-gantt-shell{border:1px solid rgba(148,163,184,.13); background: rgba(18,25,40,.86); border-radius:22px; padding:16px; overflow:hidden;}
        .pmx-gantt-head{display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:14px;}
        .pmx-gantt-head p{margin:6px 0 0; color:var(--ink-4); font-size:12px;}
        .pmx-gantt-scroll{overflow:auto; padding-bottom:6px; scrollbar-width:thin;}
        .pmx-gantt-grid{display:grid; grid-template-columns:210px 1fr; min-width:760px; border:1px solid rgba(148,163,184,.12); border-radius:18px; overflow:hidden; background:rgba(7,11,20,.22);}
        .pmx-gantt-left{min-height:48px; padding:0 14px; display:flex; align-items:center; gap:10px; border:0; border-right:1px solid rgba(148,163,184,.10); border-bottom:1px solid rgba(148,163,184,.10); background:rgba(15,23,42,.54); color:var(--ink); font-weight:900; text-align:left; cursor:pointer;}
        .pmx-gantt-left span:last-child{overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
        .pmx-gantt-left-head{cursor:default; color:var(--ink-3); text-transform:uppercase; letter-spacing:.08em; font-size:11px;}
        .pmx-gantt-days,.pmx-gantt-row{display:grid; position:relative;}
        .pmx-gantt-day{height:48px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border-bottom:1px solid rgba(148,163,184,.10); border-right:1px solid rgba(148,163,184,.08); color:var(--ink-3); background:rgba(15,23,42,.38);}
        .pmx-gantt-day strong{font-size:12px; color:var(--ink);}
        .pmx-gantt-day span{font-size:10px; color:var(--ink-4);}
        .pmx-gantt-day.is-today{background:rgba(245,166,35,.11);}
        .pmx-gantt-cell{height:48px; border-bottom:1px solid rgba(148,163,184,.08); border-right:1px solid rgba(148,163,184,.06);}
        .pmx-gantt-bar{position:relative; z-index:2; grid-row:1; align-self:center; height:28px; margin:0 6px; border:0; border-radius:999px; color:#06111f; font-weight:950; font-size:11px; padding:0 12px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,.24);}
        .pmx-gantt-bar.is-danger{color:#fff;}
        .pmx-gantt-bar span{display:block; overflow:hidden; text-overflow:ellipsis;}
        .pmx-analytics-grid{display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:14px;}
        .pmx-analytics-page{display:grid; gap:14px;}
        .pmx-health-card{
          border:1px solid rgba(245,166,35,.18);
          background:
            radial-gradient(circle at 82% 14%, rgba(245,166,35,.18), transparent 30%),
            radial-gradient(circle at 18% 90%, rgba(255,177,27,.10), transparent 26%),
            linear-gradient(180deg, rgba(18,25,40,.96), rgba(12,18,30,.90));
          border-radius:24px;
          padding:20px;
          display:grid;
          grid-template-columns:minmax(0,1fr) 170px;
          gap:18px;
          align-items:center;
          box-shadow:0 22px 70px rgba(0,0,0,.20);
        }
        .pmx-health-main p{margin:10px 0 0; color:var(--ink-3); font-size:13px; line-height:1.65; max-width:720px;}
        .pmx-health-score{font-size:54px; line-height:.9; color:var(--amber); font-weight:950; letter-spacing:-.06em;}
        .pmx-health-label{display:inline-flex; margin-top:10px; padding:6px 10px; border-radius:999px; background:rgba(245,166,35,.11); color:var(--amber); border:1px solid rgba(245,166,35,.20); font-size:12px; font-weight:900;}
        .pmx-health-ring{width:148px; height:148px; justify-self:end; border-radius:50%; background:conic-gradient(var(--amber) var(--score), rgba(148,163,184,.12) 0); display:grid; place-items:center; position:relative; box-shadow:inset 0 0 0 1px rgba(255,255,255,.04), 0 20px 45px rgba(0,0,0,.22);}
        .pmx-health-ring::after{content:""; position:absolute; inset:13px; border-radius:50%; background:rgba(12,18,30,.96); border:1px solid rgba(148,163,184,.10);}
        .pmx-health-ring span,.pmx-health-ring small{position:relative; z-index:1; display:block; text-align:center;}
        .pmx-health-ring span{font-size:28px; font-weight:950; color:var(--ink); transform:translateY(8px);}
        .pmx-health-ring small{font-size:10px; font-weight:900; color:var(--ink-4); text-transform:uppercase; letter-spacing:.08em; transform:translateY(-14px);}
        .pmx-kpi-grid{display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px;}
        .pmx-kpi-card{border:1px solid rgba(148,163,184,.14); background:linear-gradient(180deg, rgba(22,31,49,.86), rgba(15,23,42,.72)); border-radius:20px; padding:15px; display:grid; gap:8px; min-height:112px;}
        .pmx-kpi-card svg{color:var(--amber);}
        .pmx-kpi-card strong{font-size:28px; line-height:1; color:var(--ink); font-weight:950; letter-spacing:-.04em;}
        .pmx-kpi-card span{color:var(--ink-4); font-size:12px; font-weight:800;}
        .pmx-analytics-grid-2{align-items:start;}
        .pmx-workload-list,.pmx-deadline-list{display:grid; gap:10px;}
        .pmx-workload-row,.pmx-deadline-row{border:1px solid rgba(148,163,184,.12); background:rgba(15,23,42,.52); border-radius:16px; padding:12px; display:grid; gap:10px;}
        .pmx-workload-row strong,.pmx-deadline-row strong{display:block; color:var(--ink); font-size:13px; margin-bottom:3px;}
        .pmx-workload-row span,.pmx-deadline-row span{display:block; color:var(--ink-4); font-size:12px;}
        .pmx-workload-meter{height:9px; border-radius:999px; overflow:hidden; background:rgba(148,163,184,.10); border:1px solid rgba(148,163,184,.08);}
        .pmx-workload-meter span{display:block; height:100%; border-radius:999px; background:linear-gradient(90deg, #ffb11b, var(--amber));}
        .pmx-deadline-row{grid-template-columns:minmax(0,1fr) auto; align-items:center;}
        .pmx-deadline-row b{font-size:12px; color:var(--ink); border:1px solid rgba(148,163,184,.14); background:rgba(22,31,49,.72); border-radius:999px; padding:7px 10px; white-space:nowrap;}
        .pmx-deadline-row.is-warn b{color:var(--amber); border-color:rgba(245,166,35,.28); background:rgba(245,166,35,.10);}
        .pmx-deadline-row.is-danger b{color:#fecaca; border-color:rgba(239,68,68,.30); background:rgba(239,68,68,.13);}
        .pmx-report-card{border:1px solid rgba(255,177,27,.16); background:linear-gradient(135deg, rgba(255,177,27,.10), rgba(245,166,35,.06)); border-radius:22px; padding:18px; display:flex; align-items:center; justify-content:space-between; gap:16px;}
        .pmx-report-card p{margin:0; color:var(--ink-3); font-size:13px; line-height:1.65;}
        .pmx-report-actions{flex-shrink:0;}
        .pmx-panel{border-radius: 22px; padding: 18px;}
        .pmx-panel-title{font-size: 15px; font-weight: 950; color: var(--ink); margin-bottom: 12px;}
        .pmx-chart-stack{display:grid; gap:14px;}
        .pmx-chart-row{display:grid; gap:7px;}
        .pmx-chart-head{display:flex; align-items:center; justify-content:space-between; gap:10px; color:var(--ink-2); font-size:13px;}
        .pmx-chart-head strong{color:var(--ink);}
        .pmx-bar{height: 12px; border-radius: 999px; background: rgba(15,23,42,.72); overflow: hidden; border: 1px solid rgba(148,163,184,.12);}
        .pmx-bar-fill{height:100%; border-radius:999px;}
        .pmx-empty{border: 1px dashed rgba(148,163,184,.18); border-radius: 20px; padding: 34px 18px; text-align: center; color: var(--ink-4); background: rgba(15,23,42,.42);}
        .pmx-center-screen{min-height: calc(100vh - 140px); display:flex; align-items:center; justify-content:center; color:var(--ink-3); font-size:14px;}
        .pmx-label{display:block; font-size:11px; color:var(--ink-4); text-transform:uppercase; letter-spacing:.08em; margin:0 0 8px; font-weight:900;}
        .pmx-input{width:100%; height:46px; border-radius:14px; border:1px solid rgba(148,163,184,.14); background: rgba(15,23,42,.72); padding: 0 14px; color: var(--ink); outline:none;}
        .pmx-textarea{min-height: 110px; resize: vertical; padding: 14px;}
        .pmx-form-grid{display:grid; gap:14px;}
        .pmx-two-col{display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px;}
        .pmx-actions{display:flex; justify-content:flex-end; gap:8px; margin-top: 6px;}
        .pmx-invite-modal{display:grid; gap:16px;}
        .pmx-invite-hero{border:1px solid rgba(245,166,35,.18); background:linear-gradient(135deg, rgba(245,166,35,.12), rgba(255,177,27,.06)); border-radius:20px; padding:14px; display:flex; gap:12px; align-items:flex-start;}
        .pmx-invite-hero-icon{width:42px; height:42px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(245,166,35,.14); color:var(--amber); border:1px solid rgba(245,166,35,.22);}
        .pmx-invite-hero strong{display:block; color:var(--ink); font-size:14px; margin-bottom:4px;}
        .pmx-invite-hero span{display:block; color:var(--ink-3); font-size:12px; line-height:1.5;}
        .pmx-member-search{height:56px; border-radius:18px; border:1px solid rgba(245,166,35,.22); background:linear-gradient(180deg, rgba(15,23,42,.92), rgba(10,16,28,.88)); display:flex; align-items:center; gap:12px; padding:0 16px; color:var(--ink-4); box-shadow: inset 0 1px 0 rgba(255,255,255,.03);}
        .pmx-member-search:focus-within{border-color:rgba(245,166,35,.50); box-shadow:0 0 0 4px rgba(245,166,35,.08);}
        .pmx-member-search input{border:0; outline:0; background:transparent; color:var(--ink); width:100%; height:100%; font-weight:800; font-size:14px; min-width:0;}
        .pmx-member-search input::placeholder{color:rgba(156,168,191,.68);}
        .pmx-help-text{margin-top:8px; color:var(--ink-4); font-size:12px; line-height:1.55;}
        .pmx-user-results{display:grid; gap:10px; max-height:320px; overflow:auto; padding-right:2px;}
        .pmx-user-row{display:flex; align-items:center; gap:12px; border:1px solid rgba(148,163,184,.14); background:linear-gradient(180deg, rgba(22,31,49,.78), rgba(15,23,42,.72)); border-radius:20px; padding:12px;}
        .pmx-user-row-main{flex:1; min-width:0;}
        .pmx-user-row-main strong{display:block; color:var(--ink); font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
        .pmx-user-row-main span{display:block; color:var(--ink-4); font-size:12px; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
        .pmx-email-invite{width:100%; border:1px solid rgba(245,166,35,.28); background:linear-gradient(135deg, rgba(245,166,35,.15), rgba(245,166,35,.07)); color:var(--ink); border-radius:20px; padding:14px; display:flex; align-items:center; gap:12px; cursor:pointer; text-align:left;}
        .pmx-email-invite span{flex:1; min-width:0; color:var(--ink-2); line-height:1.4;}
        .pmx-email-invite strong{color:var(--amber);}
        .pmx-pending-box{border:1px solid rgba(148,163,184,.12); background:rgba(15,23,42,.45); border-radius:20px; padding:14px;}
        .pmx-pending-list{display:flex; flex-wrap:wrap; gap:8px;}
        .pmx-mini-state{border:1px dashed rgba(148,163,184,.20); border-radius:18px; background:rgba(15,23,42,.46); color:var(--ink-4); padding:16px; text-align:center; font-size:13px;}
        .pmx-success-note{border:1px solid rgba(16,185,129,.24); background:rgba(16,185,129,.10); color:#86efac; border-radius:18px; padding:12px 14px; font-size:13px; font-weight:800;}
        .pmx-color-grid,.pmx-emoji-grid{display:flex; flex-wrap:wrap; gap:8px;}
        .pmx-color-btn{width:34px; height:34px; border-radius:12px; border:2px solid transparent; cursor:pointer;}
        .pmx-color-btn.is-active{border-color:#fff; box-shadow:0 0 0 2px #ffb11b;}
        .pmx-emoji-btn{width:42px; height:42px; border-radius:14px; border:1px solid rgba(148,163,184,.14); background: rgba(22,31,49,.72); cursor:pointer; font-size:18px;}
        .pmx-emoji-btn.is-active{border-color: rgba(245,166,35,.32); background: rgba(245,166,35,.10);}
        .pmx-modal-backdrop{position: fixed; inset: 0; background: rgba(3,7,18,.66); backdrop-filter: blur(10px); z-index: 99999; padding: calc(14px + env(safe-area-inset-top)) 12px calc(24px + env(safe-area-inset-bottom)); overflow-y: auto; display: flex; align-items: flex-start; justify-content: center; overscroll-behavior:contain;}
        .pmx-modal-shell{position: relative; z-index: 100000; width: min(100%, var(--modal-max, 760px)); max-width:100%; max-height:calc(100svh - 28px - env(safe-area-inset-top) - env(safe-area-inset-bottom)); background: linear-gradient(180deg, rgba(18,25,40,.98), rgba(12,18,30,.97)); border: 1px solid rgba(148,163,184,.18); border-radius: 26px; box-shadow: 0 28px 90px rgba(0,0,0,.44); overflow:auto;}
        .pmx-modal-head{display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:20px 20px 16px; border-bottom:1px solid rgba(148,163,184,.12); background:radial-gradient(circle at 90% 0%, rgba(245,166,35,.12), transparent 34%); position:sticky; top:0; z-index:3;}
        .pmx-eyebrow{font-size:11px; color:var(--ink-4); text-transform:uppercase; letter-spacing:.10em; margin-bottom:7px; font-weight:900;}
        .pmx-modal-title{margin:0; color:var(--ink); font-size:24px; line-height:1.08; letter-spacing:-.03em;}
        .pmx-modal-body{padding:18px 20px 20px;}
        .pmx-bell-wrap{position:relative; z-index:100010; overflow:visible;}
        .pmx-badge{position:absolute; top:-4px; right:-4px; min-width:18px; height:18px; border-radius:999px; background: #ef4444; color:#fff; font-size:10px; font-weight:900; display:flex; align-items:center; justify-content:center; padding:0 4px;}
        .pmx-bell-dropdown{position:absolute; top:calc(100% + 10px); right:0; width:min(380px, calc(100vw - 24px)); max-height:min(520px, calc(100vh - 150px)); overflow:auto; border-radius:20px; border:1px solid rgba(148,163,184,.18); background: rgba(18,25,40,.99); box-shadow: 0 28px 90px rgba(0,0,0,.48); z-index:100020;}
        .pmx-bell-item{display:flex; gap:10px; padding:12px 14px; border-bottom:1px solid rgba(148,163,184,.12);}
        .pmx-bell-item:last-child{border-bottom:0;}
        .pmx-bell-item strong{display:block; font-size:12px; color:var(--ink);}
        .pmx-bell-item span{display:block; font-size:11px; color:var(--ink-3); margin-top:3px;}

        .pmx-project-overview{
          display:grid;
          grid-template-columns:minmax(0,1fr) minmax(180px,280px) auto;
          gap:16px;
          align-items:center;
          margin:0 0 14px;
          padding:14px;
          border:1px solid rgba(255,177,27,.15);
          border-radius:20px;
          background:linear-gradient(135deg, rgba(255,177,27,.08), rgba(245,166,35,.05));
        }
        .pmx-project-overview-main{display:flex;align-items:center;gap:13px;min-width:0;}
        .pmx-project-cover{width:92px;height:62px;flex-shrink:0;border-radius:15px;background:url("/visuals/topics/project-management.webp") center/cover;border:1px solid rgba(148,163,184,.18);box-shadow:0 12px 28px rgba(0,0,0,.22);}
        .pmx-project-overview-main strong{display:block;color:var(--ink);font-size:18px;margin:3px 0 4px;}
        .pmx-project-overview-main span{display:block;color:var(--ink-4);font-size:11.5px;line-height:1.4;}
        .pmx-project-progress{height:11px;border-radius:999px;overflow:hidden;background:rgba(148,163,184,.10);border:1px solid rgba(148,163,184,.12);}
        .pmx-project-progress span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#ffb11b,#e99500);transition:width .25s ease;}
        .pmx-shortcut-note{color:var(--ink-4);font-size:10px;white-space:nowrap;text-align:right;}
        .pmx-filter-toggle,.pmx-filter-clear{height:46px;border-radius:16px;border:1px solid rgba(148,163,184,.14);background:rgba(15,23,42,.72);color:var(--ink-3);padding:0 13px;display:inline-flex;align-items:center;gap:7px;font-weight:850;cursor:pointer;white-space:nowrap;}
        .pmx-filter-toggle.is-active{color:var(--amber);border-color:rgba(245,166,35,.28);background:rgba(245,166,35,.10);}
        .pmx-filter-clear{color:#fecaca;border-color:rgba(239,68,68,.22);background:rgba(239,68,68,.08);}
        .pmx-task-top-left,.pmx-task-actions{display:flex;align-items:center;gap:7px;}
        .pmx-drag-handle{color:var(--ink-4);cursor:grab;}
        .pmx-task-card:active .pmx-drag-handle{cursor:grabbing;}
        .pmx-complete-btn{color:#86efac;}
        .pmx-column{transition:border-color .18s ease,background .18s ease,box-shadow .18s ease;}
        .pmx-column.is-drag-over{border-color:rgba(255,177,27,.55);background:rgba(255,177,27,.07);box-shadow:inset 0 0 0 2px rgba(255,177,27,.08);}
        .pmx-board.is-compact .pmx-task-card{padding:10px;border-radius:14px;}
        .pmx-board.is-compact .pmx-task-desc,.pmx-board.is-compact .pmx-tag-wrap{display:none;}
        .pmx-board.is-compact .pmx-task-title{margin:8px 0 7px;font-size:13px;}
        .pmx-board.is-compact .pmx-task-meta{margin-bottom:8px;}
        .pmx-loading-ring{width:22px;height:22px;border-radius:50%;border:3px solid rgba(255,177,27,.18);border-top-color:var(--amber);display:inline-block;animation:pmx-spin .8s linear infinite;flex-shrink:0;}
        @keyframes pmx-spin{to{transform:rotate(360deg)}}
        .pmx-center-screen{min-height:70vh;display:flex;align-items:center;justify-content:center;gap:12px;color:var(--ink);background:var(--bg);}
        .pmx-center-screen strong{font-size:14px;}
        .pmx-sidebar-loading{display:grid;gap:8px;padding:6px 2px;}
        .pmx-sidebar-loading span{height:48px;border-radius:14px;background:linear-gradient(90deg,rgba(148,163,184,.06),rgba(255,177,27,.09),rgba(148,163,184,.06));background-size:220% 100%;animation:pmx-shimmer 1.2s linear infinite;}
        @keyframes pmx-shimmer{to{background-position:-220% 0}}
        .pmx-task-loading{min-height:280px;border:1px dashed rgba(255,177,27,.22);border-radius:22px;background:rgba(15,23,42,.42);display:flex;align-items:center;justify-content:center;gap:12px;color:var(--ink);}
        .pmx-task-loading strong,.pmx-task-loading small{display:block;}
        .pmx-task-loading small{color:var(--ink-4);margin-top:4px;}
        .pmx-panel-error{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px;padding:11px 13px;border:1px solid rgba(239,68,68,.24);border-radius:16px;background:rgba(239,68,68,.10);color:#fecaca;font-size:12px;font-weight:800;}
        .pmx-panel-error button{width:28px;height:28px;border:0;border-radius:9px;background:rgba(239,68,68,.12);color:#fecaca;display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .pmx-danger-btn{color:#fecaca;border-color:rgba(239,68,68,.22);background:rgba(239,68,68,.07);}
        .pmx-error-note{border:1px solid rgba(239,68,68,.26);background:rgba(239,68,68,.10);color:#fecaca;border-radius:16px;padding:11px 13px;font-size:12px;font-weight:800;line-height:1.5;}
        .pmx-settings-preview{display:flex;align-items:center;gap:14px;padding:15px;border:1px solid rgba(255,177,27,.20);border-radius:20px;background:linear-gradient(135deg,rgba(255,177,27,.10),rgba(15,23,42,.52));margin-bottom:16px;}
        .pmx-settings-emoji{width:58px;height:58px;border-radius:18px;border:1px solid;display:flex;align-items:center;justify-content:center;font-size:27px;flex-shrink:0;}
        .pmx-settings-preview strong{display:block;color:var(--ink);font-size:17px;}
        .pmx-settings-preview span{display:block;color:var(--ink-4);font-size:12px;line-height:1.5;margin-top:4px;}
        .pmx-assignee-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-height:220px;overflow:auto;padding:2px;}
        .pmx-assignee-choice{min-width:0;border:1px solid rgba(148,163,184,.14);background:rgba(15,23,42,.58);color:var(--ink-3);border-radius:15px;padding:9px 10px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:9px;text-align:left;cursor:pointer;}
        .pmx-assignee-choice span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;font-weight:800;}
        .pmx-assignee-choice svg:last-child{opacity:.18;}
        .pmx-assignee-choice.is-active{border-color:rgba(255,177,27,.34);background:rgba(255,177,27,.10);color:var(--ink);}
        .pmx-assignee-choice.is-active svg:last-child{opacity:1;color:var(--amber);}
        .pmx-team-section{border:1px solid rgba(148,163,184,.12);border-radius:20px;background:rgba(15,23,42,.42);padding:14px;}
        .pmx-team-section-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;}
        .pmx-team-section-head span{font-size:11px;color:var(--ink-4);}
        .pmx-team-list{display:grid;gap:8px;max-height:260px;overflow:auto;}
        .pmx-team-row{display:flex;align-items:center;gap:11px;padding:10px;border:1px solid rgba(148,163,184,.11);border-radius:16px;background:rgba(22,31,49,.60);}
        .pmx-member-role{font-size:10px;color:var(--amber);border:1px solid rgba(255,177,27,.22);background:rgba(255,177,27,.08);padding:5px 8px;border-radius:999px;font-weight:900;}
        .pmx-danger-icon{color:#fca5a5;border-color:rgba(239,68,68,.18);background:rgba(239,68,68,.07);}
        .pmx-pending-list{display:grid;gap:8px;}
        .pmx-pending-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:13px;background:rgba(22,31,49,.56);}
        .pmx-pending-row .pmx-meta-chip{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .pmx-workspace-controls{display:grid;gap:10px;margin-bottom:18px;padding:12px;border:1px solid rgba(148,163,184,.12);border-radius:21px;background:rgba(10,16,28,.48);}
        .pmx-controls-top{display:flex;align-items:center;gap:10px;}
        .pmx-controls-top .pmx-search{flex:1 1 260px;}
        .pmx-search-clear{width:30px;height:30px;border:0;border-radius:9px;background:rgba(148,163,184,.10);color:var(--ink-3);display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .pmx-quickbar{display:flex;align-items:center;justify-content:space-between;gap:10px;min-width:0;}
        .pmx-quick-filters{display:flex;align-items:center;gap:7px;overflow-x:auto;scrollbar-width:none;min-width:0;padding-bottom:1px;}
        .pmx-quick-filters::-webkit-scrollbar{display:none;}
        .pmx-quick-filter{height:38px;border:1px solid rgba(148,163,184,.13);background:rgba(22,31,49,.62);color:var(--ink-3);border-radius:13px;padding:0 10px;display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:850;white-space:nowrap;cursor:pointer;}
        .pmx-quick-filter b{min-width:20px;height:20px;border-radius:999px;background:rgba(148,163,184,.10);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--ink-2);}
        .pmx-quick-filter.is-active{border-color:rgba(255,177,27,.30);background:rgba(255,177,27,.11);color:var(--amber);}
        .pmx-quick-filter.is-danger:not(.is-active){color:#fca5a5;border-color:rgba(239,68,68,.18);}
        .pmx-view-tools{display:flex;align-items:center;gap:7px;flex-shrink:0;}
        .pmx-sort-wrap{height:46px;min-width:174px;border-radius:16px;border:1px solid rgba(148,163,184,.14);background:rgba(15,23,42,.72);color:var(--ink-4);padding:0 10px;display:flex;align-items:center;gap:7px;}
        .pmx-sort-wrap select{border:0;outline:0;background:transparent;color:var(--ink);width:100%;font-size:12px;font-weight:800;}
        .pmx-advanced-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:10px;border-top:1px solid rgba(148,163,184,.10);}
        .pmx-filter-summary{margin-left:auto;color:var(--ink-4);font-size:11px;font-weight:800;white-space:nowrap;}
        .pmx-column-head-actions{display:flex;align-items:center;gap:7px;}
        .pmx-column-add{width:29px;height:29px;border-radius:9px;border:1px solid rgba(255,177,27,.18);background:rgba(255,177,27,.08);color:var(--amber);display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .pmx-column-add:hover{background:rgba(255,177,27,.15);border-color:rgba(255,177,27,.32);}
        .pmx-mobile-create{display:none;position:fixed;right:16px;bottom:calc(76px + env(safe-area-inset-bottom));z-index:1500;height:48px;border:0;border-radius:16px;padding:0 16px;background:linear-gradient(180deg,#ffc24a,#ffb11b);color:#07111f;box-shadow:0 18px 42px rgba(0,0,0,.36);font-weight:950;align-items:center;gap:7px;}
        @media (max-width: 1180px){
          .pmx-shell{grid-template-columns: 1fr;}
          .pmx-project-overview{grid-template-columns:1fr;}
          .pmx-shortcut-note{text-align:left;}
          .pmx-sidebar{position: static; order: -1;}
          .pmx-main-card{order: 1;}
          .pmx-sidebar-nav{grid-template-columns:repeat(4,minmax(0,1fr));}
          .pmx-nav-item{justify-content:center;text-align:center;}
          .pmx-project-list{display:flex;max-height:none;overflow-x:auto;padding-bottom:5px;}
          .pmx-project-item{flex:0 0 240px;}
          .pmx-side-actions{grid-template-columns:repeat(4,minmax(0,1fr));}
        }
        @media (max-width: 900px){
          .pmx-stat-grid{grid-template-columns: repeat(2, minmax(0, 1fr));}
          .pmx-controls{grid-template-columns: 1fr;}
          .pmx-controls-top,.pmx-quickbar{align-items:stretch;flex-direction:column;}
          .pmx-controls-top .pmx-search{width:100%;flex-basis:auto;}
          .pmx-view-tools{width:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));}
          .pmx-view-tools > *{min-width:0;width:100%;justify-content:center;}
          .pmx-advanced-filters{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));}
          .pmx-filter-summary{margin-left:0;align-self:center;}
          .pmx-analytics-grid{grid-template-columns: 1fr;}
          .pmx-topbar{flex-direction: column; align-items: stretch;}
          .pmx-toolbar{justify-content: flex-start;}
          .pmx-timeline-item{grid-template-columns: 64px 1fr;}
          .pmx-timeline-status{grid-column: 1 / -1; justify-self: flex-start;}
          .pmx-gantt-shell{padding:12px; border-radius:20px;}
          .pmx-gantt-grid{grid-template-columns:170px 1fr;}
          .pmx-gantt-left{padding:0 10px;}

        }
        @media (max-width: 640px){
          .pmx-page{padding: 10px 8px 110px; overflow-x:hidden;}
          .pmx-shell{width:100%; max-width:100%; gap:12px;}
          .pmx-main-card,.pmx-sidebar{border-radius: 20px; width:100%; max-width:100%; box-sizing:border-box; overflow:hidden;}
          .pmx-sidebar{padding:14px; order:-1;}
          .pmx-logo{padding:10px 8px 14px;}
          .pmx-nav-item,.pmx-project-item{min-width:0;}
          .pmx-side-actions .pmx-btn{height:44px; font-size:14px;}
          .pmx-stat-grid{grid-template-columns: 1fr;}
          .pmx-two-col{grid-template-columns: 1fr;}
          .pmx-list-item{flex-direction: column; align-items: flex-start;}
          .pmx-list-side{justify-content:flex-start;}
          .pmx-toolbar{position:relative; overflow:visible;}
          .pmx-bell-wrap{position:relative; overflow:visible;}
          .pmx-bell-dropdown{
            position:absolute;
            top:calc(100% + 10px);
            right:0;
            left:auto;
            bottom:auto;
            width:min(340px, calc(100vw - 24px));
            max-height:min(430px, calc(100vh - 190px));
            border-radius:22px;
            z-index:100020;
          }
          .pmx-modal-backdrop{padding:0; align-items:flex-end;}
          .pmx-modal-shell{max-width:none !important; width:100%; border-radius:22px 22px 0 0; max-height:94svh; overflow:auto;}
          .pmx-modal-head{padding:18px 18px 14px;}
          .pmx-modal-body{padding:16px 18px 20px;}
          .pmx-user-row{align-items:flex-start; flex-wrap:wrap;}
          .pmx-user-row .pmx-btn{width:100%;}
          .pmx-invite-item,.pmx-pending-tool{flex-direction: column; align-items: flex-start;}
          .pmx-invite-actions,.pmx-pending-actions{width:100%;}
          .pmx-pending-actions .pmx-btn{flex:1;}
          .pmx-btn{width:100%;}
          .pmx-toolbar{display:grid; grid-template-columns:44px minmax(0,1fr); width:100%; gap:8px;}
          .pmx-toolbar .pmx-btn{width:100%; min-width:0;}
          .pmx-bell-wrap{width:44px;}
          .pmx-title-wrap h1{font-size:clamp(26px,9vw,36px); line-height:1.02;}
          .pmx-title-wrap p{font-size:12px;}
          .pmx-sidebar-nav{grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px;}
          .pmx-sidebar-nav .pmx-nav-item{min-height:64px; padding:9px 6px; flex-direction:column; justify-content:center; text-align:center; gap:6px; font-size:11px;}
          .pmx-project-list{display:flex; overflow-x:auto; gap:8px; padding:2px 1px 8px; scroll-snap-type:x proximity; scrollbar-width:thin; overscroll-behavior-x:contain;}
          .pmx-project-list .pmx-project-item{flex:0 0 min(250px,calc(100vw - 54px)); scroll-snap-align:start;}
          .pmx-sidebar-nav{grid-template-columns:repeat(2,minmax(0,1fr));}
          .pmx-nav-item{justify-content:flex-start;text-align:left;}
          .pmx-project-item{flex-basis:calc(100vw - 72px);max-width:320px;}
          .pmx-side-actions{grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px;}
          .pmx-side-actions .pmx-btn{font-size:12px; padding:0 8px;}
          .pmx-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px;}
          .pmx-stat-card{padding:13px; border-radius:18px;}
          .pmx-stat-top{margin-bottom:8px; align-items:flex-start; flex-direction:column;}
          .pmx-stat-icon{width:34px; height:34px; border-radius:12px;}
          .pmx-stat-value{font-size:28px;}
          .pmx-stat-hint{font-size:10px; line-height:1.35;}
          .pmx-project-overview{padding:12px; gap:12px;}
          .pmx-project-overview-main{align-items:flex-start;}
          .pmx-project-cover{width:72px; height:56px;}
          .pmx-shortcut-note{display:none;}
          .pmx-controls{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-bottom:14px;}
          .pmx-tabs,.pmx-controls .pmx-search{grid-column:1 / -1; width:100%; min-width:0;}
          .pmx-tabs{justify-content:flex-start;}
          .pmx-tab{flex:0 0 auto; padding:0 12px;}
          .pmx-filter-toggle,.pmx-filter,.pmx-filter-clear{width:100%; min-width:0; justify-content:center; padding:0 8px; font-size:11px;}
          .pmx-filter-clear{grid-column:1 / -1;}
          .pmx-workspace-controls{padding:9px;border-radius:18px;}
          .pmx-view-tools{grid-template-columns:repeat(2,minmax(0,1fr));}
          .pmx-sort-wrap{grid-column:1 / -1;min-width:0;}
          .pmx-advanced-filters{grid-template-columns:repeat(2,minmax(0,1fr));}
          .pmx-filter-summary{grid-column:1 / -1;}
          .pmx-assignee-grid{grid-template-columns:1fr;}
          .pmx-team-row{align-items:flex-start;flex-wrap:wrap;}
          .pmx-team-row .pmx-user-row-main{min-width:160px;}
          .pmx-mobile-create{display:flex;}
          .pmx-mobile-board-hint{display:block; margin:-2px 0 10px; padding:9px 11px; border-radius:13px; border:1px solid rgba(255,177,27,.15); background:rgba(255,177,27,.06); color:var(--ink-3); font-size:11px; line-height:1.45;}
          .pmx-board{display:flex; grid-template-columns:none; gap:10px; margin:0 -6px; padding:0 6px 12px; overflow-x:auto; scroll-snap-type:x mandatory; scroll-padding-left:6px;}
          .pmx-column{flex:0 0 calc(100vw - 48px); min-width:0; max-width:420px; scroll-snap-align:start; border-radius:18px; padding:10px;}
          .pmx-task-card{padding:12px; border-radius:16px; touch-action:manipulation;}
          .pmx-task-card:hover{transform:none; box-shadow:none;}
          .pmx-drag-handle{display:none;}
          .pmx-mobile-status{display:grid; grid-template-columns:auto minmax(0,1fr); align-items:center; gap:10px; margin:-2px 0 12px; padding:9px 10px; border-radius:12px; border:1px solid rgba(148,163,184,.12); background:rgba(15,23,42,.62); color:var(--ink-4); font-size:10px; font-weight:850;}
          .pmx-mobile-status select{width:100%; min-width:0; height:34px; border-radius:10px; border:1px solid rgba(148,163,184,.16); background:rgba(22,31,49,.94); color:var(--ink); padding:0 8px; font-size:12px;}
          .pmx-task-footer{align-items:flex-end;}
          .pmx-list-item{padding:12px; border-radius:16px;}
          .pmx-list-side{width:100%;}
          .pmx-list-side .pmx-meta-chip{flex:1; justify-content:center;}
          .pmx-timeline-item{grid-template-columns:54px minmax(0,1fr); gap:10px; padding:11px; border-radius:16px;}
          .pmx-timeline-date{height:54px; border-radius:14px;}
          .pmx-gantt-scroll{margin:0 -4px; padding:0 4px 8px;}
        }
      `}</style>

      <div className="pmx-page">
        <div className="pmx-shell">
          <aside className="pmx-sidebar">
            <div className="pmx-logo">
              <div className="pmx-logo-badge">T</div>
              <div>
                <div className="pmx-brand-title">Tooldur</div>
                <div className="pmx-brand-sub">Proje Yönetimi</div>
              </div>
            </div>

            <div className="pmx-section-title">Menü</div>
            <div className="pmx-sidebar-nav">
              <button className="pmx-nav-item" onClick={() => setSekme("kanban")}>
                <LayoutDashboard size={18} />
                <span>Genel Bakış</span>
              </button>
              <button className="pmx-nav-item" onClick={() => document.getElementById("pmx-project-list")?.scrollIntoView({ behavior: "smooth", block: "nearest" })}>
                <FolderKanban size={18} />
                <span>Projeler</span>
              </button>
              <button className="pmx-nav-item" onClick={() => setDavetModalAcik(true)} disabled={!aktifProje}>
                <Users size={18} />
                <span>Takım</span>
              </button>
              {aktifProje?.sahipUid === user.uid && (
                <button className="pmx-nav-item" onClick={() => setProjeAyarModalAcik(true)}>
                  <Settings size={18} />
                  <span>Proje Ayarları</span>
                </button>
              )}
            </div>

            <div className="pmx-section-title">Projelerim</div>

            <div id="pmx-project-list" className="pmx-project-list">
              {projeler.map((proje) => (
                <button
                  key={proje.id}
                  className={`pmx-project-item ${proje.id === aktifProjeId ? "is-active" : ""}`}
                  onClick={() => setAktifProjeId(proje.id)}
                >
                  <span style={{ fontSize: 20 }}>{proje.emoji || "📁"}</span>
                  <span className="pmx-project-dot" style={{ background: proje.renk }} />
                  <div className="pmx-project-main">
                    <strong>{proje.ad}</strong>
                    <span>{new Set([proje.sahipUid, ...(proje.uyeler || []).map((uye) => uye.uid)]).size} üye</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>

            {projelerYukleniyor ? (
              <div className="pmx-sidebar-loading"><span /><span /><span /></div>
            ) : !projeler.length ? (
              <div className="pmx-empty" style={{ marginTop: 8 }}>Henüz proje yok.</div>
            ) : null}

            <div className="pmx-side-actions">
              <button className="pmx-btn pmx-btn-primary" onClick={() => setProjeModalAcik(true)}>
                <Plus size={16} style={{ marginRight: 6 }} />
                Yeni Proje
              </button>

              {aktifProje && (
                <>
                  <button className="pmx-btn pmx-btn-secondary" onClick={() => setDavetModalAcik(true)}>
                    <Users size={16} style={{ marginRight: 6 }} />
                    Takımı Yönet
                  </button>

                  {aktifProje.sahipUid === user.uid && (
                    <>
                      <button className="pmx-btn pmx-btn-secondary" onClick={() => setProjeAyarModalAcik(true)}>
                        <Settings size={16} style={{ marginRight: 6 }} />
                        Proje Ayarları
                      </button>
                      <button className="pmx-btn pmx-btn-secondary pmx-danger-btn" onClick={handleDeleteProject}>
                        <Trash2 size={16} style={{ marginRight: 6 }} />
                        Projeyi Sil
                      </button>
                    </>
                  )}
                </>
              )}

              <button className="pmx-btn pmx-btn-secondary" onClick={() => cikisYap()}>
                <LogOut size={16} style={{ marginRight: 6 }} />
                Çıkış Yap
              </button>
            </div>
          </aside>

          <main className="pmx-main-card">
            <div className="pmx-topbar">
              <div className="pmx-title-wrap">
                <h1>{aktifProje ? aktifProje.ad : "Proje Yönetimi"}</h1>
                <p>
                  {aktifProje?.aciklama ||
                    "Projelerini, görevlerini, terminlerini ve takım akışını tek panelden yönet."}
                </p>
              </div>

              <div className="pmx-toolbar">
                <div className="pmx-bell-wrap">
                  <button className="pmx-icon-btn" onClick={() => setBildirimAcik((v) => !v)}>
                    <Bell size={18} />
                    {!!bildirimler.length && <span className="pmx-badge">{bildirimler.length}</span>}
                  </button>

                  {bildirimAcik && (
                    <div className="pmx-bell-dropdown">
                      {!bildirimler.length ? (
                        <div className="pmx-empty" style={{ border: 0, borderRadius: 0 }}>
                          Bildirim yok.
                        </div>
                      ) : (
                        bildirimler.slice(0, 8).map((bildirim) => (
                          <div key={bildirim.id} className="pmx-bell-item">
                            <div className="pmx-stat-icon" style={{ width: 36, height: 36 }}>
                              <Bell size={16} />
                            </div>
                            <div>
                              <strong>{bildirim.metin}</strong>
                              <span>{bildirim.tarih.toLocaleString("tr-TR")}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {aktifProje?.sahipUid === user.uid && (
                  <button className="pmx-icon-btn" onClick={() => setProjeAyarModalAcik(true)} title="Proje ayarları" aria-label="Proje ayarları">
                    <Settings size={18} />
                  </button>
                )}
                <button className="pmx-btn pmx-btn-primary" disabled={!aktifProje} onClick={() => openTaskModal()}>
                  <Plus size={16} style={{ marginRight: 6 }} />
                  Yeni Görev
                </button>
              </div>
            </div>

            {!!panelHatasi && (
              <div className="pmx-panel-error" role="alert">
                <span>{panelHatasi}</span>
                <button onClick={() => setPanelHatasi("")} aria-label="Hata mesajını kapat"><X size={14} /></button>
              </div>
            )}

            {aktifProje && (
              <section className="pmx-project-overview">
                <div className="pmx-project-overview-main">
                  <div className="pmx-project-cover" aria-hidden="true" />
                  <div>
                    <div className="pmx-eyebrow">Aktif Proje</div>
                    <strong>{ozet.toplam ? Math.round((ozet.tamamlanan / ozet.toplam) * 100) : 0}% tamamlandı</strong>
                    <span>{ozet.tamamlanan}/{ozet.toplam} görev kapandı · {ozet.geciken} geciken · {new Set([aktifProje.sahipUid, ...(aktifProje.uyeler || []).map((uye) => uye.uid)]).size} ekip üyesi</span>
                  </div>
                </div>
                <div className="pmx-project-progress">
                  <span style={{ width: `${ozet.toplam ? Math.round((ozet.tamamlanan / ozet.toplam) * 100) : 0}%` }} />
                </div>
                <div className="pmx-shortcut-note">Ctrl/⌘ + K ara · Ctrl/⌘ + Enter yeni görev</div>
              </section>
            )}

            {pendingToolItem && (
              <section className="pmx-pending-tool">
                <div>
                  <strong>Projeye aktarılacak araç: {pendingToolItem.toolName}</strong>
                  <span>{pendingToolItem.summary || pendingToolItem.note || "Tooldur hesaplama sonucu proje görevine dönüştürülebilir."}</span>
                </div>
                <div className="pmx-pending-actions">
                  <button className="pmx-btn pmx-btn-primary" disabled={!aktifProje} onClick={handleSavePendingToolAsTask}>Aktif projeye görev olarak ekle</button>
                  <button className="pmx-btn pmx-btn-secondary" onClick={handleDismissPendingTool}>Vazgeç</button>
                </div>
              </section>
            )}

            <section className="pmx-stat-grid">
              <StatCard label="Toplam Görev" value={ozet.toplam} hint="Aktif projedeki tüm işler" icon={<FolderKanban size={18} />} />
              <StatCard label="Bugün Teslim" value={ozet.bugunTeslim} hint="Bugün kapanması gereken" icon={<Clock3 size={18} />} />
              <StatCard label="Geciken" value={ozet.geciken} hint="Termin tarihi geçmiş" icon={<AlertTriangle size={18} />} />
              <StatCard label="Tamamlanan" value={ozet.tamamlanan} hint="Biten görevler" icon={<CheckCircle2 size={18} />} />
            </section>

            {!!davetler.length && (
              <section className="pmx-alerts">
                {davetler.map((davet) => (
                  <div key={`${davet.proje_id}-${davet.email}`} className="pmx-invite-item">
                    <div className="pmx-invite-main">
                      <div className="pmx-logo-badge" style={{ width: 44, height: 44, borderRadius: 16 }}>
                        {davet.proje_emoji}
                      </div>
                      <div>
                        <strong>Proje daveti · {davet.proje_adi}</strong>
                        <span>{davet.davet_eden || "Bir kullanıcı"} seni projeye davet etti.</span>
                      </div>
                    </div>

                    <div className="pmx-invite-actions">
                      <button
                        className="pmx-btn pmx-btn-secondary"
                        onClick={async () => {
                          await davetiReddet(davet.proje_id, davet.email);
                          setDavetler((prev) => prev.filter((x) => !(x.proje_id === davet.proje_id && x.email === davet.email)));
                        }}
                      >
                        Reddet
                      </button>

                      <button
                        className="pmx-btn pmx-btn-primary"
                        onClick={async () => {
                          await davetiKabulEt(davet.proje_id, user.uid, davet.email, user.displayName);
                          setDavetler((prev) => prev.filter((x) => !(x.proje_id === davet.proje_id && x.email === davet.email)));
                        }}
                      >
                        Katıl
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            )}

            <section className="pmx-workspace-controls">
              <div className="pmx-controls-top">
                <div className="pmx-tabs" role="tablist" aria-label="Proje görünümü">
                  {[
                    { id: "kanban", label: "Kanban", icon: <LayoutDashboard size={15} /> },
                    { id: "liste", label: "Liste", icon: <ListTodo size={15} /> },
                    { id: "takvim", label: "Gantt & Takvim", icon: <CalendarDays size={15} /> },
                    { id: "analiz", label: "Analiz", icon: <BarChart3 size={15} /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={sekme === tab.id}
                      className={`pmx-tab ${sekme === tab.id ? "is-active" : ""}`}
                      onClick={() => setSekme(tab.id as Sekme)}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="pmx-search">
                  <Search size={16} style={{ color: "var(--ink-4)" }} />
                  <input
                    id="pmx-task-search"
                    value={arama}
                    onChange={(e) => setArama(e.target.value)}
                    placeholder="Görev, açıklama veya etiket ara"
                    aria-label="Görevlerde ara"
                  />
                  {!!arama && (
                    <button className="pmx-search-clear" onClick={() => setArama("")} aria-label="Aramayı temizle">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="pmx-quickbar">
                <div className="pmx-quick-filters" aria-label="Hızlı görev filtreleri">
                  {[
                    { id: "tum", label: "Tümü", count: filtreSayilari.tum },
                    { id: "acik", label: "Açık", count: filtreSayilari.acik },
                    { id: "bugun", label: "Bugün", count: filtreSayilari.bugun },
                    { id: "geciken", label: "Geciken", count: filtreSayilari.geciken, danger: true },
                    { id: "tamamlanan", label: "Tamamlanan", count: filtreSayilari.tamamlanan },
                  ].map((filtre) => (
                    <button
                      key={filtre.id}
                      className={`pmx-quick-filter ${hizliFiltre === filtre.id ? "is-active" : ""} ${filtre.danger && filtre.count ? "is-danger" : ""}`}
                      onClick={() => setHizliFiltre(filtre.id as HizliFiltre)}
                    >
                      <span>{filtre.label}</span>
                      <b>{filtre.count}</b>
                    </button>
                  ))}
                </div>

                <div className="pmx-view-tools">
                  <button
                    className={`pmx-filter-toggle ${uyeFiltre === user.uid ? "is-active" : ""}`}
                    onClick={() => setUyeFiltre((prev) => (prev === user.uid ? "tum" : user.uid))}
                    title="Yalnız bana atanmış görevleri göster"
                  >
                    <Users size={14} />
                    Bana Atananlar
                  </button>

                  <button
                    className={`pmx-filter-toggle ${kompaktGorunum ? "is-active" : ""}`}
                    onClick={() => setKompaktGorunum((v) => !v)}
                    title="Kart yoğunluğunu değiştir"
                  >
                    <SlidersHorizontal size={14} />
                    {kompaktGorunum ? "Rahat" : "Kompakt"}
                  </button>

                  <label className="pmx-sort-wrap">
                    <ArrowUpDown size={14} />
                    <select value={siralama} onChange={(e) => setSiralama(e.target.value as Siralama)} aria-label="Görevleri sırala">
                      <option value="varsayilan">Varsayılan sıra</option>
                      <option value="termin">Termine göre</option>
                      <option value="oncelik">Önceliğe göre</option>
                      <option value="guncel">Son güncellenen</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="pmx-advanced-filters">
                <select className="pmx-filter" value={oncelikFiltre} onChange={(e) => setOncelikFiltre(e.target.value as Oncelik | "tum")} aria-label="Öncelik filtresi">
                  <option value="tum">Tüm öncelikler</option>
                  <option value="dusuk">Düşük</option>
                  <option value="orta">Orta</option>
                  <option value="yuksek">Yüksek</option>
                </select>

                <select className="pmx-filter" value={uyeFiltre} onChange={(e) => setUyeFiltre(e.target.value)} aria-label="Üye filtresi">
                  <option value="tum">Tüm üyeler</option>
                  {gorevModalUyeleri.map((uye) => (
                    <option key={uye.uid} value={uye.uid}>{uye.displayName || uye.email}</option>
                  ))}
                </select>

                <span className="pmx-filter-summary">
                  {filtreliGorevler.length} / {gorevler.length} görev gösteriliyor
                </span>

                {(arama || oncelikFiltre !== "tum" || uyeFiltre !== "tum" || hizliFiltre !== "tum") && (
                  <button
                    className="pmx-filter-clear"
                    onClick={() => { setArama(""); setOncelikFiltre("tum"); setUyeFiltre("tum"); setHizliFiltre("tum"); }}
                  >
                    <X size={14} /> Filtreleri temizle
                  </button>
                )}
              </div>
            </section>

            {!aktifProje ? (
              <div className="pmx-empty">Başlamak için soldan bir proje seç veya yeni proje oluştur.</div>
            ) : gorevlerYukleniyor ? (
              <div className="pmx-task-loading" aria-live="polite">
                <span className="pmx-loading-ring" />
                <div><strong>Görevler yükleniyor</strong><small>Aktif proje verileri eşitleniyor.</small></div>
              </div>
            ) : sekme === "kanban" ? (
              <>
                <div className="pmx-mobile-board-hint">Kolonlar arasında yatay kaydır. Görev durumunu kartın içinden değiştirebilirsin.</div>
                <section className={`pmx-board ${kompaktGorunum ? "is-compact" : ""}`}>
                {KOLONLAR.map((kolon) => {
                  const kolonGorevleri = filtreliGorevler.filter((g) => g.durum === kolon.id);
                  return (
                    <div
                      key={kolon.id}
                      className={`pmx-column ${dragOverStatus === kolon.id ? "is-drag-over" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDragOverStatus(kolon.id); }}
                      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverStatus(null); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/plain");
                        setDragOverStatus(null);
                        if (id) handleMoveTask(id, kolon.id);
                      }}
                    >
                      <div className="pmx-column-head">
                        <strong>
                          <span className="pmx-project-dot" style={{ background: kolon.renk }} />
                          {kolon.label}
                        </strong>
                        <div className="pmx-column-head-actions">
                          <span className="pmx-count">{kolonGorevleri.length}</span>
                          <button className="pmx-column-add" onClick={() => openTaskModal(kolon.id)} title={`${kolon.label} kolonuna görev ekle`} aria-label={`${kolon.label} kolonuna görev ekle`}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="pmx-column-body">
                        {kolonGorevleri.length ? (
                          kolonGorevleri.map((gorev) => (
                            <TaskCard
                              key={gorev.id}
                              gorev={gorev}
                              onOpen={setSeciliGorev}
                              onDelete={handleDeleteTask}
                              onStatusChange={handleMoveTask}
                            />
                          ))
                        ) : (
                          <div className="pmx-empty" style={{ padding: 22 }}>Bu kolonda görev yok.</div>
                        )}
                      </div>
                    </div>
                  );
                })}
                </section>
              </>
            ) : sekme === "liste" ? (
              <ListeGorunumu gorevler={filtreliGorevler} onOpen={setSeciliGorev} onDelete={handleDeleteTask} />
            ) : sekme === "takvim" ? (
              <GanttGorunumu gorevler={filtreliGorevler} onOpen={setSeciliGorev} />
            ) : (
              <AnalizGorunumu gorevler={filtreliGorevler} />
            )}
          </main>
        </div>
      </div>

      {aktifProje && (
        <button className="pmx-mobile-create" onClick={() => openTaskModal()} aria-label="Yeni görev oluştur">
          <Plus size={20} />
          <span>Yeni görev</span>
        </button>
      )}

      {projeModalAcik && (
        <ProjeOlusturModal
          onClose={() => setProjeModalAcik(false)}
          onSave={handleCreateProject}
        />
      )}

      {projeAyarModalAcik && aktifProje && aktifProje.sahipUid === user.uid && (
        <ProjeAyarModal
          proje={aktifProje}
          onClose={() => setProjeAyarModalAcik(false)}
          onSave={handleUpdateProject}
        />
      )}

      {gorevModalAcik && (
        <GorevOlusturModal
          key={`${aktifProjeId}-${gorevBaslangicDurum}`}
          initialDurum={gorevBaslangicDurum}
          uyeler={gorevModalUyeleri}
          onClose={() => setGorevModalAcik(false)}
          onSave={handleCreateTask}
        />
      )}

      {davetModalAcik && aktifProje && (
        <DavetModal
          proje={aktifProje}
          onClose={() => setDavetModalAcik(false)}
          onInviteEmail={handleInviteEmail}
          onRemoveMember={handleRemoveMember}
          onCancelInvite={handleCancelInvite}
          canManage={aktifProje.sahipUid === user.uid}
          sahip={gorevModalUyeleri.find((uye) => uye.uid === aktifProje.sahipUid) || null}
        />
      )}

      {seciliGorev && aktifProje && (
        <GorevDetayModal
          gorev={seciliGorev}
          projeId={aktifProje.id}
          sahipUid={aktifProje.sahipUid}
          uyeler={aktifProje.uyeler || []}
          benimUid={user.uid}
          benimAd={user.displayName}
          benimFoto={user.photoURL}
          onKapat={() => setSeciliGorev(null)}
        />
      )}
    </>
  );
}
