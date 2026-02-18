'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Copy, Check, ArrowRight, RotateCcw, ChevronRight, Home, Zap,
  Crown, Lock, AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

/* ── Types ──────────────────────────────────────────────────────── */
type Mode = 'paraphrase' | 'simplify' | 'formalize' | 'expand' | 'summarize' | 'creative';

interface ModeConfig {
  label: string;
  color: string;
  bg: string;
  bgActive: string;
  border: string;
  description: string;
}

const modes: Record<Mode, ModeConfig> = {
  paraphrase: { label: 'Paraphrase', color: 'text-blue-400', bg: 'bg-blue-500/10', bgActive: 'bg-blue-500/20', border: 'border-blue-500/40', description: 'Same meaning, different words' },
  simplify:   { label: 'Simplify',   color: 'text-green-400', bg: 'bg-green-500/10', bgActive: 'bg-green-500/20', border: 'border-green-500/40', description: 'Easier to understand' },
  formalize:  { label: 'Formalize',  color: 'text-purple-400', bg: 'bg-purple-500/10', bgActive: 'bg-purple-500/20', border: 'border-purple-500/40', description: 'Professional & academic' },
  expand:     { label: 'Expand',     color: 'text-amber-400', bg: 'bg-amber-500/10', bgActive: 'bg-amber-500/20', border: 'border-amber-500/40', description: 'Add more detail' },
  summarize:  { label: 'Summarize',  color: 'text-cyan-400', bg: 'bg-cyan-500/10', bgActive: 'bg-cyan-500/20', border: 'border-cyan-500/40', description: 'Condense to key points' },
  creative:   { label: 'Creative',   color: 'text-pink-400', bg: 'bg-pink-500/10', bgActive: 'bg-pink-500/20', border: 'border-pink-500/40', description: 'Engaging & vivid' },
};

/* ── Helpers ─────────────────────────────────────────────────────── */
function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function charCount(text: string) {
  return text.length;
}

function fleschKincaid(text: string): { score: number; label: string; color: string } {
  if (!text.trim()) return { score: 0, label: 'N/A', color: 'text-slate-400' };
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.trim().split(/\s+/);
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  if (sentences.length === 0 || words.length === 0) return { score: 0, label: 'N/A', color: 'text-slate-400' };
  const score = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped >= 60) return { score: clamped, label: 'Easy', color: 'text-green-400' };
  if (clamped >= 30) return { score: clamped, label: 'Medium', color: 'text-yellow-400' };
  return { score: clamped, label: 'Hard', color: 'text-red-400' };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

const STORAGE_KEY = 'sherutools_rewriter_usage';

function getUsageToday(): number {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

function incrementUsage(): number {
  const today = new Date().toISOString().slice(0, 10);
  let data: { date: string; count: number };
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (data.date !== today) data = { date: today, count: 0 };
  } catch { data = { date: today, count: 0 }; }
  data.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data.count;
}

const FREE_LIMIT = 5;

