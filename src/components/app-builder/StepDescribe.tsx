'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Smartphone, Wand2, ChevronRight, Star, Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';

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

const templates = [
  { id: 'fitness', emoji: '🏋️', name: 'Fitness Tracker', desc: 'Workout logging, exercise timer, progress charts, weekly stats', gradient: 'from-red-500 to-orange-500', example: 'Track workouts, log exercises with sets/reps, countdown timer, weekly progress with animated charts' },
  { id: 'restaurant', emoji: '🍕', name: 'Food & Menu', desc: 'Menu categories, dish cards, cart system, checkout', gradient: 'from-orange-500 to-yellow-500', example: 'Restaurant menu with categories, dish details with prices, working cart with quantity controls' },
  { id: 'notes', emoji: '📝', name: 'Notes & Todo', desc: 'Rich notes, task lists, categories, search', gradient: 'from-blue-500 to-cyan-500', example: 'Note editor with title, body, color tags. Working add/edit/delete with persistence' },
  { id: 'ecommerce', emoji: '🛒', name: 'E-commerce', desc: 'Product grid, cart, filters, checkout flow', gradient: 'from-purple-500 to-pink-500', example: 'Product catalog with ratings, add-to-cart, quantity controls, total calculation' },
  { id: 'news', emoji: '📰', name: 'News Reader', desc: 'Article feed, categories, bookmarks, detail view', gradient: 'from-green-500 to-emerald-500', example: 'News feed with cards, category tabs, article detail view, working bookmarks' },
  { id: 'portfolio', emoji: '💼', name: 'Portfolio', desc: 'Projects showcase, skills, testimonials, contact', gradient: 'from-indigo-500 to-purple-500', example: 'Portfolio with hero section, project cards, skills progress bars, contact form' },
  { id: 'quiz', emoji: '🎓', name: 'Quiz App', desc: 'Categories, MCQ flow, timer, scores, results', gradient: 'from-amber-500 to-orange-500', example: 'Quiz with categories, timed questions, 4-option MCQ, score tracking, results' },
  { id: 'expense', emoji: '💰', name: 'Expense Tracker', desc: 'Transactions, budget bars, categories, monthly totals', gradient: 'from-emerald-500 to-teal-500', example: 'Expense tracker with add form, category breakdown, animated budget bars, monthly totals' },
  { id: 'social', emoji: '💬', name: 'Social / Chat', desc: 'Feed, profiles, messaging UI, notifications', gradient: 'from-blue-600 to-violet-600', example: 'Social feed with posts, like/comment, user profiles, chat UI, notifications' },
  { id: 'music', emoji: '🎵', name: 'Music Player', desc: 'Playlists, now playing, controls, lyrics', gradient: 'from-green-600 to-emerald-600', example: 'Music player with playlists, album art, play/pause/skip controls, progress bar, lyrics view' },
  { id: 'weather', emoji: '🌤️', name: 'Weather App', desc: 'Current weather, forecast, locations, animated icons', gradient: 'from-sky-500 to-blue-500', example: 'Weather app with current conditions, 7-day forecast cards, location selector, animated weather icons' },
  { id: 'custom', emoji: '✨', name: 'Custom App', desc: 'Describe anything — AI builds it', gradient: 'from-violet-500 to-fuchsia-500', example: '' },
];

