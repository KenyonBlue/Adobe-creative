import { describe, expect, it } from 'vitest';
import { AssetResolverService } from './asset-resolver.service';
import { StorageProvider } from '../providers/storage/local-storage.provider';
import { createTestBrief } from '../test/helpers';

class MemoryStorage implements StorageProvider {
  constructor(private readonly files: Record<string, Buffer> = {}) {}

  async saveAsset(assetPath: string, data: Buffer): Promise<string> {
    this.files[assetPath] = data;
    return assetPath;
  }

  async getAsset(assetPath: string): Promise<Buffer | null> {
    return this.files[assetPath] ?? null;
  }

  async assetExists(assetPath: string): Promise<boolean> {
    return assetPath in this.files;
  }

  async listAssets(): Promise<string[]> {
    return Object.keys(this.files);
  }
}

describe('AssetResolverService', () => {
  it('returns reused asset when product has existingAssetPath', async () => {
    const uploads = new MemoryStorage({ 'drink.png': Buffer.from('product-image') });
    const storage = new MemoryStorage();
    const resolver = new AssetResolverService(storage, uploads);

    const brief = createTestBrief({
      products: [
        {
          name: 'Hydration Drink',
          type: 'beverage',
          description: 'desc',
          existingAssetPath: 'uploads/drink.png',
        },
      ],
    });

    const result = await resolver.resolveHeroAsset(brief, brief.products[0]);

    expect(result).toEqual({
      buffer: Buffer.from('product-image'),
      source: 'reused',
    });
  });

  it('returns null when no asset path is provided', async () => {
    const resolver = new AssetResolverService(new MemoryStorage(), new MemoryStorage());
    const brief = createTestBrief();

    const result = await resolver.resolveHeroAsset(brief, brief.products[0]);

    expect(result).toBeNull();
  });

  it('loads logo assets from uploads storage', async () => {
    const uploads = new MemoryStorage({ 'logo.png': Buffer.from('logo-image') });
    const resolver = new AssetResolverService(new MemoryStorage(), uploads);

    const logo = await resolver.tryLoadLogo('uploads/logo.png');

    expect(logo?.toString()).toBe('logo-image');
  });
});
