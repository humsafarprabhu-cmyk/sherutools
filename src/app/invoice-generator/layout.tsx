import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Invoice Generator — Create & Download PDF Invoices',
  description: 'Create professional invoices for free. 3 beautiful templates, live preview, instant PDF download. No sign-up required.',
  alternates: { canonical: 'https://sherutools.com/invoice-generator' },
  openGraph: {
    title: 'Free Invoice Generator | SheruTools',
    description: 'Create professional invoices for free with live preview and instant PDF download.',
    url: 'https://sherutools.com/invoice-generator',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
