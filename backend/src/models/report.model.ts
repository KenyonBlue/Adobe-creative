import { AspectRatioKey } from '../config';

export interface ComplianceCheckResult {
  check: string;
  category: 'brand' | 'legal';
  passed: boolean;
  message: string;
}

export interface ProductOutput {
  productName: string;
  productSlug: string;
  region: string;
  message: string;
  outputs: Record<AspectRatioKey, string>;
  compliance: ComplianceCheckResult[];
  assetSource: 'reused' | 'generated';
}

export interface CampaignReport {
  campaignName: string;
  campaignSlug: string;
  startedAt: string;
  completedAt: string;
  processingDurationMs: number;
  assetsReused: string[];
  assetsGenerated: string[];
  localizedVariantsCreated: number;
  products: ProductOutput[];
  complianceFailures: ComplianceCheckResult[];
  outputPaths: string[];
  generationProvider: string;
}
