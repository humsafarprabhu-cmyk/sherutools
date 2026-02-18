'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, Trash2, ChevronRight, Home, ArrowRight, Check,
  Loader2, Image as ImageIcon, Sparkles, Zap, Lock, AlertCircle,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';

/* ───── Types ───── */
type OutputFormat = 'png' | 'jpg' | 'webp' | 'bmp' | 'gif' | 'ico';

interface ConvertFile {
  id: string;
  file: File;
  name: string;
  size: number;
  preview: string;
  detectedFormat: string;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  processing: boolean;
  done: boolean;
  error?: string;
}

/* ───── Constants ───── */
const FORMATS: { label: string; value: OutputFormat; mime: string }[] = [
  { label: 'PNG', value: 'png', mime: 'image/png' },
  { label: 'JPG', value: 'jpg', mime: 'image/jpeg' },
  { label: 'WebP', value: 'webp', mime: 'image/webp' },
  { label: 'BMP', value: 'bmp', mime: 'image/bmp' },
  { label: 'GIF', value: 'gif', mime: 'image/gif' },
  { label: 'ICO', value: 'ico', mime: 'image/x-icon' },
];

const FREE_LIMIT = 3;
const FREE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const PRO_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const STORAGE_KEY = 'sherutools_converter_usage';
const LEMON_SQUEEZY_URL = 'https://sherutools.lemonsqueezy.com/buy/file-converter-pro';

/* ───── Helpers ───── */
function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

function detectFormat(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    'image/png': 'PNG', 'image/jpeg': 'JPG', 'image/webp': 'WebP',
    'image/bmp': 'BMP', 'image/gif': 'GIF', 'image/avif': 'AVIF',
    'image/heic': 'HEIC', 'image/heif': 'HEIC', 'image/x-icon': 'ICO',
    'image/vnd.microsoft.icon': 'ICO',
  };
  if (typeMap[file.type]) return typeMap[file.type];
  const extMap: Record<string, string> = {
    png: 'PNG', jpg: 'JPG', jpeg: 'JPG', webp: 'WebP', bmp: 'BMP',
    gif: 'GIF', avif: 'AVIF', heic: 'HEIC', heif: 'HEIC', ico: 'ICO',
  };
  return extMap[ext] || 'Unknown';
}

function getUsageToday(): number {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

function incrementUsage() {
  const today = new Date().toISOString().slice(0, 10);
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  if (data.date !== today) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 1 }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: (data.count || 0) + 1 }));
  }
}

function isPro(): boolean {
  try { return localStorage.getItem('sherutools_converter_pro') === 'true'; } catch { return false; }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('Conversion failed')),
      mime,
      quality
    );
  });
}

async function convertToIco(img: HTMLImageElement): Promise<Blob> {
  // ICO: render at 64x64
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);

  // Build ICO file manually
  const headerSize = 6;
  const dirEntrySize = 16;
  const bmpHeaderSize = 40;
  const pixelDataSize = size * size * 4;
  const totalSize = headerSize + dirEntrySize + bmpHeaderSize + pixelDataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICONDIR
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, 1, true); // count

  // ICONDIRENTRY
  view.setUint8(6, size);
  view.setUint8(7, size);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, 1, true); // color planes
  view.setUint16(12, 32, true); // bits per pixel
  view.setUint32(14, bmpHeaderSize + pixelDataSize, true); // size
  view.setUint32(18, headerSize + dirEntrySize, true); // offset

  // BITMAPINFOHEADER
  const bmpOffset = headerSize + dirEntrySize;
  view.setUint32(bmpOffset, bmpHeaderSize, true);
  view.setInt32(bmpOffset + 4, size, true);
  view.setInt32(bmpOffset + 8, size * 2, true); // height * 2 for ICO
  view.setUint16(bmpOffset + 12, 1, true);
  view.setUint16(bmpOffset + 14, 32, true);
  view.setUint32(bmpOffset + 20, pixelDataSize, true);

  // Pixel data (bottom-up, BGRA)
  const pixelOffset = bmpOffset + bmpHeaderSize;
  const pixels = imageData.data;
  for (let y = size - 1; y >= 0; y--) {
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4;
      const dst = pixelOffset + ((size - 1 - y) * size + x) * 4;
      view.setUint8(dst, pixels[src + 2]); // B
      view.setUint8(dst + 1, pixels[src + 1]); // G
      view.setUint8(dst + 2, pixels[src]); // R
      view.setUint8(dst + 3, pixels[src + 3]); // A
    }
  }

  return new Blob([buffer], { type: 'image/x-icon' });
}

