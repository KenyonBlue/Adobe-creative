import { describe, expect, it, vi } from 'vitest';

vi.mock('../../config', () => ({
  config: {
    openaiApiKey: '',
    openaiImageModel: 'gpt-image-1',
  },
}));

import { createImageGenerationProvider } from './index';
import { MockImageProvider } from './mock.provider';

describe('createImageGenerationProvider', () => {
  it('returns MockImageProvider when no API key is configured', async () => {
    const provider = await createImageGenerationProvider();

    expect(provider).toBeInstanceOf(MockImageProvider);
    expect(provider.getName()).toBe('mock');
  });
});
