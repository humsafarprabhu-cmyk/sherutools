'use client';

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronRight, Copy, Check, Search, BookOpen, Replace, Sparkles,
  Download, Share2, X, ChevronDown, ChevronUp, Lock, Terminal, Lightbulb,
} from 'lucide-react';

/* ════════════════════════════════════════════
   Types
   ════════════════════════════════════════════ */
interface MatchResult {
  match: string;
  index: number;
  length: number;
  groups: Record<string, string | undefined>;
  numbered: string[];
}

/* ════════════════════════════════════════════
   Common Patterns Library
   ════════════════════════════════════════════ */
const PATTERN_LIBRARY = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', category: 'Common' },
  { name: 'URL', pattern: 'https?:\\/\\/[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+', flags: 'g', category: 'Common' },
  { name: 'Phone (US)', pattern: '\\+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g', category: 'Common' },
  { name: 'IP Address (v4)', pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b', flags: 'g', category: 'Common' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g', category: 'Common' },
  { name: 'Time (HH:MM)', pattern: '(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?', flags: 'g', category: 'Common' },
  { name: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'gi', category: 'Common' },
  { name: 'Credit Card', pattern: '\\b(?:4\\d{3}|5[1-5]\\d{2}|3[47]\\d{2}|6(?:011|5\\d{2}))[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{1,4}\\b', flags: 'g', category: 'Common' },
  { name: 'ZIP Code (US)', pattern: '\\b\\d{5}(?:-\\d{4})?\\b', flags: 'g', category: 'Common' },
  { name: 'HTML Tag', pattern: '<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^>]*)?\\/?>',  flags: 'g', category: 'Common' },
  { name: 'Username', pattern: '[a-zA-Z][a-zA-Z0-9_-]{2,15}', flags: 'g', category: 'Common' },
  { name: 'Strong Password', pattern: '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}', flags: '', category: 'Common' },
];

/* ════════════════════════════════════════════
   Cheat Sheet
   ════════════════════════════════════════════ */
