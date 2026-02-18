'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Copy, Download, FileText, Trash2, Check, Languages,
  ImageIcon, Loader2, Sparkles, Lock, Zap, Crown,
} from 'lucide-react';

/* ── Languages ── */
const ALL_LANGUAGES = [
  { code: 'eng', label: 'English', flag: '🇬🇧' },
  { code: 'hin', label: 'Hindi', flag: '🇮🇳' },
  { code: 'spa', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fra', label: 'French', flag: '🇫🇷' },
  { code: 'deu', label: 'German', flag: '🇩🇪' },
  { code: 'jpn', label: 'Japanese', flag: '🇯🇵' },
  { code: 'chi_sim', label: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'kor', label: 'Korean', flag: '🇰🇷' },
  { code: 'ara', label: 'Arabic', flag: '🇸🇦' },
  { code: 'rus', label: 'Russian', flag: '🇷🇺' },
  { code: 'por', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'ita', label: 'Italian', flag: '🇮🇹' },
  { code: 'nld', label: 'Dutch', flag: '🇳🇱' },
  { code: 'tur', label: 'Turkish', flag: '🇹🇷' },
  { code: 'tha', label: 'Thai', flag: '🇹🇭' },
];
const FREE_CODES = new Set(['eng', 'hin']);

/* ── Usage tracking ── */
const DAILY_FREE_LIMIT = 5;
function getUsageToday(): number {
  const key = 'sheru_ocr_usage';
  const raw = localStorage.getItem(key);
  if (!raw) return 0;
  try {
    const d = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (d.date !== today) { localStorage.removeItem(key); return 0; }
    return d.count ?? 0;
  } catch { return 0; }
}
function bumpUsage() {
  const key = 'sheru_ocr_usage';
  const today = new Date().toISOString().slice(0, 10);
  const count = getUsageToday() + 1;
  localStorage.setItem(key, JSON.stringify({ date: today, count }));
}
function isPro(): boolean {
  return localStorage.getItem('sheru_ocr_pro') === 'true';
}

export default function OcrApp() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState('eng');
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<unknown>(null);

  /* cleanup */
  useEffect(() => {
    return () => { if (imageUrl) URL.revokeObjectURL(imageUrl); };
  }, [imageUrl]);

  const handleFile = useCallback((file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported format. Use PNG, JPG, WebP, BMP, or GIF.');
      return;
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setExtractedText('');
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
  }, [imageUrl]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const runOcr = useCallback(async () => {
    if (!imageFile) return;
    const pro = isPro();
    if (!pro) {
      if (!FREE_CODES.has(language)) {
        setErrorMsg('Free plan supports English & Hindi only. Upgrade for all languages.');
        return;
      }
      if (getUsageToday() >= DAILY_FREE_LIMIT) {
        setErrorMsg(`Daily free limit reached (${DAILY_FREE_LIMIT} images). Upgrade to Pro for unlimited.`);
        return;
      }
    }

    setStatus('loading');
    setProgress(0);
    setErrorMsg('');
    setExtractedText('');

    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(imageFile, language, {
        logger: (m: { progress: number }) => {
          if (typeof m.progress === 'number') setProgress(m.progress);
        },
      });
      const text = result.data.text.trim();
      setExtractedText(text);
      setStatus('done');
      if (!pro) bumpUsage();
    } catch (err) {
      console.error(err);
      setErrorMsg('OCR failed. Try a clearer image.');
      setStatus('error');
    }
  }, [imageFile, language]);

  const copyText = useCallback(() => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [extractedText]);

  const downloadTxt = useCallback(() => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'extracted-text.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }, [extractedText]);

  const clearAll = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
    setExtractedText('');
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
  }, [imageUrl]);

  const wordCount = extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0;
  const charCount = extractedText.length;
  const pro = typeof window !== 'undefined' ? isPro() : false;
  const remaining = typeof window !== 'undefined' ? DAILY_FREE_LIMIT - getUsageToday() : DAILY_FREE_LIMIT;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pt-20 pb-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            100% Client-Side — Your Images Stay Private
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3">
            AI OCR — Image to{' '}
            <span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
              Text
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Extract text from any image instantly. Supports 15+ languages. Drag &amp; drop, copy, or download.
          </p>
        </motion.div>

        {/* Language selector + controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-sm">
            <Languages className="w-4 h-4 text-slate-500" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              {ALL_LANGUAGES.map(l => (
                <option
                  key={l.code}
                  value={l.code}
                  disabled={!pro && !FREE_CODES.has(l.code)}
                >
                  {l.flag} {l.label} {!pro && !FREE_CODES.has(l.code) ? '🔒' : ''}
                </option>
              ))}
            </select>
          </div>

          {!pro && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {remaining} free scan{remaining !== 1 ? 's' : ''} left today
            </div>
          )}
        </motion.div>

        {/* Main content: side by side */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left — Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !imageUrl && fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[400px] flex items-center justify-center overflow-hidden cursor-pointer
                ${dragOver
                  ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 scale-[1.01]'
                  : 'border-slate-300 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] hover:border-blue-400 dark:hover:border-blue-500/50'
                }
                backdrop-blur-sm`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />

              {imageUrl ? (
                <div className="w-full h-full p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    className="w-full h-auto max-h-[500px] object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="text-center p-8">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500/60" />
                  </motion.div>
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Drag &amp; drop an image here
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    or click to browse · PNG, JPG, WebP, BMP, GIF
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons under image */}
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 mt-4"
              >
                <button
                  onClick={runOcr}
                  disabled={status === 'loading'}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {status === 'loading' ? 'Extracting...' : 'Extract Text'}
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-3 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-white dark:hover:bg-white/10 transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-3 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Progress bar */}
            <AnimatePresence>
              {status === 'loading' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>Recognizing text…</span>
                    <span>{Math.round(progress * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right — Extracted Text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm min-h-[400px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <FileText className="w-4 h-4" />
                  Extracted Text
                </div>
                {extractedText && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {wordCount} words · {charCount} chars
                    </span>
                    <button
                      onClick={copyText}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={downloadTxt}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      .txt
                    </button>
                  </div>
                )}
              </div>

              {/* Text area */}
              <div className="flex-1 p-4">
                {status === 'done' || extractedText ? (
                  <textarea
                    value={extractedText}
                    onChange={e => setExtractedText(e.target.value)}
                    className="w-full h-full min-h-[340px] bg-transparent text-slate-800 dark:text-slate-200 text-sm leading-relaxed resize-none outline-none font-mono"
                    placeholder="Extracted text will appear here..."
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[340px] text-slate-400 dark:text-slate-500">
                    <FileText className="w-10 h-10 mb-3 opacity-40" />
                    <p className="text-sm">
                      {status === 'loading'
                        ? 'Processing your image...'
                        : 'Upload an image and click "Extract Text"'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pro upgrade banner */}
        {!pro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-emerald-500/20 border border-blue-500/20 p-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Upgrade to Pro
                  </h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                  Unlimited OCR extractions, batch processing, all 15+ languages, and PDF support.
                  One-time payment, lifetime access.
                </p>
              </div>
              <a
                href="https://sherutools.lemonsqueezy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/25 transition-all whitespace-nowrap"
              >
                <Zap className="w-4 h-4" />
                Get Pro — $3.99
              </a>
            </div>
          </motion.div>
        )}

        {/* Features section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Lock, title: '100% Private', desc: 'Images never leave your browser. All processing happens locally.' },
            { icon: Languages, title: '15+ Languages', desc: 'Extract text in English, Hindi, Japanese, Chinese, Arabic, and more.' },
            { icon: Zap, title: 'Instant Results', desc: 'Powered by Tesseract.js — fast, accurate optical character recognition.' },
            { icon: Download, title: 'Copy & Download', desc: 'Copy extracted text to clipboard or download as a .txt file.' },
          ].map((f, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/60 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-sm p-5"
            >
              <f.icon className="w-5 h-5 text-blue-500 mb-3" />
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{f.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
