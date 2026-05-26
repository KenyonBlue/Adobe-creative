import { PipelineStep } from '../types';
import { GenerationEstimate } from '../utils/generation-estimate';
import { parsePipelineError } from './PipelineErrorBanner';

interface GenerationStatusProps {
  step: PipelineStep;
  error: string | null;
  estimate?: GenerationEstimate | null;
}

const STEPS: { key: PipelineStep; label: string; detail: string }[] = [
  { key: 'validating', label: 'Validating', detail: 'Checking campaign brief' },
  { key: 'resolving_assets', label: 'Assets', detail: 'Resolving uploaded product images' },
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

export function GenerationEstimateBadge({
  estimate,
  variant = 'subtle',
}: {
  estimate: GenerationEstimate;
  variant?: 'subtle' | 'prominent';
}) {
  if (variant === 'prominent') {
    return (
      <div className="rounded-xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.06]">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Estimated wait
          </p>
          <p className="text-sm font-semibold text-zinc-200">{estimate.label}</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">{estimate.summary}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.05]">
      <p className="text-xs text-zinc-500">
        Estimated wait{' '}
        <span className="font-medium text-zinc-300">{estimate.label}</span>
      </p>
      <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-600">{estimate.summary}</p>
    </div>
  );
}

export default function GenerationStatus({ step, error, estimate }: GenerationStatusProps) {
  if (step === 'idle') return null;

  const currentIdx = stepIndex(step);
  const progress =
    step === 'complete' ? 100 : currentIdx >= 0 ? ((currentIdx + 1) / STEPS.length) * 100 : 0;
  const errorInfo = error ? parsePipelineError(error) : null;
  const isRunning = step !== 'error' && step !== 'complete';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          AI Pipeline
        </h3>
        {isRunning && (
          <span className="flex items-center gap-1.5 text-xs text-blue-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Live
          </span>
        )}
        {step === 'error' && (
          <span className="text-xs font-medium text-red-400">Failed</span>
        )}
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            step === 'error' ? 'bg-red-500/60' : 'bg-accent-gradient'
          }`}
          style={{ width: `${step === 'error' ? 100 : progress}%` }}
        />
      </div>

      {isRunning && estimate && <GenerationEstimateBadge estimate={estimate} />}

      {errorInfo ? (
        <div className="space-y-3 rounded-lg bg-red-500/10 px-3 py-3 ring-1 ring-red-500/20">
          <div>
            <p className="text-sm font-medium text-red-200">{errorInfo.title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-red-300/80">{errorInfo.message}</p>
          </div>
          {errorInfo.hint && (
            <p className="text-xs leading-relaxed text-zinc-500">{errorInfo.hint}</p>
          )}
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
