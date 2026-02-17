import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Regex Tester - Test Regular Expressions Online | SheruTools',
  description: 'Test and debug regular expressions in real-time. Match highlighting, capture groups, replace mode. Common patterns library and cheat sheet included.',
  keywords: ['regex tester', 'regex online', 'test regular expression', 'regex debugger', 'regex match'],
  alternates: { canonical: 'https://sherutools.com/regex-tester' },
  openGraph: {
    title: 'Free Regex Tester - Test Regular Expressions Online | SheruTools',
    description: 'Test and debug regular expressions in real-time. Match highlighting, capture groups, replace mode. Common patterns library and cheat sheet included.',
    url: 'https://sherutools.com/regex-tester',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Regex Tester',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
