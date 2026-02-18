'use client';

import RelatedTools from '@/components/RelatedTools';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Home, ChevronRight, Crown, Lock, AlertCircle,
  Download, Copy, Check, ZoomIn, ZoomOut, RotateCcw,
  GitBranch, Palette, Play, Code2, Image, FileText,
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

/* ── Types ── */
type DiagramType = 'flowchart' | 'sequence' | 'classDiagram' | 'stateDiagram-v2' | 'erDiagram' | 'gantt' | 'pie' | 'mindmap' | 'timeline';
type MermaidTheme = 'default' | 'dark' | 'forest' | 'neutral';

interface DiagramTypeOption {
  value: DiagramType;
  label: string;
  free: boolean;
  example: string;
}

const DIAGRAM_TYPES: DiagramTypeOption[] = [
  { value: 'flowchart', label: 'Flowchart', free: true, example: 'User login authentication flow with email and password validation' },
  { value: 'sequence', label: 'Sequence', free: true, example: 'API request flow between client, server, and database' },
  { value: 'mindmap', label: 'Mindmap', free: true, example: 'Web development technologies and their subcategories' },
  { value: 'classDiagram', label: 'Class Diagram', free: false, example: 'E-commerce system with User, Product, Order, and Payment classes' },
  { value: 'stateDiagram-v2', label: 'State Diagram', free: false, example: 'Order lifecycle: placed, processing, shipped, delivered, returned' },
  { value: 'erDiagram', label: 'ER Diagram', free: false, example: 'Blog database with users, posts, comments, and tags' },
  { value: 'gantt', label: 'Gantt Chart', free: false, example: 'Mobile app development project timeline over 3 months' },
  { value: 'pie', label: 'Pie Chart', free: false, example: 'Programming language popularity: JavaScript 30%, Python 25%, TypeScript 15%, Go 10%, Rust 8%, Others 12%' },
  { value: 'timeline', label: 'Timeline', free: false, example: 'History of web frameworks from 2010 to 2025' },
];

const THEMES: { value: MermaidTheme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'forest', label: 'Forest' },
  { value: 'neutral', label: 'Neutral' },
];

/* ── Usage tracking ── */
const STORAGE_KEY = 'sherutools_diagram_usage';
const FREE_LIMIT = 3;

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

/* ── FAQ Data ── */
const faqs = [
  { q: 'What is an AI Diagram Generator?', a: 'An AI Diagram Generator uses artificial intelligence to create professional diagrams from simple text descriptions. Just describe what you want, and the AI generates valid Mermaid.js code that renders as a beautiful diagram.' },
  { q: 'What types of diagrams can I create?', a: 'You can create flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, Gantt charts, pie charts, mindmaps, and timelines. Free users get access to flowcharts, sequence diagrams, and mindmaps.' },
  { q: 'Can I edit the generated diagram?', a: 'Yes! After generation, you can edit the Mermaid code directly and see live updates in the preview. You can also change themes and export in multiple formats.' },
  { q: 'What export formats are available?', a: 'You can download diagrams as SVG or PNG images, or copy the Mermaid code to use in other tools like GitHub, Notion, or any Mermaid-compatible platform.' },
  { q: 'Is there a free plan?', a: 'Yes! Free users can generate up to 3 diagrams per day using basic types (Flowchart, Sequence, Mindmap). Pro users get unlimited diagrams, all types, and SVG export.' },
];

