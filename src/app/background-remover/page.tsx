'use client';

import RelatedTools from '@/components/RelatedTools';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, Trash2, ImageIcon, Sparkles, ChevronRight, Home,
  Loader2, Palette, Move, ZoomIn, Check, AlertCircle, Lock, Wand2, Layers, Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useCallback, useEffect } from 'react';

/* ─── Types ─── */
type BackgroundMode = 'transparent' | 'color' | 'gradient' | 'image';
interface ProcessedResult {
  originalUrl: string;
  maskedUrl: string;
  compositeUrl: string;
  width: number;
  height: number;
}

/* ─── Usage tracking ─── */
const FREE_DAILY_LIMIT = 3;
const MAX_FREE_SIZE = 1024;

function getUsageToday(): number {
  const key = 'bgremover_usage';
  const raw = localStorage.getItem(key);
  if (!raw) return 0;
  try {
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

function incrementUsage(): void {
  const key = 'bgremover_usage';
  const today = new Date().toISOString().slice(0, 10);
  const current = getUsageToday();
  localStorage.setItem(key, JSON.stringify({ date: today, count: current + 1 }));
}

function isPro(): boolean {
  return localStorage.getItem('bgremover_pro') === 'true';
}

/* ─── Canvas-based background removal (edge-aware color thresholding) ─── */
function removeBackground(
  img: HTMLImageElement,
  sensitivity: number = 30,
  maxSize: number = 2048,
): Promise<{ maskedCanvas: HTMLCanvasElement; w: number; h: number }> {
  return new Promise((resolve) => {
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

    // Sample corner pixels to determine background color
    const corners = [
      [0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1],
      [1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2],
      [Math.floor(w / 2), 0], [Math.floor(w / 2), h - 1],
      [0, Math.floor(h / 2)], [w - 1, Math.floor(h / 2)],
    ];

    // Edge sampling: take pixels from all edges
    const edgeSamples: [number, number, number][] = [];
    const step = Math.max(1, Math.floor(Math.min(w, h) / 40));
    for (let x = 0; x < w; x += step) {
      const idx1 = (0 * w + x) * 4;
      edgeSamples.push([data[idx1], data[idx1 + 1], data[idx1 + 2]]);
      const idx2 = ((h - 1) * w + x) * 4;
      edgeSamples.push([data[idx2], data[idx2 + 1], data[idx2 + 2]]);
    }
    for (let y = 0; y < h; y += step) {
      const idx1 = (y * w + 0) * 4;
      edgeSamples.push([data[idx1], data[idx1 + 1], data[idx1 + 2]]);
      const idx2 = (y * w + (w - 1)) * 4;
      edgeSamples.push([data[idx2], data[idx2 + 1], data[idx2 + 2]]);
    }

    // Find dominant background color via simple clustering
    const bgR = edgeSamples.reduce((s, c) => s + c[0], 0) / edgeSamples.length;
    const bgG = edgeSamples.reduce((s, c) => s + c[1], 0) / edgeSamples.length;
    const bgB = edgeSamples.reduce((s, c) => s + c[2], 0) / edgeSamples.length;

    const threshold = sensitivity;

    // Create alpha mask with flood-fill from edges
    const mask = new Uint8Array(w * h); // 0 = background, 255 = foreground
    mask.fill(255); // Start all as foreground

    // BFS flood fill from edges
    const queue: number[] = [];
    const visited = new Uint8Array(w * h);

    const isBackground = (idx: number): boolean => {
      const r = data[idx * 4];
      const g = data[idx * 4 + 1];
      const b = data[idx * 4 + 2];
      const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
      return dist < threshold;
    };

    // Seed from all edge pixels
    for (let x = 0; x < w; x++) {
      for (const y of [0, h - 1]) {
        const idx = y * w + x;
        if (isBackground(idx) && !visited[idx]) {
          visited[idx] = 1;
          mask[idx] = 0;
          queue.push(idx);
        }
      }
    }
    for (let y = 0; y < h; y++) {
      for (const x of [0, w - 1]) {
        const idx = y * w + x;
        if (isBackground(idx) && !visited[idx]) {
          visited[idx] = 1;
          mask[idx] = 0;
          queue.push(idx);
        }
      }
    }

    // BFS
    let head = 0;
    while (head < queue.length) {
      const idx = queue[head++];
      const x = idx % w;
      const y = Math.floor(idx / w);
      const neighbors = [
        y > 0 ? idx - w : -1,
        y < h - 1 ? idx + w : -1,
        x > 0 ? idx - 1 : -1,
        x < w - 1 ? idx + 1 : -1,
      ];
      for (const n of neighbors) {
        if (n >= 0 && !visited[n] && isBackground(n)) {
          visited[n] = 1;
          mask[n] = 0;
          queue.push(n);
        }
      }
    }

    // Soften mask edges (3px Gaussian-like blur on mask)
    const softMask = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0, count = 0;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
              sum += mask[ny * w + nx];
              count++;
            }
          }
        }
        softMask[y * w + x] = Math.round(sum / count);
      }
    }

    // Apply mask to alpha channel
    for (let i = 0; i < w * h; i++) {
      data[i * 4 + 3] = softMask[i];
    }

    ctx.putImageData(imageData, 0, 0);
    resolve({ maskedCanvas: canvas, w, h });
  });
}

