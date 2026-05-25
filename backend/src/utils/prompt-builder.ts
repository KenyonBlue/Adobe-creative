import { CampaignBrief, Product, Region } from '../models/campaign-brief.model';

export function buildImagePrompt(
  brief: CampaignBrief,
  product: Product,
  region: Region
): string {
  const audiences = brief.audiences.join(', ');
  const brandColors = brief.brandColors?.length
    ? brief.brandColors.join(', ')
    : 'brand-appropriate colors';
  const style = brief.style || 'modern premium advertising';
  const regionStyle = `${region.code.toUpperCase()} market aesthetic`;

  return [
    `A premium product photography advertisement for ${product.name}, a ${product.type}.`,
    product.description + '.',
    `Target audience: ${audiences}.`,
    `Regional style: ${regionStyle}.`,
    `Brand colors: ${brandColors}.`,
    `Style: ${style}.`,
    'Composition: centered product with clean background, Instagram-ready, professional lighting,',
    'space reserved in upper-third for headline text overlay.',
    'No text in the image.',
  ].join(' ');
}

export function getDisplayMessage(brief: CampaignBrief, region: Region): string {
  return region.localizedMessage || brief.message;
}
