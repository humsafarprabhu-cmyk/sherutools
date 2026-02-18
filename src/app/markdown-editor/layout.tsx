import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Markdown Editor - Live Preview & Export | SheruTools',
  description: 'Write and preview Markdown in real-time. Formatting toolbar, syntax highlighting, export to HTML and MD files. Free online markdown editor.',
  keywords: ['markdown editor online', 'markdown preview', 'free markdown editor', 'markdown to html'],
  alternates: { canonical: 'https://sherutools.com/markdown-editor' },
  openGraph: {
    title: 'Free Markdown Editor - Live Preview & Export | SheruTools',
    description: 'Write and preview Markdown in real-time. Formatting toolbar, syntax highlighting, export to HTML and MD files. Free online markdown editor.',
    url: 'https://sherutools.com/markdown-editor',
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Markdown Editor', item: 'https://sherutools.com/markdown-editor' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools Markdown Editor',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What is Markdown?",
      acceptedAnswer: { '@type': 'Answer', text: "Markdown is a lightweight markup language that converts plain text to formatted HTML. It is widely used for documentation, README files, blogs, and more." },
    },
    {
      '@type': 'Question',
      name: "Does this editor support live preview?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! See your Markdown rendered in real-time as you type. Switch between edit and preview modes." },
    },
    {
      '@type': 'Question',
      name: "Can I export my Markdown?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, export as Markdown (.md) or copy the rendered HTML. Your content is saved locally in your browser." },
    },
    {
      '@type': 'Question',
      name: "Is this Markdown editor free?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes, completely free with all features available. No sign-up required." },
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
