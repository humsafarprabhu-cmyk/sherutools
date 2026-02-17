import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { email, instruction } = await req.json();

    if (!email || !instruction) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert email editor. Modify the given email according to the instruction. Keep the same format: SUBJECT: [subject]\n\n[email body]',
        },
        {
          role: 'user',
          content: `Here is the email:\n\n${email}\n\nInstruction: ${instruction}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ email: completion.choices[0].message.content });
  } catch (error: unknown) {
    console.error('AI Email Edit error:', error);
    const message = error instanceof Error ? error.message : 'Failed to edit email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
