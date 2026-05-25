import fs from 'fs/promises';
import path from 'path';
import { config, AspectRatioKey } from '../config';
import { CampaignBrief } from '../models/campaign-brief.model';
import { CampaignReport, ProductOutput } from '../models/report.model';
import { LocalStorageProvider } from '../providers/storage/local-storage.provider';
import { createImageGenerationProvider } from '../providers/image-generation';
import { AssetResolverService } from './asset-resolver.service';
import {
  ImageGenerationService,
  ImageProcessingService,
} from './image-processing.service';
import { ComplianceService } from './compliance.service';
import { ReportingService } from './reporting.service';
import { slugify } from '../utils/slugify';
import { validateCampaignBrief } from '../utils/validators';
import { getDisplayMessage } from '../utils/prompt-builder';

export class PipelineService {
  private readonly storage = new LocalStorageProvider(config.storageRoot);
  private readonly uploadsStorage = new LocalStorageProvider(config.uploadsRoot);
  private readonly assetResolver = new AssetResolverService(this.storage, this.uploadsStorage);
  private readonly imageProcessing = new ImageProcessingService();
  private readonly compliance = new ComplianceService();
  private readonly reporting = new ReportingService();

  async run(brief: CampaignBrief): Promise<CampaignReport> {
    validateCampaignBrief(brief);

    const startedAt = new Date();
    const campaignSlug = slugify(brief.campaignName);
    const outputDir = path.join(config.outputsRoot, campaignSlug);
    await fs.mkdir(outputDir, { recursive: true });

    const imageProvider = await createImageGenerationProvider();
    const imageGeneration = new ImageGenerationService(imageProvider);
    const providerName = imageGeneration.getProviderName();

    const logoBuffer = await this.assetResolver.tryLoadLogo(brief.logoPath);
    const hasLogo = logoBuffer !== null;

    const assetsReused: string[] = [];
    const assetsGenerated: string[] = [];
    const productOutputs: ProductOutput[] = [];

    const primaryRegion = brief.regions[0];

    for (const product of brief.products) {
      const productSlug = slugify(product.name);
      const productDir = path.join(outputDir, productSlug);
      await fs.mkdir(productDir, { recursive: true });

      const heroResult = await this.assetResolver.resolveHeroAsset(brief, product);
      let heroBuffer: Buffer;
      let assetSource: 'reused' | 'generated';

      if (heroResult) {
        heroBuffer = heroResult.buffer;
        assetSource = 'reused';
        assetsReused.push(product.name);
      } else {
        heroBuffer = await imageGeneration.generateHeroAsset(
          brief,
          product,
          primaryRegion
        );
        assetSource = 'generated';
        assetsGenerated.push(product.name);

        const storagePath = `assets/${campaignSlug}/${productSlug}.png`;
        await this.storage.saveAsset(storagePath, heroBuffer);
      }

      for (const region of brief.regions) {
        const useRegionSubfolder = brief.regions.length > 1;
        const writeDir = useRegionSubfolder
          ? path.join(productDir, region.code)
          : productDir;

        if (useRegionSubfolder) {
          await fs.mkdir(writeDir, { recursive: true });
        }

        const variants = await this.imageProcessing.processProductVariants(
          heroBuffer,
          brief,
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
          message: getDisplayMessage(brief, region),
          outputs,
          compliance: this.compliance.runChecks(brief, product, hasLogo),
          assetSource,
        });
      }
    }

    const completedAt = new Date();
    const report = this.reporting.buildReport(
      brief.campaignName,
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
