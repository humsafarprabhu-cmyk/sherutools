import type { Metadata } from 'next';

const faq = [
  {
    '@type': 'Question' as const,
    name: 'What is a cron expression?',
    acceptedAnswer: { '@type': 'Answer' as const, text: 'A cron expression is a string of 5 (or 6) fields separated by spaces that defines a schedule for recurring tasks. The fields represent minute, hour, day of month, month, and day of week. Systems like crontab on Linux use these expressions to automate jobs.' },
  },
  {
    '@type': 'Question' as const,
    name: 'What do the 5 fields in a cron expression mean?',
    acceptedAnswer: { '@type': 'Answer' as const, text: 'The 5 fields are: Minute (0-59), Hour (0-23), Day of Month (1-31), Month (1-12), and Day of Week (0-6, where 0 is Sunday). Each field can use values, ranges (1-5), lists (1,3,5), steps (*/5), or wildcards (*).' },
  },
  {
    '@type': 'Question' as const,
    name: 'How do I schedule a cron job to run every 5 minutes?',
    acceptedAnswer: { '@type': 'Answer' as const, text: 'Use the expression */5 * * * * — this means every 5th minute, every hour, every day.' },
  },
  {
    '@type': 'Question' as const,
    name: 'Is this cron generator free?',
    acceptedAnswer: { '@type': 'Answer' as const, text: 'Yes! The visual cron builder, expression parser, next execution times, and cheat sheet are all 100% free. Pro features like seconds support, iCal export, and saved expression library are available for a one-time $2.99 upgrade.' },
  },
  {
    '@type': 'Question' as const,
    name: 'What is the difference between 5-field and 6-field cron?',
    acceptedAnswer: { '@type': 'Answer' as const, text: 'Standard 5-field cron has minute, hour, day of month, month, and day of week. 6-field cron adds a seconds field at the beginning, allowing scheduling with second-level precision. This is used by tools like Quartz Scheduler and Spring.' },
  },
];

export const metadata: Metadata = {
  title: 'Cron Expression Generator — Free Visual Cron Builder | SheruTools',
  description: 'Build cron expressions visually or parse existing ones. Real-time preview, next 10 execution times, presets, and cheat sheet. Free cron job generator tool.',
  keywords: ['cron expression generator', 'crontab guru', 'cron job generator', 'cron schedule builder', 'cron parser', 'crontab maker', 'cron syntax'],
  alternates: { canonical: 'https://sherutools.com/cron-generator' },
  openGraph: {
    title: 'Cron Expression Generator — Free Visual Cron Builder | SheruTools',
    description: 'Build cron expressions visually or parse existing ones. Real-time preview, next 10 execution times, presets, and cheat sheet.',
    url: 'https://sherutools.com/cron-generator',
  },
  other: {
    'application/ld+json': JSON.stringify([
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
        mainEntity: faq,
      },
    ]),
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
