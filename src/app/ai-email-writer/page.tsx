'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Sparkles, Copy, Check, RefreshCw, ArrowDown, ArrowUp,
  ChevronRight, Crown, Briefcase, UserPlus, Heart, AlertCircle,
  HelpCircle, HandshakeIcon, LogOut, MessageCircle, PartyPopper,
  Award, Send, Minus, Plus, Smile, Zap, Shield, Megaphone, HeartHandshake,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

const purposes = [
  { value: 'professional', label: 'Professional', icon: Briefcase },
  { value: 'follow-up', label: 'Follow-up', icon: RefreshCw },
  { value: 'cold outreach', label: 'Cold Outreach', icon: Megaphone },
  { value: 'thank you', label: 'Thank You', icon: Heart },
  { value: 'apology', label: 'Apology', icon: AlertCircle },
  { value: 'request', label: 'Request', icon: HelpCircle },
  { value: 'introduction', label: 'Introduction', icon: UserPlus },
  { value: 'resignation', label: 'Resignation', icon: LogOut },
  { value: 'complaint', label: 'Complaint', icon: MessageCircle },
  { value: 'invitation', label: 'Invitation', icon: PartyPopper },
  { value: 'congratulations', label: 'Congratulations', icon: Award },
  { value: 'recommendation', label: 'Recommendation', icon: HandshakeIcon },
];

const tones = [
  { value: 'formal', label: 'Formal', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Briefcase },
  { value: 'friendly', label: 'Friendly', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: Smile },
  { value: 'casual', label: 'Casual', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Send },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Zap },
  { value: 'persuasive', label: 'Persuasive', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Shield },
  { value: 'empathetic', label: 'Empathetic', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', icon: HeartHandshake },
];

const lengths = [
  { value: 'short', label: 'Short', icon: Minus },
  { value: 'medium', label: 'Medium', icon: Mail },
  { value: 'long', label: 'Long', icon: Plus },
];

const DAILY_LIMIT = 5;
const STORAGE_KEY = 'sheru_ai_email_usage';

function getUsage(): { count: number; date: string } {
  if (typeof window === 'undefined') return { count: 0, date: '' };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: new Date().toDateString() };
    const data = JSON.parse(raw);
    if (data.date !== new Date().toDateString()) return { count: 0, date: new Date().toDateString() };
    return data;
  } catch {
    return { count: 0, date: new Date().toDateString() };
  }
}

