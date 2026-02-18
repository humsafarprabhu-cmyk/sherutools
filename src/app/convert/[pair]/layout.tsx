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

  return {
    title: `Convert ${from} to ${to} Free Online — Instant, No Upload`,
    description: `Convert ${from} to ${to} instantly in your browser. Free ${from.toLowerCase()} to ${to.toLowerCase()} converter — no upload, no watermark, 100% private. Drag & drop conversion.`,
    keywords: [`${from.toLowerCase()} to ${to.toLowerCase()}`, `convert ${from.toLowerCase()} to ${to.toLowerCase()}`, `${from.toLowerCase()} to ${to.toLowerCase()} converter`, `${from.toLowerCase()} ${to.toLowerCase()} converter online free`],
    alternates: { canonical: `https://sherutools.com/convert/${pair}` },
    openGraph: {
      title: `Convert ${from} to ${to} Free Online — Instant, No Upload`,
      description: `Convert ${from} to ${to} instantly in your browser. Free, no upload, 100% private.`,
      url: `https://sherutools.com/convert/${pair}`,
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
