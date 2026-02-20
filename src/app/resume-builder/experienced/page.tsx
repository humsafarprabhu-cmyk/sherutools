import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Resume Builder for Experienced Pros',
  description: 'Create executive-level resumes that highlight your experience. Professional templates, free to use.',
  alternates: { canonical: '/resume-builder/experienced' },
};

export default function ExperiencedVariationPage() {
  return (
    <div className="dot-pattern">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-indigo-500">Home</Link>
          <span>/</span>
          <Link href="/resume-builder" className="hover:text-indigo-500">Resume Builder</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white capitalize">experienced</span>
        </nav>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Resume Builder for Experienced Professionals
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
          Create executive-level resumes that highlight your experience. Professional templates, free to use.
        </p>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-8">
          <p className="text-slate-700 dark:text-slate-200 mb-4">
            Use our full-featured <strong>Resume Builder</strong> below — it&apos;s completely free and works right in your browser.
          </p>
          <Link
            href="/resume-builder"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Open Resume Builder →
          </Link>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Why Resume Builder for Experienced Professionals?</h2>
          <p>
            Whether you&apos;re looking for a specialized tool or just want a streamlined experience,
            our Resume Builder has everything you need. This page is optimized for <strong>resume builder for experienced professionals</strong> — 
            but the tool itself handles all use cases beautifully.
          </p>

          <h2>Features</h2>
          <ul>
            <li>100% free — no hidden fees or premium gates</li>
            <li>No signup required — start immediately</li>
            <li>Privacy first — everything runs in your browser</li>
            <li>Professional output — download-ready results</li>
            <li>Mobile friendly — works on any device</li>
          </ul>

          <h2>Get Started Now</h2>
          <p>
            Click the button above to open the Resume Builder and start creating. 
            It takes less than a minute to get professional results.
          </p>
        </article>
      </div>
    </div>
  );
}
