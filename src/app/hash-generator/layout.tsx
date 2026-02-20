import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

export default function HashGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="Hash Generator"
        description="Generate MD5, SHA-1, SHA-256 and other hashes"
        category="DeveloperApplication"
        url="https://sherutools.com/hash-generator"
      />
      {children}
    </>
  );
}
