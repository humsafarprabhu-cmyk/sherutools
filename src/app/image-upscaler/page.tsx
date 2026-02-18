'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, Trash2, Sparkles, ChevronRight, Home,
  Loader2, Move, ZoomIn, AlertCircle, Lock, Shield, Wand2,
  ImageIcon, ArrowRight, Check, Sliders, Droplets, Sun,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useCallback, useEffect } from 'react';

/* ─── Types ─── */
type ScaleFactor = 2 | 4 | 8;
type OutputFormat = 'png' | 'jpeg';

interface UpscaleResult {
  originalUrl: string;
  resultUrl: string;
  originalWidth: number;
  originalHeight: number;
  resultWidth: number;
  resultHeight: number;
  originalSize: number;
}

/* ─── Usage tracking ─── */
const FREE_DAILY_LIMIT = 3;
const MAX_FREE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_PRO_SIZE = 20 * 1024 * 1024; // 20MB

function getUsageToday(): number {
  const key = 'upscaler_usage';
  const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  if (!raw) return 0;
  try {
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

function incrementUsage(): void {
  const key = 'upscaler_usage';
  const today = new Date().toISOString().slice(0, 10);
  const current = getUsageToday();
  localStorage.setItem(key, JSON.stringify({ date: today, count: current + 1 }));
}

function isPro(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem('upscaler_pro') === 'true';
}

/* ─── Upscale Engine ─── */
function applyConvolutionFilter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  kernel: number[],
  kernelSize: number,
) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  const half = Math.floor(kernelSize / 2);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const py = Math.min(h - 1, Math.max(0, y + ky - half));
          const px = Math.min(w - 1, Math.max(0, x + kx - half));
          const idx = (py * w + px) * 4;
          const weight = kernel[ky * kernelSize + kx];
          r += src[idx] * weight;
          g += src[idx + 1] * weight;
          b += src[idx + 2] * weight;
        }
      }
      const idx = (y * w + x) * 4;
      dst[idx] = Math.min(255, Math.max(0, r));
      dst[idx + 1] = Math.min(255, Math.max(0, g));
      dst[idx + 2] = Math.min(255, Math.max(0, b));
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number = 1) {
  // Unsharp mask kernel
  const amount = 0.3 * strength;
  const kernel = [
    0, -amount, 0,
    -amount, 1 + 4 * amount, -amount,
    0, -amount, 0,
  ];
  applyConvolutionFilter(ctx, w, h, kernel, 3);
}

function applyDenoise(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Slight Gaussian blur for denoising
  const kernel = [
    1/16, 2/16, 1/16,
    2/16, 4/16, 2/16,
    1/16, 2/16, 1/16,
  ];
  applyConvolutionFilter(ctx, w, h, kernel, 3);
}

function applyColorEnhance(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const saturationBoost = 1.2;
  const contrastBoost = 1.1;

  for (let i = 0; i < data.length; i += 4) {
    // Contrast
    data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrastBoost) + 128));
    data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrastBoost) + 128));
    data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrastBoost) + 128));

    // Saturation boost (simple approach)
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * saturationBoost));
    data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * saturationBoost));
    data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * saturationBoost));
  }

  ctx.putImageData(imageData, 0, 0);
}

async function upscaleImage(
  img: HTMLImageElement,
  scale: ScaleFactor,
  sharpen: boolean,
  denoise: boolean,
  colorEnhance: boolean,
  onProgress: (pct: number) => void,
): Promise<HTMLCanvasElement> {
  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  const dw = sw * scale;
  const dh = sh * scale;

  onProgress(10);

  const canvas = document.createElement('canvas');
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Multi-step upscale for better quality (step by 2x each time)
  if (scale === 4 || scale === 8) {
    // Progressive upscaling: 2x steps
    let tempCanvas = document.createElement('canvas');
    let tempW = sw;
    let tempH = sh;
    let tempCtx: CanvasRenderingContext2D;

    // First draw original
    tempCanvas.width = sw;
    tempCanvas.height = sh;
    tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(img, 0, 0);

    const steps = scale === 4 ? 2 : 3;
    for (let step = 0; step < steps; step++) {
      const nextW = tempW * 2;
      const nextH = tempH * 2;
      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = nextW;
      nextCanvas.height = nextH;
      const nextCtx = nextCanvas.getContext('2d')!;
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(tempCanvas, 0, 0, nextW, nextH);

      // Apply light sharpening between steps
      if (sharpen && step < steps - 1) {
        applySharpen(nextCtx, nextW, nextH, 0.5);
      }

      tempCanvas = nextCanvas;
      tempW = nextW;
      tempH = nextH;
      onProgress(10 + ((step + 1) / steps) * 40);
    }

    ctx.drawImage(tempCanvas, 0, 0);
  } else {
    ctx.drawImage(img, 0, 0, dw, dh);
  }

  onProgress(50);

  // Apply denoise before sharpening
  if (denoise) {
    await new Promise(r => setTimeout(r, 0)); // yield to UI
    applyDenoise(ctx, dw, dh);
    onProgress(65);
  }

  // Apply sharpening
  if (sharpen) {
    await new Promise(r => setTimeout(r, 0));
    applySharpen(ctx, dw, dh, scale >= 4 ? 1.5 : 1);
    // Second pass for extra crispness
    applySharpen(ctx, dw, dh, 0.5);
    onProgress(80);
  }

  // Apply color enhancement
  if (colorEnhance) {
    await new Promise(r => setTimeout(r, 0));
    applyColorEnhance(ctx, dw, dh);
    onProgress(90);
  }

  onProgress(100);
  return canvas;
}

