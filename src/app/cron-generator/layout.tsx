import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cron Expression Generator — Free Visual Cron Builder',
  description: 'Build cron expressions visually or parse existing ones. Real-time preview, next 10 execution times, presets, and cheat sheet. Free cron job generator tool.',
  keywords: ['cron expression generator', 'crontab guru', 'cron job generator', 'cron schedule builder', 'cron parser', 'crontab maker', 'cron syntax'],
  alternates: { canonical: 'https://sherutools.com/cron-generator' },
  openGraph: {
    title: 'Cron Expression Generator — Free Visual Cron Builder',
    description: 'Build cron expressions visually or parse existing ones. Real-time preview, next 10 execution times, presets, and cheat sheet.',
    url: 'https://sherutools.com/cron-generator',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Cron Generator', item: 'https://sherutools.com/cron-generator' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools Cron Expression Generator',
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
        name: 'What is a cron expression?',
        acceptedAnswer: { '@type': 'Answer', text: 'A cron expression is a string of 5 (or 6) fields separated by spaces that defines a schedule for recurring tasks. The fields represent minute, hour, day of month, month, and day of week.' },
      },
      {
        '@type': 'Question',
        name: 'What do the 5 fields in a cron expression mean?',
        acceptedAnswer: { '@type': 'Answer', text: 'The 5 fields are: Minute (0-59), Hour (0-23), Day of Month (1-31), Month (1-12), and Day of Week (0-6, where 0 is Sunday).' },
      },
      {
        '@type': 'Question',
        name: 'How do I schedule a cron job to run every 5 minutes?',
        acceptedAnswer: { '@type': 'Answer', text: 'Use the expression */5 * * * * — this means every 5th minute, every hour, every day.' },
      },
      {
        '@type': 'Question',
        name: 'Is this cron generator free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! The visual cron builder, expression parser, next execution times, and cheat sheet are all 100% free.' },
      },
      {
        '@type': 'Question',
        name: 'What is the difference between 5-field and 6-field cron?',
        acceptedAnswer: { '@type': 'Answer', text: 'Standard 5-field cron has minute, hour, day of month, month, and day of week. 6-field cron adds a seconds field at the beginning.' },
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
