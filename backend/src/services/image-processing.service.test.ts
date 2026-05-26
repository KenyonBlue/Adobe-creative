import { describe, expect, it } from 'vitest';
import { ImageProcessingService } from './image-processing.service';
import { createTestBrief, MIN_PNG } from '../test/helpers';

describe('ImageProcessingService', () => {
  const service = new ImageProcessingService();

  it('produces all three aspect ratio variants', async () => {
    const brief = createTestBrief({
      regions: [{ code: 'us', language: 'en', localizedMessage: 'Fuel Your Summer' }],
    });

    const variants = await service.processProductVariants(
      MIN_PNG,
      brief,
      brief.products[0],
      brief.regions[0],
      null
    );

    expect(Object.keys(variants).sort()).toEqual(['16x9', '1x1', '9x16']);
    expect(variants['1x1'].length).toBeGreaterThan(0);
    expect(variants['9x16'].length).toBeGreaterThan(0);
    expect(variants['16x9'].length).toBeGreaterThan(0);
  });
});
