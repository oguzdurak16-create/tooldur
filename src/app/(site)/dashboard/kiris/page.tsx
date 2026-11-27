"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { generateDrawing } from "@/lib/drawingEngine";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import {
  ArrowLeft, Calculator, RefreshCw, Download, BarChart3,
  Layers, ChevronRight, AlertTriangle, CheckCircle2,
  Info, Zap, Activity, BookOpen, StickyNote
} from "lucide-react";
import { sanitizeSvgContent } from '@/lib/security';

// ─── IPE PROFIL VERİTABANI ────────────────────────────────────
const IPE_PROFILES: Record<string, { h:number; b:number; tw:number; tf:number; A:number; Ix:number; Wx:number; Iy:number; Wy:number; kg:number }> = {
  "IPE 80":  { h:80,  b:46,  tw:3.8, tf:5.2, A:7.64,   Ix:80.1,    Wx:20.0,  Iy:8.49,   Wy:3.69, kg:6.0  },
  "IPE 100": { h:100, b:55,  tw:4.1, tf:5.7, A:10.3,   Ix:171,     Wx:34.2,  Iy:15.9,   Wy:5.79, kg:8.1  },
  "IPE 120": { h:120, b:64,  tw:4.4, tf:6.3, A:13.2,   Ix:318,     Wx:53.0,  Iy:27.7,   Wy:8.65, kg:10.4 },
  "IPE 140": { h:140, b:73,  tw:4.7, tf:6.9, A:16.4,   Ix:541,     Wx:77.3,  Iy:44.9,   Wy:12.3, kg:12.9 },
  "IPE 160": { h:160, b:82,  tw:5.0, tf:7.4, A:20.1,   Ix:869,     Wx:109,   Iy:68.3,   Wy:16.7, kg:15.8 },
  "IPE 180": { h:180, b:91,  tw:5.3, tf:8.0, A:23.9,   Ix:1317,    Wx:146,   Iy:101,    Wy:22.2, kg:18.8 },
  "IPE 200": { h:200, b:100, tw:5.6, tf:8.5, A:28.5,   Ix:1943,    Wx:194,   Iy:142,    Wy:28.5, kg:22.4 },
  "IPE 220": { h:220, b:110, tw:5.9, tf:9.2, A:33.4,   Ix:2772,    Wx:252,   Iy:205,    Wy:37.3, kg:26.2 },
  "IPE 240": { h:240, b:120, tw:6.2, tf:9.8, A:39.1,   Ix:3892,    Wx:324,   Iy:284,    Wy:47.3, kg:30.7 },
  "IPE 270": { h:270, b:135, tw:6.6, tf:10.2,A:45.9,   Ix:5790,    Wx:429,   Iy:420,    Wy:62.2, kg:36.1 },
  "IPE 300": { h:300, b:150, tw:7.1, tf:10.7,A:53.8,   Ix:8356,    Wx:557,   Iy:604,    Wy:80.5, kg:42.2 },
  "IPE 330": { h:330, b:160, tw:7.5, tf:11.5,A:62.6,   Ix:11770,   Wx:713,   Iy:788,    Wy:98.5, kg:49.1 },
  "IPE 360": { h:360, b:170, tw:8.0, tf:12.7,A:72.7,   Ix:16270,   Wx:904,   Iy:1040,   Wy:123,  kg:57.1 },
  "IPE 400": { h:400, b:180, tw:8.6, tf:13.5,A:84.5,   Ix:23130,   Wx:1156,  Iy:1318,   Wy:146,  kg:66.3 },
  "IPE 450": { h:450, b:190, tw:9.4, tf:14.6,A:98.8,   Ix:33740,   Wx:1500,  Iy:1676,   Wy:176,  kg:77.6 },
  "IPE 500": { h:500, b:200, tw:10.2,tf:16.0,A:116,    Ix:48200,   Wx:1928,  Iy:2142,   Wy:214,  kg:90.7 },
};

