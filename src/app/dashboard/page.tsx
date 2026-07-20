"use client";

import { useEffect, useMemo, useState } from "react";
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
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calculator,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  FolderKanban,
  GitBranch,
  Hash,
  Home,
  Layers,
  Library,
  Link2,
  LogOut,
  MessageSquare,
  Ruler,
  Search,
  Settings,
  Sparkles,
  StickyNote,
  Users,
} from "lucide-react";

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

const BRANCH_ACCENT: Record<string, string> = {
  elektrik: "#f59e0b",
  insaat: "#fb923c",
  makine: "#e99500",
  mekatronik: "#0ea5e9",
  bilgisayar: "#8b5cf6",
  endustri: "#f97316",
  kimya: "#10b981",
  cevre: "#34d399",
  metalurji: "#94a3b8",
  insaat_zemin: "#a16207",
  maden: "#78716c",
  petrol: "#ca8a04",
  gemi: "#0284c7",
  havacilik: "#6366f1",
  biyomedikal: "#ec4899",
  gida: "#84cc16",
  tekstil: "#e879f9",
  hidrolik: "#06b6d4",
  nukleer: "#ef4444",
  diger: "#a78bfa",
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
    color: "#2dd4a0",
    badge: "Büyüme",
    label: "Trafik Merkezi",
    desc: "Arama boşlukları, SEO brief ve iç link planı",
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

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return "İyi geceler";
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

function fmtDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
  }).format(d);
}

