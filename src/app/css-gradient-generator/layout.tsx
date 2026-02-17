import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free CSS Gradient Generator - Create Beautiful Gradients | SheruTools',
  description: 'Create beautiful CSS gradients visually. Linear, radial, conic gradients with unlimited color stops. Copy CSS, Tailwind, or export as PNG.',
  keywords: ['css gradient generator', 'gradient maker', 'css gradient', 'tailwind gradient', 'gradient tool'],
  alternates: { canonical: 'https://sherutools.com/css-gradient-generator' },
  openGraph: {
    title: 'Free CSS Gradient Generator - Create Beautiful Gradients | SheruTools',
    description: 'Create beautiful CSS gradients visually. Linear, radial, conic gradients with unlimited color stops. Copy CSS, Tailwind, or export as PNG.',
    url: 'https://sherutools.com/css-gradient-generator',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools CSS Gradient Generator',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
