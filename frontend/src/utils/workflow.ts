import { WorkflowUiStep } from '../types';

export interface WorkflowStepConfig {
  id: WorkflowUiStep;
  label: string;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  { id: 'campaign', label: 'Campaign', description: 'Name, message & style' },
  { id: 'products', label: 'Products', description: 'Define your product lineup' },
  { id: 'markets', label: 'Markets', description: 'Regions & localization' },
  { id: 'assets', label: 'Assets', description: 'Upload brand assets' },
  { id: 'generate', label: 'Generate', description: 'Launch AI pipeline' },
  { id: 'review', label: 'Review', description: 'Inspect creatives' },
  { id: 'export', label: 'Export', description: 'Download outputs' },
];

export function getStepIndex(step: WorkflowUiStep): number {
  return WORKFLOW_STEPS.findIndex((s) => s.id === step);
}

export function canAdvanceStep(step: WorkflowUiStep, hasReport: boolean): boolean {
  if (step === 'review' || step === 'export') return hasReport;
  if (step === 'generate') return true;
  return getStepIndex(step) < WORKFLOW_STEPS.length - 1;
}
