import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import { CampaignBrief, Product } from '../models/campaign-brief.model';
import { StorageProvider } from '../providers/storage/storage.provider';
import { slugify } from '../utils/slugify';

export class AssetResolverService {
  constructor(
    private readonly storage: StorageProvider,
    private readonly uploadsStorage: StorageProvider
  ) {}

  async resolveHeroAsset(
    brief: CampaignBrief,
    product: Product
  ): Promise<{ buffer: Buffer; source: 'reused' | 'generated' } | null> {
    if (product.existingAssetPath) {
      const buffer = await this.tryLoadAsset(product.existingAssetPath);
      if (buffer) {
        return { buffer, source: 'reused' };
      }
    }

    const slug = slugify(product.name);
    const campaignSlug = slugify(brief.campaignName);
    const storagePaths = [
      `assets/${campaignSlug}/${slug}.png`,
      `assets/${campaignSlug}/${slug}.jpg`,
      `assets/${slug}.png`,
      `assets/${slug}.jpg`,
    ];

    for (const assetPath of storagePaths) {
      const exists = await this.storage.assetExists(assetPath);
      if (exists) {
        const buffer = await this.storage.getAsset(assetPath);
        if (buffer) {
          return { buffer, source: 'reused' };
        }
      }
    }

    return null;
  }

  async tryLoadLogo(logoPath?: string): Promise<Buffer | null> {
    if (!logoPath) return null;
    return this.tryLoadAsset(logoPath);
  }

  private async tryLoadAsset(assetPath: string): Promise<Buffer | null> {
    const normalized = assetPath.replace(/^\/+/, '');
    const uploadsRelative = normalized.replace(/^uploads\//, '');

    let buffer = await this.uploadsStorage.getAsset(uploadsRelative);
    if (buffer) return buffer;

    buffer = await this.storage.getAsset(normalized);
    if (buffer) return buffer;

    const absolutePaths = [
      path.resolve(config.projectRoot, normalized),
      path.resolve(config.uploadsRoot, uploadsRelative),
      path.resolve(config.storageRoot, normalized),
    ];

    for (const absPath of absolutePaths) {
      try {
        return await fs.readFile(absPath);
      } catch {
        // try next path
      }
    }

    return null;
  }
}
