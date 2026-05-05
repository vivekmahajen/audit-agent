'use client';

import { useState } from 'react';
import SubscriptionList from './SubscriptionList';
import EmailDraftModal from './EmailDraftModal';
import type { Subscription } from '@/types';

interface SubscriptionActionsProps {
  subscriptions: Subscription[];
  userName: string;
}

interface ModalState {
  subscription: Subscription;
  type: 'cancel' | 'negotiate';
}

export default function SubscriptionActions({ subscriptions, userName }: SubscriptionActionsProps) {
  const [modal, setModal] = useState<ModalState | null>(null);

  const handleAction = (id: string, action: 'cancel' | 'negotiate' | 'keep') => {
    if (action === 'keep') return;
    const sub = subscriptions.find((s) => s.id === id);
    if (!sub) return;
    setModal({ subscription: sub, type: action });
  };

  return (
    <>
      <SubscriptionList subscriptions={subscriptions} onAction={handleAction} />
      {modal && (
        <EmailDraftModal
          subscription={modal.subscription}
          type={modal.type}
          userName={userName}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
