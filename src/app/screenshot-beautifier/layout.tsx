import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Code Screenshot Beautifier - Beautiful Code Images | SheruTools',
  description: 'Create beautiful code screenshots with custom backgrounds, themes, and window chrome. Export as PNG. Perfect for Twitter, blog posts, documentation.',
  keywords: ['code screenshot', 'code to image', 'beautiful code screenshot', 'carbon alternative', 'code image generator', 'code snippet image'],
  alternates: { canonical: 'https://sherutools.com/screenshot-beautifier' },
  openGraph: {
    title: 'Free Code Screenshot Beautifier - Beautiful Code Images | SheruTools',
    description: 'Create beautiful code screenshots with custom backgrounds, themes, and window chrome. Export as PNG. Perfect for Twitter, blog posts, documentation.',
    url: 'https://sherutools.com/screenshot-beautifier',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Screenshot Beautifier',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
