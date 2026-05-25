import { formatDuration, getOutputUrl } from '../api/client';
import { CampaignReport } from '../types';

interface ReportSummaryProps {
  report: CampaignReport | null;
}

export default function ReportSummary({ report }: ReportSummaryProps) {
  if (!report) return null;

  const stats = [
    { label: 'Reused', value: report.assetsReused.length, color: 'text-emerald-400' },
    { label: 'Generated', value: report.assetsGenerated.length, color: 'text-violet-400' },
    { label: 'Localized', value: report.localizedVariantsCreated, color: 'text-blue-400' },
    { label: 'Duration', value: formatDuration(report.processingDurationMs), color: 'text-zinc-300' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Session Report
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-lg bg-white/[0.02] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
            <p className={`mt-0.5 text-lg font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white/[0.02] px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Provider</p>
        <p className="mt-0.5 text-sm text-zinc-300">{report.generationProvider}</p>
      </div>

      {report.complianceFailures.length > 0 && (
        <div className="rounded-lg bg-amber-500/10 px-3 py-2 ring-1 ring-amber-500/20">
          <p className="text-xs font-medium text-amber-300">
            {report.complianceFailures.length} issue(s) flagged
          </p>
        </div>
      )}
    </div>
  );
}

interface ExportPanelProps {
  report: CampaignReport | null;
}

export function ExportPanel({ report }: ExportPanelProps) {
  if (!report) {
    return (
      <p className="text-sm text-zinc-500">
        Run the pipeline to export generated creatives.
      </p>
    );
  }

  const handleDownloadAll = () => {
    report.outputPaths.forEach((path, i) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = getOutputUrl(path);
        link.download = path.split('/').pop() || 'creative.png';
        link.click();
      }, i * 200);
    });
  };

  return (
    <div className="space-y-4">
      <button onClick={handleDownloadAll} className="studio-btn-primary w-full">
        Download All ({report.outputPaths.length})
      </button>

      <div className="max-h-48 space-y-1 overflow-y-auto">
        {report.outputPaths.map((path) => (
          <a
            key={path}
            href={getOutputUrl(path)}
            download
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <span className="truncate">{path}</span>
            <span className="ml-2 shrink-0 text-zinc-600">↓</span>
          </a>
        ))}
      </div>
    </div>
  );
}
