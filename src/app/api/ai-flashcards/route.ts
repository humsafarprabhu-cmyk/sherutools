import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, numCards = 10, difficulty = 'Medium', language = 'English' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const systemPrompt = `You are a flashcard generator. Given text, create study flashcards as a JSON object with a "cards" key containing an array of {front, back} pairs. Make questions clear and answers concise. Generate exactly ${numCards} cards. Difficulty level: ${difficulty}. Language: ${language}. For Easy: basic recall questions. For Medium: understanding and application. For Hard: analysis, synthesis, and tricky edge cases.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    const parsed = JSON.parse(content || '{"cards":[]}');
    const cards = parsed.cards || parsed.flashcards || [];

    return NextResponse.json({ cards });
  } catch (error: unknown) {
    console.error('AI Flashcards error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate flashcards';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
