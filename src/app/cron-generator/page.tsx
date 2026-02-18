'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ChevronRight, Copy, Check, Clock, Calendar, Play, Zap, ChevronDown, ChevronUp,
  Lock, Star, Sparkles, RotateCcw, BookOpen,
} from 'lucide-react';

/* ════════════════════════════════════════
   Constants
   ════════════════════════════════════════ */
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

type FieldType = 'every' | 'specific' | 'range' | 'step';

interface FieldState {
  type: FieldType;
  specific: number[];
  rangeStart: number;
  rangeEnd: number;
  step: number;
}

const defaultField = (min: number, max: number): FieldState => ({
  type: 'every',
  specific: [min],
  rangeStart: min,
  rangeEnd: max,
  step: 1,
});

/* ════════════════════════════════════════
   Cron Logic
   ════════════════════════════════════════ */
function fieldToString(f: FieldState): string {
  switch (f.type) {
    case 'every': return '*';
    case 'specific': return f.specific.length ? f.specific.sort((a,b)=>a-b).join(',') : '*';
    case 'range': return `${f.rangeStart}-${f.rangeEnd}`;
    case 'step': return f.step === 1 ? '*' : `*/${f.step}`;
  }
}

function describeField(f: FieldState, unit: string, names?: string[]): string {
  const nameOf = (v: number) => names ? names[v] : String(v);
  switch (f.type) {
    case 'every': return `every ${unit}`;
    case 'specific': {
      const vals = f.specific.sort((a,b)=>a-b).map(nameOf);
      return vals.length === 1 ? `at ${unit} ${vals[0]}` : `at ${unit} ${vals.join(', ')}`;
    }
    case 'range': return `from ${unit} ${nameOf(f.rangeStart)} through ${nameOf(f.rangeEnd)}`;
    case 'step': return `every ${f.step} ${unit}${f.step > 1 ? 's' : ''}`;
  }
}

function describeCron(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 6) return 'Invalid cron expression';

  const hasSeconds = parts.length === 6;
  const offset = hasSeconds ? 1 : 0;
  const [min, hour, dom, mon, dow] = parts.slice(offset);
  const sec = hasSeconds ? parts[0] : null;

  const pieces: string[] = [];
  if (sec && sec !== '*' && sec !== '0') pieces.push(`At second ${sec}`);

  // Minute
  if (min === '*') pieces.push('Every minute');
  else if (min.startsWith('*/')) pieces.push(`Every ${min.slice(2)} minutes`);
  else if (min.includes(',')) pieces.push(`At minutes ${min}`);
  else if (min.includes('-')) pieces.push(`Minutes ${min}`);
  else pieces.push(`At minute ${min}`);

  // Hour
  if (hour === '*') { /* every hour, implied */ }
  else if (hour.startsWith('*/')) pieces.push(`every ${hour.slice(2)} hours`);
  else if (hour.includes(',')) pieces.push(`at hours ${hour}`);
  else if (hour.includes('-')) pieces.push(`during hours ${hour}`);
  else {
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    pieces.push(`at ${h12}${ampm}`);
  }

  // DOM
  if (dom !== '*') {
    if (dom.startsWith('*/')) pieces.push(`every ${dom.slice(2)} days`);
    else if (dom.includes(',')) pieces.push(`on days ${dom} of the month`);
    else if (dom.includes('-')) pieces.push(`on days ${dom} of the month`);
    else pieces.push(`on day ${dom} of the month`);
  }

  // Month
  if (mon !== '*') {
    const monthStr = mon.split(',').map(m => {
      const n = parseInt(m);
      return isNaN(n) ? m : (MONTH_NAMES[n - 1] || m);
    }).join(', ');
    pieces.push(`in ${monthStr}`);
  }

  // DOW
  if (dow !== '*') {
    if (dow === '1-5') pieces.push('on weekdays');
    else if (dow === '0,6' || dow === '6,0') pieces.push('on weekends');
    else {
      const dayStr = dow.split(',').map(d => {
        const n = parseInt(d);
        return isNaN(n) ? d : (DAY_NAMES[n] || d);
      }).join(', ');
      pieces.push(`on ${dayStr}`);
    }
  }

  return pieces.join(', ') || 'Every minute';
}

