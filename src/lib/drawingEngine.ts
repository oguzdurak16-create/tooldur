/**
 * Tooldur — SVG Teknik Çizim Motor (v2)
 * Mühendis hesaplama sonuçlarından ölçekli teknik çizim üretir
 */

export type DrawingType =
  | "kiriş_yük"
  | "mil_kesit"
  | "ipe_kesit"
  | "hea_kesit"
  | "kutu_kesit"
  | "kablo_kesit"
  | "beton_kesit"
  | "genel_kesit"
  | "kesme_diyagram"
  | "gerilme_diyagram"
  | "deformasyon"
  | "kiriş_tam"
  | "disli_carki"
  | "yay_kesit"
  | "termal_plaka"
  | "termal_silindir"
  | "kama_kanali"
  | "tork_diyagram"
  | "kablo_kesit_elektrik"
  | "ohm_devre"
  | "guc_faktor"
  | "led_direnc"
  | "beton_plak_hacim"
  | "demir_donatı"
  | "celik_profil_agirlik"
  | "rulman_omur"
  | "viskozite_grafik"
  | "levha_kesit"
  | "pisagor_ucgen"
  | "alan_sekil"
  | "hacim_sekil"
  | "merdiven_kesit"
  | "tugla_duvar"
  | "nokta_yuklu_kiris"
  | "basinc_kap"
  | "devir_frekans";

export interface DrawingParams {
  type: DrawingType;
  width?: number;
  height?: number;
  thickness?: number;
  length?: number;
  load?: number;
  pointLoad?: number;
  result?: number;
  result2?: number;
  result3?: number;
  Ix?: number;
  Wx?: number;
  E?: number;
  label?: string;
  unit?: string;
  color?: string;
  m?: number;
  z1?: number;
  z2?: number;
  d1?: number;
  d2?: number;
  n1?: number;
  n2?: number;
  ratio?: number;
  wireDia?: number;
  coilDia?: number;
  turns?: number;
  force?: number;
  stiffness?: number;
  deflection?: number;
  kValue?: number;
  deltaT?: number;
  area?: number;
  heatFlow?: number;
  r1?: number;
  r2?: number;
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
  angle?: number;
  stress?: number;
  safetyFactor?: number;
  count?: number;
  a?: number;
  c?: number;
  b?: number;
  h?: number;
  t1?: number;
  t2?: number;
  shaftDia?: number;
  rpm?: number;
  diameter?: number;
  pole?: number;
  frequency?: number;
}

// ─── RENK PALETİ ──────────────────────────────────────────────
const C = {
  steel:    "#334155",
  steelL:   "#94a3b8",
  dim:      "#3b82f6",
  dimTxt:   "#1d4ed8",
  load:     "#ef4444",
  result:   "#16a34a",
  copper:   "#b45309",
  copperL:  "#fde68a",
  concrete: "#78716c",
  rebar:    "#292524",
  bg:       "#f8fafc",
  grid:     "#e2e8f0",
  text:     "#1e293b",
  textSm:   "#64748b",
  border:   "#cbd5e1",
  accent:   "#8b5cf6",
  warn:     "#f97316",
};

// ─── YARDIMCI HELPERS ─────────────────────────────────────────

function txt(
  x: number, y: number, t: string,
  opts?: { size?: number; bold?: boolean; color?: string; anchor?: "start"|"middle"|"end"; rotate?: number }
) {
  const { size = 11, bold = false, color = C.text, anchor = "middle", rotate } = opts || {};
  const rot = rotate ? ` transform="rotate(${rotate},${x},${y})"` : "";
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-family="'JetBrains Mono','Courier New',monospace" font-size="${size}" font-weight="${bold ? "700" : "400"}" fill="${color}"${rot}>${t}</text>`;
}

function line(x1: number, y1: number, x2: number, y2: number, color = C.steelL, w = 1, dash = "") {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string, stroke = C.steel, sw = 2, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="${rx}"/>`;
}

function circle(cx: number, cy: number, r: number, fill: string, stroke = C.steel, sw = 2) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
}

function dimLine(x1: number, y1: number, x2: number, y2: number, label: string, side: "h" | "v" = "h") {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const arrow = 5;
  if (side === "h") {
    return [
      line(x1, y1, x2, y2, C.dim, 1.2),
      `<polygon points="${x1},${y1} ${x1 + arrow},${y1 - 3} ${x1 + arrow},${y1 + 3}" fill="${C.dim}"/>`,
      `<polygon points="${x2},${y2} ${x2 - arrow},${y2 - 3} ${x2 - arrow},${y2 + 3}" fill="${C.dim}"/>`,
      txt(mx, my - 10, label, { size: 9, color: C.dimTxt, bold: true }),
    ].join("");
  } else {
    return [
      line(x1, y1, x2, y2, C.dim, 1.2),
      `<polygon points="${x1},${y1} ${x1 - 3},${y1 + arrow} ${x1 + 3},${y1 + arrow}" fill="${C.dim}"/>`,
      `<polygon points="${x2},${y2} ${x2 - 3},${y2 - arrow} ${x2 + 3},${y2 - arrow}" fill="${C.dim}"/>`,
      txt(mx - 16, my, label, { size: 9, color: C.dimTxt, bold: true, rotate: -90, anchor: "middle" }),
    ].join("");
  }
}

function arrow(x: number, y: number, dir: "down" | "up" | "left" | "right", len = 30, color = C.load, w = 2) {
  if (dir === "down") return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + len}" stroke="${color}" stroke-width="${w}"/><polygon points="${x},${y + len} ${x - 5},${y + len - 8} ${x + 5},${y + len - 8}" fill="${color}"/>`;
  if (dir === "up")   return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - len}" stroke="${color}" stroke-width="${w}"/><polygon points="${x},${y - len} ${x - 5},${y - len + 8} ${x + 5},${y - len + 8}" fill="${color}"/>`;
  if (dir === "right") return `<line x1="${x}" y1="${y}" x2="${x + len}" y2="${y}" stroke="${color}" stroke-width="${w}"/><polygon points="${x + len},${y} ${x + len - 8},${y - 5} ${x + len - 8},${y + 5}" fill="${color}"/>`;
  return `<line x1="${x}" y1="${y}" x2="${x - len}" y2="${y}" stroke="${color}" stroke-width="${w}"/><polygon points="${x - len},${y} ${x - len + 8},${y - 5} ${x - len + 8},${y + 5}" fill="${color}"/>`;
}

