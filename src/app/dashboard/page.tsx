"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { tools } from "@/data/tools";
import {
  bekleyenDavetleriGetir,
  davetiKabulEt,
  davetiReddet,
  type BekleyenDavet,
} from "@/lib/pm-db-supabase";
import {
  ArrowRight,
  Calculator,
  Check,
  Clock,
  FolderKanban,
  GitBranch,
  Hash,
  Layers,
  Library,
  Link2,
  LogOut,
  Ruler,
  Search,
  Settings,
  StickyNote,
  BarChart3,
} from "lucide-react";
import styles from "./Dashboard.module.css";

const BRANCH_LABEL: Record<string, string> = {
  elektrik: "Elektrik & Elektronik",
  insaat: "İnşaat",
  makine: "Makine",
  mekatronik: "Mekatronik",
  bilgisayar: "Bilgisayar",
  endustri: "Endüstri",
  kimya: "Kimya",
  cevre: "Çevre",
  metalurji: "Metalurji & Malzeme",
  insaat_zemin: "Geoteknik",
  maden: "Maden",
  petrol: "Petrol & Doğalgaz",
  gemi: "Gemi & Deniz",
  havacilik: "Havacılık & Uzay",
  biyomedikal: "Biyomedikal",
  gida: "Gıda",
  tekstil: "Tekstil",
  hidrolik: "Hidrolik",
  nukleer: "Nükleer",
  diger: "Mühendis",
};

const MODULES = [
  {
    href: "/dashboard/kiris",
    icon: Ruler,
    color: "#e99500",
    badge: "Yapısal",
    label: "Kiriş Tasarım",
    desc: "IPE profil, M/V/δ diyagramları",
    visual: "/visuals/topics/tool-concrete.webp",
  },
  {
    href: "/dashboard/kolon",
    icon: Layers,
    color: "#fb923c",
    badge: "Yapısal",
    label: "Kolon Tasarım",
    desc: "HEA/HEB burkulma, λ, χ hesabı",
    visual: "/visuals/topics/category-insaat.webp",
  },
  {
    href: "/dashboard/baglanti",
    icon: Link2,
    color: "#94a3b8",
    badge: "Birleşim",
    label: "Bağlantı Detayları",
    desc: "Bulonlu ve kaynaklı birleşim",
    visual: "/visuals/topics/tool-fastener-torque.webp",
  },
  {
    href: "/dashboard/cizim",
    icon: BarChart3,
    color: "#a78bfa",
    badge: "Çizim",
    label: "Teknik Çizim",
    desc: "SVG ölçekli kesit, PNG export",
    visual: "/visuals/topics/tool-software.webp",
  },
  {
    href: "/dashboard/kutuphane",
    icon: Library,
    color: "#f59e0b",
    badge: "289 kayıt",
    label: "Malzeme Kütüphanesi",
    desc: "IPE/HEA, kablo, civata tabloları",
    visual: "/visuals/topics/tool-bearing.webp",
  },
  {
    href: "/dashboard/notlar",
    icon: StickyNote,
    color: "#e879f9",
    badge: "Not",
    label: "Mühendis Defteri",
    desc: "Markdown, formül, kategoriler",
    visual: "/visuals/topics/tool-general.webp",
  },
  {
    href: "/dashboard/gecmis",
    icon: Hash,
    color: "#34d399",
    badge: "Geçmiş",
    label: "Hesaplama Geçmişi",
    desc: "Tüm hesaplamalar kaydedilir",
    visual: "/visuals/topics/tool-units.webp",
  },

  {
    href: "/dashboard/trafik",
    icon: GitBranch,
    color: "#237849",
    badge: "Trafik",
    label: "Trafik Merkezi",
    desc: "İçerik ve arama verilerini incele",
    visual: "/visuals/topics/tool-production.webp",
  },
];

