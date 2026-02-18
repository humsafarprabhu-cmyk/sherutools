import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image File Converter — PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, ICO | SheruTools',
  description: 'Convert images between PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, and ICO formats instantly. Free, no upload to server, 100% client-side. Batch conversion & quality control.',
  keywords: ['image converter', 'file converter', 'png to jpg', 'webp to png', 'heic to jpg', 'avif to png', 'convert image online free', 'batch image converter'],
  alternates: { canonical: 'https://sherutools.com/file-converter' },
  openGraph: {
    title: 'Free Image File Converter — PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, ICO | SheruTools',
    description: 'Convert images between PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, and ICO formats instantly. Free, no upload to server.',
    url: 'https://sherutools.com/file-converter',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Universal File Converter',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
