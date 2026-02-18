'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Binary, Copy, Check, Trash2, ArrowDownUp, Upload, Download,
  FileText, ChevronRight, Sparkles, Lock, Zap, Star,
} from 'lucide-react';

/* ───── helpers ───── */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toUrlSafe(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafe(b64: string): string {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return s;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), 2);
  return `${(bytes / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function byteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

const sampleText = 'Hello, World! 🦁 SheruTools makes encoding easy. Special chars: àéîõü ñ © ™ 你好';

/* ───── component ───── */
export default function Base64Page() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [dataUri, setDataUri] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const convert = useCallback((text: string, m: 'encode' | 'decode', us: boolean, du: boolean) => {
    setError('');
    if (!text.trim()) { setOutput(''); return; }
    try {
      if (m === 'encode') {
        let result = utf8ToBase64(text);
        if (us) result = toUrlSafe(result);
        if (du) result = `data:text/plain;base64,${result}`;
        setOutput(result);
      } else {
        let cleaned = text.trim();
        // strip data URI prefix
        if (cleaned.startsWith('data:')) {
          cleaned = cleaned.split(',')[1] || '';
        }
        if (us) cleaned = fromUrlSafe(cleaned);
        setOutput(base64ToUtf8(cleaned));
      }
    } catch {
      setError(m === 'encode' ? 'Failed to encode input' : 'Invalid Base64 string');
      setOutput('');
    }
  }, []);

  // re-convert when toggles change
  useEffect(() => {
    if (input && !fileName) convert(input, mode, urlSafe, dataUri);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSafe, dataUri]);

  const handleInput = (val: string) => {
    setInput(val);
    setFileName('');
    setFileType('');
    convert(val, mode, urlSafe, dataUri);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    setFileType(file.type);
    setError('');
    const reader = new FileReader();
    if (mode === 'encode') {
      reader.onload = () => {
        const b64 = (reader.result as string).split(',')[1] || '';
        const prefix = dataUri ? `data:${file.type || 'application/octet-stream'};base64,` : '';
        setInput(`[File: ${file.name}]`);
        setOutput(urlSafe ? toUrlSafe(`${prefix}${b64}`) : `${prefix}${b64}`);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        const text = reader.result as string;
        setInput(text);
        convert(text, 'decode', urlSafe, dataUri);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const swap = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    setFileName('');
    setFileType('');
    convert(output, newMode, urlSafe, dataUri);
  };

  const clear = () => {
    setInput('');
    setOutput('');
    setError('');
    setFileName('');
    setFileType('');
  };

  const loadSample = () => {
    setFileName('');
    setFileType('');
    setInput(sampleText);
    convert(sampleText, mode, urlSafe, dataUri);
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDecoded = () => {
    // If decoding a data URI, extract mime type
    let blob: Blob;
    const raw = input.trim();
    if (mode === 'decode' && raw.startsWith('data:')) {
      const mime = raw.split(';')[0].split(':')[1] || 'application/octet-stream';
      const b64 = raw.split(',')[1] || '';
      const binary = atob(b64);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      blob = new Blob([bytes], { type: mime });
    } else {
      blob = new Blob([output], { type: 'text/plain' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'decoded-output';
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputBytes = byteLength(input);
  const outputBytes = byteLength(output);
  const ratio = inputBytes > 0 && outputBytes > 0 ? (outputBytes / inputBytes).toFixed(2) : '—';

  return (
    <div className="min-h-screen dot-pattern">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white font-medium">Base64 Encoder/Decoder</span>
        </motion.div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-500/10 mb-4">
            <Binary className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Base64 <span className="bg-gradient-to-r from-slate-400 to-slate-600 bg-clip-text text-transparent">Encoder/Decoder</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Encode and decode Base64 strings and files. Text & binary file support with URL-safe option.
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex justify-center mb-6">
          <div className="inline-flex rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-1">
            {(['encode', 'decode'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setOutput(''); setError(''); if (input && !fileName) convert(input, m, urlSafe, dataUri); }}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-lg shadow-slate-500/25'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}>
                {m === 'encode' ? '🔒 Encode' : '🔓 Decode'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Options Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`relative w-10 h-5 rounded-full transition-colors ${urlSafe ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              onClick={() => setUrlSafe(!urlSafe)}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${urlSafe ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">URL-safe</span>
          </label>
          {mode === 'encode' && (
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${dataUri ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                onClick={() => setDataUri(!dataUri)}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${dataUri ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Data URI</span>
            </label>
          )}
          <button onClick={loadSample} className="text-sm text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Sample
          </button>
          <button onClick={swap} className="text-sm text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1">
            <ArrowDownUp className="w-3.5 h-3.5" /> Swap
          </button>
          <button onClick={clear} className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </motion.div>

        {/* Main Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {mode === 'encode' ? 'Text / File Input' : 'Base64 Input'}
              </h2>
              <span className="text-xs text-slate-400">{input.length} chars · {formatBytes(inputBytes)}</span>
            </div>
            <div
              className={`relative rounded-2xl border-2 transition-all ${isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-slate-200 dark:border-white/10'}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <textarea
                value={input}
                onChange={e => handleInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base64 string to decode...'}
                className={`w-full h-64 p-4 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 dark:text-white placeholder-slate-400 ${mode === 'decode' ? 'font-mono text-sm' : 'text-sm'}`}
              />
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 rounded-2xl">
                  <Upload className="w-8 h-8 text-blue-500" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                <Upload className="w-4 h-4" /> Upload File
              </button>
              <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {fileName && (
                <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                  📎 {fileName}
                </span>
              )}
            </div>
          </div>

          {/* Output */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {mode === 'encode' ? 'Base64 Output' : 'Decoded Output'}
              </h2>
              <span className="text-xs text-slate-400">{output.length} chars · {formatBytes(outputBytes)}</span>
            </div>
            <div className="relative">
              <textarea
                value={error || output}
                readOnly
                className={`w-full h-64 p-4 bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl rounded-2xl border-2 border-slate-200 dark:border-white/10 resize-none text-sm ${
                  error ? 'text-red-500' : mode === 'encode' ? 'font-mono text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'
                }`}
              />
            </div>
            <div className="flex gap-2">
              {output && (
                <>
                  <button onClick={copyOutput}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95">
                    {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                  {mode === 'decode' && (
                    <button onClick={downloadDecoded}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-all">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <AnimatePresence>
          {(inputBytes > 0 || outputBytes > 0) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex flex-wrap justify-center gap-6 p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl mb-8">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{formatBytes(inputBytes)}</div>
                <div className="text-xs text-slate-400">Input Size</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-900 dark:text-white">{formatBytes(outputBytes)}</div>
                <div className="text-xs text-slate-400">Output Size</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-500">{ratio}x</div>
                <div className="text-xs text-slate-400">Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-emerald-500">{input.length}</div>
                <div className="text-xs text-slate-400">Input Chars</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-500">{output.length}</div>
                <div className="text-xs text-slate-400">Output Chars</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pro Upsell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white/[0.05] dark:to-white/[0.02] border border-slate-700 dark:border-white/10 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">PRO</span>
              <span className="text-xs bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full">$1.99 one-time</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Unlock Pro Features</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {[
                { icon: Zap, text: 'Batch encode multiple files at once' },
                { icon: Lock, text: 'JWT token decoder & parser' },
                { icon: Sparkles, text: 'Priority support & updates' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <f.icon className="w-4 h-4 text-blue-400 shrink-0" />
                  {f.text}
                </div>
              ))}
            </div>
            <a href="https://sherutools.lemonsqueezy.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all active:scale-95">
              Get Pro — $1.99 <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What is Base64 encoding?","answer":"Base64 is a binary-to-text encoding scheme that converts binary data into ASCII characters. It is commonly used to embed images in HTML/CSS, transmit data in URLs, and encode email attachments."},{"question":"Is this Base64 tool free?","answer":"Yes, completely free with no limits. All encoding and decoding happens in your browser — no data is sent to any server."},{"question":"Can I encode images to Base64?","answer":"Yes! You can encode any text or file data to Base64 and decode Base64 strings back to their original form."},{"question":"Is Base64 encoding secure?","answer":"Base64 is an encoding scheme, not encryption. It should not be used for security purposes. Anyone can decode Base64 strings."}]} />
      <RelatedTools tools={[{"name":"JSON Formatter","href":"/json-formatter","description":"Format, validate, and beautify JSON","icon":"📋"},{"name":"Password Generator","href":"/password-generator","description":"Generate secure passwords","icon":"🔐"},{"name":"QR Code Generator","href":"/qr-code-generator","description":"Generate QR codes for any data","icon":"📱"},{"name":"Regex Tester","href":"/regex-tester","description":"Test and debug regular expressions","icon":"🔍"}]} />
      </div>
    </div>
  );
}
