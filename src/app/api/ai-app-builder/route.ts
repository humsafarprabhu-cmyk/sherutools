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
          content: `You are an expert React Native/Expo app generator. Generate complete, compilable mobile app screens.

CRITICAL RULES FOR CODE:
- ONLY use imports from 'react' and 'react-native' (View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, TextInput, Image, Alert, Dimensions)
- Do NOT import from react-native-paper, @expo/vector-icons, react-native-vector-icons, or any third-party library
- Use emoji strings instead of icon components (e.g. "🏠" instead of <Icon name="home" />)
- Each screen must be a single default export function component
- Use StyleSheet.create for all styles
- Use React.useState for state management
- All code must be valid TypeScript/JSX that compiles without errors
- Do NOT use any TypeScript type annotations in JSX (no "as" casts)
- Use simple, clean patterns that always compile

EXAMPLE SCREEN:
\`\`\`
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => setCount(c => c + 1)}>
        <Text style={styles.buttonText}>Pressed {count} times</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 24, backgroundColor: '${color}' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  button: { margin: 16, padding: 16, backgroundColor: '${color}', borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
\`\`\`

Given an app description, generate 4-5 screens. For each screen provide:
1. "name": Screen name (e.g., "Home", "Profile")
2. "code": Complete compilable React Native code following ALL rules above
3. "preview": HTML string that visually represents the mobile screen. Use inline styles, primary color ${color}, emoji for icons. Make it look like a real app.

Return ONLY valid JSON. No markdown. Format:
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

Generate the screens. Remember: ONLY react and react-native imports. NO third-party libraries. Must compile on Expo SDK 51.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 4000,
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

    // Sanitize screen code - remove any problematic imports
    if (parsed.screens) {
      parsed.screens = parsed.screens.map((screen: { name: string; code: string; preview: string }) => ({
        ...screen,
        code: sanitizeCode(screen.code, screen.name, color),
      }));
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('AI App Builder error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function sanitizeCode(code: string, screenName: string, color: string): string {
  // Remove any non-react-native imports
  code = code.replace(/import\s+.*from\s+['"](?!react['"]|react-native['"]).*['"];?\n?/g, '');
  
  // Remove TypeScript-only syntax that might cause issues
  code = code.replace(/:\s*React\.FC\b/g, '');
  code = code.replace(/<[A-Z]\w+>\(/g, '(');
  
  // Ensure it has the basic imports
  if (!code.includes("from 'react'") && !code.includes('from "react"')) {
    code = "import React, { useState } from 'react';\n" + code;
  }
  if (!code.includes("from 'react-native'") && !code.includes('from "react-native"')) {
    code = "import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';\n" + code;
  }

  // Ensure it has a default export
  if (!code.includes('export default')) {
    const safeName = screenName.replace(/[^a-zA-Z0-9]/g, '') + 'Screen';
    code = code.replace(
      new RegExp(`function\\s+${safeName}`),
      `export default function ${safeName}`
    );
    // If still no default export, wrap the whole thing
    if (!code.includes('export default')) {
      code += `\nexport default function ${safeName}() { return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{fontSize:24}}>${screenName}</Text></View>; }`;
    }
  }

  return code;
}
