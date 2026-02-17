'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon, Upload, Download, Lock, Unlock, Check, Loader2, Trash2, Shield,
  Instagram, Twitter, Facebook, Linkedin, Youtube, ChevronRight, Home,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

type TabMode = 'compress' | 'resize' | 'convert';
type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

interface ImageFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  preview: string;
  width: number;
  height: number;
  processedBlob?: Blob;
  processedSize?: number;
  processedUrl?: string;
  processing: boolean;
  done: boolean;
}

const FORMAT_OPTIONS: { label: string; value: OutputFormat }[] = [
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'WebP', value: 'image/webp' },
];

const PRESETS = [
  { name: 'Instagram Post', w: 1080, h: 1080, icon: Instagram },
  { name: 'Twitter/X Post', w: 1200, h: 675, icon: Twitter },
  { name: 'Facebook Post', w: 1200, h: 630, icon: Facebook },
  { name: 'LinkedIn Post', w: 1200, h: 627, icon: Linkedin },
  { name: 'YouTube Thumb', w: 1280, h: 720, icon: Youtube },
];

const FREE_BATCH_LIMIT = 5;

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

function getExtension(format: OutputFormat) {
  if (format === 'image/jpeg') return 'jpg';
  if (format === 'image/png') return 'png';
  return 'webp';
}

function loadImage(file: File): Promise<{ img: HTMLImageElement; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = reject;
    img.src = url;
  });
}

function processImage(
  img: HTMLImageElement,
  width: number,
  height: number,
  format: OutputFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    const q = format === 'image/png' ? undefined : quality / 100;
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      format,
      q
    );
  });
}

