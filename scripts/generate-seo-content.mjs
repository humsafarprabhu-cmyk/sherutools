#!/usr/bin/env node
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BASE = process.cwd();
const SRC = join(BASE, 'src');

// ─── Tool definitions ───
const TOOLS = [
  { slug: 'invoice-generator', name: 'Invoice Generator', desc: 'Create professional invoices online for free', icon: '🧾', category: 'BusinessApplication', keywords: ['how to create invoice online free', 'free invoice generator no signup', 'invoice maker for freelancers 2026'], related: ['resume-builder', 'salary-calculator', 'pdf-tools'] },
  { slug: 'qr-code-generator', name: 'QR Code Generator', desc: 'Generate custom QR codes for URLs, WiFi, vCards and more', icon: '📱', category: 'UtilitiesApplication', keywords: ['best free qr code generator 2026', 'create qr code online free', 'qr code maker no watermark'], related: ['base64', 'password-generator', 'favicon-generator'] },
  { slug: 'resume-builder', name: 'Resume Builder', desc: 'Build professional resumes with free templates', icon: '📄', category: 'BusinessApplication', keywords: ['free resume builder no signup 2026', 'online resume maker for freshers', 'best free cv builder'], related: ['resume-scorer', 'ai-email-writer', 'invoice-generator'] },
  { slug: 'ai-code-explainer', name: 'AI Code Explainer', desc: 'Understand any code snippet with AI-powered explanations', icon: '🧠', category: 'DeveloperApplication', keywords: ['ai code explainer free', 'explain code online ai', 'code explanation tool for beginners'], related: ['json-formatter', 'regex-tester', 'ai-summarizer'] },
  { slug: 'ai-detector', name: 'AI Content Detector', desc: 'Detect AI-generated text with high accuracy', icon: '🔍', category: 'UtilitiesApplication', keywords: ['free ai content detector 2026', 'check if text is ai generated', 'ai writing detector online'], related: ['ai-rewriter', 'word-counter', 'ai-summarizer'] },
  { slug: 'ai-email-writer', name: 'AI Email Writer', desc: 'Generate professional emails in seconds with AI', icon: '✉️', category: 'BusinessApplication', keywords: ['ai email writer free', 'generate professional email online', 'email writing assistant no signup'], related: ['ai-rewriter', 'ai-summarizer', 'resume-builder'] },
  { slug: 'ai-landing-page', name: 'AI Landing Page Builder', desc: 'Create landing pages with AI-generated content', icon: '🚀', category: 'BusinessApplication', keywords: ['ai landing page generator free', 'create landing page with ai', 'free landing page builder 2026'], related: ['app-builder', 'css-gradient-generator', 'favicon-generator'] },
  { slug: 'ai-rewriter', name: 'AI Text Rewriter', desc: 'Rewrite and paraphrase text with AI', icon: '✍️', category: 'UtilitiesApplication', keywords: ['free ai text rewriter 2026', 'paraphrase tool online free', 'rewrite text to avoid ai detection'], related: ['ai-detector', 'ai-summarizer', 'word-counter'] },
  { slug: 'ai-summarizer', name: 'AI Summarizer', desc: 'Summarize long text, articles and documents instantly', icon: '📝', category: 'UtilitiesApplication', keywords: ['free ai text summarizer', 'summarize article online ai', 'tldr generator free'], related: ['ai-rewriter', 'word-counter', 'ai-translator'] },
  { slug: 'ai-translator', name: 'AI Translator', desc: 'Translate text between languages with AI accuracy', icon: '🌍', category: 'UtilitiesApplication', keywords: ['free ai translator online 2026', 'translate text ai accurate', 'best free translation tool'], related: ['ai-summarizer', 'ai-rewriter', 'ai-email-writer'] },
  { slug: 'app-builder', name: 'App Builder', desc: 'Build web applications with AI assistance', icon: '🏗️', category: 'DeveloperApplication', keywords: ['free app builder online 2026', 'build web app no code free', 'ai app generator'], related: ['ai-landing-page', 'ai-code-explainer', 'diagram-generator'] },
  { slug: 'background-remover', name: 'Background Remover', desc: 'Remove image backgrounds instantly for free', icon: '🖼️', category: 'MultimediaApplication', keywords: ['remove background from image free', 'background eraser online no signup', 'transparent background maker'], related: ['passport-photo', 'image-upscaler', 'image-tools'] },
  { slug: 'base64', name: 'Base64 Encoder/Decoder', desc: 'Encode and decode Base64 strings online', icon: '🔐', category: 'DeveloperApplication', keywords: ['base64 encode decode online free', 'base64 converter tool', 'encode text to base64'], related: ['hash-generator', 'jwt-decoder', 'json-formatter'] },
  { slug: 'color-palette-generator', name: 'Color Palette Generator', desc: 'Generate beautiful color palettes for your designs', icon: '🎨', category: 'DesignApplication', keywords: ['color palette generator free 2026', 'generate color scheme online', 'color combination tool for designers'], related: ['css-gradient-generator', 'favicon-generator', 'screenshot-beautifier'] },
  { slug: 'cron-generator', name: 'Cron Expression Generator', desc: 'Build and validate cron expressions visually', icon: '⏰', category: 'DeveloperApplication', keywords: ['cron expression generator online', 'cron job builder free', 'crontab expression maker'], related: ['regex-tester', 'json-formatter', 'hash-generator'] },
  { slug: 'css-gradient-generator', name: 'CSS Gradient Generator', desc: 'Create beautiful CSS gradients with a visual editor', icon: '🌈', category: 'DeveloperApplication', keywords: ['css gradient generator free', 'css background gradient maker', 'gradient color code generator'], related: ['color-palette-generator', 'favicon-generator', 'screenshot-beautifier'] },
  { slug: 'diagram-generator', name: 'Diagram Generator', desc: 'Create flowcharts and diagrams with AI', icon: '📊', category: 'BusinessApplication', keywords: ['free diagram generator online', 'ai flowchart maker', 'create diagram online free 2026'], related: ['app-builder', 'ai-code-explainer', 'markdown-editor'] },
  { slug: 'emoji-picker', name: 'Emoji Picker', desc: 'Search and copy emojis with one click', icon: '😊', category: 'UtilitiesApplication', keywords: ['emoji picker copy paste', 'emoji search tool online', 'all emojis list with copy'], related: ['lorem-ipsum', 'word-counter', 'markdown-editor'] },
  { slug: 'favicon-generator', name: 'Favicon Generator', desc: 'Generate favicons for your website from any image', icon: '⭐', category: 'DeveloperApplication', keywords: ['favicon generator from image free', 'create favicon online', 'ico file generator'], related: ['screenshot-beautifier', 'color-palette-generator', 'css-gradient-generator'] },
  { slug: 'file-converter', name: 'File Converter', desc: 'Convert files between different formats', icon: '📁', category: 'UtilitiesApplication', keywords: ['free file converter online 2026', 'convert files online no signup', 'document converter tool'], related: ['pdf-tools', 'image-tools', 'ocr'] },
  { slug: 'flashcard-generator', name: 'Flashcard Generator', desc: 'Create study flashcards with AI', icon: '🃏', category: 'EducationalApplication', keywords: ['ai flashcard generator free', 'create flashcards online', 'study card maker'], related: ['ai-summarizer', 'ai-translator', 'word-counter'] },
  { slug: 'hash-generator', name: 'Hash Generator', desc: 'Generate MD5, SHA-1, SHA-256 and other hashes', icon: '🔑', category: 'DeveloperApplication', keywords: ['hash generator online free', 'md5 sha256 generator', 'text to hash converter'], related: ['base64', 'password-generator', 'jwt-decoder'] },
  { slug: 'image-tools', name: 'Image Tools', desc: 'Resize, crop, compress and edit images online', icon: '🖼️', category: 'MultimediaApplication', keywords: ['free image editor online 2026', 'resize compress image free', 'bulk image tool online'], related: ['background-remover', 'image-upscaler', 'screenshot-beautifier'] },
  { slug: 'image-upscaler', name: 'Image Upscaler', desc: 'Upscale and enhance images with AI', icon: '🔎', category: 'MultimediaApplication', keywords: ['ai image upscaler free online', 'enhance image quality free', 'upscale photo resolution'], related: ['background-remover', 'image-tools', 'passport-photo'] },
  { slug: 'json-formatter', name: 'JSON Formatter', desc: 'Format, validate and beautify JSON data', icon: '{ }', category: 'DeveloperApplication', keywords: ['json formatter online free', 'json beautifier validator', 'format json code online'], related: ['regex-tester', 'base64', 'jwt-decoder'] },
  { slug: 'jwt-decoder', name: 'JWT Decoder', desc: 'Decode and inspect JSON Web Tokens', icon: '🎫', category: 'DeveloperApplication', keywords: ['jwt decoder online free', 'decode json web token', 'jwt token inspector'], related: ['base64', 'json-formatter', 'hash-generator'] },
  { slug: 'lorem-ipsum', name: 'Lorem Ipsum Generator', desc: 'Generate placeholder text for designs', icon: '📜', category: 'DeveloperApplication', keywords: ['lorem ipsum generator free', 'placeholder text generator', 'dummy text for website'], related: ['word-counter', 'markdown-editor', 'emoji-picker'] },
  { slug: 'markdown-editor', name: 'Markdown Editor', desc: 'Write and preview Markdown in real-time', icon: '📝', category: 'DeveloperApplication', keywords: ['free markdown editor online 2026', 'markdown preview tool', 'write markdown online'], related: ['text-compare', 'word-counter', 'json-formatter'] },
  { slug: 'ocr', name: 'OCR Text Extractor', desc: 'Extract text from images and scanned documents', icon: '👁️', category: 'UtilitiesApplication', keywords: ['free ocr online extract text from image', 'image to text converter', 'ocr tool no signup'], related: ['pdf-tools', 'ai-summarizer', 'file-converter'] },
  { slug: 'passport-photo', name: 'Passport Photo Maker', desc: 'Create passport-size photos online for free', icon: '📸', category: 'MultimediaApplication', keywords: ['passport photo maker online free', 'passport size photo generator', 'id photo creator free'], related: ['background-remover', 'image-tools', 'image-upscaler'] },
  { slug: 'password-generator', name: 'Password Generator', desc: 'Generate strong and secure passwords', icon: '🔒', category: 'UtilitiesApplication', keywords: ['strong password generator free', 'random password generator online', 'secure password maker 2026'], related: ['hash-generator', 'base64', 'qr-code-generator'] },
  { slug: 'pdf-tools', name: 'PDF Tools', desc: 'Merge, split, compress and convert PDF files', icon: '📕', category: 'UtilitiesApplication', keywords: ['free pdf tools online 2026', 'merge split pdf free', 'pdf compressor online'], related: ['file-converter', 'ocr', 'invoice-generator'] },
  { slug: 'pomodoro', name: 'Pomodoro Timer', desc: 'Boost productivity with the Pomodoro technique', icon: '🍅', category: 'UtilitiesApplication', keywords: ['free pomodoro timer online', 'focus timer pomodoro technique', 'productivity timer free'], related: ['subscription-tracker', 'word-counter', 'flashcard-generator'] },
  { slug: 'regex-tester', name: 'Regex Tester', desc: 'Test and debug regular expressions in real-time', icon: '🔤', category: 'DeveloperApplication', keywords: ['regex tester online free', 'regular expression debugger', 'test regex pattern'], related: ['json-formatter', 'cron-generator', 'base64'] },
  { slug: 'resume-scorer', name: 'Resume Scorer', desc: 'Get AI feedback on your resume score', icon: '📊', category: 'BusinessApplication', keywords: ['free resume scorer ai 2026', 'rate my resume online', 'ai resume checker free'], related: ['resume-builder', 'ai-email-writer', 'word-counter'] },
  { slug: 'salary-calculator', name: 'Salary Calculator', desc: 'Calculate in-hand salary with tax deductions', icon: '💰', category: 'BusinessApplication', keywords: ['salary calculator india 2026', 'in hand salary calculator free', 'ctc to take home calculator'], related: ['invoice-generator', 'unit-converter', 'subscription-tracker'] },
  { slug: 'screenshot-beautifier', name: 'Screenshot Beautifier', desc: 'Make screenshots look professional with frames and backgrounds', icon: '📷', category: 'DesignApplication', keywords: ['screenshot beautifier free online', 'make screenshot look professional', 'screenshot mockup generator'], related: ['image-tools', 'color-palette-generator', 'css-gradient-generator'] },
  { slug: 'subscription-tracker', name: 'Subscription Tracker', desc: 'Track and manage all your subscriptions in one place', icon: '💳', category: 'FinanceApplication', keywords: ['free subscription tracker 2026', 'manage subscriptions online', 'subscription cost calculator'], related: ['salary-calculator', 'invoice-generator', 'pomodoro'] },
  { slug: 'text-compare', name: 'Text Compare', desc: 'Compare two texts and find differences instantly', icon: '⚖️', category: 'UtilitiesApplication', keywords: ['text compare tool online free', 'diff checker online', 'compare two texts find differences'], related: ['word-counter', 'markdown-editor', 'json-formatter'] },
  { slug: 'unit-converter', name: 'Unit Converter', desc: 'Convert between units of measurement', icon: '📐', category: 'UtilitiesApplication', keywords: ['unit converter online free', 'measurement converter tool', 'convert units calculator'], related: ['salary-calculator', 'base64', 'word-counter'] },
  { slug: 'word-counter', name: 'Word Counter', desc: 'Count words, characters, sentences and paragraphs', icon: '🔢', category: 'UtilitiesApplication', keywords: ['free word counter online', 'character counter tool', 'count words in text'], related: ['text-compare', 'lorem-ipsum', 'ai-summarizer'] },
];

