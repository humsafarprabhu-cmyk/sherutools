'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight, Ruler, Weight, Thermometer, Droplets, Grid3X3,
  Gauge, Clock, Database, Wind, Zap, Star, Search, History,
  ChevronRight, Home, ArrowUpDown, Copy, Check, Crown, X
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/* ═══════════════════════════════════════════
   CONVERSION DATA
   ═══════════════════════════════════════════ */

interface UnitDef {
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

interface Category {
  id: string;
  name: string;
  icon: typeof Ruler;
  color: string;
  units: UnitDef[];
}

const mul = (factor: number): Pick<UnitDef, 'toBase' | 'fromBase'> => ({
  toBase: (v) => v * factor,
  fromBase: (v) => v / factor,
});

const categories: Category[] = [
  {
    id: 'length', name: 'Length', icon: Ruler, color: 'blue',
    units: [
      { name: 'Millimeter', symbol: 'mm', ...mul(0.001) },
      { name: 'Centimeter', symbol: 'cm', ...mul(0.01) },
      { name: 'Meter', symbol: 'm', ...mul(1) },
      { name: 'Kilometer', symbol: 'km', ...mul(1000) },
      { name: 'Inch', symbol: 'in', ...mul(0.0254) },
      { name: 'Foot', symbol: 'ft', ...mul(0.3048) },
      { name: 'Yard', symbol: 'yd', ...mul(0.9144) },
      { name: 'Mile', symbol: 'mi', ...mul(1609.344) },
      { name: 'Nautical Mile', symbol: 'nmi', ...mul(1852) },
    ],
  },
  {
    id: 'weight', name: 'Weight', icon: Weight, color: 'emerald',
    units: [
      { name: 'Milligram', symbol: 'mg', ...mul(0.000001) },
      { name: 'Gram', symbol: 'g', ...mul(0.001) },
      { name: 'Kilogram', symbol: 'kg', ...mul(1) },
      { name: 'Tonne', symbol: 't', ...mul(1000) },
      { name: 'Ounce', symbol: 'oz', ...mul(0.028349523125) },
      { name: 'Pound', symbol: 'lb', ...mul(0.45359237) },
      { name: 'Stone', symbol: 'st', ...mul(6.35029318) },
    ],
  },
  {
    id: 'temperature', name: 'Temperature', icon: Thermometer, color: 'red',
    units: [
      {
        name: 'Celsius', symbol: '°C',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        name: 'Fahrenheit', symbol: '°F',
        toBase: (v) => (v - 32) * 5 / 9,
        fromBase: (v) => v * 9 / 5 + 32,
      },
      {
        name: 'Kelvin', symbol: 'K',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },
  {
    id: 'volume', name: 'Volume', icon: Droplets, color: 'cyan',
    units: [
      { name: 'Milliliter', symbol: 'ml', ...mul(0.001) },
      { name: 'Liter', symbol: 'l', ...mul(1) },
      { name: 'US Gallon', symbol: 'gal (US)', ...mul(3.785411784) },
      { name: 'UK Gallon', symbol: 'gal (UK)', ...mul(4.54609) },
      { name: 'Cup', symbol: 'cup', ...mul(0.2365882365) },
      { name: 'Pint', symbol: 'pt', ...mul(0.473176473) },
      { name: 'Quart', symbol: 'qt', ...mul(0.946352946) },
      { name: 'Fluid Ounce', symbol: 'fl oz', ...mul(0.0295735295625) },
      { name: 'Tablespoon', symbol: 'tbsp', ...mul(0.01478676478125) },
      { name: 'Teaspoon', symbol: 'tsp', ...mul(0.00492892159375) },
    ],
  },
  {
    id: 'area', name: 'Area', icon: Grid3X3, color: 'amber',
    units: [
      { name: 'Square Millimeter', symbol: 'mm²', ...mul(0.000001) },
      { name: 'Square Centimeter', symbol: 'cm²', ...mul(0.0001) },
      { name: 'Square Meter', symbol: 'm²', ...mul(1) },
      { name: 'Square Kilometer', symbol: 'km²', ...mul(1000000) },
      { name: 'Acre', symbol: 'ac', ...mul(4046.8564224) },
      { name: 'Hectare', symbol: 'ha', ...mul(10000) },
      { name: 'Square Foot', symbol: 'sq ft', ...mul(0.09290304) },
      { name: 'Square Yard', symbol: 'sq yd', ...mul(0.83612736) },
      { name: 'Square Mile', symbol: 'sq mi', ...mul(2589988.110336) },
    ],
  },
  {
    id: 'speed', name: 'Speed', icon: Gauge, color: 'purple',
    units: [
      { name: 'Meters per second', symbol: 'm/s', ...mul(1) },
      { name: 'Kilometers per hour', symbol: 'km/h', ...mul(1 / 3.6) },
      { name: 'Miles per hour', symbol: 'mph', ...mul(0.44704) },
      { name: 'Knots', symbol: 'kn', ...mul(0.514444) },
      { name: 'Feet per second', symbol: 'ft/s', ...mul(0.3048) },
    ],
  },
  {
    id: 'time', name: 'Time', icon: Clock, color: 'indigo',
    units: [
      { name: 'Millisecond', symbol: 'ms', ...mul(0.001) },
      { name: 'Second', symbol: 's', ...mul(1) },
      { name: 'Minute', symbol: 'min', ...mul(60) },
      { name: 'Hour', symbol: 'hr', ...mul(3600) },
      { name: 'Day', symbol: 'd', ...mul(86400) },
      { name: 'Week', symbol: 'wk', ...mul(604800) },
      { name: 'Month', symbol: 'mo', ...mul(2629746) },
      { name: 'Year', symbol: 'yr', ...mul(31556952) },
    ],
  },
  {
    id: 'data', name: 'Data', icon: Database, color: 'pink',
    units: [
      { name: 'Bit', symbol: 'bit', ...mul(1) },
      { name: 'Byte', symbol: 'B', ...mul(8) },
      { name: 'Kilobyte', symbol: 'KB', ...mul(8 * 1024) },
      { name: 'Megabyte', symbol: 'MB', ...mul(8 * 1024 * 1024) },
      { name: 'Gigabyte', symbol: 'GB', ...mul(8 * 1024 * 1024 * 1024) },
      { name: 'Terabyte', symbol: 'TB', ...mul(8 * 1024 * 1024 * 1024 * 1024) },
      { name: 'Petabyte', symbol: 'PB', ...mul(8 * 1024 * 1024 * 1024 * 1024 * 1024) },
    ],
  },
  {
    id: 'pressure', name: 'Pressure', icon: Wind, color: 'teal',
    units: [
      { name: 'Pascal', symbol: 'Pa', ...mul(1) },
      { name: 'Kilopascal', symbol: 'kPa', ...mul(1000) },
      { name: 'Bar', symbol: 'bar', ...mul(100000) },
      { name: 'PSI', symbol: 'psi', ...mul(6894.757293168) },
      { name: 'Atmosphere', symbol: 'atm', ...mul(101325) },
      { name: 'mmHg', symbol: 'mmHg', ...mul(133.322387415) },
    ],
  },
  {
    id: 'energy', name: 'Energy', icon: Zap, color: 'yellow',
    units: [
      { name: 'Joule', symbol: 'J', ...mul(1) },
      { name: 'Kilojoule', symbol: 'kJ', ...mul(1000) },
      { name: 'Calorie', symbol: 'cal', ...mul(4.184) },
      { name: 'Kilocalorie', symbol: 'kcal', ...mul(4184) },
      { name: 'Watt-hour', symbol: 'Wh', ...mul(3600) },
      { name: 'Kilowatt-hour', symbol: 'kWh', ...mul(3600000) },
      { name: 'BTU', symbol: 'BTU', ...mul(1055.05585262) },
    ],
  },
];

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */

function convert(value: number, from: UnitDef, to: UnitDef): number {
  return to.fromBase(from.toBase(value));
}

function formatNumber(n: number): string {
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e15 || (abs < 1e-10 && abs > 0)) return n.toExponential(6);
  if (abs >= 1) return parseFloat(n.toFixed(8)).toString();
  // small decimals
  return parseFloat(n.toFixed(12)).toString();
}

function getFormula(from: UnitDef, to: UnitDef): string {
  const val = convert(1, from, to);
  return `1 ${from.symbol} = ${formatNumber(val)} ${to.symbol}`;
}

interface HistoryEntry {
  value: string;
  from: string;
  to: string;
  result: string;
  category: string;
  timestamp: number;
}

const STORAGE_FAVORITES = 'sheru-uc-favorites';
const STORAGE_HISTORY = 'sheru-uc-history';

function loadFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_FAVORITES) || '[]'); } catch { return []; }
}
function saveFavorites(f: string[]) {
  localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(f));
}
function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]'); } catch { return []; }
}
function saveHistory(h: HistoryEntry[]) {
  localStorage.setItem(STORAGE_HISTORY, JSON.stringify(h.slice(0, 20)));
}

