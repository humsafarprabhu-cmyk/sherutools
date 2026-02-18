'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight, Trash2, Copy, FileText, Upload, Shield, ChevronRight,
  Check, Eye, Columns2, AlignJustify, ToggleLeft, ToggleRight, Sparkles,
  Lock, Download, GitMerge,
} from 'lucide-react';
import Link from 'next/link';
import * as Diff from 'diff';

type ViewMode = 'side-by-side' | 'unified' | 'inline';

const SAMPLE_ORIGINAL = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob", "Charlie"];

for (let i = 0; i < users.length; i++) {
  greet(users[i]);
}

// End of script`;

const SAMPLE_MODIFIED = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return { success: true, name };
}

const users = ["Alice", "Bob", "Charlie", "Diana"];

for (const user of users) {
  greet(user);
}

// Updated script
// Added default greeting parameter`;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function textStats(text: string) {
  const lines = text ? text.split('\n').length : 0;
  const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  return { lines, words, chars };
}

export default function TextComparePage() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied] = useState(false);
  const [swapAnim, setSwapAnim] = useState(false);
  const fileInputLeftRef = useRef<HTMLInputElement>(null);
  const fileInputRightRef = useRef<HTMLInputElement>(null);

  const debouncedOriginal = useDebounce(original, 300);
  const debouncedModified = useDebounce(modified, 300);

  const prepText = useCallback((t: string) => {
    let s = t;
    if (ignoreCase) s = s.toLowerCase();
    if (ignoreWhitespace) s = s.replace(/[ \t]+/g, ' ').replace(/^ +| +$/gm, '');
    return s;
  }, [ignoreCase, ignoreWhitespace]);

  const diffResult = useMemo(() => {
    const a = prepText(debouncedOriginal);
    const b = prepText(debouncedModified);
    return Diff.diffLines(a, b);
  }, [debouncedOriginal, debouncedModified, prepText]);

  const wordDiffResult = useMemo(() => {
    const a = prepText(debouncedOriginal);
    const b = prepText(debouncedModified);
    return Diff.diffWords(a, b);
  }, [debouncedOriginal, debouncedModified, prepText]);

  const stats = useMemo(() => {
    let added = 0, removed = 0, changed = 0;
    diffResult.forEach(part => {
      const lineCount = part.value.split('\n').filter(Boolean).length;
      if (part.added) added += lineCount;
      else if (part.removed) removed += lineCount;
    });
    const totalOriginal = debouncedOriginal.split('\n').filter(Boolean).length || 1;
    const similarity = totalOriginal > 0 ? Math.max(0, Math.round((1 - (added + removed) / Math.max(totalOriginal, debouncedModified.split('\n').filter(Boolean).length || 1)) * 100)) : 100;
    return { added, removed, changed, similarity: Math.max(0, Math.min(100, similarity)) };
  }, [diffResult, debouncedOriginal, debouncedModified]);

  const origStats = useMemo(() => textStats(original), [original]);
  const modStats = useMemo(() => textStats(modified), [modified]);

  const handleSwap = () => {
    setSwapAnim(true);
    setTimeout(() => setSwapAnim(false), 400);
    setOriginal(modified);
    setModified(original);
  };

  const handleClear = () => { setOriginal(''); setModified(''); };

  const handleSample = () => { setOriginal(SAMPLE_ORIGINAL); setModified(SAMPLE_MODIFIED); };

  const handleCopyDiff = async () => {
    const text = diffResult.map(p => {
      const prefix = p.added ? '+ ' : p.removed ? '- ' : '  ';
      return p.value.split('\n').filter(Boolean).map(l => prefix + l).join('\n');
    }).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (side: 'left' | 'right') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (side === 'left') setOriginal(text);
      else setModified(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const viewModes: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'side-by-side', label: 'Side by Side', icon: <Columns2 className="w-4 h-4" /> },
    { key: 'unified', label: 'Unified', icon: <AlignJustify className="w-4 h-4" /> },
    { key: 'inline', label: 'Inline', icon: <Eye className="w-4 h-4" /> },
  ];

  const renderLineNumbers = (text: string) => {
    const lines = text.split('\n');
    return lines.map((_, i) => (
      <div key={i} className="text-right pr-3 text-xs text-slate-400 dark:text-slate-600 select-none leading-6">{i + 1}</div>
    ));
  };

  const renderDiffSideBySide = () => {
    const leftLines: { text: string; type: 'removed' | 'unchanged' | 'empty' }[] = [];
    const rightLines: { text: string; type: 'added' | 'unchanged' | 'empty' }[] = [];

    diffResult.forEach(part => {
      const lines = part.value.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();

      if (part.added) {
        lines.forEach(l => {
          leftLines.push({ text: '', type: 'empty' });
          rightLines.push({ text: l, type: 'added' });
        });
      } else if (part.removed) {
        lines.forEach(l => {
          leftLines.push({ text: l, type: 'removed' });
          rightLines.push({ text: '', type: 'empty' });
        });
      } else {
        lines.forEach(l => {
          leftLines.push({ text: l, type: 'unchanged' });
          rightLines.push({ text: l, type: 'unchanged' });
        });
      }
    });

    const bgClass = (type: string) => {
      if (type === 'added') return 'bg-emerald-500/10 dark:bg-emerald-500/10';
      if (type === 'removed') return 'bg-red-500/10 dark:bg-red-500/10';
      if (type === 'empty') return 'bg-slate-100/50 dark:bg-white/[0.02]';
      return '';
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-px bg-slate-200 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
        {[leftLines, rightLines].map((lines, side) => (
          <div key={side} className="bg-white dark:bg-slate-950 overflow-auto max-h-[500px] custom-scrollbar">
            {lines.map((line, i) => (
              <div key={i} className={`flex ${bgClass(line.type)}`}>
                <div className="w-10 shrink-0 text-right pr-2 text-xs text-slate-400 dark:text-slate-600 select-none leading-6 border-r border-slate-200 dark:border-white/5">
                  {line.type !== 'empty' ? i + 1 : ''}
                </div>
                <div className="px-3 text-sm font-mono leading-6 whitespace-pre-wrap break-all flex-1">
                  {line.type === 'added' && <span className="text-emerald-700 dark:text-emerald-400">+ </span>}
                  {line.type === 'removed' && <span className="text-red-700 dark:text-red-400">- </span>}
                  <span className={
                    line.type === 'added' ? 'text-emerald-800 dark:text-emerald-300' :
                    line.type === 'removed' ? 'text-red-800 dark:text-red-300' :
                    'text-slate-700 dark:text-slate-300'
                  }>{line.text}</span>
                </div>
              </div>
            ))}
            {lines.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">No content</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderDiffUnified = () => (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 max-h-[500px] overflow-auto custom-scrollbar">
      {diffResult.map((part, i) => {
        const lines = part.value.split('\n');
        if (lines[lines.length - 1] === '') lines.pop();
        return lines.map((line, j) => (
          <div key={`${i}-${j}`} className={`flex ${
            part.added ? 'bg-emerald-500/10' : part.removed ? 'bg-red-500/10' : ''
          }`}>
            <div className="w-8 shrink-0 text-right pr-2 text-xs text-slate-400 dark:text-slate-600 select-none leading-6 border-r border-slate-200 dark:border-white/5">
              {i * 100 + j + 1}
            </div>
            <div className="w-6 shrink-0 text-center text-xs font-mono leading-6 select-none">
              {part.added ? <span className="text-emerald-500">+</span> : part.removed ? <span className="text-red-500">-</span> : ' '}
            </div>
            <div className={`px-2 text-sm font-mono leading-6 whitespace-pre-wrap break-all flex-1 ${
              part.added ? 'text-emerald-800 dark:text-emerald-300' :
              part.removed ? 'text-red-800 dark:text-red-300' :
              'text-slate-700 dark:text-slate-300'
            }`}>{line}</div>
          </div>
        ));
      })}
    </div>
  );

  const renderDiffInline = () => (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-4 max-h-[500px] overflow-auto custom-scrollbar">
      <div className="font-mono text-sm leading-7 whitespace-pre-wrap break-all">
        {wordDiffResult.map((part, i) => (
          <span key={i} className={
            part.added ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded px-0.5' :
            part.removed ? 'bg-red-500/20 text-red-800 dark:text-red-300 line-through rounded px-0.5' :
            'text-slate-700 dark:text-slate-300'
          }>{part.value}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white font-medium">Text Compare</span>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Text <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Compare</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Compare two texts side-by-side with real-time diff highlighting</p>
        </motion.div>

        {/* Controls Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
          {/* View mode toggle */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-white/5 p-0.5">
            {viewModes.map(vm => (
              <button key={vm.key} onClick={() => setViewMode(vm.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === vm.key
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}>
                {vm.icon} <span className="hidden sm:inline">{vm.label}</span>
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          {/* Toggles */}
          <button onClick={() => setIgnoreWhitespace(!ignoreWhitespace)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              ignoreWhitespace ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}>
            {ignoreWhitespace ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">Ignore Whitespace</span>
          </button>
          <button onClick={() => setIgnoreCase(!ignoreCase)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              ignoreCase ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
            }`}>
            {ignoreCase ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">Ignore Case</span>
          </button>

          <div className="flex-1" />

          {/* Action buttons */}
          <button onClick={handleSample} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
            <Sparkles className="w-4 h-4" /> Sample
          </button>
          <button onClick={handleCopyDiff} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Diff'}
          </button>
          <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500/70 hover:bg-red-500/10 transition-all">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        </motion.div>

        {/* Text Areas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 mb-6">
          {/* Left - Original */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Original</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{origStats.lines}L · {origStats.words}W · {origStats.chars}C</span>
                <button onClick={() => fileInputLeftRef.current?.click()}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <input ref={fileInputLeftRef} type="file" accept=".txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.py" className="hidden" onChange={handleFileUpload('left')} />
              </div>
            </div>
            <textarea
              value={original}
              onChange={e => setOriginal(e.target.value)}
              placeholder="Paste original text here..."
              className="w-full h-64 md:h-80 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all custom-scrollbar"
            />
          </div>

          {/* Swap Button */}
          <div className="flex md:flex-col items-center justify-center">
            <motion.button
              onClick={handleSwap}
              animate={{ rotate: swapAnim ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              className="p-2.5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 transition-all"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Right - Modified */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Modified</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{modStats.lines}L · {modStats.words}W · {modStats.chars}C</span>
                <button onClick={() => fileInputRightRef.current?.click()}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <input ref={fileInputRightRef} type="file" accept=".txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.py" className="hidden" onChange={handleFileUpload('right')} />
              </div>
            </div>
            <textarea
              value={modified}
              onChange={e => setModified(e.target.value)}
              placeholder="Paste modified text here..."
              className="w-full h-64 md:h-80 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all custom-scrollbar"
            />
          </div>
        </motion.div>

        {/* Stats Bar */}
        {(original || modified) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-4 mb-6 p-3 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.added}</span> added</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-600 dark:text-slate-400"><span className="font-semibold text-red-600 dark:text-red-400">{stats.removed}</span> removed</span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 dark:text-slate-400">Similarity: <span className="font-semibold text-slate-900 dark:text-white">{stats.similarity}%</span></span>
              <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.similarity}%` }}
                  className={`h-full rounded-full ${stats.similarity > 70 ? 'bg-emerald-500' : stats.similarity > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Diff Output */}
        {(original || modified) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <AnimatePresence mode="wait">
              <motion.div key={viewMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {viewMode === 'side-by-side' && renderDiffSideBySide()}
                {viewMode === 'unified' && renderDiffUnified()}
                {viewMode === 'inline' && renderDiffInline()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Privacy Badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mt-8 mb-8 text-xs text-slate-400 dark:text-slate-500">
          <Shield className="w-3.5 h-3.5" />
          All comparisons happen in your browser — nothing is sent to any server
        </motion.div>

        {/* Pro Upsell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto p-6 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/10 dark:border-cyan-500/10 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-cyan-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Upgrade to Pro</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Export diffs as PDF/HTML, merge changes with accept/reject — one-time purchase.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { icon: Download, label: 'Export as PDF' },
                  { icon: FileText, label: 'Export as HTML' },
                  { icon: GitMerge, label: 'Merge Tool' },
                ].map(f => (
                  <span key={f.label} className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/50 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-400">
                    <f.icon className="w-3 h-3" /> {f.label}
                  </span>
                ))}
              </div>
              <a href="https://sherutools.lemonsqueezy.com" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95">
                Get Pro — $3.99 <Sparkles className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"How does the Text Compare tool work?","answer":"Paste two texts side by side and instantly see differences highlighted. Additions, deletions, and changes are color-coded."},{"question":"Can I compare code files?","answer":"Yes! The tool works great for comparing code, documents, or any text content with diff highlighting."},{"question":"Is the Text Compare tool free?","answer":"Yes, completely free with no limits. Compare unlimited texts with no sign-up required."},{"question":"Is my text data stored anywhere?","answer":"No, all comparison happens locally in your browser. Your text is never sent to any server."}]} />
      <RelatedTools tools={[{"name":"Word Counter","href":"/word-counter","description":"Count words and characters","icon":"📊"},{"name":"AI Rewriter","href":"/ai-rewriter","description":"Rewrite text with AI","icon":"✍️"},{"name":"Markdown Editor","href":"/markdown-editor","description":"Write and preview Markdown","icon":"📝"},{"name":"JSON Formatter","href":"/json-formatter","description":"Format and validate JSON","icon":"📋"}]} />
      </div>
    </div>
  );
}
