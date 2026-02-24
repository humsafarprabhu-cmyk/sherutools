import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import MouseSpotlight from '@/components/MouseSpotlight';
import ScrollProgress from '@/components/ScrollProgress';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: {
    default: 'SheruTools — Free Online Tools That Actually Work',
    template: '%s | SheruTools',
  },
  description: '33+ free online tools for creators, developers & businesses. AI content tools, image editors, PDF tools, file converters & more. No sign-up required. 100% private.',
  metadataBase: new URL('https://sherutools.com'),
  verification: {
    google: 'GOOGLE_SEARCH_CONSOLE_ID',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sherutools.com',
    siteName: 'SheruTools',
    title: 'SheruTools — Free Online Tools That Actually Work',
    description: '33+ free online tools for creators, developers & businesses. AI content tools, image editors, PDF tools, file converters & more. No sign-up required. 100% private.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://sherutools.com' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'SheruTools',
              url: 'https://sherutools.com',
              description: 'Free online tools that actually work',
            }),
          }}
        />
      </head>
      <body className={`${geist.variable} font-sans antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300`}>
        <GoogleAnalytics />
        <ScrollProgress />
        <MouseSpotlight />
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
