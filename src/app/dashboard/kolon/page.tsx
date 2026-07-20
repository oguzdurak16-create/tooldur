"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCalculationHistory } from "@/hooks/useCalculationHistory";
import {
  ArrowLeft, Calculator, Download, CheckCircle2,
  AlertTriangle, XCircle, Info, Layers, Settings2,
  BarChart3, ChevronRight, RefreshCw
} from "lucide-react";
import { sanitizeSvgContent } from '@/lib/security';

// ─── HEA PROFİL VERİTABANI ───────────────────────────────────
// h=yükseklik, b=genişlik, tw=gövde et, tf=flanş et
// A=alan(cm²), Ix=atalet(cm⁴), Wx=mukavemet(cm³)
// Iy, Wy=zayıf eksen, i_y=yarıçap(cm), kg=birim ağırlık
const HEA: Record<string, { h:number;b:number;tw:number;tf:number;A:number;Ix:number;Wx:number;Iy:number;Wy:number;iy:number;iz:number;kg:number }> = {
  "HEA 100": { h:96,  b:100, tw:5.0, tf:8.0,  A:21.2,  Ix:349,   Wx:72.8,  Iy:134,   Wy:26.8,  iy:4.06, iz:2.51, kg:16.7 },
  "HEA 120": { h:114, b:120, tw:5.0, tf:8.0,  A:25.3,  Ix:606,   Wx:106,   Iy:231,   Wy:38.5,  iy:4.89, iz:3.02, kg:19.9 },
  "HEA 140": { h:133, b:140, tw:5.5, tf:8.5,  A:31.4,  Ix:1033,  Wx:155,   Iy:389,   Wy:55.6,  iy:5.73, iz:3.52, kg:24.7 },
  "HEA 160": { h:152, b:160, tw:6.0, tf:9.0,  A:38.8,  Ix:1673,  Wx:220,   Iy:616,   Wy:77.0,  iy:6.57, iz:3.98, kg:30.4 },
  "HEA 180": { h:171, b:180, tw:6.0, tf:9.5,  A:45.3,  Ix:2510,  Wx:294,   Iy:925,   Wy:103,   iy:7.45, iz:4.52, kg:35.5 },
  "HEA 200": { h:190, b:200, tw:6.5, tf:10.0, A:53.8,  Ix:3692,  Wx:389,   Iy:1336,  Wy:134,   iy:8.28, iz:4.98, kg:42.3 },
  "HEA 220": { h:210, b:220, tw:7.0, tf:11.0, A:64.3,  Ix:5410,  Wx:515,   Iy:1955,  Wy:178,   iy:9.17, iz:5.51, kg:50.5 },
  "HEA 240": { h:230, b:240, tw:7.5, tf:12.0, A:76.8,  Ix:7763,  Wx:675,   Iy:2769,  Wy:231,   iy:10.1, iz:6.00, kg:60.3 },
  "HEA 260": { h:250, b:260, tw:7.5, tf:12.5, A:86.8,  Ix:10450, Wx:836,   Iy:3668,  Wy:282,   iy:10.97,iz:6.50, kg:68.2 },
  "HEA 280": { h:270, b:280, tw:8.0, tf:13.0, A:97.3,  Ix:13670, Wx:1013,  Iy:4763,  Wy:340,   iy:11.85,iz:6.99, kg:76.4 },
  "HEA 300": { h:290, b:300, tw:8.5, tf:14.0, A:112.5, Ix:18260, Wx:1260,  Iy:6310,  Wy:421,   iy:12.74,iz:7.49, kg:88.3 },
  "HEA 320": { h:310, b:300, tw:9.0, tf:15.5, A:124.4, Ix:22930, Wx:1479,  Iy:6985,  Wy:466,   iy:13.58,iz:7.49, kg:97.6 },
  "HEA 340": { h:330, b:300, tw:9.5, tf:16.5, A:133.5, Ix:27690, Wx:1678,  Iy:7436,  Wy:496,   iy:14.40,iz:7.46, kg:105  },
  "HEA 360": { h:350, b:300, tw:10.0,tf:17.5, A:142.8, Ix:33090, Wx:1891,  Iy:7887,  Wy:526,   iy:15.22,iz:7.43, kg:112  },
  "HEA 400": { h:390, b:300, tw:11.0,tf:19.0, A:159.0, Ix:45070, Wx:2311,  Iy:8564,  Wy:571,   iy:16.84,iz:7.34, kg:125  },
  "HEA 450": { h:440, b:300, tw:11.5,tf:21.0, A:178.0, Ix:63720, Wx:2896,  Iy:9465,  Wy:631,   iy:18.93,iz:7.29, kg:140  },
  "HEA 500": { h:490, b:300, tw:12.0,tf:23.0, A:198.0, Ix:86970, Wx:3550,  Iy:10370, Wy:691,   iy:20.97,iz:7.24, kg:155  },
};

