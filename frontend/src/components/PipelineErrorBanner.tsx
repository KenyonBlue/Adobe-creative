export interface PipelineErrorInfo {
  title: string;
  message: string;
  hint?: string;
}

export function parsePipelineError(raw: string): PipelineErrorInfo {
  const lower = raw.toLowerCase();

  if (lower.includes('does not exist') || lower.includes('model_not_found')) {
    return {
      title: 'Image model not available',
      message: raw,
      hint: 'Your API key may not support this model. Set OPENAI_IMAGE_MODEL=gpt-image-1 in .env and restart the backend.',
    };
  }

  if (lower.includes('response_format') || lower.includes('unknown parameter')) {
    return {
      title: 'Image API configuration error',
      message: raw,
      hint: 'The image model rejected a request parameter. Your setup may need a model config update — try again after restarting the backend.',
    };
  }

  if (
    lower.includes('api key') ||
    lower.includes('authentication') ||
    lower.includes('401') ||
    lower.includes('403')
  ) {
    return {
      title: 'API authentication failed',
      message: raw,
      hint: 'Check that your OpenAI API key is set in .env and the backend has been restarted.',
    };
  }

  if (lower.includes('rate limit') || lower.includes('429')) {
    return {
      title: 'Rate limit reached',
      message: raw,
      hint: 'Wait a minute and try again, or reduce the number of products in this run.',
    };
  }

  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('network')) {
    return {
      title: 'Request timed out',
      message: raw,
      hint: 'Generation can take several minutes. Your campaign draft is saved — retry when ready.',
    };
  }

  if (lower.includes('content policy') || lower.includes('safety')) {
    return {
      title: 'Content policy violation',
      message: raw,
      hint: 'Try adjusting product descriptions or campaign message and regenerate.',
    };
  }

  return {
    title: 'Generation failed',
    message: raw,
    hint: 'Your campaign setup is saved locally. Edit details or retry generation.',
  };
}

interface PipelineErrorBannerProps {
  error: string;
  onRetry?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

export default function PipelineErrorBanner({
  error,
  onRetry,
  onEdit,
  compact = false,
}: PipelineErrorBannerProps) {
  const info = parsePipelineError(error);

  if (compact) {
    return (
      <div className="rounded-xl bg-red-500/10 px-4 py-3 ring-1 ring-red-500/20">
        <p className="text-sm font-medium text-red-200">{info.title}</p>
        <p className="mt-1 text-xs text-red-300/80">{info.message}</p>
        {info.hint && <p className="mt-2 text-xs text-zinc-500">{info.hint}</p>}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8">
        <div className="absolute -inset-8 rounded-full bg-red-500/5 blur-3xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
          <svg className="h-9 w-9 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
      </div>

      <h3 className="text-xl font-semibold tracking-tight text-white">{info.title}</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-red-300/90">{info.message}</p>
      {info.hint && (
        <p className="mt-3 max-w-md text-xs leading-relaxed text-zinc-500">{info.hint}</p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button onClick={onRetry} className="studio-btn-primary px-6 py-2.5">
            Retry generation
          </button>
        )}
        {onEdit && (
          <button onClick={onEdit} className="studio-btn-ghost px-6 py-2.5">
            Edit campaign
          </button>
        )}
      </div>
    </div>
  );
}
