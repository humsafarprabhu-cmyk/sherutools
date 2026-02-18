'use client';

import { motion, useInView } from 'framer-motion';
import { FileText, Wrench, Zap, Users, ArrowDown, FileUp, QrCode, Palette, FileCheck, MessageSquare, Code, ImageIcon, GitCompareArrows, Shield, Braces, Paintbrush, Type, Mail, Sparkles, Code2, Bot, ArrowLeftRight, Binary, Terminal, Layout, Timer, Smile, BarChart3, Camera, RefreshCw, Eraser, Search, User, Clock, ZoomIn, BookOpen, GitBranch, Globe } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ToolCard from '@/components/ToolCard';
import EmailCapture from '@/components/EmailCapture';
import SocialProof from '@/components/SocialProof';

/* ───── AI Tools ───── */
const aiTools = [
  {
    name: 'AI Landing Page Generator',
    description: 'Type one line, get a complete landing page. Beautiful, responsive, ready to deploy. Powered by AI.',
    href: '/ai-landing-page',
    icon: Layout,
    color: 'sky',
  },
  {
    name: 'AI Email Writer',
    description: 'Generate professional emails instantly. Choose purpose, tone, and key points. Perfect emails in seconds.',
    href: '/ai-email-writer',
    icon: Mail,
    color: 'sky',
  },
  {
    name: 'AI Content Rewriter',
    description: 'Paraphrase, simplify, formalize, expand, or summarize any text. 6 rewrite modes powered by AI.',
    href: '/ai-rewriter',
    icon: Sparkles,
    color: 'fuchsia',
  },
  {
    name: 'AI Code Explainer',
    description: 'Paste any code and get instant explanations. Line-by-line breakdown, key concepts, and potential issues.',
    href: '/ai-code-explainer',
    icon: Code2,
    color: 'orange',
  },
  {
    name: 'AI Background Remover',
    description: 'Remove backgrounds from images instantly using AI. 100% private — runs in your browser. Replace with colors, gradients, or custom images.',
    href: '/background-remover',
    icon: Eraser,
    color: 'purple',
  },
  {
    name: 'AI Content Detector',
    description: 'Detect AI-generated text with sentence-by-sentence analysis. Humanize AI content to bypass detectors.',
    href: '/ai-detector',
    icon: Search,
    color: 'pink',
  },
  {
    name: 'AI Passport Photo Maker',
    description: 'Create passport-compliant photos instantly. Auto-crop, white background, correct dimensions for 8+ countries. 100% private.',
    href: '/passport-photo',
    icon: User,
    color: 'cyan',
  },
  {
    name: 'AI OCR / Image to Text',
    description: 'Extract text from images instantly with AI-powered OCR. Supports 15+ languages. 100% private, runs in your browser.',
    href: '/ocr',
    icon: FileText,
    color: 'emerald',
  },
  {
    name: 'AI Image Upscaler',
    description: 'Enlarge and enhance images up to 8× without losing quality. Smart sharpening, denoising, and color enhancement. 100% private.',
    href: '/image-upscaler',
    icon: ZoomIn,
    color: 'emerald',
  },
  {
    name: 'AI Flashcard Generator',
    description: 'Paste notes or any text and instantly generate study flashcards with AI. Flip cards, quiz yourself, export to Anki.',
    href: '/flashcard-generator',
    icon: BookOpen,
    color: 'purple',
  },
  {
    name: 'AI Diagram Generator',
    description: 'Describe what you want, AI generates beautiful diagrams instantly. Flowcharts, sequence diagrams, mindmaps, ER diagrams & more.',
    href: '/diagram-generator',
    icon: GitBranch,
    color: 'cyan',
  },
];

/* ───── Document & Business Tools ───── */
const documentTools = [
  {
    name: 'Invoice Generator',
    description: 'Create professional invoices in seconds. 3 templates, live preview, instant PDF download.',
    href: '/invoice-generator',
    icon: FileText,
    color: 'blue',
  },
  {
    name: 'Resume Builder',
    description: 'Build a professional resume in minutes. 3 templates, real-time preview, instant PDF.',
    href: '/resume-builder',
    icon: FileCheck,
    color: 'purple',
  },
  {
    name: 'PDF Tools',
    description: 'Merge, split, compress PDFs and convert between PDF & images. All in your browser.',
    href: '/pdf-tools',
    icon: FileUp,
    color: 'amber',
  },
];