export default function ImageToolsPage() {
  const [tab, setTab] = useState<TabMode>('compress');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(75);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg');
  const [resizeW, setResizeW] = useState(1080);
  const [resizeH, setResizeH] = useState(1080);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When first image loads, set aspect ratio
  useEffect(() => {
    if (images.length > 0 && lockAspect) {
      const first = images[0];
      setAspectRatio(first.width / first.height);
    }
  }, [images.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    const limited = arr.slice(0, FREE_BATCH_LIMIT - images.length);
    const newImages: ImageFile[] = [];
    for (const file of limited) {
      const { img, url } = await loadImage(file);
      newImages.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        originalSize: file.size,
        preview: url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        processing: false,
        done: false,
      });
    }
    setImages(prev => [...prev, ...newImages]);
    if (newImages.length > 0) {
      const first = newImages[0];
      setAspectRatio(first.width / first.height);
      setResizeW(first.width);
      setResizeH(first.height);
    }
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      if (img?.processedUrl) URL.revokeObjectURL(img.processedUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.preview);
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
    });
    setImages([]);
  };

  const handleWidthChange = (w: number) => {
    setResizeW(w);
    if (lockAspect && aspectRatio) setResizeH(Math.round(w / aspectRatio));
  };

  const handleHeightChange = (h: number) => {
    setResizeH(h);
    if (lockAspect && aspectRatio) setResizeW(Math.round(h * aspectRatio));
  };

  const applyPreset = (w: number, h: number) => {
    setResizeW(w);
    setResizeH(h);
    setLockAspect(false);
  };

  const processAll = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setImages(prev => prev.map(i => ({ ...i, processing: true, done: false, processedBlob: undefined, processedSize: undefined, processedUrl: undefined })));

    for (let idx = 0; idx < images.length; idx++) {
      const img = images[idx];
      try {
        const { img: htmlImg } = await loadImage(img.file);
        let w: number, h: number;
        if (tab === 'compress') {
          w = htmlImg.naturalWidth;
          h = htmlImg.naturalHeight;
        } else {
          w = resizeW;
          h = resizeH;
        }
        const blob = await processImage(htmlImg, w, h, outputFormat, quality);
        const url = URL.createObjectURL(blob);
        setImages(prev => prev.map((im, i2) =>
          im.id === img.id
            ? { ...im, processedBlob: blob, processedSize: blob.size, processedUrl: url, processing: false, done: true }
            : im
        ));
      } catch {
        setImages(prev => prev.map(im => im.id === img.id ? { ...im, processing: false } : im));
      }
    }
    setProcessing(false);
  };

  const downloadOne = (img: ImageFile) => {
    if (!img.processedUrl) return;
    const a = document.createElement('a');
    a.href = img.processedUrl;
    const base = img.name.replace(/\.[^.]+$/, '');
    a.download = `${base}-sherutools.${getExtension(outputFormat)}`;
    a.click();
  };

  const tabs: { id: TabMode; label: string }[] = [
    { id: 'compress', label: 'Compress' },
    { id: 'resize', label: 'Resize' },
    { id: 'convert', label: 'Convert' },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <a href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1"><Home className="w-3.5 h-3.5" /> SheruTools</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">Image Tools</span>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-sm text-rose-600 dark:text-rose-400 mb-4">
            <ImageIcon className="w-4 h-4" /> Image Tools
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Compress, Resize & Convert{' '}
            <span className="bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">Images</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Reduce file size up to 90% without losing quality. All processing happens in your browser.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex justify-center gap-2 mb-8"
        >
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Upload Zone */}
        {images.length < FREE_BATCH_LIMIT && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 mb-8 ${
              dragOver
                ? 'border-rose-400 bg-rose-500/10 shadow-[0_0_40px_rgba(244,63,94,0.15)]'
                : 'border-slate-300 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] hover:border-rose-300 dark:hover:border-rose-500/30'
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && addFiles(e.target.files)} />
            <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragOver ? 'text-rose-400' : 'text-slate-400 dark:text-slate-500'}`} />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Drop images here or click to upload</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">JPG, PNG, WebP • Max {FREE_BATCH_LIMIT} images (free tier)</p>
          </motion.div>
        )}

        {/* Controls */}
        {images.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 mb-6"
          >
            {/* Compress controls */}
            {(tab === 'compress' || tab === 'convert') && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Quality: {quality}%
                  </label>
                  <div className="relative">
                    <input
                      type="range" min={1} max={100} value={quality}
                      onChange={e => setQuality(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-rose-500"
                      style={{
                        background: `linear-gradient(to right, #f43f5e ${quality}%, #334155 ${quality}%)`,
                      }}
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>1% (smallest)</span>
                      <span>100% (best quality)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Output Format</label>
                  <div className="flex gap-2">
                    {FORMAT_OPTIONS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => setOutputFormat(f.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          outputFormat === f.value
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                            : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Resize controls */}
            {tab === 'resize' && (
              <div className="space-y-5">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Width (px)</label>
                    <input type="number" value={resizeW} onChange={e => handleWidthChange(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>
                  <button onClick={() => setLockAspect(!lockAspect)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      lockAspect
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                        : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'
                    }`}
                    title={lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                  >
                    {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Height (px)</label>
                    <input type="number" value={resizeH} onChange={e => handleHeightChange(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Output Format</label>
                  <div className="flex gap-2">
                    {FORMAT_OPTIONS.map(f => (
                      <button key={f.value} onClick={() => setOutputFormat(f.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          outputFormat === f.value
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                            : 'bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Social Media Presets</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {PRESETS.map(p => (
                      <button key={p.name} onClick={() => applyPreset(p.w, p.h)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all border ${
                          resizeW === p.w && resizeH === p.h
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                            : 'bg-white/60 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10'
                        }`}
                      >
                        <p.icon className="w-4 h-4" />
                        <span>{p.name}</span>
                        <span className="text-[10px] opacity-60">{p.w}×{p.h}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range" min={1} max={100} value={quality}
                    onChange={e => setQuality(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-rose-500"
                    style={{ background: `linear-gradient(to right, #f43f5e ${quality}%, #334155 ${quality}%)` }}
                  />
                </div>
              </div>
            )}

            {/* Process button */}
            <div className="flex items-center gap-3 mt-6">
              <button onClick={processAll} disabled={processing}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-rose-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><Download className="w-4 h-4" /> Process All Images</>}
              </button>
              <button onClick={clearAll} className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Image cards */}
        <AnimatePresence>
          {images.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {images.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-white/5">
                    <img src={img.preview} alt={img.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{img.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{img.width}×{img.height} • {formatBytes(img.originalSize)}</p>

                    {/* Size comparison bar */}
                    {img.done && img.processedSize !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Original: {formatBytes(img.originalSize)}</span>
                          <span className={img.processedSize < img.originalSize ? 'text-emerald-500 font-medium' : 'text-amber-500'}>
                            New: {formatBytes(img.processedSize)} ({img.processedSize < img.originalSize ? '-' : '+'}{Math.abs(Math.round((1 - img.processedSize / img.originalSize) * 100))}%)
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${Math.min(100, (img.processedSize / img.originalSize) * 100)}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${img.processedSize < img.originalSize ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status / Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {img.processing && <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />}
                    {img.done && (
                      <>
                        <Check className="w-5 h-5 text-emerald-500" />
                        <button onClick={() => downloadOne(img)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => removeImage(img.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 mt-10 text-sm text-slate-500 dark:text-slate-400"
        >
          <Shield className="w-4 h-4 text-emerald-500" />
          Your images never leave your browser — 100% client-side processing
        </motion.div>

        {/* Pro upsell */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 text-center"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unlock Pro Features</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Unlimited batch size, zip download, and more — one-time payment.</p>
          <a href="https://sherutools.lemonsqueezy.com/buy/image-tools-pro" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-rose-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Get Pro — $3.99
          </a>
        </motion.div>
      </div>
    </div>
  );
}
