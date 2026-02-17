'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Paintbrush, Copy, Check, Download, Maximize2, Minimize2, Plus, Trash2, Shuffle, ChevronRight, Lock, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useCallback, useEffect } from 'react';

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface ColorStop {
  id: string;
  color: string;
  position: number;
  opacity: number;
}

type GradientType = 'linear' | 'radial' | 'conic';
type RadialShape = 'circle' | 'ellipse';
type CodeTab = 'css' | 'tailwind';
type PresetCategory = 'Warm' | 'Cool' | 'Nature' | 'Neon' | 'Pastel' | 'Dark';

interface GradientState {
  type: GradientType;
  angle: number;
  radialShape: RadialShape;
  radialX: number;
  radialY: number;
  conicAngle: number;
  conicX: number;
  conicY: number;
  stops: ColorStop[];
}

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */
let _idCounter = 0;
const uid = () => `s${++_idCounter}_${Date.now()}`;

const hexToRgba = (hex: string, opacity: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const buildStopsString = (stops: ColorStop[]) =>
  [...stops]
    .sort((a, b) => a.position - b.position)
    .map((s) => `${hexToRgba(s.color, s.opacity)} ${s.position}%`)
    .join(', ');

const buildCSSGradient = (state: GradientState): string => {
  const stops = buildStopsString(state.stops);
  switch (state.type) {
    case 'linear':
      return `linear-gradient(${state.angle}deg, ${stops})`;
    case 'radial':
      return `radial-gradient(${state.radialShape} at ${state.radialX}% ${state.radialY}%, ${stops})`;
    case 'conic':
      return `conic-gradient(from ${state.conicAngle}deg at ${state.conicX}% ${state.conicY}%, ${stops})`;
  }
};

const buildFullCSS = (state: GradientState): string => {
  const g = buildCSSGradient(state);
  return `background: ${g};\nbackground: -webkit-${g};\nbackground: -moz-${g};`;
};

const buildTailwind = (state: GradientState): string => {
  if (state.type !== 'linear') return `/* Tailwind doesn't natively support ${state.type} gradients.\n   Use arbitrary value: */\nstyle={{ background: '${buildCSSGradient(state)}' }}`;
  const sorted = [...state.stops].sort((a, b) => a.position - b.position);
  const from = sorted[0]?.color ?? '#000000';
  const to = sorted[sorted.length - 1]?.color ?? '#ffffff';
  const via = sorted.length > 2 ? sorted[Math.floor(sorted.length / 2)]?.color : null;
  const dirMap: Record<number, string> = { 0: 'bg-gradient-to-t', 45: 'bg-gradient-to-tr', 90: 'bg-gradient-to-r', 135: 'bg-gradient-to-br', 180: 'bg-gradient-to-b', 225: 'bg-gradient-to-bl', 270: 'bg-gradient-to-l', 315: 'bg-gradient-to-tl' };
  const closest = Object.keys(dirMap).map(Number).reduce((prev, curr) => Math.abs(curr - state.angle) < Math.abs(prev - state.angle) ? curr : prev, 0);
  const dir = dirMap[closest] || 'bg-gradient-to-r';
  return `${dir} from-[${from}]${via ? ` via-[${via}]` : ''} to-[${to}]`;
};

/* ═══════════════════════════════════════════
   Presets
   ═══════════════════════════════════════════ */
interface Preset {
  name: string;
  category: PresetCategory;
  stops: ColorStop[];
  type?: GradientType;
  angle?: number;
}

const makeStops = (colors: string[]): ColorStop[] =>
  colors.map((c, i) => ({ id: uid(), color: c, position: Math.round((i / (colors.length - 1)) * 100), opacity: 1 }));

const PRESETS: Preset[] = [
  // Warm
  { name: 'Sunrise', category: 'Warm', stops: makeStops(['#ff6b35', '#f7c59f', '#efefd0']), angle: 135 },
  { name: 'Flame', category: 'Warm', stops: makeStops(['#f83600', '#f9d423']), angle: 90 },
  { name: 'Sunset Blaze', category: 'Warm', stops: makeStops(['#fc4a1a', '#f7b733']), angle: 45 },
  { name: 'Warm Dusk', category: 'Warm', stops: makeStops(['#ee9ca7', '#ffdde1']), angle: 135 },
  { name: 'Mango', category: 'Warm', stops: makeStops(['#ffe259', '#ffa751']), angle: 90 },
  // Cool
  { name: 'Ocean', category: 'Cool', stops: makeStops(['#2193b0', '#6dd5ed']), angle: 135 },
  { name: 'Frost', category: 'Cool', stops: makeStops(['#000428', '#004e92']), angle: 180 },
  { name: 'Cool Blues', category: 'Cool', stops: makeStops(['#2193b0', '#6dd5ed', '#e0f7fa']), angle: 90 },
  { name: 'Arctic', category: 'Cool', stops: makeStops(['#83a4d4', '#b6fbff']), angle: 135 },
  { name: 'Deep Sea', category: 'Cool', stops: makeStops(['#0f0c29', '#302b63', '#24243e']), angle: 180 },
  // Nature
  { name: 'Forest', category: 'Nature', stops: makeStops(['#134e5e', '#71b280']), angle: 135 },
  { name: 'Meadow', category: 'Nature', stops: makeStops(['#56ab2f', '#a8e063']), angle: 90 },
  { name: 'Earth', category: 'Nature', stops: makeStops(['#614385', '#516395']), angle: 135 },
  { name: 'Autumn', category: 'Nature', stops: makeStops(['#dce35b', '#45b649']), angle: 45 },
  { name: 'Spring', category: 'Nature', stops: makeStops(['#00b09b', '#96c93d']), angle: 90 },
  // Neon
  { name: 'Neon Pink', category: 'Neon', stops: makeStops(['#fc00ff', '#00dbde']), angle: 135 },
  { name: 'Electric', category: 'Neon', stops: makeStops(['#f857a6', '#ff5858']), angle: 90 },
  { name: 'Cyberpunk', category: 'Neon', stops: makeStops(['#00f260', '#0575e6']), angle: 45 },
  { name: 'Glow', category: 'Neon', stops: makeStops(['#f7971e', '#ffd200']), angle: 90 },
  { name: 'Rave', category: 'Neon', stops: makeStops(['#b721ff', '#21d4fd']), angle: 135 },
  { name: 'Laser', category: 'Neon', stops: makeStops(['#ff0844', '#ffb199']), angle: 90 },
  // Pastel
  { name: 'Cotton Candy', category: 'Pastel', stops: makeStops(['#ffecd2', '#fcb69f']), angle: 135 },
  { name: 'Lavender', category: 'Pastel', stops: makeStops(['#e6dee9', '#a8c0ff']), angle: 90 },
  { name: 'Peach', category: 'Pastel', stops: makeStops(['#fdfcfb', '#e2d1c3']), angle: 135 },
  { name: 'Blush', category: 'Pastel', stops: makeStops(['#fbc2eb', '#a6c1ee']), angle: 45 },
  { name: 'Mint', category: 'Pastel', stops: makeStops(['#d4fc79', '#96e6a1']), angle: 90 },
  // Dark
  { name: 'Midnight', category: 'Dark', stops: makeStops(['#232526', '#414345']), angle: 180 },
  { name: 'Abyss', category: 'Dark', stops: makeStops(['#0f2027', '#203a43', '#2c5364']), angle: 135 },
  { name: 'Shadow', category: 'Dark', stops: makeStops(['#1a1a2e', '#16213e', '#0f3460']), angle: 180 },
  { name: 'Obsidian', category: 'Dark', stops: makeStops(['#0c0c0c', '#1a1a2e']), angle: 135 },
  { name: 'Void', category: 'Dark', stops: makeStops(['#000000', '#434343']), angle: 180 },
];

const PRESET_CATEGORIES: PresetCategory[] = ['Warm', 'Cool', 'Nature', 'Neon', 'Pastel', 'Dark'];

/* ═══════════════════════════════════════════
   Defaults
   ═══════════════════════════════════════════ */
const defaultState = (): GradientState => ({
  type: 'linear',
  angle: 135,
  radialShape: 'circle',
  radialX: 50,
  radialY: 50,
  conicAngle: 0,
  conicX: 50,
  conicY: 50,
  stops: [
    { id: uid(), color: '#6366f1', position: 0, opacity: 1 },
    { id: uid(), color: '#ec4899', position: 50, opacity: 1 },
    { id: uid(), color: '#f59e0b', position: 100, opacity: 1 },
  ],
});

/* ═══════════════════════════════════════════
   History helpers
   ═══════════════════════════════════════════ */
const HISTORY_KEY = 'sherutools_gradient_history';
const loadHistory = (): GradientState[] => {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
};
const saveHistory = (state: GradientState) => {
  if (typeof window === 'undefined') return;
  const h = loadHistory();
  h.unshift(state);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 10)));
};

