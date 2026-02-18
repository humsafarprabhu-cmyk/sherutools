'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Braces, ChevronRight, Copy, Download, Upload, Trash2, Sparkles,
  CheckCircle2, XCircle, Search, ChevronDown, ChevronUp, Lock,
  Crown, FileJson, Hash, Layers, Key, AlignLeft, Minus, RotateCcw,
  Home,
} from 'lucide-react';

// ── Sample JSON ──
const SAMPLE_JSON = JSON.stringify({
  name: "SheruTools",
  version: "2.0.0",
  description: "Free online tools that actually work",
  features: ["JSON Formatter", "Invoice Generator", "QR Codes"],
  config: {
    theme: "dark",
    language: "en",
    maxFileSize: 10485760,
    enabled: true,
    metadata: null
  },
  stats: {
    users: 5000,
    tools: 10,
    uptime: 99.99
  },
  tags: ["free", "open-source", "privacy-first"]
}, null, 2);

// ── Helpers ──
function countKeys(obj: unknown): number {
  if (obj === null || typeof obj !== 'object') return 0;
  if (Array.isArray(obj)) return obj.reduce((s: number, v) => s + countKeys(v), 0);
  return Object.keys(obj).length + Object.values(obj).reduce((s: number, v) => s + countKeys(v), 0);
}

