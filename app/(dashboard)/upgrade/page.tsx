import Link from 'next/link';
import { Check } from 'lucide-react';

const PAID_PLANS = [
  {
    name: 'Pro',
    price: '$10',
    period: '/mo',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Unlimited audits',
      'Live bank sync (Plaid)',
      'Cancellation email drafter',
      'Negotiation email drafter',
      'Weekly digest alerts',
    ],
    action: '/api/stripe/create-checkout',
  },
  {
    name: 'Business',
    price: '$49',
    period: '/mo',
    highlight: false,
    badge: null,
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared subscription dashboard',
      'Priority support',
      'API access',
    ],
    action: '/api/stripe/create-checkout?plan=business',
  },
];

export default function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-center">
      <p className="text-4xl mb-4">⏰</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Your free trial has ended</h1>
      <p className="text-sm text-gray-500 mb-10 max-w-md mx-auto">
        You&apos;ve used your 7-day free trial. Upgrade to keep auditing your bills and finding
        hidden waste.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 text-left mb-8">
        {PAID_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 flex flex-col relative ${
              plan.highlight
                ? 'border-2 border-violet-500 bg-violet-50'
                : 'border border-gray-200 bg-white'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-5 text-xs px-2.5 py-0.5 rounded-full bg-violet-600 text-white font-medium">
                {plan.badge}
              </div>
            )}

            <div className="mb-4">
              <p className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-violet-700' : 'text-gray-900'}`}>
                {plan.name}
              </p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-500 pb-1">{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <form action={plan.action} method="POST">
              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Get {plan.name}
              </button>
            </form>
          </div>
        ))}
      </div>

      <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 underline">
        Back to home
      </Link>
    </div>
  );
}