function getNextExecutions(expression: string, count: number = 10): Date[] {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5) return [];

  const hasSeconds = parts.length === 6;
  const offset = hasSeconds ? 1 : 0;
  const [minStr, hourStr, domStr, monStr, dowStr] = parts.slice(offset);

  const expandField = (field: string, min: number, max: number): number[] => {
    if (field === '*') return Array.from({length: max - min + 1}, (_, i) => i + min);
    const result: number[] = [];
    for (const part of field.split(',')) {
      if (part.includes('/')) {
        const [base, stepStr] = part.split('/');
        const step = parseInt(stepStr);
        const start = base === '*' ? min : parseInt(base);
        for (let i = start; i <= max; i += step) result.push(i);
      } else if (part.includes('-')) {
        const [a, b] = part.split('-').map(Number);
        for (let i = a; i <= b; i++) result.push(i);
      } else {
        result.push(parseInt(part));
      }
    }
    return result.filter(n => n >= min && n <= max);
  };

  const minutes = expandField(minStr, 0, 59);
  const hours = expandField(hourStr, 0, 23);
  const doms = expandField(domStr, 1, 31);
  const months = expandField(monStr, 1, 12);
  const dows = expandField(dowStr, 0, 6);

  const results: Date[] = [];
  const now = new Date();
  const cursor = new Date(now);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIterations = 525960; // ~1 year of minutes
  for (let i = 0; i < maxIterations && results.length < count; i++) {
    const m = cursor.getMonth() + 1;
    const d = cursor.getDate();
    const dow = cursor.getDay();
    const h = cursor.getHours();
    const min = cursor.getMinutes();

    if (months.includes(m) && doms.includes(d) && dows.includes(dow) && hours.includes(h) && minutes.includes(min)) {
      results.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return results;
}

/* ════════════════════════════════════════
   Presets
   ════════════════════════════════════════ */
const PRESETS = [
  { label: 'Every minute', expr: '* * * * *', icon: '⚡' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *', icon: '🕐' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *', icon: '🕒' },
  { label: 'Hourly', expr: '0 * * * *', icon: '🕛' },
  { label: 'Daily at midnight', expr: '0 0 * * *', icon: '🌙' },
  { label: 'Daily at noon', expr: '0 12 * * *', icon: '☀️' },
  { label: 'Weekly Mon 9AM', expr: '0 9 * * 1', icon: '📅' },
  { label: 'Monthly 1st', expr: '0 0 1 * *', icon: '📆' },
  { label: 'Yearly Jan 1st', expr: '0 0 1 1 *', icon: '🎆' },
  { label: 'Weekdays only', expr: '0 9 * * 1-5', icon: '💼' },
  { label: 'Weekends only', expr: '0 10 * * 0,6', icon: '🏖️' },
  { label: 'Every 30 min', expr: '*/30 * * * *', icon: '⏰' },
];

/* ════════════════════════════════════════
   Cheat Sheet
   ════════════════════════════════════════ */
const CHEAT_SHEET = [
  { category: 'Special Characters', items: [
    { token: '*', desc: 'Any value' },
    { token: ',', desc: 'Value list separator' },
    { token: '-', desc: 'Range of values' },
    { token: '/', desc: 'Step values' },
  ]},
  { category: 'Fields (left to right)', items: [
    { token: 'Minute', desc: '0-59' },
    { token: 'Hour', desc: '0-23' },
    { token: 'Day of Month', desc: '1-31' },
    { token: 'Month', desc: '1-12 or JAN-DEC' },
    { token: 'Day of Week', desc: '0-6 or SUN-SAT (0=Sunday)' },
  ]},
  { category: 'Examples', items: [
    { token: '*/5 * * * *', desc: 'Every 5 minutes' },
    { token: '0 */2 * * *', desc: 'Every 2 hours' },
    { token: '0 9-17 * * 1-5', desc: 'Every hour 9AM-5PM weekdays' },
    { token: '0 0 1,15 * *', desc: '1st and 15th of month at midnight' },
    { token: '30 4 * * SUN', desc: '4:30 AM every Sunday' },
  ]},
];

/* ════════════════════════════════════════
   Field Selector Component
   ════════════════════════════════════════ */
function FieldSelector({ label, min, max, field, onChange, names }: {
  label: string; min: number; max: number; field: FieldState;
  onChange: (f: FieldState) => void; names?: string[];
}) {
  const allValues = Array.from({length: max - min + 1}, (_, i) => i + min);

  const toggleSpecific = (v: number) => {
    const current = field.specific;
    const next = current.includes(v) ? current.filter(x => x !== v) : [...current, v];
    onChange({ ...field, specific: next.length ? next : [min] });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</label>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
          {fieldToString(field)}
        </span>
      </div>

      {/* Type selector */}
      <div className="flex gap-1.5 flex-wrap">
        {(['every', 'specific', 'range', 'step'] as FieldType[]).map(t => (
          <button
            key={t}
            onClick={() => onChange({ ...field, type: t })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              field.type === t
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            {t === 'every' ? 'Every' : t === 'specific' ? 'Specific' : t === 'range' ? 'Range' : 'Step'}
          </button>
        ))}
      </div>

      {/* Type-specific controls */}
      <AnimatePresence mode="wait">
        {field.type === 'specific' && (
          <motion.div
            key="specific"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5"
          >
            {allValues.map(v => (
              <button
                key={v}
                onClick={() => toggleSpecific(v)}
                className={`min-w-[2.5rem] px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  field.specific.includes(v)
                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {names ? names[v - min] : v}
              </button>
            ))}
          </motion.div>
        )}

        {field.type === 'range' && (
          <motion.div
            key="range"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 block">From</label>
              <select
                value={field.rangeStart}
                onChange={e => onChange({ ...field, rangeStart: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200"
              >
                {allValues.map(v => <option key={v} value={v}>{names ? names[v - min] : v}</option>)}
              </select>
            </div>
            <span className="text-slate-400 mt-4">→</span>
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 block">To</label>
              <select
                value={field.rangeEnd}
                onChange={e => onChange({ ...field, rangeEnd: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200"
              >
                {allValues.map(v => <option key={v} value={v}>{names ? names[v - min] : v}</option>)}
              </select>
            </div>
          </motion.div>
        )}

        {field.type === 'step' && (
          <motion.div
            key="step"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3"
          >
            <label className="text-sm text-slate-500 dark:text-slate-400">Every</label>
            <input
              type="number"
              min={1}
              max={max}
              value={field.step}
              onChange={e => onChange({ ...field, step: Math.max(1, Math.min(max, Number(e.target.value))) })}
              className="w-20 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 text-center"
            />
            <label className="text-sm text-slate-500 dark:text-slate-400">{label.toLowerCase()}(s)</label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ════════════════════════════════════════
   Main Component
   ════════════════════════════════════════ */
export default function CronGeneratorPage() {
  const [mode, setMode] = useState<'builder' | 'parser'>('builder');
  const [copied, setCopied] = useState(false);
  const [cheatOpen, setCheatOpen] = useState(false);
  const [parseInput, setParseInput] = useState('');

  // Builder state
  const [minute, setMinute] = useState<FieldState>(defaultField(0, 59));
  const [hour, setHour] = useState<FieldState>(defaultField(0, 23));
  const [dom, setDom] = useState<FieldState>(defaultField(1, 31));
  const [month, setMonth] = useState<FieldState>(defaultField(1, 12));
  const [dow, setDow] = useState<FieldState>(defaultField(0, 6));

  const expression = useMemo(() => {
    return [minute, hour, dom, month, dow].map(fieldToString).join(' ');
  }, [minute, hour, dom, month, dow]);

  const activeExpression = mode === 'builder' ? expression : parseInput.trim();
  const description = useMemo(() => describeCron(activeExpression || '* * * * *'), [activeExpression]);
  const nextRuns = useMemo(() => getNextExecutions(activeExpression || '* * * * *', 10), [activeExpression]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(activeExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [activeExpression]);

  const applyPreset = useCallback((expr: string) => {
    if (mode === 'parser') {
      setParseInput(expr);
      return;
    }
    const parts = expr.split(' ');
    const parseField = (s: string, min: number, max: number): FieldState => {
      if (s === '*') return defaultField(min, max);
      if (s.startsWith('*/')) return { type: 'step', specific: [min], rangeStart: min, rangeEnd: max, step: parseInt(s.slice(2)) };
      if (s.includes('-')) {
        const [a, b] = s.split('-').map(Number);
        return { type: 'range', specific: [min], rangeStart: a, rangeEnd: b, step: 1 };
      }
      if (s.includes(',')) {
        return { type: 'specific', specific: s.split(',').map(Number), rangeStart: min, rangeEnd: max, step: 1 };
      }
      return { type: 'specific', specific: [parseInt(s)], rangeStart: min, rangeEnd: max, step: 1 };
    };
    setMinute(parseField(parts[0], 0, 59));
    setHour(parseField(parts[1], 0, 23));
    setDom(parseField(parts[2], 1, 31));
    setMonth(parseField(parts[3], 1, 12));
    setDow(parseField(parts[4], 0, 6));
  }, [mode]);

  const resetAll = useCallback(() => {
    setMinute(defaultField(0, 59));
    setHour(defaultField(0, 23));
    setDom(defaultField(1, 31));
    setMonth(defaultField(1, 12));
    setDow(defaultField(0, 6));
    setParseInput('');
  }, []);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300">Cron Generator</span>
        </div>
      </div>

      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 pt-8 pb-6 text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-500 dark:text-slate-400 mb-4">
          <Clock className="w-3.5 h-3.5" /> Developer Tool
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3">
          Cron Expression{' '}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Generator
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Build cron expressions visually or parse existing ones. See next execution times instantly.
        </p>
      </motion.section>

      <div className="max-w-6xl mx-auto px-4 pb-20 space-y-6">
        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            {(['builder', 'parser'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === m
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {m === 'builder' ? '🔧 Visual Builder' : '📝 Parse Expression'}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Builder / Parser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Expression Display */}
            <div className="relative p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Cron Expression
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetAll}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-sm shadow-blue-500/25"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {mode === 'parser' ? (
                <input
                  type="text"
                  value={parseInput}
                  onChange={e => setParseInput(e.target.value)}
                  placeholder="Paste cron expression (e.g. */5 * * * *)"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-lg md:text-xl font-mono text-emerald-400 placeholder-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
                />
              ) : (
                <div className="px-4 py-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-700">
                  <div className="text-lg md:text-2xl font-mono text-emerald-400 tracking-wider text-center">
                    {expression}
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-[10px] uppercase tracking-widest text-slate-500">
                    <span>MIN</span><span>HOUR</span><span>DOM</span><span>MON</span><span>DOW</span>
                  </div>
                </div>
              )}

              {/* Human-readable description */}
              <div className="mt-3 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <span className="font-semibold">Runs:</span> {description}
                </p>
              </div>
            </div>

            {/* Visual Builder Fields */}
            {mode === 'builder' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {[
                  { label: 'Minute', min: 0, max: 59, field: minute, set: setMinute },
                  { label: 'Hour', min: 0, max: 23, field: hour, set: setHour },
                  { label: 'Day of Month', min: 1, max: 31, field: dom, set: setDom },
                  { label: 'Month', min: 1, max: 12, field: month, set: setMonth, names: MONTHS },
                  { label: 'Day of Week', min: 0, max: 6, field: dow, set: setDow, names: DAYS },
                ].map(({ label, min, max, field, set, names }) => (
                  <div key={label} className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
                    <FieldSelector label={label} min={min} max={max} field={field} onChange={set} names={names} />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Presets */}
            <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> Quick Presets
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {PRESETS.map(p => (
                  <button
                    key={p.expr}
                    onClick={() => applyPreset(p.expr)}
                    className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                      activeExpression === p.expr
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cheat Sheet */}
            <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden">
              <button
                onClick={() => setCheatOpen(!cheatOpen)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500" /> Cron Cheat Sheet
                </h3>
                {cheatOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {cheatOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4">
                      {CHEAT_SHEET.map(section => (
                        <div key={section.category}>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{section.category}</h4>
                          <div className="space-y-1">
                            {section.items.map(item => (
                              <div key={item.token} className="flex items-center gap-3 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <code className="text-xs font-mono font-bold text-emerald-500 dark:text-emerald-400 min-w-[8rem]">{item.token}</code>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right: Next Executions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Next 10 runs */}
            <div className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl sticky top-20">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-500" /> Next 10 Executions
              </h3>
              <div className="space-y-2">
                {nextRuns.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No upcoming executions found</p>
                ) : (
                  nextRuns.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-emerald-500">{i + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
                          {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Pro upsell */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-purple-300">Pro Features</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-medium">$2.99</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-purple-400" /> 6-field with seconds support</li>
                <li className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-purple-400" /> Export to iCal format</li>
                <li className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-purple-400" /> Save expression library</li>
                <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-purple-400" /> Expression history</li>
              </ul>
              <button className="mt-4 w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/25">
                Upgrade to Pro
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
