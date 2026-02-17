'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, QrCode, FileCheck, FileUp, Palette, ImageIcon, GitCompareArrows, Shield, Code, Menu, X, Braces, Type, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const tools = [
  { name: 'AI Email ✨', href: '/ai-email-writer', icon: Mail },
  { name: 'Invoice Generator', href: '/invoice-generator', icon: FileText },
  { name: 'QR Code', href: '/qr-code-generator', icon: QrCode },
  { name: 'Resume Builder', href: '/resume-builder', icon: FileCheck },
  { name: 'PDF Tools', href: '/pdf-tools', icon: FileUp },
  { name: 'Color Palette', href: '/color-palette-generator', icon: Palette },
  { name: 'Image Tools', href: '/image-tools', icon: ImageIcon },
  { name: 'Text Compare', href: '/text-compare', icon: GitCompareArrows },
  { name: 'Passwords', href: '/password-generator', icon: Shield },
  { name: 'Markdown', href: '/markdown-editor', icon: Code },
  { name: 'JSON', href: '/json-formatter', icon: Braces },
  { name: 'Lorem Ipsum', href: '/lorem-ipsum', icon: Type },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            🦁
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            Sheru<span className="text-blue-500 dark:text-blue-400">Tools</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {tools.map(t => (
            <Link key={t.href} href={t.href} className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <t.icon className="w-4 h-4" />
              {t.name}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="p-2 text-slate-500 dark:text-slate-400">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-slate-200 dark:border-white/5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl p-4 space-y-2">
          {tools.map(t => (
            <Link key={t.href} href={t.href} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
              <t.icon className="w-4 h-4" /> {t.name}
            </Link>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}
