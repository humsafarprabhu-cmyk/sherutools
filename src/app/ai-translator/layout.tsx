import type { Metadata } from 'next';
import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

const title = 'AI Translator — Translate Text Between 100+ Languages Free';
const description =
  'Translate text between 100+ languages instantly with AI-powered accuracy. Context-aware translations, tone options, and alternatives. Free online translator.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['ai translator', 'translate text online free', 'language translator', 'ai translation tool', 'free online translator', 'text translator'],
    twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
    images: ['/opengraph-image'],
  },
  alternates: { canonical: 'https://sherutools.com/ai-translator' },
  openGraph: { title, description, url: 'https://sherutools.com/ai-translator',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }] },
};

export default function AiTranslatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="AI Translator"
        description="Translate text between languages with AI accuracy"
        category="UtilitiesApplication"
        url="https://sherutools.com/ai-translator"
      />
      {children}
    </>
  );
}
