import type { Metadata } from 'next';

const title = 'AI OCR — Extract Text from Images Free Online | SheruTools';
const description =
  'Extract text from images instantly with AI-powered OCR. Supports 15+ languages. Drag & drop, copy text, download as TXT. 100% free, runs in your browser.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'image to text converter',
    'ocr online free',
    'extract text from image',
    'photo to text',
    'ocr tool',
    'image text extractor',
    'optical character recognition',
    'free ocr online',
  ],
  alternates: { canonical: 'https://sherutools.com/ocr' },
  openGraph: { title, description, url: 'https://sherutools.com/ocr' },
  other: {
    'application/ld+json': JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'SheruTools AI OCR — Image to Text',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How does the AI OCR tool work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our OCR tool uses Tesseract.js to recognize text in images directly in your browser. No uploads to any server — your images stay 100% private.',
            },
          },
          {
            '@type': 'Question',
            name: 'What image formats are supported?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'We support PNG, JPG/JPEG, WebP, BMP, GIF, and screenshot images. Pro users can also process PDF page screenshots.',
            },
          },
          {
            '@type': 'Question',
            name: 'What languages does the OCR support?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Free users can extract text in English and Hindi. Pro users unlock 15+ languages including Spanish, French, German, Japanese, Chinese, Korean, Arabic, Russian, Portuguese, Italian, Dutch, Turkish, and Thai.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is the OCR tool free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! You get 5 free image extractions per day with English and Hindi support. Pro unlocks unlimited extractions, batch processing, and all 15+ languages.',
            },
          },
        ],
      },
    ]),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
