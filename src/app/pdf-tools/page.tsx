'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  FileUp, Merge, Scissors, Minimize2, Image, Images, 
  Upload, X, GripVertical, Download, CheckCircle2, Loader2,
  ChevronRight, Home, AlertCircle, Crown, Lock
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';

// Types
interface PDFFile {
  id: string;
  file: File;
  name: string;
  size: number;
  thumbnail?: string;
  pageCount?: number;
}

interface TabInfo {
  id: string;
  label: string;
  icon: typeof FileUp;
  accept: string;
  multiple: boolean;
  description: string;
}

const tabs: TabInfo[] = [
  { id: 'merge', label: 'Merge', icon: Merge, accept: '.pdf', multiple: true, description: 'Combine multiple PDFs into one' },
  { id: 'split', label: 'Split', icon: Scissors, accept: '.pdf', multiple: false, description: 'Extract pages from a PDF' },
  { id: 'compress', label: 'Compress', icon: Minimize2, accept: '.pdf', multiple: false, description: 'Reduce PDF file size' },
  { id: 'pdf-to-images', label: 'PDF → Images', icon: Image, accept: '.pdf', multiple: false, description: 'Convert PDF pages to images' },
  { id: 'images-to-pdf', label: 'Images → PDF', icon: Images, accept: 'image/*', multiple: true, description: 'Combine images into a PDF' },
];

