import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Landing Page Generator - One Line to Full Page',
  description:
    'Generate beautiful landing pages from a single description. AI creates responsive, modern pages with hero, features, pricing, and more. Free, instant, no coding.',
  keywords: [
    'ai landing page generator',
    'landing page builder free',
    'ai website generator',
    'generate landing page',
    'one click landing page',
  ],
    twitter: {
    card: 'summary_large_image',
    title: 'Free AI Landing Page Generator - One Line to Full Page',
    description: 'Generate beautiful landing pages from a single description. AI creates responsive, modern pages with hero, features, pricing, and more.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/ai-landing-page' },
  openGraph: {
    title: 'Free AI Landing Page Generator - One Line to Full Page',
    description:
      'Generate beautiful landing pages from a single description. AI creates responsive, modern pages with hero, features, pricing, and more. Free, instant, no coding.',
    url: 'https://sherutools.com/ai-landing-page',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free AI Landing Page Generator', item: 'https://sherutools.com/ai-landing-page' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools AI Landing Page Generator',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Generate beautiful landing pages from a single description. AI creates responsive, modern pages with hero, features, pricing, and more.',
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "How does the AI Landing Page Generator work?",
      acceptedAnswer: { '@type': 'Answer', text: "Simply describe your product or service in one sentence. Our AI generates a complete, responsive landing page with hero section, features, pricing, testimonials, and more." },
    },
    {
      '@type': 'Question',
      name: "Is the generated landing page responsive?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! All generated landing pages are fully responsive and look great on desktop, tablet, and mobile devices." },
    },
    {
      '@type': 'Question',
      name: "Can I download the generated HTML?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, you can download the complete HTML file and host it anywhere, or copy the code directly to your clipboard." },
    },
    {
      '@type': 'Question',
      name: "How many landing pages can I generate for free?",
      acceptedAnswer: { '@type': 'Answer', text: "Free users can generate up to 3 landing pages per day. Upgrade to Pro for unlimited generations." },
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
