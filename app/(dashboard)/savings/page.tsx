import { createClient } from '@/lib/supabase';
import SavingsCard from '@/components/insights/SavingsCard';
import SubscriptionList from '@/components/insights/SubscriptionList';
import Link from 'next/link';
import type { Subscription } from '@/types';

export default async function SavingsPage() {
  let subscriptions: Subscription[] = [];
  let totalSaved = 0;
  let actionsCount = 0;
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;

      const [subsResult, actionsResult] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('amount', { ascending: false }),
        supabase
          .from('actions')
          .select('amount_saved_monthly')
          .eq('user_id', user.id),
      ]);

      subscriptions = (subsResult.data as Subscription[]) ?? [];
      const actions = actionsResult.data ?? [];
      totalSaved = actions.reduce((sum, a) => sum + (a.amount_saved_monthly ?? 0), 0);
      actionsCount = actions.length;
    }
  } catch {
    // Not authenticated
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in to see your savings</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your savings history is saved to your account.
        </p>
        <Link
          href="/login"
          className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Your savings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here&apos;s what Arlo found for you</p>
      </div>

      {totalSaved > 0 && (
        <SavingsCard monthlySavings={totalSaved} actionsCount={actionsCount} />
      )}

      {subscriptions.length > 0 ? (
        <SubscriptionList subscriptions={subscriptions} />
      ) : (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">📂</p>
          <p className="text-sm font-medium text-gray-700">No subscriptions found yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload a bank statement in the chat to get started
          </p>
          <Link
            href="/dashboard/chat"
            className="inline-block mt-4 px-4 py-2 rounded-full bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition-colors"
          >
            Go to chat
          </Link>
        </div>
      )}
    </div>
  );
}
