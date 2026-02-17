import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Word Counter - Character Counter Online | SheruTools',
  description: 'Count words, characters, sentences, and paragraphs instantly. Reading time, speaking time, readability scores, keyword density. Free online word counter.',
  keywords: ['word counter', 'character counter', 'word count online', 'character count', 'reading time calculator', 'readability score', 'keyword density'],
  alternates: { canonical: 'https://sherutools.com/word-counter' },
  openGraph: {
    title: 'Free Word Counter - Character Counter Online | SheruTools',
    description: 'Count words, characters, sentences, and paragraphs instantly. Reading time, speaking time, readability scores, keyword density. Free online word counter.',
    url: 'https://sherutools.com/word-counter',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Word Counter',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
