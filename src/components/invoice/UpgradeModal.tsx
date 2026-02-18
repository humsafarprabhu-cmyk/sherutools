'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const features = [
  'Remove watermark from PDFs',
  'Access all premium templates',
  'Priority support',
  'Lifetime access — one-time payment',
];

export default function UpgradeModal({ open, onClose }: Props) {
  const handleCheckout = () => {
    window.open('https://sherutools.lemonsqueezy.com', '_blank');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />

            <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors" aria-label="Close modal">
              <X className="w-5 h-5" />
            </button>

            <div className="relative text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
              <p className="text-slate-400 text-sm mt-1">One-time payment, lifetime access</p>
              <div className="mt-4">
                <span className="text-4xl font-bold text-white">$4.99</span>
                <span className="text-slate-400 text-sm ml-1">one-time</span>
              </div>
            </div>

            <div className="relative space-y-3 mb-8">
              {features.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-300">{f}</span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              className="relative w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm"
            >
              Get Pro Now
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
