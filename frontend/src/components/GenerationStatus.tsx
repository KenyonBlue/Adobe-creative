import { PipelineStep } from '../types';

interface GenerationStatusProps {
  step: PipelineStep;
  error: string | null;
}

const STEPS: { key: PipelineStep; label: string; detail: string }[] = [
  { key: 'validating', label: 'Validating', detail: 'Checking campaign brief' },
  { key: 'resolving_assets', label: 'Assets', detail: 'Scanning storage for reuse' },
  { key: 'generating', label: 'Generating', detail: 'Creating hero images with AI' },
  { key: 'processing', label: 'Processing', detail: 'Rendering aspect ratios & overlays' },
  { key: 'compliance', label: 'Compliance', detail: 'Running brand & legal checks' },
  { key: 'complete', label: 'Complete', detail: 'Pipeline finished' },
];

const STEP_ORDER: PipelineStep[] = STEPS.map((s) => s.key);

function stepIndex(step: PipelineStep): number {
  if (step === 'idle' || step === 'error') return -1;
  return STEP_ORDER.indexOf(step);
}

export default function GenerationStatus({ step, error }: GenerationStatusProps) {
  if (step === 'idle') return null;

  const currentIdx = stepIndex(step);
  const progress =
    step === 'complete' ? 100 : currentIdx >= 0 ? ((currentIdx + 1) / STEPS.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          AI Pipeline
        </h3>
        {step !== 'error' && step !== 'complete' && (
          <span className="flex items-center gap-1.5 text-xs text-blue-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Live
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-accent-gradient transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error ? (
        <div className="rounded-lg bg-red-500/10 px-3 py-2.5 text-sm text-red-300 ring-1 ring-red-500/20">
          {error}
        </div>
      ) : (
        <ul className="space-y-1">
          {STEPS.map(({ key, label, detail }, idx) => {
            const isDone = currentIdx > idx || step === 'complete';
            const isActive = currentIdx === idx && step !== 'complete';

            return (
              <li
                key={key}
                className={`flex items-start gap-3 rounded-lg px-2 py-2 transition-colors ${
                  isActive ? 'bg-white/[0.04]' : ''
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isActive
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-white/[0.04] text-zinc-600'
                  }`}
                >
                  {isDone ? '✓' : isActive ? '●' : '○'}
                </span>
                <div>
                  <p
                    className={`text-sm ${isActive ? 'font-medium text-white' : isDone ? 'text-zinc-400' : 'text-zinc-600'}`}
                  >
                    {label}
                  </p>
                  {(isActive || isDone) && (
                    <p className="text-xs text-zinc-500">{detail}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
