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
  }
};

const jsonLd = [
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Regex Tester',
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
      name: "What regex flavors are supported?",
      acceptedAnswer: { '@type': 'Answer', text: "The tool supports JavaScript regex syntax with all standard flags (g, i, m, s, u, y)." },
    },
    {
      '@type': 'Question',
      name: "Can I test regex patterns in real-time?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Matches are highlighted in real-time as you type your pattern. See match groups, captures, and positions." },
    },
    {
      '@type': 'Question',
      name: "Is this regex tester free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits. Test unlimited patterns with no sign-up required." },
    },
    {
      '@type': 'Question',
      name: "Does it explain regex patterns?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, the tool provides a breakdown of your regex pattern explaining each part in plain language." },
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
