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
  }
};

const jsonLd = [
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Unit Converter',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What units can I convert?",
      acceptedAnswer: { '@type': 'Answer', text: "Convert between hundreds of units across categories including length, weight, temperature, volume, speed, time, data storage, and more." },
    },
    {
      '@type': 'Question',
      name: "Is the Unit Converter accurate?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, all conversions use precise mathematical formulas. Results are accurate to multiple decimal places." },
    },
    {
      '@type': 'Question',
      name: "Is this unit converter free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits or sign-up required." },
    },
    {
      '@type': 'Question',
      name: "Does it work offline?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Once loaded, the unit converter works entirely in your browser without needing an internet connection." },
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
