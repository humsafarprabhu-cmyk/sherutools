import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Invoice Generator — Create & Download PDF Invoices',
  description: 'Create professional invoices for free. 3 beautiful templates, live preview, instant PDF download. No sign-up required.',
  alternates: { canonical: 'https://sherutools.com/invoice-generator' },
  openGraph: {
    title: 'Free Invoice Generator',
    description: 'Create professional invoices for free with live preview and instant PDF download.',
    url: 'https://sherutools.com/invoice-generator',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Invoice Generator', item: 'https://sherutools.com/invoice-generator' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools Invoice Generator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Create professional invoices with live preview and instant PDF download. Free, no sign-up.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this invoice generator free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! Create and download professional PDF invoices completely free. No sign-up required.' },
      },
      {
        '@type': 'Question',
        name: 'Can I customize invoice templates?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, choose from 3 beautiful templates with live preview. Add your logo, company details, and line items.' },
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
