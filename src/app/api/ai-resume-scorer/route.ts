import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || resumeText.length < 50) {
      return NextResponse.json({ error: 'Please paste at least 50 characters of resume text.' }, { status: 400 });
    }

    const jobContext = jobDescription 
      ? `\n\nJOB DESCRIPTION TO MATCH AGAINST:\n${jobDescription.substring(0, 2000)}`
      : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert resume reviewer and career coach. Analyze the given resume and provide detailed scoring and feedback.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "overall": <number 0-100>,
  "sections": [
    {
      "name": "Content Quality",
      "score": <number 0-100>,
      "feedback": "<1-2 sentence assessment>",
      "tips": ["<actionable tip 1>", "<actionable tip 2>"]
    },
    {
      "name": "Impact Statements",
      "score": <number 0-100>,
      "feedback": "<assessment of action verbs, metrics, achievements>",
      "tips": ["<tip>"]
    },
    {
      "name": "Formatting & Structure",
      "score": <number 0-100>,
      "feedback": "<assessment of sections, layout, readability>",
      "tips": ["<tip>"]
    },
    {
      "name": "Keyword Optimization",
      "score": <number 0-100>,
      "feedback": "<assessment of relevant industry keywords>",
      "tips": ["<tip>"]
    },
    {
      "name": "Length & Completeness",
      "score": <number 0-100>,
      "feedback": "<is it too short/long, missing sections?>",
      "tips": ["<tip>"]
    }
  ],
  "keywords": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "atsScore": <number 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

Scoring guidelines:
- 90-100: Exceptional, ready for top companies
- 80-89: Strong, minor improvements possible
- 70-79: Good, some areas need work
- 60-69: Average, significant improvements needed
- Below 60: Needs major revision
- Be honest but constructive
- Focus on actionable tips
- Check for: metrics/numbers in achievements, action verbs, relevant keywords, proper sections (contact, experience, education, skills), appropriate length
- ATS score: check for clean formatting, standard section headers, no tables/columns/graphics mentioned, keyword density`
        },
        {
          role: 'user',
          content: `Analyze this resume:\n\n${resumeText.substring(0, 5000)}${jobContext}`
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content || '';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          parsed = JSON.parse(content.substring(start, end + 1));
        } else {
          throw new Error('Failed to parse AI response');
        }
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error('Resume scorer error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
