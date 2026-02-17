'use client';

import { ResumeData, newSkillCategory } from '@/types/resume';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Tag } from 'lucide-react';
import { useState } from 'react';

interface Props {
  data: ResumeData;
  updateData: (partial: Partial<ResumeData>) => void;
}

export default function SkillsStep({ data, updateData }: Props) {
  const [inputs, setInputs] = useState<Record<string, string>>({});

  const addCategory = () => updateData({ skillCategories: [...data.skillCategories, newSkillCategory()] });

  const removeCategory = (id: string) => {
    if (data.skillCategories.length <= 1) return;
    updateData({ skillCategories: data.skillCategories.filter(c => c.id !== id) });
  };

  const updateCategoryName = (id: string, name: string) => {
    updateData({
      skillCategories: data.skillCategories.map(c =>
        c.id === id ? { ...c, name } : c
      ),
    });
  };

  const addSkill = (catId: string) => {
    const skill = (inputs[catId] || '').trim();
    if (!skill) return;
    updateData({
      skillCategories: data.skillCategories.map(c =>
        c.id === catId ? { ...c, skills: [...c.skills, skill] } : c
      ),
    });
    setInputs(prev => ({ ...prev, [catId]: '' }));
  };

  const removeSkill = (catId: string, idx: number) => {
    updateData({
      skillCategories: data.skillCategories.map(c =>
        c.id === catId ? { ...c, skills: c.skills.filter((_, i) => i !== idx) } : c
      ),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Skills</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your skills by category</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addCategory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Category
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {data.skillCategories.map((cat) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                value={cat.name}
                onChange={e => updateCategoryName(cat.id, e.target.value)}
                placeholder="Category name (e.g., Programming Languages)"
                className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {data.skillCategories.length > 1 && (
                <button onClick={() => removeCategory(cat.id)} className="text-red-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Skills tags */}
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {cat.skills.map((skill, si) => (
                  <motion.span
                    key={skill + si}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm"
                  >
                    {skill}
                    <button onClick={() => removeSkill(cat.id, si)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* Add skill input */}
            <div className="flex gap-2">
              <input
                value={inputs[cat.id] || ''}
                onChange={e => setInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(cat.id))}
                placeholder="Type a skill and press Enter"
                className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button
                onClick={() => addSkill(cat.id)}
                className="px-3 py-2 rounded-lg bg-blue-500/10 text-blue-500 text-sm font-medium hover:bg-blue-500/20 transition-all"
              >
                Add
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
