import fs from 'fs/promises';
import path from 'path';
import { config, AspectRatioKey } from '../config';
import { CampaignBrief, Product, Region } from '../models/campaign-brief.model';
import { CampaignReport, ProductOutput } from '../models/report.model';
import { LocalStorageProvider } from '../providers/storage/local-storage.provider';
import { createImageGenerationProvider, ImageGenerationProvider } from '../providers/image-generation';
import { AssetResolverService } from './asset-resolver.service';
import { ImageProcessingService } from './image-processing.service';
import { ComplianceService } from './compliance.service';
import { localizationService } from './localization.service';
import { slugify } from '../utils/slugify';
import { validateCampaignBrief } from '../utils/validators';
import { buildImagePrompt, getDisplayMessage, HERO_GENERATION } from '../utils/prompt-builder';

function buildReport(
  campaignName: string,
  campaignSlug: string,
  startedAt: Date,
  completedAt: Date,
  products: ProductOutput[],
  assetsReused: string[],
  assetsGenerated: string[],
  generationProvider: string
): CampaignReport {
  const complianceFailures = products.flatMap((p) => p.compliance.filter((c) => !c.passed));
  const localizedVariantsCreated = products.filter((p) => p.region !== 'default').length;
  const outputPaths = products.flatMap((p) => Object.values(p.outputs));

  return {
    campaignName,
    campaignSlug,
    startedAt: startedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    processingDurationMs: completedAt.getTime() - startedAt.getTime(),
    assetsReused,
    assetsGenerated,
    localizedVariantsCreated,
    products,
    complianceFailures,
    outputPaths,
    generationProvider,
  };
}

async function generateHeroAsset(
  provider: ImageGenerationProvider,
  brief: CampaignBrief,
  product: Product,
  region: Region
): Promise<Buffer> {
  const prompt = buildImagePrompt(brief, product, region);
  return provider.generateImage(prompt, {
    width: HERO_GENERATION.width,
    height: HERO_GENERATION.height,
  });
}

export class PipelineService {
  private readonly storage = new LocalStorageProvider(config.storageRoot);
  private readonly uploadsStorage = new LocalStorageProvider(config.uploadsRoot);
  private readonly assetResolver = new AssetResolverService(this.storage, this.uploadsStorage);
  private readonly imageProcessing = new ImageProcessingService();
  private readonly compliance = new ComplianceService();

  async run(brief: CampaignBrief): Promise<CampaignReport> {
    validateCampaignBrief(brief);
    const localizedBrief = await localizationService.enrichBrief(brief);

    const startedAt = new Date();
    const campaignSlug = slugify(localizedBrief.campaignName);
    const outputDir = path.join(config.outputsRoot, campaignSlug);
    await fs.mkdir(outputDir, { recursive: true });

    const imageProvider = await createImageGenerationProvider();
    const providerName = imageProvider.getName();

    const logoBuffer = await this.assetResolver.tryLoadLogo(localizedBrief.logoPath);
    const hasLogo = logoBuffer !== null;

    const assetsReused: string[] = [];
    const assetsGenerated: string[] = [];
    const productOutputs: ProductOutput[] = [];

    const primaryRegion = localizedBrief.regions[0];

    for (const product of localizedBrief.products) {
      const productSlug = slugify(product.name);
      const productDir = path.join(outputDir, productSlug);
      await fs.mkdir(productDir, { recursive: true });

      const heroResult = await this.assetResolver.resolveHeroAsset(localizedBrief, product);
      let heroBuffer: Buffer;
      let assetSource: 'reused' | 'generated';

      if (heroResult?.source === 'reused') {
        // User supplied a finished product image — pass it straight through to image
        // processing (resize + text overlay). No AI generation needed or desired.
        console.log(`[pipeline] Reusing uploaded asset for ${product.name} — skipping AI generation`);
        heroBuffer = heroResult.buffer;
        assetSource = 'reused';
        assetsReused.push(product.name);
      } else {
        // No asset provided — generate a hero image from text description via GenAI.
        heroBuffer = await generateHeroAsset(imageProvider, localizedBrief, product, primaryRegion);
        assetSource = 'generated';
        assetsGenerated.push(product.name);

        const storagePath = `assets/${campaignSlug}/${productSlug}.png`;
        await this.storage.saveAsset(storagePath, heroBuffer);
      }

      for (const region of localizedBrief.regions) {
        const useRegionSubfolder = localizedBrief.regions.length > 1;
        const writeDir = useRegionSubfolder
          ? path.join(productDir, region.code)
          : productDir;

        if (useRegionSubfolder) {
          await fs.mkdir(writeDir, { recursive: true });
        }

        const variants = await this.imageProcessing.processProductVariants(
          heroBuffer,
          localizedBrief,
          product,
          region,
          logoBuffer
        );

        const outputs = {} as Record<AspectRatioKey, string>;
        for (const ratioKey of Object.keys(variants) as AspectRatioKey[]) {
          const filename = `${ratioKey}.png`;
          const fullPath = path.join(writeDir, filename);
          await fs.writeFile(fullPath, variants[ratioKey]);

          const relativePath = useRegionSubfolder
            ? `${campaignSlug}/${productSlug}/${region.code}/${filename}`
            : `${campaignSlug}/${productSlug}/${filename}`;

          outputs[ratioKey] = relativePath;
        }

        productOutputs.push({
          productName: product.name,
          productSlug,
          region: region.code,
          message: getDisplayMessage(localizedBrief, region),
          outputs,
          compliance: this.compliance.runChecks(localizedBrief, product, hasLogo),
          assetSource,
        });
      }
    }

    const completedAt = new Date();
    const report = buildReport(
      localizedBrief.campaignName,
      campaignSlug,
      startedAt,
      completedAt,
      productOutputs,
      assetsReused,
      assetsGenerated,
      providerName
    );

    const reportPath = path.join(outputDir, 'report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }
}

export const pipelineService = new PipelineService();
