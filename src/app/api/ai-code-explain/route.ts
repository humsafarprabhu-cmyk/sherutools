import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const levelPrompts: Record<string, string> = {
  beginner:
    'Explain like I\'m a complete beginner who has never coded before. Use analogies and real-world comparisons. No jargon — if you must use a technical term, define it simply.',
  intermediate:
    'Explain for someone with basic programming knowledge. They understand variables, loops, and functions but may not know advanced patterns.',
  advanced:
    'Explain with technical depth. Mention design patterns, time/space complexity, edge cases, and architectural considerations.',
};

export async function POST(req: NextRequest) {
  try {
    const { code, language, level, simplify } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const detailLevel = levelPrompts[level] || levelPrompts.intermediate;

    const systemPrompt = `You are an expert code explainer. ${detailLevel}

${simplify ? 'The user wants an even SIMPLER explanation. Use very basic language, short sentences, and more analogies.' : ''}

Analyze the provided ${language || 'code'} and respond with ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "summary": "1-2 sentence summary of what this code does",
  "explanation": "Detailed line-by-line or block-by-block explanation. Use numbered sections like '1. ...' for each significant block. Be thorough.",
  "concepts": ["concept1", "concept2", "concept3"],
  "issues": ["potential issue or improvement 1", "potential issue 2"]
}

If there are no issues, return an empty array for issues. Always return at least 1 concept.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: code },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const raw = completion.choices[0].message.content || '{}';
    
    // Try to parse JSON from the response
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON from markdown code fences
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        parsed = { summary: raw, explanation: raw, concepts: [], issues: [] };
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('AI Code Explain error:', error);
    const message = error instanceof Error ? error.message : 'Failed to explain code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
