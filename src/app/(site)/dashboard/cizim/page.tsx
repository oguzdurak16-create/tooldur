"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { generateDrawing, DrawingType, DrawingParams } from "@/lib/drawingEngine";
import {
  ArrowLeft, Download, RefreshCw, Zap, Building2, Cog,
  Circle, Square, Layers, BarChart3, ChevronRight,
  Copy, Check, Info, Settings2
} from "lucide-react";
import { sanitizeSvgContent } from '@/lib/security';

// ─── ÇİZİM TİPLERİ ───────────────────────────────────────────
const DRAWING_TYPES: {
  value: DrawingType; label: string; group: string;
  icon: any; fields: Field[];
}[] = [
  {
    value: "mil_kesit", label: "Mil Kesiti", group: "Makine",
    icon: Circle,
    fields: [
      { key: "width", label: "Mil Çapı (mm)", placeholder: "50", unit: "mm" },
    ]
  },

  {
    value: "kama_kanali", label: "Kama Kanalı", group: "Makine",
    icon: Cog,
    fields: [
      { key: "shaftDia", label: "Mil Çapı (mm)", placeholder: "25", unit: "mm" },
      { key: "b", label: "Kama Genişliği b (mm)", placeholder: "8", unit: "mm" },
      { key: "h", label: "Kama Yüksekliği h (mm)", placeholder: "7", unit: "mm" },
      { key: "t1", label: "Mil Kanal Derinliği t1 (mm)", placeholder: "4", unit: "mm" },
      { key: "t2", label: "Göbek Kanal Derinliği t2 (mm)", placeholder: "3.3", unit: "mm" },
    ]
  },
  {
    value: "disli_carki", label: "Dişli Çark Çifti", group: "Makine",
    icon: Cog,
    fields: [
      { key: "m", label: "Modül", placeholder: "2", unit: "m" },
      { key: "z1", label: "1. Diş Sayısı", placeholder: "20", unit: "z" },
      { key: "z2", label: "2. Diş Sayısı", placeholder: "40", unit: "z" },
      { key: "n1", label: "Giriş Devri", placeholder: "1500", unit: "rpm" },
    ]
  },
  {
    value: "yay_kesit", label: "Basma Yayı", group: "Makine",
    icon: Cog,
    fields: [
      { key: "wireDia", label: "Tel Çapı (mm)", placeholder: "5", unit: "mm" },
      { key: "coilDia", label: "Ortalama Yay Çapı (mm)", placeholder: "40", unit: "mm" },
      { key: "turns", label: "Aktif Sarım", placeholder: "8", unit: "adet" },
      { key: "force", label: "Kuvvet", placeholder: "500", unit: "N" },
    ]
  },
  {
    value: "devir_frekans", label: "Devir / Frekans", group: "Makine",
    icon: Cog,
    fields: [
      { key: "rpm", label: "Devir", placeholder: "1500", unit: "rpm" },
      { key: "diameter", label: "Çap", placeholder: "120", unit: "mm" },
      { key: "frequency", label: "Frekans", placeholder: "50", unit: "Hz" },
      { key: "pole", label: "Kutup Sayısı", placeholder: "4", unit: "p" },
    ]
  },

  {
    value: "ipe_kesit", label: "IPE Profil Kesiti", group: "Çelik",
    icon: Layers,
    fields: [
      { key: "height", label: "Profil Yüksekliği (mm)", placeholder: "200", unit: "mm" },
      { key: "width",  label: "Flanş Genişliği (mm)",   placeholder: "100", unit: "mm", optional: true },
    ]
  },
  {
    value: "hea_kesit", label: "HEA Profil Kesiti", group: "Çelik",
    icon: Layers,
    fields: [
      { key: "height", label: "Profil Yüksekliği (mm)", placeholder: "200", unit: "mm" },
      { key: "width",  label: "Flanş Genişliği (mm)",   placeholder: "200", unit: "mm", optional: true },
    ]
  },
  {
    value: "kutu_kesit", label: "Kutu Profil Kesiti", group: "Çelik",
    icon: Square,
    fields: [
      { key: "width",     label: "Genişlik (mm)",       placeholder: "100", unit: "mm" },
      { key: "height",    label: "Yükseklik (mm)",      placeholder: "150", unit: "mm" },
      { key: "thickness", label: "Et Kalınlığı (mm)",   placeholder: "8",   unit: "mm" },
    ]
  },
  {
    value: "kablo_kesit", label: "Kablo Kesiti", group: "Elektrik",
    icon: Zap,
    fields: [
      { key: "result", label: "Kablo Kesiti (mm²)", placeholder: "2.5", unit: "mm²" },
    ]
  },
  {
    value: "beton_kesit", label: "Beton Plak Kesiti", group: "İnşaat",
    icon: Building2,
    fields: [
      { key: "width",  label: "Plak Genişliği (mm)",  placeholder: "1000", unit: "mm" },
      { key: "height", label: "Plak Kalınlığı (mm)",  placeholder: "200",  unit: "mm" },
    ]
  },
  {
    value: "kiriş_yük", label: "Kiriş Yük Diyagramı", group: "Statik",
    icon: BarChart3,
    fields: [
      { key: "length", label: "Açıklık (mm)",         placeholder: "5000", unit: "mm" },
      { key: "load",   label: "Yayılı Yük (kN/m)",    placeholder: "10",   unit: "kN/m" },
    ]
  },
];

