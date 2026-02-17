'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Code, ChevronRight, Copy, Check, Sparkles, Lightbulb, AlertTriangle, BookOpen, Loader2, Zap, Crown, ArrowRight, RefreshCw } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect', color: '#888' },
  { value: 'javascript', label: 'JavaScript', color: '#f7df1e' },
  { value: 'typescript', label: 'TypeScript', color: '#3178c6' },
  { value: 'python', label: 'Python', color: '#3572A5' },
  { value: 'java', label: 'Java', color: '#b07219' },
  { value: 'cpp', label: 'C++', color: '#f34b7d' },
  { value: 'csharp', label: 'C#', color: '#239120' },
  { value: 'go', label: 'Go', color: '#00ADD8' },
  { value: 'rust', label: 'Rust', color: '#dea584' },
  { value: 'php', label: 'PHP', color: '#4F5D95' },
  { value: 'ruby', label: 'Ruby', color: '#CC342D' },
  { value: 'swift', label: 'Swift', color: '#F05138' },
  { value: 'kotlin', label: 'Kotlin', color: '#A97BFF' },
  { value: 'sql', label: 'SQL', color: '#e38c00' },
  { value: 'html', label: 'HTML/CSS', color: '#e34c26' },
  { value: 'bash', label: 'Bash', color: '#4EAA25' },
  { value: 'other', label: 'Other', color: '#888' },
];

const LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'green', emoji: '🌱' },
  { value: 'intermediate', label: 'Intermediate', color: 'blue', emoji: '⚡' },
  { value: 'advanced', label: 'Advanced', color: 'purple', emoji: '🧠' },
];

const SAMPLE_CODE = `function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Usage
const handleSearch = debounce((query) => {
  fetch(\`/api/search?q=\${query}\`)
    .then(res => res.json())
    .then(data => console.log(data));
}, 300);`;

const DAILY_LIMIT = 5;
const STORAGE_KEY = 'sherutools_code_explain_usage';

function getUsageToday(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

function incrementUsage(): number {
  const today = new Date().toISOString().slice(0, 10);
  const current = getUsageToday();
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
  return newCount;
}

interface ExplanationResult {
  summary: string;
  explanation: string;
  concepts: string[];
  issues: string[];
}

const conceptColors = [
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
];

export default function AICodeExplainerPage() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('auto');
  const [level, setLevel] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setUsage(getUsageToday());
  }, []);

  const explain = useCallback(async (simplify = false) => {
    if (!code.trim()) { setError('Please paste some code first.'); return; }
    if (usage >= DAILY_LIMIT) { setError('Daily limit reached. Upgrade to Pro for unlimited explanations!'); return; }

    setLoading(true);
    setError('');
    if (!simplify) setResult(null);

    try {
      const selectedText = textareaRef.current
        ? code.substring(textareaRef.current.selectionStart, textareaRef.current.selectionEnd)
        : '';
      const codeToExplain = selectedText.trim() || code;

      const res = await fetch('/api/ai-code-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToExplain,
          language: language === 'auto' ? '' : language,
          level,
          simplify,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to explain code');
      }

      const data = await res.json();
      setResult(data);
      const newUsage = incrementUsage();
      setUsage(newUsage);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [code, language, level, usage]);

  const copyExplanation = useCallback(() => {
    if (!result) return;
    const text = `## Summary\n${result.summary}\n\n## Explanation\n${result.explanation}\n\n## Key Concepts\n${result.concepts.join(', ')}\n\n## Potential Issues\n${result.issues.length ? result.issues.join('\n') : 'None found'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  const loadSample = () => {
    setCode(SAMPLE_CODE);
    setLanguage('javascript');
    setResult(null);
    setError('');
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="min-h-screen dot-pattern">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">AI Code Explainer</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Powered by AI
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            AI Code <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Explainer</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Paste any code and get instant explanations. Line-by-line breakdown, key concepts, and potential issues.
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Code Input */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            {/* Language selector + Detail level */}
            <div className="flex flex-wrap gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
              >
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>

              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                {LEVELS.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value)}
                    className={`px-3 py-2 text-xs font-medium transition-all ${
                      level === l.value
                        ? l.color === 'green' ? 'bg-green-500 text-white'
                        : l.color === 'blue' ? 'bg-blue-500 text-white'
                        : 'bg-purple-500 text-white'
                        : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                  >
                    {l.emoji} {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Input */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-slate-500 ml-2">
                  {LANGUAGES.find(l => l.value === language)?.label || 'Code'}
                </span>
              </div>
              <div className="flex">
                {/* Line numbers */}
                <div className="select-none py-4 px-3 text-right text-xs text-slate-600 font-mono leading-[1.625rem] min-w-[3rem] bg-slate-900/50">
                  {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(''); }}
                  placeholder="Paste your code here..."
                  spellCheck={false}
                  className="flex-1 bg-transparent text-slate-200 font-mono text-sm p-4 leading-[1.625rem] resize-none focus:outline-none min-h-[400px] placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => explain(false)}
                disabled={loading || !code.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Explaining...' : 'Explain Code ✨'}
              </button>
              <button
                onClick={loadSample}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                <Code className="w-4 h-4 inline mr-1.5" />
                Sample
              </button>
            </div>

            {/* Usage counter */}
            <div className="p-3 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <span>Free explanations today</span>
                <span className="font-medium">{usage}/{DAILY_LIMIT}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(usage / DAILY_LIMIT) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </motion.div>
            )}
          </motion.div>

          {/* Right Panel: Explanation Output */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <AnimatePresence mode="wait">
              {!result && !loading ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] rounded-2xl border border-dashed border-slate-300 dark:border-white/10 flex flex-col items-center justify-center text-center p-8"
                >
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">Explanation will appear here</h3>
                  <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                    Paste code on the left, pick a detail level, and hit Explain ✨
                  </p>
                </motion.div>
              ) : loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.03] flex flex-col items-center justify-center p-8"
                >
                  <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Analyzing your code...</p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Action buttons */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => explain(true)}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Simplify
                    </button>
                    <button
                      onClick={copyExplanation}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy All'}
                    </button>
                  </div>

                  {/* Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Summary</h3>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.summary}</p>
                  </motion.div>

                  {/* Line-by-line explanation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Explanation</h3>
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {result.explanation}
                    </div>
                  </motion.div>

                  {/* Key concepts */}
                  {result.concepts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Key Concepts</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.concepts.map((c, i) => (
                          <span
                            key={i}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${conceptColors[i % conceptColors.length]}`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Potential issues */}
                  {result.issues.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Potential Issues</h3>
                      </div>
                      <div className="space-y-2">
                        {result.issues.map((issue, i) => (
                          <div key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>{issue}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Pro Upsell */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Upgrade to Pro — $5.99/mo</h3>
                  <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 mb-3">
                    <li>✦ Unlimited explanations</li>
                    <li>✦ Code optimization suggestions</li>
                    <li>✦ Convert code between languages</li>
                    <li>✦ Generate documentation from code</li>
                  </ul>
                  <a
                    href="https://sherutools.lemonsqueezy.com/buy/ai-code-explainer-pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Upgrade <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
