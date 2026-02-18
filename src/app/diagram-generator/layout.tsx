import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Diagram Generator — Create Flowcharts & Diagrams Instantly',
  description: 'Generate professional diagrams from text descriptions using AI. Create flowcharts, sequence diagrams, class diagrams, ER diagrams, mindmaps, Gantt charts, and more with Mermaid.js. Free online tool.',
  keywords: ['ai diagram generator', 'flowchart maker ai', 'mermaid diagram generator', 'sequence diagram generator', 'mindmap generator', 'er diagram tool', 'gantt chart maker'],
  openGraph: {
    title: 'AI Diagram Generator — Create Flowcharts & Diagrams Instantly',
    description: 'Describe what you want, AI generates beautiful diagrams. Flowcharts, sequence diagrams, mindmaps & more.',
    url: 'https://sherutools.com/diagram-generator',
    type: 'website',
  },
  alternates: { canonical: 'https://sherutools.com/diagram-generator' },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sherutools.com' },
      { '@type': 'ListItem', position: 2, name: 'Diagram Generator', item: 'https://sherutools.com/diagram-generator' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools AI Diagram Generator',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: 'Generate professional diagrams from text descriptions using AI and Mermaid.js.',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the AI diagram generator work?',
        acceptedAnswer: { '@type': 'Answer', text: 'Describe your diagram in plain text (e.g., "user login flow"), choose a diagram type, and AI generates Mermaid.js code that renders as a beautiful diagram.' },
      },
      {
        '@type': 'Question',
        name: 'What types of diagrams can I create?',
        acceptedAnswer: { '@type': 'Answer', text: 'Flowcharts, sequence diagrams, class diagrams, ER diagrams, mindmaps, Gantt charts, pie charts, and more — all powered by Mermaid.js.' },
      },
      {
        '@type': 'Question',
        name: 'Is the diagram generator free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! You can generate diagrams for free. Export as SVG or PNG to use in presentations, docs, or websites.' },
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
