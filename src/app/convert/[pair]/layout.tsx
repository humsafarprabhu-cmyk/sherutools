import type { Metadata } from 'next';

const FORMAT_NAMES: Record<string, string> = {
  png: 'PNG', jpg: 'JPG', jpeg: 'JPG', webp: 'WebP', avif: 'AVIF',
  heic: 'HEIC', bmp: 'BMP', gif: 'GIF', ico: 'ICO',
};

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  const { pair } = await params;
  const match = pair.match(/^(\w+)-to-(\w+)$/);
  if (!match) return { title: 'File Converter ' };

  const from = FORMAT_NAMES[match[1]] || match[1].toUpperCase();
  const to = FORMAT_NAMES[match[2]] || match[2].toUpperCase();
  const title = `Convert ${from} to ${to} Free Online — Instant, No Upload`;
  const description = `Convert ${from} to ${to} instantly in your browser. Free ${from.toLowerCase()} to ${to.toLowerCase()} converter — no upload, no watermark, 100% private. Drag & drop conversion.`;

  return {
    title,
    description,
    keywords: [`${from.toLowerCase()} to ${to.toLowerCase()}`, `convert ${from.toLowerCase()} to ${to.toLowerCase()}`, `${from.toLowerCase()} to ${to.toLowerCase()} converter`, `${from.toLowerCase()} ${to.toLowerCase()} converter online free`],
    alternates: { canonical: `https://sherutools.com/convert/${pair}` },
    openGraph: {
      title,
      description: `Convert ${from} to ${to} instantly in your browser. Free, no upload, 100% private.`,
      url: `https://sherutools.com/convert/${pair}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Convert ${from} to ${to} instantly in your browser. Free, no upload, 100% private.`,
      images: ['/opengraph-image'],
    },
  };
}

const CONVERSION_PAIRS = [
  'webp-to-png', 'webp-to-jpg', 'heic-to-jpg', 'heic-to-png', 'png-to-jpg', 'jpg-to-png',
  'png-to-webp', 'jpg-to-webp', 'avif-to-png', 'avif-to-jpg', 'png-to-avif', 'jpg-to-avif',
  'bmp-to-jpg', 'bmp-to-png', 'gif-to-png', 'gif-to-jpg', 'png-to-ico', 'jpg-to-ico',
  'png-to-bmp', 'jpg-to-bmp', 'webp-to-avif', 'avif-to-webp', 'heic-to-webp',
  'png-to-gif', 'jpg-to-gif',
];

export function generateStaticParams() {
  return CONVERSION_PAIRS.map(pair => ({ pair }));
}

interface ConvertLayoutProps {
  children: React.ReactNode;
  params: Promise<{ pair: string }>;
}

export default async function Layout({ children, params }: ConvertLayoutProps) {
  const { pair } = await params;
  const match = pair.match(/^(\w+)-to-(\w+)$/);
  if (!match) return children;

  const from = FORMAT_NAMES[match[1]] || match[1].toUpperCase();
  const to = FORMAT_NAMES[match[2]] || match[2].toUpperCase();

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
        { '@type': 'ListItem', position: 2, name: 'File Converter', item: 'https://sherutools.com/file-converter' },
        { '@type': 'ListItem', position: 3, name: `${from} to ${to}`, item: `https://sherutools.com/convert/${pair}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `SheruTools ${from} to ${to} Converter`,
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: `Convert ${from} to ${to} instantly in your browser. Free, no upload, 100% private.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
