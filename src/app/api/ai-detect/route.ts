import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'Text must be at least 50 characters' }, { status: 400 });
    }

    const systemPrompt = `You are an expert AI content detection system. Analyze the given text for signs of AI generation.

Evaluate:
1. **Perplexity** (0-100): How predictable is the word choice? Lower = more AI-like. AI text tends to be very predictable.
2. **Burstiness** (0-100): How varied are sentence lengths? Lower = more AI-like. AI tends to produce uniform sentence lengths.
3. **Vocabulary Diversity** (0-100): How varied is the vocabulary? Lower = more AI-like.
4. **Overall AI Probability** (0-100): Overall likelihood text is AI-generated.
5. **Sentence Analysis**: For each sentence, assign a label: "ai", "human", or "mixed".

Look for AI patterns:
- Overuse of transitions ("Furthermore", "Moreover", "In conclusion", "It's important to note")
- Uniform paragraph structure
- Lack of personal voice, colloquialisms, or imperfections
- Predictable sentence openings
- Lists and bullet-point-like structures in prose
- Overly formal or hedging language

Return ONLY valid JSON in this exact format:
{
  "aiProbability": <number 0-100>,
  "perplexity": <number 0-100>,
  "burstiness": <number 0-100>,
  "vocabularyDiversity": <number 0-100>,
  "verdict": "Likely AI-Generated" | "Likely Human-Written" | "Mixed",
  "sentences": [
    { "text": "...", "label": "ai" | "human" | "mixed", "confidence": <number 0-100> }
  ],
  "summary": "<brief explanation>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('AI Detect error:', error);
    const message = error instanceof Error ? error.message : 'Failed to analyze text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
