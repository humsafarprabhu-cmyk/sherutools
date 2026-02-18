'use client';

import { motion } from 'framer-motion';

const templates = [
  { id: 'fitness', emoji: '🏋️', name: 'Fitness Tracker', desc: 'Workout logging, stats & progress' },
  { id: 'restaurant', emoji: '🍕', name: 'Restaurant / Food Menu', desc: 'Menu, ordering & reservations' },
  { id: 'notes', emoji: '📝', name: 'Notes / Todo', desc: 'Task lists, notes & reminders' },
  { id: 'ecommerce', emoji: '🛒', name: 'E-commerce Store', desc: 'Product catalog, cart & checkout' },
  { id: 'news', emoji: '📰', name: 'News / Blog Reader', desc: 'Articles, categories & bookmarks' },
  { id: 'portfolio', emoji: '💼', name: 'Portfolio / Business', desc: 'Showcase work & services' },
  { id: 'gallery', emoji: '📸', name: 'Photo Gallery', desc: 'Albums, grid view & fullscreen' },
  { id: 'quiz', emoji: '🎓', name: 'Quiz / Education', desc: 'Quizzes, scores & learning' },
  { id: 'expense', emoji: '💰', name: 'Expense Tracker', desc: 'Budget, transactions & charts' },
  { id: 'custom', emoji: '🔧', name: 'Custom', desc: 'AI generates from your description' },
];

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function TemplateGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {templates.map((t, i) => (
        <motion.button
          key={t.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(t.id)}
          className={`relative p-4 rounded-xl border text-left transition-all duration-200 group
            ${selected === t.id
              ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/10 ring-2 ring-blue-500/30'
              : 'border-slate-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 bg-white/50 dark:bg-white/[0.02] hover:bg-blue-50/50 dark:hover:bg-blue-500/5'
            }`}
        >
          <div className="text-2xl mb-2">{t.emoji}</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.desc}</div>
          {selected === t.id && (
            <motion.div
              layoutId="template-check"
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs"
            >
              ✓
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
