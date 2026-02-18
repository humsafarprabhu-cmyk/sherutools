'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface RelatedTool {
  name: string;
  href: string;
  description: string;
  icon: string;
}

export default function RelatedTools({ tools }: { tools: RelatedTool[] }) {
  return (
    <section className="mt-16 mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Related Tools
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.href}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={tool.href}
              className="block p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group h-full"
            >
              <div className="text-3xl mb-3">{tool.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors mb-1">
                {tool.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tool.description}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
