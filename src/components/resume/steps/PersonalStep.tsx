'use client';

import { ResumeData } from '@/types/resume';
import { User, Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface Props {
  data: ResumeData;
  updateData: (partial: Partial<ResumeData>) => void;
}

function Input({ icon: Icon, label, value, onChange, placeholder, type = 'text' }: {
  icon: React.ElementType; label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
        />
      </div>
    </div>
  );
}

export default function PersonalStep({ data, updateData }: Props) {
  const update = (field: keyof ResumeData['personal'], value: string) => {
    updateData({ personal: { ...data.personal, [field]: value } });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tell us about yourself</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input icon={User} label="Full Name" value={data.personal.fullName} onChange={v => update('fullName', v)} placeholder="John Doe" />
        <Input icon={Mail} label="Email" value={data.personal.email} onChange={v => update('email', v)} placeholder="john@example.com" type="email" />
        <Input icon={Phone} label="Phone" value={data.personal.phone} onChange={v => update('phone', v)} placeholder="+1 (555) 123-4567" type="tel" />
        <Input icon={MapPin} label="Location" value={data.personal.location} onChange={v => update('location', v)} placeholder="San Francisco, CA" />
        <Input icon={Linkedin} label="LinkedIn URL" value={data.personal.linkedIn} onChange={v => update('linkedIn', v)} placeholder="linkedin.com/in/johndoe" />
        <Input icon={Globe} label="Portfolio URL" value={data.personal.portfolio} onChange={v => update('portfolio', v)} placeholder="johndoe.com" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Professional Summary</label>
        <textarea
          value={data.personal.summary}
          onChange={e => update('summary', e.target.value)}
          rows={4}
          placeholder="Experienced software engineer with 5+ years of expertise in..."
          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
        />
      </div>
    </div>
  );
}
