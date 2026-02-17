'use client';

import { motion } from 'framer-motion';
import { FileText, Wrench, Zap, Users, ArrowDown } from 'lucide-react';
import ToolCard from '@/components/ToolCard';
import EmailCapture from '@/components/EmailCapture';

const tools = [
  {
    name: 'Invoice Generator',
    description: 'Create professional invoices in seconds. 3 templates, live preview, instant PDF download.',
    href: '/invoice-generator',
    icon: FileText,
    color: 'bg-blue-500',
  },
];

const stats = [
  { label: 'Free Tools', value: '1+', icon: Wrench },
  { label: 'Invoices Generated', value: '500+', icon: FileText },
  { label: 'Happy Users', value: '200+', icon: Users },
  { label: 'Always Free', value: '100%', icon: Zap },
];

export default function Home() {
  return (
    <div className="dot-pattern">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300"
            >
              <span className="text-lg">🦁</span> Free tools, no BS
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-white">Free Online Tools</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                That Actually Work
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Beautiful, fast, and free tools for creators, freelancers, and businesses.
              No sign-up. No watermarks on free tier BS. Just tools that work.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <a
                href="#tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm"
              >
                Explore Tools <ArrowDown className="w-4 h-4" />
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl"
            >
              <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Our <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Tools</span>
            </h2>
            <p className="text-slate-400">Pick a tool and get started. No sign-up required.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {tools.map(tool => (
              <ToolCard key={tool.href} {...tool} />
            ))}
            {/* Coming soon placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center min-h-[200px]"
            >
              <div className="text-3xl mb-3">🚀</div>
              <p className="text-sm text-slate-500">More tools coming soon...</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Email Capture */}
      <EmailCapture variant="hero" />
    </div>
  );
}
