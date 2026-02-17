import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Resume Builder - Create Professional Resumes Online | SheruTools',
  description: 'Build a professional resume in minutes. 3 beautiful templates, real-time preview, instant PDF download. Free online resume maker — no sign-up required.',
  keywords: ['free resume builder', 'online resume maker', 'resume generator free', 'professional resume', 'resume templates'],
  alternates: { canonical: 'https://sherutools.com/resume-builder' },
  openGraph: {
    title: 'Free Resume Builder | SheruTools',
    description: 'Build a professional resume in minutes. 3 beautiful templates, real-time preview, instant PDF download.',
    url: 'https://sherutools.com/resume-builder',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
