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
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Password Generator',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
