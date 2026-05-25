import AspectRatioTabs from './AspectRatioTabs';
import CreativeCard from './CreativeCard';
import { AspectRatioKey, CampaignReport, PipelineStep, ProductOutput } from '../types';

interface CreativeCanvasProps {
  products: ProductOutput[];
  selectedRatio: AspectRatioKey;
  onRatioChange: (ratio: AspectRatioKey) => void;
  pipelineStep: PipelineStep;
  report: CampaignReport | null;
  campaignName: string;
}

function LoadingSkeleton({ ratio }: { ratio: AspectRatioKey }) {
  const ratioClass =
    ratio === '9x16' ? 'aspect-[9/16] max-h-[400px]' : ratio === '16x9' ? 'aspect-video' : 'aspect-square';

  return (
    <div className={`shimmer-bg rounded-2xl ${ratioClass}`}>
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-pulseGlow rounded-full bg-accent-gradient opacity-60" />
          <p className="text-xs text-zinc-500">Generating...</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
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
      <h3 className="text-lg font-semibold text-zinc-200">Creative canvas</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
        Complete your campaign setup and launch generation. Your localized creatives will appear
        here in cinematic preview.
      </p>
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
}: CreativeCanvasProps) {
  const isGenerating =
    pipelineStep !== 'idle' && pipelineStep !== 'complete' && pipelineStep !== 'error';

  const grouped = products.reduce<Record<string, ProductOutput[]>>((acc, product) => {
    if (!acc[product.productName]) acc[product.productName] = [];
    acc[product.productName].push(product);
    return acc;
  }, {});

  const gridCols =
    selectedRatio === '9x16'
      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
      : 'grid-cols-1 lg:grid-cols-2';

  return (
    <div className="flex h-full flex-col">
      {/* Canvas header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
            Creative Preview
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">
            {report ? report.campaignName : campaignName || 'Untitled Campaign'}
          </h2>
          {report && (
            <p className="mt-0.5 text-xs text-zinc-500">
              {report.products.length} variants · {report.generationProvider}
            </p>
          )}
        </div>
        {(products.length > 0 || isGenerating) && (
          <AspectRatioTabs selected={selectedRatio} onChange={onRatioChange} />
        )}
      </div>

      {/* Canvas body */}
      <div className="flex-1 overflow-y-auto">
        {isGenerating && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-xl bg-blue-500/10 px-4 py-3 ring-1 ring-blue-500/20">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              <p className="text-sm text-blue-200">AI pipeline running — generating creatives...</p>
            </div>
            <div className={`grid gap-6 ${gridCols}`}>
              {[0, 1, 2].map((i) => (
                <LoadingSkeleton key={i} ratio={selectedRatio} />
              ))}
            </div>
          </div>
        )}

        {!isGenerating && products.length === 0 && <EmptyState />}

        {!isGenerating && products.length > 0 && (
          <div className="space-y-10">
            {Object.entries(grouped).map(([productName, variants]) => (
              <div key={productName}>
                <h3 className="mb-4 text-sm font-medium text-zinc-400">{productName}</h3>
                <div className={`grid gap-6 ${gridCols}`}>
                  {variants.map((variant, i) => (
                    <CreativeCard
                      key={`${variant.productSlug}-${variant.region}`}
                      variant={variant}
                      productName={productName}
                      aspectRatio={selectedRatio}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
