import { CampaignBrief, Product, Region } from '../types';

export interface ProductFormState {
  name: string;
  type: string;
  description: string;
}

export interface RegionFormState {
  code: string;
  language: string;
}

export interface CampaignFormState {
  campaignName: string;
  message: string;
  audiences: string;
  brandColors: string[];
  style: string;
  products: ProductFormState[];
  regions: RegionFormState[];
}

export const STYLE_PRESETS = [
  {
    id: 'athletic',
    label: 'Premium Athletic',
    prompt:
      'premium athletic lifestyle, dynamic energy, bold contrast, Nike-ad campaign energy, sweat and motion',
  },
  {
    id: 'luxury',
    label: 'Luxury Minimal',
    prompt:
      'luxury minimal aesthetic, clean negative space, soft diffused light, marble and matte textures',
  },
  {
    id: 'street',
    label: 'Street Culture',
    prompt:
      'street culture editorial, gritty urban textures, neon accents, high contrast, magazine crop energy',
  },
  {
    id: 'tech',
    label: 'Tech Futurism',
    prompt:
      'tech futurism, holographic gradients, glass morphism, dark theme, sleek device-forward composition',
  },
] as const;

export const DEFAULT_FORM_STATE: CampaignFormState = {
  campaignName: 'Summer Energy Campaign',
  message: 'Fuel Your Summer — Power Through Every Workout',
  audiences: 'fitness enthusiasts, outdoor athletes, health-conscious millennials',
  brandColors: ['#1473E6', '#FF6B00', '#FFFFFF'],
  style: STYLE_PRESETS[0].prompt,
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
    { code: 'us', language: 'en' },
    { code: 'jp', language: 'ja' },
  ],
};

export const PRESET_AUDIENCES = [
  'fitness enthusiasts',
  'outdoor athletes',
  'health-conscious millennials',
  'Gen Z consumers',
  'working professionals',
  'parents & families',
  'luxury shoppers',
  'budget-conscious buyers',
  'small business owners',
  'tech early adopters',
] as const;

export function parseList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeList(values: string[]): string {
  return values.join(', ');
}

export function normalizeAudience(value: string): string {
  return value.trim().toLowerCase();
}

export function audienceIsSelected(selected: string[], audience: string): boolean {
  const normalized = normalizeAudience(audience);
  return selected.some((item) => normalizeAudience(item) === normalized);
}

export function toggleAudience(selected: string[], audience: string): string[] {
  if (audienceIsSelected(selected, audience)) {
    const normalized = normalizeAudience(audience);
    return selected.filter((item) => normalizeAudience(item) !== normalized);
  }
  return [...selected, audience.trim()];
}

export function addCustomAudience(selected: string[], audience: string): string[] {
  const trimmed = audience.trim();
  if (!trimmed || audienceIsSelected(selected, trimmed)) return selected;
  return [...selected, trimmed];
}

export function getCustomAudiences(selected: string[]): string[] {
  const presetSet = new Set(PRESET_AUDIENCES.map(normalizeAudience));
  return selected.filter((item) => !presetSet.has(normalizeAudience(item)));
}

export function isStylePreset(value: string): boolean {
  return STYLE_PRESETS.some((preset) => preset.prompt === value);
}

/** Map uploads to products; optional last file is logo when count = products + 1 */
export function mapUploadedAssets(
  assets: { path: string }[],
  productCount: number
): { productAssetPaths: Record<number, string>; logoPath?: string } {
  const productAssetPaths: Record<number, string> = {};
  const hasLogo = assets.length === productCount + 1;
  const productUploadCount = hasLogo
    ? productCount
    : Math.min(assets.length, productCount);

  for (let i = 0; i < productUploadCount; i++) {
    productAssetPaths[i] = assets[i].path;
  }

  return {
    productAssetPaths,
    ...(hasLogo ? { logoPath: assets[assets.length - 1].path } : {}),
  };
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
  }));

  const brandColors = form.brandColors.filter((c) => c.trim());

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
  if (form.products.length < 1) return 'At least one product is required';

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
  return { code: '', language: 'en' };
}

export const COMMON_MARKETS = [
  { code: 'us', language: 'en', flag: '🇺🇸', name: 'United States' },
  { code: 'gb', language: 'en', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'ca', language: 'en', flag: '🇨🇦', name: 'Canada' },
  { code: 'au', language: 'en', flag: '🇦🇺', name: 'Australia' },
  { code: 'jp', language: 'ja', flag: '🇯🇵', name: 'Japan' },
  { code: 'de', language: 'de', flag: '🇩🇪', name: 'Germany' },
  { code: 'fr', language: 'fr', flag: '🇫🇷', name: 'France' },
  { code: 'es', language: 'es', flag: '🇪🇸', name: 'Spain' },
  { code: 'br', language: 'pt', flag: '🇧🇷', name: 'Brazil' },
  { code: 'mx', language: 'es', flag: '🇲🇽', name: 'Mexico' },
  { code: 'cn', language: 'zh', flag: '🇨🇳', name: 'China' },
  { code: 'kr', language: 'ko', flag: '🇰🇷', name: 'South Korea' },
  { code: 'in', language: 'hi', flag: '🇮🇳', name: 'India' },
  { code: 'it', language: 'it', flag: '🇮🇹', name: 'Italy' },
  { code: 'nl', language: 'nl', flag: '🇳🇱', name: 'Netherlands' },
] as const;

export const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
] as const;
