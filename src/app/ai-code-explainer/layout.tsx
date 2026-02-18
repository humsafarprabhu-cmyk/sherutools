import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Code Explainer - Understand Any Code | SheruTools',
  description:
    'Paste any code and get instant AI-powered explanations. Line-by-line breakdown, key concepts, and potential issues. Supports 15+ languages.',
  keywords: ['ai code explainer', 'explain code', 'code explanation tool', 'understand code ai', 'code explainer free'],
  alternates: { canonical: 'https://sherutools.com/ai-code-explainer' },
  openGraph: {
    title: 'Free AI Code Explainer - Understand Any Code | SheruTools',
    description:
      'Paste any code and get instant AI-powered explanations. Line-by-line breakdown, key concepts, and potential issues. Supports 15+ languages.',
    url: 'https://sherutools.com/ai-code-explainer',
  }
};

const jsonLd = [
  {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SheruTools AI Code Explainer',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description:
        'Paste any code and get instant AI-powered explanations. Line-by-line breakdown, key concepts, and potential issues.',
    },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
    {
      '@type': 'Question',
      name: "What programming languages does the AI Code Explainer support?",
      acceptedAnswer: { '@type': 'Answer', text: "Our AI Code Explainer supports 15+ languages including JavaScript, Python, TypeScript, Java, C++, Go, Rust, Ruby, PHP, and more." },
    },
    {
      '@type': 'Question',
      name: "Is the AI Code Explainer free to use?",
      acceptedAnswer: { '@type': 'Answer', text: "Yes! You can explain code snippets completely free with no sign-up required. There is a daily usage limit for free users." },
    },
    {
      '@type': 'Question',
      name: "How does AI code explanation work?",
      acceptedAnswer: { '@type': 'Answer', text: "The tool uses advanced AI to analyze your code, providing line-by-line breakdowns, identifying key concepts, design patterns, and potential issues." },
    },
    {
      '@type': 'Question',
      name: "Can I use this to learn programming?",
      acceptedAnswer: { '@type': 'Answer', text: "Absolutely! The AI Code Explainer is perfect for students and beginners learning to code. It breaks down complex code into simple, understandable explanations." },
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
