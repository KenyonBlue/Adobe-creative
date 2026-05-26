import { describe, expect, it } from 'vitest';
import { getDisplayMessage } from './prompt-builder';
import { createTestBrief } from '../test/helpers';

describe('getDisplayMessage', () => {
  it('returns localized message when present', () => {
    const brief = createTestBrief({
      message: 'Fuel Your Summer',
      regions: [{ code: 'jp', language: 'ja', localizedMessage: '夏のエネルギー' }],
    });

    expect(getDisplayMessage(brief, brief.regions[0])).toBe('夏のエネルギー');
  });

  it('falls back to campaign message when localized message is missing', () => {
    const brief = createTestBrief({
      message: 'Fuel Your Summer',
      regions: [{ code: 'us', language: 'en' }],
    });

    expect(getDisplayMessage(brief, brief.regions[0])).toBe('Fuel Your Summer');
  });
});
