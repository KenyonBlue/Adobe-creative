import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { createTestBrief, MIN_PNG } from '../test/helpers';

const mockGenerateImage = vi.fn();

vi.mock('../providers/image-generation', () => ({
  createImageGenerationProvider: vi.fn(async () => ({
    getName: () => 'mock-test',
    generateImage: (...args: unknown[]) => mockGenerateImage(...args),
    isAvailable: vi.fn().mockResolvedValue(true),
  })),
}));

vi.mock('@vitalets/google-translate-api', () => ({
  translate: vi.fn(async (text: string, options: { to: string }) => ({
    text: `[${options.to}] ${text}`,
    raw: {},
  })),
}));

describe('PipelineService', () => {
  let tempRoot: string;

  beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'pipeline-test-'));
    process.env.OUTPUTS_ROOT = path.join(tempRoot, 'outputs');
    process.env.STORAGE_ROOT = path.join(tempRoot, 'storage');
    process.env.UPLOADS_ROOT = path.join(tempRoot, 'uploads');
    process.env.OPENAI_API_KEY = '';
    mockGenerateImage.mockReset();
    mockGenerateImage.mockResolvedValue(MIN_PNG);
    vi.resetModules();
  });

  afterEach(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
    delete process.env.OUTPUTS_ROOT;
    delete process.env.STORAGE_ROOT;
    delete process.env.UPLOADS_ROOT;
  });

  it('generates organized outputs and report for a valid brief', async () => {
    const { pipelineService } = await import('./pipeline.service');
    const brief = createTestBrief();

    const report = await pipelineService.run(brief);

    expect(report.campaignSlug).toBe('test-campaign');
    expect(report.assetsGenerated).toEqual(['Hydration Drink', 'Protein Bar']);
    expect(report.assetsReused).toEqual([]);
    expect(report.products).toHaveLength(4);
    expect(report.outputPaths).toHaveLength(12);
    expect(report.generationProvider).toBe('mock-test');

    const reportPath = path.join(tempRoot, 'outputs', 'test-campaign', 'report.json');
    await expect(fs.access(reportPath)).resolves.toBeUndefined();
  });

  it('reuses uploaded assets without calling image generation', async () => {
    const uploadsDir = path.join(tempRoot, 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, 'drink.png'), MIN_PNG);

    const { pipelineService } = await import('./pipeline.service');
    const brief = createTestBrief({
      products: [
        {
          name: 'Hydration Drink',
          type: 'beverage',
          description: 'Electrolyte-rich sports hydration drink',
          existingAssetPath: 'uploads/drink.png',
        },
        {
          name: 'Protein Bar',
          type: 'snack',
          description: 'High-protein energy bar',
        },
      ],
    });

    const report = await pipelineService.run(brief);

    expect(report.assetsReused).toEqual(['Hydration Drink']);
    expect(report.assetsGenerated).toEqual(['Protein Bar']);
    expect(mockGenerateImage).toHaveBeenCalledTimes(1);
  });

  it('localizes messages before writing outputs', async () => {
    const { pipelineService } = await import('./pipeline.service');
    const brief = createTestBrief({
      regions: [
        { code: 'us', language: 'en' },
        { code: 'de', language: 'de' },
      ],
    });

    const report = await pipelineService.run(brief);

    const germanOutputs = report.products.filter((p) => p.region === 'de');
    expect(germanOutputs[0]?.message).toBe('[de] Fuel Your Summer');
  });
});
