import type { Metadata } from 'next';
import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

const title = 'JWT Decoder — Decode & Inspect JSON Web Tokens Free';
const description =
  'Decode, inspect, and verify JSON Web Tokens (JWT) online. View header, payload, and signature. Free JWT debugger for developers.';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['jwt decoder', 'jwt debugger', 'decode jwt token', 'json web token decoder', 'jwt inspector online', 'jwt parser'],
  alternates: { canonical: 'https://sherutools.com/jwt-decoder' },
  openGraph: { title, description, url: 'https://sherutools.com/jwt-decoder' },
};

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