const toolMap = Object.fromEntries(TOOLS.map(t => [t.slug, t]));

// ─── Variation pages ───
const VARIATIONS = [
  { parent: 'invoice-generator', slug: 'freelancer', title: 'Free Invoice Generator for Freelancers', h1: 'Invoice Generator for Freelancers', desc: 'Create professional invoices as a freelancer. Free invoice maker with customizable templates — no signup required.', keyword: 'invoice generator for freelancers free' },
  { parent: 'invoice-generator', slug: 'gst', title: 'GST Invoice Generator Online Free', h1: 'GST Invoice Generator', desc: 'Generate GST-compliant invoices instantly. Add GSTIN, HSN codes, and tax breakdowns. Free online tool.', keyword: 'gst invoice generator online free' },
  { parent: 'invoice-generator', slug: 'small-business', title: 'Invoice Generator for Small Business', h1: 'Invoice Generator for Small Businesses', desc: 'Professional invoice maker built for small businesses. Track clients, add logos, and download PDF invoices free.', keyword: 'free invoice generator small business' },
  { parent: 'qr-code-generator', slug: 'upi', title: 'UPI QR Code Generator Free', h1: 'UPI Payment QR Code Generator', desc: 'Generate UPI payment QR codes instantly. Accept payments via Google Pay, PhonePe, Paytm. Free, no signup.', keyword: 'upi qr code generator free' },
  { parent: 'qr-code-generator', slug: 'wifi', title: 'WiFi QR Code Generator Free', h1: 'WiFi QR Code Generator', desc: 'Create QR codes for WiFi networks. Guests scan to connect — no typing passwords. Free online tool.', keyword: 'wifi qr code generator free' },
  { parent: 'qr-code-generator', slug: 'vcard', title: 'vCard QR Code Generator Free', h1: 'vCard QR Code Generator', desc: 'Create digital business card QR codes. Share contact info instantly with a scan. Free vCard QR maker.', keyword: 'vcard qr code generator free' },
  { parent: 'resume-builder', slug: 'fresher', title: 'Resume Builder for Freshers Free', h1: 'Resume Builder for Freshers', desc: 'Build your first resume with templates designed for freshers. Highlight education, skills, and projects. Free.', keyword: 'resume builder for freshers free' },
  { parent: 'resume-builder', slug: 'experienced', title: 'Resume Builder for Experienced Pros', h1: 'Resume Builder for Experienced Professionals', desc: 'Create executive-level resumes that highlight your experience. Professional templates, free to use.', keyword: 'resume builder for experienced professionals' },
  { parent: 'resume-builder', slug: 'developer', title: 'Developer Resume Builder Free', h1: 'Resume Builder for Developers', desc: 'Build a developer resume that stands out. Showcase GitHub, tech stack, and projects. Free online tool.', keyword: 'developer resume builder free online' },
];