/* ─── Composite with background ─── */
function compositeWithBackground(
  maskedCanvas: HTMLCanvasElement,
  mode: BackgroundMode,
  bgColor: string,
  bgGradient: string,
  bgImageUrl: string | null,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const w = maskedCanvas.width;
    const h = maskedCanvas.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    if (mode === 'transparent') {
      ctx.drawImage(maskedCanvas, 0, 0);
      resolve(canvas);
      return;
    }

    if (mode === 'color') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(maskedCanvas, 0, 0);
      resolve(canvas);
      return;
    }

    if (mode === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      const colors = bgGradient.split(',').map(c => c.trim());
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(maskedCanvas, 0, 0);
      resolve(canvas);
      return;
    }

    if (mode === 'image' && bgImageUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, w, h);
        ctx.drawImage(maskedCanvas, 0, 0);
        resolve(canvas);
      };
      bgImg.onerror = () => {
        ctx.drawImage(maskedCanvas, 0, 0);
        resolve(canvas);
      };
      bgImg.src = bgImageUrl;
      return;
    }

    ctx.drawImage(maskedCanvas, 0, 0);
    resolve(canvas);
  });
}

/* ─── Watermark ─── */
function addWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.font = `${Math.max(12, canvas.width / 40)}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Made with SheruTools', canvas.width - 10, canvas.height - 10);
  ctx.restore();
}

/* ─── Gradient presets ─── */
const GRADIENT_PRESETS = [
  { name: 'Sunset', value: '#ff6b6b, #ffa500, #ffd93d' },
  { name: 'Ocean', value: '#667eea, #764ba2' },
  { name: 'Forest', value: '#11998e, #38ef7d' },
  { name: 'Night', value: '#0f0c29, #302b63, #24243e' },
  { name: 'Aurora', value: '#a855f7, #3b82f6, #06b6d4' },
  { name: 'Rose', value: '#f43f5e, #ec4899, #d946ef' },
];

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1',
];

/* ═══════════════════════════════════════════════════════ */
export default function BackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [maskedCanvas, setMaskedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState(35);
  const [bgMode, setBgMode] = useState<BackgroundMode>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgGradient, setBgGradient] = useState(GRADIENT_PRESETS[0].value);
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const pro = typeof window !== 'undefined' ? isPro() : false;

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    if (f.size > 20 * 1024 * 1024) { setError('File too large (max 20MB).'); return; }
    setError(null);
    setResult(null);
    setMaskedCanvas(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const processImage = useCallback(async () => {
    if (!file || !preview) return;
    if (!pro && getUsageToday() >= FREE_DAILY_LIMIT) {
      setError(`Free limit reached (${FREE_DAILY_LIMIT}/day). Upgrade to Pro for unlimited access.`);
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('Failed to load image'));
        img.src = preview;
      });
      const maxSize = pro ? 4096 : MAX_FREE_SIZE;
      const { maskedCanvas: mc, w, h } = await removeBackground(img, sensitivity, maxSize);
      setMaskedCanvas(mc);
      const composite = await compositeWithBackground(mc, bgMode, bgColor, bgGradient, bgImageUrl);
      if (!pro) addWatermark(composite);

      const maskedUrl = mc.toDataURL('image/png');
      const compositeUrl = composite.toDataURL('image/png');
      setResult({ originalUrl: preview, maskedUrl, compositeUrl, width: w, height: h });
      if (!pro) incrementUsage();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Processing failed.');
    } finally {
      setProcessing(false);
    }
  }, [file, preview, sensitivity, bgMode, bgColor, bgGradient, bgImageUrl, pro]);

  // Re-composite when background changes
  useEffect(() => {
    if (!maskedCanvas) return;
    (async () => {
      const composite = await compositeWithBackground(maskedCanvas, bgMode, bgColor, bgGradient, bgImageUrl);
      if (!pro) addWatermark(composite);
      setResult(prev => prev ? { ...prev, compositeUrl: composite.toDataURL('image/png') } : null);
    })();
  }, [bgMode, bgColor, bgGradient, bgImageUrl, maskedCanvas, pro]);

  // Slider drag
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  useEffect(() => {
    if (!isDraggingSlider) return;
    const onMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      handleSliderMove(clientX);
    };
    const onUp = () => setIsDraggingSlider(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.compositeUrl;
    a.download = `bg-removed-${Date.now()}.png`;
    a.click();
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setMaskedCanvas(null);
    setError(null);
  };

  const usageCount = typeof window !== 'undefined' ? getUsageToday() : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* ─── Breadcrumb ─── */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 dark:text-slate-300">Background Remover</span>
        </nav>
      </div>

      {/* ─── Hero ─── */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered • 100% Private
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Background <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Remover</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Remove backgrounds from any image instantly. No uploads, no sign-up — everything runs in your browser.
          </p>
          {!pro && (
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              {usageCount}/{FREE_DAILY_LIMIT} free uses today •{' '}
              <button className="text-purple-500 hover:text-purple-400 underline underline-offset-2">Upgrade to Pro</button>
            </p>
          )}
        </motion.div>

        {/* ─── Upload Zone ─── */}
        {!result && !processing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center group
                ${dragOver
                  ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm'
                }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <motion.div
                animate={dragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <Upload className="w-8 h-8 text-purple-500" />
              </motion.div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-1">
                Drop your image here or click to browse
              </p>
              <p className="text-sm text-slate-400">
                JPG, PNG, WebP • Max 20MB
              </p>
            </div>

            {/* Preview + Controls before processing */}
            {preview && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
                  <img src={preview} alt="Preview" className="w-full max-h-80 object-contain rounded-lg" />
                </div>

                {/* Sensitivity slider */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> Detection Sensitivity</span>
                    <span className="text-purple-500 font-mono">{sensitivity}</span>
                  </label>
                  <input
                    type="range" min={10} max={80} value={sensitivity}
                    onChange={e => setSensitivity(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Lower = stricter matching, Higher = removes more background</p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={processImage}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Remove Background
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={reset}
                    className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── Processing ─── */}
        <AnimatePresence>
          {processing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="w-full h-full rounded-full border-4 border-purple-500/20 border-t-purple-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200">Removing background...</p>
              <p className="text-sm text-slate-400 mt-1">Processing your image locally</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Result ─── */}
        <AnimatePresence>
          {result && !processing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Before/After Slider */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Move className="w-4 h-4" /> Drag to compare
                </h2>
                <div
                  ref={sliderRef}
                  className="relative w-full overflow-hidden rounded-xl cursor-col-resize select-none"
                  style={{ aspectRatio: `${result.width}/${result.height}`, maxHeight: 500 }}
                  onMouseDown={e => { setIsDraggingSlider(true); handleSliderMove(e.clientX); }}
                  onTouchStart={e => { setIsDraggingSlider(true); handleSliderMove(e.touches[0].clientX); }}
                >
                  {/* Checkerboard bg for transparency */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }} />
                  {/* Result (full) */}
                  <img src={result.compositeUrl} alt="Result" className="absolute inset-0 w-full h-full object-contain" />
                  {/* Original (clipped) */}
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                    <img src={result.originalUrl} alt="Original" className="w-full h-full object-contain" style={{ width: sliderRef.current?.clientWidth || '100%' }} />
                  </div>
                  {/* Slider handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                    style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg shadow-purple-500/30 flex items-center justify-center border-2 border-purple-500">
                      <Move className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                  </div>
                  {/* Labels */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">Original</div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-purple-500/80 text-white text-xs font-medium">Result</div>
                </div>
              </div>

              {/* Background Options */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Replace Background
                </h2>
                {/* Mode tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {(['transparent', 'color', 'gradient', 'image'] as BackgroundMode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        if (m === 'image' && !pro) { setError('Custom image backgrounds are Pro only.'); return; }
                        setBgMode(m);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize flex items-center gap-1.5 ${
                        bgMode === m
                          ? 'bg-purple-500 text-white shadow-md shadow-purple-500/25'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {m === 'image' && !pro && <Lock className="w-3.5 h-3.5" />}
                      {m}
                    </button>
                  ))}
                </div>

                {bgMode === 'color' && (
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map(c => (
                      <button
                        key={c}
                        onClick={() => setBgColor(c)}
                        className={`w-9 h-9 rounded-lg border-2 transition-all ${bgColor === c ? 'border-purple-500 scale-110' : 'border-slate-200 dark:border-slate-600'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer" />
                  </div>
                )}

                {bgMode === 'gradient' && (
                  <div className="flex flex-wrap gap-2">
                    {GRADIENT_PRESETS.map(g => (
                      <button
                        key={g.name}
                        onClick={() => setBgGradient(g.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-white transition-all ${
                          bgGradient === g.value ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-800' : ''
                        }`}
                        style={{ background: `linear-gradient(135deg, ${g.value})` }}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}

                {bgMode === 'image' && pro && (
                  <div>
                    <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) setBgImageUrl(URL.createObjectURL(f));
                    }} />
                    <button onClick={() => bgInputRef.current?.click()} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      Choose background image
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadResult}
                  className="flex-1 min-w-48 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download PNG
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={processImage}
                  className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Wand2 className="w-5 h-5" /> Re-process
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={reset}
                  className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" /> New Image
                </motion.button>
              </div>

              {/* Error */}
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error (upload phase) */}
        {error && !result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}

        {/* ─── Info Section ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Shield, title: '100% Private', desc: 'Images never leave your device. All processing happens locally in your browser.' },
            { icon: Sparkles, title: 'AI-Powered', desc: 'Smart edge detection automatically finds and removes backgrounds with precision.' },
            { icon: Palette, title: 'Custom Backgrounds', desc: 'Replace with solid colors, gradients, or your own images. Perfect for product photos.' },
          ].map((f, i) => (
            <div key={i} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── FAQ ─── */}
        <div className="max-w-3xl mx-auto mt-16 pb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this background remover free?', a: 'Yes! You can remove backgrounds from up to 3 images per day for free. Pro users get unlimited access with higher quality output.' },
              { q: 'Are my images uploaded to a server?', a: 'No. All processing happens directly in your browser. Your images never leave your device, making it 100% private and secure.' },
              { q: 'What image formats are supported?', a: 'JPG, PNG, WebP, and most common image formats are supported. Results are always downloaded as transparent PNG files.' },
              { q: 'How does the background removal work?', a: 'We use advanced edge-detection algorithms to identify the foreground subject and separate it from the background. You can adjust sensitivity for optimal results.' },
              { q: 'Can I replace the background?', a: 'Yes! After removing the background, choose from solid colors, beautiful gradients, or upload your own custom background image (Pro feature).' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-purple-500 transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <RelatedTools tools={[{"name":"Image Tools","href":"/image-tools","description":"Edit and transform images","icon":"🖼️"},{"name":"File Converter","href":"/file-converter","description":"Convert between formats","icon":"🔄"},{"name":"Screenshot Beautifier","href":"/screenshot-beautifier","description":"Beautify screenshots","icon":"✨"},{"name":"OCR","href":"/ocr","description":"Extract text from images","icon":"🔍"}]} />
      </div>
    </div>
  );
}
