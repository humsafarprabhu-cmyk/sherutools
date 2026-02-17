import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Markdown Editor - Live Preview & Export | SheruTools',
  description: 'Write and preview Markdown in real-time. Formatting toolbar, syntax highlighting, export to HTML and MD files. Free online markdown editor.',
  keywords: ['markdown editor online', 'markdown preview', 'free markdown editor', 'markdown to html'],
  alternates: { canonical: 'https://sherutools.com/markdown-editor' },
  openGraph: {
    title: 'Free Markdown Editor - Live Preview & Export | SheruTools',
    description: 'Write and preview Markdown in real-time. Formatting toolbar, syntax highlighting, export to HTML and MD files. Free online markdown editor.',
    url: 'https://sherutools.com/markdown-editor',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Markdown Editor',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
