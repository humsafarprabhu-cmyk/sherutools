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
  }
};

const jsonLd = [
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Screenshot Beautifier',
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
      name: "What does the Screenshot Beautifier do?",
      acceptedAnswer: { '@type': 'Answer', text: "Transform plain screenshots into beautiful, social-media-ready images with backgrounds, shadows, borders, and device mockups." },
    },
    {
      '@type': 'Question',
      name: "Can I add device mockups?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Wrap your screenshot in browser windows, phone frames, or other device mockups for professional presentations." },
    },
    {
      '@type': 'Question',
      name: "Is this tool free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with all features. No watermarks or sign-up required." },
    },
    {
      '@type': 'Question',
      name: "What export formats are supported?",
      acceptedAnswer: { '@type': 'Answer', text: "Export your beautified screenshots as PNG or JPG in custom resolutions." },
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
