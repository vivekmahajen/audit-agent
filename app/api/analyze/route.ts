import { anthropic, HAIKU_MODEL } from '@/lib/claude';
import { createClient } from '@/lib/supabase';
import { buildClassifyPrompt } from '@/lib/prompts/classify-prompt';
import type { ClassifiedTransaction } from '@/types';

export const runtime = 'nodejs';

const FREE_DAILY_LIMIT = 10;
const TRIAL_DAYS = 7;

export async function POST(req: Request) {
  try {
    // Auth is required — no anonymous analysis
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { error: 'Account required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Fetch profile for plan + trial info
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, trial_started_at')
      .eq('id', user.id)
      .single();

    const plan = profile?.plan ?? 'free';
    const isPaid = plan === 'pro' || plan === 'business';

    if (!isPaid) {
      // Set trial_started_at on first use
      if (!profile?.trial_started_at) {
        await supabase
          .from('profiles')
          .update({ trial_started_at: new Date().toISOString() })
          .eq('id', user.id);
      }

      const trialStart = profile?.trial_started_at
        ? new Date(profile.trial_started_at)
        : new Date();
      const daysSinceTrial = (Date.now() - trialStart.getTime()) / (1000 * 60 * 60 * 24);

      // Trial expired
      if (daysSinceTrial > TRIAL_DAYS) {
        return Response.json(
          { error: 'Your free trial has expired. Upgrade to keep auditing.', code: 'TRIAL_EXPIRED' },
          { status: 403 }
        );
      }

      // Check daily usage
      const today = new Date().toISOString().slice(0, 10);
      const { data: usage } = await supabase
        .from('daily_usage')
        .select('audit_count')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const todayCount = usage?.audit_count ?? 0;

      if (todayCount >= FREE_DAILY_LIMIT) {
        return Response.json(
          { error: `Daily limit reached (${FREE_DAILY_LIMIT} audits/day on the free trial). Upgrade for unlimited access.`, code: 'DAILY_LIMIT' },
          { status: 403 }
        );
      }

      // Increment daily usage
      await supabase
        .from('daily_usage')
        .upsert(
          { user_id: user.id, date: today, audit_count: todayCount + 1 },
          { onConflict: 'user_id,date' }
        );
    }

    const { transactions } = await req.json();

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
      user_id: user.id,
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
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionsToInsert, { onConflict: 'user_id,merchant' })
      .select();

    if (error) {
      console.error('DB upsert error:', error);
    } else {
      savedSubscriptions = data ?? subscriptionsToInsert;
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
