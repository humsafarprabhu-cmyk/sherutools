import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free JSON Formatter & Validator Online | SheruTools',
  description: 'Format, beautify, minify, and validate JSON online. Syntax highlighting, tree view, error detection. Free JSON formatter tool.',
  keywords: ['json formatter', 'json validator', 'json beautifier', 'format json online', 'json viewer'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free JSON Formatter & Validator Online | SheruTools',
    description: 'Format, beautify, minify, and validate JSON online. Syntax highlighting, tree view, error detection. Free JSON formatter tool.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/json-formatter' },
  openGraph: {
    title: 'Free JSON Formatter & Validator Online | SheruTools',
    description: 'Format, beautify, minify, and validate JSON online. Syntax highlighting, tree view, error detection. Free JSON formatter tool.',
    url: 'https://sherutools.com/json-formatter',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free JSON Formatter & Validator Online', item: 'https://sherutools.com/json-formatter' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools JSON Formatter & Validator',
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
      name: "What does the JSON Formatter do?",
      acceptedAnswer: { '@type': 'Answer', text: "Format, validate, and beautify JSON data. Detect syntax errors, minify JSON, and view it in a tree structure." },
    },
    {
      '@type': 'Question',
      name: "Can I validate JSON online?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Paste your JSON and instantly see if it is valid. Errors are highlighted with line numbers and descriptions." },
    },
    {
      '@type': 'Question',
      name: "Is this JSON tool free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with no limits. Format, validate, and minify JSON with no sign-up required." },
    },
    {
      '@type': 'Question',
      name: "Can I minify JSON?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, switch between beautified and minified views with one click. Copy the result to your clipboard." },
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
