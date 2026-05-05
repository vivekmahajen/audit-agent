'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import type { Subscription } from '@/types';

interface EmailDraftModalProps {
  subscription: Subscription;
  type: 'cancel' | 'negotiate';
  userName: string;
  onClose: () => void;
  onActionRecorded?: () => void;
}

export default function EmailDraftModal({
  subscription,
  type,
  userName,
  onClose,
  onActionRecorded,
}: EmailDraftModalProps) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    async function fetchDraft() {
      try {
        const res = await fetch('/api/email-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription, userName, type }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to generate email');
        setDraft(data.draft);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    fetchDraft();
  }, [subscription, userName, type]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecordAction = async () => {
    setRecording(true);
    try {
      await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          actionType: type === 'cancel' ? 'email_drafted' : 'email_drafted',
          amountSavedMonthly: type === 'cancel' ? subscription.amount : undefined,
          emailDraft: draft,
        }),
      });
      onActionRecorded?.();
    } catch {
      // Non-critical — don't block the user
    } finally {
      setRecording(false);
      onClose();
    }
  };

  const title = type === 'cancel'
    ? `Cancellation email — ${subscription.merchant}`
    : `Negotiation email — ${subscription.merchant}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Drafting your email...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full h-64 text-sm text-gray-800 leading-relaxed resize-none outline-none font-mono bg-gray-50 rounded-xl border border-gray-200 p-4 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
            />
          )}
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="flex gap-2 px-5 py-4 border-t border-gray-100">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleRecordAction}
              disabled={recording}
              className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {recording ? 'Saving...' : 'Done — mark as drafted'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
