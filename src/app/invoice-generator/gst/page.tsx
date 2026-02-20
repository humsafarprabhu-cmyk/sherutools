import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'GST Invoice Generator Online Free',
  description: 'Generate GST-compliant invoices instantly. Add GSTIN, HSN codes, and tax breakdowns. Free online tool.',
  alternates: { canonical: '/invoice-generator/gst' },
};

export default function GstVariationPage() {
  return (
    <div className="dot-pattern">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-indigo-500">Home</Link>
          <span>/</span>
          <Link href="/invoice-generator" className="hover:text-indigo-500">Invoice Generator</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white capitalize">gst</span>
        </nav>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          GST Invoice Generator
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
          Generate GST-compliant invoices instantly. Add GSTIN, HSN codes, and tax breakdowns. Free online tool.
        </p>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-8">
          <p className="text-slate-700 dark:text-slate-200 mb-4">
            Use our full-featured <strong>Invoice Generator</strong> below — it&apos;s completely free and works right in your browser.
          </p>
          <Link
            href="/invoice-generator"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Open Invoice Generator →
          </Link>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Why GST Invoice Generator?</h2>
          <p>
            Whether you&apos;re looking for a specialized tool or just want a streamlined experience,
            our Invoice Generator has everything you need. This page is optimized for <strong>gst invoice generator online free</strong> — 
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
            Click the button above to open the Invoice Generator and start creating. 
            It takes less than a minute to get professional results.
          </p>
        </article>
      </div>
    </div>
  );
}
