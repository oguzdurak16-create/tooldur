"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  ListFilter,
  ListTodo,
  LogOut,
  MailX,
  Plus,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/usePmAuth";
import {
  bekleyenDavetleriGetir,
  davetiKabulEt,
  davetiReddet,
  gorevEkle,
  gorevGuncelle,
  gorevSil,
  gorevleriDinle,
  kullanicilariAra,
  projeDavetIptalEt,
  projeEkle,
  projeGuncelle,
  projeSil,
  projeUyeKaldir,
  projeleriDinle,
  uyeDavetEt,
  type BekleyenDavet,
} from "@/lib/pm-db-supabase";
import {
  gorevBildirimleriniHesapla,
  type InAppBildirim,
  useBildirimler,
} from "@/hooks/useBildirimler";

import AuthEkrani from "./AuthEkrani";
import GorevDetayModal from "./GorevDetayModal";
import { KOLONLAR, ONCELIK_MAP, PROJE_EMOJILER, PROJE_RENKLERI } from "./pm-constants";
import type { Durum, Gorev, Oncelik, Proje, UyeRef } from "./pm-types";

type Sekme = "kanban" | "liste" | "takvim" | "analiz";
type HizliFiltre = "tum" | "acik" | "bugun" | "geciken" | "tamamlanan";
type Siralama = "olusturma" | "termin" | "oncelik" | "baslik";
type Toast = { id: number; type: "success" | "error"; text: string };

type GorevForm = {
  baslik: string;
  aciklama: string;
  durum: Durum;
  oncelik: Oncelik;
  termin: string;
  etiketler: string;
  atananlar: UyeRef[];
};

const PRIORITY_SCORE: Record<Oncelik, number> = { dusuk: 1, orta: 2, yuksek: 3 };

function parseDateOnly(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function todayDateOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
}

function isOverdue(task: Gorev) {
  if (!task.termin || task.durum === "tamamlandi") return false;
  const due = parseDateOnly(task.termin);
  return !!due && due < todayDateOnly();
}

function isToday(task: Gorev) {
  const due = parseDateOnly(task.termin);
  if (!due) return false;
  return due.toDateString() === todayDateOnly().toDateString();
}

function formatDate(value?: string | null, options?: Intl.DateTimeFormatOptions) {
  const date = parseDateOnly(value);
  if (!date) return "Termin yok";
  return date.toLocaleDateString("tr-TR", options ?? { day: "2-digit", month: "2-digit", year: "numeric" });
}

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

