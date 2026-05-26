import { CampaignBrief, Product, Region } from '../models/campaign-brief.model';

/** Hero is generated at 9:16 — our most aggressive crop target — so vertical composition survives resizing. */
export const HERO_GENERATION = { width: 1024, height: 1536 } as const;

const PRODUCT_SCENES: Record<string, string> = {
  beverage: 'dynamic liquid splash, condensation, ice catching rim light',
  snack: 'ingredients scattered artfully, warm appetizing tones, macro food styling',
  footwear: 'dramatic low-angle hero on textured surface, motion energy',
  shoe: 'dramatic low-angle hero on textured surface, motion energy',
  apparel: 'lifestyle context, fabric texture, bold color blocking',
  electronics: 'sleek surfaces, neon accent lighting, futuristic minimal set',
  app: 'phone mockup in vibrant event environment, UI glow, social energy',
  software: 'device screen in real-world context, clean UI highlights',
  cosmetic: 'soft beauty lighting, reflective surfaces, premium vanity setup',
  fitness: 'gym or outdoor training environment, sweat and energy, action moment',
  automotive: 'dynamic angle, motion blur background, showroom lighting',
};

function productScene(product: Product): string {
  const type = product.type.toLowerCase();
  for (const [key, scene] of Object.entries(PRODUCT_SCENES)) {
    if (type.includes(key)) return scene;
  }
  return 'centered hero product in a stylized campaign environment';
}

export function buildImagePrompt(
  brief: CampaignBrief,
  product: Product,
  region: Region
): string {
  const audiences = brief.audiences.join(', ');
  const brandColors = brief.brandColors?.length
    ? brief.brandColors.join(', ')
    : 'vibrant complementary colors';
  const style = brief.style || 'bold contemporary social ad creative';
  const scene = productScene(product);
  const description = product.description.trim();

  return [
    `Create a scroll-stopping social media ad hero image.`,
    ``,
    `CREATIVE BRIEF (primary): ${description}`,
    `Product name: "${product.name}" · Category: ${product.type}`,
    ``,
    `VISUAL DIRECTION:`,
    `- Scene: ${scene}`,
    `- Style: ${style}`,
    `- Palette: ${brandColors}`,
    `- Audience: ${audiences}`,
    `- Market ${region.code.toUpperCase()}: subtle local cultural cues only`,
    ``,
    `PHOTOGRAPHY:`,
    `- Single hero subject, cinematic lighting (rim light or colored gels)`,
    `- High contrast, saturated grade — not flat stock-photo lighting`,
    `- Stylized background (gradient mesh, environment, or abstract shapes)`,
    `- Leave top 25% clean for headline overlay`,
    `- Vertical-friendly composition (9:16 safe)`,
    ``,
    `AVOID: text, logos, watermarks, duplicate products, generic stock look`,
  ].join('\n');
}

export function getDisplayMessage(brief: CampaignBrief, region: Region): string {
  return region.localizedMessage || brief.message;
}
