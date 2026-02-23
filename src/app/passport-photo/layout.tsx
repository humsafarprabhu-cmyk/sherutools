import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Passport Photo Maker — Free Online Passport Photo Generator',
  description: 'Create passport photos online for free. Supports US, India, UK, EU, Canada, Australia, China & Japan standards. Auto-crop, white background, 300 DPI. 100% browser-based.',
  keywords: ['passport photo maker online free', 'passport photo generator', '2x2 photo maker', 'passport photo online', 'visa photo maker', 'passport size photo', 'ID photo maker'],
    twitter: {
    card: 'summary_large_image',
    title: 'AI Passport Photo Maker — Free Online Passport Photo Generator',
    description: 'Create passport photos online for free. Supports US, India, UK, EU, Canada, Australia, China & Japan standards. Auto-crop, white background, 300 DPI. 100% brows',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/passport-photo' },
  openGraph: {
    title: 'AI Passport Photo Maker — Free Online Passport Photo Generator',
    description: 'Create passport-compliant photos instantly. Auto-crop, white background, correct dimensions for 8+ countries. Free & private.',
    url: 'https://sherutools.com/passport-photo',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Passport Photo', item: 'https://sherutools.com/passport-photo' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools AI Passport Photo Maker',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Create passport-compliant photos for 8+ countries. Auto-crop, background replacement, 300 DPI output.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this passport photo maker free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! You can create up to 2 passport photos per day for free. Pro users get unlimited access, HD quality, and print layouts.' },
      },
      {
        '@type': 'Question',
        name: 'What countries are supported?',
        acceptedAnswer: { '@type': 'Answer', text: 'We support US, India, UK, EU/Schengen, Canada, Australia, China, and Japan passport photo standards with correct dimensions and DPI.' },
      },
      {
        '@type': 'Question',
        name: 'Are my photos uploaded to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens in your browser using Canvas API. Your photos never leave your device.' },
      },
      {
        '@type': 'Question',
        name: 'What is the correct size for a US passport photo?',
        acceptedAnswer: { '@type': 'Answer', text: 'US passport photos must be 2x2 inches (51x51mm / 600x600 pixels at 300 DPI) with a white background.' },
      },
      {
        '@type': 'Question',
        name: 'Can I print passport photos at home?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! Pro users can generate a 4x6 inch print layout with multiple passport photos arranged for home printing.' },
      },
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
