import { CampaignBrief } from '../models/campaign-brief.model';

export const MIN_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

export function createTestBrief(overrides: Partial<CampaignBrief> = {}): CampaignBrief {
  return {
    campaignName: 'Test Campaign',
    message: 'Fuel Your Summer',
    audiences: ['fitness enthusiasts'],
    products: [
      {
        name: 'Hydration Drink',
        type: 'beverage',
        description: 'Electrolyte-rich sports hydration drink',
      },
      {
        name: 'Protein Bar',
        type: 'snack',
        description: 'High-protein energy bar',
      },
    ],
    regions: [
      { code: 'us', language: 'en' },
      { code: 'jp', language: 'ja' },
    ],
    brandColors: ['#1473E6', '#FFFFFF'],
    style: 'premium athletic lifestyle',
    ...overrides,
  };
}
