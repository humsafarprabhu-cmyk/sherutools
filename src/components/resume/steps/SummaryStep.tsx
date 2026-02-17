'use client';

import { ResumeData } from '@/types/resume';
import { Sparkles } from 'lucide-react';

interface Props {
  data: ResumeData;
  updateData: (partial: Partial<ResumeData>) => void;
}

function generateSummary(data: ResumeData): string {
  const { personal, experiences, skillCategories } = data;
  const name = personal.fullName || 'Professional';
  const latestJob = experiences[0];
  const allSkills = skillCategories.flatMap(c => c.skills).slice(0, 5);

  let summary = '';
  if (latestJob?.title && latestJob?.company) {
    summary = `${latestJob.title} with experience at ${latestJob.company}`;
  } else {
    summary = `Motivated professional`;
  }

  if (allSkills.length > 0) {
    summary += `, skilled in ${allSkills.join(', ')}`;
  }

  summary += '. Passionate about delivering high-quality results and continuously improving.';
  return summary;
}

export default function SummaryStep({ data, updateData }: Props) {
  const autoSummary = generateSummary(data);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Summary</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review or customize your professional summary</p>
      </div>

      {/* Auto-generated suggestion */}
      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-500 mb-2">
          <Sparkles className="w-4 h-4" /> Auto-generated Summary
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{autoSummary}</p>
        <button
          onClick={() => updateData({ customSummary: autoSummary })}
          className="mt-3 text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors"
        >
          Use this summary →
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Custom Summary</label>
        <textarea
          value={data.customSummary}
          onChange={e => updateData({ customSummary: e.target.value })}
          rows={6}
          placeholder="Write your professional summary here, or use the auto-generated one above..."
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
        />
        <p className="text-xs text-slate-400 mt-1">
          {data.customSummary ? data.customSummary.length : 0} characters
          {!data.customSummary && ' • The auto-generated summary or your personal summary will be used if left blank'}
        </p>
      </div>
    </div>
  );
}
