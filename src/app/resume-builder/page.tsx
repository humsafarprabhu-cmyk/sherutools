'use client';

import FAQSection from '@/components/FAQSection';
import RelatedTools from '@/components/RelatedTools';

import ResumeBuilder from '@/components/resume/ResumeBuilder';

export default function ResumeBuilderPage() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 pt-8">Free Resume Builder — Create Professional Resumes</h1>
      <ResumeBuilder />
      <FAQSection faqs={[{"question":"Is this resume builder free?","answer":"Yes! Create and download professional resumes completely free. No sign-up or watermarks."},{"question":"Can I download my resume as PDF?","answer":"Yes, download your resume as a high-quality PDF file ready to submit to employers."},{"question":"What resume templates are available?","answer":"Choose from multiple professional templates designed by HR experts. All templates are ATS-friendly."},{"question":"Is my resume data stored on a server?","answer":"No, all data stays in your browser. Nothing is uploaded to any server, ensuring your privacy."}]} />
      <RelatedTools tools={[{"name":"Invoice Generator","href":"/invoice-generator","description":"Create professional invoices","icon":"🧾"},{"name":"PDF Tools","href":"/pdf-tools","description":"Merge, split, compress PDFs","icon":"📑"},{"name":"AI Email Writer","href":"/ai-email-writer","description":"Generate professional emails","icon":"📧"},{"name":"Word Counter","href":"/word-counter","description":"Count words and characters","icon":"📊"}]} />
    </div>
  );
}
