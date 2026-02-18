'use client';

import { motion } from 'framer-motion';
import { Sparkles, Smartphone } from 'lucide-react';
import TemplateGrid from './TemplateGrid';

interface Props {
  description: string;
  setDescription: (v: string) => void;
  appName: string;
  setAppName: (v: string) => void;
  template: string | null;
  setTemplate: (v: string) => void;
  primaryColor: string;
  setPrimaryColor: (v: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'];

export default function StepDescribe({ description, setDescription, appName, setAppName, template, setTemplate, primaryColor, setPrimaryColor, onGenerate, loading }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* App Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <Smartphone className="w-4 h-4 inline mr-1.5" />
          App Name
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="My Awesome App"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Choose Template */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Choose a Template <span className="text-slate-400 font-normal">(or describe below)</span>
        </label>
        <TemplateGrid selected={template} onSelect={setTemplate} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Describe Your App
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="A fitness tracking app with workout logging, progress charts, exercise library, and a personal dashboard showing weekly stats..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        />
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Primary Color
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {colors.map(c => (
            <button
              key={c}
              onClick={() => setPrimaryColor(c)}
              className={`w-9 h-9 rounded-full transition-all duration-200 ${primaryColor === c ? 'ring-2 ring-offset-2 ring-offset-slate-950 ring-white scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={primaryColor}
            onChange={e => setPrimaryColor(e.target.value)}
            className="w-9 h-9 rounded-full cursor-pointer border-0 bg-transparent"
          />
        </div>
      </div>

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onGenerate}
        disabled={loading || (!description.trim() && !template)}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
            AI is building your app...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate App with AI
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
