import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Compressor & Resizer - Compress Images Online | SheruTools',
  description: 'Compress, resize, and convert images free online. Reduce file size up to 90% without quality loss. Social media presets included. No upload to server.',
  keywords: ['compress image online free', 'resize image online', 'image compressor', 'reduce image size', 'image resizer', 'convert png to jpg'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free Image Compressor & Resizer - Compress Images Online | SheruTools',
    description: 'Compress, resize, and convert images free online. Reduce file size up to 90% without quality loss. Social media presets included. No upload to server.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/image-tools' },
  openGraph: {
    title: 'Free Image Compressor & Resizer - Compress Images Online | SheruTools',
    description: 'Compress, resize, and convert images free online. Reduce file size up to 90% without quality loss. Social media presets included. No upload to server.',
    url: 'https://sherutools.com/image-tools',
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Image Compressor & Resizer', item: 'https://sherutools.com/image-tools' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Image Compressor & Resizer',
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
      name: "What image editing tools are available?",
      acceptedAnswer: { '@type': 'Answer', text: "Resize, crop, rotate, compress, add watermarks, adjust brightness/contrast, apply filters, and more — all in your browser." },
    },
    {
      '@type': 'Question',
      name: "Are my images uploaded to a server?",
      acceptedAnswer: { '@type': 'Answer', text: "No! All image processing happens locally in your browser. Your images never leave your device." },
    },
    {
      '@type': 'Question',
      name: "What image formats are supported?",
      acceptedAnswer: { '@type': 'Answer', text: "Support for PNG, JPG, WebP, GIF, BMP, and more. Convert between formats while editing." },
    },
    {
      '@type': 'Question',
      name: "Is there a limit on image size?",
      acceptedAnswer: { '@type': 'Answer', text: "Processing happens in your browser, so limits depend on your device. Most devices handle images up to 50MB without issues." },
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
