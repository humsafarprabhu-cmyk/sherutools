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
  }
};

const jsonLd = [
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Emoji Picker',
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
      name: "How do I copy emojis?",
      acceptedAnswer: { '@type': 'Answer', text: "Simply click on any emoji to copy it to your clipboard. You can then paste it anywhere — social media, documents, messages, or code." },
    },
    {
      '@type': 'Question',
      name: "Can I search for specific emojis?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Use the search bar to find emojis by name or keyword. Browse by category or search for exactly what you need." },
    },
    {
      '@type': 'Question',
      name: "Is this emoji picker free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits. Browse and copy thousands of emojis with no sign-up required." },
    },
    {
      '@type': 'Question',
      name: "Are these emojis compatible with all platforms?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, these are standard Unicode emojis that work on all modern platforms including iOS, Android, Windows, macOS, and web browsers." },
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
