'use client';

import { ResumeData } from '@/types/resume';

interface Props {
  data: ResumeData;
  scale?: number;
}

function getSummary(data: ResumeData): string {
  return data.customSummary || data.personal.summary || '';
}

function formatDate(d: string): string {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m) - 1] || ''} ${y}`;
}

function ModernTemplate({ data }: { data: ResumeData }) {
  const summary = getSummary(data);
  return (
    <div className="p-8 font-sans text-[11px] leading-relaxed text-gray-800 bg-white" style={{ width: 794, minHeight: 1123 }}>
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b-2 border-blue-500">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{data.personal.fullName || 'Your Name'}</h1>
        <div className="flex items-center justify-center gap-3 mt-2 text-gray-500 text-[10px] flex-wrap">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>• {data.personal.phone}</span>}
          {data.personal.location && <span>• {data.personal.location}</span>}
        </div>
        <div className="flex items-center justify-center gap-3 mt-1 text-blue-600 text-[10px] flex-wrap">
          {data.personal.linkedIn && <span>{data.personal.linkedIn}</span>}
          {data.personal.portfolio && <span>• {data.personal.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Summary</h2>
          <p className="text-gray-600">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experiences.some(e => e.company || e.title) && (
        <div className="mb-5">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Experience</h2>
          {data.experiences.filter(e => e.company || e.title).map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-gray-900">{exp.title}</span>
                  {exp.company && <span className="text-gray-500"> at {exp.company}</span>}
                </div>
                <span className="text-gray-400 text-[10px] whitespace-nowrap ml-4">
                  {formatDate(exp.startDate)} — {exp.isPresent ? 'Present' : formatDate(exp.endDate)}
                </span>
              </div>
              <ul className="mt-1 space-y-0.5 ml-3">
                {exp.description.filter(Boolean).map((d, i) => (
                  <li key={i} className="text-gray-600 flex gap-1.5">
                    <span className="text-blue-400 mt-0.5">•</span> {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.some(e => e.school || e.degree) && (
        <div className="mb-5">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Education</h2>
          {data.education.filter(e => e.school || e.degree).map(edu => (
            <div key={edu.id} className="mb-2">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-gray-900">{edu.degree}</span>
                  {edu.field && <span className="text-gray-500"> in {edu.field}</span>}
                </div>
                <span className="text-gray-400 text-[10px]">{edu.graduationYear}</span>
              </div>
              <div className="text-gray-500">{edu.school}{edu.gpa && ` • GPA: ${edu.gpa}`}</div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skillCategories.some(c => c.skills.length > 0) && (
        <div className="mb-5">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Skills</h2>
          {data.skillCategories.filter(c => c.skills.length > 0).map(cat => (
            <div key={cat.id} className="mb-1.5">
              {cat.name && <span className="font-bold text-gray-900">{cat.name}: </span>}
              <span className="text-gray-600">{cat.skills.join(', ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfessionalTemplate({ data }: { data: ResumeData }) {
  const summary = getSummary(data);
  return (
    <div className="p-8 font-serif text-[11px] leading-relaxed text-gray-800 bg-white" style={{ width: 794, minHeight: 1123 }}>
      {/* Header */}
      <div className="text-center mb-4 pb-3 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-gray-900 font-serif">{data.personal.fullName || 'Your Name'}</h1>
        <div className="flex items-center justify-center gap-2 mt-2 text-gray-600 text-[10px] flex-wrap">
          {[data.personal.email, data.personal.phone, data.personal.location].filter(Boolean).join(' | ')}
        </div>
        <div className="flex items-center justify-center gap-2 mt-1 text-gray-500 text-[10px] flex-wrap">
          {[data.personal.linkedIn, data.personal.portfolio].filter(Boolean).join(' | ')}
        </div>
      </div>

      {summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-2">Professional Summary</h2>
          <p className="text-gray-600 italic">{summary}</p>
        </div>
      )}

      {data.experiences.some(e => e.company || e.title) && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3">Professional Experience</h2>
          {data.experiences.filter(e => e.company || e.title).map(exp => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between">
                <div><span className="font-bold">{exp.title}</span></div>
                <span className="text-gray-500 text-[10px]">{formatDate(exp.startDate)} — {exp.isPresent ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <div className="text-gray-500 italic">{exp.company}</div>
              <ul className="mt-1 ml-4 list-disc space-y-0.5">
                {exp.description.filter(Boolean).map((d, i) => (
                  <li key={i} className="text-gray-600">{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {data.education.some(e => e.school || e.degree) && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3">Education</h2>
          {data.education.filter(e => e.school || e.degree).map(edu => (
            <div key={edu.id} className="mb-2 flex justify-between">
              <div>
                <span className="font-bold">{edu.school}</span>
                <div className="text-gray-600">{edu.degree}{edu.field && ` in ${edu.field}`}{edu.gpa && ` — GPA: ${edu.gpa}`}</div>
              </div>
              <span className="text-gray-500 text-[10px]">{edu.graduationYear}</span>
            </div>
          ))}
        </div>
      )}

      {data.skillCategories.some(c => c.skills.length > 0) && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3">Skills</h2>
          {data.skillCategories.filter(c => c.skills.length > 0).map(cat => (
            <div key={cat.id} className="mb-1">
              {cat.name && <span className="font-bold">{cat.name}: </span>}
              <span className="text-gray-600">{cat.skills.join(' • ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreativeTemplate({ data }: { data: ResumeData }) {
  const summary = getSummary(data);
  return (
    <div className="font-sans text-[11px] leading-relaxed bg-white flex" style={{ width: 794, minHeight: 1123 }}>
      {/* Left sidebar */}
      <div className="w-[260px] bg-gradient-to-b from-indigo-600 to-purple-700 text-white p-6 flex-shrink-0">
        <h1 className="text-xl font-bold mb-1">{data.personal.fullName || 'Your Name'}</h1>
        {data.experiences[0]?.title && (
          <p className="text-indigo-200 text-[10px] mb-6">{data.experiences[0].title}</p>
        )}

        <div className="space-y-3 mb-6">
          <h3 className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold">Contact</h3>
          {data.personal.email && <p className="text-indigo-100 text-[10px]">✉ {data.personal.email}</p>}
          {data.personal.phone && <p className="text-indigo-100 text-[10px]">☎ {data.personal.phone}</p>}
          {data.personal.location && <p className="text-indigo-100 text-[10px]">📍 {data.personal.location}</p>}
          {data.personal.linkedIn && <p className="text-indigo-100 text-[10px]">🔗 {data.personal.linkedIn}</p>}
          {data.personal.portfolio && <p className="text-indigo-100 text-[10px]">🌐 {data.personal.portfolio}</p>}
        </div>

        {data.skillCategories.some(c => c.skills.length > 0) && (
          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold mb-2">Skills</h3>
            {data.skillCategories.filter(c => c.skills.length > 0).map(cat => (
              <div key={cat.id} className="mb-3">
                {cat.name && <p className="text-[9px] uppercase tracking-wider text-indigo-300 mb-1">{cat.name}</p>}
                <div className="flex flex-wrap gap-1">
                  {cat.skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-white/15 text-[9px]">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.education.some(e => e.school || e.degree) && (
          <div className="mt-6">
            <h3 className="text-[10px] uppercase tracking-widest text-indigo-200 font-bold mb-2">Education</h3>
            {data.education.filter(e => e.school || e.degree).map(edu => (
              <div key={edu.id} className="mb-2">
                <p className="font-bold text-[10px]">{edu.degree}{edu.field && ` in ${edu.field}`}</p>
                <p className="text-indigo-200 text-[9px]">{edu.school} {edu.graduationYear && `• ${edu.graduationYear}`}</p>
                {edu.gpa && <p className="text-indigo-300 text-[9px]">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right content */}
      <div className="flex-1 p-6 text-gray-800">
        {summary && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">About Me</h2>
            <p className="text-gray-600">{summary}</p>
          </div>
        )}

        {data.experiences.some(e => e.company || e.title) && (
          <div>
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Experience</h2>
            {data.experiences.filter(e => e.company || e.title).map(exp => (
              <div key={exp.id} className="mb-4 pl-4 border-l-2 border-indigo-200">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">{exp.title}</span>
                  <span className="text-gray-400 text-[10px]">
                    {formatDate(exp.startDate)} — {exp.isPresent ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div className="text-indigo-500 text-[10px] font-medium">{exp.company}</div>
                <ul className="mt-1 space-y-0.5">
                  {exp.description.filter(Boolean).map((d, i) => (
                    <li key={i} className="text-gray-600 flex gap-1.5">
                      <span className="text-indigo-400">▸</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResumePreview({ data, scale = 1 }: Props) {
  return (
    <div
      id="resume-preview"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794 }}
    >
      {data.template === 'modern' && <ModernTemplate data={data} />}
      {data.template === 'professional' && <ProfessionalTemplate data={data} />}
      {data.template === 'creative' && <CreativeTemplate data={data} />}
    </div>
  );
}
