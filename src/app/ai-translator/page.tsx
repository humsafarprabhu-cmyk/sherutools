'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, ArrowRightLeft, Copy, Check, Loader2, Sparkles, Volume2 } from 'lucide-react';
import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Japanese', 'Korean', 'Chinese (Simplified)', 'Chinese (Traditional)', 'Arabic',
  'Hindi', 'Bengali', 'Turkish', 'Vietnamese', 'Thai', 'Indonesian', 'Dutch',
  'Polish', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Greek', 'Czech',
  'Romanian', 'Hungarian', 'Ukrainian', 'Hebrew', 'Malay', 'Filipino', 'Swahili',
];

const tones = [
  { id: 'standard', label: 'Standard' },
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
  { id: 'business', label: 'Business' },
  { id: 'literary', label: 'Literary' },
];

const faqs = [
  { question: 'How accurate is the AI translation?', answer: 'Our AI translator uses GPT-4o-mini which provides high-quality translations that understand context, idioms, and nuance — often better than rule-based translators.' },
  { question: 'How many languages are supported?', answer: 'We support 33+ languages including all major world languages, Asian languages, European languages, and more.' },
  { question: 'Can I choose the translation tone?', answer: 'Yes! Choose from Standard, Formal, Casual, Business, or Literary tones to match your needs.' },
  { question: 'Is my text stored or logged?', answer: 'No. Your text is processed by the AI and immediately discarded. We never store translations.' },
  { question: 'What\'s the character limit?', answer: 'Free users can translate up to 2,000 characters per request, 5 times per day. Pro users get unlimited translations.' },
];

export default function AiTranslator() {
  const [sourceText, setSourceText] = useState('');
  const [translated, setTranslated] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [tone, setTone] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const FREE_LIMIT = 5;
  const STORAGE_KEY = 'sheru_translator_usage';

  function getUsage() {
    if (typeof window === 'undefined') return { count: 0, date: '' };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: '' };
    const data = JSON.parse(raw);
    if (data.date !== new Date().toDateString()) return { count: 0, date: new Date().toDateString() };
    return data;
  }

  function incrementUsage() {
    const today = new Date().toDateString();
    const usage = getUsage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: usage.count + 1, date: today }));
  }

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translated);
    setTranslated(sourceText);
  };

  async function handleTranslate() {
    if (!sourceText.trim()) return;
    const usage = getUsage();
    if (usage.count >= FREE_LIMIT) {
      setError(`Daily limit reached (${FREE_LIMIT}/day). Upgrade to Pro for unlimited!`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText, from: sourceLang, to: targetLang, tone }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setTranslated(data.translation);
      incrementUsage();
    } catch {
      setError('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const remaining = FREE_LIMIT - getUsage().count;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      <section className="relative pt-20 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" /> AI-Powered Translation
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent mb-4">
            AI Translator
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-slate-400 max-w-2xl mx-auto">
            Translate text between 33+ languages with context-aware AI. Choose your preferred tone and style.
          </motion.p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Language Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex items-center gap-3 mb-6">
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer">
              {languages.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
            </select>
            <button onClick={swapLanguages} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
              <ArrowRightLeft className="w-5 h-5" />
            </button>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer">
              {languages.map(l => <option key={l} value={l} className="bg-slate-900">{l}</option>)}
            </select>
          </motion.div>

          {/* Tone Selector */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-wrap gap-2 mb-6 justify-center">
            {tones.map(t => (
              <button key={t.id} onClick={() => setTone(t.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tone === t.id ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'
                }`}>
                {t.label}
              </button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-1 h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-medium text-slate-300">{sourceLang}</span>
                  <span className="text-xs text-slate-500">{sourceText.length} chars</span>
                </div>
                <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Type or paste text to translate..."
                  className="w-full h-64 bg-transparent text-white text-sm p-4 resize-none focus:outline-none placeholder:text-slate-600" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-1 h-full">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-sm font-medium text-slate-300">{targetLang}</span>
                  {translated && (
                    <button onClick={() => { navigator.clipboard.writeText(translated); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <div className="h-64 p-4 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 text-blue-400 animate-spin" /></div>
                  ) : translated ? (
                    <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{translated}</div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-600">Translation will appear here</div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
                {remaining <= 0 && <a href="https://sherutools.lemonsqueezy.com" target="_blank" rel="noopener noreferrer" className="ml-2 underline text-amber-400">Upgrade →</a>}
              </div>
            )}
            <button onClick={handleTranslate} disabled={loading || !sourceText.trim()}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25">
              {loading ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Translating...</span>
                : <span className="flex items-center gap-2"><Languages className="w-4 h-4" /> Translate ({remaining} free left)</span>}
            </button>
          </motion.div>
        </div>
      </section>

      <FAQSection faqs={faqs} />
      <RelatedTools tools={[{ name: "AI Email Writer", href: "/ai-email-writer", description: "Generate professional emails instantly", icon: "✉️" }, { name: "JSON Formatter", href: "/json-formatter", description: "Format and validate JSON data", icon: "📋" }, { name: "PDF Tools", href: "/pdf-tools", description: "Merge, split, compress PDFs", icon: "📄" }]} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebApplication',
        name: 'AI Translator - SheruTools', url: 'https://sherutools.com/ai-translator',
        description: 'Free AI translator. Translate between 33+ languages with context-aware AI and tone control.',
        applicationCategory: 'UtilityApplication', operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
          { '@type': 'ListItem', position: 2, name: 'AI Translator', item: 'https://sherutools.com/ai-translator' },
        ],
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      })}} />
    </div>
  );
}
