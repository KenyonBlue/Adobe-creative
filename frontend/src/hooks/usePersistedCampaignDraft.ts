import { useCallback, useEffect, useRef, useState } from 'react';
import { ModalWorkflowStep, UploadedAsset } from '../types';
import { CampaignFormState, DEFAULT_FORM_STATE } from '../utils/brief-form';

const STORAGE_KEY = 'creative-automation-draft';

interface PersistedDraft {
  form: CampaignFormState;
  modalStep: ModalWorkflowStep;
  uploadedAssets: UploadedAsset[];
  savedAt: string;
}

function normalizeForm(raw: unknown): CampaignFormState {
  if (!raw || typeof raw !== 'object') return DEFAULT_FORM_STATE;

  const data = raw as Partial<CampaignFormState>;
  const brandColorsRaw = (data as { brandColors?: unknown }).brandColors;

  return {
    campaignName: typeof data.campaignName === 'string' ? data.campaignName : '',
    message: typeof data.message === 'string' ? data.message : '',
    audiences: typeof data.audiences === 'string' ? data.audiences : '',
    style: typeof data.style === 'string' ? data.style : '',
    brandColors: Array.isArray(brandColorsRaw)
      ? brandColorsRaw.filter((c): c is string => typeof c === 'string')
      : typeof brandColorsRaw === 'string'
        ? brandColorsRaw.split(',').map((c) => c.trim()).filter(Boolean)
        : DEFAULT_FORM_STATE.brandColors,
    products: Array.isArray(data.products)
      ? data.products.map((p) => ({
          name: p?.name ?? '',
          type: p?.type ?? '',
          description: p?.description ?? '',
        }))
      : DEFAULT_FORM_STATE.products,
    regions: Array.isArray(data.regions)
      ? data.regions.map((r) => ({
          code: r?.code ?? '',
          language: r?.language ?? 'en',
        }))
      : DEFAULT_FORM_STATE.regions,
  };
}

function loadDraft(): PersistedDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedDraft>;
    if (!parsed.form) return null;

    const validSteps: ModalWorkflowStep[] = [
      'campaign',
      'products',
      'markets',
      'assets',
      'generate',
    ];

    return {
      form: normalizeForm(parsed.form),
      modalStep: validSteps.includes(parsed.modalStep as ModalWorkflowStep)
        ? (parsed.modalStep as ModalWorkflowStep)
        : 'campaign',
      uploadedAssets: Array.isArray(parsed.uploadedAssets) ? parsed.uploadedAssets : [],
      savedAt: parsed.savedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function saveDraft(draft: Omit<PersistedDraft, 'savedAt'>): void {
  try {
    const payload: PersistedDraft = {
      ...draft,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function usePersistedCampaignDraft() {
  const initialDraft = useRef(loadDraft());
  const [form, setFormState] = useState<CampaignFormState>(
    () => initialDraft.current?.form ?? DEFAULT_FORM_STATE
  );
  const [modalStep, setModalStep] = useState<ModalWorkflowStep>(
    () => initialDraft.current?.modalStep ?? 'campaign'
  );
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>(
    () => initialDraft.current?.uploadedAssets ?? []
  );
  const [draftRestored, setDraftRestored] = useState(() => initialDraft.current !== null);
  const isFirstSave = useRef(true);

  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    saveDraft({ form, modalStep, uploadedAssets });
  }, [form, modalStep, uploadedAssets]);

  const setForm = useCallback((next: CampaignFormState | ((prev: CampaignFormState) => CampaignFormState)) => {
    setFormState(next);
    setDraftRestored(false);
  }, []);

  const updateModalStep = useCallback((step: ModalWorkflowStep) => {
    setModalStep(step);
  }, []);

  const appendUploadedAssets = useCallback((assets: UploadedAsset[]) => {
    setUploadedAssets((prev) => [...prev, ...assets]);
    setDraftRestored(false);
  }, []);

  const removeUploadedAsset = useCallback((index: number) => {
    setUploadedAssets((prev) => prev.filter((_, i) => i !== index));
    setDraftRestored(false);
  }, []);

  const clearSession = useCallback(() => {
    setFormState(DEFAULT_FORM_STATE);
    setModalStep('campaign');
    setUploadedAssets([]);
    setDraftRestored(false);
    clearDraft();
  }, []);

  const dismissDraftNotice = useCallback(() => {
    setDraftRestored(false);
  }, []);

  const finalizeDraft = useCallback(() => {
    clearDraft();
    isFirstSave.current = true;
    setDraftRestored(false);
  }, []);

  return {
    form,
    setForm,
    modalStep,
    setModalStep: updateModalStep,
    uploadedAssets,
    appendUploadedAssets,
    removeUploadedAsset,
    clearSession,
    finalizeDraft,
    draftRestored,
    dismissDraftNotice,
  };
}