// ─── Helper: generate blog post content ───
function blogContent(tool) {
  const related = tool.related.map(s => toolMap[s]).filter(Boolean);
  const keyword = tool.keywords[0];
  const relLinks = related.map(r => `- [${r.name}](/${r.slug}) — ${r.desc}`).join('\n');
  
  return `import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '${tool.keywords[0].split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ').slice(0, 55)}',
  description: '${tool.desc}. Learn how to use ${tool.name} on SheruTools — free, no signup, works in your browser.'.slice(0, 158),
  alternates: { canonical: '/blog/${tool.slug}' },
};

export default function Blog${tool.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/ /g, '')}Page() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
      <h1>${keyword.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</h1>
      <p className="lead text-lg text-slate-600 dark:text-slate-300">
        Looking for a way to ${keyword}? SheruTools gives you a powerful, free <strong>${tool.name}</strong> that works entirely in your browser — no signup, no downloads, no hidden fees.
      </p>

      <h2>Why Use an Online ${tool.name}?</h2>
      <p>
        In 2026, you shouldn&apos;t need to install software or create accounts just to ${keyword.replace('best ', '').replace('free ', '').replace(' 2026', '')}. Whether you&apos;re a freelancer, student, developer, or small business owner, having instant access to professional tools saves time and money.
      </p>
      <p>
        SheruTools&apos; ${tool.name} is designed to be fast, private, and genuinely useful. Everything runs in your browser — your data never leaves your device.
      </p>

      <h2>Key Features of ${tool.name}</h2>
      <ul>
        <li><strong>100% Free</strong> — No hidden costs or premium-only features that matter</li>
        <li><strong>No Signup Required</strong> — Start using it immediately, no email needed</li>
        <li><strong>Privacy First</strong> — Your data stays in your browser, nothing uploaded to servers</li>
        <li><strong>Mobile Friendly</strong> — Works perfectly on phones, tablets, and desktops</li>
        <li><strong>Modern UI</strong> — Clean, intuitive interface that doesn&apos;t waste your time</li>
      </ul>

      <h2>How to ${keyword.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</h2>
      <p>Using the ${tool.name} on SheruTools is straightforward:</p>
      <ol>
        <li><strong>Visit the tool</strong> — Go to <Link href="/${tool.slug}" className="text-indigo-500 hover:text-indigo-400">SheruTools ${tool.name}</Link></li>
        <li><strong>Enter your data</strong> — Fill in the required fields or upload your content</li>
        <li><strong>Get results</strong> — Preview, customize, and download your output instantly</li>
      </ol>

      <h2>Who Is This Tool For?</h2>
      <p>
        The ${tool.name} is perfect for anyone who needs to get things done quickly without complex software. Whether you&apos;re a student working on a project, a professional meeting a deadline, or a business owner managing day-to-day tasks — this tool adapts to your needs.
      </p>

      <h3>Common Use Cases</h3>
      <ul>
        <li>Freelancers and remote workers managing client deliverables</li>
        <li>Students and educators creating course materials</li>
        <li>Developers building and testing during their workflow</li>
        <li>Small business owners handling operations without expensive software</li>
      </ul>

      <h2>${tool.name} vs Paid Alternatives</h2>
      <p>
        Many popular tools charge $10–30/month for features you can get free on SheruTools. We believe essential digital tools should be accessible to everyone. Our ${tool.name} matches or exceeds paid alternatives in core functionality — the main difference is you don&apos;t need a credit card.
      </p>

      <h2>Related Tools You Might Like</h2>
      <p>SheruTools offers 35+ free tools. Here are some that pair well with ${tool.name}:</p>
      <ul>
        ${related.map(r => `<li><Link href="/${r.slug}" className="text-indigo-500 hover:text-indigo-400">${r.name}</Link> — ${r.desc}</li>`).join('\n        ')}
      </ul>

      <div className="not-prose mt-10 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Ready to try ${tool.name}?
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          No signup needed. Start using it right now — completely free.
        </p>
        <Link
          href="/${tool.slug}"
          className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
        >
          Open ${tool.name} →
        </Link>
      </div>
    </article>
  );
}
`;
}

