import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { purpose, tone, recipient, keyPoints, length } = await req.json();

    if (!purpose || !tone || !recipient || !keyPoints) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const lengthGuide: Record<string, string> = {
      short: '3-5 sentences',
      medium: '2-3 paragraphs',
      long: '4-6 paragraphs',
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert email writer. Write professional, clear, and effective emails. Always provide a subject line first, then the email body. Format: SUBJECT: [subject]\n\n[email body]',
        },
        {
          role: 'user',
          content: `Write a ${tone} ${purpose} email to ${recipient}. Length: ${lengthGuide[length] || lengthGuide.medium}. Key points to include: ${keyPoints}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ email: completion.choices[0].message.content });
  } catch (error: unknown) {
    console.error('AI Email error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
