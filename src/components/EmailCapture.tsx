'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  variant?: 'hero' | 'compact';
}

export default function EmailCapture({ variant = 'hero' }: Props) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    // Store locally + try Formspree
    try {
      const emails = JSON.parse(localStorage.getItem('sherutools_emails') || '[]');
      emails.push({ email, date: new Date().toISOString() });
      localStorage.setItem('sherutools_emails', JSON.stringify(emails));

      await fetch('https://formspree.io/f/xplaceholder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
    } catch {}

    setLoading(false);
    setSubmitted(true);
  };

  if (variant === 'compact') {
    return (
      <div className="py-8 px-4">
        <div className="max-w-xl mx-auto text-center">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
                <Check className="w-4 h-4" /> You&apos;re on the list!
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Get notified about new tools"
                  required
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl font-medium transition-colors"
                >
                  {loading ? '...' : 'Subscribe'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <section className="relative py-20 px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      <div className="max-w-2xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
            <Sparkles className="w-4 h-4" /> Stay in the loop
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Get notified when we launch{' '}
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">new tools</span>
          </h2>

          <p className="text-slate-400 max-w-md mx-auto">
            We&apos;re building free tools every week. Drop your email and be the first to know.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <p className="text-lg font-semibold text-white">You&apos;re on the list! 🎉</p>
                <p className="text-sm text-slate-400">We&apos;ll ping you when something cool drops.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <div className="flex-1 relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {loading ? 'Joining...' : <>Notify Me <ArrowRight className="w-4 h-4" /></>}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
