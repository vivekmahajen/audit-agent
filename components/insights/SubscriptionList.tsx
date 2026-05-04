'use client';

import { useState } from 'react';
import InsightCard from './InsightCard';
import { formatCurrency } from '@/lib/utils';
import type { Subscription } from '@/types';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onAction?: (id: string, action: 'cancel' | 'negotiate' | 'keep') => void;
}

type Filter = 'all' | 'cancel' | 'negotiate' | 'review' | 'keep';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cancel', label: '🚨 Cancel' },
  { value: 'negotiate', label: '💬 Negotiate' },
  { value: 'review', label: '👀 Review' },
  { value: 'keep', label: '✅ Keep' },
];

export default function SubscriptionList({ subscriptions, onAction }: SubscriptionListProps) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all'
    ? subscriptions
    : subscriptions.filter((s) => s.ai_verdict === filter);

  const totalMonthly = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{subscriptions.length}</p>
          <p className="text-xs text-gray-500">Subscriptions</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3 text-center">
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalMonthly)}</p>
          <p className="text-xs text-gray-500">Per month</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-3 text-center">
          <p className="text-xl font-bold text-violet-700">
            {formatCurrency(totalMonthly * 12)}
          </p>
          <p className="text-xs text-violet-500">Per year</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ value, label }) => {
          const count = value === 'all'
            ? subscriptions.length
            : subscriptions.filter((s) => s.ai_verdict === value).length;

          if (count === 0 && value !== 'all') return null;

          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                filter === value
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No subscriptions in this category</p>
        ) : (
          filtered.map((sub) => (
            <InsightCard key={sub.id} subscription={sub} onAction={onAction} />
          ))
        )}
      </div>
    </div>
  );
}
