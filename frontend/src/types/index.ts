export interface Product {
  name: string;
  type: string;
  description: string;
  existingAssetPath?: string;
}

export interface Region {
  code: string;
  language: string;
  localizedMessage?: string;
}

export interface CampaignBrief {
  campaignName: string;
  products: Product[];
  regions: Region[];
  audiences: string[];
  message: string;
  brandColors?: string[];
  style?: string;
  logoPath?: string;
}

export type AspectRatioKey = '1x1' | '9x16' | '16x9';

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

export interface CampaignRunResponse {
  status: string;
  report: CampaignReport;
}

export interface CampaignSummary {
  campaignSlug: string;
  campaignName: string;
  completedAt: string;
  productCount: number;
  outputCount: number;
  generationProvider: string;
  thumbnailPath?: string;
}

export interface UploadedAsset {
  originalName: string;
  path: string;
  size: number;
}

export type ModalWorkflowStep =
  | 'campaign'
  | 'products'
  | 'markets'
  | 'assets'
  | 'generate';

export type PipelineStep =
  | 'idle'
  | 'validating'
  | 'resolving_assets'
  | 'generating'
  | 'processing'
  | 'compliance'
  | 'complete'
  | 'error';
