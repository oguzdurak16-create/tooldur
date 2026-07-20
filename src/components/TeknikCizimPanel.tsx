"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Copy,
  MoveDiagonal,
} from "lucide-react";
import { sanitizeSvgContent } from "@/lib/security";

interface TeknikCizimLegendItem {
  label: string;
  value: string;
  note?: string;
}

interface Props {
  svgContent: string;
  filename?: string;
  title?: string;
  description?: string;
  legendItems?: TeknikCizimLegendItem[];
}

export default function TeknikCizimPanel({
  svgContent,
  filename = "cizim",
  title = "Teknik Çizim",
  description,
  legendItems = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const safeSvgContent = sanitizeSvgContent(svgContent);
  const effectiveDescription =
    description ||
    "Bu çizim sonuç ölçülerinin parça üzerinde nerede kullanıldığını anlatan görsel ön kontroldür. İmalata geçmeden önce ölçü toleransı, yüzey kalitesi, malzeme ve montaj şartı teknik resimde ayrıca netleştirilmelidir.";

  /* ── ZOOM ───────────────────────────────────────── */
  const zoom = useCallback((delta: number) => {
    setScale((s) => Math.min(Math.max(s + delta, 0.3), 4));
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const fitToView = useCallback(() => {
    if (!containerRef.current || !safeSvgContent) return;
    const svgMatch = safeSvgContent.match(/<svg[^>]*width=["']?([0-9.]+)/i);
    const heightMatch = safeSvgContent.match(/<svg[^>]*height=["']?([0-9.]+)/i);
    const svgW = svgMatch ? Number(svgMatch[1]) : 400;
    const svgH = heightMatch ? Number(heightMatch[1]) : 300;
    const canvas = containerRef.current.querySelector('[data-cizim-canvas]') as HTMLDivElement | null;
    const box = canvas?.getBoundingClientRect();
    if (!box || !svgW || !svgH) return;
    const nextScale = Math.min(Math.max(Math.min((box.width - 40) / svgW, (box.height - 40) / svgH), 0.35), 3);
    setScale(Number(nextScale.toFixed(2)));
    setOffset({ x: 0, y: 0 });
  }, [safeSvgContent]);

  /* ── WHEEL ZOOM ─────────────────────────────────── */
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // React/Chrome bazı wheel eventlerini passive çalıştırdığı için preventDefault kullanmıyoruz.
      zoom(e.deltaY < 0 ? 0.12 : -0.12);
    },
    [zoom],
  );

  /* ── PAN ────────────────────────────────────────── */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    },
    [offset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  /* ── SVG DOWNLOAD ────────────────────────────────── */
  const downloadSVG = () => {
    const blob = new Blob([safeSvgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── PNG DOWNLOAD ────────────────────────────────── */
  const downloadPNG = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(safeSvgContent, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return;

    const w = parseFloat(svg.getAttribute("width") || "400");
    const h = parseFloat(svg.getAttribute("height") || "300");
    const scale = 2; // retina

    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, w, h);

    const img = new Image();
    const svgBlob = new Blob([safeSvgContent], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, w, h);
      const a = document.createElement("a");
      a.download = `${filename}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  /* ── COPY SVG ────────────────────────────────────── */
  const copySVG = async () => {
    try {
      await navigator.clipboard.writeText(safeSvgContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  /* ── FULLSCREEN ──────────────────────────────────── */
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ── KEYBOARD ────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        !containerRef.current?.contains(document.activeElement) &&
        document.activeElement !== document.body
      )
        return;
      if (e.key === "+" || e.key === "=") zoom(0.15);
      if (e.key === "-") zoom(-0.15);
      if (e.key === "0") resetView();
      if (e.key.toLowerCase() === "f") fitToView();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zoom, resetView, fitToView]);

  if (!svgContent) return null;

  return (
    <div
      ref={containerRef}
      className={`mt-6 border border-secondary-200 rounded-2xl overflow-hidden bg-white ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
    >
      {/* ── TOOLBAR ── */}
      <div className="bg-secondary-50 px-4 py-2 flex items-center justify-between border-b border-secondary-100 gap-2 flex-wrap">
        <span className="text-sm font-medium text-secondary-700 select-none">
          🔧 {title}
        </span>

        <div className="flex items-center gap-1 flex-wrap">
          {/* Zoom kontrolleri */}
          <button
            onClick={() => zoom(0.2)}
            title="Yakınlaştır (+)"
            className="p-1.5 rounded-lg text-secondary-500 hover:text-primary-700 hover:bg-primary-50 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoom(-0.2)}
            title="Uzaklaştır (-)"
            className="p-1.5 rounded-lg text-secondary-500 hover:text-primary-700 hover:bg-primary-50 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-secondary-400 tabular-nums w-10 text-center select-none">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={resetView}
            title="Sıfırla (0)"
            className="p-1.5 rounded-lg text-secondary-500 hover:text-primary-700 hover:bg-primary-50 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={fitToView}
            title="Ekrana sığdır (F)"
            className="p-1.5 rounded-lg text-secondary-500 hover:text-primary-700 hover:bg-primary-50 transition"
          >
            <MoveDiagonal className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-secondary-200 mx-1" />

          {/* Tam ekran */}
          <button
            onClick={toggleFullscreen}
            title="Tam Ekran"
            className="p-1.5 rounded-lg text-secondary-500 hover:text-primary-700 hover:bg-primary-50 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Kopyala */}
          <button
            onClick={copySVG}
            title="SVG Kodu Kopyala"
            className="p-1.5 rounded-lg text-secondary-500 hover:text-primary-700 hover:bg-primary-50 transition"
          >
            <Copy className="w-4 h-4" />
          </button>
          {copied && (
            <span className="text-xs text-green-600 font-medium">
              Kopyalandı!
            </span>
          )}

          <div className="w-px h-4 bg-secondary-200 mx-1" />

          {/* SVG indir */}
          <button
            onClick={downloadSVG}
            title="SVG İndir"
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-medium px-2 py-1 rounded-lg hover:bg-primary-50 transition"
          >
            <Download className="w-3.5 h-3.5" /> SVG
          </button>
          {/* PNG indir */}
          <button
            onClick={downloadPNG}
            title="PNG İndir (2×)"
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium px-2 py-1 rounded-lg hover:bg-violet-50 transition"
          >
            <Download className="w-3.5 h-3.5" /> PNG
          </button>
        </div>
      </div>

      {(effectiveDescription || legendItems.length > 0) && (
        <div className="px-4 py-3 bg-white border-b border-secondary-100">
          {effectiveDescription && (
            <p className="text-sm text-secondary-600 leading-relaxed mb-3">
              {effectiveDescription}
            </p>
          )}
          {legendItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {legendItems.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="rounded-xl border border-secondary-100 bg-secondary-50 px-3 py-2"
                >
                  <div className="text-[11px] uppercase tracking-wide text-secondary-400 font-semibold">
                    {item.label}
                  </div>
                  <div className="text-sm font-bold text-secondary-900 mt-0.5">
                    {item.value}
                  </div>
                  {item.note && (
                    <div className="text-xs text-secondary-500 mt-1 leading-snug">
                      {item.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-3 bg-white border-b border-secondary-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-secondary-600">
          <div className="rounded-xl bg-secondary-50 border border-secondary-100 px-3 py-2"><strong>1.</strong> Ölçünün hangi yüzeye ait olduğunu kontrol edin.</div>
          <div className="rounded-xl bg-secondary-50 border border-secondary-100 px-3 py-2"><strong>2.</strong> Tolerans, yüzey ve kenar notunu teknik resimde ayrıca belirtin.</div>
          <div className="rounded-xl bg-secondary-50 border border-secondary-100 px-3 py-2"><strong>3.</strong> SVG/PNG çıktıyı ön kontrol görseli olarak kullanın.</div>
        </div>
      </div>

      {/* ── CANVAS ALANI ── */}
      <div
        data-cizim-canvas
        className={`relative overflow-hidden bg-white select-none ${isFullscreen ? "flex-1" : ""}`}
        style={{
          height: isFullscreen ? "calc(100vh - 52px)" : "340px",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid arka plan */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.4,
          }}
        />

        {/* SVG İçerik */}
        <div
          ref={svgWrapRef}
          className="absolute top-1/2 left-1/2"
          style={{
            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.05s ease-out",
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.10))",
          }}
          dangerouslySetInnerHTML={{ __html: safeSvgContent }}
        />

        {/* Mini ipucu */}
        <div className="absolute bottom-2 right-3 text-xs text-secondary-300 pointer-events-none select-none">
          Kaydır · Tekerlek: zoom · F: sığdır · 0: sıfırla
        </div>
      </div>
    </div>
  );
}
