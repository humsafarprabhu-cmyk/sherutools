'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RefreshCw, ChevronLeft, ChevronRight, Loader2, Maximize2 } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import { ScreenData } from './ScreenCard';
import { useState } from 'react';

interface Props {
  screens: ScreenData[];
  selectedScreen: number;
  setSelectedScreen: (i: number) => void;
  onNext: () => void;
  onRegenerateScreen?: (index: number) => Promise<void>;
}

export default function StepPreview({ screens, selectedScreen, setSelectedScreen, onNext, onRegenerateScreen }: Props) {
  const currentScreen = screens[selectedScreen];
  const hasHtml = !!currentScreen?.html;
  const [regenerating, setRegenerating] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const prevScreen = () => setSelectedScreen(Math.max(0, selectedScreen - 1));
  const nextScreen = () => setSelectedScreen(Math.min(screens.length - 1, selectedScreen + 1));

  const handleRegenerate = async () => {
    if (!onRegenerateScreen) return;
    setRegenerating(true);
    try {
      await onRegenerateScreen(selectedScreen);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Screen list */}
        <div className="lg:w-64 shrink-0 space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Screens ({screens.length})
          </h3>
          {screens.map((s, i) => (
            <motion.button
              key={i}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedScreen(i)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                selectedScreen === i
                  ? 'bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 border border-transparent'
              }`}
            >
              <span className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-base">
                {s.icon || `${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm block truncate">{s.name}</span>
              </div>
              {selectedScreen === i && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </motion.button>
          ))}

          {/* Navigation flow */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation Flow</h4>
            <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              {screens.map((s, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded font-medium ${selectedScreen === i ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-100 dark:bg-white/5'}`}>
                    {s.icon || ''} {s.name}
                  </span>
                  {i < screens.length - 1 && <ArrowRight className="w-3 h-3" />}
                </span>
              ))}
            </div>
          </div>

          {/* Live app badge */}
          {hasHtml && (
            <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-500 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Interactive Preview
              </div>
              <p className="text-xs text-slate-400 mt-1">
                This is the actual app — tap buttons, fill forms, everything works!
              </p>
            </div>
          )}
        </div>

        {/* Phone preview */}
        <div className="flex-1 flex flex-col items-center">
          {/* Screen navigation arrows */}
          <div className="flex items-center gap-4 mb-4 w-full justify-center">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={prevScreen} disabled={selectedScreen === 0}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/5 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </motion.button>
            
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {selectedScreen + 1} / {screens.length}
            </span>
            
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={nextScreen} disabled={selectedScreen === screens.length - 1}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/5 disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedScreen}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <PhoneMockup>
                {hasHtml ? (
                  <iframe
                    srcDoc={currentScreen.html}
                    className="w-full h-full border-0 rounded-[20px]"
                    sandbox="allow-scripts allow-same-origin"
                    title={currentScreen.name}
                  />
                ) : (
                  <div
                    className="w-full h-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: currentScreen?.preview || '' }}
                  />
                )}
              </PhoneMockup>
            </motion.div>
          </AnimatePresence>
          
          <div className="text-center mt-3 space-y-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentScreen?.icon || ''} {currentScreen?.name}
            </span>

            {/* Action buttons */}
            <div className="flex items-center gap-2 justify-center">
              {onRegenerateScreen && (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleRegenerate} disabled={regenerating}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-medium flex items-center gap-1.5 hover:bg-amber-500/20 transition-all disabled:opacity-50">
                  {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  {regenerating ? 'Regenerating...' : 'Regenerate Screen'}
                </motion.button>
              )}
              <button onClick={() => setFullscreen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
                <Maximize2 className="w-3 h-3" /> Fullscreen
              </button>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
      >
        Customize Screens
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreen && currentScreen?.html && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setFullscreen(false)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[400px] h-[85vh] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
              <iframe
                srcDoc={currentScreen.html}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title={currentScreen.name}
              />
            </motion.div>
            <button onClick={() => setFullscreen(false)}
              className="absolute top-6 right-6 text-white/60 hover:text-white text-sm font-medium">
              ✕ Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