// ─── MESNET TİPLERİ ───────────────────────────────────────────
const SUPPORT_TYPES = [
  { value: "ss",   label: "İki Ucu Mafsallı (Basit)",  desc: "M_max = qL²/8" },
  { value: "fc",   label: "Sol Ankastre, Sağ Serbest", desc: "M_max = qL²/2" },
  { value: "ff",   label: "İki Ucu Ankastre",          desc: "M_max = qL²/12" },
];

// ─── MALZEME KALİTELERİ ──────────────────────────────────────
const STEEL_GRADES: Record<string, { fy:number; fu:number; E:number }> = {
  "S235": { fy:235, fu:360, E:210000 },
  "S275": { fy:275, fu:430, E:210000 },
  "S355": { fy:355, fu:490, E:210000 },
};

interface Results {
  R: number;           // kN
  Mmax: number;        // kNm
  Vmax: number;        // kN
  sigma: number;       // MPa
  tau: number;         // MPa
  delta_mm: number;    // mm
  limitRatio: number;  // L/δ
  eta_M: number;       // kullanım oranı moment
  eta_V: number;       // kullanım oranı kesme
  isOK: boolean;
  warnings: string[];
  profile: typeof IPE_PROFILES[string];
}

export default function KirisPage() {
  const { saveCalculation } = useCalculationHistory();

  // ─── GİRDİLER
  const [L, setL]           = useState("6");       // m
  const [q, setQ]           = useState("12");      // kN/m
  const [P, setP]           = useState("0");       // kN (tekil yük ortada)
  const [support, setSupport] = useState("ss");
  const [profileName, setProfileName] = useState("IPE 240");
  const [grade, setGrade]   = useState("S355");
  const [activeTab, setActiveTab] = useState<"tam"|"kesme"|"moment"|"deformasyon">("tam");

  // ─── HESAP SONUÇLARI
  const [results, setResults] = useState<Results | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const safeSvgContent = sanitizeSvgContent(svgContent);

  const updateDrawing = useCallback((
    tab: "tam"|"kesme"|"moment"|"deformasyon",
    Lm: number, qVal: number, Ix: number, E: number, res?: Results
  ) => {
    const params = {
      length: Lm * 1000,
      load:   qVal,
      Ix,
      E,
      label: `${profileName} · ${grade}`,
    };
    const type = tab === "tam" ? "kiriş_tam" :
                 tab === "kesme" ? "kesme_diyagram" :
                 tab === "moment" ? "gerilme_diyagram" : "deformasyon";
    setSvgContent(generateDrawing({ type: type as any, ...params }));
  }, [grade, profileName]);

  // ─── HESAPLA
  const calculate = useCallback(() => {
    const Lm   = parseFloat(L) || 6;
    const qVal = parseFloat(q) || 0;
    const Pval = parseFloat(P) || 0;
    const prof = IPE_PROFILES[profileName];
    const mat  = STEEL_GRADES[grade];
    if (!prof || !mat) return;

    const Ix_m4 = prof.Ix * 1e-8;
    const E_Pa  = mat.E * 1e6;

    // Kuvvetler mesnet tipine göre
    let Mmax_kNm: number, Vmax_kN: number, delta_m: number;
    const totalQ = qVal + (Pval > 0 ? Pval / Lm : 0); // eşdeğer

    switch(support) {
      case "fc": // ankastre-serbest
        Mmax_kNm = qVal * Lm * Lm / 2 + Pval * Lm;
        Vmax_kN  = qVal * Lm + Pval;
        delta_m  = (qVal * 1000 * Math.pow(Lm,4)) / (8 * E_Pa * Ix_m4)
                 + (Pval * 1000 * Math.pow(Lm,3)) / (3 * E_Pa * Ix_m4);
        break;
      case "ff": // her iki uç ankastre
        Mmax_kNm = qVal * Lm * Lm / 12 + Pval * Lm / 8;
        Vmax_kN  = qVal * Lm / 2 + Pval / 2;
        delta_m  = (qVal * 1000 * Math.pow(Lm,4)) / (384 * E_Pa * Ix_m4);
        break;
      default: // basit mesnet
        Mmax_kNm = qVal * Lm * Lm / 8 + Pval * Lm / 4;
        Vmax_kN  = qVal * Lm / 2 + Pval / 2;
        delta_m  = (5 * qVal * 1000 * Math.pow(Lm,4)) / (384 * E_Pa * Ix_m4)
                 + (Pval * 1000 * Math.pow(Lm,3)) / (48 * E_Pa * Ix_m4);
        break;
    }

    const delta_mm = delta_m * 1000;
    const limitRatio = Lm / delta_m;

    // Gerilmeler
    const sigma = (Mmax_kNm * 1e6) / (prof.Wx * 1e3); // MPa (Wx cm³→mm³)
    const tau   = (Vmax_kN  * 1e3) / (prof.h * prof.tw); // MPa yaklaşık

    // Kullanım oranları (EN 1993-1-1)
    const fyDesign = mat.fy / 1.0; // gamma_M0 = 1.0
    const eta_M = sigma / fyDesign;
    const eta_V = tau   / (fyDesign / Math.sqrt(3));

    const warnings: string[] = [];
    if (eta_M > 1.0) warnings.push(`Moment kapasitesi aşıldı! η_M = ${(eta_M*100).toFixed(0)}%`);
    if (eta_V > 1.0) warnings.push(`Kesme kapasitesi aşıldı! η_V = ${(eta_V*100).toFixed(0)}%`);
    if (limitRatio < 300) warnings.push(`Sehim L/300 limitini aşıyor (L/δ = ${Math.round(limitRatio)})`);
    if (Lm / prof.h > 20) warnings.push("Kiriş oranı yüksek (L/h > 20), yanal burkulma kontrolü yapın");

    const res: Results = {
      R: Vmax_kN,
      Mmax: Mmax_kNm,
      Vmax: Vmax_kN,
      sigma,
      tau,
      delta_mm,
      limitRatio,
      eta_M,
      eta_V,
      isOK: warnings.length === 0,
      warnings,
      profile: prof,
    };
    setResults(res);

    // Çizimi güncelle
    updateDrawing(activeTab, Lm, qVal, prof.Ix, mat.E, res);

    // Geçmişe kaydet
    saveCalculation({
      toolSlug: "kiris-tasarim",
      toolName: "Kiriş Tasarım Modülü",
      category: "insaat",
      inputs: {
        "Profil": profileName,
        "Çelik": grade,
        "Açıklık (m)": Lm,
        "Yayılı Yük (kN/m)": qVal,
        "Tekil Yük (kN)": Pval,
        "Mesnet": SUPPORT_TYPES.find(s=>s.value===support)?.label || support,
      },
      outputs: {
        "M_max (kNm)": parseFloat(Mmax_kNm.toFixed(2)),
        "V_max (kN)":  parseFloat(Vmax_kN.toFixed(2)),
        "δ_max (mm)":  parseFloat(delta_mm.toFixed(2)),
        "σ (MPa)":     parseFloat(sigma.toFixed(1)),
        "η_M (%)":     parseFloat((eta_M*100).toFixed(1)),
        "Durum":       warnings.length === 0 ? "Uygun ✓" : "Kontrol gerekli ⚠",
      },
      summary: `${profileName}, L=${Lm}m, q=${qVal}kN/m → M=${Mmax_kNm.toFixed(1)}kNm, δ=${delta_mm.toFixed(1)}mm`,
    });
  }, [L, q, P, support, profileName, grade, activeTab, saveCalculation, updateDrawing]);

  // İlk render
  useEffect(() => {
    calculate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tab değişince çizimi güncelle
  useEffect(() => {
    if (!results) return;
    updateDrawing(
      activeTab,
      parseFloat(L)||6,
      parseFloat(q)||0,
      IPE_PROFILES[profileName]?.Ix || 2000,
      STEEL_GRADES[grade]?.E || 210000,
      results
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // SVG indir
  const handleDownload = () => {
    const blob = new Blob([safeSvgContent], { type:"image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `kiris-${profileName.replace(" ","")}-L${L}m.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const prof = IPE_PROFILES[profileName];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm">
            <ArrowLeft size={16}/>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">Kiriş Tasarım Modülü</h1>
            <p className="text-slate-400 text-xs">IPE profil · Anlık hesap · Otomatik diyagram</p>
          </div>
          <Link href="/dashboard/cizim" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 text-xs font-medium shadow-sm transition-all">
            <BarChart3 size={13}/> Çizim Motoru
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* SOL: Giriş Formu */}
          <div className="lg:col-span-2 space-y-4">

            {/* Profil + Malzeme */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers size={12}/> Profil Seçimi
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">IPE Profili</label>
                  <select
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.keys(IPE_PROFILES).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Çelik Kalitesi</label>
                  <select
                    value={grade}
                    onChange={e => setGrade(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.keys(STEEL_GRADES).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Profil özet bilgisi */}
              {prof && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-blue-400">h</p><p className="text-sm font-bold text-blue-700">{prof.h} mm</p></div>
                  <div><p className="text-xs text-blue-400">Ix</p><p className="text-sm font-bold text-blue-700">{prof.Ix} cm⁴</p></div>
                  <div><p className="text-xs text-blue-400">Wx</p><p className="text-sm font-bold text-blue-700">{prof.Wx} cm³</p></div>
                  <div><p className="text-xs text-blue-400">b</p><p className="text-sm font-bold text-blue-700">{prof.b} mm</p></div>
                  <div><p className="text-xs text-blue-400">A</p><p className="text-sm font-bold text-blue-700">{prof.A} cm²</p></div>
                  <div><p className="text-xs text-blue-400">kg/m</p><p className="text-sm font-bold text-blue-700">{prof.kg}</p></div>
                </div>
              )}
            </div>

            {/* Yükleme */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Activity size={12}/> Yükleme
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mesnet Tipi</label>
                  <div className="space-y-1.5">
                    {SUPPORT_TYPES.map(s => (
                      <label key={s.value} className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${support===s.value?"bg-primary-50 border-primary-200":"border-slate-100 hover:border-slate-200"}`}>
                        <input type="radio" name="support" value={s.value} checked={support===s.value} onChange={e=>setSupport(e.target.value)} className="mt-0.5 accent-primary-600"/>
                        <div>
                          <p className={`text-xs font-semibold ${support===s.value?"text-primary-700":"text-slate-700"}`}>{s.label}</p>
                          <p className="text-xs text-slate-400 font-mono">{s.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Açıklık (m)</label>
                    <input type="number" value={L} onChange={e=>setL(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="6"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">q (kN/m)</label>
                    <input type="number" value={q} onChange={e=>setQ(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="12"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">P (kN)</label>
                    <input type="number" value={P} onChange={e=>setP(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="0"/>
                  </div>
                </div>
              </div>

              <button
                onClick={calculate}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                <Calculator size={15}/> Hesapla & Çiz
              </button>
            </div>

            {/* Hızlı Profil Seçici */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Yaygın Profiller</p>
              <div className="grid grid-cols-3 gap-1.5">
                {["IPE 160","IPE 180","IPE 200","IPE 240","IPE 270","IPE 300","IPE 330","IPE 360","IPE 400"].map(n => (
                  <button
                    key={n}
                    onClick={() => { setProfileName(n); }}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all border ${profileName===n?"bg-primary-600 text-white border-primary-600":"bg-slate-50 text-slate-500 border-slate-200 hover:border-primary-300 hover:text-primary-600"}`}
                  >
                    {n.replace("IPE ","")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SAĞ: Sonuçlar + Çizim */}
          <div className="lg:col-span-3 space-y-4">

            {/* Sonuç Kartları */}
            {results && (
              <>
                {/* Durum banner */}
                <div className={`p-3 rounded-2xl flex items-center gap-3 border ${results.isOK ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                  {results.isOK
                    ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0"/>
                    : <AlertTriangle size={18} className="text-amber-500 flex-shrink-0"/>
                  }
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${results.isOK ? "text-emerald-700" : "text-amber-700"}`}>
                      {results.isOK ? `${profileName} uygun — tüm kontroller geçti ✓` : "Uyarı — aşağıdaki kontrollere dikkat edin"}
                    </p>
                    {results.warnings.map((w,i) => (
                      <p key={i} className="text-xs text-amber-600 mt-0.5">{w}</p>
                    ))}
                  </div>
                </div>

                {/* Sonuç grid */}
                <div className="grid grid-cols-3 gap-3">
                  <ResultCard label="M_max" value={results.Mmax.toFixed(2)} unit="kNm" color="blue" sub={`η = ${(results.eta_M*100).toFixed(0)}%`} ok={results.eta_M<=1}/>
                  <ResultCard label="V_max" value={results.Vmax.toFixed(2)} unit="kN"   color="red"  sub={`η = ${(results.eta_V*100).toFixed(0)}%`} ok={results.eta_V<=1}/>
                  <ResultCard label="δ_max" value={results.delta_mm.toFixed(2)} unit="mm" color="sky" sub={`L/δ = ${Math.round(results.limitRatio)}`} ok={results.limitRatio>=300}/>
                  <ResultCard label="σ_max" value={results.sigma.toFixed(1)} unit="MPa" color="orange" sub={`f_y = ${STEEL_GRADES[grade].fy} MPa`} ok={results.sigma<=STEEL_GRADES[grade].fy}/>
                  <ResultCard label="τ_max" value={results.tau.toFixed(1)}   unit="MPa" color="purple" sub="Kesme gerilmesi" ok={results.tau<=STEEL_GRADES[grade].fy/Math.sqrt(3)}/>
                  <ResultCard label="R"     value={results.R.toFixed(2)}     unit="kN"   color="green"  sub="Mesnet tepkisi" ok={true}/>
                </div>
              </>
            )}

            {/* Diyagram Tab'ları */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-100">
                {([
                  { key:"tam",         label:"Tam Analiz" },
                  { key:"kesme",       label:"Kesme V(x)" },
                  { key:"moment",      label:"Moment M(x)" },
                  { key:"deformasyon", label:"Deformasyon" },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-all border-b-2 ${activeTab===tab.key ? "border-primary-600 text-primary-700 bg-primary-50" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SVG */}
              <div className="p-4 flex items-center justify-center bg-slate-50/50 min-h-64">
                {svgContent ? (
                  <div dangerouslySetInnerHTML={{ __html: safeSvgContent }} className="w-full"/>
                ) : (
                  <div className="text-slate-300 text-sm">Hesapla butonuna basın</div>
                )}
              </div>

              {/* İndir */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-slate-50">
                <span className="text-xs text-slate-300">{profileName} · {grade}</span>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-lg text-xs font-semibold text-slate-500 hover:text-primary-600 transition-all"
                >
                  <Download size={12}/> SVG İndir
                </button>
              </div>
            </div>

            {/* Bilgi */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3">
              <Info size={14} className="text-slate-400 flex-shrink-0 mt-0.5"/>
              <div className="text-xs text-slate-500 space-y-1">
                <p><strong>Hesaplama yöntemi:</strong> EN 1993-1-1 (Eurocode 3) basit kesitten elastik analiz</p>
                <p><strong>Sehim limiti:</strong> L/300 (kullanım yükü altında) · <strong>γ_M0</strong> = 1.0</p>
                <p>Yan burkulma, yerel burkulma ve birleşim noktaları bu modülde hesaplanmamaktadır.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ─── YARDIMCI BİLEŞEN ────────────────────────────────────────
function ResultCard({ label, value, unit, color, sub, ok }: {
  label:string; value:string; unit:string; color:string; sub:string; ok:boolean;
}) {
  const colors: Record<string,string> = {
    blue:   "bg-blue-50 border-blue-100 text-blue-700",
    red:    "bg-red-50 border-red-100 text-red-700",
    sky:    "bg-sky-50 border-sky-100 text-sky-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    green:  "bg-emerald-50 border-emerald-100 text-emerald-700",
  };
  return (
    <div className={`rounded-2xl border p-3 ${ok ? colors[color] : "bg-amber-50 border-amber-200 text-amber-700"}`}>
      <p className="text-xs font-semibold opacity-60 mb-0.5">{label}</p>
      <p className="text-lg font-bold leading-tight">{value}<span className="text-xs font-normal ml-1 opacity-70">{unit}</span></p>
      <p className="text-xs opacity-50 mt-0.5">{sub}</p>
      {!ok && <p className="text-xs font-bold mt-1">⚠ Kontrol</p>}
    </div>
  );
}
