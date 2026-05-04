'use client';

const QUICK_REPLIES = [
  'What should I cancel first?',
  'How much am I wasting per year?',
  'Show me all my streaming subscriptions',
  "What's my biggest bill I could negotiate?",
  'Write a cancellation email for my top subscription',
];

interface QuickRepliesProps {
  onSelect: (message: string) => void;
}

export default function QuickReplies({ onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          className="text-xs px-3 py-1.5 rounded-full border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-colors whitespace-nowrap"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
