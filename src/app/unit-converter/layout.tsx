import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Unit Converter - Convert Any Unit Online | SheruTools',
  description: 'Convert between 100+ units instantly. Length, weight, temperature, volume, speed, data, and more. Free online unit converter.',
  keywords: ['unit converter', 'convert units online', 'length converter', 'temperature converter', 'unit conversion tool'],
  alternates: { canonical: 'https://sherutools.com/unit-converter' },
  openGraph: {
    title: 'Free Unit Converter - Convert Any Unit Online | SheruTools',
    description: 'Convert between 100+ units instantly. Length, weight, temperature, volume, speed, data, and more. Free online unit converter.',
    url: 'https://sherutools.com/unit-converter',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Unit Converter',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
