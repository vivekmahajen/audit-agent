import { anthropic, SONNET_MODEL } from '@/lib/claude';
import { buildNegotiatePrompt, buildCancelPrompt } from '@/lib/prompts/negotiate-prompt';
import type { Subscription } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { subscription, userName, type } = (await req.json()) as {
      subscription: Subscription;
      userName: string;
      type: 'negotiate' | 'cancel';
    };

    const prompt =
      type === 'negotiate'
        ? buildNegotiatePrompt(subscription, userName)
        : buildCancelPrompt(subscription, userName);

    const response = await anthropic.messages.create({
      model: SONNET_MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const draft = response.content[0].type === 'text' ? response.content[0].text : '';

    return Response.json({ draft });
  } catch (error) {
    console.error('Email draft error:', error);
    return Response.json({ error: 'Failed to draft email' }, { status: 500 });
  }
}
