'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Star, AlertTriangle, CheckCircle, XCircle, Loader2, BarChart3, Target, Zap, Lock, Award, TrendingUp } from 'lucide-react';
import { useState, useRef } from 'react';
import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

interface ScoreResult {
  overall: number;
  sections: {
    name: string;
    score: number;
    feedback: string;
    tips: string[];
  }[];
  keywords: { found: string[]; missing: string[] };
  atsScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

const faqs = [
  { question: 'How does the AI Resume Scorer work?', answer: 'Paste your resume text and optionally a job description. Our AI analyzes your resume across multiple dimensions: content quality, formatting, keyword optimization, ATS compatibility, and impact statements. You get a detailed score with actionable improvement tips.' },
  { question: 'Is my resume data private?', answer: 'Yes. Your resume text is sent to our AI for analysis but is NOT stored. We don\'t save, share, or use your resume data for any purpose beyond generating your score.' },
  { question: 'What is ATS compatibility?', answer: 'ATS (Applicant Tracking System) is software that companies use to filter resumes. About 75% of resumes are rejected by ATS before a human sees them. Our tool checks if your resume format and keywords are ATS-friendly.' },
  { question: 'How accurate is the scoring?', answer: 'Our AI has been trained on thousands of successful resumes and hiring patterns. While no automated tool replaces human review, our scoring provides reliable directional feedback that helps you improve.' },
  { question: 'Can I check multiple resumes?', answer: 'Free users get 3 resume checks per day. Pro users get unlimited checks with deeper analysis, industry-specific tips, and cover letter generation.' },
];

export default function ResumeScorer() {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState('');
  const [showJobDesc, setShowJobDesc] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;

    // Usage limit
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem('sherutools_resume_usage') || '{}');
    if (usage.date === today && usage.count >= 3) {
      setError('Free limit reached (3/day). Upgrade to Pro for unlimited checks!');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai-resume-scorer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription: jobDesc || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);

