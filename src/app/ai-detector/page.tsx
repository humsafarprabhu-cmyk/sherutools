'use client';

import RelatedTools from '@/components/RelatedTools';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Copy, Check, RotateCcw, AlertTriangle, Shield, Zap, Brain, ChevronDown } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

/* ─── Types ─── */
interface Sentence {
  text: string;
  label: 'ai' | 'human' | 'mixed';
  confidence: number;
}

interface DetectionResult {
  aiProbability: number;
  perplexity: number;
  burstiness: number;
  vocabularyDiversity: number;
  verdict: string;
  sentences: Sentence[];
  summary: string;
}

/* ─── Usage Tracking ─── */
function getUsage(key: string): number {
  if (typeof window === 'undefined') return 0;
  const data = localStorage.getItem(key);
  if (!data) return 0;
  const parsed = JSON.parse(data);
  const today = new Date().toDateString();
  if (parsed.date !== today) return 0;
  return parsed.count || 0;
}

function incrementUsage(key: string) {
  const today = new Date().toDateString();
  const current = getUsage(key);
  localStorage.setItem(key, JSON.stringify({ date: today, count: current + 1 }));
}

const FREE_LIMIT = 3;
const FREE_WORD_LIMIT = 500;

/* ─── Animated Gauge ─── */
function AiGauge({ value, animate }: { value: number; animate: boolean }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = animate ? (value / 100) * circumference : 0;
  const color = value >= 70 ? '#ef4444' : value >= 40 ? '#f59e0b' : '#22c55e';
  const label = value >= 70 ? 'Likely AI' : value >= 40 ? 'Mixed' : 'Likely Human';

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" className="text-white/5" strokeWidth="10" />
        <motion.circle
          cx="80" cy="80" r={radius} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {animate ? value : 0}%
        </motion.span>
        <span className="text-xs text-slate-400 mt-1">{label}</span>
      </div>
    </div>
  );
}

