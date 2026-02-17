import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Content Rewriter & Paraphraser | SheruTools',
  description:
    'Rewrite and paraphrase any text with AI. Simplify, formalize, expand, summarize, or make creative. Free online AI rewriter tool.',
  keywords: ['ai rewriter', 'paraphrase tool', 'content rewriter', 'ai paraphraser free', 'rewrite text online'],
  alternates: { canonical: 'https://sherutools.com/ai-rewriter' },
  openGraph: {
    title: 'Free AI Content Rewriter & Paraphraser | SheruTools',
    description:
      'Rewrite and paraphrase any text with AI. Simplify, formalize, expand, summarize, or make creative. Free online AI rewriter tool.',
    url: 'https://sherutools.com/ai-rewriter',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools AI Content Rewriter',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Rewrite and paraphrase any text with AI. Simplify, formalize, expand, summarize, or make creative.',
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