      // Track usage
      const newCount = usage.date === today ? usage.count + 1 : 1;
      localStorage.setItem('sherutools_resume_usage', JSON.stringify({ date: today, count: newCount }));

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-amber-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    if (score >= 40) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-500 dark:text-emerald-400">
              <Award className="w-4 h-4" /> AI-Powered Resume Analysis
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white">
              Is Your Resume{' '}
              <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Good Enough?
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              75% of resumes are rejected by ATS before a human sees them. Get instant AI feedback
              with actionable tips to land more interviews. Free, no sign-up.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Input */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Paste Your Resume
            </label>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your entire resume text here...&#10;&#10;John Doe&#10;Software Engineer&#10;john@email.com | (555) 123-4567&#10;&#10;EXPERIENCE&#10;Senior Software Engineer — Google (2022-Present)&#10;• Led a team of 5 engineers to build..."
              className="w-full h-80 px-4 py-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-slate-400/50"
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{resumeText.length} characters</span>
              <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => setShowJobDesc(!showJobDesc)}
              className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:text-emerald-500 transition-colors">
              <Target className="w-4 h-4" /> Add Job Description (Optional — Better Scoring)
              <span className="text-xs text-emerald-500">{showJobDesc ? '▼' : '►'}</span>
            </button>
            
            <AnimatePresence>
              {showJobDesc && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <textarea
                    value={jobDesc}
                    onChange={e => setJobDesc(e.target.value)}
                    placeholder="Paste the job description here for keyword matching and tailored scoring..."
                    className="w-full h-48 px-4 py-3 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 placeholder:text-slate-400/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tips */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
              <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">💡 Tips for Best Results</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Paste your FULL resume — don&apos;t skip sections</li>
                <li>• Include the job description for keyword matching</li>
                <li>• Use your actual resume text, not a screenshot</li>
                <li>• Copy from PDF, Word, or Google Docs</li>
              </ul>
            </div>

            {/* What we check */}
            <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">🔍 What We Analyze</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Content Quality</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> ATS Compatibility</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Keywords Match</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Impact Statements</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Formatting</div>
                <div className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Length & Sections</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}

        {/* Analyze Button */}
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={analyzeResume}
          disabled={!resumeText.trim() || loading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Your Resume...</>
          ) : (
            <><Zap className="w-5 h-5" /> Score My Resume</>
          )}
        </motion.button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div ref={resultRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Overall Score */}
              <div className="p-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 text-center space-y-4">
                <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Resume Score</h2>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/5" strokeWidth="12" />
                    <circle cx="80" cy="80" r="70" fill="none" strokeWidth="12" strokeLinecap="round"
                      className={getScoreColor(result.overall)}
                      stroke="currentColor"
                      strokeDasharray={`${(result.overall / 100) * 440} 440`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-extrabold ${getScoreColor(result.overall)}`}>{result.overall}</span>
                    <span className="text-xs text-slate-500">/100</span>
                  </div>
                </div>
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${getScoreBg(result.overall)} text-white`}>
                  Grade: {getGrade(result.overall)}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">{result.summary}</p>
              </div>

              {/* Section Scores */}
              <div className="grid md:grid-cols-2 gap-4">
                {result.sections.map((section, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-white">{section.name}</h3>
                      <span className={`text-lg font-bold ${getScoreColor(section.score)}`}>{section.score}/100</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${section.score}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                        className={`h-full rounded-full bg-gradient-to-r ${getScoreBg(section.score)}`} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{section.feedback}</p>
                    {section.tips.length > 0 && (
                      <ul className="text-xs text-slate-500 space-y-1">
                        {section.tips.map((tip, j) => (
                          <li key={j} className="flex items-start gap-1.5">
                            <Zap className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" /> {tip}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* ATS Score */}
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" /> ATS Compatibility
                  </h3>
                  <span className={`text-xl font-bold ${getScoreColor(result.atsScore)}`}>{result.atsScore}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${result.atsScore}%` }} transition={{ duration: 0.8 }}
                    className={`h-full rounded-full bg-gradient-to-r ${getScoreBg(result.atsScore)}`} />
                </div>
                <p className="text-xs text-slate-500">
                  {result.atsScore >= 80 ? '✅ Your resume is well-optimized for ATS systems.' :
                   result.atsScore >= 60 ? '⚠️ Some improvements needed for better ATS compatibility.' :
                   '❌ Your resume may get filtered out by ATS. Review keywords and formatting.'}
                </p>
              </div>

              {/* Keywords */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/10 space-y-3">
                  <h3 className="font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Keywords Found ({result.keywords.found.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.found.map((kw, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">{kw}</span>
                    ))}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3">
                  <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <XCircle className="w-5 h-5" /> Missing Keywords ({result.keywords.missing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.missing.map((kw, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">💪 Strengths</h3>
                  <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">🎯 Improvements</h3>
                  <ul className="space-y-2">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pro Upsell */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Upgrade to Pro</h3>
                </div>
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  <li>✨ Unlimited resume checks</li>
                  <li>📝 AI-rewritten bullet points</li>
                  <li>📄 Auto-generated cover letter</li>
                  <li>🎯 Industry-specific optimization</li>
                  <li>📊 Detailed comparison with top resumes</li>
                </ul>
                <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold text-sm shadow-lg">
                  Upgrade — $5.99/mo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAQ & Related */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <FAQSection faqs={faqs} />
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <RelatedTools tools={[{name:"Resume Builder",href:"/resume-builder",description:"Build a professional resume with templates.",icon:"📝"},{name:"AI Email Writer",href:"/ai-email-writer",description:"Write professional emails with AI.",icon:"✉️"},{name:"Word Counter",href:"/word-counter",description:"Count words, characters, reading time.",icon:"📊"},{name:"Subscription Tracker",href:"/subscription-tracker",description:"Track all your subscriptions and spending.",icon:"💸"}]} />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Resume Scorer",
        "description": "Get instant AI feedback on your resume with scoring, ATS check, and improvement tips.",
        "url": "https://sherutools.com/resume-scorer",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      })}} />
    </div>
  );
}
