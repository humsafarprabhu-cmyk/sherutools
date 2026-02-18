import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Password Generator - Strong Random Passwords | SheruTools',
  description: 'Generate strong, secure passwords instantly. Random, passphrase, and pronounceable modes. Uses Web Crypto API for true randomness. Free, no sign-up.',
  keywords: ['password generator', 'strong password generator', 'random password', 'secure password generator online free'],
  alternates: { canonical: 'https://sherutools.com/password-generator' },
  openGraph: {
    title: 'Free Password Generator - Strong Random Passwords | SheruTools',
    description: 'Generate strong, secure passwords instantly. Random, passphrase, and pronounceable modes. Uses Web Crypto API for true randomness. Free, no sign-up.',
    url: 'https://sherutools.com/password-generator',
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Password Generator', item: 'https://sherutools.com/password-generator' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Password Generator',
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
      name: "How secure are the generated passwords?",
      acceptedAnswer: { '@type': 'Answer', text: "Passwords are generated using cryptographically secure random number generation in your browser. They never leave your device." },
    },
    {
      '@type': 'Question',
      name: "Can I customize password requirements?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Set length, include/exclude uppercase, lowercase, numbers, and special characters. Set minimum requirements for each." },
    },
    {
      '@type': 'Question',
      name: "Is this password generator free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits. Generate as many passwords as you need." },
    },
    {
      '@type': 'Question',
      name: "Are my passwords stored anywhere?",
      acceptedAnswer: { '@type': 'Answer', text: "No! Passwords are generated locally in your browser and never sent to any server." },
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
