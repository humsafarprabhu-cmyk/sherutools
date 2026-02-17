'use client';

import { motion } from 'framer-motion';

const avatarColors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500',
];

export default function SocialProof() {
  return (
    <section className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center space-y-5"
      >
        <div className="flex justify-center -space-x-3">
          {avatarColors.map((color, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`w-10 h-10 rounded-full ${color} border-2 border-slate-950 dark:border-slate-950 flex items-center justify-center text-white text-xs font-bold`}
            >
              {String.fromCharCode(65 + i)}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="w-10 h-10 rounded-full bg-white/10 border-2 border-slate-950 flex items-center justify-center text-slate-400 text-xs font-bold"
          >
            +
          </motion.div>
        </div>
        <p className="text-lg font-semibold text-slate-200 dark:text-slate-200">
          Join <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">200+ creators</span> using SheruTools
        </p>
        <p className="text-sm text-slate-500">Freelancers, designers, and small businesses trust our tools every day.</p>
      </motion.div>
    </section>
  );
}
