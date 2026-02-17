'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface Props {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export default function ToolCard({ name, description, href, icon: Icon, color }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={href} className="block group">
        <div className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
          {/* Glow */}
          <div className={`absolute -top-10 -right-10 w-24 h-24 ${color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

          <div className={`w-12 h-12 rounded-xl ${color.replace('bg-', 'bg-')}/10 flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-').replace('/10', '')}`} />
          </div>

          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{name}</h3>
          <p className="text-sm text-slate-400 mb-4">{description}</p>

          <div className="flex items-center gap-1.5 text-sm font-medium text-blue-400 group-hover:gap-2.5 transition-all">
            Use Free <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
