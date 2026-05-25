import { useCallback, useRef, useState } from 'react';
import { uploadAssets } from '../api/client';
import { PipelineStep, UploadedAsset, WorkflowUiStep } from '../types';
import {
  CampaignFormState,
  ProductFormState,
  RegionFormState,
  createEmptyProduct,
  createEmptyRegion,
  validateForm,
} from '../utils/brief-form';
import { WORKFLOW_STEPS, getStepIndex } from '../utils/workflow';
import { Section, TextAreaField, TextField } from './FormFields';

interface WorkflowSidebarProps {
  form: CampaignFormState;
  onChange: (form: CampaignFormState) => void;
  activeStep: WorkflowUiStep;
  onStepChange: (step: WorkflowUiStep) => void;
  onUploadedAssets: (assets: UploadedAsset[]) => void;
  onGenerate: () => void;
  pipelineStep: PipelineStep;
  hasReport: boolean;
}

function updateProduct(
  products: ProductFormState[],
  index: number,
  field: keyof ProductFormState,
  value: string
): ProductFormState[] {
  return products.map((p, i) => (i === index ? { ...p, [field]: value } : p));
}

function updateRegion(
  regions: RegionFormState[],
  index: number,
  field: keyof RegionFormState,
  value: string
): RegionFormState[] {
  return regions.map((r, i) => (i === index ? { ...r, [field]: value } : r));
}

