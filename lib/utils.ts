import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const VERDICT_COLORS = {
  keep: 'text-green-600 bg-green-50',
  cancel: 'text-red-600 bg-red-50',
  negotiate: 'text-amber-600 bg-amber-50',
  review: 'text-blue-600 bg-blue-50',
} as const;

export const VERDICT_LABELS = {
  keep: 'Keep',
  cancel: 'Cancel',
  negotiate: 'Negotiate',
  review: 'Review',
} as const;

export const CATEGORY_ICONS: Record<string, string> = {
  streaming: '🎬',
  software: '💻',
  gym: '💪',
  food: '🍔',
  utility: '⚡',
  insurance: '🛡️',
  phone: '📱',
  internet: '🌐',
  news: '📰',
  gaming: '🎮',
  cloud: '☁️',
  other: '📦',
};
