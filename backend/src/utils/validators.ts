import { CampaignBrief } from '../models/campaign-brief.model';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateCampaignBrief(brief: CampaignBrief): void {
  if (!brief.campaignName?.trim()) {
    throw new ValidationError('campaignName is required');
  }
  if (!brief.products || brief.products.length < 2) {
    throw new ValidationError('At least two products are required');
  }
  for (const product of brief.products) {
    if (!product.name?.trim()) throw new ValidationError('Each product must have a name');
    if (!product.type?.trim()) throw new ValidationError('Each product must have a type');
    if (!product.description?.trim()) throw new ValidationError('Each product must have a description');
  }
  if (!brief.regions || brief.regions.length === 0) {
    throw new ValidationError('At least one target region is required');
  }
  if (!brief.audiences || brief.audiences.length === 0) {
    throw new ValidationError('At least one target audience is required');
  }
  if (!brief.message?.trim()) {
    throw new ValidationError('Campaign message is required');
  }
}
