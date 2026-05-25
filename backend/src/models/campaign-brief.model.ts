import { CampaignReport } from './report.model';

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

export interface CampaignRunRequest {
  brief: CampaignBrief;
}

export type CampaignStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface CampaignRun {
  id: string;
  status: CampaignStatus;
  brief: CampaignBrief;
  startedAt: string;
  completedAt?: string;
  error?: string;
  report?: CampaignReport;
}
