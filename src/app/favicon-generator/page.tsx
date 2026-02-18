'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Download, Copy, Check, ChevronRight, Home, Crown, Sparkles,
  Type, Upload, Image as ImageIcon, Square, Circle, Palette,
  Bold, Minus, Plus, Sun, Info, X, Zap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════════════════ */

type Mode = 'text' | 'image';
type BgType = 'solid' | 'gradient-linear' | 'gradient-radial' | 'transparent';
type Shape = 'square' | 'rounded' | 'circle';
type FontFamily = 'Inter' | 'Geist' | 'monospace' | 'serif';

interface FaviconConfig {
  text: string;
  bgType: BgType;
  bgColor1: string;
  bgColor2: string;
  shape: Shape;
  fontFamily: FontFamily;
  fontSize: number;
  fontWeight: number;
  fontColor: string;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number;
  shadowEnabled: boolean;
  shadowColor: string;
}

const SIZES = [
  { name: 'favicon-16x16', size: 16, label: '16×16' },
  { name: 'favicon-32x32', size: 32, label: '32×32' },
  { name: 'favicon-48x48', size: 48, label: '48×48' },
  { name: 'apple-touch-icon', size: 180, label: '180×180' },
  { name: 'android-chrome-192x192', size: 192, label: '192×192' },
  { name: 'android-chrome-512x512', size: 512, label: '512×512' },
] as const;

const PRESETS = {
  Material: ['#F44336','#E91E63','#9C27B0','#673AB7','#3F51B5','#2196F3','#00BCD4','#009688','#4CAF50','#FF9800','#795548','#607D8B'],
  Tailwind: ['#EF4444','#F97316','#EAB308','#22C55E','#06B6D4','#3B82F6','#8B5CF6','#EC4899','#F43F5E','#14B8A6','#6366F1','#A855F7'],
  Pastel:   ['#FFB3BA','#FFDFBA','#FFFFBA','#BAFFC9','#BAE1FF','#E8BAFF','#FFC9DE','#C9FFE5','#C9D6FF','#FFE5C9','#D4BAFF','#BAFFF5'],
};

const DEFAULT_CONFIG: FaviconConfig = {
  text: 'A',
  bgType: 'gradient-linear',
  bgColor1: '#6366F1',
  bgColor2: '#EC4899',
  shape: 'rounded',
  fontFamily: 'Inter',
  fontSize: 65,
  fontWeight: 700,
  fontColor: '#FFFFFF',
  borderEnabled: false,
  borderColor: '#FFFFFF',
  borderWidth: 3,
  shadowEnabled: true,
  shadowColor: '#00000066',
};

const USAGE_KEY = 'sherutools_favicon_usage';
const FREE_LIMIT = 5;

/* ═══════════════════════════════════════════════════════════════
   Utility: render favicon to canvas
   ═══════════════════════════════════════════════════════════════ */

function renderFavicon(canvas: HTMLCanvasElement, config: FaviconConfig, size: number, uploadedImage?: HTMLImageElement | null) {
  const ctx = canvas.getContext('2d')!;
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  const r = config.shape === 'circle' ? size / 2 : config.shape === 'rounded' ? size * 0.18 : 0;

  // Clip shape
  ctx.beginPath();
  if (config.shape === 'circle') {
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  } else {
    ctx.roundRect(0, 0, size, size, r);
  }
  ctx.closePath();
  ctx.clip();

  // Background
  if (config.bgType === 'transparent') {
    // draw nothing
  } else if (config.bgType === 'solid') {
    ctx.fillStyle = config.bgColor1;
    ctx.fillRect(0, 0, size, size);
  } else if (config.bgType === 'gradient-linear') {
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, config.bgColor1);
    g.addColorStop(1, config.bgColor2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  } else {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, config.bgColor1);
    g.addColorStop(1, config.bgColor2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  if (uploadedImage) {
    // Draw uploaded image covering the canvas
    const iw = uploadedImage.naturalWidth, ih = uploadedImage.naturalHeight;
    const scale = Math.max(size / iw, size / ih);
    const sw = iw * scale, sh = ih * scale;
    ctx.drawImage(uploadedImage, (size - sw) / 2, (size - sh) / 2, sw, sh);
  } else {
    // Shadow
    if (config.shadowEnabled) {
      ctx.shadowColor = config.shadowColor;
      ctx.shadowBlur = size * 0.08;
      ctx.shadowOffsetY = size * 0.03;
    }

    // Text
    const fs = (config.fontSize / 100) * size;
    ctx.font = `${config.fontWeight} ${fs}px "${config.fontFamily}", sans-serif`;
    ctx.fillStyle = config.fontColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.text, size / 2, size / 2 + fs * 0.04);
    ctx.shadowColor = 'transparent';
  }

  // Border
  if (config.borderEnabled) {
    ctx.save();
    ctx.beginPath();
    const bw = (config.borderWidth / 100) * size;
    if (config.shape === 'circle') {
      ctx.arc(size / 2, size / 2, size / 2 - bw / 2, 0, Math.PI * 2);
    } else {
      ctx.roundRect(bw / 2, bw / 2, size - bw, size - bw, Math.max(0, r - bw / 2));
    }
    ctx.strokeStyle = config.borderColor;
    ctx.lineWidth = bw;
    ctx.stroke();
    ctx.restore();
  }
}

