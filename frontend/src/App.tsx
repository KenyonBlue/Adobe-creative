import { useCallback, useState } from 'react';
import Layout from './components/Layout';
import WorkflowSidebar from './components/WorkflowSidebar';
import CreativeCanvas from './components/CreativeCanvas';
import InsightsPanel from './components/InsightsPanel';
import { runCampaign } from './api/client';
import {
  AspectRatioKey,
  CampaignReport,
  PipelineStep,
  UploadedAsset,
  WorkflowUiStep,
} from './types';
import {
  DEFAULT_FORM_STATE,
  CampaignFormState,
  buildCampaignBrief,
} from './utils/brief-form';

const STEP_DELAYS: PipelineStep[] = [
  'validating',
  'resolving_assets',
  'generating',
  'processing',
  'compliance',
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  const [form, setForm] = useState<CampaignFormState>(DEFAULT_FORM_STATE);
  const [workflowStep, setWorkflowStep] = useState<WorkflowUiStep>('campaign');
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CampaignReport | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioKey>('1x1');
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);

  const handleUploadedAssets = useCallback((assets: UploadedAsset[]) => {
    setUploadedAssets((prev) => [...prev, ...assets]);
  }, []);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setReport(null);
    setPipelineStep('validating');
    setWorkflowStep('review');

    try {
      const productAssetPaths: Record<number, string> = {};
      if (uploadedAssets[0]) productAssetPaths[0] = uploadedAssets[0].path;

      const brief = buildCampaignBrief(form, {
        productAssetPaths,
        logoPath: uploadedAssets[1]?.path,
      });

      const progressPromise = (async () => {
        for (const s of STEP_DELAYS.slice(1)) {
          await sleep(500);
          setPipelineStep(s);
        }
      })();

      const resultPromise = runCampaign(brief);
      const [, result] = await Promise.all([progressPromise, resultPromise]);

      setPipelineStep('complete');
      setReport(result.report);
    } catch (err) {
      setPipelineStep('error');
      setError(err instanceof Error ? err.message : 'Pipeline failed');
    }
  }, [form, uploadedAssets]);

  const products = report?.products ?? [];

  return (
    <Layout
      sidebar={
        <WorkflowSidebar
          form={form}
          onChange={setForm}
          activeStep={workflowStep}
          onStepChange={setWorkflowStep}
          onUploadedAssets={handleUploadedAssets}
          onGenerate={handleGenerate}
          pipelineStep={pipelineStep}
          hasReport={report !== null}
        />
      }
      canvas={
        <CreativeCanvas
          products={products}
          selectedRatio={selectedRatio}
          onRatioChange={setSelectedRatio}
          pipelineStep={pipelineStep}
          report={report}
          campaignName={form.campaignName}
        />
      }
      insights={
        <InsightsPanel
          pipelineStep={pipelineStep}
          error={error}
          report={report}
          products={products}
          activeWorkflowStep={workflowStep}
        />
      }
    />
  );
}
