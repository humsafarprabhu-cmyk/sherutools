import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Text Compare Tool - Diff Checker Online',
  description: 'Compare two texts side-by-side with real-time diff highlighting. Find differences instantly. Free online diff checker with line-by-line and word-by-word comparison.',
  keywords: ['text compare online', 'diff checker', 'compare two texts', 'text diff tool', 'online diff'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free Text Compare Tool - Diff Checker Online',
    description: 'Compare two texts side-by-side with real-time diff highlighting. Find differences instantly.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/text-compare' },
  openGraph: {
    title: 'Free Text Compare Tool - Diff Checker Online',
    description: 'Compare two texts side-by-side with real-time diff highlighting. Find differences instantly. Free online diff checker with line-by-line and word-by-word comparison.',
    url: 'https://sherutools.com/text-compare',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Text Compare Tool', item: 'https://sherutools.com/text-compare' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Text Compare',
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
      name: "How does the Text Compare tool work?",
      acceptedAnswer: { '@type': 'Answer', text: "Paste two texts side by side and instantly see differences highlighted. Additions, deletions, and changes are color-coded for easy comparison." },
    },
    {
      '@type': 'Question',
      name: "Can I compare code files?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! The tool works great for comparing code, documents, or any text content with syntax-aware diff highlighting." },
    },
    {
      '@type': 'Question',
      name: "Is the Text Compare tool free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits. Compare unlimited texts with no sign-up required." },
    },
    {
      '@type': 'Question',
      name: "Is my text data stored anywhere?",
      acceptedAnswer: { '@type': 'Answer', text: "No, all comparison happens locally in your browser. Your text is never sent to any server." },
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
