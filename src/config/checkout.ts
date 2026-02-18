// Centralized Lemon Squeezy checkout URLs
// Update these with real product UUIDs after creating products on LS dashboard
const STORE_URL = 'https://sherutools.lemonsqueezy.com';

export const checkoutUrls: Record<string, string> = {
  // AI Tools (subscriptions)
  'ai-email-writer': `${STORE_URL}/checkout/buy/bc0a3fd1-9f86-4148-8c78-ff84708bf027`, // ✅ Real
  'ai-rewriter': `${STORE_URL}`, // TODO: Create product
  'ai-code-explainer': `${STORE_URL}`, // TODO: Create product
  'ai-landing-page': `${STORE_URL}`, // TODO: Create product
  'ai-detector': `${STORE_URL}`, // TODO: Create product
  'ai-flashcards': `${STORE_URL}`, // TODO: Create product
  'ai-diagram': `${STORE_URL}`, // TODO: Create product
  
  // One-time purchase tools
  'invoice-generator': `${STORE_URL}`, // TODO: Create product
  'qr-code-generator': `${STORE_URL}`, // TODO: Create product
  'resume-builder': `${STORE_URL}`, // TODO: Create product
  'pdf-tools': `${STORE_URL}`, // TODO: Create product
  'color-palette': `${STORE_URL}`, // TODO: Create product
  'image-tools': `${STORE_URL}`, // TODO: Create product
  'text-compare': `${STORE_URL}`, // TODO: Create product
  'password-generator': `${STORE_URL}`, // TODO: Create product
  'markdown-editor': `${STORE_URL}`, // TODO: Create product
  'json-formatter': `${STORE_URL}`, // TODO: Create product
  'lorem-ipsum': `${STORE_URL}`, // TODO: Create product
  'css-gradient': `${STORE_URL}`, // TODO: Create product
  'unit-converter': `${STORE_URL}`, // TODO: Create product
  'base64': `${STORE_URL}`, // TODO: Create product
  'regex-tester': `${STORE_URL}`, // TODO: Create product
  'screenshot-beautifier': `${STORE_URL}`, // TODO: Create product
  'file-converter': `${STORE_URL}`, // TODO: Create product
  'ocr': `${STORE_URL}`, // TODO: Create product
  'cron-generator': `${STORE_URL}`, // TODO: Create product
  'image-upscaler': `${STORE_URL}`, // TODO: Create product
  'favicon-generator': `${STORE_URL}`, // TODO: Create product
  'background-remover': `${STORE_URL}`, // TODO: Create product
  'passport-photo': `${STORE_URL}`, // TODO: Create product
};

export function getCheckoutUrl(toolSlug: string): string {
  return checkoutUrls[toolSlug] || STORE_URL;
}
