'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { motion, AnimatePresence } from 'framer-motion';
import { Layout, Monitor, Tablet, Smartphone, Download, Copy, RefreshCw, Code2, Eye, ChevronDown, Check, Sparkles, Crown, Zap } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

const STYLES = ['Modern', 'Minimal', 'Bold', 'Gradient', 'Dark', 'Playful'] as const;
const SECTION_DEFAULTS: Record<string, boolean> = {
  hero: true, features: true, pricing: true, testimonials: true, faq: true, cta: true, footer: true,
};

const PROGRESS_STEPS = [
  'Creating headline...',
  'Designing hero section...',
  'Building features grid...',
  'Adding pricing tables...',
  'Writing testimonials...',
  'Polishing design...',
  'Finalizing page...',
];

const DAILY_LIMIT = 3;

function getUsageToday(): number {
  if (typeof window === 'undefined') return 0;
  const key = `lp_usage_${new Date().toISOString().slice(0, 10)}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

function incrementUsage(): void {
  const key = `lp_usage_${new Date().toISOString().slice(0, 10)}`;
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, String(current + 1));
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function AILandingPage() {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<string>('Modern');
  const [color, setColor] = useState('#6366f1');
  const [sections, setSections] = useState<Record<string, boolean>>({ ...SECTION_DEFAULTS });
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [usage, setUsage] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setUsage(getUsageToday());
  }, []);

  const generate = useCallback(async () => {
    if (!description.trim()) return;
    if (getUsageToday() >= DAILY_LIMIT) {
      setError('Daily limit reached. Upgrade to Pro for unlimited generations!');
      return;
    }

    setLoading(true);
    setError('');
    setHtml('');
    setProgressStep(0);
    setViewMode('preview');

    const interval = setInterval(() => {
      setProgressStep(prev => (prev < PROGRESS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const res = await fetch('/api/ai-landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, style: style.toLowerCase(), color, sections }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        let errMsg = 'Generation failed';
        try { const data = await res.json(); errMsg = data.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (!data.html || typeof data.html !== 'string' || !data.html.includes('<')) {
        throw new Error('Invalid response from AI. Please try again.');
      }
      setHtml(data.html);
      incrementUsage();
      setUsage(getUsageToday());
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Generation timed out. Try a shorter description or try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }, [description, style, color, sections]);

  const downloadHTML = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deviceWidths: Record<DeviceType, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/[0.02] dark:to-pink-500/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered • No Coding Required
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
          >
            Turn One Line Into a{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Landing Page
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
          >
            Describe your product in one sentence. AI generates a complete, beautiful, responsive landing page in seconds.
          </motion.p>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-40 blur-lg transition-all duration-500" />
              <div className="relative">
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !loading && generate()}
                  placeholder="A fitness app for busy professionals..."
                  className="w-full px-6 py-5 rounded-2xl text-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Customize Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setCustomizeOpen(!customizeOpen)}
                className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${customizeOpen ? 'rotate-180' : ''}`} />
                Customize Style & Sections
              </button>

              <AnimatePresence>
                {customizeOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-6 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl space-y-5">
                      {/* Style Picker */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Style</label>
                        <div className="flex flex-wrap gap-2">
                          {STYLES.map(s => (
                            <button
                              key={s}
                              onClick={() => setStyle(s)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                style === s
                                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Picker */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Brand Color</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={color}
                            onChange={e => setColor(e.target.value)}
                            className="w-10 h-10 rounded-lg border-2 border-slate-200 dark:border-white/10 cursor-pointer"
                          />
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{color}</span>
                        </div>
                      </div>

                      {/* Section Toggles */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sections</label>
                        <div className="flex flex-wrap gap-2">
                          {Object.keys(SECTION_DEFAULTS).map(key => (
                            <button
                              key={key}
                              onClick={() => setSections(prev => ({ ...prev, [key]: !prev[key] }))}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                                sections[key]
                                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                                  : 'bg-slate-100 dark:bg-white/5 text-slate-400 border border-transparent'
                              }`}
                            >
                              {sections[key] && <Check className="w-3 h-3 inline mr-1" />}
                              {key}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
            <motion.button
              onClick={generate}
              disabled={loading || !description.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Landing Page ✨
                  </>
                )}
              </span>
            </motion.button>

            {/* Usage Counter */}
            <div className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
              {usage}/{DAILY_LIMIT} free today
              {usage >= DAILY_LIMIT && (
                <span className="ml-2 text-indigo-500 dark:text-indigo-400">
                  — <a href="https://sherutools.lemonsqueezy.com" target="_blank" rel="noopener noreferrer" className="underline">Upgrade to Pro</a> for unlimited
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto px-4 mb-6"
          >
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-4 pb-12"
          >
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden">
              {/* Shimmer skeleton */}
              <div className="p-8 space-y-6">
                <div className="text-center space-y-3">
                  <motion.p
                    key={progressStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-indigo-500 dark:text-indigo-400 font-medium"
                  >
                    {PROGRESS_STEPS[progressStep]}
                  </motion.p>
                  <div className="flex justify-center gap-1">
                    {PROGRESS_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-1 rounded-full transition-all duration-500 ${
                          i <= progressStep ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {/* Skeleton blocks */}
                <div className="space-y-4 animate-pulse">
                  <div className="h-48 rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-white/5 dark:via-white/10 dark:to-white/5" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 rounded-xl bg-slate-200 dark:bg-white/5" />
                    <div className="h-24 rounded-xl bg-slate-200 dark:bg-white/5" />
                    <div className="h-24 rounded-xl bg-slate-200 dark:bg-white/5" />
                  </div>
                  <div className="h-32 rounded-xl bg-slate-200 dark:bg-white/5" />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Preview Section */}
      <AnimatePresence>
        {html && !loading && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto px-4 pb-16"
          >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              {/* View Toggle */}
              <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'preview'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'code'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Code2 className="w-4 h-4" /> Code
                </button>
              </div>

              {/* Device Toggle */}
              {viewMode === 'preview' && (
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5">
                  {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([d, Icon]) => (
                    <button
                      key={d}
                      onClick={() => setDevice(d)}
                      className={`p-2 rounded-lg transition-all ${
                        device === d
                          ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={generate}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Regenerate
                </button>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={downloadHTML}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" /> Download HTML
                </button>
              </div>
            </div>

            {/* Preview / Code View */}
            {viewMode === 'preview' ? (
              <div className="flex justify-center">
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  style={{ width: deviceWidths[device], maxWidth: '100%' }}
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white shadow-2xl"
                >
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white dark:bg-slate-700 rounded-lg px-3 py-1 text-xs text-slate-400 text-center truncate">
                        your-landing-page.com
                      </div>
                    </div>
                  </div>
                  <iframe
                    ref={iframeRef}
                    srcDoc={html}
                    className="w-full border-0"
                    style={{ height: '80vh' }}
                    sandbox="allow-scripts allow-same-origin"
                    title="Landing Page Preview"
                    onError={() => setError('Preview failed to render. Try downloading the HTML instead.')}
                  />
                </motion.div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950">
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-all"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-6 overflow-auto max-h-[80vh] text-sm text-slate-300 leading-relaxed">
                  <code>{html}</code>
                </pre>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Pro Upsell */}
      <section id="pro" className="max-w-3xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px]"
        >
          <div className="rounded-3xl bg-white dark:bg-slate-950 p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">SheruTools Pro</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Unlimited landing pages & more</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                'Unlimited generations',
                'Remove SheruTools badge',
                'Priority generation',
                'All styles & sections',
                'Custom domain (coming soon)',
                'Priority support',
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">$4.99</span>
              <span className="text-slate-500 dark:text-slate-400 mb-1">/month</span>
            </div>
            <a
              href="https://sherutools.lemonsqueezy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-xl shadow-indigo-500/25"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Pro
            </a>
          </div>
        </motion.div>
      </section>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"How does the AI Landing Page Generator work?","answer":"Simply describe your product or service in one sentence. Our AI generates a complete, responsive landing page with hero section, features, pricing, testimonials, and more."},{"question":"Is the generated landing page responsive?","answer":"Yes! All generated landing pages are fully responsive and look great on desktop, tablet, and mobile devices."},{"question":"Can I download the generated HTML?","answer":"Yes, you can download the complete HTML file and host it anywhere, or copy the code directly to your clipboard."},{"question":"How many landing pages can I generate for free?","answer":"Free users can generate up to 3 landing pages per day. Upgrade to Pro for unlimited generations."}]} />
      <RelatedTools tools={[{"name":"AI Email Writer","href":"/ai-email-writer","description":"Generate professional emails with AI","icon":"📧"},{"name":"Screenshot Beautifier","href":"/screenshot-beautifier","description":"Make screenshots look professional","icon":"🖼️"},{"name":"Color Palette Generator","href":"/color-palette-generator","description":"Create beautiful color schemes","icon":"🎨"},{"name":"CSS Gradient Generator","href":"/css-gradient-generator","description":"Create stunning CSS gradients","icon":"🌈"}]} />
      </div>
    </div>
  );
}
