'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, Trash2, Camera, Sparkles, ChevronRight, Home,
  Loader2, Move, Check, AlertCircle, Lock, Sun, Contrast, Printer,
  Globe, ZoomIn, ZoomOut, RotateCcw, Eye, X, Info,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════ */

interface CountryStandard {
  id: string;
  name: string;
  flag: string;
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
  bgColor: string;
  description: string;
}

const COUNTRY_STANDARDS: CountryStandard[] = [
  { id: 'us', name: 'United States', flag: '🇺🇸', widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600, bgColor: '#FFFFFF', description: '2×2 inches' },
  { id: 'in', name: 'India', flag: '🇮🇳', widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600, bgColor: '#FFFFFF', description: '2×2 inches (51×51mm)' },
  { id: 'uk', name: 'United Kingdom', flag: '🇬🇧', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, bgColor: '#FFFFFF', description: '35×45mm' },
  { id: 'eu', name: 'EU / Schengen', flag: '🇪🇺', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, bgColor: '#FFFFFF', description: '35×45mm' },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', widthMm: 50, heightMm: 70, widthPx: 591, heightPx: 827, bgColor: '#FFFFFF', description: '50×70mm' },
  { id: 'au', name: 'Australia', flag: '🇦🇺', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, bgColor: '#FFFFFF', description: '35×45mm' },
  { id: 'cn', name: 'China', flag: '🇨🇳', widthMm: 33, heightMm: 48, widthPx: 390, heightPx: 567, bgColor: '#FFFFFF', description: '33×48mm' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, bgColor: '#FFFFFF', description: '35×45mm' },
];

const BG_OPTIONS = [
  { id: 'white', label: 'White', color: '#FFFFFF' },
  { id: 'light-blue', label: 'Light Blue', color: '#D6EAF8' },
  { id: 'light-gray', label: 'Light Gray', color: '#F0F0F0' },
];

/* ═══════════════════════════════════════════════════════════════
   Usage tracking (freemium)
   ═══════════════════════════════════════════════════════════════ */

const FREE_DAILY_LIMIT = 2;

