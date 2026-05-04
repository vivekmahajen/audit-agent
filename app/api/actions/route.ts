import { createClient } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, actionType, amountSavedMonthly, emailDraft } = await req.json();

    const { data, error } = await supabase
      .from('actions')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        action_type: actionType,
        amount_saved_monthly: amountSavedMonthly,
        email_draft: emailDraft,
      })
      .select()
      .single();

    if (error) throw error;

    if (actionType === 'cancelled') {
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);
    }

    return Response.json({ action: data });
  } catch (error) {
    console.error('Action API error:', error);
    return Response.json({ error: 'Failed to record action' }, { status: 500 });
  }
}
