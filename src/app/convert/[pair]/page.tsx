'use client';

import { use } from 'react';
import FileConverterApp, { CONVERSION_PAIRS } from '@/components/file-converter/FileConverterApp';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';

function parsePair(pair: string) {
  const match = pair.match(/^(\w+)-to-(\w+)$/);
  if (!match) return null;
  return { from: match[1], to: match[2] };
}

const FORMAT_INFO: Record<string, { name: string; full: string; ext: string; desc: string }> = {
  png: { name: 'PNG', full: 'Portable Network Graphics', ext: '.png', desc: 'lossless compression with transparency support' },
  jpg: { name: 'JPG', full: 'Joint Photographic Experts Group', ext: '.jpg', desc: 'lossy compression ideal for photographs' },
  jpeg: { name: 'JPG', full: 'Joint Photographic Experts Group', ext: '.jpg', desc: 'lossy compression ideal for photographs' },
  webp: { name: 'WebP', full: 'WebP Image Format', ext: '.webp', desc: 'modern format with superior compression by Google' },
  avif: { name: 'AVIF', full: 'AV1 Image File Format', ext: '.avif', desc: 'next-gen format with excellent compression' },
  heic: { name: 'HEIC', full: 'High Efficiency Image Container', ext: '.heic', desc: 'Apple\'s default photo format since iOS 11' },
  bmp: { name: 'BMP', full: 'Bitmap Image File', ext: '.bmp', desc: 'uncompressed raster graphics format' },
  gif: { name: 'GIF', full: 'Graphics Interchange Format', ext: '.gif', desc: 'supports animation and transparency' },
  ico: { name: 'ICO', full: 'Icon Image Format', ext: '.ico', desc: 'used for website favicons and Windows icons' },
};

function getFaqs(from: string, to: string) {
  const f = FORMAT_INFO[from] || { name: from.toUpperCase(), full: from.toUpperCase(), desc: 'image format' };
  const t = FORMAT_INFO[to] || { name: to.toUpperCase(), full: to.toUpperCase(), desc: 'image format' };
  return [
    { q: `How do I convert ${f.name} to ${t.name}?`, a: `Simply drag and drop your ${f.name} file into the converter above, select ${t.name} as the output format, and click Convert. The conversion happens instantly in your browser — no upload required.` },
    { q: `Is it free to convert ${f.name} to ${t.name}?`, a: `Yes! You get 3 free conversions per day. For unlimited conversions, batch mode, and larger file support, you can upgrade to Pro for a one-time payment of $4.99.` },
    { q: `Will my files be uploaded to a server?`, a: `No. All conversions happen 100% in your browser using client-side JavaScript. Your files never leave your device, ensuring complete privacy.` },
    { q: `What is ${f.name} (${f.full})?`, a: `${f.name} is a ${f.desc}. It uses the ${f.ext} file extension.` },
    { q: `What is ${t.name} (${t.full})?`, a: `${t.name} is a ${t.desc}. It uses the ${t.ext} file extension.` },
    { q: `Can I convert multiple ${f.name} files at once?`, a: `Yes! Pro users can batch convert up to 50 files simultaneously. Free users can convert up to 3 files per day.` },
  ];
}

export default function ConvertPairPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = use(params);
  const parsed = parsePair(pair);

  if (!parsed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid conversion pair</h1>
          <Link href="/file-converter" className="text-purple-400 hover:text-purple-300">← Back to File Converter</Link>
        </div>
      </div>
    );
  }

  const { from, to } = parsed;
  const f = FORMAT_INFO[from] || { name: from.toUpperCase(), full: from.toUpperCase() };
  const t = FORMAT_INFO[to] || { name: to.toUpperCase(), full: to.toUpperCase() };
  const faqs = getFaqs(from, to);

  const relatedPairs = CONVERSION_PAIRS.filter(p => p !== pair && (p.startsWith(from) || p.endsWith(to))).slice(0, 8);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${f.name} to ${t.name} Converter — SheruTools`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      <Navigation />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />

      <FileConverterApp presetFrom={from} presetTo={to} />

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group p-5 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50"
            >
              <summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white list-none flex items-center justify-between">
                {faq.q}
                <span className="text-purple-500 group-open:rotate-45 transition-transform text-lg">+</span>
              </summary>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* Related Conversions */}
      {relatedPairs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Related Conversions</h2>
          <div className="flex flex-wrap gap-2">
            {relatedPairs.map(p => (
              <Link
                key={p}
                href={`/convert/${p}`}
                className="text-sm px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
              >
                {p.replace(/-/g, ' ').replace('to', '→').toUpperCase()}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
