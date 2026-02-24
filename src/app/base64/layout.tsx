import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Base64 Encoder & Decoder Online',
  description: 'Encode and decode Base64 strings and files online. Support for text, images, and binary files. URL-safe Base64 option. Free, no sign-up.',
  keywords: ['base64 encoder', 'base64 decoder', 'encode base64 online', 'decode base64', 'base64 converter'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free Base64 Encoder & Decoder Online',
    description: 'Encode and decode Base64 strings and files online. Support for text, images, and binary files. URL-safe Base64 option. Free, no sign-up.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/base64' },
  openGraph: {
    title: 'Free Base64 Encoder & Decoder Online',
    description: 'Encode and decode Base64 strings and files online. Support for text, images, and binary files. URL-safe Base64 option. Free, no sign-up.',
    url: 'https://sherutools.com/base64',
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Base64 Encoder & Decoder Online', item: 'https://sherutools.com/base64' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Base64 Encoder & Decoder',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What is Base64 encoding?",
      acceptedAnswer: { '@type': 'Answer', text: "Base64 is a binary-to-text encoding scheme that converts binary data into ASCII characters. It is commonly used to embed images in HTML/CSS, transmit data in URLs, and encode email attachments." },
    },
    {
      '@type': 'Question',
      name: "Is this Base64 tool free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits. All encoding and decoding happens in your browser — no data is sent to any server." },
    },
    {
      '@type': 'Question',
      name: "Can I encode images to Base64?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! You can encode any text or file data to Base64 and decode Base64 strings back to their original form." },
    },
    {
      '@type': 'Question',
      name: "Is Base64 encoding secure?",
      acceptedAnswer: { '@type': 'Answer', text: "Base64 is an encoding scheme, not encryption. It should not be used for security purposes. Anyone can decode Base64 strings." },
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
