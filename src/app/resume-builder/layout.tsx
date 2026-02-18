import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Resume Builder — Create Professional Resumes Online',
  description: 'Build a professional resume in minutes. 3 beautiful templates, real-time preview, instant PDF download. Free online resume maker — no sign-up required.',
  keywords: ['free resume builder', 'online resume maker', 'resume generator free', 'professional resume', 'resume templates'],
  alternates: { canonical: 'https://sherutools.com/resume-builder' },
  openGraph: {
    title: 'Free Resume Builder',
    description: 'Build a professional resume in minutes. 3 beautiful templates, real-time preview, instant PDF download.',
    url: 'https://sherutools.com/resume-builder',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Resume Builder', item: 'https://sherutools.com/resume-builder' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools Resume Builder',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Build professional resumes with real-time preview and instant PDF download. Free, no sign-up.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this resume builder free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! Build and download professional PDF resumes completely free with 3 beautiful templates.' },
      },
      {
        '@type': 'Question',
        name: 'Do I need to sign up?',
        acceptedAnswer: { '@type': 'Answer', text: 'No sign-up required. Start building your resume immediately and download as PDF.' },
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
