import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Content Rewriter & Paraphraser | SheruTools',
  description:
    'Rewrite and paraphrase any text with AI. Simplify, formalize, expand, summarize, or make creative. Free online AI rewriter tool.',
  keywords: ['ai rewriter', 'paraphrase tool', 'content rewriter', 'ai paraphraser free', 'rewrite text online'],
    twitter: {
    card: 'summary_large_image',
    title: 'Free AI Content Rewriter & Paraphraser | SheruTools',
    description: 'Rewrite and paraphrase any text with AI. Simplify, formalize, expand, summarize, or make creative. Free online AI rewriter tool.',
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/ai-rewriter' },
  openGraph: {
    title: 'Free AI Content Rewriter & Paraphraser | SheruTools',
    description:
      'Rewrite and paraphrase any text with AI. Simplify, formalize, expand, summarize, or make creative. Free online AI rewriter tool.',
    url: 'https://sherutools.com/ai-rewriter',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  }
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Free AI Content Rewriter & Paraphraser', item: 'https://sherutools.com/ai-rewriter' },
    ],
  },
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools AI Content Rewriter',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: 'Rewrite and paraphrase any text with AI. Simplify, formalize, expand, summarize, or make creative.',
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What does the AI Rewriter do?",
      acceptedAnswer: { '@type': 'Answer', text: "The AI Rewriter takes your existing text and rewrites it in a different tone or style while preserving the original meaning. Perfect for improving clarity, changing formality, or avoiding plagiarism." },
    },
    {
      '@type': 'Question',
      name: "Is the AI Rewriter free to use?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! Rewrite text completely free with no sign-up required. Free users have a daily usage limit." },
    },
    {
      '@type': 'Question',
      name: "What tones can I rewrite text in?",
      acceptedAnswer: { '@type': 'Answer', text: "Choose from professional, casual, academic, creative, simplified, persuasive, and more tone options." },
    },
    {
      '@type': 'Question',
      name: "Does rewriting text count as plagiarism?",
      acceptedAnswer: { '@type': 'Answer', text: "AI-rewritten text is original content. However, always ensure the ideas are properly attributed if they originate from other sources." },
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