function incrementUsage() {
  const usage = getUsage();
  const updated = { count: usage.count + 1, date: new Date().toDateString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.count;
}

function parseEmail(raw: string): { subject: string; body: string } {
  const match = raw.match(/^SUBJECT:\s*(.+?)(?:\n\n|\r\n\r\n)([\s\S]+)$/i);
  if (match) return { subject: match[1].trim(), body: match[2].trim() };
  const lines = raw.split('\n');
  if (lines[0]?.toLowerCase().startsWith('subject:')) {
    return { subject: lines[0].replace(/^subject:\s*/i, '').trim(), body: lines.slice(2).join('\n').trim() };
  }
  return { subject: '', body: raw.trim() };
}

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 dark:from-white/5 dark:via-white/10 dark:to-white/5 ${className}`} />
  );
}

export default function AIEmailWriter() {
  const [purpose, setPurpose] = useState('professional');
  const [tone, setTone] = useState('formal');
  const [recipient, setRecipient] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [editLoading, setEditLoading] = useState('');

  useEffect(() => {
    setUsageCount(getUsage().count);
  }, []);

  const remaining = DAILY_LIMIT - usageCount;

  const generate = useCallback(async () => {
    if (remaining <= 0) { setError('Daily limit reached. Upgrade to Pro for unlimited emails!'); return; }
    if (!recipient.trim() || !keyPoints.trim()) { setError('Please fill in recipient and key points.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, tone, recipient, keyPoints, length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      const parsed = parseEmail(data.email);
      setSubject(parsed.subject);
      setBody(parsed.body);
      const newCount = incrementUsage();
      setUsageCount(newCount);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [purpose, tone, recipient, keyPoints, length, remaining]);

  const quickEdit = useCallback(async (instruction: string) => {
    if (!body) return;
    if (remaining <= 0) { setError('Daily limit reached.'); return; }
    setEditLoading(instruction);
    setError('');
    try {
      const fullEmail = subject ? `SUBJECT: ${subject}\n\n${body}` : body;
      const res = await fetch('/api/ai-email-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to edit');
      const parsed = parseEmail(data.email);
      setSubject(parsed.subject);
      setBody(parsed.body);
      const newCount = incrementUsage();
      setUsageCount(newCount);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Edit failed.');
    } finally {
      setEditLoading('');
    }
  }, [body, subject, remaining]);

  const copyText = useCallback(async (text: string, type: 'subject' | 'body') => {
    await navigator.clipboard.writeText(text);
    if (type === 'subject') { setCopiedSubject(true); setTimeout(() => setCopiedSubject(false), 2000); }
    else { setCopiedBody(true); setTimeout(() => setCopiedBody(false), 2000); }
  }, []);

  const hasOutput = !!(subject || body);

  return (
    <div className="min-h-screen dot-pattern">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">AI Email Writer</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-500 text-sm font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Powered by AI
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
            AI Email <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">Writer</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Generate professional emails in seconds. Choose purpose, tone, and key points — AI does the rest.
          </p>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl space-y-5">
              {/* Purpose */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Purpose</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {purposes.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPurpose(p.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        purpose === p.value
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-500 dark:text-sky-400'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <p.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {tones.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                        tone === t.value ? t.color : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recipient</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="e.g. my boss, a client, HR department"
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all text-sm"
                />
              </div>

              {/* Key Points */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Points</label>
                <textarea
                  value={keyPoints}
                  onChange={e => setKeyPoints(e.target.value)}
                  rows={4}
                  placeholder={"• Requesting a meeting next week\n• Discuss Q1 budget\n• Propose new timeline"}
                  className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all text-sm resize-none"
                />
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Length</label>
                <div className="flex gap-2">
                  {lengths.map(l => (
                    <button
                      key={l.value}
                      onClick={() => setLength(l.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        length === l.value
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-500 dark:text-sky-400'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <l.icon className="w-3.5 h-3.5" />
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate button + usage */}
              <div className="space-y-3">
                <motion.button
                  onClick={generate}
                  disabled={loading || remaining <= 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative overflow-hidden py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <RefreshCw className="w-4 h-4" />
                      </motion.div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Email ✨
                    </>
                  )}
                </motion.button>

                {/* Usage counter */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(usageCount / DAILY_LIMIT) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {usageCount}/{DAILY_LIMIT} free today
                  </span>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {error}
                </motion.div>
              )}
            </div>

            {/* Pro upsell */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Upgrade to Pro</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unlimited emails, templates library, custom tones & more.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-amber-500">$2.99</span>
                    <span className="text-xs text-slate-400">/month</span>
                  </div>
                  <a href="https://sherutools.lemonsqueezy.com/checkout/buy/bc0a3fd1-9f86-4148-8c78-ff84708bf027" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block px-4 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-medium hover:bg-amber-600 transition-colors">
                    Upgrade Now →
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Output */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl min-h-[500px] flex flex-col">
              {loading ? (
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Subject Line</div>
                    <ShimmerBlock className="h-12 w-full" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Email Body</div>
                    <ShimmerBlock className="h-32 w-full mb-2" />
                    <ShimmerBlock className="h-24 w-full mb-2" />
                    <ShimmerBlock className="h-16 w-3/4" />
                  </div>
                </div>
              ) : hasOutput ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Subject */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Subject Line</span>
                      <button
                        onClick={() => copyText(subject, 'subject')}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-sky-500 transition-colors"
                      >
                        {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedSubject ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-900 dark:text-white">
                      {subject || '(No subject)'}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Email Body</span>
                      <button
                        onClick={() => copyText(body, 'body')}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-sky-500 transition-colors"
                      >
                        {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedBody ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                      {body}
                    </div>
                  </div>

                  {/* Quick edit buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      { label: 'Shorter', instruction: 'Make this email shorter and more concise', icon: ArrowDown },
                      { label: 'Longer', instruction: 'Make this email longer with more detail', icon: ArrowUp },
                      { label: 'More Formal', instruction: 'Make this email more formal and professional', icon: Briefcase },
                      { label: 'More Casual', instruction: 'Make this email more casual and friendly', icon: Smile },
                      { label: 'Regenerate', instruction: '__regenerate__', icon: RefreshCw },
                    ].map(btn => (
                      <motion.button
                        key={btn.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!!editLoading}
                        onClick={() => btn.instruction === '__regenerate__' ? generate() : quickEdit(btn.instruction)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-400 hover:border-sky-500/30 hover:text-sky-500 transition-all disabled:opacity-50"
                      >
                        {editLoading === btn.instruction ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <RefreshCw className="w-3 h-3" />
                          </motion.div>
                        ) : (
                          <btn.icon className="w-3 h-3" />
                        )}
                        {btn.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-sky-500/50" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your email will appear here</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Fill in the form and click Generate</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI badge */}
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Sparkles className="w-3 h-3" />
              <span>Powered by AI • Your data is not stored</span>
            </div>
          </motion.div>
        </div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"Is the AI Email Writer free?","answer":"Yes! Generate professional emails completely free with no sign-up required. Free users get a daily generation limit."},{"question":"What types of emails can I generate?","answer":"You can generate business emails, follow-ups, cold outreach, thank you notes, apologies, meeting requests, and many more professional email types."},{"question":"Can I customize the tone of generated emails?","answer":"Yes, choose from multiple tones including professional, friendly, formal, casual, and persuasive to match your communication style."},{"question":"Are the generated emails unique?","answer":"Yes, each email is uniquely generated by AI based on your specific inputs, purpose, and key points."}]} />
      <RelatedTools tools={[{"name":"AI Rewriter","href":"/ai-rewriter","description":"Rewrite text in different tones and styles","icon":"✍️"},{"name":"AI Landing Page","href":"/ai-landing-page","description":"Generate landing pages from a description","icon":"🚀"},{"name":"Word Counter","href":"/word-counter","description":"Count words, characters, and reading time","icon":"📊"},{"name":"Lorem Ipsum","href":"/lorem-ipsum","description":"Generate placeholder text instantly","icon":"📄"}]} />
      </div>
    </div>
  );
}
