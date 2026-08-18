"use client";

import { useMemo, useRef, useState } from "react";
import {
  Activity, Banknote, Check, Clock3, Gauge, Layers3, Plus, Radar,
  ReceiptText, ScanSearch, Upload, WalletCards, X
} from "lucide-react";
import styles from "./page.module.css";

type PatchStatus = "open" | "watch" | "done" | "skip";
type Patch = {
  id: number; kind: string; title: string; value: number; period: string;
  confidence: number; effort: string; why: string; status: PatchStatus;
};
type MoneyNode = {
  id: string; label: string; type: string; x: number; y: number;
  detail: string; relations: string[]; patchValue?: number; parent?: string;
};

const fmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

const baseNodes: MoneyNode[] = [
  { id:"you", label:"Sen", type:"ekonomik merkez", x:50, y:50, detail:"Tüm gelir, gider, hak ve sözleşmelerin bağlandığı merkez.", relations:["Konum","Gelir","Aile","Varlık","Abonelik"] },
  { id:"city", label:"Bursa", type:"konum", x:18, y:23, detail:"Yerel belediye, ulaşım ve bölgesel fırsat kuralları bu düğümden çalışır.", relations:["Yerel destek","Belediye","Ulaşım"], parent:"you" },
  { id:"work", label:"Çalışan", type:"gelir", x:82, y:23, detail:"Ücret, SGK, işveren yan hakları ve çalışan hakları bu düğüme bağlıdır.", relations:["Maaş","SGK","İşveren hakkı"], parent:"you" },
  { id:"car", label:"Araç", type:"gider / varlık", x:16, y:77, detail:"Sigorta, bakım, vergi ve yakıt maliyetlerini yeniden hesaplatır.", relations:["Sigorta","MTV","Bakım","Yakıt"], parent:"you" },
  { id:"family", label:"Aile", type:"yaşam olayı", x:84, y:77, detail:"Çocuk, eş ve hane değişiklikleri ilgili hak kurallarını yeniden tetikler.", relations:["Çocuk","Kreş","Aile desteği"], parent:"you" },
  { id:"internet", label:"İnternet", type:"sözleşme", x:37, y:16, detail:"Taahhüt bitişi, paket bedeli ve alternatif fiyatları karşılaştırır.", relations:["Taahhüt","Tarife","Fesih"], parent:"you" },
  { id:"subs", label:"Abonelikler", type:"tekrarlayan ödeme", x:63, y:85, detail:"Kullanılmayan veya pahalı tekrarlayan ödemeleri izler.", relations:["Dijital üyelik","Telefon","TV"], parent:"you" },
  { id:"p1", label:"+2.292 TL", type:"patch", x:31, y:35, detail:"İnternet taahhüdü sonrası daha ucuz pakete geçiş potansiyeli.", relations:["İnternet"], patchValue:2292, parent:"internet" },
  { id:"p2", label:"+1.188 TL", type:"patch", x:70, y:68, detail:"Kullanılmayan tekrarlayan üyeliği kapatma potansiyeli.", relations:["Abonelikler"], patchValue:1188, parent:"subs" },
  { id:"p3", label:"+480 TL", type:"patch", x:75, y:48, detail:"Teslimat gecikmesi için olası iade / kupon sonucu.", relations:["Alışveriş","İade"], patchValue:480, parent:"you" },
];

const initialPatches: Patch[] = [
  { id:1, kind:"FATURA", title:"İnternet taahhüdü bitince daha ucuz pakete geç", value:2292, period:"/ yıl", confidence:94, effort:"4 dk", why:"Benzer hızdaki alternatif ile mevcut ödeme arasında yaklaşık 191 TL/ay fark var.", status:"open" },
  { id:2, kind:"İADE", title:"Teslimat gecikmesi için iade / kupon hakkını kontrol et", value:480, period:"tek sefer", confidence:87, effort:"3 dk", why:"Sipariş tarihi ile vaat edilen teslim süresi arasında aşım sinyali var.", status:"open" },
  { id:3, kind:"ABONELİK", title:"Kullanılmayan üyeliği kapat", value:1188, period:"/ yıl", confidence:81, effort:"2 dk", why:"Aylık 99 TL tekrarlayan ödeme var; kullanım teyidi bekleniyor.", status:"open" },
];

