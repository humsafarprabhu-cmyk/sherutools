import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

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
