import { createClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  let profile = null;
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
    }
  } catch {
    // Not authenticated
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <p className="text-4xl mb-4">👤</p>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sign in to manage settings</h2>
        <Link
          href="/login"
          className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const isPro = profile?.plan === 'pro';

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 overflow-y-auto h-full">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and subscription</p>
      </div>

      {params.success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          🎉 You&apos;re now on Pro! Enjoy unlimited access.
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Account</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="text-gray-900 font-medium">{profile?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="text-gray-900 font-medium">{profile?.email ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Plan</span>
            <span className={`font-semibold ${isPro ? 'text-violet-600' : 'text-gray-900'}`}>
              {isPro ? 'Pro ✨' : 'Free'}
            </span>
          </div>
        </div>
      </div>

      {!isPro && (
        <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Upgrade to Pro</h2>
            <p className="text-xs text-gray-500 mt-1">
              Get live bank sync, weekly alerts, and email drafts for $10/month.
            </p>
          </div>
          <form action="/api/stripe/create-checkout" method="POST">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              Upgrade to Pro — $10/month
            </button>
          </form>
        </div>
      )}

      {isPro && (
        <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Subscription</h2>
          <p className="text-xs text-gray-500">
            You&apos;re on the Pro plan. To cancel, email support@arlo.ai.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Danger zone</h2>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
