import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import ChatWindow from '@/components/chat/ChatWindow';

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?intent=trial');
  }

  // Check trial/plan status to pass down to the client
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, trial_started_at')
    .eq('id', user.id)
    .single();

  const plan = profile?.plan ?? 'free';
  const isPaid = plan === 'pro' || plan === 'business';

  let trialExpired = false;
  if (!isPaid && profile?.trial_started_at) {
    const daysSinceTrial =
      (Date.now() - new Date(profile.trial_started_at).getTime()) / (1000 * 60 * 60 * 24);
    trialExpired = daysSinceTrial > 7;
  }

  if (trialExpired) {
    redirect('/upgrade');
  }

  return (
    <div className="h-full max-w-2xl mx-auto flex flex-col">
      <ChatWindow userId={user.id} />
    </div>
  );
}
