import { ReactNode, useMemo } from 'react';
import GenerationStatus from './GenerationStatus';
import ComplianceStatus from './ComplianceStatus';
import ReportSummary, { ExportPanel } from './ReportSummary';
import { CampaignReport, PipelineStep, ProductOutput } from '../types';
import { estimateGenerationTime } from '../utils/generation-estimate';

interface InsightsPanelProps {
  pipelineStep: PipelineStep;
  error: string | null;
  report: CampaignReport | null;
  products: ProductOutput[];
  productCount?: number;
  regionCount?: number;
  uploadedProductCount?: number;
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.04]">{children}</div>
  );
}

export default function InsightsPanel({
  pipelineStep,
  error,
  report,
  products,
  productCount = 1,
  regionCount = 1,
  uploadedProductCount = 0,
}: InsightsPanelProps) {
  const estimate = useMemo(
    () =>
      estimateGenerationTime({
        productCount,
        regionCount,
        uploadedProductCount,
      }),
    [productCount, regionCount, uploadedProductCount]
  );

  const isRunning =
    pipelineStep !== 'idle' && pipelineStep !== 'complete' && pipelineStep !== 'error';

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-l border-white/[0.06] bg-studio-surface/50">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">Insights</p>
        <h2 className="mt-0.5 text-sm font-semibold text-zinc-200">Live Session</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {(pipelineStep !== 'idle' || error) && (
          <Panel>
            <GenerationStatus
              step={pipelineStep}
              error={error}
              estimate={isRunning ? estimate : null}
            />
          </Panel>
        )}

        {products.length > 0 && (
          <Panel>
            <ComplianceStatus products={products} />
          </Panel>
        )}

        {report && (
          <>
            <Panel>
              <ReportSummary report={report} />
            </Panel>
            <Panel>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Export
              </h3>
              <ExportPanel report={report} />
            </Panel>
          </>
        )}

        {pipelineStep === 'idle' && !report && products.length === 0 && (
          <div className="px-2 py-8 text-center">
            <div className="mx-auto mb-3 h-8 w-8 rounded-full bg-white/[0.04]" />
            <p className="text-xs leading-relaxed text-zinc-500">
              Pipeline insights, compliance results, and export options will appear here during
              your session.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
