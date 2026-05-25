import { ASPECT_RATIOS, AspectRatioKey } from '../config';
import { CampaignBrief, Product, Region } from '../models/campaign-brief.model';
import { ImageGenerationProvider } from '../providers/image-generation/image-generation.provider';
import { buildImagePrompt, getDisplayMessage } from '../utils/prompt-builder';
import {
  compositeLogo,
  overlayCampaignMessage,
  resizeToAspectRatio,
} from '../utils/text-overlay';

export class ImageProcessingService {
  async processProductVariants(
    heroBuffer: Buffer,
    brief: CampaignBrief,
    product: Product,
    region: Region,
    logoBuffer: Buffer | null
  ): Promise<Record<AspectRatioKey, Buffer>> {
    const message = getDisplayMessage(brief, region);
    const brandColor = brief.brandColors?.[0] ?? '#1473E6';
    const results = {} as Record<AspectRatioKey, Buffer>;

    for (const [key, dimensions] of Object.entries(ASPECT_RATIOS)) {
      const ratioKey = key as AspectRatioKey;
      let processed = await resizeToAspectRatio(
        heroBuffer,
        dimensions.width,
        dimensions.height
      );

      if (logoBuffer) {
        processed = await compositeLogo(processed, logoBuffer);
      }

      processed = await overlayCampaignMessage(
        processed,
        message,
        ratioKey,
        brandColor
      );

      results[ratioKey] = processed;
    }

    return results;
  }
}

export class ImageGenerationService {
  constructor(private readonly provider: ImageGenerationProvider) {}

  getProviderName(): string {
    return this.provider.getName();
  }

  async generateHeroAsset(
    brief: CampaignBrief,
    product: Product,
    region: Region
  ): Promise<Buffer> {
    const prompt = buildImagePrompt(brief, product, region);
    return this.provider.generateImage(prompt, { width: 1024, height: 1024 });
  }
}
