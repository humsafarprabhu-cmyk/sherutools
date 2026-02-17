'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Eye, Crown, ChevronLeft, ChevronRight, Upload, FileDown, X } from 'lucide-react';
import { ResumeData, defaultResumeData, STEPS, ResumeTemplate } from '@/types/resume';
import PersonalStep from './steps/PersonalStep';
import ExperienceStep from './steps/ExperienceStep';
import EducationStep from './steps/EducationStep';
import SkillsStep from './steps/SkillsStep';
import SummaryStep from './steps/SummaryStep';
import ResumePreview from './ResumePreview';
import UpgradeModal from './UpgradeModal';

const STORAGE_KEY = 'sherutools_resume';
const DOWNLOAD_KEY = 'sherutools_resume_downloads';
const MAX_FREE_DOWNLOADS = 3;

function getDownloadsToday(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const data = JSON.parse(localStorage.getItem(DOWNLOAD_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    if (data.date !== today) return 0;
    return data.count || 0;
  } catch { return 0; }
}

function incrementDownloads(): void {
  const today = new Date().toISOString().split('T')[0];
  const current = getDownloadsToday();
  localStorage.setItem(DOWNLOAD_KEY, JSON.stringify({ date: today, count: current + 1 }));
}

function isPro(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sherutools_pro') === 'true';
}

export default function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(defaultResumeData());
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!loaded) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 500);
    return () => clearTimeout(timeout);
  }, [data, loaded]);

  const updateData = useCallback((partial: Partial<ResumeData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    }
  };

  const goToStep = (i: number) => {
    setDirection(i > step ? 1 : -1);
    setStep(i);
  };

  const handleDownload = async () => {
    const pro = isPro();
    if (!pro && getDownloadsToday() >= MAX_FREE_DOWNLOADS) {
      setShowUpgrade(true);
      return;
    }

    const { generateResumePDF } = await import('@/lib/resume-pdf');
    await generateResumePDF(data, !pro);
    if (!pro) incrementDownloads();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${data.personal.fullName || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string);
          setData({ ...defaultResumeData(), ...imported });
        } catch {}
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const setTemplate = (t: ResumeTemplate) => updateData({ template: t });

  const stepProps = { data, updateData };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  const downloadsLeft = MAX_FREE_DOWNLOADS - getDownloadsToday();

  if (!loaded) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <a href="/" className="hover:text-blue-500 transition-colors">SheruTools</a>
          <span className="mx-2">›</span>
          <span className="text-slate-900 dark:text-white">Resume Builder</span>
        </p>
      </div>

      {/* Step Indicator */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <button
                onClick={() => goToStep(i)}
                className="flex items-center gap-2 group w-full"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                  i <= step
                    ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-slate-500'
                }`}>
                  {i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block transition-colors ${
                  i <= step ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {s}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                    initial={false}
                    animate={{ width: i < step ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Form */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl bg-white/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 backdrop-blur-xl p-6 min-h-[500px] overflow-hidden relative">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  {step === 0 && <PersonalStep {...stepProps} />}
                  {step === 1 && <ExperienceStep {...stepProps} />}
                  {step === 2 && <EducationStep {...stepProps} />}
                  {step === 3 && <SkillsStep {...stepProps} />}
                  {step === 4 && <SummaryStep {...stepProps} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-4 gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={goNext}
                  disabled={step === STEPS.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile preview button */}
                <button
                  onClick={() => setShowMobilePreview(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>

                <button
                  onClick={handleImport}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                  title="Import JSON"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
                  title="Export JSON"
                >
                  <FileDown className="w-4 h-4" />
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download PDF</span>
                  {!isPro() && (
                    <span className="text-[10px] opacity-70">({downloadsLeft} left)</span>
                  )}
                </button>

                {!isPro() && (
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                  >
                    <Crown className="w-4 h-4" /> Pro
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Preview (desktop) */}
          <div className="hidden lg:block w-[420px] flex-shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-3">
                {(['modern', 'professional', 'creative'] as ResumeTemplate[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      data.template === t
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-white/80 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30">
                <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <ResumePreview data={data} scale={0.55} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
          >
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                {(['modern', 'professional', 'creative'] as ResumeTemplate[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      data.template === t
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowMobilePreview(false)} className="text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="max-w-lg mx-auto">
                <ResumePreview data={data} scale={0.7} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} tool="resume" />
    </div>
  );
}