const HEB: Record<string, { h:number;b:number;tw:number;tf:number;A:number;Ix:number;Wx:number;Iy:number;Wy:number;iy:number;iz:number;kg:number }> = {
  "HEB 100": { h:100, b:100, tw:6.0, tf:10.0, A:26.0,  Ix:450,   Wx:89.9,  Iy:167,   Wy:33.5,  iy:4.16, iz:2.53, kg:20.4 },
  "HEB 120": { h:120, b:120, tw:6.5, tf:11.0, A:34.0,  Ix:864,   Wx:144,   Iy:318,   Wy:52.9,  iy:5.04, iz:3.06, kg:26.7 },
  "HEB 140": { h:140, b:140, tw:7.0, tf:12.0, A:43.0,  Ix:1509,  Wx:215,   Iy:550,   Wy:78.5,  iy:5.93, iz:3.58, kg:33.7 },
  "HEB 160": { h:160, b:160, tw:8.0, tf:13.0, A:54.3,  Ix:2492,  Wx:311,   Iy:889,   Wy:111,   iy:6.78, iz:4.05, kg:42.6 },
  "HEB 180": { h:180, b:180, tw:8.5, tf:14.0, A:65.3,  Ix:3831,  Wx:426,   Iy:1363,  Wy:151,   iy:7.66, iz:4.57, kg:51.2 },
  "HEB 200": { h:200, b:200, tw:9.0, tf:15.0, A:78.1,  Ix:5696,  Wx:570,   Iy:2003,  Wy:200,   iy:8.54, iz:5.07, kg:61.3 },
  "HEB 220": { h:220, b:220, tw:9.5, tf:16.0, A:91.0,  Ix:8091,  Wx:736,   Iy:2843,  Wy:258,   iy:9.43, iz:5.59, kg:71.5 },
  "HEB 240": { h:240, b:240, tw:10.0,tf:17.0, A:106.0, Ix:11260, Wx:938,   Iy:3923,  Wy:327,   iy:10.31,iz:6.08, kg:83.2 },
  "HEB 260": { h:260, b:260, tw:10.0,tf:17.5, A:118.4, Ix:14920, Wx:1148,  Iy:5135,  Wy:395,   iy:11.22,iz:6.58, kg:93.0 },
  "HEB 280": { h:280, b:280, tw:10.5,tf:18.0, A:131.4, Ix:19270, Wx:1376,  Iy:6595,  Wy:471,   iy:12.12,iz:7.09, kg:103  },
  "HEB 300": { h:300, b:300, tw:11.0,tf:19.0, A:149.0, Ix:25170, Wx:1678,  Iy:8563,  Wy:571,   iy:13.00,iz:7.58, kg:117  },
  "HEB 320": { h:320, b:300, tw:11.5,tf:20.5, A:161.3, Ix:30820, Wx:1926,  Iy:9239,  Wy:616,   iy:13.83,iz:7.57, kg:127  },
  "HEB 340": { h:340, b:300, tw:12.0,tf:21.5, A:170.9, Ix:36660, Wx:2156,  Iy:9690,  Wy:646,   iy:14.64,iz:7.53, kg:134  },
  "HEB 360": { h:360, b:300, tw:12.5,tf:22.5, A:180.6, Ix:43190, Wx:2400,  Iy:10140, Wy:676,   iy:15.46,iz:7.49, kg:142  },
  "HEB 400": { h:400, b:300, tw:13.5,tf:24.0, A:197.8, Ix:57680, Wx:2884,  Iy:10820, Wy:721,   iy:17.08,iz:7.40, kg:155  },
};

const STEEL_GRADES: Record<string, { fy:number; E:number }> = {
  "S235": { fy:235, E:210000 },
  "S275": { fy:275, E:210000 },
  "S355": { fy:355, E:210000 },
};

