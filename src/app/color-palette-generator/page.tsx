'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Lock, Unlock, Copy, Check, RefreshCw, Download, Heart, ChevronRight,
  X, Pipette, Eye, Sparkles, Crown, Trash2,
} from 'lucide-react';

/* ───── Types ───── */
type HSL = { h: number; s: number; l: number };
type PaletteColor = { hex: string; locked: boolean };
type SavedPalette = { id: string; colors: string[]; name: string; date: string };
type HarmonyMethod = 'random' | 'analogous' | 'complementary' | 'triadic' | 'monochromatic' | 'split-complementary';
type ExportFormat = 'png' | 'css' | 'tailwind' | 'json' | 'svg';

/* ───── Color Utilities ───── */
function hslToHex({ h, s, l }: HSL): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function hexToHsl(hex: string): HSL {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function randomHsl(): HSL {
  return { h: Math.floor(Math.random() * 360), s: 50 + Math.floor(Math.random() * 40), l: 35 + Math.floor(Math.random() * 35) };
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function textColor(hex: string): string {
  return luminance(hex) > 0.6 ? '#1a1a2e' : '#ffffff';
}

/* ───── Palette Generation ───── */
function generatePalette(method: HarmonyMethod, locked: PaletteColor[]): PaletteColor[] {
  const base = randomHsl();
  let hues: number[];

  switch (method) {
    case 'analogous':
      hues = [-30, -15, 0, 15, 30].map(d => (base.h + d + 360) % 360);
      break;
    case 'complementary':
      hues = [0, 10, 180, 190, 200].map(d => (base.h + d + 360) % 360);
      break;
    case 'triadic':
      hues = [0, 10, 120, 130, 240].map(d => (base.h + d + 360) % 360);
      break;
    case 'monochromatic':
      hues = [base.h, base.h, base.h, base.h, base.h];
      break;
    case 'split-complementary':
      hues = [0, 150, 160, 200, 210].map(d => (base.h + d + 360) % 360);
      break;
    default: // random
      hues = Array.from({ length: 5 }, () => Math.floor(Math.random() * 360));
  }

  return hues.map((h, i) => {
    if (locked[i]?.locked) return locked[i];
    const s = method === 'monochromatic' ? 40 + Math.floor(Math.random() * 30) : 50 + Math.floor(Math.random() * 40);
    const l = method === 'monochromatic' ? 20 + i * 15 : 35 + Math.floor(Math.random() * 35);
    return { hex: hslToHex({ h, s, l }), locked: false };
  });
}

/* ───── Export ───── */
function exportPNG(colors: string[]) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200; canvas.height = 630;
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width / colors.length;
  colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * w, 0, w, canvas.height); });
  // watermark
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '16px system-ui';
  ctx.textAlign = 'right';
  ctx.fillText('SheruTools.com', canvas.width - 20, canvas.height - 20);
  // hex labels
  colors.forEach((c, i) => {
    ctx.fillStyle = textColor(c);
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(c, i * w + w / 2, canvas.height / 2);
  });
  const link = document.createElement('a');
  link.download = 'palette.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function exportCSS(colors: string[]) {
  const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
  downloadText(css, 'palette.css');
}

function exportTailwind(colors: string[]) {
  const obj = Object.fromEntries(colors.map((c, i) => [`palette-${i + 1}`, c]));
  const code = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(obj, null, 8)}\n    }\n  }\n}`;
  downloadText(code, 'tailwind-palette.js');
}

function exportJSON(colors: string[]) {
  downloadText(JSON.stringify({ palette: colors, generated: new Date().toISOString(), source: 'SheruTools' }, null, 2), 'palette.json');
}

function exportSVG(colors: string[]) {
  const w = 100;
  const rects = colors.map((c, i) => `<rect x="${i * w}" y="0" width="${w}" height="200" fill="${c}"/>`).join('\n  ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${colors.length * w} 200">\n  ${rects}\n</svg>`;
  downloadText(svg, 'palette.svg');
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = filename;
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

