import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AI Diagram Generator — Create Flowcharts & Diagrams Instantly | SheruTools',
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
