import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

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
