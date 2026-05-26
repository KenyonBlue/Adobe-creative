export interface GenerationEstimate {
  minSeconds: number;
  maxSeconds: number;
  label: string;
  summary: string;
}

function formatDurationRange(minSeconds: number, maxSeconds: number): string {
  const fmt = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return minutes === 1 ? '1 min' : `${minutes} min`;
  };

  if (minSeconds >= 60 || maxSeconds >= 60) {
    const minMin = Math.max(1, Math.floor(minSeconds / 60));
    const maxMin = Math.max(minMin, Math.ceil(maxSeconds / 60));
    return minMin === maxMin ? `~${minMin} min` : `~${minMin}–${maxMin} min`;
  }

  return minSeconds === maxSeconds
    ? `~${fmt(minSeconds)}`
    : `~${fmt(minSeconds)}–${fmt(maxSeconds)}`;
}

export function estimateGenerationTime(options: {
  productCount: number;
  regionCount: number;
  uploadedProductCount?: number;
}): GenerationEstimate {
  const productCount = Math.max(1, options.productCount);
  const regionCount = Math.max(1, options.regionCount);
  const uploadedProductCount = Math.min(
    options.uploadedProductCount ?? 0,
    productCount
  );

  const aiProducts = Math.max(0, productCount - uploadedProductCount);
  const localProcessing = productCount * regionCount * 3;

  const minSeconds = aiProducts * 30 + localProcessing + 5;
  const maxSeconds = aiProducts * 90 + localProcessing + 15;

  const label = formatDurationRange(minSeconds, maxSeconds);

  const parts: string[] = [];
  if (aiProducts > 0) {
    parts.push(
      `${aiProducts} AI image${aiProducts === 1 ? '' : 's'} (~30–90s each)`
    );
  }
  if (uploadedProductCount > 0) {
    parts.push(`${uploadedProductCount} uploaded asset${uploadedProductCount === 1 ? '' : 's'} reused`);
  }
  parts.push(`${regionCount} market${regionCount === 1 ? '' : 's'} · 3 aspect ratios`);

  return {
    minSeconds,
    maxSeconds,
    label,
    summary: parts.join(' · '),
  };
}

export function getRemainingEstimate(
  estimate: GenerationEstimate,
  elapsedSeconds: number
): string | null {
  const remaining = estimate.maxSeconds - elapsedSeconds;
  if (remaining <= 0) return 'Almost done — finishing up';
  if (remaining < 15) return 'Just a few more seconds';
  if (remaining < 60) return `About ${remaining}s left`;

  const minutes = Math.ceil(remaining / 60);
  return minutes === 1 ? 'About 1 min left' : `About ${minutes} min left`;
}
