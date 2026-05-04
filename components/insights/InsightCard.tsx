'use client';

import { cn, VERDICT_COLORS, VERDICT_LABELS, CATEGORY_ICONS, formatCurrency } from '@/lib/utils';
import type { Subscription } from '@/types';

interface InsightCardProps {
  subscription: Subscription;
  onAction?: (id: string, action: 'cancel' | 'negotiate' | 'keep') => void;
}

export default function InsightCard({ subscription, onAction }: InsightCardProps) {
  const verdictColor = VERDICT_COLORS[subscription.ai_verdict] ?? VERDICT_COLORS.review;
  const verdictLabel = VERDICT_LABELS[subscription.ai_verdict] ?? 'Review';
  const icon = CATEGORY_ICONS[subscription.category ?? 'other'] ?? '📦';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <p className="font-medium text-sm text-gray-900">{subscription.merchant}</p>
            <p className="text-xs text-gray-400 capitalize">{subscription.cadence}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-sm text-gray-900">
            {formatCurrency(subscription.amount)}/mo
          </p>
          <p className="text-xs text-gray-400">
            {formatCurrency(subscription.annual_cost)}/yr
          </p>
        </div>
      </div>

      <div className={cn('rounded-lg px-3 py-2 text-xs flex items-center gap-2', verdictColor)}>
        <span className="font-semibold">{verdictLabel}</span>
        <span className="text-current opacity-80">— {subscription.ai_reason}</span>
      </div>

      {onAction && subscription.ai_verdict !== 'keep' && (
        <div className="flex gap-2">
          {subscription.ai_verdict === 'cancel' && (
            <button
              onClick={() => onAction(subscription.id, 'cancel')}
              className="flex-1 text-xs py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Draft cancellation email
            </button>
          )}
          {subscription.ai_verdict === 'negotiate' && (
            <button
              onClick={() => onAction(subscription.id, 'negotiate')}
              className="flex-1 text-xs py-1.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
            >
              Draft negotiation email
            </button>
          )}
          <button
            onClick={() => onAction(subscription.id, 'keep')}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Keep
          </button>
        </div>
      )}
    </div>
  );
}
