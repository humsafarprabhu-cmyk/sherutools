'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Upload, Copy, Trash2, ChevronRight, BookOpen, Clock, Mic, FileText, Type, AlignLeft, Layers, BookOpenCheck } from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// ─── Stop Words ───
const STOP_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with',
  'he','as','you','do','at','this','but','his','by','from','they','we','her','she',
  'or','an','will','my','one','all','would','there','their','what','so','up','out',
  'if','about','who','get','which','go','me','when','make','can','like','time','no',
  'just','him','know','take','people','into','year','your','good','some','could',
  'them','see','other','than','then','now','look','only','come','its','over','think',
  'also','back','after','use','two','how','our','work','first','well','way','even',
  'new','want','because','any','these','give','day','most','us','is','was','are',
  'were','been','has','had','did','does','am','being','having','doing','say','said',
  'very','much','more','many','such','own','same','thing','things','still','let',
]);

// ─── Syllable Counter Heuristic ───
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  let count = 0;
  const vowels = 'aeiouy';
  let prevVowel = false;
  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith('e') && count > 1) count--;
  if (w.endsWith('le') && w.length > 2 && !vowels.includes(w[w.length - 3])) count++;
  return Math.max(count, 1);
}

// ─── Analysis Types ───
interface Stats {
  chars: number;
  charsNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  pages: number;
  readingTime: string;
  speakingTime: string;
  fleschEase: number;
  fleschGrade: number;
  readability: 'Easy' | 'Medium' | 'Hard';
  topKeywords: { word: string; count: number; density: number }[];
  longestWord: string;
  shortestWord: string;
  avgWordLength: number;
  sentenceLengths: number[];
  charFrequency: { char: string; count: number }[];
}

function analyzeText(text: string): Stats {
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;

  const wordsArr = text.match(/\b[a-zA-Z0-9''-]+\b/g) || [];
  const words = wordsArr.length;

  const sentencesArr = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentences = text.trim() === '' ? 0 : sentencesArr.length;

  const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (text.trim() ? 1 : 0);

  const pages = Math.max(0, +(words / 250).toFixed(2));

  const readMin = words / 200;
  const speakMin = words / 130;
  const fmtTime = (m: number) => {
    if (m < 1) return m < 0.01 ? '0 sec' : `${Math.round(m * 60)} sec`;
    const mins = Math.floor(m);
    const secs = Math.round((m - mins) * 60);
    return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
  };

  // Flesch-Kincaid
  let fleschEase = 0, fleschGrade = 0;
  let readability: 'Easy' | 'Medium' | 'Hard' = 'Medium';
  if (words > 0 && sentences > 0) {
    const totalSyllables = wordsArr.reduce((a, w) => a + countSyllables(w), 0);
    fleschEase = Math.round(206.835 - 1.015 * (words / sentences) - 84.6 * (totalSyllables / words));
    fleschGrade = Math.round((0.39 * (words / sentences) + 11.8 * (totalSyllables / words) - 15.59) * 10) / 10;
    fleschEase = Math.max(0, Math.min(100, fleschEase));
    fleschGrade = Math.max(0, fleschGrade);
    readability = fleschEase >= 60 ? 'Easy' : fleschEase >= 30 ? 'Medium' : 'Hard';
  }

  // Top keywords
  const freq: Record<string, number> = {};
  wordsArr.forEach(w => {
    const lw = w.toLowerCase();
    if (lw.length > 1 && !STOP_WORDS.has(lw)) freq[lw] = (freq[lw] || 0) + 1;
  });
  const topKeywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, density: Math.round((count / Math.max(words, 1)) * 10000) / 100 }));

  // Word lengths
  const wordLens = wordsArr.map(w => w.length);
  const longestWord = wordsArr.length ? wordsArr.reduce((a, b) => a.length >= b.length ? a : b) : '—';
  const shortestWord = wordsArr.length ? wordsArr.reduce((a, b) => a.length <= b.length ? a : b) : '—';
  const avgWordLength = wordsArr.length ? Math.round((wordLens.reduce((a, b) => a + b, 0) / wordLens.length) * 10) / 10 : 0;

  // Sentence lengths
  const sentenceLengths = sentencesArr.map(s => (s.trim().match(/\b[a-zA-Z0-9''-]+\b/g) || []).length);

  // Char frequency (letters only)
  const charFreqMap: Record<string, number> = {};
  text.toLowerCase().replace(/[^a-z]/g, '').split('').forEach(c => { charFreqMap[c] = (charFreqMap[c] || 0) + 1; });
  const charFrequency = Object.entries(charFreqMap).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([char, count]) => ({ char, count }));

  return {
    chars, charsNoSpaces, words, sentences, paragraphs, pages,
    readingTime: fmtTime(readMin), speakingTime: fmtTime(speakMin),
    fleschEase, fleschGrade, readability,
    topKeywords, longestWord, shortestWord, avgWordLength,
    sentenceLengths, charFrequency,
  };
}