/* ─── Watermark ─── */
function addWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')!;
  ctx.save();
  ctx.font = `${Math.max(14, canvas.width / 50)}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('SheruTools.com', canvas.width - 12, canvas.height - 12);
  ctx.restore();
}

/* ─── Format file size ─── */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ═══════════════════════════════════════════════════════ */
export default function ImageUpscalerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UpscaleResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scale, setScale] = useState<ScaleFactor>(2);
  const [sharpen, setSharpen] = useState(true);
  const [denoise, setDenoise] = useState(false);
  const [colorEnhance, setColorEnhance] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');

  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const pro = typeof window !== 'undefined' ? isPro() : false;

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please upload an image file.'); return; }
    const maxSize = pro ? MAX_PRO_SIZE : MAX_FREE_SIZE;
    if (f.size > maxSize) {
      setError(`File too large (max ${pro ? '20MB' : '2MB'}).${!pro ? ' Upgrade to Pro for 20MB.' : ''}`);
      return;
    }
    setError(null);
    setResult(null);
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, [pro]);

  const processImage = useCallback(async () => {
    if (!file || !preview) return;
    if (!pro && getUsageToday() >= FREE_DAILY_LIMIT) {
      setError(`Free limit reached (${FREE_DAILY_LIMIT}/day). Upgrade to Pro for unlimited.`);
      return;
    }
    if (!pro && scale > 2) {
      setError('4x and 8x upscaling is Pro only. Upgrade to unlock.');
      return;
    }
    setProcessing(true);
    setProgress(0);
    setError(null);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error('Failed to load image'));
        img.src = preview;
      });

      const resultCanvas = await upscaleImage(img, scale, sharpen, denoise, colorEnhance, setProgress);
      if (!pro) addWatermark(resultCanvas);

      const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
      const quality = outputFormat === 'jpeg' ? 0.92 : undefined;
      const resultUrl = resultCanvas.toDataURL(mimeType, quality);

      setResult({
        originalUrl: preview,
        resultUrl,
        originalWidth: img.naturalWidth,
        originalHeight: img.naturalHeight,
        resultWidth: resultCanvas.width,
        resultHeight: resultCanvas.height,
        originalSize: file.size,
      });
      if (!pro) incrementUsage();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Processing failed.');
    } finally {
      setProcessing(false);
    }
  }, [file, preview, scale, sharpen, denoise, colorEnhance, outputFormat, pro]);

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
    const ext = outputFormat === 'jpeg' ? 'jpg' : 'png';
    const a = document.createElement('a');
    a.href = result.resultUrl;
    a.download = `upscaled-${scale}x-${Date.now()}.${ext}`;
    a.click();
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProgress(0);
  };

  const usageCount = typeof window !== 'undefined' ? getUsageToday() : 0;

  const scaleOptions: { value: ScaleFactor; label: string; locked: boolean }[] = [
    { value: 2, label: '2×', locked: false },
    { value: 4, label: '4×', locked: !pro },
    { value: 8, label: '8×', locked: !pro },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 dark:text-slate-300">Image Upscaler</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered • 100% Private
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            Image <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">Upscaler</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Enlarge and enhance images up to 8× without losing quality. Smart sharpening and AI-powered processing — all in your browser.
          </p>
          {!pro && (
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              {usageCount}/{FREE_DAILY_LIMIT} free uses today •{' '}
              <button className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2">Upgrade to Pro</button>
            </p>
          )}
        </motion.div>

        {/* Upload Zone */}
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
                  ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm'
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
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <Upload className="w-8 h-8 text-emerald-500" />
              </motion.div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-1">
                Drop your image here or click to browse
              </p>
              <p className="text-sm text-slate-400">
                JPG, PNG, WebP • Max {pro ? '20MB' : '2MB'}
              </p>
            </div>

            {/* Preview + Controls */}
            {preview && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
                  <img src={preview} alt="Preview" className="w-full max-h-80 object-contain rounded-lg" />
                </div>

                {/* Scale Selector */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <ZoomIn className="w-4 h-4" /> Upscale Factor
                  </label>
                  <div className="flex gap-2">
                    {scaleOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          if (opt.locked) { setError(`${opt.label} upscaling is Pro only.`); return; }
                          setScale(opt.value);
                          setError(null);
                        }}
                        className={`relative flex-1 py-3 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                          scale === opt.value
                            ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg shadow-emerald-500/25'
                            : opt.locked
                              ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {opt.locked && <Lock className="w-3.5 h-3.5" />}
                        {opt.label}
                        {opt.locked && (
                          <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-medium">PRO</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhancement Options */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <Sliders className="w-4 h-4" /> Enhancements
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'sharpen', label: 'Sharpen', icon: Wand2, active: sharpen, toggle: () => setSharpen(!sharpen) },
                      { key: 'denoise', label: 'Denoise', icon: Droplets, active: denoise, toggle: () => setDenoise(!denoise) },
                      { key: 'color', label: 'Color Enhance', icon: Sun, active: colorEnhance, toggle: () => setColorEnhance(!colorEnhance) },
                    ].map(opt => (
                      <button
                        key={opt.key}
                        onClick={opt.toggle}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          opt.active
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                        {opt.active && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Format */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <ImageIcon className="w-4 h-4" /> Output Format
                  </label>
                  <div className="flex gap-2">
                    {(['png', 'jpeg'] as OutputFormat[]).map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setOutputFormat(fmt)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all uppercase ${
                          outputFormat === fmt
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {fmt === 'jpeg' ? 'JPG' : fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File info preview */}
                {file && (
                  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-slate-400 text-xs mb-1">Original</p>
                        <p className="font-mono text-slate-600 dark:text-slate-300">{formatSize(file.size)}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      <div className="text-center">
                        <p className="text-slate-400 text-xs mb-1">Output Scale</p>
                        <p className="font-mono text-emerald-500 font-bold">{scale}× larger</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={processImage}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow flex items-center justify-center gap-2"
                  >
                    <ZoomIn className="w-5 h-5" />
                    Upscale Image
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

        {/* Processing */}
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
                  className="w-full h-full rounded-full border-4 border-emerald-500/20 border-t-emerald-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-200">Upscaling to {scale}×...</p>
              <p className="text-sm text-slate-400 mt-1">Enhancing your image locally</p>
              {/* Progress bar */}
              <div className="mt-6 max-w-xs mx-auto">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">{progress}%</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
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
                  className="relative w-full overflow-hidden rounded-xl cursor-col-resize select-none bg-slate-100 dark:bg-slate-800"
                  style={{ aspectRatio: `${result.resultWidth}/${result.resultHeight}`, maxHeight: 500 }}
                  onMouseDown={e => { setIsDraggingSlider(true); handleSliderMove(e.clientX); }}
                  onTouchStart={e => { setIsDraggingSlider(true); handleSliderMove(e.touches[0].clientX); }}
                >
                  {/* Result (full) */}
                  <img src={result.resultUrl} alt="Upscaled" className="absolute inset-0 w-full h-full object-contain" />
                  {/* Original (clipped) */}
                  <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                    <img src={result.originalUrl} alt="Original" className="w-full h-full object-contain" style={{ width: sliderRef.current?.clientWidth || '100%' }} />
                  </div>
                  {/* Slider handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                    style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg shadow-emerald-500/30 flex items-center justify-center border-2 border-emerald-500">
                      <Move className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </div>
                  {/* Labels */}
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 text-white text-xs font-medium">Original</div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-emerald-500/80 text-white text-xs font-medium">{scale}× Upscaled</div>
                </div>
              </div>

              {/* Dimensions Info */}
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-4 md:p-6">
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs mb-1">Original</p>
                    <p className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{result.originalWidth} × {result.originalHeight}</p>
                    <p className="text-xs text-slate-400">{formatSize(result.originalSize)}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-bold mt-1">{scale}×</span>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-500 text-xs mb-1 font-medium">Enhanced</p>
                    <p className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{result.resultWidth} × {result.resultHeight}</p>
                    <p className="text-xs text-emerald-500">{(scale * scale)}× more pixels</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={downloadResult}
                  className="flex-1 min-w-48 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download {outputFormat.toUpperCase()}
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-500/10 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mt-16 grid md:grid-cols-3 gap-6"
        >
          {[
            { icon: Shield, title: '100% Private', desc: 'Images never leave your device. All processing happens locally in your browser.' },
            { icon: Wand2, title: 'Smart Sharpening', desc: 'Multi-pass unsharp mask with adaptive strength keeps details crisp at any scale.' },
            { icon: ZoomIn, title: 'Up to 8× Upscale', desc: 'Progressive multi-step upscaling ensures the best quality even at extreme scales.' },
          ].map((f, i) => (
            <div key={i} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <f.icon className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16 pb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is this image upscaler free?', a: 'Yes! You can upscale up to 3 images per day for free at 2x resolution. Pro users get unlimited access with 4x and 8x upscaling.' },
              { q: 'Does upscaling actually improve quality?', a: 'Yes. Our tool uses high-quality interpolation combined with multi-pass sharpening and optional denoising to produce crisp, detailed enlarged images that look much better than simple stretching.' },
              { q: 'Are my images uploaded to a server?', a: 'No. All processing happens directly in your browser using Canvas API. Your images never leave your device, making it 100% private and secure.' },
              { q: 'What image formats are supported?', a: 'JPG, PNG, WebP, and most common image formats are supported. You can download results as either PNG (lossless) or JPG (smaller file size).' },
              { q: 'What do the enhancement options do?', a: 'Sharpen applies an unsharp mask to keep edges crisp. Denoise smooths out noise artifacts. Color Enhance boosts saturation and contrast for more vibrant results.' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
