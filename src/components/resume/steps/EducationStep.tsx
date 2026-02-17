'use client';

import { ResumeData, Education, newEducation } from '@/types/resume';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

interface Props {
  data: ResumeData;
  updateData: (partial: Partial<ResumeData>) => void;
}

export default function EducationStep({ data, updateData }: Props) {
  const updateEdu = (id: string, field: keyof Education, value: string) => {
    updateData({
      education: data.education.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    });
  };

  const addEdu = () => updateData({ education: [...data.education, newEducation()] });
  const removeEdu = (id: string) => {
    if (data.education.length <= 1) return;
    updateData({ education: data.education.filter(e => e.id !== id) });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Education</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add your educational background</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addEdu}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add
        </motion.button>
      </div>

      <AnimatePresence mode="popLayout">
        {data.education.map((edu, i) => (
          <motion.div
            key={edu.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <GraduationCap className="w-4 h-4" /> Education {i + 1}
              </div>
              {data.education.length > 1 && (
                <button onClick={() => removeEdu(edu.id)} className="text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={edu.school}
                onChange={e => updateEdu(edu.id, 'school', e.target.value)}
                placeholder="School / University"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <input
                value={edu.degree}
                onChange={e => updateEdu(edu.id, 'degree', e.target.value)}
                placeholder="Degree (e.g., Bachelor's)"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <input
                value={edu.field}
                onChange={e => updateEdu(edu.id, 'field', e.target.value)}
                placeholder="Field of Study"
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={edu.graduationYear}
                  onChange={e => updateEdu(edu.id, 'graduationYear', e.target.value)}
                  placeholder="Year"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <input
                  value={edu.gpa}
                  onChange={e => updateEdu(edu.id, 'gpa', e.target.value)}
                  placeholder="GPA (optional)"
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
