import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const modePrompts: Record<string, string> = {
  paraphrase: 'Paraphrase the text — same meaning, different words and sentence structure.',
  simplify: 'Simplify the text — make it easier to understand, use shorter sentences and simpler vocabulary. Aim for a lower reading level.',
  formalize: 'Formalize the text — make it more professional, academic, and polished.',
  expand: 'Expand the text — add more detail, depth, examples, and elaboration while keeping the core meaning.',
  summarize: 'Summarize the text — condense it to the key points and essential information.',
  creative: 'Rewrite the text creatively — make it more engaging, vivid, and compelling. Use literary techniques.',
};

export async function POST(req: NextRequest) {
  try {
    const { text, mode, customInstructions } = await req.json();

    if (!text || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!modePrompts[mode]) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const systemPrompt = `You are an expert rewriter. ${modePrompts[mode]} Keep the core meaning. Return ONLY the rewritten text, no explanations or preamble.${customInstructions ? `\n\nAdditional instructions: ${customInstructions}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (error: unknown) {
    console.error('AI Rewrite error:', error);
    const message = error instanceof Error ? error.message : 'Failed to rewrite text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