/* ═══════════════════════════════════════════════════════════════
   Usage tracking
   ═══════════════════════════════════════════════════════════════ */

function getUsage(): { count: number; date: string } {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { count: 0, date: new Date().toDateString() };
    const d = JSON.parse(raw);
    if (d.date !== new Date().toDateString()) return { count: 0, date: new Date().toDateString() };
    return d;
  } catch { return { count: 0, date: new Date().toDateString() }; }
}
function incrementUsage() {
  const u = getUsage();
  u.count++;
  u.date = new Date().toDateString();
  localStorage.setItem(USAGE_KEY, JSON.stringify(u));
}
function canUse(): boolean { return getUsage().count < FREE_LIMIT; }

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function FaviconGeneratorPage() {
  const [mode, setMode] = useState<Mode>('text');
  const [config, setConfig] = useState<FaviconConfig>(DEFAULT_CONFIG);
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('Material');
  const [showProModal, setShowProModal] = useState(false);
  const canvasRefs = useRef<Record<number, HTMLCanvasElement | null>>({});
  const previewCanvas = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const set = useCallback(<K extends keyof FaviconConfig>(k: K, v: FaviconConfig[K]) => {
    setConfig(prev => ({ ...prev, [k]: v }));
  }, []);

  // Render all previews
  useEffect(() => {
    SIZES.forEach(({ size }) => {
      const c = canvasRefs.current[size];
      if (c) renderFavicon(c, config, size, mode === 'image' ? uploadedImage : null);
    });
    // Also render a large 512 preview
    if (previewCanvas.current) {
      renderFavicon(previewCanvas.current, config, 512, mode === 'image' ? uploadedImage : null);
    }
  }, [config, uploadedImage, mode]);

  // Image upload handler
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadPreview(url);
    const img = new window.Image();
    img.onload = () => { setUploadedImage(img); setMode('image'); };
    img.src = url;
  }

  // Download single PNG
  async function downloadPng(size: number, name: string) {
    if (!canUse()) { setShowProModal(true); return; }
    const c = document.createElement('canvas');
    renderFavicon(c, config, size, mode === 'image' ? uploadedImage : null);
    const blob = await new Promise<Blob | null>(r => c.toBlob(r, 'image/png'));
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
    incrementUsage();
  }

  // Download all as individual files (free) or ZIP (pro)
  async function downloadAll() {
    if (!canUse()) { setShowProModal(true); return; }
    setDownloading(true);
    try {
      for (const { name, size } of SIZES) {
        const c = document.createElement('canvas');
        renderFavicon(c, config, size, mode === 'image' ? uploadedImage : null);
        const blob = await new Promise<Blob | null>(r => c.toBlob(r, 'image/png'));
        if (!blob) continue;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${name}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        await new Promise(r => setTimeout(r, 200));
      }
      incrementUsage();
    } finally { setDownloading(false); }
  }

  // HTML snippet
  const htmlSnippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

  function copySnippet() {
    navigator.clipboard.writeText(htmlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const remainingUses = FREE_LIMIT - getUsage().count;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1"><Home size={14} /> Home</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 dark:text-white font-medium">Favicon Generator</span>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:to-pink-500/20 px-4 py-1.5 rounded-full text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4">
            <Sparkles size={16} /> Client-side · No uploads · 100% Private
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
            Favicon Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Create beautiful favicons from text, emoji, or images. Download a complete favicon pack for your website.
          </p>
        </motion.div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">

          {/* ════ Left: Controls ════ */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="space-y-6">

            {/* Mode Toggle */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6">
              <div className="flex gap-2 mb-6">
                {[{ m: 'text' as Mode, icon: Type, label: 'Text / Emoji' }, { m: 'image' as Mode, icon: Upload, label: 'Upload Image' }].map(({ m, icon: Icon, label }) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${mode === m ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                    <Icon size={18} />{label}
                  </button>
                ))}
              </div>

              {mode === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Text / Emoji</label>
                  <input type="text" value={config.text} onChange={e => set('text', e.target.value.slice(0, 4))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-2xl text-center font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="A" maxLength={4} />
                  <p className="text-xs text-slate-500 mt-1">Up to 4 characters, or paste an emoji 🎨</p>
                </div>
              ) : (
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl flex flex-col items-center gap-3 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-slate-500 dark:text-slate-400 hover:text-indigo-500">
                    {uploadPreview ? (
                      <img src={uploadPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                    ) : (
                      <ImageIcon size={40} className="opacity-50" />
                    )}
                    <span className="font-medium">{uploadPreview ? 'Click to change image' : 'Click to upload image'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Style Options (text mode only) */}
            {mode === 'text' && (
              <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-5">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Palette size={18} /> Style Options</h3>

                {/* Shape */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Shape</label>
                  <div className="flex gap-2">
                    {([
                      { s: 'square' as Shape, icon: <div className="w-6 h-6 border-2 border-current" />, label: 'Square' },
                      { s: 'rounded' as Shape, icon: <div className="w-6 h-6 border-2 border-current rounded-md" />, label: 'Rounded' },
                      { s: 'circle' as Shape, icon: <div className="w-6 h-6 border-2 border-current rounded-full" />, label: 'Circle' },
                    ]).map(({ s, icon, label }) => (
                      <button key={s} onClick={() => set('shape', s)}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-all ${config.shape === s ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}>
                        {icon}{label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Background</label>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { t: 'solid' as BgType, label: 'Solid' },
                      { t: 'gradient-linear' as BgType, label: 'Linear' },
                      { t: 'gradient-radial' as BgType, label: 'Radial' },
                      { t: 'transparent' as BgType, label: 'None' },
                    ]).map(({ t, label }) => (
                      <button key={t} onClick={() => set('bgType', t)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${config.bgType === t ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                {config.bgType !== 'transparent' && (
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                          {config.bgType === 'solid' ? 'Background Color' : 'Color 1'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={config.bgColor1} onChange={e => set('bgColor1', e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                          <input type="text" value={config.bgColor1} onChange={e => set('bgColor1', e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white font-mono" />
                        </div>
                      </div>
                      {config.bgType !== 'solid' && (
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Color 2</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={config.bgColor2} onChange={e => set('bgColor2', e.target.value)}
                              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                            <input type="text" value={config.bgColor2} onChange={e => set('bgColor2', e.target.value)}
                              className="flex-1 px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white font-mono" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Preset palettes */}
                    <div>
                      <div className="flex gap-2 mb-2">
                        {Object.keys(PRESETS).map(name => (
                          <button key={name} onClick={() => setActivePreset(name)}
                            className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${activePreset === name ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'}`}>
                            {name}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESETS[activePreset as keyof typeof PRESETS].map(c => (
                          <button key={c} onClick={() => set('bgColor1', c)}
                            className="w-7 h-7 rounded-lg ring-1 ring-black/10 dark:ring-white/10 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c }} title={c} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Font Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Font</label>
                    <select value={config.fontFamily} onChange={e => set('fontFamily', e.target.value as FontFamily)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white">
                      <option value="Inter">Inter</option>
                      <option value="Geist">Geist</option>
                      <option value="monospace">Monospace</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Font Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={config.fontColor} onChange={e => set('fontColor', e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                      <input type="text" value={config.fontColor} onChange={e => set('fontColor', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white font-mono" />
                    </div>
                  </div>
                </div>

                {/* Font size slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Font Size</label>
                    <span className="text-xs text-slate-500">{config.fontSize}%</span>
                  </div>
                  <input type="range" min={20} max={95} value={config.fontSize} onChange={e => set('fontSize', +e.target.value)}
                    className="w-full accent-indigo-500" />
                </div>

                {/* Font weight */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Font Weight</label>
                    <span className="text-xs text-slate-500">{config.fontWeight}</span>
                  </div>
                  <input type="range" min={300} max={900} step={100} value={config.fontWeight} onChange={e => set('fontWeight', +e.target.value)}
                    className="w-full accent-indigo-500" />
                </div>

                {/* Border */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Border</label>
                  <button onClick={() => set('borderEnabled', !config.borderEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors ${config.borderEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-white/20'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${config.borderEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {config.borderEnabled && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Border Color</label>
                      <input type="color" value={config.borderColor} onChange={e => set('borderColor', e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">Width ({config.borderWidth}%)</label>
                      <input type="range" min={1} max={10} value={config.borderWidth} onChange={e => set('borderWidth', +e.target.value)}
                        className="w-full accent-indigo-500" />
                    </div>
                  </div>
                )}

                {/* Shadow */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Text Shadow</label>
                  <button onClick={() => set('shadowEnabled', !config.shadowEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors ${config.shadowEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-white/20'}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${config.shadowEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            )}

            {/* HTML Snippet */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">HTML Snippet</h3>
                <button onClick={copySnippet}
                  className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-400 transition-colors">
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              <pre className="bg-slate-100 dark:bg-black/30 rounded-xl p-4 text-xs text-slate-700 dark:text-slate-300 overflow-x-auto font-mono leading-relaxed">
                {htmlSnippet}
              </pre>
            </div>

            {/* FAQ */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Info size={18} /> FAQ</h3>
              <div className="space-y-4">
                {[
                  { q: 'What is a favicon?', a: 'A favicon is the small icon shown in browser tabs, bookmarks, and history. It helps users quickly identify your website.' },
                  { q: 'What sizes do I need?', a: 'Standard sizes are 16×16 and 32×32 for browsers, 180×180 for Apple devices, and 192×192 / 512×512 for Android. Our generator creates all of them.' },
                  { q: 'Can I use emoji as a favicon?', a: 'Yes! Just paste any emoji in the text field and it will be rendered as your favicon. Works great for quick branding.' },
                  { q: 'Is my data safe?', a: 'Absolutely. Everything runs in your browser. No images are uploaded to any server.' },
                ].map(({ q, a }) => (
                  <details key={q} className="group">
                    <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 group-open:text-indigo-500">{q}</summary>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-0">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ════ Right: Preview & Download ════ */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="space-y-6 lg:sticky lg:top-24 lg:self-start">

            {/* Large Preview */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Preview</h3>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <canvas ref={previewCanvas} width={512} height={512}
                    className="w-40 h-40 rounded-2xl ring-1 ring-black/5 dark:ring-white/10" />
                </div>
              </div>

              {/* Browser Tab Mockup */}
              <div className="bg-slate-200 dark:bg-slate-800 rounded-t-xl p-2">
                <div className="bg-white dark:bg-slate-700 rounded-lg px-3 py-2 flex items-center gap-2 max-w-[200px]">
                  <canvas ref={el => { canvasRefs.current[16] = el; }} width={16} height={16} className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-slate-300 truncate">My Website</span>
                  <X size={12} className="text-slate-400 ml-auto flex-shrink-0" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-700 rounded-b-xl border-t border-slate-200 dark:border-slate-600 p-4">
                <div className="bg-slate-100 dark:bg-slate-600 rounded-lg h-8 flex items-center px-3">
                  <span className="text-xs text-slate-400 font-mono">https://yoursite.com</span>
                </div>
              </div>
            </div>

            {/* Size Grid */}
            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">All Sizes</h3>
              <div className="grid grid-cols-3 gap-4">
                {SIZES.map(({ name, size, label }) => (
                  <button key={size} onClick={() => downloadPng(size, name)}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                    <div className="relative">
                      <canvas ref={el => { canvasRefs.current[size] = el; }} width={size} height={size}
                        className="ring-1 ring-black/5 dark:ring-white/10 rounded"
                        style={{ width: Math.min(size, 48), height: Math.min(size, 48) }} />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded">
                        <Download size={16} className="text-white" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Download All */}
            <button onClick={downloadAll} disabled={downloading}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50">
              {downloading ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> Downloading...</>
              ) : (
                <><Download size={20} /> Download All Sizes</>
              )}
            </button>

            {/* Usage counter */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400">
              <span>{remainingUses} free downloads remaining today</span>
              {remainingUses <= 2 && (
                <button onClick={() => setShowProModal(true)} className="ml-2 text-indigo-500 hover:text-indigo-400 font-medium inline-flex items-center gap-1">
                  <Crown size={12} /> Go Pro
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pro Modal */}
      <AnimatePresence>
        {showProModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowProModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-200 dark:border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Crown size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unlock Pro</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Get unlimited favicon downloads, ICO format, ZIP pack, and webmanifest generation.</p>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 mb-6 text-left space-y-2">
                  {['Unlimited downloads', 'ICO format (multi-size)', 'ZIP pack download', 'site.webmanifest generation', 'All shapes & effects'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check size={16} className="text-green-500 flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>
                <a href="https://sherutools.lemonsqueezy.com" target="_blank" rel="noopener noreferrer"
                  className="block w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25">
                  Get Pro — $2.99 one-time
                </a>
                <button onClick={() => setShowProModal(false)} className="mt-3 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