const categoryColors: Record<string, { pill: string; pillActive: string; icon: string }> = {
  blue: { pill: 'hover:bg-blue-500/10 hover:text-blue-500', pillActive: 'bg-blue-500/15 text-blue-500 border-blue-500/30', icon: 'text-blue-400' },
  emerald: { pill: 'hover:bg-emerald-500/10 hover:text-emerald-500', pillActive: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', icon: 'text-emerald-400' },
  red: { pill: 'hover:bg-red-500/10 hover:text-red-500', pillActive: 'bg-red-500/15 text-red-500 border-red-500/30', icon: 'text-red-400' },
  cyan: { pill: 'hover:bg-cyan-500/10 hover:text-cyan-500', pillActive: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30', icon: 'text-cyan-400' },
  amber: { pill: 'hover:bg-amber-500/10 hover:text-amber-500', pillActive: 'bg-amber-500/15 text-amber-500 border-amber-500/30', icon: 'text-amber-400' },
  purple: { pill: 'hover:bg-purple-500/10 hover:text-purple-500', pillActive: 'bg-purple-500/15 text-purple-500 border-purple-500/30', icon: 'text-purple-400' },
  indigo: { pill: 'hover:bg-indigo-500/10 hover:text-indigo-500', pillActive: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30', icon: 'text-indigo-400' },
  pink: { pill: 'hover:bg-pink-500/10 hover:text-pink-500', pillActive: 'bg-pink-500/15 text-pink-500 border-pink-500/30', icon: 'text-pink-400' },
  teal: { pill: 'hover:bg-teal-500/10 hover:text-teal-500', pillActive: 'bg-teal-500/15 text-teal-500 border-teal-500/30', icon: 'text-teal-400' },
  yellow: { pill: 'hover:bg-yellow-500/10 hover:text-yellow-500', pillActive: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30', icon: 'text-yellow-400' },
};

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function UnitConverterPage() {
  const [activeCat, setActiveCat] = useState(categories[0]);
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [inputVal, setInputVal] = useState('1');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [swapAnim, setSwapAnim] = useState(false);
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setFavorites(loadFavorites()); setHistory(loadHistory()); }, []);

  const fromUnit = activeCat.units[fromIdx];
  const toUnit = activeCat.units[toIdx];
  const numVal = parseFloat(inputVal) || 0;
  const result = convert(numVal, fromUnit, toUnit);
  const resultStr = formatNumber(result);
  const formula = getFormula(fromUnit, toUnit);
  const favKey = `${activeCat.id}:${fromUnit.symbol}:${toUnit.symbol}`;
  const isFav = favorites.includes(favKey);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.units.some(u => u.name.toLowerCase().includes(q) || u.symbol.toLowerCase().includes(q))
    );
  }, [search]);

  const addHistory = useCallback((val: string, from: UnitDef, to: UnitDef, res: string, cat: string) => {
    const entry: HistoryEntry = { value: val, from: from.symbol, to: to.symbol, result: res, category: cat, timestamp: Date.now() };
    const h = [entry, ...loadHistory().filter(e => !(e.from === from.symbol && e.to === to.symbol && e.value === val))].slice(0, 20);
    setHistory(h);
    saveHistory(h);
  }, []);

  // Debounced history add
  useEffect(() => {
    if (!inputVal || numVal === 0) return;
    const t = setTimeout(() => addHistory(inputVal, fromUnit, toUnit, resultStr, activeCat.name), 800);
    return () => clearTimeout(t);
  }, [inputVal, fromIdx, toIdx, activeCat.id, numVal, fromUnit, toUnit, resultStr, addHistory]);

  const handleSwap = () => {
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 400);
    const fi = fromIdx;
    setFromIdx(toIdx);
    setToIdx(fi);
    setInputVal(resultStr);
  };

  const toggleFav = () => {
    const next = isFav ? favorites.filter(f => f !== favKey) : [...favorites, favKey];
    setFavorites(next);
    saveFavorites(next);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCatChange = (cat: Category) => {
    setActiveCat(cat);
    setFromIdx(0);
    setToIdx(1);
    setInputVal('1');
  };

  const cc = categoryColors[activeCat.color] || categoryColors.blue;

  // Quick reference: convert current value to all units in category
  const quickRef = activeCat.units.map(u => ({
    name: u.name,
    symbol: u.symbol,
    value: formatNumber(convert(numVal, fromUnit, u)),
  }));

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> SheruTools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">Unit Converter</span>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-teal-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Unit Converter</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm ml-[52px]">Convert between 100+ units instantly. All calculations happen in your browser.</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search units or categories..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
          />
        </motion.div>

        {/* Category Pills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} ref={pillsRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filteredCategories.map(cat => {
            const cc2 = categoryColors[cat.color] || categoryColors.blue;
            const isActive = cat.id === activeCat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCatChange(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap border transition-all duration-200 ${
                  isActive
                    ? cc2.pillActive
                    : `border-transparent text-slate-500 dark:text-slate-400 ${cc2.pill}`
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </motion.div>

        {/* Main Converter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
            {/* From */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">From</label>
              <select
                value={fromIdx}
                onChange={e => setFromIdx(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {activeCat.units.map((u, i) => (
                  <option key={u.symbol} value={i}>{u.name} ({u.symbol})</option>
                ))}
              </select>
              <input
                type="text"
                inputMode="decimal"
                value={inputVal}
                onChange={e => {
                  const v = e.target.value;
                  if (v === '' || v === '-' || /^-?\d*\.?\d*$/.test(v)) setInputVal(v);
                }}
                placeholder="Enter value"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
              />
            </div>

            {/* Swap */}
            <div className="flex justify-center md:pb-3">
              <motion.button
                onClick={handleSwap}
                animate={{ rotate: swapAnim ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 flex items-center justify-center transition-colors"
              >
                <ArrowUpDown className="w-5 h-5 text-teal-500" />
              </motion.button>
            </div>

            {/* To */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">To</label>
              <select
                value={toIdx}
                onChange={e => setToIdx(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {activeCat.units.map((u, i) => (
                  <option key={u.symbol} value={i}>{u.name} ({u.symbol})</option>
                ))}
              </select>
              <div className="relative">
                <div className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-2xl font-bold text-slate-900 dark:text-white min-h-[60px] flex items-center">
                  <span className="truncate">{resultStr}</span>
                </div>
                <button onClick={handleCopy} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Formula + Fav */}
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-sm font-mono text-slate-600 dark:text-slate-300">
              {formula}
            </div>
            <button onClick={toggleFav} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-yellow-500 transition-colors">
              <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
              {isFav ? 'Favorited' : 'Favorite'}
            </button>
          </div>
        </motion.div>

        {/* Quick Reference */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-teal-500" />
            Quick Reference — {numVal} {fromUnit.symbol} equals
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {quickRef.map(r => (
              <div
                key={r.symbol}
                className={`px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                  r.symbol === toUnit.symbol
                    ? 'bg-teal-500/10 border-teal-500/30 dark:border-teal-500/20'
                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <div className="text-xs text-slate-500 dark:text-slate-400">{r.name}</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{r.value} <span className="text-xs font-normal text-slate-400">{r.symbol}</span></div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Favorites
            </h3>
            <div className="flex flex-wrap gap-2">
              {favorites.map(fk => {
                const [catId, fromSym, toSym] = fk.split(':');
                const cat = categories.find(c => c.id === catId);
                if (!cat) return null;
                const fUnit = cat.units.find(u => u.symbol === fromSym);
                const tUnit = cat.units.find(u => u.symbol === toSym);
                if (!fUnit || !tUnit) return null;
                return (
                  <button
                    key={fk}
                    onClick={() => {
                      handleCatChange(cat);
                      setTimeout(() => {
                        setFromIdx(cat.units.indexOf(fUnit));
                        setToIdx(cat.units.indexOf(tUnit));
                      }, 0);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                  >
                    {fromSym} → {toSym}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-3">
            <History className="w-4 h-4" />
            Recent Conversions ({history.length})
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {showHistory && history.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl"
              >
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {history.map((h, i) => (
                    <div key={i} className="px-4 py-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{h.value} {h.from}</span>
                        <span className="text-slate-400 mx-2">=</span>
                        <span className="font-semibold text-teal-600 dark:text-teal-400">{h.result} {h.to}</span>
                      </div>
                      <span className="text-xs text-slate-400">{h.category}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pro Upsell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative p-6 rounded-2xl bg-gradient-to-br from-teal-500/5 to-emerald-500/5 border border-teal-500/20 backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Unlock Pro Features</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Custom unit definitions, API access, and offline PWA mode. One-time purchase.</p>
              <a
                href="https://sherutools.lemonsqueezy.com/buy/unit-converter-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Get Pro — $2.99 <ArrowLeftRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
