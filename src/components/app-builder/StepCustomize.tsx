'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRight, ArrowUp, ArrowDown, Wand2, RefreshCw, Loader2, Copy, X } from 'lucide-react';
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
  const [editingName, setEditingName] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [showEditAI, setShowEditAI] = useState(false);
  const [editing, setEditing] = useState(false);

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

  const duplicateScreen = (idx: number) => {
    const copy = [...screens];
    const dup = { ...copy[idx], name: copy[idx].name + ' (copy)' };
    copy.splice(idx + 1, 0, dup);
    setScreens(copy);
    setSelectedIdx(idx + 1);
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

  // AI Edit screen
  const editWithAI = async () => {
    if (!editPrompt.trim() || !selected) return;
    setEditing(true);
    try {
      const res = await fetch('/api/ai-app-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `Modify this existing screen: "${selected.name}". Current HTML is provided. Apply this change: ${editPrompt}. Keep the same overall design but apply the requested modification.`,
          template: 'custom',
          appName: selected.name,
          primaryColor,
          editMode: true,
          existingHtml: selected.html,
          singleScreen: true,
        }),
      });
      const data = await res.json();
      if (data.screens?.[0]?.html) {
        const copy = [...screens];
        copy[selectedIdx] = {
          ...copy[selectedIdx],
          html: data.screens[0].html,
          preview: data.screens[0].html,
        };
        setScreens(copy);
      }
      setEditPrompt('');
      setShowEditAI(false);
    } catch (err) {
      console.error(err);
    } finally {
      setEditing(false);
    }
  };

  const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'];

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
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Screens</h3>
            <button onClick={addScreen} className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {screens.map((s, i) => (
            <motion.div
              key={i}
              layout
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${
                selectedIdx === i 
                  ? 'bg-blue-500/10 border border-blue-500/30 shadow-sm' 
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
              }`} 
              onClick={() => setSelectedIdx(i)}
            >
              <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-white/10 flex items-center justify-center text-sm shrink-0">
                {s.icon || `${i + 1}`}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{s.name}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); moveScreen(i, -1); }} className="p-1 hover:bg-white/10 rounded" title="Move up">
                  <ArrowUp className="w-3 h-3 text-slate-400" />
                </button>
                <button onClick={e => { e.stopPropagation(); moveScreen(i, 1); }} className="p-1 hover:bg-white/10 rounded" title="Move down">
                  <ArrowDown className="w-3 h-3 text-slate-400" />
                </button>
                <button onClick={e => { e.stopPropagation(); duplicateScreen(i); }} className="p-1 hover:bg-blue-500/10 rounded" title="Duplicate">
                  <Copy className="w-3 h-3 text-blue-400" />
                </button>
                <button onClick={e => { e.stopPropagation(); deleteScreen(i); }} className="p-1 hover:bg-red-500/10 rounded" title="Delete">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Color */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Primary Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button key={c} onClick={() => setPrimaryColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${primaryColor === c ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-2 border-dashed border-slate-300 dark:border-white/20" />
            </div>
          </div>
        </div>

        {/* Right: Preview + edit */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {selected && (
            <>
              {/* Screen name */}
              {editingName ? (
                <input
                  autoFocus
                  value={selected.name}
                  onChange={e => updateScreenName(e.target.value)}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={e => e.key === 'Enter' && setEditingName(false)}
                  className="text-lg font-bold text-center bg-transparent border-b-2 border-blue-500 outline-none text-slate-900 dark:text-white px-4"
                />
              ) : (
                <button onClick={() => setEditingName(true)} className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-500 transition-colors flex items-center gap-1">
                  {selected.icon || ''} {selected.name} <span className="text-xs text-slate-400">✏️</span>
                </button>
              )}

              {/* Phone preview */}
              <AnimatePresence mode="wait">
                <motion.div key={selectedIdx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <PhoneMockup>
                    {selected.html ? (
                      <iframe
                        srcDoc={selected.html}
                        className="w-full h-full border-0 rounded-[20px]"
                        sandbox="allow-scripts allow-same-origin"
                        title={selected.name}
                      />
                    ) : (
                      <div
                        className="w-full h-full overflow-auto bg-slate-900"
                        dangerouslySetInnerHTML={{ __html: selected.preview }}
                      />
                    )}
                  </PhoneMockup>
                </motion.div>
              </AnimatePresence>

              {/* AI Edit button */}
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditAI(!showEditAI)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-500 text-sm font-medium flex items-center gap-2 hover:from-purple-500/20 hover:to-pink-500/20 transition-all">
                  <Wand2 className="w-4 h-4" /> Edit with AI
                </motion.button>
              </div>

              {/* AI Edit Panel */}
              <AnimatePresence>
                {showEditAI && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="w-full max-w-md overflow-hidden">
                    <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                          <Wand2 className="w-4 h-4" /> AI Screen Editor
                        </h4>
                        <button onClick={() => setShowEditAI(false)}>
                          <X className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                      <textarea
                        value={editPrompt}
                        onChange={e => setEditPrompt(e.target.value)}
                        placeholder="e.g., 'Add a search bar at the top', 'Change the color scheme to blue', 'Add more items to the list', 'Make the buttons rounded'..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 placeholder:text-slate-400"
                      />
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={editWithAI} disabled={!editPrompt.trim() || editing}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                        {editing ? <><Loader2 className="w-4 h-4 animate-spin" /> Editing...</> : <><Wand2 className="w-4 h-4" /> Apply Changes</>}
                      </motion.button>
                      <div className="text-[10px] text-slate-400 text-center">AI will regenerate this screen with your changes</div>
                    </div>
                  </motion.div>
                )}
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
