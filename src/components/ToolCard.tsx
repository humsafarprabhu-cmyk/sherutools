'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface Props {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string; // e.g. 'blue', 'emerald', 'purple'
}

const colorMap: Record<string, { bg: string; bgLight: string; text: string; glow: string }> = {
  blue:    { bg: 'bg-blue-500/10', bgLight: 'bg-blue-100', text: 'text-blue-500', glow: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-500/10', bgLight: 'bg-emerald-100', text: 'text-emerald-500', glow: 'bg-emerald-500' },
  purple:  { bg: 'bg-purple-500/10', bgLight: 'bg-purple-100', text: 'text-purple-500', glow: 'bg-purple-500' },
  amber:   { bg: 'bg-amber-500/10', bgLight: 'bg-amber-100', text: 'text-amber-500', glow: 'bg-amber-500' },
  pink:    { bg: 'bg-pink-500/10', bgLight: 'bg-pink-100', text: 'text-pink-500', glow: 'bg-pink-500' },
  red:     { bg: 'bg-red-500/10', bgLight: 'bg-red-100', text: 'text-red-500', glow: 'bg-red-500' },
  rose:    { bg: 'bg-rose-500/10', bgLight: 'bg-rose-100', text: 'text-rose-500', glow: 'bg-rose-500' },
  cyan:    { bg: 'bg-cyan-500/10', bgLight: 'bg-cyan-100', text: 'text-cyan-500', glow: 'bg-cyan-500' },
  green:   { bg: 'bg-green-500/10', bgLight: 'bg-green-100', text: 'text-green-500', glow: 'bg-green-500' },
  indigo:  { bg: 'bg-indigo-500/10', bgLight: 'bg-indigo-100', text: 'text-indigo-500', glow: 'bg-indigo-500' },
};

export default function ToolCard({ name, description, href, icon: Icon, color }: Props) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={href} className="block group">
        <div className="relative p-6 rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.06] transition-all duration-300 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-blue-500/5">
          {/* Glow */}
          <div className={`absolute -top-10 -right-10 w-24 h-24 ${c.glow} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

          <div className={`w-12 h-12 rounded-xl ${c.bgLight} dark:${c.bg} flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${c.text}`} />
          </div>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">{name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{description}</p>

          <div className="flex items-center gap-1.5 text-sm font-medium text-blue-500 dark:text-blue-400 group-hover:gap-2.5 transition-all">
            Use Free <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
