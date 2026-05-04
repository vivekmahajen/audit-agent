'use client';

interface ParseProgressProps {
  stage: 'uploading' | 'parsing' | 'analyzing' | 'done';
  fileCount?: number;
}

const STAGES = {
  uploading: { label: 'Reading your file...', progress: 20 },
  parsing: { label: 'Parsing transactions...', progress: 50 },
  analyzing: { label: 'Arlo is analyzing your subscriptions...', progress: 80 },
  done: { label: 'Done!', progress: 100 },
};

export default function ParseProgress({ stage }: ParseProgressProps) {
  const { label, progress } = STAGES[stage];

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