function maxDepth(obj: unknown, d = 0): number {
  if (obj === null || typeof obj !== 'object') return d;
  if (Array.isArray(obj)) return obj.length === 0 ? d + 1 : Math.max(...obj.map(v => maxDepth(v, d + 1)));
  const vals = Object.values(obj);
  return vals.length === 0 ? d + 1 : Math.max(...vals.map(v => maxDepth(v, d + 1)));
}

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|\bnull\b)/g,
    (match) => {
      let cls = 'text-blue-400'; // number
      if (/^"/.test(match)) {
        cls = match.endsWith(':') ? 'text-purple-400' : 'text-green-400'; // key : string
      } else if (/true|false/.test(match)) {
        cls = 'text-orange-400';
      } else if (/null/.test(match)) {
        cls = 'text-red-400';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ── Tree View Component ──
function JsonTreeNode({ keyName, value, depth, searchTerm, defaultExpanded }: {
  keyName?: string;
  value: unknown;
  depth: number;
  searchTerm: string;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);
  const entries = isObject ? (isArray ? value.map((v, i) => [String(i), v] as [string, unknown]) : Object.entries(value as Record<string, unknown>)) : [];
  const matchesSearch = searchTerm && (
    (keyName && keyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (!isObject && String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderValue = () => {
    if (value === null) return <span className="text-red-400 font-mono text-sm">null</span>;
    if (typeof value === 'boolean') return <span className="text-orange-400 font-mono text-sm">{String(value)}</span>;
    if (typeof value === 'number') return <span className="text-blue-400 font-mono text-sm">{value}</span>;
    if (typeof value === 'string') return <span className="text-green-400 font-mono text-sm">&quot;{value}&quot;</span>;
    return null;
  };

  return (
    <div className={`${depth > 0 ? 'ml-5 border-l border-slate-700/30 pl-3' : ''}`}>
      <div
        className={`flex items-center gap-1.5 py-0.5 px-1 rounded-md cursor-pointer hover:bg-white/5 transition-colors group ${matchesSearch ? 'bg-yellow-500/10 ring-1 ring-yellow-500/30' : ''}`}
        onClick={() => isObject && setExpanded(!expanded)}
      >
        {isObject ? (
          <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </motion.div>
        ) : <div className="w-3.5" />}
        {keyName !== undefined && (
          <span className="text-purple-400 font-mono text-sm">{keyName}<span className="text-slate-500">:</span></span>
        )}
        {isObject ? (
          <span className="text-slate-500 text-sm font-mono">
            {isArray ? `[${entries.length}]` : `{${entries.length}}`}
          </span>
        ) : renderValue()}
      </div>
      <AnimatePresence>
        {isObject && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            {entries.map(([k, v]) => (
              <JsonTreeNode key={k} keyName={k} value={v} depth={depth + 1} searchTerm={searchTerm} defaultExpanded={defaultExpanded && depth < 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──
export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [indent, setIndent] = useState<number | 'tab'>(2);
  const [viewMode, setViewMode] = useState<'formatted' | 'tree'>('formatted');
  const [parsedJson, setParsedJson] = useState<unknown>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandAll, setExpandAll] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const indentStr = indent === 'tab' ? '\t' : indent;

  const validate = useCallback((text: string) => {
    if (!text.trim()) { setIsValid(null); setError(null); setOutput(''); setParsedJson(null); return null; }
    try {
      const obj = JSON.parse(text);
      setIsValid(true);
      setError(null);
      setParsedJson(obj);
      return obj;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setIsValid(false);
      setError(msg);
      setParsedJson(null);
      setOutput('');
      return null;
    }
  }, []);

  const handleFormat = useCallback(() => {
    const obj = validate(input);
    if (obj !== null) setOutput(JSON.stringify(obj, null, indentStr));
  }, [input, indentStr, validate]);

  const handleMinify = useCallback(() => {
    const obj = validate(input);
    if (obj !== null) setOutput(JSON.stringify(obj));
  }, [input, validate]);

  const handleValidate = useCallback(() => { validate(input); }, [input, validate]);

  const handleClear = useCallback(() => {
    setInput(''); setOutput(''); setError(null); setIsValid(null); setParsedJson(null); setSearchTerm('');
  }, []);

  const handleSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    try {
      const obj = JSON.parse(SAMPLE_JSON);
      setIsValid(true); setError(null); setParsedJson(obj);
      setOutput(JSON.stringify(obj, null, indentStr));
    } catch {}
  }, [indentStr]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output || input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output, input]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output || input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'formatted.json'; a.click();
    URL.revokeObjectURL(url);
  }, [output, input]);

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setInput(text);
      try {
        const obj = JSON.parse(text);
        setIsValid(true); setError(null); setParsedJson(obj);
        setOutput(JSON.stringify(obj, null, indentStr));
      } catch (err: unknown) {
        setIsValid(false); setError(err instanceof Error ? err.message : 'Invalid JSON'); setParsedJson(null); setOutput('');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [indentStr]);

  // Stats
  const stats = useMemo(() => {
    const text = output || input;
    const lines = text ? text.split('\n').length : 0;
    const chars = text.length;
    const keys = parsedJson !== null ? countKeys(parsedJson) : 0;
    const depth = parsedJson !== null ? maxDepth(parsedJson) : 0;
    return { lines, chars, keys, depth, size: formatBytes(new TextEncoder().encode(text).length) };
  }, [output, input, parsedJson]);

  // Highlighted output with search
  const highlightedOutput = useMemo(() => {
    if (!output) return '';
    let html = syntaxHighlight(output.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    if (searchTerm) {
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-yellow-500/30 text-yellow-200 rounded px-0.5">$1</mark>');
    }
    return html;
  }, [output, searchTerm]);

  const outputLines = output ? output.split('\n') : [];

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> SheruTools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-300 dark:text-slate-200">JSON Formatter</span>
        </div>
      </div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Braces className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">JSON Formatter & Validator</h1>
            <p className="text-sm text-slate-500">Format, beautify, minify, and validate JSON. All in your browser.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
            <Lock className="w-3 h-3" /> 100% Private — runs locally
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Action Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          <button onClick={handleFormat} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5">
            <AlignLeft className="w-4 h-4" /> Format
          </button>
          <button onClick={handleMinify} className="px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-white/20 dark:hover:bg-white/10 transition-all flex items-center gap-1.5">
            <Minus className="w-4 h-4" /> Minify
          </button>
          <button onClick={handleValidate} className="px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-white/20 dark:hover:bg-white/10 transition-all flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Validate
          </button>
          <button onClick={handleClear} className="px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-white/20 dark:hover:bg-white/10 transition-all flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
          <button onClick={handleSample} className="px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-white/20 dark:hover:bg-white/10 transition-all flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Sample
          </button>
          <button onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-white/20 dark:hover:bg-white/10 transition-all flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Upload
          </button>
          <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleUpload} className="hidden" />
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />
          <select
            value={String(indent)}
            onChange={e => setIndent(e.target.value === 'tab' ? 'tab' : Number(e.target.value))}
            className="px-3 py-2 rounded-xl bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm outline-none"
          >
            <option value="2">2 Spaces</option>
            <option value="4">4 Spaces</option>
            <option value="tab">Tab</option>
          </select>
        </motion.div>

        {/* Stats Bar */}
        <AnimatePresence>
          {(isValid !== null || input.trim()) && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-3 mb-4 text-xs"
            >
              {isValid !== null && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isValid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {isValid ? 'Valid JSON' : 'Invalid JSON'}
                </div>
              )}
              <div className="flex items-center gap-1 text-slate-500"><Hash className="w-3 h-3" /> {stats.lines} lines</div>
              <div className="flex items-center gap-1 text-slate-500"><AlignLeft className="w-3 h-3" /> {stats.chars} chars</div>
              <div className="flex items-center gap-1 text-slate-500"><Key className="w-3 h-3" /> {stats.keys} keys</div>
              <div className="flex items-center gap-1 text-slate-500"><Layers className="w-3 h-3" /> Depth {stats.depth}</div>
              <div className="flex items-center gap-1 text-slate-500"><FileJson className="w-3 h-3" /> {stats.size}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Panel */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
            >
              <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <pre className="text-sm text-red-300 font-mono whitespace-pre-wrap break-all">{error}</pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="relative rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-xs font-medium text-slate-500">Input</span>
              </div>
              <textarea
                value={input}
                onChange={e => { setInput(e.target.value); setIsValid(null); setError(null); }}
                placeholder="Paste JSON here..."
                spellCheck={false}
                className={`w-full h-[400px] lg:h-[500px] p-4 bg-transparent text-sm font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none resize-none ${
                  isValid === false ? 'ring-2 ring-red-500/30' : ''
                } ${isValid === true ? 'ring-2 ring-green-500/20' : ''}`}
              />
            </div>
          </motion.div>

          {/* Output */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden">
              {/* Output Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewMode('formatted')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${viewMode === 'formatted' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >Formatted</button>
                  <button onClick={() => setViewMode('tree')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${viewMode === 'tree' ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                  >Tree View</button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={handleCopy} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors" title="Copy">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={handleDownload} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="px-4 py-2 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-slate-200 dark:border-white/5">
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search keys or values..."
                    className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 outline-none"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-300">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Output Content */}
              <div className="h-[400px] lg:h-[440px] overflow-auto">
                {viewMode === 'formatted' ? (
                  output ? (
                    <div className="flex text-sm font-mono">
                      {/* Line numbers */}
                      <div className="select-none px-3 py-4 text-right text-slate-600 dark:text-slate-600 border-r border-slate-200 dark:border-white/5 shrink-0">
                        {outputLines.map((_, i) => (
                          <div key={i} className="leading-5">{i + 1}</div>
                        ))}
                      </div>
                      {/* Code */}
                      <pre
                        className="flex-1 p-4 leading-5 text-slate-800 dark:text-slate-200 whitespace-pre overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: highlightedOutput }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                      Format or minify JSON to see output
                    </div>
                  )
                ) : (
                  parsedJson !== null ? (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <button onClick={() => setExpandAll(true)} className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                          <ChevronDown className="w-3 h-3" /> Expand All
                        </button>
                        <button onClick={() => setExpandAll(false)} className="text-xs text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                          <ChevronUp className="w-3 h-3" /> Collapse All
                        </button>
                      </div>
                      <JsonTreeNode key={String(expandAll)} value={parsedJson} depth={0} searchTerm={searchTerm} defaultExpanded={expandAll} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                      Parse valid JSON to see tree view
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pro Upsell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-orange-500/5 border border-yellow-500/10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Unlock Pro Features — $3.99</h3>
                <p className="text-sm text-slate-500">JSONPath querying • JSON diff comparison • JSON → CSV export</p>
              </div>
            </div>
            <a
              href="https://sherutools.lemonsqueezy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Get Pro
            </a>
          </div>
        </motion.div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What does the JSON Formatter do?","answer":"Format, validate, and beautify JSON data. Detect syntax errors, minify JSON, and view it in a tree structure."},{"question":"Can I validate JSON online?","answer":"Yes! Paste your JSON and instantly see if it is valid. Errors are highlighted with line numbers and descriptions."},{"question":"Is this JSON tool free?","answer":"Yes, completely free with no limits. Format, validate, and minify JSON with no sign-up required."},{"question":"Can I minify JSON?","answer":"Yes, switch between beautified and minified views with one click. Copy the result to your clipboard."}]} />
      <RelatedTools tools={[{"name":"Regex Tester","href":"/regex-tester","description":"Test and debug regular expressions","icon":"🔍"},{"name":"Base64","href":"/base64","description":"Encode and decode Base64 strings","icon":"🔤"},{"name":"Markdown Editor","href":"/markdown-editor","description":"Write and preview Markdown","icon":"📝"},{"name":"AI Code Explainer","href":"/ai-code-explainer","description":"Understand code with AI","icon":"💻"}]} />
      </div>
    </div>
  );
}
