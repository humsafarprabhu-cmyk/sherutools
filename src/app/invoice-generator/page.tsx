'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Save, FileText, ChevronRight, Crown } from 'lucide-react';
import Link from 'next/link';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import UpgradeModal from '@/components/invoice/UpgradeModal';
import EmailCapture from '@/components/EmailCapture';
import { InvoiceData, newInvoiceData } from '@/types/invoice';
import { saveInvoice, isPro as checkPro } from '@/lib/storage';
import { generatePDF } from '@/lib/pdf';

export default function InvoiceGeneratorPage() {
  const [invoice, setInvoice] = useState<InvoiceData>(newInvoiceData());
  const [proUser, setProUser] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setProUser(checkPro()); }, []);

  const handleSave = () => {
    saveInvoice(invoice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownload = async () => {
    await generatePDF(invoice, proUser);
  };

  return (
    <div className="dot-pattern">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 text-sm text-slate-500 mb-6"
        >
          <Link href="/" className="hover:text-white transition-colors">SheruTools</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-white">Invoice Generator</span>
        </motion.nav>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Invoice Generator
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">Fill in details, preview live, download as PDF — free forever</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-4">
            <InvoiceForm invoice={invoice} onChange={setInvoice} />

            <div className="flex gap-3 sticky bottom-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all"
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl text-sm font-medium text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                <Download className="w-4 h-4" /> Download PDF
              </motion.button>
            </div>

            {!proUser && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                onClick={() => setShowUpgrade(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-amber-400/80 hover:text-amber-400 transition-colors"
              >
                <Crown className="w-4 h-4" /> Remove watermark — Upgrade to Pro
              </motion.button>
            )}
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
              <FileText className="w-4 h-4" /> Live Preview
            </div>
            <div className="transform scale-[0.85] origin-top">
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>

        {/* Email capture before footer */}
        <div className="mt-16">
          <EmailCapture variant="compact" />
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'SheruTools Invoice Generator',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://sherutools.com/invoice-generator',
          }),
        }}
      />
    </div>
  );
}
