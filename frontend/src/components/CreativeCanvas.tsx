import { useEffect, useMemo, useState } from 'react';
import AspectRatioTabs from './AspectRatioTabs';
import CreativeCard from './CreativeCard';
import PipelineErrorBanner from './PipelineErrorBanner';
import { AspectRatioKey, CampaignReport, PipelineStep, ProductOutput } from '../types';
import {
  estimateGenerationTime,
  getRemainingEstimate,
} from '../utils/generation-estimate';

interface CreativeCanvasProps {
  products: ProductOutput[];
  selectedRatio: AspectRatioKey;
  onRatioChange: (ratio: AspectRatioKey) => void;
  pipelineStep: PipelineStep;
  report: CampaignReport | null;
  campaignName: string;
  productCount?: number;
  regionCount?: number;
  uploadedProductCount?: number;
  error?: string | null;
  onRegenerate?: () => void;
  onReset?: () => void;
  onCreateCampaign?: () => void;
  onEditCampaign?: () => void;
}

interface CanvasLayout {
  gridColsClass: string;
  gapClass: string;
  compact: boolean;
}

function columnCount(totalCards: number, aspectRatio: AspectRatioKey): number {
  const count = Math.max(1, totalCards);

  if (aspectRatio === '9x16') {
    if (count <= 1) return 1;
    if (count <= 4) return 2;
    return 3;
  }

  if (aspectRatio === '16x9') {
    if (count <= 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
  }

  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

function getCanvasLayout(totalCards: number, aspectRatio: AspectRatioKey): CanvasLayout {
  const cols = columnCount(totalCards, aspectRatio);
  const gridColsClass =
    cols === 1
      ? 'grid-cols-1'
      : cols === 2
        ? 'grid-cols-2'
        : cols === 3
          ? 'grid-cols-3'
          : 'grid-cols-4';

  const count = Math.max(1, totalCards);
  const gapClass = count > 6 ? 'gap-2' : count > 2 ? 'gap-3' : 'gap-4';

  return { gridColsClass, gapClass, compact: count > 2 };
}

const PIPELINE_LABELS: Record<string, string> = {
  validating: 'Validating campaign brief',
  resolving_assets: 'Resolving product assets',
  generating: 'Generating hero images with AI',
  processing: 'Processing aspect ratios & overlays',
  compliance: 'Running compliance checks',
};

const GENERATING_MESSAGES = [
  'Crafting hero imagery with AI',
  'Composing visual concepts',
  'Rendering product scenes',
  'Applying brand aesthetics',
  'Building creative variations',
  'Exploring visual directions',
  'Refining compositions',
  'Generating high-res outputs',
];

function RotatingText({ step }: { step: PipelineStep }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (step !== 'generating') {
      setMsgIndex(0);
      return;
    }
    const id = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % GENERATING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, [step]);

  if (step === 'generating') {
    return (
      <span
        key={msgIndex}
        className="inline-block animate-fadeInUp"
      >
        {GENERATING_MESSAGES[msgIndex]}
      </span>
    );
  }

  return <span>{PIPELINE_LABELS[step] ?? 'Processing'}</span>;
}

function PipelineProgressBar({ step }: { step: PipelineStep }) {
  const ordered: PipelineStep[] = [
    'validating',
    'resolving_assets',
    'generating',
    'processing',
    'compliance',
  ];
  const currentIdx = ordered.indexOf(step);

  return (
    <div className="flex items-center gap-1.5">
      {ordered.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s} className="flex items-center gap-1.5">
            <div
              className={`h-1.5 w-8 rounded-full transition-all duration-500 ${
                done
                  ? 'bg-blue-400'
                  : active
                    ? 'animate-pulse bg-blue-400/80'
                    : 'bg-white/[0.06]'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function GeneratingOverlay({
  step,
  campaignName,
  productCount,
  regionCount,
  uploadedProductCount,
}: {
  step: PipelineStep;
  campaignName: string;
  productCount: number;
  regionCount: number;
  uploadedProductCount: number;
}) {
  const [elapsed, setElapsed] = useState(0);

  const estimate = useMemo(
    () =>
      estimateGenerationTime({
        productCount,
        regionCount,
        uploadedProductCount,
      }),
    [productCount, regionCount, uploadedProductCount]
  );

  useEffect(() => {
    setElapsed(0);
    const id = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, '0')}` : `${sec}s`;
  };

  const remaining = getRemainingEstimate(estimate, elapsed);
  const progressPct = Math.min(95, Math.round((elapsed / estimate.maxSeconds) * 100));

  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
      {/* Pulsing rings */}
      <div className="relative mb-10">
        <div className="absolute -inset-16 animate-ping rounded-full bg-blue-500/5 [animation-duration:3s]" />
        <div className="absolute -inset-10 animate-ping rounded-full bg-violet-500/5 [animation-duration:2.5s]" />
        <div className="absolute -inset-6 animate-pulse rounded-full bg-blue-500/10 blur-2xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08]">
          <svg
            className="h-10 w-10 animate-spin text-blue-400 [animation-duration:3s]"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" d="M12 2a10 10 0 019.17 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Campaign name */}
      <h3 className="text-xl font-semibold tracking-tight text-white">
        {campaignName || 'Generating Campaign'}
      </h3>

      {/* Rotating status text */}
      <p className="mt-3 h-6 text-sm text-blue-300/80">
        <RotatingText step={step} />
      </p>

      {/* Progress bar */}
      <div className="mt-6">
        <PipelineProgressBar step={step} />
      </div>

      {/* Step label + elapsed */}
      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 ring-1 ring-blue-500/20">
          {PIPELINE_LABELS[step] ?? step}
        </span>
        <span className="font-mono text-xs text-zinc-500">{fmt(elapsed)}</span>
      </div>

      <div className="mt-5 max-w-sm space-y-2">
        <div className="rounded-lg bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.05]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Typical wait</span>
            <span className="font-medium text-zinc-300">{estimate.label}</span>
          </div>
          {remaining && (
            <p className="mt-1.5 text-xs text-blue-300/70">{remaining}</p>
          )}
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-blue-500/50 transition-all duration-1000 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-600">{estimate.summary}</p>
      </div>
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-8 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -inset-4 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08]">
          <svg className="h-9 w-9 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-zinc-100">Your creative canvas</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
        Configure your campaign, define products and markets, then launch AI generation. Your
        localized creatives will appear here.
      </p>
      <button onClick={onStart} className="studio-btn-primary mt-8 px-8 py-3">
        Create Campaign
      </button>
    </div>
  );
}

