'use client';

import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import ParseProgress from './ParseProgress';
import type { AnalysisSummary } from '@/types';

interface UploadZoneProps {
  userId?: string;
  onComplete: (summary: AnalysisSummary) => void;
}

type Stage = 'uploading' | 'parsing' | 'analyzing' | 'done';

export default function UploadZone({ userId, onComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<Stage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setStage('uploading');

      try {
        // Step 1: Parse the file
        const formData = new FormData();
        formData.append('file', file);

        setStage('parsing');
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? 'Upload failed');

        const { transactions } = uploadData;

        // Step 2: Analyze with Claude
        setStage('analyzing');
        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions, userId }),
        });

        const analyzeData = await analyzeRes.json();
        if (!analyzeRes.ok) {
          if (analyzeData.code === 'AUTH_REQUIRED') {
            window.location.href = '/login?intent=trial';
            return;
          }
          if (analyzeData.code === 'TRIAL_EXPIRED') {
            window.location.href = '/upgrade';
            return;
          }
          throw new Error(analyzeData.error ?? 'Analysis failed');
        }

        setStage('done');

        // Short pause so user sees "Done!" before transition
        await new Promise((r) => setTimeout(r, 600));
        onComplete(analyzeData.summary);
      } catch (err) {
        setStage(null);
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    },
    [userId, onComplete]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  if (stage) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
        <p className="text-sm font-medium text-gray-700 text-center">
          {stage === 'analyzing' ? '🤖 Arlo is on it...' : '⚙️ Processing...'}
        </p>
        <ParseProgress stage={stage} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-violet-400 bg-violet-50'
            : 'border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/50'
        )}
      >
        <label className="cursor-pointer block">
          <input
            type="file"
            accept=".csv,.pdf"
            className="sr-only"
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop your bank statement here
              </p>
              <p className="text-xs text-gray-500 mt-1">
                CSV or PDF · Chase, BoA, Wells Fargo, Capital One
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-violet-600 text-white font-medium">
              Choose file
            </span>
          </div>
        </label>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
        <FileText className="w-3 h-3" />
        <span>Your data stays private — we never store raw bank statements</span>
      </div>
    </div>
  );
}
