import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free PDF Tools Online - Merge, Split, Compress PDFs | SheruTools',
  description: 'Free online PDF tools. Merge, split, compress PDFs and convert between PDF & images. No upload to server — all processing in your browser. Fast, private, free.',
  keywords: ['merge pdf free', 'split pdf online', 'compress pdf', 'pdf to image converter', 'images to pdf', 'pdf tools online free'],
  alternates: { canonical: 'https://sherutools.com/pdf-tools' },
  openGraph: {
    title: 'Free PDF Tools Online - Merge, Split, Compress PDFs | SheruTools',
    description: 'Free online PDF tools. Merge, split, compress PDFs and convert between PDF & images. No upload to server — all processing in your browser.',
    url: 'https://sherutools.com/pdf-tools',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