/* ───── Developer Tools ───── */
const devTools = [
  {
    name: 'JSON Formatter',
    description: 'Format, validate, and explore JSON. Syntax highlighting, tree view, and minification.',
    href: '/json-formatter',
    icon: Braces,
    color: 'yellow',
  },
  {
    name: 'Markdown Editor',
    description: 'Write and preview Markdown in real-time. Toolbar, syntax highlighting, export to HTML & MD.',
    href: '/markdown-editor',
    icon: Code,
    color: 'indigo',
  },
  {
    name: 'Text Compare',
    description: 'Compare two texts side-by-side with real-time diff highlighting. Find changes instantly.',
    href: '/text-compare',
    icon: GitCompareArrows,
    color: 'cyan',
  },
  {
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text. Classic, hipster, office, and tech variants.',
    href: '/lorem-ipsum',
    icon: Type,
    color: 'violet',
  },
  {
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings and files instantly. Text and file support with URL-safe option.',
    href: '/base64',
    icon: Binary,
    color: 'slate',
  },
  {
    name: 'Regex Tester',
    description: 'Test and debug regular expressions in real-time. Match highlighting, capture groups, replace mode, and pattern library.',
    href: '/regex-tester',
    icon: Terminal,
    color: 'lime',
  },
  {
    name: 'Cron Generator',
    description: 'Build cron expressions visually or parse existing ones. Presets, next execution times, and cheat sheet.',
    href: '/cron-generator',
    icon: Clock,
    color: 'cyan',
  },
];

/* ───── Design & Media Tools ───── */
const designTools = [
  {
    name: 'Color Palette Generator',
    description: 'Generate beautiful color palettes. Random, analogous, complementary, triadic schemes.',
    href: '/color-palette-generator',
    icon: Palette,
    color: 'pink',
  },
  {
    name: 'Image Tools',
    description: 'Compress, resize, and convert images. Reduce file size up to 90%. All in your browser.',
    href: '/image-tools',
    icon: ImageIcon,
    color: 'rose',
  },
  {
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, WiFi, vCards, email and more. Custom colors, instant download.',
    href: '/qr-code-generator',
    icon: QrCode,
    color: 'emerald',
  },
  {
    name: 'CSS Gradient Generator',
    description: 'Create beautiful CSS gradients visually. Linear, radial, conic. Copy CSS or Tailwind. Export as PNG.',
    href: '/css-gradient-generator',
    icon: Paintbrush,
    color: 'pink',
  },
  {
    name: 'Screenshot Beautifier',
    description: 'Create beautiful code screenshots. Custom backgrounds, themes, and export as PNG. Perfect for social media.',
    href: '/screenshot-beautifier',
    icon: Camera,
    color: 'purple',
  },
  {
    name: 'File Converter',
    description: 'Convert images between PNG, JPG, WebP, AVIF, BMP, GIF, and ICO. Instant, free, 100% client-side.',
    href: '/file-converter',
    icon: RefreshCw,
    color: 'violet',
  },
  {
    name: 'Emoji Picker',
    description: 'Search and copy any emoji instantly. Browse by category, skin tones, recently used. Copy as emoji, HTML, or Unicode.',
    href: '/emoji-picker',
    icon: Smile,
    color: 'amber',
  },
  {
    name: 'Favicon Generator',
    description: 'Create beautiful favicons from text, emoji, or images. Download complete favicon pack with all sizes. 100% client-side.',
    href: '/favicon-generator',
    icon: Globe,
    color: 'indigo',
  },
];

/* ───── Security & Utility ───── */
const utilityTools = [
  {
    name: 'Password Generator',
    description: 'Generate strong, secure passwords. Random, passphrase, and pronounceable modes.',
    href: '/password-generator',
    icon: Shield,
    color: 'green',
  },
  {
    name: 'Unit Converter',
    description: 'Convert between 100+ units instantly. Length, weight, temperature, volume, data, and more.',
    href: '/unit-converter',
    icon: ArrowLeftRight,
    color: 'teal',
  },
  {
    name: 'Pomodoro Timer',
    description: 'Stay focused with the Pomodoro technique. Customizable timers, browser notifications, daily stats.',
    href: '/pomodoro',
    icon: Timer,
    color: 'red',
  },
  {
    name: 'Word Counter',
    description: 'Count words, characters, sentences. Reading time, readability scores, keyword density. Real-time analysis.',
    href: '/word-counter',
    icon: BarChart3,
    color: 'blue',
  },
];

const comingSoonTools: { name: string; icon: any; bgClass: string; iconClass: string }[] = [];

const stats = [
  { label: 'Free Tools', value: 33, suffix: '+', icon: Wrench },
  { label: 'AI-Powered', value: 11, suffix: '', icon: Bot },
  { label: 'Happy Users', value: 1000, suffix: '+', icon: Users },
  { label: 'Always Free', value: 100, suffix: '%', icon: Zap },
];

const rotatingWords = ['That Actually Work', 'That Save Time', 'That Make Money', 'That Just Work', 'Powered by AI'];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(value / 60));
    const interval = duration / (value / step);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(start);
    }, interval);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <div ref={ref}>{count}{suffix}</div>;
}

