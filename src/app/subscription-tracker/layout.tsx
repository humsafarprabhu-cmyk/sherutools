import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription Tracker — See How Much You Waste Monthly | SheruTools',
  description: 'Track all your subscriptions in one place. See your total monthly spend, get cancel reminders, and stop wasting money on forgotten subscriptions. Free, no sign-up required.',
  keywords: ['subscription tracker', 'subscription manager', 'track subscriptions', 'cancel subscriptions', 'subscription spending', 'money saving tool', 'subscription fatigue'],
  openGraph: {
    title: 'Subscription Tracker — Stop Wasting Money on Forgotten Subscriptions',
    description: 'The average person wastes $200+/month on unused subscriptions. Track yours for free.',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (<><SoftwareAppJsonLd name="Subscription Tracker" description="Track and manage all your subscriptions" category="FinanceApplication" url="https://sherutools.com/subscription-tracker" />{children}</>);
}
