import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emoji Picker & Search - Copy Emojis Instantly | SheruTools',
  description: 'Search, browse, and copy emojis instantly. All categories, skin tones, recently used. Copy as emoji, HTML entity, or Unicode.',
  keywords: ['emoji picker', 'emoji search', 'copy emoji', 'emoji keyboard online', 'emoji copy paste'],
  alternates: { canonical: 'https://sherutools.com/emoji-picker' },
  openGraph: {
    title: 'Emoji Picker & Search - Copy Emojis Instantly | SheruTools',
    description: 'Search, browse, and copy emojis instantly. All categories, skin tones, recently used. Copy as emoji, HTML entity, or Unicode.',
    url: 'https://sherutools.com/emoji-picker',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Emoji Picker',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
