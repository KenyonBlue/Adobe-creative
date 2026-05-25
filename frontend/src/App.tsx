import { useCallback, useState } from 'react';
import Layout from './components/Layout';
import CampaignForm from './components/CampaignForm';
import GenerationStatus from './components/GenerationStatus';
import PreviewGallery from './components/PreviewGallery';
import AspectRatioTabs from './components/AspectRatioTabs';
import ComplianceStatus from './components/ComplianceStatus';
import ReportSummary from './components/ReportSummary';
import { runCampaign } from './api/client';
import {
  AspectRatioKey,
  CampaignReport,
  PipelineStep,
  UploadedAsset,
} from './types';

const DEFAULT_BRIEF = `{
  "campaignName": "Summer Energy Campaign",
  "products": [
    {
      "name": "Hydration Drink",
      "type": "beverage",
      "description": "Electrolyte-rich sports hydration drink with tropical citrus flavor"
    },
    {
      "name": "Protein Bar",
      "type": "snack",
      "description": "High-protein energy bar with dark chocolate and almond crunch"
    }
  ],
  "regions": [
    { "code": "us", "language": "en" },
    { "code": "jp", "language": "ja", "localizedMessage": "夏のエネルギーをチャージ" }
  ],
  "audiences": ["fitness enthusiasts", "outdoor athletes"],
  "message": "Fuel Your Summer — Power Through Every Workout",
  "brandColors": ["#1473E6", "#FF6B00", "#FFFFFF"],
  "style": "premium athletic lifestyle"
}`;

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
  const [briefJson, setBriefJson] = useState(DEFAULT_BRIEF);
  const [step, setStep] = useState<PipelineStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CampaignReport | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioKey>('1x1');
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);

  const handleUploadedAssets = useCallback((assets: UploadedAsset[]) => {
    setUploadedAssets((prev) => [...prev, ...assets]);
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setReport(null);
    setStep('validating');

    try {
      const brief = JSON.parse(briefJson);

      if (uploadedAssets.length > 0 && brief.products?.[0]) {
        brief.products[0].existingAssetPath = uploadedAssets[0].path;
      }

      const progressPromise = (async () => {
        for (const s of STEP_DELAYS.slice(1)) {
          await sleep(400);
          setStep(s);
        }
      })();

      const resultPromise = runCampaign(brief);
      const [, result] = await Promise.all([progressPromise, resultPromise]);

      setStep('complete');
      setReport(result.report);
    } catch (err) {
      setStep('error');
      setError(err instanceof Error ? err.message : 'Pipeline failed');
    }
  }, [briefJson, uploadedAssets]);

  return (
    <Layout>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <CampaignForm
            briefJson={briefJson}
            onBriefChange={setBriefJson}
            onUploadedAssets={handleUploadedAssets}
            onSubmit={handleSubmit}
            isRunning={step !== 'idle' && step !== 'complete' && step !== 'error'}
          />
          <GenerationStatus step={step} error={error} />
          <ComplianceStatus products={report?.products ?? []} />
          <ReportSummary report={report} />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Preview Gallery</h2>
            <AspectRatioTabs selected={selectedRatio} onChange={setSelectedRatio} />
          </div>
          <PreviewGallery
            products={report?.products ?? []}
            selectedRatio={selectedRatio}
          />
        </div>
      </div>
    </Layout>
  );
}