const colors = [
  { value: '#6366f1', name: 'Indigo' },
  { value: '#3b82f6', name: 'Blue' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#10b981', name: 'Emerald' },
  { value: '#f59e0b', name: 'Amber' },
  { value: '#ef4444', name: 'Red' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#8b5cf6', name: 'Violet' },
  { value: '#f97316', name: 'Orange' },
  { value: '#14b8a6', name: 'Teal' },
  { value: '#e11d48', name: 'Rose' },
  { value: '#000000', name: 'Black' },
];

const exampleApps = [
  { name: 'FitTrack Pro', desc: 'Workout & fitness tracker', emoji: '💪' },
  { name: 'FoodieHub', desc: 'Restaurant menu & ordering', emoji: '🍔' },
  { name: 'BrainQuiz', desc: 'Trivia game with 500+ questions', emoji: '🧠' },
  { name: 'BudgetBuddy', desc: 'Expense & subscription tracker', emoji: '💰' },
  { name: 'DevPortfolio', desc: 'Developer showcase app', emoji: '👨‍💻' },
  { name: 'NewsFlow', desc: 'Personalized news reader', emoji: '📰' },
];

export default function StepDescribe({ description, setDescription, appName, setAppName, template, setTemplate, primaryColor, setPrimaryColor, onGenerate, loading }: Props) {
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const selectedTemplate = templates.find(t => t.id === template);
  const visibleTemplates = showAllTemplates ? templates : templates.slice(0, 8);

  const quickStart = (app: typeof exampleApps[0]) => {
    setAppName(app.name);
    setDescription(app.desc);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Quick Start Examples */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          ⚡ Quick Start — Tap to try
        </label>
        <div className="flex flex-wrap gap-2">
          {exampleApps.map((app, i) => (
            <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => quickStart(app)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all flex items-center gap-1.5">
              <span>{app.emoji}</span> {app.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* App Name — bigger, more prominent */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-500" />
          App Name
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="My Awesome App"
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 outline-none transition-all"
        />
      </div>

      {/* Templates */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-500" />
          Choose a Template
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleTemplates.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setTemplate(t.id)}
              className={`relative p-4 rounded-2xl border text-left transition-all duration-200 group overflow-hidden
                ${template === t.id
                  ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                  : 'border-slate-200 dark:border-white/[0.06] hover:border-blue-300 dark:hover:border-blue-500/30 bg-white dark:bg-white/[0.02] hover:shadow-md'
                }`}
            >
              {/* Gradient accent */}
              <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
              
              <div className="relative">
                <div className="text-3xl mb-2">{t.emoji}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</div>
              </div>
              
              {template === t.id && (
                <motion.div layoutId="template-check" className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                  ✓
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
        
        {!showAllTemplates && (
          <button onClick={() => setShowAllTemplates(true)}
            className="mt-3 text-sm text-blue-500 hover:text-blue-400 font-medium flex items-center gap-1 mx-auto">
            Show all templates <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected template hint */}
      <AnimatePresence>
        {selectedTemplate && selectedTemplate.example && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
              <div className="text-2xl">{selectedTemplate.emoji}</div>
              <div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedTemplate.name} includes:</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{selectedTemplate.example}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Describe Your App
          <span className="text-xs text-slate-400 font-normal ml-auto">The more detail, the better the result</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="A fitness tracking app with workout logging, progress charts, exercise library, and a personal dashboard showing weekly stats. Include a countdown timer for exercises and motivational quotes..."
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 outline-none transition-all resize-none leading-relaxed"
        />
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          🎨 Primary Color
        </label>
        <div className="flex items-center gap-2.5 flex-wrap">
          {colors.map(c => (
            <motion.button
              key={c.value}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPrimaryColor(c.value)}
              className={`w-10 h-10 rounded-xl transition-all duration-200 relative ${
                primaryColor === c.value 
                  ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-950 ring-blue-500 scale-110 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {primaryColor === c.value && (
                <motion.div layoutId="color-check" className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold drop-shadow-md">✓</span>
                </motion.div>
              )}
            </motion.button>
          ))}
          <div className="relative">
            <input
              type="color"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer border-2 border-dashed border-slate-300 dark:border-white/20 bg-transparent appearance-none"
              title="Custom color"
            />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 py-3 px-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> 5 screens generated</div>
        <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-500" /> Fully functional</div>
        <div className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-purple-500" /> Interactive preview</div>
        <div className="flex-1" />
        <div className="text-slate-400">~15 sec</div>
      </div>

      {/* Generate Button */}
      <motion.button
        whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onGenerate}
        disabled={loading || (!description.trim() && !template)}
        className="w-full py-5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
            />
            <span>AI is building your app...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            <span>Generate App with AI</span>
            <ArrowRight className="w-5 h-5 opacity-70" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
