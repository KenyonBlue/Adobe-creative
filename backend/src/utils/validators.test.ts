import { describe, expect, it } from 'vitest';
import { validateCampaignBrief, ValidationError } from './validators';
import { createTestBrief } from '../test/helpers';

describe('validateCampaignBrief', () => {
  it('accepts a valid brief', () => {
    expect(() => validateCampaignBrief(createTestBrief())).not.toThrow();
  });

  it('requires campaignName', () => {
    expect(() => validateCampaignBrief(createTestBrief({ campaignName: '' }))).toThrow(
      ValidationError
    );
  });

  it('requires at least one product', () => {
    expect(() => validateCampaignBrief(createTestBrief({ products: [] }))).toThrow(
      'At least one product is required'
    );
  });

  it('requires product name, type, and description', () => {
    const brief = createTestBrief({
      products: [{ name: '', type: 'beverage', description: 'desc' }],
    });
    expect(() => validateCampaignBrief(brief)).toThrow('Each product must have a name');
  });

  it('requires at least one region', () => {
    expect(() => validateCampaignBrief(createTestBrief({ regions: [] }))).toThrow(
      'At least one target region is required'
    );
  });

  it('requires at least one audience', () => {
    expect(() => validateCampaignBrief(createTestBrief({ audiences: [] }))).toThrow(
      'At least one target audience is required'
    );
  });

  it('requires campaign message', () => {
    expect(() => validateCampaignBrief(createTestBrief({ message: '  ' }))).toThrow(
      'Campaign message is required'
    );
  });
});