const BRANCH_QUICK: Record<string, { href: string; label: string }[]> = {
  elektrik: [
    { href: "/arac/kablo-kesiti-hesaplama", label: "Kablo Kesiti" },
    { href: "/arac/ohm-kanunu-hesaplama", label: "Ohm Kanunu" },
    { href: "/arac/guc-faktoru-duzeltme", label: "Güç Faktörü" },
    { href: "/arac/led-direnc-hesaplama", label: "LED Direnç" },
  ],
  insaat: [
    { href: "/arac/beton-miktari-hesaplama", label: "Beton" },
    { href: "/arac/demir-agirligi-hesaplama", label: "Demir Ağırlık" },
    { href: "/arac/merdiven-hesaplama", label: "Merdiven" },
    { href: "/arac/tugla-hesaplama", label: "Tuğla" },
  ],
  makine: [
    { href: "/arac/tork-hesaplama", label: "Tork" },
    { href: "/arac/disli-carki-hesaplama", label: "Dişli Çarkı" },
    { href: "/arac/yay-hesaplama", label: "Yay" },
    { href: "/arac/rulman-omru-hesaplama", label: "Rulman Ömrü" },
  ],
  diger: [
    { href: "/arac/tork-hesaplama", label: "Tork" },
    { href: "/arac/basinc-hesaplama", label: "Basınç" },
    { href: "/arac/alan-hesaplama", label: "Alan" },
    { href: "/arac/yuzde-hesaplama", label: "Yüzde" },
  ],
};

