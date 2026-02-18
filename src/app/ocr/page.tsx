'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import OcrApp from '@/components/ocr/OcrApp';

export default function OcrPage() {
  return (
    <>
      <Navigation />
      <OcrApp />
      <Footer />
    </>
  );
}
