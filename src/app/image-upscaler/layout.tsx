import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image Upscaler — Enhance & Enlarge Images Free',
  description: 'Upscale and enhance images to 2x or 4x resolution using AI-powered sharpening. Free, no upload — runs 100% in your browser. Download enhanced PNG/JPG.',
  keywords: ['image upscaler free', 'enlarge image without losing quality', 'ai image enhancer', 'upscale image online', 'increase image resolution', 'image enlarger'],
    twitter: {
    card: 'summary_large_image',
    title: 'AI Image Upscaler — Enhance & Enlarge Images Free',
    description: 'Upscale and enhance images to 2x or 4x resolution using AI-powered sharpening. Free, no upload — runs 100% in your browser. Download enhanced PNG/JPG.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/image-upscaler' },
  openGraph: {
    title: 'AI Image Upscaler — Enhance & Enlarge Images Free',
    description: 'Upscale images to 2x/4x with AI sharpening. Free, private, browser-based.',
    url: 'https://sherutools.com/image-upscaler',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Image Upscaler', item: 'https://sherutools.com/image-upscaler' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools AI Image Upscaler',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Upscale and enhance images using AI-powered Canvas processing. 100% client-side.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this image upscaler free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! You can upscale up to 3 images per day for free at 2x resolution. Pro users get unlimited 4x/8x upscaling.' },
      },
      {
        '@type': 'Question',
        name: 'Does upscaling actually improve image quality?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Our tool uses high-quality interpolation combined with smart sharpening and optional denoising to produce crisp, detailed enlarged images.' },
      },
      {
        '@type': 'Question',
        name: 'Are my images uploaded to a server?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens directly in your browser. Your images never leave your device.' },
      },
      {
        '@type': 'Question',
        name: 'What image formats are supported?',
        acceptedAnswer: { '@type': 'Answer', text: 'JPG, PNG, WebP, and most common image formats. You can download results as PNG or JPG.' },
      },
      {
        '@type': 'Question',
        name: 'What is the maximum image size?',
        acceptedAnswer: { '@type': 'Answer', text: 'Free users can upload images up to 2MB. Pro users can upload up to 20MB.' },
      },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
