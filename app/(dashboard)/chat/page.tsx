import { createClient } from '@/lib/supabase';
import ChatWindow from '@/components/chat/ChatWindow';

export default async function ChatPage() {
  let userId: string | undefined;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  } catch {
    // User not authenticated — chat still works anonymously
  }

  return (
    <div className="h-full max-w-2xl mx-auto flex flex-col">
      <ChatWindow userId={userId} />
    </div>
  );
}
