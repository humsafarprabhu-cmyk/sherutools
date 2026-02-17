import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free QR Code Generator - Create Custom QR Codes Online | SheruTools',
  description: 'Generate QR codes for URLs, WiFi, vCards, email and more. Customize colors, add logos, download as PNG or SVG. Free online QR code maker.',
  alternates: { canonical: 'https://sherutools.com/qr-code-generator' },
  openGraph: {
    title: 'Free QR Code Generator - Create Custom QR Codes Online | SheruTools',
    description: 'Generate QR codes for URLs, WiFi, vCards, email and more. Customize colors, add logos, download as PNG or SVG. Free online QR code maker.',
    url: 'https://sherutools.com/qr-code-generator',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools QR Code Generator',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