export default function KazancRadariPage(){
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab,setTab] = useState<"today"|"graph"|"ledger">("graph");
  const [patches,setPatches] = useState<Patch[]>(initialPatches);
  const [nodes,setNodes] = useState<MoneyNode[]>(baseNodes);
  const [selected,setSelected] = useState("you");
  const [modal,setModal] = useState(false);
  const [newType,setNewType] = useState("gider");
  const [newLabel,setNewLabel] = useState("");
  const [scan,setScan] = useState<string | null>(null);

  const open = useMemo(()=>patches.filter(p=>p.status==="open"||p.status==="watch"),[patches]);
  const potential = useMemo(()=>open.reduce((a,p)=>a+p.value,0),[open]);
  const realized = useMemo(()=>patches.filter(p=>p.status==="done").reduce((a,p)=>a+p.value,0),[patches]);
  const selectedNode = nodes.find(n=>n.id===selected) || nodes[0];

  const setStatus=(id:number,status:PatchStatus)=>setPatches(v=>v.map(p=>p.id===id?{...p,status}:p));

  const addNode=()=>{
    const label=newLabel.trim(); if(!label) return;
    const slots=[[24,50],[76,50],[30,75],[70,25],[50,12],[50,88]];
    const [x,y]=slots[(nodes.length-baseNodes.length)%slots.length];
    const node:MoneyNode={id:`custom-${Date.now()}`,label,type:newType,x,y,detail:`${label} bilgisi eklendi. Buna bağlı ekonomik kurallar gerçek veri motorunda yeniden hesaplanacak.`,relations:[newType],parent:"you"};
    setNodes(v=>[...v,node]); setSelected(node.id); setNewLabel(""); setModal(false);
  };

  const scanFile=(f?:File)=>{
    if(!f) return; setScan(`${f.name} taranıyor…`);
    window.setTimeout(()=>{
      const id=Date.now();
      setPatches(v=>[{id,kind:"BELGE",title:"Belgeden yeni ekonomik kontrol adayı çıktı",value:720,period:"potansiyel",confidence:74,effort:"5 dk",why:"Demo; canlı sürümde tutar ve hak resmi kaynakla doğrulanmadan sonuç sayılmayacak.",status:"open"},...v]);
      setScan(`${f.name}: 1 kontrol adayı bulundu`); setTab("today");
    },700);
  };

  return <main className={styles.page}><div className={styles.shell}>
    <div className={styles.topbar}>
      <div className={styles.brand}><div className={styles.mark}><Radar size={22}/></div><div><h1>Kazanç Radarı</h1><p>Kişisel ekonomik debugger · ürün prototipi</p></div></div>
      <div className={styles.demo}>V2 · INTERACTIVE</div>
    </div>

    <section className={styles.hero}>
      <div className={styles.heroCard}>
        <div className={styles.eyebrow}>BUGÜN SENİN İÇİN</div>
        <h2>Paranın nerede kaçtığını<br/>sana sormadan bul.</h2>
        <p>Destek listesi değil. Hayatındaki bilgi, belge ve değişiklikleri ekonomik ilişkilere bağlar; uygulanabilir Patch üretir.</p>
        <div className={styles.stats}>
          <div className={styles.stat}><small>Açık potansiyel</small><strong>+{fmt.format(potential)} TL</strong></div>
          <div className={styles.stat}><small>Bekleyen Patch</small><strong>{open.length}</strong></div>
          <div className={styles.stat}><small>Gerçekleşen</small><strong>+{fmt.format(realized)} TL</strong></div>
        </div>
      </div>
      <div className={styles.uploadCard}>
        <input ref={fileRef} type="file" hidden accept="image/*,.pdf,.txt" onChange={e=>scanFile(e.target.files?.[0])}/>
        <div className={styles.uploadIcon}><ScanSearch size={28}/></div><b>Bir şey at</b>
        <span>Fatura · fiş · sözleşme · PDF · ekran görüntüsü</span>
        <button className={styles.uploadBtn} onClick={()=>fileRef.current?.click()}><Upload size={15}/> Tara ve para kaçağı ara</button>
      </div>
    </section>
    {scan && <div className={styles.scan}><Activity size={14} style={{verticalAlign:"middle",marginRight:7}}/>{scan}</div>}

    <nav className={styles.tabs}>
      <button className={`${styles.tab} ${tab==="today"?styles.active:""}`} onClick={()=>setTab("today")}><Gauge size={16}/>Bugün</button>
      <button className={`${styles.tab} ${tab==="graph"?styles.active:""}`} onClick={()=>setTab("graph")}><Layers3 size={16}/>Para grafiğim</button>
      <button className={`${styles.tab} ${tab==="ledger"?styles.active:""}`} onClick={()=>setTab("ledger")}><WalletCards size={16}/>Kazanç defteri</button>
    </nav>

    {tab==="graph" && <section className={styles.graphCard}>
      <div className={styles.sectionHead}><div><h3>Household Money Graph</h3><p>Her düğüm gerçek bir ekonomik ilişkiyi temsil eder. Sarı küçük düğümler üretilen Patch değerleridir.</p></div><button className={styles.addBtn} onClick={()=>setModal(true)}><Plus size={15}/>Bilgi ekle</button></div>
      <div className={styles.canvasWrap}><div className={styles.canvas}>
        <svg className={styles.links} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {nodes.filter(n=>n.parent).map(n=>{const p=nodes.find(x=>x.id===n.parent)!;return <line key={n.id} x1={p.x} y1={p.y} x2={n.x} y2={n.y} className={n.patchValue?styles.linkHot:styles.link}/>})}
        </svg>
        {nodes.map(n=><button key={n.id} onClick={()=>setSelected(n.id)} style={{left:`${n.x}%`,top:`${n.y}%`}} className={`${styles.node} ${n.id==="you"?styles.centerNode:""} ${n.type==="sözleşme"||n.type==="tekrarlayan ödeme"?styles.smallNode:""} ${n.patchValue?styles.patchNode:""} ${selected===n.id?styles.nodeSelected:""}`}>
          {n.id==="you" && <Banknote size={20}/>}<b>{n.label}</b><span>{n.type}</span>
        </button>)}
      </div></div>
      <div className={styles.graphBottom}>
        <div className={styles.nodeDetail}><small>SEÇİLİ DÜĞÜM</small><h4>{selectedNode.label}</h4><p>{selectedNode.detail}</p><div className={styles.relationList}>{selectedNode.relations.map(r=><span className={styles.chip} key={r}>{r}</span>)}</div></div>
        <div className={styles.logicBox}><small>HESAPLAMA MANTIĞI</small><p>Bir düğüm değiştiğinde yalnızca bağlı kurallar çalışır. Böylece “herkese her şeyi göster” yerine o hanenin ekonomik grafiğinde değişen ilişkiler tekrar hesaplanır.</p></div>
      </div>
      <div className={styles.footerNote}><b>Grafik artık dekor değil:</b> çizgiler ilişkiyi, sarı düğümler parasal sonucu, tıklanan kart ise hangi kuralların etkilendiğini gösteriyor.</div>
    </section>}

    {tab==="today" && <section>
      <div className={styles.sectionHead}><div><h3>Öncelikli Patch’ler</h3><p>Değer × güven ÷ efor mantığıyla sırala.</p></div></div>
      <div className={styles.patchList}>{open.map(p=><article className={styles.patch} key={p.id}>
        <div><div className={styles.kind}>{p.kind}</div><h4>{p.title}</h4><p>{p.why}</p><div className={styles.metrics}><span className={styles.metric}>Güven %{p.confidence}</span><span className={styles.metric}>Efor {p.effort}</span><span className={styles.metric}>{p.status==="watch"?"Takipte":"Açık"}</span></div></div>
        <div className={styles.patchSide}><div className={styles.value}>+{fmt.format(p.value)} TL <small>{p.period}</small></div><div className={styles.actions}><button className={styles.primary} onClick={()=>setStatus(p.id,"done")}><Check size={13}/> Uyguladım</button><button className={styles.secondary} onClick={()=>setStatus(p.id,"watch")}><Clock3 size={13}/> Takibe al</button><button className={styles.ghost} onClick={()=>setStatus(p.id,"skip")}>Geç</button></div></div>
      </article>)}</div>
    </section>}

    {tab==="ledger" && <section className={styles.ledger}>
      <div className={styles.ledgerCard}><ReceiptText size={22}/><div className={styles.footerNote}>Kazanç Radarı bugüne kadar cebinde bıraktı</div><div className={styles.ledgerTotal}>+{fmt.format(realized)} TL</div><div className={styles.footerNote}>Sadece gerçekten uygulanan sonuçlar sayılır.</div></div>
      <div className={styles.ledgerCard}><h3 style={{marginTop:0}}>Gerçekleşen işlemler</h3>{patches.filter(p=>p.status==="done").length===0?<div className={styles.empty}>Henüz gerçekleşen kazanç yok.</div>:patches.filter(p=>p.status==="done").map(p=><div className={styles.ledgerRow} key={p.id}><Check size={15}/><span>{p.title}</span><strong>+{fmt.format(p.value)} TL</strong></div>)}</div>
    </section>}
  </div>

  {modal && <div className={styles.modalBack} onMouseDown={()=>setModal(false)}><div className={styles.modal} onMouseDown={e=>e.stopPropagation()}>
    <div className={styles.modalHead}><h3>Ekonomik bilgi ekle</h3><button className={styles.close} onClick={()=>setModal(false)}><X size={18}/></button></div>
    <div className={styles.field}><label>TÜR</label><select value={newType} onChange={e=>setNewType(e.target.value)}><option value="gider">Gider</option><option value="gelir">Gelir</option><option value="varlık">Varlık</option><option value="sözleşme">Sözleşme</option><option value="yaşam olayı">Yaşam olayı</option></select></div>
    <div className={styles.field}><label>BİLGİ</label><input value={newLabel} onChange={e=>setNewLabel(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNode()} placeholder="Örn. Kiracı, özel sağlık sigortası, kreş…" autoFocus/></div>
    <button className={styles.save} onClick={addNode}>Grafa ekle ve yeniden hesapla</button>
  </div></div>}
  </main>;
}