// ─── Helper: variation page ───
function variationPage(v) {
  const parent = toolMap[v.parent];
  return `import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '${v.title.slice(0, 58)}',
  description: '${v.desc.slice(0, 158)}',
  alternates: { canonical: '/${v.parent}/${v.slug}' },
};

export default function ${v.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/ /g, '')}VariationPage() {
  return (
    <div className="dot-pattern">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-indigo-500">Home</Link>
          <span>/</span>
          <Link href="/${v.parent}" className="hover:text-indigo-500">${parent.name}</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white capitalize">${v.slug.replace(/-/g, ' ')}</span>
        </nav>
        
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          ${v.h1}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
          ${v.desc}
        </p>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-8">
          <p className="text-slate-700 dark:text-slate-200 mb-4">
            Use our full-featured <strong>${parent.name}</strong> below — it&apos;s completely free and works right in your browser.
          </p>
          <Link
            href="/${v.parent}"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition-colors"
          >
            Open ${parent.name} →
          </Link>
        </div>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h2>Why ${v.h1}?</h2>
          <p>
            Whether you&apos;re looking for a specialized tool or just want a streamlined experience,
            our ${parent.name} has everything you need. This page is optimized for <strong>${v.keyword}</strong> — 
            but the tool itself handles all use cases beautifully.
          </p>

          <h2>Features</h2>
          <ul>
            <li>100% free — no hidden fees or premium gates</li>
            <li>No signup required — start immediately</li>
            <li>Privacy first — everything runs in your browser</li>
            <li>Professional output — download-ready results</li>
            <li>Mobile friendly — works on any device</li>
          </ul>

          <h2>Get Started Now</h2>
          <p>
            Click the button above to open the ${parent.name} and start creating. 
            It takes less than a minute to get professional results.
          </p>
        </article>
      </div>
    </div>
  );
}
`;
}

