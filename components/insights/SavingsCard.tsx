'use client';

import { formatCurrency } from '@/lib/utils';
import { TrendingDown } from 'lucide-react';

interface SavingsCardProps {
  monthlySavings: number;
  actionsCount: number;
}

export default function SavingsCard({ monthlySavings, actionsCount }: SavingsCardProps) {
  const annualSavings = monthlySavings * 12;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-4 h-4 opacity-80" />
        <p className="text-sm font-medium opacity-80">Total saved with Arlo</p>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-4xl font-bold">{formatCurrency(monthlySavings)}</p>
        <p className="text-sm opacity-70">per month · {formatCurrency(annualSavings)}/year</p>
      </div>

      <div className="border-t border-white/20 pt-3">
        <p className="text-xs opacity-60">
          {actionsCount} subscription{actionsCount !== 1 ? 's' : ''} cancelled or negotiated
        </p>
      </div>
    </div>
  );
}
