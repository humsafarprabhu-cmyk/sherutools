'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, Twitter, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Gradient border top */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="bg-white/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-sm">🦁</div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">Sheru<span className="text-blue-500 dark:text-blue-400">Tools</span></span>
              </div>
              <p className="text-sm text-slate-500 max-w-sm">Free, beautiful online tools that actually work. No sign-up, no BS.</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tools</h4>
              <ul className="space-y-2">
                <li><Link href="/invoice-generator" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Invoice Generator</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Connect</h4>
              <div className="flex gap-3">
                <a href="https://github.com/humsafarprabhu-cmyk" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                  <Github className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500 dark:text-slate-600">
            <p className="flex items-center gap-3">
              <span>© {new Date().getFullYear()} SheruTools. All rights reserved.</span>
              <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
            </p>
            <motion.p
              className="flex items-center gap-1"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Built with <Heart className="w-3 h-3 text-red-500" fill="currentColor" /> by Sheru 🦁
            </motion.p>
          </div>
        </div>
      </div>
    </footer>
  );
}
