import { useEffect, useState } from 'react';
import { getOutputUrl, listCampaigns, loadCampaign } from '../api/client';
import { CampaignReport, CampaignSummary } from '../types';

interface CampaignHistoryModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (report: CampaignReport) => void;
  activeSlug?: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CampaignHistoryModal({
  open,
  onClose,
  onSelect,
  activeSlug,
}: CampaignHistoryModalProps) {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listCampaigns()
      .then(setCampaigns)
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, [open]);

  const handleSelect = async (slug: string) => {
    setLoadingSlug(slug);
    try {
      const report = await loadCampaign(slug);
      onSelect(report);
      onClose();
    } catch {
      // ignore
    } finally {
      setLoadingSlug(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      <div className="relative flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-500/40 bg-zinc-950/95 shadow-2xl ring-1 ring-white/10 animate-slideUp">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Campaign History
            </p>
            <h2 className="text-lg font-semibold text-white">Saved Campaigns</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <p className="py-12 text-center text-sm text-zinc-500">Loading campaigns...</p>
          )}

          {!loading && campaigns.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-zinc-400">No saved campaigns yet</p>
              <p className="mt-1 text-xs text-zinc-600">
                Generated campaigns are saved to the outputs folder on the server
              </p>
            </div>
          )}

          <div className="space-y-2">
            {campaigns.map((campaign) => {
              const isActive = campaign.campaignSlug === activeSlug;
              const isLoading = loadingSlug === campaign.campaignSlug;

              return (
                <button
                  key={campaign.campaignSlug}
                  onClick={() => handleSelect(campaign.campaignSlug)}
                  disabled={isLoading}
                  className={`flex w-full items-center gap-4 rounded-xl p-3 text-left transition ${
                    isActive
                      ? 'bg-blue-500/10 ring-1 ring-blue-500/30'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] ring-1 ring-white/[0.04]'
                  }`}
                >
                  {campaign.thumbnailPath ? (
                    <img
                      src={getOutputUrl(campaign.thumbnailPath)}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-white/[0.06]"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                      <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-200">
                      {campaign.campaignName}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatDate(campaign.completedAt)} · {campaign.productCount} product
                      {campaign.productCount !== 1 ? 's' : ''} · {campaign.outputCount} outputs
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-600">
                      {campaign.generationProvider}
                    </p>
                  </div>

                  {isLoading ? (
                    <span className="h-4 w-4 animate-pulse rounded-full bg-blue-400" />
                  ) : isActive ? (
                    <span className="text-xs text-blue-400">Active</span>
                  ) : (
                    <span className="text-xs text-zinc-600">Open →</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