function Avatar({ uye, size = 30 }: { uye: UyeRef; size?: number }) {
  const fallback = (uye.displayName || uye.email || "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="pm-avatar" style={{ width: size, height: size, fontSize: Math.max(8, size * 0.31) }} title={uye.displayName || uye.email}>
      {uye.photoURL ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={uye.photoURL} alt="" loading="lazy" />
      ) : (
        fallback
      )}
    </span>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  width = 620,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="pm-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="pm-modal" style={{ "--pm-modal-width": `${width}px` } as React.CSSProperties} role="dialog" aria-modal="true" aria-label={title}>
        <header className="pm-modal-head">
          <div className="pm-modal-title">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="pm-icon-button" onClick={onClose} aria-label="Pencereyi kapat">
            <X size={17} />
          </button>
        </header>
        <div className="pm-modal-body">{children}</div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon, danger = false }: { label: string; value: number; icon: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`pm-metric ${danger ? "is-danger" : ""}`}>
      <div className="pm-metric-icon">{icon}</div>
      <div className="pm-metric-copy">
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
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
  onOpen: (gorev: Gorev) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Durum) => void;
}) {
  const priority = ONCELIK_MAP[gorev.oncelik];
  const totalChecks = gorev.checklistler?.length ?? 0;
  const completedChecks = gorev.checklistler?.filter((item) => item.tamamlandi).length ?? 0;
  const progress = totalChecks ? Math.round((completedChecks / totalChecks) * 100) : 0;
  const overdue = isOverdue(gorev);

  return (
    <article
      className={`pm-task-card ${overdue ? "is-overdue" : gorev.oncelik === "yuksek" ? "is-high" : ""}`}
      tabIndex={0}
      draggable
      onClick={() => onOpen(gorev)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(gorev);
        }
      }}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", gorev.id);
      }}
    >
      <div className="pm-task-head">
        <span className="pm-task-priority" style={{ background: priority.bg, color: priority.color }}>
          {priority.label}
        </span>
        <div className="pm-task-menu">
          <button
            type="button"
            className="pm-task-mini"
            title={gorev.durum === "tamamlandi" ? "Görevi yeniden aç" : "Tamamlandı olarak işaretle"}
            onClick={(event) => {
              event.stopPropagation();
              onStatusChange(gorev.id, gorev.durum === "tamamlandi" ? "yapilacak" : "tamamlandi");
            }}
          >
            {gorev.durum === "tamamlandi" ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
          </button>
          <button
            type="button"
            className="pm-task-mini"
            title="Görevi sil"
            onClick={(event) => {
              event.stopPropagation();
              if (window.confirm(`"${gorev.baslik}" görevi silinsin mi?`)) onDelete(gorev.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="pm-task-title">{gorev.baslik}</h3>
      {gorev.aciklama && <p className="pm-task-description">{gorev.aciklama}</p>}

      {!!gorev.etiketler?.length && (
        <div className="pm-task-tags">
          {gorev.etiketler.slice(0, 3).map((tag) => (
            <span key={tag} className="pm-tag">#{tag}</span>
          ))}
          {gorev.etiketler.length > 3 && <span className="pm-tag">+{gorev.etiketler.length - 3}</span>}
        </div>
      )}

      <div className="pm-task-meta">
        <span className={`pm-meta ${overdue ? "is-overdue" : ""}`}>
          <CalendarDays size={12} />
          {formatDate(gorev.termin, { day: "2-digit", month: "short" })}
        </span>
        <span className="pm-meta">
          <CheckCircle2 size={12} />
          {totalChecks ? `${completedChecks}/${totalChecks}` : "Checklist yok"}
        </span>
      </div>

      {!!totalChecks && (
        <div className="pm-task-progress">
          <div className="pm-task-progress-line"><span>İlerleme</span><span>%{progress}</span></div>
          <div className="pm-progress-track"><span style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      <footer className="pm-task-footer">
        <div className="pm-avatar-stack">
          {gorev.atananlar?.length ? (
            <>
              {gorev.atananlar.slice(0, 3).map((member) => <Avatar key={member.uid} uye={member} size={25} />)}
              {gorev.atananlar.length > 3 && <span className="pm-avatar-more">+{gorev.atananlar.length - 3}</span>}
            </>
          ) : (
            <span className="pm-meta">Atanmamış</span>
          )}
        </div>
        <select
          className="pm-task-status-select"
          value={gorev.durum}
          aria-label={`${gorev.baslik} durumunu değiştir`}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onStatusChange(gorev.id, event.target.value as Durum)}
        >
          {KOLONLAR.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
        </select>
      </footer>
    </article>
  );
}

function ProjectModal({
  project,
  onClose,
  onSave,
  onDelete,
}: {
  project?: Proje | null;
  onClose: () => void;
  onSave: (payload: { ad: string; aciklama: string; renk: string; emoji: string }) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [name, setName] = useState(project?.ad ?? "");
  const [description, setDescription] = useState(project?.aciklama ?? "");
  const [color, setColor] = useState(project?.renk ?? PROJE_RENKLERI[0]);
  const [icon, setIcon] = useState(project?.emoji ?? PROJE_EMOJILER[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <Modal
      title={project ? "Proje ayarları" : "Yeni proje"}
      subtitle={project ? "Proje kimliğini ve görünümünü düzenle" : "Kısa ve anlaşılır bir proje tanımı oluştur"}
      onClose={onClose}
    >
      <form
        className="pm-form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!name.trim()) return;
          setSaving(true);
          setError("");
          try {
            await onSave({ ad: name.trim(), aciklama: description.trim(), renk: color, emoji: icon });
            onClose();
          } catch (err) {
            setError(normalizeError(err, "Proje kaydedilemedi."));
          } finally {
            setSaving(false);
          }
        }}
      >
        {error && <div className="pm-error-banner">{error}</div>}
        <div>
          <label className="pm-label" htmlFor="pm-project-name">Proje adı</label>
          <input id="pm-project-name" className="pm-input" autoFocus maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="Örn. APHS 31150 geliştirme" />
        </div>
        <div>
          <label className="pm-label" htmlFor="pm-project-description">Açıklama</label>
          <textarea id="pm-project-description" className="pm-textarea" maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Kapsamı, hedefi ve önemli sınırları kısa şekilde yaz." />
          <div className="pm-help">{description.length}/500 karakter</div>
        </div>
        <div className="pm-form-row">
          <div>
            <span className="pm-label">Renk</span>
            <div className="pm-color-options">
              {PROJE_RENKLERI.map((item) => (
                <button key={item} type="button" className={`pm-color-option ${color === item ? "is-active" : ""}`} style={{ background: item }} onClick={() => setColor(item)} aria-label={`Proje rengini ${item} yap`} />
              ))}
            </div>
          </div>
          <div>
            <span className="pm-label">Simge</span>
            <div className="pm-icon-options">
              {PROJE_EMOJILER.map((item) => (
                <button key={item} type="button" className={`pm-icon-option ${icon === item ? "is-active" : ""}`} onClick={() => setIcon(item)} aria-label={`Proje simgesi ${item}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="pm-form-actions" style={{ justifyContent: onDelete ? "space-between" : "flex-end" }}>
          {onDelete && <button type="button" className="pm-button is-danger" disabled={saving} onClick={onDelete}><Trash2 size={14} />Projeyi sil</button>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="pm-button" onClick={onClose}>Vazgeç</button>
            <button type="submit" className="pm-button is-primary" disabled={!name.trim() || saving}>{saving ? "Kaydediliyor" : project ? "Değişiklikleri kaydet" : "Projeyi oluştur"}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function TaskCreateModal({
  members,
  initialStatus,
  onClose,
  onSave,
}: {
  members: UyeRef[];
  initialStatus: Durum;
  onClose: () => void;
  onSave: (form: GorevForm) => Promise<void>;
}) {
  const [form, setForm] = useState<GorevForm>({
    baslik: "",
    aciklama: "",
    durum: initialStatus,
    oncelik: "orta",
    termin: "",
    etiketler: "",
    atananlar: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggleMember = (member: UyeRef) => {
    setForm((current) => {
      const exists = current.atananlar.some((item) => item.uid === member.uid);
      return { ...current, atananlar: exists ? current.atananlar.filter((item) => item.uid !== member.uid) : [...current.atananlar, member] };
    });
  };

  return (
    <Modal title="Yeni görev" subtitle="İşi tek cümlede tanımla, ardından sorumlu ve termin belirle" onClose={onClose} width={700}>
      <form
        className="pm-form-grid"
        onSubmit={async (event) => {
          event.preventDefault();
          if (!form.baslik.trim()) return;
          setSaving(true);
          setError("");
          try {
            await onSave({ ...form, baslik: form.baslik.trim(), aciklama: form.aciklama.trim() });
            onClose();
          } catch (err) {
            setError(normalizeError(err, "Görev oluşturulamadı."));
          } finally {
            setSaving(false);
          }
        }}
      >
        {error && <div className="pm-error-banner">{error}</div>}
        <div>
          <label className="pm-label" htmlFor="pm-task-name">Görev başlığı</label>
          <input id="pm-task-name" className="pm-input" autoFocus maxLength={160} value={form.baslik} onChange={(event) => setForm((current) => ({ ...current, baslik: event.target.value }))} placeholder="Örn. Alt çene teknik resmini revize et" />
        </div>
        <div>
          <label className="pm-label" htmlFor="pm-task-description">Açıklama</label>
          <textarea id="pm-task-description" className="pm-textarea" maxLength={1500} value={form.aciklama} onChange={(event) => setForm((current) => ({ ...current, aciklama: event.target.value }))} placeholder="Beklenen çıktı, kritik ölçü veya bağımlılıkları yaz." />
        </div>
        <div className="pm-form-row">
          <div>
            <label className="pm-label" htmlFor="pm-task-status">Başlangıç durumu</label>
            <select id="pm-task-status" className="pm-select" value={form.durum} onChange={(event) => setForm((current) => ({ ...current, durum: event.target.value as Durum }))}>
              {KOLONLAR.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
            </select>
          </div>
          <div>
            <label className="pm-label" htmlFor="pm-task-priority">Öncelik</label>
            <select id="pm-task-priority" className="pm-select" value={form.oncelik} onChange={(event) => setForm((current) => ({ ...current, oncelik: event.target.value as Oncelik }))}>
              <option value="dusuk">Düşük</option>
              <option value="orta">Orta</option>
              <option value="yuksek">Yüksek</option>
            </select>
          </div>
        </div>
        <div className="pm-form-row">
          <div>
            <label className="pm-label" htmlFor="pm-task-date">Termin</label>
            <input id="pm-task-date" type="date" className="pm-input" value={form.termin} onChange={(event) => setForm((current) => ({ ...current, termin: event.target.value }))} />
          </div>
          <div>
            <label className="pm-label" htmlFor="pm-task-tags">Etiketler</label>
            <input id="pm-task-tags" className="pm-input" value={form.etiketler} onChange={(event) => setForm((current) => ({ ...current, etiketler: event.target.value }))} placeholder="mekanik, revizyon, acil" />
          </div>
        </div>
        {!!members.length && (
          <div>
            <span className="pm-label">Sorumlular</span>
            <div className="pm-assignee-grid">
              {members.map((member) => {
                const active = form.atananlar.some((item) => item.uid === member.uid);
                return (
                  <button key={member.uid} type="button" className={`pm-assignee-option ${active ? "is-active" : ""}`} onClick={() => toggleMember(member)}>
                    <Avatar uye={member} size={30} />
                    <span>{member.displayName || member.email}</span>
                    <span className="pm-checkmark">{active && <Check size={12} />}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="pm-form-actions">
          <button type="button" className="pm-button" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="pm-button is-primary" disabled={!form.baslik.trim() || saving}>{saving ? "Oluşturuluyor" : "Görevi oluştur"}</button>
        </div>
      </form>
    </Modal>
  );
}

function TeamModal({
  project,
  currentUserId,
  members,
  onClose,
  onInvite,
  onRemoveMember,
  onCancelInvite,
}: {
  project: Proje;
  currentUserId: string;
  members: UyeRef[];
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
  onRemoveMember: (member: UyeRef) => Promise<void>;
  onCancelInvite: (email: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UyeRef[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const owner = project.sahipUid === currentUserId;
  const memberIds = useMemo(() => members.map((member) => member.uid), [members]);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query.trim());

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const found = await kullanicilariAra(clean, memberIds);
        if (active) setResults(found);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 260);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [memberIds, query]);

  const send = async (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    setBusy(clean);
    setError("");
    try {
      await onInvite(clean);
      setQuery("");
      setResults([]);
    } catch (err) {
      setError(normalizeError(err, "Davet gönderilemedi."));
    } finally {
      setBusy("");
    }
  };

  return (
    <Modal title="Takım yönetimi" subtitle={`${project.ad} projesinin üyeleri ve bekleyen davetleri`} onClose={onClose} width={760}>
      <div className="pm-form-grid">
        {error && <div className="pm-error-banner">{error}</div>}
        {owner && (
          <div className="pm-invite-search">
            <label className="pm-label" htmlFor="pm-member-search">E-posta veya kullanıcı adıyla davet et</label>
            <div className="pm-search">
              <Search size={15} />
              <input id="pm-member-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="isim veya e-posta" />
              {searching && <span style={{ fontSize: 9 }}>Aranıyor</span>}
            </div>
            {!!query.trim() && (results.length > 0 || emailValid) && (
              <div className="pm-search-results">
                {results.map((member) => (
                  <button key={member.uid} type="button" className="pm-search-result" disabled={!!busy} onClick={() => send(member.email)}>
                    <Avatar uye={member} size={30} />
                    <span className="pm-member-copy"><strong>{member.displayName || member.email}</strong><span>{member.email}</span></span>
                    <ChevronRight size={14} />
                  </button>
                ))}
                {emailValid && !project.davetliler?.includes(query.trim().toLowerCase()) && (
                  <button type="button" className="pm-search-result" disabled={!!busy} onClick={() => send(query)}>
                    <span className="pm-avatar" style={{ width: 30, height: 30 }}><UserPlus size={14} /></span>
                    <span className="pm-member-copy"><strong>{query.trim().toLowerCase()}</strong><span>E-posta adresine davet gönder</span></span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div>
          <span className="pm-label">Üyeler</span>
          <div className="pm-member-list">
            {members.map((member) => {
              const isOwner = member.uid === project.sahipUid;
              return (
                <div key={member.uid} className="pm-member-row">
                  <Avatar uye={member} size={34} />
                  <div className="pm-member-copy">
                    <strong>{member.displayName || member.email}</strong>
                    <span>{member.email}</span>
                  </div>
                  {isOwner ? (
                    <span className="pm-role">Sahip</span>
                  ) : owner ? (
                    <button
                      type="button"
                      className="pm-icon-button is-danger"
                      title="Üyeyi projeden çıkar"
                      disabled={busy === member.uid}
                      onClick={async () => {
                        if (!window.confirm(`${member.displayName || member.email} projeden çıkarılsın mı?`)) return;
                        setBusy(member.uid);
                        setError("");
                        try {
                          await onRemoveMember(member);
                        } catch (err) {
                          setError(normalizeError(err, "Üye çıkarılamadı."));
                        } finally {
                          setBusy("");
                        }
                      }}
                    >
                      <UserMinus size={15} />
                    </button>
                  ) : (
                    <span className="pm-role">Üye</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {!!project.davetliler?.length && (
          <div>
            <span className="pm-label">Bekleyen davetler</span>
            <div className="pm-member-list">
              {project.davetliler.map((email) => (
                <div key={email} className="pm-member-row">
                  <span className="pm-avatar" style={{ width: 34, height: 34 }}><UserPlus size={14} /></span>
                  <div className="pm-member-copy"><strong>{email}</strong><span>Henüz kabul edilmedi</span></div>
                  {owner && (
                    <button
                      type="button"
                      className="pm-icon-button is-danger"
                      title="Daveti iptal et"
                      disabled={busy === email}
                      onClick={async () => {
                        setBusy(email);
                        setError("");
                        try {
                          await onCancelInvite(email);
                        } catch (err) {
                          setError(normalizeError(err, "Davet iptal edilemedi."));
                        } finally {
                          setBusy("");
                        }
                      }}
                    >
                      <MailX size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function ListView({ tasks, onOpen, onDelete }: { tasks: Gorev[]; onOpen: (task: Gorev) => void; onDelete: (id: string) => void }) {
  if (!tasks.length) return <EmptyState title="Görev bulunamadı" text="Filtreleri temizle veya yeni görev oluştur." />;
  return (
    <section className="pm-list-panel">
      <div className="pm-panel-head"><strong>Görev listesi</strong><span>{tasks.length} kayıt</span></div>
      <div style={{ overflowX: "auto" }}>
        <table className="pm-task-table">
          <thead>
            <tr><th style={{ width: "39%" }}>Görev</th><th style={{ width: "14%" }}>Durum</th><th style={{ width: "12%" }}>Öncelik</th><th style={{ width: "14%" }}>Termin</th><th style={{ width: "15%" }}>Sorumlu</th><th style={{ width: "6%" }} /></tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const column = KOLONLAR.find((item) => item.id === task.durum);
              const priority = ONCELIK_MAP[task.oncelik];
              return (
                <tr key={task.id} onClick={() => onOpen(task)}>
                  <td><div className="pm-table-title"><strong>{task.baslik}</strong><span>{task.aciklama || "Açıklama yok"}</span></div></td>
                  <td data-mobile-label="Durum"><span className="pm-meta"><span style={{ width: 6, height: 6, borderRadius: 2, background: column?.renk }} />{column?.label}</span></td>
                  <td data-mobile-label="Öncelik"><span className="pm-task-priority" style={{ background: priority.bg, color: priority.color }}>{priority.label}</span></td>
                  <td data-mobile-label="Termin"><span className={`pm-meta ${isOverdue(task) ? "is-overdue" : ""}`}>{formatDate(task.termin)}</span></td>
                  <td data-mobile-label="Sorumlu"><div className="pm-avatar-stack">{task.atananlar?.slice(0, 3).map((member) => <Avatar key={member.uid} uye={member} size={24} />)}{!task.atananlar?.length && <span className="pm-meta">Atanmamış</span>}</div></td>
                  <td>
                    <button type="button" className="pm-task-mini" onClick={(event) => { event.stopPropagation(); if (window.confirm(`"${task.baslik}" silinsin mi?`)) onDelete(task.id); }} aria-label="Görevi sil"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CalendarView({ tasks, onOpen }: { tasks: Gorev[]; onOpen: (task: Gorev) => void }) {
  const dated = tasks.filter((task) => !!task.termin).sort((a, b) => (parseDateOnly(a.termin)?.getTime() ?? 0) - (parseDateOnly(b.termin)?.getTime() ?? 0));
  if (!dated.length) return <EmptyState title="Terminli görev yok" text="Takvim görünümü için görevlere termin tarihi ekle." />;
  return (
    <section className="pm-calendar-panel">
      <div className="pm-panel-head"><strong>Termin takvimi</strong><span>{dated.length} görev</span></div>
      <div className="pm-calendar-list">
        {dated.map((task) => {
          const date = parseDateOnly(task.termin)!;
          const column = KOLONLAR.find((item) => item.id === task.durum);
          return (
            <button type="button" key={task.id} className="pm-calendar-row" onClick={() => onOpen(task)}>
              <div className="pm-calendar-date"><strong>{date.toLocaleDateString("tr-TR", { day: "2-digit" })}</strong><span>{date.toLocaleDateString("tr-TR", { month: "short", year: "numeric" })}</span></div>
              <div className="pm-calendar-copy"><strong>{task.baslik}</strong><span>{task.aciklama || "Açıklama yok"}</span></div>
              <span className={`pm-meta ${isOverdue(task) ? "is-overdue" : ""}`}><span style={{ width: 6, height: 6, borderRadius: 2, background: column?.renk }} />{isOverdue(task) ? "Gecikmiş" : column?.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AnalysisView({ tasks }: { tasks: Gorev[] }) {
  const total = tasks.length || 1;
  const completed = tasks.filter((task) => task.durum === "tamamlandi").length;
  const overdue = tasks.filter(isOverdue).length;
  const high = tasks.filter((task) => task.oncelik === "yuksek" && task.durum !== "tamamlandi").length;
  const completion = Math.round((completed / total) * 100);
  const health = Math.max(0, Math.min(100, 100 - overdue * 16 - high * 7 + Math.round(completion * 0.28)));
  const byStatus = KOLONLAR.map((column) => ({ label: column.label, color: column.renk, count: tasks.filter((task) => task.durum === column.id).length }));
  const byMember = new Map<string, { label: string; count: number }>();
  tasks.filter((task) => task.durum !== "tamamlandi").forEach((task) => {
    const people = task.atananlar?.length ? task.atananlar : [{ uid: "none", displayName: "Atanmamış", email: "" } as UyeRef];
    people.forEach((member) => {
      const key = member.uid || member.email || "none";
      const current = byMember.get(key) ?? { label: member.displayName || member.email || "Atanmamış", count: 0 };
      current.count += 1;
      byMember.set(key, current);
    });
  });
  const memberRows = Array.from(byMember.values()).sort((a, b) => b.count - a.count).slice(0, 7);
  const maxMember = Math.max(1, ...memberRows.map((row) => row.count));

  return (
    <section className="pm-analysis-panel">
      <div className="pm-panel-head"><strong>Proje analizi</strong><span>Filtrelenmiş görevler üzerinden</span></div>
      <div className="pm-analysis-grid">
        <div className="pm-analysis-card">
          <h3 className="pm-analysis-title">Proje sağlığı</h3>
          <div className="pm-health-line"><div className="pm-health-score">{health}</div><div className="pm-health-copy">{overdue} geciken, {high} yüksek öncelikli açık görev.<br />Tamamlanma oranı %{completion}.</div></div>
          <div className="pm-progress-track" style={{ marginTop: 16 }}><span style={{ width: `${health}%`, background: health >= 70 ? "var(--pm-success)" : health >= 40 ? "var(--pm-warning)" : "var(--pm-danger)" }} /></div>
        </div>
        <div className="pm-analysis-card">
          <h3 className="pm-analysis-title">Durum dağılımı</h3>
          {byStatus.map((row) => (
            <div className="pm-analysis-row" key={row.label}><span>{row.label}</span><div className="pm-analysis-bar"><span style={{ width: `${Math.round((row.count / total) * 100)}%`, background: row.color }} /></div><b>{row.count}</b></div>
          ))}
        </div>
        <div className="pm-analysis-card">
          <h3 className="pm-analysis-title">Açık iş yükü</h3>
          {memberRows.length ? memberRows.map((row) => (
            <div className="pm-analysis-row" key={row.label}><span>{row.label}</span><div className="pm-analysis-bar"><span style={{ width: `${Math.round((row.count / maxMember) * 100)}%` }} /></div><b>{row.count}</b></div>
          )) : <div className="pm-help">Açık görev yok.</div>}
        </div>
        <div className="pm-analysis-card">
          <h3 className="pm-analysis-title">Yönetici özeti</h3>
          <div className="pm-health-copy" style={{ fontSize: 11 }}>
            {tasks.length ? `${tasks.length} görevin ${completed} tanesi tamamlandı. ` : "Henüz görev bulunmuyor. "}
            {overdue ? `${overdue} görev terminini geçti. ` : "Geciken görev yok. "}
            {high ? `${high} yüksek öncelikli açık görev bulunuyor.` : "Yüksek öncelikli açık görev yok."}
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return <div className="pm-empty-state"><div><strong>{title}</strong><span>{text}</span>{action && <div style={{ marginTop: 12 }}>{action}</div>}</div></div>;
}

export default function ProjectManagementPage() {
  const { user, loading: authLoading, cikisYap } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [projects, setProjects] = useState<Proje[]>([]);
  const [tasks, setTasks] = useState<Gorev[]>([]);
  const [activeProjectId, setActiveProjectId] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Gorev | null>(null);
  const [tab, setTab] = useState<Sekme>("kanban");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Oncelik | "tum">("tum");
  const [memberFilter, setMemberFilter] = useState("tum");
  const [quickFilter, setQuickFilter] = useState<HizliFiltre>("tum");
  const [sort, setSort] = useState<Siralama>("olusturma");
  const [compact, setCompact] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [projectModal, setProjectModal] = useState<"create" | "edit" | null>(null);
  const [taskModalStatus, setTaskModalStatus] = useState<Durum | null>(null);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<BekleyenDavet[]>([]);
  const [pendingToolItem, setPendingToolItem] = useState<any>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Durum | null>(null);
  const [pageError, setPageError] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounter = useRef(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  useBildirimler(tasks);

  const pushToast = useCallback((type: Toast["type"], text: string) => {
    const id = ++toastCounter.current;
    setToasts((current) => [...current.slice(-2), { id, type, text }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 3600);
  }, []);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const savedProject = window.localStorage.getItem("tooldur_pm_active_project");
      const savedTab = window.localStorage.getItem("tooldur_pm_tab") as Sekme | null;
      const savedCompact = window.localStorage.getItem("tooldur_pm_compact") === "1";
      if (savedProject) setActiveProjectId(savedProject);
      if (savedTab && ["kanban", "liste", "takvim", "analiz"].includes(savedTab)) setTab(savedTab);
      setCompact(savedCompact);
      const pending = window.localStorage.getItem("tooldur_pending_project_item");
      if (pending) setPendingToolItem(JSON.parse(pending));
    } catch {
      window.localStorage.removeItem("tooldur_pending_project_item");
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("tooldur_pm_tab", tab);
    window.localStorage.setItem("tooldur_pm_compact", compact ? "1" : "0");
    if (activeProjectId) window.localStorage.setItem("tooldur_pm_active_project", activeProjectId);
  }, [activeProjectId, compact, hydrated, tab]);

  useEffect(() => {
    if (!user?.uid) return;
    setProjectsLoading(true);
    setPageError("");
    const unsubscribe = projeleriDinle(
      user.uid,
      (rows) => {
        setProjects(rows);
        setActiveProjectId((current) => {
          if (current && rows.some((project) => project.id === current)) return current;
          return rows[0]?.id ?? "";
        });
        setProjectsLoading(false);
      },
      (error) => {
        setProjectsLoading(false);
        setPageError(normalizeError(error, "Projeler yüklenemedi."));
      },
    );
    return () => unsubscribe?.();
  }, [user?.uid]);

  useEffect(() => {
    if (!activeProjectId) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }
    setTasksLoading(true);
    const unsubscribe = gorevleriDinle(
      activeProjectId,
      (rows) => {
        setTasks(rows);
        setSelectedTask((current) => current ? rows.find((task) => task.id === current.id) ?? null : null);
        setTasksLoading(false);
      },
      (error) => {
        setTasksLoading(false);
        setPageError(normalizeError(error, "Görevler yüklenemedi."));
      },
    );
    return () => unsubscribe?.();
  }, [activeProjectId]);

  useEffect(() => {
    if (!user?.email) return;
    bekleyenDavetleriGetir(user.email).then(setPendingInvites).catch(() => setPendingInvites([]));
  }, [projects.length, user?.email]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.getElementById("pm-global-search")?.focus();
      }
      if (!typing && (event.ctrlKey || event.metaKey) && event.key === "Enter" && activeProjectId) {
        event.preventDefault();
        setTaskModalStatus("yapilacak");
      }
      if (!typing && event.key.toLowerCase() === "f") setFiltersOpen((current) => !current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeProjectId]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setNotificationOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId) ?? null, [activeProjectId, projects]);

  const projectMembers = useMemo(() => {
    if (!user || !activeProject) return activeProject?.uyeler ?? [];
    const all = [...(activeProject.uyeler ?? [])];
    if (!all.some((member) => member.uid === user.uid)) {
      all.unshift({ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, rol: activeProject.sahipUid === user.uid ? "sahip" : "uye" });
    }
    return Array.from(new Map(all.map((member) => [member.uid, member])).values());
  }, [activeProject, user]);

  const notifications: InAppBildirim[] = useMemo(() => gorevBildirimleriniHesapla(tasks), [tasks]);

  const summary = useMemo(() => {
    const completed = tasks.filter((task) => task.durum === "tamamlandi").length;
    const today = tasks.filter((task) => task.durum !== "tamamlandi" && isToday(task)).length;
    const overdue = tasks.filter(isOverdue).length;
    return { total: tasks.length, completed, today, overdue, progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0 };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("tr-TR");
    const filtered = tasks.filter((task) => {
      const searchOk = !needle || [task.baslik, task.aciklama, ...(task.etiketler ?? []), ...(task.atananlar ?? []).map((member) => `${member.displayName} ${member.email}`)].join(" ").toLocaleLowerCase("tr-TR").includes(needle);
      const priorityOk = priorityFilter === "tum" || task.oncelik === priorityFilter;
      const memberOk = memberFilter === "tum" || (task.atananlar ?? []).some((member) => member.uid === memberFilter);
      const quickOk = quickFilter === "tum"
        || (quickFilter === "acik" && task.durum !== "tamamlandi")
        || (quickFilter === "bugun" && task.durum !== "tamamlandi" && isToday(task))
        || (quickFilter === "geciken" && isOverdue(task))
        || (quickFilter === "tamamlanan" && task.durum === "tamamlandi");
      return searchOk && priorityOk && memberOk && quickOk;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "termin") {
        const aTime = parseDateOnly(a.termin)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bTime = parseDateOnly(b.termin)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      }
      if (sort === "oncelik") return PRIORITY_SCORE[b.oncelik] - PRIORITY_SCORE[a.oncelik];
      if (sort === "baslik") return a.baslik.localeCompare(b.baslik, "tr");
      return new Date(b.olusturmaTarih).getTime() - new Date(a.olusturmaTarih).getTime();
    });
  }, [memberFilter, priorityFilter, quickFilter, search, sort, tasks]);

  const runAction = useCallback(async (action: () => Promise<void>, successMessage: string, fallbackError: string) => {
    setPageError("");
    try {
      await action();
      pushToast("success", successMessage);
    } catch (error) {
      const message = normalizeError(error, fallbackError);
      setPageError(message);
      pushToast("error", message);
      throw error;
    }
  }, [pushToast]);

  const createProject = async (payload: { ad: string; aciklama: string; renk: string; emoji: string }) => {
    if (!user) return;
    await runAction(async () => {
      const row = await projeEkle(user.uid, { ...payload, sahipUid: user.uid });
      if (row?.id) setActiveProjectId(row.id);
    }, "Proje oluşturuldu.", "Proje oluşturulamadı.");
  };

  const updateProject = async (payload: { ad: string; aciklama: string; renk: string; emoji: string }) => {
    if (!activeProject) return;
    await runAction(async () => {
      await projeGuncelle(activeProject.id, payload);
      setProjects((current) => current.map((project) => project.id === activeProject.id ? { ...project, ...payload } : project));
    }, "Proje güncellendi.", "Proje güncellenemedi.");
  };

  const deleteProject = async () => {
    if (!activeProject || activeProject.sahipUid !== user?.uid) return;
    if (!window.confirm(`"${activeProject.ad}" projesi ve içindeki görevler silinsin mi?`)) return;
    await runAction(async () => {
      await projeSil(activeProject.id);
      setActiveProjectId("");
    }, "Proje silindi.", "Proje silinemedi.");
  };

  const createTask = async (form: GorevForm) => {
    if (!user || !activeProjectId) return;
    await runAction(async () => {
      await gorevEkle(
        user.uid,
        activeProjectId,
        {
          baslik: form.baslik,
          aciklama: form.aciklama,
          durum: form.durum,
          oncelik: form.oncelik,
          termin: form.termin,
          etiketler: Array.from(new Set(form.etiketler.split(",").map((item) => item.trim().toLocaleLowerCase("tr-TR")).filter(Boolean))),
          checklistler: [],
          atananlar: form.atananlar,
        },
        { actorAd: user.displayName, actorFoto: user.photoURL },
      );
    }, "Görev oluşturuldu.", "Görev oluşturulamadı.");
  };

  const deleteTask = async (id: string) => {
    await runAction(async () => {
      await gorevSil(id);
      if (selectedTask?.id === id) setSelectedTask(null);
    }, "Görev silindi.", "Görev silinemedi.");
  };

  const moveTask = async (id: string, status: Durum) => {
    const current = tasks.find((task) => task.id === id);
    if (!current || current.durum === status) return;
    setTasks((rows) => rows.map((task) => task.id === id ? { ...task, durum: status } : task));
    try {
      await gorevGuncelle(id, { durum: status });
    } catch (error) {
      setTasks((rows) => rows.map((task) => task.id === id ? { ...task, durum: current.durum } : task));
      const message = normalizeError(error, "Görev durumu güncellenemedi.");
      setPageError(message);
      pushToast("error", message);
    }
  };

  const inviteMember = async (email: string) => {
    if (!activeProject) return;
    await uyeDavetEt(activeProject.id, email);
    setProjects((current) => current.map((project) => project.id === activeProject.id ? { ...project, davetliler: Array.from(new Set([...(project.davetliler ?? []), email])) } : project));
    pushToast("success", "Davet kaydedildi.");
  };

  const removeMember = async (member: UyeRef) => {
    if (!activeProject) return;
    await projeUyeKaldir(activeProject.id, member.uid);
    setProjects((current) => current.map((project) => project.id === activeProject.id ? { ...project, uyeler: (project.uyeler ?? []).filter((item) => item.uid !== member.uid) } : project));
    pushToast("success", "Üye projeden çıkarıldı.");
  };

  const cancelInvite = async (email: string) => {
    if (!activeProject) return;
    await projeDavetIptalEt(activeProject.id, email);
    setProjects((current) => current.map((project) => project.id === activeProject.id ? { ...project, davetliler: (project.davetliler ?? []).filter((item) => item !== email) } : project));
    pushToast("success", "Davet iptal edildi.");
  };

  const savePendingTool = async () => {
    if (!pendingToolItem || !activeProjectId || !user) return;
    await runAction(async () => {
      await gorevEkle(
        user.uid,
        activeProjectId,
        {
          baslik: pendingToolItem.toolName || "Tooldur hesap kaydı",
          aciklama: `${pendingToolItem.note || pendingToolItem.summary || "Tooldur araç kaydı"}\n\nBağlantı: ${pendingToolItem.url || ""}`.trim(),
          durum: "yapilacak",
          oncelik: "orta",
          termin: "",
          etiketler: ["tooldur", "hesap", String(pendingToolItem.category || "teknik").toLocaleLowerCase("tr-TR")],
          checklistler: [],
          atananlar: [],
        },
        { actorAd: user.displayName, actorFoto: user.photoURL },
      );
      window.localStorage.removeItem("tooldur_pending_project_item");
      setPendingToolItem(null);
    }, "Hesap kaydı göreve dönüştürüldü.", "Hesap kaydı projeye aktarılamadı.");
  };

  if (!hydrated || authLoading) {
    return <div className="pm-root pm-loading-screen"><div className="pm-loading-card">Proje yönetimi hazırlanıyor…</div></div>;
  }

  if (!user) return <AuthEkrani />;

  return (
    <div className="pm-root">
      <div className="pm-app">
        <aside className="pm-sidebar">
          <div className="pm-brand">
            <div className="pm-brand-mark">T</div>
            <div className="pm-brand-copy"><strong>Tooldur</strong><span>Proje Yönetimi</span></div>
          </div>

          <div className="pm-sidebar-scroll">
            <section className="pm-sidebar-section">
              <div className="pm-section-label">Projeler</div>
              <div className="pm-project-list">
                {projects.map((project) => (
                  <button key={project.id} type="button" className={`pm-project-button ${project.id === activeProjectId ? "is-active" : ""}`} onClick={() => setActiveProjectId(project.id)}>
                    <span className="pm-project-icon">{project.emoji || "P"}</span>
                    <span className="pm-project-copy"><strong>{project.ad}</strong><span>{project.uyeler?.length || (project.sahipUid === user.uid ? 1 : 0)} üye · {project.id === activeProjectId ? `${summary.total} görev` : "Açmak için seç"}</span></span>
                    <span className="pm-project-accent" style={{ background: project.renk || "var(--pm-yellow)" }} />
                  </button>
                ))}
              </div>
              {!projectsLoading && !projects.length && <div className="pm-sidebar-empty">Henüz proje yok. İlk projeyi oluşturarak görev takibine başlayabilirsin.</div>}
            </section>

            <section className="pm-sidebar-section pm-sidebar-actions">
              <button type="button" className="pm-button is-primary is-block" onClick={() => setProjectModal("create")}><Plus size={15} />Yeni proje</button>
              <button type="button" className="pm-button is-block" disabled={!activeProject} onClick={() => setTeamModalOpen(true)}><Users size={15} />Takım</button>
              <button type="button" className="pm-button is-block" disabled={!activeProject || activeProject.sahipUid !== user.uid} onClick={() => setProjectModal("edit")}><Settings size={15} />Proje ayarları</button>
            </section>
          </div>

          <div className="pm-sidebar-footer">
            <div className="pm-user-block">
              <Avatar uye={{ uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL }} size={34} />
              <div className="pm-user-copy"><strong>{user.displayName || "Kullanıcı"}</strong><span>{user.email}</span></div>
              <button type="button" className="pm-icon-button" onClick={() => cikisYap()} title="Çıkış yap"><LogOut size={15} /></button>
            </div>
          </div>
        </aside>

        <section className="pm-workspace">
          <header className="pm-topbar">
            <select className="pm-mobile-project-select" value={activeProjectId} onChange={(event) => setActiveProjectId(event.target.value)} aria-label="Aktif proje">
              <option value="">Proje seç</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.ad}</option>)}
            </select>

            <div className="pm-title-area">
              <div className="pm-breadcrumb"><FolderKanban size={12} />Proje Yönetimi</div>
              <div className="pm-title-line"><h1>{activeProject?.ad || "Projeler"}</h1>{activeProject && <span>{summary.progress}% tamamlandı</span>}</div>
            </div>

            <div className="pm-top-actions">
              <div className="pm-notification-wrap" ref={notificationRef}>
                <button type="button" className="pm-icon-button" onClick={() => setNotificationOpen((current) => !current)} aria-label="Bildirimler">
                  <Bell size={17} />
                  {!!notifications.length && <span className="pm-notification-badge">{Math.min(notifications.length, 99)}</span>}
                </button>
                {notificationOpen && (
                  <div className="pm-dropdown">
                    <div className="pm-dropdown-head">Bildirimler</div>
                    {notifications.length ? notifications.slice(0, 10).map((notification) => (
                      <div className="pm-notification-item" key={notification.id}>
                        <span className="pm-avatar" style={{ width: 28, height: 28 }}><Bell size={13} /></span>
                        <div><strong>{notification.metin}</strong><span>{notification.tarih.toLocaleString("tr-TR")}</span></div>
                      </div>
                    )) : <div className="pm-empty-state" style={{ border: 0, borderRadius: 0 }}><div><strong>Bildirim yok</strong><span>Yaklaşan veya geciken görev bulunmuyor.</span></div></div>}
                  </div>
                )}
              </div>
              <button type="button" className="pm-button" disabled={!activeProject} onClick={() => setTeamModalOpen(true)}><Users size={15} /><span>Takım</span></button>
              <button type="button" className="pm-button" disabled={!activeProject || activeProject.sahipUid !== user.uid} onClick={() => setProjectModal("edit")}><Settings size={15} /><span>Ayarlar</span></button>
              <button type="button" className="pm-button is-primary" disabled={!activeProject} onClick={() => setTaskModalStatus("yapilacak")}><Plus size={15} /><span>Yeni görev</span></button>
            </div>
          </header>

          <div className="pm-content">
            {pageError && <div className="pm-error-banner"><span>{pageError}</span><button type="button" className="pm-task-mini" onClick={() => setPageError("")}><X size={14} /></button></div>}

            {pendingInvites.map((invite) => (
              <section key={`${invite.proje_id}-${invite.email}`} className="pm-invite-banner">
                <div className="pm-banner-copy"><strong>{invite.proje_emoji} {invite.proje_adi} projesine davet</strong><span>{invite.davet_eden || "Bir kullanıcı"} seni bu projeye eklemek istiyor.</span></div>
                <div className="pm-banner-actions">
                  <button type="button" className="pm-button" onClick={async () => { await davetiReddet(invite.proje_id, invite.email); setPendingInvites((current) => current.filter((item) => item !== invite)); pushToast("success", "Davet reddedildi."); }}>Reddet</button>
                  <button type="button" className="pm-button is-primary" onClick={async () => { await davetiKabulEt(invite.proje_id, user.uid, invite.email, user.displayName); setPendingInvites((current) => current.filter((item) => item !== invite)); pushToast("success", "Projeye katıldın."); }}>Katıl</button>
                </div>
              </section>
            ))}

            {activeProject ? (
              <>
                <section className="pm-project-strip" style={{ borderLeftColor: activeProject.renk || "var(--pm-yellow)" }}>
                  <div className="pm-project-strip-main">
                    <div className="pm-project-strip-icon">{activeProject.emoji || "P"}</div>
                    <div className="pm-project-strip-copy"><strong>{activeProject.ad}</strong><span>{activeProject.aciklama || "Proje açıklaması eklenmemiş."}</span></div>
                  </div>
                  <div className="pm-progress-group">
                    <div className="pm-progress-label"><span>{summary.completed}/{summary.total} görev tamamlandı</span><b>%{summary.progress}</b></div>
                    <div className="pm-progress-track"><span style={{ width: `${summary.progress}%`, background: activeProject.renk || "var(--pm-yellow)" }} /></div>
                  </div>
                </section>

                {pendingToolItem && (
                  <section className="pm-transfer-banner">
                    <div className="pm-banner-copy"><strong>Tooldur hesabını projeye aktar</strong><span>{pendingToolItem.toolName || "Hesaplama kaydı"} aktif projede görev olarak kaydedilecek.</span></div>
                    <div className="pm-banner-actions"><button type="button" className="pm-button is-primary" onClick={savePendingTool}>Göreve dönüştür</button><button type="button" className="pm-button" onClick={() => { window.localStorage.removeItem("tooldur_pending_project_item"); setPendingToolItem(null); }}>Vazgeç</button></div>
                  </section>
                )}

                <section className="pm-metrics">
                  <Metric label="Toplam görev" value={summary.total} icon={<ListTodo size={16} />} />
                  <Metric label="Bugün teslim" value={summary.today} icon={<Clock3 size={16} />} />
                  <Metric label="Geciken" value={summary.overdue} icon={<AlertTriangle size={16} />} danger={summary.overdue > 0} />
                  <Metric label="Tamamlanan" value={summary.completed} icon={<CheckCircle2 size={16} />} />
                </section>

                <section className="pm-viewbar">
                  <div className="pm-tabs" role="tablist" aria-label="Proje görünümü">
                    {([
                      ["kanban", "Kanban", <LayoutDashboard key="kanban" size={14} />],
                      ["liste", "Liste", <ListTodo key="liste" size={14} />],
                      ["takvim", "Takvim", <CalendarDays key="takvim" size={14} />],
                      ["analiz", "Analiz", <BarChart3 key="analiz" size={14} />],
                    ] as const).map(([id, label, icon]) => (
                      <button key={id} type="button" className={`pm-tab ${tab === id ? "is-active" : ""}`} onClick={() => setTab(id)} role="tab" aria-selected={tab === id}>{icon}{label}</button>
                    ))}
                  </div>

                  <label className="pm-search">
                    <Search size={15} />
                    <input id="pm-global-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Görev, açıklama, etiket veya kişi ara" />
                    <kbd>Ctrl K</kbd>
                  </label>

                  <div className="pm-view-actions">
                    <button type="button" className={`pm-filter-chip ${filtersOpen ? "is-active" : ""}`} onClick={() => setFiltersOpen((current) => !current)}><SlidersHorizontal size={14} />Filtre</button>
                    <button type="button" className={`pm-filter-chip ${compact ? "is-active" : ""}`} onClick={() => setCompact((current) => !current)}><ListFilter size={14} />{compact ? "Rahat" : "Kompakt"}</button>
                  </div>
                </section>

                {filtersOpen && (
                  <section className="pm-filters">
                    <div className="pm-filter-group">
                      <span className="pm-filter-caption">Göster</span>
                      {([
                        ["tum", "Tümü"],
                        ["acik", "Açık"],
                        ["bugun", "Bugün"],
                        ["geciken", "Geciken"],
                        ["tamamlanan", "Tamamlanan"],
                      ] as const).map(([id, label]) => <button key={id} type="button" className={`pm-filter-chip ${quickFilter === id ? "is-active" : ""}`} onClick={() => setQuickFilter(id)}>{label}</button>)}
                    </div>
                    <div className="pm-filter-spacer" />
                    <select className="pm-select is-compact" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as Oncelik | "tum")} aria-label="Öncelik filtresi">
                      <option value="tum">Tüm öncelikler</option><option value="dusuk">Düşük</option><option value="orta">Orta</option><option value="yuksek">Yüksek</option>
                    </select>
                    <select className="pm-select is-compact" value={memberFilter} onChange={(event) => setMemberFilter(event.target.value)} aria-label="Üye filtresi">
                      <option value="tum">Tüm sorumlular</option>{projectMembers.map((member) => <option key={member.uid} value={member.uid}>{member.displayName || member.email}</option>)}
                    </select>
                    <select className="pm-select is-compact" value={sort} onChange={(event) => setSort(event.target.value as Siralama)} aria-label="Sıralama">
                      <option value="olusturma">Yeni oluşturulan</option><option value="termin">En yakın termin</option><option value="oncelik">Öncelik</option><option value="baslik">Başlık A-Z</option>
                    </select>
                    {(search || quickFilter !== "tum" || priorityFilter !== "tum" || memberFilter !== "tum" || sort !== "olusturma") && <button type="button" className="pm-button is-small is-quiet" onClick={() => { setSearch(""); setQuickFilter("tum"); setPriorityFilter("tum"); setMemberFilter("tum"); setSort("olusturma"); }}><X size={13} />Temizle</button>}
                  </section>
                )}

                {tasksLoading ? (
                  <div className="pm-empty-state" style={{ marginTop: 12 }}><div><strong>Görevler yükleniyor</strong><span>Aktif proje verileri hazırlanıyor.</span></div></div>
                ) : tab === "kanban" ? (
                  <div className="pm-board-wrap">
                    <div className="pm-mobile-board-note">Kolonlar arasında yatay kaydırabilir, durum menüsünden görevi taşıyabilirsin.</div>
                    <section className={`pm-board ${compact ? "is-compact" : ""}`}>
                      {KOLONLAR.map((column) => {
                        const columnTasks = filteredTasks.filter((task) => task.durum === column.id);
                        return (
                          <section
                            key={column.id}
                            className={`pm-column ${dragOverStatus === column.id ? "is-drag-over" : ""}`}
                            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDragOverStatus(column.id); }}
                            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragOverStatus(null); }}
                            onDrop={(event) => { event.preventDefault(); const id = event.dataTransfer.getData("text/plain"); setDragOverStatus(null); if (id) moveTask(id, column.id); }}
                          >
                            <header className="pm-column-head">
                              <div className="pm-column-title"><span style={{ background: column.renk }} /><strong>{column.label}</strong><span className="pm-column-count">{columnTasks.length}</span></div>
                              <button type="button" className="pm-column-add" onClick={() => setTaskModalStatus(column.id)} title={`${column.label} kolonuna görev ekle`}><Plus size={14} /></button>
                            </header>
                            <div className="pm-column-body">
                              {columnTasks.length ? columnTasks.map((task) => <TaskCard key={task.id} gorev={task} onOpen={setSelectedTask} onDelete={deleteTask} onStatusChange={moveTask} />) : <EmptyState title="Görev yok" text="Bu kolona yeni görev ekleyebilirsin." />}
                            </div>
                          </section>
                        );
                      })}
                    </section>
                  </div>
                ) : tab === "liste" ? (
                  <ListView tasks={filteredTasks} onOpen={setSelectedTask} onDelete={deleteTask} />
                ) : tab === "takvim" ? (
                  <CalendarView tasks={filteredTasks} onOpen={setSelectedTask} />
                ) : (
                  <AnalysisView tasks={filteredTasks} />
                )}
              </>
            ) : projectsLoading ? (
              <EmptyState title="Projeler yükleniyor" text="Kayıtlı projelerin hazırlanıyor." />
            ) : (
              <EmptyState title="Bir proje seç" text="Soldaki listeden proje seç veya yeni bir proje oluştur." action={<button type="button" className="pm-button is-primary" onClick={() => setProjectModal("create")}><Plus size={15} />Yeni proje</button>} />
            )}
          </div>
        </section>
      </div>

      <button type="button" className="pm-mobile-add" disabled={!activeProject} onClick={() => setTaskModalStatus("yapilacak")} aria-label="Yeni görev"><Plus size={22} /></button>

      {projectModal === "create" && <ProjectModal onClose={() => setProjectModal(null)} onSave={createProject} />}
      {projectModal === "edit" && activeProject && <ProjectModal project={activeProject} onClose={() => setProjectModal(null)} onSave={updateProject} onDelete={async () => { await deleteProject(); setProjectModal(null); }} />}
      {taskModalStatus && activeProject && <TaskCreateModal members={projectMembers} initialStatus={taskModalStatus} onClose={() => setTaskModalStatus(null)} onSave={createTask} />}
      {teamModalOpen && activeProject && <TeamModal project={activeProject} currentUserId={user.uid} members={projectMembers} onClose={() => setTeamModalOpen(false)} onInvite={inviteMember} onRemoveMember={removeMember} onCancelInvite={cancelInvite} />}
      {selectedTask && activeProject && (
        <GorevDetayModal
          gorev={selectedTask}
          projeId={activeProject.id}
          sahipUid={activeProject.sahipUid}
          uyeler={projectMembers}
          benimUid={user.uid}
          benimAd={user.displayName}
          benimFoto={user.photoURL}
          onKapat={() => setSelectedTask(null)}
        />
      )}

      <div className="pm-toast-region" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`pm-toast is-${toast.type}`}>
            {toast.type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            <span>{toast.text}</span>
            <button type="button" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}><X size={13} /></button>
          </div>
        ))}
      </div>

    </div>
  );
}