function getUsageToday(): number {
  const raw = localStorage.getItem('passport_usage');
  if (!raw) return 0;
  try {
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

function incrementUsage(): void {
  const today = new Date().toISOString().slice(0, 10);
  const current = getUsageToday();
  localStorage.setItem('passport_usage', JSON.stringify({ date: today, count: current + 1 }));
}

function isPro(): boolean {
  return localStorage.getItem('passport_pro') === 'true';
}

/* ═══════════════════════════════════════════════════════════════
   Canvas helpers
   ═══════════════════════════════════════════════════════════════ */

function replaceBackground(
  img: HTMLImageElement,
  bgColor: string,
  sensitivity: number = 30,
  maxSize: number = 2048,
): HTMLCanvasElement {
  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (w > maxSize || h > maxSize) {
    const scale = maxSize / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  // Sample edge pixels for background detection
  const edgeSamples: [number, number, number][] = [];
  const step = Math.max(1, Math.floor(Math.min(w, h) / 40));
  for (let x = 0; x < w; x += step) {
    const idx1 = x * 4;
    edgeSamples.push([data[idx1], data[idx1 + 1], data[idx1 + 2]]);
    const idx2 = ((h - 1) * w + x) * 4;
    edgeSamples.push([data[idx2], data[idx2 + 1], data[idx2 + 2]]);
  }
  for (let y = 0; y < h; y += step) {
    const idx1 = (y * w) * 4;
    edgeSamples.push([data[idx1], data[idx1 + 1], data[idx1 + 2]]);
    const idx2 = (y * w + (w - 1)) * 4;
    edgeSamples.push([data[idx2], data[idx2 + 1], data[idx2 + 2]]);
  }

  const bgR = edgeSamples.reduce((s, c) => s + c[0], 0) / edgeSamples.length;
  const bgG = edgeSamples.reduce((s, c) => s + c[1], 0) / edgeSamples.length;
  const bgB = edgeSamples.reduce((s, c) => s + c[2], 0) / edgeSamples.length;

  // Parse target bg color
  const r2 = parseInt(bgColor.slice(1, 3), 16);
  const g2 = parseInt(bgColor.slice(3, 5), 16);
  const b2 = parseInt(bgColor.slice(5, 7), 16);

  // Flood fill from edges using BFS
  const visited = new Uint8Array(w * h);
  const mask = new Uint8Array(w * h); // 1 = background
  const queue: number[] = [];

  // Seed from all edge pixels
  for (let x = 0; x < w; x++) {
    queue.push(x); queue.push(x + (h - 1) * w);
  }
  for (let y = 0; y < h; y++) {
    queue.push(y * w); queue.push(y * w + (w - 1));
  }

  const threshold = sensitivity;
  while (queue.length > 0) {
    const idx = queue.pop()!;
    if (visited[idx]) continue;
    visited[idx] = 1;

    const px = idx * 4;
    const dr = data[px] - bgR;
    const dg = data[px + 1] - bgG;
    const db = data[px + 2] - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist < threshold) {
      mask[idx] = 1;
      const x = idx % w;
      const y = Math.floor(idx / w);
      if (x > 0 && !visited[idx - 1]) queue.push(idx - 1);
      if (x < w - 1 && !visited[idx + 1]) queue.push(idx + 1);
      if (y > 0 && !visited[idx - w]) queue.push(idx - w);
      if (y < h - 1 && !visited[idx + w]) queue.push(idx + w);
    }
  }

  // Apply new background
  for (let i = 0; i < w * h; i++) {
    if (mask[i]) {
      data[i * 4] = r2;
      data[i * 4 + 1] = g2;
      data[i * 4 + 2] = b2;
      data[i * 4 + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function cropAndResize(
  sourceCanvas: HTMLCanvasElement,
  cropX: number, cropY: number, cropW: number, cropH: number,
  outputW: number, outputH: number,
  brightness: number, contrast: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = outputW;
  canvas.height = outputH;
  const ctx = canvas.getContext('2d')!;

  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
  ctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, outputW, outputH);
  ctx.filter = 'none';

  return canvas;
}

function generatePrintLayout(photoCanvas: HTMLCanvasElement, standard: CountryStandard): HTMLCanvasElement {
  // 4x6 inch print sheet at 300 DPI
  const sheetW = 1200; // 4 inches * 300
  const sheetH = 1800; // 6 inches * 300
  const canvas = document.createElement('canvas');
  canvas.width = sheetW;
  canvas.height = sheetH;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetW, sheetH);

  const pw = standard.widthPx;
  const ph = standard.heightPx;
  const gap = 20;

  const cols = Math.floor((sheetW + gap) / (pw + gap));
  const rows = Math.floor((sheetH + gap) / (ph + gap));
  const offsetX = Math.floor((sheetW - (cols * pw + (cols - 1) * gap)) / 2);
  const offsetY = Math.floor((sheetH - (rows * ph + (rows - 1) * gap)) / 2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * (pw + gap);
      const y = offsetY + r * (ph + gap);
      ctx.drawImage(photoCanvas, x, y, pw, ph);
      // Thin cut lines
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x, y, pw, ph);
      ctx.setLineDash([]);
    }
  }

  return canvas;
}

function addWatermark(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.font = `bold ${Math.max(16, canvas.width / 15)}px sans-serif`;
  ctx.fillStyle = '#FF0000';
  ctx.textAlign = 'center';
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.fillText('SheruTools', 0, 0);
  ctx.restore();
  return canvas;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function PassportPhotoPage() {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [finalCanvas, setFinalCanvas] = useState<HTMLCanvasElement | null>(null);
  const [finalUrl, setFinalUrl] = useState<string>('');

  const [selectedCountry, setSelectedCountry] = useState<CountryStandard>(COUNTRY_STANDARDS[0]);
  const [bgOption, setBgOption] = useState(BG_OPTIONS[0]);
  const [sensitivity, setSensitivity] = useState(30);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Crop state (relative 0-1)
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropScale, setCropScale] = useState(1);

  const [processing, setProcessing] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [proUser, setProUser] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Drag for manual crop
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

  useEffect(() => {
    setProUser(isPro());
    setUsageCount(getUsageToday());
  }, []);

  const canProcess = proUser || usageCount < FREE_DAILY_LIMIT;

  /* ─── File handling ─── */
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginalImage(img);
      setOriginalUrl(url);
      setProcessedCanvas(null);
      setFinalCanvas(null);
      setFinalUrl('');
      setCropX(0);
      setCropY(0);
      setCropScale(1);
    };
    img.src = url;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  /* ─── Process photo ─── */
  const processPhoto = useCallback(() => {
    if (!originalImage || !canProcess) return;
    setProcessing(true);

    setTimeout(() => {
      // Step 1: Replace background
      const bgCanvas = replaceBackground(originalImage, bgOption.color, sensitivity);
      setProcessedCanvas(bgCanvas);

      // Step 2: Auto-crop center (assume face is roughly centered)
      const srcW = bgCanvas.width;
      const srcH = bgCanvas.height;
      const targetRatio = selectedCountry.widthPx / selectedCountry.heightPx;
      const srcRatio = srcW / srcH;

      let cW: number, cH: number, cX: number, cY: number;
      if (srcRatio > targetRatio) {
        cH = srcH;
        cW = cH * targetRatio;
        cX = (srcW - cW) / 2;
        cY = 0;
      } else {
        cW = srcW;
        cH = cW / targetRatio;
        cX = 0;
        cY = Math.max(0, (srcH - cH) / 2 - srcH * 0.1); // bias slightly upward for head room
      }

      const final = cropAndResize(bgCanvas, cX, cY, cW, cH, selectedCountry.widthPx, selectedCountry.heightPx, brightness, contrast);

      if (!proUser) {
        addWatermark(final);
      }

      setFinalCanvas(final);
      setFinalUrl(final.toDataURL('image/png'));
      incrementUsage();
      setUsageCount(getUsageToday());
      setProcessing(false);
    }, 500);
  }, [originalImage, canProcess, bgOption, sensitivity, selectedCountry, brightness, contrast, proUser]);

  /* ─── Re-process with adjustments ─── */
  const reprocess = useCallback(() => {
    if (!processedCanvas) return;
    const srcW = processedCanvas.width;
    const srcH = processedCanvas.height;
    const targetRatio = selectedCountry.widthPx / selectedCountry.heightPx;
    const srcRatio = srcW / srcH;

    let baseW: number, baseH: number;
    if (srcRatio > targetRatio) {
      baseH = srcH;
      baseW = baseH * targetRatio;
    } else {
      baseW = srcW;
      baseH = baseW / targetRatio;
    }

    const scaledW = baseW / cropScale;
    const scaledH = baseH / cropScale;
    const cX = Math.max(0, Math.min((srcW - scaledW) / 2 + cropX * srcW, srcW - scaledW));
    const cY = Math.max(0, Math.min((srcH - scaledH) / 2 + cropY * srcH - srcH * 0.1, srcH - scaledH));

    const final = cropAndResize(processedCanvas, cX, cY, scaledW, scaledH, selectedCountry.widthPx, selectedCountry.heightPx, brightness, contrast);
    if (!proUser) addWatermark(final);
    setFinalCanvas(final);
    setFinalUrl(final.toDataURL('image/png'));
  }, [processedCanvas, selectedCountry, cropX, cropY, cropScale, brightness, contrast, proUser]);

  /* ─── Manual drag handlers ─── */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!finalCanvas) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, cx: cropX, cy: cropY };
  };
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = (e.clientX - dragStart.current.x) / 300;
    const dy = (e.clientY - dragStart.current.y) / 300;
    setCropX(dragStart.current.cx - dx);
    setCropY(dragStart.current.cy - dy);
  }, []);
  const handleMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      reprocess();
    }
  }, [reprocess]);

  /* ─── Download ─── */
  const handleDownload = () => {
    if (!finalCanvas) return;
    downloadCanvas(finalCanvas, `passport-photo-${selectedCountry.id}-${Date.now()}.png`);
  };

  const handlePrintDownload = () => {
    if (!finalCanvas) return;
    if (!proUser) return;
    const printCanvas = generatePrintLayout(finalCanvas, selectedCountry);
    downloadCanvas(printCanvas, `passport-print-${selectedCountry.id}-${Date.now()}.png`);
  };

  /* ─── Reset ─── */
  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalImage(null);
    setOriginalUrl('');
    setProcessedCanvas(null);
    setFinalCanvas(null);
    setFinalUrl('');
    setCropX(0);
    setCropY(0);
    setCropScale(1);
    setBrightness(100);
    setContrast(100);
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="min-h-screen" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <motion.div variants={fadeUp} className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white">Passport Photo Maker</span>
        </motion.div>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-500 dark:text-blue-400 mb-4">
            <Camera className="w-4 h-4" /> AI-Powered • 100% Private
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Passport Photo</span> Maker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Upload a selfie, get a passport-compliant photo instantly. Supports 8+ countries. White background, correct dimensions, 300 DPI.
          </p>
        </motion.div>

        {/* Usage counter */}
        {!proUser && (
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-slate-600 dark:text-slate-300">{FREE_DAILY_LIMIT - usageCount} free photos remaining today</span>
              <button className="ml-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
                Go Pro — $3.99
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left: Settings ─── */}
          <motion.div variants={fadeUp} className="lg:col-span-1 space-y-4">
            {/* Country Selector */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                <Globe className="w-4 h-4 text-blue-500" /> Country Standard
              </label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTRY_STANDARDS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCountry(c)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                      selectedCountry.id === c.id
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 border'
                        : 'bg-white/50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <div>
                      <div className="font-medium text-xs">{c.name}</div>
                      <div className="text-[10px] opacity-60">{c.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
              <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Background Color</label>
              <div className="flex gap-2">
                {BG_OPTIONS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setBgOption(bg)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      bgOption.id === bg.id
                        ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950'
                        : 'border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20" style={{ backgroundColor: bg.color }} />
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sensitivity */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
              <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Background Sensitivity</label>
              <input
                type="range" min={10} max={80} value={sensitivity}
                onChange={e => setSensitivity(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Tight</span><span>{sensitivity}</span><span>Loose</span>
              </div>
            </div>

            {/* Brightness / Contrast */}
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
              <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Adjustments</label>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Brightness</span>
                    <span>{brightness}%</span>
                  </div>
                  <input type="range" min={50} max={150} value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="flex items-center gap-1"><Contrast className="w-3 h-3" /> Contrast</span>
                    <span>{contrast}%</span>
                  </div>
                  <input type="range" min={50} max={150} value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>
              </div>
            </div>

            {/* Zoom controls */}
            {finalCanvas && (
              <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
                <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Crop & Position</label>
                <p className="text-[11px] text-slate-400 mb-3">Drag the preview image to reposition. Use zoom to adjust framing.</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setCropScale(s => Math.max(0.5, s - 0.1)); }} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center text-xs text-slate-500">{Math.round(cropScale * 100)}%</div>
                  <button onClick={() => { setCropScale(s => Math.min(3, s + 0.1)); }} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setCropX(0); setCropY(0); setCropScale(1); }} className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={reprocess} className="mt-3 w-full py-2 rounded-xl bg-blue-500/10 text-blue-500 text-sm font-medium hover:bg-blue-500/20 transition-colors">
                  Apply Changes
                </button>
              </div>
            )}
          </motion.div>

          {/* ─── Center + Right: Upload & Preview ─── */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-4">
            {!originalImage ? (
              /* Upload Zone */
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 md:p-20 text-center transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/5'
                    : 'border-slate-300 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/30 bg-white/80 dark:bg-white/[0.02]'
                }`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Upload className="w-12 h-12 mx-auto text-blue-500/60 mb-4" />
                </motion.div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drop your photo here</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">or click to browse • JPG, PNG, WebP supported</p>
                <p className="text-xs text-slate-400 mt-4">💡 For best results, use a well-lit front-facing photo with neutral expression</p>
              </div>
            ) : (
              /* Photo workspace */
              <div className="space-y-4">
                {/* Before/After */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">Original</span>
                      <button onClick={reset} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                    <div className="p-4 flex items-center justify-center" style={{ minHeight: 300 }}>
                      <img src={originalUrl} alt="Original" className="max-w-full max-h-72 object-contain rounded-lg" />
                    </div>
                  </div>

                  {/* Result */}
                  <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedCountry.flag} {selectedCountry.name} — {selectedCountry.description}
                      </span>
                      <button onClick={() => setShowGuidelines(!showGuidelines)} className={`text-xs flex items-center gap-1 transition-colors ${showGuidelines ? 'text-blue-500' : 'text-slate-400'}`}>
                        <Eye className="w-3 h-3" /> Guidelines
                      </button>
                    </div>
                    <div
                      ref={previewRef}
                      className="p-4 flex items-center justify-center relative"
                      style={{ minHeight: 300 }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {finalUrl ? (
                        <div className="relative inline-block">
                          <img src={finalUrl} alt="Passport Photo" className="max-h-72 object-contain rounded-lg cursor-move" draggable={false} />
                          {/* Guidelines overlay */}
                          {showGuidelines && (
                            <div className="absolute inset-0 pointer-events-none">
                              {/* Face zone */}
                              <div className="absolute border-2 border-dashed border-cyan-400/50 rounded-sm"
                                style={{ top: '10%', bottom: '30%', left: '20%', right: '20%' }}
                              />
                              {/* Eye line */}
                              <div className="absolute border-t-2 border-dashed border-amber-400/50"
                                style={{ top: '40%', left: '15%', right: '15%' }}
                              />
                              {/* Center line */}
                              <div className="absolute border-l border-dashed border-slate-400/30"
                                style={{ top: '5%', bottom: '5%', left: '50%' }}
                              />
                              {/* Labels */}
                              <span className="absolute text-[9px] text-cyan-400 font-medium" style={{ top: '8%', right: '21%' }}>Face Zone</span>
                              <span className="absolute text-[9px] text-amber-400 font-medium" style={{ top: '38%', right: '16%' }}>Eye Line</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-slate-400">
                          <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Click &quot;Generate&quot; to create your passport photo</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={processPhoto}
                    disabled={processing || !canProcess}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Sparkles className="w-4 h-4" /> Generate Passport Photo</>}
                  </button>

                  {finalCanvas && (
                    <>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold rounded-xl hover:bg-emerald-500/20 transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>

                      <button
                        onClick={() => proUser ? handlePrintDownload() : null}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-colors ${
                          proUser
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {proUser ? <Printer className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        Print Layout {!proUser && '(Pro)'}
                      </button>
                    </>
                  )}
                </div>

                {!canProcess && !proUser && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">Daily limit reached</p>
                      <p className="text-xs text-slate-500 mt-1">Upgrade to Pro for unlimited passport photos, HD quality, no watermark, and print layouts.</p>
                      <button className="mt-2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
                        Upgrade to Pro — $3.99
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Photo specs info */}
                {finalCanvas && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" /> Photo Specifications
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                        <div className="text-slate-400">Dimensions</div>
                        <div className="font-semibold text-slate-900 dark:text-white">{selectedCountry.widthPx} × {selectedCountry.heightPx}px</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                        <div className="text-slate-400">Size (mm)</div>
                        <div className="font-semibold text-slate-900 dark:text-white">{selectedCountry.widthMm} × {selectedCountry.heightMm}mm</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                        <div className="text-slate-400">Resolution</div>
                        <div className="font-semibold text-slate-900 dark:text-white">300 DPI</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5">
                        <div className="text-slate-400">Background</div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: bgOption.color }} />
                          {bgOption.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Features / SEO Content ─── */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: '🌍', title: '8+ Country Standards', desc: 'Pre-configured dimensions for US, India, UK, EU, Canada, Australia, China & Japan passports.' },
            { icon: '🔒', title: '100% Private', desc: 'All processing happens in your browser. Your photos never leave your device.' },
            { icon: '⚡', title: 'Instant Results', desc: 'Get your passport photo in seconds. Auto background replacement, proper cropping & sizing.' },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl text-center">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Country standards table */}
        <motion.div variants={fadeUp} className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl mb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Supported Passport Photo Standards</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="py-3 px-4 text-slate-500 font-medium">Country</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Size (mm)</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Pixels (300 DPI)</th>
                  <th className="py-3 px-4 text-slate-500 font-medium">Background</th>
                </tr>
              </thead>
              <tbody>
                {COUNTRY_STANDARDS.map(c => (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{c.flag} {c.name}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{c.widthMm} × {c.heightMm}mm</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{c.widthPx} × {c.heightPx}px</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">White</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* How it works */}
        <motion.div variants={fadeUp} className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Upload Photo', desc: 'Drop or browse a well-lit selfie with neutral expression.' },
              { step: '2', title: 'Select Country', desc: 'Choose your country standard for correct dimensions.' },
              { step: '3', title: 'Auto-Process', desc: 'Background is replaced, photo is cropped & resized automatically.' },
              { step: '4', title: 'Download', desc: 'Get your 300 DPI passport photo ready for printing or upload.' },
            ].map(s => (
              <div key={s.step} className="relative p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl text-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">{s.step}</div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div variants={fadeUp}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {[
              { q: 'Is this passport photo maker free?', a: 'Yes! You can create up to 2 passport photos per day for free. Pro users ($3.99 one-time) get unlimited photos, HD quality, no watermark, and print layouts.' },
              { q: 'Are my photos uploaded anywhere?', a: 'No. All processing happens 100% in your browser using Canvas API. Your photos never leave your device.' },
              { q: 'What countries are supported?', a: 'US, India, UK, EU/Schengen, Canada, Australia, China, and Japan. Each with correct official dimensions.' },
              { q: 'What is the output resolution?', a: 'All photos are generated at 300 DPI — the standard required for passport photo printing.' },
              { q: 'Can I print these at home?', a: 'Yes! Pro users can download a 4×6 inch print layout with multiple photos arranged for easy home printing on standard photo paper.' },
              { q: 'Do I need to have a white background?', a: 'No. The tool automatically detects and replaces the background with white (or light blue). For best results, use a photo with a plain, contrasting background.' },
            ].map(faq => (
              <details key={faq.q} className="group p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
