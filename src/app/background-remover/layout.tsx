import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Background Remover — Free, No Upload, 100% Private',
  description: 'Remove backgrounds from images instantly using AI. Free, no upload needed — runs 100% in your browser. Download transparent PNG. Replace with custom colors, gradients, or images.',
  keywords: ['remove background from image free', 'background remover online', 'remove bg', 'transparent background maker', 'background eraser', 'AI background remover'],
  alternates: { canonical: 'https://sherutools.com/background-remover' },
  openGraph: {
    title: 'AI Background Remover — Free, No Upload, 100% Private',
    description: 'Remove backgrounds from images instantly using AI. Free, no upload — 100% private. Download transparent PNG.',
    url: 'https://sherutools.com/background-remover',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools AI Background Remover',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Remove backgrounds from images using AI. 100% client-side, no upload required.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this background remover free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! You can remove backgrounds from up to 3 images per day for free. Pro users get unlimited access.' },
      },
      {
        '@type': 'Question',
        name: 'Are my images uploaded to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens directly in your browser using AI. Your images never leave your device.' },
      },
      {
        '@type': 'Question',
        name: 'What image formats are supported?',
        acceptedAnswer: { '@type': 'Answer', text: 'JPG, PNG, WebP, and most common image formats are supported. Results are downloaded as transparent PNG.' },
      },
      {
        '@type': 'Question',
        name: 'Can I replace the background with a custom color or image?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! After removing the background, you can replace it with a solid color, gradient, or your own custom image.' },
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
