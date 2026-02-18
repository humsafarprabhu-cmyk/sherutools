import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const stylePrompts: Record<string, string> = {
  concise: 'Provide a concise 2-3 sentence summary capturing the main points.',
  bullet: 'Summarize as 5-8 bullet points, each capturing a key point. Use "•" for bullets.',
  detailed: 'Provide a detailed summary with sections: Main Idea, Key Points, Supporting Details, and Conclusion.',
  eli5: 'Explain this like I\'m 5 years old. Use simple words and short sentences. Make it fun and easy to understand.',
  academic: 'Provide a formal academic summary with proper structure: Abstract, Key Findings, Methodology (if applicable), and Implications.',
};

export async function POST(req: Request) {
  try {
    const { text, style = 'concise' } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const prompt = stylePrompts[style] || stylePrompts.concise;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are an expert text summarizer. ${prompt} Be accurate and preserve the original meaning.` },
        { role: 'user', content: `Summarize the following text:\n\n${text.slice(0, 15000)}` },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || 'Unable to generate summary.';
    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error('AI Summarize error:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
