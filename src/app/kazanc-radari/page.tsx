"use client";

import { useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Check,
  Clock3,
  FileSearch,
  Gauge,
  Layers3,
  Lightbulb,
  Plus,
  Radar,
  ReceiptText,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Upload,
  WalletCards,
  X,
  Zap,
} from "lucide-react";

type Patch = {
  id: number;
  kind: string;
  title: string;
  value: number;
  period: string;
  confidence: number;
  effort: string;
  deadline: string;
  source: string;
  why: string;
  next: string;
  status?: "open" | "watch" | "done" | "skip";
};

const initialPatches: Patch[] = [
  {
    id: 1,
    kind: "FATURA",
    title: "İnternet taahhüdü bittiğinde daha ucuz pakete geç",
    value: 2292,
    period: "/ yıl",
    confidence: 94,
    effort: "4 dk",
    deadline: "43 gün sonra",
    source: "Tarife + sözleşme karşılaştırması",
    why: "Mevcut aylık ödeme ile benzer hızdaki alternatif arasında yaklaşık 191 TL fark var.",
    next: "Taahhüt bitimine 7 gün kala yeniden kontrol et.",
    status: "open",
  },
  {
    id: 2,
    kind: "İADE",
    title: "Teslimat gecikmesi için iade / kupon hakkını kontrol et",
    value: 480,
    period: " tek sefer",
    confidence: 87,
    effort: "3 dk",
    deadline: "6 gün",
    source: "Sipariş koşulu + teslimat tarihi",
    why: "Sipariş tarihi ile vaat edilen teslim süresi arasında aşım sinyali var.",
    next: "Sipariş belgesini doğrula ve satıcı başvuru adımını aç.",
    status: "open",
  },
  {
    id: 3,
    kind: "ABONELİK",
    title: "Kullanılmayan üyeliği kapat",
    value: 1188,
    period: "/ yıl",
    confidence: 81,
    effort: "2 dk",
    deadline: "9 gün",
    source: "Tekrarlayan ödeme sinyali",
    why: "Aylık 99 TL tekrarlayan ödeme var; kullanım teyidi bekleniyor.",
    next: "Kullanıyor musun? Hayır dersen iptal yolunu aç.",
    status: "open",
  },
];

const money = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