/* ─── Score Bar ─── */
function ScoreBar({ label, value, icon: Icon, description }: { label: string; value: number; icon: React.ElementType; description: string }) {
  const color = value >= 70 ? 'bg-red-500' : value >= 40 ? 'bg-yellow-500' : 'bg-emerald-500';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-300"><Icon className="w-3.5 h-3.5" />{label}</span>
        <span className="font-mono font-semibold text-white">{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AiDetectorPage() {
  const [tab, setTab] = useState<'detect' | 'humanize'>('detect');

  /* Detector state */
  const [detectText, setDetectText] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [detectError, setDetectError] = useState('');

  /* Humanizer state */
  const [humanizeText, setHumanizeText] = useState('');
  const [style, setStyle] = useState('casual');
  const [humanizing, setHumanizing] = useState(false);
  const [humanized, setHumanized] = useState('');
  const [humanizeError, setHumanizeError] = useState('');
  const [copied, setCopied] = useState(false);

  const wordCount = useCallback((text: string) => text.trim().split(/\s+/).filter(Boolean).length, []);

  /* Detect */
  const handleDetect = async () => {
    if (detectText.length < 50) { setDetectError('Please enter at least 50 characters.'); return; }
    if (wordCount(detectText) > FREE_WORD_LIMIT) { setDetectError(`Free tier limited to ${FREE_WORD_LIMIT} words.`); return; }
    if (getUsage('sheru_detect') >= FREE_LIMIT) { setDetectError('Daily free limit reached (3/day). Upgrade to Pro for unlimited.'); return; }

    setDetecting(true); setDetectError(''); setDetection(null);
    try {
      const res = await fetch('/api/ai-detect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: detectText }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Detection failed');
      setDetection(data);
      incrementUsage('sheru_detect');
    } catch (e: unknown) {
      setDetectError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setDetecting(false);
    }
  };

  /* Humanize */
  const handleHumanize = async () => {
    if (!humanizeText.trim()) { setHumanizeError('Please enter some text.'); return; }
    if (wordCount(humanizeText) > FREE_WORD_LIMIT) { setHumanizeError(`Free tier limited to ${FREE_WORD_LIMIT} words.`); return; }
    if (getUsage('sheru_humanize') >= FREE_LIMIT) { setHumanizeError('Daily free limit reached (3/day). Upgrade to Pro for unlimited.'); return; }

    setHumanizing(true); setHumanizeError(''); setHumanized('');
    try {
      const res = await fetch('/api/ai-humanize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: humanizeText, style }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Humanization failed');
      setHumanized(data.result);
      incrementUsage('sheru_humanize');
    } catch (e: unknown) {
      setHumanizeError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setHumanizing(false);
    }
  };

  const copyHumanized = () => {
    navigator.clipboard.writeText(humanized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reAnalyze = () => {
    setDetectText(humanized);
    setTab('detect');
    setDetection(null);
  };

  const styles = [
    { value: 'casual', label: 'Casual', emoji: '💬' },
    { value: 'academic', label: 'Academic', emoji: '🎓' },
    { value: 'professional', label: 'Professional', emoji: '💼' },
    { value: 'creative', label: 'Creative', emoji: '🎨' },
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Header */}
        <section className="pt-20 pb-10 px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
              <Shield className="w-4 h-4" /> AI Detection & Humanization
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              AI Content Detector & Humanizer
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Detect AI-generated text with detailed sentence analysis. Humanize content to sound natural and bypass detectors.
            </p>
          </motion.div>
        </section>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 mb-8">
          <div className="flex bg-white/5 rounded-xl p-1 max-w-md mx-auto">
            {(['detect', 'humanize'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 relative py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab === t && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t === 'detect' ? <><Search className="w-4 h-4" /> Detector</> : <><Sparkles className="w-4 h-4" /> Humanizer</>}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 pb-20">
          <AnimatePresence mode="wait">
            {tab === 'detect' ? (
              <motion.div key="detect" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                {/* Detector */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 md:p-8">
                  <textarea
                    value={detectText}
                    onChange={(e) => setDetectText(e.target.value)}
                    placeholder="Paste your text here to check if it's AI-generated... (min 50 characters)"
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-500">{detectText.length} chars · {wordCount(detectText)} words · {FREE_LIMIT - getUsage('sheru_detect')}/{FREE_LIMIT} free analyses left today</span>
                    <button
                      onClick={handleDetect}
                      disabled={detecting || detectText.length < 50}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      {detecting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</> : <><Search className="w-4 h-4" /> Analyze</>}
                    </button>
                  </div>
                  {detectError && <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />{detectError}</p>}
                </div>

                {/* Results */}
                {detection && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 space-y-6">
                    {/* Gauge + Scores */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 text-center">
                        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">AI Probability</h3>
                        <AiGauge value={detection.aiProbability} animate />
                        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${
                          detection.verdict.includes('AI') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          detection.verdict.includes('Human') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {detection.verdict}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Detailed Scores</h3>
                        <ScoreBar label="Perplexity" value={detection.perplexity} icon={Brain} description="Word predictability — lower means more AI-like" />
                        <ScoreBar label="Burstiness" value={detection.burstiness} icon={Zap} description="Sentence length variation — lower means more uniform (AI)" />
                        <ScoreBar label="Vocabulary" value={detection.vocabularyDiversity} icon={Sparkles} description="Word variety — lower means more repetitive (AI)" />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6">
                      <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Analysis Summary</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{detection.summary}</p>
                    </div>

                    {/* Sentence Highlighting */}
                    <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Sentence Analysis</h3>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500/60" /> AI</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500/60" /> Mixed</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500/60" /> Human</span>
                        </div>
                      </div>
                      <div className="text-sm leading-relaxed space-y-0.5">
                        {detection.sentences.map((s, i) => (
                          <span
                            key={i}
                            className={`inline rounded px-0.5 ${
                              s.label === 'ai' ? 'bg-red-500/15 text-red-200' :
                              s.label === 'mixed' ? 'bg-yellow-500/15 text-yellow-200' :
                              'bg-emerald-500/15 text-emerald-200'
                            }`}
                            title={`${s.label} (${s.confidence}% confidence)`}
                          >
                            {s.text}{' '}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA to Humanize */}
                    <div className="text-center">
                      <button
                        onClick={() => { setHumanizeText(detectText); setTab('humanize'); }}
                        className="px-6 py-3 bg-gradient-to-r from-pink-600 to-orange-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Humanize This Text
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="humanize" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {/* Humanizer */}
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 md:p-8">
                  <textarea
                    value={humanizeText}
                    onChange={(e) => setHumanizeText(e.target.value)}
                    placeholder="Paste AI-generated text here to humanize it..."
                    className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  />

                  {/* Style Select */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-slate-400">Style:</span>
                    {styles.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setStyle(s.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          style === s.value
                            ? 'bg-gradient-to-r from-pink-600 to-orange-600 text-white shadow-lg shadow-pink-500/20'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {s.emoji} {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-slate-500">{wordCount(humanizeText)} words · {FREE_LIMIT - getUsage('sheru_humanize')}/{FREE_LIMIT} free humanizations left today</span>
                    <button
                      onClick={handleHumanize}
                      disabled={humanizing || !humanizeText.trim()}
                      className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-orange-600 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                      {humanizing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Humanizing...</> : <><Sparkles className="w-4 h-4" /> Humanize</>}
                    </button>
                  </div>
                  {humanizeError && <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />{humanizeError}</p>}
                </div>

                {/* Result: Side by Side */}
                {humanized && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6">
                        <h3 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Original (AI)
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{humanizeText}</p>
                      </div>
                      <div className="rounded-2xl bg-white/[0.03] border border-emerald-500/20 backdrop-blur-xl p-6">
                        <h3 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Humanized
                        </h3>
                        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{humanized}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-3 mt-6">
                      <button onClick={copyHumanized} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                        {copied ? <><Check className="w-4 h-4 text-emerald-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                      </button>
                      <button onClick={reAnalyze} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Re-Analyze
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* FAQ Section */}
          <section className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'How accurate is the AI detection?', a: 'Our detector uses GPT-4o-mini to analyze text patterns including perplexity, burstiness, and vocabulary diversity. While no detector is 100% accurate, it provides detailed sentence-level analysis to help you make informed judgments.' },
                { q: 'What types of AI text can it detect?', a: 'It can detect text generated by ChatGPT, GPT-4, Claude, Gemini, and other large language models. The analysis looks at writing patterns common across all AI systems.' },
                { q: 'How does humanization work?', a: 'The humanizer rewrites your text with natural language patterns — varying sentence lengths, adding colloquialisms, removing AI clichés, and injecting personal voice. Choose from casual, academic, professional, or creative styles.' },
                { q: 'Is my text stored or shared?', a: 'No. Your text is processed in real-time and never stored on our servers. We take privacy seriously.' },
              ].map((faq, i) => (
                <details key={i} className="group rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-slate-200 hover:text-white transition-colors">
                    {faq.q}
                    <ChevronDown className="w-4 h-4 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="px-4 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        
      <div className="max-w-6xl mx-auto px-4">
      <RelatedTools tools={[{"name":"AI Rewriter","href":"/ai-rewriter","description":"Rewrite text with AI","icon":"✍️"},{"name":"AI Email Writer","href":"/ai-email-writer","description":"Generate professional emails","icon":"📧"},{"name":"Word Counter","href":"/word-counter","description":"Count words and characters","icon":"📊"},{"name":"Text Compare","href":"/text-compare","description":"Compare texts side by side","icon":"🔄"}]} />
      </div>
    </div>
      </main>
      <Footer />
    </>
  );
}