function hatch(x: number, y: number, w: number, h: number, color = "#94a3b8", spacing = 6) {
  const id = `h${Math.abs(x | 0)}${Math.abs(y | 0)}${Math.abs(w | 0)}`;
  let lines = "";
  for (let i = -h; i < w + h; i += spacing) {
    lines += line(x + i, y, x + i - h, y + h, color, 0.7);
  }
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${lines}</g>`;
}

/** Etiketli sonuç kutusu */
function resultBox(cx: number, y: number, label: string, value: string, color = C.result) {
  return `<rect x="${cx - 70}" y="${y - 14}" width="140" height="28" fill="${color}15" stroke="${color}" stroke-width="1.5" rx="8"/>
  ${txt(cx, y - 4, label, { size: 8, color: C.textSm })}
  ${txt(cx, y + 8, value, { size: 11, bold: true, color })}`;
}

// ─── DISPATCH ─────────────────────────────────────────────────
export function generateDrawing(p: DrawingParams): string {
  switch (p.type) {
    case "mil_kesit":             return drawShaftSection(p);
    case "ipe_kesit":             return drawIPESection(p);
    case "hea_kesit":             return drawHEASection(p);
    case "kutu_kesit":            return drawBoxSection(p);
    case "kablo_kesit":
    case "kablo_kesit_elektrik":  return drawCableSection(p);
    case "beton_kesit":           return drawConcreteSection(p);
    case "kiriş_yük":             return drawBeamLoad(p);
    case "kesme_diyagram":        return drawShearDiagram(p);
    case "gerilme_diyagram":      return drawMomentDiagram(p);
    case "deformasyon":           return drawDeflection(p);
    case "kiriş_tam":             return drawBeamFull(p);
    case "nokta_yuklu_kiris":     return drawPointLoadBeam(p);
    case "disli_carki":           return drawGearPair(p);
    case "yay_kesit":             return drawSpring(p);
    case "termal_plaka":          return drawThermalPlate(p);
    case "termal_silindir":       return drawThermalCylinder(p);
    case "kama_kanali":           return drawKeyway(p);
    case "tork_diyagram":         return drawTorqueDiagram(p);
    case "ohm_devre":             return drawOhmCircuit(p);
    case "guc_faktor":            return drawPowerTriangle(p);
    case "led_direnc":            return drawLedResistorCircuit(p);
    case "beton_plak_hacim":      return drawConcreteVolume(p);
    case "demir_donatı":          return drawRebarLayout(p);
    case "celik_profil_agirlik":  return drawSteelProfileWeight(p);
    case "rulman_omur":           return drawBearingLife(p);
    case "viskozite_grafik":      return drawViscosityBar(p);
    case "levha_kesit":           return drawPlateSection(p);
    case "pisagor_ucgen":         return drawPythagorasTriangle(p);
    case "alan_sekil":            return drawAreaShape(p);
    case "hacim_sekil":           return drawVolumeShape(p);
    case "merdiven_kesit":        return drawStairSection(p);
    case "tugla_duvar":           return drawBrickWall(p);
    case "devir_frekans":        return drawDevirFrekans(p);
    case "basinc_kap":            return drawPressureVessel(p);
    default:                      return drawGenericSection(p);
  }
}

// ═══════════════════════════════════════════════════════════════
//  1. MİL KESİT
// ═══════════════════════════════════════════════════════════════
function drawShaftSection(p: DrawingParams): string {
  const W = 340, H = 300;
  const d = p.width || p.result || 50;
  const r = Math.min((d / 2) * 2.5, 95);
  const cx = W / 2, cy = H / 2 - 10;

  return wrapSVG(`
    ${txt(cx, 20, "MİL KESİT GÖRÜNÜŞÜ", { size: 12, bold: true, color: C.text })}
    ${txt(cx, 36, "(Daire Kesit)", { size: 9, color: C.textSm })}
    ${line(cx - r - 22, cy, cx + r + 22, cy, C.dim, 0.9, "5,3")}
    ${line(cx, cy - r - 22, cx, cy + r + 22, C.dim, 0.9, "5,3")}
    ${circle(cx, cy, r, "#dbeafe", C.steel, 2.5)}
    ${hatch(cx - r, cy - r, r * 2, r * 2, C.steelL, 8)}
    ${circle(cx, cy, r, "none", C.steel, 2.5)}
    ${circle(cx, cy, r * 0.12, C.steel, C.steel, 0)}
    ${line(cx - r, cy + r + 16, cx + r, cy + r + 16, C.dim, 1.3)}
    ${line(cx - r, cy, cx - r, cy + r + 20, C.dim, 0.8, "2,2")}
    ${line(cx + r, cy, cx + r, cy + r + 20, C.dim, 0.8, "2,2")}
    <polygon points="${cx - r},${cy + r + 16} ${cx - r + 8},${cy + r + 13} ${cx - r + 8},${cy + r + 19}" fill="${C.dim}"/>
    <polygon points="${cx + r},${cy + r + 16} ${cx + r - 8},${cy + r + 13} ${cx + r - 8},${cy + r + 19}" fill="${C.dim}"/>
    ${txt(cx, cy + r + 30, `Ø ${d.toFixed(1)} mm`, { size: 11, bold: true, color: C.dimTxt })}
    ${p.result ? resultBox(cx, H - 22, p.label || "Sonuç", `${p.result.toFixed(2)} ${p.unit || "mm"}`) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  2. IPE KESİT
// ═══════════════════════════════════════════════════════════════
function drawIPESection(p: DrawingParams): string {
  const W = 340, H = 320;
  const h0 = p.height || 200;
  const b0 = p.width  || h0 * 0.56;
  const tw = p.thickness || h0 * 0.04;
  const tf = h0 * 0.07;
  const scale = Math.min(165 / h0, 145 / b0, 1.6);
  const Hs = h0 * scale, Bs = b0 * scale, TWs = tw * scale, TFs = tf * scale;
  const cx = W / 2, cy = H / 2 + 5;
  const x0 = cx - Bs / 2, y0 = cy - Hs / 2;

  return wrapSVG(`
    ${txt(W / 2, 20, "IPE PROFİL KESİTİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 35, `IPE ${h0}`, { size: 10, color: C.textSm })}
    ${rect(x0, y0, Bs, TFs, "#bfdbfe", C.steel, 2)}
    ${rect(cx - TWs / 2, y0 + TFs, TWs, Hs - 2 * TFs, "#bfdbfe", C.steel, 2)}
    ${rect(x0, y0 + Hs - TFs, Bs, TFs, "#bfdbfe", C.steel, 2)}
    ${hatch(x0, y0, Bs, TFs, C.steelL, 6)}
    ${hatch(cx - TWs / 2, y0 + TFs, TWs, Hs - 2 * TFs, C.steelL, 6)}
    ${hatch(x0, y0 + Hs - TFs, Bs, TFs, C.steelL, 6)}
    ${line(cx - Bs / 2 - 16, cy, cx + Bs / 2 + 16, cy, C.dim, 0.8, "4,3")}
    ${line(cx, y0 - 16, cx, y0 + Hs + 16, C.dim, 0.8, "4,3")}
    ${dimLine(x0 - 28, y0, x0 - 28, y0 + Hs, `h=${h0}mm`, "v")}
    ${dimLine(x0, y0 + Hs + 22, x0 + Bs, y0 + Hs + 22, `b=${b0.toFixed(0)}mm`, "h")}
    ${p.Ix ? txt(W / 2, H - 22, `Ix = ${p.Ix} cm⁴`, { size: 9, color: C.dimTxt }) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  3. HEA KESİT
// ═══════════════════════════════════════════════════════════════
function drawHEASection(p: DrawingParams): string {
  const W = 340, H = 320;
  const h0 = p.height || 200;
  const b0 = p.width  || h0 * 0.98;
  const tw = p.thickness || h0 * 0.055;
  const tf = h0 * 0.09;
  const scale = Math.min(155 / h0, 125 / b0, 1.5);
  const Hs = h0 * scale, Bs = b0 * scale, TWs = tw * scale, TFs = tf * scale;
  const cx = W / 2, cy = H / 2 + 5;
  const x0 = cx - Bs / 2, y0 = cy - Hs / 2;

  return wrapSVG(`
    ${txt(W / 2, 20, "HEA PROFİL KESİTİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 35, `HEA ${h0}`, { size: 10, color: C.textSm })}
    ${rect(x0, y0, Bs, TFs, "#bfdbfe", C.steel, 2)}
    ${rect(cx - TWs / 2, y0 + TFs, TWs, Hs - 2 * TFs, "#bfdbfe", C.steel, 2)}
    ${rect(x0, y0 + Hs - TFs, Bs, TFs, "#bfdbfe", C.steel, 2)}
    ${hatch(x0, y0, Bs, TFs, C.steelL, 6)}
    ${hatch(cx - TWs / 2, y0 + TFs, TWs, Hs - 2 * TFs, C.steelL, 6)}
    ${hatch(x0, y0 + Hs - TFs, Bs, TFs, C.steelL, 6)}
    ${line(cx - Bs / 2 - 16, cy, cx + Bs / 2 + 16, cy, C.dim, 0.8, "4,3")}
    ${line(cx, y0 - 16, cx, y0 + Hs + 16, C.dim, 0.8, "4,3")}
    ${dimLine(x0 - 28, y0, x0 - 28, y0 + Hs, `h=${h0}mm`, "v")}
    ${dimLine(x0, y0 + Hs + 22, x0 + Bs, y0 + Hs + 22, `b=${b0.toFixed(0)}mm`, "h")}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  4. KUTU PROFİL
// ═══════════════════════════════════════════════════════════════
function drawBoxSection(p: DrawingParams): string {
  const W = 340, H = 310;
  const h0 = p.height || 150;
  const b0 = p.width  || 100;
  const t  = p.thickness || 8;
  const scale = Math.min(165 / h0, 165 / b0, 2.2);
  const Hs = h0 * scale, Bs = b0 * scale, Ts = t * scale;
  const cx = W / 2, cy = H / 2;
  const x0 = cx - Bs / 2, y0 = cy - Hs / 2;

  return wrapSVG(`
    ${txt(W / 2, 20, "KUTU PROFİL KESİTİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 35, `${b0}×${h0}×${t} mm`, { size: 10, color: C.textSm })}
    ${rect(x0, y0, Bs, Hs, "#bfdbfe", C.steel, 2.2)}
    ${hatch(x0, y0, Bs, Hs, C.steelL, 7)}
    ${rect(x0 + Ts, y0 + Ts, Bs - 2 * Ts, Hs - 2 * Ts, C.bg, C.steel, 1.5)}
    ${line(cx - Bs / 2 - 16, cy, cx + Bs / 2 + 16, cy, C.dim, 0.8, "4,3")}
    ${line(cx, y0 - 16, cx, y0 + Hs + 16, C.dim, 0.8, "4,3")}
    ${dimLine(x0 - 28, y0, x0 - 28, y0 + Hs, `h=${h0}mm`, "v")}
    ${dimLine(x0, y0 + Hs + 22, x0 + Bs, y0 + Hs + 22, `b=${b0}mm`, "h")}
    ${txt(cx, cy, `t=${t}mm`, { size: 9, color: C.dimTxt, bold: true })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  5. KABLO KESİT
// ═══════════════════════════════════════════════════════════════
function drawCableSection(p: DrawingParams): string {
  const W = 340, H = 310;
  const kesit = p.result || p.width || 2.5;
  const r = Math.min(Math.sqrt(kesit / Math.PI) * 13, 82);
  const cx = W / 2, cy = H / 2 - 8;

  const nIletken = kesit <= 6 ? 7 : kesit <= 16 ? 19 : 37;
  const ri = r * 0.78;
  const rIletken = ri / (Math.sqrt(nIletken) * 1.2);

  let iletkenler = "";
  if (nIletken === 7) {
    iletkenler += circle(cx, cy, rIletken, C.copper, C.copperL, 0.8);
    for (let i = 0; i < 6; i++) {
      const a = i * 60 * (Math.PI / 180);
      iletkenler += circle(cx + Math.cos(a) * rIletken * 2.2, cy + Math.sin(a) * rIletken * 2.2, rIletken, C.copper, C.copperL, 0.8);
    }
  } else {
    for (let i = 0; i < Math.min(nIletken, 37); i++) {
      const angle = (i / nIletken) * Math.PI * 2;
      const rr = i === 0 ? 0 : ri * (0.3 + 0.7 * (i / nIletken));
      iletkenler += circle(cx + Math.cos(angle) * rr * 0.8, cy + Math.sin(angle) * rr * 0.8, rIletken * 0.9, C.copper, C.copperL, 0.5);
    }
  }

  return wrapSVG(`
    ${txt(W / 2, 20, "KABLO KESİT GÖRÜNÜŞÜ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 35, `${kesit} mm² Bakır İletken`, { size: 10, color: C.textSm })}
    ${circle(cx, cy, r + 12, "#fef9c3", "#854d0e", 2)}
    ${circle(cx, cy, r + 5, "#fde68a", "#92400e", 1.5)}
    ${circle(cx, cy, r, "#78350f22", C.steel, 0)}
    ${iletkenler}
    ${dimLine(cx - r - 12, cy + r + 26, cx + r + 12, cy + r + 26, `Ø ≈ ${((r + 12) * 2 * 0.5).toFixed(1)} mm`, "h")}
    ${resultBox(cx, H - 22, "Kesit Alanı", `${kesit} mm²`, C.copper)}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  6. BETON KESİT
// ═══════════════════════════════════════════════════════════════
function drawConcreteSection(p: DrawingParams): string {
  const W = 380, H = 310;
  const genislik = p.width  || 1000;
  const kalinlik = p.height || 200;
  const scale = Math.min(250 / genislik, 110 / kalinlik, 0.9);
  const Ws = genislik * scale, Hs = kalinlik * scale;
  const x0 = (W - Ws) / 2, y0 = (H - Hs) / 2;

  const nRebar = Math.min(Math.max(Math.floor(Ws / 22), 2), 12);
  const rebarR = 3.5, cover = 15;
  let rebars = "";
  for (let i = 0; i < nRebar; i++) {
    const rx = x0 + cover + (Ws - 2 * cover) / (nRebar - 1) * i;
    rebars += circle(rx, y0 + Hs - cover, rebarR, C.rebar, "#78716c", 0.8);
    rebars += circle(rx, y0 + cover, rebarR, C.rebar, "#78716c", 0.8);
  }

  return wrapSVG(`
    ${txt(W / 2, 20, "BETONARME PLAK KESİTİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 35, `${genislik}×${kalinlik} mm`, { size: 10, color: C.textSm })}
    ${rect(x0, y0, Ws, Hs, "#e7e5e4", C.concrete, 2)}
    ${hatch(x0, y0, Ws, Hs, "#a8a29e", 11)}
    ${rect(x0, y0, Ws, Hs, "none", C.concrete, 2)}
    ${rebars}
    ${line(x0 + cover, y0, x0 + cover, y0 + Hs, C.dim, 0.5, "2,2")}
    ${line(x0 + Ws - cover, y0, x0 + Ws - cover, y0 + Hs, C.dim, 0.5, "2,2")}
    ${dimLine(x0, y0 - 22, x0 + Ws, y0 - 22, `${genislik} mm`, "h")}
    ${dimLine(x0 - 28, y0, x0 - 28, y0 + Hs, `${kalinlik} mm`, "v")}
    ${txt(x0 + cover / 2 + 5, y0 + Hs / 2, `c`, { size: 8, color: C.dimTxt, rotate: -90 })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  7. KİRİŞ YÜK (Düzgün Yayılı)
// ═══════════════════════════════════════════════════════════════
function drawBeamLoad(p: DrawingParams): string {
  const W = 420, H = 340;
  const L = p.length || 5000;
  const q = p.load   || 10;
  const Ls = 260;
  const bx = (W - Ls) / 2, by = 125;
  const R = q * (L / 1000) / 2;
  const Mmax = q * (L / 1000) * (L / 1000) / 8;

  const nArrow = 9;
  let loadArrows = "";
  for (let i = 0; i <= nArrow; i++) {
    const ax = bx + i * (Ls / nArrow);
    loadArrows += `<line x1="${ax}" y1="${by - 48}" x2="${ax}" y2="${by - 4}" stroke="${C.load}" stroke-width="1.8"/>`;
    loadArrows += `<polygon points="${ax},${by - 4} ${ax - 3.5},${by - 13} ${ax + 3.5},${by - 13}" fill="${C.load}"/>`;
  }

  // Moment eğrisi (parabolik)
  const nPts = 50;
  let mPath = `M ${bx} ${by + 88}`;
  for (let i = 1; i <= nPts; i++) {
    const xi = i / nPts;
    const Mx = q * (L / 1000) * xi * (1 - xi) / 2 * (L / 1000);
    const maxM = Mmax;
    mPath += ` L ${bx + xi * Ls} ${by + 88 - (Mx / maxM) * 52}`;
  }
  mPath += ` L ${bx + Ls} ${by + 88}`;

  return wrapSVG(`
    ${txt(W / 2, 18, "KİRİŞ YÜKLEME DİYAGRAMI", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 33, `q = ${q} kN/m  |  L = ${(L / 1000).toFixed(1)} m`, { size: 9, color: C.textSm })}

    ${line(bx, by - 48, bx + Ls, by - 48, C.load, 2)}
    ${loadArrows}
    ${txt(bx + Ls / 2, by - 60, `q = ${q} kN/m`, { size: 9, bold: true, color: C.load })}

    ${rect(bx, by, Ls, 14, "#bfdbfe", C.steel, 2, 2)}

    <!-- Sol mesnet (mafsallı) -->
    <polygon points="${bx},${by + 14} ${bx - 11},${by + 32} ${bx + 11},${by + 32}" fill="${C.steel}"/>
    ${line(bx - 15, by + 32, bx + 15, by + 32, C.steel, 2)}
    ${hatch(bx - 15, by + 32, 30, 8, C.steelL, 5)}

    <!-- Sağ mesnet (makaralı) -->
    <polygon points="${bx + Ls},${by + 14} ${bx + Ls - 11},${by + 32} ${bx + Ls + 11},${by + 32}" fill="${C.steel}"/>
    ${circle(bx + Ls - 6, by + 36, 3.5, C.steel, C.steel, 0)}
    ${circle(bx + Ls + 6, by + 36, 3.5, C.steel, C.steel, 0)}
    ${line(bx + Ls - 16, by + 40, bx + Ls + 16, by + 40, C.steel, 2)}
    ${hatch(bx + Ls - 16, by + 40, 32, 8, C.steelL, 5)}

    ${arrow(bx, by + 46, "up", 30, C.result, 2.2)}
    ${arrow(bx + Ls, by + 46, "up", 30, C.result, 2.2)}
    ${txt(bx - 2, by + 82, `R=${R.toFixed(1)}kN`, { size: 9, bold: true, color: C.result })}
    ${txt(bx + Ls + 2, by + 82, `R=${R.toFixed(1)}kN`, { size: 9, bold: true, color: C.result })}

    ${dimLine(bx, by + 94, bx + Ls, by + 94, `L = ${(L / 1000).toFixed(1)} m`, "h")}

    <!-- Moment diyagramı -->
    ${txt(W / 2, by + 103, "Moment Diyagramı", { size: 8, color: C.textSm })}
    <path d="${mPath}" fill="#dcfce7" stroke="${C.result}" stroke-width="1.8" opacity="0.9"/>
    ${txt(W / 2, by + 55, `M_max = ${Mmax.toFixed(1)} kNm`, { size: 9, bold: true, color: C.result })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  8. NOKTA YÜKLU KİRİŞ (YENİ)
// ═══════════════════════════════════════════════════════════════
function drawPointLoadBeam(p: DrawingParams): string {
  const W = 420, H = 340;
  const L  = (p.length || 5000) / 1000;  // m
  const P  = p.pointLoad || p.load || 20; // kN
  const a  = L / 2;  // yük ortada
  const b  = L - a;
  const Ra = P * b / L, Rb = P * a / L;
  const Mmax = Ra * a;

  const Ls = 260, bx = (W - Ls) / 2, by = 120;
  const loadX = bx + (a / L) * Ls;
  const scaleM = 55 / Mmax;
  const nPts = 50;

  let mPath = `M ${bx} ${by + 80}`;
  for (let i = 1; i <= nPts; i++) {
    const xi = i / nPts * L;
    const Mx = xi <= a ? Ra * xi : Ra * xi - P * (xi - a);
    mPath += ` L ${bx + (i / nPts) * Ls} ${by + 80 - Mx * scaleM}`;
  }
  mPath += ` L ${bx + Ls} ${by + 80}`;

  return wrapSVG(`
    ${txt(W / 2, 18, "NOKTA YÜKLU KİRİŞ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 33, `P = ${P} kN  |  L = ${L.toFixed(1)} m  |  a = ${a.toFixed(1)} m`, { size: 9, color: C.textSm })}

    <!-- Kiriş -->
    ${rect(bx, by, Ls, 13, "#bfdbfe", C.steel, 2, 2)}

    <!-- Nokta yük -->
    ${arrow(loadX, by - 36, "down", 34, C.load, 2.5)}
    ${txt(loadX, by - 46, `P = ${P} kN`, { size: 10, bold: true, color: C.load })}

    <!-- Mesnetler -->
    <polygon points="${bx},${by + 13} ${bx - 11},${by + 30} ${bx + 11},${by + 30}" fill="${C.steel}"/>
    ${line(bx - 15, by + 30, bx + 15, by + 30, C.steel, 2)}
    ${hatch(bx - 15, by + 30, 30, 8, C.steelL, 5)}

    <polygon points="${bx + Ls},${by + 13} ${bx + Ls - 11},${by + 30} ${bx + Ls + 11},${by + 30}" fill="${C.steel}"/>
    ${circle(bx + Ls - 6, by + 34, 3.5, C.steel, C.steel, 0)}
    ${circle(bx + Ls + 6, by + 34, 3.5, C.steel, C.steel, 0)}
    ${line(bx + Ls - 16, by + 38, bx + Ls + 16, by + 38, C.steel, 2)}
    ${hatch(bx + Ls - 16, by + 38, 32, 8, C.steelL, 5)}

    ${arrow(bx, by + 44, "up", 28, C.result, 2)}
    ${arrow(bx + Ls, by + 44, "up", 28, C.result, 2)}
    ${txt(bx - 2, by + 76, `Ra=${Ra.toFixed(1)}kN`, { size: 8, bold: true, color: C.result })}
    ${txt(bx + Ls + 2, by + 76, `Rb=${Rb.toFixed(1)}kN`, { size: 8, bold: true, color: C.result })}

    <!-- a / b boyut -->
    ${dimLine(bx, by - 2, loadX, by - 2, `a=${a.toFixed(1)}m`, "h")}
    ${dimLine(loadX, by - 2, bx + Ls, by - 2, `b=${b.toFixed(1)}m`, "h")}

    ${dimLine(bx, by + 90, bx + Ls, by + 90, `L = ${L.toFixed(1)} m`, "h")}

    <!-- Moment diyagramı -->
    ${txt(W / 2, by + 100, "Moment Diyagramı (Üçgen)", { size: 8, color: C.textSm })}
    <path d="${mPath}" fill="#dcfce7" stroke="${C.result}" stroke-width="1.8" opacity="0.9"/>
    ${txt(loadX, by + 80 - Mmax * scaleM - 10, `M_max=${Mmax.toFixed(2)} kNm`, { size: 9, bold: true, color: C.result })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
//  9. KESME KUVVETİ DİYAGRAMI
// ═══════════════════════════════════════════════════════════════
function drawShearDiagram(p: DrawingParams): string {
  const W = 420, H = 290;
  const L = (p.length || 5000) / 1000;
  const q = p.load || 10;
  const R = q * L / 2;
  const Ls = 270, bx = 75, by = 85;
  const scaleY = 72 / R;
  const nPts = 50;

  let path = `M ${bx} ${by - R * scaleY}`;
  for (let i = 1; i <= nPts; i++) {
    const x = i / nPts * L;
    path += ` L ${bx + (i / nPts) * Ls} ${by - (R - q * x) * scaleY}`;
  }

  return wrapSVG(`
    ${txt(W / 2, 17, "KESME KUVVETİ DİYAGRAMI  V(x)", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 31, `q=${q} kN/m  ·  L=${L.toFixed(1)} m  ·  R=${R.toFixed(1)} kN`, { size: 9, color: C.textSm })}

    ${line(bx - 10, by, bx + Ls + 10, by, C.steelL, 1, "4,3")}

    <path d="M ${bx} ${by - R * scaleY} ${path.slice(2)} L ${bx + Ls} ${by} L ${bx} ${by} Z" fill="${C.load}22"/>
    <path d="${path}" fill="none" stroke="${C.load}" stroke-width="2.5"/>

    ${rect(bx, by + 8, Ls, 11, "#bfdbfe", C.steel, 1.5, 2)}

    ${txt(bx, by - R * scaleY - 9, `+${R.toFixed(1)} kN`, { size: 9, bold: true, color: C.load })}
    ${txt(bx + Ls, by + R * scaleY + 9, `−${R.toFixed(1)} kN`, { size: 9, bold: true, color: C.load, anchor: "end" })}
    ${txt(bx + Ls / 2, by - 10, "V=0", { size: 8, color: C.steelL })}

    <polygon points="${bx},${by + 19} ${bx - 9},${by + 32} ${bx + 9},${by + 32}" fill="${C.steel}"/>
    <polygon points="${bx + Ls},${by + 19} ${bx + Ls - 9},${by + 32} ${bx + Ls + 9},${by + 32}" fill="${C.steel}"/>
    ${circle(bx + Ls - 5, by + 35, 3.5, C.steel, C.steel, 0)}
    ${circle(bx + Ls + 5, by + 35, 3.5, C.steel, C.steel, 0)}

    ${dimLine(bx, by + 50, bx + Ls, by + 50, `L = ${L.toFixed(1)} m`, "h")}
    ${p.label ? txt(W / 2, H - 8, p.label, { size: 8, color: C.textSm }) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 10. MOMENT DİYAGRAMI
// ═══════════════════════════════════════════════════════════════
function drawMomentDiagram(p: DrawingParams): string {
  const W = 420, H = 290;
  const L = (p.length || 5000) / 1000;
  const q = p.load || 10;
  const Mmax = q * L * L / 8;
  const Ls = 270, bx = 75, by = 155;
  const scaleY = 82 / Mmax;
  const nPts = 60;

  let path = `M ${bx} ${by}`;
  for (let i = 1; i <= nPts; i++) {
    const xi = i / nPts * L;
    const Mx = (q * L / 2) * xi - q * xi * xi / 2;
    path += ` L ${bx + (i / nPts) * Ls} ${by - Mx * scaleY}`;
  }
  path += ` L ${bx + Ls} ${by}`;

  return wrapSVG(`
    ${txt(W / 2, 17, "EĞİLME MOMENTİ DİYAGRAMI  M(x)", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 31, `q=${q} kN/m  ·  L=${L.toFixed(1)} m  ·  M_max=${Mmax.toFixed(2)} kNm`, { size: 9, color: C.textSm })}

    ${line(bx - 10, by, bx + Ls + 10, by, C.steelL, 1, "4,3")}

    <path d="${path}" fill="#dcfce7" opacity="0.75"/>
    <path d="M ${bx} ${by} ${path.slice(2)}" fill="none" stroke="${C.result}" stroke-width="2.5"/>

    ${rect(bx, by + 3, Ls, 11, "#bfdbfe", C.steel, 1.5, 2)}

    ${line(bx + Ls / 2, by, bx + Ls / 2, by - Mmax * scaleY, C.result, 1, "3,2")}
    ${txt(bx + Ls / 2, by - Mmax * scaleY - 11, `M_max = ${Mmax.toFixed(2)} kNm`, { size: 10, bold: true, color: C.result })}

    <polygon points="${bx},${by + 14} ${bx - 9},${by + 26} ${bx + 9},${by + 26}" fill="${C.steel}"/>
    <polygon points="${bx + Ls},${by + 14} ${bx + Ls - 9},${by + 26} ${bx + Ls + 9},${by + 26}" fill="${C.steel}"/>
    ${circle(bx + Ls - 5, by + 29, 3.5, C.steel, C.steel, 0)}
    ${circle(bx + Ls + 5, by + 29, 3.5, C.steel, C.steel, 0)}

    ${dimLine(bx, by + 44, bx + Ls, by + 44, `L = ${L.toFixed(1)} m`, "h")}
    ${p.label ? txt(W / 2, H - 8, p.label, { size: 8, color: C.textSm }) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 11. DEFORMASYON EĞRİSİ
// ═══════════════════════════════════════════════════════════════
function drawDeflection(p: DrawingParams): string {
  const W = 420, H = 300;
  const L    = (p.length || 5000) / 1000;
  const q    = p.load   || 10;
  const Ix   = (p.Ix    || 2000) * 1e-8;
  const E    = (p.E     || 210000) * 1e6;
  const dmax = (5 * q * 1000 * Math.pow(L, 4)) / (384 * E * Ix) * 1000;
  const dmax_m = dmax / 1000;

  const Ls = 270, bx = 75, by = 115;
  const scaleY = Math.min(65 / dmax_m, 5e6);
  const nPts = 60;

  let path = `M ${bx} ${by}`;
  for (let i = 1; i <= nPts; i++) {
    const x = i / nPts * L;
    const dx = (q * 1000 * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3))) / (24 * E * Ix);
    path += ` L ${bx + (i / nPts) * Ls} ${by + dx * scaleY}`;
  }
  path += ` L ${bx + Ls} ${by}`;

  const ratio = L / dmax_m;
  const isOK = ratio >= 300;

  return wrapSVG(`
    ${txt(W / 2, 17, "DEFORMASYON EĞRİSİ  δ(x)", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 31, `q=${q} kN/m  ·  L=${L.toFixed(1)} m  ·  EI=${((E * Ix) / 1e6).toFixed(0)} MN·m²`, { size: 9, color: C.textSm })}

    ${line(bx, by, bx + Ls, by, C.steelL, 1, "4,3")}
    <path d="M ${bx} ${by} ${path.slice(2)}" fill="#e0f2fe" opacity="0.7"/>
    <path d="M ${bx} ${by} ${path.slice(2)}" fill="none" stroke="#0284c7" stroke-width="2.5"/>

    ${rect(bx, by - 9, Ls, 9, "#bfdbfe", C.steel, 1.5, 2)}

    ${line(bx + Ls / 2, by, bx + Ls / 2, by + dmax_m * scaleY, "#0284c7", 1.5, "3,2")}
    <polygon points="${bx + Ls / 2},${by + dmax_m * scaleY + 5} ${bx + Ls / 2 - 4},${by + dmax_m * scaleY - 4} ${bx + Ls / 2 + 4},${by + dmax_m * scaleY - 4}" fill="#0284c7"/>
    ${txt(bx + Ls / 2 + 6, by + dmax_m * scaleY / 2, `δ_max = ${dmax.toFixed(2)} mm`, { size: 10, bold: true, color: "#0284c7", anchor: "start" })}

    ${txt(W / 2, by + dmax_m * scaleY + 26, `L/δ = ${Math.round(ratio)}  ${isOK ? "✓ Kabul Edilebilir" : "⚠ L/300 Limitini Aşıyor"}`, { size: 9, bold: true, color: isOK ? C.result : "#dc2626" })}

    <polygon points="${bx},${by} ${bx - 8},${by + 14} ${bx + 8},${by + 14}" fill="${C.steel}"/>
    <polygon points="${bx + Ls},${by} ${bx + Ls - 8},${by + 14} ${bx + Ls + 8},${by + 14}" fill="${C.steel}"/>
    ${circle(bx + Ls - 5, by + 17, 3.5, C.steel, C.steel, 0)}
    ${circle(bx + Ls + 5, by + 17, 3.5, C.steel, C.steel, 0)}

    ${dimLine(bx, by + dmax_m * scaleY + 44, bx + Ls, by + dmax_m * scaleY + 44, `L = ${L.toFixed(1)} m`, "h")}
    ${p.label ? txt(W / 2, H - 8, p.label, { size: 8, color: C.textSm }) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 12. TAM KİRİŞ (4 panel)
// ═══════════════════════════════════════════════════════════════
function drawBeamFull(p: DrawingParams): string {
  const W = 440, H = 460;
  const L  = (p.length || 5000) / 1000;
  const q  = p.load || 10;
  const R  = q * L / 2;
  const Mm = q * L * L / 8;
  const Ix = (p.Ix || 2000) * 1e-8;
  const E  = (p.E  || 210000) * 1e6;
  const dm = (5 * q * 1000 * Math.pow(L, 4)) / (384 * E * Ix) * 1000;

  const Ls = 290, bx = 70;
  const sV = 44 / R, sM = 44 / Mm;
  const nPts = 50;

  const beamY = 68;

  let loadArrows = "";
  for (let i = 0; i <= 8; i++) {
    const ax = bx + i * Ls / 8;
    loadArrows += `<line x1="${ax}" y1="${beamY - 34}" x2="${ax}" y2="${beamY - 3}" stroke="${C.load}" stroke-width="1.6"/>`;
    loadArrows += `<polygon points="${ax},${beamY - 3} ${ax - 3},${beamY - 11} ${ax + 3},${beamY - 11}" fill="${C.load}"/>`;
  }

  const shearY = 160;
  let sPath = `M ${bx} ${shearY - R * sV}`;
  for (let i = 1; i <= nPts; i++) {
    const xi = i / nPts * L;
    sPath += ` L ${bx + (i / nPts) * Ls} ${shearY - (R - q * xi) * sV}`;
  }

  const momentY = 285;
  let mPath = `M ${bx} ${momentY}`;
  for (let i = 1; i <= nPts; i++) {
    const xi = i / nPts * L;
    mPath += ` L ${bx + (i / nPts) * Ls} ${momentY - (q * L / 2 * xi - q * xi * xi / 2) * sM}`;
  }
  mPath += ` L ${bx + Ls} ${momentY}`;

  const defY = 380;
  const sD = Math.min(32 / (dm / 1000), 1e8);
  let dPath = `M ${bx} ${defY}`;
  for (let i = 1; i <= nPts; i++) {
    const x = i / nPts * L;
    const dx = (q * 1000 * x * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3))) / (24 * E * Ix);
    dPath += ` L ${bx + (i / nPts) * Ls} ${defY + dx * sD}`;
  }
  dPath += ` L ${bx + Ls} ${defY}`;

  const isOK = (L / (dm / 1000)) >= 300;

  return wrapSVG(`
    ${txt(W / 2, 14, "KİRİŞ TAM ANALİZ RAPORU", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 28, `q=${q} kN/m  |  L=${L.toFixed(1)} m  |  Ix=${p.Ix || 2000} cm⁴`, { size: 9, color: C.textSm })}

    <!-- ① Yükleme -->
    ${txt(bx - 4, beamY - 42, "① Yükleme", { size: 9, bold: true, color: C.load, anchor: "start" })}
    ${line(bx, beamY - 34, bx + Ls, beamY - 34, C.load, 1.8)}
    ${loadArrows}
    ${rect(bx, beamY, Ls, 10, "#bfdbfe", C.steel, 1.5, 2)}
    <polygon points="${bx},${beamY + 10} ${bx - 8},${beamY + 22} ${bx + 8},${beamY + 22}" fill="${C.steel}"/>
    <polygon points="${bx + Ls},${beamY + 10} ${bx + Ls - 8},${beamY + 22} ${bx + Ls + 8},${beamY + 22}" fill="${C.steel}"/>
    ${circle(bx + Ls - 5, beamY + 26, 2.5, C.steel, C.steel, 0)}
    ${circle(bx + Ls + 5, beamY + 26, 2.5, C.steel, C.steel, 0)}
    ${txt(bx - 8, beamY + 5, `R=${R.toFixed(1)}kN`, { size: 8, bold: true, color: C.result, anchor: "end" })}
    ${txt(bx + Ls + 8, beamY + 5, `R=${R.toFixed(1)}kN`, { size: 8, bold: true, color: C.result, anchor: "start" })}

    <!-- ② Kesme -->
    ${txt(bx - 4, shearY - 48, "② Kesme V(x)", { size: 9, bold: true, color: C.load, anchor: "start" })}
    ${line(bx - 10, shearY, bx + Ls + 10, shearY, C.steelL, 0.8, "3,2")}
    <path d="M ${bx} ${shearY - R * sV} ${sPath.slice(2)} L ${bx + Ls} ${shearY} L ${bx} ${shearY} Z" fill="${C.load}18"/>
    <path d="${sPath}" fill="none" stroke="${C.load}" stroke-width="2"/>
    ${txt(bx, shearY - R * sV - 7, `+${R.toFixed(1)}kN`, { size: 8, bold: true, color: C.load })}
    ${txt(bx + Ls, shearY + R * sV + 7, `−${R.toFixed(1)}kN`, { size: 8, bold: true, color: C.load, anchor: "end" })}

    <!-- ③ Moment -->
    ${txt(bx - 4, momentY - 52, "③ Moment M(x)", { size: 9, bold: true, color: C.result, anchor: "start" })}
    ${line(bx, momentY, bx + Ls, momentY, C.steelL, 0.8, "3,2")}
    <path d="${mPath}" fill="#dcfce7" opacity="0.7"/>
    <path d="M ${bx} ${momentY} ${mPath.slice(2)}" fill="none" stroke="${C.result}" stroke-width="2"/>
    ${line(bx + Ls / 2, momentY, bx + Ls / 2, momentY - Mm * sM, C.result, 1, "2,2")}
    ${txt(bx + Ls / 2, momentY - Mm * sM - 8, `M=${Mm.toFixed(2)}kNm`, { size: 8, bold: true, color: C.result })}

    <!-- ④ Deformasyon -->
    ${txt(bx - 4, defY - 13, "④ Deformasyon δ(x)", { size: 9, bold: true, color: "#0284c7", anchor: "start" })}
    ${line(bx, defY, bx + Ls, defY, C.steelL, 0.8, "3,2")}
    <path d="M ${bx} ${defY} ${dPath.slice(2)}" fill="#e0f2fe" opacity="0.6"/>
    <path d="M ${bx} ${defY} ${dPath.slice(2)}" fill="none" stroke="#0284c7" stroke-width="2"/>
    ${txt(bx + Ls / 2, defY + dm / 1000 * sD + 13, `δ_max=${dm.toFixed(2)}mm  L/δ=${Math.round(L / (dm / 1000))} ${isOK ? "✓" : "⚠"}`, { size: 8, bold: true, color: isOK ? C.result : "#dc2626" })}

    ${dimLine(bx, H - 18, bx + Ls, H - 18, `L = ${L.toFixed(1)} m`, "h")}
  `, W, H);

}

// ═══════════════════════════════════════════════════════════════
// 13. DİŞLİ ÇARKI
// ═══════════════════════════════════════════════════════════════
function drawGearPair(p: DrawingParams): string {
  const W = 420, H = 340;
  const m   = p.m  || 2;
  const z1  = p.z1 || 20;
  const z2  = p.z2 || 40;
  const d1  = m * z1, d2 = m * z2;
  const i   = z2 / z1;

  const aReal = (d1 + d2) / 2;
  const scale = Math.min(145 / aReal, 1.3);
  const r1 = d1 / 2 * scale, r2 = d2 / 2 * scale;
  const a  = r1 + r2;
  const cx1 = W / 2 - a / 2, cx2 = W / 2 + a / 2;
  const cy  = H / 2 + 12;
  const add = m * scale * 0.9;

  function drawGear(cx: number, r: number, nTeeth: number, fill1: string, fill2: string) {
    const nT = Math.min(nTeeth, 28);
    let teeth = "";
    for (let k = 0; k < nT; k++) {
      const a0 = (k / nT) * Math.PI * 2;
      const ah = Math.PI / nT * 0.38;
      const rTip = r + add, rRoot = r - add * 0.55;
      teeth += `<line x1="${cx + Math.cos(a0 - ah) * rRoot}" y1="${cy + Math.sin(a0 - ah) * rRoot}" x2="${cx + Math.cos(a0) * rTip}" y2="${cy + Math.sin(a0) * rTip}" stroke="${C.steel}" stroke-width="1.1"/>`;
      teeth += `<line x1="${cx + Math.cos(a0 + ah) * rRoot}" y1="${cy + Math.sin(a0 + ah) * rRoot}" x2="${cx + Math.cos(a0) * rTip}" y2="${cy + Math.sin(a0) * rTip}" stroke="${C.steel}" stroke-width="1.1"/>`;
    }
    return `
      ${circle(cx, cy, r + add, fill1, C.steel, 1.5)}
      ${circle(cx, cy, r, "none", C.dim, 0.8)}
      ${circle(cx, cy, r - add * 0.55, fill2, C.steel, 1.5)}
      ${teeth}
      ${circle(cx, cy, Math.max(r * 0.12, 4.5), C.steel, C.steel, 0)}
      ${line(cx - r - add - 6, cy, cx + r + add + 6, cy, C.dim, 0.7, "3,2")}
      ${line(cx, cy - r - add - 6, cx, cy + r + add + 6, C.dim, 0.7, "3,2")}
    `;
  }

  return wrapSVG(`
    ${txt(W / 2, 18, "DİŞLİ ÇARKI DİYAGRAMI", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 33, `m=${m}  z₁=${z1}  z₂=${z2}  i=${i.toFixed(2)}`, { size: 9, color: C.textSm })}

    ${drawGear(cx1, r1, z1, "#e0f2fe", "#bfdbfe")}
    ${drawGear(cx2, r2, z2, "#fef3c7", "#fde68a")}

    <!-- Teğet nokta -->
    ${circle(cx1 + r1, cy, 4, C.load, "white", 1.5)}

    <!-- Boyutlar -->
    ${dimLine(cx1 - r1, cy + r1 + add + 20, cx1 + r1, cy + r1 + add + 20, `d₁=${d1}mm`, "h")}
    ${dimLine(cx2 - r2, cy + r2 + add + 20, cx2 + r2, cy + r2 + add + 20, `d₂=${d2}mm`, "h")}
    ${dimLine(cx1, cy - r1 - add - 22, cx2, cy - r1 - add - 22, `a=${((d1 + d2) / 2).toFixed(0)}mm`, "h")}

    ${txt(cx1, cy, `z₁=${z1}`, { size: 9, bold: true, color: C.steel })}
    ${txt(cx2, cy, `z₂=${z2}`, { size: 9, bold: true, color: "#92400e" })}
    ${p.n1 ? txt(cx1, cy + r1 + add + 36, `n₁=${p.n1} rpm`, { size: 8, color: C.dimTxt }) : ""}
    ${p.n2 ? txt(cx2, cy + r2 + add + 36, `n₂=${p.n2?.toFixed(0)} rpm`, { size: 8, color: C.dimTxt }) : ""}
    ${txt(W / 2, H - 10, `Çevrim oranı  i = ${i.toFixed(3)}`, { size: 9, bold: true, color: C.result })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 14. HELIKAL YAY
// ═══════════════════════════════════════════════════════════════
function drawSpring(p: DrawingParams): string {
  const W = 420, H = 370;
  const d  = p.wireDia   || 5;
  const D  = p.coilDia   || 40;
  const n  = p.turns     || 8;
  const F  = p.force     || 500;
  const k  = p.stiffness || 0;
  const delta = p.deflection || 0;

  const scale = Math.min(58 / D, 2.0);
  const Ds = D * scale, ds = Math.max(d * scale, 2.5);
  const cx = W / 2, topY = 70, botY = H - 90;
  const springH = botY - topY;
  const nCoils = Math.min(n + 2, 12);

  let coilPath = `M ${cx - Ds / 2} ${topY}`;
  const pts = nCoils * 24;
  for (let i = 1; i <= pts; i++) {
    const t = i / pts;
    const y = topY + t * springH;
    const x = cx + Math.cos(t * nCoils * Math.PI * 2) * Ds / 2;
    coilPath += ` L ${x} ${y}`;
  }

  // Dim line sağda — yayın en sağından 40px ötede
  const dimX = cx + Ds / 2 + 44;
  // δ etiketi solda — yayın en solundan 38px ötede
  const deltaX = cx - Ds / 2 - 38;

  return wrapSVG(`
    ${txt(W / 2, 18, "HELİKAL BASINÇ YAYI", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 34, `d=${d}mm  D=${D}mm  n=${n}  F=${F}N`, { size: 9, color: C.textSm })}

    ${rect(cx - Ds / 2 - 10, topY - 12, Ds + 20, 12, C.steelL, C.steel, 1.5, 2)}
    ${arrow(cx, topY - 12, "up", 24, C.load, 2.2)}
    ${txt(cx, topY - 42, `F = ${F} N`, { size: 10, bold: true, color: C.load })}

    <path d="${coilPath}" fill="none" stroke="${C.steel}" stroke-width="${Math.max(ds, 2.5)}" stroke-linecap="round" stroke-linejoin="round"/>

    ${rect(cx - Ds / 2 - 10, botY, Ds + 20, 12, C.steelL, C.steel, 1.5, 2)}
    ${hatch(cx - Ds / 2 - 10, botY + 12, Ds + 20, 9, C.steelL, 6)}
    ${line(cx - Ds / 2 - 10, botY + 12, cx + Ds / 2 + 10, botY + 12, C.steel, 1.5)}

    ${dimLine(dimX, topY, dimX, botY, `L₀≈${((n + 2) * d).toFixed(0)}mm`, "v")}
    ${dimLine(cx - Ds / 2, botY + 32, cx + Ds / 2, botY + 32, `D=${D}mm`, "h")}
    ${delta > 0 ? txt(deltaX, topY + springH / 2, `δ=${delta.toFixed(1)}mm`, { size: 9, bold: true, color: C.dim, rotate: -90 }) : ""}

    ${k > 0 ? resultBox(cx, H - 20, "Rijitlik", `k = ${k} N/mm`) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 15. TERMAL PLAKA
// ═══════════════════════════════════════════════════════════════
function drawThermalPlate(p: DrawingParams): string {
  const W = 400, H = 310;
  const Q  = p.heatFlow || 0;
  const dT = p.deltaT   || 80;
  const L  = p.length   || 10;
  const k  = p.kValue   || 50;
  const T1 = 100 + dT / 2, T2 = 100 - dT / 2;

  const px0 = 85, px1 = 295, py0 = 90, py1 = 205;
  const pw = px1 - px0, ph = py1 - py0;
  const nS = 24;

  let strips = "";
  for (let i = 0; i < nS; i++) {
    const t = i / nS;
    const r = Math.round(220 - t * 165), b = Math.round(55 + t * 185);
    strips += `<rect x="${px0 + t * pw}" y="${py0}" width="${pw / nS + 1}" height="${ph}" fill="rgb(${r},75,${b})" opacity="0.55"/>`;
  }

  return wrapSVG(`
    ${txt(W / 2, 17, "TERMAL İLETİM — PLAKA", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `k=${k} W/mK  ΔT=${dT}°C  t=${L}mm`, { size: 9, color: C.textSm })}

    ${rect(px0, py0, pw, ph, "#f1f5f9", C.steel, 2)}
    ${strips}
    ${rect(px0, py0, pw, ph, "none", C.steel, 2)}

    ${txt(px0 - 6, py0 + ph / 2, `T₁=${T1.toFixed(0)}°C`, { size: 10, bold: true, color: "#dc2626", anchor: "end" })}
    ${txt(px1 + 6, py0 + ph / 2, `T₂=${T2.toFixed(0)}°C`, { size: 10, bold: true, color: "#2563eb", anchor: "start" })}

    ${[0.2, 0.5, 0.8].map(t =>
      `<line x1="${px0}" y1="${py0 + t * ph}" x2="${px1}" y2="${py0 + t * ph}" stroke="#f97316" stroke-width="1.5" opacity="0.7"/>`
    ).join("")}
    ${arrow(px1 + 18, py0 + ph / 2, "right", 28, "#f97316", 2.5)}
    ${txt(px1 + 62, py0 + ph / 2, `Q=${Q.toFixed(1)}W`, { size: 11, bold: true, color: "#f97316" })}

    ${dimLine(px0, py1 + 22, px1, py1 + 22, `t=${L}mm`, "h")}
    ${txt(W / 2, H - 18, `Q = k·A·ΔT/L = ${Q.toFixed(1)} W`, { size: 10, bold: true, color: C.result })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 16. TERMAL SİLİNDİR
// ═══════════════════════════════════════════════════════════════
function drawThermalCylinder(p: DrawingParams): string {
  const W = 380, H = 310;
  const r1 = parseFloat(String(p.r1 || 25));
  const r2 = parseFloat(String(p.r2 || 32));
  const Q  = p.heatFlow || 0;
  const dT = p.deltaT   || 80;
  const cx = W / 2, cy = H / 2 + 10;
  const scale = Math.min(85 / r2, 3);
  const R1 = r1 * scale, R2 = r2 * scale;

  const hatchArcs = [0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
    const rad = deg * Math.PI / 180;
    const x1 = cx + Math.cos(rad) * R1, y1 = cy + Math.sin(rad) * R1;
    const x2 = cx + Math.cos(rad) * (R2 + 13), y2 = cy + Math.sin(rad) * (R2 + 13);
    const nx = Math.cos(rad + Math.PI / 2), ny = Math.sin(rad + Math.PI / 2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f97316" stroke-width="1.5"/>
      <polygon points="${x2},${y2} ${x2 - 4 * nx - Math.cos(rad) * 8},${y2 - 4 * ny - Math.sin(rad) * 8} ${x2 + 4 * nx - Math.cos(rad) * 8},${y2 + 4 * ny - Math.sin(rad) * 8}" fill="#f97316"/>`;
  }).join("");

  return wrapSVG(`
    ${txt(W / 2, 17, "TERMAL İLETİM — SİLİNDİRİK", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `r₁=${r1}mm  r₂=${r2}mm  ΔT=${dT}°C`, { size: 9, color: C.textSm })}

    ${circle(cx, cy, R2, "#dbeafe", C.steel, 2)}
    ${hatch(cx - R2, cy - R2, R2 * 2, R2 * 2, "#94a3b8", 9)}
    ${circle(cx, cy, R2, "none", C.steel, 2)}
    ${circle(cx, cy, R1, "#fecaca", "#dc2626", 2)}

    ${hatchArcs}

    ${dimLine(cx, cy, cx + R1, cy, `r₁=${r1}mm`, "h")}
    ${dimLine(cx, cy + R1 + 12, cx + R2, cy + R1 + 12, `r₂=${r2}mm`, "h")}

    ${txt(cx, cy, "Sıcak", { size: 9, bold: true, color: "#dc2626" })}
    ${txt(cx, cy + R2 + 22, "Soğuk", { size: 9, color: "#2563eb" })}

    ${Q > 0 ? resultBox(cx, H - 22, "Isı Akısı", `Q = ${Q.toFixed(1)} W`) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 17. KAMA KANALI
// ═══════════════════════════════════════════════════════════════
function drawKeyway(p: DrawingParams): string {
  const W = 520, H = 340;
  const shaft = p.shaftDia || 30;
  const bw = p.b || 8, hw = p.h || 7;
  const t1 = p.t1 || 4, t2 = p.t2 || 3.3;

  const scale = Math.min(98 / shaft, 2.7);
  const R = shaft / 2 * scale;
  const BW = bw * scale;
  const HW = hw * scale;
  const T1 = t1 * scale;
  const T2 = t2 * scale;

  const leftCx = 150;
  const cy = 178;
  const keyX = leftCx - BW / 2;
  const keyY = cy - R;

  const rightCx = 382;
  const hubOuterR = Math.max(R + 28, 66);
  const boreR = R;
  const hubSlotX = rightCx - BW / 2;
  const hubSlotY = cy - boreR - T2;

  return wrapSVG(`
    ${txt(W / 2, 18, "KAMA BAĞLANTISI ÖN ÇİZİMİ", { size: 13, bold: true, color: C.text })}
    ${txt(W / 2, 36, `d=${shaft}mm  b×h=${bw}×${hw}mm  t₁=${t1}mm  t₂=${t2}mm`, { size: 9, color: C.textSm })}

    <!-- Sol: mil kanalı -->
    ${txt(leftCx, 58, "Mil Kanalı", { size: 10, bold: true, color: C.text })}
    ${circle(leftCx, cy, R, "#dbeafe", C.steel, 2)}
    ${hatch(leftCx - R, cy - R, R * 2, R * 2, C.steelL, 8)}
    ${circle(leftCx, cy, R, "none", C.steel, 2)}
    ${rect(keyX, keyY, BW, T1, C.bg, C.steel, 1.6)}
    ${line(leftCx - R - 16, cy, leftCx + R + 16, cy, C.dim, 0.8, "4,3")}
    ${line(leftCx, cy - R - 16, leftCx, cy + R + 16, C.dim, 0.8, "4,3")}
    ${dimLine(leftCx - R - 32, cy - R, leftCx - R - 32, cy + R, `d=${shaft}`, "v")}
    ${dimLine(keyX, keyY - 17, keyX + BW, keyY - 17, `b=${bw}`, "h")}
    ${dimLine(leftCx + R + 12, cy - R, leftCx + R + 12, keyY + T1, `t₁=${t1}`, "v")}

    <!-- Sağ: göbek ve kama ilişkisi -->
    ${txt(rightCx, 58, "Göbek + Kama", { size: 10, bold: true, color: C.text })}
    ${circle(rightCx, cy, hubOuterR, "#f1f5f9", C.steel, 2)}
    ${circle(rightCx, cy, boreR, C.bg, C.steel, 2)}
    ${rect(hubSlotX, hubSlotY, BW, T2, C.bg, C.steel, 1.5)}
    ${rect(rightCx - BW / 2, cy - boreR - T2, BW, HW, "#fef3c7", C.steel, 1.5, 2)}
    ${line(rightCx - hubOuterR - 12, cy, rightCx + hubOuterR + 12, cy, C.dim, 0.8, "4,3")}
    ${line(rightCx, cy - hubOuterR - 12, rightCx, cy + hubOuterR + 12, C.dim, 0.8, "4,3")}
    ${dimLine(rightCx - BW / 2, cy - boreR - T2 - 18, rightCx + BW / 2, cy - boreR - T2 - 18, `b=${bw}`, "h")}
    ${dimLine(rightCx + boreR + 14, cy - boreR - T2, rightCx + boreR + 14, cy - boreR, `t₂=${t2}`, "v")}
    ${dimLine(rightCx + boreR + 34, cy - boreR - T2, rightCx + boreR + 34, cy - boreR - T2 + HW, `h=${hw}`, "v")}

    ${resultBox(118, H - 47, "Mil oluğu", `t₁=${t1} mm`, C.dimTxt)}
    ${resultBox(260, H - 47, "Kama", `b×h=${bw}×${hw}`, "#d97706")}
    ${resultBox(402, H - 47, "Göbek oluğu", `t₂=${t2} mm`, C.result)}
    ${txt(W / 2, H - 15, "Ölçüler ön seçimdir. Kesin tolerans karakteri uygulama ve teknik resme göre belirlenir.", { size: 9, color: C.textSm })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 18. TORK DİYAGRAMI
// ═══════════════════════════════════════════════════════════════
function drawTorqueDiagram(p: DrawingParams): string {
  const W = 400, H = 310;
  const T = p.result || 100;
  const d = p.width  || 30;
  const tauMax = p.stress  || 0;
  const tauAlw = p.result2 || 0;
  const isOK = tauMax <= tauAlw || tauAlw === 0;

  const scale = Math.min(72 / d, 3.2);
  const R = d / 2 * scale;
  const cx = 115, cy = H / 2;

  const nArc = 9;
  let torkArcs = "";
  for (let i = 0; i < nArc; i++) {
    const a0 = (i / nArc) * Math.PI * 2;
    const a1 = a0 + Math.PI / nArc * 0.72;
    const r  = R * 1.32;
    torkArcs += `<path d="M ${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r}" fill="none" stroke="#f97316" stroke-width="2.2"/>`;
    if (i === nArc - 1) {
      const ax = cx + Math.cos(a1) * r, ay = cy + Math.sin(a1) * r;
      const nx = Math.cos(a1 + Math.PI / 2), ny = Math.sin(a1 + Math.PI / 2);
      torkArcs += `<polygon points="${ax},${ay} ${ax - nx * 5 - Math.cos(a1) * 7},${ay - ny * 5 - Math.sin(a1) * 7} ${ax + nx * 5 - Math.cos(a1) * 7},${ay + ny * 5 - Math.sin(a1) * 7}" fill="#f97316"/>`;
    }
  }

  const bx = W - 135;

  return wrapSVG(`
    ${txt(W / 2, 17, "TORK & KAYMA GERİLMESİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `T=${T} Nm  d=${d} mm`, { size: 9, color: C.textSm })}

    ${circle(cx, cy, R, "#bfdbfe", C.steel, 2.5)}
    ${hatch(cx - R, cy - R, R * 2, R * 2, C.steelL, 8)}
    ${circle(cx, cy, R, "none", C.steel, 2.5)}
    ${line(cx - R - 16, cy, cx + R + 16, cy, C.dim, 0.8, "4,3")}
    ${line(cx, cy - R - 16, cx, cy + R + 16, C.dim, 0.8, "4,3")}

    ${torkArcs}
    ${txt(cx, cy - R * 1.35 - 13, `T = ${T} Nm`, { size: 10, bold: true, color: "#f97316" })}

    ${dimLine(cx - R, cy + R + 20, cx + R, cy + R + 20, `d=${d}mm`, "h")}

    <!-- Gerilme dağılımı -->
    ${txt(bx + 42, cy - R - 15, "Kayma Gerilmesi", { size: 9, bold: true, color: C.text })}
    <polygon points="${bx},${cy - R} ${bx + 80},${cy - R} ${bx},${cy + R}" fill="#fee2e2" stroke="${C.load}" stroke-width="1.8"/>
    ${line(bx, cy - R, bx, cy + R, C.load, 2.2)}
    ${txt(bx - 4, cy, "0", { size: 8, color: C.textSm, anchor: "end" })}
    ${tauMax > 0 ? txt(bx + 84, cy - R, `${tauMax.toFixed(1)} MPa`, { size: 9, bold: true, color: C.load, anchor: "start" }) : ""}
    ${tauAlw > 0 ? txt(bx + 40, cy + R + 16, `τ_izin=${tauAlw.toFixed(1)} MPa`, { size: 9, color: C.dimTxt }) : ""}

    ${tauMax > 0 ? txt(W / 2, H - 14, `${isOK ? "✓ Güvenli" : "⚠ Gerilme Aşımı"}  τ=${tauMax.toFixed(1)}/${tauAlw.toFixed(1)} MPa`, { size: 10, bold: true, color: isOK ? C.result : "#dc2626" }) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 19. OHM DEVRESİ
// ═══════════════════════════════════════════════════════════════
function drawOhmCircuit(p: DrawingParams): string {
  const W = 400, H = 290;
  const V = p.voltage    || 0;
  const I = p.current    || 0;
  const R = p.resistance || 0;
  const P = p.power      || 0;

  const cx = W / 2, cy = H / 2 - 5;
  const bw = 210, bh = 115;
  const lx = cx - bw / 2, rx = cx + bw / 2, ty = cy - bh / 2, by = cy + bh / 2;

  // Zigzag direnç
  const zx = cx - 28, zy = ty, nZ = 6, zw = 56, zh = 10;
  let zigzag = `M ${zx} ${zy}`;
  for (let i = 0; i <= nZ; i++) {
    zigzag += ` L ${zx + i * (zw / nZ)} ${zy + (i % 2 === 0 ? -zh : zh)}`;
  }
  zigzag += ` L ${zx + zw} ${zy}`;

  return wrapSVG(`
    ${txt(W / 2, 17, "OHM KANUNU DEVRESİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `V=${V}V  I=${I.toFixed(3)}A  R=${R}Ω  P=${P.toFixed(2)}W`, { size: 9, color: C.textSm })}

    <!-- Devre yolları -->
    ${line(lx, ty, rx, ty, C.steel, 2)}
    ${line(rx, ty, rx, by, C.steel, 2)}
    ${line(lx, by, rx, by, C.steel, 2)}
    ${line(lx, ty, lx, cy - 24, C.steel, 2)}
    ${line(lx, cy + 24, lx, by, C.steel, 2)}

    <!-- Pil (sol) -->
    ${line(lx - 10, cy - 22, lx + 10, cy - 22, "#16a34a", 3.5)}
    ${line(lx - 6, cy - 12, lx + 6, cy - 12, "#16a34a", 1.8)}
    ${line(lx - 10, cy + 2, lx + 10, cy + 2, "#16a34a", 3.5)}
    ${line(lx - 6, cy + 14, lx + 6, cy + 14, "#16a34a", 1.8)}
    ${txt(lx - 20, cy, `${V}V`, { size: 9, bold: true, color: "#16a34a", anchor: "end" })}
    ${txt(lx + 3, cy - 26, "+", { size: 11, bold: true, color: "#16a34a" })}
    ${txt(lx + 3, cy + 30, "−", { size: 11, bold: true, color: "#dc2626" })}

    <!-- Direnç (üst) -->
    <path d="${zigzag}" fill="none" stroke="${C.load}" stroke-width="2.2" stroke-linejoin="round"/>
    ${txt(cx, ty - 16, `R = ${R} Ω`, { size: 10, bold: true, color: C.load })}

    <!-- Akım oku -->
    ${arrow(rx - 28, ty, "left", 22, "#f97316", 1.8)}
    ${txt(rx - 38, ty - 13, `I=${I.toFixed(3)}A`, { size: 8, bold: true, color: "#f97316", anchor: "end" })}

    <!-- Güç kutusu -->
    ${resultBox(cx, by + 32, "Güç", `P = ${P.toFixed(2)} W`)}

    <!-- Formüller -->
    ${txt(rx + 6, cy - 8, "V = I·R", { size: 9, bold: true, color: C.dimTxt, anchor: "start" })}
    ${txt(rx + 6, cy + 8, "P = V·I", { size: 9, color: C.dimTxt, anchor: "start" })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 20. GÜÇ ÜÇGENİ
// ═══════════════════════════════════════════════════════════════
function drawPowerTriangle(p: DrawingParams): string {
  const W = 400, H = 310;
  const P  = p.power   || 10;
  const Q  = p.result  || 0;
  const S  = Math.sqrt(P * P + Q * Q);
  const pf = p.result2 || (P / S);
  const phi = Math.atan2(Q, P);

  const scale = 92 / Math.max(S, P, 1);
  const Ps = P * scale, Qs = Q * scale;
  const ox = 100, oy = H / 2 + 32;

  return wrapSVG(`
    ${txt(W / 2, 17, "GÜÇ ÜÇGENİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `P=${P.toFixed(1)}kW  Q=${Q.toFixed(1)}kVAr  cos φ=${pf.toFixed(3)}`, { size: 9, color: C.textSm })}

    <!-- Aktif (P) -->
    <line x1="${ox}" y1="${oy}" x2="${ox + Ps}" y2="${oy}" stroke="#16a34a" stroke-width="3.5"/>
    <polygon points="${ox + Ps},${oy} ${ox + Ps - 11},${oy - 5} ${ox + Ps - 11},${oy + 5}" fill="#16a34a"/>
    ${txt((ox + ox + Ps) / 2, oy + 15, `P = ${P.toFixed(2)} kW`, { size: 10, bold: true, color: "#16a34a" })}

    <!-- Reaktif (Q) -->
    <line x1="${ox + Ps}" y1="${oy}" x2="${ox + Ps}" y2="${oy - Qs}" stroke="#ef4444" stroke-width="3.5"/>
    <polygon points="${ox + Ps},${oy - Qs} ${ox + Ps - 5},${oy - Qs + 11} ${ox + Ps + 5},${oy - Qs + 11}" fill="#ef4444"/>
    ${txt(ox + Ps + 32, oy - Qs / 2, `Q = ${Q.toFixed(2)} kVAr`, { size: 10, bold: true, color: "#ef4444" })}

    <!-- Görünür (S) -->
    <line x1="${ox}" y1="${oy}" x2="${ox + Ps}" y2="${oy - Qs}" stroke="#3b82f6" stroke-width="3.5" stroke-dasharray="7,3"/>
    ${txt((ox + ox + Ps) / 2 - 12, (oy + oy - Qs) / 2 - 12, `S = ${S.toFixed(2)} kVA`, { size: 10, bold: true, color: "#3b82f6" })}

    <!-- Açı -->
    <path d="M ${ox + 28} ${oy} A 28 28 0 0 1 ${ox + 28 * Math.cos(phi)} ${oy - 28 * Math.sin(phi)}" fill="none" stroke="#f97316" stroke-width="1.8"/>
    ${txt(ox + 38, oy - 12, `φ=${(phi * 180 / Math.PI).toFixed(1)}°`, { size: 9, color: "#f97316" })}

    <!-- cos φ kutusu -->
    <rect x="${W - 140}" y="${H / 2 - 30}" width="118" height="55" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" rx="10"/>
    ${txt(W - 81, H / 2 - 14, "cos φ =", { size: 9, color: "#1d4ed8" })}
    ${txt(W - 81, H / 2 + 6, pf.toFixed(3), { size: 18, bold: true, color: "#1d4ed8" })}

    ${txt(W / 2, H - 12, `Kompanzasyon: ${pf < 0.95 ? "Gerekli ⚠" : "Gerekmez ✓"}`, { size: 9, bold: true, color: pf < 0.95 ? "#dc2626" : C.result })}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 21. LED DİRENÇ
// ═══════════════════════════════════════════════════════════════
function drawLedResistorCircuit(p: DrawingParams): string {
  const W = 400, H = 270;
  const Vs = p.voltage    || 12;
  const Vf = p.result     || 2.1;
  const If = p.current    || 20;
  const R  = p.resistance || 0;

  const cx = W / 2, cy = H / 2;
  const bw = 230, bh = 112;
  const lx = cx - bw / 2, rx = cx + bw / 2, ty = cy - bh / 2, by = cy + bh / 2;

  const zx = cx - 38, zy = ty, nZ = 5, zw = 38, zh = 8;
  let zigzag = `M ${zx} ${zy}`;
  for (let i = 0; i <= nZ; i++) zigzag += ` L ${zx + i * (zw / nZ)} ${zy + (i % 2 === 0 ? -zh : zh)}`;
  zigzag += ` L ${zx + zw} ${zy}`;

  return wrapSVG(`
    ${txt(W / 2, 17, "LED DİRENÇ DEVRESİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `Vs=${Vs}V  Vf=${Vf}V  If=${If}mA  R=${R.toFixed(0)}Ω`, { size: 9, color: C.textSm })}

    ${line(lx, ty, rx, ty, C.steel, 2)}
    ${line(rx, ty, rx, by, C.steel, 2)}
    ${line(lx, by, rx, by, C.steel, 2)}
    ${line(lx, ty, lx, cy - 24, C.steel, 2)}
    ${line(lx, cy + 24, lx, by, C.steel, 2)}

    ${line(lx - 10, cy - 20, lx + 10, cy - 20, "#16a34a", 3.5)}
    ${line(lx - 6, cy - 10, lx + 6, cy - 10, "#16a34a", 1.8)}
    ${line(lx - 10, cy + 4, lx + 10, cy + 4, "#16a34a", 3.5)}
    ${line(lx - 6, cy + 14, lx + 6, cy + 14, "#16a34a", 1.8)}
    ${txt(lx - 20, cy, `${Vs}V`, { size: 9, bold: true, color: "#16a34a", anchor: "end" })}

    <path d="${zigzag}" fill="none" stroke="${C.load}" stroke-width="2.2" stroke-linejoin="round"/>
    ${txt(cx - 19, ty - 16, `R=${R.toFixed(0)}Ω`, { size: 9, bold: true, color: C.load })}

    <!-- LED sembolü -->
    <polygon points="${rx},${cy - 16} ${rx},${cy + 16} ${rx - 20},${cy}" fill="#fbbf24" stroke="#f97316" stroke-width="1.8"/>
    ${line(rx - 20, cy - 16, rx - 20, cy + 16, "#f97316", 2.2)}
    ${[0.3, 0.7].map(t => `
      <line x1="${rx + 5}" y1="${cy - 16 + t * 32}" x2="${rx + 22}" y2="${cy - 24 + t * 32}" stroke="#fbbf24" stroke-width="1.6"/>
      <polygon points="${rx + 22},${cy - 24 + t * 32} ${rx + 16},${cy - 21 + t * 32} ${rx + 18},${cy - 14 + t * 32}" fill="#fbbf24"/>
    `).join("")}
    ${txt(rx + 30, cy, `${Vf}V`, { size: 9, bold: true, color: "#f97316" })}

    ${resultBox(cx, H - 22, "Hesaplanan Direnç", `R = ${R.toFixed(0)} Ω`)}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 22. BASINÇ KABI (YENİ)
// ═══════════════════════════════════════════════════════════════
function drawPressureVessel(p: DrawingParams): string {
  const W = 400, H = 320;
  const D  = p.width     || 500;    // mm iç çap
  const t  = p.thickness || 10;     // mm et kalınlığı
  const P  = p.load      || 1.5;    // MPa basınç
  const sig = p.result   || 0;      // MPa gerilme
  const SF = p.safetyFactor || 0;

  const scale = Math.min(120 / D, 3);
  const Ri = D / 2 * scale, Ro = (D / 2 + t) * scale;
  const cx = W / 2, cy = H / 2 + 10;
  const capH = Ri * 0.35;

  // Basinç okları (içten dışa)
  const pArrows = [0, 60, 120, 180, 240, 300].map(deg => {
    const rad = deg * Math.PI / 180;
    const x1 = cx + Math.cos(rad) * (Ri * 0.4), y1 = cy + Math.sin(rad) * (Ri * 0.4);
    const x2 = cx + Math.cos(rad) * Ri, y2 = cy + Math.sin(rad) * Ri;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.load}" stroke-width="1.8"/>
      <polygon points="${x2},${y2} ${x2 - 4 * Math.cos(rad + 0.4)},${y2 - 4 * Math.sin(rad + 0.4)} ${x2 - 4 * Math.cos(rad - 0.4)},${y2 - 4 * Math.sin(rad - 0.4)}" fill="${C.load}"/>`;
  }).join("");

  const isOK = sig > 0 && SF >= 1.5;

  return wrapSVG(`
    ${txt(W / 2, 17, "İNCE CİDARLI BASINÇ KABI", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `D=${D}mm  t=${t}mm  P=${P}MPa`, { size: 9, color: C.textSm })}

    <!-- Silindir gövde -->
    ${circle(cx, cy, Ro, "#bfdbfe", C.steel, 2.5)}
    ${hatch(cx - Ro, cy - Ro, Ro * 2, Ro * 2, C.steelL, 8)}
    ${circle(cx, cy, Ro, "none", C.steel, 2.5)}
    ${circle(cx, cy, Ri, C.bg, C.steel, 1.5)}

    <!-- Kubbe kapakları göstergesi -->
    <path d="M ${cx - Ro} ${cy} A ${Ro} ${capH} 0 0 0 ${cx + Ro} ${cy}" fill="#bfdbfe" stroke="${C.steel}" stroke-width="2"/>
    <path d="M ${cx - Ro} ${cy} A ${Ro} ${capH} 0 0 1 ${cx + Ro} ${cy}" fill="#bfdbfe" stroke="${C.steel}" stroke-width="2"/>

    <!-- İç basınç okları -->
    ${pArrows}
    ${txt(cx, cy, `P=${P} MPa`, { size: 9, bold: true, color: C.load })}

    <!-- Boyut çizgileri -->
    ${dimLine(cx, cy, cx + Ri, cy - Ri / 2, `r_i=${(D / 2).toFixed(0)}mm`, "h")}
    ${dimLine(cx + Ri, cy - Ri / 2, cx + Ro, cy - Ro / 2, `t=${t}mm`, "h")}

    ${sig > 0 ? resultBox(cx, H - 38, "Çevresel Gerilme", `σ_θ = ${sig.toFixed(1)} MPa`, sig > 200 ? "#dc2626" : C.result) : ""}
    ${SF > 0 ? txt(W / 2, H - 14, `Güvenlik Katsayısı: ${SF.toFixed(2)} ${isOK ? "✓" : "⚠"}`, { size: 9, bold: true, color: isOK ? C.result : "#dc2626" }) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// 23-32. DİĞER ÇİZİMLER (aynen korundu, küçük iyileştirmeler)
// ═══════════════════════════════════════════════════════════════

function drawConcreteVolume(p: DrawingParams): string {
  const W = 390, H = 310;
  const L = p.length || 5, Bw = p.width || 3, H_ = p.height || 0.2;
  const vol = L * Bw * H_;
  const scale = Math.min(100 / L, 80 / Bw, 200 / H_, 26);
  const Ls = L * scale, Ws = Bw * scale, Hs = Math.max(H_ * scale * 4, 9);
  const ox = W / 2 - Ls * 0.5, oy = H / 2 + Hs * 0.3;
  const sx = Ws * 0.4, sy = Ws * 0.2;
  const front = `M ${ox} ${oy} L ${ox + Ls} ${oy} L ${ox + Ls} ${oy + Hs} L ${ox} ${oy + Hs} Z`;
  const top   = `M ${ox} ${oy} L ${ox + sx} ${oy - sy} L ${ox + Ls + sx} ${oy - sy} L ${ox + Ls} ${oy} Z`;
  const side  = `M ${ox + Ls} ${oy} L ${ox + Ls + sx} ${oy - sy} L ${ox + Ls + sx} ${oy + Hs - sy} L ${ox + Ls} ${oy + Hs} Z`;
  return wrapSVG(`
    ${txt(W / 2, 17, "BETON HACİM GÖRSELİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `${L}m × ${Bw}m × ${H_}m`, { size: 9, color: C.textSm })}
    <path d="${side}" fill="#a8a29e" stroke="${C.concrete}" stroke-width="1.5"/>
    <path d="${top}" fill="#d6d3d1" stroke="${C.concrete}" stroke-width="1.5"/>
    <path d="${front}" fill="#e7e5e4" stroke="${C.concrete}" stroke-width="2"/>
    ${hatch(ox, oy, Ls, Hs, "#a8a29e", 12)}
    <path d="${front}" fill="none" stroke="${C.concrete}" stroke-width="2"/>
    ${dimLine(ox, oy + Hs + 20, ox + Ls, oy + Hs + 20, `L=${L}m`, "h")}
    ${dimLine(ox + Ls + sx + 10, oy - sy, ox + Ls + sx + 10, oy + Hs - sy, `H=${H_}m`, "v")}
    ${txt(ox + Ls + sx / 2 + 9, oy - sy / 2 - 9, `B=${Bw}m`, { size: 9, color: C.dimTxt })}
    ${resultBox(W / 2, H - 22, "Hacim", `${vol.toFixed(3)} m³ = ${(vol * 1000).toFixed(0)} L`)}
  `, W, H);
}

function drawRebarLayout(p: DrawingParams): string {
  const W = 390, H = 310;
  const dia = p.width || 12, L = p.length || 6;
  const adet = Math.min(p.count || 5, 12);
  const kg = p.result || 0;
  const scale = Math.min(210 / L, 32);
  const Ls = L * scale;
  const startX = (W - Ls) / 2, y0 = 78;
  const spacing = 30;
  let rebars = "";
  for (let i = 0; i < adet; i++) {
    const ry = y0 + i * spacing;
    rebars += `<line x1="${startX}" y1="${ry}" x2="${startX + Ls}" y2="${ry}" stroke="#292524" stroke-width="${Math.max(dia / 4, 2)}" stroke-linecap="round"/>`;
    if (i === 0) {
      rebars += circle(startX + Ls + 8, ry, 6, "none", "#292524", 1.5);
      rebars += txt(startX + Ls + 24, ry, `Ø${dia}`, { size: 9, bold: true, color: "#292524", anchor: "start" });
    }
    if (i === adet - 1) rebars += dimLine(startX, ry + 18, startX + Ls, ry + 18, `L=${L}m`, "h");
  }
  return wrapSVG(`
    ${txt(W / 2, 17, "DEMİR DONATISI PLANI", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `Ø${dia}mm — ${adet} adet — ${L}m`, { size: 9, color: C.textSm })}
    ${rebars}
    ${txt(startX - 6, (y0 + (adet - 1) * spacing) / 2, `${adet}×`, { size: 11, bold: true, color: "#292524", anchor: "end" })}
    ${resultBox(W / 2, H - 22, "Toplam Ağırlık", `${kg.toFixed(2)} kg  (ρ=7850 kg/m³)`, "#f97316")}
  `, W, H);
}

function drawSteelProfileWeight(p: DrawingParams): string {
  const W = 390, H = 310;
  const profTip = p.label || "IPE";
  const kg_m = p.thickness || 22.4, L = p.length || 6;
  const adet = p.count || 1, toplam = p.result || kg_m * L * adet;
  const cx = W / 2, cy = H / 2 - 25;
  const h = 62, b = 42, tw = 5, tf = 9;
  let profileSVG = "";
  if (profTip.startsWith("IPE") || profTip.startsWith("HEA") || profTip.startsWith("HEB")) {
    profileSVG = [
      rect(cx - b / 2, cy - h / 2, b, tf, "#bfdbfe", C.steel, 1.5),
      rect(cx - tw / 2, cy - h / 2 + tf, tw, h - 2 * tf, "#bfdbfe", C.steel, 1.5),
      rect(cx - b / 2, cy + h / 2 - tf, b, tf, "#bfdbfe", C.steel, 1.5),
    ].join("");
  } else if (profTip.startsWith("UNP")) {
    profileSVG = [
      rect(cx - b / 2, cy - h / 2, tf, h, "#bfdbfe", C.steel, 1.5),
      rect(cx - b / 2, cy - h / 2, b, tf, "#bfdbfe", C.steel, 1.5),
      rect(cx - b / 2, cy + h / 2 - tf, b, tf, "#bfdbfe", C.steel, 1.5),
    ].join("");
  } else {
    profileSVG = rect(cx - b / 2, cy - h / 2, b, h, "#bfdbfe", C.steel, 2);
  }
  return wrapSVG(`
    ${txt(W / 2, 17, "ÇELİK PROFİL AĞIRLIK", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `${profTip}  ${kg_m} kg/m  ×  ${adet} adet  ×  ${L}m`, { size: 9, color: C.textSm })}
    ${profileSVG}
    ${line(cx - b / 2 - 12, cy, cx + b / 2 + 12, cy, C.dim, 0.8, "3,2")}
    ${line(cx, cy - h / 2 - 12, cx, cy + h / 2 + 12, C.dim, 0.8, "3,2")}
    ${resultBox(W / 2, H - 38, `${adet} × ${L}m = ${(L * adet).toFixed(1)} m`, `${toplam.toFixed(1)} kg`)}
  `, W, H);
}

function drawBearingLife(p: DrawingParams): string {
  const W = 410, H = 310;
  const L10 = p.result || 50000, Cv = p.result2 || 20000;
  const P = p.load || 5000, n = p.n1 || 1450;
  const barH = 125, barW = 55;
  const bx = 85, by = H / 2 + barH / 2;
  const scale = barH / Math.max(L10, 100000);
  const l10Px = Math.min(L10 * scale, barH);
  const barColor = L10 >= 30000 ? C.result : L10 >= 10000 ? C.warn : "#dc2626";
  return wrapSVG(`
    ${txt(W / 2, 17, "RULMAN ÖMÜR ANALİZİ (ISO 281)", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `C=${(Cv / 1000).toFixed(1)}kN  P=${(P / 1000).toFixed(1)}kN  n=${n}rpm`, { size: 9, color: C.textSm })}
    <rect x="${bx}" y="${by - barH}" width="${barW}" height="${barH * 0.3}" fill="#dcfce7" opacity="0.35"/>
    <rect x="${bx}" y="${by - barH * 0.7}" width="${barW}" height="${barH * 0.4}" fill="#fef3c7" opacity="0.35"/>
    <rect x="${bx}" y="${by - barH * 0.3}" width="${barW}" height="${barH * 0.3}" fill="#fee2e2" opacity="0.35"/>
    ${line(bx - 6, by - barH * 0.7, bx + barW + 32, by - barH * 0.7, C.result, 1, "4,2")}
    ${txt(bx + barW + 36, by - barH * 0.7, "30kh", { size: 8, color: C.result, anchor: "start" })}
    <rect x="${bx + 5}" y="${by - l10Px}" width="${barW - 10}" height="${l10Px}" fill="${barColor}" rx="3"/>
    ${txt(bx + barW / 2, by - l10Px - 11, `${(L10 / 1000).toFixed(0)}k h`, { size: 10, bold: true, color: barColor })}
    ${line(bx, by - barH, bx, by, C.steelL, 1)}
    ${line(bx, by, bx + barW + 44, by, C.steelL, 1)}
    <rect x="${W - 175}" y="${H / 2 - 45}" width="148" height="88" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" rx="10"/>
    ${txt(W - 101, H / 2 - 30, "C / P =", { size: 9, color: "#1d4ed8" })}
    ${txt(W - 101, H / 2 - 12, `${(Cv / P).toFixed(2)}`, { size: 18, bold: true, color: "#1d4ed8" })}
    ${txt(W - 101, H / 2 + 10, `L₁₀ = ${(L10 / 1000).toFixed(0)}k saat`, { size: 9, bold: true, color: barColor })}
    ${txt(W - 101, H / 2 + 27, `≈ ${(L10 / (n * 60)).toFixed(0)} M devir`, { size: 8, color: C.textSm })}
    ${txt(W / 2, H - 12, L10 >= 30000 ? "✓ Uzun ömür bekleniyor" : L10 >= 10000 ? "⚠ Kabul edilebilir" : "✗ Yetersiz ömür", { size: 10, bold: true, color: barColor })}
  `, W, H);
}

function drawViscosityBar(p: DrawingParams): string {
  const W = 390, H = 290;
  const values: { label: string; val: number; color: string }[] = [
    { label: "cSt",  val: p.result  || 0, color: "#3b82f6" },
    { label: "cP",   val: p.result2 || 0, color: "#8b5cf6" },
    { label: "SUS",  val: p.result3 || 0, color: "#f97316" },
  ].filter(v => v.val > 0);
  if (values.length === 0) return drawGenericSection(p);
  const maxVal = Math.max(...values.map(v => v.val));
  const bAreaH = 142, bw = 52, gap = 32;
  const startX = W / 2 - (values.length * (bw + gap)) / 2 + gap / 2;
  const baseY = H / 2 + bAreaH / 2;
  let bars = "";
  values.forEach((v, i) => {
    const bh = (v.val / maxVal) * bAreaH;
    const bx = startX + i * (bw + gap);
    bars += `<rect x="${bx}" y="${baseY - bh}" width="${bw}" height="${bh}" fill="${v.color}" rx="4" opacity="0.85"/>`;
    bars += txt(bx + bw / 2, baseY - bh - 11, v.val.toFixed(1), { size: 9, bold: true, color: v.color });
    bars += txt(bx + bw / 2, baseY + 16, v.label, { size: 9, color: C.text });
  });
  return wrapSVG(`
    ${txt(W / 2, 17, "VİSKOZİTE DÖNÜŞÜMÜ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `ISO VG ${p.count || 32} sınıfı`, { size: 9, color: C.textSm })}
    ${line(W / 2 - values.length * (bw + gap) / 2 - 6, baseY, W / 2 + values.length * (bw + gap) / 2 + 6, baseY, C.steel, 2)}
    ${bars}
    ${txt(W / 2, H - 12, "ASTM D341 dönüşüm değerleri", { size: 8, color: C.textSm })}
  `, W, H);
}

function drawPlateSection(p: DrawingParams): string {
  const W = 390, H = 295;
  const Lm = p.length || 1000, Bm = p.width || 500, t = p.thickness || 10;
  const kg = p.result || 0;
  const scale = Math.min(205 / Lm, 125 / Bm, 5.5);
  const Ls = Lm * scale, Bs = Bm * scale, Ts = Math.max(t * scale * 2, 9);
  const ox = (W - Ls * 0.85) / 2 + 10, oy = H / 2 + Ts / 2;
  const sx = Bs * 0.36, sy = Bs * 0.15;
  const front = `M ${ox} ${oy} L ${ox + Ls} ${oy} L ${ox + Ls} ${oy + Ts} L ${ox} ${oy + Ts} Z`;
  const top   = `M ${ox} ${oy} L ${ox + sx} ${oy - sy} L ${ox + Ls + sx} ${oy - sy} L ${ox + Ls} ${oy} Z`;
  const side  = `M ${ox + Ls} ${oy} L ${ox + Ls + sx} ${oy - sy} L ${ox + Ls + sx} ${oy + Ts - sy} L ${ox + Ls} ${oy + Ts} Z`;
  return wrapSVG(`
    ${txt(W / 2, 17, "LEVHA AĞIRLIK HESABI", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `${Lm}×${Bm}×${t} mm`, { size: 9, color: C.textSm })}
    <path d="${side}" fill="${C.steelL}" stroke="${C.steel}" stroke-width="1.5"/>
    <path d="${top}" fill="#d1d5db" stroke="${C.steel}" stroke-width="1.5"/>
    <path d="${front}" fill="#bfdbfe" stroke="${C.steel}" stroke-width="2"/>
    ${hatch(ox, oy, Ls, Ts, "#94a3b8", 10)}
    <path d="${front}" fill="none" stroke="${C.steel}" stroke-width="2"/>
    ${dimLine(ox, oy + Ts + 20, ox + Ls, oy + Ts + 20, `L=${Lm}mm`, "h")}
    ${dimLine(ox + Ls + sx + 8, oy - sy, ox + Ls + sx + 8, oy + Ts - sy, `t=${t}mm`, "v")}
    ${txt(ox + Ls + sx / 2 + 6, oy - sy - 10, `B=${Bm}mm`, { size: 9, color: C.dimTxt })}
    ${resultBox(W / 2, H - 22, "Ağırlık", `${kg.toFixed(2)} kg  (ρ=7850)`, "#f97316")}
  `, W, H);
}

function drawPythagorasTriangle(p: DrawingParams): string {
  const W = 390, H = 310;
  const a = p.a || 3, b = p.width || 4, c = p.c || 5;
  const scale = Math.min(155 / c, 125 / c, 4.5);
  const as_ = a * scale, bs_ = b * scale;
  const ox = 90, oy = H / 2 + bs_ / 2;
  const x2 = ox + as_, y2 = oy, x3 = ox, y3 = oy - bs_;
  return wrapSVG(`
    ${txt(W / 2, 17, "PİSAGOR ÜÇGEN", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `a=${a}  b=${b}  c=${c.toFixed(4)}`, { size: 9, color: C.textSm })}
    <rect x="${ox}" y="${oy - 13}" width="13" height="13" fill="none" stroke="${C.steel}" stroke-width="1.5"/>
    <polygon points="${ox},${oy} ${x2},${y2} ${x3},${y3}" fill="#dbeafe" stroke="${C.steel}" stroke-width="2.5"/>
    ${dimLine(ox, oy + 20, x2, oy + 20, `a = ${a}`, "h")}
    ${dimLine(ox - 28, y3, ox - 28, oy, `b = ${b}`, "v")}
    ${txt((x2 + x3) / 2 + 16, (y2 + y3) / 2 - 8, `c = ${c.toFixed(4)}`, { size: 10, bold: true, color: C.dimTxt })}
    <rect x="${ox}" y="${oy}" width="${as_}" height="${as_}" fill="#fef3c7" stroke="#f97316" stroke-width="1" opacity="0.5"/>
    <rect x="${ox - bs_}" y="${y3}" width="${bs_}" height="${bs_}" fill="#dcfce7" stroke="#16a34a" stroke-width="1" opacity="0.5"/>
    ${txt(ox + as_ / 2, oy + as_ / 2, `a²`, { size: 9, color: "#f97316" })}
    ${txt(ox - bs_ / 2, y3 + bs_ / 2, `b²`, { size: 9, color: "#16a34a" })}
    ${txt(W * 0.73, H / 2, `a²+b²=c²`, { size: 11, bold: true, color: C.text })}
    ${txt(W * 0.73, H / 2 + 18, `${a * a}+${b * b}=${(c * c).toFixed(2)}`, { size: 9, color: C.textSm })}
  `, W, H);
}

function drawAreaShape(p: DrawingParams): string {
  const W = 390, H = 290;
  const w0 = p.width || 5, h0 = p.height || 3;
  const alan = p.result || w0 * h0;
  const scale = Math.min(165 / Math.max(w0, h0), 4.5);
  const Ws = w0 * scale, Hs = h0 * scale;
  const cx = W / 2, cy = H / 2 - 10;
  return wrapSVG(`
    ${txt(W / 2, 17, "ALAN HESABI", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `${w0} × ${h0} = ${alan.toFixed(4)} m²`, { size: 9, color: C.textSm })}
    ${rect(cx - Ws / 2, cy - Hs / 2, Ws, Hs, "#bfdbfe", C.steel, 2, 2)}
    ${hatch(cx - Ws / 2, cy - Hs / 2, Ws, Hs, "#93c5fd", 12)}
    ${rect(cx - Ws / 2, cy - Hs / 2, Ws, Hs, "none", C.steel, 2, 2)}
    ${dimLine(cx - Ws / 2, cy + Hs / 2 + 22, cx + Ws / 2, cy + Hs / 2 + 22, `${w0} m`, "h")}
    ${dimLine(cx - Ws / 2 - 28, cy - Hs / 2, cx - Ws / 2 - 28, cy + Hs / 2, `${h0} m`, "v")}
    ${resultBox(cx, H - 22, "Alan", `${alan.toFixed(4)} m²`)}
  `, W, H);
}

function drawVolumeShape(p: DrawingParams): string {
  const W = 390, H = 310;
  const L = p.length || 5, Bw = p.width || 3, H_ = p.height || 2;
  const vol = p.result || L * Bw * H_;
  const scale = Math.min(105 / L, 84 / Math.max(Bw, H_), 3.2);
  const Ls = L * scale, Ws = Bw * scale, Hs = H_ * scale;
  const ox = (W - Ls * 0.86) / 2, oy = H / 2 + Hs / 2;
  const sx = Ws * 0.36, sy = Ws * 0.16;
  const front = `M ${ox} ${oy} L ${ox + Ls} ${oy} L ${ox + Ls} ${oy - Hs} L ${ox} ${oy - Hs} Z`;
  const top   = `M ${ox} ${oy - Hs} L ${ox + sx} ${oy - Hs - sy} L ${ox + Ls + sx} ${oy - Hs - sy} L ${ox + Ls} ${oy - Hs} Z`;
  const side  = `M ${ox + Ls} ${oy} L ${ox + Ls + sx} ${oy - sy} L ${ox + Ls + sx} ${oy - Hs - sy} L ${ox + Ls} ${oy - Hs} Z`;
  return wrapSVG(`
    ${txt(W / 2, 17, "HACİM HESABI", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `${L}×${Bw}×${H_} m`, { size: 9, color: C.textSm })}
    <path d="${side}" fill="${C.steelL}" stroke="${C.steel}" stroke-width="1.5"/>
    <path d="${top}" fill="#d1d5db" stroke="${C.steel}" stroke-width="1.5"/>
    <path d="${front}" fill="#bfdbfe" stroke="${C.steel}" stroke-width="2"/>
    ${dimLine(ox, oy + 20, ox + Ls, oy + 20, `L=${L}m`, "h")}
    ${dimLine(ox - 24, oy - Hs, ox - 24, oy, `H=${H_}m`, "v")}
    ${txt(ox + Ls + sx / 2 + 6, oy - Hs - sy - 9, `B=${Bw}m`, { size: 9, color: C.dimTxt })}
    ${resultBox(W / 2, H - 22, "Hacim", `${vol.toFixed(3)} m³ = ${(vol * 1000).toFixed(0)} L`)}
  `, W, H);
}

function drawStairSection(p: DrawingParams): string {
  const W = 410, H = 330;
  const nStep = Math.min(p.count || 10, 14);
  const riser = p.height || 17.5, tread = p.width || 28;
  const scale = Math.min(185 / (nStep * tread / 10), 155 / (nStep * riser / 10), 3.8);
  const Rt = riser / 10 * scale, Tt = tread / 10 * scale;
  const ox = 52, oy = H - 62;
  let steps = `M ${ox} ${oy}`;
  for (let i = 0; i < nStep; i++) {
    steps += ` L ${ox + (i + 1) * Tt} ${oy - i * Rt}`;
    steps += ` L ${ox + (i + 1) * Tt} ${oy - (i + 1) * Rt}`;
  }
  const totalW = nStep * Tt, totalH = nStep * Rt;
  const stairPath = steps + ` L ${ox} ${oy - totalH} L ${ox} ${oy} Z`;
  return wrapSVG(`
    ${txt(W / 2, 17, "MERDİVEN KESİT GÖRÜNÜŞÜ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `${nStep} basamak  R=${riser}cm  G=${tread}cm`, { size: 9, color: C.textSm })}
    <path d="${stairPath}" fill="#bfdbfe" stroke="${C.steel}" stroke-width="2"/>
    ${hatch(ox, oy - totalH, totalW, totalH, "#93c5fd", 11)}
    <path d="${stairPath}" fill="none" stroke="${C.steel}" stroke-width="2"/>
    ${txt(ox + Tt * 0.5, oy - Rt * 0.5 + 7, `R=${riser}`, { size: 7, color: C.dimTxt })}
    ${txt(ox + Tt * 1.5, oy + 9, `G=${tread}`, { size: 7, color: C.dimTxt })}
    ${dimLine(ox, oy + 24, ox + totalW, oy + 24, `Yatay=${(nStep * tread / 100).toFixed(2)} m`, "h")}
    ${dimLine(ox - 28, oy - totalH, ox - 28, oy, `Düşey=${(nStep * riser / 100).toFixed(2)} m`, "v")}
    ${line(ox, oy, ox + totalW, oy - totalH, C.load, 1.2, "4,3")}
    ${txt(ox + totalW / 2 + 12, oy - totalH / 2 - 6, `Eğim: ${(riser / tread * 100).toFixed(0)}%`, { size: 9, bold: true, color: C.load })}
    ${txt(W / 2, H - 12, `${nStep} basamak  |  Açı: ${(Math.atan(riser / tread) * 180 / Math.PI).toFixed(1)}°`, { size: 8, color: C.textSm })}
  `, W, H);
}

function drawBrickWall(p: DrawingParams): string {
  const W = 410, H = 310;
  const alan = p.area || 10, adet = p.result || 0;
  const bw = 54, bh = 26, gap = 10;
  const rowH = bh + gap, colW = bw + gap;
  const nCols = Math.floor((W - 90) / colW);
  const nRows = Math.floor((H - 95) / rowH);
  let bricks = "";
  for (let r = 0; r < nRows; r++) {
    for (let c = 0; c < nCols; c++) {
      const bx = 50 + c * colW + (r % 2 === 1 ? colW / 2 : 0);
      const by_ = 42 + r * rowH;
      if (bx + bw > W - 48) continue;
      const shade = (r + c) % 2 === 0 ? "#f3f4f6" : "#e5e7eb";
      bricks += `<rect x="${bx}" y="${by_}" width="${bw}" height="${bh}" fill="${shade}" stroke="#d1d5db" stroke-width="1" rx="1"/>`;
    }
  }
  return wrapSVG(`
    ${txt(W / 2, 17, "TUĞLA DUVAR GÖRSELİ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `Alan=${alan}m²`, { size: 9, color: C.textSm })}
    ${bricks}
    ${resultBox(W / 2, H - 22, "Gerekli Tuğla (%10 fire dahil)", `${adet.toFixed(0)} adet`, "#f97316")}
  `, W, H);
}

function drawDevirFrekans(p: DrawingParams): string {
  const W = 420, H = 310;

  const rpm = p.rpm || 1450;
  const diameter = p.diameter || 150;
  const pole = p.pole || 4;
  const frequency = p.frequency || 50;
  const vms = p.result || 0;

  const cx1 = 110;
  const cx2 = 210;
  const cx3 = 320;
  const cy = 150;

  const gearR = 34;

  return wrapSVG(`
    ${txt(W / 2, 17, "DEVİR - FREKANS DÖNÜŞÜMÜ", { size: 12, bold: true, color: C.text })}
    ${txt(W / 2, 32, `n=${rpm} rpm  ·  d=${diameter} mm  ·  p=${pole}  ·  f=${frequency} Hz`, { size: 9, color: C.textSm })}

    <!-- akış çizgisi -->
    ${line(cx1 + 32, cy, cx2 - 32, cy, C.dim, 2, "5,4")}
    ${line(cx2 + 32, cy, cx3 - 32, cy, C.dim, 2, "5,4")}
    <polygon points="${cx2 - 32},${cy} ${cx2 - 42},${cy - 5} ${cx2 - 42},${cy + 5}" fill="${C.dim}"/>
    <polygon points="${cx3 - 32},${cy} ${cx3 - 42},${cy - 5} ${cx3 - 42},${cy + 5}" fill="${C.dim}"/>

    <!-- rpm -->
    ${circle(cx1, cy, gearR, "#dbeafe", "#0ea5e9", 2.5)}
    ${line(cx1 - gearR - 10, cy, cx1 + gearR + 10, cy, C.dim, 0.8, "3,2")}
    ${line(cx1, cy - gearR - 10, cx1, cy + gearR + 10, C.dim, 0.8, "3,2")}
    ${txt(cx1, cy - 6, "RPM", { size: 10, bold: true, color: "#0369a1" })}
    ${txt(cx1, cy + 12, `${rpm}`, { size: 14, bold: true, color: "#0369a1" })}

    <!-- hz -->
    ${circle(cx2, cy, gearR, "#fef3c7", "#f59e0b", 2.5)}
    ${txt(cx2, cy - 6, "Hz", { size: 10, bold: true, color: "#b45309" })}
    ${txt(cx2, cy + 12, `${(rpm / 60).toFixed(2)}`, { size: 14, bold: true, color: "#b45309" })}

    <!-- hız -->
    ${circle(cx3, cy, gearR, "#dcfce7", "#16a34a", 2.5)}
    ${txt(cx3, cy - 6, "m/s", { size: 10, bold: true, color: "#166534" })}
    ${txt(cx3, cy + 12, `${vms.toFixed(2)}`, { size: 14, bold: true, color: "#166534" })}

    <!-- alt bilgi -->
    ${txt(cx1, 235, `Devir`, { size: 8, color: C.textSm })}
    ${txt(cx2, 235, `Frekans`, { size: 8, color: C.textSm })}
    ${txt(cx3, 235, `Çevre Hızı`, { size: 8, color: C.textSm })}

    ${resultBox(W / 2, H - 24, "Senkron Devir", `${((120 * frequency) / pole).toFixed(0)} rpm`, C.result)}
  `, W, H);
}

function drawGenericSection(p: DrawingParams): string {
  const W = 340, H = 290;
  const w0 = p.width || 100, h0 = p.height || 100;
  const scale = Math.min(165 / w0, 165 / h0, 2.2);
  const Ws = w0 * scale, Hs = h0 * scale;
  const cx = W / 2, cy = H / 2;
  return wrapSVG(`
    ${txt(W / 2, 18, "KESİT GÖRÜNÜŞÜ", { size: 12, bold: true, color: C.text })}
    ${rect(cx - Ws / 2, cy - Hs / 2, Ws, Hs, "#bfdbfe", C.steel, 2)}
    ${hatch(cx - Ws / 2, cy - Hs / 2, Ws, Hs, C.steelL, 9)}
    ${rect(cx - Ws / 2, cy - Hs / 2, Ws, Hs, "none", C.steel, 2)}
    ${line(cx - Ws / 2 - 16, cy, cx + Ws / 2 + 16, cy, C.dim, 0.8, "4,3")}
    ${line(cx, cy - Hs / 2 - 16, cx, cy + Hs / 2 + 16, C.dim, 0.8, "4,3")}
    ${dimLine(cx - Ws / 2 - 28, cy - Hs / 2, cx - Ws / 2 - 28, cy + Hs / 2, `h=${h0}mm`, "v")}
    ${dimLine(cx - Ws / 2, cy + Hs / 2 + 22, cx + Ws / 2, cy + Hs / 2 + 22, `b=${w0}mm`, "h")}
    ${p.label ? txt(W / 2, H - 10, p.label, { size: 9, color: C.textSm }) : ""}
  `, W, H);
}

// ═══════════════════════════════════════════════════════════════
// SVG WRAPPER
// ═══════════════════════════════════════════════════════════════
function wrapSVG(content: string, W: number, H: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="background:${C.bg};font-family:'JetBrains Mono','Courier New',monospace">
  <defs>
    <pattern id="microgrid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="${C.grid}" stroke-width="0.3"/>
    </pattern>
    <pattern id="macrogrid" width="50" height="50" patternUnits="userSpaceOnUse">
      <rect width="50" height="50" fill="url(#microgrid)"/>
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="${C.border}" stroke-width="0.5"/>
    </pattern>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1" dy="2" stdDeviation="3" flood-opacity="0.08"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#macrogrid)"/>
  <rect width="${W}" height="${H}" fill="${C.bg}" opacity="0.72"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" fill="none" stroke="${C.border}" stroke-width="1.5" rx="5"/>
  ${content}
  <text x="${W - 7}" y="${H - 5}" text-anchor="end" font-family="monospace" font-size="7" fill="${C.border}">tooldur.com</text>
</svg>`;
}