import { anthropic, HAIKU_MODEL } from '@/lib/claude';
import { createClient } from '@/lib/supabase';
import { buildClassifyPrompt } from '@/lib/prompts/classify-prompt';
import type { ClassifiedTransaction } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { transactions, userId } = await req.json();

    if (!transactions || transactions.length === 0) {
      return Response.json({ error: 'No transactions provided' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: buildClassifyPrompt(transactions),
        },
      ],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';
    let classified: ClassifiedTransaction[] = [];

    try {
      const jsonText = rawText.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      classified = JSON.parse(jsonText);
    } catch {
      return Response.json({ error: 'Failed to parse AI classification response' }, { status: 500 });
    }

    const recurring = classified.filter((t) => t.is_recurring);

    const merchantMap = new Map<string, ClassifiedTransaction>();
    for (const t of recurring) {
      const key = t.merchant_clean.toLowerCase();
      const existing = merchantMap.get(key);
      if (!existing || existing.amount < t.amount) {
        merchantMap.set(key, t);
      }
    }

    const subscriptionsToInsert = Array.from(merchantMap.values()).map((t) => ({
      user_id: userId,
      merchant: t.merchant_clean,
      amount: t.amount,
      cadence: t.recurrence_cadence === 'one-time' ? 'monthly' : t.recurrence_cadence,
      category: t.category,
      ai_verdict: t.ai_verdict,
      ai_reason: t.ai_reason,
      annual_cost:
        t.recurrence_cadence === 'monthly'
          ? t.amount * 12
          : t.recurrence_cadence === 'weekly'
          ? t.amount * 52
          : t.amount,
      status: 'active',
    }));

    let savedSubscriptions = subscriptionsToInsert;
    if (userId) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionsToInsert, { onConflict: 'user_id,merchant' })
        .select();

      if (error) {
        console.error('DB upsert error:', error);
      } else {
        savedSubscriptions = data ?? subscriptionsToInsert;
      }
    }

    const totalMonthly = subscriptionsToInsert.reduce((sum, s) => sum + s.amount, 0);
    const cancelCandidates = subscriptionsToInsert.filter((s) => s.ai_verdict === 'cancel');
    const potentialSavings = cancelCandidates.reduce((sum, s) => sum + s.amount, 0);

    return Response.json({
      subscriptions: savedSubscriptions,
      summary: {
        totalSubscriptions: subscriptionsToInsert.length,
        totalMonthly,
        potentialSavings,
        cancelCount: cancelCandidates.length,
      },
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return Response.json({ error: 'Failed to analyze transactions' }, { status: 500 });
  }
}
