import { CampaignBrief, Product, Region } from '../types';

export interface ProductFormState {
  name: string;
  type: string;
  description: string;
}

export interface RegionFormState {
  code: string;
  language: string;
  localizedMessage: string;
}

export interface CampaignFormState {
  campaignName: string;
  message: string;
  audiences: string;
  brandColors: string;
  style: string;
  products: ProductFormState[];
  regions: RegionFormState[];
}

export const DEFAULT_FORM_STATE: CampaignFormState = {
  campaignName: 'Summer Energy Campaign',
  message: 'Fuel Your Summer — Power Through Every Workout',
  audiences: 'fitness enthusiasts, outdoor athletes, health-conscious millennials',
  brandColors: '#1473E6, #FF6B00, #FFFFFF',
  style: 'premium athletic lifestyle',
  products: [
    {
      name: 'Hydration Drink',
      type: 'beverage',
      description: 'Electrolyte-rich sports hydration drink with tropical citrus flavor',
    },
    {
      name: 'Protein Bar',
      type: 'snack',
      description: 'High-protein energy bar with dark chocolate and almond crunch',
    },
  ],
  regions: [
    { code: 'us', language: 'en', localizedMessage: '' },
    { code: 'jp', language: 'ja', localizedMessage: '夏のエネルギーをチャージ' },
  ],
};

export function parseList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function buildCampaignBrief(
  form: CampaignFormState,
  options?: { productAssetPaths?: Record<number, string>; logoPath?: string }
): CampaignBrief {
  const products: Product[] = form.products.map((p, index) => ({
    name: p.name.trim(),
    type: p.type.trim(),
    description: p.description.trim(),
    ...(options?.productAssetPaths?.[index]
      ? { existingAssetPath: options.productAssetPaths[index] }
      : {}),
  }));

  const regions: Region[] = form.regions.map((r) => ({
    code: r.code.trim().toLowerCase(),
    language: r.language.trim().toLowerCase(),
    ...(r.localizedMessage.trim()
      ? { localizedMessage: r.localizedMessage.trim() }
      : {}),
  }));

  const brandColors = parseList(form.brandColors);

  return {
    campaignName: form.campaignName.trim(),
    message: form.message.trim(),
    audiences: parseList(form.audiences),
    products,
    regions,
    ...(brandColors.length > 0 ? { brandColors } : {}),
    ...(form.style.trim() ? { style: form.style.trim() } : {}),
    ...(options?.logoPath ? { logoPath: options.logoPath } : {}),
  };
}

export function validateForm(form: CampaignFormState): string | null {
  if (!form.campaignName.trim()) return 'Campaign name is required';
  if (!form.message.trim()) return 'Campaign message is required';
  if (parseList(form.audiences).length === 0) return 'At least one target audience is required';
  if (form.products.length < 2) return 'At least two products are required';

  for (let i = 0; i < form.products.length; i++) {
    const p = form.products[i];
    if (!p.name.trim()) return `Product ${i + 1}: name is required`;
    if (!p.type.trim()) return `Product ${i + 1}: type is required`;
    if (!p.description.trim()) return `Product ${i + 1}: description is required`;
  }

  if (form.regions.length === 0) return 'At least one target market is required';
  for (let i = 0; i < form.regions.length; i++) {
    const r = form.regions[i];
    if (!r.code.trim()) return `Market ${i + 1}: region code is required`;
    if (!r.language.trim()) return `Market ${i + 1}: language is required`;
  }

  return null;
}

export function createEmptyProduct(): ProductFormState {
  return { name: '', type: '', description: '' };
}

export function createEmptyRegion(): RegionFormState {
  return { code: '', language: 'en', localizedMessage: '' };
}