/* ── Component ───────────────────────────────────────────────────── */
export default function AIRewriterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('paraphrase');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    setUsageCount(getUsageToday());
  }, []);

  const handleRewrite = useCallback(async () => {
    if (!input.trim()) return;
    if (usageCount >= FREE_LIMIT) {
      setError('Daily free limit reached. Upgrade to Pro for unlimited rewrites!');
      return;
    }
    setLoading(true);
    setError('');
    setOutput('');
    try {
      const res = await fetch('/api/ai-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rewrite');
      setOutput(data.result || '');
      const newCount = incrementUsage();
      setUsageCount(newCount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [input, mode, usageCount]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleUseAsInput = useCallback(() => {
    setInput(output);
    setOutput('');
  }, [output]);

  const inputReading = fleschKincaid(input);
  const outputReading = fleschKincaid(output);
  const remaining = Math.max(0, FREE_LIMIT - usageCount);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> SheruTools
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">AI Rewriter</span>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-400 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            AI Content{' '}
            <span className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Rewriter</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Rewrite and paraphrase any text with AI. Choose a mode and transform your content instantly.
          </p>
        </motion.div>

        {/* Mode Pills */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap justify-center gap-2 mb-8">
          {(Object.entries(modes) as [Mode, ModeConfig][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                mode === key
                  ? `${cfg.bgActive} ${cfg.color} ${cfg.border}`
                  : 'bg-white/5 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/10'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </motion.div>

        {/* Mode description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={mode}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="text-center text-sm text-slate-400 dark:text-slate-500 mb-6"
          >
            {modes[mode].description}
          </motion.p>
        </AnimatePresence>

        {/* Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative">
            <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Original Text</span>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{wordCount(input)} words</span>
                  <span>{charCount(input)} chars</span>
                </div>
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Paste or type your text here..."
                className="w-full h-64 sm:h-80 px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none text-sm leading-relaxed"
              />
              <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-white/10">
                <div className={`flex items-center gap-1.5 text-xs ${inputReading.color}`}>
                  <span className="font-medium">Reading Level:</span> {inputReading.label}
                  {inputReading.score > 0 && <span className="text-slate-400">({inputReading.score})</span>}
                </div>
                {input && (
                  <button onClick={() => setInput('')} className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Output */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="relative">
            <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Rewritten Text</span>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{wordCount(output)} words</span>
                  {output && (
                    <button onClick={handleCopy} className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
              <div className="h-64 sm:h-80 px-4 py-3 overflow-y-auto">
                {loading ? (
                  <div className="space-y-3 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 rounded-lg bg-slate-200 dark:bg-white/10" style={{ width: `${70 + Math.random() * 30}%` }} />
                    ))}
                  </div>
                ) : output ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                    {output}
                  </motion.p>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                    <div className="text-center">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Rewritten text will appear here
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-white/10">
                <div className={`flex items-center gap-1.5 text-xs ${outputReading.color}`}>
                  <span className="font-medium">Reading Level:</span> {outputReading.label}
                  {outputReading.score > 0 && <span className="text-slate-400">({outputReading.score})</span>}
                </div>
                {output && (
                  <button onClick={handleUseAsInput} className="text-xs text-fuchsia-400 hover:text-fuchsia-300 transition-colors flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Use as Input
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rewrite Button */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-center mb-6">
          <button
            onClick={handleRewrite}
            disabled={loading || !input.trim()}
            className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  Rewriting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:animate-spin" />
                  Rewrite ✨
                </>
              )}
            </span>
          </button>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 justify-center text-sm text-red-400 mb-6">
              <AlertCircle className="w-4 h-4" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diff Toggle */}
        {output && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-6">
            <button
              onClick={() => setShowDiff(!showDiff)}
              className="text-xs text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              <div className={`w-8 h-4 rounded-full transition-colors ${showDiff ? 'bg-fuchsia-500' : 'bg-slate-600'} relative`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${showDiff ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              Show diff highlights
            </button>
          </motion.div>
        )}

        {/* Diff View */}
        <AnimatePresence>
          {showDiff && output && input && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
              <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl p-4">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">Changes</h3>
                <DiffView original={input} rewritten={output} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Usage Counter */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="max-w-md mx-auto mb-8">
          <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Free rewrites today</span>
              <span className="text-xs font-medium text-slate-900 dark:text-white">{usageCount}/{FREE_LIMIT}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${(usageCount / FREE_LIMIT) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              {remaining > 0 ? `${remaining} rewrite${remaining !== 1 ? 's' : ''} remaining` : 'Daily limit reached'}
            </p>
          </div>
        </motion.div>

        {/* Pro Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="max-w-2xl mx-auto mb-8">
          <div className="relative rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border border-fuchsia-500/20 backdrop-blur-xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-fuchsia-400" />
                <span className="text-sm font-semibold text-fuchsia-400">Pro Plan</span>
                <span className="text-xs text-slate-400">$5.99/mo</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Unlimited AI Rewrites</h3>
              <ul className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-fuchsia-400" /> Unlimited rewrites per day</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-fuchsia-400" /> Custom rewrite instructions</li>
                <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-fuchsia-400" /> Bulk rewrite multiple paragraphs</li>
              </ul>
              <a
                href="https://sherutools.lemonsqueezy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-fuchsia-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" /> Upgrade to Pro
              </a>
            </div>
          </div>
        </motion.div>

        {/* AI Badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-center text-xs text-slate-400 dark:text-slate-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <Sparkles className="w-3 h-3" /> Powered by AI • Your text is not stored
          </span>
        </motion.div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What does the AI Rewriter do?","answer":"The AI Rewriter takes your existing text and rewrites it in a different tone or style while preserving the original meaning."},{"question":"Is the AI Rewriter free to use?","answer":"Yes! Rewrite text completely free with no sign-up required. Free users have a daily usage limit."},{"question":"What tones can I rewrite text in?","answer":"Choose from professional, casual, academic, creative, simplified, persuasive, and more tone options."},{"question":"Does rewriting text count as plagiarism?","answer":"AI-rewritten text is original content. However, always ensure the ideas are properly attributed if they originate from other sources."}]} />
      <RelatedTools tools={[{"name":"AI Email Writer","href":"/ai-email-writer","description":"Generate professional emails with AI","icon":"📧"},{"name":"AI Code Explainer","href":"/ai-code-explainer","description":"Understand any code with AI explanations","icon":"💻"},{"name":"Word Counter","href":"/word-counter","description":"Count words, characters, and reading time","icon":"📊"},{"name":"Text Compare","href":"/text-compare","description":"Compare two texts side by side","icon":"🔄"}]} />
      </div>
    </div>
  );
}

/* ── Simple Diff View ────────────────────────────────────────────── */
function DiffView({ original, rewritten }: { original: string; rewritten: string }) {
  const origWords = original.split(/\s+/);
  const rewriteWords = rewritten.split(/\s+/);

  // Simple word-level diff via LCS
  const lcs = getLCS(origWords, rewriteWords);

  let oi = 0, ri = 0, li = 0;
  const elements: React.ReactElement[] = [];
  let key = 0;

  while (oi < origWords.length || ri < rewriteWords.length) {
    if (li < lcs.length && oi < origWords.length && ri < rewriteWords.length && origWords[oi] === lcs[li] && rewriteWords[ri] === lcs[li]) {
      elements.push(<span key={key++} className="text-slate-900 dark:text-slate-300">{lcs[li]} </span>);
      oi++; ri++; li++;
    } else {
      if (oi < origWords.length && (li >= lcs.length || origWords[oi] !== lcs[li])) {
        elements.push(<span key={key++} className="bg-red-500/20 text-red-400 line-through rounded px-0.5">{origWords[oi]} </span>);
        oi++;
      } else if (ri < rewriteWords.length && (li >= lcs.length || rewriteWords[ri] !== lcs[li])) {
        elements.push(<span key={key++} className="bg-green-500/20 text-green-400 rounded px-0.5">{rewriteWords[ri]} </span>);
        ri++;
      } else {
        break;
      }
    }
  }

  return <p className="text-sm leading-relaxed">{elements}</p>;
}

function getLCS(a: string[], b: string[]): string[] {
  const m = a.length, n = b.length;
  // Limit to avoid perf issues with very long texts
  if (m > 500 || n > 500) return [];
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  const result: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { result.unshift(a[i - 1]); i--; j--; }
    else if (dp[i - 1][j] > dp[i][j - 1]) i--;
    else j--;
  }
  return result;
}
