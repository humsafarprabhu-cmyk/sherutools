import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Code Explainer - Understand Any Code | SheruTools',
  description:
    'Paste any code and get instant AI-powered explanations. Line-by-line breakdown, key concepts, and potential issues. Supports 15+ languages.',
  keywords: ['ai code explainer', 'explain code', 'code explanation tool', 'understand code ai', 'code explainer free'],
  alternates: { canonical: 'https://sherutools.com/ai-code-explainer' },
  openGraph: {
    title: 'Free AI Code Explainer - Understand Any Code | SheruTools',
    description:
      'Paste any code and get instant AI-powered explanations. Line-by-line breakdown, key concepts, and potential issues. Supports 15+ languages.',
    url: 'https://sherutools.com/ai-code-explainer',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools AI Code Explainer',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Paste any code and get instant AI-powered explanations. Line-by-line breakdown, key concepts, and potential issues.',
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
