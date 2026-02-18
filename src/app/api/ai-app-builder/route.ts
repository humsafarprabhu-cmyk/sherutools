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
      fitness: 'A fitness tracking app with workout logging, exercise library with muscle groups, progress charts showing weekly/monthly stats with animated bars, and a personal dashboard with streaks, calories burned, workout minutes. Include 8+ sample exercises with sets/reps, a countdown timer that actually works, and motivational quotes.',
      restaurant: 'A restaurant/food menu app with beautiful food categories with emoji icons, dish cards with prices/ratings/spice level, working cart system with add/remove/quantity controls and total calculation, and a checkout page. Include 12+ dishes across categories (Starters, Mains, Desserts, Drinks) with realistic prices.',
      notes: 'A notes app with rich note editor (title + body + color tags), working add/edit/delete with localStorage persistence, search/filter, pinned notes, color-coded categories, and a beautiful grid layout. Must actually save and load notes across page refreshes.',
      ecommerce: 'An e-commerce store with product grid (card layout with image placeholder, price, rating stars, add-to-cart button), working shopping cart with quantity +/-, total calculation, product detail view, and category filters. Include 12+ products with realistic prices and star ratings.',
      news: 'A news/blog reader with article feed cards (thumbnail placeholder, title, excerpt, date, category badge), category tabs (All, Tech, Business, Science, Sports), article detail view with full text, and working bookmarks saved to localStorage. Include 12+ realistic article titles and excerpts.',
      portfolio: 'A portfolio app with hero section (name, title, animated gradient), project cards with tech stack tags, skills section with progress bars, testimonials carousel, and contact form. Beautiful glassmorphism design throughout.',
      gallery: 'A photo gallery app with masonry grid layout using colorful gradient placeholder images, fullscreen lightbox viewer with swipe, album categories, favorites with heart toggle saved to localStorage, and image count badges.',
      quiz: 'A quiz app with category selection (Science, History, Geography, Tech, Movies), working quiz flow with 4-option MCQ, timer countdown per question, score tracking, animated correct/wrong feedback, and final results with performance grade. Include 15+ real questions with correct answers.',
      expense: 'An expense tracker with transaction list (amount, category emoji, date, note), working add-expense form that saves to localStorage, budget overview with animated progress bars per category, monthly total with income vs expense, and pie-chart style category breakdown using CSS. Include sample transactions.',
      custom: '',
    };

    const appDesc = template && template !== 'custom'
      ? `${templateDescriptions[template]}. Additional details: ${description || 'Make it stunning and highly functional.'}`
      : description;

    const systemPrompt = `You are an ELITE mobile app UI developer who creates STUNNING, production-quality app interfaces. Generate beautiful, FULLY FUNCTIONAL mobile app screens as complete HTML documents.

DESIGN STANDARDS (2026 quality):
- Glassmorphism cards: background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1)
- Smooth gradients for headers and CTAs
- Subtle shadows: box-shadow: 0 8px 32px rgba(0,0,0,0.3)
- Rounded corners everywhere (12-20px)
- Proper spacing (16-24px padding)
- Animated elements: @keyframes for loading states, number counters, progress bars
- Hover/active states on all interactive elements with transform: scale(0.97)
- Status indicators with colored dots (green=active, yellow=warning, red=alert)
- Emoji as beautiful icons (not text) — use them generously
- Cards with subtle border-left accent colors
- Floating action buttons (FAB) for primary actions
- Pull-to-refresh style headers
- Smooth transitions on everything: transition: all 0.3s cubic-bezier(0.4,0,0.2,1)

CRITICAL RULES:
1. Each screen is a COMPLETE <!DOCTYPE html> document with inline <style> and <script>
2. NO external dependencies — everything self-contained
3. Mobile viewport: 375x812, use meta viewport tag
4. Primary color: ${color} — use it for headers, buttons, accents, gradients
5. Dark theme: --bg: #0f172a; --card: #1e293b; --card-hover: #263348; --text: #f1f5f9; --muted: #94a3b8; --border: rgba(255,255,255,0.08)
6. EVERY screen must be FULLY FUNCTIONAL:
   - Forms save to localStorage and reload on page open
   - Lists render from stored data with add/delete
   - Counters count, timers time, toggles toggle
   - Search/filter actually filters visible items
   - Calculations are real (totals, averages, percentages)
7. Use emoji icons throughout: 🏠 ➕ 🔍 ❤️ 🗑️ ✏️ 📊 💰 🔔 ⭐ etc
8. Include RICH sample/mock data (10+ items where applicable)
9. Header bar: 56px height, app name, subtle background
10. Scrollable content with -webkit-overflow-scrolling: touch
11. Input fields: dark background, rounded, with focus glow effect
12. Buttons: gradient backgrounds, rounded-full for FABs
13. Lists: alternating subtle backgrounds or card-based
14. Numbers/stats: large bold font, colored accents
15. Empty states: emoji + helpful message when no data

CSS TEMPLATE:
\`\`\`
:root {
  --primary: ${color};
  --primary-light: ${color}33;
  --primary-glow: ${color}66;
  --bg: #0f172a;
  --card: #1e293b;
  --card-hover: #263348;
  --text: #f1f5f9;
  --muted: #94a3b8;
  --border: rgba(255,255,255,0.08);
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
}
* { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
body { font-family:system-ui,-apple-system,sans-serif; background:var(--bg); color:var(--text); min-height:100vh; overflow-x:hidden; }
\`\`\`

IMPORTANT: Generate EXACTLY 5 screens. Each screen must have 200+ lines of rich HTML with lots of content, interactivity, and visual elements. Return ONLY valid JSON — no markdown, no code blocks, no explanation:
{"screens":[{"name":"Screen Name","html":"<!DOCTYPE html>...complete HTML...","icon":"🏠"}]}`;

    const userPrompt = `App: "${name}"
Color: ${color}
Description: ${appDesc}

Create 4-5 STUNNING screens. This must look like a $50,000 professionally designed app — rich content, beautiful layout, working interactions, smooth animations. NOT a basic mockup.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 16000,
    });

    const content = completion.choices[0]?.message?.content || '';

    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(content);
    } catch {
      // Try extracting JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        // Try finding the JSON object directly
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          parsed = JSON.parse(content.substring(start, end + 1));
        } else {
          throw new Error('Failed to parse AI response');
        }
      }
    }

    // Post-process screens
    if (parsed.screens) {
      parsed.screens = parsed.screens.map((screen: { name: string; html: string; icon?: string; code?: string; preview?: string }) => ({
        ...screen,
        code: screen.code || generateRNCode(screen.name, color),
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
