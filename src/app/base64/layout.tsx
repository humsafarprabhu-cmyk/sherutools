import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Base64 Encoder & Decoder Online | SheruTools',
  description: 'Encode and decode Base64 strings and files online. Support for text, images, and binary files. URL-safe Base64 option. Free, no sign-up.',
  keywords: ['base64 encoder', 'base64 decoder', 'encode base64 online', 'decode base64', 'base64 converter'],
  alternates: { canonical: 'https://sherutools.com/base64' },
  openGraph: {
    title: 'Free Base64 Encoder & Decoder Online | SheruTools',
    description: 'Encode and decode Base64 strings and files online. Support for text, images, and binary files. URL-safe Base64 option. Free, no sign-up.',
    url: 'https://sherutools.com/base64',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Base64 Encoder & Decoder',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