type Profile = { full_name?: string; branch?: string; title?: string };
type HistoryItem = {
  tool_name: string;
  summary: string;
  calculated_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [historyCount, setHistoryCount] = useState<number | null>(null);
  const [noteCount, setNoteCount] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [invites, setInvites] = useState<BekleyenDavet[]>([]);
  const [busyInvite, setBusyInvite] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();
        if (authError) throw authError;
        if (!session) {
          router.replace("/giris?redirect=%2Fdashboard");
          return;
        }
        if (!active) return;
        setUser(session.user);
        const [p, count, recent, notes, invitations] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name,branch,title")
            .eq("id", session.user.id)
            .maybeSingle(),
          supabase
            .from("calculation_history")
            .select("id", { count: "exact", head: true })
            .eq("user_id", session.user.id),
          supabase
            .from("calculation_history")
            .select("tool_name,summary,calculated_at")
            .eq("user_id", session.user.id)
            .order("calculated_at", { ascending: false })
            .limit(6),
          supabase
            .from("notes")
            .select("id", { count: "exact", head: true })
            .eq("user_id", session.user.id),
          session.user.email
            ? bekleyenDavetleriGetir(session.user.email)
                .then((data) => ({ data, error: null }))
                .catch((error) => ({ data: [], error }))
            : Promise.resolve({ data: [], error: null }),
        ]);
        if (!active) return;
        setProfile(p.data);
        setHistoryCount(count.error ? null : (count.count ?? 0));
        setNoteCount(notes.error ? null : (notes.count ?? 0));
        setHistory(recent.data ?? []);
        setInvites(invitations.data);
        if (
          [p, count, recent, notes, invitations].some((result) => result.error)
        )
          setError(
            "Bazı kayıtlar yüklenemedi. Bağlantını kontrol edip yeniden dene.",
          );
      } catch {
        if (active)
          setError("Çalışma alanı yüklenemedi. Yeniden deneyebilirsin.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [router, reload]);

  const matches = useMemo(() => {
    const clean = query.trim().toLocaleLowerCase("tr-TR");
    return clean.length < 2
      ? []
      : tools
          .filter((tool) =>
            `${tool.name} ${tool.description} ${tool.slug}`
              .toLocaleLowerCase("tr-TR")
              .includes(clean),
          )
          .slice(0, 5);
  }, [query]);
  const branch = profile?.branch || "diger";
  const name =
    profile?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Mühendis";
  const quickLinks = BRANCH_QUICK[branch] || BRANCH_QUICK.diger;

  const respondToInvite = async (invite: BekleyenDavet, accept: boolean) => {
    if (!user) return;
    setBusyInvite(invite.proje_id);
    try {
      if (accept)
        await davetiKabulEt(
          invite.proje_id,
          user.id,
          user.email ?? "",
          profile?.full_name || name,
        );
      else await davetiReddet(invite.proje_id, user.email ?? "");
      setInvites((current) =>
        current.filter((item) => item.proje_id !== invite.proje_id),
      );
    } catch {
      setError("Davet yanıtı kaydedilemedi. Yeniden dene.");
    } finally {
      setBusyInvite("");
    }
  };

  return (
    <div className={styles.root} data-dashboard>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>ÇALIŞMA ALANIN</p>
          <h1>Panelim</h1>
          <p>
            {user
              ? `${name}, kaldığın yerden devam et.`
              : "Hesaplamaların, projelerin ve notların bir arada."}
          </p>
        </div>
        <Link className={styles.secondary} href="/dashboard/profil">
          <Settings size={17} />
          Profilim
        </Link>
      </div>
      <nav className={styles.shortcuts} aria-label="Çalışma alanı kısa yolları">
        <Link href="/proje-yonetimi">
          <FolderKanban size={20} />
          <span>
            Projelerim<small>Görevleri ve ekibini yönet</small>
          </span>
          <ArrowRight size={17} />
        </Link>
        <Link href="/araclar">
          <Calculator size={20} />
          <span>
            Hesaplama yap<small>Mühendislik aracını bul</small>
          </span>
          <ArrowRight size={17} />
        </Link>
        <Link href="/dashboard/notlar">
          <StickyNote size={20} />
          <span>
            Notlarım<small>Formüllerini ve fikirlerini sakla</small>
          </span>
          <ArrowRight size={17} />
        </Link>
      </nav>
      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setReload((n) => n + 1)}
            disabled={loading}
          >
            Yeniden dene
          </button>
        </div>
      )}
      {loading ? (
        <div className={styles.loading} role="status">
          Çalışma alanın yükleniyor…
        </div>
      ) : (
        <>
          <div className={styles.stats} aria-label="Kayıt özeti">
            <Link href="/dashboard/gecmis">
              <strong>{historyCount ?? "—"}</strong>
              <span>Hesaplama kaydı</span>
            </Link>
            <Link href="/dashboard/notlar">
              <strong>{noteCount ?? "—"}</strong>
              <span>Kayıtlı not</span>
            </Link>
            <Link href="/dashboard/kutuphane">
              <Library size={22} />
              <span>
                Malzeme kütüphanesi <ArrowRight size={14} />
              </span>
            </Link>
          </div>
          {!!invites.length && (
            <section className={styles.card} aria-labelledby="invites-title">
              <h2 id="invites-title">Proje davetlerin</h2>
              {invites.map((invite) => (
                <div key={invite.proje_id} className={styles.invite}>
                  <div>
                    <strong>
                      {invite.proje_emoji} {invite.proje_adi}
                    </strong>
                    <p>
                      {invite.davet_eden || "Bir kullanıcı"} seni projeye davet
                      etti.
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.secondary}
                      disabled={busyInvite === invite.proje_id}
                      onClick={() => void respondToInvite(invite, false)}
                    >
                      Reddet
                    </button>
                    <button
                      type="button"
                      className={styles.primary}
                      disabled={busyInvite === invite.proje_id}
                      onClick={() => void respondToInvite(invite, true)}
                    >
                      <Check size={16} />
                      Kabul et
                    </button>
                  </div>
                </div>
              ))}
            </section>
          )}
          <div className={styles.columns}>
            <div className={styles.mainColumn}>
              <section className={styles.card} aria-labelledby="tools-title">
                <h2 id="tools-title">Ne hesaplamak istiyorsun?</h2>
                <form
                  className={styles.search}
                  role="search"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (query.trim())
                      router.push(
                        matches[0]
                          ? `/arac/${matches[0].slug}`
                          : `/araclar?ara=${encodeURIComponent(query.trim())}`,
                      );
                  }}
                >
                  <Search size={19} />
                  <input
                    type="search"
                    aria-label="Panelde araç ara"
                    placeholder="Örn. sac ağırlığı, tork, kablo kesiti"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <button type="submit" className={styles.primary}>
                    Ara
                  </button>
                </form>
                {query.trim().length >= 2 && (
                  <div className={styles.results} aria-live="polite">
                    {matches.length ? (
                      matches.map((tool) => (
                        <Link key={tool.slug} href={`/arac/${tool.slug}`}>
                          {tool.name}
                          <ArrowRight size={16} />
                        </Link>
                      ))
                    ) : (
                      <p>
                        Eşleşen araç yok.{" "}
                        <Link
                          href={`/araclar?ara=${encodeURIComponent(query.trim())}`}
                        >
                          Tüm araçlarda ara
                        </Link>
                      </p>
                    )}
                  </div>
                )}
                <div className={styles.quick}>
                  {quickLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      {link.label}
                      <ArrowRight size={14} />
                    </Link>
                  ))}
                </div>
              </section>
              <section className={styles.card} aria-labelledby="modules-title">
                <div className={styles.sectionHead}>
                  <h2 id="modules-title">Mühendislik masası</h2>
                  <Link href="/araclar">
                    Tüm araçlar <ArrowRight size={14} />
                  </Link>
                </div>
                <div className={styles.modules}>
                  {MODULES.map((module) => (
                    <Link key={module.href} href={module.href}>
                      <module.icon size={21} />
                      <div>
                        <strong>{module.label}</strong>
                        <p>{module.desc}</p>
                      </div>
                      <ArrowRight size={15} />
                    </Link>
                  ))}
                </div>
              </section>
            </div>
            <aside className={styles.sideColumn}>
              <section className={styles.card} aria-labelledby="history-title">
                <div className={styles.sectionHead}>
                  <h2 id="history-title">Son hesaplamalar</h2>
                  <Link href="/dashboard/gecmis">Tümü</Link>
                </div>
                {history.length ? (
                  <div className={styles.history}>
                    {history.map((item, i) => (
                      <Link key={i} href="/dashboard/gecmis">
                        <Clock size={17} />
                        <div>
                          <strong>{item.tool_name}</strong>
                          <p>{item.summary}</p>
                          <small>
                            {Number.isNaN(
                              new Date(item.calculated_at).getTime(),
                            )
                              ? ""
                              : new Intl.DateTimeFormat("tr-TR", {
                                  day: "numeric",
                                  month: "short",
                                }).format(new Date(item.calculated_at))}
                          </small>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <Calculator size={28} />
                    <h3>
                      {historyCount === null
                        ? "Kayıtlar yüklenemedi"
                        : "İlk hesabınla başla"}
                    </h3>
                    <p>
                      {historyCount === null
                        ? "Yeniden denediğinde kayıtların burada görünecek."
                        : "Kaydettiğin hesaplamalara buradan hızla dönebilirsin."}
                    </p>
                    <Link href="/araclar" className={styles.secondary}>
                      Araçları keşfet <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </section>
              <section className={styles.card}>
                <h2>Hesabım</h2>
                <p>{profile?.full_name || name}</p>
                <p className={styles.muted}>
                  {BRANCH_LABEL[branch] || BRANCH_LABEL.diger}
                </p>
                {!profile?.full_name || !profile?.branch || !profile?.title ? (
                  <Link href="/dashboard/profil" className={styles.textLink}>
                    Profilini tamamla <ArrowRight size={15} />
                  </Link>
                ) : (
                  <Link href="/dashboard/profil" className={styles.textLink}>
                    Profili düzenle <ArrowRight size={15} />
                  </Link>
                )}
                <button
                  className={styles.logout}
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.signOut();
                    if (error) setError("Çıkış yapılamadı. Yeniden dene.");
                    else router.replace("/giris");
                  }}
                >
                  <LogOut size={16} />
                  Çıkış yap
                </button>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