export default function CreativeCanvas({
  products,
  selectedRatio,
  onRatioChange,
  pipelineStep,
  report,
  campaignName,
  productCount = 1,
  regionCount = 1,
  uploadedProductCount = 0,
  error = null,
  onRegenerate,
  onReset,
  onCreateCampaign,
  onEditCampaign,
}: CreativeCanvasProps) {
  const isGenerating =
    pipelineStep !== 'idle' && pipelineStep !== 'complete' && pipelineStep !== 'error';
  const hasFailed = pipelineStep === 'error' && Boolean(error);

  const grouped = products.reduce<Record<string, ProductOutput[]>>((acc, product) => {
    if (!acc[product.productName]) acc[product.productName] = [];
    acc[product.productName].push(product);
    return acc;
  }, {});

  const visibleProducts = products.filter((p) => p.outputs[selectedRatio]);
  const layout = getCanvasLayout(visibleProducts.length, selectedRatio);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Canvas header */}
      <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Creative Preview
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              {report ? report.campaignName : campaignName || 'Untitled Campaign'}
            </h2>
            {pipelineStep === 'complete' && (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-500/25">
                Complete
              </span>
            )}
          </div>
          {report && (
            <p className="mt-0.5 text-xs text-zinc-500">
              {Object.keys(grouped).length} products · {visibleProducts.length} creatives ·{' '}
              {report.generationProvider}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {report && onRegenerate && onReset && (
            <div className="flex gap-2">
              <button
                onClick={onEditCampaign}
                className="studio-btn-ghost text-xs"
              >
                Edit Campaign
              </button>
              <button onClick={onReset} className="studio-btn-ghost text-xs">
                New Campaign
              </button>
            </div>
          )}
          {(products.length > 0 || isGenerating) && (
            <AspectRatioTabs selected={selectedRatio} onChange={onRatioChange} />
          )}
        </div>
      </div>

      {/* Canvas body — fills remaining viewport, no scroll */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {isGenerating && (
          <GeneratingOverlay
            step={pipelineStep}
            campaignName={campaignName}
            productCount={productCount}
            regionCount={regionCount}
            uploadedProductCount={uploadedProductCount}
          />
        )}

        {hasFailed && (
          <PipelineErrorBanner
            error={error!}
            onRetry={onRegenerate}
            onEdit={onEditCampaign}
          />
        )}

        {!isGenerating && !hasFailed && visibleProducts.length === 0 && onCreateCampaign && (
          <EmptyState onStart={onCreateCampaign} />
        )}

        {!isGenerating && !hasFailed && visibleProducts.length > 0 && (
          <div
            className={`grid min-h-0 flex-1 auto-rows-fr ${layout.gridColsClass} ${layout.gapClass}`}
          >
            {visibleProducts.map((variant, i) => (
              <CreativeCard
                key={`${variant.productSlug}-${variant.region}`}
                variant={variant}
                productName={variant.productName}
                aspectRatio={selectedRatio}
                index={i}
                compact={layout.compact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
