import { useCallback, useState } from 'react';
import Layout from './components/Layout';
import AppSidebar from './components/AppSidebar';
import CreativeWorkflowModal from './components/CreativeWorkflowModal';
import CampaignHistoryModal from './components/CampaignHistoryModal';
import CreativeCanvas from './components/CreativeCanvas';
import InsightsPanel from './components/InsightsPanel';
import { runCampaign } from './api/client';
import { usePersistedCampaignDraft } from './hooks/usePersistedCampaignDraft';
import {
  AspectRatioKey,
  CampaignReport,
  ModalWorkflowStep,
  PipelineStep,
} from './types';
import { buildCampaignBrief, CampaignFormState, mapUploadedAssets } from './utils/brief-form';

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
  const {
    form,
    setForm,
    modalStep,
    setModalStep,
    uploadedAssets,
    appendUploadedAssets,
    removeUploadedAsset,
    clearSession,
    finalizeDraft,
    draftRestored,
    dismissDraftNotice,
  } = usePersistedCampaignDraft();

  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CampaignReport | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioKey>('1x1');

  const isRunning =
    pipelineStep !== 'idle' && pipelineStep !== 'complete' && pipelineStep !== 'error';

  const openWorkflow = useCallback(
    (step: ModalWorkflowStep = 'campaign') => {
      setModalStep(step);
      setModalOpen(true);
      dismissDraftNotice();
    },
    [setModalStep, dismissDraftNotice]
  );

  const startNewCampaign = useCallback(() => {
    clearSession();
    setHistoryOpen(false);
    setPipelineStep('idle');
    setError(null);
    setReport(null);
    setSelectedRatio('1x1');
    setModalOpen(true);
  }, [clearSession]);

  const handleCreateCampaign = useCallback(() => {
    if (report) {
      startNewCampaign();
    } else {
      openWorkflow('campaign');
    }
  }, [report, startNewCampaign, openWorkflow]);

  const handleReset = useCallback(() => {
    startNewCampaign();
    setModalOpen(false);
  }, [startNewCampaign]);

  const handleLoadCampaign = useCallback(
    (loaded: CampaignReport) => {
      setReport(loaded);
      setPipelineStep('complete');
      setError(null);
      setForm((prev: CampaignFormState) => ({ ...prev, campaignName: loaded.campaignName }));
      dismissDraftNotice();
    },
    [setForm, dismissDraftNotice]
  );

  const { productAssetPaths, logoPath } = mapUploadedAssets(
    uploadedAssets,
    form.products.length
  );
  const uploadedProductCount = Object.keys(productAssetPaths).length;
  const productCount = form.products.length;
  const regionCount = form.regions.length;

  const handleGenerate = useCallback(async () => {
    setError(null);
    setReport(null);
    setPipelineStep('validating');
    setModalOpen(false);
    dismissDraftNotice();

    try {
      const brief = buildCampaignBrief(form, {
        productAssetPaths,
        logoPath,
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
      finalizeDraft();
    } catch (err) {
      setPipelineStep('error');
      setError(err instanceof Error ? err.message : 'Pipeline failed');
      setModalOpen(true);
      setModalStep('generate');
    }
  }, [form, productAssetPaths, logoPath, setModalStep, dismissDraftNotice, finalizeDraft]);

  const products = report?.products ?? [];

  return (
    <>
      {draftRestored && !report && pipelineStep === 'idle' && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-zinc-900/95 px-4 py-3 text-sm text-zinc-300 shadow-xl ring-1 ring-white/10">
          <span>Draft restored — your campaign setup was saved locally.</span>
          <button
            onClick={() => openWorkflow()}
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Continue
          </button>
          <button
            onClick={dismissDraftNotice}
            className="text-zinc-500 hover:text-zinc-300"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <Layout
        sidebar={
          <AppSidebar
            campaignName={form.campaignName}
            hasReport={report !== null}
            isRunning={isRunning}
            onOpenWorkflow={handleCreateCampaign}
            onOpenHistory={() => setHistoryOpen(true)}
            onNewCampaign={handleReset}
            onRegenerate={handleGenerate}
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
            productCount={productCount}
            regionCount={regionCount}
            uploadedProductCount={uploadedProductCount}
            error={error}
            onRegenerate={handleGenerate}
            onReset={handleReset}
            onCreateCampaign={handleCreateCampaign}
            onEditCampaign={() => openWorkflow('campaign')}
          />
        }
        insights={
          <InsightsPanel
            pipelineStep={pipelineStep}
            error={error}
            report={report}
            products={products}
            productCount={productCount}
            regionCount={regionCount}
            uploadedProductCount={uploadedProductCount}
          />
        }
      />

      <CreativeWorkflowModal
        open={modalOpen}
        onClose={() => !isRunning && setModalOpen(false)}
        form={form}
        onChange={setForm}
        activeStep={modalStep}
        onStepChange={setModalStep}
        onUploadedAssets={appendUploadedAssets}
        onRemoveUploadedAsset={removeUploadedAsset}
        onGenerate={handleGenerate}
        pipelineStep={pipelineStep}
        hasReport={report !== null}
        uploadedAssets={uploadedAssets}
        error={error}
      />

      <CampaignHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleLoadCampaign}
        activeSlug={report?.campaignSlug}
      />
    </>
  );
}
