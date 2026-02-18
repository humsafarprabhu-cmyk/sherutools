import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const toneInstructions: Record<string, string> = {
  standard: 'Use natural, everyday language.',
  formal: 'Use formal, polished language appropriate for official documents.',
  casual: 'Use casual, friendly language as if talking to a friend.',
  business: 'Use professional business language suitable for corporate communication.',
  literary: 'Use elegant, literary language with rich vocabulary.',
};

export async function POST(req: Request) {
  try {
    const { text, from, to, tone = 'standard' } = await req.json();
    if (!text || !from || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${from} to ${to}. ${toneInstructions[tone] || ''} Preserve the original meaning, context, and formatting. Only output the translation, nothing else.`,
        },
        { role: 'user', content: text.slice(0, 10000) },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const translation = completion.choices[0]?.message?.content || 'Translation failed.';
    return NextResponse.json({ translation });
  } catch (error: unknown) {
    console.error('AI Translate error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