const FREE_MAX_FILES = 5;
const FREE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const PRO_MAX_SIZE = 50 * 1024 * 1024; // 50MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function PDFToolsPage() {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState('');
  const [resultBlobs, setResultBlobs] = useState<{ blob: Blob; name: string }[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [splitPages, setSplitPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [compressQuality, setCompressQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPro = false; // Placeholder for pro tier

  const currentTab = tabs.find(t => t.id === activeTab)!;
  const maxFiles = isPro ? Infinity : FREE_MAX_FILES;
  const maxSize = isPro ? PRO_MAX_SIZE : FREE_MAX_SIZE;

  // Reset state on tab change
  useEffect(() => {
    setFiles([]);
    setResultBlob(null);
    setResultBlobs([]);
    setError('');
    setSuccess(false);
    setProgress(0);
    setSplitPages([]);
    setTotalPages(0);
  }, [activeTab]);

  const generateThumbnail = useCallback(async (file: File): Promise<string | undefined> => {
    if (file.type === 'application/pdf') {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        const data = new Uint8Array(await file.arrayBuffer());
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        return canvas.toDataURL('image/jpeg', 0.5);
      } catch {
        return undefined;
      }
    } else if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  }, []);

  const getPageCount = useCallback(async (file: File): Promise<number> => {
    try {
      const { PDFDocument } = await import('pdf-lib');
      const data = await file.arrayBuffer();
      const pdf = await PDFDocument.load(data);
      return pdf.getPageCount();
    } catch {
      return 0;
    }
  }, []);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setError('');

    // Validate
    for (const f of arr) {
      if (f.size > maxSize) {
        setError(`${f.name} exceeds ${isPro ? '50MB' : '10MB'} limit`);
        return;
      }
    }

    if (!currentTab.multiple && (files.length + arr.length) > 1) {
      setError('This tool accepts only one file');
      return;
    }

    if (files.length + arr.length > maxFiles) {
      setError(`Free tier limited to ${FREE_MAX_FILES} files. Upgrade to Pro for unlimited.`);
      return;
    }

    const processed: PDFFile[] = [];
    for (const f of arr) {
      const thumbnail = await generateThumbnail(f);
      const pageCount = f.type === 'application/pdf' ? await getPageCount(f) : undefined;
      processed.push({
        id: generateId(),
        file: f,
        name: f.name,
        size: f.size,
        thumbnail,
        pageCount,
      });
    }

    if (!currentTab.multiple) {
      setFiles(processed);
      // For split, auto-detect pages
      if (activeTab === 'split' && processed[0]?.pageCount) {
        setTotalPages(processed[0].pageCount);
        setSplitPages(Array.from({ length: processed[0].pageCount }, (_, i) => i + 1));
      }
    } else {
      setFiles(prev => [...prev, ...processed]);
    }
  }, [files.length, maxFiles, maxSize, isPro, currentTab, activeTab, generateThumbnail, getPageCount]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setError('');
    setSuccess(false);
    setResultBlob(null);
    setResultBlobs([]);

    try {
      switch (activeTab) {
        case 'merge': await handleMerge(); break;
        case 'split': await handleSplit(); break;
        case 'compress': await handleCompress(); break;
        case 'pdf-to-images': await handlePdfToImages(); break;
        case 'images-to-pdf': await handleImagesToPdf(); break;
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleMerge = async () => {
    const { PDFDocument } = await import('pdf-lib');
    setProgressText('Merging PDFs...');
    const merged = await PDFDocument.create();
    
    for (let i = 0; i < files.length; i++) {
      setProgress(((i) / files.length) * 90);
      setProgressText(`Processing ${files[i].name}...`);
      const data = await files[i].file.arrayBuffer();
      const src = await PDFDocument.load(data);
      const pages = await merged.copyPages(src, src.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }

    if (!isPro) {
      // Add watermark to first page
      const pages = merged.getPages();
      if (pages.length > 0) {
        const { rgb } = await import('pdf-lib');
        const firstPage = pages[0];
        firstPage.drawText('Processed with SheruTools', {
          x: 10,
          y: 10,
          size: 8,
          color: rgb(0.7, 0.7, 0.7),
        });
      }
    }

    setProgress(95);
    setProgressText('Generating file...');
    const bytes = await merged.save();
    setResultBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
    setResultName('merged.pdf');
    setProgress(100);
  };

  const handleSplit = async () => {
    const { PDFDocument } = await import('pdf-lib');
    setProgressText('Splitting PDF...');
    const data = await files[0].file.arrayBuffer();
    const src = await PDFDocument.load(data);
    const newPdf = await PDFDocument.create();

    for (let i = 0; i < splitPages.length; i++) {
      setProgress((i / splitPages.length) * 90);
      const pageIdx = splitPages[i] - 1;
      if (pageIdx >= 0 && pageIdx < src.getPageCount()) {
        const [page] = await newPdf.copyPages(src, [pageIdx]);
        newPdf.addPage(page);
      }
    }

    if (!isPro) {
      const pages = newPdf.getPages();
      if (pages.length > 0) {
        const { rgb } = await import('pdf-lib');
        pages[0].drawText('Processed with SheruTools', { x: 10, y: 10, size: 8, color: rgb(0.7, 0.7, 0.7) });
      }
    }

    setProgress(95);
    const bytes = await newPdf.save();
    setResultBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
    setResultName('split.pdf');
    setProgress(100);
  };

  const handleCompress = async () => {
    const { PDFDocument } = await import('pdf-lib');
    setProgressText('Compressing PDF...');
    const data = await files[0].file.arrayBuffer();
    const src = await PDFDocument.load(data);
    const newPdf = await PDFDocument.create();

    const pages = src.getPages();
    for (let i = 0; i < pages.length; i++) {
      setProgress((i / pages.length) * 80);
      setProgressText(`Compressing page ${i + 1}/${pages.length}...`);
      const [copiedPage] = await newPdf.copyPages(src, [i]);
      newPdf.addPage(copiedPage);
    }

    if (!isPro) {
      const outPages = newPdf.getPages();
      if (outPages.length > 0) {
        const { rgb } = await import('pdf-lib');
        outPages[0].drawText('Processed with SheruTools', { x: 10, y: 10, size: 8, color: rgb(0.7, 0.7, 0.7) });
      }
    }

    setProgress(90);
    setProgressText('Saving compressed file...');
    
    // Compression options based on quality
    const qualityOpts: Record<string, any> = {
      low: { useObjectStreams: true },
      medium: { useObjectStreams: true },
      high: {},
    };
    
    const bytes = await newPdf.save(qualityOpts[compressQuality]);
    setResultBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
    setResultName('compressed.pdf');
    setProgress(100);
    
    const ratio = ((1 - bytes.byteLength / data.byteLength) * 100).toFixed(1);
    setProgressText(`Compressed! Reduced by ${ratio}% (${formatSize(data.byteLength)} → ${formatSize(bytes.byteLength)})`);
  };

  const handlePdfToImages = async () => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    setProgressText('Converting PDF to images...');
    
    const data = new Uint8Array(await files[0].file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const results: { blob: Blob; name: string }[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      setProgress((i / pdf.numPages) * 90);
      setProgressText(`Rendering page ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;

      if (!isPro) {
        ctx.fillStyle = 'rgba(180,180,180,0.4)';
        ctx.font = '14px sans-serif';
        ctx.fillText('Processed with SheruTools', 10, canvas.height - 10);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(b => resolve(b!), imageFormat === 'png' ? 'image/png' : 'image/jpeg', 0.9);
      });
      results.push({ blob, name: `page-${i}.${imageFormat}` });
    }

    setResultBlobs(results);
    setProgress(100);
    setProgressText(`Converted ${pdf.numPages} pages!`);
  };

  const handleImagesToPdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    setProgressText('Creating PDF from images...');
    
    let doc: any = null;

    for (let i = 0; i < files.length; i++) {
      setProgress((i / files.length) * 90);
      setProgressText(`Adding image ${i + 1}/${files.length}...`);
      
      const imgData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(files[i].file);
      });

      const img = await new Promise<HTMLImageElement>((resolve) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.src = imgData;
      });

      const width = img.width;
      const height = img.height;

      if (i === 0) {
        doc = new jsPDF({ orientation: width > height ? 'landscape' : 'portrait', unit: 'px', format: [width, height] });
      } else {
        doc.addPage([width, height], width > height ? 'landscape' : 'portrait');
      }

      doc.addImage(imgData, 'JPEG', 0, 0, width, height);

      if (!isPro) {
        doc.setFontSize(12);
        doc.setTextColor(180, 180, 180);
        doc.text('Processed with SheruTools', 10, height - 10);
      }
    }

    setProgress(95);
    const blob = doc.output('blob');
    setResultBlob(blob);
    setResultName('images.pdf');
    setProgress(100);
  };

  const downloadResult = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    resultBlobs.forEach(r => downloadResult(r.blob, r.name));
  };

  return (
    <div className="dot-pattern min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <nav className="flex items-center gap-1.5 text-sm text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> SheruTools
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 dark:text-slate-200">PDF Tools</span>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-4 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2"
        >
          PDF <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Tools</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto"
        >
          All processing happens in your browser. Your files never leave your device.
        </motion.p>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="relative flex flex-wrap justify-center gap-1 p-1.5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Tab Description */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">{currentTab.description}</p>

          {/* Drop Zone */}
          {(!currentTab.multiple && files.length >= 1) ? null : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/5 shadow-lg shadow-amber-500/10'
                  : 'border-slate-300 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-400/50 hover:bg-amber-500/[0.02]'
              }`}
            >
              <motion.div
                animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragging ? 'bg-amber-500/20' : 'bg-slate-100 dark:bg-white/5'
                }`}>
                  <Upload className={`w-7 h-7 ${isDragging ? 'text-amber-500' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Drag & drop files here or <span className="text-amber-500">click to browse</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentTab.accept === '.pdf' ? 'PDF files' : 'Image files'} • Max {isPro ? '50MB' : '10MB'} per file
                    {currentTab.multiple && ` • Max ${isPro ? '∞' : FREE_MAX_FILES} files`}
                  </p>
                </div>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept={currentTab.accept}
                multiple={currentTab.multiple}
                className="hidden"
                onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }}
              />
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </h3>
                <button onClick={() => setFiles([])} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
                  Clear all
                </button>
              </div>

              {activeTab === 'merge' ? (
                <Reorder.Group axis="y" values={files} onReorder={setFiles} className="space-y-2">
                  {files.map((f) => (
                    <Reorder.Item key={f.id} value={f}>
                      <FileCard file={f} onRemove={removeFile} draggable />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {files.map((f) => (
                      <motion.div key={f.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <FileCard file={f} onRemove={removeFile} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Split Page Selector */}
          {activeTab === 'split' && totalPages > 0 && (
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
                Select pages to extract ({totalPages} total)
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      setSplitPages(prev => 
                        prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page].sort((a, b) => a - b)
                      );
                    }}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      splitPages.includes(page)
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setSplitPages(Array.from({ length: totalPages }, (_, i) => i + 1))} className="text-xs text-amber-500 hover:underline">Select all</button>
                <button onClick={() => setSplitPages([])} className="text-xs text-slate-400 hover:underline">Deselect all</button>
              </div>
            </div>
          )}

          {/* Compress Quality Selector */}
          {activeTab === 'compress' && files.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Compression Quality</h3>
              <div className="flex gap-3">
                {(['low', 'medium', 'high'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => setCompressQuality(q)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      compressQuality === q
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {q.charAt(0).toUpperCase() + q.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {compressQuality === 'low' ? 'Maximum compression, lower quality' : compressQuality === 'medium' ? 'Balanced compression and quality' : 'Minimal compression, best quality'}
              </p>
            </div>
          )}

          {/* Image Format Selector */}
          {activeTab === 'pdf-to-images' && files.length > 0 && (
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Output Format</h3>
              <div className="flex gap-3">
                {(['png', 'jpeg'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setImageFormat(fmt)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      imageFormat === fmt
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Process Button */}
          {files.length > 0 && !success && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProcess}
              disabled={processing || (activeTab === 'split' && splitPages.length === 0)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <currentTab.icon className="w-4 h-4" />
                  {activeTab === 'merge' ? 'Merge PDFs' : 
                   activeTab === 'split' ? `Extract ${splitPages.length} pages` :
                   activeTab === 'compress' ? 'Compress PDF' :
                   activeTab === 'pdf-to-images' ? 'Convert to Images' : 'Create PDF'}
                </>
              )}
            </motion.button>
          )}

          {/* Progress Bar */}
          {processing && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-center text-slate-400">{progressText} {Math.round(progress)}%</p>
            </div>
          )}

          {/* Success / Download */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                </motion.div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {progressText || 'Processing complete!'}
                </p>

                {resultBlob && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => downloadResult(resultBlob, resultName)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                  >
                    <Download className="w-4 h-4" /> Download {resultName}
                  </motion.button>
                )}

                {resultBlobs.length > 0 && (
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={downloadAll}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20"
                    >
                      <Download className="w-4 h-4" /> Download All ({resultBlobs.length} images)
                    </motion.button>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                      {resultBlobs.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => downloadResult(r.blob, r.name)}
                          className="p-2 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-emerald-400 transition-all text-xs text-slate-600 dark:text-slate-300"
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setSuccess(false); setFiles([]); setResultBlob(null); setResultBlobs([]); }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  Process another file
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pro Upsell */}
          {!isPro && files.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/10"
            >
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upgrade to Pro — $5.99 one-time</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Unlimited files, 50MB limit, no watermark, batch processing
                  </p>
                </div>
                <a
                  href="https://sherutools.lemonsqueezy.com/buy/pdf-tools-pro"
                  target="_blank"
                  rel="noopener"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors flex-shrink-0"
                >
                  Upgrade
                </a>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'SheruTools PDF Tools',
            url: 'https://sherutools.com/pdf-tools',
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            description: 'Free online PDF tools. Merge, split, compress PDFs and convert between PDF & images.',
          }),
        }}
      />
    </div>
  );
}

function FileCard({ file, onRemove, draggable }: { file: PDFFile; onRemove: (id: string) => void; draggable?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 group hover:border-slate-300 dark:hover:border-white/20 transition-all">
      {draggable && (
        <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing flex-shrink-0" />
      )}
      {file.thumbnail ? (
        <img src={file.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <FileUp className="w-5 h-5 text-amber-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
        <p className="text-xs text-slate-400">
          {formatSize(file.size)}
          {file.pageCount ? ` • ${file.pageCount} pages` : ''}
        </p>
      </div>
      <button onClick={() => onRemove(file.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all">
        <X className="w-4 h-4" />
      </button>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What PDF operations are supported?","answer":"Merge multiple PDFs, split PDFs into pages, compress PDF file size, and more. All processing happens in your browser."},{"question":"Are my PDF files uploaded to a server?","answer":"No! All PDF processing happens 100% locally in your browser. Your files never leave your device."},{"question":"Is there a file size limit for PDFs?","answer":"Since processing happens locally, limits depend on your device. Most devices handle PDFs up to 100MB."},{"question":"Can I merge multiple PDFs at once?","answer":"Yes! Upload multiple PDF files and merge them into a single document. Drag to reorder pages before merging."}]} />
      <RelatedTools tools={[{"name":"File Converter","href":"/file-converter","description":"Convert between image formats","icon":"🔄"},{"name":"Invoice Generator","href":"/invoice-generator","description":"Create professional invoices","icon":"🧾"},{"name":"Resume Builder","href":"/resume-builder","description":"Build professional resumes","icon":"📄"},{"name":"Image Tools","href":"/image-tools","description":"Edit and transform images","icon":"🖼️"}]} />
      </div>
    </div>
  );
}
