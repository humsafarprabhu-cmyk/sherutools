import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://sherutools.com';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/ai-landing-page`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/ai-rewriter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/ai-email-writer`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/ai-code-explainer`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/invoice-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/qr-code-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/resume-builder`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/pdf-tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/color-palette-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/image-tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/text-compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/password-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/markdown-editor`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/json-formatter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/lorem-ipsum`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/css-gradient-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/unit-converter`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/base64`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/regex-tester`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/pomodoro`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/emoji-picker`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];
}
