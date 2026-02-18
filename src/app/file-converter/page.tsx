'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import FileConverterApp from '@/components/file-converter/FileConverterApp';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function FileConverterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      <Navigation />
      <FileConverterApp />
      <Footer />
    
      <div className="max-w-6xl mx-auto px-4">
      <FAQSection faqs={[{"question":"What file formats are supported?","answer":"Convert between PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, and ICO formats. All conversions happen client-side in your browser."},{"question":"Is file conversion done on a server?","answer":"No! All conversions happen 100% in your browser. Your files never leave your device, ensuring complete privacy."},{"question":"Can I convert multiple files at once?","answer":"Yes! Batch conversion is supported. Upload multiple images and convert them all at once to your desired format."},{"question":"Is there a file size limit?","answer":"Since conversions happen in your browser, the limit depends on your device memory. Most devices handle files up to 50MB easily."}]} />
      <RelatedTools tools={[{"name":"Image Tools","href":"/image-tools","description":"Edit and transform images online","icon":"🖼️"},{"name":"PDF Tools","href":"/pdf-tools","description":"Merge, split, and compress PDFs","icon":"📄"},{"name":"OCR","href":"/ocr","description":"Extract text from images with AI","icon":"🔍"},{"name":"Screenshot Beautifier","href":"/screenshot-beautifier","description":"Make screenshots look professional","icon":"✨"}]} />
      </div>
    </div>
  );
}
