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
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Color Palette Generator',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
