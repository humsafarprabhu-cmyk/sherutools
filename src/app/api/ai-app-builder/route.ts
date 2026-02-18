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
      fitness: 'A fitness tracking app with workout logging, exercise library, progress charts showing weekly/monthly stats, and a personal dashboard. Include sample exercises, a timer, and weekly summary.',
      restaurant: 'A restaurant/food menu app with menu categories, dish details with prices, cart/ordering system with quantity, and contact info. Include 10+ sample dishes with descriptions and prices.',
      notes: 'A notes and todo app with task lists, note editor with title+body, categories/tags, and a clean dashboard. Notes must SAVE to localStorage and persist. Include add, edit, delete functionality.',
      ecommerce: 'An e-commerce store app with product catalog grid, product detail modal, shopping cart with add/remove/quantity, and checkout summary. Include 8+ sample products with prices and images (use emoji as images).',
      news: 'A news/blog reader app with article feed, categories filter, article detail view, and bookmarks. Include 10+ sample articles with titles, excerpts, dates, and categories.',
      portfolio: 'A portfolio/business app showcasing projects/work, about section, services offered, testimonials, and contact form. Include sample projects with descriptions.',
      gallery: 'A photo gallery app with album grid, fullscreen viewer, categories, and favorites. Use colorful gradient placeholder images.',
      quiz: 'A quiz/education app with quiz categories, question screens with 4 options each, score tracking, and results. Include 10+ real trivia questions with correct answers.',
      expense: 'An expense tracker app with transaction list, add expense form (amount, category, date), budget overview with visual bars, and monthly total. Data must persist in localStorage.',
      custom: '',
    };

    const appDesc = template && template !== 'custom'
      ? `${templateDescriptions[template]}. Additional details: ${description || 'Make it beautiful and functional.'}`
      : description;

    const systemPrompt = `You are an expert mobile app UI developer. Generate beautiful, FUNCTIONAL mobile app screens as HTML/CSS/JS.

CRITICAL RULES:
1. Each screen is a COMPLETE, self-contained HTML document
2. Use INLINE <style> and <script> tags — no external dependencies
3. Design for mobile viewport (375x812 — iPhone size)
4. Use modern CSS: flexbox, grid, border-radius, box-shadow, transitions, gradients
5. Primary color: ${color}
6. Dark theme by default (dark backgrounds, light text)
7. ALL screens must be FUNCTIONAL:
   - Forms must save data to localStorage
   - Lists must render from stored data
   - Buttons must work (add, delete, edit, toggle)
   - Counters must count
   - Navigation between screens via JavaScript
8. Use emoji for icons: 🏠 ➕ 🔍 ❤️ 🗑️ ✏️ etc.
9. Beautiful typography: system-ui font, proper hierarchy
10. Include realistic sample/mock data
11. Each screen must have a header bar with app name and optional back button
12. Bottom tab bar on the Home screen showing all screens
13. Smooth transitions and micro-interactions (CSS transitions)
14. Use CSS variables for theming: --primary: ${color}; --bg: #0f172a; --card: #1e293b; --text: #f1f5f9;

STRUCTURE FOR EACH SCREEN:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <title>Screen Name</title>
  <style>
    :root { --primary: ${color}; --bg: #0f172a; --card: #1e293b; --text: #f1f5f9; --muted: #94a3b8; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
    /* ... more styles */
  </style>
</head>
<body>
  <!-- Content -->
  <script>
    // Functional JavaScript with localStorage
  </script>
</body>
</html>
\`\`\`

Generate 4-5 screens. Return ONLY valid JSON (no markdown, no code blocks):
{
  "screens": [
    {
      "name": "Home",
      "html": "<!DOCTYPE html>...",
      "icon": "🏠"
    }
  ]
}`;

    const userPrompt = `App Name: "${name}"
Primary Color: ${color}
Description: ${appDesc}

Generate 4-5 complete, beautiful, FUNCTIONAL screens. Every button must work, every form must save. This should feel like a REAL app, not a mockup.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 16000,
    });

    const content = completion.choices[0]?.message?.content || '';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    // Also generate React Native code for ZIP download (lightweight)
    if (parsed.screens) {
      parsed.screens = parsed.screens.map((screen: { name: string; html: string; icon?: string; code?: string; preview?: string }) => ({
        ...screen,
        // Keep html as-is for preview and WebView APK
        // Generate simple RN fallback code for ZIP
        code: screen.code || generateRNCode(screen.name, color),
        // Preview is the HTML itself (rendered in iframe)
        preview: screen.html || screen.preview || '',
      }));
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('AI App Builder error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function generateRNCode(screenName: string, color: string): string {
  const safe = screenName.replace(/[^a-zA-Z0-9]/g, '');
  return `import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function ${safe}Screen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>${screenName}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>Welcome to ${screenName}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, backgroundColor: '${color}' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { padding: 20 },
  text: { fontSize: 16, color: '#f1f5f9' },
});
`;
}
