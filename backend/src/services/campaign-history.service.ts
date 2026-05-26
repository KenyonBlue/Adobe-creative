import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';
import { CampaignReport } from '../models/report.model';

export interface CampaignSummary {
  campaignSlug: string;
  campaignName: string;
  completedAt: string;
  productCount: number;
  outputCount: number;
  generationProvider: string;
  thumbnailPath?: string;
}

export class CampaignHistoryService {
  async listCampaigns(): Promise<CampaignSummary[]> {
    let entries: string[];
    try {
      entries = await fs.readdir(config.outputsRoot);
    } catch {
      return [];
    }

    const summaries: CampaignSummary[] = [];

    for (const slug of entries) {
      const report = await this.loadReport(slug);
      if (!report) continue;

      summaries.push({
        campaignSlug: report.campaignSlug,
        campaignName: report.campaignName,
        completedAt: report.completedAt,
        productCount: new Set(report.products.map((p) => p.productSlug)).size,
        outputCount: report.outputPaths.length,
        generationProvider: report.generationProvider,
        thumbnailPath: report.outputPaths[0],
      });
    }

    return summaries.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }

  async loadReport(campaignSlug: string): Promise<CampaignReport | null> {
    const reportPath = path.join(config.outputsRoot, campaignSlug, 'report.json');
    try {
      const raw = await fs.readFile(reportPath, 'utf-8');
      return JSON.parse(raw) as CampaignReport;
    } catch {
      return null;
    }
  }
}

export const campaignHistoryService = new CampaignHistoryService();