// ─── Helper: JSON-LD component ───
function jsonLdComponent() {
  return `export default function SoftwareAppJsonLd({
  name,
  description,
  category,
  url,
}: {
  name: string;
  description: string;
  category: string;
  url: string;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory: category,
    operatingSystem: 'Web',
    url,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
`;
}

// ═══════════════════════════════════════════════════
// GENERATE FILES
// ═══════════════════════════════════════════════════

// 1. JSON-LD component
const jsonLdPath = join(SRC, 'components', 'SoftwareAppJsonLd.tsx');
writeFileSync(jsonLdPath, jsonLdComponent());
console.log('✅ Created SoftwareAppJsonLd component');

// 2. Blog posts
for (const tool of TOOLS) {
  const dir = join(SRC, 'app', 'blog', tool.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'page.tsx'), blogContent(tool));
}
console.log(`✅ Created ${TOOLS.length} blog posts`);

// 3. Blog index page
const blogIndexDir = join(SRC, 'app', 'blog');
mkdirSync(blogIndexDir, { recursive: true });
writeFileSync(join(blogIndexDir, 'page.tsx'), `import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Free Online Tools Tips & Guides',
  description: 'Helpful guides, tips, and tutorials for using free online tools. Learn how to create invoices, generate QR codes, build resumes, and more.',
};

const posts = ${JSON.stringify(TOOLS.map(t => ({ slug: t.slug, name: t.name, desc: t.desc, icon: t.icon })), null, 2)};

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Blog</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">Guides, tips, and tutorials for getting the most out of SheruTools.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={\`/blog/\${post.slug}\`} className="block p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl hover:border-indigo-500/30 hover:shadow-lg transition-all">
            <div className="text-3xl mb-3">{post.icon}</div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-1">{post.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{post.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
`);
console.log('✅ Created blog index page');