/* ───── Conversion Pairs for Internal Links ───── */
export const CONVERSION_PAIRS = [
  'webp-to-png', 'webp-to-jpg', 'heic-to-jpg', 'heic-to-png', 'png-to-jpg', 'jpg-to-png',
  'png-to-webp', 'jpg-to-webp', 'avif-to-png', 'avif-to-jpg', 'png-to-avif', 'jpg-to-avif',
  'bmp-to-jpg', 'bmp-to-png', 'gif-to-png', 'gif-to-jpg', 'png-to-ico', 'jpg-to-ico',
  'png-to-bmp', 'jpg-to-bmp', 'webp-to-avif', 'avif-to-webp', 'heic-to-webp',
  'png-to-gif', 'jpg-to-gif',
];

/* ───── Component ───── */
interface FileConverterAppProps {
  presetFrom?: string;
  presetTo?: string;
}

export default function FileConverterApp({ presetFrom, presetTo }: FileConverterAppProps) {
  const [files, setFiles] = useState<ConvertFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    (presetTo?.toLowerCase() as OutputFormat) || 'png'
  );
  const [quality, setQuality] = useState(85);
  const [dragOver, setDragOver] = useState(false);
  const [converting, setConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [proUser, setProUser] = useState(false);

  useEffect(() => {
    setUsageCount(getUsageToday());
    setProUser(isPro());
  }, []);

  const maxFiles = proUser ? 50 : FREE_LIMIT;
  const maxSize = proUser ? PRO_MAX_SIZE : FREE_MAX_SIZE;
  const canConvert = !converting && files.length > 0 && (proUser || usageCount < FREE_LIMIT);

  const addFiles = useCallback(async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList).filter(f => f.type.startsWith('image/') || /\.(heic|heif|avif)$/i.test(f.name));
    const toAdd = arr.slice(0, maxFiles - files.length);

    const newFiles: ConvertFile[] = [];
    for (const file of toAdd) {
      if (file.size > maxSize) continue;
      const preview = URL.createObjectURL(file);
      newFiles.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        preview,
        detectedFormat: detectFormat(file),
        processing: false,
        done: false,
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, maxSize]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      if (f?.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
      return prev.filter(x => x.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
      if (f.convertedUrl) URL.revokeObjectURL(f.convertedUrl);
    });
    setFiles([]);
  };

  const convertAll = async () => {
    if (!canConvert) return;
    setConverting(true);
    const fmt = FORMATS.find(f => f.value === outputFormat)!;

    for (let i = 0; i < files.length; i++) {
      if (!proUser && usageCount + i >= FREE_LIMIT) break;

      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, processing: true } : f));

      try {
        const img = await loadImage(files[i].file);
        let blob: Blob;

        if (outputFormat === 'ico') {
          blob = await convertToIco(img);
        } else {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);

          const q = ['jpg', 'webp'].includes(outputFormat) ? quality / 100 : undefined;
          blob = await canvasToBlob(canvas, fmt.mime, q);
        }

        const url = URL.createObjectURL(blob);
        incrementUsage();
        setUsageCount(getUsageToday());

        setFiles(prev => prev.map((f, idx) => idx === i ? {
          ...f, processing: false, done: true,
          convertedBlob: blob, convertedUrl: url, convertedSize: blob.size,
        } : f));
      } catch (err) {
        setFiles(prev => prev.map((f, idx) => idx === i ? {
          ...f, processing: false, error: (err as Error).message || 'Conversion failed',
        } : f));
      }
    }
    setConverting(false);
  };

  const downloadFile = (f: ConvertFile) => {
    if (!f.convertedUrl) return;
    const a = document.createElement('a');
    a.href = f.convertedUrl;
    const baseName = f.name.replace(/\.[^.]+$/, '');
    a.download = `${baseName}.${outputFormat}`;
    a.click();
  };

  const downloadAll = () => {
    files.filter(f => f.done && f.convertedUrl).forEach(f => downloadFile(f));
  };

  const isLossy = outputFormat === 'jpg' || outputFormat === 'webp';

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {presetFrom && presetTo ? (
          <>
            <Link href="/file-converter" className="hover:text-blue-500 transition-colors">File Converter</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 dark:text-white font-medium">{presetFrom.toUpperCase()} to {presetTo.toUpperCase()}</span>
          </>
        ) : (
          <span className="text-slate-900 dark:text-white font-medium">File Converter</span>
        )}
      </nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-500 dark:text-purple-400 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <Zap className="w-4 h-4" /> 100% Client-Side — Your Files Never Leave Your Device
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
          {presetFrom && presetTo
            ? <>Convert <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">{presetFrom.toUpperCase()}</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">{presetTo.toUpperCase()}</span> — Free, Instant, No Upload</>
            : <>Universal <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">File Converter</span></>
          }
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Convert images between PNG, JPG, WebP, BMP, GIF, and ICO instantly. No server uploads, no watermarks, completely free.
        </p>
      </motion.div>

      {/* Usage indicator for free users */}
      {!proUser && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-500 dark:text-slate-400">Free conversions today: {usageCount}/{FREE_LIMIT}</span>
            <button
              onClick={() => window.open(LEMON_SQUEEZY_URL, '_blank')}
              className="text-purple-500 hover:text-purple-400 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> Upgrade to Pro — $4.99
            </button>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all" style={{ width: `${(usageCount / FREE_LIMIT) * 100}%` }} />
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        {/* Left: Upload + Results */}
        <div className="space-y-6">
          {/* Drop Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-10 text-center group ${
              dragOver
                ? 'border-purple-500 bg-purple-500/5 scale-[1.02]'
                : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 bg-white/50 dark:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif,.avif"
              multiple
              className="hidden"
              onChange={e => e.target.files && addFiles(e.target.files)}
            />
            <motion.div
              animate={dragOver ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-4"
            >
              <Upload className="w-7 h-7 text-purple-500" />
            </motion.div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Drop images here or click to browse
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              PNG, JPG, WebP, BMP, GIF, ICO • Max {proUser ? '50MB' : '5MB'} per file
            </p>
          </motion.div>

          {/* File List */}
          <AnimatePresence mode="popLayout">
            {files.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50"
              >
                {/* Preview */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{f.name}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-medium">{f.detectedFormat}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-medium">{outputFormat.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatBytes(f.size)}</span>
                    {f.done && f.convertedSize && (
                      <>
                        <span>→</span>
                        <span className="text-green-500 font-medium">{formatBytes(f.convertedSize)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {f.processing && <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />}
                  {f.done && !f.error && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => downloadFile(f)}
                      className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                  )}
                  {f.error && (
                    <span className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {f.error}</span>
                  )}
                  <button onClick={() => removeFile(f.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Actions */}
          {files.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3">
              <button
                onClick={convertAll}
                disabled={!canConvert}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Convert {files.filter(f => !f.done).length} File{files.filter(f => !f.done).length !== 1 ? 's' : ''}
              </button>

              {files.some(f => f.done) && (
                <button onClick={downloadAll} className="px-6 py-3 rounded-xl bg-green-500/10 text-green-500 font-semibold hover:bg-green-500/20 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download All
                </button>
              )}

              <button onClick={clearAll} className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Clear All
              </button>
            </motion.div>
          )}
        </div>

        {/* Right: Settings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Output Format */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-500" /> Output Format
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map(fmt => (
                <button
                  key={fmt.value}
                  onClick={() => setOutputFormat(fmt.value)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    outputFormat === fmt.value
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider */}
          {isLossy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quality</h3>
                <span className="text-sm font-mono text-purple-500">{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Smaller</span>
                <span>Better</span>
              </div>
            </motion.div>
          )}

          {/* Pro Upgrade Card */}
          {!proUser && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Unlock Pro</h3>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-3">
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500" /> Unlimited conversions</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500" /> 50MB file size</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500" /> Batch conversion</li>
                <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-500" /> No watermark</li>
              </ul>
              <button
                onClick={() => window.open(LEMON_SQUEEZY_URL, '_blank')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
              >
                Get Pro — $4.99 One-time
              </button>
            </div>
          )}

          {/* Popular Conversions */}
          <div className="p-5 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Popular Conversions</h3>
            <div className="flex flex-wrap gap-1.5">
              {['png-to-jpg', 'jpg-to-png', 'webp-to-png', 'heic-to-jpg', 'png-to-webp', 'avif-to-jpg', 'png-to-ico', 'gif-to-png'].map(pair => (
                <Link
                  key={pair}
                  href={`/convert/${pair}`}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {pair.replace(/-/g, ' ').replace('to', '→')}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
