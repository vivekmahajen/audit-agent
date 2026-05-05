import Link from 'next/link';
import { MessageCircle, TrendingDown, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      {/* Top nav */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-gray-900 text-sm">Arlo</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chat
          </Link>
          <Link
            href="/savings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Savings
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
