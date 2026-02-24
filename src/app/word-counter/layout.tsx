import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Word Counter - Character Counter Online',
  description: 'Count words, characters, sentences, and paragraphs instantly. Reading time, speaking time, readability scores, keyword density. Free online word counter.',
  keywords: ['word counter', 'character counter', 'word count online', 'character count', 'reading time calculator', 'readability score', 'keyword density'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free Word Counter - Character Counter Online',
    description: 'Count words, characters, sentences, and paragraphs instantly. Reading time, speaking time, readability scores, keyword density. Free online word counter.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/word-counter' },
  openGraph: {
    title: 'Free Word Counter - Character Counter Online',
    description: 'Count words, characters, sentences, and paragraphs instantly. Reading time, speaking time, readability scores, keyword density. Free online word counter.',
    url: 'https://sherutools.com/word-counter',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Word Counter', item: 'https://sherutools.com/word-counter' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Word Counter',
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
      name: "What does the Word Counter tool measure?",
      acceptedAnswer: { '@type': 'Answer', text: "Count words, characters, sentences, paragraphs, and estimate reading time. Also provides readability scores and keyword density analysis." },
    },
    {
      '@type': 'Question',
      name: "Is the Word Counter free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits. Count words in any text with no sign-up required." },
    },
    {
      '@type': 'Question',
      name: "Can I check reading time?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! The tool estimates reading time based on average reading speed (225 words per minute) for your text." },
    },
    {
      '@type': 'Question',
      name: "Does it work with any language?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, the word counter works with text in any language that uses space-separated words." },
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