// 4. Variation pages
for (const v of VARIATIONS) {
  const dir = join(SRC, 'app', v.parent, v.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'page.tsx'), variationPage(v));
}
console.log(`✅ Created ${VARIATIONS.length} variation pages`);

// 5. Updated sitemap
const blogSitemapEntries = TOOLS.map(t => 
  `    { url: \`\${base}/blog/${t.slug}\`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },`
).join('\n');
const variationSitemapEntries = VARIATIONS.map(v =>
  `    { url: \`\${base}/${v.parent}/${v.slug}\`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },`
).join('\n');

const sitemapContent = `import { MetadataRoute } from 'next';

const CONVERSION_PAIRS = [
  'webp-to-png', 'webp-to-jpg', 'heic-to-jpg', 'heic-to-png', 'png-to-jpg', 'jpg-to-png',
  'png-to-webp', 'jpg-to-webp', 'avif-to-png', 'avif-to-jpg', 'png-to-avif', 'jpg-to-avif',
  'bmp-to-jpg', 'bmp-to-png', 'gif-to-png', 'gif-to-jpg', 'png-to-ico', 'jpg-to-ico',
  'png-to-bmp', 'jpg-to-bmp', 'webp-to-avif', 'avif-to-webp', 'heic-to-webp',
  'png-to-gif', 'jpg-to-gif',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://sherutools.com';
  return [
    // Core pages
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: \`\${base}/blog\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },

    // Tool pages
    { url: \`\${base}/app-builder\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/ai-landing-page\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/ai-rewriter\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/ai-email-writer\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/ai-code-explainer\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/ai-detector\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/background-remover\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/passport-photo\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/invoice-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/qr-code-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/resume-builder\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/pdf-tools\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/color-palette-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/image-tools\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/text-compare\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/password-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/markdown-editor\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/json-formatter\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/lorem-ipsum\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/css-gradient-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/unit-converter\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/base64\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/regex-tester\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/pomodoro\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/emoji-picker\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/word-counter\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/screenshot-beautifier\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/ocr\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/file-converter\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/cron-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/image-upscaler\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/flashcard-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/diagram-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/favicon-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/ai-summarizer\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/hash-generator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/jwt-decoder\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/ai-translator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/subscription-tracker\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: \`\${base}/resume-scorer\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.95 },
    { url: \`\${base}/salary-calculator\`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },

    // Variation pages
${variationSitemapEntries}

    // Blog posts
${blogSitemapEntries}

    // Conversion pages
    ...CONVERSION_PAIRS.map(pair => ({
      url: \`\${base}/convert/\${pair}\`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
`;
writeFileSync(join(SRC, 'app', 'sitemap.ts'), sitemapContent);
console.log('✅ Updated sitemap with blog + variation pages');

// 6. Generate JSON-LD injection data file
const jsonLdData = TOOLS.map(t => ({
  slug: t.slug,
  name: t.name,
  desc: t.desc,
  category: t.category,
}));
writeFileSync(join(SRC, 'lib', 'tool-jsonld-data.ts'), `// Auto-generated tool data for JSON-LD
export const TOOL_JSONLD_DATA: Record<string, { name: string; description: string; category: string }> = ${JSON.stringify(Object.fromEntries(jsonLdData.map(t => [t.slug, { name: t.name, description: t.desc, category: t.category }])), null, 2)};
`);
console.log('✅ Created tool JSON-LD data file');

console.log('\n🎉 All SEO content generated successfully!');
console.log(`   - ${TOOLS.length} blog posts`);
console.log(`   - ${VARIATIONS.length} variation pages`);
console.log(`   - 1 JSON-LD component`);
console.log(`   - 1 blog index page`);
console.log(`   - Updated sitemap`);