export default function DashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [noteCount, setNoteCount] = useState(0);
  const [bekleyenDavetler, setBekleyenDavetler] = useState<BekleyenDavet[]>([]);
  const [dashboardSearch, setDashboardSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/giris");
        return;
      }

      setUser(session.user);

      const [pR, hR, rR, nR] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", session.user.id).single(),
        supabase.from("calculation_history").select("id").eq("user_id", session.user.id),
        supabase
          .from("calculation_history")
          .select("tool_name,summary,calculated_at")
          .eq("user_id", session.user.id)
          .order("calculated_at", { ascending: false })
          .limit(6),
        supabase.from("notes").select("id").eq("user_id", session.user.id),
      ]);

      if (pR.data) setProfile(pR.data);
      if (hR.data) setHistoryCount(hR.data.length);
      if (rR.data) setRecentHistory(rR.data);
      if (nR.data) setNoteCount(nR.data.length);

      if (session.user.email) {
        const d = await bekleyenDavetleriGetir(session.user.email);
        setBekleyenDavetler(d);
      }

      setLoading(false);
    };

    load();
  }, [router, mounted]);

  const dashboardMatches = useMemo(() => {
    const q = dashboardSearch.trim().toLocaleLowerCase("tr-TR");
    if (q.length < 2) return [];
    return tools
      .filter((tool) => `${tool.name} ${tool.description} ${tool.slug}`.toLocaleLowerCase("tr-TR").includes(q))
      .slice(0, 5);
  }, [dashboardSearch]);

  const handleDashboardSearch = () => {
    if (dashboardMatches[0]) router.push(`/arac/${dashboardMatches[0].slug}`);
    else if (dashboardSearch.trim()) router.push(`/araclar?ara=${encodeURIComponent(dashboardSearch.trim())}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/giris");
  };

  const branch = profile?.branch || "diger";
  const accent = BRANCH_ACCENT[branch] || "#a78bfa";
  const firstName =
    profile?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Mühendis";
  const profOK = !!(profile?.full_name && profile?.branch && profile?.title);
  const quickLinks = BRANCH_QUICK[branch] || BRANCH_QUICK.diger;

  const stats = useMemo(
    () => [
      {
        href: "/dashboard/gecmis",
        label: "Hesaplama",
        val: historyCount,
        color: "#e99500",
        Icon: Calculator,
      },
      {
        href: "/dashboard/notlar",
        label: "Not",
        val: noteCount,
        color: "#a78bfa",
        Icon: StickyNote,
      },
      {
        href: "/dashboard/kutuphane",
        label: "Kütüphane",
        val: 289,
        color: "#f59e0b",
        Icon: Library,
      },
    ],
    [historyCount, noteCount]
  );

  if (!mounted || loading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 56px)",
          display: "grid",
          placeItems: "center",
          background: "var(--bg)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              border: "2px solid var(--border)",
              borderTopColor: "var(--amber)",
              borderRadius: "50%",
              animation: "spin .8s linear infinite",
            }}
          />
          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>Yükleniyor...</span>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", background: "var(--bg)", paddingBottom: 24 }}>
      <style>{`
        .pm-wrap{
          max-width: 1380px;
          margin: 0 auto;
          padding: 20px;
        }

        .pm-hero{
          display:grid;
          grid-template-columns: minmax(0,1fr) 320px;
          gap:16px;
          margin-bottom:16px;
        }

        .pm-main-grid{
          display:grid;
          grid-template-columns: 250px minmax(0,1fr) 320px;
          gap:16px;
          align-items:start;
        }

        .pm-card{
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(15,23,42,.05);
          backdrop-filter: blur(6px);
        }

        .pm-soft{
          background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,0));
        }

        .pm-sidebar{
          position: sticky;
          top: 72px;
          padding: 12px;
        }

        .pm-right{
          position: sticky;
          top: 72px;
        }

        .pm-nav-title{
          padding: 10px 10px 6px;
          font-size: 10px;
          font-weight: 800;
          color: var(--ink-4);
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .pm-nav-link{
          display:flex;
          align-items:center;
          gap:10px;
          padding:10px 12px;
          margin:4px 0;
          border-radius:12px;
          text-decoration:none;
          color:var(--ink-3);
          font-size:13px;
          font-weight:600;
          transition:all .15s ease;
          border:1px solid transparent;
        }

        .pm-nav-link:hover{
          background:var(--bg-muted);
          color:var(--ink);
          border-color:var(--border);
        }

        .pm-nav-link.active{
          background: rgba(245,158,11,0.10);
          color: var(--amber);
          border-color: rgba(245,158,11,0.16);
        }

        .pm-hero-card{
          padding:20px;
          overflow:hidden;
          position:relative;
        }

        .pm-hero-card::before{
          content:"";
          position:absolute;
          inset:0;
          background: radial-gradient(circle at top right, rgba(245,158,11,.14), transparent 35%);
          pointer-events:none;
        }

        .pm-hero-inner{
          position:relative;
          z-index:1;
          display:grid;
          grid-template-columns:minmax(0,1fr) minmax(320px,440px);
          gap:18px;
          align-items:center;
        }

        .pm-hero-side{
          display:grid;
          gap:14px;
          align-self:stretch;
        }

        .pm-hero-title-accent{ color:var(--amber); }

        .pm-hero-art{
          min-height:210px;
          border-radius:22px;
          position:relative;
          overflow:hidden;
          isolation:isolate;
          background:
            radial-gradient(circle at 78% 18%, rgba(245,158,11,.12), transparent 26%),
            radial-gradient(circle at 16% 86%, rgba(233,149,0,.12), transparent 28%),
            #07111f;
          border:1px solid rgba(245,158,11,.10);
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);
        }

        .pm-hero-art-image::before{
          content:"";
          position:absolute;
          inset:0;
          background-image:url("/visuals/topics/dashboard-workbench.webp");
          background-size:cover;
          background-repeat:no-repeat;
          background-position:58% center;
          opacity:.98;
          z-index:1;
          transform:scale(1.03);
        }

        .pm-hero-art-image::after{
          content:"";
          position:absolute;
          inset:0;
          z-index:2;
          background:
            linear-gradient(90deg, rgba(7,17,31,.24) 0%, rgba(7,17,31,.06) 38%, rgba(7,17,31,.22) 100%),
            linear-gradient(180deg, rgba(7,17,31,.02), rgba(7,17,31,.18));
          pointer-events:none;
        }

        .pm-art-block{
          position:absolute;
          right:52px;
          top:28px;
          width:88px;
          height:70px;
          border-radius:14px;
          transform:skewY(-12deg) rotate(-4deg);
          background:linear-gradient(135deg, rgba(233,149,0,.34), rgba(233,149,0,.08));
          border:1px solid rgba(233,149,0,.38);
          box-shadow:0 0 36px rgba(233,149,0,.16);
        }

        .pm-art-gear{
          position:absolute;
          left:126px;
          top:76px;
          width:60px;
          height:60px;
          border-radius:50%;
          display:grid;
          place-items:center;
          color:#94a3b8;
          background:rgba(148,163,184,.10);
          border:1px solid rgba(148,163,184,.28);
        }

        .pm-art-bearing{
          position:absolute;
          left:52px;
          bottom:26px;
          width:96px;
          height:54px;
          border-radius:18px;
          background:linear-gradient(135deg, rgba(245,158,11,.16), rgba(15,23,42,.45));
          border:1px solid rgba(245,158,11,.28);
        }

        .pm-art-bearing::after{
          content:"";
          position:absolute;
          left:28px;
          top:9px;
          width:36px;
          height:36px;
          border-radius:50%;
          border:7px solid rgba(245,158,11,.55);
          box-shadow:inset 0 0 0 8px rgba(15,23,42,.84);
        }

        .pm-art-ruler{
          position:absolute;
          right:20px;
          bottom:38px;
          width:150px;
          height:16px;
          border-radius:999px;
          transform:rotate(-12deg);
          background:linear-gradient(90deg, rgba(245,158,11,.55), rgba(245,158,11,.10));
          border:1px solid rgba(245,158,11,.30);
        }

        .pm-art-caliper{
          position:absolute;
          left:174px;
          top:38px;
          width:92px;
          height:8px;
          border-radius:999px;
          transform:rotate(-22deg);
          background:rgba(226,232,240,.70);
          box-shadow:0 0 22px rgba(226,232,240,.12);
        }

        .pm-art-caliper::before,
        .pm-art-caliper::after{
          content:"";
          position:absolute;
          width:24px;
          height:28px;
          border:5px solid rgba(226,232,240,.62);
          border-top:0;
          bottom:-25px;
        }

        .pm-art-caliper::before{ left:6px; border-right:0; }
        .pm-art-caliper::after{ right:6px; border-left:0; }


        .pm-dashboard-search-wrap{position:relative;margin-top:16px;max-width:590px;}
        .pm-dashboard-search{height:48px;display:flex;align-items:center;gap:10px;padding:0 8px 0 14px;border-radius:15px;background:rgba(15,23,42,.72);border:1px solid rgba(148,163,184,.16);box-shadow:inset 0 1px 0 rgba(255,255,255,.03);}
        .pm-dashboard-search:focus-within{border-color:rgba(233,149,0,.42);box-shadow:0 0 0 4px rgba(233,149,0,.08);}
        .pm-dashboard-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;color:var(--ink);font-size:13px;}
        .pm-dashboard-search button{height:34px;border:0;border-radius:10px;padding:0 12px;background:linear-gradient(180deg,#ffd47a,#ffb11b);color:#07111f;font-weight:900;cursor:pointer;}
        .pm-dashboard-results{position:absolute;z-index:20;left:0;right:0;top:54px;padding:7px;border-radius:15px;background:rgba(8,15,26,.98);border:1px solid rgba(148,163,184,.18);box-shadow:0 22px 50px rgba(0,0,0,.35);display:grid;gap:4px;}
        .pm-dashboard-result{display:flex;align-items:center;gap:10px;padding:10px;border-radius:11px;text-decoration:none;color:var(--ink-2);}
        .pm-dashboard-result:hover{background:rgba(233,149,0,.08);color:var(--ink);}
        .pm-dashboard-result span{display:block;font-size:12px;font-weight:850;}
        .pm-dashboard-result small{display:block;font-size:10px;color:var(--ink-4);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

        .pm-tip-card{
          margin-top:14px;
          display:flex;
          gap:12px;
          align-items:center;
          padding:14px;
          border-radius:16px;
          background:linear-gradient(135deg, rgba(245,158,11,.13), rgba(245,158,11,.04));
          border:1px solid rgba(245,158,11,.18);
        }

        .pm-tip-icon{
          width:40px;
          height:40px;
          border-radius:14px;
          flex-shrink:0;
          display:grid;
          place-items:center;
          color:var(--amber);
          background:rgba(245,158,11,.12);
          border:1px solid rgba(245,158,11,.22);
        }

        .pm-empty-art{
          position:relative;
          width:118px;
          height:76px;
          margin:0 auto 10px;
        }

        .pm-empty-calc{
          position:absolute;
          left:18px;
          top:9px;
          width:44px;
          height:58px;
          border-radius:10px;
          transform:rotate(8deg);
          background:linear-gradient(180deg, rgba(100,116,139,.28), rgba(15,23,42,.70));
          border:1px solid rgba(148,163,184,.24);
        }

        .pm-empty-calc::before{
          content:"0.00";
          position:absolute;
          left:7px;
          right:7px;
          top:7px;
          height:14px;
          border-radius:4px;
          background:rgba(15,23,42,.65);
          color:rgba(226,232,240,.72);
          font-size:7px;
          display:grid;
          place-items:center;
        }

        .pm-empty-calc::after{
          content:"";
          position:absolute;
          left:9px;
          top:28px;
          width:5px;
          height:5px;
          border-radius:2px;
          background:rgba(148,163,184,.45);
          box-shadow:10px 0 rgba(148,163,184,.45),20px 0 rgba(148,163,184,.45),0 11px rgba(148,163,184,.45),10px 11px rgba(148,163,184,.45),20px 11px rgba(245,158,11,.70),0 22px rgba(148,163,184,.45),10px 22px rgba(148,163,184,.45),20px 22px rgba(148,163,184,.45);
        }

        .pm-empty-chart{
          position:absolute;
          right:12px;
          top:15px;
          width:54px;
          height:42px;
          border-radius:8px;
          background:rgba(15,23,42,.62);
          border:1px solid rgba(148,163,184,.22);
        }
        .pm-empty-art-image{
          width:170px;
          height:110px;
          margin:0 auto 12px;
          background-image:url("/dashboard/empty-calculator.webp");
          background-size:contain;
          background-repeat:no-repeat;
          background-position:center;
        }

        .pm-empty-chart::before{
          content:"";
          position:absolute;
          left:9px;
          right:9px;
          bottom:10px;
          height:18px;
          clip-path:polygon(0 78%, 25% 54%, 48% 70%, 72% 28%, 100% 12%, 100% 100%, 0 100%);
          background:linear-gradient(180deg, rgba(233,149,0,.42), rgba(245,158,11,.36));
        }

        .pm-stat-spark{
          position:absolute;
          right:14px;
          bottom:17px;
          width:72px;
          height:26px;
          opacity:.9;
        }

        .pm-stat-spark svg{ display:block; width:100%; height:100%; }


        .pm-profile{
          padding:18px;
        }

        .pm-stats{
          display:grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap:12px;
          margin-bottom:16px;
        }

        .pm-stat{
          display:block;
          text-decoration:none;
          padding:16px;
          border-radius:16px;
          background:var(--bg-card);
          border:1px solid var(--border);
          transition:transform .15s ease, border-color .15s ease, box-shadow .15s ease;
        }

        .pm-stat:hover{
          transform:translateY(-2px);
          box-shadow:0 10px 20px rgba(15,23,42,.05);
        }

        .pm-section{
          padding:16px;
        }

        .pm-section-head{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          margin-bottom:12px;
        }

        .pm-section-title{
          font-size:14px;
          font-weight:800;
          color:var(--ink);
        }

        .pm-muted-link{
          text-decoration:none;
          color:var(--amber);
          font-size:12px;
          font-weight:700;
        }

        .pm-quick-grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap:10px;
        }

        .pm-quick{
          display:flex;
          align-items:center;
          gap:10px;
          text-decoration:none;
          color:var(--ink-3);
          padding:12px 12px;
          border-radius:14px;
          border:1px solid var(--border);
          background:var(--bg-muted);
          transition:all .15s ease;
        }

        .pm-quick:hover{
          background:var(--bg-card);
          border-color:var(--amber);
          color:var(--ink);
        }

        .pm-mod-grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap:12px;
        }


        .pm-module-visual{
          position:relative;
          height:96px;
          background-size:cover;
          background-position:center;
          border-bottom:1px solid var(--border);
          overflow:hidden;
        }
        .pm-module-visual::after{
          content:"";
          position:absolute;
          inset:0;
          background:linear-gradient(180deg, transparent 30%, rgba(4,10,18,.78));
        }
        .pm-module-visual span{
          position:absolute;
          left:10px;
          bottom:8px;
          z-index:1;
          color:#dcecff;
          font-size:9px;
          font-weight:800;
          letter-spacing:.05em;
          text-transform:uppercase;
        }

        .pm-module{
          display:block;
          text-decoration:none;
          border-radius:16px;
          overflow:hidden;
          background:var(--bg-card);
          border:1px solid var(--border);
          transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease;
        }

        .pm-module:hover{
          transform:translateY(-2px);
          box-shadow:0 10px 20px rgba(15,23,42,.05);
        }

        .pm-module-body{
          padding:14px;
        }

        .pm-invite{
          display:flex;
          gap:12px;
          align-items:center;
          padding:14px;
          border-radius:16px;
          border:1px solid rgba(245,158,11,.22);
          background:linear-gradient(135deg, rgba(245,158,11,.08), rgba(245,158,11,.03));
        }

        .pm-list{
          display:flex;
          flex-direction:column;
          gap:10px;
        }

        .pm-history-item,
        .pm-side-link{
          display:flex;
          gap:10px;
          align-items:center;
          text-decoration:none;
          padding:12px;
          border-radius:14px;
          border:1px solid var(--border);
          background:var(--bg-muted);
          color:var(--ink-3);
          transition:all .15s ease;
        }

        .pm-history-item{
          background:
            linear-gradient(135deg, rgba(233,149,0,.055), rgba(245,158,11,.035)),
            rgba(15,23,42,.72);
        }

        .pm-history-item:hover,
        .pm-side-link:hover{
          background:var(--bg-card);
          border-color:var(--border-mid);
        }

        .pm-empty{
          padding:22px 16px;
          border-radius:16px;
          border:1px dashed var(--border-mid);
          background:var(--bg-muted);
          text-align:center;
        }

        .pm-empty-modern{
          position:relative;
          overflow:hidden;
          padding:18px;
          min-height:224px;
          border-radius:18px;
          border:1px solid rgba(245,158,11,.18);
          background:
            radial-gradient(circle at 18% 0%, rgba(245,158,11,.18), transparent 34%),
            radial-gradient(circle at 88% 18%, rgba(233,149,0,.12), transparent 32%),
            linear-gradient(180deg, rgba(15,23,42,.86), rgba(15,23,42,.54));
          box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
          text-align:left;
        }

        .pm-empty-modern::after{
          content:"";
          position:absolute;
          right:-34px;
          bottom:-36px;
          width:150px;
          height:150px;
          border-radius:38px;
          transform:rotate(18deg);
          background:
            linear-gradient(135deg, rgba(245,158,11,.16), rgba(233,149,0,.06));
          border:1px solid rgba(245,158,11,.12);
          opacity:.75;
        }

        .pm-empty-icon-shell{
          position:relative;
          z-index:1;
          width:56px;
          height:56px;
          border-radius:18px;
          display:grid;
          place-items:center;
          margin-bottom:16px;
          color:var(--amber);
          background:rgba(245,158,11,.12);
          border:1px solid rgba(245,158,11,.22);
          box-shadow:0 18px 42px rgba(245,158,11,.08);
        }

        .pm-empty-title{
          position:relative;
          z-index:1;
          margin:0 0 7px;
          color:var(--ink);
          font-size:15px;
          font-weight:900;
        }

        .pm-empty-desc{
          position:relative;
          z-index:1;
          margin:0 0 16px;
          color:var(--ink-4);
          font-size:12.5px;
          line-height:1.55;
          max-width:240px;
        }

        .pm-empty-actions{
          position:relative;
          z-index:1;
          display:grid;
          gap:10px;
        }

        .pm-empty-btn{
          min-height:42px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:0 13px;
          border-radius:13px;
          text-decoration:none;
          font-size:12px;
          font-weight:850;
          border:1px solid var(--border);
        }

        .pm-empty-btn.primary{
          color:#0a0a0f;
          background:var(--amber);
          border-color:transparent;
          box-shadow:0 16px 34px rgba(245,158,11,.16);
        }

        .pm-empty-btn.ghost{
          color:var(--ink-3);
          background:rgba(15,23,42,.54);
        }

        .pm-badge{
          display:inline-flex;
          align-items:center;
          padding:3px 8px;
          border-radius:999px;
          font-size:10px;
          font-weight:800;
        }

        .pm-subtle{
          color:var(--ink-4);
          font-size:12px;
        }

        .pm-btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:6px;
          height:36px;
          border-radius:12px;
          padding:0 14px;
          border:none;
          cursor:pointer;
          font-size:12px;
          font-weight:800;
          text-decoration:none;
          transition:all .15s ease;
        }

        .pm-btn-primary{
          background:var(--amber);
          color:#0a0a0f;
        }

        .pm-btn-muted{
          background:var(--bg-muted);
          color:var(--ink-3);
          border:1px solid var(--border);
        }

        @media (max-width: 1180px){
          .pm-main-grid{
            grid-template-columns: 220px minmax(0,1fr);
          }
          .pm-right{
            position:static;
            grid-column: 1 / -1;
          }
          .pm-hero{
            grid-template-columns: 1fr;
          }
          .pm-hero-inner{
            grid-template-columns:minmax(0,1fr) minmax(300px,380px);
          }
        }

        @media (max-width: 900px){
          .pm-hero-inner{
            grid-template-columns:1fr;
          }
          .pm-hero-side{
            gap:12px;
          }
          .pm-hero-art{
            min-height:210px;
          }          .pm-wrap{
            padding: 14px;
          }
          .pm-main-grid{
            grid-template-columns: 1fr;
          }
          .pm-sidebar{
            display:none;
          }
        }

        @media (max-width: 640px){
          .pm-hero-card,
          .pm-profile,
          .pm-section{
            padding:14px;
          }
          .pm-stats{
            grid-template-columns: 1fr;
          }
          .pm-quick-grid,
          .pm-mod-grid{
            grid-template-columns: 1fr;
          }
          .pm-hero-art{
            display:block;
            min-height:188px;
            margin-top:0;
          }

          .pm-hero-art-image::before{
            background-position:center;
            background-size:cover;
            opacity:.94;
          }
        }


        /* Dashboard hero redesign: image + profile now behave as one clean showcase */
        .pm-hero-card{
          padding:28px;
          min-height:340px;
          background:
            radial-gradient(circle at 78% 16%, rgba(245,158,11,.16), transparent 28%),
            linear-gradient(135deg, rgba(16,23,37,.98), rgba(12,18,30,.94) 48%, rgba(20,16,17,.94));
          border-color:rgba(148,163,184,.16);
          box-shadow:0 22px 70px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.035);
        }

        .pm-hero-card::before{
          background:
            linear-gradient(rgba(148,163,184,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,.045) 1px, transparent 1px),
            radial-gradient(circle at 92% 8%, rgba(245,158,11,.11), transparent 32%);
          background-size:42px 42px,42px 42px,100% 100%;
          opacity:.9;
        }

        .pm-hero-inner{
          min-height:284px;
          grid-template-columns:minmax(0,.9fr) minmax(440px,1.1fr);
          gap:28px;
          align-items:center;
        }

        .pm-hero-side{
          position:relative;
          min-height:268px;
          display:block;
          align-self:stretch;
        }

        .pm-hero-art{
          position:absolute;
          inset:0;
          min-height:0;
          border-radius:24px;
          border-color:rgba(233,149,0,.12);
          background:#06101d;
          box-shadow:inset 0 0 0 1px rgba(255,255,255,.035), 0 20px 60px rgba(0,0,0,.22);
        }

        .pm-hero-art-image::before{
          inset:-18px -24px -18px -28px;
          background-size:cover;
          background-position:58% center;
          opacity:.98;
          transform:scale(1.02);
        }

        .pm-hero-art-image::after{
          background:
            linear-gradient(90deg, rgba(6,16,29,.36) 0%, rgba(6,16,29,.06) 42%, rgba(6,16,29,.18) 100%),
            linear-gradient(180deg, rgba(6,16,29,.02), rgba(6,16,29,.22));
        }

        @media (max-width: 1180px){
          .pm-hero-inner{
            grid-template-columns:minmax(0,.95fr) minmax(360px,1.05fr);
          }
        }

        @media (max-width: 900px){
          .pm-hero-card{
            padding:20px;
            min-height:auto;
          }
          .pm-hero-inner{
            min-height:0;
            grid-template-columns:1fr;
            gap:18px;
          }
          .pm-hero-side{
            display:grid;
            gap:12px;
            min-height:0;
          }
          .pm-hero-art{
            position:relative;
            min-height:220px;
          }        }

        @media (max-width: 640px){
          .pm-wrap{ padding:10px; }
          .pm-hero-card{
            padding:18px;
            border-radius:18px;
          }
          .pm-hero-art{
            min-height:190px;
            border-radius:18px;
          }
          .pm-hero-art-image::before{
            inset:-8px -18px -8px -18px;
            background-position:center;
            background-size:cover;
            transform:scale(1.01);
          }        }

      `}</style>

      <div className="pm-wrap">

        <div className="pm-hero">
          <div className="pm-card pm-hero-card">
            <div className="pm-hero-inner">
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: `${accent}14`,
                    border: `1px solid ${accent}24`,
                    color: accent,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  <Sparkles size={12} />
                  Panel
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 34,
                    lineHeight: 1.08,
                    color: "var(--ink)",
                    fontWeight: 950,
                    letterSpacing: "-0.035em",
                  }}
                >
                  Hoş geldin, <span className="pm-hero-title-accent">{firstName}</span>
                </h1>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "var(--ink-4)",
                    fontSize: 14,
                    lineHeight: 1.62,
                    maxWidth: 560,
                  }}
                >
                  {BRANCH_LABEL[branch]} alanın için hesaplama araçlarına,
                  projelerine ve son kayıtlarına buradan hızlıca erişebilirsin.
                </p>

                <div className="pm-dashboard-search-wrap">
                  <form
                    className="pm-dashboard-search"
                    onSubmit={(event) => { event.preventDefault(); handleDashboardSearch(); }}
                  >
                    <Search size={16} style={{ color: "var(--ink-4)" }} />
                    <input
                      value={dashboardSearch}
                      onChange={(event) => setDashboardSearch(event.target.value)}
                      placeholder="Hesaplama aracı ara..."
                      aria-label="Panelde hesaplama aracı ara"
                    />
                    <button type="submit">Aç</button>
                  </form>
                  {dashboardMatches.length > 0 && (
                    <div className="pm-dashboard-results">
                      {dashboardMatches.map((tool) => (
                        <Link key={tool.id} href={`/arac/${tool.slug}`} className="pm-dashboard-result">
                          <Calculator size={15} style={{ color: accent, flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <span>{tool.name}</span>
                            <small>{tool.description}</small>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 18,
                  }}
                >
                  <Link href="/proje-yonetimi" className="pm-btn pm-btn-primary">
                    <FolderKanban size={14} />
                    Proje Yönetimi
                  </Link>
                  <Link href="/araclar" className="pm-btn pm-btn-muted">
                    <Calculator size={14} />
                    Tüm Araçlar
                  </Link>
                </div>
              </div>

              <div className="pm-hero-side">
                <div className="pm-hero-art pm-hero-art-image" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="pm-card pm-profile">
            <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink-4)", marginBottom: 12 }}>
              Hızlı Erişim
            </div>

            {!profOK ? (
              <Link
                href="/dashboard/profil"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  marginBottom: 10,
                  borderRadius: 14,
                  background: "rgba(245,158,11,.10)",
                  border: "1px solid rgba(245,158,11,.18)",
                  color: "var(--amber)",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 850,
                }}
              >
                <AlertTriangle size={15} />
                <span style={{ flex: 1 }}>Profil bilgilerini tamamla</span>
                <ChevronRight size={14} />
              </Link>
            ) : null}

            <div style={{ display: "grid", gap: 10 }}>
              <Link href="/dashboard/profil" className="pm-side-link">
                <Settings size={15} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink)" }}>
                    Profil Ayarları
                  </div>
                  <div className="pm-subtle">Bilgilerini ve görünümünü düzenle</div>
                </div>
                <ChevronRight size={14} />
              </Link>

              <button onClick={handleLogout} className="pm-side-link" style={{ cursor: "pointer" }}>
                <LogOut size={15} />
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink)" }}>
                    Çıkış Yap
                  </div>
                  <div className="pm-subtle">Hesabından güvenli şekilde çık</div>
                </div>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="pm-tip-card">
              <div className="pm-tip-icon">
                <Sparkles size={18} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: "var(--ink)", marginBottom: 3 }}>
                  Günün İpucu
                </div>
                <div className="pm-subtle" style={{ lineHeight: 1.45 }}>
                  Sık kullandığın araçları favorilere ekle, panelden tek tıkla eriş.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pm-main-grid">
          <aside className="pm-card pm-sidebar">
            <div className="pm-nav-title">Genel</div>

            <Link href="/dashboard" className="pm-nav-link active">
              <Home size={15} />
              Ana Sayfa
            </Link>
            <Link href="/proje-yonetimi" className="pm-nav-link">
              <FolderKanban size={15} />
              Proje Yönetimi
              <span
                style={{
                  marginLeft: "auto",
                  padding: "2px 7px",
                  borderRadius: 999,
                  background: "rgba(245,158,11,.14)",
                  color: "var(--amber)",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                YENİ
              </span>
            </Link>
            <Link href="/araclar" className="pm-nav-link">
              <Calculator size={15} />
              Tüm Araçlar
            </Link>
            <Link href="/forum" className="pm-nav-link">
              <MessageSquare size={15} />
              Forum
            </Link>

            <div className="pm-nav-title" style={{ marginTop: 10 }}>
              Kütüphane
            </div>

            {MODULES.map((mod) => (
              <Link key={mod.href} href={mod.href} className="pm-nav-link">
                <mod.icon size={15} style={{ color: mod.color }} />
                <span style={{ flex: 1, minWidth: 0 }}>{mod.label}</span>
              </Link>
            ))}
          </aside>

          <main style={{ minWidth: 0 }}>
            {bekleyenDavetler.length > 0 && (
              <div className="pm-card pm-section" style={{ marginBottom: 16 }}>
                <div className="pm-section-head">
                  <div className="pm-section-title">Bekleyen Davetler</div>
                </div>

                <div className="pm-list">
                  {bekleyenDavetler.map((davet) => (
                    <div key={davet.proje_id} className="pm-invite">
                      <div style={{ fontSize: 24, flexShrink: 0 }}>{davet.proje_emoji}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: "var(--ink)",
                            marginBottom: 3,
                          }}
                        >
                          {davet.proje_adi}
                        </div>
                        <div className="pm-subtle">
                          {davet.davet_eden || "Biri"} sizi projeye davet etti
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                          className="pm-btn pm-btn-primary"
                          onClick={async () => {
                            if (!user) return;
                            await davetiKabulEt(
                              davet.proje_id,
                              user.id,
                              user.email ?? "",
                              profile?.full_name || user.email?.split("@")[0] || ""
                            );
                            setBekleyenDavetler((prev) =>
                              prev.filter((d) => d.proje_id !== davet.proje_id)
                            );
                          }}
                        >
                          <Check size={13} />
                          Kabul
                        </button>

                        <button
                          className="pm-btn pm-btn-muted"
                          onClick={async () => {
                            if (!user) return;
                            await davetiReddet(davet.proje_id, user.email ?? "");
                            setBekleyenDavetler((prev) =>
                              prev.filter((d) => d.proje_id !== davet.proje_id)
                            );
                          }}
                        >
                          Reddet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pm-stats">
              {stats.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  className="pm-stat"
                  style={{ borderTop: `3px solid ${s.color}`, position: "relative", overflow: "hidden" }}
                >
                  <s.Icon size={16} style={{ color: s.color, marginBottom: 10 }} />
                  <div
                    style={{
                      fontSize: 26,
                      lineHeight: 1,
                      fontWeight: 900,
                      color: s.color,
                      marginBottom: 6,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {s.val || "—"}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-4)" }}>
                    {s.label}
                  </div>
                  <div className="pm-stat-spark" aria-hidden="true">
                    <svg viewBox="0 0 100 36" fill="none">
                      <path
                        d="M2 24 L16 22 L28 30 L42 18 L55 23 L68 8 L82 25 L98 15"
                        stroke={s.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pm-card pm-section" style={{ marginBottom: 16 }}>
              <div className="pm-section-head">
                <div className="pm-section-title">Proje Yönetimi</div>
                <Link href="/proje-yonetimi" className="pm-muted-link">
                  Aç
                </Link>
              </div>

              <Link
                href="/proje-yonetimi"
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: 16,
                  borderRadius: 18,
                  border: "1px solid rgba(245,158,11,.18)",
                  background:
                    "linear-gradient(135deg, rgba(245,158,11,.08), rgba(245,158,11,.02))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "rgba(245,158,11,.12)",
                        border: "1px solid rgba(245,158,11,.20)",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FolderKanban size={22} style={{ color: "var(--amber)" }} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ fontSize: 15, fontWeight: 900, color: "var(--ink)" }}>
                          Proje Yönetimi
                        </div>
                        <span
                          className="pm-badge"
                          style={{
                            background: "var(--amber)",
                            color: "#0a0a0f",
                          }}
                        >
                          YENİ
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 12,
                          color: "var(--ink-4)",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <GitBranch size={12} style={{ color: "var(--amber)" }} />
                          Kanban
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <CalendarDays size={12} style={{ color: "var(--amber)" }} />
                          Gantt & Takvim
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <BarChart3 size={12} style={{ color: "var(--amber)" }} />
                          Analiz
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <Users size={12} style={{ color: "var(--amber)" }} />
                          Ekip
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: "rgba(245,158,11,.12)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ArrowRight size={16} style={{ color: "var(--amber)" }} />
                  </div>
                </div>
              </Link>
            </div>

            <div className="pm-card pm-section" style={{ marginBottom: 16 }}>
              <div className="pm-section-head">
                <div className="pm-section-title">Hızlı Araçlar</div>
                <Link href="/araclar" className="pm-muted-link">
                  Tümü
                </Link>
              </div>

              <div className="pm-quick-grid">
                {quickLinks.map((q, i) => (
                  <Link key={i} href={q.href} className="pm-quick">
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        background: accent,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {q.label}
                    </span>
                    <ChevronRight size={14} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pm-card pm-section">
              <div className="pm-section-head">
                <div className="pm-section-title">Mühendis Kütüphanesi</div>
                <div className="pm-subtle">{MODULES.length} modül</div>
              </div>

              <div className="pm-mod-grid">
                {MODULES.map((mod) => (
                  <Link
                    key={mod.href}
                    href={mod.href}
                    className="pm-module"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="pm-module-visual" style={{ backgroundImage: `url(${mod.visual})` }}>
                      <span>{mod.badge}</span>
                    </div>
                    <div style={{ height: 3, background: mod.color }} />
                    <div className="pm-module-body">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 10,
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            background: `${mod.color}14`,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <mod.icon size={16} style={{ color: mod.color }} />
                        </div>

                        <span
                          className="pm-badge"
                          style={{
                            background: `${mod.color}14`,
                            color: mod.color,
                          }}
                        >
                          {mod.badge}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 800,
                          color: "var(--ink)",
                          marginBottom: 5,
                        }}
                      >
                        {mod.label}
                      </div>

                      <div className="pm-subtle" style={{ lineHeight: 1.55 }}>
                        {mod.desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>

          <aside className="pm-right">
            <div className="pm-card pm-section" style={{ marginBottom: 16 }}>
              <div className="pm-section-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                      color: "var(--amber)",
                      background: "rgba(245,158,11,.10)",
                      border: "1px solid rgba(245,158,11,.18)",
                    }}
                  >
                    <Clock size={16} />
                  </div>
                  <div className="pm-section-title">Son Hesaplamalar</div>
                </div>
                <Link href="/dashboard/gecmis" className="pm-muted-link">
                  Tümü
                </Link>
              </div>

              {recentHistory.length === 0 ? (
                <div className="pm-empty-modern">
                  <div className="pm-empty-icon-shell">
                    <Calculator size={24} />
                  </div>
                  <h3 className="pm-empty-title">Henüz kayıt yok</h3>
                  <p className="pm-empty-desc">
                    İlk hesaplamanı yaptığında burada son işlemlerin temiz bir liste halinde görünecek.
                  </p>
                  <div className="pm-empty-actions">
                    <Link href="/araclar" className="pm-empty-btn primary">
                      <span>Araçları keşfet</span>
                      <ArrowRight size={15} />
                    </Link>
                    <Link href="/dashboard/gecmis" className="pm-empty-btn ghost">
                      <span>Geçmiş sayfası</span>
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="pm-list">
                  {recentHistory.map((h, i) => (
                    <Link key={i} href="/dashboard/gecmis" className="pm-history-item">
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 12,
                          background: "rgba(245,158,11,.10)",
                          border: "1px solid rgba(245,158,11,.16)",
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Calculator size={15} style={{ color: "var(--amber)" }} />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 800,
                            color: "var(--ink)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {h.tool_name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--ink-4)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: 2,
                          }}
                        >
                          {h.summary}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          color: "var(--ink-4)",
                          fontSize: 10.5,
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={11} />
                        {fmtDate(h.calculated_at)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pm-card pm-section" style={{ marginBottom: 16 }}>
              <div className="pm-section-head">
                <div className="pm-section-title">Proje Kısa Yolları</div>
              </div>

              <div className="pm-list">
                {[
                  {
                    Icon: GitBranch,
                    label: "Kanban Panosu",
                    desc: "Sürükle bırak görev akışı",
                    color: "#3b82f6",
                  },
                  {
                    Icon: CalendarDays,
                    label: "Gantt & Takvim",
                    desc: "Zaman çizelgesi görünümü",
                    color: "#10b981",
                  },
                  {
                    Icon: BarChart3,
                    label: "Analiz & Raporlar",
                    desc: "Proje sağlığı ve özetler",
                    color: "#f59e0b",
                  },
                  {
                    Icon: Users,
                    label: "Ekip Yönetimi",
                    desc: "Davet, rol ve atama",
                    color: "#a78bfa",
                  },
                ].map(({ Icon, label, desc, color }, i) => (
                  <Link key={i} href="/proje-yonetimi" className="pm-side-link">
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        background: `${color}14`,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} style={{ color }} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink)" }}>
                        {label}
                      </div>
                      <div className="pm-subtle">{desc}</div>
                    </div>

                    <ChevronRight size={14} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pm-card pm-section">
              <div className="pm-section-head">
                <div className="pm-section-title">Yakında Geliyor</div>
              </div>

              <div className="pm-list">
                {[
                  { label: "AI Formül", desc: "Doğal dil ile hesap kurulumu" },
                  { label: "Kayış-Kasnak", desc: "Temel tasarım ve seçim ekranı" },
                  { label: "Buhar Tablosu", desc: "Basınç sıcaklık veri alanı" },
                  { label: "Boru Hesabı", desc: "Akış ve çap seçim ekranı" },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "var(--bg-muted)",
                      opacity: 0.72,
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--ink-2)" }}>
                      {item.label}
                    </div>
                    <div className="pm-subtle" style={{ marginTop: 3 }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
