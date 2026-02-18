'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Bold, Italic, Heading1, Heading2, Heading3, Link as LinkIcon, Image,
  Code, List, ListOrdered, Quote, Minus, Table, ChevronRight,
  Download, Copy, Upload, FileText, Eye, Columns, Edit3,
  Maximize2, Minimize2, Check, Lock, Sparkles, BookOpen,
  Shield
} from 'lucide-react';

// We'll dynamically import marked & hljs to avoid SSR issues
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// Configure marked with highlight.js
marked.setOptions({
  async: false,
  gfm: true,
  breaks: true,
});

const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.highlight(text, { language }).value;
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

marked.use({ renderer });

type ViewMode = 'split' | 'editor' | 'preview';

const STORAGE_KEY = 'sherutools-markdown-editor';

const SAMPLE_MARKDOWN = `# Welcome to SheruTools Markdown Editor 🦁

Write **Markdown** on the left, see the *live preview* on the right.

## Features

- ✅ Real-time preview
- ✅ Syntax highlighting for code blocks
- ✅ Toolbar with formatting buttons
- ✅ Export to **.md** and **.html**
- ✅ Import markdown files
- ✅ Auto-save to browser storage

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}! Welcome to SheruTools.\`);
}

greet('World');
\`\`\`

\`\`\`python
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))
\`\`\`

## Table

| Feature | Free | Pro |
|---------|------|-----|
| Editor & Preview | ✅ | ✅ |
| Export MD/HTML | ✅ | ✅ |
| PDF Export | ❌ | ✅ |
| Custom Themes | ❌ | ✅ |
| Table of Contents | ❌ | ✅ |

## Blockquote

> "The best tools are the ones that get out of your way."
> — SheruTools

## Links & Images

[Visit SheruTools](https://sherutools.com)

---

Made with ❤️ by SheruTools. Enjoy writing!
`;

const toolbarButtons = [
  { icon: Bold, label: 'Bold', before: '**', after: '**', placeholder: 'bold text' },
  { icon: Italic, label: 'Italic', before: '*', after: '*', placeholder: 'italic text' },
  { type: 'divider' as const },
  { icon: Heading1, label: 'Heading 1', before: '# ', after: '', placeholder: 'Heading 1', lineStart: true },
  { icon: Heading2, label: 'Heading 2', before: '## ', after: '', placeholder: 'Heading 2', lineStart: true },
  { icon: Heading3, label: 'Heading 3', before: '### ', after: '', placeholder: 'Heading 3', lineStart: true },
  { type: 'divider' as const },
  { icon: LinkIcon, label: 'Link', before: '[', after: '](url)', placeholder: 'link text' },
  { icon: Image, label: 'Image', before: '![', after: '](url)', placeholder: 'alt text' },
  { icon: Code, label: 'Code Block', before: '```\n', after: '\n```', placeholder: 'code', lineStart: true },
  { type: 'divider' as const },
  { icon: List, label: 'Bullet List', before: '- ', after: '', placeholder: 'list item', lineStart: true },
  { icon: ListOrdered, label: 'Numbered List', before: '1. ', after: '', placeholder: 'list item', lineStart: true },
  { icon: Quote, label: 'Blockquote', before: '> ', after: '', placeholder: 'quote', lineStart: true },
  { icon: Minus, label: 'Horizontal Rule', before: '\n---\n', after: '', placeholder: '' },
  { icon: Table, label: 'Table', before: '| Header | Header |\n|--------|--------|\n| Cell   | Cell   |', after: '', placeholder: '', lineStart: true },
];

