import type { Metadata } from 'next';
import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

const title = 'Hash Generator — MD5, SHA-1, SHA-256 Online Free';
const description =
  'Generate MD5, SHA-1, SHA-256, SHA-512, and other hashes instantly. Hash text or files online. Free hash generator tool for developers.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['hash generator online', 'md5 hash generator', 'sha256 generator', 'sha1 hash', 'online hash calculator', 'file hash checker'],
    twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/hash-generator' },
  openGraph: { title, description, url: 'https://sherutools.com/hash-generator',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }] },
};

export default function HashGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Hash Generator"
        description="Generate MD5, SHA-1, SHA-256 and other hashes"
        category="DeveloperApplication"
        url="https://sherutools.com/hash-generator"
      />
      {children}
    </>
  );
}
