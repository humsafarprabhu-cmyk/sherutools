import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free PDF Tools Online — Merge, Split, Compress PDFs',
  description: 'Free online PDF tools. Merge, split, compress PDFs and convert between PDF & images. No upload to server — all processing in your browser. Fast, private, free.',
  keywords: ['merge pdf free', 'split pdf online', 'compress pdf', 'pdf to image converter', 'images to pdf', 'pdf tools online free'],
  alternates: { canonical: 'https://sherutools.com/pdf-tools' },
  openGraph: {
    title: 'Free PDF Tools Online — Merge, Split, Compress PDFs',
    description: 'Free online PDF tools. Merge, split, compress PDFs and convert between PDF & images. No upload to server.',
    url: 'https://sherutools.com/pdf-tools',
    type: 'website',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Pdf Tools', item: 'https://sherutools.com/pdf-tools' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools PDF Tools',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Merge, split, compress PDFs and convert between PDF & images. 100% browser-based.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are these PDF tools free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! Merge, split, compress PDFs and convert between PDF & images — all completely free.' },
      },
      {
        '@type': 'Question',
        name: 'Are my files uploaded to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens in your browser. Your files never leave your device.' },
      },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
