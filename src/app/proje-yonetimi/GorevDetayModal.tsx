"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Check,
  CheckSquare,
  Clock,
  File as FileIcon,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  dosyaYukle,
  ekSilVeLogla,
  gorevAktivitesiEkle,
  gorevAktiviteleriniDinle,
  gorevGuncelle,
  yorumEkle,
} from "@/lib/pm-db-supabase";
import { KOLONLAR, ONCELIK_MAP } from "./pm-constants";
import type { CheckItem, Ek, Gorev, PmAktivite, UyeRef, Yorum } from "./pm-types";

interface Props {
  gorev: Gorev;
  projeId: string;
  sahipUid: string;
  uyeler: UyeRef[];
  benimUid: string;
  benimAd: string;
  benimFoto?: string;
  onKapat: () => void;
}

function normalizeError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

function PersonAvatar({ name, photo, size = 32 }: { name: string; photo?: string; size?: number }) {
  const fallback = (name || "?").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return (
    <span className="pm-avatar" style={{ width: size, height: size, fontSize: Math.max(8, size * .3) }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" loading="lazy" />
      ) : fallback}
    </span>
  );
}

function formatTimestamp(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function GorevDetayModal({
  gorev,
  projeId,
  sahipUid,
  uyeler,
  benimUid,
  benimAd,
  benimFoto,
  onKapat,
}: Props) {
  const assignedToMe = (gorev.atananlar ?? []).some((member) => member.uid === benimUid);
  const authorized = benimUid === sahipUid || assignedToMe;

  const [title, setTitle] = useState(gorev.baslik);
  const [description, setDescription] = useState(gorev.aciklama ?? "");
  const [status, setStatus] = useState(gorev.durum);
  const [priority, setPriority] = useState(gorev.oncelik);
  const [dueDate, setDueDate] = useState(gorev.termin ?? "");
  const [assignees, setAssignees] = useState<UyeRef[]>(gorev.atananlar ?? []);
  const [tags, setTags] = useState<string[]>(gorev.etiketler ?? []);
  const [newTag, setNewTag] = useState("");
  const [checklist, setChecklist] = useState<CheckItem[]>(gorev.checklistler ?? []);
  const [newCheck, setNewCheck] = useState("");
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<Ek[]>(gorev.ekler ?? []);
  const [comments, setComments] = useState<Yorum[]>(gorev.yorumlar ?? []);
  const [activities, setActivities] = useState<PmAktivite[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [commentSending, setCommentSending] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(gorev.baslik);
    setDescription(gorev.aciklama ?? "");
    setStatus(gorev.durum);
    setPriority(gorev.oncelik);
    setDueDate(gorev.termin ?? "");
    setAssignees(gorev.atananlar ?? []);
    setTags(gorev.etiketler ?? []);
    setChecklist(gorev.checklistler ?? []);
    setFiles(gorev.ekler ?? []);
    setComments(gorev.yorumlar ?? []);
  }, [gorev]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving && !uploading) onKapat();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onKapat, saving, uploading]);

  useEffect(() => {
    const unsubscribe = gorevAktiviteleriniDinle(gorev.id, setActivities);
    return () => unsubscribe?.();
  }, [gorev.id]);

  const completion = useMemo(() => checklist.length ? Math.round((checklist.filter((item) => item.tamamlandi).length / checklist.length) * 100) : 0, [checklist]);

  const logActivity = async (tip: PmAktivite["tip"], text: string) => {
    await gorevAktivitesiEkle({
      projeId,
      gorevId: gorev.id,
      tip,
      aciklama: text,
      actorUid: benimUid,
      actorAd: benimAd,
      actorFoto: benimFoto,
    });
  };

  const save = async () => {
    if (!authorized || !title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const changed: string[] = [];
      if (gorev.baslik !== title.trim()) changed.push("başlık");
      if ((gorev.aciklama ?? "") !== description.trim()) changed.push("açıklama");
      if (gorev.durum !== status) changed.push("durum");
      if (gorev.oncelik !== priority) changed.push("öncelik");
      if ((gorev.termin ?? "") !== dueDate) changed.push("termin");
      if (JSON.stringify(gorev.etiketler ?? []) !== JSON.stringify(tags)) changed.push("etiketler");
      if (JSON.stringify((gorev.atananlar ?? []).map((item) => item.uid).sort()) !== JSON.stringify(assignees.map((item) => item.uid).sort())) changed.push("sorumlular");

      await gorevGuncelle(gorev.id, {
        baslik: title.trim(),
        aciklama: description.trim(),
        durum: status,
        oncelik: priority,
        termin: dueDate,
        atananlar: assignees,
        etiketler: tags,
        checklistler: checklist,
      });

      if (gorev.durum !== status) {
        const oldStatus = KOLONLAR.find((item) => item.id === gorev.durum)?.label ?? gorev.durum;
        const newStatus = KOLONLAR.find((item) => item.id === status)?.label ?? status;
        await logActivity("durum_degisti", `Durum değişti: ${oldStatus} → ${newStatus}`);
      } else if (changed.length) {
        await logActivity("gorev_guncellendi", `Görev güncellendi: ${changed.join(", ")}`);
      }
      onKapat();
    } catch (err) {
      setError(normalizeError(err, "Görev kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  };

  const persistChecklist = async (next: CheckItem[], activityText: string) => {
    setChecklist(next);
    try {
      await gorevGuncelle(gorev.id, { checklistler: next });
      await logActivity("checklist_degisti", activityText);
    } catch (err) {
      setChecklist(checklist);
      setError(normalizeError(err, "Checklist güncellenemedi."));
    }
  };

  const addCheck = async () => {
    const text = newCheck.trim();
    if (!authorized || !text) return;
    const item: CheckItem = { id: crypto.randomUUID(), metin: text, tamamlandi: false };
    setNewCheck("");
    await persistChecklist([...checklist, item], `Checklist maddesi eklendi: ${text}`);
  };

  const toggleCheck = async (id: string) => {
    if (!authorized) return;
    const target = checklist.find((item) => item.id === id);
    const next = checklist.map((item) => item.id === id ? { ...item, tamamlandi: !item.tamamlandi } : item);
    await persistChecklist(next, target ? `Checklist güncellendi: ${target.metin}` : "Checklist güncellendi");
  };

  const removeCheck = async (id: string) => {
    if (!authorized) return;
    const target = checklist.find((item) => item.id === id);
    await persistChecklist(checklist.filter((item) => item.id !== id), target ? `Checklist maddesi silindi: ${target.metin}` : "Checklist maddesi silindi");
  };

  const toggleAssignee = async (member: UyeRef) => {
    if (!authorized) return;
    const exists = assignees.some((item) => item.uid === member.uid);
    const next = exists ? assignees.filter((item) => item.uid !== member.uid) : [...assignees, member];
    setAssignees(next);
    try {
      await gorevGuncelle(gorev.id, { atananlar: next });
      await logActivity("gorev_guncellendi", exists ? `${member.displayName || member.email} görevden çıkarıldı` : `${member.displayName || member.email} göreve atandı`);
    } catch (err) {
      setAssignees(assignees);
      setError(normalizeError(err, "Sorumlu listesi güncellenemedi."));
    }
  };

  const addTag = () => {
    if (!authorized) return;
    const tag = newTag.trim().toLocaleLowerCase("tr-TR").replace(/^#/, "");
    if (!tag || tags.includes(tag)) {
      setNewTag("");
      return;
    }
    setTags([...tags, tag]);
    setNewTag("");
  };

  const sendComment = async () => {
    const text = comment.trim();
    if (!authorized || !text || commentSending) return;
    setCommentSending(true);
    setError("");
    const optimistic: Yorum = {
      id: crypto.randomUUID(),
      metin: text,
      yazarUid: benimUid,
      yazarAd: benimAd,
      yazarFoto: benimFoto,
      tarih: new Date().toISOString(),
    };
    try {
      await yorumEkle(gorev.id, benimUid, benimAd, benimFoto, text, projeId);
      setComments((current) => [...current, optimistic]);
      setComment("");
    } catch (err) {
      setError(normalizeError(err, "Yorum gönderilemedi."));
    } finally {
      setCommentSending(false);
    }
  };

  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!authorized || !file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Maksimum dosya boyutu 10 MB.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const uploaded = await dosyaYukle(
        gorev.id,
        benimUid,
        file,
        setUploadProgress,
        { projeId, actorAd: benimAd, actorFoto: benimFoto },
      );
      setFiles((current) => [...current, uploaded]);
    } catch (err) {
      setError(normalizeError(err, "Dosya yüklenemedi."));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = async (file: Ek) => {
    if (!authorized || !window.confirm(`"${file.ad}" silinsin mi?`)) return;
    setError("");
    try {
      await ekSilVeLogla({
        ekId: file.id,
        url: file.url,
        projeId,
        gorevId: gorev.id,
        actorUid: benimUid,
        actorAd: benimAd,
        actorFoto: benimFoto,
        dosyaAdi: file.ad,
      });
      setFiles((current) => current.filter((item) => item.id !== file.id));
    } catch (err) {
      setError(normalizeError(err, "Dosya silinemedi."));
    }
  };

  return (
    <div className="pmd-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !saving && onKapat()}>
      <section className="pmd-shell" role="dialog" aria-modal="true" aria-label="Görev detayları">
        <header className="pmd-header">
          <input className="pmd-title-input" value={title} onChange={(event) => authorized && setTitle(event.target.value)} readOnly={!authorized} maxLength={160} aria-label="Görev başlığı" />
          <button type="button" className="pm-icon-button" onClick={onKapat} disabled={saving || uploading} aria-label="Görev detayını kapat"><X size={17} /></button>
        </header>

        <div className="pmd-layout">
          <div className="pmd-main">
            {error && <div className="pm-error-banner" style={{ marginBottom: 14 }}><span>{error}</span><button type="button" className="pm-task-mini" onClick={() => setError("")}><X size={13} /></button></div>}

            <section className="pmd-section">
              <div className="pmd-section-head"><strong>Açıklama</strong>{!authorized && <span>Salt okunur</span>}</div>
              <textarea className="pm-textarea" rows={5} value={description} onChange={(event) => authorized && setDescription(event.target.value)} readOnly={!authorized} placeholder="Görev açıklaması" />
            </section>

            <section className="pmd-section">
              <div className="pmd-section-head"><strong><CheckSquare size={14} />Checklist</strong><span>%{completion}</span></div>
              <div className="pmd-progress"><span style={{ width: `${completion}%` }} /></div>
              <div className="pmd-checklist" style={{ marginTop: 9 }}>
                {!checklist.length && <div className="pm-empty-state" style={{ border: 0, borderRadius: 0, padding: 18 }}><div><strong>Checklist boş</strong><span>Görevin alt adımlarını ekleyebilirsin.</span></div></div>}
                {checklist.map((item) => (
                  <div key={item.id} className={`pmd-check-row ${item.tamamlandi ? "is-done" : ""}`}>
                    <button type="button" className="pm-task-mini" disabled={!authorized} onClick={() => toggleCheck(item.id)} aria-label={item.tamamlandi ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}>{item.tamamlandi ? <Check size={14} /> : <span style={{ width: 12, height: 12, border: "1px solid var(--pm-border-strong)", borderRadius: 3 }} />}</button>
                    <label>{item.metin}</label>
                    {authorized && <button type="button" className="pm-task-mini" onClick={() => removeCheck(item.id)} aria-label="Checklist maddesini sil"><Trash2 size={13} /></button>}
                  </div>
                ))}
              </div>
              {authorized && (
                <div className="pmd-inline-form" style={{ marginTop: 8 }}>
                  <input className="pm-input" value={newCheck} onChange={(event) => setNewCheck(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCheck(); } }} placeholder="Yeni checklist maddesi" />
                  <button type="button" className="pm-button" onClick={addCheck}><Plus size={14} />Ekle</button>
                </div>
              )}
            </section>

            <section className="pmd-section">
              <div className="pmd-section-head"><strong><Paperclip size={14} />Dosyalar</strong><span>Maksimum 10 MB</span></div>
              {authorized && (
                <>
                  <input ref={fileInputRef} type="file" hidden onChange={uploadFile} />
                  <button type="button" className="pm-button" disabled={uploading} onClick={() => fileInputRef.current?.click()}><Upload size={14} />{uploading ? `Yükleniyor %${uploadProgress}` : "Dosya yükle"}</button>
                  {uploading && <div className="pmd-progress" style={{ marginTop: 8 }}><span style={{ width: `${uploadProgress}%` }} /></div>}
                </>
              )}
              <div className="pmd-files" style={{ marginTop: 9 }}>
                {files.map((file) => (
                  <div key={file.id} className="pmd-file">
                    <span className="pm-avatar" style={{ width: 32, height: 32 }}><FileIcon size={14} /></span>
                    <div className="pmd-file-copy"><a href={file.url} target="_blank" rel="noreferrer"><strong>{file.ad}</strong></a><span>{Math.max(1, Math.round(file.boyut / 1024))} KB · {formatTimestamp(file.tarih)}</span></div>
                    {authorized && <button type="button" className="pm-task-mini" onClick={() => removeFile(file)} aria-label="Dosyayı sil"><Trash2 size={13} /></button>}
                  </div>
                ))}
                {!files.length && !uploading && <div className="pm-help">Henüz dosya eklenmedi.</div>}
              </div>
            </section>

            <section className="pmd-section">
              <div className="pmd-section-head"><strong><MessageSquare size={14} />Yorumlar</strong><span>{comments.length}</span></div>
              <div className="pmd-comments">
                {comments.map((item) => (
                  <div key={item.id} className="pmd-comment">
                    <PersonAvatar name={item.yazarAd} photo={item.yazarFoto} />
                    <div className="pmd-comment-copy"><strong>{item.yazarAd || "Kullanıcı"}</strong><p>{item.metin}</p><span>{formatTimestamp(item.tarih)}</span></div>
                  </div>
                ))}
                {!comments.length && <div className="pm-help">Henüz yorum yok.</div>}
              </div>
              {authorized && (
                <div className="pmd-inline-form" style={{ marginTop: 9 }}>
                  <input className="pm-input" value={comment} onChange={(event) => setComment(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); sendComment(); } }} placeholder="Yorum yaz" maxLength={5000} />
                  <button type="button" className="pm-button is-primary" disabled={!comment.trim() || commentSending} onClick={sendComment}><Send size={14} />Gönder</button>
                </div>
              )}
            </section>

            <section className="pmd-section">
              <div className="pmd-section-head"><strong><Clock size={14} />Aktivite</strong><span>Son {Math.min(activities.length, 20)} kayıt</span></div>
              <div className="pmd-activity-list">
                {activities.slice(0, 20).map((activity) => (
                  <div key={activity.id} className="pmd-activity">
                    <PersonAvatar name={activity.actorAd || "Sistem"} photo={activity.actorFoto} />
                    <div className="pmd-activity-copy"><strong>{activity.actorAd || "Sistem"}</strong><span style={{ color: "var(--pm-text-2)", fontSize: 10 }}>{activity.aciklama}</span><span>{formatTimestamp(activity.createdAt)}</span></div>
                  </div>
                ))}
                {!activities.length && <div className="pm-help">Henüz aktivite kaydı yok.</div>}
              </div>
            </section>
          </div>

          <aside className="pmd-side">
            <div className="pmd-side-grid">
              <div>
                <label className="pm-label" htmlFor="pmd-status">Durum</label>
                <select id="pmd-status" className="pm-select" value={status} onChange={(event) => authorized && setStatus(event.target.value as Gorev["durum"])} disabled={!authorized}>
                  {KOLONLAR.map((column) => <option key={column.id} value={column.id}>{column.label}</option>)}
                </select>
              </div>
              <div>
                <label className="pm-label" htmlFor="pmd-priority">Öncelik</label>
                <select id="pmd-priority" className="pm-select" value={priority} onChange={(event) => authorized && setPriority(event.target.value as Gorev["oncelik"])} disabled={!authorized}>
                  {Object.entries(ONCELIK_MAP).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
                </select>
              </div>
              <div>
                <label className="pm-label" htmlFor="pmd-date">Termin</label>
                <input id="pmd-date" className="pm-input" type="date" value={dueDate} onChange={(event) => authorized && setDueDate(event.target.value)} disabled={!authorized} />
              </div>

              <div>
                <span className="pm-label">Sorumlular</span>
                <div className="pmd-assignees">
                  {uyeler.map((member) => {
                    const active = assignees.some((item) => item.uid === member.uid);
                    return (
                      <button key={member.uid} type="button" className={`pmd-assignee ${active ? "is-active" : ""}`} disabled={!authorized} onClick={() => toggleAssignee(member)}>
                        <PersonAvatar name={member.displayName || member.email} photo={member.photoURL} size={28} />
                        <span>{member.displayName || member.email}</span>
                        <span className="pm-checkmark">{active && <Check size={11} />}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="pm-label">Etiketler</span>
                <div className="pmd-tags">
                  {tags.map((tag) => (
                    <span key={tag} className="pm-tag">#{tag}{authorized && <button type="button" className="pm-task-mini" style={{ width: 18, height: 18 }} onClick={() => setTags((current) => current.filter((item) => item !== tag))}><X size={10} /></button>}</span>
                  ))}
                </div>
                {authorized && (
                  <div className="pmd-inline-form" style={{ marginTop: 7 }}>
                    <input className="pm-input" value={newTag} onChange={(event) => setNewTag(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addTag(); } }} placeholder="etiket" />
                    <button type="button" className="pm-button" onClick={addTag}><Plus size={14} /></button>
                  </div>
                )}
              </div>

              {!authorized && <div className="pm-error-banner" style={{ marginTop: 0 }}>Bu görev sana atanmadığı için düzenleme yetkin yok.</div>}

              <div className="pmd-footer">
                <button type="button" className="pm-button is-block" onClick={onKapat}>Kapat</button>
                <button type="button" className="pm-button is-primary is-block" disabled={!authorized || !title.trim() || saving || uploading} onClick={save}>{saving ? "Kaydediliyor" : "Kaydet"}</button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
