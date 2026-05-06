import Link from 'next/link';
import { ArrowRight, Zap, Target, Mail, Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '7 days',
    description: 'Try Arlo free for one week. No credit card needed.',
    highlight: false,
    badge: null,
    features: [
      '10 audits per day',
      'Free for 7 days',
      'Subscription detection',
      'AI verdict for each charge',
      'Account required to track usage',
    ],
    cta: 'Start free trial',
    href: '/login?intent=trial',
  },
  {
    name: 'Pro',
    price: '$10',
    period: '/mo',
    description: 'Everything you need to take control of your bills.',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Unlimited audits',
      'Live bank sync (Plaid)',
      'Cancellation email drafter',
      'Negotiation email drafter',
      'Weekly digest alerts',
    ],
    cta: 'Get Pro',
    href: '/login?intent=pro',
  },
  {
    name: 'Business',
    price: '$49',
    period: '/mo',
    description: 'For teams who want to cut costs across the board.',
    highlight: false,
    badge: null,
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared subscription dashboard',
      'Priority support',
      'API access',
    ],
    cta: 'Get Business',
    href: '/login?intent=business',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-gray-900">Arlo</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/login?intent=trial"
            className="text-sm px-4 py-2 rounded-full bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
          >
            Try free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          Free 7-day trial — no credit card needed
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
          Your bills are bleeding you dry.{' '}
          <span className="text-violet-600">Arlo fixes that in 10 seconds.</span>
        </h1>

        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          Drop your bank statement. Arlo finds every subscription you forgot about, flags
          the waste, and drafts the cancellation emails for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login?intent=trial"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors text-sm"
          >
            Start free trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            Sign in
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Join 12,000+ people who found an average of $67/month in hidden waste
        </p>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-5 h-5 text-violet-600" />,
              title: 'Finds every recurring charge',
              body: 'Scans your full bank history and surfaces every subscription, no matter how buried.',
            },
            {
              icon: <Target className="w-5 h-5 text-violet-600" />,
              title: 'Tells you exactly what to cut',
              body: 'AI flags unused, duplicate, or overpriced services — with a clear reason for each.',
            },
            {
              icon: <Mail className="w-5 h-5 text-violet-600" />,
              title: 'Writes the emails for you',
              body: 'One click to get a polished cancellation or negotiation email, ready to send.',
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                {icon}
              </div>
              <p className="font-semibold text-sm text-gray-900 mb-1">{title}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Simple pricing</h2>
          <p className="text-sm text-gray-500">
            Start free for 7 days. Upgrade anytime to keep going.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
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
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-sm text-gray-500 pb-1">{plan.period}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  plan.highlight
                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Free trial requires a free account so we can track your usage. No credit card needed.
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Arlo · Built with love and Claude AI
      </footer>
    </div>
  );
}
