'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Camera, ChevronRight, Sun, Moon, Hash, Type, Lock } from 'lucide-react';
import Link from 'next/link';
import hljs from 'highlight.js';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

/* ─── Gradient Presets ─── */
const gradientPresets = [
  { name: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Midnight', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { name: 'Berry', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { name: 'Aqua', value: 'linear-gradient(135deg, #00cdac 0%, #8ddad5 100%)' },
  { name: 'Peach', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'Sky', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { name: 'Rose', value: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)' },
  { name: 'Neon', value: 'linear-gradient(135deg, #00f260 0%, #0575e6 100%)' },
  { name: 'Purple Rain', value: 'linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)' },
  { name: 'Warm', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { name: 'Cool', value: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { name: 'Grape', value: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' },
  { name: 'Candy', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)' },
  { name: 'Electric', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Lava', value: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)' },
  { name: 'Northern', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Dusk', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Slate', value: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)' },
  { name: 'Indigo', value: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' },
  { name: 'Coral', value: 'linear-gradient(135deg, #ff6b6b 0%, #ffa07a 100%)' },
  { name: 'Cosmos', value: 'linear-gradient(135deg, #1a002e 0%, #4a0072 50%, #7b1fa2 100%)' },
];

const shadowOptions = [
  { label: 'None', value: 'none' },
  { label: 'Small', value: '0 4px 14px rgba(0,0,0,0.15)' },
  { label: 'Medium', value: '0 8px 30px rgba(0,0,0,0.25)' },
  { label: 'Large', value: '0 20px 60px rgba(0,0,0,0.4)' },
];

const defaultCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generate first 10 numbers
const result = Array.from({ length: 10 }, (_, i) => fibonacci(i));
console.log(result); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`;

const languages = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp', 'go',
  'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css', 'sql', 'bash',
  'json', 'yaml', 'xml', 'markdown', 'plaintext',
];

export default function ScreenshotBeautifierPage() {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState('javascript');
  const [background, setBackground] = useState(gradientPresets[1].value);
  const [padding, setPadding] = useState(40);
  const [borderRadius, setBorderRadius] = useState(12);
  const [shadow, setShadow] = useState(shadowOptions[2].value);
  const [fontSize, setFontSize] = useState(14);
  const [windowTitle, setWindowTitle] = useState('untitled.js');
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [showWatermark, setShowWatermark] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customBg, setCustomBg] = useState('#667eea');
  const [bgMode, setBgMode] = useState<'gradient' | 'solid'>('gradient');

  const previewRef = useRef<HTMLDivElement>(null);

  /* Highlighted HTML */
  const highlightedCode = (() => {
    try {
      if (language === 'plaintext') return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return hljs.highlight(code, { language }).value;
    } catch {
      return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  })();

  const lines = code.split('\n');

  const exportPNG = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = 'code-screenshot.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed', e);
    } finally {
      setExporting(false);
    }
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas-pro');
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (e) {
      console.error('Copy failed', e);
    } finally {
      setExporting(false);
    }
  }, []);

  const currentBg = bgMode === 'gradient' ? background : customBg;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-500 transition-colors">SheruTools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">Screenshot Beautifier</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Code Screenshot <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Beautifier</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Create beautiful code screenshots for social media, docs & presentations</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* ─── Left: Editor ─── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-sm rounded-lg px-3 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {languages.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <input
                type="text"
                value={windowTitle}
                onChange={e => setWindowTitle(e.target.value)}
                placeholder="Window title..."
                className="bg-slate-100 dark:bg-slate-800 text-sm rounded-lg px-3 py-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1"
              />
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={16}
              spellCheck={false}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 font-mono text-sm text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              placeholder="Paste your code here..."
            />

            {/* Controls */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-5">
              {/* Background presets */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Background</label>
                  <div className="flex gap-2">
                    <button onClick={() => setBgMode('gradient')} className={`text-xs px-2.5 py-1 rounded-md transition-colors ${bgMode === 'gradient' ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>Gradients</button>
                    <button onClick={() => setBgMode('solid')} className={`text-xs px-2.5 py-1 rounded-md transition-colors ${bgMode === 'solid' ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>Solid</button>
                  </div>
                </div>
                {bgMode === 'gradient' ? (
                  <div className="flex gap-2 flex-wrap">
                    {gradientPresets.map(g => (
                      <button
                        key={g.name}
                        title={g.name}
                        onClick={() => setBackground(g.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${background === g.value ? 'border-purple-500 ring-2 ring-purple-500/30 scale-110' : 'border-slate-300 dark:border-white/20'}`}
                        style={{ background: g.value }}
                      />
                    ))}
                  </div>
                ) : (
                  <input
                    type="color"
                    value={customBg}
                    onChange={e => setCustomBg(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-white/10"
                  />
                )}
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Padding: {padding}px</label>
                  <input type="range" min={16} max={64} value={padding} onChange={e => setPadding(+e.target.value)} className="w-full accent-purple-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Radius: {borderRadius}px</label>
                  <input type="range" min={0} max={24} value={borderRadius} onChange={e => setBorderRadius(+e.target.value)} className="w-full accent-purple-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Font Size: {fontSize}px</label>
                  <input type="range" min={12} max={24} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-purple-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Shadow</label>
                  <select value={shadow} onChange={e => setShadow(e.target.value)} className="w-full bg-white dark:bg-slate-800 text-sm rounded-lg px-2 py-1.5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                    {shadowOptions.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setDarkTheme(!darkTheme)} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                  {darkTheme ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  {darkTheme ? 'Dark' : 'Light'} Theme
                </button>
                <button onClick={() => setShowLineNumbers(!showLineNumbers)} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors ${showLineNumbers ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  <Hash className="w-3.5 h-3.5" />
                  Line Numbers
                </button>
                <button onClick={() => setShowWatermark(!showWatermark)} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors ${showWatermark ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-purple-500 text-white'}`}>
                  {showWatermark ? <Type className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  {showWatermark ? 'Watermark On' : 'No Watermark (Pro)'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* ─── Right: Preview + Export ─── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 border border-slate-200 dark:border-white/10"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={exportPNG}
                  disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 shadow-lg shadow-purple-500/25"
                >
                  <Download className="w-4 h-4" />
                  {exporting ? 'Exporting...' : 'Download PNG'}
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="overflow-auto rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/50">
              <div
                ref={previewRef}
                style={{
                  background: currentBg,
                  padding: `${padding}px`,
                }}
              >
                {/* Window Chrome */}
                <div
                  style={{
                    borderRadius: `${borderRadius}px`,
                    boxShadow: shadow,
                    overflow: 'hidden',
                  }}
                >
                  {/* Title Bar */}
                  <div className={`flex items-center gap-2 px-4 py-3 ${darkTheme ? 'bg-[#1e1e1e]' : 'bg-[#f5f5f5]'}`}>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className={`text-xs font-medium mx-auto pr-10 ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                      {windowTitle}
                    </span>
                  </div>

                  {/* Code Area */}
                  <div className={`overflow-auto ${darkTheme ? 'bg-[#1e1e1e]' : 'bg-white'}`} style={{ padding: '16px 0' }}>
                    <table className="border-collapse w-full">
                      <tbody>
                        {lines.map((line, i) => (
                          <tr key={i}>
                            {showLineNumbers && (
                              <td
                                className={`select-none text-right pr-4 pl-4 align-top ${darkTheme ? 'text-slate-600' : 'text-slate-400'}`}
                                style={{ fontSize: `${fontSize}px`, fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', Menlo, Monaco, Consolas, monospace", lineHeight: '1.6' }}
                              >
                                {i + 1}
                              </td>
                            )}
                            <td
                              className={`pr-4 ${!showLineNumbers ? 'pl-4' : ''}`}
                              style={{ fontSize: `${fontSize}px`, fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', Menlo, Monaco, Consolas, monospace", lineHeight: '1.6' }}
                            >
                              <span
                                className={darkTheme ? 'hljs-dark-text' : 'hljs-light-text'}
                                dangerouslySetInnerHTML={{
                                  __html: (() => {
                                    try {
                                      if (language === 'plaintext') return (line || ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                      // For per-line, we re-highlight the full code and split
                                      const fullHtml = hljs.highlight(code, { language }).value;
                                      const htmlLines = fullHtml.split('\n');
                                      return htmlLines[i] || ' ';
                                    } catch {
                                      return (line || ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                                    }
                                  })(),
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Watermark */}
                  {showWatermark && (
                    <div className={`text-center py-1.5 text-[10px] ${darkTheme ? 'bg-[#1e1e1e] text-slate-600' : 'bg-white text-slate-400'}`}>
                      Made with SheruTools
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pro Upsell */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400">✨ Pro — $3.99 one-time</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No watermark · SVG export · Custom font upload</p>
                </div>
                <a
                  href="https://sherutools.lemonsqueezy.com/buy/screenshot-beautifier-pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-semibold bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/25 whitespace-nowrap"
                >
                  Upgrade
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Highlight.js theme styles */}
      <style jsx global>{`
        .hljs-dark-text { color: #d4d4d4; }
        .hljs-dark-text .hljs-keyword { color: #c586c0; }
        .hljs-dark-text .hljs-string { color: #ce9178; }
        .hljs-dark-text .hljs-number { color: #b5cea8; }
        .hljs-dark-text .hljs-function { color: #dcdcaa; }
        .hljs-dark-text .hljs-title { color: #dcdcaa; }
        .hljs-dark-text .hljs-params { color: #9cdcfe; }
        .hljs-dark-text .hljs-comment { color: #6a9955; }
        .hljs-dark-text .hljs-built_in { color: #4ec9b0; }
        .hljs-dark-text .hljs-literal { color: #569cd6; }
        .hljs-dark-text .hljs-attr { color: #9cdcfe; }
        .hljs-dark-text .hljs-variable { color: #9cdcfe; }
        .hljs-dark-text .hljs-type { color: #4ec9b0; }
        .hljs-dark-text .hljs-meta { color: #569cd6; }
        .hljs-dark-text .hljs-selector-tag { color: #d7ba7d; }
        .hljs-dark-text .hljs-selector-class { color: #d7ba7d; }
        .hljs-dark-text .hljs-tag { color: #569cd6; }
        .hljs-dark-text .hljs-name { color: #569cd6; }

        .hljs-light-text { color: #1e1e1e; }
        .hljs-light-text .hljs-keyword { color: #af00db; }
        .hljs-light-text .hljs-string { color: #a31515; }
        .hljs-light-text .hljs-number { color: #098658; }
        .hljs-light-text .hljs-function { color: #795e26; }
        .hljs-light-text .hljs-title { color: #795e26; }
        .hljs-light-text .hljs-params { color: #001080; }
        .hljs-light-text .hljs-comment { color: #008000; }
        .hljs-light-text .hljs-built_in { color: #267f99; }
        .hljs-light-text .hljs-literal { color: #0000ff; }
        .hljs-light-text .hljs-attr { color: #001080; }
        .hljs-light-text .hljs-variable { color: #001080; }
        .hljs-light-text .hljs-type { color: #267f99; }
        .hljs-light-text .hljs-meta { color: #0000ff; }
        .hljs-light-text .hljs-tag { color: #800000; }
        .hljs-light-text .hljs-name { color: #800000; }
      `}</style>

      <Footer />
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What does the Screenshot Beautifier do?","answer":"Transform plain screenshots into beautiful, social-media-ready images with backgrounds, shadows, borders, and device mockups."},{"question":"Can I add device mockups?","answer":"Yes! Wrap your screenshot in browser windows, phone frames, or other device mockups for professional presentations."},{"question":"Is this tool free?","answer":"Yes, completely free with all features. No watermarks or sign-up required."},{"question":"What export formats are supported?","answer":"Export your beautified screenshots as PNG or JPG in custom resolutions."}]} />
      <RelatedTools tools={[{"name":"Image Tools","href":"/image-tools","description":"Edit and transform images","icon":"🖼️"},{"name":"Color Palette Generator","href":"/color-palette-generator","description":"Create beautiful color schemes","icon":"🎨"},{"name":"CSS Gradient Generator","href":"/css-gradient-generator","description":"Create stunning gradients","icon":"🌈"},{"name":"File Converter","href":"/file-converter","description":"Convert between formats","icon":"🔄"}]} />
      </div>
    </div>
  );
}
