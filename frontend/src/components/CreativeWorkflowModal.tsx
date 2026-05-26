import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { uploadAssets } from '../api/client';
import { ModalWorkflowStep, PipelineStep, UploadedAsset } from '../types';
import {
  CampaignFormState,
  ProductFormState,
  RegionFormState,
  createEmptyProduct,
  createEmptyRegion,
  mapUploadedAssets,
  validateForm,
  COMMON_MARKETS,
  COMMON_LANGUAGES,
} from '../utils/brief-form';
import { estimateGenerationTime } from '../utils/generation-estimate';
import { TextAreaField, TextField } from './FormFields';
import BrandColorPicker from './BrandColorPicker';
import AudiencePicker from './AudiencePicker';
import StylePicker from './StylePicker';
import { GenerationEstimateBadge } from './GenerationStatus';
import PipelineErrorBanner from './PipelineErrorBanner';

const MODAL_WORKFLOW_STEPS = [
  { id: 'campaign' as const, label: 'Campaign', description: 'Name, message & style' },
  { id: 'products' as const, label: 'Products', description: 'Define your product lineup' },
  { id: 'markets' as const, label: 'Markets', description: 'Regions & localization' },
  { id: 'assets' as const, label: 'Assets', description: 'Upload brand assets' },
  { id: 'generate' as const, label: 'Generate', description: 'Launch AI pipeline' },
];

function getModalStepIndex(step: ModalWorkflowStep): number {
  return MODAL_WORKFLOW_STEPS.findIndex((s) => s.id === step);
}

const GENERATING_BUTTON_MESSAGES = [
  'Generating hero images…',
  'AI is composing scenes…',
  'Building your creatives…',
  'Processing variants…',
  'Almost there…',
];

interface CreativeWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  form: CampaignFormState;
  onChange: (form: CampaignFormState) => void;
  activeStep: ModalWorkflowStep;
  onStepChange: (step: ModalWorkflowStep) => void;
  onUploadedAssets: (assets: UploadedAsset[]) => void;
  onRemoveUploadedAsset: (index: number) => void;
  onGenerate: () => void;
  pipelineStep: PipelineStep;
  hasReport: boolean;
  uploadedAssets?: UploadedAsset[];
  error?: string | null;
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

function assetLabel(index: number, productCount: number, total: number): string {
  const hasLogo = total === productCount + 1;
  if (hasLogo && index === total - 1) return 'Logo';
  return `Product ${index + 1}`;
}