function StepIcon({ step, active, done }: { step: WorkflowUiStep; active: boolean; done: boolean }) {
  const icons: Record<WorkflowUiStep, string> = {
    campaign: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    markets: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    assets: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    generate: 'M13 10V3L4 14h7v7l9-11h-7z',
    review: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
    export: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4',
  };

  return (
    <svg
      className={`h-4 w-4 ${active ? 'text-blue-400' : done ? 'text-emerald-500' : 'text-zinc-600'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[step]} />
    </svg>
  );
}

export default function WorkflowSidebar({
  form,
  onChange,
  activeStep,
  onStepChange,
  onUploadedAssets,
  onGenerate,
  pipelineStep,
  hasReport,
}: WorkflowSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isRunning =
    pipelineStep !== 'idle' && pipelineStep !== 'complete' && pipelineStep !== 'error';

  const activeIndex = getStepIndex(activeStep);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;
      setUploadStatus('Uploading...');
      try {
        const result = await uploadAssets(fileArray);
        onUploadedAssets(result.uploaded);
        setUploadStatus(`${result.uploaded.length} file(s) ready`);
      } catch (err) {
        setUploadStatus(err instanceof Error ? err.message : 'Upload failed');
      }
    },
    [onUploadedAssets]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const goNext = () => {
    const next = WORKFLOW_STEPS[activeIndex + 1];
    if (next) onStepChange(next.id);
  };

  const goPrev = () => {
    const prev = WORKFLOW_STEPS[activeIndex - 1];
    if (prev) onStepChange(prev.id);
  };

  const handleGenerate = () => {
    const error = validateForm(form);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    onGenerate();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 'campaign':
        return (
          <div className="space-y-4">
            <TextField
              label="Campaign Name"
              placeholder="Summer Energy Campaign"
              value={form.campaignName}
              onChange={(e) => onChange({ ...form, campaignName: e.target.value })}
            />
            <TextAreaField
              label="Campaign Message"
              placeholder="Fuel Your Summer — Power Through Every Workout"
              rows={3}
              value={form.message}
              onChange={(e) => onChange({ ...form, message: e.target.value })}
              hint="Headline overlaid on final creatives"
            />
            <TextField
              label="Creative Style"
              placeholder="premium athletic lifestyle"
              value={form.style}
              onChange={(e) => onChange({ ...form, style: e.target.value })}
            />
            <TextField
              label="Brand Colors"
              placeholder="#1473E6, #FF6B00, #FFFFFF"
              value={form.brandColors}
              onChange={(e) => onChange({ ...form, brandColors: e.target.value })}
              hint="Comma-separated hex values"
            />
            <TextField
              label="Target Audiences"
              placeholder="fitness enthusiasts, outdoor athletes"
              value={form.audiences}
              onChange={(e) => onChange({ ...form, audiences: e.target.value })}
              hint="Comma-separated"
            />
          </div>
        );

      case 'products':
        return (
          <div className="space-y-4">
            {form.products.map((product, index) => (
              <div key={index} className="space-y-3 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Product {index + 1}</span>
                  {form.products.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ ...form, products: form.products.filter((_, i) => i !== index) })
                      }
                      className="text-xs text-red-400/70 hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <TextField
                  label="Name"
                  placeholder="Hydration Drink"
                  value={product.name}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      products: updateProduct(form.products, index, 'name', e.target.value),
                    })
                  }
                />
                <TextField
                  label="Type"
                  placeholder="beverage"
                  value={product.type}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      products: updateProduct(form.products, index, 'type', e.target.value),
                    })
                  }
                />
                <TextAreaField
                  label="Description"
                  placeholder="Electrolyte-rich sports hydration drink..."
                  rows={2}
                  value={product.description}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      products: updateProduct(form.products, index, 'description', e.target.value),
                    })
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange({ ...form, products: [...form.products, createEmptyProduct()] })
              }
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              + Add product
            </button>
          </div>
        );

      case 'markets':
        return (
          <div className="space-y-4">
            {form.regions.map((region, index) => (
              <div key={index} className="space-y-3 rounded-xl bg-white/[0.02] p-3 ring-1 ring-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Market {index + 1}</span>
                  {form.regions.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({ ...form, regions: form.regions.filter((_, i) => i !== index) })
                      }
                      className="text-xs text-red-400/70 hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Region"
                    placeholder="us"
                    value={region.code}
                    onChange={(e) =>
                      onChange({
                        ...form,
                        regions: updateRegion(form.regions, index, 'code', e.target.value),
                      })
                    }
                  />
                  <TextField
                    label="Language"
                    placeholder="en"
                    value={region.language}
                    onChange={(e) =>
                      onChange({
                        ...form,
                        regions: updateRegion(form.regions, index, 'language', e.target.value),
                      })
                    }
                  />
                </div>
                <TextField
                  label="Localized Message"
                  placeholder="Optional market-specific headline"
                  value={region.localizedMessage}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      regions: updateRegion(
                        form.regions,
                        index,
                        'localizedMessage',
                        e.target.value
                      ),
                    })
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange({ ...form, regions: [...form.regions, createEmptyRegion()] })
              }
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              + Add market
            </button>
          </div>
        );

      case 'assets':
        return (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl p-8 text-center transition-all duration-200 ${
              dragOver
                ? 'bg-blue-500/10 ring-2 ring-blue-500/30'
                : 'bg-white/[0.02] ring-1 ring-white/[0.06] hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
              <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-zinc-300">Drop assets here</p>
            <p className="mt-1 text-xs text-zinc-500">Product images & logos · PNG, JPG, WebP</p>
            <p className="mt-2 text-xs text-zinc-600">1st → Product 1 · 2nd → Logo</p>
            {uploadStatus && <p className="mt-3 text-xs text-blue-400">{uploadStatus}</p>}
          </div>
        );

      case 'generate':
        return (
          <div className="space-y-4">
            <div className="rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.04]">
              <p className="text-xs text-zinc-500">Ready to generate</p>
              <p className="mt-1 text-sm font-medium text-zinc-200">{form.campaignName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-400">
                  {form.products.length} products
                </span>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-400">
                  {form.regions.length} markets
                </span>
                <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-400">
                  3 aspect ratios
                </span>
              </div>
            </div>
            {validationError && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/20">
                {validationError}
              </p>
            )}
            <button
              onClick={handleGenerate}
              disabled={isRunning}
              className="studio-btn-primary w-full py-3"
            >
              {isRunning ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                  Generating...
                </span>
              ) : (
                'Launch AI Pipeline'
              )}
            </button>
          </div>
        );

      case 'review':
        return (
          <p className="text-sm leading-relaxed text-zinc-500">
            {hasReport
              ? 'Inspect your generated creatives in the canvas. Switch aspect ratios, check compliance badges, and hover for export options.'
              : 'Run the pipeline first to review generated creatives.'}
          </p>
        );

      case 'export':
        return (
          <p className="text-sm leading-relaxed text-zinc-500">
            Download individual creatives from the canvas or use bulk export in the insights panel.
          </p>
        );
    }
  };

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-r border-white/[0.06] bg-studio-surface/80 backdrop-blur-xl">
      {/* Brand */}
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white">Creative Studio</h1>
            <p className="text-[10px] text-zinc-500">AI Campaign Orchestration</p>
          </div>
        </div>
      </div>

      {/* Workflow steps */}
      <nav className="border-b border-white/[0.06] px-3 py-3">
        <ul className="space-y-0.5">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = activeStep === step.id;
            const isDone = hasReport
              ? idx <= getStepIndex('review')
              : idx < activeIndex;

            return (
              <li key={step.id}>
                <button
                  onClick={() => onStepChange(step.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-white/[0.06] text-white'
                      : 'text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300'
                  }`}
                >
                  <StepIcon step={step.id} active={isActive} done={isDone && !isActive} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{step.label}</p>
                    {isActive && (
                      <p className="truncate text-[10px] text-zinc-500">{step.description}</p>
                    )}
                  </div>
                  {isDone && !isActive && (
                    <span className="text-[10px] text-emerald-500">✓</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Active step form */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <Section title={WORKFLOW_STEPS[activeIndex]?.label ?? 'Setup'}>
          {renderStepContent()}
        </Section>
      </div>

      {/* Navigation footer */}
      {activeStep !== 'generate' && (
        <div className="flex gap-2 border-t border-white/[0.06] px-5 py-4">
          {activeIndex > 0 && (
            <button onClick={goPrev} className="studio-btn-ghost flex-1">
              Back
            </button>
          )}
          {activeIndex < WORKFLOW_STEPS.length - 1 && (
            <button onClick={goNext} className="studio-btn-primary flex-1">
              Continue
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
