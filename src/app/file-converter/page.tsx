'use client';

import FileConverterApp from '@/components/file-converter/FileConverterApp';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function FileConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      <Navigation />
      <FileConverterApp />
      <Footer />
    </div>
  );
}
