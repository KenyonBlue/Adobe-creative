import { translate } from '@vitalets/google-translate-api';
import { CampaignBrief, Region } from '../models/campaign-brief.model';

function normalizeLanguage(language: string): string {
  return language.trim().toLowerCase().split('-')[0] || 'en';
}

function sameLanguage(a: string, b: string): boolean {
  return normalizeLanguage(a) === normalizeLanguage(b);
}

export class LocalizationService {
  /**
   * Fills in localizedMessage for each region when omitted.
   * Manual localizedMessage values are kept as overrides.
   */
  async enrichBrief(brief: CampaignBrief): Promise<CampaignBrief> {
    const sourceLanguage = normalizeLanguage(brief.regions[0]?.language || 'en');
    const translationCache = new Map<string, string>();
    const regions: Region[] = [];

    for (const region of brief.regions) {
      if (region.localizedMessage?.trim()) {
        regions.push(region);
        continue;
      }

      const targetLanguage = normalizeLanguage(region.language);

      if (sameLanguage(sourceLanguage, targetLanguage)) {
        regions.push({ ...region, localizedMessage: brief.message });
        continue;
      }

      let translated = translationCache.get(targetLanguage);
      if (!translated) {
        translated = await this.translateMessage(
          brief.message,
          sourceLanguage,
          targetLanguage
        );
        translationCache.set(targetLanguage, translated);
      }

      regions.push({ ...region, localizedMessage: translated });
    }

    return { ...brief, regions };
  }

  private async translateMessage(
    message: string,
    from: string,
    to: string
  ): Promise<string> {
    try {
      const result = await translate(message, { from, to });
      console.log(`[localization] Translated "${message}" (${from} → ${to}): "${result.text}"`);
      return result.text;
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      console.warn(`[localization] Translation failed (${from} → ${to}), using source message: ${detail}`);
      return message;
    }
  }
}

export const localizationService = new LocalizationService();
