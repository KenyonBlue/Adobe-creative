import { getOutputUrl } from '../api/client';
import { AspectRatioKey, ProductOutput } from '../types';

interface CreativeCardProps {
  variant: ProductOutput;
  productName: string;
  aspectRatio: AspectRatioKey;
  index: number;
  compact?: boolean;
}

function complianceStatus(compliance: ProductOutput['compliance']) {
  const failures = compliance.filter((c) => !c.passed);
  if (failures.length === 0) return 'pass';
  const hasLegal = failures.some((f) => f.category === 'legal');
  return hasLegal ? 'fail' : 'warn';
}

export default function CreativeCard({
  variant,
  productName,
  aspectRatio,
  index,
  compact = false,
}: CreativeCardProps) {
  const outputPath = variant.outputs[aspectRatio];
  if (!outputPath) return null;

  const imageUrl = getOutputUrl(outputPath);
  const status = complianceStatus(variant.compliance);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${variant.productSlug}-${variant.region}-${aspectRatio}.png`;
    link.click();
  };

  return (
    <div
      className="group flex h-full min-h-0 flex-col animate-slideUp opacity-0"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/[0.06] transition-all duration-300 group-hover:ring-white/[0.12] group-hover:shadow-2xl group-hover:shadow-blue-500/10">
        <img
          src={imageUrl}
          alt={`${productName} ${aspectRatio}`}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex justify-end gap-2 p-4">
            <button
              onClick={handleDownload}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20"
            >
              Download
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm font-medium text-white">{variant.message}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            {variant.region}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
              variant.assetSource === 'reused'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-violet-500/20 text-violet-300'
            }`}
          >
            {variant.assetSource === 'reused' ? 'Reused' : 'AI Generated'}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
              status === 'pass'
                ? 'bg-emerald-500/20 text-emerald-300'
                : status === 'warn'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-red-500/20 text-red-300'
            }`}
          >
            {status === 'pass' ? 'Compliant' : status === 'warn' ? 'Review' : 'Flagged'}
          </span>
        </div>
      </div>

      <div className={`flex shrink-0 items-center justify-between px-1 ${compact ? 'mt-1' : 'mt-2'}`}>
        <div className="min-w-0">
          <p className={`truncate font-medium text-zinc-200 ${compact ? 'text-xs' : 'text-sm'}`}>
            {productName}
          </p>
          <p className="text-[10px] text-zinc-500">
            {variant.region.toUpperCase()} · {aspectRatio.replace('x', ':')}
          </p>
        </div>
        {!compact && (
          <button
            onClick={handleDownload}
            className="shrink-0 text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            Export
          </button>
        )}
      </div>
    </div>
  );
}
