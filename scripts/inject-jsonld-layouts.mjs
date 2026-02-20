#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const SRC = join(process.cwd(), 'src');

const TOOLS = {
  'invoice-generator': { name: 'Invoice Generator', desc: 'Create professional invoices online for free', cat: 'BusinessApplication' },
  'qr-code-generator': { name: 'QR Code Generator', desc: 'Generate custom QR codes for URLs, WiFi, vCards and more', cat: 'UtilitiesApplication' },
  'resume-builder': { name: 'Resume Builder', desc: 'Build professional resumes with free templates', cat: 'BusinessApplication' },
  'ai-code-explainer': { name: 'AI Code Explainer', desc: 'Understand any code snippet with AI-powered explanations', cat: 'DeveloperApplication' },
  'ai-detector': { name: 'AI Content Detector', desc: 'Detect AI-generated text with high accuracy', cat: 'UtilitiesApplication' },
  'ai-email-writer': { name: 'AI Email Writer', desc: 'Generate professional emails in seconds with AI', cat: 'BusinessApplication' },
  'ai-landing-page': { name: 'AI Landing Page Builder', desc: 'Create landing pages with AI-generated content', cat: 'BusinessApplication' },
  'ai-rewriter': { name: 'AI Text Rewriter', desc: 'Rewrite and paraphrase text with AI', cat: 'UtilitiesApplication' },
  'ai-summarizer': { name: 'AI Summarizer', desc: 'Summarize long text, articles and documents instantly', cat: 'UtilitiesApplication' },
  'ai-translator': { name: 'AI Translator', desc: 'Translate text between languages with AI accuracy', cat: 'UtilitiesApplication' },
  'app-builder': { name: 'App Builder', desc: 'Build web applications with AI assistance', cat: 'DeveloperApplication' },
  'background-remover': { name: 'Background Remover', desc: 'Remove image backgrounds instantly for free', cat: 'MultimediaApplication' },
  'base64': { name: 'Base64 Encoder/Decoder', desc: 'Encode and decode Base64 strings online', cat: 'DeveloperApplication' },
  'color-palette-generator': { name: 'Color Palette Generator', desc: 'Generate beautiful color palettes for your designs', cat: 'DesignApplication' },
  'cron-generator': { name: 'Cron Expression Generator', desc: 'Build and validate cron expressions visually', cat: 'DeveloperApplication' },
  'css-gradient-generator': { name: 'CSS Gradient Generator', desc: 'Create beautiful CSS gradients with a visual editor', cat: 'DeveloperApplication' },
  'diagram-generator': { name: 'Diagram Generator', desc: 'Create flowcharts and diagrams with AI', cat: 'BusinessApplication' },
  'emoji-picker': { name: 'Emoji Picker', desc: 'Search and copy emojis with one click', cat: 'UtilitiesApplication' },
  'favicon-generator': { name: 'Favicon Generator', desc: 'Generate favicons for your website from any image', cat: 'DeveloperApplication' },
  'file-converter': { name: 'File Converter', desc: 'Convert files between different formats', cat: 'UtilitiesApplication' },
  'flashcard-generator': { name: 'Flashcard Generator', desc: 'Create study flashcards with AI', cat: 'EducationalApplication' },
  'hash-generator': { name: 'Hash Generator', desc: 'Generate MD5, SHA-1, SHA-256 and other hashes', cat: 'DeveloperApplication' },
  'image-tools': { name: 'Image Tools', desc: 'Resize, crop, compress and edit images online', cat: 'MultimediaApplication' },
  'image-upscaler': { name: 'Image Upscaler', desc: 'Upscale and enhance images with AI', cat: 'MultimediaApplication' },
  'json-formatter': { name: 'JSON Formatter', desc: 'Format, validate and beautify JSON data', cat: 'DeveloperApplication' },
  'jwt-decoder': { name: 'JWT Decoder', desc: 'Decode and inspect JSON Web Tokens', cat: 'DeveloperApplication' },
  'lorem-ipsum': { name: 'Lorem Ipsum Generator', desc: 'Generate placeholder text for designs', cat: 'DeveloperApplication' },
  'markdown-editor': { name: 'Markdown Editor', desc: 'Write and preview Markdown in real-time', cat: 'DeveloperApplication' },
  'ocr': { name: 'OCR Text Extractor', desc: 'Extract text from images and scanned documents', cat: 'UtilitiesApplication' },
  'passport-photo': { name: 'Passport Photo Maker', desc: 'Create passport-size photos online for free', cat: 'MultimediaApplication' },
  'password-generator': { name: 'Password Generator', desc: 'Generate strong and secure passwords', cat: 'UtilitiesApplication' },
  'pdf-tools': { name: 'PDF Tools', desc: 'Merge, split, compress and convert PDF files', cat: 'UtilitiesApplication' },
  'pomodoro': { name: 'Pomodoro Timer', desc: 'Boost productivity with the Pomodoro technique', cat: 'UtilitiesApplication' },
  'regex-tester': { name: 'Regex Tester', desc: 'Test and debug regular expressions in real-time', cat: 'DeveloperApplication' },
  'resume-scorer': { name: 'Resume Scorer', desc: 'Get AI feedback on your resume score', cat: 'BusinessApplication' },
  'salary-calculator': { name: 'Salary Calculator', desc: 'Calculate in-hand salary with tax deductions', cat: 'BusinessApplication' },
  'screenshot-beautifier': { name: 'Screenshot Beautifier', desc: 'Make screenshots look professional with frames and backgrounds', cat: 'DesignApplication' },
  'subscription-tracker': { name: 'Subscription Tracker', desc: 'Track and manage all your subscriptions in one place', cat: 'FinanceApplication' },
  'text-compare': { name: 'Text Compare', desc: 'Compare two texts and find differences instantly', cat: 'UtilitiesApplication' },
  'unit-converter': { name: 'Unit Converter', desc: 'Convert between units of measurement', cat: 'UtilitiesApplication' },
  'word-counter': { name: 'Word Counter', desc: 'Count words, characters, sentences and paragraphs', cat: 'UtilitiesApplication' },
};

let created = 0, skipped = 0;

for (const [slug, tool] of Object.entries(TOOLS)) {
  const layoutPath = join(SRC, 'app', slug, 'layout.tsx');
  
  // Skip if layout already exists
  if (existsSync(layoutPath)) {
    const content = readFileSync(layoutPath, 'utf-8');
    if (content.includes('SoftwareApplication')) {
      skipped++;
      continue;
    }
    // Existing layout without JSON-LD — we'll skip to avoid breaking it
    console.log(`⚠️  ${slug}/layout.tsx exists without JSON-LD — skipping`);
    skipped++;
    continue;
  }

  const layoutContent = `import SoftwareAppJsonLd from '@/components/SoftwareAppJsonLd';

export default function ${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/ /g, '')}Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SoftwareAppJsonLd
        name="${tool.name}"
        description="${tool.desc}"
        category="${tool.cat}"
        url="https://sherutools.com/${slug}"
      />
      {children}
    </>
  );
}
`;
  writeFileSync(layoutPath, layoutContent);
  created++;
}

console.log(`✅ Created ${created} layout.tsx files with JSON-LD (${skipped} skipped)`);
