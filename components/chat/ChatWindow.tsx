'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import QuickReplies from './QuickReplies';
import UploadZone from '../upload/UploadZone';
import type { Message, AnalysisSummary } from '@/types';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! I'm Arlo, your money assistant 👋\n\nDrop your bank statement below and I'll find everything you're paying for — and flag anything that looks like a waste. Takes about 10 seconds.",
};

interface ChatWindowProps {
  userId?: string;
}

export default function ChatWindow({ userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleUploadComplete = useCallback((summary: AnalysisSummary) => {
    setHasData(true);
    setShowQuickReplies(true);

    const introMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Nice, I've gone through your transactions! Here's what I found:

📦 **${summary.totalSubscriptions} active subscriptions** — $${summary.totalMonthly.toFixed(0)}/month total
🚨 **${summary.cancelCount} subscription${summary.cancelCount !== 1 ? 's' : ''}** I'd flag for cancellation
💰 **Potential savings: $${summary.potentialSavings.toFixed(0)}/month** ($${(summary.potentialSavings * 12).toFixed(0)}/year)

Want me to walk you through what I'd cut first?`,
    };

    setMessages((prev) => [...prev, introMessage]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      setShowQuickReplies(false);

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      const assistantId = `assistant_${Date.now() + 1}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error('Chat request failed');
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + data.text }
                      : m
                  )
                );
              } catch {
                // Skip malformed SSE lines
              }
            }
          }
        }

        setShowQuickReplies(true);
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    "Sorry, something went wrong. Could you try again?",
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [messages, userId]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Upload zone shown only when no data yet */}
        {!hasData && messages.length === 1 && (
          <div className="mt-4">
            <UploadZone userId={userId} onComplete={handleUploadComplete} />
          </div>
        )}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="ml-9">
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick reply chips */}
      {hasData && showQuickReplies && !isLoading && (
        <QuickReplies onSelect={sendMessage} />
      )}

      {/* Chat input */}
      {hasData && <ChatInput onSend={sendMessage} disabled={isLoading} />}
    </div>
  );
}
