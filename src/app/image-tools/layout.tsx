import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Compressor & Resizer - Compress Images Online | SheruTools',
  description: 'Compress, resize, and convert images free online. Reduce file size up to 90% without quality loss. Social media presets included. No upload to server.',
  keywords: ['compress image online free', 'resize image online', 'image compressor', 'reduce image size', 'image resizer', 'convert png to jpg'],
  alternates: { canonical: 'https://sherutools.com/image-tools' },
  openGraph: {
    title: 'Free Image Compressor & Resizer - Compress Images Online | SheruTools',
    description: 'Compress, resize, and convert images free online. Reduce file size up to 90% without quality loss. Social media presets included. No upload to server.',
    url: 'https://sherutools.com/image-tools',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Image Compressor & Resizer',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
