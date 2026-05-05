import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are FormIQ, an expert assistant specialising in explaining official forms — government, tax, immigration, HR, medical, and legal.

When given a form name, you return a structured JSON object with EXACTLY this shape:

{
  "found": true,
  "form_name": "Official full name of the form",
  "common_name": "What people commonly call it",
  "issued_by": "The agency or organisation that issues it",
  "purpose": "2-3 sentence plain English explanation of what this form is for",
  "who_needs_it": ["bullet 1", "bullet 2", "bullet 3"],
  "deadline": "When it must be filed, or null if not applicable",
  "where_to_submit": "Where to send or submit it, or null if not applicable",
  "instructions": [
    {
      "field": "Exact field name as printed on the form",
      "instruction": "Plain English instruction for this field",
      "warning": "Optional: common mistake or tricky note, or null"
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"],
  "sample": [
    {
      "field": "Exact field name",
      "value": "Realistic dummy value using Alex Rivera, SSN XXX-XX-1234, 142 Maple Street Austin TX 78701, employer Brightpath Solutions Inc."
    }
  ]
}

If you do not recognise the form name or cannot provide reliable information, return:
{
  "found": false,
  "message": "Brief explanation of why the form wasn't found"
}

Return ONLY valid JSON. No markdown, no backticks, no preamble, no explanation outside the JSON object.`;

export async function POST(req: Request) {
  try {
    const { formName } = await req.json();

    if (!formName?.trim()) {
      return NextResponse.json({ error: 'Form name is required' }, { status: 400 });
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Form name: ${formName.trim()}` }],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('');

    return NextResponse.json({ text });
  } catch (err) {
    console.error('FormIQ API error:', err);
    return NextResponse.json({ error: 'Failed to look up form' }, { status: 500 });
  }
}