export default function MarkdownEditorPage() {
  const [markdown, setMarkdown] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [copied, setCopied] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Check mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Default to tabbed on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'split') {
      setViewMode('editor');
    }
  }, [isMobile]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMarkdown(saved);
    } catch {}
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, markdown); } catch {}
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [markdown]);

  // Render HTML
  const html = useMemo(() => {
    try {
      return marked.parse(markdown) as string;
    } catch {
      return '';
    }
  }, [markdown]);

  // Stats
  const wordCount = useMemo(() => {
    const words = markdown.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [markdown]);
  const charCount = markdown.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Insert text at cursor
  const insertAtCursor = useCallback((before: string, after: string, placeholder: string, lineStart?: boolean) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = markdown.substring(start, end) || placeholder;

    let insertBefore = before;
    if (lineStart && start > 0 && markdown[start - 1] !== '\n') {
      insertBefore = '\n' + before;
    }

    const newText = markdown.substring(0, start) + insertBefore + selected + after + markdown.substring(end);
    setMarkdown(newText);

    setTimeout(() => {
      ta.focus();
      const newCursorPos = start + insertBefore.length;
      ta.setSelectionRange(newCursorPos, newCursorPos + selected.length);
    }, 0);
  }, [markdown]);

  // Cursor position tracking
  const updateCursorPos = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const lines = markdown.substring(0, pos).split('\n');
    setCursorPos({ line: lines.length, col: (lines[lines.length - 1]?.length || 0) + 1 });
  }, [markdown]);

  // Copy helpers
  const copyToClipboard = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // Download helpers
  const downloadFile = useCallback((content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadMd = () => downloadFile(markdown, 'document.md', 'text/markdown');
  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Markdown Export</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}pre{background:#0d1117;color:#e6edf3;padding:1rem;border-radius:8px;overflow-x:auto}code{font-family:'Fira Code',monospace}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px 12px}th{background:#f6f8fa}blockquote{border-left:4px solid #ddd;margin:0;padding:0 1rem;color:#666}img{max-width:100%}</style></head><body>${html}</body></html>`;
    downloadFile(fullHtml, 'document.html', 'text/html');
  };

  // Import file
  const importFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.markdown';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          if (text) setMarkdown(text);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  // Drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.markdown'))) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) setMarkdown(text);
      };
      reader.readAsText(file);
    }
  }, []);

  // Split pane dragging
  const handleMouseDown = useCallback(() => setIsDragging(true), []);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.max(20, Math.min(80, pct)));
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Line numbers
  const lineCount = markdown.split('\n').length;

  return (
    <div className="min-h-screen dot-pattern">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">Markdown Editor</span>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Markdown <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">Editor</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Write markdown, see live preview. Export anywhere.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View mode toggle */}
            <div className="flex items-center bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-1">
              {([
                { mode: 'editor' as ViewMode, icon: Edit3, label: 'Editor' },
                { mode: 'split' as ViewMode, icon: Columns, label: 'Split' },
                { mode: 'preview' as ViewMode, icon: Eye, label: 'Preview' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => setMarkdown(SAMPLE_MARKDOWN)} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Load sample">
                <BookOpen className="w-4 h-4" />
              </button>
              <button onClick={importFile} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Import .md file">
                <Upload className="w-4 h-4" />
              </button>
              <button onClick={() => copyToClipboard(markdown, 'md')} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Copy Markdown">
                {copied === 'md' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={() => copyToClipboard(html, 'html')} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Copy HTML">
                {copied === 'html' ? <Check className="w-4 h-4 text-green-500" /> : <Code className="w-4 h-4" />}
              </button>
              <button onClick={downloadMd} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Download .md">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={downloadHtml} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Download .html">
                <FileText className="w-4 h-4" />
              </button>
              <button onClick={toggleFullscreen} className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" title="Fullscreen">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 pb-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-0.5 p-1.5 rounded-xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-x-auto"
        >
          {toolbarButtons.map((btn, i) => {
            if ('type' in btn && btn.type === 'divider') {
              return <div key={i} className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 flex-shrink-0" />;
            }
            const b = btn as { icon: typeof Bold; label: string; before: string; after: string; placeholder: string; lineStart?: boolean };
            return (
              <button
                key={i}
                onClick={() => insertAtCursor(b.before, b.after, b.placeholder, b.lineStart)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex-shrink-0"
                title={b.label}
              >
                <b.icon className="w-4 h-4" />
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Editor + Preview */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative flex rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-hidden"
          style={{ height: 'calc(100vh - 320px)', minHeight: '400px' }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Editor Pane */}
          <AnimatePresence mode="wait">
            {viewMode !== 'preview' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: viewMode === 'split' && !isMobile ? `${splitPos}%` : '100%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-w-0 overflow-hidden"
              >
                <div className="flex-1 flex overflow-hidden">
                  {/* Line numbers */}
                  <div className="hidden sm:flex flex-col items-end py-4 px-2 bg-slate-50 dark:bg-white/[0.02] text-xs font-mono text-slate-300 dark:text-slate-600 select-none overflow-hidden border-r border-slate-200 dark:border-white/5" style={{ minWidth: '3rem' }}>
                    {Array.from({ length: lineCount }, (_, i) => (
                      <div key={i} className="leading-6 h-6">{i + 1}</div>
                    ))}
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    onKeyUp={updateCursorPos}
                    onClick={updateCursorPos}
                    spellCheck={false}
                    className="flex-1 resize-none p-4 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-sm leading-6 outline-none placeholder-slate-300 dark:placeholder-slate-600 overflow-auto"
                    placeholder="Start writing Markdown here..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Drag handle */}
          {viewMode === 'split' && !isMobile && (
            <div
              onMouseDown={handleMouseDown}
              className={`w-1.5 cursor-col-resize bg-slate-200 dark:bg-white/10 hover:bg-indigo-400 dark:hover:bg-indigo-500 transition-colors flex-shrink-0 ${isDragging ? 'bg-indigo-500 dark:bg-indigo-500' : ''}`}
            />
          )}

          {/* Preview Pane */}
          <AnimatePresence mode="wait">
            {viewMode !== 'editor' && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: viewMode === 'split' && !isMobile ? `${100 - splitPos}%` : '100%' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-auto"
              >
                <div
                  ref={previewRef}
                  className="markdown-preview p-6 prose prose-slate dark:prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="flex items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
          <div className="flex items-center gap-4">
            <span>{wordCount} words</span>
            <span>{charCount} chars</span>
            <span>~{readingTime} min read</span>
            <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            <span>100% client-side • Your data never leaves your browser</span>
          </div>
        </div>
      </div>

      {/* Pro Upsell */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-blue-500/10 border border-indigo-500/20 backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Pro Features</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Unlock More Power</h3>
              <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Export as PDF</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> 5 custom preview themes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Auto-generated table of contents</li>
              </ul>
            </div>
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">$3.99</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">One-time payment</div>
              <a
                href="https://sherutools.lemonsqueezy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all text-sm hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
              >
                <Lock className="w-4 h-4" /> Unlock Pro
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What is Markdown?","answer":"Markdown is a lightweight markup language that converts plain text to formatted HTML. It is widely used for documentation, README files, and blogs."},{"question":"Does this editor support live preview?","answer":"Yes! See your Markdown rendered in real-time as you type. Switch between edit and preview modes."},{"question":"Can I export my Markdown?","answer":"Yes, export as Markdown (.md) or copy the rendered HTML. Your content is saved locally in your browser."},{"question":"Is this Markdown editor free?","answer":"Yes, completely free with all features available. No sign-up required."}]} />
      <RelatedTools tools={[{"name":"JSON Formatter","href":"/json-formatter","description":"Format and validate JSON","icon":"📋"},{"name":"Word Counter","href":"/word-counter","description":"Count words and characters","icon":"📊"},{"name":"Text Compare","href":"/text-compare","description":"Compare two texts side by side","icon":"🔄"},{"name":"Lorem Ipsum","href":"/lorem-ipsum","description":"Generate placeholder text","icon":"📄"}]} />
      </div>
    </div>
  );
}
