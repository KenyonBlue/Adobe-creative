import { beforeEach, describe, expect, it, vi } from 'vitest';
import { translate } from '@vitalets/google-translate-api';
import { LocalizationService } from './localization.service';
import { createTestBrief } from '../test/helpers';

vi.mock('@vitalets/google-translate-api', () => ({
  translate: vi.fn(),
}));

describe('LocalizationService', () => {
  const service = new LocalizationService();

  beforeEach(() => {
    vi.mocked(translate).mockReset();
  });

  it('copies the source message for regions with the same language', async () => {
    const brief = createTestBrief({
      message: 'Protect This House',
      regions: [
        { code: 'us', language: 'en' },
        { code: 'gb', language: 'en' },
      ],
    });

    const enriched = await service.enrichBrief(brief);

    expect(translate).not.toHaveBeenCalled();
    expect(enriched.regions[0].localizedMessage).toBe('Protect This House');
    expect(enriched.regions[1].localizedMessage).toBe('Protect This House');
  });

  it('translates the message for different languages', async () => {
    vi.mocked(translate).mockResolvedValue({
      text: 'Leistung ohne Grenzen',
      raw: {} as never,
    });

    const brief = createTestBrief({
      message: 'Protect This House',
      regions: [
        { code: 'us', language: 'en' },
        { code: 'de', language: 'de' },
      ],
    });

    const enriched = await service.enrichBrief(brief);

    expect(translate).toHaveBeenCalledWith('Protect This House', { from: 'en', to: 'de' });
    expect(enriched.regions[1].localizedMessage).toBe('Leistung ohne Grenzen');
  });

  it('caches translations per language within a run', async () => {
    vi.mocked(translate).mockResolvedValue({
      text: 'Hola',
      raw: {} as never,
    });

    const brief = createTestBrief({
      message: 'Hello',
      regions: [
        { code: 'us', language: 'en' },
        { code: 'mx', language: 'es' },
        { code: 'es', language: 'es' },
      ],
    });

    const enriched = await service.enrichBrief(brief);

    expect(translate).toHaveBeenCalledTimes(1);
    expect(enriched.regions[1].localizedMessage).toBe('Hola');
    expect(enriched.regions[2].localizedMessage).toBe('Hola');
  });

  it('keeps manual localizedMessage overrides', async () => {
    const brief = createTestBrief({
      regions: [{ code: 'jp', language: 'ja', localizedMessage: '手動メッセージ' }],
    });

    const enriched = await service.enrichBrief(brief);

    expect(translate).not.toHaveBeenCalled();
    expect(enriched.regions[0].localizedMessage).toBe('手動メッセージ');
  });

  it('falls back to the source message when translation fails', async () => {
    vi.mocked(translate).mockRejectedValue(new Error('network error'));

    const brief = createTestBrief({
      message: 'Protect This House',
      regions: [
        { code: 'us', language: 'en' },
        { code: 'de', language: 'de' },
      ],
    });

    const enriched = await service.enrichBrief(brief);

    expect(enriched.regions[1].localizedMessage).toBe('Protect This House');
  });
});
