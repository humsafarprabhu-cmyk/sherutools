import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { description, style, color, sections } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const enabledSections = sections
      ? Object.entries(sections)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : ['hero', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'footer'];

    const sectionInstructions = enabledSections.map((s: string) => {
      switch (s) {
        case 'hero': return '- Hero section: bold headline, subheading, CTA button, gradient background';
        case 'features': return '- Features section: 3-4 features with emoji icons in a responsive grid';
        case 'pricing': return '- Pricing section: 3 tiers (Free/Pro/Enterprise) with feature lists and CTA buttons';
        case 'testimonials': return '- Testimonials: 3 testimonials with names, roles, and quotes';
        case 'faq': return '- FAQ: 4-5 questions with answers in an accordion-style layout';
        case 'cta': return '- CTA section: final call-to-action with compelling text and button';
        case 'footer': return '- Footer: navigation links, social links, copyright notice';
        default: return '';
      }
    }).filter(Boolean).join('\n');

    const brandColor = color || '#6366f1';
    const styleGuide = style || 'modern';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an elite web designer. Generate a COMPLETE, self-contained HTML landing page. 

Rules:
- Return ONLY the HTML code, nothing else. No markdown, no code fences.
- Start with <!DOCTYPE html> and end with </html>
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Brand color: ${brandColor}
- Style: ${styleGuide}
- Make it modern, beautiful, responsive, and professional
- Include smooth scroll behavior, hover effects, transitions
- Use inline Tailwind config to set brand color
- Add subtle animations using CSS @keyframes
- The page should look like it was designed by a top agency
- Add a small "Made with SheruTools" badge in the footer with link to https://sherutools.com
- All content should be realistic and compelling for the product described

Include these sections:
${sectionInstructions}`,
        },
        {
          role: 'user',
          content: `Create a stunning landing page for: ${description}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const html = completion.choices[0].message.content || '';

    return NextResponse.json({ html });
  } catch (error: unknown) {
    console.error('AI Landing Page error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate landing page';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
