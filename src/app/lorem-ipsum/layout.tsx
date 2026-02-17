import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Lorem Ipsum Generator - Placeholder Text | SheruTools',
  description: 'Generate lorem ipsum placeholder text instantly. Multiple variants: classic, hipster, office, tech. Paragraphs, sentences, words, or lists.',
  keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text generator', 'lorem ipsum'],
  alternates: { canonical: 'https://sherutools.com/lorem-ipsum' },
  openGraph: {
    title: 'Free Lorem Ipsum Generator - Placeholder Text | SheruTools',
    description: 'Generate lorem ipsum placeholder text instantly. Multiple variants: classic, hipster, office, tech. Paragraphs, sentences, words, or lists.',
    url: 'https://sherutools.com/lorem-ipsum',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Lorem Ipsum Generator',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
