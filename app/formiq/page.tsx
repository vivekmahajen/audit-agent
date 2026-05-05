'use client';

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormInstruction {
  field: string;
  instruction: string;
  warning: string | null;
}

interface SampleField {
  field: string;
  value: string;
}

interface FoundResult {
  found: true;
  form_name: string;
  common_name: string;
  issued_by: string;
  purpose: string;
  who_needs_it: string[];
  deadline: string | null;
  where_to_submit: string | null;
  instructions: FormInstruction[];
  tips: string[];
  sample: SampleField[];
}

interface NotFoundResult {
  found: false;
  message: string;
}

type FormResult = FoundResult | NotFoundResult;
type Tab = 'overview' | 'instructions' | 'sample';

const FREE_LIMIT = 5;

// ─── Sub-components ──────────────────────────────────────────────────────────

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-5xl mb-4" aria-hidden="true">🔒</div>
          <h2
            id="paywall-title"
            className="text-2xl font-bold text-[#0F1E3C] mb-2 font-formiq-serif"
          >
            You&apos;ve used your 5 free lookups.
          </h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Upgrade to Pro for unlimited access, PDF export, form history, and team sharing.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
            <p className="text-3xl font-bold text-[#0F1E3C] font-formiq-serif">
              $29
              <span className="text-base font-normal text-gray-500">/month</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">FormIQ Pro — Unlimited everything</p>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-amber-400 text-[#0F1E3C] font-bold hover:bg-amber-500 transition-colors mb-3 text-sm"
            aria-label="Upgrade to FormIQ Pro"
          >
            Upgrade to Pro
          </button>
          <button
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            onClick={onClose}
            aria-label="Dismiss paywall and continue"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ result }: { result: FoundResult }) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Purpose
        </h3>
        <p className="text-gray-700 text-sm leading-relaxed">{result.purpose}</p>
      </div>

      <div>
        <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Who Needs It
        </h3>
        <ul className="space-y-1.5">
          {result.who_needs_it.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-amber-500 mt-0.5 shrink-0" aria-hidden="true">•</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {result.deadline && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Deadline / When to File
            </h3>
            <p className="text-sm text-gray-700">{result.deadline}</p>
          </div>
        )}
        {result.where_to_submit && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Where to Submit
            </h3>
            <p className="text-sm text-gray-700">{result.where_to_submit}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InstructionsTab({ result }: { result: FoundResult }) {
  return (
    <div className="animate-fade-in">
      <ol className="space-y-5" aria-label="Field-by-field instructions">
        {result.instructions.map((item, i) => (
          <li key={i} className="border-l-2 border-gray-100 pl-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs text-gray-400 shrink-0 w-5">{i + 1}.</span>
              <code className="text-sm font-semibold text-[#0F1E3C] font-formiq-mono">
                {item.field}
              </code>
            </div>
            <p className="text-sm text-gray-600 ml-7 leading-relaxed">{item.instruction}</p>
            {item.warning && (
              <p className="text-sm text-amber-700 ml-7 mt-2 flex items-start gap-1.5">
                <span aria-label="Warning" className="shrink-0">⚠️</span>
                <span>{item.warning}</span>
              </p>
            )}
          </li>
        ))}
      </ol>

      {result.tips.length > 0 && (
        <div className="mt-8 rounded-xl bg-amber-50 border border-amber-100 p-5">
          <h3 className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest mb-3">
            Tips
          </h3>
          <ul className="space-y-2">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SampleTab({ result }: { result: FoundResult }) {
  return (
    <div className="animate-fade-in">
      <div className="relative rounded-xl border border-gray-200 overflow-hidden">
        {/* Watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="text-gray-300 font-bold text-base sm:text-xl tracking-widest select-none whitespace-nowrap font-formiq-mono"
            style={{ transform: 'rotate(-25deg)', opacity: 0.5 }}
          >
            SAMPLE — NOT FOR SUBMISSION
          </span>
        </div>

        {/* Fields */}
        <div className="relative">
          {result.sample.map((item, i) => (
            <div
              key={i}
              className={`flex gap-3 px-4 py-3 text-xs ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              <span className="text-gray-400 shrink-0 w-40 sm:w-52 font-formiq-mono leading-relaxed pt-0.5 break-words">
                {item.field}
              </span>
              <span className="text-gray-300 shrink-0" aria-hidden="true">→</span>
              <span className="text-[#0F1E3C] font-medium font-formiq-mono leading-relaxed">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsPanel({
  result,
  activeTab,
  setActiveTab,
}: {
  result: FoundResult;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'sample', label: 'Filled Sample' },
  ];

  function handleTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, currentId: Tab) {
    const idx = tabs.findIndex(t => t.id === currentId);
    if (e.key === 'ArrowRight') {
      setActiveTab(tabs[(idx + 1) % tabs.length].id);
    } else if (e.key === 'ArrowLeft') {
      setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length].id);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-fade-in">
      {/* Form header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-[#0F1E3C] font-formiq-serif">
              {result.form_name}
            </h2>
            {result.common_name && result.common_name !== result.form_name && (
              <p className="text-sm text-gray-400 mt-0.5">&ldquo;{result.common_name}&rdquo;</p>
            )}
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 whitespace-nowrap self-start mt-1">
            {result.issued_by}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-100 px-4 gap-1">
        <div className="flex flex-1 gap-0" role="tablist" aria-label="Form information sections">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={e => handleTabKeyDown(e, tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                activeTab === tab.id
                  ? 'border-amber-400 text-[#0F1E3C]'
                  : 'border-transparent text-gray-400 hover:text-[#0F1E3C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pro badge with tooltip */}
        <div className="relative group ml-2">
          <span
            className="inline-flex items-center text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold cursor-default tracking-wide"
            aria-label="Pro feature"
          >
            PRO
          </span>
          <div
            className="absolute right-0 top-8 w-60 bg-[#0F1E3C] text-white text-xs rounded-lg px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 leading-relaxed shadow-xl"
            role="tooltip"
          >
            Upgrade to Pro for PDF export, form history, and team sharing — $29/month
            <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[#0F1E3C] rotate-45" />
          </div>
        </div>
      </div>

      {/* Tab panels */}
      <div className="p-6">
        <div
          id="tabpanel-overview"
          role="tabpanel"
          aria-labelledby="tab-overview"
          hidden={activeTab !== 'overview'}
        >
          {activeTab === 'overview' && <OverviewTab result={result} />}
        </div>
        <div
          id="tabpanel-instructions"
          role="tabpanel"
          aria-labelledby="tab-instructions"
          hidden={activeTab !== 'instructions'}
        >
          {activeTab === 'instructions' && <InstructionsTab result={result} />}
        </div>
        <div
          id="tabpanel-sample"
          role="tabpanel"
          aria-labelledby="tab-sample"
          hidden={activeTab !== 'sample'}
        >
          {activeTab === 'sample' && <SampleTab result={result} />}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function FormIQPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [result, setResult] = useState<FormResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [history, setHistory] = useState<string[]>([]);
  const [lookupCount, setLookupCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(formName: string) {
    const trimmed = formName.trim();
    if (!trimmed || loading) return;

    if (lookupCount >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentQuery(trimmed);
    setActiveTab('overview');

    setHistory(prev => {
      const without = prev.filter(h => h.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...without].slice(0, 5);
    });

    try {
      const response = await fetch('/api/formiq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formName: trimmed }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      const parsed: FormResult = JSON.parse(data.text);

      setLookupCount(c => c + 1);

      if (!parsed.found) {
        setError(
          "We couldn't find that form. Try a more specific name (e.g. 'IRS Form 1040')."
        );
      } else {
        setResult(parsed);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Something went wrong parsing the response. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSearch(query);
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-formiq-body">
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">📋</span>
              <span className="text-xl font-bold text-[#0F1E3C] font-formiq-serif tracking-tight">
                FormIQ
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">
              Instant intelligence for any official form
            </p>
          </div>

          <div
            className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full shrink-0"
            aria-label={`${lookupCount} of ${FREE_LIMIT} free lookups used`}
            aria-live="polite"
          >
            <span className="font-semibold text-[#0F1E3C]">{lookupCount}</span>
            {' / '}{FREE_LIMIT} free lookups used
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero text */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F1E3C] mb-3 font-formiq-serif leading-tight">
            Understand any form, instantly.
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Type a form name to get a plain-English guide, field instructions, and a filled sample.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} className="mb-4" role="search">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter a form name, e.g. W-2, I-9, DS-160..."
              aria-label="Form name"
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-[#0F1E3C] placeholder-gray-300 focus:outline-none focus:border-amber-400 transition-colors text-sm"
              disabled={loading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              aria-label="Look up form"
              className="px-5 py-3 rounded-xl bg-[#0F1E3C] text-white font-semibold text-sm hover:bg-[#1a2f5c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Look Up Form
            </button>
          </div>
        </form>

        {/* History chips */}
        {history.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mb-8"
            aria-label="Recent searches"
          >
            {history.map(item => (
              <button
                key={item}
                onClick={() => { setQuery(item); handleSearch(item); }}
                aria-label={`Search again for ${item}`}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-amber-400 hover:text-[#0F1E3C] transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Screen-reader live region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {loading && `Looking up ${currentQuery}, please wait.`}
          {!loading && error && `Error: ${error}`}
          {!loading && result && result.found && `Results loaded for ${result.form_name}.`}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center py-16 gap-4" aria-hidden="true">
            <div className="w-8 h-8 border-[3px] border-[#0F1E3C] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">
              Looking up{' '}
              <span className="font-semibold text-[#0F1E3C]">{currentQuery}</span>
              …
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            className="animate-fade-in rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && result && result.found && (
          <ResultsPanel
            result={result}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Disclaimer footer */}
      <footer className="border-t border-gray-100 py-8 px-4 mt-8">
        <p className="text-[11px] text-gray-400 text-center max-w-xl mx-auto leading-relaxed">
          FormIQ provides AI-generated guidance for informational purposes only. Always verify
          form instructions with the issuing agency. Not legal or tax advice.
        </p>
      </footer>
    </div>
  );
}
