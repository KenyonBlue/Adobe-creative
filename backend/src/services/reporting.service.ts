import { CampaignReport, ProductOutput } from '../models/report.model';

export class ReportingService {
  buildReport(
    campaignName: string,
    campaignSlug: string,
    startedAt: Date,
    completedAt: Date,
    products: ProductOutput[],
    assetsReused: string[],
    assetsGenerated: string[],
    generationProvider: string
  ): CampaignReport {
    const complianceFailures = products.flatMap((p) =>
      p.compliance.filter((c) => !c.passed)
    );

    const localizedVariantsCreated = products.filter(
      (p) => p.region !== 'default'
    ).length;

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
}