export default function DiagramGeneratorPage() {
  const [description, setDescription] = useState('');
  const [diagramType, setDiagramType] = useState<DiagramType>('flowchart');
  const [mermaidCode, setMermaidCode] = useState('');
  const [editCode, setEditCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [theme, setTheme] = useState<MermaidTheme>('default');
  const [renderError, setRenderError] = useState('');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const renderIdRef = useRef(0);

  useEffect(() => { setUsageCount(getUsageToday()); }, []);

  // Render mermaid diagram
  const renderDiagram = useCallback(async (code: string) => {
    if (!code || !diagramRef.current) return;
    const currentId = ++renderIdRef.current;
    try {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme,
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
      });
      // Clear previous
      diagramRef.current.innerHTML = '';
      const { svg } = await mermaid.render(`diagram-${currentId}`, code);
      if (currentId === renderIdRef.current && diagramRef.current) {
        diagramRef.current.innerHTML = svg;
        setRenderError('');
      }
    } catch (err: unknown) {
      if (currentId === renderIdRef.current) {
        setRenderError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    }
  }, [theme]);

  // Re-render on code or theme change
  useEffect(() => {
    const t = setTimeout(() => renderDiagram(editCode), 500);
    return () => clearTimeout(t);
  }, [editCode, theme, renderDiagram]);

  const selectedType = DIAGRAM_TYPES.find(t => t.value === diagramType)!;

  const generate = async () => {
    if (!description.trim()) { setError('Please describe your diagram'); return; }

    const isFreeType = selectedType.free;
    const usage = getUsageToday();

    if (!isFreeType) {
      setError('This diagram type requires Pro. Upgrade to unlock all types!');
      return;
    }
    if (usage >= FREE_LIMIT) {
      setError(`Daily limit reached (${FREE_LIMIT}/day). Upgrade to Pro for unlimited diagrams!`);
      return;
    }

    setLoading(true);
    setError('');
    setRenderError('');

    try {
      const res = await fetch('/api/ai-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, diagramType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

      let code = data.code;

      // Try to render, self-correct up to 3 times
      let retries = 0;
      while (retries < 3) {
        try {
          const mermaid = (await import('mermaid')).default;
          mermaid.initialize({ startOnLoad: false, theme, securityLevel: 'loose' });
          await mermaid.parse(code);
          break; // Valid!
        } catch (parseErr: unknown) {
          retries++;
          if (retries >= 3) break;
          const errMsg = parseErr instanceof Error ? parseErr.message : 'Parse error';
          const fixRes = await fetch('/api/ai-diagram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fixCode: code, fixError: errMsg }),
          });
          const fixData = await fixRes.json();
          if (fixRes.ok && fixData.code) code = fixData.code;
        }
      }

      setMermaidCode(code);
      setEditCode(code);
      setZoom(1);
      const newCount = incrementUsage();
      setUsageCount(newCount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagram');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(editCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSVG = () => {
    if (!diagramRef.current) return;
    const svg = diagramRef.current.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'diagram.svg'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!diagramRef.current) return;
    const svg = diagramRef.current.querySelector('svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new window.Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl; a.download = 'diagram.png'; a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-2">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">AI Diagram Generator</span>
        </nav>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 py-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> AI-Powered
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          AI Diagram <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">Generator</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Describe what you want and instantly generate professional diagrams. Flowcharts, sequence diagrams, mindmaps, and more — powered by AI.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{usageCount}/{FREE_LIMIT} free today</span>
          <span className="flex items-center gap-1"><Crown className="w-3.5 h-3.5 text-amber-500" /> Pro: Unlimited</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid lg:grid-cols-2 gap-6">
          {/* Left: Input & Code */}
          <div className="space-y-4">
            {/* Diagram Type Selector */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Diagram Type</label>
              <div className="flex flex-wrap gap-2">
                {DIAGRAM_TYPES.map(t => (
                  <button key={t.value} onClick={() => setDiagramType(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      diagramType === t.value
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}>
                    {t.label}
                    {!t.free && <Lock className="w-3 h-3 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Input */}
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Describe Your Diagram</label>
              {/* Example chips */}
              <button onClick={() => setDescription(selectedType.example)}
                className="mb-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs hover:bg-blue-500/20 transition-colors">
                💡 Try: &quot;{selectedType.example.slice(0, 50)}...&quot;
              </button>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)}
                placeholder={`Describe your ${selectedType.label.toLowerCase()}...`}
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-sm"
              />
              <motion.button onClick={generate} disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full mt-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                ) : (
                  <><Play className="w-4 h-4" /> Generate Diagram</>
                )}
              </motion.button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Code Editor */}
            {editCode && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4" /> Mermaid Code
                  </span>
                  <button onClick={copyCode}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center gap-1">
                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <textarea
                  value={editCode} onChange={e => setEditCode(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
                  spellCheck={false}
                />
              </motion.div>
            )}
          </div>

          {/* Right: Diagram Preview */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 min-h-[400px] flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" /> Preview
                </span>
                <div className="flex items-center gap-2">
                  {/* Theme selector */}
                  <div className="flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <select value={theme} onChange={e => setTheme(e.target.value as MermaidTheme)}
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs border border-slate-200 dark:border-white/10 focus:outline-none">
                      {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  {/* Zoom */}
                  <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-500 min-w-[3ch] text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setZoom(1)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Diagram container */}
              <div className="flex-1 rounded-xl bg-white border border-slate-200 overflow-auto relative">
                {editCode ? (
                  <div className="p-4 min-h-[350px] flex items-center justify-center"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                    <div ref={diagramRef} className="w-full" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[350px] text-slate-400 text-sm">
                    <div className="text-center">
                      <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Your diagram will appear here</p>
                      <p className="text-xs mt-1">Describe what you want and click Generate</p>
                    </div>
                  </div>
                )}
                {renderError && (
                  <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                    ⚠️ {renderError}
                  </div>
                )}
              </div>

              {/* Export buttons */}
              {editCode && (
                <div className="flex gap-2 mt-3">
                  <button onClick={downloadPNG}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> PNG
                  </button>
                  <button onClick={downloadSVG}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> SVG
                    <Lock className="w-3 h-3 text-amber-400" />
                  </button>
                  <button onClick={copyCode}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5">
                    {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Code</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-5 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${faqOpen === i ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'AI Diagram Generator',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: 'Generate professional diagrams from text descriptions using AI. Flowcharts, sequence diagrams, mindmaps, and more.',
        url: 'https://sherutools.com/diagram-generator',
      }) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }) }} />
    
      <div className="max-w-6xl mx-auto px-4">
      <RelatedTools tools={[{"name":"AI Code Explainer","href":"/ai-code-explainer","description":"Understand code with AI","icon":"💻"},{"name":"Markdown Editor","href":"/markdown-editor","description":"Write and preview Markdown","icon":"📝"},{"name":"Screenshot Beautifier","href":"/screenshot-beautifier","description":"Beautify screenshots","icon":"✨"},{"name":"AI Landing Page","href":"/ai-landing-page","description":"Generate landing pages","icon":"🚀"}]} />
      </div>
    </div>
  );
}
