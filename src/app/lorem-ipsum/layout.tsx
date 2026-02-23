import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Lorem Ipsum Generator - Placeholder Text | SheruTools',
  description: 'Generate lorem ipsum placeholder text instantly. Multiple variants: classic, hipster, office, tech. Paragraphs, sentences, words, or lists.',
  keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text generator', 'lorem ipsum'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free Lorem Ipsum Generator - Placeholder Text | SheruTools',
    description: 'Generate lorem ipsum placeholder text instantly. Multiple variants: classic, hipster, office, tech. Paragraphs, sentences, words, or lists.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/lorem-ipsum' },
  openGraph: {
    title: 'Free Lorem Ipsum Generator - Placeholder Text | SheruTools',
    description: 'Generate lorem ipsum placeholder text instantly. Multiple variants: classic, hipster, office, tech. Paragraphs, sentences, words, or lists.',
    url: 'https://sherutools.com/lorem-ipsum',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Lorem Ipsum Generator', item: 'https://sherutools.com/lorem-ipsum' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Lorem Ipsum Generator',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What is Lorem Ipsum?",
      acceptedAnswer: { '@type': 'Answer', text: "Lorem Ipsum is placeholder text used in design and development to fill layouts before final content is ready. It helps visualize how text will look without distracting with real content." },
    },
    {
      '@type': 'Question',
      name: "Can I generate different amounts of text?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Generate paragraphs, sentences, or words in any quantity you need." },
    },
    {
      '@type': 'Question',
      name: "Is this Lorem Ipsum generator free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits or sign-up required." },
    },
    {
      '@type': 'Question',
      name: "Can I copy the generated text?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, copy generated Lorem Ipsum text to your clipboard with one click." },
    }
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
