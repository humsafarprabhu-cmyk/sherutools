'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRight, ArrowUp, ArrowDown, Sun, Moon } from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import { ScreenData } from './ScreenCard';
import { useState } from 'react';

interface Props {
  screens: ScreenData[];
  setScreens: (s: ScreenData[]) => void;
  primaryColor: string;
  setPrimaryColor: (c: string) => void;
  onNext: () => void;
}

export default function StepCustomize({ screens, setScreens, primaryColor, setPrimaryColor, onNext }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [editingName, setEditingName] = useState(false);

  const selected = screens[selectedIdx];

  const moveScreen = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= screens.length) return;
    const copy = [...screens];
    [copy[from], copy[to]] = [copy[to], copy[from]];
    setScreens(copy);
    setSelectedIdx(to);
  };

  const deleteScreen = (idx: number) => {
    if (screens.length <= 1) return;
    const copy = screens.filter((_, i) => i !== idx);
    setScreens(copy);
    setSelectedIdx(Math.min(selectedIdx, copy.length - 1));
  };

  const addScreen = () => {
    setScreens([...screens, {
      name: `Screen ${screens.length + 1}`,
      code: '',
      preview: '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-size:14px;">New Screen</div>',
    }]);
    setSelectedIdx(screens.length);
  };

  const updateScreenName = (name: string) => {
    const copy = [...screens];
    copy[selectedIdx] = { ...copy[selectedIdx], name };
    setScreens(copy);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Screen list + controls */}
        <div className="lg:w-72 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Screens</h3>
            <button onClick={addScreen} className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {screens.map((s, i) => (
            <div key={i} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
              selectedIdx === i ? 'bg-blue-500/10 border border-blue-500/30' : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
            }`} onClick={() => setSelectedIdx(i)}>
              <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
              <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{s.name}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); moveScreen(i, -1); }} className="p-1 hover:bg-white/10 rounded"><ArrowUp className="w-3 h-3 text-slate-400" /></button>
                <button onClick={e => { e.stopPropagation(); moveScreen(i, 1); }} className="p-1 hover:bg-white/10 rounded"><ArrowDown className="w-3 h-3 text-slate-400" /></button>
                <button onClick={e => { e.stopPropagation(); deleteScreen(i); }} className="p-1 hover:bg-red-500/10 rounded"><Trash2 className="w-3 h-3 text-red-400" /></button>
              </div>
            </div>
          ))}

          {/* Theme & Color */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Theme</label>
              <div className="flex gap-2">
                <button onClick={() => setTheme('light')} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${theme === 'light' ? 'bg-white dark:bg-white/10 shadow text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
                <button onClick={() => setTheme('dark')} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${theme === 'dark' ? 'bg-slate-800 shadow text-white' : 'text-slate-400'}`}>
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Primary Color</label>
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0" />
            </div>
          </div>
        </div>

        {/* Right: Preview + edit */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {selected && (
            <>
              {editingName ? (
                <input
                  autoFocus
                  value={selected.name}
                  onChange={e => updateScreenName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                  className="text-lg font-bold text-center bg-transparent border-b-2 border-blue-500 outline-none text-slate-900 dark:text-white"
                />
              ) : (
                <button onClick={() => setEditingName(true)} className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-500 transition-colors">
                  {selected.name} ✏️
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div key={selectedIdx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <PhoneMockup>
                    <div
                      className={`w-full h-full overflow-auto ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                      dangerouslySetInnerHTML={{ __html: selected.preview }}
                    />
                  </PhoneMockup>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2"
      >
        Build & Download
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
