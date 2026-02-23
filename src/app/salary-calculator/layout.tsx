import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salary Calculator — Hourly, Monthly, Yearly Converter | SheruTools',
  description: 'Convert your salary between hourly, daily, weekly, biweekly, monthly, and yearly. Calculate take-home pay with tax estimates, overtime, and deductions. Free salary converter tool.',
  keywords: ['salary calculator', 'hourly to yearly', 'yearly to hourly', 'salary converter', 'take home pay', 'pay calculator', 'wage calculator', 'income calculator'],
  openGraph: {
    title: 'Salary Calculator — Convert Hourly ↔ Yearly ↔ Monthly',
    description: 'Free salary converter. Calculate hourly, daily, weekly, monthly, and yearly pay instantly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Salary Calculator — Hourly, Monthly, Yearly Converter | SheruTools',
    description: 'Convert your salary between hourly, daily, weekly, biweekly, monthly, and yearly. Calculate take-home pay with tax estimates, overtime, and deductions. Free sal',
    images: ['/opengraph-image'],
  },

};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (<><SoftwareAppJsonLd name="Salary Calculator" description="Calculate in-hand salary with tax deductions" category="BusinessApplication" url="https://sherutools.com/salary-calculator" />{children}</>);
}
