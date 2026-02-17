import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Text Compare Tool - Diff Checker Online | SheruTools',
  description: 'Compare two texts side-by-side with real-time diff highlighting. Find differences instantly. Free online diff checker with line-by-line and word-by-word comparison.',
  keywords: ['text compare online', 'diff checker', 'compare two texts', 'text diff tool', 'online diff'],
  alternates: { canonical: 'https://sherutools.com/text-compare' },
  openGraph: {
    title: 'Free Text Compare Tool - Diff Checker Online | SheruTools',
    description: 'Compare two texts side-by-side with real-time diff highlighting. Find differences instantly. Free online diff checker with line-by-line and word-by-word comparison.',
    url: 'https://sherutools.com/text-compare',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Text Compare',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
