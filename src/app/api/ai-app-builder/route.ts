import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Force OpenAI for now (Anthropic credits low)
const USE_CLAUDE = false;

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

    const systemPrompt = `You are an expert React Native/Expo developer. Generate production-quality mobile app screens.

STRICT RULES:
1. ONLY import from 'react' and 'react-native'
2. Available RN imports: View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, TextInput, Image, Alert, Dimensions, SafeAreaView, StatusBar, Switch, Modal, ActivityIndicator, Animated, Platform, KeyboardAvoidingView
3. NO third-party libraries (no react-native-paper, no @expo/vector-icons, no vector-icons, no expo-*, no @react-navigation)
4. Use emoji strings for icons: "🏠" "⚙️" "➕" "🔍" etc
5. Each screen is a single file with one default export
6. Use StyleSheet.create() for all styles
7. Use React.useState and React.useEffect for state/effects
8. Use AsyncStorage pattern with simple state for data persistence (mock it with useState + sample data)
9. Make screens FUNCTIONAL — not just UI mockups. Lists should render data, forms should work, buttons should do things.
10. Use modern, beautiful styling: rounded corners (borderRadius: 16), shadows, gradients via overlapping Views, proper spacing
11. Primary color: ${color}
12. All code must compile without errors on Expo SDK 51 + React Native 0.74

QUALITY STANDARDS:
- Each screen should have 80-150 lines of code (substantial, not trivial)
- Include sample/mock data that looks realistic
- Proper error states and empty states
- Smooth UX: loading indicators, confirmation dialogs
- Beautiful typography hierarchy (title, subtitle, body, caption)
- Card-based layouts with proper shadows and spacing
- Status bar aware (use SafeAreaView or padding)

Generate 4-5 screens. Return ONLY valid JSON:
{
  "screens": [
    {
      "name": "Home",
      "code": "import React, { useState } from 'react';\\nimport { View, Text, ... } from 'react-native';\\n\\nexport default function HomeScreen() {\\n  ...\\n}\\n\\nconst styles = StyleSheet.create({...});",
      "preview": "<div style='...'>HTML preview of screen</div>"
    }
  ]
}

The preview HTML should be a realistic mobile UI mockup with inline styles, using the primary color ${color}.`;

    const userPrompt = `App Name: "${name}"
Primary Color: ${color}
Description: ${appDesc}

Generate 4-5 complete, compilable, functional screens. Each screen must work standalone with sample data. Make it beautiful and production-quality.`;

    let content: string;

    if (USE_CLAUDE) {
      // Use Claude Sonnet 3.5 for superior code quality
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
        ],
      });
      content = response.content[0].type === 'text' ? response.content[0].text : '';
    } else {
      // Fallback to GPT-4o
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 8000,
      });
      content = completion.choices[0]?.message?.content || '';
    }

    // Parse JSON from response
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

    // Sanitize screen code
    if (parsed.screens) {
      parsed.screens = parsed.screens.map((screen: { name: string; code: string; preview: string }) => ({
        ...screen,
        code: sanitizeCode(screen.code, screen.name, color),
      }));
    }

    return NextResponse.json({ ...parsed, model: USE_CLAUDE ? 'claude-sonnet' : 'gpt-4o' });
  } catch (error: unknown) {
    console.error('AI App Builder error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function sanitizeCode(code: string, screenName: string, color: string): string {
  // Remove any non-react/react-native imports
  code = code.replace(/import\s+.*from\s+['"](?!react['"]|react-native['"]).*['"];?\n?/g, '');
  
  // Remove TypeScript-only syntax
  code = code.replace(/:\s*React\.FC\b[^{]*/g, '');
  
  // Ensure basic imports
  if (!code.includes("from 'react'") && !code.includes('from "react"')) {
    code = "import React, { useState, useEffect } from 'react';\n" + code;
  }
  if (!code.includes("from 'react-native'") && !code.includes('from "react-native"')) {
    code = "import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, TextInput, SafeAreaView, Dimensions, Alert } from 'react-native';\n" + code;
  }

  // Ensure default export
  if (!code.includes('export default')) {
    const safeName = screenName.replace(/[^a-zA-Z0-9]/g, '') + 'Screen';
    code = code.replace(new RegExp(`(function\\s+${safeName})`), 'export default $1');
    if (!code.includes('export default')) {
      code = code.replace(/^(function\s+\w+)/m, 'export default $1');
    }
    if (!code.includes('export default')) {
      code += `\nexport default function ${safeName}() { return <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#f8f9fa'}}><Text style={{fontSize:24,fontWeight:'bold',color:'${color}'}}>Welcome to ${screenName}</Text></View>; }`;
    }
  }

  return code;
}