/* ═══════════════════════════════════════════
   Component
   ═══════════════════════════════════════════ */
export default function CSSGradientGenerator() {
  const [state, setState] = useState<GradientState>(defaultState);
  const [codeTab, setCodeTab] = useState<CodeTab>('css');
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [presetCat, setPresetCat] = useState<PresetCategory>('Warm');
  const [history, setHistory] = useState<GradientState[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [draggingStop, setDraggingStop] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const gradientBarRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const gradientCSS = buildCSSGradient(state);

  // Save to history on meaningful changes (debounced via user actions)
  const saveCurrentToHistory = useCallback(() => {
    saveHistory(state);
    setHistory(loadHistory());
  }, [state]);

  /* ── Stop management ── */
  const addStop = () => {
    const sorted = [...state.stops].sort((a, b) => a.position - b.position);
    let pos = 50;
    if (sorted.length >= 2) {
      // Find the largest gap
      let maxGap = 0, gapStart = 0;
      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1].position - sorted[i].position;
        if (gap > maxGap) { maxGap = gap; gapStart = i; }
      }
      pos = Math.round((sorted[gapStart].position + sorted[gapStart + 1].position) / 2);
    }
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    setState(s => ({ ...s, stops: [...s.stops, { id: uid(), color: randomColor, position: pos, opacity: 1 }] }));
  };

  const removeStop = (id: string) => {
    if (state.stops.length <= 2) return;
    setState(s => ({ ...s, stops: s.stops.filter(st => st.id !== id) }));
  };

  const updateStop = (id: string, updates: Partial<ColorStop>) => {
    setState(s => ({ ...s, stops: s.stops.map(st => st.id === id ? { ...st, ...updates } : st) }));
  };

  /* ── Dragging color stops on bar ── */
  const handleBarMouseDown = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingStop(id);
  };

  useEffect(() => {
    if (!draggingStop) return;
    const handleMove = (e: MouseEvent) => {
      if (!gradientBarRef.current) return;
      const rect = gradientBarRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      updateStop(draggingStop, { position: Math.round(x * 100) });
    };
    const handleUp = () => {
      setDraggingStop(null);
      saveCurrentToHistory();
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingStop]);

  /* ── Angle dial drag ── */
  const handleDialMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const handleMove = (ev: MouseEvent) => {
      if (!dialRef.current) return;
      const rect = dialRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.round(Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI) + 90);
      setState(s => ({ ...s, angle: ((angle % 360) + 360) % 360 }));
    };
    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      saveCurrentToHistory();
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  /* ── Click on preview to set radial/conic position ── */
  const handlePreviewClick = (e: React.MouseEvent) => {
    if (state.type === 'linear') return;
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    if (state.type === 'radial') setState(s => ({ ...s, radialX: x, radialY: y }));
    else setState(s => ({ ...s, conicX: x, conicY: y }));
  };

  /* ── Copy ── */
  const handleCopy = () => {
    const text = codeTab === 'css' ? buildFullCSS(state) : buildTailwind(state);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    saveCurrentToHistory();
  };

  /* ── Export PNG ── */
  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 1920;
    canvas.height = 1080;

    const sorted = [...state.stops].sort((a, b) => a.position - b.position);

    if (state.type === 'linear') {
      const rad = (state.angle - 90) * (Math.PI / 180);
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const len = Math.max(canvas.width, canvas.height);
      const x0 = cx - Math.cos(rad) * len / 2;
      const y0 = cy - Math.sin(rad) * len / 2;
      const x1 = cx + Math.cos(rad) * len / 2;
      const y1 = cy + Math.sin(rad) * len / 2;
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      sorted.forEach(s => {
        const [r, g, b] = [parseInt(s.color.slice(1, 3), 16), parseInt(s.color.slice(3, 5), 16), parseInt(s.color.slice(5, 7), 16)];
        grad.addColorStop(s.position / 100, `rgba(${r},${g},${b},${s.opacity})`);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (state.type === 'radial') {
      const cx = canvas.width * state.radialX / 100;
      const cy = canvas.height * state.radialY / 100;
      const r = Math.max(canvas.width, canvas.height);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      sorted.forEach(s => {
        const [rv, gv, bv] = [parseInt(s.color.slice(1, 3), 16), parseInt(s.color.slice(3, 5), 16), parseInt(s.color.slice(5, 7), 16)];
        grad.addColorStop(s.position / 100, `rgba(${rv},${gv},${bv},${s.opacity})`);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const cx = canvas.width * state.conicX / 100;
      const cy = canvas.height * state.conicY / 100;
      const r = Math.max(canvas.width, canvas.height) * 2;
      for (let a = 0; a < 360; a++) {
        const startAngle = ((a + state.conicAngle) * Math.PI) / 180;
        const endAngle = ((a + 1 + state.conicAngle) * Math.PI) / 180;
        const pct = a / 360;
        let c1 = sorted[0], c2 = sorted[sorted.length - 1];
        for (let i = 0; i < sorted.length - 1; i++) {
          if (pct >= sorted[i].position / 100 && pct <= sorted[i + 1].position / 100) {
            c1 = sorted[i]; c2 = sorted[i + 1]; break;
          }
        }
        const range = (c2.position - c1.position) / 100 || 1;
        const t = (pct - c1.position / 100) / range;
        const lerp = (a: number, b: number) => Math.round(a + (b - a) * Math.max(0, Math.min(1, t)));
        const rv = lerp(parseInt(c1.color.slice(1, 3), 16), parseInt(c2.color.slice(1, 3), 16));
        const gv = lerp(parseInt(c1.color.slice(3, 5), 16), parseInt(c2.color.slice(3, 5), 16));
        const bv = lerp(parseInt(c1.color.slice(5, 7), 16), parseInt(c2.color.slice(5, 7), 16));
        const op = c1.opacity + (c2.opacity - c1.opacity) * Math.max(0, Math.min(1, t));
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = `rgba(${rv},${gv},${bv},${op})`;
        ctx.fill();
      }
    }

    const link = document.createElement('a');
    link.download = 'gradient.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    saveCurrentToHistory();
  };

  /* ── Random gradient ── */
  const randomGradient = () => {
    const types: GradientType[] = ['linear', 'radial', 'conic'];
    const type = types[Math.floor(Math.random() * types.length)];
    const numStops = 2 + Math.floor(Math.random() * 3);
    const stops: ColorStop[] = [];
    for (let i = 0; i < numStops; i++) {
      stops.push({
        id: uid(),
        color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
        position: Math.round((i / (numStops - 1)) * 100),
        opacity: 1,
      });
    }
    setState({
      type,
      angle: Math.floor(Math.random() * 360),
      radialShape: Math.random() > 0.5 ? 'circle' : 'ellipse',
      radialX: 50, radialY: 50,
      conicAngle: Math.floor(Math.random() * 360),
      conicX: 50, conicY: 50,
      stops,
    });
  };

  /* ── Apply preset ── */
  const applyPreset = (p: Preset) => {
    setState(s => ({
      ...s,
      type: p.type || 'linear',
      angle: p.angle || 135,
      stops: p.stops.map(st => ({ ...st, id: uid() })),
    }));
  };

  /* ── Load history item ── */
  const loadHistoryItem = (h: GradientState) => {
    setState({ ...h, stops: h.stops.map(s => ({ ...s, id: uid() })) });
    setShowHistory(false);
  };

  /* ── Fullscreen preview ── */
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: gradientCSS }}>
        <div className="absolute top-4 right-4 z-10">
          <button onClick={() => setFullscreen(false)} className="p-3 rounded-xl bg-black/30 backdrop-blur-xl text-white hover:bg-black/50 transition-all">
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">Sample Heading</h1>
            <p className="text-lg md:text-xl text-white/80 max-w-xl drop-shadow">This is sample text to check readability against your gradient background. Adjust colors to ensure sufficient contrast.</p>
            <p className="text-sm text-white/60 drop-shadow">Small body text for testing fine readability.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <canvas ref={canvasRef} className="hidden" />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white font-medium">CSS Gradient Generator</span>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-2 pb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
            <Paintbrush className="w-5 h-5 text-pink-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">CSS Gradient Generator</h1>
        </motion.div>
        <p className="text-slate-500 dark:text-slate-400 text-sm ml-[52px]">Create beautiful gradients visually. Copy CSS, Tailwind, or export as PNG.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ══════ LEFT: Preview + Controls ══════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gradient Type Selector */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="flex gap-2">
              {(['linear', 'radial', 'conic'] as GradientType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setState(s => ({ ...s, type: t }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${state.type === t
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </motion.div>

            {/* Live Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              ref={previewRef}
              onClick={handlePreviewClick}
              className={`relative w-full h-64 md:h-80 rounded-2xl shadow-2xl overflow-hidden border border-white/10 ${state.type !== 'linear' ? 'cursor-crosshair' : ''}`}
              style={{ background: gradientCSS }}
            >
              {/* Position indicator for radial/conic */}
              {state.type === 'radial' && (
                <div
                  className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${state.radialX}%`, top: `${state.radialY}%`, background: 'rgba(255,255,255,0.3)' }}
                />
              )}
              {state.type === 'conic' && (
                <div
                  className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${state.conicX}%`, top: `${state.conicY}%`, background: 'rgba(255,255,255,0.3)' }}
                />
              )}
              {state.type !== 'linear' && (
                <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/30 backdrop-blur text-white text-xs">
                  Click to set center position
                </div>
              )}
              {/* Fullscreen button */}
              <button onClick={(e) => { e.stopPropagation(); setFullscreen(true); }} className="absolute top-3 right-3 p-2 rounded-lg bg-black/30 backdrop-blur text-white hover:bg-black/50 transition-all">
                <Maximize2 className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Gradient Bar with draggable stops */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Color Stops</span>
                <button onClick={addStop} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 text-sm font-medium hover:bg-blue-500/20 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Stop
                </button>
              </div>
              <div ref={gradientBarRef} className="relative h-8 rounded-xl overflow-visible cursor-pointer" style={{ background: `linear-gradient(90deg, ${buildStopsString(state.stops)})` }}>
                <div className="absolute inset-0 rounded-xl border border-white/20" />
                {state.stops.map(stop => (
                  <div
                    key={stop.id}
                    onMouseDown={handleBarMouseDown(stop.id)}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg cursor-grab active:cursor-grabbing hover:scale-125 transition-transform z-10"
                    style={{ left: `${stop.position}%`, background: stop.color }}
                    title={`${stop.position}%`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Controls per type */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl space-y-4">
              {/* Linear: angle dial */}
              {state.type === 'linear' && (
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Angle</label>
                    <div className="flex items-center gap-2">
                      <div
                        ref={dialRef}
                        onMouseDown={handleDialMouseDown}
                        className="relative w-16 h-16 rounded-full cursor-pointer border-2 border-slate-200 dark:border-white/20"
                        style={{ background: `conic-gradient(from 0deg, #6366f1, #ec4899, #f59e0b, #6366f1)` }}
                      >
                        <div
                          className="absolute w-3 h-3 rounded-full bg-white shadow-lg border border-slate-300 -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${50 + 40 * Math.cos((state.angle - 90) * Math.PI / 180)}%`,
                            top: `${50 + 40 * Math.sin((state.angle - 90) * Math.PI / 180)}%`,
                          }}
                        />
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={360}
                        value={state.angle}
                        onChange={e => setState(s => ({ ...s, angle: parseInt(e.target.value) || 0 }))}
                        className="w-20 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white"
                      />
                      <span className="text-sm text-slate-500">deg</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Radial: shape */}
              {state.type === 'radial' && (
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shape</label>
                    <div className="flex gap-2">
                      {(['circle', 'ellipse'] as RadialShape[]).map(s => (
                        <button
                          key={s}
                          onClick={() => setState(st => ({ ...st, radialShape: s }))}
                          className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${state.radialShape === s
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position</label>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{state.radialX}% {state.radialY}%</div>
                  </div>
                </div>
              )}

              {/* Conic: angle */}
              {state.type === 'conic' && (
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Angle</label>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={state.conicAngle}
                      onChange={e => setState(s => ({ ...s, conicAngle: parseInt(e.target.value) }))}
                      className="w-40 accent-blue-500"
                    />
                    <span className="text-sm text-slate-500 ml-2">{state.conicAngle}°</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Position</label>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{state.conicX}% {state.conicY}%</div>
                  </div>
                </div>
              )}

              {/* Color stop editors */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stop Colors</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {state.stops.map((stop, i) => (
                    <div key={stop.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                      <input
                        type="color"
                        value={stop.color}
                        onChange={e => updateStop(stop.id, { color: e.target.value })}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) updateStop(stop.id, { color: e.target.value }); }}
                        className="w-20 px-2 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white font-mono"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={stop.position}
                        onChange={e => updateStop(stop.id, { position: parseInt(e.target.value) || 0 })}
                        className="w-14 px-2 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                      />
                      <span className="text-xs text-slate-400">%</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(stop.opacity * 100)}
                        onChange={e => updateStop(stop.id, { opacity: parseInt(e.target.value) / 100 })}
                        className="w-16 accent-blue-500"
                        title={`Opacity: ${Math.round(stop.opacity * 100)}%`}
                      />
                      {state.stops.length > 2 && (
                        <button onClick={() => removeStop(stop.id)} className="p-1 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex flex-wrap gap-2">
              <button onClick={randomGradient} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                <Shuffle className="w-4 h-4" /> Random
              </button>
              <button onClick={exportPNG} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                <Download className="w-4 h-4" /> Export PNG
              </button>
              <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                History ({history.length})
              </button>
            </motion.div>

            {/* History panel */}
            <AnimatePresence>
              {showHistory && history.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
                    {history.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => loadHistoryItem(h)}
                        className="w-full aspect-square rounded-xl border border-white/10 hover:scale-110 transition-transform shadow-sm"
                        style={{ background: buildCSSGradient(h) }}
                        title={`History ${i + 1}`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Presets */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Preset Gradients</h2>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PRESET_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPresetCat(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${presetCat === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3">
                {PRESETS.filter(p => p.category === presetCat).map(p => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition-all shadow-sm hover:shadow-lg"
                    style={{ background: `linear-gradient(${p.angle || 135}deg, ${buildStopsString(p.stops)})` }}
                  >
                    <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white font-medium">{p.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ══════ RIGHT: Code Output + Pro ══════ */}
          <div className="space-y-6">
            {/* Code output */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl space-y-3 sticky top-20">
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {(['css', 'tailwind'] as CodeTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCodeTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium uppercase transition-all ${codeTab === tab
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {codeTab === 'css' ? buildFullCSS(state) : buildTailwind(state)}
              </pre>
            </motion.div>

            {/* Pro upsell */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pro Features</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">$3.99</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-purple-400" /> Export as SVG</li>
                <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-purple-400" /> Animated gradient CSS</li>
                <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-purple-400" /> Gradient mesh (4-corner blend)</li>
              </ul>
              <a
                href="https://sherutools.lemonsqueezy.com/buy/css-gradient-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Unlock Pro — $3.99
              </a>
              <p className="text-[10px] text-slate-500 text-center">One-time payment • Lifetime access</p>
            </motion.div>

            {/* Quick text preview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-2xl overflow-hidden border border-white/10" style={{ background: gradientCSS }}>
              <h3 className="text-lg font-bold text-white drop-shadow-lg mb-1">Text Preview</h3>
              <p className="text-sm text-white/80 drop-shadow">Check readability against your gradient.</p>
              <p className="text-xs text-white/60 mt-2 drop-shadow">Small text for contrast testing.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
