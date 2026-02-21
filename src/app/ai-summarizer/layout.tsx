import type { Metadata } from 'next';
import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

const title = 'AI Text Summarizer — Summarize Articles & Documents Free';
const description =
  'Summarize long text, articles, and documents instantly with AI. Get concise summaries in seconds. Free online text summarizer — no sign-up required.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['ai summarizer', 'text summarizer online free', 'summarize article', 'ai summary generator', 'document summarizer', 'tldr generator'],
  alternates: { canonical: 'https://sherutools.com/ai-summarizer' },
  openGraph: { title, description, url: 'https://sherutools.com/ai-summarizer' },
};

export default function AiSummarizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="AI Summarizer"
        description="Summarize long text, articles and documents instantly"
        category="UtilitiesApplication"
        url="https://sherutools.com/ai-summarizer"
      />
      {children}
    </>
  );
}
