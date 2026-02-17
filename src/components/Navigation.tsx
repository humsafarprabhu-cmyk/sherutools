'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, QrCode, FileCheck, FileUp, Palette, ImageIcon, GitCompareArrows, Shield, Code, Menu, X, Braces, Type, Mail, Sparkles, ChevronDown, Wrench, Code2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const aiTools = [
  { name: 'AI Code Explainer', href: '/ai-code-explainer', icon: Code2 },
  { name: 'AI Email Writer', href: '/ai-email-writer', icon: Mail },
  { name: 'AI Rewriter', href: '/ai-rewriter', icon: Sparkles },
];

const utilityTools = [
  { name: 'Invoice Generator', href: '/invoice-generator', icon: FileText },
  { name: 'QR Code Generator', href: '/qr-code-generator', icon: QrCode },
  { name: 'Resume Builder', href: '/resume-builder', icon: FileCheck },
  { name: 'PDF Tools', href: '/pdf-tools', icon: FileUp },
  { name: 'Color Palette', href: '/color-palette-generator', icon: Palette },
  { name: 'Image Tools', href: '/image-tools', icon: ImageIcon },
  { name: 'Text Compare', href: '/text-compare', icon: GitCompareArrows },
  { name: 'Password Generator', href: '/password-generator', icon: Shield },
  { name: 'Markdown Editor', href: '/markdown-editor', icon: Code },
  { name: 'JSON Formatter', href: '/json-formatter', icon: Braces },
  { name: 'Lorem Ipsum', href: '/lorem-ipsum', icon: Type },
];

const allTools = [...aiTools, ...utilityTools];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            🦁
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
            Sheru<span className="text-blue-500 dark:text-blue-400">Tools</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5">
          {/* Featured AI tools shown directly */}
          {aiTools.map(t => (
            <Link key={t.href} href={t.href} className="flex items-center gap-1.5 text-sm font-medium text-purple-500 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              <t.icon className="w-4 h-4" />
              {t.name}
              <span className="text-[10px] bg-purple-500/10 text-purple-500 dark:text-purple-400 px-1.5 py-0.5 rounded-full">AI</span>
            </Link>
          ))}

          {/* All Tools dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <Wrench className="w-4 h-4" />
              All Tools
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden"
                >
                  {/* AI Tools section */}
                  <div className="p-2 border-b border-slate-100 dark:border-white/5">
                    <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-purple-500 font-semibold">✨ AI-Powered</p>
                    {aiTools.map(t => (
                      <Link
                        key={t.href}
                        href={t.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                      >
                        <t.icon className="w-4 h-4 text-purple-500" />
                        {t.name}
                      </Link>
                    ))}
                  </div>

                  {/* Utility Tools section */}
                  <div className="p-2 max-h-72 overflow-y-auto">
                    <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">🛠️ Utility Tools</p>
                    {utilityTools.map(t => (
                      <Link
                        key={t.href}
                        href={t.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <t.icon className="w-4 h-4 text-slate-400" />
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ThemeToggle />
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-500 dark:text-slate-400">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-white/5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 space-y-1">
              <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-purple-500 font-semibold">✨ AI-Powered</p>
              {aiTools.map(t => (
                <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10">
                  <t.icon className="w-4 h-4 text-purple-500" /> {t.name}
                </Link>
              ))}

              <div className="border-t border-slate-100 dark:border-white/5 my-2" />

              <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">🛠️ Utility Tools</p>
              {utilityTools.map(t => (
                <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">
                  <t.icon className="w-4 h-4 text-slate-400" /> {t.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