/* ───── Storage ───── */
const STORAGE_KEY = 'sherutools-palettes';
function loadPalettes(): SavedPalette[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function savePalettes(p: SavedPalette[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/* ───── Component ───── */
export default function ColorPaletteGeneratorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <ColorPaletteGenerator />
    </Suspense>
  );
}

function ColorPaletteGenerator() {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<HarmonyMethod>('random');
  const [colors, setColors] = useState<PaletteColor[]>([]);
  const [copied, setCopied] = useState<number | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [editingColor, setEditingColor] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Init from URL or generate
  useEffect(() => {
    const urlColors = searchParams.get('colors');
    if (urlColors) {
      const hexes = urlColors.split(',').slice(0, 5).map(c => c.replace(/[^0-9a-fA-F]/g, ''));
      if (hexes.length === 5 && hexes.every(h => h.length === 6)) {
        setColors(hexes.map(h => ({ hex: `#${h.toUpperCase()}`, locked: false })));
        return;
      }
    }
    setColors(generatePalette('random', []));
  }, []);

  useEffect(() => { setSavedPalettes(loadPalettes()); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  };

  const generate = useCallback(() => {
    setColors(prev => generatePalette(method, prev));
  }, [method]);

  // Spacebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generate]);

  const toggleLock = (i: number) => {
    setColors(prev => prev.map((c, idx) => idx === i ? { ...c, locked: !c.locked } : c));
  };

  const copyHex = async (hex: string, i: number) => {
    await navigator.clipboard.writeText(hex);
    setCopied(i);
    showToast('Copied!');
    setTimeout(() => setCopied(null), 1500);
  };

  const shareURL = () => {
    const url = `${window.location.origin}/color-palette-generator?colors=${colors.map(c => c.hex.slice(1)).join(',')}`;
    navigator.clipboard.writeText(url);
    showToast('Share URL copied!');
  };

  const savePalette = () => {
    const existing = loadPalettes();
    if (existing.length >= 5) {
      showToast('Free tier: max 5 palettes. Upgrade for unlimited!');
      return;
    }
    const palette: SavedPalette = {
      id: Date.now().toString(),
      colors: colors.map(c => c.hex),
      name: `Palette ${existing.length + 1}`,
      date: new Date().toLocaleDateString(),
    };
    const updated = [...existing, palette];
    savePalettes(updated);
    setSavedPalettes(updated);
    showToast('Palette saved!');
  };

  const deletePalette = (id: string) => {
    const updated = savedPalettes.filter(p => p.id !== id);
    savePalettes(updated);
    setSavedPalettes(updated);
  };

  const loadPalette = (p: SavedPalette) => {
    setColors(p.colors.map(hex => ({ hex, locked: false })));
    setShowSaved(false);
  };

  const handleColorChange = (i: number, hex: string) => {
    setColors(prev => prev.map((c, idx) => idx === i ? { ...c, hex: hex.toUpperCase() } : c));
  };

  const doExport = (format: ExportFormat) => {
    const hexes = colors.map(c => c.hex);
    switch (format) {
      case 'png': exportPNG(hexes); break;
      case 'css': exportCSS(hexes); break;
      case 'tailwind': exportTailwind(hexes); break;
      case 'json': exportJSON(hexes); break;
      case 'svg': exportSVG(hexes); break;
    }
    setShowExport(false);
    showToast(`Exported as ${format.toUpperCase()}!`);
  };

  const methods: { value: HarmonyMethod; label: string }[] = [
    { value: 'random', label: 'Random' },
    { value: 'analogous', label: 'Analogous' },
    { value: 'complementary', label: 'Complementary' },
    { value: 'triadic', label: 'Triadic' },
    { value: 'monochromatic', label: 'Monochromatic' },
    { value: 'split-complementary', label: 'Split-Comp' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <div className="px-4 py-3 bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white font-medium">Color Palette Generator</span>
        </div>
      </div>

      {/* Palette Bars */}
      <div className="flex-1 flex flex-col md:flex-row">
        {colors.map((color, i) => {
          const txt = textColor(color.hex);
          const rgb = hexToRgb(color.hex);
          const hsl = hexToHsl(color.hex);
          return (
            <motion.div
              key={i}
              className="flex-1 relative group cursor-pointer flex items-center justify-center min-h-[120px] md:min-h-0"
              animate={{ backgroundColor: color.hex }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              onClick={() => copyHex(color.hex, i)}
            >
              {/* Lock badge */}
              {color.locked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 left-1/2 -translate-x-1/2 z-10"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${txt}20` }}>
                    <Lock className="w-4 h-4" style={{ color: txt }} />
                  </div>
                </motion.div>
              )}

              {/* Color info overlay */}
              <div className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 text-center select-none">
                <motion.p
                  className="text-2xl md:text-3xl font-bold tracking-wider mb-2"
                  style={{ color: txt }}
                  layout
                >
                  {color.hex}
                </motion.p>
                <p className="text-xs font-mono opacity-70 mb-1" style={{ color: txt }}>
                  rgb({rgb.r}, {rgb.g}, {rgb.b})
                </p>
                <p className="text-xs font-mono opacity-70 mb-4" style={{ color: txt }}>
                  hsl({hsl.h}°, {hsl.s}%, {hsl.l}%)
                </p>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLock(i); }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                    style={{ backgroundColor: `${txt}15`, color: txt }}
                    title={color.locked ? 'Unlock' : 'Lock'}
                  >
                    {color.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyHex(color.hex, i); }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                    style={{ backgroundColor: `${txt}15`, color: txt }}
                    title="Copy"
                  >
                    {copied === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingColor(i);
                      setTimeout(() => colorInputRef.current?.click(), 50);
                    }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
                    style={{ backgroundColor: `${txt}15`, color: txt }}
                    title="Adjust color"
                  >
                    <Pipette className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hidden color input */}
      <input
        ref={colorInputRef}
        type="color"
        className="absolute opacity-0 pointer-events-none"
        value={editingColor !== null ? colors[editingColor]?.hex : '#000000'}
        onChange={(e) => {
          if (editingColor !== null) handleColorChange(editingColor, e.target.value);
        }}
        onBlur={() => setEditingColor(null)}
      />

      {/* Bottom Bar */}
      <div className="sticky bottom-0 z-40 px-4 py-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HarmonyMethod)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 outline-none"
            >
              {methods.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <button
              onClick={generate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Generate
            </button>
            <span className="hidden sm:inline text-xs text-slate-400 dark:text-slate-500">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-[10px] font-mono">Space</kbd> to generate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={shareURL}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={savePalette}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              <Heart className="w-3.5 h-3.5" /> Save
            </button>
            <button
              onClick={() => setShowSaved(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              <Eye className="w-3.5 h-3.5" /> Saved
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowExport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Export Palette</h3>
                <button onClick={() => setShowExport(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Preview */}
              <div className="flex rounded-xl overflow-hidden mb-6 h-16">
                {colors.map((c, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => doExport('png')} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-left">
                  <p className="font-medium text-sm text-slate-900 dark:text-white">PNG Image</p>
                  <p className="text-xs text-slate-400">Free with watermark</p>
                </button>
                {(['css', 'tailwind', 'json', 'svg'] as ExportFormat[]).map(fmt => (
                  <button key={fmt} onClick={() => doExport(fmt)} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-left relative">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{fmt.toUpperCase()}</p>
                      <Crown className="w-3 h-3 text-amber-500" />
                    </div>
                    <p className="text-xs text-slate-400">Pro feature</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Palettes Modal */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowSaved(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-white/10 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saved Palettes</h3>
                <button onClick={() => setShowSaved(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {savedPalettes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No saved palettes yet. Generate one you love and hit Save!</p>
              ) : (
                <div className="space-y-3">
                  {savedPalettes.map(p => (
                    <div
                      key={p.id}
                      className="group rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer"
                      onClick={() => loadPalette(p)}
                    >
                      <div className="flex h-12">
                        {p.colors.map((c, i) => (
                          <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <div className="px-3 py-2 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.date}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePalette(p.id); }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 text-center mt-4">Free: {savedPalettes.length}/5 palettes saved</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
