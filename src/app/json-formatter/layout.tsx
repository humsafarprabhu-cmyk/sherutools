import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free JSON Formatter & Validator Online | SheruTools',
  description: 'Format, beautify, minify, and validate JSON online. Syntax highlighting, tree view, error detection. Free JSON formatter tool.',
  keywords: ['json formatter', 'json validator', 'json beautifier', 'format json online', 'json viewer'],
  alternates: { canonical: 'https://sherutools.com/json-formatter' },
  openGraph: {
    title: 'Free JSON Formatter & Validator Online | SheruTools',
    description: 'Format, beautify, minify, and validate JSON online. Syntax highlighting, tree view, error detection. Free JSON formatter tool.',
    url: 'https://sherutools.com/json-formatter',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools JSON Formatter & Validator',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
