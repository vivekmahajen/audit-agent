import Link from 'next/link';
import { ArrowRight, Zap, Target, Mail } from 'lucide-react';

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
            href="/chat"
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
          Free audit — no account needed
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
            href="/chat"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors text-sm"
          >
            Audit my bills — it&apos;s free
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
      <div className="max-w-xl mx-auto px-6 pb-20 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Simple pricing</h2>
        <p className="text-sm text-gray-500 mb-8">Start free. Upgrade when you want more.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 p-5 text-left">
            <p className="text-sm font-semibold text-gray-900 mb-1">Free</p>
            <p className="text-2xl font-bold text-gray-900 mb-3">$0</p>
            <ul className="space-y-1.5 text-sm text-gray-500">
              <li>✓ One-time CSV audit</li>
              <li>✓ Subscription detection</li>
              <li>✓ AI verdict for each charge</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-violet-500 bg-violet-50 p-5 text-left relative">
            <div className="absolute -top-3 left-4 text-xs px-2 py-0.5 rounded-full bg-violet-600 text-white font-medium">
              Popular
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Pro</p>
            <p className="text-2xl font-bold text-gray-900 mb-3">
              $10<span className="text-sm font-normal text-gray-500">/mo</span>
            </p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li>✓ Everything in Free</li>
              <li>✓ Live bank sync (Plaid)</li>
              <li>✓ Cancellation email drafter</li>
              <li>✓ Negotiation email drafter</li>
              <li>✓ Weekly digest alerts</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Arlo · Built with love and Claude AI
      </footer>
    </div>
  );
}
