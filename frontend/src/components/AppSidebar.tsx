interface AppSidebarProps {
  campaignName: string;
  hasReport: boolean;
  isRunning: boolean;
  onOpenWorkflow: () => void;
  onOpenHistory: () => void;
  onNewCampaign: () => void;
  onRegenerate: () => void;
}

export default function AppSidebar({
  campaignName,
  hasReport,
  isRunning,
  onOpenWorkflow,
  onOpenHistory,
  onNewCampaign,
  onRegenerate,
}: AppSidebarProps) {
  return (
    <aside className="flex h-full w-[72px] shrink-0 flex-col items-center border-r border-white/[0.06] bg-studio-surface/60 py-5 backdrop-blur-xl">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient shadow-lg shadow-blue-500/20">
        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <div className="my-6 w-8 border-t border-white/[0.06]" />

      <button
        onClick={onOpenWorkflow}
        title={hasReport ? 'New campaign' : 'Create campaign'}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-400 transition hover:bg-white/[0.1] hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <button
        onClick={onOpenHistory}
        title="Campaign history"
        className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {hasReport && (
        <>
          <button
            onClick={onRegenerate}
            disabled={isRunning}
            title="Regenerate"
            className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-30"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          </button>
          <button
            onClick={onNewCampaign}
            title="New campaign"
            className="mt-3 flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </button>
        </>
      )}

      <div className="mt-auto px-2">
        <div
          className="h-2 w-2 rounded-full bg-emerald-500/80"
          title={campaignName}
          style={{ opacity: campaignName ? 1 : 0.2 }}
        />
      </div>
    </aside>
  );
}
