"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import {
  ArrowLeft, Calculator, CheckCircle2, AlertTriangle, XCircle, Info
} from "lucide-react";
import { sanitizeSvgContent } from '@/lib/security';

// ─── VERİTABANI ───────────────────────────────────────────────
const BOLT_GRADES: Record<string, { fyb:number; fub:number }> = {
  "4.6":  { fyb:240,  fub:400  },
  "5.6":  { fyb:300,  fub:500  },
  "6.8":  { fyb:480,  fub:600  },
  "8.8":  { fyb:640,  fub:800  },
  "10.9": { fyb:900,  fub:1000 },
  "12.9": { fyb:1080, fub:1200 },
};

const BOLT_SIZES: Record<string, { As:number; d0:number; e1min:number; p1min:number }> = {
  "M8":  { As:36.6,  d0:9,   e1min:13.5, p1min:18  },
  "M10": { As:58.0,  d0:11,  e1min:16.5, p1min:22  },
  "M12": { As:84.3,  d0:13,  e1min:19.5, p1min:26  },
  "M16": { As:157,   d0:18,  e1min:27,   p1min:36  },
  "M20": { As:245,   d0:22,  e1min:33,   p1min:44  },
  "M24": { As:353,   d0:26,  e1min:39,   p1min:52  },
  "M27": { As:459,   d0:30,  e1min:45,   p1min:60  },
  "M30": { As:561,   d0:33,  e1min:49.5, p1min:66  },
  "M36": { As:817,   d0:39,  e1min:58.5, p1min:78  },
};

const WELD_STEEL: Record<string, { fu:number }> = {
  "S235": { fu:360 },
  "S275": { fu:430 },
  "S355": { fu:490 },
};

// γ_M2 = 1.25 (EN 1993-1-8)
const GM2 = 1.25;
const GM0 = 1.0;

// ─── TİPLER ──────────────────────────────────────────────────
interface BoltResult {
  Fv_Rd: number;   // kesme direnci
  Fb_Rd: number;   // ezilme direnci
  Ft_Rd: number;   // çekme direnci
  n_kesme: number; // gereken bulon sayısı (kesme)
  n_ezilme:number; // gereken bulon sayısı (ezilme)
  n_req: number;   // max
  eta_V: number;
  isOK: boolean;
  warnings: string[];
}

interface WeldResult {
  Fw_Rd: number;   // kaynak birim direnci (kN/mm)
  L_req: number;   // gereken kaynak boyu
  L_min: number;   // min kaynak boyu (6*a veya 30mm)
  eta: number;
  isOK: boolean;
  warnings: string[];
}

