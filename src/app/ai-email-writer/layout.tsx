import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Email Writer - Generate Professional Emails | SheruTools',
  description:
    'Write professional emails instantly with AI. Choose purpose, tone, and key points. Generate perfect emails in seconds. Free, no sign-up required.',
  keywords: ['ai email writer', 'ai email generator', 'write email with ai', 'professional email writer free'],
  alternates: { canonical: 'https://sherutools.com/ai-email-writer' },
  openGraph: {
    title: 'Free AI Email Writer - Generate Professional Emails | SheruTools',
    description:
      'Write professional emails instantly with AI. Choose purpose, tone, and key points. Generate perfect emails in seconds. Free, no sign-up required.',
    url: 'https://sherutools.com/ai-email-writer',
  },
  other: {
    'application/ld+json': JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools AI Email Writer',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
