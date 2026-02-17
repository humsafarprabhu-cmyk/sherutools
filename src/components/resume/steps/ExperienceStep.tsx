'use client';

import { ResumeData, Experience, newExperience } from '@/types/resume';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Building2 } from 'lucide-react';

interface Props {
  data: ResumeData;
  updateData: (partial: Partial<ResumeData>) => void;
}

export default function ExperienceStep({ data, updateData }: Props) {
  const updateExp = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    updateData({
      experiences: data.experiences.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const addExp = () => updateData({ experiences: [...data.experiences, newExperience()] });
  const removeExp = (id: string) => {
    if (data.experiences.length <= 1) return;
    updateData({ experiences: data.experiences.filter(e => e.id !== id) });
  };

  const updateBullet = (expId: string, idx: number, value: string) => {
    const exp = data.experiences.find(e => e.id === expId);
    if (!exp) return;
    const desc = [...exp.description];
    desc[idx] = value;
    updateExp(expId, 'description', desc);
  };

  const addBullet = (expId: string) => {
    const exp = data.experiences.find(e => e.id === expId);
    if (!exp) return;
    updateExp(expId, 'description', [...exp.description, '']);
  };

  const removeBullet = (expId: string, idx: number) => {
    const exp = data.experiences.find(e => e.id === expId);
    if (!exp || exp.description.length <= 1) return;
    updateExp(expId, 'description', exp.description.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Work Experience</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your work history</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addExp}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {data.experiences.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Building2 className="w-4 h-4" /> Experience {i + 1}
              </div>
              {data.experiences.length > 1 && (
                <button onClick={() => removeExp(exp.id)} className="text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={exp.company}
                onChange={e => updateExp(exp.id, 'company', e.target.value)}
                placeholder="Company Name"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <input
                value={exp.title}
                onChange={e => updateExp(exp.id, 'title', e.target.value)}
                placeholder="Job Title"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <input
                type="month"
                value={exp.startDate}
                onChange={e => updateExp(exp.id, 'startDate', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={exp.isPresent ? '' : exp.endDate}
                  onChange={e => updateExp(exp.id, 'endDate', e.target.value)}
                  disabled={exp.isPresent}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                />
                <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exp.isPresent}
                    onChange={e => updateExp(exp.id, 'isPresent', e.target.checked)}
                    className="rounded"
                  />
                  Present
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Description (bullet points)</label>
              {exp.description.map((bullet, bi) => (
                <div key={bi} className="flex gap-2">
                  <span className="text-slate-400 mt-2.5 text-sm">•</span>
                  <input
                    value={bullet}
                    onChange={e => updateBullet(exp.id, bi, e.target.value)}
                    placeholder="Describe your achievement..."
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                  {exp.description.length > 1 && (
                    <button onClick={() => removeBullet(exp.id, bi)} className="text-red-400 hover:text-red-500 mt-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addBullet(exp.id)}
                className="text-xs text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add bullet point
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
