import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const stylePrompts: Record<string, string> = {
  casual: 'Rewrite in a casual, conversational tone. Use contractions, informal language, maybe some slang. Write like you\'re explaining to a friend over coffee.',
  academic: 'Rewrite in an academic but natural tone. Use field-specific terminology where appropriate, but vary sentence structure significantly. Include occasional hedging and qualifications that real academics use.',
  professional: 'Rewrite in a professional but human tone. Clear and direct, but with personality. Like a senior colleague writing an important email — polished but not robotic.',
  creative: 'Rewrite in a creative, engaging style. Use vivid language, metaphors, varied rhythm. Make it feel like it was written by someone with a distinct voice and perspective.',
};

export async function POST(req: NextRequest) {
  try {
    const { text, style } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!style || !stylePrompts[style]) {
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
    }

    const systemPrompt = `You are an expert at making AI-generated text sound naturally human. ${stylePrompts[style]}

Key techniques to apply:
- Vary sentence lengths dramatically (mix very short with longer ones)
- Add occasional colloquialisms, contractions, and informal connectors ("honestly", "look", "the thing is")
- Remove AI clichés: "Furthermore", "Moreover", "In conclusion", "It's important to note", "In today's world", "landscape", "delve"
- Use imperfect transitions sometimes — real humans don't always flow perfectly
- Add personal touches, opinions, slight tangents
- Break grammar rules occasionally (starting sentences with "And" or "But")
- Use em dashes, parenthetical asides, and rhetorical questions
- Vary paragraph lengths
- Don't over-explain or hedge too much

Return ONLY the rewritten text. No explanations, no preamble, no "Here's the rewritten version".`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.85,
      max_tokens: 4000,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error: unknown) {
    console.error('AI Humanize error:', error);
    const message = error instanceof Error ? error.message : 'Failed to humanize text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
