import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Pomodoro Timer — Focus Timer Online',
  description: 'Stay focused with the Pomodoro technique. 25-minute work sessions, customizable timers, browser notifications, daily stats tracking.',
  keywords: ['pomodoro timer', 'focus timer', 'pomodoro online', 'study timer', 'productivity timer'],
  openGraph: {
    title: 'Free Pomodoro Timer — Focus Timer Online',
    description: 'Stay focused with the Pomodoro technique. 25-minute work sessions, customizable timers, browser notifications.',
    url: 'https://sherutools.com/pomodoro',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Pomodoro Timer — Focus Timer Online',
    description: 'Stay focused with the Pomodoro technique. 25-minute work sessions, customizable timers, browser notifications.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/pomodoro' },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Pomodoro Timer — Focus Timer Online',
    description: 'Stay focused with the Pomodoro technique. 25-minute work sessions, customizable timers, browser notifications, daily stats tracking.',
    images: ['/opengraph-image'],
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Pomodoro', item: 'https://sherutools.com/pomodoro' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools Pomodoro Timer',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Stay focused with the Pomodoro technique. Customizable timers, browser notifications, daily stats.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the Pomodoro Technique?',
        acceptedAnswer: { '@type': 'Answer', text: 'The Pomodoro Technique is a time management method using 25-minute focused work sessions followed by 5-minute breaks.' },
      },
      {
        '@type': 'Question',
        name: 'Is this Pomodoro timer free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! The timer, notifications, and stats tracking are all completely free.' },
      },
    ],
  },
];

export default function PomodoroLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
