import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image File Converter — PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, ICO',
  description: 'Convert images between PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, and ICO formats instantly. Free, no upload to server, 100% client-side. Batch conversion & quality control.',
  keywords: ['image converter', 'file converter', 'png to jpg', 'webp to png', 'heic to jpg', 'avif to png', 'convert image online free', 'batch image converter'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free Image File Converter — PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, ICO',
    description: 'Convert images between PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, and ICO formats instantly. Free, no upload to server, 100% client-side. Batch conversion & quality ',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/file-converter' },
  openGraph: {
    title: 'Free Image File Converter — PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, ICO',
    description: 'Convert images between PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, and ICO formats instantly. Free, no upload to server.',
    url: 'https://sherutools.com/file-converter',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'File Converter', item: 'https://sherutools.com/file-converter' },
    ],
  },
  {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SheruTools Universal File Converter',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
},
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What file formats are supported?",
      acceptedAnswer: { '@type': 'Answer', text: "Convert between PNG, JPG, WebP, AVIF, HEIC, BMP, GIF, and ICO formats. All conversions happen client-side in your browser." },
    },
    {
      '@type': 'Question',
      name: "Is file conversion done on a server?",
      acceptedAnswer: { '@type': 'Answer', text: "No! All conversions happen 100% in your browser. Your files never leave your device, ensuring complete privacy." },
    },
    {
      '@type': 'Question',
      name: "Can I convert multiple files at once?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Batch conversion is supported. Upload multiple images and convert them all at once to your desired format." },
    },
    {
      '@type': 'Question',
      name: "Is there a file size limit?",
      acceptedAnswer: { '@type': 'Answer', text: "Since conversions happen in your browser, the limit depends on your device memory. Most devices handle files up to 50MB easily." },
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