export default function KazancRadariPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [patches, setPatches] = useState(initialPatches);
  const [tab, setTab] = useState<"today" | "graph" | "ledger">("today");
  const [scan, setScan] = useState<{ name: string; state: "reading" | "done" } | null>(null);

  const openPatches = useMemo(() => patches.filter((p) => p.status === "open" || p.status === "watch"), [patches]);
  const realized = useMemo(() => patches.filter((p) => p.status === "done").reduce((s, p) => s + p.value, 0), [patches]);
  const potential = useMemo(() => openPatches.reduce((s, p) => s + p.value, 0), [openPatches]);

  const changeStatus = (id: number, status: Patch["status"]) => {
    setPatches((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    setScan({ name: file.name, state: "reading" });
    window.setTimeout(() => {
      const generated: Patch = {
        id: Date.now(),
        kind: "YENİ BELGE",
        title: "Bu belgeden doğrulanabilir bir tasarruf adayı çıktı",
        value: 720,
        period: " potansiyel",
        confidence: 76,
        effort: "5 dk",
        deadline: "Kontrol gerekli",
        source: file.name,
        why: "Demo taraması belgede fiyat, tarih ve tekrar eden ödeme benzeri ekonomik sinyaller buldu.",
        next: "Canlı sürümde kaynak doğrulaması yapılıp yalnızca gerçek ve uygulanabilir sonuç gösterilecek.",
        status: "open",
      };
      setPatches((prev) => [generated, ...prev]);
      setScan({ name: file.name, state: "done" });
    }, 900);
  };

  return (
    <main style={s.page}>
      <div style={s.glowOne} />
      <div style={s.glowTwo} />

      <header style={s.header}>
        <div style={s.brandWrap}>
          <div style={s.logo}><Radar size={22} strokeWidth={2.5} /></div>
          <div>
            <div style={s.brand}>Kazanç Radarı</div>
            <div style={s.subbrand}>Kişisel ekonomik debugger · V2 demo</div>
          </div>
        </div>
        <div style={s.headerActions}>
          <span style={s.demoBadge}><Sparkles size={13} /> ÜRÜN DEMOSU</span>
          <button style={s.iconBtn} aria-label="Bildirimler"><Bell size={18} /></button>
        </div>
      </header>

      <section style={s.shell}>
        <div style={s.heroGrid}>
          <div style={s.heroCard}>
            <div style={s.eyebrow}><Zap size={15} /> BUGÜN SENİN İÇİN</div>
            <h1 style={s.h1}>Paranın nerede kaçtığını<br />sana sormadan bul.</h1>
            <p style={s.heroText}>Destek listesi değil. Fatura, fiş, sözleşme veya hayatındaki bir değişiklikten uygulanabilir ekonomik <b>Patch</b> çıkarır.</p>
            <div style={s.heroStats}>
              <div>
                <div style={s.statLabel}>Açık potansiyel</div>
                <div style={s.statValue}>+{money.format(potential)} TL</div>
              </div>
              <div style={s.statDivider} />
              <div>
                <div style={s.statLabel}>Bekleyen patch</div>
                <div style={s.statValue}>{openPatches.length}</div>
              </div>
              <div style={s.statDivider} />
              <div>
                <div style={s.statLabel}>Gerçekleşen</div>
                <div style={s.statValue}>+{money.format(realized)} TL</div>
              </div>
            </div>
          </div>

          <button style={s.dropCard} onClick={() => fileRef.current?.click()}>
            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/*,.pdf,.txt"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div style={s.dropIcon}><ScanSearch size={29} /></div>
            <div style={s.dropTitle}>Bir şey at</div>
            <div style={s.dropText}>Fatura · fiş · PDF · sözleşme · ekran görüntüsü</div>
            <div style={s.dropButton}><Upload size={16} /> Tara ve para kaçağı ara</div>
            <div style={s.privacy}><ShieldCheck size={14} /> Demo: dosya sunucuya gönderilmez</div>
          </button>
        </div>

        {scan && (
          <div style={scan.state === "reading" ? s.scanBar : s.scanBarDone}>
            <div style={s.scanLeft}>
              {scan.state === "reading" ? <Activity size={18} /> : <BadgeCheck size={18} />}
              <div>
                <b>{scan.state === "reading" ? "Belge ekonomik sinyaller için taranıyor" : "Yeni Patch oluşturuldu"}</b>
                <div style={s.scanName}>{scan.name}</div>
              </div>
            </div>
            {scan.state === "done" && <button onClick={() => setScan(null)} style={s.closeScan}><X size={16} /></button>}
          </div>
        )}

        <nav style={s.tabs}>
          <button onClick={() => setTab("today")} style={tab === "today" ? s.tabActive : s.tab}><Gauge size={17} /> Bugün</button>
          <button onClick={() => setTab("graph")} style={tab === "graph" ? s.tabActive : s.tab}><Layers3 size={17} /> Para grafiğim</button>
          <button onClick={() => setTab("ledger")} style={tab === "ledger" ? s.tabActive : s.tab}><WalletCards size={17} /> Kazanç defteri</button>
        </nav>

        {tab === "today" && (
          <section>
            <div style={s.sectionHead}>
              <div>
                <div style={s.sectionTitle}>Öncelikli Patch’ler</div>
                <div style={s.sectionDesc}>Net değer × güven ÷ efor sırasıyla. Haber akışı yok.</div>
              </div>
              <div style={s.filterBadge}><FileSearch size={15} /> {openPatches.length} uygulanabilir</div>
            </div>

            <div style={s.patchList}>
              {openPatches.map((p, i) => (
                <article key={p.id} style={s.patch}>
                  <div style={s.rank}>#{i + 1}</div>
                  <div style={s.patchMain}>
                    <div style={s.patchTop}>
                      <span style={s.kind}>{p.kind}</span>
                      {p.status === "watch" && <span style={s.watchBadge}><Clock3 size={13} /> TAKİPTE</span>}
                    </div>
                    <h2 style={s.patchTitle}>{p.title}</h2>
                    <p style={s.patchWhy}>{p.why}</p>
                    <div style={s.miniGrid}>
                      <div style={s.mini}><span>Güven</span><b>%{p.confidence}</b></div>
                      <div style={s.mini}><span>Efor</span><b>{p.effort}</b></div>
                      <div style={s.mini}><span>Zaman</span><b>{p.deadline}</b></div>
                      <div style={s.mini}><span>Kaynak</span><b>{p.source}</b></div>
                    </div>
                    <div style={s.next}><Lightbulb size={16} /><span><b>Sonraki hareket:</b> {p.next}</span></div>
                  </div>
                  <div style={s.patchSide}>
                    <div style={s.patchValue}>+{money.format(p.value)} TL</div>
                    <div style={s.patchPeriod}>{p.period}</div>
                    <div style={s.sideButtons}>
                      <button style={s.primary} onClick={() => changeStatus(p.id, "done")}><Check size={16} /> Uyguladım</button>
                      <button style={s.secondary} onClick={() => changeStatus(p.id, "watch")}><Clock3 size={16} /> Takibe al</button>
                      <button style={s.ghost} onClick={() => changeStatus(p.id, "skip")}>Geç</button>
                    </div>
                  </div>
                </article>
              ))}
              {openPatches.length === 0 && (
                <div style={s.empty}><BadgeCheck size={32} /><b>Açık Patch kalmadı.</b><span>Yeni bir belge at veya ekonomik grafiğine bilgi ekle.</span></div>
              )}
            </div>
          </section>
        )}

        {tab === "graph" && (
          <section style={s.graphCard}>
            <div style={s.sectionHead}>
              <div>
                <div style={s.sectionTitle}>Household Money Graph</div>
                <div style={s.sectionDesc}>Form doldurmak yerine ekonomik durumun bir grafik olarak büyür.</div>
              </div>
              <button style={s.addNode}><Plus size={16} /> Bilgi ekle</button>
            </div>
            <div style={s.graphCenter}>
              <div style={s.youNode}><Banknote size={23} /><b>Sen</b><span>ekonomik merkez</span></div>
              <div style={{...s.node, left:"12%", top:"13%"}}>Bursa<span>konum</span></div>
              <div style={{...s.node, right:"10%", top:"12%"}}>Çalışan<span>gelir</span></div>
              <div style={{...s.node, left:"7%", bottom:"13%"}}>Araç<span>gider</span></div>
              <div style={{...s.node, right:"7%", bottom:"13%"}}>Aile<span>yaşam olayı</span></div>
              <div style={{...s.nodeSmall, left:"36%", top:"8%"}}>İnternet</div>
              <div style={{...s.nodeSmall, right:"35%", bottom:"7%"}}>Abonelikler</div>
            </div>
            <div style={s.graphFooter}><Activity size={16} /> Bir düğüm değiştiğinde ilgili tüm hak, masraf ve fırsat kuralları yeniden hesaplanır.</div>
          </section>
        )}

        {tab === "ledger" && (
          <section style={s.ledgerGrid}>
            <div style={s.ledgerHero}>
              <ReceiptText size={24} />
              <div style={s.ledgerLabel}>Kazanç Radarı bugüne kadar cebinde bıraktı</div>
              <div style={s.ledgerTotal}>+{money.format(realized)} TL</div>
              <div style={s.ledgerHint}>Sadece “Uyguladım” dediğin sonuçlar burada sayılır.</div>
            </div>
            <div style={s.ledgerList}>
              <div style={s.sectionTitle}>Gerçekleşen işlemler</div>
              {patches.filter((p) => p.status === "done").length === 0 ? (
                <div style={s.ledgerEmpty}>Henüz gerçekleşen kazanç yok. Bir Patch’i uyguladığında burada görünür.</div>
              ) : patches.filter((p) => p.status === "done").map((p) => (
                <div key={p.id} style={s.ledgerRow}>
                  <div style={s.doneIcon}><Check size={15} /></div>
                  <div style={{flex:1}}><b>{p.title}</b><span>{p.kind}</span></div>
                  <strong>+{money.format(p.value)} TL</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        <section style={s.bottomCallout}>
          <div>
            <div style={s.callTitle}>Bu demo neyi test ediyor?</div>
            <div style={s.callText}>“Fırsat ara” davranışı yerine <b>bir şey at → ekonomik hata bul → tek hareket öner → gerçek sonucu kaydet</b> döngüsünü.</div>
          </div>
          <div style={s.callChip}><Sparkles size={16} /> Sonraki katman: gerçek kaynak motoru <ArrowRight size={16} /></div>
        </section>
      </section>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#07090d",color:"#f5f7fb",fontFamily:"Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",overflow:"hidden"},
  glowOne:{position:"fixed",width:520,height:520,borderRadius:"50%",background:"rgba(255,199,0,.07)",filter:"blur(100px)",top:-240,left:-120,pointerEvents:"none"},
  glowTwo:{position:"fixed",width:460,height:460,borderRadius:"50%",background:"rgba(77,124,255,.06)",filter:"blur(110px)",right:-220,top:160,pointerEvents:"none"},
  header:{height:76,borderBottom:"1px solid #171b22",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 clamp(20px,4vw,64px)",position:"relative",zIndex:2,background:"rgba(7,9,13,.78)",backdropFilter:"blur(14px)"},
  brandWrap:{display:"flex",alignItems:"center",gap:12},logo:{width:42,height:42,borderRadius:14,display:"grid",placeItems:"center",background:"#ffd000",color:"#0a0c10",boxShadow:"0 0 30px rgba(255,208,0,.12)"},
  brand:{fontWeight:900,fontSize:18,letterSpacing:"-.02em"},subbrand:{fontSize:11,color:"#7f8897",marginTop:2},headerActions:{display:"flex",alignItems:"center",gap:10},
  demoBadge:{display:"flex",alignItems:"center",gap:6,fontSize:10,fontWeight:900,letterSpacing:".08em",color:"#f6cd31",border:"1px solid #423a17",background:"#17150b",padding:"7px 10px",borderRadius:999},iconBtn:{width:36,height:36,borderRadius:11,border:"1px solid #202630",background:"#0c0f14",color:"#aab3c1",display:"grid",placeItems:"center"},
  shell:{width:"min(1160px,calc(100% - 32px))",margin:"0 auto",padding:"42px 0 80px",position:"relative",zIndex:1},heroGrid:{display:"grid",gridTemplateColumns:"minmax(0,1.65fr) minmax(280px,.75fr)",gap:16},
  heroCard:{border:"1px solid #1d232d",borderRadius:28,padding:"clamp(25px,4vw,48px)",background:"linear-gradient(145deg,#0f131a 0%,#0a0d12 70%)",boxShadow:"0 24px 80px rgba(0,0,0,.22)"},eyebrow:{display:"flex",alignItems:"center",gap:7,fontSize:11,fontWeight:900,color:"#ffd000",letterSpacing:".13em"},
  h1:{fontSize:"clamp(34px,5vw,62px)",lineHeight:.98,letterSpacing:"-.055em",margin:"18px 0 18px",maxWidth:760},heroText:{color:"#969fad",fontSize:15,lineHeight:1.7,maxWidth:700,margin:0},heroStats:{display:"flex",alignItems:"center",gap:24,marginTop:34,paddingTop:24,borderTop:"1px solid #1a2029",flexWrap:"wrap"},statLabel:{fontSize:11,color:"#717b8a",marginBottom:5},statValue:{fontWeight:900,fontSize:20,letterSpacing:"-.02em"},statDivider:{width:1,height:34,background:"#202631"},
  dropCard:{border:"1px dashed #47441e",borderRadius:28,padding:28,background:"linear-gradient(160deg,#15150b,#0d0f12 72%)",color:"#fff",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"center",cursor:"pointer",textAlign:"left",minHeight:300},dropIcon:{width:58,height:58,borderRadius:18,background:"#ffd000",color:"#090b0f",display:"grid",placeItems:"center",marginBottom:18},dropTitle:{fontWeight:900,fontSize:27,letterSpacing:"-.035em"},dropText:{fontSize:12,color:"#8d96a5",lineHeight:1.6,marginTop:7},dropButton:{display:"flex",gap:8,alignItems:"center",justifyContent:"center",width:"100%",boxSizing:"border-box",background:"#f2f4f7",color:"#080a0e",fontWeight:900,fontSize:12,padding:"12px 14px",borderRadius:12,marginTop:24},privacy:{display:"flex",alignItems:"center",gap:6,color:"#697383",fontSize:10,marginTop:11},
  scanBar:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,padding:"14px 17px",border:"1px solid #35431e",background:"#10150c",borderRadius:16,color:"#d8eea3"},scanBarDone:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,padding:"14px 17px",border:"1px solid #204936",background:"#0b1712",borderRadius:16,color:"#b8f7d5"},scanLeft:{display:"flex",alignItems:"center",gap:11,fontSize:12},scanName:{fontSize:10,opacity:.65,marginTop:2},closeScan:{background:"transparent",color:"inherit",border:0,cursor:"pointer"},
  tabs:{display:"flex",gap:5,margin:"30px 0 20px",borderBottom:"1px solid #1a2028",overflowX:"auto"},tab:{display:"flex",alignItems:"center",gap:8,border:0,background:"transparent",color:"#727c8b",fontSize:12,fontWeight:800,padding:"12px 15px",cursor:"pointer",whiteSpace:"nowrap"},tabActive:{display:"flex",alignItems:"center",gap:8,border:0,borderBottom:"2px solid #ffd000",background:"transparent",color:"#f5f7fb",fontSize:12,fontWeight:900,padding:"12px 15px",cursor:"pointer",whiteSpace:"nowrap"},
  sectionHead:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,marginBottom:14},sectionTitle:{fontWeight:900,fontSize:18,letterSpacing:"-.02em"},sectionDesc:{fontSize:11,color:"#707a88",marginTop:4},filterBadge:{display:"flex",alignItems:"center",gap:6,border:"1px solid #252b35",background:"#0c0f14",borderRadius:999,padding:"8px 10px",fontSize:10,color:"#a6afbc"},patchList:{display:"grid",gap:10},
  patch:{position:"relative",display:"grid",gridTemplateColumns:"minmax(0,1fr) 190px",gap:22,border:"1px solid #1b222c",borderRadius:22,background:"#0b0e13",padding:"22px 22px 22px 28px",overflow:"hidden"},rank:{position:"absolute",left:0,top:0,bottom:0,width:6,background:"#ffd000",fontSize:0},patchMain:{minWidth:0},patchTop:{display:"flex",alignItems:"center",gap:8},kind:{fontSize:9,fontWeight:900,letterSpacing:".12em",color:"#d7b61f",background:"#18160c",border:"1px solid #332f17",borderRadius:7,padding:"5px 7px"},watchBadge:{fontSize:9,fontWeight:900,color:"#a9c7ff",display:"flex",alignItems:"center",gap:4},patchTitle:{fontSize:19,letterSpacing:"-.025em",margin:"10px 0 7px"},patchWhy:{fontSize:12,color:"#838d9b",lineHeight:1.6,margin:"0 0 14px"},miniGrid:{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:7},mini:{background:"#0f1319",border:"1px solid #1c222b",borderRadius:10,padding:"9px 10px",minWidth:0},miniGridSpan:{},next:{display:"flex",gap:8,alignItems:"flex-start",fontSize:11,color:"#9ca6b4",marginTop:12,padding:"10px 11px",borderLeft:"2px solid #343b46",background:"#0d1015"},patchSide:{borderLeft:"1px solid #1c222b",paddingLeft:20,display:"flex",flexDirection:"column",alignItems:"stretch"},patchValue:{fontSize:24,fontWeight:950,letterSpacing:"-.04em",color:"#f8d13b",textAlign:"right"},patchPeriod:{fontSize:10,color:"#6d7684",textAlign:"right",marginTop:2},sideButtons:{display:"grid",gap:6,marginTop:"auto"},primary:{display:"flex",alignItems:"center",justifyContent:"center",gap:7,border:0,borderRadius:10,background:"#ffd000",color:"#080a0d",fontWeight:900,fontSize:11,padding:"10px",cursor:"pointer"},secondary:{display:"flex",alignItems:"center",justifyContent:"center",gap:7,border:"1px solid #29303a",borderRadius:10,background:"#12161c",color:"#c0c7d1",fontWeight:800,fontSize:11,padding:"9px",cursor:"pointer"},ghost:{border:0,background:"transparent",color:"#606977",fontSize:10,padding:5,cursor:"pointer"},empty:{border:"1px dashed #252c36",borderRadius:18,padding:44,display:"flex",flexDirection:"column",alignItems:"center",gap:8,color:"#7f8997",fontSize:12},
  graphCard:{border:"1px solid #1b222c",borderRadius:22,background:"#0b0e13",padding:22},addNode:{display:"flex",alignItems:"center",gap:6,border:"1px solid #2e3540",background:"#151a21",color:"#dce1e8",fontWeight:800,fontSize:11,borderRadius:10,padding:"9px 11px"},graphCenter:{height:430,position:"relative",border:"1px solid #171d25",borderRadius:18,backgroundImage:"radial-gradient(#242b36 1px,transparent 1px)",backgroundSize:"24px 24px",overflow:"hidden"},youNode:{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:116,height:116,borderRadius:"50%",background:"#ffd000",color:"#090b0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:"0 0 0 12px rgba(255,208,0,.05),0 0 70px rgba(255,208,0,.12)"},node:{position:"absolute",width:118,height:76,borderRadius:16,border:"1px solid #2d3541",background:"#10141a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,boxShadow:"0 10px 35px rgba(0,0,0,.2)"},nodeSmall:{position:"absolute",borderRadius:999,border:"1px solid #28303b",background:"#0e1217",padding:"9px 13px",fontWeight:800,fontSize:11,color:"#aeb7c4"},graphFooter:{display:"flex",alignItems:"center",gap:8,color:"#777f8d",fontSize:11,marginTop:12},
  ledgerGrid:{display:"grid",gridTemplateColumns:".8fr 1.2fr",gap:12},ledgerHero:{border:"1px solid #3c3516",background:"linear-gradient(145deg,#17150a,#0c0e12)",borderRadius:22,padding:28,minHeight:240,display:"flex",flexDirection:"column",justifyContent:"center"},ledgerLabel:{color:"#a7a178",fontSize:12,marginTop:16},ledgerTotal:{fontSize:47,fontWeight:950,letterSpacing:"-.055em",color:"#ffd000",marginTop:5},ledgerHint:{fontSize:10,color:"#676e78",marginTop:10},ledgerList:{border:"1px solid #1b222c",background:"#0b0e13",borderRadius:22,padding:22},ledgerEmpty:{fontSize:12,color:"#717a87",padding:"30px 4px"},ledgerRow:{display:"flex",alignItems:"center",gap:10,borderTop:"1px solid #1a2029",padding:"14px 2px",fontSize:11},doneIcon:{width:28,height:28,borderRadius:9,background:"#112219",color:"#77e4a5",display:"grid",placeItems:"center"},
  bottomCallout:{marginTop:24,border:"1px solid #1c222b",background:"#0a0d12",borderRadius:18,padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20},callTitle:{fontWeight:900,fontSize:13},callText:{fontSize:11,color:"#7f8896",lineHeight:1.6,marginTop:4},callChip:{display:"flex",alignItems:"center",gap:8,background:"#151407",color:"#d7bc34",border:"1px solid #302c13",padding:"9px 12px",borderRadius:999,fontSize:10,fontWeight:900,whiteSpace:"nowrap"},
};

// Responsive adjustments kept local so the prototype cannot disturb Tooldur's global UI.
if (typeof window !== "undefined") {
  const compact = window.innerWidth < 820;
  if (compact) {
    s.heroGrid.gridTemplateColumns = "1fr";
    s.patch.gridTemplateColumns = "1fr";
    s.patchSide.borderLeft = "0";
    s.patchSide.borderTop = "1px solid #1c222b";
    s.patchSide.paddingLeft = 0;
    s.patchSide.paddingTop = 14;
    s.patchValue.textAlign = "left";
    s.patchPeriod.textAlign = "left";
    s.miniGrid.gridTemplateColumns = "repeat(2,minmax(0,1fr))";
    s.ledgerGrid.gridTemplateColumns = "1fr";
    s.header.padding = "0 16px";
    s.demoBadge.display = "none";
    s.bottomCallout.flexDirection = "column";
    s.bottomCallout.alignItems = "flex-start";
    s.callChip.whiteSpace = "normal";
  }
}
