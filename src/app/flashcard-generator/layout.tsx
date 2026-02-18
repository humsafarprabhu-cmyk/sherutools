import type { Metadata } from 'next';

const title = 'AI Flashcard Generator — Create Study Cards Instantly';
const description = 'Paste your notes, textbook content, or any topic and instantly generate study flashcards with AI. Flip cards, quiz yourself, export to Anki CSV. Free online flashcard maker.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['ai flashcard generator', 'flashcard maker from notes', 'study flashcard generator', 'anki card generator', 'ai study cards', 'flashcard creator'],
  alternates: { canonical: 'https://sherutools.com/flashcard-generator' },
  openGraph: { title, description, url: 'https://sherutools.com/flashcard-generator' },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SheruTools AI Flashcard Generator',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does the AI flashcard generator work?',
        acceptedAnswer: { '@type': 'Answer', text: 'Paste your notes or any text, choose the number of cards and difficulty level, and our AI instantly creates question-and-answer flashcards for studying.' },
      },
      {
        '@type': 'Question',
        name: 'Can I export flashcards to Anki?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes! You can download your flashcards as a CSV file that is fully compatible with Anki and other flashcard apps.' },
      },
      {
        '@type': 'Question',
        name: 'Is the AI flashcard generator free?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, you can generate up to 3 sets of flashcards per day for free, with up to 10 cards per set. Pro users get unlimited generations.' },
      },
      {
        '@type': 'Question',
        name: 'What kind of content can I use?',
        acceptedAnswer: { '@type': 'Answer', text: 'Any text works — lecture notes, textbook passages, Wikipedia articles, or even just a topic name. The AI adapts to whatever you provide.' },
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
