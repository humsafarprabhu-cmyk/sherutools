import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { description, template, appName, primaryColor } = await req.json();

    if (!description && !template) {
      return NextResponse.json({ error: 'Description or template is required' }, { status: 400 });
    }

    const color = primaryColor || '#6366f1';
    const name = appName || 'My App';

    const templateDescriptions: Record<string, string> = {
      fitness: 'A fitness tracking app with workout logging, exercise library, progress charts showing weekly/monthly stats, and a personal dashboard',
      restaurant: 'A restaurant/food menu app with menu categories, dish details with photos, cart/ordering system, table reservations, and contact info',
      notes: 'A notes and todo app with task lists, note editor, categories/tags, reminders, and a clean minimal dashboard',
      ecommerce: 'An e-commerce store app with product catalog grid, product detail pages, shopping cart, checkout flow, and order history',
      news: 'A news/blog reader app with article feed, categories, article detail view, bookmarks, and search functionality',
      portfolio: 'A portfolio/business app showcasing projects/work, about section, services offered, testimonials, and contact form',
      gallery: 'A photo gallery app with album grid, photo viewer with swipe, upload functionality, and favorites collection',
      quiz: 'A quiz/education app with quiz categories, question screens with multiple choice, score tracking, and leaderboard',
      expense: 'An expense tracker app with transaction list, add expense form, budget overview with charts, and monthly reports',
      custom: '',
    };

    const appDesc = template && template !== 'custom'
      ? `${templateDescriptions[template]}. Additional details: ${description || 'Make it beautiful and functional.'}`
      : description;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert React Native/Expo app generator. You generate complete, beautiful mobile app screens.

Given an app description, generate 4-6 screens. For each screen, provide:
1. "name": Screen name (e.g., "Home", "Profile")
2. "code": Complete React Native screen component code using StyleSheet, react-native-paper, and vector icons
3. "preview": An HTML string that visually represents how this screen would look on mobile. Use inline styles. Make it look like a real mobile app screen. Use the primary color: ${color}. Make it beautiful with proper spacing, shadows, rounded corners. Keep HTML self-contained with inline styles only.

The preview HTML should be a realistic mobile UI mockup - include header bars, cards, lists, buttons, icons (use emoji as icons), proper typography, and the app's color scheme.

Return JSON only. No markdown. Format:
{
  "screens": [
    { "name": "...", "code": "...", "preview": "..." }
  ]
}`,
        },
        {
          role: 'user',
          content: `App Name: "${name}"
Primary Color: ${color}
Description: ${appDesc}

Generate the screens.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content || '';

    // Parse JSON from response
    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(content);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('AI App Builder error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
