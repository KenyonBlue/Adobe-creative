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
