import { describe, expect, it } from 'vitest';
import { ComplianceService } from './compliance.service';
import { createTestBrief } from '../test/helpers';

describe('ComplianceService', () => {
  const service = new ComplianceService();

  it('passes brand checks for a complete brief with logo', () => {
    const brief = createTestBrief();
    const checks = service.runChecks(brief, brief.products[0], true);

    expect(checks.find((c) => c.check === 'campaign_message_present')?.passed).toBe(true);
    expect(checks.find((c) => c.check === 'brand_colors_specified')?.passed).toBe(true);
    expect(checks.find((c) => c.check === 'logo_present')?.passed).toBe(true);
    expect(checks.find((c) => c.check === 'product_description_present')?.passed).toBe(true);
    expect(checks.find((c) => c.check === 'prohibited_terms')?.passed).toBe(true);
  });

  it('fails logo check when no logo was uploaded', () => {
    const brief = createTestBrief();
    const checks = service.runChecks(brief, brief.products[0], false);

    expect(checks.find((c) => c.check === 'logo_present')?.passed).toBe(false);
  });

  it('flags prohibited marketing terms in the campaign message', () => {
    const brief = createTestBrief({ message: 'Our miracle cure is guaranteed' });
    const checks = service.runChecks(brief, brief.products[0], true);

    const prohibited = checks.find((c) => c.check === 'prohibited_terms');
    expect(prohibited?.passed).toBe(false);
    expect(prohibited?.message).toContain('miracle');
    expect(prohibited?.message).toContain('guaranteed');
  });

  it('scans localized messages for prohibited terms', () => {
    const brief = createTestBrief({
      regions: [{ code: 'us', language: 'en', localizedMessage: '100% effective results' }],
    });
    const checks = service.runChecks(brief, brief.products[0], true);

    expect(checks.find((c) => c.check === 'prohibited_terms')?.passed).toBe(false);
  });
});
