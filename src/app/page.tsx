'use client';

import { motion, useInView } from 'framer-motion';
import { FileText, Wrench, Zap, Users, ArrowDown, FileUp, QrCode, Palette, FileCheck, MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ToolCard from '@/components/ToolCard';
import EmailCapture from '@/components/EmailCapture';
import SocialProof from '@/components/SocialProof';

const tools = [
  {
    name: 'Invoice Generator',
    description: 'Create professional invoices in seconds. 3 templates, live preview, instant PDF download.',
    href: '/invoice-generator',
    icon: FileText,
    color: 'blue',
  },
  {
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, WiFi, vCards, email and more. Custom colors, instant PNG download.',
    href: '/qr-code-generator',
    icon: QrCode,
    color: 'emerald',
  },
  {
    name: 'Resume Builder',
    description: 'Build a professional resume in minutes. 3 beautiful templates, real-time preview, instant PDF download.',
    href: '/resume-builder',
    icon: FileCheck,
    color: 'purple',
  },
];

const comingSoonTools = [
  { name: 'PDF Converter', icon: FileUp, bgClass: 'bg-amber-100 dark:bg-amber-500/10', iconClass: 'text-amber-500 dark:text-amber-400' },
  { name: 'Color Palette Generator', icon: Palette, bgClass: 'bg-pink-100 dark:bg-pink-500/10', iconClass: 'text-pink-500 dark:text-pink-400' },
];

const stats = [
  { label: 'Free Tools', value: 3, suffix: '+', icon: Wrench },
  { label: 'Invoices Generated', value: 500, suffix: '+', icon: FileText },
  { label: 'Happy Users', value: 200, suffix: '+', icon: Users },
  { label: 'Always Free', value: 100, suffix: '%', icon: Zap },
];

const rotatingWords = ['That Actually Work', 'That Save Time', 'That Make Money', 'That Just Work'];

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

// Floating shapes component
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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Home() {
  const currentWord = useWordRotation(rotatingWords);

  return (
    <motion.div className="dot-pattern" variants={stagger} initial="hidden" animate="show">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <FloatingShapes />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div variants={fadeUp} className="space-y-6">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300"
            >
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
              Beautiful, fast, and free tools for creators, freelancers, and businesses.
              No sign-ups. No hidden fees. Beautiful tools that just work.
            </p>

            <motion.div variants={fadeUp}>
              <a
                href="#tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm hover:scale-105 active:scale-95"
              >
                Browse Free Tools <ArrowDown className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              whileHover={{ scale: 1.05 }}
              className="group relative text-center p-5 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-none transition-all"
            >
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

      {/* Tools Grid */}
      <section id="tools" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
              Our <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Tools</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Pick a tool and get started. No sign-up required.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tools.map(tool => (
              <ToolCard key={tool.href} {...tool} />
            ))}

            {/* Coming soon cards */}
            {comingSoonTools.map((tool, i) => (
              <motion.div
                key={tool.name}
                variants={fadeUp}
                className="relative p-6 rounded-2xl bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 backdrop-blur-xl opacity-70 hover:opacity-90 transition-all duration-300"
              >
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
          <motion.div variants={fadeUp} className="text-center mt-8">
            <a
              href="mailto:humsafarprabhu@gmail.com?subject=Tool%20Suggestion%20for%20SheruTools"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-500 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Want to suggest a tool? Let us know!
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