interface Field {
  key: keyof DrawingParams;
  label: string;
  placeholder: string;
  unit: string;
  optional?: boolean;
}

const GROUPS = ["Makine", "Çelik", "Elektrik", "İnşaat", "Statik"];

export default function CizimPage() {
  const svgRef = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<DrawingType>("mil_kesit");
  const [values, setValues] = useState<Record<string, string>>({});
  const [label, setLabel] = useState("");
  const [svgContent, setSvgContent] = useState<string>(() => {
    return generateDrawing({ type: "mil_kesit", width: 50 });
  });
  const [copied, setCopied] = useState(false);
  const safeSvgContent = sanitizeSvgContent(svgContent);
  const [activeGroup, setActiveGroup] = useState("Makine");

  const currentType = DRAWING_TYPES.find(t => t.value === selectedType)!;

  // Çizimi yenile
  const handleGenerate = useCallback(() => {
    const params: DrawingParams = { type: selectedType, label: label || undefined };
    currentType.fields.forEach(f => {
      const v = parseFloat(values[f.key] || f.placeholder);
      if (!isNaN(v)) (params as any)[f.key] = v;
    });
    setSvgContent(generateDrawing(params));
  }, [selectedType, values, label, currentType]);

  // Tip değişince default değerlerle çiz
  const handleTypeChange = (type: DrawingType) => {
    setSelectedType(type);
    setValues({});
    setLabel("");
    const t = DRAWING_TYPES.find(d => d.value === type)!;
    const params: DrawingParams = { type };
    t.fields.forEach(f => {
      const v = parseFloat(f.placeholder);
      if (!isNaN(v)) (params as any)[f.key] = v;
    });
    setSvgContent(generateDrawing(params));
  };

  // SVG indir
  const handleDownloadSVG = () => {
    const blob = new Blob([safeSvgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tooldur-cizim-${selectedType}-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // SVG → PNG indir
  const handleDownloadPNG = () => {
    const canvas = document.createElement("canvas");
    const scale = 3;
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgEl = svgDoc.querySelector("svg")!;
    const w = parseInt(svgEl.getAttribute("width") || "320");
    const h = parseInt(svgEl.getAttribute("height") || "280");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    const img = new Image();
    const blob = new Blob([safeSvgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `tooldur-cizim-${selectedType}-${Date.now()}.png`;
      a.click();
    };
    img.src = url;
  };

  // SVG kodu kopyala
  const handleCopySVG = async () => {
    await navigator.clipboard.writeText(safeSvgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTypes = DRAWING_TYPES.filter(t => t.group === activeGroup);

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm flex-shrink-0">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Teknik Çizim Motoru</h1>
            <p className="text-slate-400 text-xs">SVG tabanlı · Ölçekli · PNG/SVG çıktı · Teknik çizim ön kontrol</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* SOL: Kontrol paneli */}
          <div className="lg:col-span-2 space-y-4">

            {/* Grup seçimi */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Çizim Kategorisi</p>
              <div className="flex flex-wrap gap-2">
                {GROUPS.map(g => (
                  <button
                    key={g}
                    onClick={() => { setActiveGroup(g); const first = DRAWING_TYPES.find(t=>t.group===g); if(first) handleTypeChange(first.value); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${activeGroup===g ? "bg-primary-600 text-white border-primary-600" : "bg-white border-slate-200 text-slate-500 hover:border-primary-300 hover:text-primary-600"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Çizim tipi seçimi */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Çizim Tipi</p>
              <div className="space-y-1.5">
                {filteredTypes.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => handleTypeChange(t.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${selectedType===t.value ? "bg-primary-50 border-primary-200 text-primary-700" : "border-transparent hover:bg-slate-50 text-slate-600"}`}
                    >
                      <Icon size={16} className={selectedType===t.value ? "text-primary-600" : "text-slate-400"} />
                      <span className="text-sm font-medium">{t.label}</span>
                      {selectedType===t.value && <ChevronRight size={12} className="ml-auto text-primary-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parametreler */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Settings2 size={12} /> Parametreler
              </p>
              <div className="space-y-3">
                {currentType.fields.map(f => (
                  <div key={String(f.key)}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                      {f.label} {f.optional && <span className="text-slate-300">(opsiyonel)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={values[f.key] || ""}
                        onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full pr-12 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">{f.unit}</span>
                    </div>
                  </div>
                ))}

                {/* Açıklama etiketi */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Açıklama / Etiket (opsiyonel)</label>
                  <input
                    type="text"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="Örn: Proje A, 2. Kat Kirişi"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                <RefreshCw size={15} /> Çizimi Güncelle
              </button>
            </div>

            {/* Bilgi kutusu */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <div className="flex gap-2">
                <Info size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">Hesaplama Entegrasyonu</p>
                  <p className="text-xs text-amber-600">
                    Araçlarda yaptığınız hesaplamaların sonuçlarını buraya girerek
                    otomatik teknik çizim oluşturabilirsiniz.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* SAĞ: Çizim alanı */}
          <div className="lg:col-span-3 space-y-4">

            {/* Araç çubuğu */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Dışa Aktar:</span>
              <button
                onClick={handleDownloadSVG}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary-600 transition-all"
              >
                <Download size={13} /> SVG
              </button>
              <button
                onClick={handleDownloadPNG}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary-600 transition-all"
              >
                <Download size={13} /> PNG (3x)
              </button>
              <button
                onClick={handleCopySVG}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-primary-600 transition-all"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {copied ? "Kopyalandı!" : "SVG Kodu"}
              </button>
              <span className="ml-auto text-xs text-slate-300">Izgara arka plan · Ölçekli boyutlar</span>
            </div>

            {/* SVG Çizim */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div
                ref={svgRef}
                className="flex items-center justify-center p-6 min-h-80"
                dangerouslySetInnerHTML={{ __html: safeSvgContent }}
              />
            </div>

            {/* Tüm çizim tipleri - hızlı erişim */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tüm Çizim Tipleri</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DRAWING_TYPES.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => { setActiveGroup(t.group); handleTypeChange(t.value); }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all text-xs ${selectedType===t.value ? "bg-primary-50 border-primary-200 text-primary-700 font-semibold" : "border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"}`}
                    >
                      <Icon size={13} className={selectedType===t.value?"text-primary-500":"text-slate-400"} />
                      <span className="leading-tight">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}