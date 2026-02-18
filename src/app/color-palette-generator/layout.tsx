import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Color Palette Generator - Create Beautiful Color Schemes | SheruTools',
  description: 'Generate beautiful color palettes instantly. Random, analogous, complementary, triadic schemes. Export as CSS, Tailwind, PNG. Free online color palette maker.',
  keywords: ['color palette generator', 'color scheme generator free', 'random color palette', 'color picker', 'color harmony'],
  alternates: { canonical: 'https://sherutools.com/color-palette-generator' },
  openGraph: {
    title: 'Free Color Palette Generator - Create Beautiful Color Schemes | SheruTools',
    description: 'Generate beautiful color palettes instantly. Random, analogous, complementary, triadic schemes. Export as CSS, Tailwind, PNG. Free online color palette maker.',
    url: 'https://sherutools.com/color-palette-generator',
  }
};

const jsonLd = [
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Color Palette Generator',
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
      name: "How does the Color Palette Generator work?",
      acceptedAnswer: { '@type': 'Answer', text: "Generate harmonious color palettes using color theory algorithms. Choose from complementary, analogous, triadic, and other harmony rules, or let AI suggest palettes." },
    },
    {
      '@type': 'Question',
      name: "Can I export color palettes?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Export palettes in multiple formats including HEX, RGB, HSL, CSS variables, Tailwind config, and more." },
    },
    {
      '@type': 'Question',
      name: "Is this tool free to use?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, the Color Palette Generator is completely free with no sign-up required. Create and save unlimited palettes." },
    },
    {
      '@type': 'Question',
      name: "Can I save my color palettes?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, palettes are saved locally in your browser. You can also export them for use in your design tools." },
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
