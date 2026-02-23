import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Scorer — Get Your Resume Rated Instantly | SheruTools',
  description: 'Upload your resume and get an instant AI-powered score with detailed feedback. Check ATS compatibility, formatting, keywords, and get actionable improvement tips. Free online tool.',
  keywords: ['resume scorer', 'resume checker', 'ATS checker', 'resume analyzer', 'resume feedback', 'AI resume review', 'resume tips', 'CV scorer'],
  openGraph: {
    title: 'AI Resume Scorer — Is Your Resume Good Enough?',
    description: 'Get instant AI feedback on your resume. Score, ATS check, keyword analysis, and improvement tips.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Scorer — Get Your Resume Rated Instantly | SheruTools',
    description: 'Upload your resume and get an instant AI-powered score with detailed feedback. Check ATS compatibility, formatting, keywords, and get actionable improvement tip',
    images: ['/opengraph-image'],
  },

};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (<><SoftwareAppJsonLd name="Resume Scorer" description="Get AI feedback on your resume score" category="BusinessApplication" url="https://sherutools.com/resume-scorer" />{children}</>);
}
