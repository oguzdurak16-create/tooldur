const metal = 'url(#metal)';
const edge = '#b4c6d1';
const graphite = '#253541';
const amber = '#ffc56e';
const cyan = '#84dce2';
const copper = 'url(#copper)';
const blue = '#28576b';
const voidFill = '#12212a';

const path = (d: string, fill = 'none', stroke = edge, width = 3) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const box = (x: number, y: number, w: number, h: number, fill = metal, stroke = edge, radius = 5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const ring = (x: number, y: number, r: number, fill = 'none', stroke = edge, width = 3) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const oval = (x: number, y: number, rx: number, ry: number, fill = metal, stroke = edge) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const text = (value: string, x: number, y: number, fill = cyan, size = 23) =>
  `<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}">${value}</text>`;
const repeat = (count: number, render: (index: number) => string) =>
  Array.from({ length: count }, (_, index) => render(index)).join('');
const group = (transform: string, content: string) => `<g transform="${transform}">${content}</g>`;
const arrow = (d: string, color = 'amber', both = false) =>
  `<path d="${d}" fill="none" stroke="${color === 'cyan' ? cyan : amber}" stroke-width="3.5" stroke-linecap="round" ${both ? `marker-start="url(#${color})" ` : ''}marker-end="url(#${color})"/>`;
const dash = (d: string) => `<path d="${d}" fill="none" stroke="${cyan}" stroke-opacity=".58" stroke-width="2" stroke-dasharray="8 7"/>`;

function plate(x: number, y: number, w: number, depth: number, t: number, fill = metal) {
  return group(`translate(${x} ${y})`,
    path(`M0 0l${depth} ${-depth * .6}h${w}l${-depth} ${depth * .6}z`, fill) +
    path(`M0 0h${w}v${t}H0z`, graphite) +
    path(`M${w} 0l${depth} ${-depth * .6}v${t}l${-depth} ${depth * .6}z`, blue));
}

function document(x: number, y: number, w: number, h: number, content: string) {
  return group(`translate(${x} ${y})`, box(0, 0, w, h, graphite) +
    path(`M0 22h${w}`, 'none', edge, 2) + ring(12, 11, 3, amber, 'none') +
    ring(23, 11, 3, cyan, 'none') + content);
}

function bearing(x: number, y: number, r: number, bore: number) {
  return ring(x, y, r, metal) + ring(x, y, bore, voidFill, cyan, 3);
}

function gauge(x: number, y: number, r: number, unit: string) {
  return group(`translate(${x} ${y}) scale(${r / 70})`,
    ring(0, 0, 70, metal) + ring(0, 0, 59, voidFill) +
    repeat(9, i => group(`rotate(${i * 25 - 100})`, path('M0 -49v8', 'none', edge, 2))) +
    path('M0 0l29 -30', 'none', amber, 4) + ring(0, 0, 5, amber, 'none') + text(unit, 0, 35, cyan, 16));
}

function gear(x: number, y: number, r: number, teeth: number, fill: string) {
  return group(`translate(${x} ${y})`,
    repeat(teeth, i => group(`rotate(${i * 360 / teeth})`, box(-7, -r - 7, 14, 19, fill, edge, 2))) +
    ring(0, 0, r, fill, edge, 2) + ring(0, 0, r - 12, graphite, edge, 2) + ring(0, 0, r * .28, voidFill, cyan, 2));
}

function motor(x: number, y: number) {
  return group(`translate(${x} ${y})`, box(0, 0, 148, 86, metal) + oval(4, 43, 17, 43, graphite) +
    box(148, 34, 30, 18, metal) + repeat(5, i => path(`M23 ${15 + i * 14}h112`, 'none', graphite, 4)) +
    box(44, -18, 52, 19, graphite) + box(34, 86, 85, 13, graphite));
}

function flask(x: number, y: number, fill: string) {
  return group(`translate(${x} ${y})`, path('M-19 0h38m-32 0v49l-34 61q-9 20 13 20h68q22 0 13 -20L13 49V0',
    voidFill) + path('M-29 86q27 -10 58 0l16 28q5 11 -10 11h-70q-15 0 -10 -11z', fill, 'none') +
    path('M15 101h15m-15 10h22', 'none', cyan, 2));
}

function house(x: number, y: number) {
  return group(`translate(${x} ${y})`, box(-62, -7, 124, 92, graphite) +
    path('M-76 -7 0 -69 76 -7z', metal) + box(-18, 31, 36, 54, blue) +
    box(-47, 13, 21, 25, voidFill, cyan) + box(26, 13, 21, 25, voidFill, cyan));
}

function axis(d: string, curve: string, horizontal: string, vertical: string) {
  return path(d, 'none', edge, 2) + path(curve, 'none', amber, 5) +
    text(horizontal, 505, 279) + text(vertical, 148, 102);
}

export const toolIllustrations: Record<string, string> = {
  'burc-yuzey-basinci-pv-hesaplama':
    path('M157 257h326l-31 -34H187z', metal) +
    path('M207 224v-53a113 113 0 0 1 226 0v53z', graphite) +
    ring(320, 169, 78, copper) + ring(320, 169, 64, voidFill, amber, 2) +
    ring(320, 169, 59, metal) + ring(320, 169, 6, graphite, 'none') +
    path('M268 209a65 65 0 0 0 104 0', 'none', amber, 7) +
    arrow('M320 53V112') + text('F', 346, 84, amber) +
    arrow('M276 162a45 45 0 0 1 88 0', 'cyan', true) + text('θ', 320, 188, '#192b36') +
    text('p = F / (d × L)', 320, 300, cyan, 26),
  'burc-mil-boslugu-hesaplama':
    path('M146 104h348v46H146zm0 109h348v46H146z', 'url(#section)') +
    box(146, 150, 348, 14, copper, amber, 1) + box(146, 199, 348, 14, copper, amber, 1) +
    box(104, 172, 430, 19, metal, edge, 2) + dash('M89 181.5h465') +
    path('M402 165l62 -69h62M402 199l57 77h67', 'none', amber, 2) +
    ring(402, 166, 4, amber, 'none') + ring(402, 198, 4, amber, 'none') +
    text('c', 507, 86, amber) + text('c', 507, 299, amber) + text('Δd = 2c', 312, 303),
  'freze-devir-ilerleme-hesaplama':
    plate(163, 241, 236, 65, 27) +
    path('M309 80h70v83l-14 54h-42l-14 -54z', metal) +
    repeat(3, i => path(`M311 ${138 + i * 17}l62 -30`, 'none', blue, 7)) +
    arrow('M287 141a62 29 0 0 1 119 0') + text('n', 430, 147, amber) +
    arrow('M210 285h191', 'cyan') + text('vₓ', 428, 290),
  'kablo-kesiti-hesaplama':
    path('M221 102h206v156H221z', metal) + oval(427, 180, 37, 78, graphite) +
    oval(220, 180, 72, 79, voidFill) +
    [[197, 159], [245, 159], [220, 207]].map(([x, y]) => ring(x, y, 20, copper, cyan, 3)).join('') +
    arrow('M164 270h114', 'cyan', true) + text('A', 221, 301),
  'voltaj-dusumu-hesaplama':
    box(110, 143, 72, 92, graphite) + box(458, 143, 72, 92, graphite) +
    path('M182 166h276m-276 49h276', 'none', amber, 4) +
    ring(181, 166, 6, amber) + ring(459, 166, 6, amber) +
    text('U₁', 145, 193) + text('U₂', 495, 193) +
    arrow('M194 119h251', 'cyan') + text('I', 320, 106) + text('ΔU', 320, 267, amber),
  'elektrik-fatura-hesaplama':
    box(185, 87, 134, 186, metal) + box(204, 111, 96, 44, voidFill, cyan) +
    text('kWh', 251, 141) + ring(252, 213, 36, graphite) + path('M232 215h42', 'none', amber, 4) +
    document(365, 111, 96, 141, path('M16 51h61m-61 24h54m-54 24h61', 'none', edge, 2) + text('₺', 48, 129, amber)),
  'guc-faktoru-duzeltme':
    arrow('M153 243h300', 'cyan') + arrow('M153 243 453 103') +
    path('M453 243V103', 'none', edge, 3) + path('M213 243a60 60 0 0 0 -6 -25', 'none', amber, 3) +
    text('P', 301, 279) + text('S', 296, 153, amber) + text('Q', 484, 180) + text('φ', 236, 226, amber),
  'led-direnc-hesaplama':
    path('M155 127h332v114H155z', 'none', edge, 3) +
    path('M225 127l12 -13 16 26 16 -26 16 26 16 -13', voidFill, amber, 4) +
    path('M354 108v38l38 -19zM392 108v38', voidFill, cyan, 4) +
    arrow('M378 101l22 -21', 'cyan') + arrow('M403 104l24 -22', 'cyan') +
    path('M285 227v29m17 -23v17', 'none', amber, 4) + text('R', 265, 95, amber) + text('Vₛ', 335, 275),
  'ohm-kanunu-hesaplama':
    path('M138 130h364v109H138v-36m0 -24v-49M242 130v53h154v-53', 'none', edge, 3) +
    path('M119 179h38m-30 24h22', 'none', amber, 3) +
    box(266, 112, 100, 36, graphite, amber, 2) + text('R', 316, 138, amber) +
    ring(320, 183, 24, voidFill, cyan) + text('V', 320, 191) +
    arrow('M153 108h67', 'cyan') + text('I', 186, 96) + text('V = I × R', 319, 290, amber),
  'beton-miktari-hesaplama':
    plate(143, 221, 297, 64, 42, '#8b9ca3') +
    repeat(5, i => path(`M${177 + i * 49} 216l59 -34`, 'none', graphite, 3)) +
    arrow('M142 273h298', 'cyan', true) + arrow('M447 220l60 -35', 'cyan', true) +
    text('L', 285, 300) + text('W', 522, 217) + text('H', 120, 247, amber),
  'demir-agirligi-hesaplama':
    repeat(3, i => group(`translate(${i * 24} ${i * 38}) rotate(-13 320 180)`,
      box(148, 133, 304, 26, metal) + oval(452, 146, 7, 13, copper, amber) +
      repeat(12, j => path(`M${161 + j * 22} 134l9 23`, 'none', blue, 3)))) +
    arrow('M186 267h266', 'cyan', true) + text('L', 314, 295) + text('Ød', 515, 172, amber),
  'celik-profil-agirligi':
    path('M150 119h156v35h-59v72h59v35H150v-35h59v-72h-59z', metal) +
    path('M306 119l167 -37v35l-167 37zM247 154l167 -37v72l-167 37zM306 226l167 -37v35l-167 37z', blue) +
    arrow('M155 282h150', 'cyan', true) + text('b', 230, 308) + text('A', 228, 205, '#19313c'),
  'tugla-hesaplama':
    repeat(3, r => repeat(4, c => box(151 + c * 78 + (r % 2) * 37, 103 + r * 44, 73, 39, r % 2 ? '#a36b53' : copper, '#d2a78d', 2))) +
    arrow('M151 255h313', 'cyan', true) + text('L', 305, 286),
  'merdiven-hesaplama':
    path('M157 254h67v-28h64v-32h64v-32h65v-32h65v126H157z', metal) +
    path('M158 255h322V131', 'none', graphite, 3) +
    arrow('M288 184h64', 'cyan', true) + text('b', 320, 176) +
    arrow('M508 131v124', 'cyan', true) + text('H', 537, 200),
  'levha-agirlik-hesaplama':
    plate(142, 202, 295, 79, 16) + arrow('M144 243h293', 'cyan', true) +
    arrow('M454 226l65 -39', 'cyan', true) + text('L', 293, 275) + text('W', 510, 226) + text('t', 121, 221, amber),
  'baklavali-sac-agirlik-hesaplama':
    plate(139, 221, 286, 92, 27) +
    repeat(3, r => repeat(7, c => group(`translate(${172 + r * 27 + c * 36} ${211 - r * 15}) rotate(${c % 2 ? 19 : -32})`, box(-11, -3, 22, 6, graphite, edge, 3)))) +
    arrow('M140 268h284', 'cyan', true) + text('L', 280, 299) + text('t', 118, 245, amber),
  'iso-gecme-tolerans-hesaplama':
    dash('M109 189h423') + bearing(223, 189, 87, 48) + ring(418, 189, 45, metal, amber) +
    arrow('M367 188h-47') + text('H7', 221, 309) + text('g6', 420, 265, amber),
  'kilavuz-matkap-hesaplama':
    box(117, 198, 405, 49, metal) + path('M194 198v27l24 16 24 -16v-27m151 0v42m47 -42v42', voidFill, cyan, 4) +
    path('M203 78h29v75l-14 30-15 -30zM402 76h29v105h-29z', metal) +
    repeat(4, i => path(`M405 ${105 + i * 15}h24`, 'none', amber, 3)) +
    path('M204 146l28 -26m-28 43 28 -26', 'none', blue, 4) + text('D − P', 219, 279) + text('M', 418, 279, amber),
  'yuzey-puruzlulugu-rehberi':
    path('M128 247v-42l16 -18 15 33 19 -50 17 39 19 -13 16 36 18 -62 15 28 24 -28 18 39 15 -24 13 15 18 -34 20 58 14 -21 21 10 21 -40 22 33 20 -42 17 29 18 -10v64z', metal) +
    dash('M126 204h389M126 162h389M126 233h389') +
    arrow('M514 164v65', 'cyan', true) + text('Rz', 546, 204) + text('Ra', 122, 146, amber),
  'teknik-resim-cagri-olusturucu':
    document(155, 83, 330, 194, path('M59 73h141v83H59z', graphite, edge) +
      ring(129, 115, 31, voidFill, cyan, 3) + dash('M75 115h107M129 60v110') +
      path('M151 95l51 -30h77', 'none', amber, 2) + text('Ø H7', 250, 58, amber, 18) +
      path('M199 150h99m-99 15h99m-99 15h99', 'none', edge, 2)),
  'civata-sikma-torku-hesaplama':
    path('M236 120l54 -32 54 32v62l-54 32-54 -32z', metal) +
    ring(290, 151, 35, graphite) +
    path('M332 142l161 63-12 30-162 -65a35 35 0 1 1 13 -28z', metal) +
    arrow('M214 194a90 90 0 0 1 10 -99') + text('T', 191, 145, amber) +
    arrow('M493 217v66', 'cyan') + text('F', 517, 274),
  'sac-bukum-acinim-hesaplama':
    path('M118 229h166a23 23 0 0 0 23 -23v-99h22v99a45 45 0 0 1 -45 45H118z', metal) +
    path('M224 222q78 0 78 -77', 'none', amber, 4) + text('R', 250, 190, amber) +
    arrow('M355 188h47', 'cyan') + box(426, 178, 111, 20, metal) + dash('M474 170v35') +
    text('BA', 481, 240),
  'sac-bukum-kesim-hesaplayici':
    path('M160 227h319v43H160zM202 227l117 39 118 -39', graphite) +
    path('M236 106h167v53l-83 46-84 -46z', metal) +
    path('M151 208l169 41 170 -41', 'none', cyan, 8) +
    arrow('M320 55v57') + text('F', 349, 86, amber) + text('V', 320, 295),
  'tork-hesaplama':
    ring(219, 206, 64, metal) + ring(219, 206, 24, graphite) +
    path('M219 188 477 120l13 31-262 72z', metal) +
    ring(220, 206, 12, voidFill) + arrow('M481 124v133') +
    arrow('M143 204a76 76 0 0 1 59 -70', 'cyan') + text('T', 145, 256) +
    text('F', 512, 249, amber) + text('r', 369, 159, '#13252d'),
  'basinc-hesaplama':
    plate(169, 239, 256, 53, 26) + path('M248 229h146v-57H248z', metal) +
    oval(321, 172, 73, 22, metal) + arrow('M321 79v75') +
    text('F', 349, 108, amber) + text('A', 321, 180, '#182934') + text('p', 463, 274),
  'hiz-hesaplama':
    axis('M161 108v142h330', 'M175 238 450 130', 't', 's') +
    dash('M270 201h128v-50') + arrow('M283 216h99', 'cyan') + text('Δt', 335, 243) +
    arrow('M413 203v-41', 'cyan') + text('Δs', 443, 209),
  'mil-mukavemet-hesaplama':
    path('M126 170h117v-34h167v34h110v47H410v35H243v-35H126z', metal) +
    dash('M114 194h421') + arrow('M242 200a30 68 0 1 1 13 64') +
    arrow('M420 200a30 68 0 1 0 -13 64', 'cyan') + text('T', 189, 103, amber) + text('Ød', 324, 292),
  'kama-kanali-hesaplama':
    path('M132 183h319l55 49H185zM185 232v31h321v-31H185z', metal) +
    path('M294 190h111l19 17H313z', voidFill, cyan) +
    path('M288 115h109l20 16H307zM307 131h110v26H307z', metal) +
    arrow('M351 160v28') + text('b', 352, 99) + text('h', 445, 143),
  'uzunluk-birimi-cevirici':
    group('rotate(-9 320 180)', box(131, 127, 378, 105, metal) +
      repeat(26, i => path(`M${143+i*14} 128v${i % 5 ? 13 : 30}`, 'none', graphite, 2)) +
      repeat(14, i => path(`M${147+i*26} 231v-${i % 2 ? 12 : 24}`, 'none', graphite, 2)) +
      text('mm', 185, 179, '#182a35') + text('in', 455, 205, '#182a35')),
  'agirlik-birimi-cevirici':
    path('M320 107v151m-146 -87h291M180 171l-42 63h88zm280 0-42 63h88z', 'none', edge, 4) +
    ring(320, 171, 9, amber, 'none') + box(260, 257, 120, 17, metal) +
    text('kg', 182, 223) + text('lb', 459, 223, amber) +
    arrow('M247 119h144', 'cyan', true),
  'alan-birimi-cevirici':
    box(151, 106, 148, 148, graphite, cyan, 0) +
    repeat(4, i => path(`M${181 + i * 29} 107v146M152 ${136 + i * 29}h146`, 'none', '#537583', 2)) +
    box(377, 140, 111, 111, blue, amber, 0) + arrow('M313 180h51', 'cyan', true) +
    text('m²', 223, 288) + text('ha', 433, 212, amber),
  'hacim-birimi-cevirici':
    path('M158 102h128l-11 153H170z', graphite) + path('M167 172h113l-6 80H171z', blue, cyan) +
    path('M388 120h95v42l16 18v76H370v-76l18 -18z', metal) +
    arrow('M302 185h57', 'cyan', true) + text('L', 223, 219) + text('gal', 434, 223, '#172a35'),
  'sicaklik-birimi-cevirici':
    box(208, 86, 48, 148, graphite, edge, 20) + ring(232, 237, 31, graphite) +
    path('M232 123v113', 'none', amber, 12) + ring(232, 237, 16, amber, 'none') +
    repeat(7, i => path(`M258 ${111 + i * 17}h${i % 2 ? 10 : 22}`, 'none', edge, 2)) +
    arrow('M301 183h64', 'cyan', true) + text('°F', 417, 160, amber, 37) + text('K', 430, 226, cyan, 32) + text('°C', 174, 188),
  'basinc-birimi-cevirici':
    gauge(246, 173, 81, 'bar') + gauge(421, 195, 64, 'psi') + arrow('M330 96h90', 'cyan', true),
  'yuzde-hesaplama':
    ring(257, 180, 86, graphite) + path('M257 180V94a86 86 0 0 1 73 131z', copper, amber) +
    text('%', 418, 209, cyan, 76),
  'alan-hesaplama':
    path('M182 110h232l78 94-56 57H182z', blue, cyan) +
    dash('M420 110v150M182 205h309') +
    arrow('M182 283h257', 'cyan', true) + arrow('M158 109v152', 'cyan', true) +
    text('A', 319, 174, amber, 35),
  'hacim-hesaplama':
    path('M207 138l104 -53 129 37-105 56zM207 138l128 40v107l-128 -41zM335 178l105 -56v109l-105 54z', blue, cyan) +
    dash('M207 244l104 -56 129 43m-129 -43V85') + text('V', 273, 219, amber, 40),
  'pisagor-teoremi':
    path('M199 104v152h248z', blue, cyan, 4) + path('M199 235h22v21', 'none', edge, 2) +
    text('a', 173, 190) + text('b', 323, 287) + text('c', 344, 163, amber),
  'disli-carki-hesaplama':
    gear(251, 169, 76, 18, metal) + gear(391, 200, 61, 15, copper) +
    arrow('M163 166a88 88 0 0 1 58 -81', 'cyan') + arrow('M438 256a75 75 0 0 0 28 -67') +
    text('z₁', 245, 294) + text('z₂', 405, 307, amber),
  'yay-hesaplama':
    box(220, 239, 200, 14, metal) + box(235, 106, 170, 14, metal) +
    repeat(6, i => oval(320, 130 + i * 19, 60, 12, 'none', i % 2 ? cyan : edge)) +
    arrow('M320 53v46') + text('F', 347, 80, amber) + arrow('M430 122v112', 'cyan', true) + text('Δx', 463, 184),
  'rulman-omru-hesaplama':
    ring(320, 181, 106, metal) + ring(320, 181, 87, graphite) +
    repeat(10, i => group(`rotate(${i * 36} 320 181)`, ring(320, 113, 13, 'url(#ball)', edge, 2))) +
    ring(320, 181, 49, metal) + ring(320, 181, 34, voidFill) +
    arrow('M443 182v67') + text('P', 470, 217, amber) + text('L₁₀', 320, 189, cyan, 19),
  'viskozite-donusumu':
    path('M191 131h255l-24 132H215z', graphite) + path('M205 187h229l-12 76H215z', blue, cyan) +
    path('M320 87v133', 'none', edge, 8) + oval(320, 222, 54, 10, metal) +
    arrow('M266 146q-36 -27 13 -36') + text('μ', 457, 224, amber) + text('ν', 178, 224),
  'guc-verim-hesaplama':
    motor(222, 143) + arrow('M118 186h83', 'cyan') + arrow('M411 186h101') +
    text('P₁', 157, 166) + text('P₂', 464, 169, amber) + text('η', 295, 286, amber, 30),
  'termal-iletim-hesaplama':
    box(170, 115, 300, 137, 'url(#thermal)', edge, 2) +
    repeat(3, i => arrow(`M194 ${148 + i*34}h249`)) +
    text('T₁', 145, 189, amber) + text('T₂', 496, 189) + text('Q', 320, 285, amber),
  'devir-frekans-donusumu':
    ring(193, 186, 64, metal) + ring(193, 186, 24, graphite) +
    arrow('M121 187a72 72 0 0 1 107 -65') + axis('M303 130v106h203', 'M309 186q18 -70 36 0t36 0t36 0t36 0t36 0', 't', '') +
    text('rpm', 193, 286) + text('Hz', 405, 286, amber),
  'boru-eti-hesaplama':
    path('M247 111h162v143H247z', metal) + oval(409, 182, 37, 71, graphite) + bearing(242, 182, 73, 53) +
    arrow('M168 279h146', 'cyan', true) + text('ØD', 241, 308) + arrow('M199 111l17 26') + text('t', 181, 104, amber),
  'o-ring-kanali-hesaplama':
    path('M147 166h151v51h71v-51h124v100H147z', 'url(#section)') +
    box(147, 115, 346, 36, metal) + oval(333, 184, 31, 32, copper, amber) +
    dash('M147 151h343') + arrow('M300 283h69', 'cyan', true) + text('b', 334, 311) + text('Ød', 401, 145, '#163342'),
  'isil-genlesme-hesaplama':
    box(159, 125, 255, 26, metal) + box(159, 199, 310, 26, copper) +
    dash('M159 106v139M414 106v146M470 220v59') + arrow('M415 264h54', 'cyan', true) +
    text('ΔL', 442, 293) + text('T₁', 119, 144) + text('T₂', 119, 220, amber),
  'reynolds-sayisi-hesaplama':
    box(132, 110, 376, 54, graphite) + box(132, 206, 376, 54, graphite) +
    repeat(3, i => arrow(`M159 ${122 + i*15}h313`, 'cyan')) +
    repeat(3, i => path(`M152 ${219+i*13}q50 -18 91 0t95 0t95 0t52 0`, 'none', amber, 2)) +
    text('Re', 320, 192),
  'basincli-kap-cidar-kalinligi':
    path('M218 115h202a69 69 0 1 1 0 138H218a69 69 0 1 1 0 -138z', metal) +
    path('M218 131h202a53 53 0 1 1 0 106H218a53 53 0 1 1 0 -106z', voidFill) +
    arrow('M320 180v-42') + arrow('M320 187v43') + text('p', 348, 191, amber) +
    arrow('M425 95l-6 30', 'cyan') + text('t', 445, 96),
  'proje-yonetimi':
    repeat(3, i => document(137 + i*127, 96, 112, 170,
      box(10, 37, 92, 27, i === 2 ? blue : metal) + box(10, 76, 92, 27, graphite) +
      (i !== 1 ? box(10, 115, 92, 27, graphite) : '') +
      (i === 2 ? path('M47 50l6 6 13 -15', 'none', amber, 3) : ''))),
  'oee-uretim-verimliligi-hesaplama':
    [0, 1, 2].map((i) => gauge(173+i*147, 171, 62, ['A','P','Q'][i])).join('') +
    text('OEE', 321, 281, amber, 32),
  'takt-suresi-kapasite-hesaplama':
    box(137, 204, 366, 42, graphite) + repeat(7, i => ring(159 + i*53, 226, 12, metal)) +
    repeat(3, i => box(164 + i*80, 165, 61, 39, copper, amber)) +
    ring(453, 133, 50, metal) + ring(453, 133, 43, voidFill) + path('M453 107v26l18 17', 'none', cyan, 4) +
    arrow('M165 274h282', 'cyan'),
  'molarite-seyreltme-hesaplama':
    flask(210, 104, '#b86d36') + flask(432, 104, '#387f92') +
    arrow('M273 170h94', 'cyan') + text('C₁V₁', 212, 276, amber) + text('C₂V₂', 430, 276),
  'karbon-emisyonu-hesaplama':
    path('M149 246v-62l81 36v-55l71 43 27 -66h43l15 104z', metal) +
    path('M355 135q-12 -43 37 -50 23 -29 62 -6 45 -1 53 38 27 41 -17 54h-94q-24 0 -28 -22z', graphite, cyan) +
    text('CO₂e', 433, 132, cyan, 29) + path('M174 228h35m31 0h35m31 0h35', 'none', graphite, 5),
  'gunes-paneli-enerji-hesaplama':
    path('M155 245l62 -103h250l-60 103z', blue, cyan) +
    repeat(4, i => path(`M${204+i*49} 245l63 -103`, 'none', edge, 2)) +
    path('M175 211h253m-232 -34h250', 'none', edge, 2) + ring(469, 99, 31, amber, 'none') +
    arrow('M424 101l-54 35') + path('M250 247v31m101-31v31', 'none', edge, 4),
  'api-sla-uptime-hesaplama':
    repeat(3, i => box(149, 111 + i*45, 144, 38, graphite) +
      ring(170, 130+i*45, 5, cyan, 'none') + path(`M192 ${130+i*45}h80`, 'none', edge, 2)) +
    arrow('M304 178h43', 'cyan') + ring(433, 175, 77, graphite, edge, 3) +
    path('M433 98a77 77 0 1 1 -65 119', 'none', cyan, 8) +
    text('SLA', 433, 186, cyan, 33),
  'pazaryeri-fiyat-hesaplama':
    path('M146 151l78 -48 84 48v99l-84 31-78 -31zM146 151l78 35 84 -35M224 186v95', copper, edge) +
    path('M352 136h112l48 49-48 50H352z', blue, cyan) +
    ring(474, 186, 8, voidFill, cyan, 2) + text('₺', 407, 208, amber, 53),
  'kdv-hesaplama':
    document(212, 83, 218, 199, repeat(4, i => path(`M19 ${51+i*24}h102m29 0h48`, 'none', edge, 2)) +
      path('M19 143h179', 'none', amber, 2) + text('₺', 178, 179, amber, 28)) +
    text('%', 164, 190, cyan, 48),
  'bmi-hesaplama':
    box(146, 169, 152, 99, metal) + box(177, 184, 91, 31, voidFill, cyan) + text('kg', 223, 207, cyan, 19) +
    path('M452 88v178', 'none', edge, 4) +
    repeat(9, i => path(`M451 ${90+i*21}h${i % 2 ? 11 : 21}`, 'none', edge, 2)) +
    ring(382, 119, 19, copper) + path('M382 143v62m-29 -43h58m-29 43-25 48m25 -48 25 48', 'none', amber, 7) +
    text('m', 488, 185),
  'kira-artis-hesaplama':
    house(230, 177) + path('M352 250v-56h32v56zm52 0v-89h32v89zm53 0V119h32v131z', blue, cyan) +
    arrow('M348 178l140 -66') + text('%', 477, 100, amber),
  'kredi-hesaplama':
    document(152, 105, 194, 152, repeat(3, i => path(`M17 ${53 + 29*i}h160`, 'none', edge, 2)) +
      repeat(4, i => path(`M${28+i*43} 30v109`, 'none', edge, 2))) +
    repeat(4, i => oval(438, 231 - i*15, 64, 13, copper, amber)) + text('₺', 438, 160, amber, 41),
  'konik-hesaplama':
    path('M179 111l282 49v43l-282 46z', metal) + oval(180, 180, 29, 69, graphite) +
    oval(460, 181, 12, 22, metal) + dash('M134 180h369') +
    arrow('M132 112v135', 'cyan', true) + arrow('M505 160v44', 'cyan', true) +
    arrow('M179 273h281', 'cyan', true) + text('D', 108, 189) + text('d', 531, 188) + text('L', 321, 304),
  'kayis-kasnak-hesaplama':
    path('M199 125 413 92a91 91 0 1 1 0 181l-214 -34a58 58 0 0 1 0 -114z', graphite, amber, 4) +
    ring(205, 182, 49, metal) + ring(419, 182, 79, metal) + ring(205, 182, 32, graphite) +
    ring(419, 182, 59, graphite) + ring(205, 182, 9, voidFill) + ring(419, 182, 17, voidFill) +
    text('D₁', 203, 285) + text('D₂', 420, 309),
  'pompa-guc-hesaplama':
    path('M145 180h305v96H145z', blue, cyan) + path('M145 180q18 -10 37 0t37 0t37 0t37 0t37 0t37 0t37 0t37 0', 'none', cyan, 2) +
    box(204, 190, 76, 69, metal, edge, 9) + path('M242 194V98h174', 'none', edge, 12) +
    arrow('M242 176v-59', 'cyan') + arrow('M300 98h116', 'cyan') +
    arrow('M477 246V98', 'amber', true) + text('H', 501, 180, amber) + text('Q', 382, 83),
  'kaynak-dikisi-hesaplama':
    plate(148, 237, 292, 65, 20) +
    path('M284 220V103l43 -26v117zM284 103h39v117h-39zM323 103l43 -26v117l-43 26z', metal) +
    path('M323 220l43 -26 31 0-44 26zm-39 0h-36l36 -24z', copper, amber) +
    arrow('M384 177l-44 32') + text('a', 402, 174, amber),
};

export function renderToolIllustration(title: string, scene: string) {
  const escapedTitle = title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 640 360" role="img" aria-labelledby="title">
    <title id="title">${escapedTitle}</title>
    <defs>
      <radialGradient id="stage" cx="50%" cy="46%" r="67%"><stop stop-color="#304754"/><stop offset="1" stop-color="#101b23"/></radialGradient>
      <linearGradient id="metal" x2=".15" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#e0e8eb"/><stop offset=".42" stop-color="#a0b5bf"/><stop offset="1" stop-color="#506876"/></linearGradient>
      <linearGradient id="copper" x2="0" y2="1"><stop stop-color="#deb281"/><stop offset="1" stop-color="#9e674a"/></linearGradient>
      <linearGradient id="thermal"><stop stop-color="#ba643d"/><stop offset="1" stop-color="#196585"/></linearGradient>
      <radialGradient id="ball" cx=".35" cy=".27"><stop stop-color="#fbf9ed"/><stop offset="1" stop-color="#6d8790"/></radialGradient>
      <pattern id="section" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="8" height="8" fill="#425660"/><path d="M0 0v8" stroke="#9bb4be" stroke-width="2"/></pattern>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" stroke="#92b5c2" stroke-opacity=".09" fill="none"/></pattern>
      <marker id="cyan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0l10 5-10 5z" fill="${cyan}"/></marker>
      <marker id="amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0l10 5-10 5z" fill="${amber}"/></marker>
    </defs>
    <rect width="640" height="360" fill="url(#stage)"/>
    <rect x="27" y="27" width="586" height="306" rx="8" fill="url(#grid)" stroke="#8baaaf" stroke-opacity=".2"/>
    <g font-family="system-ui, sans-serif" font-weight="600">${scene}</g>
  </svg>`;
}
