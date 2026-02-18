'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Home, ChevronRight, ChevronLeft, Crown, Lock, AlertCircle,
  Download, Copy, Check, Printer, Shuffle, RotateCcw, Edit3, Save, X,
  BookOpen, Brain, Zap, Trophy, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import Link from 'next/link';

/* ── Types ──────────────────────────────────────────────────────── */
interface Flashcard { front: string; back: string; }
type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Tab = 'study' | 'quiz';

/* ── Usage tracking ─────────────────────────────────────────────── */
const STORAGE_KEY = 'sherutools_flashcard_usage';
const FREE_LIMIT = 3;
const FREE_MAX_CARDS = 10;
const FREE_MAX_WORDS = 1000;

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

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/* ── Component ───────────────────────────────────────────────────── */
export default function FlashcardGeneratorPage() {
  const [input, setInput] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [numCards, setNumCards] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tab, setTab] = useState<Tab>('study');
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState(false);

  // Quiz state
  const [quizCards, setQuizCards] = useState<Flashcard[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFlipped, setQuizFlipped] = useState(false);
  const [score, setScore] = useState({ know: 0, dontKnow: 0 });
  const [quizDone, setQuizDone] = useState(false);

  // Edit state
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  // Touch/swipe
  const touchStart = useRef<number | null>(null);

  useEffect(() => { setUsageCount(getUsageToday()); }, []);

  const generate = useCallback(async () => {
    if (!input.trim()) return;
    const wc = wordCount(input);
    if (wc > FREE_MAX_WORDS) {
      setError(`Free tier limited to ${FREE_MAX_WORDS} words. You have ${wc}. Upgrade to Pro for 5,000 words.`);
      return;
    }
    if (usageCount >= FREE_LIMIT) {
      setError(`Daily free limit reached (${FREE_LIMIT}/day). Upgrade to Pro for unlimited.`);
      return;
    }
    const effectiveCards = Math.min(numCards, FREE_MAX_CARDS);

    setLoading(true);
    setError('');
    setCards([]);
    setCurrentIndex(0);
    setFlipped(false);

    try {
      const res = await fetch('/api/ai-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, numCards: effectiveCards, difficulty, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      if (!data.cards?.length) throw new Error('No cards generated');
      setCards(data.cards);
      setUsageCount(incrementUsage());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [input, numCards, difficulty, language, usageCount]);

  // Navigation
  const goNext = () => { setFlipped(false); setTimeout(() => setCurrentIndex(i => Math.min(i + 1, cards.length - 1)), 150); };
  const goPrev = () => { setFlipped(false); setTimeout(() => setCurrentIndex(i => Math.max(i - 1, 0)), 150); };

  // Quiz
  const startQuiz = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setQuizCards(shuffled);
    setQuizIndex(0);
    setQuizFlipped(false);
    setScore({ know: 0, dontKnow: 0 });
    setQuizDone(false);
    setTab('quiz');
  };

  const quizAnswer = (knew: boolean) => {
    setScore(s => knew ? { ...s, know: s.know + 1 } : { ...s, dontKnow: s.dontKnow + 1 });
    setQuizFlipped(false);
    if (quizIndex + 1 >= quizCards.length) {
      setTimeout(() => setQuizDone(true), 200);
    } else {
      setTimeout(() => setQuizIndex(i => i + 1), 200);
    }
  };

  // Export
  const exportCSV = () => {
    const csv = cards.map(c => `"${c.front.replace(/"/g, '""')}","${c.back.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'flashcards.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = () => {
    const text = cards.map((c, i) => `${i + 1}. Q: ${c.front}\n   A: ${c.back}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printCards = () => {
    const html = cards.map((c, i) => `<div style="margin:20px 0;padding:16px;border:1px solid #ccc;border-radius:8px;page-break-inside:avoid"><p><strong>Q${i + 1}:</strong> ${c.front}</p><p><strong>A:</strong> ${c.back}</p></div>`).join('');
    const w = window.open('', '_blank');
    if (w) { w.document.write(`<html><head><title>Flashcards</title></head><body style="font-family:sans-serif">${html}</body></html>`); w.print(); }
  };

  // Edit
  const startEdit = (i: number) => { setEditIndex(i); setEditFront(cards[i].front); setEditBack(cards[i].back); };
  const saveEdit = () => {
    if (editIndex === null) return;
    setCards(prev => prev.map((c, i) => i === editIndex ? { front: editFront, back: editBack } : c));
    setEditIndex(null);
  };

  // Swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(diff) > 60) { diff > 0 ? goPrev() : goNext(); }
    touchStart.current = null;
  };

  const wc = wordCount(input);
  const remaining = FREE_LIMIT - usageCount;
  const scorePercent = quizDone ? Math.round((score.know / quizCards.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-purple-400">Flashcard Generator</span>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-medium mb-4">
            <Brain className="w-3.5 h-3.5" /> AI-Powered Study Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent mb-3">
            AI Flashcard Generator
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Paste your notes, textbook content, or any topic — AI creates perfect study flashcards in seconds.
          </p>
        </motion.div>

        {/* Usage badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm">
            <span className="text-slate-400">Free today:</span>
            <span className={remaining > 0 ? 'text-emerald-400' : 'text-red-400'}>{remaining}/{FREE_LIMIT} left</span>
            {remaining <= 0 && (
              <span className="flex items-center gap-1 text-amber-400 text-xs"><Crown className="w-3 h-3" /> Upgrade</span>
            )}
          </div>
        </div>

        {/* Input Section */}
        {cards.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Paste your notes or enter a topic</label>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="e.g., Paste your biology notes here, or just type 'Photosynthesis' and let AI generate cards..."
                rows={8}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none text-sm"
              />
              <div className="flex justify-between mt-1.5 text-xs text-slate-500">
                <span>{wc} / {FREE_MAX_WORDS} words</span>
                {wc > FREE_MAX_WORDS && <span className="text-red-400">Over word limit</span>}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Number of Cards</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n} onClick={() => setNumCards(n)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${numCards === n
                        ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                      } ${n > FREE_MAX_CARDS ? 'opacity-50' : ''}`}>
                      {n}{n > FREE_MAX_CARDS && <Lock className="w-2.5 h-2.5 inline ml-0.5" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Difficulty</label>
                <div className="flex gap-2">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${difficulty === d
                        ? d === 'Easy' ? 'bg-green-500/20 border border-green-500/40 text-green-300'
                          : d === 'Medium' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                          : 'bg-red-500/20 border border-red-500/40 text-red-300'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                      }`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                  {['English', 'Spanish', 'French', 'German', 'Hindi', 'Chinese', 'Japanese', 'Korean', 'Portuguese', 'Arabic'].map(l => (
                    <option key={l} value={l} className="bg-slate-900">{l}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button onClick={generate} disabled={!input.trim() || loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm hover:scale-[1.01] active:scale-[0.99]">
              <Sparkles className="w-4 h-4" /> Generate Flashcards
            </button>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
              <Brain className="absolute inset-0 m-auto w-6 h-6 text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm">Generating your flashcards...</p>
          </motion.div>
        )}

        {/* Cards Display */}
        {cards.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Tabs & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex gap-2">
                <button onClick={() => setTab('study')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${tab === 'study' ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}>
                  <BookOpen className="w-4 h-4" /> Study
                </button>
                <button onClick={startQuiz}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${tab === 'quiz' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}>
                  <Trophy className="w-4 h-4" /> Quiz Mode
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={exportCSV} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Download CSV (Anki)">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={copyAll} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Copy all">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={printCards} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="Print">
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => { setCards([]); setInput(''); setTab('study'); }} className="p-2 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all" title="New set">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Study Mode */}
            {tab === 'study' && (
              <div>
                {/* Card */}
                <div className="flex justify-center mb-6" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                  <div className="relative w-full max-w-lg" style={{ perspective: '1200px' }}>
                    {/* Stack effect */}
                    <div className="absolute inset-0 bg-white/[0.02] border border-white/5 rounded-2xl translate-y-3 scale-[0.96]" />
                    <div className="absolute inset-0 bg-white/[0.03] border border-white/5 rounded-2xl translate-y-1.5 scale-[0.98]" />

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${currentIndex}-${flipped}`}
                        initial={{ rotateY: flipped ? -90 : 0, opacity: flipped ? 0 : 1 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: flipped ? 0 : 90, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        onClick={() => setFlipped(!flipped)}
                        className="relative min-h-[280px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl cursor-pointer flex flex-col items-center justify-center text-center hover:border-purple-500/30 transition-colors"
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                          {flipped ? '💡 Answer' : '❓ Question'}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); startEdit(currentIndex); }}
                          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-lg md:text-xl font-medium leading-relaxed">
                          {flipped ? cards[currentIndex].back : cards[currentIndex].front}
                        </p>
                        {!flipped && (
                          <p className="text-xs text-slate-500 mt-4">Click to flip</p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4">
                  <button onClick={goPrev} disabled={currentIndex === 0}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-slate-400 font-medium min-w-[60px] text-center">
                    {currentIndex + 1} / {cards.length}
                  </span>
                  <button onClick={goNext} disabled={currentIndex === cards.length - 1}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Card dots */}
                <div className="flex justify-center gap-1.5 mt-4 flex-wrap">
                  {cards.map((_, i) => (
                    <button key={i} onClick={() => { setFlipped(false); setCurrentIndex(i); }}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-purple-400 scale-125' : 'bg-white/20 hover:bg-white/40'}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Quiz Mode */}
            {tab === 'quiz' && (
              <div>
                {!quizDone ? (
                  <>
                    {/* Progress bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                        <span>Card {quizIndex + 1} of {quizCards.length}</span>
                        <span>✅ {score.know} · ❌ {score.dontKnow}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${((quizIndex) / quizCards.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Quiz card */}
                    <div className="flex justify-center mb-6">
                      <motion.div
                        key={`quiz-${quizIndex}-${quizFlipped}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setQuizFlipped(!quizFlipped)}
                        className="relative w-full max-w-lg min-h-[280px] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl cursor-pointer flex flex-col items-center justify-center text-center hover:border-amber-500/30 transition-colors"
                      >
                        <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                          {quizFlipped ? '💡 Answer' : '❓ Question'}
                        </div>
                        <p className="text-lg md:text-xl font-medium leading-relaxed">
                          {quizFlipped ? quizCards[quizIndex].back : quizCards[quizIndex].front}
                        </p>
                        {!quizFlipped && <p className="text-xs text-slate-500 mt-4">Click to reveal answer</p>}
                      </motion.div>
                    </div>

                    {/* Quiz actions */}
                    {quizFlipped && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-4">
                        <button onClick={() => quizAnswer(false)}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium">
                          <ThumbsDown className="w-4 h-4" /> Don&apos;t Know
                        </button>
                        <button onClick={() => quizAnswer(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-all text-sm font-medium">
                          <ThumbsUp className="w-4 h-4" /> Know It!
                        </button>
                      </motion.div>
                    )}
                  </>
                ) : (
                  /* Quiz results */
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto text-center bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                    <div className="text-5xl mb-4">
                      {scorePercent >= 80 ? '🏆' : scorePercent >= 50 ? '💪' : '📚'}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {scorePercent >= 80 ? 'Amazing!' : scorePercent >= 50 ? 'Good effort!' : 'Keep studying!'}
                    </h2>
                    <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                      {scorePercent}%
                    </p>
                    <div className="flex justify-center gap-6 mb-6 text-sm">
                      <span className="text-emerald-400">✅ {score.know} known</span>
                      <span className="text-red-400">❌ {score.dontKnow} to review</span>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <button onClick={startQuiz} className="px-5 py-2.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-xl text-sm font-medium hover:bg-purple-500/30 transition-all flex items-center gap-2">
                        <Shuffle className="w-4 h-4" /> Retry
                      </button>
                      <button onClick={() => setTab('study')} className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-medium hover:bg-white/10 transition-all flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Study
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* All cards list */}
            {tab === 'study' && (
              <div className="mt-10">
                <h3 className="text-sm font-medium text-slate-400 mb-4">All Cards ({cards.length})</h3>
                <div className="grid gap-3">
                  {cards.map((card, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className={`bg-white/5 border rounded-xl p-4 cursor-pointer hover:bg-white/[0.07] transition-all ${i === currentIndex ? 'border-purple-500/40' : 'border-white/10'}`}
                      onClick={() => { setCurrentIndex(i); setFlipped(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                      {editIndex === i ? (
                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                          <input value={editFront} onChange={e => setEditFront(e.target.value)}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                          <input value={editBack} onChange={e => setEditBack(e.target.value)}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                            <button onClick={() => setEditIndex(null)} className="px-3 py-1.5 bg-white/5 text-slate-400 rounded-lg text-xs flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate"><span className="text-purple-400 mr-2">Q{i + 1}.</span>{card.front}</p>
                            <p className="text-xs text-slate-400 mt-1 truncate">{card.back}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); startEdit(i); }}
                            className="p-1.5 text-slate-500 hover:text-white transition-colors shrink-0">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'How does the AI flashcard generator work?', a: 'Paste your notes or any text, choose the number of cards and difficulty level, and our AI instantly creates question-and-answer flashcards for studying.' },
              { q: 'Can I export flashcards to Anki?', a: 'Yes! Click the download button to get a CSV file that\'s fully compatible with Anki and other flashcard apps.' },
              { q: 'Is it free?', a: 'You get 3 free generations per day with up to 10 cards each. Pro users get unlimited generations with up to 20 cards.' },
              { q: 'What kind of content can I use?', a: 'Anything — lecture notes, textbook passages, Wikipedia articles, or even just a topic name. The AI adapts to your input.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-medium text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro CTA */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 text-center">
            <Crown className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-slate-400 text-sm mb-4">Unlimited generations, up to 20 cards, 5000 words, save decks & spaced repetition.</p>
            <div className="text-3xl font-bold text-white mb-4">$4.99<span className="text-sm text-slate-400 font-normal">/mo</span></div>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm">
              Get Pro Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
