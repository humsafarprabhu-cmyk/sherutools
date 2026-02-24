import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free CSS Gradient Generator - Create Beautiful Gradients',
  description: 'Create beautiful CSS gradients visually. Linear, radial, conic gradients with unlimited color stops. Copy CSS, Tailwind, or export as PNG.',
  keywords: ['css gradient generator', 'gradient maker', 'css gradient', 'tailwind gradient', 'gradient tool'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free CSS Gradient Generator - Create Beautiful Gradients',
    description: 'Create beautiful CSS gradients visually. Linear, radial, conic gradients with unlimited color stops. Copy CSS, Tailwind, or export as PNG.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/css-gradient-generator' },
  openGraph: {
    title: 'Free CSS Gradient Generator - Create Beautiful Gradients',
    description: 'Create beautiful CSS gradients visually. Linear, radial, conic gradients with unlimited color stops. Copy CSS, Tailwind, or export as PNG.',
    url: 'https://sherutools.com/css-gradient-generator',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free CSS Gradient Generator', item: 'https://sherutools.com/css-gradient-generator' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools CSS Gradient Generator',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What types of CSS gradients can I create?",
      acceptedAnswer: { '@type': 'Answer', text: "Create linear, radial, and conic gradients with unlimited color stops, custom angles, and positions. Preview in real-time and copy the CSS code." },
    },
    {
      '@type': 'Question',
      name: "Is the CSS Gradient Generator free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free! Generate unlimited gradients with no sign-up required." },
    },
    {
      '@type': 'Question',
      name: "Can I copy the generated CSS code?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, copy the CSS gradient code with one click and paste it directly into your stylesheet." },
    },
    {
      '@type': 'Question',
      name: "Does it support multiple color stops?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, add as many color stops as you need and position them precisely along the gradient." },
    }
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
