'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Copy, Check, Loader2, ChevronDown, Zap, BookOpen, ListChecks, MessageSquare } from 'lucide-react';
import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

type SummaryStyle = 'concise' | 'bullet' | 'detailed' | 'eli5' | 'academic';

const styles: { id: SummaryStyle; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'concise', label: 'Concise', icon: <Zap className="w-4 h-4" />, desc: '2-3 sentence summary' },
  { id: 'bullet', label: 'Bullet Points', icon: <ListChecks className="w-4 h-4" />, desc: 'Key points as bullets' },
  { id: 'detailed', label: 'Detailed', icon: <BookOpen className="w-4 h-4" />, desc: 'Comprehensive breakdown' },
  { id: 'eli5', label: 'ELI5', icon: <MessageSquare className="w-4 h-4" />, desc: 'Explain like I\'m 5' },
  { id: 'academic', label: 'Academic', icon: <FileText className="w-4 h-4" />, desc: 'Formal academic style' },
];

const faqs = [
  { question: 'How does the AI summarizer work?', answer: 'Our AI summarizer uses GPT-4o-mini to analyze your text and generate concise summaries while preserving key information and context.' },
  { question: 'What types of content can I summarize?', answer: 'You can summarize articles, research papers, blog posts, meeting notes, emails, essays, reports, and any other text content.' },
  { question: 'How long can the input text be?', answer: 'Free users can summarize up to 3,000 characters. Pro users get unlimited text length for longer documents.' },
  { question: 'Is my text data stored?', answer: 'No. Your text is sent to the AI for processing and immediately discarded. We never store or log your content.' },
  { question: 'Can I choose the summary length?', answer: 'Yes! Choose from 5 styles: Concise (2-3 sentences), Bullet Points, Detailed breakdown, ELI5 (simple language), or Academic (formal style).' },
];

export default function AiSummarizer() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState<SummaryStyle>('concise');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const FREE_LIMIT = 5;
  const STORAGE_KEY = 'sheru_summarizer_usage';

  function getUsage() {
    if (typeof window === 'undefined') return { count: 0, date: '' };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: '' };
    const data = JSON.parse(raw);
    const today = new Date().toDateString();
    if (data.date !== today) return { count: 0, date: today };
    return data;
  }

  function incrementUsage() {
    const today = new Date().toDateString();
    const usage = getUsage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: usage.count + 1, date: today }));
  }

  async function handleSummarize() {
    if (!text.trim()) return;
    const usage = getUsage();
    if (usage.count >= FREE_LIMIT) {
      setError(`Daily limit reached (${FREE_LIMIT} summaries/day). Upgrade to Pro for unlimited!`);
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await fetch('/api/ai-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style }),
      });

      if (!res.ok) throw new Error('Failed to generate summary');
      const data = await res.json();
      setSummary(data.summary);
      incrementUsage();
    } catch {
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const remaining = FREE_LIMIT - getUsage().count;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Hero */}
      <section className="relative pt-20 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.15),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" /> AI-Powered Text Summarizer
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent mb-4">
            AI Text Summarizer
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-400 max-w-2xl mx-auto">
            Instantly condense articles, papers, and documents into clear, concise summaries. Choose your preferred style.
          </motion.p>
        </div>
      </section>

      {/* Main Tool */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Style Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-2 mb-6 justify-center">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  style === s.id
                    ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="relative">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-1 h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-medium text-slate-300">Input Text</span>
                  <span className="text-xs text-slate-500">{wordCount} words</span>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your article, paper, or any text here..."
                  className="w-full h-80 bg-transparent text-white text-sm p-4 resize-none focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </motion.div>

            {/* Output */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="relative">
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-1 h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-medium text-slate-300">Summary</span>
                  {summary && (
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="h-80 p-4 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                    </div>
                  ) : summary ? (
                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{summary}</div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-600">
                      Summary will appear here
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Summarize Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
                {remaining <= 0 && (
                  <a href="https://sherutools.lemonsqueezy.com" target="_blank" rel="noopener noreferrer" className="ml-2 underline text-amber-400 hover:text-amber-300">
                    Upgrade to Pro →
                  </a>
                )}
              </div>
            )}
            <button
              onClick={handleSummarize}
              disabled={loading || !text.trim()}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Summarizing...</span>
              ) : (
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Summarize ({remaining} free left today)</span>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Zap className="w-5 h-5 text-yellow-400" />, title: 'Instant Results', desc: 'Get summaries in seconds, not minutes' },
            { icon: <ListChecks className="w-5 h-5 text-green-400" />, title: '5 Summary Styles', desc: 'Concise, bullets, detailed, ELI5, academic' },
            { icon: <FileText className="w-5 h-5 text-blue-400" />, title: 'Any Content', desc: 'Articles, papers, emails, meeting notes' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-xl p-5 text-center">
              <div className="flex justify-center mb-3">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-xs text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <FAQSection faqs={faqs} />
      <RelatedTools tools={[{ name: "AI Email Writer", href: "/ai-email-writer", description: "Generate professional emails instantly", icon: "✉️" }, { name: "JSON Formatter", href: "/json-formatter", description: "Format and validate JSON data", icon: "📋" }, { name: "PDF Tools", href: "/pdf-tools", description: "Merge, split, compress PDFs", icon: "📄" }]} />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'AI Text Summarizer - SheruTools',
        url: 'https://sherutools.com/ai-summarizer',
        description: 'Free AI text summarizer. Instantly condense articles, papers, and documents into clear summaries.',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
          { '@type': 'ListItem', position: 2, name: 'AI Summarizer', item: 'https://sherutools.com/ai-summarizer' },
        ],
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      })}} />
    </div>
  );
}
