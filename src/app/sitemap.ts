import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://sherutools.com';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/invoice-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/qr-code-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/resume-builder`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/pdf-tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/color-palette-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];
}
