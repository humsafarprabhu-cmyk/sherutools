import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

export default function JwtDecoderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="JWT Decoder"
        description="Decode and inspect JSON Web Tokens"
        category="DeveloperApplication"
        url="https://sherutools.com/jwt-decoder"
      />
      {children}
    </>
  );
}
