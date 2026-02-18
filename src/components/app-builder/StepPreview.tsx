'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import { ScreenData } from './ScreenCard';

interface Props {
  screens: ScreenData[];
  selectedScreen: number;
  setSelectedScreen: (i: number) => void;
  onNext: () => void;
}

export default function StepPreview({ screens, selectedScreen, setSelectedScreen, onNext }: Props) {
  const currentScreen = screens[selectedScreen];
  const hasHtml = !!currentScreen?.html;

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
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Screens ({screens.length})
          </h3>
          {screens.map((s, i) => (
            <motion.button
              key={i}
              whileHover={{ x: 4 }}
              onClick={() => setSelectedScreen(i)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                selectedScreen === i
                  ? 'bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 border border-transparent'
              }`}
            >
              <span className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-base">
                {s.icon || `${i + 1}`}
              </span>
              <span className="font-medium">{s.name}</span>
            </motion.button>
          ))}

          {/* Navigation flow */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation Flow</h4>
            <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              {screens.map((s, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 font-medium">
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
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedScreen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <PhoneMockup>
                {hasHtml ? (
                  // Render actual HTML in iframe — WYSIWYG!
                  <iframe
                    srcDoc={currentScreen.html}
                    className="w-full h-full border-0 rounded-[20px]"
                    sandbox="allow-scripts allow-same-origin"
                    title={currentScreen.name}
                  />
                ) : (
                  // Fallback to HTML preview
                  <div
                    className="w-full h-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: currentScreen?.preview || '' }}
                  />
                )}
              </PhoneMockup>
              <div className="text-center mt-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {currentScreen?.icon || ''} {currentScreen?.name}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
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
    </motion.div>
  );
}
