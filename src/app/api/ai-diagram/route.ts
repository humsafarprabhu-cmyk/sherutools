import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a diagram generator. Given a description and diagram type, generate valid Mermaid.js syntax.

Supported types: flowchart, sequence, classDiagram, stateDiagram-v2, erDiagram, gantt, pie, mindmap, timeline.

Rules:
- Return ONLY the Mermaid code, no markdown fences, no explanations
- Ensure the syntax is valid and will render without errors
- Use descriptive labels and meaningful node names
- For flowcharts, use TD (top-down) direction by default
- Keep diagrams readable — not too many nodes (8-15 is ideal)
- Use proper Mermaid syntax for the requested diagram type`;

const FIX_PROMPT = `The following Mermaid diagram code has a parse error. Fix it and return ONLY the corrected Mermaid code, no explanations or markdown fences.

Error: {error}

Code:
{code}`;

export async function POST(req: NextRequest) {
  try {
    const { description, diagramType, fixCode, fixError } = await req.json();

    if (fixCode && fixError) {
      // Self-correction mode
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: FIX_PROMPT.replace('{error}', fixError).replace('{code}', fixCode) },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      return NextResponse.json({ code: completion.choices[0].message.content?.trim() });
    }

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const typeHint = diagramType ? `Generate a ${diagramType} diagram.` : 'Choose the best diagram type.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `${typeHint}\n\nDescription: ${description}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const code = completion.choices[0].message.content?.trim() || '';
    return NextResponse.json({ code });
  } catch (error: unknown) {
    console.error('AI Diagram error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate diagram';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