const CHEAT_SHEET: { category: string; items: { token: string; desc: string }[] }[] = [
  {
    category: 'Character Classes',
    items: [
      { token: '.', desc: 'Any character (except newline)' },
      { token: '\\d', desc: 'Digit [0-9]' },
      { token: '\\D', desc: 'Not a digit' },
      { token: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
      { token: '\\W', desc: 'Not a word char' },
      { token: '\\s', desc: 'Whitespace' },
      { token: '\\S', desc: 'Not whitespace' },
      { token: '[abc]', desc: 'Any of a, b, or c' },
      { token: '[^abc]', desc: 'Not a, b, or c' },
      { token: '[a-z]', desc: 'Range a to z' },
    ],
  },
  {
    category: 'Quantifiers',
    items: [
      { token: '*', desc: '0 or more' },
      { token: '+', desc: '1 or more' },
      { token: '?', desc: '0 or 1' },
      { token: '{n}', desc: 'Exactly n' },
      { token: '{n,}', desc: 'n or more' },
      { token: '{n,m}', desc: 'Between n and m' },
      { token: '*?', desc: '0+ (lazy)' },
      { token: '+?', desc: '1+ (lazy)' },
    ],
  },
  {
    category: 'Anchors & Boundaries',
    items: [
      { token: '^', desc: 'Start of string/line' },
      { token: '$', desc: 'End of string/line' },
      { token: '\\b', desc: 'Word boundary' },
      { token: '\\B', desc: 'Not word boundary' },
    ],
  },
  {
    category: 'Groups & Lookaround',
    items: [
      { token: '(abc)', desc: 'Capture group' },
      { token: '(?<name>abc)', desc: 'Named capture group' },
      { token: '(?:abc)', desc: 'Non-capturing group' },
      { token: '(?=abc)', desc: 'Positive lookahead' },
      { token: '(?!abc)', desc: 'Negative lookahead' },
      { token: '(?<=abc)', desc: 'Positive lookbehind' },
      { token: '(?<!abc)', desc: 'Negative lookbehind' },
      { token: 'a|b', desc: 'Alternation (a or b)' },
    ],
  },
];

/* ════════════════════════════════════════════
   Regex Explainer (client-side parser)
   ════════════════════════════════════════════ */
function explainRegex(pattern: string): string[] {
  if (!pattern) return [];
  const explanations: string[] = [];
  let i = 0;
  const len = pattern.length;

  while (i < len) {
    const ch = pattern[i];

    if (ch === '^') { explanations.push('^ — Start of string/line'); i++; }
    else if (ch === '$') { explanations.push('$ — End of string/line'); i++; }
    else if (ch === '.') { explanations.push('. — Any character (except newline)'); i++; }
    else if (ch === '\\' && i + 1 < len) {
      const next = pattern[i + 1];
      const map: Record<string, string> = {
        d: '\\d — Digit [0-9]', D: '\\D — Non-digit', w: '\\w — Word character [a-zA-Z0-9_]',
        W: '\\W — Non-word character', s: '\\s — Whitespace', S: '\\S — Non-whitespace',
        b: '\\b — Word boundary', B: '\\B — Non-word boundary', n: '\\n — Newline',
        t: '\\t — Tab', r: '\\r — Carriage return',
      };
      if (map[next]) { explanations.push(map[next]); }
      else { explanations.push(`\\${next} — Literal "${next}"`); }
      i += 2;
    }
    else if (ch === '[') {
      const end = pattern.indexOf(']', i + 1);
      if (end === -1) { explanations.push(`[ — Unclosed character class`); i++; }
      else {
        const cls = pattern.slice(i, end + 1);
        const neg = pattern[i + 1] === '^';
        explanations.push(`${cls} — ${neg ? 'Not matching' : 'Match'} any character in the set`);
        i = end + 1;
      }
    }
    else if (ch === '(') {
      if (pattern.slice(i, i + 3) === '(?:') { explanations.push('(?:...) — Non-capturing group'); i += 3; }
      else if (pattern.slice(i, i + 4) === '(?<=') { explanations.push('(?<=...) — Positive lookbehind'); i += 4; }
      else if (pattern.slice(i, i + 4) === '(?<!') { explanations.push('(?<!...) — Negative lookbehind'); i += 4; }
      else if (pattern.slice(i, i + 3) === '(?=') { explanations.push('(?=...) — Positive lookahead'); i += 3; }
      else if (pattern.slice(i, i + 3) === '(?!') { explanations.push('(?!...) — Negative lookahead'); i += 3; }
      else if (pattern.slice(i, i + 3) === '(?<') {
        const nameEnd = pattern.indexOf('>', i + 3);
        if (nameEnd !== -1) {
          const name = pattern.slice(i + 3, nameEnd);
          explanations.push(`(?<${name}>...) — Named capture group "${name}"`);
          i = nameEnd + 1;
        } else { explanations.push('( — Start capture group'); i++; }
      }
      else { explanations.push('( — Start capture group'); i++; }
    }
    else if (ch === ')') { explanations.push(') — End group'); i++; }
    else if (ch === '*') {
      const lazy = pattern[i + 1] === '?';
      explanations.push(lazy ? '*? — 0 or more (lazy)' : '* — 0 or more (greedy)');
      i += lazy ? 2 : 1;
    }
    else if (ch === '+') {
      const lazy = pattern[i + 1] === '?';
      explanations.push(lazy ? '+? — 1 or more (lazy)' : '+ — 1 or more (greedy)');
      i += lazy ? 2 : 1;
    }
    else if (ch === '?') { explanations.push('? — Optional (0 or 1)'); i++; }
    else if (ch === '{') {
      const end = pattern.indexOf('}', i);
      if (end !== -1) {
        const q = pattern.slice(i, end + 1);
        explanations.push(`${q} — Repeat quantifier`);
        i = end + 1;
      } else { explanations.push(`{ — Literal "{"`); i++; }
    }
    else if (ch === '|') { explanations.push('| — OR (alternation)'); i++; }
    else {
      // Collect consecutive literals
      let literal = '';
      while (i < len && !'\\^$.|?*+()[]{}' .includes(pattern[i])) {
        literal += pattern[i]; i++;
      }
      if (literal.length > 1) explanations.push(`"${literal}" — Literal text`);
      else if (literal.length === 1) explanations.push(`"${literal}" — Literal character`);
    }
  }

  return explanations;
}

/* ════════════════════════════════════════════
   Highlight Matches in Test String
   ════════════════════════════════════════════ */
const MATCH_COLORS = [
  'bg-lime-400/30 dark:bg-lime-500/30 text-lime-900 dark:text-lime-100',
  'bg-cyan-400/30 dark:bg-cyan-500/30 text-cyan-900 dark:text-cyan-100',
  'bg-amber-400/30 dark:bg-amber-500/30 text-amber-900 dark:text-amber-100',
  'bg-pink-400/30 dark:bg-pink-500/30 text-pink-900 dark:text-pink-100',
  'bg-violet-400/30 dark:bg-violet-500/30 text-violet-900 dark:text-violet-100',
];

function buildHighlightedHTML(text: string, matches: MatchResult[]): string {
  if (!matches.length) return escapeHtml(text);
  // Sort by index
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  let html = '';
  let lastEnd = 0;

  sorted.forEach((m, i) => {
    if (m.index < lastEnd) return; // skip overlapping
    html += escapeHtml(text.slice(lastEnd, m.index));
    const color = MATCH_COLORS[i % MATCH_COLORS.length];
    html += `<mark class="${color} rounded px-0.5">${escapeHtml(m.match)}</mark>`;
    lastEnd = m.index + m.length;
  });

  html += escapeHtml(text.slice(lastEnd));
  return html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ════════════════════════════════════════════
   Copy Button
   ════════════════════════════════════════════ */
function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

/* ════════════════════════════════════════════
   Main Component
   ════════════════════════════════════════════ */
function RegexTesterInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pattern, setPattern] = useState(searchParams.get('r') || '');
  const [testString, setTestString] = useState(searchParams.get('t') || 'Hello World! Test your regex here.\nEmail: user@example.com\nPhone: 555-123-4567\nIP: 192.168.1.1');
  const [flags, setFlags] = useState<Record<string, boolean>>({
    g: searchParams.get('f')?.includes('g') ?? true,
    i: searchParams.get('f')?.includes('i') ?? false,
    m: searchParams.get('f')?.includes('m') ?? false,
    s: searchParams.get('f')?.includes('s') ?? false,
    u: searchParams.get('f')?.includes('u') ?? false,
  });
  const [replacementStr, setReplacementStr] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [regexError, setRegexError] = useState('');
  const [patternSearch, setPatternSearch] = useState('');

  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  const flagStr = useMemo(() => Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join(''), [flags]);

  // Execute regex with debounce
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [replaceResult, setReplaceResult] = useState('');

  const executeRegex = useCallback(() => {
    if (!pattern) { setMatches([]); setRegexError(''); setReplaceResult(''); return; }
    try {
      const re = new RegExp(pattern, flagStr);
      setRegexError('');

      const results: MatchResult[] = [];
      if (flagStr.includes('g')) {
        const iter = testString.matchAll(re);
        for (const m of iter) {
          results.push({
            match: m[0],
            index: m.index ?? 0,
            length: m[0].length,
            groups: m.groups ? { ...m.groups } : {},
            numbered: [...m].slice(1),
          });
        }
      } else {
        const m = testString.match(re);
        if (m) {
          results.push({
            match: m[0],
            index: m.index ?? 0,
            length: m[0].length,
            groups: m.groups ? { ...m.groups } : {},
            numbered: [...m].slice(1),
          });
        }
      }

      setMatches(results);
      if (showReplace) {
        setReplaceResult(testString.replace(re, replacementStr));
      }
    } catch (e: unknown) {
      setRegexError((e as Error).message);
      setMatches([]);
      setReplaceResult('');
    }
  }, [pattern, testString, flagStr, showReplace, replacementStr]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(executeRegex, 200);
    return () => clearTimeout(debounceRef.current);
  }, [executeRegex]);

  const toggleFlag = (f: string) => setFlags(prev => ({ ...prev, [f]: !prev[f] }));

  const highlightedHTML = useMemo(
    () => buildHighlightedHTML(testString, matches),
    [testString, matches]
  );

  const explanations = useMemo(() => explainRegex(pattern), [pattern]);

  const shareUrl = useCallback(() => {
    const params = new URLSearchParams({ r: pattern, t: testString, f: flagStr });
    const url = `${window.location.origin}/regex-tester?${params.toString()}`;
    navigator.clipboard.writeText(url);
  }, [pattern, testString, flagStr]);

  const filteredPatterns = PATTERN_LIBRARY.filter(p =>
    p.name.toLowerCase().includes(patternSearch.toLowerCase())
  );

  const exportMatchesJSON = () => {
    const blob = new Blob([JSON.stringify(matches, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'regex-matches.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportMatchesCSV = () => {
    const header = 'Match,Index,Length,Groups\n';
    const rows = matches.map(m => `"${m.match.replace(/"/g, '""')}",${m.index},${m.length},"${JSON.stringify(m.groups).replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'regex-matches.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white font-medium">Regex Tester</span>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-lime-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Regex <span className="bg-gradient-to-r from-lime-400 to-emerald-400 bg-clip-text text-transparent">Tester</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm ml-[52px]">
            Test and debug regular expressions in real-time with match highlighting.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══ Main Panel ═══ */}
          <div className="lg:col-span-2 space-y-5">
            {/* Regex Input */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Regular Expression</label>
                <div className="flex items-center gap-1">
                  {['g', 'i', 'm', 's', 'u'].map(f => (
                    <button key={f} onClick={() => toggleFlag(f)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${flags[f]
                        ? 'bg-lime-500/20 text-lime-500 border border-lime-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                      }`}
                    >{f}</button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500/60 font-mono text-lg">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                  placeholder="Enter regex pattern..."
                  spellCheck={false}
                  className="w-full pl-7 pr-12 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/30 placeholder:text-slate-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lime-500/60 font-mono text-lg">/{flagStr}</span>
              </div>
              {regexError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs text-red-500 font-mono">
                  ⚠ {regexError}
                </motion.p>
              )}
              {/* Action buttons row */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button onClick={() => setShowReplace(!showReplace)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${showReplace ? 'bg-lime-500/10 border-lime-500/30 text-lime-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                  <Replace className="w-3 h-3" /> Replace
                </button>
                <button onClick={() => setShowExplain(!showExplain)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${showExplain ? 'bg-lime-500/10 border-lime-500/30 text-lime-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'}`}>
                  <Lightbulb className="w-3 h-3" /> Explain
                </button>
                <button onClick={shareUrl}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <Share2 className="w-3 h-3" /> Share URL
                </button>
              </div>
            </motion.div>

            {/* Explain Panel */}
            <AnimatePresence>
              {showExplain && pattern && explanations.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Regex Explanation</h3>
                  </div>
                  <div className="space-y-1">
                    {explanations.map((exp, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-mono">
                        <span className="text-slate-500 min-w-[20px] text-right">{i + 1}.</span>
                        <span className="text-slate-700 dark:text-slate-300">{exp}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Test String with Highlighting */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">Test String</label>
                <span className="text-xs text-slate-400">
                  {matches.length} match{matches.length !== 1 ? 'es' : ''}
                </span>
              </div>
              {/* Highlighted preview */}
              {pattern && matches.length > 0 && (
                <div
                  className="mb-3 p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed text-slate-800 dark:text-slate-200"
                  dangerouslySetInnerHTML={{ __html: highlightedHTML }}
                />
              )}
              <textarea
                value={testString}
                onChange={e => setTestString(e.target.value)}
                rows={6}
                spellCheck={false}
                placeholder="Enter test string..."
                className="w-full p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/30 resize-y placeholder:text-slate-400"
              />
            </motion.div>

            {/* Replace Section */}
            <AnimatePresence>
              {showReplace && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden"
                >
                  <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">Replace With</label>
                  <input
                    type="text"
                    value={replacementStr}
                    onChange={e => setReplacementStr(e.target.value)}
                    placeholder="Replacement string (supports $1, $&, etc.)"
                    spellCheck={false}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-lime-500/30 placeholder:text-slate-400"
                  />
                  {replaceResult && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Result</span>
                        <CopyBtn text={replaceResult} />
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 font-mono text-sm whitespace-pre-wrap break-all text-slate-800 dark:text-slate-200">
                        {replaceResult}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Match Results */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Match Results
                </h3>
                <div className="flex items-center gap-2">
                  {matches.length > 0 && (
                    <>
                      <button onClick={exportMatchesJSON} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                        <Download className="w-3 h-3" /> JSON
                      </button>
                      <button onClick={exportMatchesCSV} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                        <Download className="w-3 h-3" /> CSV
                      </button>
                    </>
                  )}
                </div>
              </div>

              {matches.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  {pattern ? 'No matches found.' : 'Enter a regex pattern to see matches.'}
                </p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {matches.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-lime-500">Match {i + 1}</span>
                        <span className="text-[10px] text-slate-400">index: {m.index} | length: {m.length}</span>
                      </div>
                      <div className="font-mono text-sm text-slate-900 dark:text-white bg-lime-500/5 rounded-lg px-3 py-1.5 mb-2 break-all">
                        {m.match}
                      </div>
                      {/* Numbered capture groups */}
                      {m.numbered.length > 0 && (
                        <div className="space-y-1 mb-1">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Groups</span>
                          {m.numbered.map((g, gi) => (
                            <div key={gi} className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-cyan-500">${gi + 1}:</span>
                              <span className="text-slate-700 dark:text-slate-300">{g ?? '(undefined)'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Named groups */}
                      {Object.keys(m.groups).length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Named Groups</span>
                          {Object.entries(m.groups).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-amber-500">{k}:</span>
                              <span className="text-slate-700 dark:text-slate-300">{v ?? '(undefined)'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Pro Upsell */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="p-5 rounded-2xl bg-gradient-to-br from-lime-500/5 to-emerald-500/5 border border-lime-500/20 backdrop-blur-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-lime-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Regex Tester Pro</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Save patterns to your library, export matches as JSON/CSV, and compare regex patterns side-by-side.
                  </p>
                  <div className="flex items-center gap-3">
                    <a href="https://sherutools.lemonsqueezy.com" target="_blank" rel="noopener"
                      className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-lime-500 text-black font-bold hover:bg-lime-400 transition-colors">
                      <Lock className="w-3 h-3" /> Unlock Pro — $2.99
                    </a>
                    <span className="text-[10px] text-slate-400">One-time payment</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ═══ Sidebar ═══ */}
          <div className="space-y-5">
            {/* Pattern Library */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden"
            >
              <button onClick={() => setShowPatterns(!showPatterns)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-lime-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Pattern Library</span>
                </div>
                {showPatterns ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {showPatterns && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-2">
                      <div className="relative mb-2">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text" value={patternSearch} onChange={e => setPatternSearch(e.target.value)}
                          placeholder="Search patterns..."
                          className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-lime-500/30 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="px-4 pb-4 space-y-1.5 max-h-96 overflow-y-auto">
                      {filteredPatterns.map((p, i) => (
                        <button key={i} onClick={() => { setPattern(p.pattern); const newFlags = { g: false, i: false, m: false, s: false, u: false }; for (const c of p.flags) { if (c in newFlags) (newFlags as Record<string, boolean>)[c] = true; } setFlags(newFlags); }}
                          className="w-full text-left p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-lime-500/30 hover:bg-lime-500/5 transition-all group"
                        >
                          <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-lime-500 transition-colors">{p.name}</div>
                          <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{p.pattern}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Cheat Sheet */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden"
            >
              <button onClick={() => setShowCheatSheet(!showCheatSheet)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Cheat Sheet</span>
                </div>
                {showCheatSheet ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              <AnimatePresence>
                {showCheatSheet && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-4 max-h-[500px] overflow-y-auto">
                      {CHEAT_SHEET.map((cat, ci) => (
                        <div key={ci}>
                          <h4 className="text-[10px] uppercase tracking-wider text-lime-500 font-bold mb-2">{cat.category}</h4>
                          <div className="space-y-1">
                            {cat.items.map((item, ii) => (
                              <div key={ii} className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                                <code className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">{item.token}</code>
                                <span className="text-[11px] text-slate-400 text-right">{item.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegexTesterPage() {
  return (
    <Suspense>
      <RegexTesterInner />
    </Suspense>
  );
}