function useWordRotation(words: string[], intervalMs = 2500) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % words.length), intervalMs);
    return () => clearInterval(timer);
  }, [words.length, intervalMs]);
  return words[index];
}

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { size: 60, x: '10%', y: '20%', delay: 0, shape: 'rounded-full', color: 'bg-blue-500/10' },
        { size: 40, x: '80%', y: '15%', delay: 1, shape: 'rounded-lg', color: 'bg-emerald-500/10' },
        { size: 80, x: '70%', y: '60%', delay: 2, shape: 'rounded-full', color: 'bg-purple-500/8' },
        { size: 30, x: '20%', y: '70%', delay: 0.5, shape: 'rounded-lg rotate-45', color: 'bg-amber-500/10' },
        { size: 50, x: '50%', y: '80%', delay: 1.5, shape: 'rounded-full', color: 'bg-pink-500/8' },
      ].map((s, i) => (
        <motion.div
          key={i}
          className={`absolute ${s.shape} ${s.color} backdrop-blur-3xl`}
          style={{ width: s.size, height: s.size, left: s.x, top: s.y }}
          animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* ───── Section Header ───── */
function SectionHeader({ emoji, label, title, subtitle, gradient }: { emoji: string; label: string; title: string; subtitle: string; gradient: string }) {
  return (
    <motion.div variants={fadeUp} className="mb-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-500 dark:text-slate-400 mb-3">
        <span>{emoji}</span> {label}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
        <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>{title}</span>
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">{subtitle}</p>
    </motion.div>
  );
}

export default function Home() {
  const currentWord = useWordRotation(rotatingWords);

  return (
    <motion.div className="dot-pattern" variants={stagger} initial="hidden" animate="show">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <FloatingShapes />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div variants={fadeUp} className="space-y-6">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-600 dark:text-slate-300">
              <span className="text-lg">🦁</span> Free tools, no BS
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-slate-900 dark:text-white">Free Online Tools</span>
              <br />
              <span className="shimmer-text bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto]">
                {currentWord}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Beautiful, fast, and free tools for creators, developers, and businesses.
              No sign-ups. No hidden fees. Just tools that work.
            </p>

            <motion.div variants={fadeUp}>
              <a href="#ai-tools" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm hover:scale-105 active:scale-95">
                Browse Free Tools <ArrowDown className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} whileHover={{ scale: 1.05 }} className="group relative text-center p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none transition-all">
              <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500" />
              <stat.icon className="w-5 h-5 text-blue-500 dark:text-blue-400 mx-auto mb-2 relative z-10" />
              <div className="text-2xl font-bold text-slate-900 dark:text-white relative z-10">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-slate-500 mt-1 relative z-10">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════ AI-Powered Tools ═══════ */}
      <section id="ai-tools" className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            emoji="✨"
            label="NEW — AI-Powered"
            title="AI Tools"
            subtitle="Supercharge your workflow with AI. Write emails, rewrite content, explain code — all powered by GPT."
            gradient="from-purple-400 to-pink-400"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiTools.map(tool => <ToolCard key={tool.href} {...tool} />)}
          </div>
        </div>
      </section>

      {/* ═══════ Document & Business ═══════ */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            emoji="📄"
            label="Documents & Business"
            title="Document Tools"
            subtitle="Create invoices, build resumes, and manage PDFs. All processing happens in your browser."
            gradient="from-blue-400 to-cyan-400"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentTools.map(tool => <ToolCard key={tool.href} {...tool} />)}
          </div>
        </div>
      </section>

      {/* ═══════ Developer Tools ═══════ */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            emoji="💻"
            label="For Developers"
            title="Developer Tools"
            subtitle="JSON formatting, Markdown editing, text diffing, and placeholder text generation."
            gradient="from-emerald-400 to-teal-400"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {devTools.map(tool => <ToolCard key={tool.href} {...tool} />)}
          </div>
        </div>
      </section>

      {/* ═══════ Design & Media ═══════ */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            emoji="🎨"
            label="Design & Media"
            title="Creative Tools"
            subtitle="Color palettes, image compression, QR codes — everything for designers and creators."
            gradient="from-pink-400 to-rose-400"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {designTools.map(tool => <ToolCard key={tool.href} {...tool} />)}
          </div>
        </div>
      </section>

      {/* ═══════ Security & Utility ═══════ */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            emoji="🔒"
            label="Security & Utility"
            title="Utility Tools"
            subtitle="Secure password generation with true cryptographic randomness."
            gradient="from-green-400 to-emerald-400"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {utilityTools.map(tool => <ToolCard key={tool.href} {...tool} />)}

            {/* Coming soon cards */}
            {comingSoonTools.map((tool) => (
              <motion.div key={tool.name} variants={fadeUp} className="relative p-6 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 backdrop-blur-xl opacity-60 hover:opacity-80 transition-all duration-300">
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Coming Soon
                </div>
                <div className={`w-12 h-12 rounded-xl ${tool.bgClass} flex items-center justify-center mb-4`}>
                  <tool.icon className={`w-6 h-6 ${tool.iconClass}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{tool.name}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500">Coming soon. Stay tuned!</p>
              </motion.div>
            ))}
          </div>

          {/* Suggest a tool */}
          <motion.div variants={fadeUp} className="text-center mt-12">
            <a href="mailto:humsafarprabhu@gmail.com?subject=Tool%20Suggestion%20for%20SheruTools" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors">
              <MessageSquare className="w-4 h-4" /> Want to suggest a tool? Let us know!
            </a>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Email Capture */}
      <EmailCapture variant="hero" />
    </motion.div>
  );
}