const emptyStats = analyzeText('');

// ─── Stat Card ───
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-500',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-500',
    emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-500',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-500',
    rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/20 text-rose-500',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 text-cyan-500',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-500',
    indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20 text-indigo-500',
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${c} border rounded-xl p-4 flex flex-col gap-1`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${c.split(' ').pop()}`} />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
    </motion.div>
  );
}

export default function WordCounterPage() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const updateStats = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setStats(analyzeText(val)), 200);
  }, []);

  const handleChange = (val: string) => {
    setText(val);
    updateStats(val);
  };

  // Also run analysis on mount if text exists
  useEffect(() => { if (text) setStats(analyzeText(text)); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      setStats(analyzeText(content));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyStats = () => {
    const s = stats;
    const txt = `Word Counter Results
─────────────────────
Characters: ${s.chars}
Characters (no spaces): ${s.charsNoSpaces}
Words: ${s.words}
Sentences: ${s.sentences}
Paragraphs: ${s.paragraphs}
Pages: ${s.pages}
Reading Time: ${s.readingTime}
Speaking Time: ${s.speakingTime}
Flesch Reading Ease: ${s.fleschEase}
Flesch-Kincaid Grade: ${s.fleschGrade}
Readability: ${s.readability}
Longest Word: ${s.longestWord}
Shortest Word: ${s.shortestWord}
Avg Word Length: ${s.avgWordLength}
Top Keywords: ${s.topKeywords.map(k => `${k.word} (${k.count})`).join(', ')}`;
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maxCharFreq = stats.charFrequency.length ? Math.max(...stats.charFrequency.map(c => c.count)) : 1;
  const maxKeywordCount = stats.topKeywords.length ? stats.topKeywords[0].count : 1;

  // Readability gauge color
  const readabilityColor = stats.readability === 'Easy' ? 'text-emerald-500' : stats.readability === 'Medium' ? 'text-amber-500' : 'text-rose-500';
  const readabilityBg = stats.readability === 'Easy' ? 'bg-emerald-500' : stats.readability === 'Medium' ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">Word Counter</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Word Counter</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            Count words, characters, sentences, and paragraphs. Get reading time, readability scores, keyword density, and more — all in real-time.
          </p>
        </motion.div>

        {/* Textarea + Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="relative">
            <textarea
              value={text}
              onChange={e => handleChange(e.target.value)}
              placeholder="Start typing or paste your text here..."
              className="w-full h-56 md:h-64 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-base leading-relaxed transition-all"
            />
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <input ref={fileRef} type="file" accept=".txt,.md,.csv,.log" className="hidden" onChange={handleFileUpload} />
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                <Upload className="w-4 h-4" /> Upload .txt
              </button>
              <button onClick={copyStats} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Stats'}
              </button>
              <button onClick={() => { setText(''); setStats(emptyStats); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-rose-100 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all">
                <Trash2 className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Type} label="Characters" value={stats.chars.toLocaleString()} color="blue" />
          <StatCard icon={Type} label="Chars (no spaces)" value={stats.charsNoSpaces.toLocaleString()} color="purple" />
          <StatCard icon={FileText} label="Words" value={stats.words.toLocaleString()} color="emerald" />
          <StatCard icon={AlignLeft} label="Sentences" value={stats.sentences.toLocaleString()} color="amber" />
          <StatCard icon={Layers} label="Paragraphs" value={stats.paragraphs.toLocaleString()} color="rose" />
          <StatCard icon={BookOpen} label="Pages" value={stats.pages} color="cyan" />
          <StatCard icon={Clock} label="Reading Time" value={stats.readingTime} color="orange" />
          <StatCard icon={Mic} label="Speaking Time" value={stats.speakingTime} color="indigo" />
        </div>

        {/* Readability + Keywords Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Readability */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-blue-500" /> Readability
            </h2>
            <div className="flex items-center gap-4 mb-5">
              <div className={`text-4xl font-bold ${readabilityColor}`}>{stats.fleschEase}</div>
              <div>
                <div className={`text-sm font-semibold ${readabilityColor}`}>{stats.readability}</div>
                <div className="text-xs text-slate-400">Flesch Reading Ease</div>
              </div>
            </div>
            {/* Gauge bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden mb-4">
              <div className={`h-full rounded-full ${readabilityBg} transition-all duration-500`} style={{ width: `${Math.min(100, stats.fleschEase)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mb-5">
              <span>Hard (0)</span>
              <span>Medium (50)</span>
              <span>Easy (100)</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Flesch-Kincaid Grade</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.fleschGrade}</div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Avg Word Length</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{stats.avgWordLength} chars</div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Longest Word</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white truncate" title={stats.longestWord}>{stats.longestWord}</div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Shortest Word</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white truncate" title={stats.shortestWord}>{stats.shortestWord}</div>
              </div>
            </div>
          </motion.div>

          {/* Top Keywords */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Top Keywords
            </h2>
            {stats.topKeywords.length === 0 ? (
              <div className="text-sm text-slate-400 py-8 text-center">Start typing to see keyword analysis</div>
            ) : (
              <div className="space-y-2.5">
                {stats.topKeywords.map((kw, i) => (
                  <div key={kw.word} className="flex items-center gap-3">
                    <span className="w-5 text-xs text-slate-400 text-right">{i + 1}</span>
                    <span className="w-24 text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{kw.word}</span>
                    <div className="flex-1 h-5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                        style={{ width: `${(kw.count / maxKeywordCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8 text-right">{kw.count}</span>
                    <span className="text-xs text-slate-400 w-14 text-right">{kw.density}%</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Character Frequency + Sentence Distribution */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Character Frequency */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Character Frequency</h2>
            {stats.charFrequency.length === 0 ? (
              <div className="text-sm text-slate-400 py-8 text-center">No data yet</div>
            ) : (
              <div className="flex items-end gap-1.5 h-40">
                {stats.charFrequency.map(cf => (
                  <div key={cf.char} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-400">{cf.count}</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-400 transition-all duration-500" style={{ height: `${(cf.count / maxCharFreq) * 100}%`, minHeight: 4 }} />
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">{cf.char}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Sentence Length Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Sentence Length Distribution</h2>
            {stats.sentenceLengths.length === 0 ? (
              <div className="text-sm text-slate-400 py-8 text-center">No data yet</div>
            ) : (
              <div className="flex items-end gap-1 h-40 overflow-x-auto">
                {stats.sentenceLengths.map((len, i) => {
                  const maxLen = Math.max(...stats.sentenceLengths, 1);
                  return (
                    <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center gap-1">
                      <span className="text-[10px] text-slate-400">{len}</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-purple-500 to-pink-400 transition-all duration-500"
                        style={{ height: `${(len / maxLen) * 100}%`, minHeight: 4 }}
                      />
                      <span className="text-[9px] text-slate-400">S{i + 1}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* SEO Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">About This Word Counter</h2>
          <div className="text-sm text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
            <p>This free online word counter instantly analyzes your text as you type. Get accurate counts for words, characters, sentences, and paragraphs — plus reading time, speaking time, readability scores (Flesch-Kincaid), keyword density, and more.</p>
            <p>All analysis happens in your browser. Your text is never sent to any server. Works great for essays, blog posts, social media captions (Twitter/X character limits), academic papers, and SEO content optimization.</p>
            <p>The Flesch Reading Ease score rates text on a 0-100 scale. Higher scores mean easier reading. The Flesch-Kincaid Grade Level tells you what U.S. school grade level is needed to understand the text.</p>
          </div>
        </motion.div>
      </main>

      <Footer />
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What does the Word Counter tool measure?","answer":"Count words, characters, sentences, paragraphs, and estimate reading time. Also provides readability scores and keyword density analysis."},{"question":"Is the Word Counter free?","answer":"Yes, completely free with no limits. Count words in any text with no sign-up required."},{"question":"Can I check reading time?","answer":"Yes! The tool estimates reading time based on average reading speed (225 words per minute) for your text."},{"question":"Does it work with any language?","answer":"Yes, the word counter works with text in any language that uses space-separated words."}]} />
      <RelatedTools tools={[{"name":"Text Compare","href":"/text-compare","description":"Compare two texts side by side","icon":"🔄"},{"name":"Lorem Ipsum","href":"/lorem-ipsum","description":"Generate placeholder text","icon":"📄"},{"name":"Markdown Editor","href":"/markdown-editor","description":"Write and preview Markdown","icon":"📝"},{"name":"AI Rewriter","href":"/ai-rewriter","description":"Rewrite text with AI","icon":"✍️"}]} />
      </div>
    </div>
  );
}
