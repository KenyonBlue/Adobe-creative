import { formatDuration } from '../api/client';
import { CampaignReport } from '../types';

interface ReportSummaryProps {
  report: CampaignReport | null;
}

export default function ReportSummary({ report }: ReportSummaryProps) {
  if (!report) return null;

  const totalOutputs = report.products.reduce(
    (sum, p) => sum + Object.keys(p.outputs).length,
    0
  );
  const compliancePassRate =
    report.products.length > 0
      ? Math.round(
          ((report.products.flatMap((p) => p.compliance).filter((c) => c.passed).length /
            report.products.flatMap((p) => p.compliance).length) *
            100)
        )
      : 100;

  const stats = [
    { label: 'Assets Reused', value: report.assetsReused.length },
    { label: 'Assets Generated', value: report.assetsGenerated.length },
    { label: 'Localized Variants', value: report.localizedVariantsCreated },
    { label: 'Total Outputs', value: totalOutputs },
    { label: 'Compliance Pass Rate', value: `${compliancePassRate}%` },
    { label: 'Duration', value: formatDuration(report.processingDurationMs) },
    { label: 'GenAI Provider', value: report.generationProvider },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Report Summary</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {report.complianceFailures.length > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-800">
            {report.complianceFailures.length} compliance issue(s) detected
          </p>
        </div>
      )}
    </div>
  );
}
