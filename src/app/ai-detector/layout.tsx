import type { Metadata } from 'next';

const title = 'AI Content Detector & Humanizer — Free AI Text Checker';
const description =
  'Detect if text is AI-generated with detailed analysis. Humanize AI content to bypass detectors. Free AI content detector with sentence-by-sentence highlighting.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['ai content detector', 'ai text detector', 'humanize ai text', 'ai detector free', 'ai content checker', 'chatgpt detector', 'ai writing detector'],
    twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/ai-detector' },
  openGraph: { title, description, url: 'https://sherutools.com/ai-detector',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }] },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Ai Detector', item: 'https://sherutools.com/ai-detector' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools AI Content Detector & Humanizer',
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
        name: 'How does the AI content detector work?',
        acceptedAnswer: { '@type': 'Answer', text: 'Our AI detector analyzes text for patterns common in AI-generated content, including perplexity (word predictability), burstiness (sentence length variation), vocabulary diversity, and known AI writing patterns. It provides a probability score and sentence-by-sentence analysis.' },
      },
      {
        '@type': 'Question',
        name: 'Can the AI humanizer bypass AI detectors?',
        acceptedAnswer: { '@type': 'Answer', text: 'The AI humanizer rewrites text to sound naturally human by varying sentence lengths, adding colloquialisms, removing AI clichés, and injecting personal voice. Results vary, but it significantly reduces AI detection scores.' },
      },
      {
        '@type': 'Question',
        name: 'Is the AI detector free to use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! You get 3 free analyses and 3 free humanizations per day with up to 500 words per request. Pro users get unlimited access with up to 5000 words.' },
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
