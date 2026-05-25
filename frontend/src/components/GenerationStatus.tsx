import { PipelineStep } from '../types';

interface GenerationStatusProps {
  step: PipelineStep;
  error: string | null;
}

const STEPS: { key: PipelineStep; label: string }[] = [
  { key: 'validating', label: 'Validating brief' },
  { key: 'resolving_assets', label: 'Resolving assets' },
  { key: 'generating', label: 'Generating missing assets' },
  { key: 'processing', label: 'Processing aspect ratios' },
  { key: 'compliance', label: 'Running compliance checks' },
  { key: 'complete', label: 'Complete' },
];

const STEP_ORDER: PipelineStep[] = STEPS.map((s) => s.key);

function stepIndex(step: PipelineStep): number {
  if (step === 'idle' || step === 'error') return -1;
  return STEP_ORDER.indexOf(step);
}

export default function GenerationStatus({ step, error }: GenerationStatusProps) {
  if (step === 'idle') return null;

  const currentIdx = stepIndex(step);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Pipeline Status</h2>

      {error ? (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <ul className="space-y-3">
          {STEPS.map(({ key, label }, idx) => {
            const isDone = currentIdx > idx || step === 'complete';
            const isActive = currentIdx === idx && step !== 'complete';
            const isPending = currentIdx < idx && step !== 'complete';

            return (
              <li key={key} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? 'bg-green-100 text-green-700'
                      : isActive
                        ? 'bg-adobe-blue text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? '✓' : isPending ? '·' : '…'}
                </span>
                <span
                  className={`text-sm ${
                    isActive ? 'font-semibold text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
