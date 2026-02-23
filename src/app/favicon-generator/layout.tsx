import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Favicon Generator — Create Beautiful Favicons Free',
  description: 'Generate stunning favicons from text, emoji, or initials. Download favicon pack with ICO, PNG, Apple Touch Icon, and Android Chrome icons. 100% free, runs in your browser.',
  keywords: ['favicon generator', 'favicon maker', 'favicon creator online', 'ico generator', 'favicon from text', 'emoji favicon', 'favicon pack generator'],
    twitter: {
    card: 'summary_large_image',
    title: 'AI Favicon Generator — Create Beautiful Favicons Free',
    description: 'Generate stunning favicons from text, emoji, or initials. Download favicon pack with ICO, PNG, Apple Touch Icon, and Android Chrome icons. 100% free, runs in yo',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/favicon-generator' },
  openGraph: {
    title: 'AI Favicon Generator — Create Beautiful Favicons Free',
    description: 'Generate stunning favicons from text, emoji, or initials. Download complete favicon pack. 100% free, client-side.',
    url: 'https://sherutools.com/favicon-generator',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Favicon Generator', item: 'https://sherutools.com/favicon-generator' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools Favicon Generator',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a favicon?',
        acceptedAnswer: { '@type': 'Answer', text: 'A favicon is a small icon displayed in the browser tab, bookmarks, and address bar. It helps users identify your website quickly.' },
      },
      {
        '@type': 'Question',
        name: 'What sizes do I need for a favicon?',
        acceptedAnswer: { '@type': 'Answer', text: 'You typically need 16x16, 32x32 (standard), 180x180 (Apple Touch Icon), and 192x192 / 512x512 (Android Chrome). Our generator creates all sizes automatically.' },
      },
      {
        '@type': 'Question',
        name: 'Can I create a favicon from an emoji?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! Simply type or paste any emoji and our generator will render it as a favicon in all required sizes.' },
      },
      {
        '@type': 'Question',
        name: 'Is this favicon generator free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, basic favicon generation is completely free. Pro features like ICO format, ZIP pack, and webmanifest are available for a one-time payment.' },
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
