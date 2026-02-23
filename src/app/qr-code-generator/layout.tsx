import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free QR Code Generator - Create Custom QR Codes Online | SheruTools',
  description: 'Generate QR codes for URLs, WiFi, vCards, email and more. Customize colors, add logos, download as PNG or SVG. Free online QR code maker.',
    twitter: {
    card: 'summary_large_image',
    title: 'Free QR Code Generator - Create Custom QR Codes Online | SheruTools',
    description: 'Generate QR codes for URLs, WiFi, vCards, email and more. Customize colors, add logos, download as PNG or SVG. Free online QR code maker.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/qr-code-generator' },
  openGraph: {
    title: 'Free QR Code Generator - Create Custom QR Codes Online | SheruTools',
    description: 'Generate QR codes for URLs, WiFi, vCards, email and more. Customize colors, add logos, download as PNG or SVG. Free online QR code maker.',
    url: 'https://sherutools.com/qr-code-generator',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free QR Code Generator', item: 'https://sherutools.com/qr-code-generator' },
    ],
  },
  {
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
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What types of QR codes can I generate?",
      acceptedAnswer: { '@type': 'Answer', text: "Generate QR codes for URLs, text, WiFi credentials, vCards, email, phone numbers, and more." },
    },
    {
      '@type': 'Question',
      name: "Can I customize QR code colors and style?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Change foreground/background colors, add logos, adjust error correction level, and customize the style." },
    },
    {
      '@type': 'Question',
      name: "Can I download QR codes as images?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, download QR codes as PNG or SVG files in high resolution, ready for print or digital use." },
    },
    {
      '@type': 'Question',
      name: "Is this QR code generator free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with all features. No sign-up or watermarks." },
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