export default function CreativeWorkflowModal({
  open,
  onClose,
  form,
  onChange,
  activeStep,
  onStepChange,
  onUploadedAssets,
  onRemoveUploadedAsset,
  onGenerate,
  pipelineStep,
  hasReport,
  uploadedAssets = [],
  error = null,
}: CreativeWorkflowModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [buttonMsgIndex, setButtonMsgIndex] = useState(0);

  const isRunning =
    pipelineStep !== 'idle' && pipelineStep !== 'complete' && pipelineStep !== 'error';

  const generationEstimate = useMemo(
    () =>
      estimateGenerationTime({
        productCount: form.products.length,
        regionCount: form.regions.length,
        uploadedProductCount: Object.keys(
          mapUploadedAssets(uploadedAssets, form.products.length).productAssetPaths
        ).length,
      }),
    [form.products.length, form.regions.length, uploadedAssets]
  );

  useEffect(() => {
    if (!isRunning) {
      setButtonMsgIndex(0);
      return;
    }
    const id = setInterval(() => {
      setButtonMsgIndex((prev) => (prev + 1) % GENERATING_BUTTON_MESSAGES.length);
    }, 2500);
    return () => clearInterval(id);
  }, [isRunning]);

  const activeIndex = getModalStepIndex(activeStep);
  const canClose = !isRunning;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, canClose, onClose]);

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
    const next = MODAL_WORKFLOW_STEPS[activeIndex + 1];
    if (next) onStepChange(next.id);
  };

  const goPrev = () => {
    const prev = MODAL_WORKFLOW_STEPS[activeIndex - 1];
    if (prev) onStepChange(prev.id);
  };

  const handleLaunch = () => {
    const error = validateForm(form);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    onGenerate();
  };

  if (!open) return null;

  const renderStepContent = () => {
    switch (activeStep) {
      case 'campaign':
        return (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                label="Campaign Name"
                placeholder="Summer Energy Campaign"
                value={form.campaignName}
                onChange={(e) => onChange({ ...form, campaignName: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <TextAreaField
                label="Campaign Message"
                placeholder="Fuel Your Summer — Power Through Every Workout"
                rows={2}
                value={form.message}
                onChange={(e) => onChange({ ...form, message: e.target.value })}
                hint="Appears on every creative and is automatically localized for each market."
              />
            </div>
            <div className="sm:col-span-2">
              <StylePicker
                value={form.style}
                onChange={(style) => onChange({ ...form, style })}
              />
            </div>
            <div className="sm:col-span-2">
              <BrandColorPicker
                colors={form.brandColors}
                onChange={(brandColors) => onChange({ ...form, brandColors })}
                hint="Click a swatch to edit, then Pick to apply · × to remove"
              />
            </div>
            <div className="sm:col-span-2">
              <AudiencePicker
                value={form.audiences}
                onChange={(audiences) => onChange({ ...form, audiences })}
                hint="Select presets or add your own"
              />
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-4">
            {form.products.map((product, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.04] sm:grid-cols-2"
              >
                <div className="flex items-center justify-between sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Product {index + 1}
                  </span>
                  {form.products.length > 1 && (
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
                <div className="sm:col-span-2">
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
                    hint="Primary input for AI image generation — be specific"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                onChange({ ...form, products: [...form.products, createEmptyProduct()] })
              }
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              + Add product
            </button>
          </div>
        );

      case 'markets':
        return (
          <div className="space-y-5">
            <p className="text-sm text-zinc-400">
              Your campaign message is translated automatically for each market based on its language.
            </p>
            {/* Quick-add market pills */}
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Quick Add
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_MARKETS.map((market) => {
                  const alreadyAdded = form.regions.some((r) => r.code === market.code);
                  return (
                    <button
                      key={market.code}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => {
                        if (!alreadyAdded) {
                          onChange({
                            ...form,
                            regions: [
                              ...form.regions,
                              { code: market.code, language: market.language },
                            ],
                          });
                        }
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        alreadyAdded
                          ? 'cursor-default bg-emerald-500/10 text-emerald-400/60 ring-1 ring-emerald-500/20'
                          : 'bg-white/[0.04] text-zinc-300 ring-1 ring-white/[0.08] hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <span>{market.flag}</span>
                      <span>{market.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Added markets */}
            {form.regions.map((region, index) => {
              const market = COMMON_MARKETS.find((m) => m.code === region.code);
              const regionSelectValue = COMMON_MARKETS.some((m) => m.code === region.code)
                ? region.code
                : region.code
                  ? '__custom__'
                  : '';
              const langSelectValue = COMMON_LANGUAGES.some((l) => l.code === region.language)
                ? region.language
                : region.language
                  ? '__custom__'
                  : '';

              return (
                <div
                  key={index}
                  className="rounded-xl bg-white/[0.02] p-4 ring-1 ring-white/[0.04]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {market ? `${market.flag} ${market.name}` : `Market ${index + 1}`}
                    </span>
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

                  <div className="grid gap-4 sm:grid-cols-3">
                    {/* Region dropdown */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Region
                      </label>
                      <select
                        value={regionSelectValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '__custom__') {
                            onChange({
                              ...form,
                              regions: updateRegion(form.regions, index, 'code', ''),
                            });
                          } else {
                            const m = COMMON_MARKETS.find((m) => m.code === val);
                            const updated = form.regions.map((r, i) =>
                              i === index
                                ? { ...r, code: val, language: m?.language ?? r.language }
                                : r
                            );
                            onChange({ ...form, regions: updated });
                          }
                        }}
                        className="w-full rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-white ring-1 ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="" className="bg-zinc-900">
                          Select region…
                        </option>
                        {COMMON_MARKETS.map((m) => (
                          <option key={m.code} value={m.code} className="bg-zinc-900">
                            {m.flag} {m.name} ({m.code})
                          </option>
                        ))}
                        <option value="__custom__" className="bg-zinc-900">
                          Custom…
                        </option>
                      </select>
                      {regionSelectValue === '__custom__' && (
                        <input
                          type="text"
                          placeholder="e.g. sg"
                          value={region.code}
                          onChange={(e) =>
                            onChange({
                              ...form,
                              regions: updateRegion(form.regions, index, 'code', e.target.value),
                            })
                          }
                          className="mt-2 w-full rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-white placeholder-zinc-600 ring-1 ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      )}
                    </div>

                    {/* Language dropdown */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                        Language
                      </label>
                      <select
                        value={langSelectValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChange({
                            ...form,
                            regions: updateRegion(
                              form.regions,
                              index,
                              'language',
                              val === '__custom__' ? '' : val
                            ),
                          });
                        }}
                        className="w-full rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-white ring-1 ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="" className="bg-zinc-900">
                          Select language…
                        </option>
                        {COMMON_LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code} className="bg-zinc-900">
                            {l.name} ({l.code})
                          </option>
                        ))}
                        <option value="__custom__" className="bg-zinc-900">
                          Custom…
                        </option>
                      </select>
                      {langSelectValue === '__custom__' && (
                        <input
                          type="text"
                          placeholder="e.g. ar"
                          value={region.language}
                          onChange={(e) =>
                            onChange({
                              ...form,
                              regions: updateRegion(
                                form.regions,
                                index,
                                'language',
                                e.target.value
                              ),
                            })
                          }
                          className="mt-2 w-full rounded-lg bg-white/[0.06] px-3 py-2 text-sm text-white placeholder-zinc-600 ring-1 ring-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() =>
                onChange({ ...form, regions: [...form.regions, createEmptyRegion()] })
              }
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
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
            className={`cursor-pointer rounded-2xl p-12 text-center transition-all duration-200 ${
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
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
              <svg className="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-base font-medium text-zinc-200">Drop product photos here</p>
            <p className="mt-2 text-sm text-zinc-500">
              Real photos skip AI generation — best quality, fastest results
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Upload 1 per product, then optionally 1 logo at the end
            </p>
            {uploadStatus && <p className="mt-4 text-sm text-blue-400">{uploadStatus}</p>}
            {uploadedAssets.length > 0 && (
              <ul
                className="mt-6 space-y-2 text-left"
                onClick={(e) => e.stopPropagation()}
              >
                {uploadedAssets.map((asset, index) => (
                  <li
                    key={`${asset.path}-${index}`}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-zinc-300"
                  >
                    <span className="min-w-0 flex-1 truncate">{asset.originalName}</span>
                    <span className="shrink-0 text-xs text-emerald-400/80">
                      {assetLabel(index, form.products.length, uploadedAssets.length)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveUploadedAsset(index)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                      aria-label={`Remove ${asset.originalName}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

      case 'generate':
        return (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-6 ring-1 ring-white/[0.06]">
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                Ready to generate
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                {form.campaignName || 'Untitled Campaign'}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-lg bg-white/[0.06] px-3 py-1 text-sm text-zinc-300">
                  {form.products.length} products
                </span>
                <span className="rounded-lg bg-white/[0.06] px-3 py-1 text-sm text-zinc-300">
                  {form.regions.length} markets
                </span>
                <span className="rounded-lg bg-white/[0.06] px-3 py-1 text-sm text-zinc-300">
                  3 aspect ratios
                </span>
                {uploadedAssets.length > 0 && (
                  <span className="rounded-lg bg-white/[0.06] px-3 py-1 text-sm text-zinc-300">
                    {uploadedAssets.length} asset{uploadedAssets.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>
            </div>
            {!isRunning && (
              <GenerationEstimateBadge estimate={generationEstimate} variant="prominent" />
            )}
            {validationError && (
              <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/20">
                {validationError}
              </p>
            )}
            {error && pipelineStep === 'error' && (
              <PipelineErrorBanner error={error} compact />
            )}
            {isRunning && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-blue-500/10 px-4 py-3 ring-1 ring-blue-500/20">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                  <p className="text-sm text-blue-200">
                    Pipeline running — typical wait {generationEstimate.label}
                  </p>
                </div>
                <GenerationEstimateBadge estimate={generationEstimate} />
              </div>
            )}
          </div>
        );
    }
  };

  const currentStep = MODAL_WORKFLOW_STEPS[activeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={canClose ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-500/40 bg-zinc-950/95 shadow-2xl ring-1 ring-white/10 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Creative Workflow
            </p>
            <h2 className="text-lg font-semibold text-white">{currentStep?.label}</h2>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Step rail */}
          <nav className="hidden w-52 shrink-0 border-r border-white/[0.06] bg-white/[0.01] p-4 sm:block">
            <ol className="space-y-1">
              {MODAL_WORKFLOW_STEPS.map((step, idx) => {
                const isActive = activeStep === step.id;
                const isDone = hasReport ? true : idx < activeIndex;

                return (
                  <li key={step.id}>
                    <button
                      onClick={() => !isRunning && onStepChange(step.id)}
                      disabled={isRunning}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                        isActive
                          ? 'bg-white/[0.08] text-white'
                          : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 disabled:opacity-50'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isDone && !isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isActive
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-white/[0.04] text-zinc-600'
                        }`}
                      >
                        {isDone && !isActive ? '✓' : idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{step.label}</p>
                        <p className="text-[10px] text-zinc-600">{step.description}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-6">{renderStepContent()}</div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-6 py-4">
              <div className="text-xs text-zinc-500 sm:hidden">
                Step {activeIndex + 1} of {MODAL_WORKFLOW_STEPS.length}
              </div>
              <div className="flex flex-1 justify-end gap-2">
                {activeIndex > 0 && (
                  <button onClick={goPrev} disabled={isRunning} className="studio-btn-ghost px-5">
                    Back
                  </button>
                )}
                {activeStep !== 'generate' && activeStep !== 'assets' && (
                  <button onClick={goNext} className="studio-btn-primary px-5">
                    Continue
                  </button>
                )}
                {activeStep === 'assets' && (
                  <button onClick={() => onStepChange('generate')} className="studio-btn-primary px-5">
                    Continue
                  </button>
                )}
                {activeStep === 'generate' && (
                  <button
                    onClick={handleLaunch}
                    disabled={isRunning}
                    className={`studio-btn-primary px-6 py-2.5 ${isRunning ? 'animate-pulse' : ''}`}
                  >
                    {isRunning ? (
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                        <span key={buttonMsgIndex} className="animate-fadeInUp">
                          {GENERATING_BUTTON_MESSAGES[buttonMsgIndex]}
                        </span>
                      </span>
                    ) : hasReport ? (
                      'Regenerate Creatives'
                    ) : (
                      `Launch · ${generationEstimate.label}`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
