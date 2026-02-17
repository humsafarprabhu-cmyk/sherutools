import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Landing Page Generator - One Line to Full Page | SheruTools',
  description:
    'Generate beautiful landing pages from a single description. AI creates responsive, modern pages with hero, features, pricing, and more. Free, instant, no coding.',
  keywords: [
    'ai landing page generator',
    'landing page builder free',
    'ai website generator',
    'generate landing page',
    'one click landing page',
  ],
  alternates: { canonical: 'https://sherutools.com/ai-landing-page' },
  openGraph: {
    title: 'Free AI Landing Page Generator - One Line to Full Page | SheruTools',
    description:
      'Generate beautiful landing pages from a single description. AI creates responsive, modern pages with hero, features, pricing, and more. Free, instant, no coding.',
    url: 'https://sherutools.com/ai-landing-page',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools AI Landing Page Generator',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Generate beautiful landing pages from a single description. AI creates responsive, modern pages with hero, features, pricing, and more.',
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
