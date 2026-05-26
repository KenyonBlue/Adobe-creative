import sharp from 'sharp';
import { ImageGenerationProvider, GenerationOptions } from './index';

export class MockImageProvider implements ImageGenerationProvider {
  getName(): string {
    return 'mock';
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateImage(prompt: string, options?: GenerationOptions): Promise<Buffer> {
    const width = options?.width ?? 1024;
    const height = options?.height ?? 1024;

    const hash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = (hash * 3) % 360;
    const hue2 = (hue1 + 40) % 360;
    const hue3 = (hue1 + 180) % 360;

    const productMatch = prompt.match(/Product name:\s*"([^"]+)"/);
    const productName = productMatch?.[1] ?? 'Product';
    const categoryMatch = prompt.match(/Category:\s*(\w+)/);
    const productType = categoryMatch?.[1] ?? 'item';

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(${hue1}, 50%, 12%)" />
            <stop offset="50%" style="stop-color:hsl(${hue2}, 45%, 18%)" />
            <stop offset="100%" style="stop-color:hsl(${hue1}, 40%, 8%)" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="55%" r="35%">
            <stop offset="0%" style="stop-color:hsl(${hue3}, 60%, 45%);stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:hsl(${hue3}, 60%, 45%);stop-opacity:0" />
          </radialGradient>
          <radialGradient id="spot" cx="50%" cy="40%" r="20%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0.06" />
            <stop offset="100%" style="stop-color:white;stop-opacity:0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <ellipse cx="${width / 2}" cy="${height * 0.55}" rx="${width * 0.35}" ry="${height * 0.35}" fill="url(#glow)"/>
        <rect width="100%" height="100%" fill="url(#spot)"/>

        <circle cx="${width / 2}" cy="${height * 0.5}" r="${width * 0.18}" 
                fill="hsl(${hue3}, 40%, 30%)" opacity="0.5"/>
        <circle cx="${width / 2}" cy="${height * 0.5}" r="${width * 0.15}" 
                fill="hsl(${hue3}, 50%, 35%)" opacity="0.6"/>

        <text x="50%" y="48%" font-family="system-ui, -apple-system, sans-serif" 
              font-size="${Math.floor(width / 16)}" font-weight="700"
              fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.95">
          ${escapeXml(productName)}
        </text>
        <text x="50%" y="57%" font-family="system-ui, -apple-system, sans-serif" 
              font-size="${Math.floor(width / 32)}" font-weight="400"
              fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.4">
          ${escapeXml(productType.toUpperCase())}
        </text>

        <line x1="0" y1="${height * 0.25}" x2="${width}" y2="${height * 0.25}" 
              stroke="white" stroke-opacity="0.04" stroke-width="1"/>
        <line x1="${width * 0.15}" y1="0" x2="${width * 0.15}" y2="${height}" 
              stroke="white" stroke-opacity="0.03" stroke-width="1"/>
        <line x1="${width * 0.85}" y1="0" x2="${width * 0.85}" y2="${height}" 
              stroke="white" stroke-opacity="0.03" stroke-width="1"/>

        <rect x="${width - 180}" y="${height - 40}" width="170" height="30" rx="6" 
              fill="white" opacity="0.08"/>
        <text x="${width - 95}" y="${height - 21}" font-family="system-ui, sans-serif" 
              font-size="12" fill="white" text-anchor="middle" opacity="0.3">
          MOCK GENERATION
        </text>
      </svg>
    `;

    return sharp(Buffer.from(svg)).png().toBuffer();
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
