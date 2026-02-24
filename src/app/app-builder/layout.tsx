import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI App Builder — Create Android Apps Without Coding',
  description: 'Describe your app idea and AI generates a complete React Native/Expo project. Preview screens, customize, and download. No coding required. Build Android apps free.',
  keywords: ['app builder without coding', 'create android app free', 'ai app maker', 'no code app builder', 'react native app generator', 'expo app builder'],
  openGraph: {
    title: 'AI App Builder — Create Android Apps Without Coding',
    description: 'Describe your app idea and AI builds it. Preview screens in phone mockups, customize everything, download your Expo project or build APK.',
    url: 'https://sherutools.com/app-builder',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  alternates: { canonical: 'https://sherutools.com/app-builder' },
  twitter: {
    card: 'summary_large_image',
    title: 'AI App Builder — Create Android Apps Without Coding',
    description: 'Describe your app idea and AI generates a complete React Native/Expo project. Preview screens, customize, and download. No coding required.',
    images: ['/opengraph-image'],
  },
};

export default function AppBuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'AI App Builder',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            url: 'https://sherutools.com/app-builder',
            description: 'AI-powered app builder that generates React Native/Expo projects from text descriptions.',
            offers: [
              { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free tier: 1 app/day, 4 screens' },
              { '@type': 'Offer', price: '19.99', priceCurrency: 'USD', description: 'Pro: Unlimited apps, APK build' },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How does the AI App Builder work?',
                acceptedAnswer: { '@type': 'Answer', text: 'Describe your app idea in plain English, choose a template or go custom, and our AI generates a complete React Native/Expo project with multiple screens, navigation, and beautiful UI.' },
              },
              {
                '@type': 'Question',
                name: 'Do I need coding experience?',
                acceptedAnswer: { '@type': 'Answer', text: 'No! The AI handles all the code generation. You just describe what you want, preview the screens, customize colors and text, then download your project.' },
              },
              {
                '@type': 'Question',
                name: 'Can I build a real Android APK?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes! Download the Expo project ZIP and run it locally, or use our upcoming APK build service to get a ready-to-install Android app.' },
              },
              {
                '@type': 'Question',
                name: 'Is it free?',
                acceptedAnswer: { '@type': 'Answer', text: 'The free tier lets you generate 1 app per day with up to 4 screens and download the Expo project. Pro unlocks unlimited apps, 8+ screens, and APK building.' },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
