import { anthropic, SONNET_MODEL } from '@/lib/claude';
import { createClient } from '@/lib/supabase';
import { ARLO_SYSTEM_PROMPT } from '@/lib/prompts/system-prompt';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    let systemWithContext = ARLO_SYSTEM_PROMPT;

    if (userId) {
      try {
        const supabase = await createClient();
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active');

        const { data: actions } = await supabase
          .from('actions')
          .select('amount_saved_monthly')
          .eq('user_id', userId);

        const totalSaved =
          actions?.reduce((sum, a) => sum + (a.amount_saved_monthly ?? 0), 0) ?? 0;

        systemWithContext = `
${ARLO_SYSTEM_PROMPT}

USER'S CURRENT DATA:
Active subscriptions: ${JSON.stringify(subscriptions ?? [], null, 2)}
Total saved so far: $${totalSaved.toFixed(2)}/month
`;
      } catch {
        // Continue without context if DB fetch fails
      }
    }

    const stream = anthropic.messages.stream({
      model: SONNET_MODEL,
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