// ─── SVG ─────────────────────────────────────────────────────
function BoltSVG({ n, size, grade }: { n:number; size:string; grade:string }) {
  const W=280, H=200;
  const cols = Math.min(n, 4), rows = Math.ceil(n/4);
  const boltR = 8;
  const spacingX = 40, spacingY = 40;
  const startX = W/2 - (cols-1)*spacingX/2;
  const startY = H/2 - (rows-1)*spacingY/2;

  let bolts = "";
  for (let i=0; i<n; i++) {
    const col = i % cols, row = Math.floor(i/cols);
    const x = startX + col*spacingX;
    const y = startY + row*spacingY;
    bolts += `
      <circle cx="${x}" cy="${y}" r="${boltR+3}" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      <circle cx="${x}" cy="${y}" r="${boltR}" fill="#334155" stroke="#1e293b" stroke-width="1"/>
      <circle cx="${x}" cy="${y}" r="${boltR-3}" fill="none" stroke="#64748b" stroke-width="0.8"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="background:#f8fafc;font-family:monospace">
    <rect width="${W}" height="${H}" fill="#f8fafc"/>
    <rect x="1" y="1" width="${W-2}" height="${H-2}" fill="none" stroke="#e2e8f0" stroke-width="1.5" rx="4"/>
    <text x="${W/2}" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#1e293b">BULON DÜZENİ</text>
    <text x="${W/2}" y="28" text-anchor="middle" font-size="8" fill="#64748b">${n}× ${size} — Sınıf ${grade}</text>
    <!-- Levha arka plan -->
    <rect x="${startX-boltR-20}" y="${startY-boltR-15}" width="${(cols-1)*spacingX+boltR*2+40}" height="${(rows-1)*spacingY+boltR*2+30}" fill="#dbeafe" stroke="#93c5fd" stroke-width="1.5" rx="4" opacity="0.7"/>
    ${bolts}
    <text x="${W/2}" y="${H-5}" text-anchor="middle" font-size="7" fill="#cbd5e1">tooldur.com</text>
  </svg>`;
}

function WeldSVG({ a, L, fu }: { a:number; L:number; fu:number }) {
  const W=280, H=200;
  const bx=50, by=100, bw=180, bh=30;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="background:#f8fafc;font-family:monospace">
    <rect width="${W}" height="${H}" fill="#f8fafc"/>
    <rect x="1" y="1" width="${W-2}" height="${H-2}" fill="none" stroke="#e2e8f0" stroke-width="1.5" rx="4"/>
    <text x="${W/2}" y="16" text-anchor="middle" font-size="10" font-weight="700" fill="#1e293b">KAYNAK DETAYı</text>
    <text x="${W/2}" y="28" text-anchor="middle" font-size="8" fill="#64748b">a=${a}mm · L=${L.toFixed(0)}mm · fu=${fu}MPa</text>
    <!-- Alt levha -->
    <rect x="${bx}" y="${by+bh}" width="${bw}" height="20" fill="#bfdbfe" stroke="#334155" stroke-width="1.5"/>
    <!-- Dikey levha -->
    <rect x="${W/2-10}" y="${by-50}" width="20" height="${bh+50}" fill="#bfdbfe" stroke="#334155" stroke-width="1.5"/>
    <!-- Kaynak dikişi (sarı üçgen) -->
    <polygon points="${bx},${by+bh} ${bx+12},${by+bh} ${bx},${by+bh+12}" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
    <polygon points="${bx+bw},${by+bh} ${bx+bw-12},${by+bh} ${bx+bw},${by+bh+12}" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>
    <!-- Kaynak uzunluk boyutu -->
    <line x1="${bx}" y1="${by+bh+38}" x2="${bx+bw}" y2="${by+bh+38}" stroke="#3b82f6" stroke-width="1.2"/>
    <polygon points="${bx},${by+bh+38} ${bx+8},${by+bh+35} ${bx+8},${by+bh+41}" fill="#3b82f6"/>
    <polygon points="${bx+bw},${by+bh+38} ${bx+bw-8},${by+bh+35} ${bx+bw-8},${by+bh+41}" fill="#3b82f6"/>
    <text x="${W/2}" y="${by+bh+52}" text-anchor="middle" font-size="9" font-weight="700" fill="#1d4ed8">L=${L.toFixed(0)} mm</text>
    <!-- a boyutu -->
    <text x="${W/2}" y="${by-10}" text-anchor="middle" font-size="9" fill="#92400e">a = ${a} mm</text>
    <text x="${W/2}" y="${H-5}" text-anchor="middle" font-size="7" fill="#cbd5e1">tooldur.com</text>
  </svg>`;
}

export default function BaglantiPage() {
  const { saveCalculation } = useCalculationHistory();
  const [mode, setMode] = useState<"bulon"|"kaynak">("bulon");

  // Bulon girdileri
  const [boltSize,  setBoltSize]  = useState("M16");
  const [boltGrade, setBoltGrade] = useState("8.8");
  const [nShear,    setNShear]    = useState("1");   // kesme düzlemi sayısı
  const [tp,        setTp]        = useState("10");  // levha kalınlığı mm
  const [Vsd,       setVsd]       = useState("100"); // tasarım kesme kN
  const [boltSteel, setBoltSteel] = useState("S275");
  const [boltResult, setBoltResult] = useState<BoltResult|null>(null);
  const [boltSVG,   setBoltSVG]   = useState("");

  // Kaynak girdileri
  const [weldA,     setWeldA]     = useState("6");    // boğaz mm
  const [weldL,     setWeldL]     = useState("100");  // mevcut boy mm
  const [weldSteel, setWeldSteel] = useState("S355");
  const [Fsd,       setFsd]       = useState("80");   // kN
  const [weldResult,setWeldResult] = useState<WeldResult|null>(null);
  const [weldSVGStr,setWeldSVGStr] = useState("");
  const safeBoltSvg = sanitizeSvgContent(boltSVG);
  const safeWeldSvg = sanitizeSvgContent(weldSVGStr);

  // ─── BULON HESABI ─────────────────────────────────────────
  const calcBolt = useCallback(() => {
    const bolt = BOLT_SIZES[boltSize];
    const gr   = BOLT_GRADES[boltGrade];
    const st   = WELD_STEEL[boltSteel];
    const ns   = parseInt(nShear) || 1;
    const t    = parseFloat(tp) || 10;
    const V    = parseFloat(Vsd) || 0;

    // Kesme direnci (EN 1993-1-8 §3.6)
    // αv = 0.6 for 4.6/5.6/6.8, 0.5 for 8.8/10.9/12.9 (threaded part)
    const alphaV = ["8.8","10.9","12.9"].includes(boltGrade) ? 0.5 : 0.6;
    const Fv_Rd = (alphaV * gr.fub * bolt.As) / (GM2 * 1000); // kN

    // Ezilme direnci (k1=2.5, αb=min(e1/3d0, fub/fu, 1))
    const d  = parseFloat(boltSize.replace("M",""));
    const e1 = bolt.e1min * 1.5; // tipik kenar mesafesi
    const alphaB = Math.min(e1/(3*bolt.d0), gr.fub/st.fu, 1.0);
    const k1 = 2.5;
    const Fb_Rd = (k1 * alphaB * st.fu * d * t) / (GM2 * 1000); // kN

    // Çekme direnci
    const Ft_Rd = (0.9 * gr.fub * bolt.As) / (GM2 * 1000); // kN

    const Fv_one = ns * Math.min(Fv_Rd, Fb_Rd);
    const n_kesme  = Math.ceil(V / (ns * Fv_Rd));
    const n_ezilme = Math.ceil(V / Fb_Rd);
    const n_req    = Math.max(n_kesme, n_ezilme, 1);
    const eta_V    = V / (n_req * Fv_one);

    const warnings: string[] = [];
    if (eta_V > 1.0) warnings.push("Kapasite aşıldı — bulon sayısını artırın");
    if (n_req > 20)  warnings.push("Çok sayıda bulon — profil büyütmeyi düşünün");
    if (t < bolt.d0/2) warnings.push("Levha çok ince — delik ezilmesi kritik");

    const res: BoltResult = { Fv_Rd, Fb_Rd, Ft_Rd, n_kesme, n_ezilme, n_req, eta_V, isOK: warnings.length===0, warnings };
    setBoltResult(res);
    setBoltSVG(BoltSVG({ n:n_req, size:boltSize, grade:boltGrade }));

    saveCalculation({
      toolSlug:"baglanti-bulonlu", toolName:"Bulonlu Birleşim", category:"insaat",
      inputs:{ "Bulon":boltSize, "Sınıf":boltGrade, "N_s":ns, "tp(mm)":t, "V_Ed(kN)":V },
      outputs:{ "F_v,Rd(kN)":+Fv_Rd.toFixed(2), "F_b,Rd(kN)":+Fb_Rd.toFixed(2), "n_req":n_req, "η(%)":+(eta_V*100).toFixed(1) },
      summary:`${n_req}× ${boltSize} Sınıf${boltGrade}, V=${V}kN → η=${(eta_V*100).toFixed(0)}%`,
    });
  }, [boltSize, boltGrade, nShear, tp, Vsd, boltSteel, saveCalculation]);

  // ─── KAYNAK HESABI ────────────────────────────────────────
  const calcWeld = useCallback(() => {
    const a  = parseFloat(weldA) || 6;
    const L  = parseFloat(weldL) || 100;
    const F  = parseFloat(Fsd)   || 0;
    const st = WELD_STEEL[weldSteel];

    // EN 1993-1-8 §4.5.3 — köşe kaynağı
    // f_vw,d = fu / (√3 · βw · γM2)
    // βw = 0.8 (S235), 0.85 (S275), 0.9 (S355)
    const betaW = weldSteel==="S235" ? 0.8 : weldSteel==="S275" ? 0.85 : 0.9;
    const fvw_d = st.fu / (Math.sqrt(3) * betaW * GM2); // MPa

    const Fw_Rd = fvw_d * a / 1000; // kN/mm

    const L_req = F / Fw_Rd;  // mm
    const L_min = Math.max(6*a, 30); // EN 1993-1-8 §4.5.1

    const eta = L > 0 ? F / (Fw_Rd * L) : 0;

    const warnings: string[] = [];
    if (eta > 1.0)      warnings.push(`Mevcut kaynak yetersiz — L_req=${L_req.toFixed(0)}mm gerekli`);
    if (L < L_min)      warnings.push(`Kaynak boyu min ${L_min.toFixed(0)}mm olmalı (6a veya 30mm)`);
    if (a < 3)          warnings.push("Boğaz kalınlığı a ≥ 3mm olmalı");
    if (a > 0.7*parseFloat(tp||"10")) warnings.push("a > 0.7·t_min — boğaz fazla büyük");

    const res: WeldResult = { Fw_Rd, L_req, L_min, eta, isOK:warnings.length===0, warnings };
    setWeldResult(res);
    setWeldSVGStr(WeldSVG({ a, L:Math.max(L, L_req), fu:st.fu }));

    saveCalculation({
      toolSlug:"baglanti-kaynakli", toolName:"Kaynaklı Birleşim", category:"insaat",
      inputs:{ "a(mm)":a, "L(mm)":L, "Çelik":weldSteel, "F_Ed(kN)":F },
      outputs:{ "F_w,Rd(kN/mm)":+Fw_Rd.toFixed(3), "L_req(mm)":+L_req.toFixed(0), "η(%)":+(eta*100).toFixed(1) },
      summary:`a=${a}mm, L=${L}mm, ${weldSteel} → F_w,Rd=${Fw_Rd.toFixed(3)}kN/mm, η=${(eta*100).toFixed(0)}%`,
    });
  }, [weldA, weldL, Fsd, weldSteel, tp, saveCalculation]);

  const StatusIcon = ({ ok, warn }: { ok:boolean; warn:boolean }) =>
    ok && !warn ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0"/>
    : !ok ? <XCircle size={18} className="text-red-500 flex-shrink-0"/>
    : <AlertTriangle size={18} className="text-amber-500 flex-shrink-0"/>;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-base)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-600 transition-all shadow-sm">
            <ArrowLeft size={16}/>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Bağlantı Detayları</h1>
            <p className="text-slate-400 text-xs">Bulonlu & Kaynaklı Birleşim · EN 1993-1-8</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          {(["bulon","kaynak"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${mode===m ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-500 border-slate-200 hover:border-primary-300"}`}>
              {m==="bulon" ? "🔩 Bulonlu Birleşim" : "🔥 Kaynaklı Birleşim"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* SOL */}
          <div className="lg:col-span-2 space-y-4">

            {mode === "bulon" ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bulon Parametreleri</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bulon Çapı</label>
                    <select value={boltSize} onChange={e=>setBoltSize(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {Object.keys(BOLT_SIZES).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mukavemet Sınıfı</label>
                    <select value={boltGrade} onChange={e=>setBoltGrade(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {Object.keys(BOLT_GRADES).map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Levha Çeliği</label>
                    <select value={boltSteel} onChange={e=>setBoltSteel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {Object.keys(WELD_STEEL).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Kesme Düzlemi</label>
                    <select value={nShear} onChange={e=>setNShear(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="1">Tek kesme</option>
                      <option value="2">Çift kesme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Levha t (mm)</label>
                    <input type="number" value={tp} onChange={e=>setTp(e.target.value)} placeholder="10"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">V_Ed (kN)</label>
                    <input type="number" value={Vsd} onChange={e=>setVsd(e.target.value)} placeholder="100"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  </div>
                </div>

                {/* Bulon özellikleri */}
                {BOLT_SIZES[boltSize] && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div><p className="text-blue-400">As</p><p className="font-bold text-blue-700">{BOLT_SIZES[boltSize].As} mm²</p></div>
                    <div><p className="text-blue-400">d0</p><p className="font-bold text-blue-700">{BOLT_SIZES[boltSize].d0} mm</p></div>
                    <div><p className="text-blue-400">fub</p><p className="font-bold text-blue-700">{BOLT_GRADES[boltGrade].fub} MPa</p></div>
                  </div>
                )}

                <button onClick={calcBolt}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                  <Calculator size={15}/> Hesapla
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kaynak Parametreleri</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Çelik</label>
                    <select value={weldSteel} onChange={e=>setWeldSteel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                      {Object.keys(WELD_STEEL).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Boğaz a (mm)</label>
                    <input type="number" value={weldA} onChange={e=>setWeldA(e.target.value)} placeholder="6"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mevcut L (mm)</label>
                    <input type="number" value={weldL} onChange={e=>setWeldL(e.target.value)} placeholder="100"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">F_Ed (kN)</label>
                    <input type="number" value={Fsd} onChange={e=>setFsd(e.target.value)} placeholder="80"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  </div>
                </div>

                <button onClick={calcWeld}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
                  <Calculator size={15}/> Hesapla
                </button>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2">
              <Info size={12} className="text-amber-500 flex-shrink-0 mt-0.5"/>
              <p className="text-xs text-amber-700">EN 1993-1-8 · γ_M2=1.25 · Köşe kaynağı (fillet weld) · Sismik kontrol dahil değil</p>
            </div>
          </div>

          {/* SAĞ */}
          <div className="lg:col-span-3 space-y-4">

            {mode === "bulon" && boltResult && (
              <>
                <div className={`p-3 rounded-2xl flex items-center gap-3 border ${boltResult.isOK ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <StatusIcon ok={boltResult.isOK} warn={false}/>
                  <div>
                    <p className={`text-sm font-bold ${boltResult.isOK?"text-emerald-700":"text-red-700"}`}>
                      {boltResult.isOK ? `${boltResult.n_req}× ${boltSize} bulon yeterli ✓` : "Kapasite yetersiz — düzenleme gerekli"}
                    </p>
                    {boltResult.warnings.map((w,i) => <p key={i} className="text-xs text-red-600">{w}</p>)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { lbl:"F_v,Rd",  val:boltResult.Fv_Rd.toFixed(1),  unit:"kN",  sub:"Tek bulon kesme", c:"blue" },
                    { lbl:"F_b,Rd",  val:boltResult.Fb_Rd.toFixed(1),  unit:"kN",  sub:"Tek bulon ezilme", c:"orange" },
                    { lbl:"F_t,Rd",  val:boltResult.Ft_Rd.toFixed(1),  unit:"kN",  sub:"Tek bulon çekme", c:"purple" },
                    { lbl:"n_req",   val:String(boltResult.n_req),      unit:"adet",sub:"Gereken bulon", c:boltResult.isOK?"emerald":"red" },
                    { lbl:"η",       val:`${(boltResult.eta_V*100).toFixed(1)}%`, unit:"", sub:"Kullanım oranı", c:boltResult.eta_V<=1?"emerald":"red" },
                    { lbl:"Kapasite",val:`${(boltResult.n_req * Math.min(boltResult.Fv_Rd, boltResult.Fb_Rd)).toFixed(0)}`, unit:"kN", sub:"Toplam n×min(Fv,Fb)", c:"blue" },
                  ].map((r,i) => {
                    const cc: Record<string,string> = {
                      blue:"bg-blue-50 border-blue-100 text-blue-700",
                      orange:"bg-orange-50 border-orange-100 text-orange-700",
                      purple:"bg-purple-50 border-purple-100 text-purple-700",
                      emerald:"bg-emerald-50 border-emerald-100 text-emerald-700",
                      red:"bg-red-50 border-red-200 text-red-700",
                    };
                    return (
                      <div key={i} className={`rounded-2xl border p-3 ${cc[r.c]}`}>
                        <p className="text-xs opacity-60 mb-0.5">{r.lbl}</p>
                        <p className="text-lg font-bold">{r.val}<span className="text-xs font-normal ml-1 opacity-70">{r.unit}</span></p>
                        <p className="text-xs opacity-50">{r.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {boltSVG && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex justify-center">
                    <div dangerouslySetInnerHTML={{ __html: safeBoltSvg }}/>
                  </div>
                )}
              </>
            )}

            {mode === "kaynak" && weldResult && (
              <>
                <div className={`p-3 rounded-2xl flex items-center gap-3 border ${weldResult.isOK ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                  <StatusIcon ok={weldResult.isOK} warn={false}/>
                  <div>
                    <p className={`text-sm font-bold ${weldResult.isOK?"text-emerald-700":"text-red-700"}`}>
                      {weldResult.isOK ? `a=${weldA}mm, L=${weldL}mm kaynak yeterli ✓` : `L_req=${weldResult.L_req.toFixed(0)}mm gerekli`}
                    </p>
                    {weldResult.warnings.map((w,i) => <p key={i} className="text-xs text-red-600">{w}</p>)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { lbl:"F_w,Rd",  val:weldResult.Fw_Rd.toFixed(3), unit:"kN/mm", sub:"Birim kaynak direnci", c:"blue" },
                    { lbl:"L_req",   val:weldResult.L_req.toFixed(0),  unit:"mm",    sub:"Gereken kaynak boyu", c:weldResult.eta<=1?"emerald":"red" },
                    { lbl:"L_min",   val:weldResult.L_min.toFixed(0),  unit:"mm",    sub:"Min boy (6a / 30mm)", c:"orange" },
                    { lbl:"η",       val:`${(weldResult.eta*100).toFixed(1)}%`, unit:"", sub:"Kullanım oranı", c:weldResult.eta<=1?"emerald":"red" },
                    { lbl:"f_vw,d",  val:(weldResult.Fw_Rd*1000/parseFloat(weldA||"6")).toFixed(1), unit:"MPa", sub:"Tasarım dayanımı", c:"purple" },
                    { lbl:"Kapasite",val:(weldResult.Fw_Rd*parseFloat(weldL||"100")).toFixed(1), unit:"kN", sub:`${weldL}mm kaynak`, c:"blue" },
                  ].map((r,i) => {
                    const cc: Record<string,string> = {
                      blue:"bg-blue-50 border-blue-100 text-blue-700",
                      orange:"bg-orange-50 border-orange-100 text-orange-700",
                      purple:"bg-purple-50 border-purple-100 text-purple-700",
                      emerald:"bg-emerald-50 border-emerald-100 text-emerald-700",
                      red:"bg-red-50 border-red-200 text-red-700",
                    };
                    return (
                      <div key={i} className={`rounded-2xl border p-3 ${cc[r.c]}`}>
                        <p className="text-xs opacity-60 mb-0.5">{r.lbl}</p>
                        <p className="text-lg font-bold">{r.val}<span className="text-xs font-normal ml-1 opacity-70">{r.unit}</span></p>
                        <p className="text-xs opacity-50">{r.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {weldSVGStr && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex justify-center">
                    <div dangerouslySetInnerHTML={{ __html: safeWeldSvg }}/>
                  </div>
                )}
              </>
            )}

            {((mode==="bulon" && !boltResult) || (mode==="kaynak" && !weldResult)) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center min-h-64">
                <div className="text-center text-slate-300">
                  <Calculator size={32} className="mx-auto mb-2"/>
                  <p className="text-sm">Hesapla butonuna bas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}