// Burkulma uzunluk katsayıları
const BUCKLING_K: Record<string, { ky:number; kz:number; label:string }> = {
  "ss":  { ky:1.0, kz:1.0, label:"İki ucu mafsallı (K=1.0)" },
  "fc":  { ky:2.0, kz:2.0, label:"Bir ucu ankastre, serbest (K=2.0)" },
  "fs":  { ky:0.7, kz:0.7, label:"Bir ucu ankastre, mafsallı (K=0.7)" },
  "ff":  { ky:0.5, kz:0.5, label:"İki ucu ankastre (K=0.5)" },
};

interface Results {
  Ned:number; Med:number;
  Ncr_y:number; Ncr_z:number;
  lambda_y:number; lambda_z:number;
  chi_y:number; chi_z:number;
  Nb_Rd:number;
  sigma_N:number; sigma_M:number;
  eta_N:number; eta_M:number;
  eta_NM:number;
  isOK:boolean;
  warnings:string[];
  profile:any;
  grade:string;
}

// ─── SVG KOLON DİYAGRAMI ─────────────────────────────────────
function generateColumnSVG(p:{
  L:number; Ned:number; Med:number;
  ktype:string; profile:any;
  res:Results|null;
}): string {
  const W=340, H=420;
  const { L, Ned, Med, ktype, profile: prof, res } = p;
  const kc = BUCKLING_K[ktype];

  // Ölçekler
  const colH = 240;
  const colW = Math.min(40, Math.max(20, prof?.b/10 || 30));
  const cx = W/2, topY = 70, botY = topY + colH;

  // Yük oku büyüklüğü
  const arrowLen = Math.min(45, Math.max(15, Ned/20));
  const momentArcR = Math.min(30, Math.max(15, Med*3));

  // Renk durumu
  const stateColor = !res ? "#94a3b8"
    : res.isOK && res.eta_NM < 0.8 ? "#16a34a"
    : res.isOK ? "#f59e0b"
    : "#ef4444";

  // Burkulma eğrisi (sinüs şekli - abartılı gösterim)
  const buckleAmp = 12;
  let bucklePath = `M ${cx} ${topY}`;
  for (let i=1; i<=40; i++) {
    const y = topY + (i/40)*colH;
    const x = cx + Math.sin(i/40*Math.PI) * buckleAmp;
    bucklePath += ` L ${x} ${y}`;
  }

  const etaText = res ? `η = ${(res.eta_NM*100).toFixed(0)}%` : "—";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"
    style="background:#f8fafc;font-family:'JetBrains Mono','Courier New',monospace">
    <defs>
      <pattern id="cgrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#cgrid)"/>
    <rect width="${W}" height="${H}" fill="#f8fafc" opacity="0.7"/>
    <rect x="1" y="1" width="${W-2}" height="${H-2}" fill="none" stroke="#e2e8f0" stroke-width="1.5" rx="4"/>

    <!-- Başlık -->
    <text x="${W/2}" y="18" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="#1e293b">KOLON ANALİZ DİYAGRAMI</text>
    <text x="${W/2}" y="32" text-anchor="middle" font-family="monospace" font-size="8" fill="#64748b">
      ${prof ? `${Object.keys(HEA).find(k=>HEA[k]===prof)||Object.keys(HEB).find(k=>HEB[k]===prof)||"Profil"} · L=${L.toFixed(1)}m` : "Profil seçin"}
    </text>

    <!-- Ankraj plakası (alt) -->
    <rect x="${cx-colW-15}" y="${botY}" width="${colW*2+30}" height="10" fill="#334155" rx="2"/>
    <!-- Taban çizgileri -->
    <line x1="${cx-colW-20}" y1="${botY+10}" x2="${cx+colW+20}" y2="${botY+10}" stroke="#334155" stroke-width="2"/>
    <line x1="${cx-colW-16}" y1="${botY+14}" x2="${cx+colW+16}" y2="${botY+14}" stroke="#334155" stroke-width="1.5"/>
    <!-- Tarama (ankastre gösterge) -->
    ${["fc","ff"].includes(ktype) ? `
    <line x1="${cx-colW-20}" y1="${botY+10}" x2="${cx-colW-30}" y2="${botY+22}" stroke="#334155" stroke-width="1.5"/>
    <line x1="${cx-colW-8}"  y1="${botY+10}" x2="${cx-colW-18}" y2="${botY+22}" stroke="#334155" stroke-width="1.5"/>
    <line x1="${cx+colW+4}"  y1="${botY+10}" x2="${cx+colW-6}"  y2="${botY+22}" stroke="#334155" stroke-width="1.5"/>
    <line x1="${cx+colW+16}" y1="${botY+10}" x2="${cx+colW+6}"  y2="${botY+22}" stroke="#334155" stroke-width="1.5"/>
    ` : `
    <circle cx="${cx-colW-8}" cy="${botY+18}" r="5" fill="white" stroke="#334155" stroke-width="1.5"/>
    <circle cx="${cx+colW+8}" cy="${botY+18}" r="5" fill="white" stroke="#334155" stroke-width="1.5"/>
    `}

    <!-- Üst plaka -->
    <rect x="${cx-colW-12}" y="${topY-10}" width="${colW*2+24}" height="10" fill="#334155" rx="2"/>
    ${["ff","fs"].includes(ktype) ? `
    <line x1="${cx-colW-16}" y1="${topY-10}" x2="${cx-colW-26}" y2="${topY-22}" stroke="#334155" stroke-width="1.5"/>
    <line x1="${cx-colW-4}"  y1="${topY-10}" x2="${cx-colW-14}" y2="${topY-22}" stroke="#334155" stroke-width="1.5"/>
    <line x1="${cx+colW+8}"  y1="${topY-10}" x2="${cx+colW-2}"  y2="${topY-22}" stroke="#334155" stroke-width="1.5"/>
    <line x1="${cx+colW+18}" y1="${topY-10}" x2="${cx+colW+8}"  y2="${topY-22}" stroke="#334155" stroke-width="1.5"/>
    ` : `
    <circle cx="${cx-colW-6}" cy="${topY-18}" r="5" fill="white" stroke="#334155" stroke-width="1.5"/>
    <circle cx="${cx+colW+6}" cy="${topY-18}" r="5" fill="white" stroke="#334155" stroke-width="1.5"/>
    `}

    <!-- Kolon gövdesi (I profil temsili) -->
    <!-- Flanşlar -->
    <rect x="${cx-colW}" y="${topY}" width="${colW*2}" height="6" fill="#93c5fd" stroke="#334155" stroke-width="1.5"/>
    <rect x="${cx-colW}" y="${botY-6}" width="${colW*2}" height="6" fill="#93c5fd" stroke="#334155" stroke-width="1.5"/>
    <!-- Gövde -->
    <rect x="${cx-4}" y="${topY+6}" width="8" height="${colH-12}" fill="#bfdbfe" stroke="#334155" stroke-width="1.5"/>

    <!-- Burkulma eğrisi (kesik çizgi, hayali) -->
    ${res && !res.isOK ? `
    <path d="${bucklePath}" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7"/>
    ` : `
    <path d="${bucklePath}" fill="none" stroke="${stateColor}" stroke-width="1" stroke-dasharray="3,4" opacity="0.4"/>
    `}

    <!-- Eksenel yük oku (üstten aşağı) -->
    ${Ned > 0 ? `
    <line x1="${cx}" y1="${topY-arrowLen-10}" x2="${cx}" y2="${topY-12}" stroke="#ef4444" stroke-width="2.5"/>
    <polygon points="${cx},${topY-12} ${cx-5},${topY-22} ${cx+5},${topY-22}" fill="#ef4444"/>
    <text x="${cx+8}" y="${topY-arrowLen/2-5}" font-family="monospace" font-size="9" font-weight="700" fill="#ef4444">N=${Ned}kN</text>
    ` : ""}

    <!-- Moment oku (sağdan) -->
    ${Med > 0 ? `
    <path d="M ${cx+colW+8} ${topY+colH*0.3} A ${momentArcR} ${momentArcR} 0 0 1 ${cx+colW+8} ${topY+colH*0.7}" fill="none" stroke="#f59e0b" stroke-width="2"/>
    <polygon points="${cx+colW+8},${topY+colH*0.7} ${cx+colW+2},${topY+colH*0.7-8} ${cx+colW+15},${topY+colH*0.7-5}" fill="#f59e0b"/>
    <text x="${cx+colW+momentArcR+12}" y="${topY+colH/2}" font-family="monospace" font-size="9" font-weight="700" fill="#f59e0b">M=${Med}kNm</text>
    ` : ""}

    <!-- Boy boyut çizgisi -->
    <line x1="${cx-colW-30}" y1="${topY}" x2="${cx-colW-30}" y2="${botY}" stroke="#3b82f6" stroke-width="1.2"/>
    <polygon points="${cx-colW-30},${topY} ${cx-colW-33},${topY+8} ${cx-colW-27},${topY+8}" fill="#3b82f6"/>
    <polygon points="${cx-colW-30},${botY} ${cx-colW-33},${botY-8} ${cx-colW-27},${botY-8}" fill="#3b82f6"/>
    <text x="${cx-colW-45}" y="${topY+colH/2}" text-anchor="middle" font-family="monospace" font-size="9" font-weight="700" fill="#1d4ed8" transform="rotate(-90,${cx-colW-45},${topY+colH/2})">L=${L.toFixed(1)} m</text>

    <!-- Sonuç durumu -->
    <rect x="${W/2-55}" y="${H-52}" width="110" height="38" rx="8" fill="${stateColor}" opacity="0.12"/>
    <rect x="${W/2-55}" y="${H-52}" width="110" height="38" rx="8" fill="none" stroke="${stateColor}" stroke-width="1.5"/>
    <text x="${W/2}" y="${H-36}" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="${stateColor}">${etaText}</text>
    <text x="${W/2}" y="${H-20}" text-anchor="middle" font-family="monospace" font-size="8" fill="${stateColor}">
      ${res ? (res.isOK ? "✓ Burkulma kontrolü geçti" : "⚠ Kapasite aşıldı") : "Hesapla →"}
    </text>

    <text x="${W-6}" y="${H-5}" text-anchor="end" font-family="monospace" font-size="7" fill="#cbd5e1">tooldur.com</text>
  </svg>`;
}

export default function KolonPage() {
  const { saveCalculation } = useCalculationHistory();

  const [profileType, setProfileType] = useState<"HEA"|"HEB">("HEA");
  const [profileName, setProfileName] = useState("HEA 200");
  const [grade, setGrade]     = useState("S355");
  const [L, setL]             = useState("4");    // m
  const [Ned, setNed]         = useState("500");  // kN
  const [Med, setMed]         = useState("0");    // kNm
  const [ktype, setKtype]     = useState("ss");
  const [results, setResults] = useState<Results|null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const safeSvgContent = sanitizeSvgContent(svgContent);

  const profileDB = profileType === "HEA" ? HEA : HEB;
  const profileKeys = Object.keys(profileDB);

  // Profile type değişince ilk profili seç
  useEffect(() => {
    setProfileName(profileType === "HEA" ? "HEA 200" : "HEB 200");
  }, [profileType]);

  const calculate = useCallback(() => {
    const Lm   = parseFloat(L) || 4;
    const N    = parseFloat(Ned) || 0;
    const M    = parseFloat(Med) || 0;
    const prof = profileDB[profileName];
    const mat  = STEEL_GRADES[grade];
    if (!prof || !mat) return;

    const { ky, kz } = BUCKLING_K[ktype];
    const Lky = ky * Lm;  // burkulma boyu y (m)
    const Lkz = kz * Lm;  // burkulma boyu z (m)

    // π²EI/L² → Euler yükü
    const E_kN_cm2 = mat.E / 100; // MPa → kN/cm²
    const Ncr_y = (Math.PI**2 * E_kN_cm2 * prof.Ix) / ((Lky*100)**2);  // kN
    const Ncr_z = (Math.PI**2 * E_kN_cm2 * prof.Iy) / ((Lkz*100)**2);  // kN

    // Kesit plastik kapasitesi
    const Npl = prof.A * mat.fy / 100;  // kN (A cm², fy MPa → kN/cm²)

    // İndirgenmiş narinlik (EN 1993-1-1 §6.3.1.2)
    const lambda_y = Math.sqrt(Npl / Ncr_y);
    const lambda_z = Math.sqrt(Npl / Ncr_z);

    // Burkulma eğrisi katsayısı α (HEA/HEB h/b>1.2 → eğri b)
    const alpha_y = prof.h/prof.b > 1.2 ? 0.34 : 0.49;
    const alpha_z = 0.49;  // zayıf eksen daima eğri c

    const chi = (alpha: number, lam: number) => {
      const phi = 0.5 * (1 + alpha*(lam - 0.2) + lam**2);
      return Math.min(1.0, 1 / (phi + Math.sqrt(phi**2 - lam**2)));
    };

    const chi_y = chi(alpha_y, lambda_y);
    const chi_z = chi(alpha_z, lambda_z);

    // Belirleyici burkulma direnci (zayıf eksen genellikle düşük)
    const Nb_Rd = Math.min(chi_y, chi_z) * Npl;  // kN

    // Gerilmeler
    const sigma_N = (N * 100)  / prof.A;           // MPa (N kN, A cm²)
    const sigma_M = (M * 1e6)  / (prof.Wx * 1e3);  // MPa (M kNm → Nmm, Wx cm³ → mm³)

    // Kullanım oranları
    const eta_N  = N > 0 ? N / Nb_Rd : 0;
    const eta_M  = sigma_M / mat.fy;
    const eta_NM = eta_N + eta_M;  // etkileşim basit toplam (EN 1993 §6.3.3 sadeleştirilmiş)

    const warnings: string[] = [];
    if (eta_N  > 1.0) warnings.push(`Burkulma kapasitesi aşıldı! N_b,Rd=${Nb_Rd.toFixed(0)} kN`);
    if (eta_M  > 1.0) warnings.push(`Moment kapasitesi aşıldı! σ=${sigma_M.toFixed(0)} MPa > f_y=${mat.fy} MPa`);
    if (eta_NM > 1.0) warnings.push(`N+M etkileşimi aşıldı (η=${(eta_NM*100).toFixed(0)}%)`);
    if (lambda_z > 2.0) warnings.push(`Narinlik çok yüksek! λ_z=${lambda_z.toFixed(2)} — kesit artırın`);
    if (Lm / (prof.h/100) > 20) warnings.push("L/h > 20 — yan burkulma kontrolü önerilir");

    const res: Results = {
      Ned: N, Med: M,
      Ncr_y, Ncr_z,
      lambda_y, lambda_z,
      chi_y, chi_z,
      Nb_Rd,
      sigma_N, sigma_M,
      eta_N, eta_M, eta_NM,
      isOK: warnings.length === 0,
      warnings,
      profile: prof,
      grade,
    };

    setResults(res);
    setSvgContent(generateColumnSVG({ L:Lm, Ned:N, Med:M, ktype, profile:prof, res }));

    saveCalculation({
      toolSlug:  "kolon-tasarim",
      toolName:  "Kolon Tasarım Modülü",
      category:  "insaat",
      inputs: {
        "Profil": profileName, "Çelik": grade,
        "Boy (m)": Lm, "N_Ed (kN)": N, "M_Ed (kNm)": M,
        "Mesnet": BUCKLING_K[ktype].label,
      },
      outputs: {
        "N_b,Rd (kN)":  parseFloat(Nb_Rd.toFixed(0)),
        "λ_y":          parseFloat(lambda_y.toFixed(3)),
        "λ_z":          parseFloat(lambda_z.toFixed(3)),
        "χ_min":        parseFloat(Math.min(chi_y,chi_z).toFixed(3)),
        "η_N+M (%)":    parseFloat((eta_NM*100).toFixed(1)),
        "Durum":        warnings.length === 0 ? "Uygun ✓" : "Kontrol gerekli ⚠",
      },
      summary: `${profileName}, L=${Lm}m, N=${N}kN → N_b,Rd=${Nb_Rd.toFixed(0)}kN, η=${(eta_NM*100).toFixed(0)}%`,
    });
  }, [L, Ned, Med, ktype, profileName, grade, profileDB, saveCalculation]);

  useEffect(() => {
    // İlk render çizim (hesap olmadan)
    const prof = profileDB[profileName];
    setSvgContent(generateColumnSVG({ L:parseFloat(L)||4, Ned:0, Med:0, ktype, profile:prof, res:null }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SVG indir
  const handleDownload = () => {
    const blob = new Blob([safeSvgContent], { type:"image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `kolon-${profileName.replace(" ","")}-N${Ned}kN.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const prof = profileDB[profileName];

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm">
            <ArrowLeft size={16}/>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">Kolon Tasarım Modülü</h1>
            <p className="text-slate-400 text-xs">HEA / HEB profil · Burkulma hesabı · EN 1993-1-1</p>
          </div>
          <Link href="/dashboard/kiris" className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 text-xs font-medium shadow-sm transition-all">
            <BarChart3 size={13}/> Kiriş Modülü
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* SOL: Form */}
          <div className="lg:col-span-2 space-y-4">

            {/* Profil Seçimi */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers size={12}/> Profil Seçimi
              </p>

              {/* HEA / HEB toggle */}
              <div className="flex gap-2 mb-3">
                {(["HEA","HEB"] as const).map(t => (
                  <button key={t} onClick={() => setProfileType(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${profileType===t ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-500 border-slate-200 hover:border-primary-300"}`}>
                    {t}
                  </button>
                ))}
              </div>

              {/* Profil grid */}
              <div className="grid grid-cols-3 gap-1.5 mb-3 max-h-44 overflow-y-auto pr-1">
                {profileKeys.map(n => (
                  <button key={n} onClick={() => setProfileName(n)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${profileName===n ? "bg-primary-600 text-white border-primary-600" : "bg-slate-50 text-slate-500 border-slate-100 hover:border-primary-300 hover:text-primary-600"}`}>
                    {n.replace(profileType+" ","")}
                  </button>
                ))}
              </div>

              {/* Çelik */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Çelik Kalitesi</label>
                  <select value={grade} onChange={e=>setGrade(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {Object.keys(STEEL_GRADES).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">f_y (MPa)</label>
                  <div className="px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-sm font-bold text-blue-700">
                    {STEEL_GRADES[grade].fy} MPa
                  </div>
                </div>
              </div>

              {/* Profil özeti */}
              {prof && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["h", `${prof.h} mm`],
                    ["b", `${prof.b} mm`],
                    ["A", `${prof.A} cm²`],
                    ["Ix", `${prof.Ix} cm⁴`],
                    ["Iy", `${prof.Iy} cm⁴`],
                    ["kg/m", `${prof.kg}`],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <p className="text-xs text-blue-400">{lbl}</p>
                      <p className="text-xs font-bold text-blue-700">{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Yükleme & Geometri */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Settings2 size={12}/> Yükleme & Geometri
              </p>

              {/* Mesnet tipi */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sınır Koşulları</label>
                <div className="space-y-1.5">
                  {Object.entries(BUCKLING_K).map(([k, v]) => (
                    <label key={k} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${ktype===k ? "bg-primary-50 border-primary-200" : "border-slate-100 hover:border-slate-200"}`}>
                      <input type="radio" name="ktype" value={k} checked={ktype===k} onChange={e=>setKtype(e.target.value)} className="accent-primary-600"/>
                      <div>
                        <p className={`text-xs font-semibold ${ktype===k?"text-primary-700":"text-slate-700"}`}>{v.label}</p>
                        <p className="text-xs text-slate-400 font-mono">K_y={v.ky} · K_z={v.kz}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:"Boy L (m)",    val:L,   set:setL,   ph:"4" },
                  { label:"N_Ed (kN)",    val:Ned, set:setNed, ph:"500" },
                  { label:"M_Ed (kNm)",   val:Med, set:setMed, ph:"0" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">{f.label}</label>
                    <input type="number" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                  </div>
                ))}
              </div>

              <button onClick={calculate}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm">
                <Calculator size={15}/> Hesapla & Çiz
              </button>
            </div>

            {/* Bilgi */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-2">
              <Info size={13} className="text-amber-500 flex-shrink-0 mt-0.5"/>
              <div className="text-xs text-amber-700 space-y-1">
                <p><strong>EN 1993-1-1 §6.3.1</strong> — Euler kritik yük, indirgenmiş narinlik λ ve χ katsayısı ile Nb,Rd hesabı</p>
                <p>Etkileşim basit toplam yöntemi kullanılmıştır. Kesin tasarım için §6.3.3 kullanın.</p>
              </div>
            </div>
          </div>

          {/* SAĞ: Sonuç + Çizim */}
          <div className="lg:col-span-3 space-y-4">

            {/* Durum banner */}
            {results && (
              <>
                <div className={`p-3 rounded-2xl flex items-center gap-3 border ${
                  results.isOK && results.eta_NM < 0.8
                    ? "bg-emerald-50 border-emerald-200"
                    : results.isOK
                    ? "bg-amber-50 border-amber-200"
                    : "bg-red-50 border-red-200"
                }`}>
                  {results.isOK && results.eta_NM < 0.8
                    ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0"/>
                    : results.isOK
                    ? <AlertTriangle size={18} className="text-amber-500 flex-shrink-0"/>
                    : <XCircle size={18} className="text-red-500 flex-shrink-0"/>
                  }
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${results.isOK && results.eta_NM<0.8 ? "text-emerald-700" : results.isOK ? "text-amber-700" : "text-red-700"}`}>
                      {results.isOK && results.eta_NM < 0.8
                        ? `${profileName} uygun — tüm kontroller geçti ✓`
                        : results.isOK
                        ? `${profileName} sınırda — dikkat edin`
                        : "Kapasite aşıldı — profil değiştirin"}
                    </p>
                    {results.warnings.map((w,i) => <p key={i} className="text-xs mt-0.5 text-red-600">{w}</p>)}
                  </div>
                </div>

                {/* Sonuç kartları */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { lbl:"N_cr,y", val:results.Ncr_y.toFixed(0), unit:"kN", sub:`λ_y = ${results.lambda_y.toFixed(3)}`, ok:true, c:"blue" },
                    { lbl:"N_cr,z", val:results.Ncr_z.toFixed(0), unit:"kN", sub:`λ_z = ${results.lambda_z.toFixed(3)}`, ok:results.lambda_z<=2, c:results.lambda_z<=2?"blue":"red" },
                    { lbl:"N_b,Rd", val:results.Nb_Rd.toFixed(0), unit:"kN", sub:`χ = ${Math.min(results.chi_y,results.chi_z).toFixed(3)}`, ok:results.eta_N<=1, c:results.eta_N<=1?"emerald":"red" },
                    { lbl:"η_N", val:`${(results.eta_N*100).toFixed(1)}%`, unit:"", sub:`N_Ed/N_b,Rd`, ok:results.eta_N<=1, c:results.eta_N<=1?"emerald":"red" },
                    { lbl:"η_M", val:`${(results.eta_M*100).toFixed(1)}%`, unit:"", sub:`σ/f_y`, ok:results.eta_M<=1, c:results.eta_M<=1?"blue":"red" },
                    { lbl:"η_N+M", val:`${(results.eta_NM*100).toFixed(1)}%`, unit:"", sub:"Etkileşim", ok:results.eta_NM<=1, c:results.eta_NM<=1?"emerald":"red" },
                  ].map((r,i) => {
                    const cc: Record<string,string> = {
                      blue:"bg-blue-50 border-blue-100 text-blue-700",
                      emerald:"bg-emerald-50 border-emerald-100 text-emerald-700",
                      red:"bg-red-50 border-red-200 text-red-700",
                    };
                    return (
                      <div key={i} className={`rounded-2xl border p-3 ${r.ok ? cc[r.c] : cc.red}`}>
                        <p className="text-xs font-semibold opacity-60 mb-0.5">{r.lbl}</p>
                        <p className="text-lg font-bold">{r.val}<span className="text-xs font-normal ml-1 opacity-70">{r.unit}</span></p>
                        <p className="text-xs opacity-50 mt-0.5">{r.sub}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Burkulma eğrisi tablosu */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Burkulma Parametreleri</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <p className="font-bold text-slate-500">Güçlü Eksen (y-y)</p>
                      {[
                        ["Burkulma boyu L_cr,y", `${(BUCKLING_K[ktype].ky * (parseFloat(L)||4)).toFixed(2)} m`],
                        ["Euler yükü N_cr,y", `${results.Ncr_y.toFixed(0)} kN`],
                        ["Narinlik λ_y", results.lambda_y.toFixed(3)],
                        ["χ_y (burkulma katsayısı)", results.chi_y.toFixed(3)],
                      ].map(([l,v]) => (
                        <div key={l} className="flex justify-between"><span className="text-slate-500">{l}</span><span className="font-bold text-slate-700">{v}</span></div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-slate-500">Zayıf Eksen (z-z)</p>
                      {[
                        ["Burkulma boyu L_cr,z", `${(BUCKLING_K[ktype].kz * (parseFloat(L)||4)).toFixed(2)} m`],
                        ["Euler yükü N_cr,z", `${results.Ncr_z.toFixed(0)} kN`],
                        ["Narinlik λ_z", results.lambda_z.toFixed(3)],
                        ["χ_z (burkulma katsayısı)", results.chi_z.toFixed(3)],
                      ].map(([l,v]) => (
                        <div key={l} className="flex justify-between"><span className="text-slate-500">{l}</span><span className="font-bold text-slate-700">{v}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* SVG Diyagram */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kolon Diyagramı</p>
                <button onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-lg text-xs font-semibold text-slate-500 hover:text-primary-600 transition-all">
                  <Download size={12}/> SVG İndir
                </button>
              </div>
              <div className="flex items-center justify-center p-4 bg-slate-50/50">
                {svgContent
                  ? <div dangerouslySetInnerHTML={{ __html:safeSvgContent }} className="w-full max-w-sm"/>
                  : <div className="text-slate-300 text-sm py-16">Hesapla butonuna basın</div>
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}