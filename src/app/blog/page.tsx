import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Free Online Tools Tips & Guides',
  description: 'Helpful guides, tips, and tutorials for using free online tools. Learn how to create invoices, generate QR codes, build resumes, and more.',
};

const posts = [
  {
    "slug": "invoice-generator",
    "name": "Invoice Generator",
    "desc": "Create professional invoices online for free",
    "icon": "🧾"
  },
  {
    "slug": "qr-code-generator",
    "name": "QR Code Generator",
    "desc": "Generate custom QR codes for URLs, WiFi, vCards and more",
    "icon": "📱"
  },
  {
    "slug": "resume-builder",
    "name": "Resume Builder",
    "desc": "Build professional resumes with free templates",
    "icon": "📄"
  },
  {
    "slug": "ai-code-explainer",
    "name": "AI Code Explainer",
    "desc": "Understand any code snippet with AI-powered explanations",
    "icon": "🧠"
  },
  {
    "slug": "ai-detector",
    "name": "AI Content Detector",
    "desc": "Detect AI-generated text with high accuracy",
    "icon": "🔍"
  },
  {
    "slug": "ai-email-writer",
    "name": "AI Email Writer",
    "desc": "Generate professional emails in seconds with AI",
    "icon": "✉️"
  },
  {
    "slug": "ai-landing-page",
    "name": "AI Landing Page Builder",
    "desc": "Create landing pages with AI-generated content",
    "icon": "🚀"
  },
  {
    "slug": "ai-rewriter",
    "name": "AI Text Rewriter",
    "desc": "Rewrite and paraphrase text with AI",
    "icon": "✍️"
  },
  {
    "slug": "ai-summarizer",
    "name": "AI Summarizer",
    "desc": "Summarize long text, articles and documents instantly",
    "icon": "📝"
  },
  {
    "slug": "ai-translator",
    "name": "AI Translator",
    "desc": "Translate text between languages with AI accuracy",
    "icon": "🌍"
  },
  {
    "slug": "app-builder",
    "name": "App Builder",
    "desc": "Build web applications with AI assistance",
    "icon": "🏗️"
  },
  {
    "slug": "background-remover",
    "name": "Background Remover",
    "desc": "Remove image backgrounds instantly for free",
    "icon": "🖼️"
  },
  {
    "slug": "base64",
    "name": "Base64 Encoder/Decoder",
    "desc": "Encode and decode Base64 strings online",
    "icon": "🔐"
  },
  {
    "slug": "color-palette-generator",
    "name": "Color Palette Generator",
    "desc": "Generate beautiful color palettes for your designs",
    "icon": "🎨"
  },
  {
    "slug": "cron-generator",
    "name": "Cron Expression Generator",
    "desc": "Build and validate cron expressions visually",
    "icon": "⏰"
  },
  {
    "slug": "css-gradient-generator",
    "name": "CSS Gradient Generator",
    "desc": "Create beautiful CSS gradients with a visual editor",
    "icon": "🌈"
  },
  {
    "slug": "diagram-generator",
    "name": "Diagram Generator",
    "desc": "Create flowcharts and diagrams with AI",
    "icon": "📊"
  },
  {
    "slug": "emoji-picker",
    "name": "Emoji Picker",
    "desc": "Search and copy emojis with one click",
    "icon": "😊"
  },
  {
    "slug": "favicon-generator",
    "name": "Favicon Generator",
    "desc": "Generate favicons for your website from any image",
    "icon": "⭐"
  },
  {
    "slug": "file-converter",
    "name": "File Converter",
    "desc": "Convert files between different formats",
    "icon": "📁"
  },
  {
    "slug": "flashcard-generator",
    "name": "Flashcard Generator",
    "desc": "Create study flashcards with AI",
    "icon": "🃏"
  },
  {
    "slug": "hash-generator",
    "name": "Hash Generator",
    "desc": "Generate MD5, SHA-1, SHA-256 and other hashes",
    "icon": "🔑"
  },
  {
    "slug": "image-tools",
    "name": "Image Tools",
    "desc": "Resize, crop, compress and edit images online",
    "icon": "🖼️"
  },
  {
    "slug": "image-upscaler",
    "name": "Image Upscaler",
    "desc": "Upscale and enhance images with AI",
    "icon": "🔎"
  },
  {
    "slug": "json-formatter",
    "name": "JSON Formatter",
    "desc": "Format, validate and beautify JSON data",
    "icon": "{ }"
  },
  {
    "slug": "jwt-decoder",
    "name": "JWT Decoder",
    "desc": "Decode and inspect JSON Web Tokens",
    "icon": "🎫"
  },
  {
    "slug": "lorem-ipsum",
    "name": "Lorem Ipsum Generator",
    "desc": "Generate placeholder text for designs",
    "icon": "📜"
  },
  {
    "slug": "markdown-editor",
    "name": "Markdown Editor",
    "desc": "Write and preview Markdown in real-time",
    "icon": "📝"
  },
  {
    "slug": "ocr",
    "name": "OCR Text Extractor",
    "desc": "Extract text from images and scanned documents",
    "icon": "👁️"
  },
  {
    "slug": "passport-photo",
    "name": "Passport Photo Maker",
    "desc": "Create passport-size photos online for free",
    "icon": "📸"
  },
  {
    "slug": "password-generator",
    "name": "Password Generator",
    "desc": "Generate strong and secure passwords",
    "icon": "🔒"
  },
  {
    "slug": "pdf-tools",
    "name": "PDF Tools",
    "desc": "Merge, split, compress and convert PDF files",
    "icon": "📕"
  },
  {
    "slug": "pomodoro",
    "name": "Pomodoro Timer",
    "desc": "Boost productivity with the Pomodoro technique",
    "icon": "🍅"
  },
  {
    "slug": "regex-tester",
    "name": "Regex Tester",
    "desc": "Test and debug regular expressions in real-time",
    "icon": "🔤"
  },
  {
    "slug": "resume-scorer",
    "name": "Resume Scorer",
    "desc": "Get AI feedback on your resume score",
    "icon": "📊"
  },
  {
    "slug": "salary-calculator",
    "name": "Salary Calculator",
    "desc": "Calculate in-hand salary with tax deductions",
    "icon": "💰"
  },
  {
    "slug": "screenshot-beautifier",
    "name": "Screenshot Beautifier",
    "desc": "Make screenshots look professional with frames and backgrounds",
    "icon": "📷"
  },
  {
    "slug": "subscription-tracker",
    "name": "Subscription Tracker",
    "desc": "Track and manage all your subscriptions in one place",
    "icon": "💳"
  },
  {
    "slug": "text-compare",
    "name": "Text Compare",
    "desc": "Compare two texts and find differences instantly",
    "icon": "⚖️"
  },
  {
    "slug": "unit-converter",
    "name": "Unit Converter",
    "desc": "Convert between units of measurement",
    "icon": "📐"
  },
  {
    "slug": "word-counter",
    "name": "Word Counter",
    "desc": "Count words, characters, sentences and paragraphs",
    "icon": "🔢"
  }
];

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Blog</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">Guides, tips, and tutorials for getting the most out of SheruTools.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl hover:border-indigo-500/30 hover:shadow-lg transition-all">
            <div className="text-3xl mb-3">{post.icon}</div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-1">{post.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{post.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
